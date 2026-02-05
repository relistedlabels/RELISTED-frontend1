"use client";

import { useEffect, ReactNode } from "react";
import { useAdminIdStore } from "@/store/useAdminIdStore";

interface AdminIdSyncProps {
  id: string;
  children: ReactNode;
}

export default function AdminIdSync({ id, children }: AdminIdSyncProps) {
  const setAdminId = useAdminIdStore((state) => state.setAdminId);

  useEffect(() => {
    // Sync the admin ID whenever it changes
    setAdminId(id);

    // Cleanup on unmount
    return () => {
      useAdminIdStore.getState().clearAdminId();
    };
  }, [id, setAdminId]);

  return <>{children}</>;
}
