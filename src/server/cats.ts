import "server-only";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";
import { z } from "zod";
import { type ActionResult, fieldErrors } from "@/lib/validation";

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
