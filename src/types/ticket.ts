/**
 * Ticket and Digital Pass Types for TickId Desktop Application
 */

export interface TicketMetaItem {
  k: string;
  v: string;
}

export interface BuyerKYC {
  name: string;
  email: string;
  isVerified: boolean;
  statusBadge: string;
  membershipTier?: string;
}

export interface ETicketData {
  referenceId: string;
  passType: string;
  eventTitle: string;
  eventSubtitle: string;
  metadata: TicketMetaItem[];
  buyer: BuyerKYC;
  gateLabel: string;
  qrCodeSeed: number;
  barcodeCount: number;
  securityNotice: string;
}
