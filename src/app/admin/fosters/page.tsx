import { getAllFosters } from "@/server/fosters";
import { FosterManager } from "./FosterManager";

export default async function FostersPage() {
  const fosters = await getAllFosters();
  return (
    <section>
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Parents</h1>
      <div className="mt-6"><FosterManager fosters={fosters} /></div>
    </section>
  );
}
