"use client";
import { useState } from "react";
import Link from "next/link";

const links = [
  { href: "/foster", label: "Foster" },
  { href: "/cats", label: "Cats" },
  { href: "/apply", label: "Apply" },
  { href: "/request", label: "Supply Request" },
];

export function HeaderNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop: inline links */}
      <ul className="hidden sm:flex sm:gap-4">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="inline-block px-3 py-2.5 hover:underline">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Mobile: hamburger toggle */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
        className="inline-flex h-11 w-11 items-center justify-center rounded border text-xl sm:hidden"
        style={{ borderColor: "var(--color-secondary)" }}
      >
        <span aria-hidden="true">{open ? "✕" : "☰"}</span>
      </button>

      {/* Mobile: dropdown menu (full-width, below the header bar) */}
      {open && (
        <ul
          id="mobile-menu"
          className="absolute inset-x-0 top-full z-20 border-b sm:hidden"
          style={{ backgroundColor: "var(--color-bg)", borderColor: "var(--color-secondary)" }}
        >
          {links.map((l) => (
            <li key={l.href} className="border-t" style={{ borderColor: "var(--color-secondary)" }}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 hover:underline"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
