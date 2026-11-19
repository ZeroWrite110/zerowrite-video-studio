// Make the voiceover for an explainer script with Piper (free, runs locally).
//
// Usage (from the studio folder):
//   node scripts/voiceover.mjs <name>          reads explainers/<name>.json
//   node scripts/voiceover.mjs <name> --promo  reads promos/<name>.json
//
// Writes public/<explainers|promo>/<name>/vo-<n>.wav and
// public/<explainers|promo>/<name>.json (the script plus each scene's audio
// file and duration), which the Explainer / YouTubePromo templates read.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const STUDIO = path.resolve(import.meta.dirname, "..");
const PIPER_PY =
  process.env.PIPER_PYTHON ??
  "C:\\Users\\dell\\zerowrite-growth\\content-studio\\.venv\\Scripts\\python.exe";
const VOICES =
  process.env.PIPER_VOICES ??
  "C:\\Users\\dell\\zerowrite-growth\\content-studio\\voices";
// Leading silence is removed with silenceremove; keep this at 0 (Piper speech starts immediately).
const TRIM_START_SEC = 0;

const promo = process.argv.includes("--promo");
const SRC_DIR = promo ? "promos" : "explainers";
const PUBLIC_DIR = promo ? "promo" : "explainers";
const name = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (!name) {
  console.log("Usage: node scripts/voiceover.mjs <name>");
  process.exit(1);
}
const script = JSON.parse(
  fs.readFileSync(path.join(STUDIO, SRC_DIR, `${name}.json`), "utf8"),
);
const outDir = path.join(STUDIO, "public", PUBLIC_DIR, name);
fs.mkdirSync(outDir, { recursive: true });
const voice = path.join(VOICES, `${script.voice ?? "en_US-ryan-high"}.onnx`);

const run = (cmd, args, input) => {
  const r = spawnSync(cmd, args, {
    input,
    encoding: "utf8",
    maxBuffer: 1 << 26,
  });
  if (r.error || r.status !== 0) {
    throw new Error(
      `${cmd} failed: ${r.error?.message ?? r.stderr.slice(-1500)}`,
    );
  }
  return r.stdout;
};

const scenes = script.scenes.map((scene, i) => {
  const raw = path.join(outDir, `raw-${i + 1}.wav`);
  const file = `vo-${i + 1}.wav`;
  run(PIPER_PY, ["-I", "-m", "piper", "-m", voice, "-f", raw], scene.vo);
  run("ffmpeg", [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-ss",
    String(TRIM_START_SEC),
    "-i",
    raw,
    "-af",
    "silenceremove=start_periods=1:start_threshold=-50dB,afade=t=in:d=0.02,loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar",
    "48000",
    "-ac",
    "1",
    path.join(outDir, file),
  ]);
  fs.rmSync(raw, { force: true });
  const durationSec = Number(
    run("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "csv=p=0",
      path.join(outDir, file),
    ]).trim(),
  );
  console.log(`  scene ${i + 1} (${scene.type}): ${durationSec.toFixed(2)}s`);
  return {
    ...scene,
    audio: `${PUBLIC_DIR}/${name}/${file}`,
    voSec: Math.round(durationSec * 1000) / 1000,
  };
});

fs.writeFileSync(
  path.join(STUDIO, "public", PUBLIC_DIR, `${name}.json`),
  JSON.stringify({ ...script, scenes }, null, 2),
);
console.log(`ready: public/${PUBLIC_DIR}/${name}.json`);
