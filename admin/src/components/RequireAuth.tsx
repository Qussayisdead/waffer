"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "../i18n";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (pathname === "/login") return;
    const token = localStorage.getItem("auth_token");
    if (!token) {
      localStorage.setItem("auth_error", t("errors.unauthorized"));
      router.replace("/login");
    }
  }, [pathname, router, t]);

  if (!mounted) return null;
  if (pathname === "/login") return <>{children}</>;
  const token = localStorage.getItem("auth_token");
  if (!token) return null;

  return <>{children}</>;
}
