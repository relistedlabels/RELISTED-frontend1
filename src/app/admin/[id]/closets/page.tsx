// ENDPOINTS: GET /api/admin/closets?page&limit&search, GET /api/admin/site-features, PUT /api/admin/site-features, GET /api/admin/closets/vault-closet-sale/waitlist, POST /api/admin/closets/vault-closet-sale/notify-waitlist
"use client";

import { ChevronLeft, ChevronRight, Search, Store } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminPageHeader from "@/app/admin/components/AdminPageHeader";
import {
  type ResponsiveColumnDef,
  ResponsiveDataTable,
} from "@/common/ui/ResponsiveDataTable";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { Paragraph1 } from "@/common/ui/Text";
import type { AdminClosetListRow } from "@/lib/api/admin/closets";
import { useUpdateAdminSiteFeatures } from "@/lib/mutations/admin";
import { useAdminClosets } from "@/lib/queries/admin/useAdminClosets";
import { useAdminSiteFeatures } from "@/lib/queries/admin/useAdminSiteFeatures";
import AdminVaultClosetSaleWaitlistCard from "./components/AdminVaultClosetSaleWaitlistCard";

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

export default function AdminClosetsPage() {
  const params = useParams();
  const adminId = params.id as string;
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isError, error } = useAdminClosets({
    page,
    limit,
    search: appliedSearch || undefined,
  });

  const siteFeatures = useAdminSiteFeatures();
  const updateSiteFeatures = useUpdateAdminSiteFeatures();
  const headerClosetsNavEnabled =
    siteFeatures.data?.data?.headerClosetsShopNavEnabled !== false;

  const toggleHeaderClosetsNav = () => {
    const next = !headerClosetsNavEnabled;
    updateSiteFeatures.mutate(
      { headerClosetsShopNavEnabled: next },
      {
        onError: () => {
          toast.error("Could not update site feature. Try again.");
        },
      },
    );
  };

  const closets: AdminClosetListRow[] = data?.data?.closets ?? [];
  const total = data?.data?.total ?? 0;
  const totalPages = data?.data?.totalPages ?? 1;

  const errMsg = useMemo(() => {
    if (!isError || !error) return null;
    return error instanceof Error ? error.message : "Failed to load closets";
  }, [isError, error]);

  const fromIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const toIdx = Math.min(page * limit, total);

  const closetColumns: ResponsiveColumnDef<AdminClosetListRow>[] = [
    {
      id: "closet",
      header: "Closet",
      mobile: "primary",
      render: (c) => (
        <div className="flex items-center gap-3">
          {c.imageUrl ? (
            <img
              src={c.imageUrl}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg border border-gray-100 object-cover"
            />
          ) : (
            <div className="h-10 w-10 shrink-0 rounded-lg border border-gray-200 bg-gray-100" />
          )}
          <div className="min-w-0">
            <Paragraph1 className="truncate text-sm font-medium text-gray-900">
              {c.name}
            </Paragraph1>
            <Paragraph1 className="truncate font-mono text-xs text-gray-500">
              {c.slug}
            </Paragraph1>
          </div>
        </div>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      mobile: "detail",
      render: (c) => (
        <div>
          <Paragraph1 className="text-sm font-medium text-gray-900">
            {c.owner.name}
          </Paragraph1>
          <Paragraph1 className="max-w-[200px] truncate text-xs text-gray-500">
            {c.owner.email}
          </Paragraph1>
        </div>
      ),
    },
    {
      id: "items",
      header: "Items",
      mobile: "detail",
      render: (c) => (
        <Paragraph1 className="tabular-nums text-gray-900">
          {c.productCount}
        </Paragraph1>
      ),
    },
    {
      id: "wallet",
      header: "Closet wallet",
      mobile: "detail",
      render: (c) => (
        <Paragraph1 className="font-medium tabular-nums text-gray-900">
          {formatCurrency(c.closetWalletBalance)}
        </Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (c) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
            c.isActive
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {c.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      mobile: "action",
      render: (c) => (
        <Link
          href={`/admin/${adminId}/closets/${c.id}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <Paragraph1>View</Paragraph1>
          <ChevronRight size={16} />
        </Link>
      ),
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminPageHeader
        title="Closets"
        description="Manage curator closets, balances, and inventory."
      />

      <section className="mb-6 flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
            <Store size={19} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-gray-900">
              Closet storefront
            </h2>
            <Paragraph1 className="mt-1 text-sm text-gray-500">
              {headerClosetsNavEnabled
                ? "Visible in the site menu and home page."
                : "Hidden from the menu; visitors see the waitlist."}
            </Paragraph1>
          </div>
        </div>
        <button
          type="button"
          disabled={siteFeatures.isLoading || updateSiteFeatures.isPending}
          onClick={toggleHeaderClosetsNav}
          aria-pressed={headerClosetsNavEnabled}
          aria-label="Show closets in the site navigation"
          className={`relative inline-flex h-8 w-14 shrink-0 items-center self-start rounded-full transition-colors disabled:opacity-50 sm:self-center ${
            headerClosetsNavEnabled ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              headerClosetsNavEnabled ? "translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </section>

      <section className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <form
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setAppliedSearch(search.trim());
          }}
        >
          <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-gray-200 px-3 transition focus-within:border-gray-400 focus-within:ring-2 focus-within:ring-gray-900/10">
            <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
            <input
              type="search"
              aria-label="Search closets"
              placeholder="Search closets, owners, or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>
          <button
            type="submit"
            className="h-11 rounded-lg bg-gray-900 px-5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
          >
            Search
          </button>
        </form>
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-gray-900">All closets</h2>
          <Paragraph1 className="text-xs tabular-nums text-gray-500">
            {total} {total === 1 ? "closet" : "closets"}
          </Paragraph1>
        </div>

        {errMsg ? (
          <div className="border-t border-gray-100 p-8 text-center">
            <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
          </div>
        ) : isLoading ? (
          <div className="border-t border-gray-100">
            <TableSkeleton rows={8} columns={6} />
          </div>
        ) : (
          <>
            <div className="overflow-hidden border-t border-gray-100">
              <ResponsiveDataTable
                rows={closets}
                columns={closetColumns}
                getRowKey={(c) => c.id}
                emptyState={
                  <Paragraph1 className="py-12 text-center text-gray-500">
                    No closets match your search.
                  </Paragraph1>
                }
              />
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col gap-4 border-t border-gray-100 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <Paragraph1 className="text-gray-600 text-sm">
                  Showing {fromIdx} to {toIdx} of {total} results
                </Paragraph1>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <div className="flex flex-wrap items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPage(p)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            page === p
                              ? "bg-gray-900 text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          {p}
                        </button>
                      ),
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center gap-1 hover:bg-gray-50 disabled:opacity-50 px-3 py-2 border border-gray-300 rounded-lg font-medium text-sm transition disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      <AdminVaultClosetSaleWaitlistCard />
    </div>
  );
}
