# Studio engine

Remotion project behind the AI Video Studio. Usage guide: `../START HERE.md`. Technical notes: `../CLAUDE.md`.

- `npm run prepare-footage -- <video-name>`: join clips from `../Raw/<video-name>/`, cut silences, transcribe
- `npm run make -- <video-name>`: render into `../Export/<video-name>/`
- `npm run dev`: open Remotion Studio preview
