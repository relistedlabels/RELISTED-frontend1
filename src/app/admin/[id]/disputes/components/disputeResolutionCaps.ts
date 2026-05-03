import type {
  DisputeDetail,
  DisputeResolutionContext,
} from "@/lib/api/admin/disputes";

export function toNumberOrNull(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function formatMoney(value: number | null | undefined): string {
  const safe = typeof value === "number" && Number.isFinite(value) ? value : 0;
  return safe.toLocaleString("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  });
}

export type DisputeInitiator = "renter" | "lister" | "unknown";

export interface DisputeResolutionCaps {
  escrowStatus: string;
  collateralLocked: number;
  rentalAmount: number;
  cleaningFee: number;
  resaleAmount: number;
  payoutLocked: number;
  refundMax: number;
  collateralMax: number;
  initiator: DisputeInitiator;
  resolutionContext: DisputeResolutionContext | null | undefined;
}

/**
 * Mirrors admin `resolutionContext` + escrow math so UI caps match `resolveDisputeAndSettle`.
 */
export function getDisputeResolutionCaps(
  disputeDetail: DisputeDetail | Record<string, unknown> | null | undefined,
): DisputeResolutionCaps {
  const detail = disputeDetail as Record<string, unknown> | null | undefined;
  const rc = detail?.resolutionContext as DisputeResolutionContext | undefined;
  const escrow = (detail?.orderDetails as Record<string, unknown> | undefined)
    ?.escrow as Record<string, unknown> | undefined;

  const escrowStatus = String(
    rc?.escrowStatus ?? escrow?.status ?? "",
  );
  const collateralLocked = toNumberOrNull(escrow?.collateralAmount) ?? 0;
  const rentalAmount = toNumberOrNull(escrow?.rentalAmount) ?? 0;
  const cleaningFee = toNumberOrNull(escrow?.cleaningFee) ?? 0;
  const resaleAmount = toNumberOrNull(escrow?.resaleAmount) ?? 0;

  // LOCKED: `rentalAmount` is stored as rent+cleaning at checkout; do not add `cleaningFee` again.
  const payoutLocked =
    escrowStatus === "LOCKED"
      ? rentalAmount + resaleAmount
      : escrowStatus === "PARTIALLY_RELEASED"
        ? cleaningFee + resaleAmount
        : 0;

  const refundMax =
    typeof rc?.refundAmountMax === "number" && Number.isFinite(rc.refundAmountMax)
      ? Math.max(0, rc.refundAmountMax)
      : payoutLocked;

  const collateralMax =
    typeof rc?.collateralWithheldToListerMax === "number" &&
    Number.isFinite(rc.collateralWithheldToListerMax)
      ? Math.max(0, rc.collateralWithheldToListerMax)
      : collateralLocked;

  let initiator: DisputeInitiator =
    rc?.initiator === "renter" || rc?.initiator === "lister" || rc?.initiator === "unknown"
      ? rc.initiator
      : "unknown";

  if (initiator === "unknown" && detail) {
    const raised = detail.raisedBy as { id?: string } | undefined;
    const orderDetails = detail.orderDetails as
      | {
          renter?: { id?: string };
          lister?: { id?: string };
        }
      | undefined;
    const rid = raised?.id;
    const renterId = orderDetails?.renter?.id;
    const listerId = orderDetails?.lister?.id;
    if (rid && renterId && rid === renterId) initiator = "renter";
    else if (rid && listerId && rid === listerId) initiator = "lister";
  }

  return {
    escrowStatus,
    collateralLocked,
    rentalAmount,
    cleaningFee,
    resaleAmount,
    payoutLocked,
    refundMax,
    collateralMax,
    initiator,
    resolutionContext: rc,
  };
}
