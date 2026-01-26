# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

aw-webui is the web-based UI for ActivityWatch, built with Vue.js 2.7. It displays activity tracking data from aw-server, providing visualizations of time spent on applications, websites, and custom categories.

## Common Commands

```bash
# Install dependencies
npm ci

# Start development server (connects to aw-server on port 5666 by default)
npm run serve

# Build for production
npm run build

# Alternative using vite
npx vite         # dev server
npx vite build   # production build

# Run tests
npm test                    # all tests
npx jest test/unit/file.test.js  # single test file

# Run E2E tests (requires aw-server running with npm run serve)
make test-e2e

# Linting
npm run lint               # check for errors
npx eslint --ext=js,ts,vue --fix src/ test/  # auto-fix
```

## Architecture

### Technology Stack
- **Vue 2.7** with Options API (migrating toward Composition API patterns)
- **Pinia** for state management
- **Vue Router** for navigation
- **Bootstrap-Vue** for UI components
- **D3.js** for visualizations
- **TypeScript** (partial adoption - `.ts` files in stores and utilities)

### Entry Points
- `src/main.js` - Application bootstrap, global component registration
- `src/route.js` - Route definitions
- `src/App.vue` - Root component

### Directory Structure
```
src/
├── stores/          # Pinia stores (state management)
│   ├── activity.ts  # Main data fetching/processing logic
│   ├── buckets.ts   # Bucket management
│   ├── categories.ts # Category definitions
│   ├── settings.ts  # User preferences
│   └── views.ts     # Custom view configurations
├── views/           # Page components (routes)
│   ├── activity/    # Main activity views
│   └── settings/    # Settings pages
├── visualizations/  # D3/Chart.js visualization components
├── components/      # Reusable Vue components
├── util/            # Utility functions and helpers
└── queries.ts       # AW query language generation
```

### Key Patterns

**Data Flow:**
1. Views trigger actions on Pinia stores
2. Stores fetch data via `aw-client` library (`src/util/awclient.ts`)
3. Query strings are generated in `src/queries.ts`
4. Data is transformed and stored in reactive state
5. Visualizations consume store state

**Global Components:** Many components are registered globally in `main.js` with `aw-` prefix (e.g., `aw-header`, `aw-timeline`, `aw-summary`).

**Templates:** Use Pug templating language (`<template lang="pug">`).

### Testing

- Unit tests in `test/unit/` use Jest with jsdom environment
- Node-specific tests use `.test.node.js` suffix
- E2E tests in `test/e2e/` use TestCafe
- Path alias `~/` maps to `src/`

## Development Notes

### CORS Configuration
For development, add to `aw-server.toml` under `[server-testing]`:
```toml
cors_origins = http://localhost:27180
```

### Environment Detection
- `PRODUCTION` global indicates production build
- `process.env.VUE_APP_ON_ANDROID` indicates Android build
- Development connects to `http://127.0.0.1:5666` (aw-server testing port)

### Visualization Components
Visualizations are Vue components wrapping D3.js or Chart.js. Key files:
- `timeline.ts` / `TimelineSimple.vue` - Activity timeline
- `sunburst-clock.ts` / `SunburstClock.vue` - Circular time visualization
- `summary.ts` / `Summary.vue` - Category summaries
