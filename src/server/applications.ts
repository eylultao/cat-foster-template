"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { org } from "@/org";
import { type ActionResult, fieldErrors } from "@/lib/validation";

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
