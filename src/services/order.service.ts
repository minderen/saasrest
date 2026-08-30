import { menuRepository } from "@/repositories/menu.repository";
import type { CartLine, PlacedOrder } from "@/types/menu";
import { orderSchema, type OrderInput } from "@/validators/order.validator";

/** Display-only total for the cart UI. The authoritative total comes from the DB. */
export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.unit_price * line.quantity, 0);
}

function friendlyError(error: unknown): Error {
  const message =
    typeof error === "object" && error && "message" in error
      ? String((error as { message: unknown }).message)
      : "Sipariş gönderilemedi. Lütfen tekrar deneyin.";
  return new Error(message);
}

export const orderService = {
  /** Validates the payload, then lets the database reprice and persist the order. */
  async place(input: OrderInput): Promise<PlacedOrder> {
    const parsed = orderSchema.parse(input);
    try {
      return await menuRepository.placeOrder(parsed);
    } catch (error) {
      throw friendlyError(error);
    }
  },

  /** Maps in-memory cart lines to the reference-only order payload. */
  toOrderItems(lines: CartLine[]): OrderInput["items"] {
    return lines.map((line) => ({
      product_id: line.product_id,
      menu_id: line.menu_id,
      quantity: line.quantity,
    }));
  },
};
