"use client";

import React, { useState } from "react";
import { Paragraph1 } from "@/common/ui/Text";
import { ToolInfo } from "@/common/ui/ToolInfo";
import { useProductDraftStore } from "@/store/useProductDraftStore";
import { useMe } from "@/lib/queries/auth/useMe";
import { isInhouseManager } from "@/lib/inhouseManager";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export const ItemDescription: React.FC = () => {
  const { data, setField } = useProductDraftStore();
  const { data: user } = useMe();
  const isInhouse = user ? isInhouseManager(user.id) : false;
  const [showClosetDropdown, setShowClosetDropdown] = useState(false);
  const [selectedCloset, setSelectedCloset] = useState(data.closet || "");

  const closetOptions = [
    { id: "managed", name: "Managed by Relisted (Default)" },
    { id: "amanda", name: "Amanda Daniels" },
    { id: "influencer", name: "Influencer X" },
  ];

  const handleSelectCloset = (closet: (typeof closetOptions)[0]) => {
    setSelectedCloset(closet.name);
    setField("closet", closet.name);
    setShowClosetDropdown(false);
  };

  return (
    <div className="w-full rounded-xl border border-gray-200 p-4 space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Description
          </Paragraph1>
          <ToolInfo content="Tell the story of your item. What makes it special? Is it a rare piece, vintage find, limited edition, or mini style? Share what makes renters want to wear it." />
        </div>
        <textarea
          value={data.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="E.g., Rare vintage Hermès mini bag, limited edition designer collaboration, summer must-have mini skirt, timeless investment piece from the 90s..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Care Instructions
          </Paragraph1>
          <ToolInfo content="Provide general care instructions to help renters maintain the item properly." />
        </div>
        <textarea
          value={data.careInstruction}
          onChange={(e) => setField("careInstruction", e.target.value)}
          placeholder="E.g., Do not dry clean or hand wash with cold water, avoid direct sunlight, iron on low heat, store in cool dry place..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>

      {/* <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Care Steps
          </Paragraph1>
          <ToolInfo content="List step-by-step instructions for caring for or cleaning this item." />
        </div>
        <textarea
          value={typeof data.careSteps === "string" ? data.careSteps : ""}
          onChange={handleCareStepsChange}
          placeholder="Step-by-step care instructions..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div> */}

      <div>
        <div className="flex items-center gap-2 mb-2">
          <Paragraph1 className="text-xs font-medium text-gray-700">
            Styling Tips
          </Paragraph1>
          <ToolInfo content="Share ideas on how to style or use this item to inspire potential renters." />
        </div>
        <textarea
          value={data.stylingTip}
          onChange={(e) => setField("stylingTip", e.target.value)}
          placeholder="E.g., Perfect for formal events, pairs well with gold earrings and bracelets, great for a sophisticated date night look..."
          className="w-full h-24 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-black resize-none"
        />
      </div>

      {/* Closet Selection - Only for inhouse managers */}
      {isInhouse && (
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Paragraph1 className="text-xs font-medium text-gray-700">
              Closet
            </Paragraph1>
            <ToolInfo content="Select which closet this item belongs to." />
          </div>
          <button
            onClick={() => setShowClosetDropdown(!showClosetDropdown)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm font-medium text-left bg-white focus:outline-none focus:ring-2 focus:ring-black flex items-center justify-between hover:border-gray-300 transition"
          >
            <span className="text-gray-700">
              {selectedCloset || "Select a closet"}
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                showClosetDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Animated Dropdown */}
          <AnimatePresence>
            {showClosetDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
              >
                {closetOptions.map((closet, index) => (
                  <motion.button
                    key={closet.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSelectCloset(closet)}
                    className={`w-full px-4 py-3 text-left text-sm font-medium transition duration-150 ${
                      selectedCloset === closet.name
                        ? "bg-gray-900 text-white"
                        : "text-gray-900 hover:bg-gray-50"
                    } ${
                      index !== closetOptions.length - 1
                        ? "border-b border-gray-200"
                        : ""
                    }`}
                  >
                    {closet.name}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
// 3DD6DFAF
