import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/cats", label: "Cats" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/requests", label: "Supply Requests" },
  { href: "/admin/fosters", label: "Foster Parents" },
];

export function AdminNav() {
  return (
    <aside className="w-56 shrink-0 border-r p-4">
      <p className="mb-4 font-bold" style={{ color: "var(--color-primary)" }}>Back Office</p>
      <nav className="space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="block py-1 hover:underline">{l.label}</Link>
        ))}
      </nav>
      <div className="mt-6"><SignOutButton /></div>
    </aside>
  );
}
