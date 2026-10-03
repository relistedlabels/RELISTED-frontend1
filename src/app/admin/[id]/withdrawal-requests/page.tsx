"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAdminIdStore } from "@/store/useAdminIdStore";

export default function WithdrawalRequestsPage() {
  const router = useRouter();
  const params = useParams();
  const storeAdminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  const adminId = paramAdminId ?? storeAdminId ?? "";

  useEffect(() => {
    if (adminId) {
      router.replace(`/admin/${adminId}/wallets?tab=withdrawal-requests`);
    }
  }, [adminId, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent" />
    </div>
  );
}
