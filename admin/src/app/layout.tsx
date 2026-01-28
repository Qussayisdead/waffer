import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { RequireAuth } from "../components/RequireAuth";

export const metadata: Metadata = {
  title: "Smart Savings Card Admin",
  description: "Admin dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          <RequireAuth>
            <div className="min-h-screen">
              <div className="flex min-h-screen">
                <div className="flex-1">
                  <Topbar />
                  <main className="px-8 py-8">{children}</main>
                </div>
                <Sidebar />
              </div>
            </div>
          </RequireAuth>
        </Providers>
      </body>
    </html>
  );
}
