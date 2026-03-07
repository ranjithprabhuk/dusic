# Dusic — Digital Music Generator

A modern, browser-based digital music generator. Compose music with multiple instruments, edit tracks on a timeline, and export your creations — all from your browser with no backend required.

## Features

- **Multi-instrument support** — Piano, Guitar, Synthesizer, Dholak, and Tabla with keyboard-mapped notes
- **Multi-track timeline** — Add tracks, drag segments, trim, cut, merge, copy/paste
- **Piano roll editor** — Click to place notes, drag to move/resize, right-click to delete
- **Per-track effects** — Reverb, Delay, EQ, and Volume Envelope per track
- **Loop regions** — Shift+drag on the ruler to set a loop region
- **Keyboard play** — Each instrument's sounds are mapped to keyboard keys for real-time play
- **Recording** — Record notes in real-time from your keyboard into the timeline
- **Tutorial & Practice** — Interactive tutorials and practice mode for each instrument
- **Save & Load** — Persist compositions to IndexedDB
- **Import/Export** — Import audio files (MP3, WAV, OGG, FLAC), export as WAV, MP3, or project file
- **AI music generation** — Generate music patterns via OpenAI or custom AI endpoints
- **Dark mode** — Toggle between light and dark themes
- **GitHub Pages deployment** — Deployed as a static SPA with hash routing

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 7 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| State | Zustand v5 |
| Routing | React Router v7 (hash) |
| Audio | Web Audio API |
| Storage | IndexedDB (via `idb`) |
| MP3 Export | lamejs |
| Testing | Vitest + jsdom |

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Production build
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173/dusic/`.

## Project Structure

```
src/
├── components/         # UI components
│   ├── ai/             # AI settings & generation panel
│   ├── dialogs/        # Save, Load, Export, Import modals
│   ├── tutorial/       # Instrument list, practice, guided tutorial
│   └── workspace/      # Timeline, TrackLane, PianoRoll, Toolbar, etc.
├── engine/             # Audio engine modules
│   ├── AudioEngine.ts  # AudioContext management & playback
│   ├── SynthEngine.ts  # Oscillator-based synthesis with ADSR
│   ├── SampleEngine.ts # Sample loading & playback (percussion)
│   ├── EffectsChain.ts # Per-track effects (reverb, delay, EQ)
│   ├── Renderer.ts     # Offline rendering for export
│   ├── Mixer.ts        # Track mixing
│   └── Metronome.ts    # Metronome click
├── hooks/              # Custom React hooks
├── instruments/        # Instrument configs & key mappings
├── pages/              # Route pages (Home, Workspace, Tutorial, Settings)
├── services/           # Storage, file I/O, audio import/export, AI
├── store/              # Zustand stores (composition, transport, UI, instrument, AI)
├── test/               # Test setup
└── types/              # TypeScript type definitions
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `A`–`L`, `Q`–`P` | Play mapped instrument notes |
| `Ctrl+Z` | Undo |
| `Ctrl+Shift+Z` | Redo |

## License

MIT
