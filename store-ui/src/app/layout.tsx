import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { RequireAuth } from "../components/RequireAuth";

export const metadata: Metadata = {
  title: "وفّر كاش",
  description: "منصة خصومات للمتاجر والعملاء"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          <RequireAuth>{children}</RequireAuth>
        </Providers>
      </body>
    </html>
  );
}
