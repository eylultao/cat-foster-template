"use client";
import { useState } from "react";
import { createFoster, updateFoster, deleteFoster } from "@/server/fosterActions";

type Foster = { id: string; name: string; email: string | null; phone: string | null; address: string | null; notes: string | null; _count: { cats: number } };

export function FosterManager({ fosters }: { fosters: Foster[] }) {
  const [error, setError] = useState<string | undefined>();
  async function onCreate(fd: FormData) {
    const res = await createFoster(fd);
    if (!res.ok) setError(res.errors?.name ?? "Could not add"); else setError(undefined);
  }
  return (
    <div className="space-y-6">
      <form action={onCreate} className="flex flex-wrap items-end gap-2">
        <input name="name" placeholder="Name" required aria-label="Foster name" className="rounded border p-2" />
        <input name="email" placeholder="Email" aria-label="Email" className="rounded border p-2" />
        <input name="phone" placeholder="Phone" aria-label="Phone" className="rounded border p-2" />
        <input name="address" placeholder="Address" aria-label="Address" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add foster</button>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </form>

      <ul className="divide-y rounded border">
        {fosters.map((f) => (
          <li key={f.id} className="p-3">
            <form action={async (fd) => { await updateFoster(f.id, fd); }} className="flex flex-wrap items-end gap-2">
              <input name="name" defaultValue={f.name} aria-label="Name" className="rounded border p-2" />
              <input name="email" defaultValue={f.email ?? ""} placeholder="Email" aria-label="Email" className="rounded border p-2" />
              <input name="phone" defaultValue={f.phone ?? ""} placeholder="Phone" aria-label="Phone" className="rounded border p-2" />
              <input name="address" defaultValue={f.address ?? ""} placeholder="Address" aria-label="Address" className="rounded border p-2" />
              <input name="notes" defaultValue={f.notes ?? ""} placeholder="Notes" aria-label="Notes" className="rounded border p-2" />
              <span className="text-sm opacity-60">{f._count.cats} cat(s)</span>
              <button type="submit" className="rounded border px-3 py-2">Save</button>
              <button type="button" onClick={() => deleteFoster(f.id)} className="text-red-600">Delete</button>
            </form>
          </li>
        ))}
        {fosters.length === 0 && <li className="p-3 opacity-60">No foster parents yet.</li>}
      </ul>
    </div>
  );
}
