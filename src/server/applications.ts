import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { org } from "@/org";
import { revalidatePath } from "@/server/revalidate";
import { type ActionResult, fieldErrors } from "@/lib/validation";
import { APPLICATION_STATUSES } from "./applicationConstants";

const baseSchema = z.object({
  applicantName: z.string().min(1, "Your name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
});

export async function createApplication(formData: FormData): Promise<ActionResult> {
  const parsed = baseSchema.safeParse({
    applicantName: formData.get("applicantName"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  // Collect configured questions from `q_<id>` form fields.
  const answers: Record<string, string> = {};
  for (const q of org.application.questions) {
    const raw = formData.get(`q_${q.id}`);
    if (q.required && (raw == null || String(raw).trim() === "")) {
      return { ok: false, errors: { [`q_${q.id}`]: `${q.label} is required` } };
    }
    if (raw != null) answers[q.id] = String(raw);
  }

  const created = await prisma.fosterApplication.create({
    data: {
      applicantName: parsed.data.applicantName,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      address: parsed.data.address || null,
      answers: JSON.stringify(answers),
      status: "new",
    },
  });
  return { ok: true, id: created.id };
}

export async function getApplications(status?: string) {
  return prisma.fosterApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplicationById(id: string) {
  return prisma.fosterApplication.findUnique({ where: { id } });
}

export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  if (!APPLICATION_STATUSES.includes(status as (typeof APPLICATION_STATUSES)[number])) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  await prisma.fosterApplication.update({ where: { id }, data: { status } });
  revalidatePath("/admin/applications");
  return { ok: true };
}

export async function updateApplicationNotes(id: string, notes: string): Promise<ActionResult> {
  await prisma.fosterApplication.update({ where: { id }, data: { staffNotes: notes || null } });
  revalidatePath("/admin/applications");
  return { ok: true };
}
