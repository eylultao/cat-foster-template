import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));
vi.mock("node:fs/promises", () => {
  const mocks = {
    mkdir: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    unlink: vi.fn().mockResolvedValue(undefined),
  };
  return { ...mocks, default: mocks };
});

import { addPhotoRecord, setPrimaryPhoto, deletePhoto } from "./photos";

beforeEach(async () => { await resetDb(); });

describe("addPhotoRecord", () => {
  it("creates a photo and makes the first one primary", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    await addPhotoRecord(cat.id, "/uploads/cats/a.jpg", "first");
    const photos = await prisma.catPhoto.findMany({ where: { catId: cat.id } });
    expect(photos).toHaveLength(1);
    expect(photos[0].isPrimary).toBe(true);
  });

  it("does not auto-promote the second photo", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    await addPhotoRecord(cat.id, "/uploads/cats/a.jpg");
    await addPhotoRecord(cat.id, "/uploads/cats/b.jpg");
    const primaries = await prisma.catPhoto.findMany({ where: { catId: cat.id, isPrimary: true } });
    expect(primaries).toHaveLength(1);
  });
});

describe("setPrimaryPhoto", () => {
  it("moves primary flag to the chosen photo", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const p1 = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/a.jpg", isPrimary: true } });
    const p2 = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/b.jpg" } });
    await setPrimaryPhoto(cat.id, p2.id);
    const fresh = await prisma.catPhoto.findMany({ where: { catId: cat.id } });
    expect(fresh.find((p) => p.id === p1.id)?.isPrimary).toBe(false);
    expect(fresh.find((p) => p.id === p2.id)?.isPrimary).toBe(true);
  });
});

describe("deletePhoto", () => {
  it("removes the photo record", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const p = await prisma.catPhoto.create({ data: { catId: cat.id, url: "/uploads/cats/a.jpg" } });
    await deletePhoto(cat.id, p.id);
    expect(await prisma.catPhoto.count()).toBe(0);
  });
});
