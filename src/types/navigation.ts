/**
 * Navigation Types for TickId Desktop Application
 * Matches Figma host app screen routing specification
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
