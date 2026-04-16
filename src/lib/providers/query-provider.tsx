"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthenticationError } from "@/lib/api/http";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // Don't retry on authentication errors - session is expired
              if (
                error instanceof AuthenticationError &&
                error.statusCode === 401
              ) {
                return false;
              }
              // Don't retry on other 401-like messages
              if (
                error instanceof Error &&
                (error.message.includes("401") ||
                  error.message.includes("Session expired") ||
                  error.message.includes("Unauthorized"))
              ) {
                return false;
              }
              // Retry other errors up to 1 time
              return failureCount < 1;
            },
          },
          mutations: {
            retry: (failureCount, error) => {
              // Don't retry on authentication errors - session is expired
              if (
                error instanceof AuthenticationError &&
                error.statusCode === 401
              ) {
                return false;
              }
              // Don't retry on other 401-like messages
              if (
                error instanceof Error &&
                (error.message.includes("401") ||
                  error.message.includes("Session expired") ||
                  error.message.includes("Unauthorized"))
              ) {
                return false;
              }
              // Retry other errors up to 1 time
              return failureCount < 1;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
