/**
 * @file navigate_path.ts
 * @description Path mapping resolver for screen destinations.
 */

import { ScreenType } from '../types/navigation';

export function getScreenRoute(screen: ScreenType, eventId: string): string {
  switch (screen) {
    case 'discover': return '/';
    case 'categories': return '/categories';
    case 'detail': return `/event/${eventId}`;
    case 'seatmap': return `/seatmap/${eventId}`;
    case 'tickets': return '/tickets';
    default: return '/';
  }
}
