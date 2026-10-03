"use client";

import type React from "react";
import { Paragraph1 } from "@/common/ui/Text";

export type AdminSectionTab = {
  id: string;
  label: string;
  icon?: React.ElementType;
};

type AdminSectionTabsProps = {
  tabs: AdminSectionTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
  rowClassName?: string;
  thickActiveBorder?: boolean;
};

export function AdminSectionTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  rowClassName = "",
  thickActiveBorder = false,
}: AdminSectionTabsProps) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className={`flex w-max min-w-full ${rowClassName}`}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onChange(tab.id)}
                className={`shrink-0 whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 font-medium text-sm transition-colors flex items-center gap-2 ${
                  thickActiveBorder
                    ? isActive
                      ? "text-black border-b-4 border-black"
                      : "text-gray-600 hover:text-gray-900"
                    : isActive
                      ? "text-gray-900 border-b-2 border-black -mb-px"
                      : "text-gray-500 border-b-2 border-transparent hover:text-gray-700"
                }`}
              >
                {Icon ? <Icon size={18} className="shrink-0" /> : null}
                <Paragraph1 className="font-medium">{tab.label}</Paragraph1>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function AdminTabButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label?: string;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap px-4 sm:px-6 py-3 sm:py-4 font-medium transition-colors ${
        active
          ? "text-gray-900 border-b-2 border-gray-900 -mb-px"
          : "text-gray-600 hover:text-gray-900"
      }`}
    >
      <Paragraph1>{children ?? label}</Paragraph1>
    </button>
  );
}

export function AdminTabBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0">
        <div className="flex w-max min-w-full">{children}</div>
      </div>
    </div>
  );
}
