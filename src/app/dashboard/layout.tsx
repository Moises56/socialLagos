import { SessionProvider } from "@/components/shared/session-provider";
import { Sidebar } from "@/components/dashboard/sidebar";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-slate-950">
        <Sidebar />
        <div className="lg:pl-64">
          <TopNav />
          <main className="p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
