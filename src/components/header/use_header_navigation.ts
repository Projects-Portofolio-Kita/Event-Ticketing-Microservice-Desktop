/**
 * @file use_header_navigation.ts
 * @description Hook managing header navigation state, router fallback, and active screen resolution.
 */
import { useNavigate, useLocation } from 'react-router-dom';
import { ScreenType } from '../../types/navigation';
import { useNavigation } from '../../context/NavigationContext';

const ROUTE_MAP: Record<ScreenType, string> = {
  discover: '/',
  categories: '/categories',
  detail: '/event/coldplay-2026',
  seatmap: '/seatmap/coldplay-2026',
  tickets: '/tickets',
};

export function useHeaderNavigation(propNav?: (s: ScreenType) => void, propActive?: ScreenType) {
  let nav: ReturnType<typeof useNavigate> | null = null;
  let loc: ReturnType<typeof useLocation> | null = null;
  let ctx: ReturnType<typeof useNavigation> | null = null;
  try { nav = useNavigate(); } catch {}
  try { loc = useLocation(); } catch {}
  try { ctx = useNavigation(); } catch {}

  const locActive = loc ? (() => {
    const p = loc.pathname;
    if (p === '/' || p === '/discover') return 'discover';
    if (p.startsWith('/categories')) return 'categories';
    if (p.startsWith('/event')) return 'detail';
    if (p.startsWith('/seatmap')) return 'seatmap';
    if (p.startsWith('/tickets')) return 'tickets';
    return 'discover';
  })() : null;

  const activeScreen: ScreenType = propActive ?? locActive ?? ctx?.activeScreen ?? 'discover';

  const handleNavigate = (screen: ScreenType) => {
    if (propNav) { propNav(screen); return; }
    if (nav) {
      nav(ROUTE_MAP[screen] || '/');
      if (ctx) ctx.navigateTo(screen);
      return;
    }
    if (ctx) ctx.navigateTo(screen);
  };

  return { activeScreen, handleNavigate };
}
