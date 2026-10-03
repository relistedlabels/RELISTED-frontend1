// ENDPOINTS: GET /api/admin/closets/:closetId, GET /api/admin/closets/vault-closet-sale/waitlist, POST /api/admin/closets/vault-closet-sale/notify-waitlist
"use client";

import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { listingPriceDisplay } from "@/lib/product/listingPriceDisplay";
import { useAdminClosetDetail } from "@/lib/queries/admin/useAdminClosets";
import AdminVaultClosetSaleWaitlistCard from "../components/AdminVaultClosetSaleWaitlistCard";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

type ClosetProductRow = {
  id: string;
  name: string;
  imageUrl?: string | null;
  listingType: string;
  status: string;
  dailyPrice?: number | null;
  resalePrice?: number | null;
  productVerified?: boolean;
};

const productColumns: ResponsiveColumnDef<ClosetProductRow>[] = [
  {
    id: "image",
    header: "Image",
    mobile: "hidden",
    render: (p) => (
      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-gray-100 bg-gray-100">
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
    ),
  },
  {
    id: "product",
    header: "Product",
    mobile: "primary",
    render: (p) => (
      <div>
        <Paragraph1 className="line-clamp-2 max-w-[240px] text-sm font-medium text-gray-900">
          {p.name}
        </Paragraph1>
        <Paragraph1 className="mt-0.5 font-mono text-xs text-gray-400">
          {p.id.slice(0, 8)}…
        </Paragraph1>
      </div>
    ),
  },
  {
    id: "type",
    header: "Type",
    mobile: "detail",
    render: (p) => (
      <Paragraph1 className="text-sm text-gray-700">{p.listingType}</Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (p) => (
      <Paragraph1 className="text-sm text-gray-700">{p.status}</Paragraph1>
    ),
  },
  {
    id: "rental",
    header: "Rental / day",
    mobile: "detail",
    render: (p) => (
      <Paragraph1 className="tabular-nums text-sm text-gray-900">
        {listingPriceDisplay(p).listingType === "RESALE"
          ? "—"
          : p.dailyPrice != null
            ? formatCurrency(p.dailyPrice)
            : "—"}
      </Paragraph1>
    ),
  },
  {
    id: "resale",
    header: "Resale",
    mobile: "detail",
    render: (p) => (
      <Paragraph1 className="tabular-nums text-sm text-gray-900">
        {p.resalePrice != null ? formatCurrency(p.resalePrice) : "—"}
      </Paragraph1>
    ),
  },
  {
    id: "verified",
    header: "Verified",
    mobile: "detail",
    render: (p) =>
      p.productVerified ? (
        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
          Yes
        </span>
      ) : (
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
          No
        </span>
      ),
  },
];

export default function AdminClosetDetailPage() {
  const params = useParams();
  const adminId = params.id as string;
  const closetId = params.closetId as string;

  const { data, isLoading, isError, error } = useAdminClosetDetail(closetId);
  const c = data?.data;

  const errMsg =
    isError && error instanceof Error
      ? error.message
      : isError
        ? "Failed to load"
        : null;

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Link
          href={`/admin/${adminId}/closets`}
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden />
          Back to closets
        </Link>
        <AdminPageHeader
          className="!mb-0"
          title="Closet detail"
          description="Owner, wallet balance, and listings."
        />
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
        <div className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex gap-4 min-w-0">
                {c.imageUrl ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-200">
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
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-gray-50">
                    <LayoutGrid className="w-8 h-8 text-gray-400" aria-hidden />
                  </div>
                )}
                <div className="min-w-0">
                  <Paragraph2 className="mb-1 text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                    {c.name}
                  </Paragraph2>
                  <Paragraph1 className="mb-2 font-mono text-sm text-gray-500">
                    {c.slug}
                  </Paragraph1>
                  {c.description ? (
                    <Paragraph1 className="text-gray-600 text-sm max-w-2xl leading-relaxed">
                      {c.description}
                    </Paragraph1>
                  ) : null}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        c.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                    <Paragraph1 className="text-gray-400 text-xs">
                      {c.products.length} product
                      {c.products.length === 1 ? "" : "s"}
                    </Paragraph1>
                  </div>
                </div>
              </div>

              <div className="shrink-0 rounded-xl border border-gray-200 bg-gray-50/80 p-4 lg:min-w-[280px]">
                <Paragraph1 className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Closet wallet balance
                </Paragraph1>
                <Paragraph2 className="text-gray-900 text-2xl font-bold tabular-nums tracking-tight">
                  {formatCurrency(c.closetWalletBalance)}
                </Paragraph2>
                <Paragraph1 className="mt-2 text-xs leading-relaxed text-gray-500">
                  Lister payout share for partner settlements.
                </Paragraph1>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Owner</h2>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Paragraph1 className="text-gray-900 font-medium">
                  {c.owner.name}
                </Paragraph1>
                <Paragraph1 className="text-gray-600 text-sm">
                  {c.owner.email}
                </Paragraph1>
                <Paragraph1 className="text-gray-500 text-xs mt-1 capitalize">
                  Role: {c.owner.role.toLowerCase()}
                </Paragraph1>
              </div>
              <Link
                href={`/admin/${adminId}/users/${c.owner.id}`}
                className="inline-flex h-10 items-center gap-1 self-start rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:self-center"
              >
                <Paragraph1>User profile</Paragraph1>
                <ChevronRight size={16} />
              </Link>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold text-gray-900">
              Products
            </h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <ResponsiveDataTable
                rows={c.products as unknown as ClosetProductRow[]}
                columns={productColumns}
                getRowKey={(p) => p.id}
                emptyState={
                  <Paragraph1 className="py-12 text-center text-gray-500">
                    No products in this closet.
                  </Paragraph1>
                }
              />
            </div>
          </section>

          <AdminVaultClosetSaleWaitlistCard />
        </div>
      ) : null}
    </div>
  );
}
