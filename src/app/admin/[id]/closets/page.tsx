"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy route: closet admin list moved to Sales. */
export default function AdminClosetsRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;

  useEffect(() => {
    router.replace(`/admin/${adminId}/sales`);
  }, [adminId, router]);

  return null;
}
