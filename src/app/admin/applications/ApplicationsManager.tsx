"use client";
import { updateApplicationStatus, updateApplicationNotes } from "@/server/applicationActions";
import { APPLICATION_STATUSES } from "@/server/applicationConstants";

type App = {
  id: string; applicantName: string; email: string; phone: string | null;
  address: string | null; answers: string; status: string; staffNotes: string | null; createdAt: Date;
};

export function ApplicationsManager({ applications }: { applications: App[] }) {
  return (
    <ul className="space-y-4">
      {applications.map((a) => {
        const answers: Record<string, string> = JSON.parse(a.answers || "{}");
        return (
          <li key={a.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{a.applicantName} <span className="opacity-60">({a.email})</span></p>
                <p className="text-sm opacity-60">{a.phone} {a.address}</p>
              </div>
              <select defaultValue={a.status} onChange={(e) => updateApplicationStatus(a.id, e.target.value)} aria-label="Application status" className="rounded border p-2">
                {APPLICATION_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(answers).map(([k, v]) => (
                <div key={k}><dt className="font-medium">{k}</dt><dd className="opacity-80">{v}</dd></div>
              ))}
            </dl>
            <form action={async (fd) => { await updateApplicationNotes(a.id, String(fd.get("notes") ?? "")); }} className="mt-3 flex gap-2">
              <input name="notes" defaultValue={a.staffNotes ?? ""} placeholder="Staff notes" aria-label="Staff notes" className="flex-1 rounded border p-2" />
              <button type="submit" className="rounded border px-3 py-2">Save notes</button>
            </form>
          </li>
        );
      })}
      {applications.length === 0 && <li className="opacity-60">No applications yet.</li>}
    </ul>
  );
}
