import React from "react";
import HowItWorks from "./sections/HowItWorks";
import DressersSection from "./sections/DressersSection";
import HowItWorksVideo from "./sections/HowItWorksVideo";
import CuratorsSection from "./sections/CuratorsSection";
import DeliverySection from "./sections/DeliverySection";
import FAQSection from "./sections/FAQSection";

export default function page() {
  return (
    <div>
      <HowItWorks />
      <DressersSection />
      {/* <HowItWorksVideo /> */}
      <CuratorsSection />
      <DeliverySection />
      <FAQSection />
    </div>
  );
}
