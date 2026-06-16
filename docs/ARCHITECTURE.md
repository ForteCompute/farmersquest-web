# FarmersQuest Web, Architecture Brief

This document is the persisted brief for the foundation and seams of the FarmersQuest web client.
It is the reference for how the app is shaped and where feature work slots in. Read it together
with `CLAUDE.md`. Where the two overlap, `CLAUDE.md` is the engineering standard and this file is
the architecture.

## The product

FarmersQuest connects Nigerian buyers with farmers selling crops and livestock. This repo is the
customer and farmer web app. There are four repos in the system: `farmersquest-api` (the brain,
where all business logic and data live), and three clients that consume it through its published
OpenAPI contract: this web app, `farmersquest-backoffice`, and `farmersquest-mobile`. This client
serves two of the four roles the API knows: buyer and farmer. Middleman and admin flows belong to
other clients.

Currency is the Nigerian Naira, a single currency. Money is always an exact value decided by the
API. This client only displays it.

## The shaping principle

This is a presentation layer. It renders screens and calls the API. It contains no business logic
and does no money math. Every rule, total, commission, and payout is computed by the API and
arrives over the contract; the web app shows it. When a change feels like it needs logic here, the
logic belongs in the API.

## Architecture (this client)

A React single-page app built with Vite and TypeScript. It is organised into layers with
dependencies pointing inward:

- `src/design-system`: the brand. Design tokens for colour, typography, and spacing are the single
  source of truth (`tokens/`), with values taken exactly from `design/DESIGN-SPEC.md` (the Figma
  export), projected onto the document as CSS custom properties by `theme.ts`.
  Core components (button, input, card, badge, nav, list row, empty state, error state) are built
  only on those tokens, never on raw values. The design system knows nothing about features,
  routing, or the API. These tokens and the component contracts are the shared set the back office
  and mobile apps reuse.
- `src/components`: shared app components that compose the design system into product chrome: the
  app shell, the role switcher, and route guards. No feature business knowledge.
- `src/features`: one folder per feature area (today: `buyer`, `farmer`). Screens and feature-local
  state live here. Features depend on services, components, and the design system, and never reach
  into one another.
- `src/services`: the only layer that talks to the outside.
  - `api/`: a typed client generated from the API OpenAPI document. `schema.ts` is generated;
    `client.ts` wires `openapi-fetch` to the API base URL from configuration. Type checking against
    the published contract means a path, parameter, or shape the API does not offer will not
    compile.
  - `config.ts`: strongly read environment configuration, validated up front. The single place
    environment values enter the app.
  - `money.ts`: formats an exact amount from the API for display. Presentation only, no arithmetic.
- `src/app`: the composition root. Routing (`router.tsx`), providers, the session and role context
  (`session.tsx`, `roles.ts`), and the navigation map (`navigation.ts`). It assembles the layers
  and holds no feature logic.

## The API contract and the typed client

The client is generated from the API OpenAPI document, committed at `openapi/farmersquest-api.openapi.json`.

- To refresh the contract from a locally running API:
  `curl http://localhost:5099/swagger/v1/swagger.json -o openapi/farmersquest-api.openapi.json`
  (start the API from `../farmersquest-api` with its docker-compose and `dotnet run`).
- Regenerate the typed client from the committed document: `npm run generate:api`.
- Review the generated diff. Never hand-edit `src/services/api/schema.ts`.

The committed document keeps the build reproducible without a running API; the API stays the source
of truth for the contract.

## Configuration

Every setting is read from the environment through `src/services/config.ts`. Only `VITE_` prefixed
variables reach the browser, and none of them are secrets. `.env.example` lists every key with safe
placeholders. A missing required setting fails fast.

## Roles and navigation

The web app serves the buyer and farmer roles. Authentication is not built yet, so the active role
is chosen in the shell (`RoleSwitcher`) and kept in the browser, purely to drive the role-gated
navigation. `RoleGuard` gates routes by role. This is a presentation gate only: when sign in lands,
the role will come from the authenticated session, and the API will remain the sole authority,
re-checking role and ownership on every protected action. Only the session provider changes then;
consumers do not.

## Foundation built now (no features)

- A React app that builds, runs, and shows a placeholder home per role, pointed at the API base URL
  from environment config.
- The design system: tokens as the single source of truth, plus the eight core components.
- The typed API client generated from the OpenAPI document and wired through configuration.
- A role-gated navigation shell for buyer and farmer, with placeholder screens only.
- `.env.example`, `.gitignore`, and a README to clone, configure, and run.
- A GitHub Actions CI workflow: on a pull request, install, build, test, lint, secret scan, and
  dependency scan, all blocking; a develop deploy stub on push to develop, and staging and
  production stubs on a version tag, following the branching policy.

## Performance and efficiency

Lean bundles: import only what is used, and keep the design system free of heavy dependencies.
Code-split feature areas as they grow. Fetch only what a screen needs through the typed client, and
render list and empty and error states explicitly so the UI is honest while data loads.

## Scope guard

Foundation only. Do NOT implement discovery, cart, orders, listings, payments, disputes, or
notification screens. Build the structure, the design system, the typed client, the configuration,
and the role-gated shell, with a placeholder home per role proving the app runs against the API.
Where tempted to go further, leave a clear TODO and a one-line note for the feature ticket. Prefer
the simplest correct seam over cleverness.

## Finish and deliver

- Complete the foundation above.
- `.env.example` with every key; `.gitignore`; README to clone, configure, and run.
- GitHub Actions on pull request: install, build, test, lint, secret scan, dependency scan,
  blocking on failure; a develop deploy stub on push to develop.
- Small, clear commits. Push the initial scaffold to main; thereafter work on feature branches and
  open pull requests into develop.
