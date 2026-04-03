/** Cart list row: derived from GET /cart-items plus optional product enrichment. */
export type CartCheckoutLine = {
  lineId: string;
  cartItemId: string;
  productId: string;
  rentalDays: number;
  totalPrice: number;
  deliveryFee: number;
  productDetail: Record<string, unknown> | null;
  productName?: string;
  expiresAt?: string;
  status?: string;
  /** Linked rental request (for DELETE fallback when /cart-items/:id is not implemented). */
  rentalRequestId?: string;
};
