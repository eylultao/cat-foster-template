import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { hashPassword } from "@/lib/password";
import { authorizeStaff } from "@/lib/authorize";

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
