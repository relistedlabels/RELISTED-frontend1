"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Paragraph1 } from "@/common/ui/Text";
import BackHeader from "@/common/ui/BackHeader";

interface ManageItemHeaderProps {
  title?: string;
  subtitle?: string;
}

const ManageItemHeader: React.FC<ManageItemHeaderProps> = ({
  title = "Manage Item",
  subtitle = "Manage your fashion item",
}) => {
  const router = useRouter();
  const params = useParams();

  // ✅ Get product ID from URL params
  const productId = params?.id as string;

  const handleEdit = () => {
    if (productId) {
      router.push(`/listers/inventory/product-edit/${productId}`);
    }
  };

  const handleDisable = () => {
    // TODO: Implement disable logic with useUpdateProduct mutation
    console.log("Disable product:", productId);
  };

  return (
    <div className="w-full flex sm:items-center flex-col sm:flex-row gap-4 sm:justify-between mb-4 bg-transparent">
      <BackHeader title={title} subtitle={subtitle} />

      <div className="flex items-center space-x-3">
        <button
          onClick={handleDisable}
          className="px-6 py-2.5 w-full sm:w-fit border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95"
        >
          <Paragraph1>Disable Item</Paragraph1>
        </button>

        <button
          onClick={handleEdit}
          className="px-6 py-2.5 w-full sm:w-fit bg-[#33332D] text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-95"
        >
          <Paragraph1>Edit Item</Paragraph1>
        </button>
      </div>
    </div>
  );
};

export default ManageItemHeader;
