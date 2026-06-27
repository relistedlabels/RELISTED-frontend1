"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ChevronRight, Plus } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminShopSales } from "@/lib/queries/admin/useShopSales";
import {
  formatSalePhaseLabel,
  formatSaleScheduleDisplay,
  phaseBadgeClass,
} from "./lib/saleDateTime";

export default function AdminSalesPage() {
  const params = useParams();
  const adminId = params.id as string;
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useAdminShopSales(page, limit);
  const sales = data?.data?.sales ?? [];
  const totalPages = data?.data?.totalPages ?? 1;

  const errMsg =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Failed to load sales"
        : null;

  return (
    <div className="min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
            Sales
          </Paragraph2>
          <Paragraph1 className="text-gray-600 max-w-2xl">
            Create timed sales with a custom banner, shop page, and hand-picked
            listings. Turn a sale on or off anytime.
          </Paragraph1>
        </div>
        <Link
          href={`/admin/${adminId}/sales/new`}
          className="inline-flex items-center gap-2 shrink-0 bg-gray-900 hover:bg-gray-800 px-4 py-2.5 rounded-lg font-medium text-white text-sm"
        >
          <Plus size={18} />
          New sale
        </Link>
      </div>

      {errMsg ? (
        <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
          <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={5} />
      ) : sales.length === 0 ? (
        <div className="bg-white p-12 border border-gray-200 rounded-lg text-center">
          <Paragraph1 className="text-gray-600 mb-4">
            No sales yet. Create your first campaign to get started.
          </Paragraph1>
          <Link
            href={`/admin/${adminId}/sales/new`}
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg font-medium text-white text-sm"
          >
            <Plus size={18} />
            New sale
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Sale
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Schedule
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Listings
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Waitlist
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <Paragraph1 className="font-medium text-gray-900 text-sm">
                        {sale.internalName}
                      </Paragraph1>
                      <Paragraph1 className="text-gray-500 text-xs mt-0.5">
                        {sale.headline}
                      </Paragraph1>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div>{formatSaleScheduleDisplay(sale.startsAt)}</div>
                      <div className="text-gray-500 text-xs mt-0.5">
                        to {formatSaleScheduleDisplay(sale.endsAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 tabular-nums text-gray-900">
                      {sale.productCount}
                    </td>
                    <td className="px-6 py-4 tabular-nums text-gray-900">
                      {sale.waitlistCount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${phaseBadgeClass(sale.phase)}`}
                      >
                        {formatSalePhaseLabel(sale.phase)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/${adminId}/sales/${sale.id}`}
                        className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 text-sm"
                      >
                        Edit
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex justify-center gap-2 px-6 py-4 border-t border-gray-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-2 py-1.5 text-gray-600 text-sm">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
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
