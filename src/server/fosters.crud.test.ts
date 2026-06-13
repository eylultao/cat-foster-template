import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { createFoster, updateFoster, deleteFoster, getAllFosters } from "./fosters";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("createFoster", () => {
  it("requires a name", async () => {
    const res = await createFoster(form({ name: "" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.name).toBeTruthy();
  });
  it("creates a foster parent with contact details", async () => {
    const res = await createFoster(form({ name: "Pat", email: "pat@x.com", phone: "555", address: "NYC", notes: "n" }));
    expect(res.ok).toBe(true);
    const fp = await prisma.fosterParent.findFirstOrThrow();
    expect(fp.name).toBe("Pat");
    expect(fp.email).toBe("pat@x.com");
  });
});

describe("updateFoster", () => {
  it("updates fields", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    await updateFoster(fp.id, form({ name: "Patricia", email: "p@x.com" }));
    const fresh = await prisma.fosterParent.findUniqueOrThrow({ where: { id: fp.id } });
    expect(fresh.name).toBe("Patricia");
  });
});

describe("deleteFoster", () => {
  it("deletes and nulls the cat's currentFosterParentId", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m", currentFosterParentId: fp.id } });
    await deleteFoster(fp.id);
    expect(await prisma.fosterParent.count()).toBe(0);
    const fresh = await prisma.cat.findUniqueOrThrow({ where: { id: cat.id } });
    expect(fresh.currentFosterParentId).toBeNull();
  });
});

describe("getAllFosters", () => {
  it("returns fosters with their cat counts", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    await prisma.cat.create({ data: { name: "M", slug: "m", currentFosterParentId: fp.id } });
    const all = await getAllFosters();
    expect(all[0]._count.cats).toBe(1);
  });
});
