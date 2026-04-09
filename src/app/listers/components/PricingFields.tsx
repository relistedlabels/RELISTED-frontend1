// components/PricingFields.tsx
"use client";

import React, { useMemo, useEffect } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";

const formatNumber = (value: number) =>
  value ? value.toLocaleString("en-US") : "";

const parseNumber = (value: string) => Number(value.replace(/,/g, "") || 0);

export const PricingFields: React.FC = () => {
  const { data, setField } = useProductDraftStore();

  const suggestedDailyRentalPrice = useMemo(
    () => Math.round((data.originalValue || 0) * 0.1),
    [data.originalValue],
  );

  const suggestedCollateralPrice = useMemo(
    () => Math.round((data.originalValue || 0) * 0.8),
    [data.originalValue],
  );

  useEffect(() => {
    if (data.saleType !== "resale") {
      setField("dailyRentalPrice", suggestedDailyRentalPrice);
    }
  }, [suggestedDailyRentalPrice, setField, data.saleType]);

  useEffect(() => {
    if (data.saleType !== "resale") {
      setField("collateralPrice", suggestedCollateralPrice);
    }
  }, [suggestedCollateralPrice, setField, data.saleType]);

  const isResaleOnly = data.saleType === "resale";
  const isRentOnly = data.saleType === "rent";
  const isRentAndResale = data.saleType === "rent-resale";

  return (
    <div className="space-y-4">
      {/* RESALE ONLY: Show only Resale Value */}
      {isResaleOnly && (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Paragraph1 className="text-xs font-medium text-gray-700">
              Resale Value (₦)
            </Paragraph1>
            <ToolInfo content="Enter the price you want to sell this item for." />
          </div>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g., 500,000 or 1,200,000"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
            value={formatNumber(data.resalePrice)}
            onChange={(e) =>
              setField("resalePrice", parseNumber(e.target.value))
            }
          />
        </div>
      )}

      {/* RENT ONLY: Show Original Value, Daily Rental Price, Collateral Price */}
      {isRentOnly && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Original Item Value (₦)
                </Paragraph1>
                <ToolInfo content="Enter the original purchase price or current market value of the item." />
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g., 500,000 or 1,200,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.originalValue)}
                onChange={(e) =>
                  setField("originalValue", parseNumber(e.target.value))
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Daily Rental Price (₦)
                </Paragraph1>
                <ToolInfo content="Set your daily rental rate. Suggested is 10% of the item value, but you can adjust based on demand." />
              </div>
              <input
                type="text"
                placeholder="e.g., 50,000 or 100,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.dailyRentalPrice)}
                onChange={(e) =>
                  setField("dailyRentalPrice", parseNumber(e.target.value))
                }
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Suggested ≈ ₦{formatNumber(suggestedDailyRentalPrice)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <Paragraph1 className="text-xs font-medium text-gray-700">
                Collateral Price (₦)
              </Paragraph1>
              <ToolInfo content="The amount that will be locked in the system as collateral when a renter books this item. This protects you against damage or loss." />
            </div>
            <input
              type="text"
              inputMode="numeric"
              placeholder="e.g., 400,000 or 960,000"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
              value={formatNumber(data.collateralPrice)}
              onChange={(e) =>
                setField("collateralPrice", parseNumber(e.target.value))
              }
            />
            <p className="mt-1 text-[11px] text-gray-500">
              Suggested ≈ ₦{formatNumber(suggestedCollateralPrice)} (80% of
              original value)
            </p>
          </div>
        </>
      )}

      {/* RENT AND RESALE: Show all fields */}
      {isRentAndResale && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Original Item Value (₦)
                </Paragraph1>
                <ToolInfo content="Enter the original purchase price or current market value of the item." />
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g., 500,000 or 1,200,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.originalValue)}
                onChange={(e) =>
                  setField("originalValue", parseNumber(e.target.value))
                }
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Resale Value (₦)
                </Paragraph1>
                <ToolInfo content="Enter the price you want to sell this item for." />
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g., 500,000 or 1,200,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.resalePrice)}
                onChange={(e) =>
                  setField("resalePrice", parseNumber(e.target.value))
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Daily Rental Price (₦)
                </Paragraph1>
                <ToolInfo content="Set your daily rental rate. Suggested is 10% of the item value, but you can adjust based on demand." />
              </div>
              <input
                type="text"
                placeholder="e.g., 50,000 or 100,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.dailyRentalPrice)}
                onChange={(e) =>
                  setField("dailyRentalPrice", parseNumber(e.target.value))
                }
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Suggested ≈ ₦{formatNumber(suggestedDailyRentalPrice)}
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <Paragraph1 className="text-xs font-medium text-gray-700">
                  Collateral Price (₦)
                </Paragraph1>
                <ToolInfo content="The amount that will be locked in the system as collateral when a renter books this item. This protects you against damage or loss." />
              </div>
              <input
                type="text"
                inputMode="numeric"
                placeholder="e.g., 400,000 or 960,000"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black"
                value={formatNumber(data.collateralPrice)}
                onChange={(e) =>
                  setField("collateralPrice", parseNumber(e.target.value))
                }
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Suggested ≈ ₦{formatNumber(suggestedCollateralPrice)} (80% of
                original value)
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
