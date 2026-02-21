# Vennom Agent Handoff

## 1) Project Summary
Vennom is a privacy-first SvelteKit (static) web app for comparing text lists entirely in-browser. It supports two-list Venn analysis and multi-list overlap analysis, file drag-and-drop import, client-side worker computation, export tooling, and PWA offline support.

Primary goals implemented:
- No backend processing for comparison logic.
- Interactive exploration of overlap results.
- Strong performance posture for large lists.
- Local-first privacy posture with optional preference persistence.

---

## 2) Current Tech Stack
- Framework: SvelteKit + Svelte 5 runes + TypeScript
- Bundler: Vite
- Worker RPC: Comlink
- Styling: global CSS + component-scoped CSS (no Tailwind)
- Testing: Vitest (unit), Playwright (E2E), visual test scaffold present
- PWA: `vite-plugin-pwa`

Key config files:
- `package.json`
- `svelte.config.js`
- `vite.config.ts`
- `vitest.config.ts`
- `playwright.config.ts`
- `playwright.visual.config.ts`

---

## 3) Repository Layout
- `src/routes/+page.svelte`: main app orchestration, options, compare flow, mode switching
- `src/lib/components/`
  - `ListInput.svelte`: list entry, toolbar controls, drag/drop, add/remove list controls
  - `VennDiagram.svelte`: interactive SVG, region and label click targets
  - `StatsPanel.svelte`: 2-list metrics
  - `ResultsModal.svelte`: click-to-explore list output
  - `VirtualList.svelte`: simple virtualized rendering for long lists
  - `Toast.svelte`: transient notifications
- `src/lib/utils/`
  - `parsers.ts`: delimiter detection/splitting, uploaded file parsing/encoding
  - `sets.ts`: compare algorithms (2-list + multi-list)
  - `exporters.ts`: clipboard/download/share/image export helpers
- `src/lib/workers/`
  - `comparison.worker.ts`: worker compare execution
  - `worker-client.ts`: main-thread wrapper + fallback path
- `src/lib/stores/preferences.svelte.ts`: theme/privacy preference state
- `src/lib/styles/`: global tokens/animations/utilities
- `tests/unit`, `tests/e2e`, `tests/visual`

---

## 4) Features Implemented

### Input and Controls
- Multi-delimiter parsing (auto/newline/comma/semicolon/tab)
- Drag/drop file import (`.txt`, `.csv`, `.json` array)
- Live stats per list (char count, item estimate, long-line warnings)
- Keyboard shortcut: Compare via `Ctrl/Cmd + Enter`
- Swap, clear, sample data controls
- Dynamic list count controls (`Add List`, `Remove List`) for 2-8 lists

### Comparison Engine
- Two-list compare in worker (with fallback if worker unavailable)
- Options: case sensitivity, multiset mode, fuzzy match, common-word ignore, regex pre-filter, sort mode
- Metrics: A, B, intersection, union, differences, Jaccard
- Multi-list mode computes:
  - intersection across all lists
  - union
  - items in at least two lists
  - per-list unique + exclusive counts

### Interactive Visualization
- 2-list mode: interactive SVG Venn diagram
- Clickable circles and clickable count/percentage labels
- Intersection clickability corrected with dedicated hit region and explicit target groups
- Region click opens modal with filtered/virtualized item list

### Export/Sharing
- Export JSON analysis
- Export PNG of Venn area (2-list mode)
- Share URL for 2-list mode

### Privacy/Security UX
- Explicit privacy indicator
- Privacy mode inactivity auto-clear
- All compare operations remain local
- CSP set in `src/app.html`

### Theming
- Dark + light mode toggle
- Full theme tokenization pass for readability in light mode
- Replaced hardcoded dark-only colors with semantic tokens in major components

### PWA/Offline
- PWA plugin configured and service worker generated in build

---

## 5) Major Fixes Completed During Iterations
- Fixed non-responsive UI symptoms by addressing hydration/caching friction.
- Added dev-time cache/SW cleanup in `+layout.svelte` to reduce stale localhost assets during development.
- Corrected non-deterministic state flow by moving key mutations to explicit parent actions where needed.
- Resolved Venn intersection interaction bug and made numeric labels actionable.
- Reworked light mode contrast after user feedback (readability issues).

---

## 6) Testing Status
Last known green checks (local):
- `npm run check` => pass
- `npm run test:unit` => pass
- `npm run build` => pass

E2E status has been sensitive to local stale server/origin reuse when multiple dev/preview servers are active simultaneously. In clean runs, core flows pass. If E2E appears inconsistent:
1. Stop all local Vite/preview servers.
2. Clear service workers/caches for localhost origin.
3. Re-run `npm run test:e2e`.

---

## 7) Operational Notes for Next Agent
1. If UI appears unresponsive again, check CSP/hydration and stale SW first.
2. For visual regressions, prioritize token-based edits in `src/lib/styles/global.css` instead of hardcoded component colors.
3. Multi-list mode intentionally disables Venn and PNG/share URL actions.
4. Keep compare logic browser-local; avoid introducing backend dependencies.

---

## 8) Known Gaps / Future Improvements
- Expand multi-list visualization beyond summary cards (e.g., UpSet plot style).
- Strengthen E2E assertions for modal item integrity and multi-list analytics details.
- Add explicit accessibility audit automation (axe in CI).
- Add deterministic visual test baseline setup in environments with stable preview ports.

---

## 9) Deployment and CI/CD
GitHub Actions workflows are configured to deploy to Vercel:
- PRs: preview deployments
- `main`: production deployments

Required GitHub repository secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

If deployments fail, verify these secrets and Vercel project linkage.
