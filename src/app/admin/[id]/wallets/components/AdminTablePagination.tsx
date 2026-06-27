"use client";

import { useEffect, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";

export const WALLETS_PAGE_SIZE = 20;

export const EMPTY_WALLET_PAGINATION = {
  total: 0,
  page: 1,
  limit: WALLETS_PAGE_SIZE,
  pages: 1,
};

export function useWalletTablePage(searchQuery: string) {
  const [page, setPage] = useState(1);
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);
  return { page, setPage, limit: WALLETS_PAGE_SIZE };
}

interface AdminTablePaginationProps {
  pagination: typeof EMPTY_WALLET_PAGINATION;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export default function AdminTablePagination({
  pagination,
  onPageChange,
  isLoading = false,
}: AdminTablePaginationProps) {
  if (pagination.total <= 0) return null;

  const start = (pagination.page - 1) * pagination.limit + 1;
  const end = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <Paragraph1 className="text-sm text-gray-600">
        Showing {start} to {end} of {pagination.total}
      </Paragraph1>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={isLoading || pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600 tabular-nums">
          Page {pagination.page} of {pagination.pages}
        </span>
        <button
          type="button"
          disabled={isLoading || pagination.page >= pagination.pages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
