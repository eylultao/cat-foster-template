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
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.applicantName).toBeTruthy();
    expect(await prisma.fosterApplication.count()).toBe(0);
  });

  it("rejects an invalid email", async () => {
    const res = await createApplication(form({ applicantName: "Pat", email: "notanemail" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
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
