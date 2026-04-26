"use client";

import { useState, useEffect } from "react";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import InventoryList from "../components/InventoryList";
import ClosetSelectionStep from "../components/ClosetSelectionStep";
import { useMe } from "@/lib/queries/auth/useMe";
import { isInhouseManager } from "@/lib/inhouseManager";
import { useUserProducts } from "@/lib/queries/product/useUserProducts";

export default function Page() {
  const { data: user } = useMe();
  const { data: products } = useUserProducts();
  const [selectedClosetId, setSelectedClosetId] = useState<string | null>(null);
  const [showClosetSelection, setShowClosetSelection] = useState(false);

  // Check if user is inhouse manager and set up closet selection
  useEffect(() => {
    if (user?.id) {
      setShowClosetSelection(isInhouseManager(user.id));
      // If not inhouse manager, skip step 1 and show inventory directly
      if (!isInhouseManager(user.id)) {
        setSelectedClosetId("inventory");
      }
    }
  }, [user]);

  // Inhouse manager closet options
  const inhouseClosets = [
    {
      id: "all",
      name: "All Inventories",
      itemCount: products?.length || 0,
    },
    {
      id: "managed",
      name: "Managed by Relisted (Default)",
      itemCount: products?.length || 0,
    },
    {
      id: "curator-1",
      name: "Amanda Daniels",
      itemCount: 24,
      avatar: "https://randomuser.me/api/portraits/women/69.jpg",
    },
    {
      id: "curator-2",
      name: "Influencer X",
      itemCount: 18,
      avatar: "https://randomuser.me/api/portraits/men/69.jpg",
    },
  ];

  const handleSelectCloset = (closetId: string) => {
    setSelectedClosetId(closetId);
  };

  // Find the selected closet object for passing to InventoryList
  const selectedCloset = inhouseClosets.find((c) => c.id === selectedClosetId);

  const path = [
    { label: "Dashboard", href: "#" },
    { label: "Inventory", href: "/listers/inventory" },
    ...(selectedCloset ? [{ label: selectedCloset.name, href: null }] : []),
  ];

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>

      {/* Show closet selection for inhouse managers */}
      {showClosetSelection && !selectedClosetId && (
        <ClosetSelectionStep
          closets={inhouseClosets}
          onSelectCloset={handleSelectCloset}
        />
      )}

      {/* Show inventory list after closet is selected or for regular listers */}
      {selectedClosetId && (
        <InventoryList
          selectedClosetId={selectedClosetId}
          selectedCloset={selectedCloset}
        />
      )}
    </DashboardLayout>
  );
}
