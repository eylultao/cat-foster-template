import { describe, it, expect, beforeEach, vi } from "vitest";
import { prisma } from "@/lib/db";
import { resetDb } from "@/test/db";

vi.mock("@/server/revalidate", () => ({ revalidatePath: vi.fn() }));

import { addVetAppointment, updateVetStatus, deleteVetAppointment } from "./chart";

beforeEach(async () => { await resetDb(); });

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

describe("addVetAppointment", () => {
  it("requires datetime and reason", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addVetAppointment(cat.id, form({ datetime: "", reason: "" }));
    expect(res.ok).toBe(false);
    if (res.ok) throw new Error("expected failure");
    expect(res.errors?.datetime).toBeTruthy();
  });

  it("creates a scheduled appointment", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const res = await addVetAppointment(cat.id, form({
      datetime: "2026-02-01T09:30", reason: "Checkup", location: "Clinic",
    }));
    expect(res.ok).toBe(true);
    const appt = await prisma.vetAppointment.findFirstOrThrow();
    expect(appt.status).toBe("scheduled");
    expect(appt.reason).toBe("Checkup");
  });
});

describe("updateVetStatus", () => {
  it("rejects an invalid status", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    const res = await updateVetStatus(cat.id, appt.id, "bogus");
    expect(res.ok).toBe(false);
  });
  it("moves an appointment to completed", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    const res = await updateVetStatus(cat.id, appt.id, "completed");
    expect(res.ok).toBe(true);
    const fresh = await prisma.vetAppointment.findUniqueOrThrow({ where: { id: appt.id } });
    expect(fresh.status).toBe("completed");
  });
});

describe("deleteVetAppointment", () => {
  it("removes the appointment", async () => {
    const cat = await prisma.cat.create({ data: { name: "M", slug: "m" } });
    const appt = await prisma.vetAppointment.create({ data: { catId: cat.id, datetime: new Date(), reason: "x" } });
    await deleteVetAppointment(cat.id, appt.id);
    expect(await prisma.vetAppointment.count()).toBe(0);
  });
});
