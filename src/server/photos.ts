import "server-only";
import { writeFile, mkdir, unlink } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/db";
import { revalidatePath } from "@/server/revalidate";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "cats");

export async function addPhotoRecord(catId: string, url: string, caption?: string) {
  const existing = await prisma.catPhoto.count({ where: { catId } });
  await prisma.catPhoto.create({
    data: { catId, url, caption: caption || null, isPrimary: existing === 0 },
  });
  revalidatePath(`/admin/cats/${catId}`);
}

export async function uploadPhoto(catId: string, file: File, caption?: string) {
  if (!file || file.size === 0) return { ok: false as const, message: "No file selected" };
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = path.extname(file.name) || ".jpg";
  const safe = `${catId}-${Date.now()}${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, safe), bytes);
  const url = `/uploads/cats/${safe}`;
  await addPhotoRecord(catId, url, caption);
  return { ok: true as const, url };
}

export async function setPrimaryPhoto(catId: string, photoId: string) {
  await prisma.$transaction([
    prisma.catPhoto.updateMany({ where: { catId }, data: { isPrimary: false } }),
    prisma.catPhoto.update({ where: { id: photoId }, data: { isPrimary: true } }),
  ]);
  revalidatePath(`/admin/cats/${catId}`);
}

export async function deletePhoto(catId: string, photoId: string) {
  const photo = await prisma.catPhoto.findUnique({ where: { id: photoId } });
  if (photo?.url?.startsWith("/uploads/")) {
    await unlink(path.join(process.cwd(), "public", photo.url)).catch(() => {});
  }
  await prisma.catPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/admin/cats/${catId}`);
}
