import React, { useState } from "react";
import { HiOutlineChevronDown } from "react-icons/hi2";
import { Paragraph1 } from "@/common/ui/Text";

interface AccordionItemProps {
  /** The text displayed in the header (e.g., "PRODUCT DETAILS") */
  title: string;
  /** The content to be displayed when the accordion is open */
  children: React.ReactNode;
  /** Optional: To show a count in the title (e.g., "(12 REVIEWS)") */
  count?: number;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  children,
  count,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  const formattedTitle = count ? `${title} (${count})` : title;

  return (
    <div className="border-b border-gray-200">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between py-4 text-left focus:outline-none"
        onClick={toggleAccordion}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${title.replace(/\s/g, "")}`}
      >
        <Paragraph1 className="text-sm font-semibold text-gray-900 tracking-wider">
          {formattedTitle.toUpperCase()}
        </Paragraph1>
        <HiOutlineChevronDown
          className={`w-5 h-5 text-gray-900 transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Content */}
      <div
        id={`accordion-content-${title.replace(/\s/g, "")}`}
        role="region"
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? "max-h-96 opacity-100 py-2" : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="pb-4 text-sm text-gray-700">{children}</div>
      </div>
    </div>
  );
};

export default AccordionItem;
