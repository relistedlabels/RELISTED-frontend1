"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  ResponsiveDataTable,
  type ResponsiveColumnDef,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Paragraph2 className="mb-1 text-2xl font-extrabold tracking-tight text-gray-900">
            Campaigns
          </Paragraph2>
          <Paragraph1 className="max-w-2xl text-gray-600">
            Create timed campaigns with a custom banner, shop page, and hand-picked
            listings. Turn a campaign on or off anytime.
          </Paragraph1>
        </div>
        <Link
          href={`/admin/${adminId}/sales/new`}
          className="inline-flex w-fit shrink-0 self-start items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
        >
          <Plus size={18} />
          New campaign
        </Link>
      </div>

      {errMsg ? (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
          <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : sales.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Paragraph1 className="mb-4 text-gray-600">
            No campaigns yet. Create your first campaign to get started.
          </Paragraph1>
          <Link
            href={`/admin/${adminId}/sales/new`}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            <Plus size={18} />
            New campaign
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
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
