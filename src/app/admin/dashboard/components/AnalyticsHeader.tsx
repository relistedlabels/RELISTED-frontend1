import React from "react";
import { Paragraph1, Paragraph2 } from "@/common/ui/Text";
import {
  HiOutlineChevronDown,
  HiOutlineMapPin,
  HiOutlineClock,
  HiOutlineScale,
  HiOutlineAcademicCap,
} from "react-icons/hi2";
import { HiOutlineDownload } from "react-icons/hi";


interface StatItemProps {
  icon: React.ElementType;
  label: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label }) => (
  <div className="flex items-center gap-2 px-4 first:pl-0 border-r border-gray-200 last:border-0">
    <Icon className="w-4 h-4 text-yellow-600" />
    <Paragraph1 className="text-xs font-semibold text-gray-700">
      {label}
    </Paragraph1>
  </div>
);

const AnalyticsHeader: React.FC = () => {
  return (
    <div className="w-full ">
      {/* Top Row: Title and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Paragraph2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Analytics Overview
        </Paragraph2>

        <div className="flex items-center gap-3">
          {/* Dropdown Select */}
          <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white min-w-[161px] cursor-pointer">
            <Paragraph1 className="text-sm font-medium text-gray-700">
              Last 6 Months
            </Paragraph1>
            <HiOutlineChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-5 py-2 bg-yellow-600 hover:bg-yellow-700 transition-colors rounded-lg text-white shadow-sm">
            <HiOutlineDownload className="w-4 h-4" />
            <Paragraph1 className="text-sm font-bold">Export Report</Paragraph1>
          </button>
        </div>
      </div>

      {/* Bottom Row: Inline Stats */}
      <div className="flex items-center py-4 border-y border-gray-300">
        <StatItem icon={HiOutlineAcademicCap} label="Chanel" />
        <StatItem icon={HiOutlineMapPin} label="Lagos" />
        <StatItem icon={HiOutlineScale} label="2.3%" />
        <StatItem icon={HiOutlineClock} label="1.1 days" />
      </div>
    </div>
  );
};

export default AnalyticsHeader;
