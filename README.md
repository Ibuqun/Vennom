# Vennom

Vennom is a privacy-first, browser-only web app for comparing lists with interactive Venn diagrams.

## Privacy Policy

- 100% client-side processing (no backend, no external APIs).
- No analytics, no cookies.
- Preferences are stored in `localStorage` only when explicitly enabled.
- Privacy Mode auto-clears data after 5 minutes of inactivity.
- Data is cleared on page unload.

## Tech

- Svelte 5 + SvelteKit (static adapter)
- TypeScript (strict)
- Web Worker + Comlink for comparison engine
- Custom SVG Venn chart and custom SVG icon set
- Vitest + Playwright
- Vite PWA plugin for offline support

## Run

```bash
npm install
npm run dev
```

## Test

```bash
npm run test:unit
npm run test:e2e
npm run test:visual
```

## Build

```bash
npm run build
npm run preview
```

## Deploy (Cloudflare Pages)

1. Push repository to Git provider.
2. In Cloudflare Pages create a new project from repo.
3. Build command: `npm run build`
4. Build output directory: `build`
5. Enable `npm ci` in install step.

## Architecture Decisions

- Worker-first comparison prevents UI blocking for large datasets.
- Virtual list rendering avoids DOM explosion for 1000+ results.
- Custom SVG Venn and tooltip keep dependencies minimal and privacy-safe.
- CSP is enforced in `src/app.html`.
