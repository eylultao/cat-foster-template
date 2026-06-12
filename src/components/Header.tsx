import Link from "next/link";
import { org } from "@/org";

const links = [
  { href: "/foster", label: "Foster" },
  { href: "/cats", label: "Cats" },
  { href: "/apply", label: "Apply" },
  { href: "/request", label: "Supply Request" },
];

export function Header() {
  return (
    <header className="border-b" style={{ borderColor: "var(--color-secondary)" }}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          {org.name}
        </Link>
        <ul className="flex gap-4">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="inline-block px-3 py-2.5 hover:underline">{l.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
