"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminShopSaleWaitlist } from "@/lib/queries/admin/useShopSales";
import { useNotifyShopSaleWaitlist } from "@/lib/mutations/admin";
import { toast } from "sonner";

const PAGE_SIZE = 20;

type Props = {
  saleId: string;
  waitlistEnabled: boolean;
};

type WaitlistRow = {
  id: string;
  email: string;
  joinedAt: string;
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
    render: (entry) => (
      <span className="text-gray-900">{entry.email}</span>
    ),
  },
  {
    id: "joined",
    header: "Joined",
    mobile: "detail",
    render: (entry) => (
      <span className="text-gray-600">{formatJoined(entry.joinedAt)}</span>
    ),
  },
];

export default function SaleWaitlistCard({ saleId, waitlistEnabled }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error } = useAdminShopSaleWaitlist(
    saleId,
    page,
    PAGE_SIZE,
  );
  const notify = useNotifyShopSaleWaitlist();

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

  const handleNotify = () => {
    if (
      !window.confirm(
        `Send the "campaign is live" email to ${total} subscriber${total === 1 ? "" : "s"}?`,
      )
    ) {
      return;
    }
    notify.mutate(saleId, {
      onSuccess: (res) => {
        const sent = res.data?.sent ?? 0;
        const failed = res.data?.failed?.length ?? 0;
        if (failed > 0) {
          toast.warning(`Sent ${sent} emails. ${failed} failed.`);
        } else {
          toast.success(`Sent ${sent} email${sent === 1 ? "" : "s"}.`);
        }
      },
      onError: () => toast.error("Could not send emails. Try again."),
    });
  };

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-linear-to-b from-gray-50 to-white px-5 py-5 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white"
              aria-hidden
            >
              <Mail className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900">
                  Waitlist
                </h2>
                {!isLoading && !errMsg ? (
                  <span className="inline-flex rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-700">
                    {total} {total === 1 ? "person" : "people"}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {waitlistEnabled
                  ? "People who asked to be notified before the campaign opens."
                  : "Waitlist is turned off for this campaign."}
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={!waitlistEnabled || total === 0 || notify.isPending}
            onClick={handleNotify}
            className="shrink-0 self-start rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 lg:self-center"
          >
            {notify.isPending ? "Sending…" : "Email everyone"}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {errMsg ? (
          <Paragraph1 className="text-sm text-red-600">{errMsg}</Paragraph1>
        ) : isLoading ? (
          <TableSkeleton rows={5} columns={2} />
        ) : (
          <>
            <ResponsiveDataTable
              rows={entries as unknown as WaitlistRow[]}
              columns={columns}
              getRowKey={(entry) => entry.id}
              className="rounded-lg border border-gray-200"
              emptyState={
                <Paragraph1 className="py-6 text-center text-sm text-gray-500">
                  No one on the waitlist yet.
                </Paragraph1>
              }
            />
            {pagination.pages > 1 ? (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-2 py-1.5 text-sm text-gray-600">
                  Page {page} of {pagination.pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pagination.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
