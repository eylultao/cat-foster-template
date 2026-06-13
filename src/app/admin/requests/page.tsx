import { getSupplyRequests } from "@/server/requests";
import { RequestsManager } from "./RequestsManager";

export default async function RequestsPage() {
  const requests = await getSupplyRequests();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Supply Requests</h1>
      <div className="mt-6"><RequestsManager requests={requests} /></div>
    </section>
  );
}
