"use client";

import type React from "react";
import { Paragraph1 } from "@/common/ui/Text";

export type ResponsiveColumnMobileRole =
  | "primary"
  | "badge"
  | "detail"
  | "action"
  | "hidden";

export type ResponsiveColumnDef<T> = {
  id: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
  mobile?: ResponsiveColumnMobileRole;
  mobileLabel?: React.ReactNode;
};

function normalizeHeaderLabel(header: React.ReactNode): string {
  if (typeof header === "string" || typeof header === "number") {
    return String(header);
  }
  return "";
}

function inferMobileRole<T>(
  column: ResponsiveColumnDef<T>,
  index: number,
  total: number,
): ResponsiveColumnMobileRole {
  if (column.mobile) return column.mobile;
  const id = column.id.toLowerCase();
  const label = normalizeHeaderLabel(column.header).toLowerCase();
  if (id.includes("action") || label.includes("action")) return "action";
  if (id.includes("status") || label.includes("status")) return "badge";
  if (index === 0) return "primary";
  if (index === total - 1 && label.includes("action")) return "action";
  return "detail";
}

function isActionColumn<T>(column: ResponsiveColumnDef<T>): boolean {
  if (column.mobile === "action") return true;
  const id = column.id.toLowerCase();
  const label = normalizeHeaderLabel(column.header).toLowerCase();
  return id.includes("action") || label.includes("action");
}

export type ResponsiveDataTableProps<T> = {
  rows: T[];
  columns: ResponsiveColumnDef<T>[];
  getRowKey: (row: T) => string;
  onRowClick?: (row: T) => void;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingState?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  desktopMinWidthClassName?: string;
};

export function ResponsiveDataTable<T>({
  rows,
  columns,
  getRowKey,
  onRowClick,
  emptyState,
  loading = false,
  loadingState,
  className = "",
  tableClassName = "w-full",
  desktopMinWidthClassName = "md:min-w-full",
}: ResponsiveDataTableProps<T>) {
  const columnMeta = columns.map((col, index) => ({
    ...col,
    mobileRole: inferMobileRole(col, index, columns.length),
  }));

  if (loading) {
    return (
      <div className={className}>
        {loadingState ?? (
          <div className="px-4 py-8 text-center md:px-6">
            <Paragraph1 className="text-gray-500">Loading...</Paragraph1>
          </div>
        )}
      </div>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={className}>
        {emptyState ?? (
          <div className="px-4 py-8 text-center md:px-6">
            <Paragraph1 className="text-gray-500">No results found</Paragraph1>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="divide-y divide-gray-100 md:hidden">
        {rows.map((row, rowIndex) => {
          const primaryCols = columnMeta.filter((c) => c.mobileRole === "primary");
          const badgeCols = columnMeta.filter((c) => c.mobileRole === "badge");
          const detailCols = columnMeta.filter((c) => c.mobileRole === "detail");
          const actionCols = columnMeta.filter((c) => c.mobileRole === "action");

          return (
            <div
              key={getRowKey(row)}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick(row);
                      }
                    }
                  : undefined
              }
              className={`bg-white px-4 py-4 ${
                onRowClick ? "cursor-pointer active:bg-gray-50" : ""
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  {(primaryCols.length > 0 ? primaryCols : [columnMeta[0]]).map(
                    (col) => (
                      <div key={col.id} className="min-w-0">
                        {col.render(row, rowIndex)}
                      </div>
                    ),
                  )}
                </div>
                {badgeCols.length > 0 ? (
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    {badgeCols.map((col) => (
                      <div key={col.id}>{col.render(row, rowIndex)}</div>
                    ))}
                  </div>
                ) : null}
              </div>

              {detailCols.length > 0 ? (
                <dl className="mt-3 space-y-2 border-t border-gray-100 pt-3">
                  {detailCols.map((col) => (
                    <div
                      key={col.id}
                      className="flex items-start justify-between gap-4"
                    >
                      <dt className="shrink-0 text-xs font-semibold uppercase tracking-wide text-gray-500">
                        {col.mobileLabel ?? normalizeHeaderLabel(col.header)}
                      </dt>
                      <dd className="min-w-0 text-right text-sm text-gray-900">
                        {col.render(row, rowIndex)}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {actionCols.length > 0 ? (
                <div
                  className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-gray-100 pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionCols.map((col) => (
                    <div key={col.id}>{col.render(row, rowIndex)}</div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="-mx-3 hidden overflow-x-auto px-3 md:mx-0 md:block md:px-0">
        <table className={`${tableClassName} ${desktopMinWidthClassName}`}>
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              {columns.map((col) => (
                <th
                  key={col.id}
                  className={`px-6 py-4 text-left ${col.headerClassName ?? ""}`}
                >
                  {typeof col.header === "string" ? (
                    <Paragraph1 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
                      {col.header}
                    </Paragraph1>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr
                key={getRowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-gray-200 transition-colors ${
                  onRowClick ? "cursor-pointer hover:bg-gray-50" : "hover:bg-gray-50"
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.id}
                    className={`px-6 py-4 ${col.cellClassName ?? ""}`}
                    onClick={
                      isActionColumn(col)
                        ? (e) => e.stopPropagation()
                        : undefined
                    }
                  >
                    {col.render(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
