import { getApplications } from "@/server/applications";
import { ApplicationsManager } from "./ApplicationsManager";

export default async function ApplicationsPage() {
  const applications = await getApplications();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Applications</h1>
      <div className="mt-6"><ApplicationsManager applications={applications} /></div>
    </section>
  );
}
