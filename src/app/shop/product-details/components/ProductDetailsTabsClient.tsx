"use client";

import React, { useState } from "react";
import RentalDetailsCard from "./RentalDetailsCard";
import ResaleDetailsCard from "./ResaleDetailsCard";

interface ProductDetailsTabsClientProps {
  productId: string;
}

const ProductDetailsTabsClient: React.FC<ProductDetailsTabsClientProps> = ({
  productId,
}) => {
  const [activeTab, setActiveTab] = useState<"rent" | "resale">("rent");

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-2 p-1 text-[14px] bg-white border border-gray-300 rounded-xl">
        <button
          onClick={() => setActiveTab("rent")}
          className={`flex-1 py-3 px-4 font-semibold rounded-lg transition duration-150 ${
            activeTab === "rent"
              ? "bg-black text-white"
              : "bg-transparent text-black hover:bg-gray-50"
          }`}
        >
          Rent
        </button>
        <button
          onClick={() => setActiveTab("resale")}
          className={`flex-1 py-3 px-4 font-semibold rounded-lg transition duration-150 ${
            activeTab === "resale"
              ? "bg-black text-white"
              : "bg-transparent text-black hover:bg-gray-50"
          }`}
        >
          Buy
        </button>
      </div>

      {/* Switching Message */}
      <div className="text-center text-gray-500 text-[12px] mb-6">
        {activeTab === "rent" ? (
          <p>Prefer to own it? Switch to Resale.</p>
        ) : (
          <p>Prefer to rent? Switch to Rent.</p>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === "rent" ? (
        <RentalDetailsCard productId={productId} />
      ) : (
        <ResaleDetailsCard productId={productId} />
      )}
    </div>
  );
};

export default ProductDetailsTabsClient;
