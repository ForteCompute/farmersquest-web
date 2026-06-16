# FarmersQuest Web

The customer and farmer web app for FarmersQuest, a Nigerian agricultural marketplace connecting
buyers with farmers selling crops and livestock. It is a React single-page app and a presentation
layer only: it renders screens and talks to the FarmersQuest API. All business logic and money math
live in the API; this client only displays.

This repository currently contains the foundation: the design system, a typed API client, a
role-gated navigation shell, and a placeholder home per role. Feature screens (discovery, cart,
orders, listings, and so on) are filled in by later tickets. See `docs/ARCHITECTURE.md` for the
plan and `CLAUDE.md` for the engineering standards.

## Stack

- React and TypeScript, built with Vite
- A typed API client generated from the FarmersQuest API OpenAPI document
- Vitest and Testing Library for tests, ESLint and Prettier for quality

## Architecture at a glance

Layers with dependencies pointing inward:

```
src/
  app/            composition root: routing, providers, session and roles, entry wiring
  features/       one folder per feature area (buyer, farmer)
  components/     shared app components (app shell, role switcher, route guards)
  design-system/  design tokens (single source of truth) and core components
  services/       typed API client, environment config, presentation helpers
```

## Prerequisites

- Node.js 20 or newer, and npm
- Optionally the FarmersQuest API running locally (see `../farmersquest-api`) to exercise live calls

## Getting started

From a clean clone:

```bash
# 1. Install dependencies.
npm install

# 2. Configure. Copy the example and set the values for your environment.
cp .env.example .env.local
#    The only required value is the API base URL. The local API default is http://localhost:5099.
#    Nothing in this file is a secret; everything here ships to the browser.

# 3. Run the dev server.
npm run dev
```

Then open `http://localhost:3000`. You will land on the buyer home. Use the "Viewing as" control in
the header to switch between the buyer and farmer shells; the navigation and home change with the
role.

## Running against the API

This client consumes the FarmersQuest API only. To run against a local API, start it from
`../farmersquest-api` (its README covers docker-compose, migrations, and `dotnet run`), then set
`VITE_API_BASE_URL` in `.env.local` to the API URL (default `http://localhost:5099`).

## The typed API client

The client is generated from the API OpenAPI document, committed at
`openapi/farmersquest-api.openapi.json`.

```bash
# Refresh the contract from a locally running API (optional):
curl http://localhost:5099/swagger/v1/swagger.json -o openapi/farmersquest-api.openapi.json

# Regenerate the typed client from the committed document:
npm run generate:api
```

Review the generated diff after regenerating. Never hand-edit `src/services/api/schema.ts`.

## Scripts

- `npm run dev` start the dev server
- `npm run build` type check and build for production
- `npm run preview` serve the production build locally
- `npm run test` run the tests once (`npm run test:watch` to watch)
- `npm run lint` lint with ESLint
- `npm run format` / `npm run format:check` format with Prettier
- `npm run typecheck` type check without building
- `npm run generate:api` regenerate the typed API client from the OpenAPI document

## Configuration

Every setting is read from the environment through `src/services/config.ts`; nothing
environment-specific is hardcoded. Only `VITE_` prefixed variables exist in the browser bundle, and
none of them are secrets (secrets live in the API). `.env.example` lists every key with safe
placeholders. A missing required setting fails fast at startup.

## What is in place today

Foundation only:

- A React app that builds, runs, and shows a placeholder home per role, pointed at the API base URL
  from environment config
- A design system: tokens for colour, typography, and spacing as the single source of truth, plus
  the core components (button, input, card, badge, nav, list row, empty state, error state)
- A typed API client generated from the API OpenAPI document and wired through configuration
- A role-gated navigation shell for buyer and farmer, with placeholder screens only

No feature screens are implemented yet.

## Continuous integration

CI is defined in `.github/workflows/ci.yml`. On every pull request into `develop` or `main` it runs
install, build, test, lint, a secret scan, and a dependency vulnerability scan, all blocking. On
merge to `develop` it runs a gated development deploy stub; a version tag promotes through staging
and production stubs. Deploy targets are wired once hosting is chosen.

## Contributing

- `main` is protected and release only. `develop` is the integration branch.
- Work on `feature/<ticket>-<slug>` branches off `develop` and open a pull request into `develop`.
- A pull request must pass build, test, lint, secret scan, and dependency scan before merge.
- Follow `CLAUDE.md`: no hardcoding, security first, money displayed not computed, plain language,
  no em dashes.
