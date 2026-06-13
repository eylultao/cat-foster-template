import Link from "next/link";
import { getDashboardSummary } from "@/server/dashboard";

export default async function AdminDashboard() {
  const s = await getDashboardSummary();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Link href="/admin/applications" className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{s.newApplications}</p>
          <p className="opacity-70">New applications</p>
        </Link>
        <Link href="/admin/requests" className="rounded-lg border p-6">
          <p className="text-3xl font-bold">{s.openRequests}</p>
          <p className="opacity-70">Open supply requests</p>
        </Link>
      </div>

      <h2 className="mt-8 text-lg font-semibold">Recent applications</h2>
      <ul className="mt-2 divide-y rounded border">
        {s.recentApplications.map((a) => (
          <li key={a.id} className="flex justify-between p-3">
            <span>{a.applicantName} <span className="opacity-60">({a.email})</span></span>
            <span className="capitalize opacity-70">{a.status}</span>
          </li>
        ))}
        {s.recentApplications.length === 0 && <li className="p-3 opacity-60">None yet.</li>}
      </ul>
    </section>
  );
}
