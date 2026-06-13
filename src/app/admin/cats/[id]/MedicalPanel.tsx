"use client";
import { addMedicalRecord, deleteMedicalRecord } from "@/server/chartActions";

type Rec = { id: string; date: Date; type: string; description: string; vetName: string | null };

export function MedicalPanel({ catId, records }: { catId: string; records: Rec[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Medical records</h2>
      <form action={async (fd) => { await addMedicalRecord(catId, fd); }} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="date" name="date" required aria-label="Record date" className="rounded border p-2" />
        <input name="type" placeholder="Type (e.g. Vaccination)" required aria-label="Record type" className="rounded border p-2" />
        <input name="description" placeholder="Description" required aria-label="Description" className="rounded border p-2" />
        <input name="vetName" placeholder="Vet (optional)" aria-label="Vet name" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {records.map((r) => (
          <li key={r.id} className="flex items-center justify-between p-2 text-sm">
            <span>{new Date(r.date).toLocaleDateString()} — <b>{r.type}</b>: {r.description}{r.vetName ? ` (${r.vetName})` : ""}</span>
            <button onClick={() => deleteMedicalRecord(catId, r.id)} className="text-red-600">Delete</button>
          </li>
        ))}
        {records.length === 0 && <li className="p-2 opacity-60">No records.</li>}
      </ul>
    </div>
  );
}
