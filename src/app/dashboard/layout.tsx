import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="text-white font-semibold text-sm">
          Liberty Lead Engine
        </Link>
        <nav className="flex gap-4 text-sm text-gray-400">
          <Link href="/dashboard" className="hover:text-white">
            Pipeline
          </Link>
          <Link href="/dashboard/simulate" className="hover:text-white">
            Simulate
          </Link>
          <Link href="/dashboard/bot" className="hover:text-white">
            Bot Control
          </Link>
          <Link href="/dashboard/nurture" className="hover:text-white">
            Nurture
          </Link>
          <Link href="/dashboard/analytics" className="hover:text-white">
            Analytics
          </Link>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
