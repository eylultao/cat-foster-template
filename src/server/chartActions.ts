"use server";
import {
  addMedicalRecord as addMedicalRecordImpl,
  deleteMedicalRecord as deleteMedicalRecordImpl,
} from "./chart";
import type { ActionResult } from "@/lib/validation";

export async function addMedicalRecord(catId: string, formData: FormData): Promise<ActionResult> {
  return addMedicalRecordImpl(catId, formData);
}
export async function deleteMedicalRecord(catId: string, id: string): Promise<ActionResult> {
  return deleteMedicalRecordImpl(catId, id);
}
