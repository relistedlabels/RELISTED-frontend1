"use client";

import { useParams } from "next/navigation";
import { useAdminIdStore } from "@/store/useAdminIdStore";

export function useAdminRouteId(): string {
  const params = useParams();
  const adminId = useAdminIdStore((state) => state.adminId);
  const paramAdminId = Array.isArray(params.id) ? params.id[0] : params.id;
  return paramAdminId ?? adminId ?? "";
}

export function adminHref(adminId: string, section: string): string {
  return `/admin/${adminId}/${section}`;
}

export function formatNairaAmount(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

export function relativeActivityTime(iso: string): string {
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return "";
  const mins = Math.round((Date.now() - time) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}
