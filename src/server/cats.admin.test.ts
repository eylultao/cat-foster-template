import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { getAllCats, createCat, slugify } from "./cats";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Mr. Whiskers 2")).toBe("mr-whiskers-2");
  });
});

describe("createCat", () => {
  it("rejects a blank name", async () => {
    const res = await createCat(form({ name: "" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.name).toBeTruthy();
  });

  it("creates a cat with a unique slug derived from the name", async () => {
    const res = await createCat(form({ name: "Mochi" }));
    expect(res.ok).toBe(true);
    const cat = await prisma.cat.findFirstOrThrow();
    expect(cat.slug).toBe("mochi");
    expect(cat.status).toBe("available");
  });

  it("disambiguates a duplicate slug", async () => {
    await createCat(form({ name: "Mochi" }));
    await createCat(form({ name: "Mochi" }));
    const slugs = (await prisma.cat.findMany()).map((c) => c.slug).sort();
    expect(slugs).toEqual(["mochi", "mochi-2"]);
  });
});

describe("getAllCats", () => {
  it("returns every cat regardless of status", async () => {
    await prisma.cat.create({ data: { name: "Hidden", slug: "hidden", status: "not_listed" } });
    const cats = await getAllCats();
    expect(cats).toHaveLength(1);
  });
});
