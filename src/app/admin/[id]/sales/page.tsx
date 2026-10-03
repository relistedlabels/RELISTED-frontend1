"use client";

import { ChevronRight, Megaphone, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
import { useAdminShopSales } from "@/lib/queries/admin/useShopSales";
import {
  formatSalePhaseLabel,
  formatSaleScheduleDisplay,
  phaseBadgeClass,
} from "./lib/saleDateTime";

type SaleRow = {
  id: string;
  internalName: string;
  headline: string;
  startsAt: string;
  endsAt: string;
  productCount: number;
  waitlistCount: number;
  phase: "ended" | "off" | "upcoming" | "live";
};

function buildColumns(adminId: string): ResponsiveColumnDef<SaleRow>[] {
  return [
    {
      id: "campaign",
      header: "Campaign",
      mobile: "primary",
      render: (sale) => (
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {sale.internalName}
          </Paragraph1>
          <Paragraph1 className="mt-0.5 text-xs text-gray-500">
            {sale.headline}
          </Paragraph1>
        </div>
      ),
    },
    {
      id: "schedule",
      header: "Schedule",
      mobile: "detail",
      render: (sale) => (
        <div className="text-sm text-gray-700">
          <div>{formatSaleScheduleDisplay(sale.startsAt)}</div>
          <div className="mt-0.5 text-xs text-gray-500">
            to {formatSaleScheduleDisplay(sale.endsAt)}
          </div>
        </div>
      ),
    },
    {
      id: "listings",
      header: "Listings",
      mobile: "detail",
      render: (sale) => (
        <span className="tabular-nums text-gray-900">{sale.productCount}</span>
      ),
    },
    {
      id: "waitlist",
      header: "Waitlist",
      mobile: "detail",
      render: (sale) => (
        <span className="tabular-nums text-gray-900">{sale.waitlistCount}</span>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (sale) => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${phaseBadgeClass(sale.phase)}`}
        >
          {formatSalePhaseLabel(sale.phase)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (sale) => (
        <Link
          href={`/admin/${adminId}/sales/${sale.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Edit
          <ChevronRight size={16} />
        </Link>
      ),
    },
  ];
}

export default function AdminSalesPage() {
  const params = useParams();
  const adminId = params.id as string;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useAdminShopSales(page, limit);
  const sales = (data?.data?.sales ?? []) as SaleRow[];
  const totalPages = data?.data?.totalPages ?? 1;
  const columns = buildColumns(adminId);

  const errMsg =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Failed to load campaigns"
        : null;

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Campaigns"
        description="Create and manage promotional campaigns."
        action={
          <Link
            href={`/admin/${adminId}/sales/new`}
            className="inline-flex w-fit shrink-0 self-start items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            New campaign
          </Link>
        }
      />

      {errMsg ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : sales.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <Megaphone size={22} aria-hidden="true" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            No campaigns yet
          </h2>
          <Paragraph1 className="mt-1 text-sm text-gray-500">
            Create a campaign to feature selected listings.
          </Paragraph1>
          <Link
            href={`/admin/${adminId}/sales/new`}
            className="mt-5 inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
          >
            <Plus size={18} />
            New campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <ResponsiveDataTable
            rows={sales}
            columns={columns}
            getRowKey={(sale) => sale.id}
          />
          {totalPages > 1 ? (
            <div className="flex justify-center gap-2 border-t border-gray-200 px-6 py-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 py-1.5 text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
