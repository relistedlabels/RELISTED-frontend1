"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminVaultClosetSaleWaitlist } from "@/lib/queries/admin/useVaultClosetSaleWaitlist";

const PAGE_SIZE = 20;

type WaitlistRow = {
  id: string;
  email: string;
  createdAt: string;
};

function formatJoined(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

const columns: ResponsiveColumnDef<WaitlistRow>[] = [
  {
    id: "email",
    header: "Email",
    mobile: "primary",
    render: (row) => (
      <span className="block truncate text-sm font-medium text-gray-900" title={row.email}>
        {row.email}
      </span>
    ),
  },
  {
    id: "joined",
    header: "Joined",
    mobile: "detail",
    render: (row) => (
      <span className="text-sm tabular-nums text-gray-600">
        {formatJoined(row.createdAt)}
      </span>
    ),
  },
];

export default function AdminVaultClosetSaleWaitlistCard() {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, refetch } =
    useAdminVaultClosetSaleWaitlist(page, PAGE_SIZE);

  const entries = data?.data?.entries ?? [];
  const total = data?.data?.total ?? 0;
  const pagination = data?.data?.pagination ?? {
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    pages: 1,
  };

  const errMsg =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Failed to load waitlist"
        : null;

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-linear-to-b from-gray-50 to-white px-6 py-5">
        <div className="flex gap-4">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white"
            aria-hidden
          >
            <Mail className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Vault Closet waitlist
              </h2>
              {!isLoading && !errMsg ? (
                <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-700">
                  {total} {total === 1 ? "person" : "people"}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-gray-600">
              People who asked to be notified before the Vault Closet sale opens.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="p-6">
          <TableSkeleton rows={5} columns={2} />
        </div>
      ) : errMsg ? (
        <div className="p-6">
          <div className="flex flex-col gap-3 rounded-lg border border-red-200/80 bg-red-50/90 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <Paragraph1 className="text-sm text-red-900">{errMsg}</Paragraph1>
            <button
              type="button"
              onClick={() => void refetch()}
              className="shrink-0 self-start rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-900 transition-colors hover:bg-red-50 sm:self-auto"
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <ResponsiveDataTable
            rows={entries as unknown as WaitlistRow[]}
            columns={columns}
            getRowKey={(row) => row.id}
            emptyState={
              <div className="mx-auto flex max-w-sm flex-col items-center px-6 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                  <Mail className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                </div>
                <Paragraph1 className="text-base font-medium text-gray-900">
                  No subscribers yet
                </Paragraph1>
                <Paragraph1 className="mt-1 text-sm leading-relaxed text-gray-500">
                  When renters join from the home Vault Closet banner, they will
                  show up here.
                </Paragraph1>
              </div>
            }
          />

          {pagination.pages > 1 && pagination.total > 0 ? (
            <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <Paragraph1 className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </Paragraph1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm tabular-nums text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={pagination.page >= pagination.pages}
                  onClick={() =>
                    setPage((p) => Math.min(pagination.pages, p + 1))
                  }
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
