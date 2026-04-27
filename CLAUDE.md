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

# Backend (self-hosted proxy)
cd backend && npm start      # runs on port 3001
cd backend && npm run dev    # same with --watch
```

`npm run build` generates `public/manifest.json` from `scripts/generate-manifest.js` — do not edit it directly.

After `npm install`, `patch-package` runs automatically and patches `node_modules/studentvue`. Re-run `npx patch-package studentvue` if node_modules is reinstalled.

## Architecture

### App structure

**Next.js 13 static export** (`output: 'export'`). No server-side routes except `pages/api/` (Stripe). Deployed on Fly.io via Docker.

All global state lives in `pages/_app.tsx` and is passed as props — no Context or Redux. Key state: `client` (StudentVUE client), `grades` (Cache), `mp` (active marking period index), `studentInfo`, `schoolsList`.

### Backend proxy (`backend/server.js`)

Express server deployed on Railway. The frontend communicates with it via `apiUrl` at `_app.tsx:134`. **Never run this locally for MCPS** — the `edupointkeyversion` cookie is only valid from datacenter IPs.

Endpoints:
- **`POST /fulfillAxios`** — main SOAP proxy. Receives `{ url, xml, encrypted }`. If `encrypted=true`, AES-decrypts the password in the XML back to plain before forwarding (MCPS expects plain passwords). Returns `{ status, response, gradingScale, token }`. The `gradingScale` field is required — omitting it crashes the app at `extraData.gradingScale.mode`.
- **`POST /encryptPassword`** — AES-encrypts a password for browser cookie storage (remember-me). Key comes from `process.env.encryptionkey` on Railway.
- **`POST /checkSuppression`** — sends a test SOAP request to check if UPD5304-00 is active.
- **`POST /logLogin`** — stub.

**`edupointkeyversion` cookie**: MCPS requires this on every SOAP request to bypass their version gate (UPD5304-00). It is computed daily by replicating the algorithm from the StudentVUE APK (`H0.h()` in `WsConnection.java`):
- Plaintext: `{MMddyyyy}|8.14.0|{MMddyyyy}|android` (Eastern time date)
- Encrypted with AES-256-CBC, key=`b2524efb438b4532b322e633d5aff252`, IV=`"AES"` + 13 zero bytes
- Auto-refreshes at midnight Eastern via `scheduleKeyRefresh()`

The cookie jar also captures `ASP.NET_SessionId` and `EES_PVUE` (load balancer affinity) from MCPS responses.

### Data flow

1. **Login** (`_app.tsx:login()`) — calls `StudentVue.login(districtURL, credentials, apiUrl)`. The library builds `ProcessWebServiceRequestMultiWeb` SOAP XML and POSTs it to `apiUrl + "/fulfillAxios"`.
2. **Grades** — library returns `[Gradebook, extraData][]` tuples per marking period. `getCache()` in `utils/grades.ts` converts raw `Gradebook[]` → `Cache` (`Grades[]`). `parseGrades()` converts a single `Gradebook` → `Grades`.
3. **Mutations** — `updateCourse`, `addAssignment`, `delAssignment`, `updateCategory` (all `utils/grades.ts`) take and return a new `Cache`. Pages call `setGrades(newCache)` — grades are never re-fetched after edits.

### Key types (`utils/grades.ts`)

- `Cache = Grades[]` — one entry per marking period, indexed by order (not MP index)
- `Grades` — `{ courses: Course[], periods, settings: Settings }`
- `Course` — `{ assignments: Assignment[], categories, settings: CourseSettings, ... }`
- `Settings` — grading scale keyed by `courseID` or `"default"`; `mode: "mcps" | "other"` affects finals logic
- `CourseSettings` — `{ letterScale, rounding, finals? }`

`gradingScale` comes from the backend's `extraData` field on the `/fulfillAxios` response and is stored in `grades[0].settings`. MCPS mode is detected by comparing `client.district` against the hardcoded MCPS URL and overwritten at `_app.tsx:264`.

### studentvue library

Installed from `github:jshap06/studentvue.js#unified`. Patched to increase XML entity limits (`patches/studentvue+2.0.4.patch`). Default proxy URL patched to our Railway backend in both `lib/StudentVue/StudentVue.js` and `lib/utils/soap/Client/Client.js`. The library always sends `ProcessWebServiceRequestMultiWeb` to the proxy; MCPS's `PXPCommunication.asmx` accepts this when the `edupointkeyversion` cookie is present.

### Routing

- `/` — landing page (gated behind a frame-open mechanism on desktop)
- `/login` — authentication
- `/grades` — grades list (all courses for active MP)
- `/grades/[index]` — individual course detail with assignment editing
- `/guest` — demo mode using hardcoded sample data from `utils/sample.ts`
- `/settings`, `/attendance`, `/schedule`, `/documents` — other StudentVUE views

### Stripe

`pages/api/checkout_sessions.js` and `pages/api/webhooks/` handle donations. `STRIPE_SECRET_KEY` must be set in environment.
