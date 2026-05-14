"use client";

import { Loader2, Mail } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminVaultClosetSaleWaitlist } from "@/lib/queries/admin/useVaultClosetSaleWaitlist";
import { useNotifyVaultClosetSaleWaitlist } from "@/lib/mutations/admin";
import { toast } from "sonner";

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

export default function AdminVaultClosetSaleWaitlistCard() {
  const { data, isLoading, isError, error, refetch } = useAdminVaultClosetSaleWaitlist();
  const notify = useNotifyVaultClosetSaleWaitlist();

  const entries = data?.data?.entries ?? [];
  const total = data?.data?.total ?? 0;

  const errMsg =
    isError && error instanceof Error ? error.message : isError ? "Failed to load" : null;

  const handleNotifyAll = () => {
    if (total === 0) {
      toast.message("No subscribers to email.");
      return;
    }
    const ok = window.confirm(
      `Send the sale-live email to ${total} address${total === 1 ? "" : "es"}?`,
    );
    if (!ok) return;

    notify.mutate(undefined, {
      onSuccess: (res) => {
        const d = res.data;
        if (d.message) {
          toast.message(d.message);
          return;
        }
        const failed = d.failed?.length ?? 0;
        if (d.devEmailBypass) {
          toast.success(
            `Dev email bypass: saved sample for ${d.sent} recipient(s) and opened it in your browser (same as other dev emails).`,
          );
        } else if (failed === 0) {
          toast.success(`Sent ${d.sent} email${d.sent === 1 ? "" : "s"}.`);
        } else {
          toast.warning(
            `Sent ${d.sent} of ${d.totalRecipients}. ${failed} failed (see response or logs).`,
          );
        }
      },
      onError: (e) => {
        toast.error(e instanceof Error ? e.message : "Could not send emails.");
      },
    });
  };

  return (
    <section
      className="mb-6 overflow-hidden rounded-xl border border-gray-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
      aria-labelledby="vault-waitlist-heading"
    >
      <div className="border-b border-gray-100 bg-linear-to-b from-gray-50 to-white px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white shadow-inner"
              aria-hidden
            >
              <Mail className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="min-w-0 pt-0.5">
              <div className="flex flex-wrap items-center gap-2 gap-y-1">
                <h2
                  id="vault-waitlist-heading"
                  className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl"
                >
                  Vault Closet sale waitlist
                </h2>
                {!isLoading && !errMsg ? (
                  <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-0.5 text-xs font-medium tabular-nums text-gray-700 shadow-sm">
                    {total} {total === 1 ? "subscriber" : "subscribers"}
                  </span>
                ) : null}
              </div>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-600">
                From the home banner notify flow. Sends one campaign to every address when the
                sale is live.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={notify.isPending || isLoading || total === 0}
            onClick={handleNotifyAll}
            className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-gray-800 disabled:pointer-events-none disabled:opacity-45 lg:w-auto"
          >
            {notify.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sending…
              </>
            ) : (
              "Notify all"
            )}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="border-t border-gray-100 p-4 sm:p-5">
          <TableSkeleton rows={5} columns={2} />
        </div>
      ) : errMsg ? (
        <div className="border-t border-gray-100 p-5 sm:p-6">
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
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/90">
                <th className="w-[58%] px-6 py-4 text-left">
                  <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Email
                  </Paragraph1>
                </th>
                <th className="px-6 py-4 text-left whitespace-nowrap">
                  <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                    Joined
                  </Paragraph1>
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                        <Mail className="h-7 w-7" strokeWidth={1.5} aria-hidden />
                      </div>
                      <Paragraph1 className="text-base font-medium text-gray-900">
                        No subscribers yet
                      </Paragraph1>
                      <Paragraph1 className="mt-1 text-sm leading-relaxed text-gray-500">
                        When renters join from the home Vault Closet banner, they will show up
                        here.
                      </Paragraph1>
                    </div>
                  </td>
                </tr>
              ) : (
                entries.map((row, i) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/80 ${
                      i % 2 === 1 ? "bg-gray-50/40" : ""
                    }`}
                  >
                    <td className="min-w-0 px-6 py-4">
                      <span
                        className="block truncate text-sm font-medium text-gray-900"
                        title={row.email}
                      >
                        {row.email}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 tabular-nums">
                      {formatJoined(row.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
