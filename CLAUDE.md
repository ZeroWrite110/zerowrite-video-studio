# AI Video Studio

Owner is a non-coder who speaks Roman Urdu/Hindi. They ask for edits in plain words; you run the pipeline. Never ask them to edit code.

## Folder workflow (owner-facing, see README.md and START HERE.md)
- `Raw/<video-name>/`: clips + `brief.txt` (topic, platform, size, length, special requests). Never modify or delete files here. `_`-prefixed folders are examples.
- `Export/<video-name>/`: your output, `video.mp4` + `captions.srt`. `render.mjs` also copies every finished video to `Desktop/Completed Video/<video-name>.mp4` (the owner's pick-up folder).
- Before every edit read: the brief, `Editing Style/*`, `Brand Kit/*` (colors.txt, logo, fonts, music). Use `Reference/` and `Approved Videos/` only to understand style.
- If `Editing Style` is empty, follow the brief and the defaults, and offer to draft `Editing Style/style.md`.

## Engine: `studio/` (Remotion 4.0.544, run commands from here)
- `npm run prepare-footage -- <video-name> [--lang en|ur|hi|auto] [--english] [--no-cuts] [--force]`
  Joins the folder's clips (file-name order; fitted to first clip's frame, 30fps), cuts silences (adaptive loudnorm threshold, pauses >0.6s, 0.15s pad; no-audio b-roll clips are always kept), transcribes only the kept audio with whisper.cpp 1.5.5 `small` (`studio/whisper.cpp`, gitignored), writes `public/projects/<slug>.json` and `public/captions/<slug>.json` (already on the cut timeline).
- `npm run make -- <video-name> [--size 9:16|16:9|1:1] [--hook "..."] [--position middle|lower] [--color "#hex"] [--no-zoom] [--no-progress] [--no-captions] [--still]`
- `npm run make -- --text <name> [--still]` renders TextReel from `studio/text-reels/<name>.json`.
- `npm run dev` (Studio preview), `npm run lint`.
- `src/brand.ts`: font (Inter) and colors. Update it from `Brand Kit/colors.txt` when present.
- `src/CaptionedReel/`: footage + jump cuts + TikTok-style captions + hook + punch-in zoom + progress bar.
- `src/TextReel/`: text scenes with slide transitions, optional music from `public/music`.

## Gotchas
- In this harness, refresh PATH from Machine+User env vars in PowerShell before node/ffmpeg.
- Don't name an npm script `prepare` (npm runs it on install).
- Whisper may invent short words where audio starts with clicks/breaths. Read the caption text after prepare and fix `public/captions/<slug>.json` by hand if needed.
- Render a `--still` before full renders when changing visuals.
- Remotion license: free for individuals and companies of up to 3 people.

## Explainer videos (motion graphics + voiceover, no footage)
- Script: `studio/explainers/<name>.json` (scenes: download, ransomware, held, intent, verdict, cta; `*word*` in a title = cyan accent).
- `node scripts/voiceover.mjs <name>` makes the voice with Piper (venv + voice in `C:\Users\dell\zerowrite-growth\content-studio`), then `node scripts/render.mjs --explainer <name>` -> `Export/<name>/video.mp4`.
- Write "Zero Write" (two words) in voiceover text so the voice pronounces it right. After making the voice, check it with whisper.cpp.
- Brand: `Brand Kit/colors.txt`, logo `studio/public/brand/zerowrite-logo.svg`, style `Editing Style/style.md`, research `Reference/notes.txt`.
