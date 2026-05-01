"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Paragraph1 } from "@/common/ui/Text";

const NIGERIAN_CELEBRITIES = [
  {
    id: 1,
    name: "Tiwa Savage",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
  {
    id: 2,
    name: "Adesua Etomi",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    id: 3,
    name: "Toke Makinwa",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  },
  {
    id: 4,
    name: "Iyabo Ojo",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  },
  {
    id: 5,
    name: "Ini Edo",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop",
  },
];

interface CelebritySelectorProps {
  onSelect?: (celebrity: (typeof NIGERIAN_CELEBRITIES)[0]) => void;
  placeholder?: string;
}

export default function CelebritySelector({
  onSelect,
  placeholder = "Select Celebrity",
}: CelebritySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<(typeof NIGERIAN_CELEBRITIES)[0] | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (celebrity: (typeof NIGERIAN_CELEBRITIES)[0]) => {
    setSelected(celebrity);
    setIsOpen(false);
    onSelect?.(celebrity);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative  [200px]">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between gap-2 px-4 py-2 border  bg-white w-full text-sm hover:bg-gray-50"
      >
        <span className="truncate flex items-center gap-2">
          {selected ? (
            <>
              <img
                src={selected.image}
                alt={selected.name}
                className="w-6 h-6 rounded-full object-cover"
              />

              <Paragraph1>{selected.name}</Paragraph1>
            </>
          ) : (
            <Paragraph1 className="text-gray-500">{placeholder}</Paragraph1>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full border border-gray-200 left-0 right-0 mt-2 bg-white  shadow-lg z-50">
          <div className="max-h-64 overflow-y-auto">
            {NIGERIAN_CELEBRITIES.map((celebrity) => (
              <button
                key={celebrity.id}
                onClick={() => handleSelect(celebrity)}
                className="w-full px-2 py-2 flex items-center gap-3 hover:bg-gray-100 transition-colors text-left border-b border-gray-200 last:border-b-0"
              >
                <img
                  src={celebrity.image}
                  alt={celebrity.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                
                <Paragraph1>{celebrity.name}</Paragraph1>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
