# Cat Foster Template

A reusable website for cat foster organizations: public info, an adoptable-cat
gallery, foster applications, and supply requests — plus a staff back office for
managing cats (medical records, vet appointments, medications, photos), foster
parents, applications, and supply requests.

Built with Next.js 16 (App Router) + Prisma 7 + SQLite + Auth.js v5 + Tailwind CSS v4.

## Make this your org's site

1. **Clone** this repo (or fork it and add `cat-foster-template` as an `upstream` remote).
2. **Edit `org.config.ts`** — name, tagline, colors, contact info, fostering
   requirements, application questions, and supply item types. No other code needs editing.
3. **Drop in your branding**: replace `public/org/logo.svg` and `public/org/sample-cat.svg`.
4. **Create `.env`** (copy `.env.example`) and set `DATABASE_URL`, `AUTH_SECRET`
   (run `npx auth secret`), and the `SEED_STAFF_*` vars.
5. **Install + set up the database**:
   ```bash
   npm install
   npm run db:migrate      # applies migrations, creates prisma/dev.db
   npm run db:seed         # creates the staff login + sample cats
   npm run dev             # http://localhost:3000
   ```
6. **Log in** at `/admin/login` with your `SEED_STAFF_EMAIL` / `SEED_STAFF_PASSWORD`.
   Change the seeded password before going live.

## Theming

All colors come from `org.config.ts` (`theme.colors`) and feed Tailwind via CSS
variables, so editing that one file re-skins the whole site. Choose a `primary`
color dark enough for white button text to stay readable (WCAG AA).

## Receiving template updates

```bash
git fetch upstream
git merge upstream/main
npm install
npm run db:migrate        # applies any new migrations to your DB
```

Your customizations live only in `org.config.ts`, `public/org/`, `prisma/dev.db`,
and `public/uploads/` — all isolated from shared code, so merges stay clean.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm start          # serve the production build
npm test           # Vitest (data-access, server actions, auth, components)
npm run lint       # ESLint
npm run db:migrate # Prisma migrate dev
npm run db:seed    # seed staff user + sample cats
npm run db:studio  # Prisma Studio
```

## Notes

- Urgent matters are directed to the org's phone, not the site (per the footer + request form).
- Image uploads are stored on the local filesystem under `public/uploads/cats/` (swappable for cloud storage later).
- Hosting/CI/CD are out of scope for this proof-of-concept.
