"use client";
import { useState } from "react";
import { org } from "@/org";
import { createSupplyRequest } from "@/server/requestActions";
import type { ActionResult } from "@/lib/validation";

type Opt = { id: string; name: string };
type Item = { type: string; quantity: number };

export function SupplyRequestForm({ fosters, cats }: { fosters: Opt[]; cats: Opt[] }) {
  const [items, setItems] = useState<Item[]>([{ type: org.supplies.itemTypes[0], quantity: 1 }]);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  function addItem() { setItems((xs) => [...xs, { type: org.supplies.itemTypes[0], quantity: 1 }]); }
  function update(i: number, patch: Partial<Item>) {
    setItems((xs) => xs.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }
  function removeItem(i: number) { setItems((xs) => xs.filter((_, idx) => idx !== i)); }

  async function onSubmit(formData: FormData) {
    setPending(true);
    formData.set("items", JSON.stringify(items));
    const res = await createSupplyRequest(formData);
    setResult(res);
    setPending(false);
  }

  if (result?.ok) {
    return <p className="rounded bg-green-50 p-4 text-green-800">Request received. Thank you!</p>;
  }
  const errors = result?.ok === false ? result.errors : undefined;

  return (
    <form action={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="fosterNameText" className="block font-medium">Your name</label>
        <input id="fosterNameText" name="fosterNameText" className="mt-1 w-full rounded border p-2" />
        {errors?.fosterNameText && <p className="text-sm text-red-600">{errors.fosterNameText}</p>}
      </div>
      <div>
        <label htmlFor="fosterParentId" className="block font-medium">…or pick yourself (if known)</label>
        <select id="fosterParentId" name="fosterParentId" className="mt-1 w-full rounded border p-2">
          <option value="">—</option>
          {fosters.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>
      <div>
        <label htmlFor="catId" className="block font-medium">For which cat? (optional)</label>
        <select id="catId" name="catId" className="mt-1 w-full rounded border p-2">
          <option value="">—</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <fieldset className="rounded border p-3">
        <legend className="px-1 font-medium">Items</legend>
        {items.map((it, i) => (
          <div key={i} className="mt-2 flex items-center gap-2">
            <select value={it.type} onChange={(e) => update(i, { type: e.target.value })} className="rounded border p-2" aria-label={`Item ${i + 1} type`}>
              {org.supplies.itemTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input type="number" min={1} value={it.quantity}
              onChange={(e) => update(i, { quantity: Number(e.target.value) })} className="w-20 rounded border p-2" aria-label={`Item ${i + 1} quantity`} />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(i)} className="text-sm text-red-600">Remove</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addItem} className="mt-3 text-sm underline">+ Add item</button>
        {errors?.items && <p className="text-sm text-red-600">{errors.items}</p>}
      </fieldset>

      <div>
        <label htmlFor="notes" className="block font-medium">Notes</label>
        <textarea id="notes" name="notes" className="mt-1 w-full rounded border p-2" />
      </div>
      <button type="submit" disabled={pending} className="rounded px-5 py-3 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Submitting…" : "Submit request"}
      </button>
    </form>
  );
}
