"use server";
import { createCat as createCatImpl } from "./cats";
import type { ActionResult } from "@/lib/validation";

export async function createCat(formData: FormData): Promise<ActionResult> {
  return createCatImpl(formData);
}
