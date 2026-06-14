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
    <aside className="w-full shrink-0 border-b p-4 md:w-56 md:border-b-0 md:border-r">
      <p className="mb-3 font-bold md:mb-4" style={{ color: "var(--color-primary)" }}>
        Back Office
      </p>
      {/* Mobile: horizontal scrolling row of nav chips. Desktop: vertical list. */}
      <nav className="flex gap-2 overflow-x-auto pb-1 md:flex-col md:gap-0 md:space-y-2 md:overflow-visible md:pb-0">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded border px-3 py-2 hover:underline md:border-0 md:px-0 md:py-1"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-4 md:mt-6">
        <SignOutButton />
      </div>
    </aside>
  );
}
