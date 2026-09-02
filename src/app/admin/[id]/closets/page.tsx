// ENDPOINTS: GET /api/admin/closets?page&limit&search, GET /api/admin/site-features, PUT /api/admin/site-features, GET /api/admin/closets/vault-closet-sale/waitlist, POST /api/admin/closets/vault-closet-sale/notify-waitlist
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminClosets } from "@/lib/queries/admin/useAdminClosets";
import { useAdminSiteFeatures } from "@/lib/queries/admin/useAdminSiteFeatures";
import { useUpdateAdminSiteFeatures } from "@/lib/mutations/admin";
import { toast } from "sonner";
import type { AdminClosetListRow } from "@/lib/api/admin/closets";
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

  const empty = !isLoading && !isError && closets.length === 0;

  const errMsg = useMemo(() => {
    if (!isError || !error) return null;
    return error instanceof Error ? error.message : "Failed to load closets";
  }, [isError, error]);

  const fromIdx = total === 0 ? 0 : (page - 1) * limit + 1;
  const toIdx = Math.min(page * limit, total);

  return (
    <div className="min-h-screen">
      <div className="mb-6">
        <Paragraph2 className="mb-1 font-extrabold text-gray-900 text-2xl tracking-tight">
          Closets
        </Paragraph2>
        <Paragraph1 className="text-gray-600">
          Curator closets, balances, and inventory for admin.
        </Paragraph1>
      </div>

      <div className="bg-white mb-6 p-6 border border-gray-200 rounded-lg">
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4">
          <div>
            <Paragraph1 className="font-medium text-gray-900">
              Closet Feature
            </Paragraph1>
            <Paragraph1 className="mt-1 text-gray-500 text-sm leading-snug">
              <b>On:</b> <span className="text-gray-800">Closets</span> shown in
              the top menu and as the first category on the home page,
              banner shows <span className="text-gray-800">Shop now</span>.
            </Paragraph1>
            <Paragraph1 className="mt-1 text-gray-500 text-sm leading-snug">
              <b>Off:</b> no menu item, banner shows{" "}
              <span className="text-gray-800">Join waitlist</span>.
            </Paragraph1>
          </div>
          <button
            type="button"
            disabled={siteFeatures.isLoading || updateSiteFeatures.isPending}
            onClick={toggleHeaderClosetsNav}
            aria-pressed={headerClosetsNavEnabled}
            className={`relative shrink-0 inline-flex items-center h-8 w-14 rounded-full transition-colors self-start sm:self-center disabled:opacity-50 ${
              headerClosetsNavEnabled ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                headerClosetsNavEnabled ? "translate-x-7" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <AdminVaultClosetSaleWaitlistCard />

      <div className="bg-white mb-6 p-4 border border-gray-200 rounded-lg">
        <form
          className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setAppliedSearch(search.trim());
          }}
        >
          <div className="flex flex-1 items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg min-w-0">
            <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
            <input
              type="search"
              placeholder="Search name, slug, owner name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none min-w-0 text-gray-900 text-sm placeholder-gray-500"
            />
          </div>
          <button
            type="submit"
            className="bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg font-medium text-white text-sm whitespace-nowrap transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {errMsg ? (
        <div className="bg-white p-8 border border-gray-200 rounded-lg text-center">
          <Paragraph1 className="text-red-600">{errMsg}</Paragraph1>
        </div>
      ) : isLoading ? (
        <TableSkeleton rows={8} columns={6} />
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-gray-200 border-b">
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Closet
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Owner
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Items
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Closet wallet
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Status
                      </Paragraph1>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <Paragraph1 className="font-semibold text-gray-600 text-xs uppercase tracking-wide">
                        Actions
                      </Paragraph1>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {empty ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <Paragraph1 className="text-gray-500">
                          No closets match your search.
                        </Paragraph1>
                      </td>
                    </tr>
                  ) : (
                    closets.map((c) => (
                      <tr
                        key={c.id}
                        className="hover:bg-gray-50 border-gray-100 last:border-0 border-b transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {c.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.imageUrl}
                                alt=""
                                className="border border-gray-100 rounded-lg w-10 h-10 object-cover shrink-0"
                              />
                            ) : (
                              <div className="bg-gray-100 border border-gray-200 rounded-lg w-10 h-10 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <Paragraph1 className="font-medium text-gray-900 text-sm truncate">
                                {c.name}
                              </Paragraph1>
                              <Paragraph1 className="font-mono text-gray-500 text-xs truncate">
                                {c.slug}
                              </Paragraph1>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="font-medium text-gray-900 text-sm">
                            {c.owner.name}
                          </Paragraph1>
                          <Paragraph1 className="max-w-[200px] text-gray-500 text-xs truncate">
                            {c.owner.email}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="tabular-nums text-gray-900">
                            {c.productCount}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="font-medium tabular-nums text-gray-900">
                            {formatCurrency(c.closetWalletBalance)}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              c.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {c.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/${adminId}/closets/${c.id}`}
                            className="inline-flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 text-sm"
                          >
                            <Paragraph1>View</Paragraph1>
                            <ChevronRight size={16} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-4 bg-white mt-6 px-6 py-4 border border-gray-200 rounded-lg">
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
    </div>
  );
}
