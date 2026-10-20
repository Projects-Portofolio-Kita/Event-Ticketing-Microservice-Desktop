/**
 * Automated Verification Suite for Milestone 4 - TickId Desktop Application
 * Tests:
 *  - EventDetailScreen: Breadcrumbs, concert metadata, Google Maps link, eco highlights,
 *    ticket tiers (CAT 1-4), crude stage layout diagram, FAQ accordion (+/- toggle),
 *    and sticky bottom booking bar.
 *  - SeatMap: 270 seats across 4 tiers, status styling (available, selected, locked, sold),
 *    zoom controls clamped (0.7x to 1.4x), reset, attendee counter, and lock warning.
 *  - OrderSummary: Dynamic sidebar, 5-min lock timer, selected seats list with code (e.g. C1-A-01),
 *    empty state placeholder, subtotal, 10% tax, Rp 35k fee, total, and proceed to QRIS trigger.
 *  - SeatMapScreen: Top banner, attendee counter ("8.420 antrean aktif"), back navigation,
 *    and coordinated SeatMap + OrderSummary layout.
 *  - Clean Architecture & Standalone State: BookingContext & NavigationContext integration.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const Module = require('module');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const vite = require('vite');

const ROOT_DIR = path.resolve(__dirname, '..');
const EVENT_DETAIL_PATH = path.join(ROOT_DIR, 'src', 'screens', 'EventDetailScreen.tsx');
const SEAT_MAP_PATH = path.join(ROOT_DIR, 'src', 'components', 'SeatMap.tsx');
const ORDER_SUMMARY_PATH = path.join(ROOT_DIR, 'src', 'components', 'OrderSummary.tsx');
const SEAT_MAP_SCREEN_PATH = path.join(ROOT_DIR, 'src', 'screens', 'SeatMapScreen.tsx');
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');
const BOOKING_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx');

let cachedEventDetailCode = null;
let cachedSeatMapCode = null;
let cachedOrderSummaryCode = null;
let cachedSeatMapScreenCode = null;
let cachedNavCode = null;
let cachedBookingCode = null;

async function compileBundle(entryPath) {
  const result = await vite.build({
    root: ROOT_DIR,
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: entryPath,
        name: 'TickIdBundle',
        cssFileName: 'bundle',
        formats: ['cjs'],
        fileName: () => 'bundle.cjs'
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', 'react-router-dom']
      }
    }
  });
  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  return chunk.code;
}

async function loadComponent(code, customReact = null) {
  const m = new Module('bundle.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);
  if (customReact) {
    m.require = (id) => {
      if (id === 'react') return customReact;
      return require(id);
    };
  }
  m._compile(code, 'bundle.cjs');
  return m.exports;
}

// Interactive harness supporting React hooks outside a full browser DOM
function createHarness(customInitialValues = []) {
  const stateMap = new Map();
  let stateIndex = 0;

  customInitialValues.forEach((val, idx) => {
    stateMap.set(idx, val);
  });

  const mockReact = {
    ...React,
    useState: (initial) => {
      const idx = stateIndex++;
      if (!stateMap.has(idx)) {
        stateMap.set(idx, initial);
      }
      const val = stateMap.get(idx);
      const setter = (updater) => {
        const next = typeof updater === 'function' ? updater(stateMap.get(idx)) : updater;
        stateMap.set(idx, next);
      };
      return [val, setter];
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useRef: (initial) => ({ current: initial }),
    useEffect: () => {},
    useContext: () => null
  };

  const resetIndex = () => {
    stateIndex = 0;
  };

  return {
    mockReact,
    resetIndex,
    getState: (idx) => stateMap.get(idx),
    setState: (idx, val) => stateMap.set(idx, val)
  };
}

// -----------------------------------------------------------------------------
// Suite 1: Static Quality & Clean Architecture Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - Static Quality & Clean Architecture Verification', () => {
  test('all required M4 source files exist', () => {
    assert.strictEqual(fs.existsSync(EVENT_DETAIL_PATH), true, 'EventDetailScreen.tsx must exist');
    assert.strictEqual(fs.existsSync(SEAT_MAP_PATH), true, 'SeatMap.tsx must exist');
    assert.strictEqual(fs.existsSync(ORDER_SUMMARY_PATH), true, 'OrderSummary.tsx must exist');
    assert.strictEqual(fs.existsSync(SEAT_MAP_SCREEN_PATH), true, 'SeatMapScreen.tsx must exist');
  });

  test('EventDetailScreen exports both named and default', () => {
    const content = fs.readFileSync(EVENT_DETAIL_PATH, 'utf-8');
    assert.match(content, /export const EventDetailScreen/, 'Named EventDetailScreen export required');
    assert.match(content, /export default EventDetailScreen/, 'Default EventDetailScreen export required');
  });

  test('SeatMap exports both named and default', () => {
    const content = fs.readFileSync(SEAT_MAP_PATH, 'utf-8');
    assert.match(content, /export const SeatMap/, 'Named SeatMap export required');
    assert.match(content, /export default SeatMap/, 'Default SeatMap export required');
  });

  test('OrderSummary exports both named and default', () => {
    const content = fs.readFileSync(ORDER_SUMMARY_PATH, 'utf-8');
    assert.match(content, /export const OrderSummary/, 'Named OrderSummary export required');
    assert.match(content, /export default OrderSummary/, 'Default OrderSummary export required');
  });

  test('SeatMapScreen exports both named and default', () => {
    const content = fs.readFileSync(SEAT_MAP_SCREEN_PATH, 'utf-8');
    assert.match(content, /export const SeatMapScreen/, 'Named SeatMapScreen export required');
    assert.match(content, /export default SeatMapScreen/, 'Default SeatMapScreen export required');
  });

  test('adheres to Clean Architecture: 0 backend API calls', () => {
    [EVENT_DETAIL_PATH, SEAT_MAP_PATH, ORDER_SUMMARY_PATH, SEAT_MAP_SCREEN_PATH].forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      assert.doesNotMatch(content, /fetch\s*\(/, `${file} must not call fetch()`);
      assert.doesNotMatch(content, /axios/, `${file} must not import axios`);
      assert.doesNotMatch(content, /XMLHttpRequest/, `${file} must not use XMLHttpRequest`);
      assert.doesNotMatch(content, /from\s+['"].*services\/api['"]/, `${file} must not couple to services/api`);
    });
  });
});

// -----------------------------------------------------------------------------
// Suite 2: EventDetailScreen SSR & Render Structure Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - EventDetailScreen SSR & Render Structure Verification', async () => {
  if (!cachedEventDetailCode) cachedEventDetailCode = await compileBundle(EVENT_DETAIL_PATH);
  const { EventDetailScreen } = await loadComponent(cachedEventDetailCode);

  test('renders cleanly via ReactDOMServer with 0 errors', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.length > 500, 'HTML output should be rich');
    assert.ok(html.includes('event-detail-screen'), 'Should contain container class');
  });

  test('renders Breadcrumb trail with Beranda and Coldplay title', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('Beranda'), 'Must include Beranda link');
    assert.ok(html.includes('Konser Musik'), 'Must include category breadcrumb');
    assert.ok(html.includes('Coldplay Music of the Spheres 2026') || html.includes('Coldplay'), 'Must include event title in breadcrumbs');
  });

  test('renders concert metadata: title, date, hours, venue, and Google Maps link', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('Coldplay: Music of the Spheres World Tour 2026'), 'Must display full concert title');
    assert.ok(html.includes('Sabtu, 14 November 2026'), 'Must display concert date');
    assert.ok(html.includes('Open Gate: 16:00 WIB · Show Starts: 19:30 WIB'), 'Must display gate & show time');
    assert.ok(html.includes('Stadion Utama Gelora Bung Karno'), 'Must display GBK venue');
    assert.ok(html.includes('Buka di Google Maps'), 'Must display "Buka di Google Maps" link text');
    assert.ok(html.includes('https://maps.google.com/?q=Stadion+Utama+Gelora+Bung+Karno'), 'Must link to GBK on Google Maps');
  });

  test('renders Eco-Friendly Highlights badge ("Konser Ramah Lingkungan — 100% energi terbarukan")', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('Konser Ramah Lingkungan — 100% energi terbarukan'), 'Must include eco-friendly badge text');
    assert.ok(html.includes('lantai kinetik'), 'Must mention kinetic floor or bike generator highlights');
  });

  test('renders all 4 ticket categories (CAT 1 - CAT 4) with prices and status pills', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('CAT 1 — VIP Soundcheck'), 'Must list CAT 1');
    assert.ok(html.includes('CAT 2 — Festival / Free Standing'), 'Must list CAT 2');
    assert.ok(html.includes('CAT 3 — Tribun Bawah'), 'Must list CAT 3');
    assert.ok(html.includes('CAT 4 — Tribun Atas'), 'Must list CAT 4');
    assert.ok(html.includes('Rp 3.500.000'), 'Must show CAT 1 price');
    assert.ok(html.includes('Rp 2.100.000'), 'Must show CAT 2 price');
    assert.ok(html.includes('Rp 1.500.000'), 'Must show CAT 3 price');
    assert.ok(html.includes('Rp 750.000'), 'Must show CAT 4 price');
    assert.ok(html.includes('Tersedia'), 'Must include Tersedia status');
    assert.ok(html.includes('Sisa Sedikit'), 'Must include Sisa Sedikit status');
    assert.ok(html.includes('Habis'), 'Must include Habis status');
  });

  test('renders crude stage layout diagram with PANGGUNG UTAMA / STAGE banner and caption', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('PANGGUNG UTAMA / STAGE'), 'Must include stage banner');
    assert.ok(html.includes('Denah kasar · tidak sesuai skala'), 'Must include disclaimer caption');
  });

  test('renders Terms & FAQ accordion with 4 toggleable items', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('Ketentuan Usia &amp; Identitas') || html.includes('Ketentuan Usia & Identitas'), 'Must include FAQ item 1');
    assert.ok(html.includes('Maksimal Pembelian'), 'Must include FAQ item 2');
    assert.ok(html.includes('Kebijakan Refund &amp; Reschedule') || html.includes('Kebijakan Refund & Reschedule'), 'Must include FAQ item 3');
    assert.ok(html.includes('Barang yang Dilarang Masuk ke Venue'), 'Must include FAQ item 4');
  });

  test('renders sticky bottom booking bar with price range and primary CTA', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreen));
    assert.ok(html.includes('Rp 750.000 – Rp 3.500.000'), 'Must display price range');
    assert.ok(html.includes('Pilih Kursi Sekarang'), 'Must include CTA "Pilih Kursi Sekarang"');
  });
});

// -----------------------------------------------------------------------------
// Suite 3: EventDetailScreen Behavioral & Interactive State Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - EventDetailScreen Behavioral & Interactive State Verification', async () => {
  if (!cachedEventDetailCode) cachedEventDetailCode = await compileBundle(EVENT_DETAIL_PATH);

  test('breadcrumb "Beranda" click calls onNavigate("discover")', async () => {
    const harness = createHarness();
    const { EventDetailScreen } = await loadComponent(cachedEventDetailCode, harness.mockReact);

    let navigatedScreen = null;
    const vnode = EventDetailScreen({
      onNavigate: (s) => {
        navigatedScreen = s;
      }
    });

    function findBreadcrumbButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('breadcrumb-link') && node.props.children === 'Beranda') {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findBreadcrumbButton(child);
          if (found) return found;
        }
      }
      return null;
    }

    const berandaBtn = findBreadcrumbButton(vnode);
    assert.ok(berandaBtn, 'Should find Beranda breadcrumb button');
    berandaBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Beranda must navigate to "discover"');
  });

  test('sticky bar "Pilih Kursi Sekarang" CTA click calls onNavigate("seatmap")', async () => {
    const harness = createHarness();
    const { EventDetailScreen } = await loadComponent(cachedEventDetailCode, harness.mockReact);

    let navigatedScreen = null;
    const vnode = EventDetailScreen({
      onNavigate: (s) => {
        navigatedScreen = s;
      }
    });

    function findCtaButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('btn-pilih-kursi')) {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findCtaButton(child);
          if (found) return found;
        }
      }
      return null;
    }

    const ctaBtn = findCtaButton(vnode);
    assert.ok(ctaBtn, 'Should find CTA button');
    ctaBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'seatmap', 'Clicking "Pilih Kursi Sekarang" must navigate to "seatmap"');
  });

  test('FAQ accordion toggling works with state change', async () => {
    const harness = createHarness([[0]]);
    const { EventDetailScreen } = await loadComponent(cachedEventDetailCode, harness.mockReact);

    const vnode = EventDetailScreen({});

    function findFaqHeaderButtons(node) {
      const results = [];
      const visited = new Set();
      function recurse(n) {
        if (!n || typeof n !== 'object' || visited.has(n)) return;
        visited.add(n);
        if (n.props && n.props.className && n.props.className.includes('faq-header-btn')) {
          results.push(n);
        }
        if (n.props && n.props.children) {
          const ch = Array.isArray(n.props.children) ? n.props.children : [n.props.children];
          ch.forEach(recurse);
        }
      }
      recurse(node);
      return results;
    }

    const faqButtons = findFaqHeaderButtons(vnode);
    assert.strictEqual(faqButtons.length, 4, 'Should render 4 FAQ accordion buttons');

    // Click item 1 to toggle it open (initially [0])
    faqButtons[1].props.onClick();
    assert.ok(harness.getState(0).includes(1), 'Index 1 should now be expanded');

    // Click item 0 to toggle it closed
    faqButtons[0].props.onClick();
    assert.ok(!harness.getState(0).includes(0), 'Index 0 should now be collapsed');
  });
});

// -----------------------------------------------------------------------------
// Suite 4: SeatMap SSR & Stadium Plan Verification (270 seats)
// -----------------------------------------------------------------------------
describe('Milestone 4 - SeatMap SSR & Stadium Plan Verification', async () => {
  if (!cachedSeatMapCode) cachedSeatMapCode = await compileBundle(SEAT_MAP_PATH);
  const { SeatMap } = await loadComponent(cachedSeatMapCode);

  test('SeatMap renders cleanly via ReactDOMServer with 0 errors', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMap));
    assert.ok(html.length > 1000, 'SeatMap HTML output should be rich');
    assert.ok(html.includes('seat-map-wrapper'), 'Should contain wrapper class');
  });

  test('SeatMap renders exactly 270 seats across 4 tiers', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMap));

    // Count occurrences of data-seat-id
    const matches = html.match(/data-seat-id=/g);
    assert.ok(matches, 'Should contain seat elements');
    assert.strictEqual(matches.length, 270, 'Must render exactly 270 stadium seats');

    // Verify all 4 tiers exist in output
    assert.ok(html.includes('CAT 1 — VIP Soundcheck'), 'Must render CAT 1 tier header');
    assert.ok(html.includes('CAT 2 — Festival / Free Standing'), 'Must render CAT 2 tier header');
    assert.ok(html.includes('CAT 3 — Tribun Bawah'), 'Must render CAT 3 tier header');
    assert.ok(html.includes('CAT 4 — Tribun Atas'), 'Must render CAT 4 tier header');

    // Check tier counts
    const cat1Matches = html.match(/data-tier="cat1"/g);
    const cat2Matches = html.match(/data-tier="cat2"/g);
    const cat3Matches = html.match(/data-tier="cat3"/g);
    const cat4Matches = html.match(/data-tier="cat4"/g);

    assert.strictEqual(cat1Matches?.length, 54, 'CAT 1 VIP must have exactly 54 seats');
    assert.strictEqual(cat2Matches?.length, 72, 'CAT 2 Festival must have exactly 72 seats');
    assert.strictEqual(cat3Matches?.length, 72, 'CAT 3 Tribun Bawah must have exactly 72 seats');
    assert.strictEqual(cat4Matches?.length, 72, 'CAT 4 Tribun Atas must have exactly 72 seats');
  });

  test('SeatMap renders PANGGUNG UTAMA / STAGE banner and live badge ("8.420 antrean aktif")', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMap));
    assert.ok(html.includes('PANGGUNG UTAMA / STAGE'), 'Must render stage banner');
    assert.ok(html.includes('8.420 antrean aktif'), 'Must render live attendee counter badge');
    assert.ok(html.includes('Kursi yang Anda klik akan di-lock selama 05:00 menit'), 'Must render 5-minute lock warning');
  });

  test('SeatMap renders all 4 seat statuses with design tokens', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMap));
    assert.ok(html.includes('seat-available'), 'Must include seat-available styling');
    assert.ok(html.includes('seat-locked'), 'Must include seat-locked styling');
    assert.ok(html.includes('seat-sold'), 'Must include seat-sold styling');
    assert.ok(html.includes('bg-sold'), 'Must use bg-sold design token');
    assert.ok(html.includes('bg-amber/20'), 'Must use amber locked token');
  });

  test('SeatMap renders selected seat with bg-indigo text-white pulse-indigo', () => {
    // Select first seat
    const html = ReactDOMServer.renderToString(
      React.createElement(SeatMap, {
        selectedSeatIds: ['CAT1-A-1']
      })
    );
    assert.ok(html.includes('seat-selected'), 'Must mark selected seat');
    assert.ok(html.includes('bg-indigo text-white'), 'Must apply bg-indigo text-white');
    assert.ok(html.includes('pulse-indigo'), 'Must apply pulse-indigo animation');
  });
});

// -----------------------------------------------------------------------------
// Suite 5: SeatMap Zoom & Interactive State Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - SeatMap Zoom & Interactive State Verification', async () => {
  if (!cachedSeatMapCode) cachedSeatMapCode = await compileBundle(SEAT_MAP_PATH);

  test('zoom controls clamp between 0.7 and 1.4, reset to 1.0', async () => {
    const harness = createHarness([1.0]);
    const { SeatMap } = await loadComponent(cachedSeatMapCode, harness.mockReact);

    const vnode = SeatMap({});

    function findZoomButtons(node) {
      let zoomInBtn = null;
      let zoomOutBtn = null;
      let resetBtn = null;

      function recurse(n) {
        if (!n) return;
        if (n.props) {
          if (n.props['aria-label'] === 'Zoom In' || (n.props.className && n.props.className.includes('zoom-btn-in'))) {
            zoomInBtn = n;
          }
          if (n.props['aria-label'] === 'Zoom Out' || (n.props.className && n.props.className.includes('zoom-btn-out'))) {
            zoomOutBtn = n;
          }
          if (n.props['aria-label'] === 'Reset Zoom' || (n.props.className && n.props.className.includes('zoom-btn-reset'))) {
            resetBtn = n;
          }
        }
        if (n.props && n.props.children) {
          const ch = Array.isArray(n.props.children) ? n.props.children : [n.props.children];
          ch.forEach(recurse);
        }
      }

      recurse(node);
      return { zoomInBtn, zoomOutBtn, resetBtn };
    }

    const { zoomInBtn, zoomOutBtn, resetBtn } = findZoomButtons(vnode);
    assert.ok(zoomInBtn, 'Zoom In button must exist');
    assert.ok(zoomOutBtn, 'Zoom Out button must exist');
    assert.ok(resetBtn, 'Reset button must exist');

    // Test Zoom In increments by 0.1
    zoomInBtn.props.onClick();
    assert.strictEqual(harness.getState(0), 1.1, 'Zoom in should increase by 0.1');

    // Test Zoom In clamping at 1.4
    for (let i = 0; i < 10; i++) {
      zoomInBtn.props.onClick();
    }
    assert.strictEqual(harness.getState(0), 1.4, 'Zoom In must be clamped at max 1.4');

    // Test Reset sets to 1.0
    resetBtn.props.onClick();
    assert.strictEqual(harness.getState(0), 1.0, 'Reset Zoom must return to 1.0');

    // Test Zoom Out clamping at 0.7
    for (let i = 0; i < 10; i++) {
      zoomOutBtn.props.onClick();
    }
    assert.strictEqual(harness.getState(0), 0.7, 'Zoom Out must be clamped at min 0.7');
  });

  test('clicking available seat triggers onToggleSeat callback', async () => {
    const harness = createHarness([1.0]);
    const { SeatMap } = await loadComponent(cachedSeatMapCode, harness.mockReact);

    let toggledSeat = null;
    const vnode = SeatMap({
      onToggleSeat: (seat) => {
        toggledSeat = seat;
      }
    });

    function findFirstAvailableSeatButton(node) {
      if (!node) return null;
      if (node.props && node.props['data-status'] === 'available') {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findFirstAvailableSeatButton(c);
          if (res) return res;
        }
      }
      return null;
    }

    const availableBtn = findFirstAvailableSeatButton(vnode);
    assert.ok(availableBtn, 'Should find available seat button');
    availableBtn.props.onClick();
    assert.ok(toggledSeat, 'onToggleSeat should be called with seat');
    assert.strictEqual(toggledSeat.status, 'available');
  });

  test('clicking locked or sold seat does NOT select and triggers alert', async () => {
    const harness = createHarness([1.0]);
    const { SeatMap } = await loadComponent(cachedSeatMapCode, harness.mockReact);

    let alertMsg = null;
    let toggled = false;

    const vnode = SeatMap({
      onToggleSeat: () => {
        toggled = true;
      },
      onSeatAlert: (msg) => {
        alertMsg = msg;
      }
    });

    function findFirstSeatWithStatus(node, status) {
      if (!node) return null;
      if (node.props && node.props['data-status'] === status) {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findFirstSeatWithStatus(c, status);
          if (res) return res;
        }
      }
      return null;
    }

    const lockedBtn = findFirstSeatWithStatus(vnode, 'locked');
    assert.ok(lockedBtn, 'Should find a locked seat');
    assert.strictEqual(lockedBtn.props.disabled, true, 'Locked seat button must have disabled=true');
    lockedBtn.props.onClick();
    assert.strictEqual(toggled, false, 'Locked seat click must not toggle selection');
    assert.ok(alertMsg && alertMsg.includes('lock'), 'Locked seat click must trigger lock alert');

    alertMsg = null;
    const soldBtn = findFirstSeatWithStatus(vnode, 'sold');
    assert.ok(soldBtn, 'Should find a sold seat');
    assert.strictEqual(soldBtn.props.disabled, true, 'Sold seat button must have disabled=true');
    soldBtn.props.onClick();
    assert.strictEqual(toggled, false, 'Sold seat click must not toggle selection');
    assert.ok(alertMsg && alertMsg.includes('terjual'), 'Sold seat click must trigger sold alert');
  });
});

// -----------------------------------------------------------------------------
// Suite 6: OrderSummary Calculations & Fee Logic Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - OrderSummary Calculations & Fee Logic Verification', async () => {
  if (!cachedOrderSummaryCode) cachedOrderSummaryCode = await compileBundle(ORDER_SUMMARY_PATH);
  const { OrderSummary } = await loadComponent(cachedOrderSummaryCode);

  test('renders empty state placeholder when 0 seats selected', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummary, {
        selectedSeats: []
      })
    );
    assert.ok(
      html.includes('Pilih kursi yang tersedia pada denah untuk mulai memesan.'),
      'Must render verbatim empty state placeholder'
    );
    assert.ok(html.includes('kursi dipilih'), 'Must display kursi dipilih text');
  });

  test('primary CTA "Lanjut ke Pembayaran QRIS" is disabled when 0 seats selected', async () => {
    const harness = createHarness();
    const { OrderSummary: HarnessSummary } = await loadComponent(cachedOrderSummaryCode, harness.mockReact);

    const vnode = HarnessSummary({
      selectedSeats: []
    });

    function findCheckoutButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('checkout-btn')) {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findCheckoutButton(c);
          if (res) return res;
        }
      }
      return null;
    }

    const btn = findCheckoutButton(vnode);
    assert.ok(btn, 'Checkout button must exist');
    assert.strictEqual(btn.props.disabled, true, 'Checkout button must be disabled when 0 seats');
  });

  test('renders 5-minute lock countdown timer with animated progress bar', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummary, {
        selectedSeats: [],
        lockTimerSeconds: 243 // 04:03
      })
    );
    assert.ok(html.includes('04:03'), 'Must format seconds as MM:SS');
    assert.ok(html.includes('Sisa Waktu Lock Kursi'), 'Must include lock timer title');
    assert.ok(html.includes('timer-progress-bar'), 'Must include animated progress bar');
  });

  test('calculates subtotal, 10% tax, Rp 35k fee, and total correctly for 1 seat', () => {
    // 1 CAT 1 VIP seat @ Rp 3.500.000
    // subtotal = 3.500.000
    // tax = 350.000
    // fee = 35.000
    // total = 3.885.000
    const mockSeat = {
      id: 'CAT1-A-1',
      row: 'A',
      number: 1,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 3500000,
      status: 'selected'
    };

    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummary, {
        selectedSeats: [mockSeat]
      })
    );

    assert.ok(html.includes('C1-A-01'), 'Must display formatted seat code C1-A-01');
    assert.ok(html.includes('CAT 1 VIP'), 'Must display tier name');
    assert.ok(html.includes('Rp 3.500.000'), 'Must display subtotal Rp 3.500.000');
    assert.ok(html.includes('Rp 350.000'), 'Must display 10% tax Rp 350.000');
    assert.ok(html.includes('Rp 35.000'), 'Must display service fee Rp 35.000');
    assert.ok(html.includes('Rp 3.885.000'), 'Must display total Rp 3.885.000');
  });

  test('calculates subtotal, 10% tax, Rp 35k fee, and total correctly for multiple seats', () => {
    // 2 seats: CAT 1 (3.500.000) + CAT 4 (750.000) = 4.250.000
    // tax = Math.round(4.250.000 * 0.1) = 425.000
    // fee = 35.000
    // total = 4.710.000
    const seats = [
      {
        id: 'CAT1-A-1',
        row: 'A',
        number: 1,
        tier: 'cat1',
        tierName: 'CAT 1 VIP',
        price: 3500000,
        status: 'selected'
      },
      {
        id: 'CAT4-D-18',
        row: 'D',
        number: 18,
        tier: 'cat4',
        tierName: 'CAT 4 Tribun Atas',
        price: 750000,
        status: 'selected'
      }
    ];

    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummary, {
        selectedSeats: seats
      })
    );

    assert.ok(html.includes('C1-A-01'), 'Must include first seat code');
    assert.ok(html.includes('C4-D-18'), 'Must include second seat code');
    assert.ok(html.includes('Rp 4.250.000'), 'Subtotal must be 4.250.000');
    assert.ok(html.includes('Rp 425.000'), 'Tax must be 425.000');
    assert.ok(html.includes('Rp 35.000'), 'Service fee must be 35.000');
    assert.ok(html.includes('Rp 4.710.000'), 'Total must be 4.710.000');
  });

  test('clicking remove (X) button triggers onRemoveSeat with seat id', async () => {
    const harness = createHarness();
    const { OrderSummary: HarnessSummary } = await loadComponent(cachedOrderSummaryCode, harness.mockReact);

    let removedId = null;
    const seat = {
      id: 'CAT1-B-5',
      row: 'B',
      number: 5,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 3500000,
      status: 'selected'
    };

    const vnode = HarnessSummary({
      selectedSeats: [seat],
      onRemoveSeat: (id) => {
        removedId = id;
      }
    });

    function findRemoveButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('remove-seat-btn')) {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findRemoveButton(c);
          if (res) return res;
        }
      }
      return null;
    }

    const removeBtn = findRemoveButton(vnode);
    assert.ok(removeBtn, 'Remove button must exist');
    removeBtn.props.onClick();
    assert.strictEqual(removedId, 'CAT1-B-5', 'Removing seat must pass exact seat ID');
  });

  test('primary CTA "Lanjut ke Pembayaran QRIS" triggers onProceedToPayment when clicked', async () => {
    const harness = createHarness();
    const { OrderSummary: HarnessSummary } = await loadComponent(cachedOrderSummaryCode, harness.mockReact);

    let proceedsTriggered = false;
    const seat = {
      id: 'CAT1-A-1',
      row: 'A',
      number: 1,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 3500000,
      status: 'selected'
    };

    const vnode = HarnessSummary({
      selectedSeats: [seat],
      onProceedToPayment: () => {
        proceedsTriggered = true;
      }
    });

    function findCheckoutButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('checkout-btn')) {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findCheckoutButton(c);
          if (res) return res;
        }
      }
      return null;
    }

    const checkoutBtn = findCheckoutButton(vnode);
    assert.ok(checkoutBtn, 'Checkout button must exist');
    assert.strictEqual(checkoutBtn.props.disabled, false, 'Should be enabled when seat selected');
    checkoutBtn.props.onClick();
    assert.strictEqual(proceedsTriggered, true, 'Clicking checkout must trigger onProceedToPayment');
  });
});

// -----------------------------------------------------------------------------
// Suite 7: SeatMapScreen Integration Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - SeatMapScreen Integration Verification', async () => {
  if (!cachedSeatMapScreenCode) cachedSeatMapScreenCode = await compileBundle(SEAT_MAP_SCREEN_PATH);
  const { SeatMapScreen } = await loadComponent(cachedSeatMapScreenCode);

  test('SeatMapScreen renders top header with back button, attendee counter, and lock alert', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMapScreen));
    assert.ok(html.includes('Kembali ke Detail Event'), 'Must render Back button text');
    assert.ok(html.includes('8.420 antrean aktif'), 'Must render live attendee counter');
    assert.ok(html.includes('Kursi yang Anda klik akan di-lock selama 05:00 menit'), 'Must render lock warning');
  });

  test('SeatMapScreen coordinates both SeatMap (270 seats) and OrderSummary', () => {
    const html = ReactDOMServer.renderToString(React.createElement(SeatMapScreen));
    const seatMatches = html.match(/data-seat-id=/g);
    assert.ok(seatMatches, 'Must render seats inside screen');
    assert.strictEqual(seatMatches.length, 270, 'Must coordinate all 270 seats');
    assert.ok(html.includes('Ringkasan Pesanan'), 'Must include OrderSummary header');
    assert.ok(html.includes('Lanjut ke Pembayaran QRIS'), 'Must include primary checkout CTA');
  });

  test('Back button click calls onNavigate("detail")', async () => {
    const harness = createHarness();
    const { SeatMapScreen: HarnessScreen } = await loadComponent(cachedSeatMapScreenCode, harness.mockReact);

    let navigatedScreen = null;
    const vnode = HarnessScreen({
      onNavigate: (s) => {
        navigatedScreen = s;
      }
    });

    function findBackButton(node) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes('btn-back-to-detail')) {
        return node;
      }
      if (node.props && node.props.children) {
        const ch = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const c of ch) {
          const res = findBackButton(c);
          if (res) return res;
        }
      }
      return null;
    }

    const backBtn = findBackButton(vnode);
    assert.ok(backBtn, 'Should find back button');
    backBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'detail', 'Clicking Back must navigate to "detail"');
  });
});

// -----------------------------------------------------------------------------
// Suite 8: Context Integration Verification
// -----------------------------------------------------------------------------
describe('Milestone 4 - Context Integration Verification', async () => {
  if (!cachedNavCode) cachedNavCode = await compileBundle(NAV_CONTEXT_PATH);
  if (!cachedBookingCode) cachedBookingCode = await compileBundle(BOOKING_CONTEXT_PATH);
  if (!cachedEventDetailCode) cachedEventDetailCode = await compileBundle(EVENT_DETAIL_PATH);
  if (!cachedSeatMapScreenCode) cachedSeatMapScreenCode = await compileBundle(SEAT_MAP_SCREEN_PATH);

  const { NavigationProvider } = await loadComponent(cachedNavCode);
  const { BookingProvider } = await loadComponent(cachedBookingCode);
  const { EventDetailScreen } = await loadComponent(cachedEventDetailCode);
  const { SeatMapScreen } = await loadComponent(cachedSeatMapScreenCode);

  test('EventDetailScreen renders cleanly inside NavigationProvider', () => {
    const tree = React.createElement(
      NavigationProvider,
      null,
      React.createElement(EventDetailScreen)
    );
    const html = ReactDOMServer.renderToString(tree);
    assert.ok(html.includes('Coldplay: Music of the Spheres World Tour 2026'));
  });

  test('SeatMapScreen renders cleanly inside NavigationProvider + BookingProvider', () => {
    const tree = React.createElement(
      NavigationProvider,
      null,
      React.createElement(
        BookingProvider,
        null,
        React.createElement(SeatMapScreen)
      )
    );
    const html = ReactDOMServer.renderToString(tree);
    assert.ok(html.includes('8.420 antrean aktif'));
    assert.ok(html.includes('Ringkasan Pesanan'));
  });
});
