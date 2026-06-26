"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";
import { TableSkeleton } from "@/common/ui/SkeletonLoaders";
import { useAdminShopSalePicker } from "@/lib/queries/admin/useShopSales";

type Props = {
  saleId?: string;
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

const PAGE_SIZE = 15;

export default function SaleItemPicker({
  saleId,
  selectedIds,
  onChange,
}: Props) {
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [appliedSearch]);

  const { data, isLoading, isError } = useAdminShopSalePicker({
    search: appliedSearch || undefined,
    page,
    limit: PAGE_SIZE,
    saleId,
  });

  const products = data?.data?.products ?? [];
  const totalPages = data?.data?.totalPages ?? 1;
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const selectAllOnPage = () => {
    const next = new Set(selectedIds);
    for (const p of products) next.add(p.id);
    onChange([...next]);
  };

  const clearAll = () => onChange([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <Paragraph1 className="font-medium text-gray-900">
            {selectedIds.length} listing{selectedIds.length === 1 ? "" : "s"}{" "}
            selected
          </Paragraph1>
          <Paragraph1 className="text-gray-500 text-sm">
            Search by item name, lister, brand, or category.
          </Paragraph1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={selectAllOnPage}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
          >
            Add all on this page
          </button>
          {selectedIds.length > 0 ? (
            <button
              type="button"
              onClick={clearAll}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm hover:bg-gray-50"
            >
              Clear all
            </button>
          ) : null}
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setAppliedSearch(search.trim());
        }}
      >
        <div className="flex flex-1 items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg min-w-0">
          <Search className="w-4 h-4 text-gray-400 shrink-0" aria-hidden />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings..."
            className="flex-1 bg-transparent outline-none min-w-0 text-sm"
          />
        </div>
        <button
          type="submit"
          className="shrink-0 bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg font-medium text-white text-sm"
        >
          Search
        </button>
      </form>

      {selectedIds.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg max-h-32 overflow-y-auto">
          {selectedIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="inline-flex items-center gap-1 bg-white px-2 py-1 border border-gray-200 rounded-full text-xs text-gray-700 hover:bg-gray-100"
            >
              <span className="font-mono">{id.slice(0, 8)}…</span>
              <X className="w-3 h-3" aria-hidden />
            </button>
          ))}
        </div>
      ) : null}

      {isError ? (
        <Paragraph1 className="text-red-600 text-sm">
          Could not load listings. Try again.
        </Paragraph1>
      ) : isLoading ? (
        <TableSkeleton rows={6} columns={4} />
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 w-10" />
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">
                    Listing
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">
                    Lister
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-10 text-center text-gray-500">
                      No listings match your search.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const checked = selectedSet.has(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`border-b border-gray-100 last:border-0 cursor-pointer hover:bg-gray-50 ${checked ? "bg-gray-50/80" : ""}`}
                        onClick={() => toggle(p.id)}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggle(p.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded border-gray-300"
                            aria-label={`Select ${p.name}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            {p.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={p.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded object-cover shrink-0 border border-gray-100"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded bg-gray-100 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <Paragraph1 className="font-medium text-gray-900 truncate">
                                {p.name}
                              </Paragraph1>
                              <Paragraph1 className="text-gray-500 text-xs truncate">
                                {[p.brandName, p.categoryName]
                                  .filter(Boolean)
                                  .join(" · ") || "—"}
                              </Paragraph1>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {p.listerName}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {p.listingType.replace(/_/g, " ")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 ? (
            <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-white">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <Paragraph1 className="text-gray-600 text-sm">
                Page {page} of {totalPages}
              </Paragraph1>
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
