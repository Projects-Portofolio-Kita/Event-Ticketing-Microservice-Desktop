/**
 * @file api_health.ts
 * @description Connectivity checks for backend Go microservices.
 */

import { BackendHealthStatus } from './api_types';

export async function checkBackendHealth(): Promise<BackendHealthStatus> {
  const result: BackendHealthStatus = { bookingService: false, paymentService: false };

  try {
    const bookingRes = await fetch('/health/booking', { signal: AbortSignal.timeout(1500) });
    if (bookingRes.ok) result.bookingService = true;
  } catch {
    // service not reachable
  }

  try {
    const paymentRes = await fetch('/health/payment', { signal: AbortSignal.timeout(1500) });
    if (paymentRes.ok) result.paymentService = true;
  } catch {
    // service not reachable
  }

  return result;
}
