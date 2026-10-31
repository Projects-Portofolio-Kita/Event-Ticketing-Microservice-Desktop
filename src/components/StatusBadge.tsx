/**
 * @file StatusBadge.tsx
 * @description Standardized event status pills and KYC verification badges.
 */
import React from 'react';
import { ShieldCheck, Flame } from 'lucide-react';

export type StatusBadgeVariant = 'presale' | 'few-left' | 'available' | 'sold-out' | 'kyc' | 'custom';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
  icon?: boolean;
}

const variantStyles: Record<StatusBadgeVariant, string> = {
  'few-left': 'bg-[#ea580c] text-white',
  'presale': 'bg-[#059669] text-white',
  'available': 'bg-[#059669] text-white',
  'sold-out': 'bg-[#94a3b8] text-white opacity-70',
  'kyc': 'bg-emerald/10 text-emerald border border-emerald/20',
  'custom': 'bg-indigo/10 text-indigo',
};

function resolveVariant(label: string, variant?: StatusBadgeVariant): StatusBadgeVariant {
  if (variant) return variant;
  const upper = label.toUpperCase();
  if (upper.includes('PRESALE') || upper.includes('AKTIF')) return 'presale';
  if (upper.includes('SISA') || upper.includes('SEDIKIT')) return 'few-left';
  if (upper.includes('HABIS') || upper.includes('TERJUAL')) return 'sold-out';
  if (upper.includes('TERSEDIA')) return 'available';
  if (upper.includes('KYC')) return 'kyc';
  return 'custom';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, variant, className = '', icon = false }) => {
  const resolved = resolveVariant(label, variant);
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md shadow-sm select-none ${variantStyles[resolved]} ${className}`}>
      {icon && resolved === 'kyc' && <ShieldCheck size={12} className="shrink-0" />}
      {icon && resolved === 'few-left' && <Flame size={12} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
