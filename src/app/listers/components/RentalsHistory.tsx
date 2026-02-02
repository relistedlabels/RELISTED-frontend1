"use client";

import React from "react";
import { motion } from "framer-motion";
import { Paragraph1, Paragraph3 } from "@/common/ui/Text";

interface HistoryRecord {
  id: string;
  orderDate: string;
  dresserName: string;
  duration: string;
  earning: string;
  status: "Completed" | "Pending" | "Cancelled";
}

const historyData: HistoryRecord[] = [
  {
    id: "1",
    orderDate: "Oct 19, 2025",
    dresserName: "Amara B.",
    duration: "12 Days",
    earning: "₦550,000",
    status: "Completed",
  },
  {
    id: "2",
    orderDate: "Oct 19, 2025",
    dresserName: "Amara B.",
    duration: "12 Days",
    earning: "₦550,000",
    status: "Completed",
  },
];

const RentalsHistory: React.FC = () => {
  return (
    <div className="w-full mt-8">
      <Paragraph3 className="text-lg font-bold text-black mb-4">
        Rentals History
      </Paragraph3>

      <div className="space-y-3">
        {historyData.map((record, index) => (
          <motion.div
            key={record.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            className="bg-white border border-gray-300 rounded-2xl p-4"
          >
            {/* Content */}
            <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-4">
              {/* Order Date */}
              <div className="flex-1">
                <Paragraph1 className="text-gray-400 font-medium uppercase mb-1">
                  Order Date
                </Paragraph1>
                <Paragraph1 className="font-bold text-black">
                  {record.orderDate}
                </Paragraph1>
              </div>

              {/* Dresser Name */}
              <div className="flex-1">
                <Paragraph1 className="text-gray-400 font-medium uppercase mb-1">
                  Dresser Name
                </Paragraph1>
                <Paragraph1 className="font-bold text-black">
                  {record.dresserName}
                </Paragraph1>
              </div>

              {/* Duration */}
              <div className="flex-1">
                <Paragraph1 className="text-gray-400 font-medium uppercase mb-1">
                  Duration
                </Paragraph1>
                <Paragraph1 className="font-bold text-black">
                  {record.duration}
                </Paragraph1>
              </div>

              {/* Earning */}
              <div className="flex-1">
                <Paragraph1 className="text-gray-400 font-medium uppercase mb-1">
                  Earning
                </Paragraph1>
                <Paragraph1 className="font-bold text-black">
                  {record.earning}
                </Paragraph1>
              </div>

              {/* Status */}
              <div className="sm:flex-none sm:px-8 col-span-2 sm:col-span-1">
                <Paragraph1 className="inline-block px-4 py-1.5 bg-[#E8F8F0] text-[#1DB954] font-bold rounded-lg">
                  {record.status}
                </Paragraph1>
              </div>

              {/* Action */}
              <div className="sm:flex-none col-span-2 sm:col-span-1">
                <button className="text-sm font-bold text-black underline hover:text-gray-600 transition-colors">
                  <Paragraph1>View Order</Paragraph1>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RentalsHistory;
