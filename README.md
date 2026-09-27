# Monsters' Party

A standalone Vite + React + TypeScript reconstruction of the supplied Genially game. It follows the original linear scene order and uses the supplied artwork, animated characters, audio and locally hosted video.

## Run

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

Production build:

```bash
npm run build
npm run preview
```

Hosted version: <https://itstxaviers-svg.github.io/mosters-party/>

Pushes to `main` are deployed automatically with GitHub Actions and GitHub Pages.

## Verification

```bash
node scripts/smoke-test.mjs
```

The smoke test follows the whole game: opening scenes, 12-card voice deck, feelings, food vocabulary and Memory, all six invitations, all nine Race rounds, final scene and save restoration. It captures reference screenshots in `test-results/original-rebuild/`.

## Source audit

- [`docs/original-flow.md`](docs/original-flow.md) — all 43 Genially scenes, transitions and orphan status.
- [`docs/asset-report.md`](docs/asset-report.md) — recursive archive inventory and video sources.
- [`docs/game-flow.md`](docs/game-flow.md) — the reconstructed state-driven route.
- [`asset-manifest.json`](asset-manifest.json) — every file from `monsters.zip`, duplicate groups and corrected mapping.
- [`docs/before-after-assets.html`](docs/before-after-assets.html) — local original/corrected comparison page.

The original export is reference-only. The app contains no Genially iframe, runtime or scripts.

## Video assets

All videos used by the game are bundled locally in `public/assets/video`. The runtime copies are web-optimized H.264/AAC MP4 files; untouched source files remain under `_source/monsters`.

Runtime artwork is stored as optimized WebP/JPEG, including animated character images. The 1536×1024 Genially backgrounds are resized to 1152×768 for the hosted game. The local source archives are intentionally excluded from Git.
