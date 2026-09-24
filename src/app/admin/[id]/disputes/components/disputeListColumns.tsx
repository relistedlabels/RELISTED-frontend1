import type React from "react";
import { Paragraph1 } from "@/common/ui/Text";
import type { ResponsiveColumnDef } from "@/common/ui/ResponsiveDataTable";

export type DisputeListRow = {
  id: string;
  raisedBy: string;
  raiserRole: string;
  raisedByAvatar: string | null;
  listerName: string;
  renterName: string;
  category: string;
  orderId: string;
  preferredResolution: string;
  dateCreated: string;
  status: string;
  statusRaw?: string;
  assignedTo?: string;
  resolution?: string;
  dateResolved?: string;
};

function RaisedByCell({ item }: { item: DisputeListRow }) {
  return (
    <div className="flex items-center gap-3">
      {item.raisedByAvatar ? (
        <img
          src={item.raisedByAvatar}
          alt={item.raisedBy}
          className="h-8 w-8 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
          <Paragraph1 className="text-xs font-semibold text-gray-700">
            {(item.raisedBy || "U").trim().charAt(0).toUpperCase()}
          </Paragraph1>
        </div>
      )}
      <div>
        <Paragraph1 className="font-medium text-gray-900">
          {item.raisedBy}
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-500">
          {item.raiserRole}
        </Paragraph1>
      </div>
    </div>
  );
}

const baseColumns = (): ResponsiveColumnDef<DisputeListRow>[] => [
  {
    id: "disputeId",
    header: "Dispute ID",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="font-medium text-gray-900">{item.id}</Paragraph1>
    ),
  },
  {
    id: "raisedBy",
    header: "Raised By",
    mobile: "primary",
    render: (item) => <RaisedByCell item={item} />,
  },
  {
    id: "lister",
    header: "Lister",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-gray-600">{item.listerName}</Paragraph1>
    ),
  },
  {
    id: "renter",
    header: "Renter",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-gray-600">{item.renterName}</Paragraph1>
    ),
  },
  {
    id: "category",
    header: "Category",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-gray-600">{item.category}</Paragraph1>
    ),
  },
  {
    id: "orderId",
    header: "Order ID",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="font-medium text-gray-900">{item.orderId}</Paragraph1>
    ),
  },
  {
    id: "preferredResolution",
    header: "Preferred Resolution",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-gray-600">{item.preferredResolution}</Paragraph1>
    ),
  },
];

export function buildPendingDisputeColumns(
  onViewDetails: (id: string) => void,
): ResponsiveColumnDef<DisputeListRow>[] {
  return [
    ...baseColumns(),
    {
      id: "dateCreated",
      header: "Date Created",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.dateCreated}</Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (item) => (
        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
          {item.status}
        </span>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (item) => (
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
          onClick={() => onViewDetails(item.id)}
        >
          <Paragraph1>View Details</Paragraph1>
        </button>
      ),
    },
  ];
}

export function buildUnderReviewDisputeColumns(
  onViewDetails: (id: string) => void,
  statusBadge: (item: DisputeListRow) => React.ReactNode,
): ResponsiveColumnDef<DisputeListRow>[] {
  return [
    ...baseColumns(),
    {
      id: "dateCreated",
      header: "Date Created",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.dateCreated}</Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (item) => statusBadge(item),
    },
    {
      id: "assignedTo",
      header: "Assigned To",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.assignedTo}</Paragraph1>
      ),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (item) => (
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
          onClick={() => onViewDetails(item.id)}
        >
          <Paragraph1>View Details</Paragraph1>
        </button>
      ),
    },
  ];
}

export function buildResolvedDisputeColumns(
  onViewDetails: (id: string) => void,
  statusBadge: (item: DisputeListRow) => React.ReactNode,
): ResponsiveColumnDef<DisputeListRow>[] {
  return [
    ...baseColumns(),
    {
      id: "resolution",
      header: "Resolution",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.resolution}</Paragraph1>
      ),
    },
    {
      id: "dateCreated",
      header: "Date Created",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.dateCreated}</Paragraph1>
      ),
    },
    {
      id: "dateResolved",
      header: "Date Resolved",
      mobile: "detail",
      render: (item) => (
        <Paragraph1 className="text-gray-600">{item.dateResolved}</Paragraph1>
      ),
    },
    {
      id: "status",
      header: "Status",
      mobile: "badge",
      render: (item) => statusBadge(item),
    },
    {
      id: "action",
      header: "Action",
      mobile: "action",
      render: (item) => (
        <button
          type="button"
          className="rounded-lg border border-gray-300 px-4 py-2 font-medium hover:bg-gray-50"
          onClick={() => onViewDetails(item.id)}
        >
          <Paragraph1>View Details</Paragraph1>
        </button>
      ),
    },
  ];
}
