# Cat Foster Organization Website — Template Design

**Date:** 2026-06-11
**Status:** Approved design — ready for implementation planning
**Author:** Eylul (with Claude)

## Purpose

A reusable website template for cat foster organizations. Most such orgs share
the same needs, so this is built once and cloned per organization, provided free
as a volunteer effort. The priority is that one canonical codebase can be turned
into many independent org websites with minimal effort, and that those clones can
receive upstream improvements over time.

This document specifies the **local proof-of-concept**. Hosting, CI/CD, and
deployment are explicitly out of scope for now.

## Goals

The website must let an organization:

1. Host basic info about cat fostering requirements.
2. Take foster applications (a config-driven questionnaire).
3. Show photos of cats looking for foster/adoption, browsable by the public.
4. Give staff a back-office tool to track each cat's chart (medical records, vet
   appointments, behavior, current foster parent, medication, food + portion).
5. Let foster parents submit supply requests (food, litter, medication, toys).
   Urgent matters go through the org's main phone, not the site.

## Key Decisions

### Tenancy: clone-per-org template

Each organization gets its own copy of the codebase, its own SQLite database, and
its own uploaded files. Orgs are fully isolated — no shared database, no org_id
scoping. This minimizes complexity and liability for a volunteer handing off
independent sites, and keeps each org's data (medical records, applicant info)
completely separate.

Rejected: multi-tenant SaaS. It pays off only when centrally operating many
tenants from one deployment; the cost (runtime theming, org-scoped auth on every
query, data-isolation testing) is not worth it here. A clean single-tenant app
remains the right starting point if central hosting is ever desired later.

### Update propagation: git upstream + config isolation

The canonical repo (`cat-foster-template`) is the shared upstream. Each org's site
tracks it as a git remote; the volunteer periodically runs
`git fetch upstream && git merge upstream/main` per org and redeploys. Schema
changes ship as Prisma migrations run on each org's DB during the update.

This stays painless **only because all org-specific customization lives outside the
shared code** (see "Per-clone vs shared" below). Publishing shared code as a
versioned package/Docker image is a possible future step but is overkill now.

### Tech stack: Next.js + Prisma + SQLite

- **Next.js (App Router)** — one React-based codebase, one process. Front end and
  back end (route handlers / server actions) live together. Skills from the React
  ecosystem transfer directly.
- **SQLite** — each org's entire database is a single file. No DB server to run per
  clone; trivial to back up and host for free. More than enough for one org's data
  volume. Prisma allows switching to Postgres later with minimal code change.
- **Prisma** — typed data access plus a built-in migrations system (the "run on
  update" ritual).

Rejected: React+Express+Postgres (the author's familiar LittlePlan stack) — heavier
per clone (separate backend + Postgres server). Next.js+Postgres — unnecessary DB
server for single-org traffic.

### Roles & auth: staff-only logins for the POC

- **Public visitors** — no login. Browse info, view cats, submit a foster
  application, submit a supply request.
- **Org staff** — the only accounts that log in. Manage everything in the back
  office.
- **Foster parents** — no logins in the POC. They are records managed by staff;
  supply requests come through a public form. Foster-parent logins can be added
  later.

Auth uses **Auth.js (NextAuth) Credentials provider** — email + bcrypt-hashed
password, cookie session. Standard for Next.js, handles CSRF/cookies, and leaves
room for foster logins or Google SSO later. The initial staff account is created
by a seed script from env vars.

## Architecture

One Next.js App Router application with Prisma + SQLite. The structure isolates
everything org-specific so the shared code stays a clean mergeable upstream.

```
cat-foster-template/
├─ org.config.ts          ← ALL org customization: name, logo path, colors,
│                            phone, email, fostering-requirements text,
│                            application questions. The file each org edits.
├─ public/org/            ← org's logo + branding images (per-clone)
├─ prisma/
│  ├─ schema.prisma       ← data model (shared)
│  └─ migrations/         ← versioned migrations (run on update)
├─ data/                  ← SQLite file (per-clone, gitignored)
├─ public/uploads/cats/   ← uploaded cat photos (per-clone, gitignored)
├─ src/app/
│  ├─ (public)/           ← public site
│  └─ admin/              ← staff back office (auth-gated)
├─ src/components/        ← shared UI
├─ src/lib/               ← db client, auth, helpers
└─ src/server/            ← data-access functions
```

### Theming

`org.config.ts` exports a typed config object. Colors feed Tailwind via CSS
variables, so editing one file re-skins the whole site. Text content (fostering
requirements, contact info, application questions) is read from the same config.
**Making a new org's site = clone, edit `org.config.ts`, drop in the logo, run.**
No code is touched.

### Per-clone vs shared

- **Shared (mergeable upstream):** all code + `prisma/schema.prisma`.
- **Per-clone:** `org.config.ts`, `public/org/`, the SQLite file in `data/`, and
  uploaded photos in `public/uploads/cats/`.

This split is what keeps `git merge upstream/main` painless.

## Data Model

Prisma schema. SQLite has no native enums, so status fields are strings with
documented allowed values. The `Cat` is the hub.

### Core: `Cat`

- Public: `name`, `slug`, `species`, `breed`, `age`, `sex`, `publicBio`,
  `status` (`"available" | "pending" | "adopted" | "not_listed"`)
- Back-office: `intakeDate`, `behaviorNotes`, `foodType`, `foodPortion`,
  `currentFosterParentId`
- Relations: `photos[]`, `medicalRecords[]`, `vetAppointments[]`,
  `medications[]`, `supplyRequests[]`

### Chart sub-records (one-to-many off `Cat`)

- **`CatPhoto`** — `url`, `caption`, `isPrimary` (gallery uses primary; chart shows
  all)
- **`MedicalRecord`** — `date`, `type`, `description`, `vetName`
- **`VetAppointment`** — `datetime`, `reason`, `location`,
  `status` (`"scheduled" | "completed" | "cancelled"`), `notes`
- **`Medication`** — `name`, `dosage`, `schedule`, `startDate`, `endDate`,
  `isActive`

### People

- **`FosterParent`** — `name`, `email`, `phone`, `address`, `notes`; has `cats[]`
  and `supplyRequests[]`. Managed by staff (no login).
- **`StaffUser`** — `email`, `passwordHash`, `name`. The only login accounts.

### Intake (from public forms)

- **`FosterApplication`** — `applicantName`, `email`, `phone`, `address`,
  `answers` (JSON keyed by the question IDs in `org.config.ts`),
  `status` (`"new" | "reviewing" | "approved" | "declined"`), `staffNotes`,
  `createdAt`
- **`SupplyRequest`** — `fosterParentId` (or typed name fallback), `catId`
  (optional), `items` (JSON list of `{type, quantity}`), `notes`,
  `status` (`"new" | "in_progress" | "fulfilled"`), `createdAt`

**YAGNI calls:** application answers and supply items are JSON blobs, not separate
tables — flexible per-org content read/displayed as a unit. Normalize later only if
a feature needs to query inside them.

## Pages

### Public site (`src/app/(public)/`)

- `/` — home: branding, intro, CTAs to foster & view cats
- `/foster` — fostering requirements (text from `org.config`) + apply button
- `/apply` — foster application form (questions rendered from `org.config`)
- `/cats` — adoptable cat gallery (cards: primary photo, name, status)
- `/cats/[slug]` — public cat profile (photos, bio)
- `/request` — foster supply request form (pick foster + cat, list items)
- Org phone/email/branding in header & footer, from config

### Back office (`src/app/admin/`, auth-gated)

- `/admin/login`
- `/admin` — dashboard: new applications & open supply requests at a glance
- `/admin/cats` + `/admin/cats/[id]` — cat list and full chart (edit fields,
  upload photos, add medical records / vet appointments / medications)
- `/admin/applications` — review applications, change status, add notes
- `/admin/requests` — manage supply requests, change status
- `/admin/fosters` — manage foster parents

### Image uploads

Stored on the local filesystem (`public/uploads/cats/`), path saved in `CatPhoto`.
Fine for the POC; swappable for cloud storage later.

## Build Phasing

Each phase is independently demoable.

- **Phase 0 — Scaffold:** Next.js + Tailwind + Prisma + SQLite, `org.config` +
  theming wired, base layout/header/footer, seed script, test harness.
- **Phase 1 — Public site:** home, foster info, gallery + cat detail (on seeded
  data), application form, supply request form.
- **Phase 2 — Auth + admin shell:** staff login, gated admin layout, dashboard.
- **Phase 3 — Cat charts:** cat CRUD + chart sub-records + photo upload + foster
  parents.
- **Phase 4 — Intake:** applications & supply-request management.

## Testing

Vitest + React Testing Library, set up from Phase 0. Follow TDD on data-access
functions and form/auth logic (the parts with real behavior); keep purely
presentational bits light. A demoable POC at the end of each phase.

## Out of Scope (for now)

- Hosting, CI/CD, deployment.
- Foster-parent logins.
- Cloud image storage.
- Multi-tenant operation.
- Email/SMS notifications.
