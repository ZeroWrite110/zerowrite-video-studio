// Prepare raw footage for editing.
//
// Usage (from the studio folder):
//   node scripts/prepare.mjs                  -> prepares every new folder in "Raw"
//   node scripts/prepare.mjs <video-name>     -> prepares Raw/<video-name>/
// A Raw folder can hold several clips; they are joined in file-name order.
// Folders starting with "_" (like _example-video-name) are skipped.
// Options:
//   --lang en|ur|hi|auto   spoken language (default: auto)
//   --english              translate the captions to English
//   --no-cuts              keep pauses (only trim start and end silence)
//   --no-captions          skip transcription
//   --force                redo a video that was already prepared
//
// What it does for each video:
//   1. Copies it (or joins the clips) into public/footage as a browser-safe H.264 MP4.
//   2. Finds silent pauses with FFmpeg and plans jump cuts.
//   3. Transcribes speech with Whisper (runs locally, free) into word-level captions.
//   4. Writes public/projects/<name>.json, which the CaptionedReel template reads.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  toCaptions,
  transcribe,
} from "@remotion/install-whisper-cpp";

const STUDIO = path.resolve(import.meta.dirname, "..");
const RAW = path.resolve(STUDIO, "..", "Raw");
const PUBLIC = path.join(STUDIO, "public");
const WHISPER_DIR = path.join(STUDIO, "whisper.cpp");
const WHISPER_VERSION = "1.5.5";
const WHISPER_MODEL = "small";

const MIN_PAUSE_SEC = 0.6; // pauses longer than this are cut out
const PAD_SEC = 0.15; // breathing room kept around speech
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi"]);

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const files = args.filter(
  (a, i) => !a.startsWith("--") && !(args[i - 1] === "--lang"),
);
const lang = option("--lang", "auto");

const run = (cmd, cmdArgs) => {
  const r = spawnSync(cmd, cmdArgs, { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.error) {
    throw new Error(
      `Could not run ${cmd}. Is FFmpeg installed and on PATH? (${r.error.message})`,
    );
  }
  if (r.status !== 0) {
    throw new Error(`${cmd} failed:\n${r.stderr.slice(-2000)}`);
  }
  return r;
};

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "clip";

const probe = (file) => {
  const r = run("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration:stream=codec_type,codec_name,width,height,r_frame_rate",
    "-of",
    "json",
    file,
  ]);
  const info = JSON.parse(r.stdout);
  const video = info.streams.find((s) => s.codec_type === "video");
  const audio = info.streams.find((s) => s.codec_type === "audio");
  if (!video) throw new Error(`${file} has no video stream.`);
  return {
    durationSec: Number(info.format.duration),
    width: video.width,
    height: video.height,
    videoCodec: video.codec_name,
    hasAudio: Boolean(audio),
  };
};

const detectSilences = (file) => {
  // Step 1: measure loudness to get an adaptive threshold.
  const loud = run("ffmpeg", [
    "-hide_banner",
    "-i",
    file,
    "-map",
    "0:a:0",
    "-af",
    "loudnorm=print_format=json",
    "-f",
    "null",
    "-",
  ]);
  const json = loud.stderr.slice(loud.stderr.lastIndexOf("{"));
  let thresh = -40;
  try {
    const t = Number(JSON.parse(json).input_thresh);
    if (Number.isFinite(t)) thresh = t;
  } catch {
    // keep default threshold
  }
  // Step 2: find silent ranges below that threshold.
  const det = run("ffmpeg", [
    "-hide_banner",
    "-i",
    file,
    "-map",
    "0:a:0",
    "-af",
    `silencedetect=noise=${thresh}dB:d=${MIN_PAUSE_SEC}`,
    "-f",
    "null",
    "-",
  ]);
  const silences = [];
  let start = null;
  for (const line of det.stderr.split(/\r?\n/)) {
    const s = line.match(/silence_start: (-?[\d.]+)/);
    const e = line.match(/silence_end: ([\d.]+)/);
    if (s) start = Math.max(0, Number(s[1]));
    if (e && start !== null) {
      silences.push([start, Number(e[1])]);
      start = null;
    }
  }
  if (start !== null) silences.push([start, Infinity]);
  return silences;
};

// Turn silent ranges into the speech segments we keep.
const planSegments = (silences, durationSec, cutPauses) => {
  const speech = [];
  let cursor = 0;
  for (const [s, e] of silences) {
    if (s > cursor) speech.push([cursor, s]);
    cursor = Math.max(cursor, Math.min(e, durationSec));
  }
  if (cursor < durationSec) speech.push([cursor, durationSec]);
  if (speech.length === 0) return [{ fromSec: 0, toSec: durationSec }];

  let segs = speech.map(([a, b]) => [
    Math.max(0, a - PAD_SEC),
    Math.min(durationSec, b + PAD_SEC),
  ]);
  if (!cutPauses) segs = [[segs[0][0], segs[segs.length - 1][1]]];

  const merged = [];
  for (const seg of segs) {
    const last = merged[merged.length - 1];
    if (last && seg[0] <= last[1]) last[1] = Math.max(last[1], seg[1]);
    else merged.push([...seg]);
  }
  return merged
    .filter(([a, b]) => b - a > 0.2)
    .map(([a, b]) => ({ fromSec: round(a), toSec: round(b) }));
};

const round = (n) => Math.round(n * 1000) / 1000;

// Build a 16 kHz mono WAV of only the kept segments, so Whisper hears the
// final edit. Its timestamps then already match the cut timeline, and it has
// no long silences to invent words in.
const writeEditedWav = (footage, segments, wav) => {
  const parts = segments
    .map(
      (s, i) =>
        `[0:a]atrim=start=${s.fromSec}:end=${s.toSec},asetpts=PTS-STARTPTS[a${i}]`,
    )
    .join(";");
  const inputs = segments.map((_, i) => `[a${i}]`).join("");
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    footage,
    "-filter_complex",
    `${parts};${inputs}concat=n=${segments.length}:v=0:a=1[out]`,
    "-map",
    "[out]",
    "-ar",
    "16000",
    "-ac",
    "1",
    "-c:a",
    "pcm_s16le",
    wav,
  ]);
};

// Drop Whisper markers like "[BLANK_AUDIO]", and glue word pieces back together
// (Whisper can split "Claude" into "Cla" + "ude"; a piece without a leading
// space belongs to the word before it, and so does punctuation).
const cleanCaptions = (captions) => {
  const out = [];
  for (const c of captions) {
    const t = c.text.trim();
    if (t.length === 0 || /^[[(].*[\])]$/.test(t)) continue;
    const prev = out[out.length - 1];
    if (prev && !c.text.startsWith(" ")) {
      prev.text += c.text;
      prev.endMs = Math.max(prev.endMs, c.endMs);
      continue;
    }
    out.push({ ...c, text: c.text.startsWith(" ") ? c.text : ` ${c.text}` });
  }
  return out;
};

const ensureWhisper = async () => {
  // installWhisperCpp skips the download if the folder already exists, so never create it first.
  await installWhisperCpp({
    to: WHISPER_DIR,
    version: WHISPER_VERSION,
    printOutput: false,
  });
  await downloadWhisperModel({
    model: WHISPER_MODEL,
    folder: WHISPER_DIR,
    printOutput: false,
  });
};

const ENCODE_ARGS = [
  "-c:v",
  "libx264",
  "-preset",
  "veryfast",
  "-crf",
  "18",
  "-pix_fmt",
  "yuv420p",
  "-c:a",
  "aac",
  "-b:a",
  "192k",
  "-ar",
  "48000",
  "-movflags",
  "+faststart",
];

const listClips = (dir) =>
  fs
    .readdirSync(dir)
    .filter((f) => VIDEO_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((f) => path.join(dir, f));

// Make one browser-safe H.264 MP4 from one or more clips.
// Returns the time ranges of clips that have no sound (b-roll), which must
// never be cut as "silence".
const buildFootage = (clips, footage) => {
  const infos = clips.map(probe);
  const keep = [];
  let t = 0;
  for (const info of infos) {
    if (!info.hasAudio) keep.push([t, t + info.durationSec]);
    t += info.durationSec;
  }
  if (clips.length === 1) {
    const [info] = infos;
    if (
      info.videoCodec === "h264" &&
      path.extname(clips[0]).toLowerCase() === ".mp4"
    ) {
      fs.copyFileSync(clips[0], footage);
    } else {
      console.log("  converting to H.264 MP4...");
      run("ffmpeg", [
        "-hide_banner",
        "-loglevel",
        "error",
        "-y",
        "-i",
        clips[0],
        ...ENCODE_ARGS,
        footage,
      ]);
    }
    return keep;
  }
  // Several clips: fit each into the first clip's frame, give silent audio to
  // clips without sound, then join them.
  console.log(`  joining ${clips.length} clips...`);
  const { width: W, height: H } = infos[0];
  const inputs = [];
  const filters = [];
  for (const clip of clips) inputs.push("-i", clip);
  let extra = clips.length;
  const pairs = [];
  infos.forEach((info, i) => {
    filters.push(
      `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30,format=yuv420p[v${i}]`,
    );
    if (info.hasAudio) {
      filters.push(
        `[${i}:a]aresample=48000,aformat=channel_layouts=stereo[a${i}]`,
      );
    } else {
      inputs.push(
        "-f",
        "lavfi",
        "-t",
        String(info.durationSec),
        "-i",
        "anullsrc=r=48000:cl=stereo",
      );
      filters.push(`[${extra}:a]anull[a${i}]`);
      extra++;
    }
    pairs.push(`[v${i}][a${i}]`);
  });
  filters.push(`${pairs.join("")}concat=n=${clips.length}:v=1:a=1[v][a]`);
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    ...inputs,
    "-filter_complex",
    filters.join(";"),
    "-map",
    "[v]",
    "-map",
    "[a]",
    ...ENCODE_ARGS,
    footage,
  ]);
  return keep;
};

// Add the b-roll ranges back into the kept segments.
const withBroll = (segments, broll, durationSec) => {
  const all = [
    ...segments.map((s) => [s.fromSec, s.toSec]),
    ...broll.map(([a, b]) => [a, Math.min(b, durationSec)]),
  ].sort((x, y) => x[0] - y[0]);
  const merged = [];
  for (const seg of all) {
    const last = merged[merged.length - 1];
    if (last && seg[0] <= last[1] + 0.05) last[1] = Math.max(last[1], seg[1]);
    else merged.push([...seg]);
  }
  return merged.map(([a, b]) => ({ fromSec: round(a), toSec: round(b) }));
};

const prepare = async (target) => {
  const src = path.isAbsolute(target) ? target : path.join(RAW, target);
  if (!fs.existsSync(src)) throw new Error(`Not found: ${src}`);
  const isDir = fs.statSync(src).isDirectory();
  const clips = isDir ? listClips(src) : [src];
  if (clips.length === 0) {
    console.log(`- ${path.basename(src)}: no video clips inside, skipped`);
    return;
  }
  const name = slugify(path.basename(src));
  const projectFile = path.join(PUBLIC, "projects", `${name}.json`);
  if (fs.existsSync(projectFile) && !flag("--force")) {
    console.log(`- ${name}: already prepared (use --force to redo)`);
    return;
  }
  console.log(
    `\n> ${path.basename(src)} (${clips.map((c) => path.basename(c)).join(", ")})  ->  project "${name}"`,
  );

  for (const dir of ["footage", "captions", "projects"]) {
    fs.mkdirSync(path.join(PUBLIC, dir), { recursive: true });
  }

  // 1. Browser-safe footage.
  const footage = path.join(PUBLIC, "footage", `${name}.mp4`);
  const broll = buildFootage(clips, footage);
  const info = probe(footage);
  console.log(
    `  ${info.width}x${info.height}, ${info.durationSec.toFixed(1)}s, audio: ${info.hasAudio ? "yes" : "no"}`,
  );

  // 2. Silence -> segments.
  let segments = [{ fromSec: 0, toSec: round(info.durationSec) }];
  if (info.hasAudio) {
    const silences = detectSilences(footage);
    segments = planSegments(silences, info.durationSec, !flag("--no-cuts"));
    if (broll.length > 0) segments = withBroll(segments, broll, info.durationSec);
  }
  const outputDurationSec = round(
    segments.reduce((sum, s) => sum + s.toSec - s.fromSec, 0),
  );
  console.log(
    `  kept ${segments.length} segment(s): ${info.durationSec.toFixed(1)}s -> ${outputDurationSec.toFixed(1)}s`,
  );

  // 3. Captions.
  let captionsPath = null;
  if (info.hasAudio && !flag("--no-captions")) {
    console.log(
      `  transcribing (Whisper ${WHISPER_MODEL}, language: ${lang})...`,
    );
    await ensureWhisper();
    const tmpDir = path.join(STUDIO, ".render");
    fs.mkdirSync(tmpDir, { recursive: true });
    const wav = path.join(tmpDir, `${name}.wav`);
    writeEditedWav(footage, segments, wav);
    const output = await transcribe({
      model: WHISPER_MODEL,
      whisperPath: WHISPER_DIR,
      whisperCppVersion: WHISPER_VERSION,
      inputPath: wav,
      tokenLevelTimestamps: true,
      language: lang,
      translateToEnglish: flag("--english"),
      printOutput: false,
      onProgress: (p) => {
        if (Number.isFinite(p)) {
          process.stdout.write(
            `\r  transcribing... ${Math.min(100, Math.round(p * 100))}%   `,
          );
        }
      },
    });
    process.stdout.write("\n");
    fs.rmSync(wav, { force: true });
    const edited = cleanCaptions(
      toCaptions({ whisperCppOutput: output }).captions,
    );
    captionsPath = `captions/${name}.json`;
    fs.writeFileSync(
      path.join(PUBLIC, captionsPath),
      JSON.stringify(edited, null, 2),
    );
    console.log(
      `  ${edited.length} caption words: "${edited
        .map((c) => c.text)
        .join("")
        .trim()
        .slice(0, 80)}..."`,
    );
  }

  // 4. Project file.
  const project = {
    name,
    source: path.relative(path.dirname(RAW), src),
    clips: clips.map((c) => path.basename(c)),
    video: `footage/${name}.mp4`,
    width: info.width,
    height: info.height,
    sourceDurationSec: round(info.durationSec),
    outputDurationSec,
    segments,
    captions: captionsPath,
  };
  fs.writeFileSync(projectFile, JSON.stringify(project, null, 2));
  console.log(`  ready: public/projects/${name}.json`);
};

const targets =
  files.length > 0
    ? files
    : fs.existsSync(RAW)
      ? fs
          .readdirSync(RAW, { withFileTypes: true })
          .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
          .map((d) => d.name)
      : [];

if (targets.length === 0) {
  console.log(`No video folders found in "${RAW}".`);
  process.exit(0);
}
for (const t of targets) {
  await prepare(t);
}
