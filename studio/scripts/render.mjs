// Render a finished video into Export/<video-name>/.
//
// Usage (from the studio folder):
//   node scripts/render.mjs <video-name>                    CaptionedReel of a prepared Raw folder
//   node scripts/render.mjs <video-name> --hook "Big title" ...with a custom hook ("" = none)
//   node scripts/render.mjs --text <name>                   TextReel from text-reels/<name>.json
//   node scripts/render.mjs --explainer <name>              voiced Explainer from explainers/<name>.json
//                                                           (run scripts/voiceover.mjs <name> first; --no-subtitles)
//   add --still to render only a preview image (frame 30)
//
// Options for CaptionedReel: --size 9:16|16:9|1:1, --position middle|lower,
// --color "#FFD60A", --no-zoom, --no-progress, --no-captions
//
// Output: Export/<video-name>/video.mp4 (+ captions.srt when there are captions),
// and a copy at Desktop/Completed Video/<video-name>.mp4

import { serializeSrt } from "@remotion/captions";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const STUDIO = path.resolve(import.meta.dirname, "..");
const EXPORT = path.resolve(STUDIO, "..", "Export");
const CLI = path.join(
  STUDIO,
  "node_modules",
  "@remotion",
  "cli",
  "remotion-cli.js",
);

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const option = (n) => {
  const i = args.indexOf(n);
  return i >= 0 ? args[i + 1] : undefined;
};
const valueFlags = new Set([
  "--hook",
  "--position",
  "--color",
  "--text",
  "--size",
  "--explainer",
]);
const positional = args.filter(
  (a, i) => !a.startsWith("--") && !valueFlags.has(args[i - 1]),
);

let composition;
let props;
let outName;
let captionsFile = null;

if (option("--explainer")) {
  const name = option("--explainer");
  if (!fs.existsSync(path.join(STUDIO, "public", "explainers", `${name}.json`))) {
    throw new Error(`No voiceover yet. Run: node scripts/voiceover.mjs ${name}`);
  }
  composition = "Explainer";
  props = { script: name, subtitles: !flag("--no-subtitles") };
  outName = name;
} else if (option("--text")) {
  const name = option("--text");
  const file = path.join(STUDIO, "text-reels", `${name}.json`);
  if (!fs.existsSync(file)) throw new Error(`Not found: ${file}`);
  composition = "TextReel";
  props = JSON.parse(fs.readFileSync(file, "utf8"));
  outName = name;
} else {
  const project = positional[0];
  const dir = path.join(STUDIO, "public", "projects");
  if (!project) {
    console.log("Which video? Prepared videos:");
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
      console.log("  " + f.replace(/\.json$/, ""));
    }
    process.exit(1);
  }
  const projectJson = JSON.parse(
    fs.readFileSync(path.join(dir, `${project}.json`), "utf8"),
  );
  if (projectJson.captions)
    captionsFile = path.join(STUDIO, "public", projectJson.captions);
  composition = "CaptionedReel";
  props = { project };
  if (option("--hook") !== undefined) props.hook = option("--hook");
  if (option("--size")) props.size = option("--size");
  if (option("--position")) props.captionPosition = option("--position");
  if (option("--color")) props.highlightColor = option("--color");
  if (flag("--no-zoom")) props.punchInZoom = false;
  if (flag("--no-progress")) props.showProgressBar = false;
  if (flag("--no-captions")) props.showCaptions = false;
  outName = project;
}

const outDir = path.join(EXPORT, outName);
fs.mkdirSync(outDir, { recursive: true });
const tmp = path.join(STUDIO, ".render");
fs.mkdirSync(tmp, { recursive: true });
const propsFile = path.join(tmp, `${outName}.props.json`);
fs.writeFileSync(propsFile, JSON.stringify(props));

const still = flag("--still");
const target = path.join(outDir, still ? "preview.png" : "video.mp4");
const cliArgs = still
  ? ["still", composition, target, `--props=${propsFile}`, "--frame=30"]
  : [
      "render",
      composition,
      target,
      `--props=${propsFile}`,
      "--codec=h264",
      "--crf=18",
      "--log=warn",
    ];

console.log(`Rendering ${composition} -> ${target}`);
const r = spawnSync(process.execPath, [CLI, ...cliArgs], {
  cwd: STUDIO,
  stdio: "inherit",
});
if (r.status !== 0) process.exit(r.status ?? 1);

// Subtitle file for YouTube / Facebook uploads: ~7 words or 3 seconds per line.
if (!still && captionsFile && fs.existsSync(captionsFile)) {
  const captions = JSON.parse(fs.readFileSync(captionsFile, "utf8"));
  const lines = [];
  let line = [];
  for (const c of captions) {
    if (
      line.length > 0 &&
      (line.length >= 7 || c.endMs - line[0].startMs > 3000)
    ) {
      lines.push(line);
      line = [];
    }
    line.push(c);
  }
  if (line.length) lines.push(line);
  fs.writeFileSync(path.join(outDir, "captions.srt"), serializeSrt({ lines }));
}
// Every finished video is also copied to the owner's Desktop folder "Completed Video".
if (!still) {
  const completed = path.join(os.homedir(), "Desktop", "Completed Video");
  fs.mkdirSync(completed, { recursive: true });
  fs.copyFileSync(target, path.join(completed, `${outName}.mp4`));
  console.log(`Copied to: ${path.join(completed, `${outName}.mp4`)}`);
}
console.log(`Done: ${outDir}`);
