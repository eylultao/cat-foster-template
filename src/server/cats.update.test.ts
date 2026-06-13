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
    if (res.ok) throw new Error("expected failure");
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
