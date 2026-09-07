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
