"use client";

import React, { useMemo, useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { HiOutlineArrowUpTray, HiOutlineChevronDown } from "react-icons/hi2";
import { toast } from "sonner";
import { useRaiseDispute } from "@/lib/mutations/renters/useDisputeMutations";
import { useOrders } from "@/lib/queries/renters/useOrders";
import { useUpload } from "@/lib/queries/renters/useUpload";

const ISSUE_CATEGORIES = [
  "Damaged Item",
  "Incorrect Item Received",
  "Item Not Delivered",
  "Hygiene Concern",
  "Misrepresented Description",
  "Other",
];

const PREFERRED_RESOLUTION_OPTIONS = [
  "Full Refund",
  "Partial Refund",
  "Replacement",
  "Repair",
  "Other",
];

interface RaiseDisputeFormProps {
  onSuccess?: () => void;
}

type RenterOrderRow = {
  orderId: string;
  itemId: string;
  itemName?: string;
  status?: string;
  totalAmount?: number;
  date?: string;
  listerName?: string;
  items?: string[];
};

const isAvailabilityRequestRow = (row: any) => {
  const orderId = String(row?.orderId ?? row?.orderNumber ?? row?.id ?? "").trim();
  if (orderId.toUpperCase().startsWith("REQ")) return true;
  const status = String(row?.status ?? "").trim().toLowerCase();
  if (["pending", "approved", "rejected", "expired"].includes(status)) return true;
  if (row?.requestId) return true;
  if (row?.productId) return true;
  if (row?.estimatedRentalPrice != null) return true;
  return false;
};

const statusLabel = (value: string | undefined) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "—";
  return raw
    .split("_")
    .filter(Boolean)
    .map((p) => p.slice(0, 1).toUpperCase() + p.slice(1).toLowerCase())
    .join(" ");
};

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const RaiseDisputeForm: React.FC<RaiseDisputeFormProps> = ({
  onSuccess,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amountDisputed, setAmountDisputed] = useState<number | undefined>();
  const [preferredResolution, setPreferredResolution] = useState("");
  const [otherPreferredResolution, setOtherPreferredResolution] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const raiseDisputeMutation = useRaiseDispute();
  const uploadMutation = useUpload();

  const { data: ordersData, isLoading: isOrdersLoading } = useOrders(
    undefined,
    1,
    100,
    "newest",
  ) as { data?: any; isLoading: boolean };

  const orders: RenterOrderRow[] = useMemo(() => {
    const raw: any[] = Array.isArray((ordersData as any)?.orders)
      ? (ordersData as any).orders
      : [];

    return raw
      .filter((o) => !isAvailabilityRequestRow(o))
      .map((o) => ({
        orderId: String(o.orderId ?? ""),
        itemId: String(o.itemId ?? ""),
        itemName: typeof o.itemName === "string" ? o.itemName : undefined,
        status: typeof o.status === "string" ? o.status : undefined,
        totalAmount: typeof o.totalAmount === "number" ? o.totalAmount : undefined,
        date: typeof o.date === "string" ? o.date : undefined,
        listerName: typeof o.listerName === "string" ? o.listerName : undefined,
        items: Array.isArray(o.items) ? o.items.map((x: any) => String(x)) : undefined,
      }))
      .filter((o) => o.orderId && o.itemId);
  }, [ordersData]);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const orderId = o.orderId.toLowerCase();
      const itemName = String(o.itemName ?? "").toLowerCase();
      const listerName = String(o.listerName ?? "").toLowerCase();
      return orderId.includes(q) || itemName.includes(q) || listerName.includes(q);
    });
  }, [orders, searchQuery]);

  const selectedOrder = useMemo(
    () => orders.find((o) => o.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsCategoryDropdownOpen(false);
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const merged = [...uploadedFiles, ...files].slice(0, 3);
    setUploadedFiles(merged);

    const remainingSlots = Math.max(0, 3 - previewUrls.length);
    files.slice(0, remainingSlots).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrls((prev) => [...prev, String(event.target?.result || "")]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removeEvidence = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!selectedOrder) {
      toast.error("Please select an order.");
      return;
    }

    if (!selectedCategory) {
      toast.error("Please select an issue category.");
      return;
    }

    const trimmedDescription = description.trim();
    if (trimmedDescription.length < 20) {
      toast.error(
        `Description must be at least 20 characters (currently ${trimmedDescription.length}).`,
      );
      return;
    }

    const preferredResolutionValue =
      preferredResolution === "Other"
        ? otherPreferredResolution.trim()
        : preferredResolution.trim();

    if (preferredResolution === "Other" && !preferredResolutionValue) {
      toast.error("Please specify your preferred resolution.");
      return;
    }

    try {
      const evidenceFiles: string[] = [];
      for (const file of uploadedFiles) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadResult: any = await uploadMutation.mutateAsync(formData);
        const uploadId =
          uploadResult?.uploadId ||
          uploadResult?.id ||
          uploadResult?.data?.uploadId ||
          uploadResult?.data?.id;
        if (uploadId) evidenceFiles.push(uploadId);
      }

      await raiseDisputeMutation.mutateAsync({
        orderId: selectedOrder.orderId,
        itemId: selectedOrder.itemId,
        issueCategory: selectedCategory,
        description: trimmedDescription,
        ...(typeof amountDisputed === "number" ? { amountDisputed } : {}),
        ...(preferredResolutionValue
          ? { preferredResolution: preferredResolutionValue }
          : {}),
        ...(evidenceFiles.length > 0 ? { evidenceFiles } : {}),
      });

      toast.success("Dispute submitted.");
      setSelectedOrderId("");
      setSelectedCategory("");
      setDescription("");
      setAmountDisputed(undefined);
      setPreferredResolution("");
      setOtherPreferredResolution("");
      setSearchQuery("");
      setUploadedFiles([]);
      setPreviewUrls([]);
      onSuccess?.();
    } catch (e: any) {
      toast.error(e?.message || "Failed to submit dispute.");
    }
  };

  return (
    <div className="font-sans">
      <div className="mb-4">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Select Order*
        </Paragraph1>
        {isOrdersLoading ? (
          <div className="bg-gray-50 p-3 border border-gray-200 rounded-lg w-full text-gray-500 text-sm">
            Loading orders...
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Search by order ID, item name, or lister..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="p-3 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full transition duration-150"
            />

            <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto">
              {filteredOrders.length === 0 ? (
                <div className="p-3 text-gray-500 text-sm">No matching orders.</div>
              ) : (
                filteredOrders.map((o) => {
                  const isActive = o.orderId === selectedOrderId;
                  return (
                    <button
                      key={o.orderId}
                      type="button"
                      onClick={() => setSelectedOrderId(o.orderId)}
                      className={`w-full flex items-center justify-between gap-3 p-3 text-left hover:bg-gray-50 transition ${
                        isActive ? "bg-gray-50" : "bg-white"
                      }`}
                    >
                      <div className="min-w-0">
                        <Paragraph1 className="font-semibold text-gray-900 text-sm truncate">
                          {o.orderId}
                        </Paragraph1>
                        <Paragraph1 className="text-gray-600 text-xs">
                          {o.itemName || "—"}
                          {o.listerName ? ` • ${o.listerName}` : ""}
                        </Paragraph1>
                      </div>
                      <Paragraph1 className="text-gray-500 text-xs">
                        {statusLabel(o.status)}
                      </Paragraph1>
                    </button>
                  );
                })
              )}
            </div>

            {selectedOrder ? (
              <div className="bg-white p-3 border border-gray-200 rounded-lg">
                <Paragraph1 className="text-gray-500 text-xs">Selected Order</Paragraph1>
                <div className="flex justify-between items-start gap-3 mt-1">
                  <div className="min-w-0">
                    <Paragraph1 className="font-semibold text-gray-900 text-sm truncate">
                      {selectedOrder.orderId}
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 text-xs">
                      {selectedOrder.itemName || "—"}
                      {selectedOrder.listerName ? ` • ${selectedOrder.listerName}` : ""}
                    </Paragraph1>
                    <Paragraph1 className="text-gray-600 text-xs">
                      {statusLabel(selectedOrder.status)}
                      {formatDate(selectedOrder.date) ? ` • ${formatDate(selectedOrder.date)}` : ""}
                    </Paragraph1>
                    {selectedOrder.items && selectedOrder.items.length > 0 ? (
                      <Paragraph1 className="text-gray-600 text-xs">
                        {selectedOrder.items.slice(0, 3).join(", ")}
                        {selectedOrder.items.length > 3
                          ? ` +${selectedOrder.items.length - 3} more`
                          : ""}
                      </Paragraph1>
                    ) : null}
                  </div>
                  {typeof selectedOrder.totalAmount === "number" ? (
                    <Paragraph1 className="font-semibold text-gray-900 text-sm">
                      ₦{selectedOrder.totalAmount.toLocaleString()}
                    </Paragraph1>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="mb-4">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Issue Category*
        </Paragraph1>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className="flex justify-between items-center bg-white p-3 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full text-base transition duration-150"
          >
            <span>{selectedCategory || "Select Issue"}</span>
            <HiOutlineChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                isCategoryDropdownOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>

          {/* Dropdown Content */}
          {isCategoryDropdownOpen && (
            <div className="z-10 absolute bg-white shadow-lg mt-2 border border-gray-200 rounded-lg w-full overflow-hidden origin-top transition-all duration-300 ease-in-out">
              {ISSUE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategoryChange(category)}
                  className="block hover:bg-gray-100 px-4 py-2 w-full text-gray-700 text-sm text-left"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Description*
        </Paragraph1>
        <textarea
          placeholder="Explain the issue clearly..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full min-h-[100px] text-sm transition duration-150"
          minLength={20}
        />
        <Paragraph1 className="mt-1 text-gray-500 text-xs">
          {description.trim().length}/20 characters minimum
        </Paragraph1>
      </div>

      <div className="mb-6">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Amount Disputed (Optional)
        </Paragraph1>
        <div className="relative">
          <input
            type="number"
            placeholder="0"
            value={amountDisputed || ""}
            onChange={(e) =>
              setAmountDisputed(
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            className="p-3 pl-8 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full transition duration-150"
          />
          <span className="top-1/2 left-3 absolute font-bold text-gray-500 -translate-y-1/2 transform">
            ₦
          </span>
        </div>
      </div>

      <div className="mb-6">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Preferred Resolution (Optional)
        </Paragraph1>
        <select
          value={preferredResolution}
          onChange={(e) => {
            const nextValue = e.target.value;
            setPreferredResolution(nextValue);
            if (nextValue !== "Other") setOtherPreferredResolution("");
          }}
          className="bg-white p-3 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full text-sm transition duration-150"
        >
          <option value="">Select an option</option>
          {PREFERRED_RESOLUTION_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {preferredResolution === "Other" ? (
          <input
            type="text"
            value={otherPreferredResolution}
            onChange={(e) => setOtherPreferredResolution(e.target.value)}
            placeholder="Type your preferred resolution..."
            className="mt-3 p-3 border border-gray-300 focus:border-black rounded-lg focus:ring-black w-full text-sm transition duration-150"
          />
        ) : null}
      </div>

      <div className="mb-6">
        <Paragraph1 className="mb-2 font-medium text-gray-900 text-sm">
          Upload Evidence (Optional)
        </Paragraph1>
        <Paragraph1 className="mb-3 text-gray-500 text-xs">
          Upload up to 3 images (damage photos, screenshots, etc.)
        </Paragraph1>

        <label className="block">
          <div className="flex flex-col justify-center items-center p-6 border-2 border-gray-300 hover:border-black border-dashed rounded-lg transition duration-150 cursor-pointer">
            <HiOutlineArrowUpTray className="mb-2 w-8 h-8 text-gray-400" />
            <Paragraph1 className="font-medium text-gray-700 text-sm">
              Click to upload
            </Paragraph1>
            <Paragraph1 className="mt-1 text-gray-500 text-xs">
              PNG, JPG up to 5MB
            </Paragraph1>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleEvidenceUpload}
            className="hidden"
          />
        </label>

        {previewUrls.length > 0 ? (
          <div className="gap-3 grid grid-cols-3 mt-3">
            {previewUrls.map((url, index) => (
              <div key={url} className="relative">
                <img
                  src={url}
                  alt="Evidence preview"
                  className="border border-gray-200 rounded-lg w-full h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeEvidence(index)}
                  className="top-1 right-1 absolute flex justify-center items-center bg-black/80 rounded-full w-6 h-6 text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={raiseDisputeMutation.isPending}
        className="bg-black hover:bg-gray-800 disabled:opacity-50 py-3 rounded-lg w-full font-semibold text-white text-lg transition duration-150"
      >
        {raiseDisputeMutation.isPending ? "Submitting..." : "Submit Dispute"}
      </button>

      {raiseDisputeMutation.isError && (
        <Paragraph1 className="mt-2 text-red-600 text-sm">
          Error:{" "}
          {(raiseDisputeMutation.error as any)?.message ||
            "Failed to raise dispute"}
        </Paragraph1>
      )}
    </div>
  );
};

export default RaiseDisputeForm;
