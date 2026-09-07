"use client";
import { useState } from "react";
import { org } from "@/org";
import { createApplication } from "@/server/applicationActions";
import type { ActionResult } from "@/lib/validation";

export function ApplicationForm() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    const res = await createApplication(formData);
    setResult(res);
    setPending(false);
    if (res.ok) (document.getElementById("apply-form") as HTMLFormElement)?.reset();
  }

  if (result?.ok) {
    return <p className="rounded bg-green-50 p-4 text-green-800">Thank you! Your application was received.</p>;
  }

  return (
    <form id="apply-form" action={onSubmit} className="space-y-4">
      <Field name="applicantName" label="Your name" required error={result?.ok === false ? result.errors?.applicantName : undefined} />
      <Field name="email" label="Email" type="email" required error={result?.ok === false ? result.errors?.email : undefined} />
      <Field name="phone" label="Phone" />
      <Field name="address" label="Address" />
      {org.application.questions.map((q) => {
        const err = result?.ok === false ? result.errors?.[`q_${q.id}`] : undefined;
        const id = `q_${q.id}`;
        return (
          <div key={q.id}>
            <label htmlFor={id} className="block font-medium">{q.label}{q.required && " *"}</label>
            {q.type === "textarea" ? (
              <textarea id={id} name={id} className="mt-1 w-full rounded border p-2" />
            ) : q.type === "select" ? (
              <select id={id} name={id} className="mt-1 w-full rounded border p-2">
                <option value="">Select…</option>
                {q.options?.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : q.type === "checkbox" ? (
              <input id={id} name={id} type="checkbox" value="Yes" className="mt-1" />
            ) : (
              <input id={id} name={id} className="mt-1 w-full rounded border p-2" />
            )}
            {err && <p className="text-sm text-red-600">{err}</p>}
          </div>
        );
      })}
      <button type="submit" disabled={pending} className="rounded px-5 py-3 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}

function Field({ name, label, type = "text", required, error }: {
  name: string; label: string; type?: string; required?: boolean; error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block font-medium">{label}{required && " *"}</label>
      <input id={name} name={name} type={type} className="mt-1 w-full rounded border p-2" />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
