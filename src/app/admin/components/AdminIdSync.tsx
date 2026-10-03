"use client";

import { type ReactNode, useEffect } from "react";
import { useAdminIdStore } from "@/store/useAdminIdStore";

interface AdminIdSyncProps {
  id: string;
  children: ReactNode;
}

export default function AdminIdSync({ id, children }: AdminIdSyncProps) {
  const setAdminId = useAdminIdStore((state) => state.setAdminId);
  const clearAdminId = useAdminIdStore((state) => state.clearAdminId);

  useEffect(() => {
    setAdminId(id);
    return () => clearAdminId();
  }, [id, setAdminId, clearAdminId]);

  return <>{children}</>;
}
