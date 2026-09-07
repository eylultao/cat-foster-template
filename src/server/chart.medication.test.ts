import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addMedication, toggleMedicationActive, deleteMedication } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addMedication", () => {
  it("requires a name", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addMedication(cat.id, form({ name: "" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.name).toBeTruthy();
  });
  it("creates an active medication with optional dates", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addMedication(cat.id, form({
      name: "Amoxicillin", dosage: "50mg", schedule: "2x/day", startDate: "2026-01-01",
    }));
    expect(res.ok).toBe(true);
    const med = await prisma.medication.findFirstOrThrow();
    expect(med.name).toBe("Amoxicillin");
    expect(med.isActive).toBe(true);
    expect(med.startDate?.toISOString().startsWith("2026-01-01")).toBe(true);
  });
});

describe("toggleMedicationActive", () => {
  it("flips the active flag", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const med = await prisma.medication.create({ data: { catId: cat.id, name: "X", isActive: true } });
    await toggleMedicationActive(cat.id, med.id);
    const fresh = await prisma.medication.findUniqueOrThrow({ where: { id: med.id } });
    expect(fresh.isActive).toBe(false);
  });
});

describe("deleteMedication", () => {
  it("removes the medication", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const med = await prisma.medication.create({ data: { catId: cat.id, name: "X" } });
    await deleteMedication(cat.id, med.id);
    expect(await prisma.medication.count()).toBe(0);
  });
});
