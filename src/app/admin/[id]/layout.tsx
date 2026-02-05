import React from "react";
import { notFound } from "next/navigation";
import { validateAdminId } from "@/lib/adminSecretId";
import { ReactNode } from "react";
import AdminLayoutWrapper from "../components/AdminLayoutWrapper";
import AdminIdSync from "./AdminIdSync";

interface AdminDashboardLayoutProps {
  children: ReactNode;
  params: { id: string };
}

export default async function AdminDashboardLayout({
  children,
  params,
}: AdminDashboardLayoutProps) {
  // Await params to get the actual values
  const { id } = await params;

  // Validate admin ID server-side
  if (!validateAdminId(id)) {
    notFound();
  }

  return (
    <AdminIdSync id={id}>
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </AdminIdSync>
  );
}
