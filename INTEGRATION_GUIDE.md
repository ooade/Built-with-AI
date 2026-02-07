# Project Integration Guide

This document outlines the configuration changes made to integrate projects into the main Built-with-AI portfolio site.

## Budgeting Project Integration

The following changes were made to integrate the budgeting project with the main portfolio site:

### 1. Main Site Configuration

#### constants.ts

Added budgeting project to the PROJECTS array:

```typescript
{
  id: 'budgeting',
  title: 'BudgetMaster',
  description: 'A comprehensive, offline-first budget tracking application with PDF import simulation, robust data visualization, and expense management.',
  tags: ['Utility', 'Finance'],
  link: '/budgeting/',
}
```

#### App.tsx

Added 'Utility' to the CATEGORIES array:

```typescript
const CATEGORIES = ['All', 'Game', 'Utility' /* 'Visual', 'Audio' */];
```

#### package.json

Added build scripts for budgeting project:

```json
{
	"build:budgeting": "cd projects/budgeting && yarn && yarn build",
	"build:projects": "yarn build:flappy-bird && yarn build:snake-on-windows-xp && yarn build:connect-four && yarn build:budgeting"
}
```

### 2. Budgeting Project Configuration

#### vite.config.ts

Updated configuration to match other projects in the monorepo:

**Added:**

- `base: '/budgeting/'` - Sets the base path for routing when deployed to `/budgeting/`
- `build.outDir: '../../dist/budgeting'` - Outputs built files to the main site's dist directory
- `build.emptyOutDir: true` - Ensures clean builds by clearing the output directory

**Dependency Fix:**

The project was missing the `react-is` dependency required by recharts. Fixed by:

```bash
yarn add react-is
```

**Before:**

```typescript
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '');
	return {
		server: {
			port: 3000,
			host: '0.0.0.0',
		},
		// ... rest of config
	};
});
```

**After:**

```typescript
export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, '.', '');
	return {
		base: '/budgeting/',
		build: {
			outDir: '../../dist/budgeting',
			emptyOutDir: true,
		},
		server: {
			port: 3000,
			host: '0.0.0.0',
		},
		plugins: [react()],
		define: {
			'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
			'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
		},
		resolve: {
			alias: {
				'@': path.resolve(__dirname, '.'),
			},
		},
	};
});
```

### 3. Existing Configuration (Already Present)

#### netlify.toml

The Netlify redirect was already configured:

```toml
[[redirects]]
  from = "/budgeting/*"
  to = "/budgeting/index.html"
  status = 200
```

## Standard Integration Pattern

For future projects, follow this pattern:

1. **Add to constants.ts** - Include project metadata in the PROJECTS array
2. **Update categories** - Add any new tags to the CATEGORIES array in App.tsx
3. **Configure vite.config.ts** - Add required build configuration:
   ```typescript
   base: '/project-name/',
   build: {
     outDir: '../../dist/project-name',
     emptyOutDir: true,
   }
   ```
4. **Update package.json** - Add build scripts for the new project
5. **Configure routing** - Add Netlify redirects in netlify.toml

This ensures consistent deployment and navigation across all projects in the monorepo.
