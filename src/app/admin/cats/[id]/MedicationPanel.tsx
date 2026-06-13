"use client";
import { addMedication, toggleMedicationActive, deleteMedication } from "@/server/chartActions";

type Med = { id: string; name: string; dosage: string | null; schedule: string | null; isActive: boolean };

export function MedicationPanel({ catId, medications }: { catId: string; medications: Med[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Medications</h2>
      <form action={async (fd) => { await addMedication(catId, fd); }} className="mt-2 flex flex-wrap items-end gap-2">
        <input name="name" placeholder="Name" required aria-label="Medication name" className="rounded border p-2" />
        <input name="dosage" placeholder="Dosage" aria-label="Dosage" className="rounded border p-2" />
        <input name="schedule" placeholder="Schedule" aria-label="Schedule" className="rounded border p-2" />
        <input type="date" name="startDate" aria-label="Start date" className="rounded border p-2" />
        <input type="date" name="endDate" aria-label="End date" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {medications.map((m) => (
          <li key={m.id} className="flex items-center justify-between p-2 text-sm">
            <span className={m.isActive ? "" : "line-through opacity-50"}>
              <b>{m.name}</b>{m.dosage ? ` ${m.dosage}` : ""}{m.schedule ? ` · ${m.schedule}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <button onClick={() => toggleMedicationActive(catId, m.id)} className="underline">{m.isActive ? "Mark inactive" : "Mark active"}</button>
              <button onClick={() => deleteMedication(catId, m.id)} className="text-red-600">Delete</button>
            </span>
          </li>
        ))}
        {medications.length === 0 && <li className="p-2 opacity-60">No medications.</li>}
      </ul>
    </div>
  );
}
