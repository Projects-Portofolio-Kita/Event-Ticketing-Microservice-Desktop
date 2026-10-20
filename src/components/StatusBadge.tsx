/**
 * StatusBadge Component - Independent Reusable Badge Component
 * Renders standardized event status pills and verification badges
 */
import React from 'react';
import { ShieldCheck, Flame } from 'lucide-react';

export type StatusBadgeVariant =
  | 'presale'
  | 'few-left'
  | 'available'
  | 'sold-out'
  | 'kyc'
  | 'custom';

export interface StatusBadgeProps {
  label: string;
  variant?: StatusBadgeVariant;
  className?: string;
  icon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant,
  className = '',
  icon = false
}) => {
  // Infer variant from label if not explicitly provided
  const resolvedVariant: StatusBadgeVariant = variant || (() => {
    const upper = label.toUpperCase();
    if (upper.includes('PRESALE') || upper.includes('AKTIF')) return 'presale';
    if (upper.includes('SISA') || upper.includes('SEDIKIT')) return 'few-left';
    if (upper.includes('HABIS') || upper.includes('TERJUAL')) return 'sold-out';
    if (upper.includes('TERSEDIA')) return 'available';
    if (upper.includes('KYC')) return 'kyc';
    return 'custom';
  })();

  const getVariantStyles = (): string => {
    switch (resolvedVariant) {
      case 'few-left':
        return 'bg-[#ea580c] text-white';
      case 'presale':
      case 'available':
        return 'bg-[#059669] text-white';
      case 'sold-out':
        return 'bg-[#94a3b8] text-white opacity-70';
      case 'kyc':
        return 'bg-emerald/10 text-emerald border border-emerald/20';
      default:
        return 'bg-indigo/10 text-indigo';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold tracking-wide px-2 py-0.5 rounded-md shadow-sm select-none ${getVariantStyles()} ${className}`}
    >
      {icon && resolvedVariant === 'kyc' && <ShieldCheck size={12} className="shrink-0" />}
      {icon && resolvedVariant === 'few-left' && <Flame size={12} className="shrink-0" />}
      <span>{label}</span>
    </span>
  );
};

export default StatusBadge;
