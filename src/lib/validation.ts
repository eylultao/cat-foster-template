export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; errors?: Record<string, string>; message?: string };

import { z } from "zod";

export function fieldErrors(err: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
