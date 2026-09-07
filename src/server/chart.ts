import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";
import { type ActionResult, fieldErrors } from "@/lib/validation";

function bump(catId: string) { revalidatePath(`/admin/cats/${catId}`); }

const medicalSchema = z.object({
  date: z.string().min(1, "Date is required"),
  type: z.string().min(1, "Type is required"),
  description: z.string().min(1, "Description is required"),
  vetName: z.string().optional().default(""),
});

export async function addMedicalRecord(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = medicalSchema.safeParse({
    date: formData.get("date"),
    type: formData.get("type"),
    description: formData.get("description"),
    vetName: formData.get("vetName") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await prisma.medicalRecord.create({
    data: {
      catId,
      date: new Date(parsed.data.date),
      type: parsed.data.type,
      description: parsed.data.description,
      vetName: parsed.data.vetName || null,
    },
  });
  bump(catId);
  return { ok: true };
}

export async function deleteMedicalRecord(catId: string, id: string): Promise<ActionResult> {
  await prisma.medicalRecord.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}

export const VET_STATUSES = ["scheduled", "completed", "cancelled"] as const;

const vetSchema = z.object({
  datetime: z.string().min(1, "Date/time is required"),
  reason: z.string().min(1, "Reason is required"),
  location: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

export async function addVetAppointment(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = vetSchema.safeParse({
    datetime: formData.get("datetime"),
    reason: formData.get("reason"),
    location: formData.get("location") ?? "",
    notes: formData.get("notes") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  await prisma.vetAppointment.create({
    data: {
      catId,
      datetime: new Date(parsed.data.datetime),
      reason: parsed.data.reason,
      location: parsed.data.location || null,
      notes: parsed.data.notes || null,
      status: "scheduled",
    },
  });
  bump(catId);
  return { ok: true };
}

export async function updateVetStatus(catId: string, id: string, status: string): Promise<ActionResult> {
  if (!VET_STATUSES.includes(status as (typeof VET_STATUSES)[number])) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  await prisma.vetAppointment.update({ where: { id }, data: { status } });
  bump(catId);
  return { ok: true };
}

export async function deleteVetAppointment(catId: string, id: string): Promise<ActionResult> {
  await prisma.vetAppointment.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}

const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().optional().default(""),
  schedule: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
});

export async function addMedication(catId: string, formData: FormData): Promise<ActionResult> {
  const parsed = medicationSchema.safeParse({
    name: formData.get("name"),
    dosage: formData.get("dosage") ?? "",
    schedule: formData.get("schedule") ?? "",
    startDate: formData.get("startDate") ?? "",
    endDate: formData.get("endDate") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.medication.create({
    data: {
      catId,
      name: d.name,
      dosage: d.dosage || null,
      schedule: d.schedule || null,
      startDate: d.startDate ? new Date(d.startDate) : null,
      endDate: d.endDate ? new Date(d.endDate) : null,
      isActive: true,
    },
  });
  bump(catId);
  return { ok: true };
}

export async function toggleMedicationActive(catId: string, id: string): Promise<ActionResult> {
  const med = await prisma.medication.findUniqueOrThrow({ where: { id } });
  await prisma.medication.update({ where: { id }, data: { isActive: !med.isActive } });
  bump(catId);
  return { ok: true };
}

export async function deleteMedication(catId: string, id: string): Promise<ActionResult> {
  await prisma.medication.delete({ where: { id } });
  bump(catId);
  return { ok: true };
}
