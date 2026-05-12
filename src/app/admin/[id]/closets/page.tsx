// ENDPOINTS: GET /api/admin/closets?page&limit&search, GET /api/admin/site-features, PUT /api/admin/site-features
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
          Browse curator closets, tracked payout balance per closet, and inventory
          linked to each drop (admin). Use the toggle below to show or hide the
          Closets link in the public header.
        </Paragraph1>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <Paragraph1 className="mb-3 font-semibold text-gray-500 text-xs uppercase tracking-wide">
          Site feature (global)
        </Paragraph1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Paragraph1 className="text-gray-900 font-medium">
              Closets link in public header
            </Paragraph1>
            <Paragraph1 className="text-gray-500 text-sm mt-1 leading-relaxed">
              When on, renters see Closets next to How it works. It opens the same Vault
              closet drops shop view as Browse All on the home page.
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

      <div className="bg-white mb-6 p-4 border border-gray-200 rounded-lg">
        <form
          className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between"
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
              className="flex-1 bg-transparent outline-none text-gray-900 text-sm placeholder-gray-500 min-w-0"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap bg-gray-900 text-white hover:bg-gray-800 transition-colors"
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
                  <tr className="bg-gray-50 border-b border-gray-200">
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
                        className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {c.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={c.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover border border-gray-100 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <Paragraph1 className="text-gray-900 font-medium text-sm truncate">
                                {c.name}
                              </Paragraph1>
                              <Paragraph1 className="text-gray-500 text-xs font-mono truncate">
                                {c.slug}
                              </Paragraph1>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="text-gray-900 font-medium text-sm">
                            {c.owner.name}
                          </Paragraph1>
                          <Paragraph1 className="text-gray-500 text-xs truncate max-w-[200px]">
                            {c.owner.email}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="text-gray-900 tabular-nums">
                            {c.productCount}
                          </Paragraph1>
                        </td>
                        <td className="px-6 py-4">
                          <Paragraph1 className="text-gray-900 font-medium tabular-nums">
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
                            className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 font-medium text-sm"
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
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
                  ))}
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
