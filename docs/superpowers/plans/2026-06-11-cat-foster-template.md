# Cat Foster Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable, clone-per-org Next.js website template for cat foster organizations: public info + cat gallery + foster application + supply requests, plus a staff back office for cat charts and intake management.

**Architecture:** One Next.js 16 App Router app with Prisma 7 + SQLite (better-sqlite3 driver adapter). All org-specific customization lives in `org.config.ts` + `public/org/` + the gitignored `prisma/dev.db` and `public/uploads/`, so shared code stays a clean mergeable upstream. Auth.js v5 Credentials provider gates `/admin`. Data access lives in `src/server/`; mutations are server actions validated with Zod.

**Tech Stack:** Next.js 16 (App Router, RSC + server actions), React 19, TypeScript, Tailwind CSS v4, Prisma 7 + `@prisma/adapter-better-sqlite3` + SQLite, Auth.js v5 (`next-auth@beta`), `bcryptjs`, Zod 4, Vitest 4 + React Testing Library + jsdom.

---

## Conventions (read before starting)

**Working directory:** All commands run from the repo root `/Users/eylulaygun/Documents/GitHub/cat-foster-template` unless stated otherwise.

**Prisma 7 specifics (these differ from older Prisma — follow exactly):**
- Generator is `prisma-client` (NOT `prisma-client-js`) with a **required** `output` path. We generate to `src/generated/prisma`.
- The query engine is gone; a **driver adapter is mandatory**. We use `@prisma/adapter-better-sqlite3`.
- Config lives in `prisma.config.ts`; the `datasource` `url` is set there via `env("DATABASE_URL")`, NOT in `schema.prisma`.
- Import the client from the generated path: `import { PrismaClient } from "@/generated/prisma/client"`.

**SQLite has no enums:** status fields are `String` with allowed values documented in the schema comments and enforced by Zod at the edge.

**Testing model (per spec):** TDD the parts with real behavior — data-access functions (`src/server/`), Zod schemas, server actions, and auth `authorize`. Keep purely presentational components light (render smoke tests only). Async server components are not unit-tested; their data-access functions are.

**Test database:** Tests run against a separate SQLite file `prisma/test.db` configured by `.env.test`. A Vitest global setup resets its schema with `prisma db push --force-reset`; a `resetDb()` helper truncates tables before each data test.

**Commit style:** Conventional commits (`feat:`, `test:`, `chore:`). Commit at the end of each task (and at the TDD commit steps). Never use `cd repoRoot && ...`; run commands directly.

---

## Design & Accessibility Principles (apply to every UI task)

The audience is the general public aged **18–80**, including non-technical and older users. Keep it **clean, simple, and easy**. These rules are requirements, not suggestions — apply them in every component/page task and check them during review:

- **Readable type:** body/content text is **≥16px** (Tailwind `text-base`+). Reserve `text-sm`/`text-xs` for true metadata (timestamps, helper hints), never for primary content, labels, or actions.
- **High contrast:** dark ink (`text-ink` / `#1f2937`) on light backgrounds; meet **WCAG AA (4.5:1)**. No light-gray text for anything meant to be read.
- **Large targets:** interactive elements (buttons, links-as-buttons, inputs, selects) are **≥44px tall** with comfortable padding and spacing. Avoid cramped inline controls.
- **Don't rely on color alone:** every status uses a **text label** (e.g. "Available", "scheduled"), not just a colored dot — supports color-blind and older users.
- **Real labels everywhere:** every form field has a visible, associated `<label>` (`htmlFor`/`id`). No placeholder-as-label. This is already the pattern in the form tasks — keep it.
- **Plain language, one task per screen:** short forms, one clear primary button per page, no jargon. Error messages are plain and sit next to the field (the `fieldErrors` pattern already supports this).
- **Visible focus & keyboard support:** keep default focus rings (do not remove outlines); ensure tab order is logical.
- **Predictable, consistent layout:** same header/footer/admin-nav on every page; generous whitespace; avoid dense tables where a simple list works.

Visual reference (look & feel approved): `docs/design/ui-mockup.html`. Note: copy strings in the mockup and in `org.config.ts` are placeholders to be replaced per org.

---

## File Structure

Created across the plan (per-clone files marked ⊘ are gitignored):

```
cat-foster-template/
├─ org.config.ts                 ← ALL org customization (Task 5)
├─ prisma.config.ts              ← Prisma 7 config (Task 3)
├─ prisma/
│  ├─ schema.prisma              ← data model, shared (Task 3)
│  ├─ migrations/                ← versioned migrations (Task 3+)
│  ├─ seed.ts                    ← staff user + sample cats (Task 8)
│  ├─ dev.db                     ⊘ per-clone SQLite file
│  └─ test.db                    ⊘ test SQLite file
├─ public/
│  ├─ org/                       ← logo + branding (per-clone)
│  └─ uploads/cats/              ⊘ uploaded cat photos (Task 25)
├─ src/
│  ├─ generated/prisma/          ⊘ generated Prisma client (Task 3)
│  ├─ org.ts                     ← re-export + theming helpers (Task 6)
│  ├─ auth.ts                    ← Auth.js config (Task 18)
│  ├─ middleware.ts              ← admin gating (Task 20)
│  ├─ lib/
│  │  ├─ db.ts                   ← Prisma singleton (Task 4)
│  │  ├─ password.ts             ← bcrypt hash/verify (Task 18)
│  │  └─ validation.ts           ← shared Zod helpers (Task 14)
│  ├─ server/
│  │  ├─ cats.ts                 ← cat data-access (Task 9, 22, 23)
│  │  ├─ photos.ts               ← photo upload (Task 25)
│  │  ├─ chart.ts                ← medical/vet/medication (Task 26-28)
│  │  ├─ fosters.ts              ← foster parents (Task 29)
│  │  ├─ applications.ts         ← foster applications (Task 14, 30)
│  │  ├─ requests.ts             ← supply requests (Task 16, 31)
│  │  └─ dashboard.ts            ← admin counts (Task 21)
│  ├─ components/                ← shared UI (Header, Footer, CatCard, forms…)
│  └─ app/
│     ├─ layout.tsx              ← root layout + theme injection (Task 7)
│     ├─ globals.css             ← Tailwind + theme vars (Task 6)
│     ├─ (public)/               ← public site (Phase 1)
│     ├─ admin/                  ← back office (Phases 2-4)
│     └─ api/auth/[...nextauth]/route.ts  ← Auth.js handler (Task 18)
├─ .env                          ⊘ DATABASE_URL + secrets
├─ .env.test                     ← test DATABASE_URL
├─ vitest.config.ts              ← Vitest config (Task 2)
├─ vitest.setup.ts               ← jest-dom + per-test reset (Task 2, 4)
└─ vitest.global-setup.ts        ← test DB schema push (Task 2)
```

---

## Phase 0 — Scaffold

Goal: a running Next.js app with Tailwind theming driven by `org.config`, Prisma+SQLite wired, a seed script, and a green test harness. Demoable: `npm run dev` shows a themed header/footer; `npm test` passes.

### Task 1: Initialize Next.js + Tailwind + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `.gitignore`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Scaffold the app non-interactively**

Run (creates files in the current directory; the dir already contains `docs/`, so use `.`):

```bash
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm --yes
```

Expected: project files created. If it refuses because the directory is non-empty, move `docs/` aside, scaffold, then move it back:

```bash
mv docs /tmp/cft-docs
npx create-next-app@latest . --ts --app --tailwind --eslint --src-dir --import-alias "@/*" --no-turbopack --use-npm --yes
mv /tmp/cft-docs docs
```

- [ ] **Step 2: Pin and verify versions**

Run: `npm ls next react prisma tailwindcss --depth=0`
Expected: `next@16.x`, `react@19.x`, `tailwindcss@4.x` present. If `next` is older than 16, run `npm install next@latest react@latest react-dom@latest`.

- [ ] **Step 3: Replace `.gitignore` additions**

Append to `.gitignore`:

```
# Per-clone data (never commit)
/prisma/dev.db
/prisma/dev.db-journal
/prisma/test.db
/prisma/test.db-journal
/public/uploads/
/src/generated/
.env
.env*.local
```

- [ ] **Step 4: Verify dev server boots**

Run: `npm run build`
Expected: build succeeds (the default starter page compiles).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js + Tailwind + TypeScript app"
```

### Task 2: Vitest + React Testing Library harness

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`, `vitest.global-setup.ts`, `.env.test`, `src/test/example.test.ts`
- Modify: `package.json` (scripts)

- [ ] **Step 1: Install test deps**

```bash
npm install -D vitest@latest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event tsx dotenv
```

- [ ] **Step 2: Add `.env.test`**

```
DATABASE_URL="file:./test.db"
```

(Path is relative to `prisma/` per Prisma's SQLite convention — the file resolves to `prisma/test.db`.)

- [ ] **Step 3: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    env: { DATABASE_URL: "file:./test.db" },
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
});
```

- [ ] **Step 4: Write `vitest.global-setup.ts`** (resets the test DB schema once per run)

```ts
import { execSync } from "node:child_process";

export default function setup() {
  execSync("npx prisma db push --force-reset --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: "file:./test.db" },
  });
}
```

- [ ] **Step 5: Write `vitest.setup.ts`** (jest-dom matchers; DB reset added in Task 4)

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 6: Add scripts to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:push": "prisma db push",
  "db:migrate": "prisma migrate dev",
  "db:seed": "prisma db seed",
  "db:studio": "prisma studio"
}
```

- [ ] **Step 7: Write a trivial passing test `src/test/example.test.ts`**

```ts
import { describe, it, expect } from "vitest";

describe("harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 8: Run tests** (global setup will fail until Prisma exists — so temporarily skip it)

For this task only, run the test WITHOUT global setup to prove the harness:

```bash
npx vitest run --globalSetup="" src/test/example.test.ts
```

Expected: 1 passed. (Task 3 makes the full `npm test` green.)

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "test: add Vitest + RTL harness"
```

### Task 3: Prisma 7 + SQLite + schema + first migration

**Files:**
- Create: `prisma.config.ts`, `prisma/schema.prisma`, `.env`
- Generated: `src/generated/prisma/` (gitignored)

- [ ] **Step 1: Install Prisma 7 + adapter**

```bash
npm install prisma@latest @prisma/client@latest @prisma/adapter-better-sqlite3 better-sqlite3
npm install -D @types/better-sqlite3
```

- [ ] **Step 2: Create `.env`**

```
DATABASE_URL="file:./dev.db"
```

- [ ] **Step 3: Write `prisma.config.ts`**

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

- [ ] **Step 4: Write `prisma/schema.prisma`** (full data model from the spec)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Cat {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  species   String   @default("cat")
  breed     String?
  age       String?
  sex       String?
  publicBio String?
  // status: "available" | "pending" | "adopted" | "not_listed"
  status    String   @default("available")

  intakeDate            DateTime?
  behaviorNotes         String?
  foodType              String?
  foodPortion           String?
  currentFosterParentId String?
  currentFosterParent   FosterParent? @relation(fields: [currentFosterParentId], references: [id], onDelete: SetNull)

  photos         CatPhoto[]
  medicalRecords MedicalRecord[]
  vetAppointments VetAppointment[]
  medications    Medication[]
  supplyRequests SupplyRequest[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model CatPhoto {
  id        String  @id @default(cuid())
  catId     String
  cat       Cat     @relation(fields: [catId], references: [id], onDelete: Cascade)
  url       String
  caption   String?
  isPrimary Boolean @default(false)
  createdAt DateTime @default(now())
}

model MedicalRecord {
  id          String   @id @default(cuid())
  catId       String
  cat         Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  date        DateTime
  type        String
  description String
  vetName     String?
  createdAt   DateTime @default(now())
}

model VetAppointment {
  id       String   @id @default(cuid())
  catId    String
  cat      Cat      @relation(fields: [catId], references: [id], onDelete: Cascade)
  datetime DateTime
  reason   String
  location String?
  // status: "scheduled" | "completed" | "cancelled"
  status   String   @default("scheduled")
  notes    String?
  createdAt DateTime @default(now())
}

model Medication {
  id        String    @id @default(cuid())
  catId     String
  cat       Cat       @relation(fields: [catId], references: [id], onDelete: Cascade)
  name      String
  dosage    String?
  schedule  String?
  startDate DateTime?
  endDate   DateTime?
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
}

model FosterParent {
  id        String   @id @default(cuid())
  name      String
  email     String?
  phone     String?
  address   String?
  notes     String?
  cats      Cat[]
  supplyRequests SupplyRequest[]
  createdAt DateTime @default(now())
}

model StaffUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String?
  createdAt    DateTime @default(now())
}

model FosterApplication {
  id            String   @id @default(cuid())
  applicantName String
  email         String
  phone         String?
  address       String?
  // answers: JSON string keyed by question IDs in org.config.ts
  answers       String   @default("{}")
  // status: "new" | "reviewing" | "approved" | "declined"
  status        String   @default("new")
  staffNotes    String?
  createdAt     DateTime @default(now())
}

model SupplyRequest {
  id             String        @id @default(cuid())
  fosterParentId String?
  fosterParent   FosterParent? @relation(fields: [fosterParentId], references: [id], onDelete: SetNull)
  fosterNameText String?
  catId          String?
  cat            Cat?          @relation(fields: [catId], references: [id], onDelete: SetNull)
  // items: JSON string — array of { type, quantity }
  items          String        @default("[]")
  notes          String?
  // status: "new" | "in_progress" | "fulfilled"
  status         String        @default("new")
  createdAt      DateTime      @default(now())
}
```

- [ ] **Step 5: Create the initial migration + generate client**

```bash
npx prisma migrate dev --name init
```

Expected: migration `prisma/migrations/<ts>_init/` created, client generated to `src/generated/prisma/`, `prisma/dev.db` created.

- [ ] **Step 6: Make the full test harness green**

Run: `npm test`
Expected: global setup pushes schema to `prisma/test.db`, example test passes. 1 passed.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add Prisma 7 schema, SQLite, and initial migration"
```

### Task 4: Prisma client singleton + test reset helper

**Files:**
- Create: `src/lib/db.ts`, `src/test/db.ts`
- Modify: `vitest.setup.ts`
- Test: `src/test/db-connection.test.ts`

- [ ] **Step 1: Write the failing test `src/test/db-connection.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

describe("prisma singleton", () => {
  beforeEach(async () => { await resetDb(); });

  it("can write and read a StaffUser", async () => {
    await prisma.staffUser.create({
      data: { email: "a@b.com", passwordHash: "x" },
    });
    const count = await prisma.staffUser.count();
    expect(count).toBe(1);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/db-connection.test.ts`
Expected: FAIL — cannot resolve `@/lib/db` / `@/test/db`.

- [ ] **Step 3: Write `src/lib/db.ts`** (Prisma 7 driver-adapter singleton)

```ts
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Write `src/test/db.ts`** (truncate in FK-safe order)

```ts
import { prisma } from "@/lib/db";

export async function resetDb() {
  // Delete children before parents to satisfy FK constraints.
  await prisma.supplyRequest.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.vetAppointment.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.catPhoto.deleteMany();
  await prisma.fosterApplication.deleteMany();
  await prisma.cat.deleteMany();
  await prisma.fosterParent.deleteMany();
  await prisma.staffUser.deleteMany();
}
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/test/db-connection.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Prisma singleton and test DB reset helper"
```

### Task 5: `org.config.ts` typed configuration

**Files:**
- Create: `org.config.ts`, `src/types/org.ts`
- Test: `src/test/org-config.test.ts`

- [ ] **Step 1: Write the failing test `src/test/org-config.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { orgConfig } from "../org.config";

describe("orgConfig", () => {
  it("has required branding fields", () => {
    expect(orgConfig.name).toBeTruthy();
    expect(orgConfig.theme.colors.primary).toMatch(/^#/);
  });
  it("defines at least one application question with a stable id", () => {
    expect(orgConfig.application.questions.length).toBeGreaterThan(0);
    expect(orgConfig.application.questions[0].id).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/org-config.test.ts`
Expected: FAIL — cannot resolve `../org.config`.

- [ ] **Step 3: Write `src/types/org.ts`** (the typed contract)

```ts
export type QuestionType = "text" | "textarea" | "select" | "checkbox";

export interface ApplicationQuestion {
  id: string;            // stable key stored in FosterApplication.answers JSON
  label: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];    // for select
}

export interface OrgConfig {
  name: string;
  tagline: string;
  logoPath: string;      // under /public, e.g. "/org/logo.svg"
  contact: { phone: string; email: string };
  theme: {
    colors: { primary: string; secondary: string; accent: string; bg: string; fg: string };
  };
  fostering: { intro: string; requirements: string[] };
  application: { intro: string; questions: ApplicationQuestion[] };
  supplies: { itemTypes: string[] }; // selectable supply categories
}
```

- [ ] **Step 4: Write `org.config.ts`** (the file each clone edits)

```ts
import type { OrgConfig } from "@/types/org";

export const orgConfig: OrgConfig = {
  name: "Whiskers Foster Network",
  tagline: "Helping NYC cats find loving foster homes",
  logoPath: "/org/logo.svg",
  contact: { phone: "(555) 010-2030", email: "hello@example.org" },
  theme: {
    colors: {
      primary: "#7c3aed",
      secondary: "#0ea5e9",
      accent: "#f59e0b",
      bg: "#ffffff",
      fg: "#1f2937",
    },
  },
  fostering: {
    intro:
      "Fostering saves lives. You provide a temporary home; we cover medical care and supplies.",
    requirements: [
      "Be 18 or older",
      "Provide a safe indoor space",
      "Keep foster cats separate from resident pets initially",
      "Bring cats to scheduled vet appointments",
    ],
  },
  application: {
    intro: "Tell us a bit about you and your home.",
    questions: [
      { id: "housing", label: "Do you rent or own?", type: "select", required: true, options: ["Rent", "Own"] },
      { id: "landlord_ok", label: "If renting, does your landlord allow pets?", type: "select", options: ["Yes", "No", "N/A"] },
      { id: "other_pets", label: "What other pets do you have?", type: "textarea" },
      { id: "experience", label: "Describe any prior fostering experience.", type: "textarea" },
      { id: "space", label: "Can you provide a separate room if needed?", type: "checkbox" },
    ],
  },
  supplies: { itemTypes: ["Food", "Litter", "Medication", "Toys", "Other"] },
};

export default orgConfig;
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/test/org-config.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add typed org.config.ts"
```

### Task 6: Theming — CSS variables driven by org.config

**Files:**
- Create: `src/org.ts`, `src/components/ThemeStyle.tsx`
- Modify: `src/app/globals.css`
- Test: `src/test/theme.test.ts`

- [ ] **Step 1: Write the failing test `src/test/theme.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { themeCssVars } from "@/org";

describe("themeCssVars", () => {
  it("emits CSS custom properties from org colors", () => {
    const css = themeCssVars();
    expect(css).toContain("--color-primary:");
    expect(css).toContain("#7c3aed");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/test/theme.test.ts`
Expected: FAIL — cannot resolve `@/org`.

- [ ] **Step 3: Write `src/org.ts`**

```ts
import { orgConfig } from "../org.config";

export { orgConfig };
export const org = orgConfig;

export function themeCssVars(): string {
  const c = orgConfig.theme.colors;
  return [
    `--color-primary: ${c.primary};`,
    `--color-secondary: ${c.secondary};`,
    `--color-accent: ${c.accent};`,
    `--color-bg: ${c.bg};`,
    `--color-fg: ${c.fg};`,
  ].join(" ");
}
```

- [ ] **Step 4: Write `src/components/ThemeStyle.tsx`** (injects the `:root` vars; placed in `<head>`)

```tsx
import { themeCssVars } from "@/org";

export function ThemeStyle() {
  return <style>{`:root { ${themeCssVars()} }`}</style>;
}
```

- [ ] **Step 5: Replace `src/app/globals.css`** (Tailwind v4 + map theme colors to the CSS vars)

```css
@import "tailwindcss";

@theme inline {
  --color-primary: var(--color-primary);
  --color-secondary: var(--color-secondary);
  --color-accent: var(--color-accent);
  --color-bg: var(--color-bg);
  --color-fg: var(--color-fg);
}

body {
  background-color: var(--color-bg);
  color: var(--color-fg);
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npx vitest run src/test/theme.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: wire org.config colors into Tailwind theme via CSS vars"
```

### Task 7: Base layout, Header, Footer

**Files:**
- Create: `src/components/Header.tsx`, `src/components/Footer.tsx`
- Modify: `src/app/layout.tsx`
- Test: `src/components/Header.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/Header.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

describe("Header", () => {
  it("renders the org name and a cats link", () => {
    render(<Header />);
    expect(screen.getByText(/Whiskers Foster Network/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cats/i })).toHaveAttribute("href", "/cats");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/Header.test.tsx`
Expected: FAIL — cannot resolve `./Header`.

- [ ] **Step 3: Write `src/components/Header.tsx`**

```tsx
import Link from "next/link";
import { org } from "@/org";

const links = [
  { href: "/foster", label: "Foster" },
  { href: "/cats", label: "Cats" },
  { href: "/apply", label: "Apply" },
  { href: "/request", label: "Supply Request" },
];

export function Header() {
  return (
    <header className="border-b" style={{ borderColor: "var(--color-secondary)" }}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          {org.name}
        </Link>
        <ul className="flex gap-4">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="hover:underline">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: Write `src/components/Footer.tsx`**

```tsx
import { org } from "@/org";

export function Footer() {
  return (
    <footer className="mt-16 border-t p-6 text-sm" style={{ borderColor: "var(--color-secondary)" }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold">{org.name}</p>
        <p>Phone: {org.contact.phone} · Email: {org.contact.email}</p>
        <p className="mt-2 opacity-70">Urgent matters: please call our main phone line.</p>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Rewrite `src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { ThemeStyle } from "@/components/ThemeStyle";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { org } from "@/org";

export const metadata: Metadata = {
  title: org.name,
  description: org.tagline,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyle />
      </head>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl p-4">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npx vitest run src/components/Header.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add themed base layout, header, and footer"
```

### Task 8: Seed script (staff user + sample cats)

**Files:**
- Create: `prisma/seed.ts`
- Modify: `.env` (add seed staff vars)

- [ ] **Step 1: Add seed env vars to `.env`**

```
SEED_STAFF_EMAIL="staff@example.org"
SEED_STAFF_PASSWORD="changeme123"
SEED_STAFF_NAME="Org Admin"
```

- [ ] **Step 2: Write `prisma/seed.ts`**

```ts
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_STAFF_EMAIL ?? "staff@example.org";
  const password = process.env.SEED_STAFF_PASSWORD ?? "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.staffUser.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: process.env.SEED_STAFF_NAME ?? "Org Admin" },
  });

  const cats = [
    { name: "Mochi", slug: "mochi", breed: "DSH", age: "2 years", sex: "F", status: "available",
      publicBio: "Sweet and curious lap cat looking for a quiet foster home." },
    { name: "Biscuit", slug: "biscuit", breed: "Tabby", age: "8 months", sex: "M", status: "available",
      publicBio: "Playful kitten who loves feather wands." },
    { name: "Shadow", slug: "shadow", breed: "Black DMH", age: "4 years", sex: "M", status: "pending",
      publicBio: "Gentle senior, great with calm households." },
  ];

  for (const c of cats) {
    await prisma.cat.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        ...c,
        photos: { create: [{ url: "/org/sample-cat.svg", caption: c.name, isPrimary: true }] },
      },
    });
  }

  console.log("Seed complete.");
}

main().finally(async () => { await prisma.$disconnect(); });
```

- [ ] **Step 3: Install bcryptjs**

```bash
npm install bcryptjs
npm install -D @types/bcryptjs
```

- [ ] **Step 4: Run the seed**

Run: `npm run db:seed`
Expected: "Seed complete." printed; no errors.

- [ ] **Step 5: Verify data landed**

Run: `npx prisma studio` (open, confirm 1 StaffUser + 3 Cats), then stop it. Or programmatically:

```bash
node -e "process.env.DATABASE_URL='file:./dev.db'" 2>/dev/null; npx prisma db execute --stdin <<'SQL'
SELECT count(*) FROM Cat;
SQL
```

Expected: 3.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add seed script for staff user and sample cats"
```

**Phase 0 demo checkpoint:** `npm run dev` → themed header/footer render; `npm test` green.

---

## Phase 1 — Public site

Goal: the full public-facing site on seeded data — home, foster info, cat gallery + detail, application form, supply request form. Demoable: a visitor can browse cats and submit both forms; submissions land in the DB.

### Task 9: Cat data-access functions (TDD)

**Files:**
- Create: `src/server/cats.ts`
- Test: `src/server/cats.test.ts`

- [ ] **Step 1: Write the failing test `src/server/cats.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { getPublicCats, getCatBySlug } from "./cats";

beforeEach(async () => { await resetDb(); });

async function makeCat(over: Partial<{ name: string; slug: string; status: string }> = {}) {
  return prisma.cat.create({
    data: {
      name: over.name ?? "Mochi",
      slug: over.slug ?? "mochi",
      status: over.status ?? "available",
    },
  });
}

describe("getPublicCats", () => {
  it("returns available and pending cats, not not_listed", async () => {
    await makeCat({ slug: "a", status: "available" });
    await makeCat({ slug: "b", status: "pending" });
    await makeCat({ slug: "c", status: "not_listed" });
    const cats = await getPublicCats();
    expect(cats.map((c) => c.slug).sort()).toEqual(["a", "b"]);
  });

  it("includes the primary photo when present", async () => {
    const cat = await makeCat({ slug: "withphoto" });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/x.jpg", isPrimary: true } });
    const cats = await getPublicCats();
    expect(cats[0].primaryPhotoUrl).toBe("/x.jpg");
  });
});

describe("getCatBySlug", () => {
  it("returns the cat with all photos", async () => {
    const cat = await makeCat({ slug: "mochi" });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/1.jpg", isPrimary: true } });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/2.jpg" } });
    const found = await getCatBySlug("mochi");
    expect(found?.photos).toHaveLength(2);
  });

  it("returns null for a not_listed cat", async () => {
    await makeCat({ slug: "hidden", status: "not_listed" });
    expect(await getCatBySlug("hidden")).toBeNull();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/server/cats.test.ts`
Expected: FAIL — cannot resolve `./cats`.

- [ ] **Step 3: Write `src/server/cats.ts`**

```ts
import "server-only";
import { prisma } from "@/lib/db";

const PUBLIC_STATUSES = ["available", "pending", "adopted"];

export async function getPublicCats() {
  const cats = await prisma.cat.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });
  return cats.map((c) => ({
    ...c,
    primaryPhotoUrl: c.photos[0]?.url ?? null,
  }));
}

export async function getCatBySlug(slug: string) {
  const cat = await prisma.cat.findUnique({
    where: { slug },
    include: { photos: { orderBy: { isPrimary: "desc" } } },
  });
  if (!cat || cat.status === "not_listed") return null;
  return cat;
}
```

> Note: `import "server-only"` guards against accidental client import. Install it in Step 4 if not already present.

- [ ] **Step 4: Ensure `server-only` is available**

```bash
npm install server-only
```

- [ ] **Step 5: Run it to verify it passes**

Run: `npx vitest run src/server/cats.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add public cat data-access functions"
```

### Task 10: Home page

**Files:**
- Create: `src/app/(public)/page.tsx`
- Modify: delete the starter `src/app/page.tsx`

- [ ] **Step 1: Remove the starter page**

```bash
git rm src/app/page.tsx
```

- [ ] **Step 2: Write `src/app/(public)/page.tsx`**

```tsx
import Link from "next/link";
import { org } from "@/org";

export default function HomePage() {
  return (
    <section className="py-12 text-center">
      <h1 className="text-4xl font-bold" style={{ color: "var(--color-primary)" }}>{org.name}</h1>
      <p className="mt-4 text-lg opacity-80">{org.tagline}</p>
      <div className="mt-8 flex justify-center gap-4">
        <Link href="/foster" className="rounded px-5 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>
          Become a Foster
        </Link>
        <Link href="/cats" className="rounded border px-5 py-2" style={{ borderColor: "var(--color-primary)" }}>
          Meet the Cats
        </Link>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: builds; `/` route present in output.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add public home page"
```

### Task 11: Foster info page

**Files:**
- Create: `src/app/(public)/foster/page.tsx`

- [ ] **Step 1: Write `src/app/(public)/foster/page.tsx`**

```tsx
import Link from "next/link";
import { org } from "@/org";

export default function FosterPage() {
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Fostering</h1>
      <p className="mt-4">{org.fostering.intro}</p>
      <h2 className="mt-8 text-xl font-semibold">Requirements</h2>
      <ul className="mt-2 list-disc pl-6">
        {org.fostering.requirements.map((r) => <li key={r}>{r}</li>)}
      </ul>
      <Link href="/apply" className="mt-8 inline-block rounded px-5 py-2 text-white"
        style={{ backgroundColor: "var(--color-primary)" }}>
        Apply to Foster
      </Link>
    </section>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `/foster` route present.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add foster info page"
```

### Task 12: Cat gallery page + CatCard

**Files:**
- Create: `src/components/CatCard.tsx`, `src/app/(public)/cats/page.tsx`
- Test: `src/components/CatCard.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/CatCard.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatCard } from "./CatCard";

describe("CatCard", () => {
  it("links to the cat detail and shows name + status", () => {
    render(<CatCard name="Mochi" slug="mochi" status="available" primaryPhotoUrl="/x.jpg" />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/cats/mochi");
    expect(screen.getByText("Mochi")).toBeInTheDocument();
    expect(screen.getByText(/available/i)).toBeInTheDocument();
  });

  it("falls back to a placeholder when no photo", () => {
    render(<CatCard name="Biscuit" slug="biscuit" status="pending" primaryPhotoUrl={null} />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/org/sample-cat.svg");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/CatCard.test.tsx`
Expected: FAIL — cannot resolve `./CatCard`.

- [ ] **Step 3: Write `src/components/CatCard.tsx`**

```tsx
import Link from "next/link";

export interface CatCardProps {
  name: string;
  slug: string;
  status: string;
  primaryPhotoUrl: string | null;
}

export function CatCard({ name, slug, status, primaryPhotoUrl }: CatCardProps) {
  return (
    <Link href={`/cats/${slug}`} className="block overflow-hidden rounded-lg border hover:shadow-md">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={primaryPhotoUrl ?? "/org/sample-cat.svg"} alt={name} className="h-48 w-full object-cover" />
      <div className="p-3">
        <p className="font-semibold">{name}</p>
        <span className="text-sm capitalize opacity-70">{status}</span>
      </div>
    </Link>
  );
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/components/CatCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Write `src/app/(public)/cats/page.tsx`** (async server component)

```tsx
import { getPublicCats } from "@/server/cats";
import { CatCard } from "@/components/CatCard";

export default async function CatsPage() {
  const cats = await getPublicCats();
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Cats Looking for Homes</h1>
      {cats.length === 0 ? (
        <p className="mt-6 opacity-70">No cats are listed right now. Please check back soon.</p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cats.map((c) => (
            <CatCard key={c.id} name={c.name} slug={c.slug} status={c.status} primaryPhotoUrl={c.primaryPhotoUrl} />
          ))}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add cat gallery page and CatCard"
```

### Task 13: Cat detail page

**Files:**
- Create: `src/app/(public)/cats/[slug]/page.tsx`

- [ ] **Step 1: Write `src/app/(public)/cats/[slug]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import { getCatBySlug } from "@/server/cats";

export default async function CatDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cat = await getCatBySlug(slug);
  if (!cat) notFound();

  return (
    <article className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{cat.name}</h1>
      <p className="mt-1 capitalize opacity-70">
        {[cat.breed, cat.age, cat.sex].filter(Boolean).join(" · ")} — {cat.status}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3">
        {cat.photos.map((p) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt={p.caption ?? cat.name} className="h-48 w-full rounded object-cover" />
        ))}
        {cat.photos.length === 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/org/sample-cat.svg" alt={cat.name} className="h-48 w-full rounded object-cover" />
        )}
      </div>
      {cat.publicBio && <p className="mt-6 max-w-prose">{cat.publicBio}</p>}
    </article>
  );
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: `/cats/[slug]` dynamic route present.

- [ ] **Step 3: Manual smoke (optional)**

Run: `npm run dev`, visit `/cats/mochi`. Expected: Mochi's profile renders. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add public cat detail page"
```

### Task 14: Foster application — Zod schema + submit action (TDD)

**Files:**
- Create: `src/lib/validation.ts`, `src/server/applications.ts`
- Test: `src/server/applications.test.ts`

- [ ] **Step 1: Write the failing test `src/server/applications.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { createApplication } from "./applications";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("createApplication", () => {
  it("rejects when applicantName is missing", async () => {
    const res = await createApplication(form({ email: "a@b.com" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.applicantName).toBeTruthy();
    expect(await prisma.fosterApplication.count()).toBe(0);
  });

  it("rejects an invalid email", async () => {
    const res = await createApplication(form({ applicantName: "Pat", email: "notanemail" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.email).toBeTruthy();
  });

  it("stores answers keyed by org question ids as JSON", async () => {
    const res = await createApplication(
      form({ applicantName: "Pat", email: "pat@example.com", "q_housing": "Rent", "q_experience": "lots" }),
    );
    expect(res.ok).toBe(true);
    const app = await prisma.fosterApplication.findFirstOrThrow();
    expect(app.status).toBe("new");
    const answers = JSON.parse(app.answers);
    expect(answers.housing).toBe("Rent");
    expect(answers.experience).toBe("lots");
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/server/applications.test.ts`
Expected: FAIL — cannot resolve `./applications`.

- [ ] **Step 3: Write `src/lib/validation.ts`** (shared shape for action results)

```ts
export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

import { z } from "zod";

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
```

- [ ] **Step 4: Write `src/server/applications.ts`** (the `createApplication` action; admin functions added in Task 30)

```ts
"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { org } from "@/org";
import { type ActionResult, fieldErrors } from "@/lib/validation";

const baseSchema = z.object({
  applicantName: z.string().min(1, "Your name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export async function createApplication(formData: FormData): Promise<ActionResult> {
  const parsed = baseSchema.safeParse({
    applicantName: formData.get("applicantName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  // Collect configured questions from `q_<id>` form fields.
  const answers: Record<string, string> = {};
  for (const q of org.application.questions) {
    const raw = formData.get(`q_${q.id}`);
    if (q.required && (raw == null || String(raw).trim() === "")) {
      return { ok: false, errors: { [`q_${q.id}`]: `${q.label} is required` } };
    }
    if (raw != null) answers[q.id] = String(raw);
  }

  const created = await prisma.fosterApplication.create({
    data: {
      applicantName: parsed.data.applicantName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      answers: JSON.stringify(answers),
      status: "new",
    },
  });
  return { ok: true, id: created.id };
}
```

- [ ] **Step 5: Ensure Zod is installed**

```bash
npm install zod
```

- [ ] **Step 6: Run it to verify it passes**

Run: `npx vitest run src/server/applications.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add foster application submit action with validation"
```

### Task 15: Foster application form UI

**Files:**
- Create: `src/components/ApplicationForm.tsx`, `src/app/(public)/apply/page.tsx`
- Test: `src/components/ApplicationForm.test.tsx`

- [ ] **Step 1: Write the failing test `src/components/ApplicationForm.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ApplicationForm } from "./ApplicationForm";

describe("ApplicationForm", () => {
  it("renders a field per configured question plus name/email", () => {
    render(<ApplicationForm />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    // One configured question label from org.config:
    expect(screen.getByText(/do you rent or own/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/components/ApplicationForm.test.tsx`
Expected: FAIL — cannot resolve `./ApplicationForm`.

- [ ] **Step 3: Write `src/components/ApplicationForm.tsx`** (client component, progressive enhancement via action)

```tsx
"use client";
import { useState } from "react";
import { org } from "@/org";
import { createApplication } from "@/server/applications";
import type { ActionResult } from "@/lib/validation";

export function ApplicationForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const res = await createApplication(formData);
    setResult(res);
    setPending(false);
    if (res.ok) (document.getElementById("apply-form") as HTMLFormElement)?.reset();
  }

  if (result?.ok) {
    return <p className="rounded bg-green-50 p-4 text-green-800">Thank you! Your application was received.</p>;
  }

  return (
    <form id="apply-form" action={onSubmit} className="space-y-4">
      <Field name="applicantName" label="Your name" required error={result?.ok === false ? result.errors?.applicantName : undefined} />
      <Field name="email" label="Email" type="email" required error={result?.ok === false ? result.errors?.email : undefined} />
      <Field name="phone" label="Phone" />
      <Field name="address" label="Address" />
      {org.application.questions.map((q) => {
        const err = result?.ok === false ? result.errors?.[`q_${q.id}`] : undefined;
        const id = `q_${q.id}`;
        return (
          <div key={q.id}>
            <label htmlFor={id} className="block font-medium">{q.label}{q.required && " *"}</label>
            {q.type === "textarea" ? (
              <textarea id={id} name={id} className="mt-1 w-full rounded border p-2" />
            ) : q.type === "select" ? (
              <select id={id} name={id} className="mt-1 w-full rounded border p-2">
                <option value="">Select…</option>
                {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : q.type === "checkbox" ? (
              <input id={id} name={id} type="checkbox" value="Yes" className="mt-1" />
            ) : (
              <input id={id} name={id} className="mt-1 w-full rounded border p-2" />
            )}
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        );
      })}
      <button type="submit" disabled={pending} className="rounded px-5 py-2 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text", required, error }: {
  name: string; label: string; type?: string; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}{required && " *"}</label>
      <input id={name} name={name} type={type} className="mt-1 w-full rounded border p-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Write `src/app/(public)/apply/page.tsx`**

```tsx
import { org } from "@/org";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function ApplyPage() {
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Application</h1>
      <p className="mt-2 mb-6 opacity-80">{org.application.intro}</p>
      <ApplicationForm />
    </section>
  );
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/components/ApplicationForm.test.tsx`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add foster application form UI"
```

### Task 16: Supply request — submit action (TDD)

**Files:**
- Create: `src/server/requests.ts`
- Test: `src/server/requests.test.ts`

- [ ] **Step 1: Write the failing test `src/server/requests.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { createSupplyRequest } from "./requests";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("createSupplyRequest", () => {
  it("rejects when no foster name and no foster id provided", async () => {
    const res = await createSupplyRequest(form({ items: JSON.stringify([{ type: "Food", quantity: 1 }]) }));
    expect(res.ok).toBe(false);
    expect(res.errors?.fosterNameText).toBeTruthy();
  });

  it("rejects when items list is empty", async () => {
    const res = await createSupplyRequest(form({ fosterNameText: "Pat", items: "[]" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.items).toBeTruthy();
  });

  it("stores items JSON and defaults status to new", async () => {
    const res = await createSupplyRequest(form({
      fosterNameText: "Pat",
      items: JSON.stringify([{ type: "Food", quantity: 2 }, { type: "Litter", quantity: 1 }]),
      notes: "thanks",
    }));
    expect(res.ok).toBe(true);
    const sr = await prisma.supplyRequest.findFirstOrThrow();
    expect(sr.status).toBe("new");
    expect(JSON.parse(sr.items)).toHaveLength(2);
    expect(sr.fosterNameText).toBe("Pat");
  });

  it("links to a foster parent and cat by id when provided", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await createSupplyRequest(form({
      fosterParentId: fp.id, catId: cat.id,
      items: JSON.stringify([{ type: "Food", quantity: 1 }]),
    }));
    expect(res.ok).toBe(true);
    const sr = await prisma.supplyRequest.findFirstOrThrow();
    expect(sr.fosterParentId).toBe(fp.id);
    expect(sr.catId).toBe(cat.id);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npx vitest run src/server/requests.test.ts`
Expected: FAIL — cannot resolve `./requests`.

- [ ] **Step 3: Write `src/server/requests.ts`** (admin functions added in Task 31)

```ts
"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { type ActionResult, fieldErrors } from "@/lib/validation";

const itemSchema = z.object({
  type: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

const schema = z.object({
  fosterParentId: z.string().optional().default(""),
  fosterNameText: z.string().optional().default(""),
  catId: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  items: z.string(),
}).superRefine((val, ctx) => {
  if (!val.fosterParentId && !val.fosterNameText.trim()) {
    ctx.addIssue({ code: "custom", path: ["fosterNameText"], message: "Tell us who is requesting (name or selected foster)" });
  }
  let parsed: unknown;
  try { parsed = JSON.parse(val.items); } catch { parsed = null; }
  const arr = itemSchema.array().safeParse(parsed);
  if (!arr.success || arr.data.length === 0) {
    ctx.addIssue({ code: "custom", path: ["items"], message: "Add at least one supply item" });
  }
});

export async function createSupplyRequest(formData: FormData): Promise<ActionResult> {
  const parsed = schema.safeParse({
    fosterParentId: formData.get("fosterParentId") ?? "",
    fosterNameText: formData.get("fosterNameText") ?? "",
    catId: formData.get("catId") ?? "",
    notes: formData.get("notes") ?? "",
    items: formData.get("items") ?? "[]",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const items = itemSchema.array().parse(JSON.parse(parsed.data.items));
  const created = await prisma.supplyRequest.create({
    data: {
      fosterParentId: parsed.data.fosterParentId || null,
      fosterNameText: parsed.data.fosterNameText.trim() || null,
      catId: parsed.data.catId || null,
      items: JSON.stringify(items),
      notes: parsed.data.notes || null,
      status: "new",
    },
  });
  return { ok: true, id: created.id };
}
```

- [ ] **Step 4: Run it to verify it passes**

Run: `npx vitest run src/server/requests.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add supply request submit action with validation"
```

### Task 17: Supply request form UI

**Files:**
- Create: `src/components/SupplyRequestForm.tsx`, `src/app/(public)/request/page.tsx`
- Modify: `src/server/cats.ts` (add `getCatOptions`), `src/server/fosters.ts` (new — `getFosterOptions`)
- Test: `src/components/SupplyRequestForm.test.tsx`

- [ ] **Step 1: Add a foster options helper — write failing test `src/server/fosters.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { getFosterOptions } from "./fosters";

beforeEach(async () => { await resetDb(); });

describe("getFosterOptions", () => {
  it("returns id+name pairs sorted by name", async () => {
    await prisma.fosterParent.create({ data: { name: "Zoe" } });
    await prisma.fosterParent.create({ data: { name: "Ann" } });
    const opts = await getFosterOptions();
    expect(opts.map((o) => o.name)).toEqual(["Ann", "Zoe"]);
  });
});
```

- [ ] **Step 2: Run it — fails** (`./fosters` missing)

Run: `npx vitest run src/server/fosters.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write `src/server/fosters.ts`** (fuller CRUD added in Task 29)

```ts
import "server-only";
import { prisma } from "@/lib/db";

export async function getFosterOptions() {
  return prisma.fosterParent.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
```

- [ ] **Step 4: Add `getCatOptions` to `src/server/cats.ts`** (append)

```ts
export async function getCatOptions() {
  return prisma.cat.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
```

- [ ] **Step 5: Run foster test — passes**

Run: `npx vitest run src/server/fosters.test.ts`
Expected: PASS.

- [ ] **Step 6: Write the failing UI test `src/components/SupplyRequestForm.test.tsx`**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SupplyRequestForm } from "./SupplyRequestForm";

describe("SupplyRequestForm", () => {
  it("renders foster name field and an add-item control", () => {
    render(<SupplyRequestForm fosters={[{ id: "1", name: "Pat" }]} cats={[{ id: "c1", name: "Mochi" }]} />);
    expect(screen.getByLabelText(/your name/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add item/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 7: Run it — fails**

Run: `npx vitest run src/components/SupplyRequestForm.test.tsx`
Expected: FAIL.

- [ ] **Step 8: Write `src/components/SupplyRequestForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { org } from "@/org";
import { createSupplyRequest } from "@/server/requests";
import type { ActionResult } from "@/lib/validation";

type Opt = { id: string; name: string };
type Item = { type: string; quantity: number };

export function SupplyRequestForm({ fosters, cats }: { fosters: Opt[]; cats: Opt[] }) {
  const [items, setItems] = useState<Item[]>([{ type: org.supplies.itemTypes[0], quantity: 1 }]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  function addItem() { setItems((xs) => [...xs, { type: org.supplies.itemTypes[0], quantity: 1 }]); }
  function update(i: number, patch: Partial<Item>) {
    setItems((xs) => xs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeItem(i: number) { setItems((xs) => xs.filter((_, idx) => idx !== i)); }

  async function onSubmit(formData: FormData) {
    setPending(true);
    formData.set("items", JSON.stringify(items));
    const res = await createSupplyRequest(formData);
    setResult(res);
    setPending(false);
  }

  if (result?.ok) {
    return <p className="rounded bg-green-50 p-4 text-green-800">Request received. Thank you!</p>;
  }
  const errors = result?.ok === false ? result.errors : undefined;

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="fosterNameText" className="block font-medium">Your name</label>
        <input id="fosterNameText" name="fosterNameText" className="mt-1 w-full rounded border p-2" />
        {errors?.fosterNameText && <p className="text-sm text-red-600">{errors.fosterNameText}</p>}
      </div>
      <div>
        <label htmlFor="fosterParentId" className="block font-medium">…or pick yourself (if known)</label>
        <select id="fosterParentId" name="fosterParentId" className="mt-1 w-full rounded border p-2">
          <option value="">—</option>
          {fosters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="catId" className="block font-medium">For which cat? (optional)</label>
        <select id="catId" name="catId" className="mt-1 w-full rounded border p-2">
          <option value="">—</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <fieldset className="rounded border p-3">
        <legend className="px-1 font-medium">Items</legend>
        {items.map((it, i) => (
          <div key={i} className="mt-2 flex items-center gap-2">
            <select value={it.type} onChange={(e) => update(i, { type: e.target.value })} className="rounded border p-2">
              {org.supplies.itemTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min={1} value={it.quantity}
              onChange={(e) => update(i, { quantity: Number(e.target.value) })} className="w-20 rounded border p-2" />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)} className="text-sm text-red-600">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-3 text-sm underline">+ Add item</button>
        {errors?.items && <p className="text-sm text-red-600">{errors.items}</p>}
      </fieldset>

      <div>
        <label htmlFor="notes" className="block font-medium">Notes</label>
        <textarea id="notes" name="notes" className="mt-1 w-full rounded border p-2" />
      </div>
      <button type="submit" disabled={pending} className="rounded px-5 py-2 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
```

- [ ] **Step 9: Write `src/app/(public)/request/page.tsx`**

```tsx
import { getFosterOptions } from "@/server/fosters";
import { getCatOptions } from "@/server/cats";
import { SupplyRequestForm } from "@/components/SupplyRequestForm";

export default async function RequestPage() {
  const [fosters, cats] = await Promise.all([getFosterOptions(), getCatOptions()]);
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Supply Request</h1>
      <p className="mt-2 mb-6 opacity-80">Need food, litter, medication, or toys? Let us know. For urgent matters, please call us.</p>
      <SupplyRequestForm fosters={fosters} cats={cats} />
    </section>
  );
}
```

- [ ] **Step 10: Run the UI test — passes**

Run: `npx vitest run src/components/SupplyRequestForm.test.tsx`
Expected: PASS.

- [ ] **Step 11: Full suite + build**

Run: `npm test`
Expected: all green.
Run: `npm run build`
Expected: all public routes present.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add supply request form UI and options helpers"
```

**Phase 1 demo checkpoint:** browse `/cats`, open a cat, submit `/apply` and `/request`; rows appear in the DB (`npx prisma studio`).

---

## Phase 2 — Auth + admin shell

Goal: staff can log in; `/admin/*` is gated; an admin dashboard shows new applications and open supply requests at a glance. Demoable: visiting `/admin` while logged out redirects to login; logging in with the seeded staff account reaches the dashboard.

### Task 18: Auth.js v5 Credentials provider (TDD on password + authorize)

**Files:**
- Create: `src/lib/password.ts`, `src/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`
- Modify: `.env` (add `AUTH_SECRET`)
- Test: `src/lib/password.test.ts`, `src/auth.authorize.test.ts`

- [ ] **Step 1: Install Auth.js v5**

```bash
npm install next-auth@beta
```

- [ ] **Step 2: Add `AUTH_SECRET` to `.env`**

```bash
npx auth secret
```

Expected: appends `AUTH_SECRET=...` to `.env`. If the command is unavailable, add manually: `AUTH_SECRET="dev-only-secret-change-me"`. Also add the same key to `.env.test`:

```
AUTH_SECRET="test-secret"
```

- [ ] **Step 3: Write the failing test `src/lib/password.test.ts`**

```ts
import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password", () => {
  it("hashes and verifies a correct password", async () => {
    const hash = await hashPassword("hunter2");
    expect(hash).not.toBe("hunter2");
    expect(await verifyPassword("hunter2", hash)).toBe(true);
  });
  it("rejects a wrong password", async () => {
    const hash = await hashPassword("hunter2");
    expect(await verifyPassword("nope", hash)).toBe(false);
  });
});
```

- [ ] **Step 4: Run it — fails**

Run: `npx vitest run src/lib/password.test.ts`
Expected: FAIL — cannot resolve `./password`.

- [ ] **Step 5: Write `src/lib/password.ts`**

```ts
import bcrypt from "bcryptjs";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 6: Run it — passes**

Run: `npx vitest run src/lib/password.test.ts`
Expected: PASS.

- [ ] **Step 7: Write the failing test `src/auth.authorize.test.ts`** (tests the credential-checking logic, extracted as a pure function)

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { hashPassword } from "@/lib/password";
import { authorizeStaff } from "./auth";

beforeEach(async () => { await resetDb(); });

describe("authorizeStaff", () => {
  it("returns a user for valid credentials", async () => {
    await prisma.staffUser.create({
      data: { email: "s@x.com", passwordHash: await hashPassword("pw12345"), name: "Sam" },
    });
    const user = await authorizeStaff("s@x.com", "pw12345");
    expect(user).toMatchObject({ email: "s@x.com", name: "Sam" });
  });
  it("returns null for wrong password", async () => {
    await prisma.staffUser.create({
      data: { email: "s@x.com", passwordHash: await hashPassword("pw12345") },
    });
    expect(await authorizeStaff("s@x.com", "wrong")).toBeNull();
  });
  it("returns null for unknown email", async () => {
    expect(await authorizeStaff("nobody@x.com", "pw")).toBeNull();
  });
});
```

- [ ] **Step 8: Run it — fails**

Run: `npx vitest run src/auth.authorize.test.ts`
Expected: FAIL — `authorizeStaff` not exported.

- [ ] **Step 9: Write `src/auth.ts`** (Auth.js v5 config + exported `authorizeStaff`)

```ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export async function authorizeStaff(email: string, password: string) {
  const user = await prisma.staffUser.findUnique({ where: { email } });
  if (!user) return null;
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) return null;
  return { id: user.id, email: user.email, name: user.name ?? null };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (creds) => {
        const email = String(creds?.email ?? "");
        const password = String(creds?.password ?? "");
        if (!email || !password) return null;
        return authorizeStaff(email, password);
      },
    }),
  ],
});
```

- [ ] **Step 10: Write `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
```

- [ ] **Step 11: Run the authorize test — passes**

Run: `npx vitest run src/auth.authorize.test.ts`
Expected: PASS (3 tests).

> If the test fails because `next-auth` pulls Next runtime APIs under jsdom, keep `authorizeStaff` import working by ensuring it is defined and exported *before* the `NextAuth(...)` call (it is). The test imports only `authorizeStaff`.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: add Auth.js v5 credentials auth with password helpers"
```

### Task 19: Login page

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/components/LoginForm.tsx`, `src/server/authActions.ts`
- Test: `src/components/LoginForm.test.tsx`

- [ ] **Step 1: Write `src/server/authActions.ts`** (server action wrapping `signIn`)

```ts
"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password" };
    throw err; // re-throw Next redirect
  }
}
```

- [ ] **Step 2: Write the failing test `src/components/LoginForm.test.tsx`**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

vi.mock("@/server/authActions", () => ({ loginAction: vi.fn() }));

describe("LoginForm", () => {
  it("renders email and password fields and a submit button", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run it — fails**

Run: `npx vitest run src/components/LoginForm.test.tsx`
Expected: FAIL — cannot resolve `./LoginForm`.

- [ ] **Step 4: Write `src/components/LoginForm.tsx`**

```tsx
"use client";
import { useActionState } from "react";
import { loginAction } from "@/server/authActions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  return (
    <form action={formAction} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium">Email</label>
        <input id="email" name="email" type="email" required className="mt-1 w-full rounded border p-2" />
      </div>
      <div>
        <label htmlFor="password" className="block font-medium">Password</label>
        <input id="password" name="password" type="password" required className="mt-1 w-full rounded border p-2" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded px-5 py-2 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
```

- [ ] **Step 5: Write `src/app/admin/login/page.tsx`**

```tsx
import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <section className="py-12">
      <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Staff Login</h1>
      <LoginForm />
    </section>
  );
}
```

- [ ] **Step 6: Run the test — passes**

Run: `npx vitest run src/components/LoginForm.test.tsx`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add staff login page and action"
```

### Task 20: Middleware gating + admin layout

**Files:**
- Create: `src/middleware.ts`, `src/app/admin/layout.tsx`, `src/components/AdminNav.tsx`, `src/components/SignOutButton.tsx`

- [ ] **Step 1: Write `src/middleware.ts`** (protect all `/admin/*` except `/admin/login`)

```ts
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLogin = pathname === "/admin/login";
  const isAdmin = pathname.startsWith("/admin");
  if (isAdmin && !isLogin && !req.auth) {
    const url = new URL("/admin/login", req.nextUrl.origin);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 2: Write `src/components/SignOutButton.tsx`**

```tsx
import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
      <button type="submit" className="text-sm underline">Sign out</button>
    </form>
  );
}
```

- [ ] **Step 3: Write `src/components/AdminNav.tsx`**

```tsx
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cats", label: "Cats" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/requests", label: "Supply Requests" },
  { href: "/admin/fosters", label: "Foster Parents" },
];

export function AdminNav() {
  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <p className="mb-4 font-bold" style={{ color: "var(--color-primary)" }}>Back Office</p>
      <nav className="space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block hover:underline">{l.label}</Link>
        ))}
      </nav>
      <div className="mt-6"><SignOutButton /></div>
    </aside>
  );
}
```

- [ ] **Step 4: Write `src/app/admin/layout.tsx`** (gates server-side too; login page renders without nav)

```tsx
import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // The login page is also under /admin; render it bare when unauthenticated.
  if (!session) return <div className="py-8">{children}</div>;
  return (
    <div className="flex gap-6 py-6">
      <AdminNav />
      <div className="flex-1">{children}</div>
    </div>
  );
}
```

- [ ] **Step 5: Manual verification**

Run: `npm run dev`. Visit `/admin` while logged out → redirected to `/admin/login`. Log in with seeded `staff@example.org` / `changeme123` → reach `/admin` (dashboard added next task). Stop server.

- [ ] **Step 6: Build check**

Run: `npm run build`
Expected: middleware compiles; `/admin/*` routes present.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: gate admin routes with middleware and admin layout"
```

### Task 21: Admin dashboard + counts data-access (TDD)

**Files:**
- Create: `src/server/dashboard.ts`, `src/app/admin/page.tsx`
- Test: `src/server/dashboard.test.ts`

- [ ] **Step 1: Write the failing test `src/server/dashboard.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { getDashboardSummary } from "./dashboard";

beforeEach(async () => { await resetDb(); });

describe("getDashboardSummary", () => {
  it("counts new applications and open (new+in_progress) supply requests", async () => {
    await prisma.fosterApplication.create({ data: { applicantName: "A", email: "a@x.com", status: "new" } });
    await prisma.fosterApplication.create({ data: { applicantName: "B", email: "b@x.com", status: "approved" } });
    await prisma.supplyRequest.create({ data: { status: "new" } });
    await prisma.supplyRequest.create({ data: { status: "in_progress" } });
    await prisma.supplyRequest.create({ data: { status: "fulfilled" } });

    const s = await getDashboardSummary();
    expect(s.newApplications).toBe(1);
    expect(s.openRequests).toBe(2);
  });

  it("returns recent items for quick review", async () => {
    await prisma.fosterApplication.create({ data: { applicantName: "Pat", email: "p@x.com", status: "new" } });
    const s = await getDashboardSummary();
    expect(s.recentApplications[0].applicantName).toBe("Pat");
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/dashboard.test.ts`
Expected: FAIL — cannot resolve `./dashboard`.

- [ ] **Step 3: Write `src/server/dashboard.ts`**

```ts
import "server-only";
import { prisma } from "@/lib/db";

export async function getDashboardSummary() {
  const [newApplications, openRequests, recentApplications, recentRequests] = await Promise.all([
    prisma.fosterApplication.count({ where: { status: "new" } }),
    prisma.supplyRequest.count({ where: { status: { in: ["new", "in_progress"] } } }),
    prisma.fosterApplication.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.supplyRequest.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { cat: true, fosterParent: true } }),
  ]);
  return { newApplications, openRequests, recentApplications, recentRequests };
}
```

- [ ] **Step 4: Run it — passes**

Run: `npx vitest run src/server/dashboard.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Write `src/app/admin/page.tsx`**

```tsx
import Link from "next/link";
import { getDashboardSummary } from "@/server/dashboard";

export default async function AdminDashboard() {
  const s = await getDashboardSummary();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link href="/admin/applications" className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{s.newApplications}</p>
          <p className="opacity-70">New applications</p>
        </Link>
        <Link href="/admin/requests" className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{s.openRequests}</p>
          <p className="opacity-70">Open supply requests</p>
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent applications</h2>
      <ul className="mt-2 divide-y rounded border">
        {s.recentApplications.map((a) => (
          <li key={a.id} className="flex justify-between p-3">
            <span>{a.applicantName} <span className="opacity-60">({a.email})</span></span>
            <span className="capitalize opacity-70">{a.status}</span>
          </li>
        ))}
        {s.recentApplications.length === 0 && <li className="p-3 opacity-60">None yet.</li>}
      </ul>
    </section>
  );
}
```

- [ ] **Step 6: Full suite + build**

Run: `npm test`
Expected: all green.
Run: `npm run build`
Expected: success.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add admin dashboard with summary counts"
```

**Phase 2 demo checkpoint:** logged-out `/admin` redirects to login; seeded staff logs in and sees dashboard counts; sign-out works.

---

## Phase 3 — Cat charts

Goal: staff manage cats (create/edit), the full chart (medical records, vet appointments, medications), photo uploads, and foster parents. Demoable: create a cat, upload a photo, add a medical record + vet appointment + medication, assign a foster parent.

> **Shared admin helper used throughout Phase 3/4.** Server actions revalidate the page after a mutation. Create `src/server/revalidate.ts` once in Task 22 Step 0.

### Task 22: Admin cat list + create action (TDD)

**Files:**
- Create: `src/server/revalidate.ts`, `src/app/admin/cats/page.tsx`, `src/app/admin/cats/NewCatForm.tsx`
- Modify: `src/server/cats.ts` (add `getAllCats`, `createCat`, `slugify`)
- Test: `src/server/cats.admin.test.ts`

- [ ] **Step 0: Write `src/server/revalidate.ts`**

```ts
// Thin wrapper so server-action modules can revalidate without importing next/cache directly in tests.
export { revalidatePath } from "next/cache";
```

- [ ] **Step 1: Write the failing test `src/server/cats.admin.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getAllCats, createCat, slugify } from "./cats";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Mr. Whiskers 2")).toBe("mr-whiskers-2");
  });
});

describe("createCat", () => {
  it("rejects a blank name", async () => {
    const res = await createCat(form({ name: "" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.name).toBeTruthy();
  });

  it("creates a cat with a unique slug derived from the name", async () => {
    const res = await createCat(form({ name: "Mochi" }));
    expect(res.ok).toBe(true);
    const cat = await prisma.cat.findFirstOrThrow();
    expect(cat.slug).toBe("mochi");
    expect(cat.status).toBe("available");
  });

  it("disambiguates a duplicate slug", async () => {
    await createCat(form({ name: "Mochi" }));
    await createCat(form({ name: "Mochi" }));
    const slugs = (await prisma.cat.findMany()).map((c) => c.slug).sort();
    expect(slugs).toEqual(["mochi", "mochi-2"]);
  });
});

describe("getAllCats", () => {
  it("returns every cat regardless of status", async () => {
    await prisma.cat.create({ data: { name: "Hidden", slug: "hidden", status: "not_listed" } });
    const cats = await getAllCats();
    expect(cats).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/cats.admin.test.ts`
Expected: FAIL — `getAllCats`/`createCat`/`slugify` not exported.

- [ ] **Step 3: Append to `src/server/cats.ts`** (admin functions; note the file already has `"server-only"` at top and the public functions)

Add at the bottom:

```ts
import { revalidatePath } from "@/server/revalidate";
import { z } from "zod";
import { type ActionResult, fieldErrors } from "@/lib/validation";

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "cat";
  let candidate = root;
  let n = 1;
  while (await prisma.cat.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

export async function getAllCats() {
  return prisma.cat.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });
}

const createSchema = z.object({ name: z.string().min(1, "Name is required") });

export async function createCat(formData: FormData): Promise<ActionResult> {
  const parsed = createSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const slug = await uniqueSlug(slugify(parsed.data.name));
  const cat = await prisma.cat.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/cats");
  return { ok: true, id: cat.id };
}
```

> The file mixes read helpers (used by RSC) and `"use server"` actions. Because the file already starts with `import "server-only"`, do NOT add `"use server"` at the top. Instead the action functions are plain async exports invoked from client components through a thin action module. To keep them callable as server actions, create `src/server/catActions.ts` in the next step that re-exports the mutating ones with `"use server"`.

- [ ] **Step 4: Create `src/server/catActions.ts`** (the `"use server"` boundary for cat mutations)

```ts
"use server";
export { createCat } from "./cats";
```

> Pattern for the whole back office: read functions live in `src/server/<entity>.ts` (guarded by `server-only`); the matching `<entity>Actions.ts` file carries `"use server"` and re-exports the mutations for client components. Tests import the underlying functions directly from `<entity>.ts`.

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/cats.admin.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Write `src/app/admin/cats/NewCatForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCat } from "@/server/catActions";

export function NewCatForm() {
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  async function onSubmit(formData: FormData) {
    const res = await createCat(formData);
    if (res.ok) { router.push(`/admin/cats/${res.id}`); }
    else setError(res.errors?.name ?? "Could not create cat");
  }
  return (
    <form action={onSubmit} className="flex items-end gap-2">
      <div>
        <label htmlFor="name" className="block text-sm font-medium">New cat name</label>
        <input id="name" name="name" className="mt-1 rounded border p-2" />
      </div>
      <button type="submit" className="rounded px-4 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add cat</button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 7: Write `src/app/admin/cats/page.tsx`**

```tsx
import Link from "next/link";
import { getAllCats } from "@/server/cats";
import { NewCatForm } from "./NewCatForm";

export default async function AdminCatsPage() {
  const cats = await getAllCats();
  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Cats</h1>
        <NewCatForm />
      </div>
      <ul className="mt-6 divide-y rounded border">
        {cats.map((c) => (
          <li key={c.id} className="flex items-center justify-between p-3">
            <Link href={`/admin/cats/${c.id}`} className="font-medium hover:underline">{c.name}</Link>
            <span className="capitalize opacity-70">{c.status}</span>
          </li>
        ))}
        {cats.length === 0 && <li className="p-3 opacity-60">No cats yet — add one above.</li>}
      </ul>
    </section>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin cat list and create action"
```

### Task 23: Cat edit (update fields + status + foster assignment) (TDD)

**Files:**
- Modify: `src/server/cats.ts` (add `getCatById`, `updateCat`), `src/server/catActions.ts` (export `updateCat`)
- Test: `src/server/cats.update.test.ts`

- [ ] **Step 1: Write the failing test `src/server/cats.update.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getCatById, updateCat } from "./cats";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("updateCat", () => {
  it("updates editable fields and status", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await updateCat(cat.id, form({
      name: "Mochi", status: "adopted", breed: "DSH", age: "2y", sex: "F",
      publicBio: "sweet", behaviorNotes: "shy", foodType: "wet", foodPortion: "1/2 can",
    }));
    expect(res.ok).toBe(true);
    const updated = await getCatById(cat.id);
    expect(updated?.status).toBe("adopted");
    expect(updated?.breed).toBe("DSH");
    expect(updated?.behaviorNotes).toBe("shy");
  });

  it("rejects an invalid status value", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await updateCat(cat.id, form({ name: "Mochi", status: "bogus" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.status).toBeTruthy();
  });

  it("assigns a foster parent", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    await updateCat(cat.id, form({ name: "Mochi", status: "available", currentFosterParentId: fp.id }));
    const updated = await getCatById(cat.id);
    expect(updated?.currentFosterParentId).toBe(fp.id);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/cats.update.test.ts`
Expected: FAIL — `getCatById`/`updateCat` not exported.

- [ ] **Step 3: Append to `src/server/cats.ts`**

```ts
export const CAT_STATUSES = ["available", "pending", "adopted", "not_listed"] as const;

export async function getCatById(id: string) {
  return prisma.cat.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { isPrimary: "desc" } },
      medicalRecords: { orderBy: { date: "desc" } },
      vetAppointments: { orderBy: { datetime: "desc" } },
      medications: { orderBy: { createdAt: "desc" } },
      currentFosterParent: true,
    },
  });
}

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.enum(CAT_STATUSES, { message: "Invalid status" }),
  breed: z.string().optional().default(""),
  age: z.string().optional().default(""),
  sex: z.string().optional().default(""),
  publicBio: z.string().optional().default(""),
  behaviorNotes: z.string().optional().default(""),
  foodType: z.string().optional().default(""),
  foodPortion: z.string().optional().default(""),
  currentFosterParentId: z.string().optional().default(""),
});

export async function updateCat(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    status: formData.get("status"),
    breed: formData.get("breed") ?? "",
    age: formData.get("age") ?? "",
    sex: formData.get("sex") ?? "",
    publicBio: formData.get("publicBio") ?? "",
    behaviorNotes: formData.get("behaviorNotes") ?? "",
    foodType: formData.get("foodType") ?? "",
    foodPortion: formData.get("foodPortion") ?? "",
    currentFosterParentId: formData.get("currentFosterParentId") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.cat.update({
    where: { id },
    data: {
      name: d.name,
      status: d.status,
      breed: d.breed || null,
      age: d.age || null,
      sex: d.sex || null,
      publicBio: d.publicBio || null,
      behaviorNotes: d.behaviorNotes || null,
      foodType: d.foodType || null,
      foodPortion: d.foodPortion || null,
      currentFosterParentId: d.currentFosterParentId || null,
    },
  });
  revalidatePath(`/admin/cats/${id}`);
  return { ok: true, id };
}
```

- [ ] **Step 4: Export from `src/server/catActions.ts`**

```ts
"use server";
export { createCat, updateCat } from "./cats";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/cats.update.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add cat update action with status and foster assignment"
```

### Task 24: Cat chart page + edit form UI

**Files:**
- Create: `src/app/admin/cats/[id]/page.tsx`, `src/app/admin/cats/[id]/CatEditForm.tsx`
- Modify: `src/server/fosters.ts` (already has `getFosterOptions`)

- [ ] **Step 1: Write `src/app/admin/cats/[id]/CatEditForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { updateCat } from "@/server/catActions";
import { CAT_STATUSES } from "@/server/cats";

type Cat = {
  id: string; name: string; status: string; breed: string | null; age: string | null;
  sex: string | null; publicBio: string | null; behaviorNotes: string | null;
  foodType: string | null; foodPortion: string | null; currentFosterParentId: string | null;
};

export function CatEditForm({ cat, fosters }: { cat: Cat; fosters: { id: string; name: string }[] }) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | undefined>();
  async function onSubmit(formData: FormData) {
    setSaved(false); setError(undefined);
    const res = await updateCat(cat.id, formData);
    if (res.ok) setSaved(true);
    else setError(Object.values(res.errors ?? {})[0] ?? "Could not save");
  }
  return (
    <form action={onSubmit} className="space-y-3">
      <Row label="Name"><input name="name" defaultValue={cat.name} className="w-full rounded border p-2" /></Row>
      <Row label="Status">
        <select name="status" defaultValue={cat.status} className="w-full rounded border p-2">
          {CAT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Row>
      <Row label="Breed"><input name="breed" defaultValue={cat.breed ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Age"><input name="age" defaultValue={cat.age ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Sex"><input name="sex" defaultValue={cat.sex ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Public bio"><textarea name="publicBio" defaultValue={cat.publicBio ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Behavior notes"><textarea name="behaviorNotes" defaultValue={cat.behaviorNotes ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Food type"><input name="foodType" defaultValue={cat.foodType ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Food portion"><input name="foodPortion" defaultValue={cat.foodPortion ?? ""} className="w-full rounded border p-2" /></Row>
      <Row label="Foster parent">
        <select name="currentFosterParentId" defaultValue={cat.currentFosterParentId ?? ""} className="w-full rounded border p-2">
          <option value="">— none —</option>
          {fosters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </Row>
      <button type="submit" className="rounded px-4 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Save chart</button>
      {saved && <span className="ml-3 text-green-700">Saved.</span>}
      {error && <span className="ml-3 text-red-600">{error}</span>}
    </form>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid grid-cols-[140px_1fr] items-start gap-3">
      <span className="pt-2 text-sm font-medium">{label}</span>
      {children}
    </label>
  );
}
```

- [ ] **Step 2: Write `src/app/admin/cats/[id]/page.tsx`** (chart hub — embeds sub-record panels added in Tasks 25–28)

```tsx
import { notFound } from "next/navigation";
import { getCatById } from "@/server/cats";
import { getFosterOptions } from "@/server/fosters";
import { CatEditForm } from "./CatEditForm";
import { PhotoPanel } from "./PhotoPanel";
import { MedicalPanel } from "./MedicalPanel";
import { VetPanel } from "./VetPanel";
import { MedicationPanel } from "./MedicationPanel";

export default async function CatChartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [cat, fosters] = await Promise.all([getCatById(id), getFosterOptions()]);
  if (!cat) notFound();

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>{cat.name}</h1>
        <p className="opacity-60">Chart</p>
      </div>
      <CatEditForm cat={cat} fosters={fosters} />
      <PhotoPanel catId={cat.id} photos={cat.photos} />
      <MedicalPanel catId={cat.id} records={cat.medicalRecords} />
      <VetPanel catId={cat.id} appointments={cat.vetAppointments} />
      <MedicationPanel catId={cat.id} medications={cat.medications} />
    </section>
  );
}
```

> The four panel imports are created in Tasks 25–28. Until then the page will not compile — that's expected; do not run `npm run build` until Task 28 is done. Unit tests for the data-access functions run independently.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add cat chart page and edit form"
```

### Task 25: Photo upload (TDD on the data-access; filesystem write)

**Files:**
- Create: `src/server/photos.ts`, `src/server/photoActions.ts`, `src/app/admin/cats/[id]/PhotoPanel.tsx`
- Test: `src/server/photos.test.ts`

- [ ] **Step 1: Write the failing test `src/server/photos.test.ts`** (tests DB record creation + primary toggling; file IO is mocked)

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));
vi.mock("node:fs/promises", () => ({
  mkdir: vi.fn().mockResolvedValue(undefined),
  writeFile: vi.fn().mockResolvedValue(undefined),
  unlink: vi.fn().mockResolvedValue(undefined),
}));

import { addPhotoRecord, setPrimaryPhoto, deletePhoto } from "./photos";

beforeEach(async () => { await resetDb(); });

describe("addPhotoRecord", () => {
  it("creates a photo and makes the first one primary", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    await addPhotoRecord(cat.id, "/uploads/cats/a.jpg", "first");
    const photos = await prisma.catPhoto.findMany({ where: { catId: cat.id } });
    expect(photos).toHaveLength(1);
    expect(photos[0].isPrimary).toBe(true);
  });

  it("does not auto-promote the second photo", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    await addPhotoRecord(cat.id, "/uploads/cats/a.jpg");
    await addPhotoRecord(cat.id, "/uploads/cats/b.jpg");
    const primaries = await prisma.catPhoto.findMany({ where: { catId: cat.id, isPrimary: true } });
    expect(primaries).toHaveLength(1);
  });
});

describe("setPrimaryPhoto", () => {
  it("moves primary flag to the chosen photo", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const p1 = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/a.jpg", isPrimary: true } });
    const p2 = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/b.jpg" } });
    await setPrimaryPhoto(cat.id, p2.id);
    const fresh = await prisma.catPhoto.findMany({ where: { catId: cat.id } });
    expect(fresh.find((p) => p.id === p1.id)?.isPrimary).toBe(false);
    expect(fresh.find((p) => p.id === p2.id)?.isPrimary).toBe(true);
  });
});

describe("deletePhoto", () => {
  it("removes the photo record", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const p = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/uploads/cats/a.jpg" } });
    await deletePhoto(cat.id, p.id);
    expect(await prisma.catPhoto.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/photos.test.ts`
Expected: FAIL — `./photos` missing.

- [ ] **Step 3: Write `src/server/photos.ts`**

```ts
import "server-only";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cats");

export async function addPhotoRecord(catId: string, url: string, caption?: string) {
  const existing = await prisma.catPhoto.count({ where: { catId } });
  await prisma.catPhoto.create({
    data: { catId, url, caption: caption || null, isPrimary: existing === 0 },
  });
  revalidatePath(`/admin/cats/${catId}`);
}

export async function uploadPhoto(catId: string, file: File, caption?: string) {
  if (!file || file.size === 0) return { ok: false as const, message: "No file selected" };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const safe = `${catId}-${Date.now()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, safe), bytes);
  const url = `/uploads/cats/${safe}`;
  await addPhotoRecord(catId, url, caption);
  return { ok: true as const, url };
}

export async function setPrimaryPhoto(catId: string, photoId: string) {
  await prisma.$transaction([
    prisma.catPhoto.updateMany({ where: { catId }, data: { isPrimary: false } }),
    prisma.catPhoto.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ]);
  revalidatePath(`/admin/cats/${catId}`);
}

export async function deletePhoto(catId: string, photoId: string) {
  const photo = await prisma.catPhoto.findUnique({ where: { id: photoId } });
  if (photo?.url?.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", photo.url)).catch(() => {});
  }
  await prisma.catPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/admin/cats/${catId}`);
}
```

- [ ] **Step 4: Write `src/server/photoActions.ts`**

```ts
"use server";
import { uploadPhoto, setPrimaryPhoto, deletePhoto } from "./photos";

export async function uploadPhotoAction(catId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false as const, message: "No file" };
  return uploadPhoto(catId, file, String(formData.get("caption") ?? ""));
}

export async function setPrimaryAction(catId: string, photoId: string) {
  await setPrimaryPhoto(catId, photoId);
}
export async function deletePhotoAction(catId: string, photoId: string) {
  await deletePhoto(catId, photoId);
}
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/photos.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write `src/app/admin/cats/[id]/PhotoPanel.tsx`**

```tsx
"use client";
import { uploadPhotoAction, setPrimaryAction, deletePhotoAction } from "@/server/photoActions";

type Photo = { id: string; url: string; caption: string | null; isPrimary: boolean };

export function PhotoPanel({ catId, photos }: { catId: string; photos: Photo[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Photos</h2>
      <form action={(fd) => uploadPhotoAction(catId, fd)} className="mt-2 flex items-center gap-2">
        <input type="file" name="file" accept="image/*" required />
        <input name="caption" placeholder="Caption (optional)" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Upload</button>
      </form>
      <div className="mt-4 grid grid-cols-3 gap-3 md:grid-cols-4">
        {photos.map((p) => (
          <div key={p.id} className="rounded border p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? ""} className="h-32 w-full rounded object-cover" />
            <div className="mt-1 flex items-center justify-between text-xs">
              {p.isPrimary ? <span className="font-semibold text-green-700">Primary</span>
                : <button onClick={() => setPrimaryAction(catId, p.id)} className="underline">Make primary</button>}
              <button onClick={() => deletePhotoAction(catId, p.id)} className="text-red-600">Delete</button>
            </div>
          </div>
        ))}
        {photos.length === 0 && <p className="opacity-60">No photos yet.</p>}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add cat photo upload with primary toggle and delete"
```

### Task 26: Medical records sub-record CRUD (TDD)

**Files:**
- Create: `src/server/chart.ts`, `src/server/chartActions.ts`, `src/app/admin/cats/[id]/MedicalPanel.tsx`
- Test: `src/server/chart.medical.test.ts`

- [ ] **Step 1: Write the failing test `src/server/chart.medical.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addMedicalRecord, deleteMedicalRecord } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addMedicalRecord", () => {
  it("rejects when type or description missing", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await addMedicalRecord(cat.id, form({ date: "2026-01-01", type: "" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.type).toBeTruthy();
  });

  it("creates a record with a parsed date", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await addMedicalRecord(cat.id, form({
      date: "2026-01-15", type: "Vaccination", description: "FVRCP", vetName: "Dr. Lee",
    }));
    expect(res.ok).toBe(true);
    const rec = await prisma.medicalRecord.findFirstOrThrow();
    expect(rec.type).toBe("Vaccination");
    expect(rec.date.toISOString().startsWith("2026-01-15")).toBe(true);
  });
});

describe("deleteMedicalRecord", () => {
  it("removes the record", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const rec = await prisma.medicalRecord.create({ data: { catId: cat.id, date: new Date(), type: "X", description: "Y" } });
    await deleteMedicalRecord(cat.id, rec.id);
    expect(await prisma.medicalRecord.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/chart.medical.test.ts`
Expected: FAIL — `./chart` missing.

- [ ] **Step 3: Write `src/server/chart.ts`** (start with medical functions; vet + medication appended in Tasks 27–28)

```ts
import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";
import { type ActionResult, fieldErrors } from "@/lib/validation";

function bump(catId: string) { revalidatePath(`/admin/cats/${catId}`); }

const medicalSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  vetName: z.string().optional().default(""),
});

export async function addMedicalRecord(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = medicalSchema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    description: formData.get("description"),
    vetName: formData.get("vetName") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await prisma.medicalRecord.create({
    data: {
      catId,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      description: parsed.data.description,
      vetName: parsed.data.vetName || null,
    },
  });
  bump(catId);
  return { ok: true };
}

export async function deleteMedicalRecord(catId: string, id: string): Promise<ActionResult> {
  await prisma.medicalRecord.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}
```

- [ ] **Step 4: Write `src/server/chartActions.ts`** (extended in Tasks 27–28)

```ts
"use server";
export { addMedicalRecord, deleteMedicalRecord } from "./chart";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/chart.medical.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Write `src/app/admin/cats/[id]/MedicalPanel.tsx`**

```tsx
"use client";
import { addMedicalRecord, deleteMedicalRecord } from "@/server/chartActions";

type Rec = { id: string; date: Date; type: string; description: string; vetName: string | null };

export function MedicalPanel({ catId, records }: { catId: string; records: Rec[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Medical records</h2>
      <form action={(fd) => addMedicalRecord(catId, fd)} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="date" name="date" required className="rounded border p-2" />
        <input name="type" placeholder="Type (e.g. Vaccination)" required className="rounded border p-2" />
        <input name="description" placeholder="Description" required className="rounded border p-2" />
        <input name="vetName" placeholder="Vet (optional)" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {records.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-2 text-sm">
            <span>{new Date(r.date).toLocaleDateString()} — <b>{r.type}</b>: {r.description}{r.vetName ? ` (${r.vetName})` : ""}</span>
            <button onClick={() => deleteMedicalRecord(catId, r.id)} className="text-red-600">Delete</button>
          </li>
        ))}
        {records.length === 0 && <li className="p-2 opacity-60">No records.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add medical records to cat chart"
```

### Task 27: Vet appointments sub-record CRUD (TDD)

**Files:**
- Modify: `src/server/chart.ts` (add vet functions), `src/server/chartActions.ts`
- Create: `src/app/admin/cats/[id]/VetPanel.tsx`
- Test: `src/server/chart.vet.test.ts`

- [ ] **Step 1: Write the failing test `src/server/chart.vet.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addVetAppointment, updateVetStatus, deleteVetAppointment } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addVetAppointment", () => {
  it("requires datetime and reason", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addVetAppointment(cat.id, form({ datetime: "", reason: "" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.datetime).toBeTruthy();
  });

  it("creates a scheduled appointment", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addVetAppointment(cat.id, form({
      datetime: "2026-02-01T09:30", reason: "Checkup", location: "Clinic",
    }));
    expect(res.ok).toBe(true);
    const appt = await prisma.vetAppointment.findFirstOrThrow();
    expect(appt.status).toBe("scheduled");
    expect(appt.reason).toBe("Checkup");
  });
});

describe("updateVetStatus", () => {
  it("rejects an invalid status", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    const res = await updateVetStatus(cat.id, appt.id, "bogus");
    expect(res.ok).toBe(false);
  });
  it("moves an appointment to completed", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    const res = await updateVetStatus(cat.id, appt.id, "completed");
    expect(res.ok).toBe(true);
    const fresh = await prisma.vetAppointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(fresh.status).toBe("completed");
  });
});

describe("deleteVetAppointment", () => {
  it("removes the appointment", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    await deleteVetAppointment(cat.id, appt.id);
    expect(await prisma.vetAppointment.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/chart.vet.test.ts`
Expected: FAIL — vet functions not exported.

- [ ] **Step 3: Append vet functions to `src/server/chart.ts`**

```ts
export const VET_STATUSES = ["scheduled", "completed", "cancelled"] as const;

const vetSchema = z.object({
  datetime: z.string().min(1, "Date/time is required"),
  reason: z.string().min(1, "Reason is required"),
  location: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function addVetAppointment(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = vetSchema.safeParse({
    datetime: formData.get("datetime"),
    reason: formData.get("reason"),
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await prisma.vetAppointment.create({
    data: {
      catId,
      datetime: new Date(parsed.data.datetime),
      reason: parsed.data.reason,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
      status: "scheduled",
    },
  });
  bump(catId);
  return { ok: true };
}

export async function updateVetStatus(catId: string, id: string, status: string): Promise<ActionResult> {
  if (!VET_STATUSES.includes(status as (typeof VET_STATUSES)[number])) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  await prisma.vetAppointment.update({ where: { id }, data: { status } });
  bump(catId);
  return { ok: true };
}

export async function deleteVetAppointment(catId: string, id: string): Promise<ActionResult> {
  await prisma.vetAppointment.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}
```

- [ ] **Step 4: Extend `src/server/chartActions.ts`**

```ts
"use server";
export { addMedicalRecord, deleteMedicalRecord } from "./chart";
export { addVetAppointment, updateVetStatus, deleteVetAppointment } from "./chart";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/chart.vet.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Write `src/app/admin/cats/[id]/VetPanel.tsx`**

```tsx
"use client";
import { addVetAppointment, updateVetStatus, deleteVetAppointment } from "@/server/chartActions";

type Appt = { id: string; datetime: Date; reason: string; location: string | null; status: string; notes: string | null };

export function VetPanel({ catId, appointments }: { catId: string; appointments: Appt[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Vet appointments</h2>
      <form action={(fd) => addVetAppointment(catId, fd)} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="datetime-local" name="datetime" required className="rounded border p-2" />
        <input name="reason" placeholder="Reason" required className="rounded border p-2" />
        <input name="location" placeholder="Location" className="rounded border p-2" />
        <input name="notes" placeholder="Notes" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {appointments.map((a) => (
          <li key={a.id} className="flex items-center justify-between p-2 text-sm">
            <span>{new Date(a.datetime).toLocaleString()} — {a.reason}{a.location ? ` @ ${a.location}` : ""}</span>
            <span className="flex items-center gap-2">
              <select defaultValue={a.status} onChange={(e) => updateVetStatus(catId, a.id, e.target.value)} className="rounded border p-1">
                <option value="scheduled">scheduled</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
              <button onClick={() => deleteVetAppointment(catId, a.id)} className="text-red-600">Delete</button>
            </span>
          </li>
        ))}
        {appointments.length === 0 && <li className="p-2 opacity-60">No appointments.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: add vet appointments to cat chart"
```

### Task 28: Medications sub-record CRUD (TDD)

**Files:**
- Modify: `src/server/chart.ts` (add medication functions), `src/server/chartActions.ts`
- Create: `src/app/admin/cats/[id]/MedicationPanel.tsx`
- Test: `src/server/chart.medication.test.ts`

- [ ] **Step 1: Write the failing test `src/server/chart.medication.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addMedication, toggleMedicationActive, deleteMedication } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addMedication", () => {
  it("requires a name", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addMedication(cat.id, form({ name: "" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.name).toBeTruthy();
  });
  it("creates an active medication with optional dates", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addMedication(cat.id, form({
      name: "Amoxicillin", dosage: "50mg", schedule: "2x/day", startDate: "2026-01-01",
    }));
    expect(res.ok).toBe(true);
    const med = await prisma.medication.findFirstOrThrow();
    expect(med.name).toBe("Amoxicillin");
    expect(med.isActive).toBe(true);
    expect(med.startDate?.toISOString().startsWith("2026-01-01")).toBe(true);
  });
});

describe("toggleMedicationActive", () => {
  it("flips the active flag", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const med = await prisma.medication.create({ data: { catId: cat.id, name: "X", isActive: true } });
    await toggleMedicationActive(cat.id, med.id);
    const fresh = await prisma.medication.findUniqueOrThrow({ where: { id: med.id } });
    expect(fresh.isActive).toBe(false);
  });
});

describe("deleteMedication", () => {
  it("removes the medication", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const med = await prisma.medication.create({ data: { catId: cat.id, name: "X" } });
    await deleteMedication(cat.id, med.id);
    expect(await prisma.medication.count()).toBe(0);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/chart.medication.test.ts`
Expected: FAIL — medication functions not exported.

- [ ] **Step 3: Append medication functions to `src/server/chart.ts`**

```ts
const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().optional().default(""),
  schedule: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
});

export async function addMedication(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = medicationSchema.safeParse({
    name: formData.get("name"),
    dosage: formData.get("dosage") ?? "",
    schedule: formData.get("schedule") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.medication.create({
    data: {
      catId,
      name: d.name,
      dosage: d.dosage || null,
      schedule: d.schedule || null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
      isActive: true,
    },
  });
  bump(catId);
  return { ok: true };
}

export async function toggleMedicationActive(catId: string, id: string): Promise<ActionResult> {
  const med = await prisma.medication.findUniqueOrThrow({ where: { id } });
  await prisma.medication.update({ where: { id }, data: { isActive: !med.isActive } });
  bump(catId);
  return { ok: true };
}

export async function deleteMedication(catId: string, id: string): Promise<ActionResult> {
  await prisma.medication.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}
```

- [ ] **Step 4: Extend `src/server/chartActions.ts`**

```ts
"use server";
export { addMedicalRecord, deleteMedicalRecord } from "./chart";
export { addVetAppointment, updateVetStatus, deleteVetAppointment } from "./chart";
export { addMedication, toggleMedicationActive, deleteMedication } from "./chart";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/chart.medication.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write `src/app/admin/cats/[id]/MedicationPanel.tsx`**

```tsx
"use client";
import { addMedication, toggleMedicationActive, deleteMedication } from "@/server/chartActions";

type Med = { id: string; name: string; dosage: string | null; schedule: string | null; isActive: boolean };

export function MedicationPanel({ catId, medications }: { catId: string; medications: Med[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Medications</h2>
      <form action={(fd) => addMedication(catId, fd)} className="mt-2 flex flex-wrap items-end gap-2">
        <input name="name" placeholder="Name" required className="rounded border p-2" />
        <input name="dosage" placeholder="Dosage" className="rounded border p-2" />
        <input name="schedule" placeholder="Schedule" className="rounded border p-2" />
        <input type="date" name="startDate" className="rounded border p-2" />
        <input type="date" name="endDate" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {medications.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-2 text-sm">
            <span className={m.isActive ? "" : "line-through opacity-50"}>
              <b>{m.name}</b>{m.dosage ? ` ${m.dosage}` : ""}{m.schedule ? ` · ${m.schedule}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <button onClick={() => toggleMedicationActive(catId, m.id)} className="underline">{m.isActive ? "Mark inactive" : "Mark active"}</button>
              <button onClick={() => deleteMedication(catId, m.id)} className="text-red-600">Delete</button>
            </span>
          </li>
        ))}
        {medications.length === 0 && <li className="p-2 opacity-60">No medications.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Full suite + build (chart page now compiles — all four panels exist)**

Run: `npm test`
Expected: all green.
Run: `npm run build`
Expected: success; `/admin/cats/[id]` route present.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add medications to cat chart"
```

### Task 29: Foster parents CRUD (TDD)

**Files:**
- Modify: `src/server/fosters.ts` (add `getAllFosters`, `getFosterById`, `createFoster`, `updateFoster`, `deleteFoster`)
- Create: `src/server/fosterActions.ts`, `src/app/admin/fosters/page.tsx`, `src/app/admin/fosters/FosterManager.tsx`
- Test: `src/server/fosters.crud.test.ts`

- [ ] **Step 1: Write the failing test `src/server/fosters.crud.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { createFoster, updateFoster, deleteFoster, getAllFosters } from "./fosters";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("createFoster", () => {
  it("requires a name", async () => {
    const res = await createFoster(form({ name: "" }));
    expect(res.ok).toBe(false);
    expect(res.errors?.name).toBeTruthy();
  });
  it("creates a foster parent with contact details", async () => {
    const res = await createFoster(form({ name: "Pat", email: "pat@x.com", phone: "555", address: "NYC", notes: "n" }));
    expect(res.ok).toBe(true);
    const fp = await prisma.fosterParent.findFirstOrThrow();
    expect(fp.name).toBe("Pat");
    expect(fp.email).toBe("pat@x.com");
  });
});

describe("updateFoster", () => {
  it("updates fields", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    await updateFoster(fp.id, form({ name: "Patricia", email: "p@x.com" }));
    const fresh = await prisma.fosterParent.findUniqueOrThrow({ where: { id: fp.id } });
    expect(fresh.name).toBe("Patricia");
  });
});

describe("deleteFoster", () => {
  it("deletes and nulls the cat's currentFosterParentId", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m", currentFosterParentId: fp.id } });
    await deleteFoster(fp.id);
    expect(await prisma.fosterParent.count()).toBe(0);
    const fresh = await prisma.cat.findUniqueOrThrow({ where: { id: cat.id } });
    expect(fresh.currentFosterParentId).toBeNull();
  });
});

describe("getAllFosters", () => {
  it("returns fosters with their cat counts", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    await prisma.cat.create({ data: { name: "M", slug: "m", currentFosterParentId: fp.id } });
    const all = await getAllFosters();
    expect(all[0]._count.cats).toBe(1);
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/fosters.crud.test.ts`
Expected: FAIL — CRUD functions not exported.

- [ ] **Step 3: Append to `src/server/fosters.ts`**

```ts
import { z } from "zod";
import { revalidatePath } from "@/server/revalidate";
import { type ActionResult, fieldErrors } from "@/lib/validation";

export async function getAllFosters() {
  return prisma.fosterParent.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cats: true } } },
  });
}

export async function getFosterById(id: string) {
  return prisma.fosterParent.findUnique({ where: { id }, include: { cats: true } });
}

const fosterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

function parseFoster(formData: FormData) {
  return fosterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createFoster(formData: FormData): Promise<ActionResult> {
  const parsed = parseFoster(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const fp = await prisma.fosterParent.create({
    data: { name: d.name, email: d.email || null, phone: d.phone || null, address: d.address || null, notes: d.notes || null },
  });
  revalidatePath("/admin/fosters");
  return { ok: true, id: fp.id };
}

export async function updateFoster(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFoster(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.fosterParent.update({
    where: { id },
    data: { name: d.name, email: d.email || null, phone: d.phone || null, address: d.address || null, notes: d.notes || null },
  });
  revalidatePath("/admin/fosters");
  return { ok: true, id };
}

export async function deleteFoster(id: string): Promise<ActionResult> {
  // onDelete: SetNull on Cat.currentFosterParent handles the cat link.
  await prisma.fosterParent.delete({ where: { id } });
  revalidatePath("/admin/fosters");
  return { ok: true };
}
```

- [ ] **Step 4: Write `src/server/fosterActions.ts`**

```ts
"use server";
export { createFoster, updateFoster, deleteFoster } from "./fosters";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/fosters.crud.test.ts`
Expected: PASS (5 tests). (The delete test relies on the `onDelete: SetNull` already in the schema from Task 3.)

- [ ] **Step 6: Write `src/app/admin/fosters/FosterManager.tsx`**

```tsx
"use client";
import { useState } from "react";
import { createFoster, updateFoster, deleteFoster } from "@/server/fosterActions";

type Foster = { id: string; name: string; email: string | null; phone: string | null; address: string | null; notes: string | null; _count: { cats: number } };

export function FosterManager({ fosters }: { fosters: Foster[] }) {
  const [error, setError] = useState<string | undefined>();
  async function onCreate(fd: FormData) {
    const res = await createFoster(fd);
    if (!res.ok) setError(res.errors?.name ?? "Could not add"); else setError(undefined);
  }
  return (
    <div className="space-y-6">
      <form action={onCreate} className="flex flex-wrap items-end gap-2">
        <input name="name" placeholder="Name" required className="rounded border p-2" />
        <input name="email" placeholder="Email" className="rounded border p-2" />
        <input name="phone" placeholder="Phone" className="rounded border p-2" />
        <input name="address" placeholder="Address" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add foster</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </form>

      <ul className="divide-y rounded border">
        {fosters.map((f) => (
          <li key={f.id} className="p-3">
            <form action={(fd) => updateFoster(f.id, fd)} className="flex flex-wrap items-end gap-2">
              <input name="name" defaultValue={f.name} className="rounded border p-2" />
              <input name="email" defaultValue={f.email ?? ""} placeholder="Email" className="rounded border p-2" />
              <input name="phone" defaultValue={f.phone ?? ""} placeholder="Phone" className="rounded border p-2" />
              <input name="address" defaultValue={f.address ?? ""} placeholder="Address" className="rounded border p-2" />
              <input name="notes" defaultValue={f.notes ?? ""} placeholder="Notes" className="rounded border p-2" />
              <span className="text-sm opacity-60">{f._count.cats} cat(s)</span>
              <button type="submit" className="rounded border px-3 py-2">Save</button>
              <button type="button" onClick={() => deleteFoster(f.id)} className="text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {fosters.length === 0 && <li className="p-3 opacity-60">No foster parents yet.</li>}
      </ul>
    </div>
  );
}
```

- [ ] **Step 7: Write `src/app/admin/fosters/page.tsx`**

```tsx
import { getAllFosters } from "@/server/fosters";
import { FosterManager } from "./FosterManager";

export default async function FostersPage() {
  const fosters = await getAllFosters();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Parents</h1>
      <div className="mt-6"><FosterManager fosters={fosters} /></div>
    </section>
  );
}
```

- [ ] **Step 8: Full suite + build**

Run: `npm test`
Expected: all green.
Run: `npm run build`
Expected: success.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add foster parent management"
```

**Phase 3 demo checkpoint:** create a cat, edit its chart, upload a photo, add a medical record + vet appointment + medication, create a foster parent and assign them to the cat.

---

## Phase 4 — Intake management

Goal: staff review foster applications (change status, add notes) and manage supply requests (change status). Demoable: an application submitted from the public site appears in `/admin/applications`, can be moved to `reviewing`/`approved`, and notes persist; a supply request can be moved to `in_progress`/`fulfilled`.

### Task 30: Applications admin (list + status + notes) (TDD)

**Files:**
- Modify: `src/server/applications.ts` (add `getApplications`, `getApplicationById`, `updateApplicationStatus`, `updateApplicationNotes`)
- Create: `src/server/applicationActions.ts`, `src/app/admin/applications/page.tsx`, `src/app/admin/applications/ApplicationsManager.tsx`
- Test: `src/server/applications.admin.test.ts`

- [ ] **Step 1: Write the failing test `src/server/applications.admin.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getApplications, updateApplicationStatus, updateApplicationNotes } from "./applications";

beforeEach(async () => { await resetDb(); });

async function makeApp(status = "new") {
  return prisma.fosterApplication.create({
    data: { applicantName: "Pat", email: "pat@x.com", answers: JSON.stringify({ housing: "Rent" }), status },
  });
}

describe("getApplications", () => {
  it("returns all applications newest first", async () => {
    await makeApp("new");
    await makeApp("approved");
    const apps = await getApplications();
    expect(apps).toHaveLength(2);
  });
  it("filters by status when given", async () => {
    await makeApp("new");
    await makeApp("approved");
    const apps = await getApplications("approved");
    expect(apps).toHaveLength(1);
    expect(apps[0].status).toBe("approved");
  });
});

describe("updateApplicationStatus", () => {
  it("rejects an invalid status", async () => {
    const app = await makeApp();
    const res = await updateApplicationStatus(app.id, "bogus");
    expect(res.ok).toBe(false);
  });
  it("moves an application to reviewing", async () => {
    const app = await makeApp();
    const res = await updateApplicationStatus(app.id, "reviewing");
    expect(res.ok).toBe(true);
    const fresh = await prisma.fosterApplication.findUniqueOrThrow({ where: { id: app.id } });
    expect(fresh.status).toBe("reviewing");
  });
});

describe("updateApplicationNotes", () => {
  it("saves staff notes", async () => {
    const app = await makeApp();
    await updateApplicationNotes(app.id, "called applicant");
    const fresh = await prisma.fosterApplication.findUniqueOrThrow({ where: { id: app.id } });
    expect(fresh.staffNotes).toBe("called applicant");
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/applications.admin.test.ts`
Expected: FAIL — admin functions not exported.

- [ ] **Step 3: Append to `src/server/applications.ts`** (the file currently starts with `"use server"`; admin reads/mutations are added below — keep `"use server"` since all exports here are server-callable)

```ts
import { revalidatePath } from "@/server/revalidate";

export const APPLICATION_STATUSES = ["new", "reviewing", "approved", "declined"] as const;

export async function getApplications(status?: string) {
  return prisma.fosterApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationById(id: string) {
  return prisma.fosterApplication.findUnique({ where: { id } });
}

export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  await prisma.fosterApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/applications");
  return { ok: true };
}

export async function updateApplicationNotes(id: string, notes: string): Promise<ActionResult> {
  await prisma.fosterApplication.update({ where: { id }, data: { staffNotes: notes || null } });
  revalidatePath("/admin/applications");
  return { ok: true };
}
```

> Note: `src/server/applications.ts` already starts with `"use server"` (from Task 14). Server actions must be async — `getApplications`/`getApplicationById` are async, so they're fine to live here. However, a `"use server"` module may only export async functions; the `APPLICATION_STATUSES` const export is NOT allowed. Move the const to a non-`"use server"` module: create `src/server/applicationConstants.ts` with `export const APPLICATION_STATUSES = [...] as const;` and import it here and in the UI.

- [ ] **Step 4: Create `src/server/applicationConstants.ts`** and fix the import

`src/server/applicationConstants.ts`:

```ts
export const APPLICATION_STATUSES = ["new", "reviewing", "approved", "declined"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];
```

Then in `src/server/applications.ts`, remove the inline `APPLICATION_STATUSES` const and instead add at the top imports:

```ts
import { APPLICATION_STATUSES } from "./applicationConstants";
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/applications.admin.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Write `src/server/applicationActions.ts`**

```ts
"use server";
export { updateApplicationStatus, updateApplicationNotes } from "./applications";
```

- [ ] **Step 7: Write `src/app/admin/applications/ApplicationsManager.tsx`**

```tsx
"use client";
import { updateApplicationStatus, updateApplicationNotes } from "@/server/applicationActions";
import { APPLICATION_STATUSES } from "@/server/applicationConstants";

type App = {
  id: string; applicantName: string; email: string; phone: string | null;
  address: string | null; answers: string; status: string; staffNotes: string | null; createdAt: Date;
};

export function ApplicationsManager({ applications }: { applications: App[] }) {
  return (
    <ul className="space-y-4">
      {applications.map((a) => {
        const answers: Record<string, string> = JSON.parse(a.answers || "{}");
        return (
          <li key={a.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{a.applicantName} <span className="opacity-60">({a.email})</span></p>
                <p className="text-sm opacity-60">{a.phone} {a.address}</p>
              </div>
              <select defaultValue={a.status} onChange={(e) => updateApplicationStatus(a.id, e.target.value)} className="rounded border p-2">
                {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(answers).map(([k, v]) => (
                <div key={k}><dt className="font-medium">{k}</dt><dd className="opacity-80">{v}</dd></div>
              ))}
            </dl>
            <form action={(fd) => updateApplicationNotes(a.id, String(fd.get("notes") ?? ""))} className="mt-3 flex gap-2">
              <input name="notes" defaultValue={a.staffNotes ?? ""} placeholder="Staff notes" className="flex-1 rounded border p-2" />
              <button type="submit" className="rounded border px-3 py-2">Save notes</button>
            </form>
          </li>
        );
      })}
      {applications.length === 0 && <li className="opacity-60">No applications yet.</li>}
    </ul>
  );
}
```

- [ ] **Step 8: Write `src/app/admin/applications/page.tsx`**

```tsx
import { getApplications } from "@/server/applications";
import { ApplicationsManager } from "./ApplicationsManager";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Applications</h1>
      <div className="mt-6"><ApplicationsManager applications={applications} /></div>
    </section>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add application review admin"
```

### Task 31: Supply requests admin (list + status) (TDD)

**Files:**
- Modify: `src/server/requests.ts` (add `getSupplyRequests`, `updateRequestStatus`)
- Create: `src/server/requestConstants.ts`, `src/server/requestActions.ts`, `src/app/admin/requests/page.tsx`, `src/app/admin/requests/RequestsManager.tsx`
- Test: `src/server/requests.admin.test.ts`

- [ ] **Step 1: Write the failing test `src/server/requests.admin.test.ts`**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getSupplyRequests, updateRequestStatus } from "./requests";

beforeEach(async () => { await resetDb(); });

async function makeReq(status = "new") {
  return prisma.supplyRequest.create({
    data: { fosterNameText: "Pat", items: JSON.stringify([{ type: "Food", quantity: 1 }]), status },
  });
}

describe("getSupplyRequests", () => {
  it("returns all requests newest first with relations", async () => {
    await makeReq("new");
    await makeReq("fulfilled");
    const reqs = await getSupplyRequests();
    expect(reqs).toHaveLength(2);
    expect(reqs[0]).toHaveProperty("cat");
  });
  it("filters by status", async () => {
    await makeReq("new");
    await makeReq("fulfilled");
    const reqs = await getSupplyRequests("fulfilled");
    expect(reqs).toHaveLength(1);
  });
});

describe("updateRequestStatus", () => {
  it("rejects an invalid status", async () => {
    const r = await makeReq();
    const res = await updateRequestStatus(r.id, "bogus");
    expect(res.ok).toBe(false);
  });
  it("moves a request to in_progress", async () => {
    const r = await makeReq();
    const res = await updateRequestStatus(r.id, "in_progress");
    expect(res.ok).toBe(true);
    const fresh = await prisma.supplyRequest.findUniqueOrThrow({ where: { id: r.id } });
    expect(fresh.status).toBe("in_progress");
  });
});
```

- [ ] **Step 2: Run it — fails**

Run: `npx vitest run src/server/requests.admin.test.ts`
Expected: FAIL — admin functions not exported.

- [ ] **Step 3: Create `src/server/requestConstants.ts`**

```ts
export const REQUEST_STATUSES = ["new", "in_progress", "fulfilled"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];
```

- [ ] **Step 4: Append to `src/server/requests.ts`** (file already starts with `"use server"`; add async exports + import constants/revalidate at top)

Add imports near the top (below the existing imports):

```ts
import { revalidatePath } from "@/server/revalidate";
import { REQUEST_STATUSES } from "./requestConstants";
```

Add at the bottom:

```ts
export async function getSupplyRequests(status?: string) {
  return prisma.supplyRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    include: { cat: true, fosterParent: true },
  });
}

export async function updateRequestStatus(id: string, status: string): Promise<ActionResult> {
  if (!REQUEST_STATUSES.includes(status as (typeof REQUEST_STATUSES)[number])) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  await prisma.supplyRequest.update({ where: { id }, data: { status } });
  revalidatePath("/admin/requests");
  return { ok: true };
}
```

- [ ] **Step 5: Run the test — passes**

Run: `npx vitest run src/server/requests.admin.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 6: Write `src/server/requestActions.ts`**

```ts
"use server";
export { updateRequestStatus } from "./requests";
```

- [ ] **Step 7: Write `src/app/admin/requests/RequestsManager.tsx`**

```tsx
"use client";
import { updateRequestStatus } from "@/server/requestActions";
import { REQUEST_STATUSES } from "@/server/requestConstants";

type Req = {
  id: string; fosterNameText: string | null; notes: string | null; items: string; status: string;
  cat: { name: string } | null; fosterParent: { name: string } | null; createdAt: Date;
};

export function RequestsManager({ requests }: { requests: Req[] }) {
  return (
    <ul className="space-y-4">
      {requests.map((r) => {
        const items: { type: string; quantity: number }[] = JSON.parse(r.items || "[]");
        const who = r.fosterParent?.name ?? r.fosterNameText ?? "Unknown";
        return (
          <li key={r.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{who}{r.cat ? ` — for ${r.cat.name}` : ""}</p>
                <p className="text-sm opacity-70">{items.map((i) => `${i.quantity}× ${i.type}`).join(", ")}</p>
                {r.notes && <p className="text-sm opacity-60">{r.notes}</p>}
              </div>
              <select defaultValue={r.status} onChange={(e) => updateRequestStatus(r.id, e.target.value)} className="rounded border p-2">
                {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </li>
        );
      })}
      {requests.length === 0 && <li className="opacity-60">No supply requests yet.</li>}
    </ul>
  );
}
```

- [ ] **Step 8: Write `src/app/admin/requests/page.tsx`**

```tsx
import { getSupplyRequests } from "@/server/requests";
import { RequestsManager } from "./RequestsManager";

export default async function RequestsPage() {
  const requests = await getSupplyRequests();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Supply Requests</h1>
      <div className="mt-6"><RequestsManager requests={requests} /></div>
    </section>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add supply request management admin"
```

### Task 32: Final integration — full suite, build, README

**Files:**
- Create: `README.md`
- Create: `public/org/logo.svg`, `public/org/sample-cat.svg` (placeholder assets referenced by config/seed)

- [ ] **Step 1: Add placeholder org assets** (so the UI and seed have valid images)

Create `public/org/logo.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="40" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="#7c3aed"/><text x="60" y="25" font-family="sans-serif" font-size="14" fill="#fff" text-anchor="middle">LOGO</text></svg>
```

Create `public/org/sample-cat.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e5e7eb"/><text x="200" y="155" font-family="sans-serif" font-size="20" fill="#6b7280" text-anchor="middle">🐱 cat photo</text></svg>
```

- [ ] **Step 2: Write `README.md`** (clone-and-customize instructions per the spec's central goal)

```markdown
# Cat Foster Template

A reusable website for cat foster organizations: public info, cat gallery,
foster applications, and supply requests, plus a staff back office.

## Make this your org's site

1. **Clone** this repo (or fork it and add `cat-foster-template` as the `upstream` remote).
2. **Edit `org.config.ts`** — name, tagline, colors, contact, fostering requirements,
   application questions, supply item types. No other code needs editing.
3. **Drop your logo** into `public/org/logo.svg` (and replace `sample-cat.svg`).
4. Create `.env` (copy `.env.example`) and set `DATABASE_URL`, `AUTH_SECRET`,
   and the `SEED_STAFF_*` vars.
5. Install + set up the database:
   ```bash
   npm install
   npm run db:migrate      # applies migrations, creates prisma/dev.db
   npm run db:seed         # creates the staff login + sample cats
   npm run dev
   ```
6. Log in at `/admin/login` with your `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD`.

## Receiving template updates

```bash
git fetch upstream
git merge upstream/main
npm install
npm run db:migrate        # applies any new migrations to your DB
```

Your customizations live only in `org.config.ts`, `public/org/`, `prisma/dev.db`,
and `public/uploads/` — all isolated from shared code, so merges stay clean.

## Tests

```bash
npm test                  # Vitest (data-access, actions, auth, components)
```
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET="generate-with: npx auth secret"
SEED_STAFF_EMAIL="staff@example.org"
SEED_STAFF_PASSWORD="changeme123"
SEED_STAFF_NAME="Org Admin"
```

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: all suites pass (org-config, theme, db, cats public/admin/update, applications, requests, password, authorize, dashboard, photos, chart medical/vet/medication, fosters, header, CatCard, ApplicationForm, SupplyRequestForm, LoginForm).

- [ ] **Step 5: Production build**

Run: `npm run build`
Expected: success. Confirm these routes appear: `/`, `/foster`, `/cats`, `/cats/[slug]`, `/apply`, `/request`, `/admin/login`, `/admin`, `/admin/cats`, `/admin/cats/[id]`, `/admin/applications`, `/admin/requests`, `/admin/fosters`.

- [ ] **Step 6: Lint**

Run: `npm run lint`
Expected: no errors. Fix any reported issues.

- [ ] **Step 7: End-to-end manual smoke (optional but recommended)**

Run: `npm run dev`. As a public visitor: submit an application and a supply request. As staff: log in, see them in the dashboard/admin lists, change statuses. Stop server.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "docs: add README, env example, and placeholder org assets"
```

**Phase 4 demo checkpoint:** the whole loop works end-to-end — public submissions land in the back office and staff can triage them.

---

## Self-Review (completed by plan author)

**Spec coverage:**
- Goal 1 (foster requirements info) → Task 11 `/foster`, content from `org.config.fostering`. ✅
- Goal 2 (config-driven application questionnaire) → Tasks 5, 14, 15; questions rendered + stored as keyed JSON. ✅
- Goal 3 (public browsable cat photos) → Tasks 9, 12, 13. ✅
- Goal 4 (staff back-office cat chart: medical, vet, behavior, foster, medication, food+portion) → Tasks 22–28 (chart fields incl. `behaviorNotes`, `foodType`, `foodPortion`, `currentFosterParentId`). ✅
- Goal 5 (foster supply requests; urgent via phone) → Tasks 16, 17, 31; footer + request page note urgent→phone. ✅
- Tenancy/clone-per-org → SQLite per clone, gitignored data, `org.config.ts` isolation, README upstream-merge ritual (Task 32). ✅
- Auth (staff-only, Credentials, bcrypt, seed-from-env) → Tasks 8, 18, 19, 20. ✅
- Data model (all 9 models, JSON blobs for answers/items, string statuses) → Task 3. ✅
- Theming (one file re-skins via CSS vars) → Tasks 5, 6. ✅
- Pages list (public + admin) → all covered; build check in Task 32 enumerates routes. ✅
- Testing (Vitest+RTL from Phase 0, TDD on behavior) → Task 2 + TDD throughout. ✅
- Out-of-scope items (hosting, foster logins, cloud storage, multi-tenant, notifications) → not implemented, as intended. ✅

**Type consistency check:** `ActionResult` shape is consistent across all actions (`{ ok: true, id? } | { ok: false, errors?, message? }`). Status constant arrays (`CAT_STATUSES`, `VET_STATUSES`, `APPLICATION_STATUSES`, `REQUEST_STATUSES`) are each defined once and imported where used. The `"use server"` constraint (only async exports) is explicitly handled by moving status consts into separate `*Constants.ts` modules (Tasks 30–31) and keeping read/read-helpers async. Read functions live in `<entity>.ts`; mutations are re-exported through `<entity>Actions.ts` with `"use server"` — tested by importing the underlying module directly.

**Placeholder scan:** no TBD/TODO/"add error handling"/"similar to Task N" left; every code step contains complete code.

**Known sequencing note:** Task 24 creates `CatChartPage` importing four panels that don't exist until Tasks 25–28; the plan flags not to run `npm run build` until Task 28. Unit tests in 25–28 run independently of the page, so TDD stays green throughout.

---

## Execution Notes

- The `<entity>.ts` + `<entity>Actions.ts` split exists because Next.js forbids mixing `import "server-only"` read helpers and `"use server"` action exports in one module, and because a `"use server"` module may export only async functions. Tests target the read/logic module directly; the Actions module is a thin `"use server"` re-export the client components import.
- If a future Prisma minor changes the better-sqlite3 adapter constructor signature, the only affected files are `src/lib/db.ts` and `prisma/seed.ts`.
- Sources for the Prisma 7 setup used in this plan: [Prisma 7 generators](https://www.prisma.io/docs/orm/prisma-schema/overview/generators), [Migrate to Prisma v7](https://www.prisma.io/docs/ai/prompts/prisma-7).

