/**
 * @file pricing.ts
 * @description Deterministic calculation of subtotal, tax, service fees, and barcodes.
 */

export interface OrderPricing {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
}

/**
 * Calculate deterministic pricing figures for ticket seat orders:
 * Subtotal = sum of seat prices, Tax = 10%, Service Fee = Rp 35.000.
 */
export function calculateOrderPricing(seatPrices: number[]): OrderPricing {
  if (!seatPrices || seatPrices.length === 0) {
    return { subtotal: 0, tax: 0, serviceFee: 0, total: 0 };
  }
  const subtotal = seatPrices.reduce((sum, p) => sum + (p || 0), 0);
  const tax = Math.round(subtotal * 0.1);
  const serviceFee = 35000;
  const total = subtotal + tax + serviceFee;
  return { subtotal, tax, serviceFee, total };
}

/**
 * Generate deterministic barcode bar widths for ticket scanner stubs.
 */
export function generateBarcodeBars(count = 58): number[] {
  return Array.from({ length: count }, (_, i) => ((i * 7 + 13) % 4) + 1);
}
