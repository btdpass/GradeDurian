# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # starts Next.js on port 5421

# Build
npm run build        # runs scripts/generate-manifest.js then next build

# Lint
npm run lint         # next lint

# Cloudflare Worker (proxy)
cd worker && npm run dev      # wrangler dev on localhost:8787
cd worker && npm run deploy   # deploy to Cloudflare Workers
```

`npm run build` generates `public/manifest.json` from `scripts/generate-manifest.js` before the Next.js build — do not edit `public/manifest.json` directly.

After `npm install`, `patch-package` runs automatically and patches `node_modules/studentvue` (see `patches/studentvue+2.0.4.patch`). Re-run `npx patch-package studentvue` if node_modules is reinstalled.

## Architecture

### App structure

This is a **Next.js 13 static export** (`output: 'export'`). There are no server-side routes except `pages/api/` (Stripe checkout/webhooks). The app is deployed on Fly.io via Docker.

All global state lives in `pages/_app.tsx` and is passed down as props — there is no Context or Redux. Key state: `client` (StudentVUE client), `grades` (Cache), `mp` (active marking period index), `studentInfo`, `schoolsList`, `courseSettings`.

### Data flow

1. **Login** (`_app.tsx:login()`) — calls `StudentVue.login(districtURL, credentials, apiUrl)` passing the Cloudflare Worker URL as `apiUrl`. The worker handles all SOAP proxying.
2. **Grades** — the library returns `[Gradebook, extraData][]` tuples for each marking period. `getCache()` in `utils/grades.ts` converts raw `Gradebook[]` into the app's `Cache` (`Grades[]`) type. `parseGrades()` converts a single `Gradebook` into a `Grades` object.
3. **Mutations** — `updateCourse`, `addAssignment`, `delAssignment`, `updateCategory` (all in `utils/grades.ts`) take a `Cache` and return a new `Cache`. Pages call `setGrades(newCache)` after mutations — grades are never re-fetched from the server after edits.

### Key types (`utils/grades.ts`)

- `Cache = Grades[]` — one entry per marking period, indexed by order (not by MP index)
- `Grades` — one marking period: `{ courses: Course[], periods, settings: Settings }`
- `Course` — one class: `{ assignments: Assignment[], categories, settings: CourseSettings, ... }`
- `Settings` — grading scale config keyed by `courseID` (or `"default"`); has `mode: "mcps" | "other"` which affects finals logic and grade calculation
- `CourseSettings` — per-course: `{ letterScale, rounding, finals? }`

Settings are embedded in the gradebook response from the StudentVUE server (via `gradingScale` extraData field) and stored in `grades[0].settings`. MCPS is detected by comparing `client.district` against the hardcoded MCPS URL.

The worker URL is set at `_app.tsx:135` (`apiUrl`). For local development this is `http://localhost:8787`.

### studentvue library

Installed from a private GitHub branch (`github:jshap06/studentvue.js#unified`). The patched version increases XML entity limits to handle large gradebooks. The library's `processRequestWeb` path always sends `ProcessWebServiceRequestMultiWeb` SOAP XML to the proxy; `PXP2Communication.asmx` accepts this natively (unlike `PXPCommunication.asmx` which is version-gated by MCPS).

### Routing

- `/` — landing page
- `/login` — authentication
- `/grades` — grades list (all courses for active MP)
- `/grades/[index]` — individual course detail with assignment editing
- `/guest` — demo mode using hardcoded sample data from `utils/sample.ts`
- `/settings`, `/attendance`, `/schedule`, `/documents` — other StudentVUE data views

Pages that need auth check `client` in `_app.tsx` and redirect to `/login` if absent.

### Stripe

`pages/api/checkout_sessions.js` and `pages/api/webhooks/` handle donations. `lib/stripe.js` exports the Stripe client. `STRIPE_SECRET_KEY` must be set in environment.
