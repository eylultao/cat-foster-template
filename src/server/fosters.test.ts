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
