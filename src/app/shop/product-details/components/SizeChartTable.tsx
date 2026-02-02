"use client";

import React from "react";
// Assuming you have components like these, although standard table elements are used for the grid.
import { Header1, Paragraph1 } from "@/common/ui/Text";

// --- Data for the Size Chart ---
const sizeChartData = [
  { size: "5", usCan: "5", uk: "5", eu: "35", aus: "5" },
  { size: "5.5", usCan: "5.5", uk: "5.5", eu: "36-37", aus: "5.5" },
  { size: "6", usCan: "6", uk: "6", eu: "37", aus: "6" },
  { size: "6.5", usCan: "6.5", uk: "6.5", eu: "37-38", aus: "6.5" },
  { size: "7.5", usCan: "7.5", uk: "5.5", eu: "38", aus: "7.5" },
  { size: "7.5", usCan: "7.5", uk: "5.5", eu: "38", aus: "7.5" }, // Duplicated row in image
  { size: "8", usCan: "8", uk: "6", eu: "38-39", aus: "8" },
  { size: "8.5", usCan: "8.5", uk: "6.5", eu: "39", aus: "8.5" },
  { size: "9", usCan: "9", uk: "7", eu: "39-40", aus: "9" },
  { size: "10", usCan: "10", uk: "7.5", eu: "40-41", aus: "10" },
  { size: "11", usCan: "11", uk: "8", eu: "41-42", aus: "11" },
];

export default function SizeChartTable() {
  return (
    <div className=" bg-white ">


      <div className="rounded-lg overflow-hidden  border border-gray-200">
        <table className="w-full table-fixed text-center text-sm">
          {/* Table Header */}
          <thead>
            <tr className="bg-gray-700 text-white uppercase text-xs">
              <th className="py-3 px-1 w-1/5">SIZE</th>
              <th className="py-3 px-1 w-1/5">US/CAN</th>
              <th className="py-3 px-1 w-1/5">UK</th>
              <th className="py-3 px-1 w-1/5">EU</th>
              <th className="py-3 px-1 w-1/5">AUS</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {sizeChartData.map((row, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-gray-100/50 hover:bg-gray-100" // Light row
                    : "bg-white hover:bg-gray-50" // White row
                }
              >
                <td className="py-3 bg-gray-300 font-semibold text-gray-800 border-r border-gray-200">
                  {row.size}
                </td>
                <td className="py-3 border-r border-gray-200">{row.usCan}</td>
                <td className="py-3 border-r border-gray-200">{row.uk}</td>
                <td className="py-3 border-r border-gray-200">{row.eu}</td>
                <td className="py-3">{row.aus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
