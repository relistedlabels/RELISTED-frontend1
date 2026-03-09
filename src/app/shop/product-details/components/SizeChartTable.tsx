"use client";

import React from "react";
// Assuming you have components like these, although standard table elements are used for the grid.
import { Header1, Paragraph1 } from "@/common/ui/Text";

// --- Data for the Size Chart ---
type Unit = "EU" | "UK" | "US" | "International";
const SIZE_MAP: Record<Unit, string[]> = {
  EU: Array.from({ length: 39 }, (_, i) => {
    const size = 32 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  UK: Array.from({ length: 35 }, (_, i) => {
    const size = 1 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  US: Array.from({ length: 35 }, (_, i) => {
    const size = 2 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  International: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"],
};

const UNITS: Unit[] = ["EU", "UK", "US", "International"];

const unitExplanations: Record<Unit, string> = {
  EU: "European sizes, typically used in continental Europe.",
  UK: "UK sizes, common in Britain and Ireland.",
  US: "US sizes, used in North America.",
  International:
    "International letter sizes (XS-5XL), used for general apparel.",
};

// Standard apparel size conversion table (source: ASOS, Levi's, Zara)
// Generate all sizes from SIZE_MAP for each unit
// Widely accepted conversion table for apparel (source: ASOS, Levi's, Zara)
type SizeRow = { EU: string; UK: string; US: string; International: string };
const conversionTable: SizeRow[] = [
  { EU: "32", UK: "4", US: "0", International: "XXS" },
  { EU: "34", UK: "6", US: "2", International: "XS" },
  { EU: "36", UK: "8", US: "4", International: "S" },
  { EU: "38", UK: "10", US: "6", International: "M" },
  { EU: "40", UK: "12", US: "8", International: "L" },
  { EU: "42", UK: "14", US: "10", International: "XL" },
  { EU: "44", UK: "16", US: "12", International: "XXL" },
  { EU: "46", UK: "18", US: "14", International: "XXXL" },
  { EU: "48", UK: "20", US: "16", International: "4XL" },
  { EU: "50", UK: "22", US: "18", International: "5XL" },
];

// Build rows for all sizes in selector, matching only to conversion values, '-' if no match
const allSizes = {
  EU: Array.from({ length: 39 }, (_, i) => {
    const size = 32 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  UK: Array.from({ length: 35 }, (_, i) => {
    const size = 1 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  US: Array.from({ length: 35 }, (_, i) => {
    const size = 2 + Math.floor(i / 2);
    return i % 2 === 0 ? String(size) : String(size) + ".5";
  }),
  International: ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL"],
};

function findConversion(unit: keyof SizeRow, size: string): SizeRow | null {
  for (const row of conversionTable) {
    if (row[unit] === size) return row;
  }
  return null;
}

const maxRows = Math.max(
  allSizes.EU.length,
  allSizes.UK.length,
  allSizes.US.length,
  allSizes.International.length,
);

const comparisonRows: SizeRow[] = [];
for (let i = 0; i < maxRows; i++) {
  // Try to match each unit's size to conversion table
  const eu = allSizes.EU[i] || "-";
  const uk = allSizes.UK[i] || "-";
  const us = allSizes.US[i] || "-";
  const intl = allSizes.International[i] || "-";

  // For each unit, find conversion row
  let row: SizeRow = { EU: eu, UK: "-", US: "-", International: "-" };
  const euMatch = findConversion("EU", eu);
  if (euMatch) {
    row = {
      EU: eu,
      UK: euMatch.UK,
      US: euMatch.US,
      International: euMatch.International,
    };
  } else {
    // Try UK
    const ukMatch = findConversion("UK", uk);
    if (ukMatch) {
      row = {
        EU: ukMatch.EU,
        UK: uk,
        US: ukMatch.US,
        International: ukMatch.International,
      };
    } else {
      // Try US
      const usMatch = findConversion("US", us);
      if (usMatch) {
        row = {
          EU: usMatch.EU,
          UK: usMatch.UK,
          US: us,
          International: usMatch.International,
        };
      } else {
        // Try International
        const intlMatch = findConversion("International", intl);
        if (intlMatch) {
          row = {
            EU: intlMatch.EU,
            UK: intlMatch.UK,
            US: intlMatch.US,
            International: intl,
          };
        } else {
          row = { EU: eu, UK: uk, US: us, International: intl };
        }
      }
    }
  }
  comparisonRows.push(row);
}

export default function SizeChartTable() {
  return (
    <div className="bg-white">
      <div className="mb-4">
        {/* <Paragraph1 className="font-bold text-gray-900 text-base mb-1">
          Size Conversion Table
        </Paragraph1>
        <Paragraph1 className="text-xs text-gray-600 mb-2">
          Compare equivalent sizes across EU, UK, US, and International units.
          Use this table to find your matching size.
        </Paragraph1> */}
        <div className="rounded-lg overflow-hidden border border-gray-200 mb-4">
          <table className="w-full table-fixed text-center text-sm">
            <thead>
              <tr className="bg-gray-700 text-white uppercase text-xs">
                <th className="py-3 px-1">EU</th>
                <th className="py-3 px-1">UK</th>
                <th className="py-3 px-1">US</th>
                <th className="py-3 px-1">Int</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 2 === 0
                      ? "bg-gray-100/50 hover:bg-gray-100"
                      : "bg-white hover:bg-gray-50"
                  }
                >
                  <td className="py-3 font-semibold text-gray-800">{row.EU}</td>
                  <td className="py-3 font-semibold text-gray-800">{row.UK}</td>
                  <td className="py-3 font-semibold text-gray-800">{row.US}</td>
                  <td className="py-3 font-semibold text-gray-800">
                    {row.International}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
