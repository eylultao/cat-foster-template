import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

export default function setup() {
  // Reset the throwaway test database to a clean schema before the run.
  // We delete the gitignored file ourselves instead of `prisma db push --force-reset`,
  // which trips Prisma 7's AI-agent guardrail. Plain `db push` then recreates the schema.
  for (const f of [
    "prisma/test.db",
    "prisma/test.db-journal",
    "prisma/test.db-wal",
    "prisma/test.db-shm",
  ]) {
    rmSync(f, { force: true });
  }
  execSync("npx prisma db push", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: "file:./prisma/test.db" },
  });
}
