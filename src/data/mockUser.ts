/**
 * Mock User Profile Data for TickId Desktop Application
 * Matches Figma host app Header user dropdown specification
 */

import { UserProfile } from '../types/user';

export const mockUser: UserProfile = {
  id: 'usr-fajrul-01',
  name: 'Fajrul Rahman', // Fajrul Kurniawan / Fajrul Rahman per Figma spec
  email: 'fajrul@example.com',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=72&h=72&fit=crop&auto=format',
  membershipTier: 'VIP Silver Member',
  isOnline: true,
  activeTicketsCount: 2,
  unreadNotificationsCount: 3,
  menuItems: [
    { id: 'tickets', label: 'Tiket Saya', badge: '2 Aktif', screen: 'tickets' },
    { id: 'history', label: 'Riwayat Pesanan' },
    { id: 'favorites', label: 'Event Favorit', dividerAfter: true },
    { id: 'settings', label: 'Pengaturan Akun' },
    { id: 'help', label: 'Pusat Bantuan & FAQ', dividerAfter: true },
    { id: 'logout', label: 'Keluar (Log Out)', danger: true }
  ]
};

// Aliases for user profile variations
export const mockUserProfile = mockUser;
