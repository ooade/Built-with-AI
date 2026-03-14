# Built-with-AI

A portfolio monorepo that hosts multiple AI-assisted web apps under one deployment.

## Project Overview

- Root app: React 19 + TypeScript + Vite portfolio site.
- Embedded apps: individual React/Vite apps in `projects/*`.
- Package management: Yarn workspaces (single root install + single root lockfile).
- Build orchestration: Turborepo.
- Hosting: Netlify with redirects to each built app in `dist/`.

For agent-specific editing and integration rules, see `AGENTS.md`.

## Repository Layout

- `App.tsx`: root portfolio UI and category filtering.
- `constants.ts`: project metadata source for root cards/links.
- `projects/<app>/`: embedded apps.
- `netlify.toml`: deployment command + redirects.
- `turbo.json`: Turborepo task configuration.

## Prerequisites

- Node.js 18+ (Node 20+ recommended)
- Yarn 1.22.x

## Install

Install dependencies once at repository root:

```bash
yarn install
```

## Scripts

Run from repository root:

- `yarn dev`: run root portfolio app in dev mode.
- `yarn build`: build root portfolio app.
- `yarn build:projects`: build all workspace projects via Turbo.
- `yarn build:projects:changed`: build changed projects relative to `CACHED_COMMIT_REF`.
- `yarn build:all`: build root app + all embedded projects.

Run from a specific embedded project directory:

- `yarn dev`: run that project in dev mode.
- `yarn build`: build that project.

## How Project Builds Work Now

1. Yarn workspaces define all embedded apps in root `package.json`.
2. Turbo discovers each workspace package with a `build` script.
3. `yarn build:projects` runs Turbo build tasks in parallel.
4. Netlify build command in `netlify.toml` does:
   - `yarn build` for the root site
   - changed-project build (`yarn build:projects:changed`) when `CACHED_COMMIT_REF` is available
   - fallback full project build (`yarn build:projects`) otherwise

## Adding a New Internal App

1. Create the app under `projects/<name>/` with a `build` script (`vite build`).
2. Add the app workspace path to root `package.json` `workspaces` array.
3. Configure app `vite.config.ts`:
   - `base: '/<route>/'`
   - `build.outDir: '../../dist/<output-folder>'`
   - `build.emptyOutDir: true`
4. Add an entry to root `constants.ts` (`id`, `title`, `description`, `tags`, `link`).
5. Add/update redirect rules in `netlify.toml` for the new route.
6. If needed, add a category in root `App.tsx` for new tags.

## Validation Checklist

1. Run `yarn build:all`.
2. Verify each internal route maps to an existing `dist/<app>/index.html` output.
3. Confirm new/edited metadata links in `constants.ts` resolve correctly.
4. If CI behavior changed, verify both:
   - `yarn build:projects:changed`
   - `yarn build:projects`

## Consistency Rules

- Use Yarn from repository root for dependency management.
- Keep exactly one lockfile at root: `yarn.lock`.
- Do not add `package-lock.json` or per-project lockfiles.
- Keep project tags aligned with categories in root `App.tsx`.
