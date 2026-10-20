/**
 * useSafeNavigate Hook - Unified Independent Navigation Hook
 * Gracefully navigates across react-router-dom, NavigationContext, and fallback callbacks
 */
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '../context/NavigationContext';
import { ScreenType } from '../types/navigation';

export interface UseSafeNavigateOptions {
  onNavigate?: (screen: ScreenType, eventId?: string) => void;
  defaultEventId?: string;
}

export function useSafeNavigate(options: UseSafeNavigateOptions = {}) {
  const { onNavigate, defaultEventId = 'coldplay-2026' } = options;

  let routerNavigate: ReturnType<typeof useNavigate> | null = null;
  try {
    routerNavigate = useNavigate();
  } catch {
    routerNavigate = null;
  }

  let navContext: ReturnType<typeof useNavigation> | null = null;
  try {
    navContext = useNavigation();
  } catch {
    navContext = null;
  }

  const navigate = useCallback(
    (screen: ScreenType, eventId?: string) => {
      const targetEventId = eventId || defaultEventId;

      if (onNavigate) {
        onNavigate(screen, targetEventId);
        return;
      }

      if (routerNavigate) {
        switch (screen) {
          case 'discover':
            routerNavigate('/');
            break;
          case 'categories':
            routerNavigate('/categories');
            break;
          case 'detail':
            routerNavigate(`/event/${targetEventId}`);
            break;
          case 'seatmap':
            routerNavigate(`/seatmap/${targetEventId}`);
            break;
          case 'tickets':
            routerNavigate('/tickets');
            break;
          default:
            routerNavigate('/');
        }
      }

      if (navContext) {
        navContext.navigateTo(screen, targetEventId);
      }
    },
    [onNavigate, routerNavigate, navContext, defaultEventId]
  );

  return {
    navigate,
    activeScreen: navContext?.activeScreen ?? 'discover',
    currentEventId: navContext?.selectedEventId ?? defaultEventId
  };
}

export default useSafeNavigate;
