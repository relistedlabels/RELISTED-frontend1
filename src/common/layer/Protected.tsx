"use client";

import { useMe } from "@/lib/queries/auth/useMe";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Protected({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/auth/login");
    }
  }, [isLoading, user]);

  if (isLoading || !user) return null;

  return <>{children}</>;
}
