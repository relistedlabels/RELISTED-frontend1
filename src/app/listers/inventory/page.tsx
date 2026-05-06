"use client";

import { useMemo, useState } from "react";
import Breadcrumbs from "@/common/ui/BreadcrumbItem";
import DashboardLayout from "../components/DashboardLayout";
import InventoryList from "../components/InventoryList";
import ClosetSelectionStep from "../components/ClosetSelectionStep";
import { isClosetInventoryLister } from "@/lib/closetInventoryAccess";
import { useMe } from "@/lib/queries/auth/useMe";
import { useMyClosets } from "@/lib/queries/closet/useMyClosets";
import { useUserProducts } from "@/lib/queries/product/useUserProducts";

export type InventoryClosetCard = {
  id: string;
  name: string;
  itemCount: number;
  avatar?: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export default function Page() {
  const { data: user } = useMe();
  const closetInventoryEnabled = isClosetInventoryLister(user?.id);

  const { data: apiClosets = [], isLoading: closetsLoading } = useMyClosets({
    enabled: !!user?.id && closetInventoryEnabled,
  });
  const [pickedClosetId, setPickedClosetId] = useState<string | null>(null);

  const hasClosets = apiClosets.length > 0;

  /** Fetch product counts for "All inventories" / "No closet" while the picker is open (including zero real closets). */
  const selectionActive =
    !!user?.id &&
    closetInventoryEnabled &&
    pickedClosetId === null &&
    !closetsLoading;

  const { data: allProducts } = useUserProducts(undefined, {
    enabled: selectionActive,
  });

  const closetCards: InventoryClosetCard[] = useMemo(() => {
    const rows: InventoryClosetCard[] = [
      {
        id: "all",
        name: "All inventories",
        itemCount: allProducts?.length ?? 0,
      },
      {
        id: "uncategorized",
        name: "No closet",
        itemCount: allProducts?.filter((p) => !p.closetId).length ?? 0,
      },
    ];
    for (const c of apiClosets) {
      rows.push({
        id: c.id,
        name: c.name,
        itemCount: c.productCount ?? 0,
        avatar: c.imageUrl ?? undefined,
        slug: c.slug,
        description: c.description ?? undefined,
        isActive: c.isActive,
      });
    }
    return rows;
  }, [apiClosets, allProducts]);

  const selectedCloset = pickedClosetId
    ? closetCards.find((c) => c.id === pickedClosetId)
    : undefined;

  const path = [
    { label: "Dashboard", href: "#" },
    { label: "Inventory", href: "/listers/inventory" },
    ...(selectedCloset && selectedCloset.id !== "all"
      ? [{ label: selectedCloset.name, href: null }]
      : []),
  ];

  const showLoadingGate =
    !!user?.id && closetInventoryEnabled && closetsLoading;

  const showInventoryList =
    !!user?.id &&
    !showLoadingGate &&
    (!closetInventoryEnabled || pickedClosetId !== null);

  const inventoryListClosetId =
    closetInventoryEnabled && pickedClosetId !== null
      ? pickedClosetId
      : "all";

  return (
    <DashboardLayout>
      <div className="mb-4">
        <Breadcrumbs items={path} />
      </div>

      {showLoadingGate && (
        <div className="flex justify-center items-center p-12">
          <p className="text-gray-500 text-sm">Loading inventory…</p>
        </div>
      )}

      {!showLoadingGate &&
        closetInventoryEnabled &&
        !!user?.id &&
        pickedClosetId === null &&
        !closetsLoading && (
          <ClosetSelectionStep
            closets={closetCards}
            hasRealClosets={hasClosets}
            onSelectCloset={(id) => setPickedClosetId(id)}
            isLoading={selectionActive && !allProducts}
          />
        )}

      {showInventoryList && (
        <InventoryList
          selectedClosetId={inventoryListClosetId}
          selectedCloset={
            closetInventoryEnabled ? selectedCloset : undefined
          }
          onOpenClosetPicker={
            closetInventoryEnabled
              ? () => setPickedClosetId(null)
              : undefined
          }
        />
      )}
    </DashboardLayout>
  );
}
