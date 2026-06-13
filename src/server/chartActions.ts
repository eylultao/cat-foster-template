"use server";
import {
  addMedicalRecord as addMedicalRecordImpl,
  deleteMedicalRecord as deleteMedicalRecordImpl,
  addVetAppointment as addVetAppointmentImpl,
  updateVetStatus as updateVetStatusImpl,
  deleteVetAppointment as deleteVetAppointmentImpl,
} from "./chart";
import type { ActionResult } from "@/lib/validation";

export async function addMedicalRecord(catId: string, formData: FormData): Promise<ActionResult> {
  return addMedicalRecordImpl(catId, formData);
}
export async function deleteMedicalRecord(catId: string, id: string): Promise<ActionResult> {
  return deleteMedicalRecordImpl(catId, id);
}
export async function addVetAppointment(catId: string, formData: FormData): Promise<ActionResult> {
  return addVetAppointmentImpl(catId, formData);
}
export async function updateVetStatus(catId: string, id: string, status: string): Promise<ActionResult> {
  return updateVetStatusImpl(catId, id, status);
}
export async function deleteVetAppointment(catId: string, id: string): Promise<ActionResult> {
  return deleteVetAppointmentImpl(catId, id);
}
