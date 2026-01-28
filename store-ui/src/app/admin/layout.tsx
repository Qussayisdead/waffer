import type { Metadata } from "next";
import { Providers } from "../../admin/providers";
import { Sidebar } from "../../admin/components/Sidebar";
import { Topbar } from "../../admin/components/Topbar";
import { RequireAuth } from "../../admin/components/RequireAuth";

export const metadata: Metadata = {
  title: "Smart Savings Card Admin",
  description: "Admin dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <RequireAuth>
        <div className="admin-shell relative min-h-screen overflow-hidden">
          <div className="bg-orb -right-40 top-10 h-72 w-72 bg-emerald-200/40" />
          <div className="bg-orb -left-24 top-1/2 h-80 w-80 bg-black/5" />
          <div className="relative z-10 flex min-h-screen">
            <div className="flex-1">
              <Topbar />
              <main className="px-8 py-8">{children}</main>
            </div>
            <Sidebar />
          </div>
        </div>
      </RequireAuth>
    </Providers>
  );
}
