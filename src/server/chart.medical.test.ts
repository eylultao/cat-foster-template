import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addMedicalRecord, deleteMedicalRecord } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addMedicalRecord", () => {
  it("rejects when type or description missing", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await addMedicalRecord(cat.id, form({ date: "2026-01-01", type: "" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.type).toBeTruthy();
  });

  it("creates a record with a parsed date", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const res = await addMedicalRecord(cat.id, form({
      date: "2026-01-15", type: "Vaccination", description: "FVRCP", vetName: "Dr. Lee",
    }));
    expect(res.ok).toBe(true);
    const rec = await prisma.medicalRecord.findFirstOrThrow();
    expect(rec.type).toBe("Vaccination");
    expect(rec.date.toISOString().startsWith("2026-01-15")).toBe(true);
  });
});

describe("deleteMedicalRecord", () => {
  it("removes the record", async () => {
    const cat = await prisma.cat.create({ data: { name: "Mochi", slug: "mochi" } });
    const rec = await prisma.medicalRecord.create({ data: { catId: cat.id, date: new Date(), type: "X", description: "Y" } });
    await deleteMedicalRecord(cat.id, rec.id);
    expect(await prisma.medicalRecord.count()).toBe(0);
  });
});
