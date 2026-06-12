import { describe, it, expect, beforeEach } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";
import { getPublicCats, getCatBySlug } from "./cats";

beforeEach(async () => { await resetDb(); });

async function makeCat(over: Partial<{ name: string; slug: string; status: string }> = {}) {
  return prisma.cat.create({
    data: {
      name: over.name ?? "Mochi",
      slug: over.slug ?? "mochi",
      status: over.status ?? "available",
    },
  });
}

describe("getPublicCats", () => {
  it("returns available and pending cats, not not_listed", async () => {
    await makeCat({ slug: "a", status: "available" });
    await makeCat({ slug: "b", status: "pending" });
    await makeCat({ slug: "c", status: "not_listed" });
    const cats = await getPublicCats();
    expect(cats.map((c) => c.slug).sort()).toEqual(["a", "b"]);
  });

  it("includes the primary photo when present", async () => {
    const cat = await makeCat({ slug: "withphoto" });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/x.jpg", isPrimary: true } });
    const cats = await getPublicCats();
    expect(cats[0].primaryPhotoUrl).toBe("/x.jpg");
  });
});

describe("getCatBySlug", () => {
  it("returns the cat with all photos", async () => {
    const cat = await makeCat({ slug: "mochi" });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/1.jpg", isPrimary: true } });
    await prisma.catPhoto.create({ data: { catId: cat.id, url: "/2.jpg" } });
    const found = await getCatBySlug("mochi");
    expect(found?.photos).toHaveLength(2);
  });

  it("returns null for a not_listed cat", async () => {
    await makeCat({ slug: "hidden", status: "not_listed" });
    expect(await getCatBySlug("hidden")).toBeNull();
  });
});
