"use server";
import { createCat as createCatImpl, updateCat as updateCatImpl } from "./cats";
import type { ActionResult } from "@/lib/validation";

export async function createCat(formData: FormData): Promise<ActionResult> {
  return createCatImpl(formData);
}

export async function updateCat(id: string, formData: FormData): Promise<ActionResult> {
  return updateCatImpl(id, formData);
}
