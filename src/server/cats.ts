import "server-only";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";
import { z } from "zod";
import { type ActionResult, fieldErrors } from "@/lib/validation";
import { CAT_STATUSES, type CatStatus } from "./catConstants";

const PUBLIC_STATUSES = ["available", "pending", "adopted"];

export async function getPublicCats() {
  const cats = await prisma.cat.findMany({
    where: { status: { in: PUBLIC_STATUSES } },
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });
  return cats.map((c) => ({
    ...c,
    primaryPhotoUrl: c.photos[0]?.url ?? null,
  }));
}

export async function getCatBySlug(slug: string) {
  const cat = await prisma.cat.findUnique({
    where: { slug },
    include: { photos: { orderBy: { isPrimary: "desc" } } },
  });
  if (!cat || cat.status === "not_listed") return null;
  return cat;
}

export async function getCatOptions() {
  return prisma.cat.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  const root = base || "cat";
  let candidate = root;
  let n = 1;
  while (await prisma.cat.findUnique({ where: { slug: candidate } })) {
    n += 1;
    candidate = `${root}-${n}`;
  }
  return candidate;
}

export async function getAllCats() {
  return prisma.cat.findMany({
    orderBy: { createdAt: "desc" },
    include: { photos: { where: { isPrimary: true }, take: 1 } },
  });
}

const createSchema = z.object({ name: z.string().min(1, "Name is required") });

export async function createCat(formData: FormData): Promise<ActionResult> {
  const parsed = createSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const slug = await uniqueSlug(slugify(parsed.data.name));
  const cat = await prisma.cat.create({ data: { name: parsed.data.name, slug } });
  revalidatePath("/admin/cats");
  return { ok: true, id: cat.id };
}

export async function getCatById(id: string) {
  return prisma.cat.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { isPrimary: "desc" } },
      medicalRecords: { orderBy: { date: "desc" } },
      vetAppointments: { orderBy: { datetime: "desc" } },
      medications: { orderBy: { createdAt: "desc" } },
      currentFosterParent: true,
    },
  });
}

const updateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.string().min(1, "Status is required"),
  breed: z.string().optional().default(""),
  age: z.string().optional().default(""),
  sex: z.string().optional().default(""),
  publicBio: z.string().optional().default(""),
  behaviorNotes: z.string().optional().default(""),
  foodType: z.string().optional().default(""),
  foodPortion: z.string().optional().default(""),
  currentFosterParentId: z.string().optional().default(""),
});

export async function updateCat(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = updateSchema.safeParse({
    name: formData.get("name"),
    status: formData.get("status"),
    breed: formData.get("breed") ?? "",
    age: formData.get("age") ?? "",
    sex: formData.get("sex") ?? "",
    publicBio: formData.get("publicBio") ?? "",
    behaviorNotes: formData.get("behaviorNotes") ?? "",
    foodType: formData.get("foodType") ?? "",
    foodPortion: formData.get("foodPortion") ?? "",
    currentFosterParentId: formData.get("currentFosterParentId") ?? "",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  // Robust status validation (avoids zod-4 readonly-tuple friction with z.enum):
  if (!CAT_STATUSES.includes(parsed.data.status as CatStatus)) {
    return { ok: false, errors: { status: "Invalid status" } };
  }
  const d = parsed.data;
  await prisma.cat.update({
    where: { id },
    data: {
      name: d.name,
      status: d.status,
      breed: d.breed || null,
      age: d.age || null,
      sex: d.sex || null,
      publicBio: d.publicBio || null,
      behaviorNotes: d.behaviorNotes || null,
      foodType: d.foodType || null,
      foodPortion: d.foodPortion || null,
      currentFosterParentId: d.currentFosterParentId || null,
    },
  });
  revalidatePath(`/admin/cats/${id}`);
  return { ok: true, id };
}
