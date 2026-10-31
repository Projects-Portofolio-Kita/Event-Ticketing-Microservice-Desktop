/**
 * @file header_types.ts
 * @description Types and props for navigation header and user popover menu.
 */
import React from 'react';
import { UserProfile } from '../../types/user';
import { ScreenType } from '../../types/navigation';

export interface HeaderProps {
  onNavigate?: (screen: ScreenType) => void;
  activeScreen?: ScreenType;
  active?: ScreenType;
  user?: UserProfile;
}

export interface MenuItemProps {
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> | any;
  badge?: string;
  danger?: boolean;
  onClick?: () => void;
}
