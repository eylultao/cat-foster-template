import "server-only";
import { prisma } from "@/lib/db";
import { z } from "zod";
import { revalidatePath } from "@/server/revalidate";
import { type ActionResult, fieldErrors } from "@/lib/validation";

export async function getFosterOptions() {
  return prisma.fosterParent.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getAllFosters() {
  return prisma.fosterParent.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { cats: true } } },
  });
}

export async function getFosterById(id: string) {
  return prisma.fosterParent.findUnique({ where: { id }, include: { cats: true } });
}

const fosterSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
});

function parseFoster(formData: FormData) {
  return fosterSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone") ?? "",
    address: formData.get("address") ?? "",
    notes: formData.get("notes") ?? "",
  });
}

export async function createFoster(formData: FormData): Promise<ActionResult> {
  const parsed = parseFoster(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  const fp = await prisma.fosterParent.create({
    data: { name: d.name, email: d.email || null, phone: d.phone || null, address: d.address || null, notes: d.notes || null },
  });
  revalidatePath("/admin/fosters");
  return { ok: true, id: fp.id };
}

export async function updateFoster(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseFoster(formData);
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const d = parsed.data;
  await prisma.fosterParent.update({
    where: { id },
    data: { name: d.name, email: d.email || null, phone: d.phone || null, address: d.address || null, notes: d.notes || null },
  });
  revalidatePath("/admin/fosters");
  return { ok: true, id };
}

export async function deleteFoster(id: string): Promise<ActionResult> {
  // Cat.currentFosterParent has onDelete: SetNull, so deleting the foster nulls the cat link.
  await prisma.fosterParent.delete({ where: { id } });
  revalidatePath("/admin/fosters");
  return { ok: true };
}
