import type { ResponsiveColumnDef } from "@/common/ui/ResponsiveDataTable";
import { Paragraph1 } from "@/common/ui/Text";
import type { Order } from "@/lib/api/admin/orders";
import { getAdminOrderStatusLabel } from "@/lib/orders/shipmentAndOrderLabels";

const getDefaultAvatar = (name?: string): string =>
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || "user")}`;

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(value);

const getStatusColor = (statusLabel: string) => {
  switch (statusLabel) {
    case "Processing":
    case "Accepted":
    case "Confirmed":
    case "Preparing":
      return "bg-gray-100 text-gray-700";
    case "In transit":
      return "bg-blue-100 text-blue-700";
    case "Delivered":
    case "Active (rental)":
      return "bg-green-100 text-green-700";
    case "Return due":
    case "Return pickup":
      return "bg-yellow-100 text-yellow-700";
    case "Returned":
      return "bg-indigo-100 text-indigo-800";
    case "Completed":
      return "bg-emerald-100 text-emerald-800";
    case "Cancelled":
    case "Rejected":
      return "bg-red-100 text-red-700";
    case "In dispute":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

function PersonCell({
  person,
}: {
  person?: { name: string; avatar?: string | null } | null;
}) {
  if (!person) {
    return <Paragraph1 className="text-sm text-gray-500">N/A</Paragraph1>;
  }
  return (
    <div className="flex items-center gap-2">
      <img
        src={person.avatar || getDefaultAvatar(person.name)}
        alt={person.name}
        className="h-8 w-8 rounded-full object-cover"
      />
      <Paragraph1 className="text-sm text-gray-900">{person.name}</Paragraph1>
    </div>
  );
}

const mobileDetailLabelClass =
  "text-[11px] font-semibold uppercase tracking-wide text-gray-500";

export function OrderMobileCard({ order }: { order: Order }) {
  const statusLabel = getAdminOrderStatusLabel(order.status);
  const returnDue = String(order.returnDue ?? "").trim();
  const hasReturnDue =
    returnDue !== "" && returnDue.toLowerCase() !== "n/a" && returnDue !== "—";

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          {order.lister ? (
            <img
              src={order.lister.avatar || getDefaultAvatar(order.lister.name)}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
              L
            </span>
          )}
          <div className="min-w-0">
            <span className={mobileDetailLabelClass}>Lister</span>
            <p className="truncate text-sm font-semibold text-gray-900">
              {order.lister?.name || "Unknown lister"}
            </p>
          </div>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(statusLabel)}`}
        >
          {statusLabel}
        </span>
      </div>

      {order.itemPreview && (
        <div className="mt-4 flex min-w-0 items-center gap-3 rounded-lg bg-gray-50 p-2.5">
          {order.itemPreview.image ? (
            <img
              src={order.itemPreview.image}
              alt=""
              className="h-14 w-14 shrink-0 rounded-md bg-white object-cover"
            />
          ) : (
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-white text-xs font-semibold text-gray-400">
              Item
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">
              {order.itemPreview.name}
            </p>
            {order.items > 1 && (
              <p className="mt-0.5 text-xs text-gray-500">
                +{order.items - 1} more {order.items === 2 ? "item" : "items"}
              </p>
            )}
            {order.items === 1 && (
              <p className="mt-0.5 text-xs text-gray-500">1 item</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4 border-t border-gray-100 pt-4">
        <div className="min-w-0">
          <p className={mobileDetailLabelClass}>Date</p>
          <p className="mt-1 text-sm text-gray-700">{order.date || "—"}</p>
        </div>
        <div className="min-w-0">
          <p className={mobileDetailLabelClass}>Renter</p>
          <div className="mt-1">
            <PersonCell person={order.renter} />
          </div>
        </div>
      </div>

      <div
        className={`mt-4 grid grid-cols-2 gap-x-4 border-t border-gray-100 pt-3 ${
          hasReturnDue ? "gap-y-3" : ""
        }`}
      >
        <div className="min-w-0">
          <p className={mobileDetailLabelClass}>Order ID</p>
          <p className="mt-1 break-all text-sm font-medium text-gray-900">
            {order.id}
          </p>
        </div>
        {hasReturnDue && (
          <div className="min-w-0">
            <p className={mobileDetailLabelClass}>Return due</p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              {returnDue}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4 border-t border-gray-200 pt-3">
        <div>
          <p className={mobileDetailLabelClass}>Total</p>
          <p className="mt-0.5 text-lg font-semibold text-gray-900">
            {formatCurrency(order.total)}
          </p>
        </div>
      </div>
    </>
  );
}

export const returnColumns: ResponsiveColumnDef<any>[] = [
  {
    id: "returnId",
    header: "Return ID",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm font-medium text-gray-900">{item.id}</Paragraph1>
    ),
  },
  {
    id: "orderId",
    header: "Order ID",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">{item.orderId}</Paragraph1>
    ),
  },
  {
    id: "itemName",
    header: "Item Name",
    mobile: "primary",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-900">{item.itemName}</Paragraph1>
    ),
  },
  {
    id: "lister",
    header: "Lister",
    mobile: "detail",
    render: (item) => <PersonCell person={item.lister} />,
  },
  {
    id: "renter",
    header: "Renter",
    mobile: "detail",
    render: (item) => <PersonCell person={item.renter} />,
  },
  {
    id: "condition",
    header: "Condition",
    mobile: "badge",
    render: (item) => (
      <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
        {item.itemCondition}
      </span>
    ),
  },
  {
    id: "damageNotes",
    header: "Damage Notes",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">
        {item.damageNotes || "-"}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (item) => (
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
          item.status === "APPROVED"
            ? "bg-green-100 text-green-700"
            : item.status === "REJECTED"
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {item.status}
      </span>
    ),
  },
  {
    id: "date",
    header: "Date",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">
        {new Date(item.createdAt).toLocaleDateString()}
      </Paragraph1>
    ),
  },
];

export const orderColumns: ResponsiveColumnDef<any>[] = [
  {
    id: "orderId",
    header: "Order ID",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm font-medium text-gray-900">{item.id}</Paragraph1>
    ),
  },
  {
    id: "date",
    header: "Date",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">{item.date}</Paragraph1>
    ),
  },
  {
    id: "lister",
    header: "Lister",
    mobile: "primary",
    render: (item) => <PersonCell person={item.lister} />,
  },
  {
    id: "renter",
    header: "Renter",
    mobile: "detail",
    render: (item) => <PersonCell person={item.renter} />,
  },
  {
    id: "items",
    header: "Items",
    mobile: "detail",
    mobileLabel: "Items",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">
        {item.items} {item.items === 1 ? "item" : "items"}
      </Paragraph1>
    ),
  },
  {
    id: "total",
    header: "Total",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm font-medium text-gray-900">
        {formatCurrency(item.total)}
      </Paragraph1>
    ),
  },
  {
    id: "status",
    header: "Status",
    mobile: "badge",
    render: (item) => {
      const statusLabel = getAdminOrderStatusLabel(item.status);
      return (
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(statusLabel)}`}
        >
          {statusLabel}
        </span>
      );
    },
  },
  {
    id: "returnDue",
    header: "Return Due",
    mobile: "detail",
    render: (item) => (
      <Paragraph1 className="text-sm text-gray-700">{item.returnDue}</Paragraph1>
    ),
  },
];
