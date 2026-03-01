# Notes Organizer — Project Documentation

This document describes the **Notes Organizer** monorepo in depth: technology stack, architecture, data model, every API endpoint, and how the frontend and backend work together.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Repository Structure](#3-repository-structure)
4. [Data Model & Database](#4-data-model--database)
5. [API Backend](#5-api-backend)
6. [API Reference (All Endpoints)](#6-api-reference-all-endpoints)
7. [Web Frontend](#7-web-frontend)
8. [Authentication & Security](#8-authentication--security)
9. [File Storage (Backblaze B2)](#9-file-storage-backblaze-b2)
10. [Environment & Configuration](#10-environment--configuration)
11. [Running the Project](#11-running-the-project)

---

## 1. Overview

**Notes Organizer** is a personal notes application with:

- **Private-by-default notes** organized by day (`dayKey` in `YYYY-MM-DD` format).
- **Visibility**: PRIVATE (only owner), PUBLIC (discoverable by slug), UNLISTED (shareable via token only).
- **File attachments** per note, stored in Backblaze B2 (S3-compatible).
- **Cookie-based JWT auth** (access + refresh tokens) with CORS and credentials.

The app is a **monorepo** with:

- **`application/api`** — Express.js REST API (TypeScript, Prisma, PostgreSQL/Neon).
- **`application/web`** — Next.js 16 frontend (React 19, Tailwind CSS).
- **`packages/shared`** — Shared TypeScript types (e.g. `NoteVisibility`).

---

## 2. Technology Stack

| Layer | Technology |
|-------|------------|
| **Monorepo** | npm workspaces (`application/*`, `packages/*`) |
| **API runtime** | Node.js |
| **API framework** | Express 5 |
| **API language** | TypeScript |
| **ORM / DB** | Prisma 7 + PostgreSQL (Neon serverless adapter) |
| **Auth** | JWT (jsonwebtoken), bcrypt, HTTP-only cookies |
| **Validation** | Zod 4 (request body/query/params) |
| **File storage** | Backblaze B2 via AWS SDK (S3 client + presigner) |
| **Web framework** | Next.js 16 (App Router) |
| **Web UI** | React 19, Tailwind CSS 4 |
| **Shared** | TypeScript, `@notes-organizer/shared` package |

### Key Dependencies (API)

- `express`, `cors`, `helmet`, `cookie-parser` — HTTP server and security.
- `express-rate-limit` — 120 requests/minute per IP.
- `@prisma/client`, `@prisma/adapter-neon`, `@neondatabase/serverless`, `ws` — DB and serverless driver.
- `bcrypt` — password hashing.
- `jsonwebtoken` — access/refresh token signing and verification.
- `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` — B2 (S3-compatible) upload/download URLs.
- `zod` — schema validation.

### Key Dependencies (Web)

- `next`, `react`, `react-dom` — framework and UI.
- `tailwindcss`, `@tailwindcss/postcss` — styling.

---

## 3. Repository Structure

```
NotesOrganizer/
├── package.json                 # Root workspace config
├── application/
│   ├── api/                    # Express API
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Data model
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── app.ts          # Express app, routes, middleware
│   │   │   ├── server.ts       # Entry point, listen
│   │   │   ├── config/         # env, prisma, b2
│   │   │   ├── middleware/    # requireAuth, validate, errorHandler, rateLimit
│   │   │   ├── modules/
│   │   │   │   ├── auth/       # auth.routes, controller, service, schemas
│   │   │   │   ├── notes/     # notes.* + notes.policy (public/unlisted)
│   │   │   │   └── files/     # files.* (presign, upload, confirm, URLs, delete)
│   │   │   ├── types/         # express.d.ts (req.user)
│   │   │   └── utils/         # tokens, crypto, slug
│   │   └── package.json
│   └── web/                   # Next.js app
│       ├── src/
│       │   ├── app/            # App Router pages (/, /notes, /public, /share)
│       │   ├── components/    # Navbar, NoteCard, NoteEditor, FileUploader, etc.
│       │   ├── lib/           # api.ts, auth.ts, validators.ts
│       │   └── styles/        # theme.css, globals.css
│       └── package.json
└── packages/
    └── shared/
        ├── src/index.ts       # NoteVisibility enum (and shared types)
        └── package.json
```

---

## 4. Data Model & Database

**Database:** PostgreSQL (e.g. Neon). Connection and driver are configured in `application/api/src/config/prisma.ts` using `@prisma/adapter-neon` and `@neondatabase/serverless` with `ws` for WebSockets.

### Prisma schema (summary)

- **User**  
  - `id` (cuid), `email` (unique), `passwordHash`, `createdAt`, `updatedAt`.  
  - Relations: `notes`, `files`.

- **Note**  
  - `id` (cuid), `userId`, `title`, `content`, `visibility` (enum), `slug` (optional, unique), `shareToken` (optional, unique), `dayKey`, `createdAt`, `updatedAt`.  
  - Relations: `user`, `files`.  
  - **Visibility:** `PRIVATE` (default), `PUBLIC` (has `slug` for URL), `UNLISTED` (has `shareToken` for URL).

- **File**  
  - `id` (cuid), `userId`, `noteId` (optional), `provider`, `key`, `url` (optional), `fileName`, `mimeType`, `size`, `createdAt`.  
  - Relations: `user`, `note`.  
  - Storage: B2; `key` is the object key, `url` is optional public URL if `B2_PUBLIC_BASE_URL` is set.

### Visibility behavior

- **PRIVATE:** Only the owner can access; `slug` and `shareToken` are cleared.
- **PUBLIC:** Note appears in the public feed and is readable at `/notes/public/:slug`. A `slug` is generated from the title (plus suffix) if missing; `shareToken` is cleared.
- **UNLISTED:** Not in the public feed; readable only via `/notes/share/:token`. A `shareToken` is generated if missing; `slug` is cleared.

Slug generation uses `utils/slug.ts` (lowercase, trim, replace non-word chars, collapse spaces to single `-`, max 80 chars); uniqueness is ensured by appending the last 6 characters of the note id.

---

## 5. API Backend

### Entry and middleware order

- **`server.ts`** loads `dotenv`, imports `app`, and listens on `PORT` (default 4000).
- **`app.ts`**:
  1. `helmet()` — security headers.
  2. `express.json({ limit: "2mb" })`.
  3. `cookieParser()`.
  4. `rateLimitMiddleware` — 120 req/min, draft-7 and no legacy headers.
  5. CORS: origin from env, credentials true, methods GET/POST/PUT/DELETE/OPTIONS, specific allowed headers (including `X-File-Name`, `X-Mime-Type`, `X-File-Size`, `X-Note-Id`).
  6. `GET /health` → `{ ok: true }`.
  7. Mounted routes: `/auth`, `/notes`, `/files`.
  8. `errorHandler` — last; sends `{ ok: false, error: message }` and uses `err.status` if set (default 500).

### Middleware

- **requireAuth** — Reads `access_token` from cookies, verifies JWT with `verifyAccessToken`, sets `req.user = { id, email }`. On missing/invalid token, passes 401 to `next`.
- **validate(schema)** — Runs Zod `schema.safeParse({ body, query, params })`; on failure responds 400 with joined issue messages; on success sets `req.validated` (and parsed body/query/params are typically used from there or from `req.body`/`req.query`/`req.params` where already merged).
- **errorHandler** — Central error handler; status from `err.status` or 500; logs only 5xx in non-production.

### Module pattern

Each feature (auth, notes, files) has:

- **routes** — Router with HTTP methods, middleware (requireAuth, validate), and controller handlers.
- **controller** — Request/response handling; calls **service** (and for notes, **policy** for public/unlisted).
- **service** — Business logic and Prisma/B2 usage.
- **schemas** — Zod schemas for validation.

---

## 6. API Reference (All Endpoints)

Base URL is the API origin (e.g. `http://localhost:4000`). All JSON responses use `ok: true` on success; errors use `ok: false` and `error: string`. Auth endpoints set/clear HTTP-only cookies for `access_token` and `refresh_token`.

---

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Returns `{ ok: true }`. |

---

### Auth (`/auth`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Register a new user. |
| POST | `/auth/login` | No | Log in; sets access and refresh cookies. |
| POST | `/auth/logout` | No | Clears auth cookies and sends Clear-Site-Data. |
| POST | `/auth/refresh` | No (cookie) | Uses `refresh_token` cookie to issue a new access token and set cookie. |
| GET | `/auth/me` | Yes | Returns current user (id, email, createdAt). |

**POST /auth/register**  
- **Body:** `{ email: string (email), password: string (min 8) }`.  
- **Logic:** Check email not already used (409 if exists). Hash password with bcrypt (10 rounds). Create user; return `{ ok: true, user: { id, email, createdAt } }`.

**POST /auth/login**  
- **Body:** `{ email, password }` (same validation as register).  
- **Logic:** Find user by email; compare password with bcrypt. If invalid, 401. Else sign access (short-lived) and refresh (long-lived) JWTs; set `access_token` and `refresh_token` cookies; return `{ ok: true, user: { id, email } }`.

**POST /auth/logout**  
- Clears `access_token` and `refresh_token` (same path/sameSite/secure as set); optional Clear-Site-Data; returns `{ ok: true }`.

**POST /auth/refresh**  
- Reads `refresh_token` from cookies; verifies JWT; signs new access token; sets `access_token` cookie; returns `{ ok: true }`. 401 if no or invalid refresh token.

**GET /auth/me**  
- **Auth:** Cookie `access_token`.  
- **Response:** `{ ok: true, user: { id, email, createdAt } }`.

---

### Notes (`/notes`)

Public routes are defined first so they are not matched as `:id`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/notes/public/:slug` | No | Get a single public note by slug. |
| GET | `/notes/public` | No | List public notes (feed). |
| GET | `/notes/share/:token` | No | Get a single unlisted note by share token. |
| POST | `/notes` | Yes | Create a note. |
| GET | `/notes` | Yes | List current user’s notes (optional search and dayKey). |
| GET | `/notes/:id` | Yes | Get one note (with files). |
| PUT | `/notes/:id` | Yes | Update note (title, content, dayKey). |
| DELETE | `/notes/:id` | Yes | Delete note; detach files (noteId → null). |
| PUT | `/notes/:id/visibility` | Yes | Set visibility (PRIVATE / PUBLIC / UNLISTED). |

**GET /notes/public/:slug**  
- **Params:** `slug` (min length 1).  
- **Logic:** `notes.policy.getPublicNoteBySlug(slug)` — find note where `slug` matches and `visibility === "PUBLIC"`; include files. 404 if not found.  
- **Response:** `{ ok: true, note }`.

**GET /notes/public**  
- **Logic:** `notes.service.listPublicNotes()` — find notes where `visibility === "PUBLIC"` and `slug` is not null; order by `updatedAt` desc; limit 100; select id, title, dayKey, slug, createdAt, updatedAt, user.email.  
- **Response:** `{ ok: true, notes }`.

**GET /notes/share/:token**  
- **Params:** `token` (min length 10).  
- **Logic:** `notes.policy.getUnlistedNoteByToken(token)` — find note where `shareToken === token` and `visibility === "UNLISTED"`; include files. 404 if not found.  
- **Response:** `{ ok: true, note }`.

**POST /notes**  
- **Auth:** Required.  
- **Body:** `{ title (1–200), content (default ""), dayKey (YYYY-MM-DD) }`.  
- **Logic:** `notes.service.createNote(userId, title, content, dayKey)`.  
- **Response:** `{ ok: true, note }` (full note).

**GET /notes**  
- **Auth:** Required.  
- **Query:** `q` (optional search string), `dayKey` (optional).  
- **Logic:** `notes.service.listNotes(userId, q, dayKey)` — filter by userId; optional dayKey; optional case-insensitive search on title and content; order by updatedAt desc; take 100; select id, title, visibility, dayKey, slug, createdAt, updatedAt.  
- **Response:** `{ ok: true, notes }`.

**GET /notes/:id**  
- **Auth:** Required.  
- **Logic:** `notes.service.getNote(userId, id)` — must belong to user; include files. 404 if not found.  
- **Response:** `{ ok: true, note }`.

**PUT /notes/:id**  
- **Auth:** Required.  
- **Body:** optional `title`, `content`, `dayKey` (same formats as create).  
- **Logic:** Ensure note exists and belongs to user; update; include files.  
- **Response:** `{ ok: true, note }`.

**DELETE /notes/:id**  
- **Auth:** Required.  
- **Logic:** Ensure note exists and belongs to user; set `noteId` to null for all linked files; delete note.  
- **Response:** `{ ok: true }`.

**PUT /notes/:id/visibility**  
- **Auth:** Required.  
- **Body:** `{ visibility: "PRIVATE" | "PUBLIC" | "UNLISTED" }`.  
- **Logic:** Ensure note exists and belongs to user. If PUBLIC: set/ensure slug (from title + id suffix), clear shareToken. If UNLISTED: set/ensure shareToken (random 24-byte base64url), clear slug. If PRIVATE: clear slug and shareToken.  
- **Response:** `{ ok: true, note }`.

---

### Files (`/files`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/files/presign` | Yes | Get presigned URL for client-side upload to B2. |
| POST | `/files/confirm` | Yes | Confirm a client-side upload (create DB record). |
| POST | `/files/upload` | Yes | Direct upload: body = raw file bytes; metadata in headers. |
| GET | `/files/:id/preview-url` | Yes | Get time-limited URL to view file inline. |
| GET | `/files/:id/download-url` | Yes | Get time-limited URL to download file. |
| DELETE | `/files/:id` | Yes | Delete file from B2 and DB. |

**POST /files/presign**  
- **Body:** `{ fileName (1–255), mimeType (1–255), size (int, 1–50MB), noteId (optional) }`.  
- **Logic:** If noteId provided, verify note exists and belongs to user. Build object key: `userId/ timestamp-randomToken(10)-sanitizedFileName`. Create S3 PutObjectCommand; generate presigned URL (5 min).  
- **Response:** `{ ok: true, key, uploadUrl }`.

**POST /files/confirm**  
- **Body:** `{ key, fileName, mimeType, size, noteId (optional) }`.  
- **Logic:** Same noteId ownership check. Create `File` in DB with provider `"b2"`, key, optional public URL from `B2_PUBLIC_BASE_URL`, fileName, mimeType, size.  
- **Response:** `{ ok: true, file }`.

**POST /files/upload**  
- **Headers:** `X-File-Name` (required), `X-Mime-Type` (default application/octet-stream), `X-File-Size` (optional), `X-Note-Id` (optional). Body: raw binary (max 20MB via `express.raw`).  
- **Logic:** Validate headers and body (Buffer); optional size check. If noteId, verify ownership. Same key generation and B2 PutObject; then create `File` record.  
- **Response:** `{ ok: true, file }`.

**GET /files/:id/preview-url**  
- **Logic:** Load file by id and userId; 404 if not found. Build GetObjectCommand with `ResponseContentDisposition: inline; filename="..."` and `ResponseContentType`. Return presigned URL (5 min).  
- **Response:** `{ ok: true, file, previewUrl }`.

**GET /files/:id/download-url**  
- **Logic:** Same ownership check; GetObjectCommand without disposition override.  
- **Response:** `{ ok: true, file, downloadUrl }`.

**DELETE /files/:id**  
- **Logic:** Load file by id and userId; 404 if not found. Delete object from B2; delete `File` row.  
- **Response:** `{ ok: true }`.

---

## 7. Web Frontend

### Stack and structure

- **Next.js 16** with App Router.
- **React 19**; client components use `"use client"`.
- **Tailwind CSS 4**; global and theme styles in `globals.css` and `theme.css`.
- **API client:** `lib/api.ts` — `api(path, options)` uses `NEXT_PUBLIC_API_BASE_URL`, sends credentials (cookies), supports `json` and `body`, returns parsed JSON or throws on non-ok response.
- **Auth helpers:** `lib/auth.ts` — `getMe()`, `login()`, `register()`, `logout()` calling `/auth/*`.

### Routes and pages

| Route | Purpose |
|-------|--------|
| `/` | Home: hero, feature cards, HomeActions (Open Notes / Login / Register based on auth). |
| `/notes` | My Notes: list with search; New Note link; NoteCard per note with delete. Requires auth; redirects to `/notes/login` on 401. |
| `/notes/new` | Create note form (title, dayKey, content); POST `/notes` then redirect to `/notes/[id]`. |
| `/notes/[id]` | Note detail: view/edit toggle, VisibilitySelect, FileUploader; GET/PUT note, PUT visibility. |
| `/notes/login` | Login form; on success dispatches `auth:changed`, redirects to `/notes`. |
| `/notes/register` | Register form; on success logs in and redirects to `/notes`. |
| `/public` | Public feed: GET `/notes/public`; list of public notes with links to `/public/[slug]`. |
| `/public/[slug]` | Single public note: GET `/notes/public/:slug`; title, dayKey, content. |
| `/share/[token]` | Unlisted note: GET `/notes/share/:token`; same display as public note. |

### Key components

- **Navbar** — Brand, Profile (home), Notes (if authenticated), Public, ThemeToggle, email + Logout or Login + Register. Listens to `auth:changed` and calls `getMe()` to sync state.
- **HomeActions** — If logged in: “Open Notes”; else Login + Register links.
- **NoteCard** — Title link to `/notes/[id]`, dayKey, visibility; optional Delete button.
- **NoteEditor** — Controlled title and content inputs; Save / Cancel; calls `onSave({ title, content })`.
- **VisibilitySelect** — Dropdown PRIVATE/PUBLIC/UNLISTED; shows share link when PUBLIC or UNLISTED; calls `onChange(visibility)`.
- **FileUploader** — Upload via POST `/files/upload` (raw body + X-File-Name, X-Mime-Type, X-File-Size, X-Note-Id). Lists files; Preview (GET preview-url, open in modal or iframe / Office viewer); Delete.
- **ThemeToggle** — Toggles `document.documentElement.classList` and `localStorage.theme` (light/dark).

### Auth flow (web)

- Login/Register set cookies via API; page dispatches `auth:changed` and redirects.
- Navbar and protected pages use `getMe()` with `credentials: "include"`; on 401 they redirect to `/notes/login`.
- Refresh can be implemented by calling POST `/auth/refresh` when access token expires (e.g. on 401) before redirecting to login.

---

## 8. Authentication & Security

- **Passwords:** bcrypt with 10 rounds; only hash is stored.
- **Tokens:** JWT access (short, e.g. 15m) and refresh (long, e.g. 30d); secrets and expiry from env. Payload: `{ sub: userId, email }`.
- **Cookies:** HTTP-only, secure in production, sameSite `none` (production) / `lax` (dev); path `/`. Logout clears cookies and can send Clear-Site-Data.
- **Authorization:** Protected routes use `requireAuth`; notes and files are scoped by `req.user.id`.
- **Rate limit:** 120 requests per minute per IP.
- **CORS:** Single origin from env, credentials allowed; methods and headers restricted as listed above.
- **Validation:** All mutation inputs validated with Zod; invalid requests get 400.

---

## 9. File Storage (Backblaze B2)

- **Provider:** Backblaze B2, accessed via AWS SDK S3 client and `getSignedUrl` (presigner).
- **Config:** `config/b2.ts` builds S3Client from env (endpoint, region, credentials, bucket). `isB2Configured` is true when required B2 env vars are set.
- **Key format:** `userId/timestamp-randomToken(10)-sanitizedFileName` (sanitize: replace non-word chars except `. - ( )` and space with `_`).
- **Flows:**  
  - **Presign:** API returns presigned PUT URL; client uploads to B2; then client calls **confirm** to create the `File` row.  
  - **Direct upload:** Client sends raw body to POST `/files/upload`; API uploads to B2 and creates `File` in one step.
- **Preview/Download:** Presigned GET URLs (5 min) with optional `ResponseContentDisposition` and `ResponseContentType` for inline preview.
- **Delete:** DeleteObject in B2 then delete `File` row.

---

## 10. Environment & Configuration

### API (`application/api`)

- **.env** (and `dotenv/config` in server and prisma config):
  - `NODE_ENV`, `PORT` (default 4000)
  - `CORS_ORIGIN` (required)
  - `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` (min 20 chars), `ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`
  - `DATABASE_URL` (required)
  - `B2_S3_ENDPOINT`, `B2_REGION`, `B2_ACCESS_KEY_ID`, `B2_SECRET_ACCESS_KEY`, `B2_BUCKET`, `B2_PUBLIC_BASE_URL` (all optional; B2 features disabled if not set)

Validated at boot via `config/env.ts` (Zod).

### Web (`application/web`)

- **.env.local:**
  - `NEXT_PUBLIC_API_BASE_URL` — full API base URL (required by `lib/api.ts`).

---

## 11. Running the Project

- **From repo root:**
  - `npm run dev:api` — start API (ts-node-dev, default port 4000).
  - `npm run dev:web` — start Next.js dev server.
  - `npm run build` — build all workspaces.
  - `npm run build:api` — build shared + API.
- **API:** Ensure PostgreSQL is available and `DATABASE_URL` is set; run `prisma migrate deploy` (or `npx prisma migrate dev` in development) and `prisma generate` in `application/api`.
- **Web:** Set `NEXT_PUBLIC_API_BASE_URL` to the API base (e.g. `http://localhost:4000`) so the frontend can call the backend with credentials.

---

This document reflects the codebase as of the latest review and can be updated as new endpoints or features are added.
