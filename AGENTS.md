# AGENTS.md

Guidance for coding agents working in this repository.

This is the canonical operational guide for integration changes.

For contributor-friendly setup and commands, see `README.md`.

## 1) Project Purpose

Built-with-AI is a portfolio site that aggregates multiple AI-assisted web apps under one deployment. The root app renders project cards and links to internal sub-app routes or external URLs.

## 2) Tech Stack and Layout

- Root app: React 19 + TypeScript + Vite
- Embedded apps: React/Vite apps managed as Yarn workspaces under `projects/*`
- Build orchestration: Turborepo (`turbo run build`) from repository root
- Hosting/deploy: Netlify, static build output in `dist/`

Key paths:

- `App.tsx`: root portfolio UI and category filtering
- `constants.ts`: source of truth for project metadata shown on the root site
- `netlify.toml`: redirects and headers
- `projects/flappy-bird/`: Phaser-based game app
- `projects/snake-on-windows-xp/`: retro snake app
- `projects/p2p-connect-four/`: peer-to-peer connect four app
- `projects/budgeting/`: BudgetMaster utility app

## 3) Current Portfolio Projects

The root `PROJECTS` list in `constants.ts` includes:

- Internal routes: `flappy-bird`, `snake-on-windows-xp`, `p2p-connect-four`, `budgeting`, `flowsketch`
- External/info entries: `with-ai`, `my-portfolio`, `ai-transcriber`, `my-referral-code`

When editing project metadata, keep tags aligned with available categories in `App.tsx`.

## 4) Run and Build Commands

From repo root:

- Dev root app: `yarn dev`
- Build root app: `yarn build`
- Build all embedded apps: `yarn build:projects` (Turbo)
- Build only changed apps: `yarn build:projects:changed` (requires `CACHED_COMMIT_REF`)
- Build projects with fallback logic: `yarn build:projects:smart`
- CI build entrypoint: `yarn build:ci`
- Build full deploy artifact set: `yarn build:all`

Per embedded app (`projects/<name>/`):

- Dev: `yarn dev`
- Build: `yarn build`

Install dependencies once at repository root (`yarn install`).

## 5) Integration Contract for New Internal Apps

For each new app that should be hosted under this monorepo deployment:

1. Add project metadata to `constants.ts` (`id`, `title`, `description`, `tags`, `link`).
2. Update `CATEGORIES` in `App.tsx` if new tags need to be filterable.
3. Configure the app's `vite.config.ts` with:
   - `base: '/<route>/'`
   - `build.outDir: '../../dist/<output-folder>'`
   - `build.emptyOutDir: true`
4. Add the app path to root Yarn workspaces in `package.json` (`workspaces` array).
5. Ensure the app `package.json` includes a standard `build` script (`vite build`) so Turbo can run it.
6. Add Netlify redirect(s) in `netlify.toml`:
   - `from = '/<route>/*'`
   - `to = '/<output-folder>/index.html'`
   - `status = 200` (or `301` only for alias routes)

## 6) Existing Route/Build Mapping

- `/flappy-bird/*` -> `/flappy-bird/index.html`
- `/snake-on-windows-xp/*` -> `/snake-on-windows-xp/index.html`
- `/connect-four/*` -> `/p2p-connect-four/index.html`
- `/p2p-connect-four/*` -> `/p2p-connect-four/index.html`
- `/budgeting/*` -> `/budgeting/index.html`
- `/flowsketch/*` -> `/flowsketch/index.html`

Embedded app Vite bases/outDirs must stay consistent with this mapping.

## 7) Agent Editing Rules

- Prefer minimal, targeted edits. Avoid broad refactors unless requested.
- Do not change unrelated styling or UX when fixing logic/config issues.
- Keep TypeScript types intact (`types.ts` at root and per project).
- Preserve project IDs and links unless intentionally migrating routes.
- If adding a dependency to an embedded app, add it in that app's `package.json`.
- If changing route structure, update all of: `constants.ts`, app `vite.config.ts`, root `package.json` workspaces (if needed), and `netlify.toml` in one change set.

## 8) Validation Checklist Before Finishing

Run what is relevant to the change:

1. Root build: `yarn build`
2. Target app build(s): `yarn build:projects` or individual app `yarn build`
3. Confirm no broken internal route links from `constants.ts`
4. Confirm Netlify redirects still resolve to existing `dist/<app>/index.html`
5. If the embedded app introduces/uses new libraries, ensure they are declared in that app's `package.json` and build cleanly in isolation
6. If updating CI build behavior, validate `yarn build:projects:changed` and fallback `yarn build:projects`

## 9) Notes on Consistency

- Package manager is standardized on Yarn at root (`packageManager: yarn@1.22.22`).
- Workspaces are managed from root; do not run per-project dependency installs for normal workflows.
- Root app category filtering depends on exact tag string matches.
- Always append new entries to the end of `PROJECTS` in `constants.ts` (do not insert in the middle or reorder existing entries).
- Keep a single lockfile at repository root (`yarn.lock`).
- Do not introduce per-project lockfiles or `package-lock.json` files in subprojects.
