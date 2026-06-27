"use client";

import type React from "react";
import { useState } from "react";
import ListingFilterPanel, { ListingFilterButton } from "./ListingFilterPanel";

const Filters: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ListingFilterButton onClick={() => setIsOpen(true)} />
      <ListingFilterPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default Filters;
