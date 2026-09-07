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
