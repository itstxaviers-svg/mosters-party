# Monsters' Party

A standalone Vite + React + TypeScript game rebuilt from the supplied Genially project as a small Monster House adventure.

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

The smoke test completes all six rooms, checks wrong and correct responses, finishes all nine Race rounds, reloads the save and captures desktop/mobile screenshots in `test-results/`.

## Source audit

- [`docs/original-flow.md`](docs/original-flow.md) — all 43 Genially scenes, transitions and orphan status.
- [`docs/asset-report.md`](docs/asset-report.md) — recursive archive inventory and video sources.
- [`docs/game-flow.md`](docs/game-flow.md) — the new state-driven route.
- [`asset-manifest.json`](asset-manifest.json) — every file from `monsters.zip`, duplicate groups and corrected mapping.
- [`docs/before-after-assets.html`](docs/before-after-assets.html) — local original/corrected comparison page.

The original export is reference-only. The app contains no Genially iframe, runtime or scripts.

## Video assets

All videos used by the game are bundled locally in `public/assets/video`. The runtime copies are web-optimized H.264/AAC MP4 files; untouched source files remain under `_source/monsters`.

Runtime artwork is stored as optimized WebP, including animated character images. The local source archives are intentionally excluded from Git.
