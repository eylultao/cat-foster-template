"use client";
import { updateRequestStatus } from "@/server/requestActions";
import { REQUEST_STATUSES } from "@/server/requestConstants";

type Req = {
  id: string; fosterNameText: string | null; notes: string | null; items: string; status: string;
  cat: { name: string } | null; fosterParent: { name: string } | null; createdAt: Date;
};

export function RequestsManager({ requests }: { requests: Req[] }) {
  return (
    <ul className="space-y-4">
      {requests.map((r) => {
        const items: { type: string; quantity: number }[] = JSON.parse(r.items || "[]");
        const who = r.fosterParent?.name ?? r.fosterNameText ?? "Unknown";
        return (
          <li key={r.id} className="rounded border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{who}{r.cat ? ` — for ${r.cat.name}` : ""}</p>
                <p className="text-sm opacity-70">{items.map((i) => `${i.quantity}× ${i.type}`).join(", ")}</p>
                {r.notes && <p className="text-sm opacity-60">{r.notes}</p>}
              </div>
              <select defaultValue={r.status} onChange={(e) => updateRequestStatus(r.id, e.target.value)} aria-label="Request status" className="rounded border p-2">
                {REQUEST_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </li>
        );
      })}
      {requests.length === 0 && <li className="opacity-60">No supply requests yet.</li>}
    </ul>
  );
}
