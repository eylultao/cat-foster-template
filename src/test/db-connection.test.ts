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
