import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <section className="py-12">
      <h1 className="mb-6 text-center text-2xl font-bold" style={{ color: "var(--color-primary)" }}>Staff Login</h1>
      <LoginForm />
    </section>
  );
}
