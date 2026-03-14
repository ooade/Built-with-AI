# AGENTS.md

Guidance for coding agents working in this repository.

This is the canonical operational guide for integration changes.

## 1) Project Purpose

Built-with-AI is a portfolio site that aggregates multiple AI-assisted web apps under one deployment. The root app renders project cards and links to internal sub-app routes or external URLs.

## 2) Tech Stack and Layout

- Root app: React 19 + TypeScript + Vite
- Embedded apps: independent React/Vite apps under `projects/*`
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

- Internal routes: `flappy-bird`, `snake-on-windows-xp`, `p2p-connect-four`, `budgeting`
- External/info entries: `with-ai`, `my-portfolio`, `ai-transcriber`, `my-referral-code`

When editing project metadata, keep tags aligned with available categories in `App.tsx`.

## 4) Run and Build Commands

From repo root:

- Dev root app: `npm run dev` (or `yarn dev`)
- Build root app: `npm run build`
- Build all embedded apps: `npm run build:projects`

Per embedded app (`projects/<name>/`):

- Dev: `npm run dev`
- Build: `npm run build`

## 5) Integration Contract for New Internal Apps

For each new app that should be hosted under this monorepo deployment:

1. Add project metadata to `constants.ts` (`id`, `title`, `description`, `tags`, `link`).
2. Update `CATEGORIES` in `App.tsx` if new tags need to be filterable.
3. Configure the app's `vite.config.ts` with:
   - `base: '/<route>/'`
   - `build.outDir: '../../dist/<output-folder>'`
   - `build.emptyOutDir: true`
4. Add a root script in `package.json`:
   - `build:<name>` for the app
   - include it in `build:projects`
5. Add Netlify redirect(s) in `netlify.toml`:
   - `from = '/<route>/*'`
   - `to = '/<output-folder>/index.html'`
   - `status = 200` (or `301` only for alias routes)

## 6) Existing Route/Build Mapping

- `/flappy-bird/*` -> `/flappy-bird/index.html`
- `/snake-on-windows-xp/*` -> `/snake-on-windows-xp/index.html`
- `/connect-four/*` -> `/p2p-connect-four/index.html`
- `/p2p-connect-four/*` -> `/p2p-connect-four/index.html`
- `/budgeting/*` -> `/budgeting/index.html`

Embedded app Vite bases/outDirs must stay consistent with this mapping.

## 7) Agent Editing Rules

- Prefer minimal, targeted edits. Avoid broad refactors unless requested.
- Do not change unrelated styling or UX when fixing logic/config issues.
- Keep TypeScript types intact (`types.ts` at root and per project).
- Preserve project IDs and links unless intentionally migrating routes.
- If adding a dependency to an embedded app, add it in that app's `package.json`.
- If changing route structure, update all of: `constants.ts`, app `vite.config.ts`, root scripts, and `netlify.toml` in one change set.

## 8) Validation Checklist Before Finishing

Run what is relevant to the change:

1. Root build: `npm run build`
2. Target app build(s): `npm run build:projects` or individual app `npm run build`
3. Confirm no broken internal route links from `constants.ts`
4. Confirm Netlify redirects still resolve to existing `dist/<app>/index.html`
5. If the embedded app introduces/uses new libraries, ensure they are declared in that app's `package.json` and build cleanly in isolation

## 9) Notes on Consistency

- This repository currently mixes npm and yarn usage in scripts/docs. Follow existing scripts for compatibility unless the user asks for package-manager standardization.
- Root app category filtering depends on exact tag string matches.
- Always append new entries to the end of `PROJECTS` in `constants.ts` (do not insert in the middle or reorder existing entries).
- Do not keep both `yarn.lock` and `package-lock.json` in the same project directory. If a project uses the existing Yarn-based scripts, keep `yarn.lock` and remove `package-lock.json`.
