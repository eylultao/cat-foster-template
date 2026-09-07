import { org } from "@/org";
import { ApplicationForm } from "@/components/ApplicationForm";

export default function ApplyPage() {
  return (
    <section className="py-8">
      <h1 className="text-3xl font-bold" style={{ color: "var(--color-primary)" }}>Foster Application</h1>
      <p className="mt-2 mb-6 opacity-80">{org.application.intro}</p>
      <ApplicationForm />
    </section>
  );
}
