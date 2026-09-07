import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    // DB-backed tests share a single SQLite file (test.db) and reset it in
    // beforeEach; running test files in parallel races those resets. Serialize
    // file execution so each file's resetDb()/queries don't clobber others.
    fileParallelism: false,
    setupFiles: ["./vitest.setup.ts"],
    globalSetup: ["./vitest.global-setup.ts"],
    env: { DATABASE_URL: "file:./prisma/test.db" },
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test/empty-module.ts", import.meta.url)),
      "client-only": fileURLToPath(new URL("./src/test/empty-module.ts", import.meta.url)),
    },
  },
});
