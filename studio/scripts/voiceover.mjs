// Make the voiceover for an explainer script with Piper (free, runs locally).
//
// Usage (from the studio folder):
//   node scripts/voiceover.mjs <name>      reads explainers/<name>.json
//
// Writes public/explainers/<name>/vo-<n>.wav and public/explainers/<name>.json
// (the script plus each scene's audio file and duration), which the Explainer
// template reads.

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

const name = process.argv[2];
if (!name) {
  console.log("Usage: node scripts/voiceover.mjs <name>");
  process.exit(1);
}
const script = JSON.parse(
  fs.readFileSync(path.join(STUDIO, "explainers", `${name}.json`), "utf8"),
);
const outDir = path.join(STUDIO, "public", "explainers", name);
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
    audio: `explainers/${name}/${file}`,
    voSec: Math.round(durationSec * 1000) / 1000,
  };
});

fs.writeFileSync(
  path.join(STUDIO, "public", "explainers", `${name}.json`),
  JSON.stringify({ ...script, scenes }, null, 2),
);
console.log(`ready: public/explainers/${name}.json`);
