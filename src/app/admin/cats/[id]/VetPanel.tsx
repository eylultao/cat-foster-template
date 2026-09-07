"use client";
import { addVetAppointment, updateVetStatus, deleteVetAppointment } from "@/server/chartActions";

type Appt = { id: string; datetime: Date; reason: string; location: string | null; status: string; notes: string | null };

export function VetPanel({ catId, appointments }: { catId: string; appointments: Appt[] }) {
  return (
    <div>
      <h2 className="text-lg font-semibold">Vet appointments</h2>
      <form action={async (fd) => { await addVetAppointment(catId, fd); }} className="mt-2 flex flex-wrap items-end gap-2">
        <input type="datetime-local" name="datetime" required aria-label="Appointment date and time" className="rounded border p-2" />
        <input name="reason" placeholder="Reason" required aria-label="Reason" className="rounded border p-2" />
        <input name="location" placeholder="Location" aria-label="Location" className="rounded border p-2" />
        <input name="notes" placeholder="Notes" aria-label="Notes" className="rounded border p-2" />
        <button type="submit" className="rounded px-3 py-2 text-white" style={{ backgroundColor: "var(--color-primary)" }}>Add</button>
      </form>
      <ul className="mt-3 divide-y rounded border">
        {appointments.map((a) => (
          <li key={a.id} className="flex items-center justify-between p-2 text-sm">
            <span>{new Date(a.datetime).toLocaleString()} — {a.reason}{a.location ? ` @ ${a.location}` : ""}</span>
            <span className="flex items-center gap-2">
              <select defaultValue={a.status} onChange={(e) => updateVetStatus(catId, a.id, e.target.value)} aria-label="Appointment status" className="rounded border p-1">
                <option value="scheduled">scheduled</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
              <button onClick={() => deleteVetAppointment(catId, a.id)} className="text-red-600">Delete</button>
            </span>
          </li>
        ))}
        {appointments.length === 0 && <li className="p-2 opacity-60">No appointments.</li>}
      </ul>
    </div>
  );
}
