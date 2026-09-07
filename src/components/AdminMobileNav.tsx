"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type NavLink = { href: string; label: string };

export function AdminMobileNav({
  links,
  signOut,
}: {
  links: NavLink[];
  signOut: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close on Escape, lock body scroll, and move focus to the close button while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      {/* Top bar with hamburger */}
      <div className="flex items-center gap-3 border-b p-4">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          aria-expanded={open}
          aria-controls="admin-drawer"
          className="inline-flex h-11 w-11 items-center justify-center rounded border text-xl"
        >
          <span aria-hidden="true">☰</span>
        </button>
        <span className="font-bold" style={{ color: "var(--color-primary)" }}>
          Back Office
        </span>
      </div>

      {/* Drawer + scrim */}
      {open && (
        <div
          className="fixed inset-0 z-40"
          role="dialog"
          aria-modal="true"
          aria-label="Back office navigation"
        >
          {/* Scrim: tap outside to close */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Panel */}
          <aside
            id="admin-drawer"
            className="absolute inset-y-0 left-0 w-64 max-w-[80%] border-r p-4 shadow-xl"
            style={{ backgroundColor: "var(--color-bg)" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ color: "var(--color-primary)" }}>
                Back Office
              </span>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded text-lg"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <nav className="mt-4 space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded px-3 py-2.5 hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <div className="mt-6">{signOut}</div>
          </aside>
        </div>
      )}
    </div>
  );
}
