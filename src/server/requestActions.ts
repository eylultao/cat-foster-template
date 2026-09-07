"use server";
import {
  createSupplyRequest as createSupplyRequestImpl,
  updateRequestStatus as updateRequestStatusImpl,
} from "./requests";
import type { ActionResult } from "@/lib/validation";

export async function createSupplyRequest(formData: FormData): Promise<ActionResult> {
  return createSupplyRequestImpl(formData);
}
export async function updateRequestStatus(id: string, status: string): Promise<ActionResult> {
  return updateRequestStatusImpl(id, status);
}
