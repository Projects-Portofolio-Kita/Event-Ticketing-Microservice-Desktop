/**
 * @file useSafeNavigate.ts
 * @description Safe navigation hook supporting React Router and NavigationContext fallbacks.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { ScreenType } from '../types/navigation';
import { getScreenRoute } from './navigate_path';

export interface UseSafeNavigateOptions {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  defaultEventId?: string;
}

export function useSafeNavigate(options: UseSafeNavigateOptions = {}) {
  const { onNavigate, defaultEventId = 'coldplay-2026' } = options;
  let routerNavigate: ReturnType<typeof useNavigate> | null = null;
  try { routerNavigate = useNavigate(); } catch { routerNavigate = null; }

  let navContext: ReturnType<typeof useNavigation> | null = null;
  try { navContext = useNavigation(); } catch { navContext = null; }

  const navigate = useCallback(
    (screen: ScreenType, eventId?: string) => {
      const targetEventId = eventId || defaultEventId;
      if (onNavigate) { onNavigate(screen, targetEventId); return; }
      if (routerNavigate) { routerNavigate(getScreenRoute(screen, targetEventId)); }
      if (navContext) { navContext.navigateTo(screen, targetEventId); }
    },
    [onNavigate, routerNavigate, navContext, defaultEventId]
  );

  return {
    navigate,
    activeScreen: navContext?.activeScreen ?? 'discover',
    currentEventId: navContext?.selectedEventId ?? defaultEventId,
  };
}

export default useSafeNavigate;
