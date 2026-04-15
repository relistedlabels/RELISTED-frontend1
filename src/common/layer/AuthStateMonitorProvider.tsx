"use client";

import { useAuthStateMonitor } from "@/hooks/useAuthStateMonitor";
import React from "react";

/**
 * Client-side wrapper component that activates authentication state monitoring.
 * This must be inside QueryClientProvider.
 */
export function AuthStateMonitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthStateMonitor();
  return <>{children}</>;
}
