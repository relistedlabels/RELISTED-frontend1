"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function OAuthCallback() {
  const qc = useQueryClient();
  const router = useRouter();

  useEffect(() => {
    qc.invalidateQueries({ queryKey: ["auth", "me"] });
    router.replace("/dashboard");
  }, []);

  return null;
}
