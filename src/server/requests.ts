"use server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { type ActionResult, fieldErrors } from "@/lib/validation";

const itemSchema = z.object({
  type: z.string().min(1),
  quantity: z.coerce.number().int().min(1),
});

const schema = z.object({
  fosterParentId: z.string().optional().default(""),
  fosterNameText: z.string().optional().default(""),
  catId: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  items: z.string(),
}).superRefine((val, ctx) => {
  if (!val.fosterParentId && !val.fosterNameText.trim()) {
    ctx.addIssue({ code: "custom", path: ["fosterNameText"], message: "Tell us who is requesting (name or selected foster)" });
  }
  let parsed: unknown;
  try { parsed = JSON.parse(val.items); } catch { parsed = null; }
  const arr = itemSchema.array().safeParse(parsed);
  if (!arr.success || arr.data.length === 0) {
    ctx.addIssue({ code: "custom", path: ["items"], message: "Add at least one supply item" });
  }
});

export async function createSupplyRequest(formData: FormData): Promise<ActionResult> {
  const parsed = schema.safeParse({
    fosterParentId: formData.get("fosterParentId") ?? "",
    fosterNameText: formData.get("fosterNameText") ?? "",
    catId: formData.get("catId") ?? "",
    notes: formData.get("notes") ?? "",
    items: formData.get("items") ?? "[]",
  });
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };

  const items = itemSchema.array().parse(JSON.parse(parsed.data.items));
  const created = await prisma.supplyRequest.create({
    data: {
      fosterParentId: parsed.data.fosterParentId || null,
      fosterNameText: parsed.data.fosterNameText.trim() || null,
      catId: parsed.data.catId || null,
      items: JSON.stringify(items),
      notes: parsed.data.notes || null,
      status: "new",
    },
  });
  return { ok: true, id: created.id };
}
