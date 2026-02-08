// ============================================================================
// API ENDPOINTS USED - SHOPPING & RENTAL FLOW:
// ============================================================================
// GET /api/public/products/:productId - Fetch product details page info
//   Returns: Product name, images, description, brand, category, lister info, reviews
//   Location: TitleProductCard, ProductMediaGallery, ProductAccordion components
//
// GET /api/public/products/:productId/availability - Fetch calendar dates
//   Returns: Available dates, unavailable dates for calendar selection
//   Location: RentalDurationSelector calendar component
//
// POST /api/renters/rental-requests - Submit availability check to lister
//   Auth Required: YES (show login modal if not authenticated)
//   Body: productId, listerId, rentalStartDate, rentalEndDate, rentalDays,
//         estimatedRentalPrice, deliveryAddressId, autoPay, currency
//   Returns: 15-minute countdown timer, cart item added
//   Location: RentalDurationSelector "Check Availability" button
//
// GET /api/renters/rental-requests - Fetch cart items with timers
//   Returns: Pending requests with countdown timers (15 minutes)
//   Location: RentalCartSummary component (cart display)
//
// GET /api/renters/rental-requests/:requestId - Monitor request status
//   For tracking lister approval/rejection while waiting
//
// DELETE /api/renters/rental-requests/:requestId - Remove from cart
//   Location: RentalCartSummary trash icon
//
// POST /api/renters/rental-requests/:requestId/confirm - Finalize order
//   Called when lister approves and deducts payment from wallet
// ============================================================================

import React from "react";
import TitleProductCard from "./components/TitleProductCard";
import RentalDetailsCard from "./components/RentalDetailsCard";
import ProductAccordion from "./components/ProductAccordion";
import ProductMediaGallery from "./components/ProductMediaGallery";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import TopListingSection from "./components/TopListingSection";

function page() {
  const path = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "Product detail", href: null }, // Current page, href is null
  ];

  return (
    <div>
      {" "}
      <div className=" grid xl:grid-cols-2 ">
        <div className="sm:py-[100px] pt-[70px]  sm:px-[100px] p-4 ">
          <div className=" mb-4">
            <Breadcrumbs items={path} />{" "}
          </div>
          <ProductMediaGallery />
        </div>
        <div className=" sm:py-[100px] bg-white sm:px-[100px] p-4 flex flex-col gap-4 ">
          <TitleProductCard />
          <RentalDetailsCard />
          <ProductAccordion />
        </div>
      </div>
      <TopListingSection />
    </div>
  );
}

export default page;
