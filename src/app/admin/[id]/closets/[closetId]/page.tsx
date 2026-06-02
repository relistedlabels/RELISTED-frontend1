// ENDPOINTS: GET /api/admin/closets/:closetId, GET /api/admin/closets/vault-closet-sale/waitlist, POST /api/admin/closets/vault-closet-sale/notify-waitlist
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminClosetDetail } from "@/lib/queries/admin/useAdminClosets";
import AdminVaultClosetSaleWaitlistCard from "../components/AdminVaultClosetSaleWaitlistCard";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

export default function AdminClosetDetailPage() {
  const params = useParams();
  const adminId = params.id as string;
  const closetId = params.closetId as string;

  const { data, isLoading, isError, error } = useAdminClosetDetail(closetId);
  const c = data?.data;

  const errMsg =
    isError && error instanceof Error ? error.message : isError ? "Failed to load" : null;

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href={`/admin/${adminId}/closets`}
          className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          <Paragraph1>Back to closets</Paragraph1>
        </Link>
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Closet detail
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Wallet balance, owner, and inventory for this closet.
        </Paragraph1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-24 bg-gray-100 rounded-lg animate-pulse border border-gray-100" />
          <TableSkeleton rows={6} columns={7} />
        </div>
      ) : errMsg ? (
        <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
          <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
        </div>
      ) : c ? (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex gap-4 min-w-0">
                {c.imageUrl ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shrink-0">
                    <Image
                      src={c.imageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                    <LayoutGrid className="w-8 h-8 text-gray-400" aria-hidden />
                  </div>
                )}
                <div className="min-w-0">
                  <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-xl sm:text-2xl tracking-tight">
                    {c.name}
                  </Paragraph2>
                  <Paragraph1 className="text-gray-500 font-mono text-sm mb-2">{c.slug}</Paragraph1>
                  {c.description ? (
                    <Paragraph1 className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                      {c.description}
                    </Paragraph1>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        c.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                    <Paragraph1 className="text-gray-400 text-xs">
                      {c.products.length} product{c.products.length === 1 ? "" : "s"}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50/80 p-5 lg:min-w-[280px] shrink-0">
                <Paragraph1 className="text-gray-600 text-xs font-semibold uppercase tracking-wide mb-1">
                  Closet wallet balance
                </Paragraph1>
                <Paragraph2 className="text-gray-900 text-2xl font-bold tabular-nums tracking-tight">
                  {formatCurrency(c.closetWalletBalance)}
                </Paragraph2>
                <Paragraph1 className="text-gray-500 text-xs mt-2 leading-relaxed">
                  Tracked lister payout share for partner settlements (same integer units as
                  lister wallet).
                </Paragraph1>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <Paragraph1 className="mb-4 font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Owner (lister account)
            </Paragraph1>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Paragraph1 className="text-gray-900 font-medium">{c.owner.name}</Paragraph1>
                <Paragraph1 className="text-gray-600 text-sm">{c.owner.email}</Paragraph1>
                <Paragraph1 className="text-gray-500 text-xs mt-1 capitalize">
                  Role: {c.owner.role.toLowerCase()}
                </Paragraph1>
              </div>
              <Link
                href={`/admin/${adminId}/users/${c.owner.id}`}
                className="inline-flex items-center gap-1 self-start sm:self-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Paragraph1>User profile</Paragraph1>
                <ChevronRight size={16} />
              </Link>
            </div>
          </div>

          <div>
            <Paragraph1 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
              Products in this closet
            </Paragraph1>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-4 text-left w-[72px]">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Image
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Product
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Type
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Status
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Rental / day
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Resale
                        </Paragraph1>
                      </th>
                      <th className="px-6 py-4 text-left">
                        <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                          Verified
                        </Paragraph1>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <Paragraph1 className="text-gray-500">
                            No products in this closet.
                          </Paragraph1>
                        </td>
                      </tr>
                    ) : (
                      c.products.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                              {p.imageUrl ? (
                                <Image
                                  src={p.imageUrl}
                                  alt=""
                                  fill
                                  className="object-cover"
                                  sizes="48px"
                                  unoptimized
                                />
                              ) : null}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Paragraph1 className="text-gray-900 font-medium text-sm max-w-[240px] line-clamp-2">
                              {p.name}
                            </Paragraph1>
                            <Paragraph1 className="text-gray-400 text-xs font-mono mt-0.5">
                              {p.id.slice(0, 8)}…
                            </Paragraph1>
                          </td>
                          <td className="px-6 py-4">
                            <Paragraph1 className="text-gray-700 text-sm">{p.listingType}</Paragraph1>
                          </td>
                          <td className="px-6 py-4">
                            <Paragraph1 className="text-gray-700 text-sm">{p.status}</Paragraph1>
                          </td>
                          <td className="px-6 py-4">
                            <Paragraph1 className="text-gray-900 text-sm tabular-nums">
                              {listingPriceDisplay(p).listingType === "RESALE"
                                ? "—"
                                : p.dailyPrice != null
                                  ? formatCurrency(p.dailyPrice)
                                  : "—"}
                            </Paragraph1>
                          </td>
                          <td className="px-6 py-4">
                            <Paragraph1 className="text-gray-900 text-sm tabular-nums">
                              {p.resalePrice != null ? formatCurrency(p.resalePrice) : "—"}
                            </Paragraph1>
                          </td>
                          <td className="px-6 py-4">
                            {p.productVerified ? (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Yes
                              </span>
                            ) : (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                No
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <AdminVaultClosetSaleWaitlistCard />
        </div>
      ) : null}
    </div>
  );
}
