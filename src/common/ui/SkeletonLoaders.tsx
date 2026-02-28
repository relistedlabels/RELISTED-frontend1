import React from "react";

// Stats Card Skeleton
export const StatCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
      <div className="w-16 h-6 bg-gray-200 rounded"></div>
    </div>
    <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
    <div className="w-32 h-4 bg-gray-200 rounded mb-3"></div>
    <div className="flex gap-1 h-12">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex-1 bg-gray-200 rounded"></div>
      ))}
    </div>
  </div>
);

// Analytics Header Skeleton
export const AnalyticsHeaderSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex justify-between items-center">
      <div className="w-48 h-8 bg-gray-200 rounded"></div>
      <div className="flex gap-2">
        <div className="w-32 h-10 bg-gray-200 rounded"></div>
        <div className="w-32 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="flex gap-4 mt-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

// Chart Skeleton
export const ChartSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="w-48 h-6 bg-gray-200 rounded mb-4"></div>
    <div className="flex items-end justify-between h-64 gap-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="flex-1 bg-gray-200 rounded-t"
          style={{ height: `${Math.random() * 100 + 20}%` }}
        ></div>
      ))}
    </div>
  </div>
);

// Table Skeleton
export const TableSkeleton = ({
  rows = 5,
  columns = 5,
}: {
  rows?: number;
  columns?: number;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse">
    {/* Header */}
    <div className="flex border-b border-gray-200 bg-gray-50 p-4 gap-4">
      {[...Array(columns)].map((_, i) => (
        <div key={i} className="flex-1 h-4 bg-gray-200 rounded"></div>
      ))}
    </div>
    {/* Rows */}
    {[...Array(rows)].map((_, rowIdx) => (
      <div key={rowIdx} className="flex border-b border-gray-200 p-4 gap-4">
        {[...Array(columns)].map((_, colIdx) => (
          <div key={colIdx} className="flex-1 h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    ))}
  </div>
);

// List Item Skeleton
export const ListItemSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse flex items-center gap-4"
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-24 h-3 bg-gray-200 rounded"></div>
        </div>
        <div className="w-20 h-4 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Card Grid Skeleton
export const CardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="w-full h-40 bg-gray-200 rounded mb-3"></div>
        <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Detail Panel Skeleton
export const DetailPanelSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="w-40 h-5 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-2">
          {[...Array(3)].map((_, j) => (
            <div key={j} className="flex justify-between">
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
              <div className="w-32 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

// Form Skeleton
export const FormSkeleton = ({ fields = 5 }: { fields?: number }) => (
  <div className="space-y-4 animate-pulse">
    {[...Array(fields)].map((_, i) => (
      <div key={i}>
        <div className="w-24 h-4 bg-gray-200 rounded mb-2"></div>
        <div className="w-full h-10 bg-gray-200 rounded"></div>
      </div>
    ))}
    <div className="flex gap-2 pt-4">
      <div className="w-24 h-10 bg-gray-200 rounded"></div>
      <div className="w-24 h-10 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Timeline Skeleton
export const TimelineSkeleton = ({ events = 5 }: { events?: number }) => (
  <div className="space-y-4 animate-pulse">
    {[...Array(events)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="w-3 h-3 bg-gray-200 rounded-full mt-1.5 flex-shrink-0"></div>
        <div className="flex-1">
          <div className="w-32 h-4 bg-gray-200 rounded mb-2"></div>
          <div className="w-48 h-3 bg-gray-200 rounded mb-2"></div>
          <div className="w-20 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    ))}
  </div>
);

// Metric Cards Skeleton
export const MetricCardsSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="w-32 h-4 bg-gray-200 rounded"></div>
          <div className="w-8 h-8 bg-gray-200 rounded"></div>
        </div>
        <div className="w-24 h-6 bg-gray-200 rounded mb-2"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

// Tab Content Skeleton
export const TabContentSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex gap-2 mb-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="w-24 h-8 bg-gray-200 rounded"></div>
      ))}
    </div>
    <TableSkeleton rows={4} columns={5} />
  </div>
);

// Modal/Dialog Skeleton
export const ModalSkeleton = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-pulse">
    <div className="bg-white rounded-lg p-6 max-w-md w-full space-y-4">
      <div className="w-48 h-6 bg-gray-200 rounded"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="flex gap-2 pt-4">
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
        <div className="flex-1 h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);

// Product Card Skeleton
export const ProductCardSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-lg overflow-hidden animate-pulse"
      >
        <div className="w-full h-48 bg-gray-200"></div>
        <div className="p-4 space-y-3">
          <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
          <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
          <div className="flex justify-between items-center">
            <div className="w-20 h-4 bg-gray-200 rounded"></div>
            <div className="w-16 h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Category Card Skeleton
export const CategoryCardSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-[23px]">
    {[...Array(3)].map((_, idx) => (
      <div key={idx} className="flex flex-row xl:flex-col gap-2 sm:gap-[23px]">
        {[...Array(2)].map((_, rowIdx) => (
          <div
            key={`${idx}-${rowIdx}`}
            className="relative w-full group overflow-hidden cursor-pointer bg-gray-200 h-[200px] sm:h-[280px] rounded-lg animate-pulse"
          ></div>
        ))}
      </div>
    ))}
  </div>
);

// User Card Skeleton
export const UserCardSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse"
      >
        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3"></div>
        <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="w-20 h-3 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="w-24 h-3 bg-gray-200 rounded mx-auto"></div>
      </div>
    ))}
  </div>
);

// Product Detail Skeleton
export const ProductDetailSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
    <div className="w-full h-96 bg-gray-200 rounded-lg"></div>
    <div className="space-y-4">
      <div className="w-3/4 h-6 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="w-full h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
      <div className="w-full h-10 bg-gray-200 rounded mt-6"></div>
    </div>
  </div>
);

// Profile Card Skeleton
export const ProfileCardSkeleton = () => (
  <div className="font-sans bg-white p-4 sm:p-6 rounded-xl border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="text-gray-900 h-4 w-24 bg-gray-200 rounded"></div>
      <div className="p-2 border border-gray-200 rounded-lg w-10 h-10 bg-gray-200"></div>
    </div>
    <div className="flex space-x-4">
      <div className="w-12 h-12 sm:w-30 sm:h-30 rounded-full bg-gray-200 flex-shrink-0"></div>
      <div className="grow space-y-3">
        <div className="h-4 w-32 bg-gray-200 rounded"></div>
        <div className="h-3 w-48 bg-gray-200 rounded"></div>
        <div className="h-3 w-40 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
);
