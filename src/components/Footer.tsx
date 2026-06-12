import { org } from "@/org";

export function Footer() {
  return (
    <footer className="mt-16 border-t p-6 text-sm" style={{ borderColor: "var(--color-secondary)" }}>
      <div className="mx-auto max-w-5xl">
        <p className="font-semibold">{org.name}</p>
        <p>Phone: {org.contact.phone} · Email: {org.contact.email}</p>
        <p className="mt-2 opacity-70">Urgent matters: please call our main phone line.</p>
      </div>
    </footer>
  );
}
