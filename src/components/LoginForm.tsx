"use client";
import { useActionState } from "react";
import { loginAction } from "@/server/authActions";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, {});
  return (
    <form action={formAction} className="mx-auto max-w-sm space-y-4">
      <div>
        <label htmlFor="email" className="block font-medium">Email</label>
        <input id="email" name="email" type="email" required className="mt-1 w-full rounded border p-2" />
      </div>
      <div>
        <label htmlFor="password" className="block font-medium">Password</label>
        <input id="password" name="password" type="password" required className="mt-1 w-full rounded border p-2" />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="w-full rounded px-5 py-3 text-white disabled:opacity-50"
        style={{ backgroundColor: "var(--color-primary)" }}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
