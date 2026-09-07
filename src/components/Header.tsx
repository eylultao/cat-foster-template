import Link from "next/link";
import { org } from "@/org";
import { HeaderNav } from "./HeaderNav";

export function Header() {
  return (
    <header className="relative border-b" style={{ borderColor: "var(--color-secondary)" }}>
      <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
        <Link href="/" className="text-xl font-bold" style={{ color: "var(--color-primary)" }}>
          {org.name}
        </Link>
        <HeaderNav />
      </nav>
    </header>
  );
}
