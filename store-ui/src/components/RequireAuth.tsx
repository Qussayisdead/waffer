"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiRequest } from "../lib/api";

const PUBLIC_PATHS = [
  "/",
  "/login",
  "/choose-role",
  "/customer/login",
  "/customer/signup",
  "/vip-card-application"
];

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<"checking" | "ok" | "denied">("checking");

  useEffect(() => {
    setMounted(true);
    if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/admin")) {
      setStatus("ok");
      return;
    }

    const checkAuth = async () => {
      try {
        if (pathname.startsWith("/customer")) {
          await apiRequest("/api/v1/auth/customer/me");
        } else {
          const response = await apiRequest<{ role: string }>("/api/v1/auth/me");
          if (pathname.startsWith("/terminal") && response.data.role !== "store") {
            throw new Error("auth.forbidden");
          }
        }
        setStatus("ok");
      } catch {
        setStatus("denied");
        router.replace(pathname.startsWith("/customer") ? "/customer/login" : "/login");
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!mounted || status === "checking") return null;
  if (PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/admin")) return <>{children}</>;
  if (status === "denied") return null;

  return <>{children}</>;
}
