import { auth } from "@/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  // The login page is also under /admin; render it bare when unauthenticated.
  if (!session) return <div className="py-8">{children}</div>;
  return (
    <div className="flex flex-col gap-4 py-6 md:flex-row md:gap-6">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
