"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/useUserStore";
import { Paragraph3 } from "@/common/ui/Text";

export default function OnboardingIndexPage() {
  const router = useRouter();
  const role = useUserStore((s) => s.role);

  useEffect(() => {
    if (role === "LISTER" || role === "ADMIN") {
      router.replace("/onboarding/lister");
      return;
    }
    router.replace("/onboarding/renter");
  }, [role, router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Paragraph3 className="text-gray-500 text-base">Loading onboarding...</Paragraph3>
    </div>
  );
}
