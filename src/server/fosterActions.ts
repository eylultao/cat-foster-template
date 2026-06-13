"use server";
import {
  createFoster as createFosterImpl,
  updateFoster as updateFosterImpl,
  deleteFoster as deleteFosterImpl,
} from "./fosters";
import type { ActionResult } from "@/lib/validation";

export async function createFoster(formData: FormData): Promise<ActionResult> {
  return createFosterImpl(formData);
}
export async function updateFoster(id: string, formData: FormData): Promise<ActionResult> {
  return updateFosterImpl(id, formData);
}
export async function deleteFoster(id: string): Promise<ActionResult> {
  return deleteFosterImpl(id);
}
