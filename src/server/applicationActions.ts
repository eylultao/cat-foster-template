"use server";
import {
  createApplication as createApplicationImpl,
  updateApplicationStatus as updateApplicationStatusImpl,
  updateApplicationNotes as updateApplicationNotesImpl,
} from "./applications";
import type { ActionResult } from "@/lib/validation";

export async function createApplication(formData: FormData): Promise<ActionResult> {
  return createApplicationImpl(formData);
}
export async function updateApplicationStatus(id: string, status: string): Promise<ActionResult> {
  return updateApplicationStatusImpl(id, status);
}
export async function updateApplicationNotes(id: string, notes: string): Promise<ActionResult> {
  return updateApplicationNotesImpl(id, notes);
}
