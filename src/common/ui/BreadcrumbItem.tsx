import React from "react";
import { HiOutlineChevronRight } from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";

interface BreadcrumbItem {
  label: string;
  href: string | null;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="font-sans pt-2 sm:pt-0">
      <ol className="flex items-center space-x-1 sm:space-x-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {item.href ? (
                <a
                  href={item.href}
                  className="hover:text-gray-700 transition duration-150"
                >
                  <Paragraph1 className="text-sm text-gray-500 font-normal">
                    {item.label}
                  </Paragraph1>
                </a>
              ) : (
                <Paragraph1 className="text-sm text-gray-900 font-semibold">
                  {item.label}
                </Paragraph1>
              )}

              {!isLast && (
                <HiOutlineChevronRight className="w-4 h-4 text-gray-400 ml-1 sm:ml-2" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
