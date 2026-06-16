# FarmersQuest Web, Engineering Standards (CLAUDE.md)

This file is the standard for every task in this repo. Read it before any work and follow it
without exception. If a task prompt conflicts with this file, ask before proceeding.

## This repo

The customer and farmer web app for FarmersQuest, a Nigerian agricultural marketplace. It is a
React single-page app. It is a presentation layer only: it renders screens and talks to the
FarmersQuest API. It holds no business logic and does no money math.

## Stack

React, TypeScript, Vite. Vitest and Testing Library for tests. ESLint and Prettier for quality.

## The one rule that shapes everything

All business logic and all money math live in the API. This client only displays. It never
computes a price, a total, a commission, a payout, or any other money value; it shows the exact
values the API returns. Where you feel tempted to add logic, that logic belongs in the API behind
the OpenAPI contract. See `docs/ARCHITECTURE.md`.

## Golden rules (non-negotiable)

- No hardcoding. Every config value, URL, and key comes from environment configuration (the
  `VITE_` variables read through `src/services/config.ts`). Nothing environment-specific lives in
  code. Note: only non-secret values belong in the client; secrets live in the API.
- Separation of concerns. Code lives in its layer behind a clear boundary: design system,
  components, features, services, app. Layers depend inward through defined surfaces, never by
  reaching into each other's internals.
- Security first. See the security section. Treat every response as untrusted and never trust the
  client to enforce a rule the server must own.
- Solid, tested logic. Presentation logic (formatting, gating, state) has tests. Edge cases are
  handled, not ignored.
- Money is only displayed, never computed. Format it for the screen; never do arithmetic on it.
- No em dashes anywhere: code, comments, docs, UI copy, commit messages. Use plain punctuation.
- No AI attribution in commit messages or anywhere in the repo.
- Plain language in all docs, comments, and UI copy. No filler.

## Architecture and separation

- `src/design-system`: brand tokens (colours, typography, spacing) as the single source of truth,
  and the core components (button, input, card, badge, nav, list row, empty state, error state).
  No app or feature knowledge. The tokens are the shared set the back office and mobile reuse. The
  exact look (colours, type, spacing, radii) comes from `design/DESIGN-SPEC.md`, taken from the
  Figma export; match it, do not approximate. Feature screens are built against the frames in
  `design/figma/`.
- `src/components`: shared app components that compose the design system into product chrome (for
  example the app shell, role switcher, route guards). No feature business knowledge.
- `src/features`: one folder per feature area (buyer, farmer, ...). Screens and feature-local
  state live here. Features use the design system, components, and services; they do not reach
  into each other.
- `src/services`: the typed API client (generated from the OpenAPI contract), environment
  configuration, and pure presentation helpers (for example money formatting). The only place that
  talks to the network.
- `src/app`: the composition root. Routing, providers, session and role context, and the entry
  wiring. It assembles the layers; it holds no feature logic.
- Dependencies point inward: design-system depends on nothing in the app; services depend on
  config and the contract; features depend on services, components, and the design system; app
  composes them all.

## Security

- Secrets never live in this repo or the client bundle. Anything in a `VITE_` variable ships to
  the browser, so it must not be a secret. Secrets live in the API. CI secret scan blocks merge.
- The server is the only authority on authentication and authorization. Role gating in this client
  is a presentation convenience; the API re-checks role and ownership on every protected action.
  Never rely on the client to keep anyone out of anything.
- Treat every API response as untrusted input. Render through React (which escapes by default);
  never build HTML from response data; avoid `dangerouslySetInnerHTML`.
- Never log secrets or personal data (such as NIN). Keep technical error detail out of the UI;
  show safe, user-facing messages and keep specifics in the network layer.
- Send the access token only to the configured API origin, over HTTPS in real environments.
- Keep dependencies current. CI dependency vulnerability scan blocks merge.
- Fail safe: on an unexpected response, show an error state and do not guess.

## Configuration

- Every setting is read from the environment through `src/services/config.ts`. Provide a complete
  `.env.example` with every key and no real values. Required settings fail fast at startup.
- Separate configuration per environment. No environment branching hardcoded in code.

## The API contract

- The web app consumes the FarmersQuest API only, through its published OpenAPI document. The
  typed client in `src/services/api` is generated from that document; never hand-edit the generated
  types. Regenerate with `npm run generate:api` when the contract changes, and review the diff.
- No call to any other backend. No business rules duplicated from the API.

## Definition of done

- Builds, all tests pass, lint and format clean, types check.
- Ticket acceptance criteria met and listed in the pull request.
- New presentation logic has tests.
- Secret scan clean, dependency scan clean, no hardcoded environment values.
- README or docs updated if setup or behaviour changed.

## Git and branching

- main is protected. Work on feature branches. Pull request into develop.
- Set origin remote, push branches with upstream tracking.
- Commit messages: short, clear, present tense, no AI attribution, no em dashes.
- A pull request must pass build, test, lint, secret scan, and dependency scan before merge.

## Branching

- main is the production branch. It is protected and release only. A version tag on main promotes
  the release to staging and then to production.
- develop is the default integration branch. It is protected and deploys to the development
  environment on merge.
- feature/<ticket>-<slug> branches off develop and opens a pull request into develop.
- release/<version> goes from develop to main and is promoted with a version tag.
- hotfix/<slug> branches off main.
- Never commit directly to main or develop. Every change is a pull request that passes the full CI
  gate.

## Folder structure

```
farmersquest-web/
  openapi/                 the committed OpenAPI document the client is generated from
  src/
    app/                   composition root: routing, providers, session and roles, entry wiring
    features/              one folder per feature area (buyer, farmer)
    components/            shared app components (app shell, role switcher, route guards)
    design-system/         tokens (single source of truth) and core components
    services/              typed API client, environment config, presentation helpers
    test/                  test setup
  .github/workflows/
  .env.example
  CLAUDE.md
  README.md
```
