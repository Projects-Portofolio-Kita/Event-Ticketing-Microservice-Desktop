/**
 * @file navigation.ts
 * @description Types for screen routing, navigation context, and breadcrumbs.
 */
export type ScreenType = 'discover' | 'categories' | 'detail' | 'seatmap' | 'tickets';

export interface BreadcrumbItem {
  label: string;
  screen?: ScreenType;
}

export interface NavigationContextType {
  activeScreen: ScreenType;
  selectedEventId: string;
  navigateTo: (screen: ScreenType, eventId?: string) => void;
  goBack: () => void;
}
