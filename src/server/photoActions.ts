"use server";
import { uploadPhoto, setPrimaryPhoto, deletePhoto } from "./photos";

export async function uploadPhotoAction(catId: string, formData: FormData) {
  const file = formData.get("file") as File | null;
  if (!file) return { ok: false as const, message: "No file" };
  return uploadPhoto(catId, file, String(formData.get("caption") ?? ""));
}

export async function setPrimaryAction(catId: string, photoId: string) {
  await setPrimaryPhoto(catId, photoId);
}
export async function deletePhotoAction(catId: string, photoId: string) {
  await deletePhoto(catId, photoId);
}
