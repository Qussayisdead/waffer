"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "../../lib/api";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");
  const isLogin = pathname === "/admin/login";

  useEffect(() => {
    setMounted(true);
    if (isLogin) {
      setStatus("ok");
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await apiRequest<{ role: string }>("/api/v1/auth/me");
        if (response.data.role !== "admin") {
          throw new Error("auth.forbidden");
        }
        setStatus("ok");
      } catch {
        setStatus("denied");
        router.replace("/admin/login");
      }
    };

    checkAuth();
  }, [pathname, router, isLogin]);

  if (!mounted || status === "checking") return null;
  if (isLogin) return <>{children}</>;
  if (status === "denied") return null;

  return <>{children}</>;
}
