"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { ActionPromptModal } from "./ActionPromptModal";
import { useUserStoreHydrated } from "@/hooks/useUserStoreHydrated";
import { useMe } from "@/lib/queries/auth/useMe";
import { useUserStore } from "@/store/useUserStore";
import { useOrders as useRenterOrders } from "@/lib/queries/renters/useOrders";
import { useOrders as useListerOrders } from "@/lib/queries/listers/useOrders";
import { isListerAvailabilityRequestRow } from "@/lib/listers/listerOrderRow";
import {
  dismissActionPromptItem,
  dismissActionPromptSession,
  isActionPromptItemDismissed,
  isActionPromptSessionDismissed,
  isActionPromptSuppressedPath,
} from "@/lib/actionPrompts/actionPromptStorage";
import { approveOrder } from "@/lib/api/listers";
import { useQueryClient } from "@tanstack/react-query";
import { isOnboardingTroublePath } from "@/lib/onboarding/onboardingPrompt";
import {
  renterReturnPromptCopy,
  resolveReturnPickupWindowSummary,
} from "@/lib/actionPrompts/renterReturnPromptCopy";
import { useReturnPickupWindowOptions } from "@/lib/queries/renters/useReturnPickupWindowOptions";
import { useInitiateReturn } from "@/lib/queries/renters/useInitiateReturn";
import ReadyToReturnModal from "@/app/renters/components/ReadyToReturnModal";

const PROMPT_DELAY_MS = 1_500;

type RenterPrompt = {
  kind: "renter-return";
  orderId: string;
  shipmentId: string | null;
  productLabel: string;
  imageUrl: string | null;
  pickupWindowSummary?: string | null;
};

type ListerPrompt = {
  kind: "lister-availability";
  orderId: string;
  orderNumber: string;
  productLabel: string;
  renterLabel: string;
  imageUrl: string | null;
};

type ActivePrompt = RenterPrompt | ListerPrompt;

function devForcedPrompt(): ActivePrompt | null {
  const mode = process.env.NEXT_PUBLIC_FORCE_ACTION_PROMPT?.trim();
  if (mode === "renter") {
    return {
      kind: "renter-return",
      orderId: "PREVIEW-ORDER",
      shipmentId: null,
      productLabel: "Silk dress",
      imageUrl: null,
      pickupWindowSummary: "Wed 24 Sep, 2:00 pm – 4:00 pm",
    };
  }
  if (mode === "lister") {
    return {
      kind: "lister-availability",
      orderId: "preview-request",
      orderNumber: "REQ-PREVIEW",
      productLabel: "Silk dress",
      renterLabel: "Ada",
      imageUrl: null,
    };
  }
  return null;
}

function firstRenterReturnPrompt(
  orders: Array<{
    orderId: string;
    status: string;
    showStartReturn?: boolean;
    startReturnShipmentId?: string | null;
    items: Array<{ name?: string; imageUrl?: string | null }>;
  }>,
): RenterPrompt | null {
  for (const order of orders) {
    if (!order.showStartReturn) continue;
    const firstItem = order.items[0];
    return {
      kind: "renter-return",
      orderId: order.orderId,
      shipmentId: order.startReturnShipmentId ?? null,
      productLabel: firstItem?.name?.trim() || "your rental",
      imageUrl: firstItem?.imageUrl ?? null,
    };
  }
  return null;
}

function firstListerAvailabilityPrompt(
  orders: Record<string, unknown>[],
): ListerPrompt | null {
  for (const row of orders) {
    if (!isListerAvailabilityRequestRow(row)) continue;
    if (row.canApprove !== true && row.approvalRequired !== true) continue;
    if (String(row.availabilityStatus ?? "").toUpperCase() === "EXPIRED") {
      continue;
    }
    const id = String(row.id ?? "");
    if (!id) continue;
    if (isActionPromptItemDismissed("lister-availability", id)) continue;

    const items = Array.isArray(row.items)
      ? (row.items as Array<{ name?: string; image?: string; imageUrl?: string }>)
      : [];
    const firstItem = items[0];
    const dresser = row.dresser as { name?: string } | undefined;

    return {
      kind: "lister-availability",
      orderId: id,
      orderNumber: String(row.orderNumber ?? ""),
      productLabel: firstItem?.name?.trim() || "a request",
      renterLabel: dresser?.name?.trim() || "A renter",
      imageUrl: firstItem?.image ?? firstItem?.imageUrl ?? null,
    };
  }
  return null;
}

export function ActionPromptGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const hydrated = useUserStoreHydrated();
  const token = useUserStore((s) => s.token);
  const storeRole = useUserStore((s) => s.role);
  const { data: user, isLoading: meLoading } = useMe();

  const role = user?.role ?? storeRole;
  const isRenter = role === "RENTER" || role === "renter";
  const isLister = role === "LISTER" || role === "lister";

  const renterOrdersQuery = useRenterOrders("active", 1, 20, "newest", {
    enabled: isRenter,
  });
  const listerOrdersQuery = useListerOrders("pending", 1, 10, "-createdAt", {
    enabled: isLister,
  });

  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState<ActivePrompt | null>(null);
  const [primaryLoading, setPrimaryLoading] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnModalTarget, setReturnModalTarget] = useState<{
    orderId: string;
    shipmentId: string | null;
  } | null>(null);
  const shownRef = useRef(false);
  const initiateReturnMutation = useInitiateReturn();

  const forcedPrompt = useMemo(() => devForcedPrompt(), []);

  const candidate = useMemo((): ActivePrompt | null => {
    if (forcedPrompt) return forcedPrompt;

    if (isRenter && renterOrdersQuery.data?.orders) {
      const renterPrompt = firstRenterReturnPrompt(renterOrdersQuery.data.orders);
      if (renterPrompt) return renterPrompt;
    }
    if (isLister && listerOrdersQuery.data?.data) {
      const payload = listerOrdersQuery.data.data;
      const rows = Array.isArray(payload)
        ? payload
        : ((payload.orders ?? []) as Record<string, unknown>[]);
      return firstListerAvailabilityPrompt(rows);
    }
    return null;
  }, [forcedPrompt, isRenter, isLister, renterOrdersQuery.data, listerOrdersQuery.data]);

  const renterCandidate =
    candidate?.kind === "renter-return" ? candidate : null;

  const pickupWindowQuery = useReturnPickupWindowOptions(
    renterCandidate?.orderId,
    renterCandidate?.shipmentId ?? undefined,
    Boolean(renterCandidate) && isRenter && !forcedPrompt,
  );

  const canEvaluate =
    hydrated &&
    Boolean(token) &&
    !meLoading &&
    !isActionPromptSuppressedPath(pathname) &&
    !isActionPromptSessionDismissed() &&
    !isOnboardingTroublePath(pathname);

  const evaluatePrompt = useCallback(() => {
    if (!canEvaluate || shownRef.current || !candidate) return;
    shownRef.current = true;

    if (candidate.kind === "renter-return") {
      const pickupWindowSummary =
        candidate.pickupWindowSummary ??
        resolveReturnPickupWindowSummary(pickupWindowQuery.data);
      setPrompt({ ...candidate, pickupWindowSummary: pickupWindowSummary ?? null });
    } else {
      setPrompt(candidate);
    }

    setOpen(true);
  }, [canEvaluate, candidate, pickupWindowQuery.data]);

  useEffect(() => {
    shownRef.current = false;
    setOpen(false);
    setPrompt(null);
  }, [token, role]);

  useEffect(() => {
    if (!canEvaluate || !candidate) return;

    const awaitingPickupWindow =
      candidate.kind === "renter-return" &&
      !forcedPrompt &&
      pickupWindowQuery.isLoading;

    if (awaitingPickupWindow) return;

    const timer = window.setTimeout(evaluatePrompt, PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    canEvaluate,
    candidate,
    evaluatePrompt,
    forcedPrompt,
    pickupWindowQuery.isLoading,
  ]);

  const handleDismiss = () => {
    dismissActionPromptSession();
    setOpen(false);
  };

  const handleRenterPrimary = () => {
    if (!prompt || prompt.kind !== "renter-return") return;
    setReturnModalTarget({
      orderId: prompt.orderId,
      shipmentId: prompt.shipmentId,
    });
    setOpen(false);
    setReturnModalOpen(true);
  };

  const handleReturnModalClose = () => {
    setReturnModalOpen(false);
    setReturnModalTarget(null);
  };

  const handleReturnConfirm = async (
    images: string[],
    itemCondition: "GOOD" | "FAIR" | "POOR",
    damageNotes: string,
    pickupWindow: { start: string; end: string },
  ): Promise<void> => {
    if (!returnModalTarget) return;
    await initiateReturnMutation.mutateAsync({
      orderId: returnModalTarget.orderId,
      shipmentId: returnModalTarget.shipmentId ?? undefined,
      images,
      itemCondition,
      damageNotes,
      pickupWindow,
    });
  };

  const handleListerPrimary = async () => {
    if (!prompt || prompt.kind !== "lister-availability") return;
    setPrimaryLoading(true);
    try {
      await approveOrder(prompt.orderId);
      dismissActionPromptItem("lister-availability", prompt.orderId);
      toast.success("Request approved.");
      await queryClient.invalidateQueries({ queryKey: ["listers", "orders"] });
      setOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not approve this request.",
      );
    } finally {
      setPrimaryLoading(false);
    }
  };

  const handleListerSecondary = () => {
    if (!prompt || prompt.kind !== "lister-availability") return;
    dismissActionPromptItem("lister-availability", prompt.orderId);
    setOpen(false);
    router.push(`/listers/orders/${encodeURIComponent(prompt.orderId)}`);
  };

  if (!prompt) return null;

  if (prompt.kind === "renter-return") {
    const copy = renterReturnPromptCopy(prompt.productLabel);
    return (
      <>
        <ActionPromptModal
          open={open}
          title={copy.title}
          body={copy.body}
          pickupWindowSummary={prompt.pickupWindowSummary}
          imageUrl={prompt.imageUrl}
          imageAlt={prompt.productLabel}
          primaryLabel={copy.primaryLabel}
          onPrimary={handleRenterPrimary}
          onDismiss={handleDismiss}
        />
        {returnModalTarget ? (
          <ReadyToReturnModal
            isOpen={returnModalOpen}
            onClose={handleReturnModalClose}
            onConfirm={handleReturnConfirm}
            isLoading={initiateReturnMutation.isPending}
            orderId={returnModalTarget.orderId}
            shipmentId={returnModalTarget.shipmentId ?? undefined}
            itemImageUrl={prompt.imageUrl}
            itemLabel={prompt.productLabel}
          />
        ) : null}
      </>
    );
  }

  return (
    <ActionPromptModal
      open={open}
      title="Someone wants your piece"
      body={`${prompt.renterLabel} is waiting on ${prompt.productLabel}. You can approve or review the request in one tap.`}
      imageUrl={prompt.imageUrl}
      imageAlt={prompt.productLabel}
      primaryLabel="Approve"
      onPrimary={handleListerPrimary}
      secondaryLabel="Review request"
      onSecondary={handleListerSecondary}
      onDismiss={handleDismiss}
      isPrimaryLoading={primaryLoading}
    />
  );
}
