/**
 * @file HeaderUserMenu.tsx
 * @description Renders profile popover dropdown with user info and 6 quick action menu items.
 */
import React from 'react';
import { Ticket, Receipt, Heart, Settings, CircleHelp, LogOut } from 'lucide-react';
import { UserProfile } from '../../types/user';
import { ScreenType } from '../../types/navigation';
import { MenuItemProps } from './header_types';

export const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, badge, danger = false, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 h-10 px-3 rounded-xl text-[13px] font-medium transition-colors cursor-pointer ${danger ? 'text-danger hover:bg-danger/10' : 'text-ink-soft hover:bg-subtle hover:text-ink'}`}>
    <Icon size={16} className={danger ? 'text-danger' : 'text-ink-muted'} /><span className="flex-1 text-left">{label}</span>
    {badge && <span className="text-[10px] font-semibold text-indigo bg-indigo/10 rounded-full px-2 py-0.5">{badge}</span>}
  </button>
);

interface UserMenuProps {
  user: UserProfile; onClose: () => void; onNavigate: (s: ScreenType) => void;
}

export const renderHeaderUserMenu = ({ user, onClose, onNavigate }: UserMenuProps): React.ReactElement => (
  <div className="pop-in absolute right-0 top-[calc(100%+8px)] w-[280px] bg-canvas border border-line rounded-2xl shadow-pop overflow-hidden z-50">
    <div className="p-4 flex items-center gap-3 border-b border-subtle">
      <img src={user.avatarUrl} alt={user.name} className="w-11 h-11 rounded-full object-cover" />
      <div className="min-w-0">
        <p className="text-[14px] font-semibold truncate text-ink">{user.name}</p>
        <p className="text-[12px] text-ink-muted truncate">{user.email}</p>
        <span className="inline-block mt-1 text-[10px] font-semibold text-violet bg-violet/10 rounded-full px-2 py-0.5">{user.membershipTier}</span>
      </div>
    </div>
    <div className="p-1.5">
      <MenuItem icon={Ticket} label="Tiket Saya" badge={`${user.activeTicketsCount ?? 2} Aktif`} onClick={() => { onClose(); onNavigate('tickets'); }} />
      <MenuItem icon={Receipt} label="Riwayat Pesanan" onClick={onClose} />
      <MenuItem icon={Heart} label="Event Favorit" onClick={onClose} />
      <div className="my-1.5 h-px bg-subtle" />
      <MenuItem icon={Settings} label="Pengaturan Akun" onClick={onClose} />
      <MenuItem icon={CircleHelp} label="Pusat Bantuan & FAQ" onClick={onClose} />
      <div className="my-1.5 h-px bg-subtle" />
      <MenuItem icon={LogOut} label="Keluar (Log Out)" danger onClick={onClose} />
    </div>
  </div>
);
