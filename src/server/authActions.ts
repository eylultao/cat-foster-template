"use server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(_prev: unknown, formData: FormData): Promise<{ error?: string }> {
  try {
    await signIn("credentials", {
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: "/admin",
    });
    return {};
  } catch (err) {
    if (err instanceof AuthError) return { error: "Invalid email or password" };
    throw err; // re-throw Next redirect (NEXT_REDIRECT) and other control-flow errors
  }
}
