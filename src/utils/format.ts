/**
 * TickId Desktop - Format & Pricing Domain Utilities
 * Clean Architecture Domain Helpers
 */

/**
 * Format numeric value to Indonesian Rupiah currency string
 * e.g. 3500000 -> "Rp 3.500.000"
 */
export function formatRupiah(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return 'Rp 0';
  }
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Format seconds countdown into MM:SS format
 * e.g. 300 -> "05:00", 65 -> "01:05", 9 -> "00:09", 0 -> "00:00"
 */
export function formatTimer(seconds: number): string {
  if (typeof seconds !== 'number' || isNaN(seconds) || seconds <= 0) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Pricing contract for TickId orders
 */
export interface OrderPricing {
  subtotal: number;
  tax: number;
  serviceFee: number;
  total: number;
}

/**
 * Calculate deterministic pricing figures for ticket seat orders
 * Formula:
 *  - Subtotal = sum of all seat prices
 *  - Tax = 10% entertainment tax, rounded (Math.round(subtotal * 0.1)), 0 if empty
 *  - Service Fee = fixed Rp 35.000 if >= 1 seat; Rp 0 if empty
 *  - Total = Subtotal + Tax + Service Fee
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
 * Generate deterministic barcode bars for ticket scanner stubs
 * Returns an array of bar widths (1 to 4 px)
 */
export function generateBarcodeBars(count = 58): number[] {
  return Array.from({ length: count }, (_, i) => ((i * 7 + 13) % 4) + 1);
}
