import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { createSupplyRequest } from "./requests";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("createSupplyRequest", () => {
  it("rejects when no foster name and no foster id provided", async () => {
    const res = await createSupplyRequest(form({ items: JSON.stringify([{ type: "Food", quantity: 1 }]) }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.fosterNameText).toBeTruthy();
  });

  it("rejects when items list is empty", async () => {
    const res = await createSupplyRequest(form({ fosterNameText: "Pat", items: "[]" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.items).toBeTruthy();
  });

  it("stores items JSON and defaults status to new", async () => {
    const res = await createSupplyRequest(form({
      fosterNameText: "Pat",
      items: JSON.stringify([{ type: "Food", quantity: 2 }, { type: "Litter", quantity: 1 }]),
      notes: "thanks",
    }));
    expect(res.ok).toBe(true);
    const sr = await prisma.supplyRequest.findFirstOrThrow();
    expect(sr.status).toBe("new");
    expect(JSON.parse(sr.items)).toHaveLength(2);
    expect(sr.fosterNameText).toBe("Pat");
  });

  it("links to a foster parent and cat by id when provided", async () => {
    const fp = await prisma.fosterParent.create({ data: { name: "Pat" } });
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await createSupplyRequest(form({
      fosterParentId: fp.id, catId: cat.id,
      items: JSON.stringify([{ type: "Food", quantity: 1 }]),
    }));
    expect(res.ok).toBe(true);
    const sr = await prisma.supplyRequest.findFirstOrThrow();
    expect(sr.fosterParentId).toBe(fp.id);
    expect(sr.catId).toBe(cat.id);
  });
});
