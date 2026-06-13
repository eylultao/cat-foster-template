import { signOut } from "@/auth";

export function SignOutButton() {
  return (
    <form action={async () => { "use server"; await signOut({ redirectTo: "/admin/login" }); }}>
      <button type="submit" className="text-sm underline">Sign out</button>
    </form>
  );
}
