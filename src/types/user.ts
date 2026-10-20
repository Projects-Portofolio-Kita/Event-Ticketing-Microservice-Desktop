/**
 * User Profile and Menu Types for TickId Desktop Application
 */

export interface UserMenuItem {
  id: string;
  label: string;
  iconName?: string;
  badge?: string;
  danger?: boolean;
  screen?: string;
  dividerAfter?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  membershipTier: string;
  isOnline: boolean;
  activeTicketsCount: number;
  unreadNotificationsCount: number;
  menuItems?: UserMenuItem[];
}
