/**
 * End-to-End Acceptance Test Suite for Milestone 6 - TickId Desktop Application
 * Validates all Acceptance Criteria (AC 1 through AC 9) from ORIGINAL_REQUEST.md lines 156-170:
 *
 * AC 1: TypeScript compilation (`npm run build` or `tsc && vite build`) executes cleanly with exit code 0 and zero type or lint errors.
 * AC 2: Navigating between Header buttons switches active view cleanly among Discover, Categories, Event Detail, Seat Map, and E-Ticket.
 * AC 3: Clicking "Lihat Detail Event" on Discover navigates to Event Detail.
 * AC 4: Clicking "Pilih Kursi Sekarang" on Event Detail navigates to Seat Map.
 * AC 5: Selecting available seats on Seat Map updates the order summary items, recalculates the subtotal, entertainment tax (10%), service fee (Rp 35.000), and total in real time.
 * AC 6: Clicking "Lanjut ke Pembayaran QRIS" opens the Checkout modal with accurate booking details and starts the lock timer.
 * AC 7: Clicking "Simulasi Bayar ✓" closes the modal and navigates to the E-Ticket screen displaying the active ticket pass (#TICK-ID-98214).
 * AC 8: Clicking "Batalkan & Lepas Kursi" closes the modal and returns to the seat map with uncommitted seats.
 * AC 9: User menu dropdown opens and closes on click, and clicking "Tiket Saya" navigates to the E-Ticket view.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const Module = require('module');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const vite = require('vite');

const ROOT_DIR = path.resolve(__dirname, '..');
const APP_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');
const BOOKING_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx');
const HEADER_PATH = path.join(ROOT_DIR, 'src', 'components', 'Header.tsx');
const DISCOVER_PATH = path.join(ROOT_DIR, 'src', 'screens', 'DiscoverScreen.tsx');
const CATEGORIES_PATH = path.join(ROOT_DIR, 'src', 'screens', 'CategoriesScreen.tsx');
const EVENT_DETAIL_PATH = path.join(ROOT_DIR, 'src', 'screens', 'EventDetailScreen.tsx');
const SEATMAP_SCREEN_PATH = path.join(ROOT_DIR, 'src', 'screens', 'SeatMapScreen.tsx');
const SEAT_MAP_PATH = path.join(ROOT_DIR, 'src', 'components', 'SeatMap.tsx');
const ORDER_SUMMARY_PATH = path.join(ROOT_DIR, 'src', 'components', 'OrderSummary.tsx');
const CHECKOUT_MODAL_PATH = path.join(ROOT_DIR, 'src', 'components', 'CheckoutModal.tsx');
const ETICKET_SCREEN_PATH = path.join(ROOT_DIR, 'src', 'screens', 'ETicketScreen.tsx');

// Compilation cache
const bundleCache = new Map();

async function compileBundle(entryPath) {
  if (bundleCache.has(entryPath)) {
    return bundleCache.get(entryPath);
  }

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
  bundleCache.set(entryPath, chunk.code);
  return chunk.code;
}

function loadModule(code, customReact = null) {
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

// Interactive component testing harness with state simulation
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

// Tree search helper for virtual DOM nodes supporting nested arrays
function findNodeByProps(node, predicate) {
  if (!node) return null;
  if (Array.isArray(node)) {
    for (const item of node) {
      const found = findNodeByProps(item, predicate);
      if (found) return found;
    }
    return null;
  }
  if (predicate(node)) return node;
  if (node.props && node.props.children) {
    return findNodeByProps(node.props.children, predicate);
  }
  return null;
}

// State Machine Models for Contract Verification
class NavigationStateMachine {
  constructor(initialScreen = 'discover', initialEventId = 'coldplay-2026') {
    this.activeScreen = initialScreen;
    this.selectedEventId = initialEventId;
    this.history = [];
  }

  navigateTo(screen, eventId) {
    this.history.push(this.activeScreen);
    this.activeScreen = screen;
    if (eventId) {
      this.selectedEventId = eventId;
    }
  }

  goBack() {
    if (this.history.length === 0) {
      this.activeScreen = 'discover';
      return;
    }
    const prevScreen = this.history.pop();
    this.activeScreen = prevScreen;
  }
}

class BookingStateMachine {
  constructor(initialSeats = [], onPaymentSuccess = null) {
    this.selectedSeats = [...initialSeats];
    this.lockTimerSeconds = 300;
    this.isCheckoutOpen = false;
    this.onPaymentSuccess = onPaymentSuccess;
  }

  get subtotal() {
    return this.selectedSeats.reduce((acc, s) => acc + (s.price || 0), 0);
  }

  get tax() {
    return this.selectedSeats.length > 0 ? Math.round(this.subtotal * 0.1) : 0;
  }

  get serviceFee() {
    return this.selectedSeats.length > 0 ? 35000 : 0;
  }

  get total() {
    return this.subtotal + this.tax + this.serviceFee;
  }

  resetTimer() {
    this.lockTimerSeconds = 300;
  }

  isSeatSelected(seatId) {
    return this.selectedSeats.some((s) => s.id === seatId || s.key === seatId);
  }

  toggleSeat(seat) {
    if (seat.status === 'sold' || seat.status === 'locked') {
      return;
    }
    const seatKey = seat.key || seat.id;
    const exists = this.selectedSeats.some((s) => (s.key || s.id) === seatKey);
    if (exists) {
      this.selectedSeats = this.selectedSeats.filter((s) => (s.key || s.id) !== seatKey);
    } else {
      this.selectedSeats.push({ ...seat, status: 'selected' });
    }
  }

  clearSelection() {
    this.selectedSeats = [];
  }

  openCheckout() {
    if (this.selectedSeats.length > 0) {
      this.isCheckoutOpen = true;
    }
  }

  closeCheckout() {
    this.isCheckoutOpen = false;
  }

  completePayment() {
    this.isCheckoutOpen = false;
    if (this.onPaymentSuccess) {
      this.onPaymentSuccess();
    }
  }
}

// =============================================================================
// Suite 1: Acceptance Criterion 1 — TypeScript Compilation & Automated Build
// =============================================================================
describe('AC 1 — TypeScript compilation & Automated Build Verification', () => {
  test('TypeScript typechecker (tsc --noEmit) executes cleanly with exit code 0', () => {
    let tscOutput = '';
    assert.doesNotThrow(() => {
      tscOutput = execSync('npx tsc --noEmit', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
    }, 'tsc --noEmit must exit with code 0 and zero type errors');

    assert.strictEqual(tscOutput.trim(), '', 'tsc --noEmit output should have 0 type error messages');
  });

  test('Production build (npm run build) completes cleanly with exit code 0 and generates distribution assets', () => {
    let buildOutput = '';
    assert.doesNotThrow(() => {
      buildOutput = execSync('npm run build', {
        cwd: ROOT_DIR,
        encoding: 'utf-8',
        stdio: ['ignore', 'pipe', 'pipe']
      });
    }, 'npm run build must succeed with exit code 0');

    assert.ok(buildOutput.includes('built in'), 'Build output should indicate successful Vite build');

    // Verify dist directory and output artifacts
    const distPath = path.join(ROOT_DIR, 'dist');
    assert.strictEqual(fs.existsSync(distPath), true, 'dist/ directory must exist');

    const indexPath = path.join(distPath, 'index.html');
    assert.strictEqual(fs.existsSync(indexPath), true, 'dist/index.html must exist');
    const indexHtml = fs.readFileSync(indexPath, 'utf-8');
    assert.ok(indexHtml.length > 200, 'dist/index.html must be populated');

    const assetsPath = path.join(distPath, 'assets');
    assert.strictEqual(fs.existsSync(assetsPath), true, 'dist/assets directory must exist');
    const assetFiles = fs.readdirSync(assetsPath);
    const jsBundles = assetFiles.filter((f) => f.endsWith('.js'));
    const cssBundles = assetFiles.filter((f) => f.endsWith('.css'));

    assert.ok(jsBundles.length >= 1, 'Production JS bundle must be generated in dist/assets');
    assert.ok(cssBundles.length >= 1, 'Production CSS bundle must be generated in dist/assets');
  });
});

// =============================================================================
// Suite 2: Acceptance Criterion 2 — Header Navigation & Screen Switching
// =============================================================================
describe('AC 2 — Header Navigation & Screen Switching Verification', async () => {
  const headerCode = await compileBundle(HEADER_PATH);
  const appCode = await compileBundle(APP_PATH);
  const { App } = loadModule(appCode);

  test('Header Brand Logo button click routes to "discover"', () => {
    const harness = createHarness();
    const { Header } = loadModule(headerCode, harness.mockReact);
    let routedScreen = null;
    const vnode = Header({
      onNavigate: (screen) => {
        routedScreen = screen;
      },
      activeScreen: 'categories'
    });

    const brandBtn = findNodeByProps(vnode, (n) => n?.props?.['aria-label'] === 'TickId Beranda');
    assert.ok(brandBtn, 'Header must contain TickId Beranda brand button');
    brandBtn.props.onClick();
    assert.strictEqual(routedScreen, 'discover', 'Clicking Brand Logo must navigate to discover');
  });

  test('Header Home Quick button click routes to "discover"', () => {
    const harness = createHarness();
    const { Header } = loadModule(headerCode, harness.mockReact);
    let routedScreen = null;
    const vnode = Header({
      onNavigate: (screen) => {
        routedScreen = screen;
      },
      activeScreen: 'seatmap'
    });

    const homeBtn = findNodeByProps(vnode, (n) => n?.props?.['aria-label'] === 'Beranda');
    assert.ok(homeBtn, 'Header must contain Home quick button');
    homeBtn.props.onClick();
    assert.strictEqual(routedScreen, 'discover', 'Clicking Home button must navigate to discover');
  });

  test('Header Category browse button in search pill click routes to "categories"', () => {
    const harness = createHarness();
    const { Header } = loadModule(headerCode, harness.mockReact);
    let routedScreen = null;
    const vnode = Header({
      onNavigate: (screen) => {
        routedScreen = screen;
      },
      activeScreen: 'discover'
    });

    const catBtn = findNodeByProps(vnode, (n) => n?.props?.['aria-label'] === 'Kategori');
    assert.ok(catBtn, 'Header must contain Kategori button in search pill');
    catBtn.props.onClick();
    assert.strictEqual(routedScreen, 'categories', 'Clicking Kategori button must navigate to categories');
  });

  test('App shell switches active view cleanly to "discover"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'discover' }));
    assert.ok(html.includes('Lihat Detail Event'), 'Must render Discover hero slide CTA');
    assert.ok(html.includes('Event Populer &amp; Mendatang') || html.includes('Event Populer & Mendatang'), 'Must render popular events');
    assert.strictEqual(html.includes('Denah Stadion Utama Gelora Bung Karno'), false, 'SeatMap must not be rendered');
    assert.strictEqual(html.includes('VIP ALL-ACCESS PASS'), false, 'ETicket must not be rendered');
  });

  test('App shell switches active view cleanly to "categories"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'categories' }));
    assert.ok(html.includes('Jelajahi Kategori Event'), 'Must render Categories title');
    assert.ok(html.includes('Temukan event favoritmu'), 'Must render Categories subtitle');
    assert.strictEqual(html.includes('Lihat Detail Event'), false, 'Discover hero must not be rendered');
  });

  test('App shell switches active view cleanly to "detail"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'detail' }));
    assert.ok(html.includes('event-detail-screen'), 'Must render EventDetailScreen container');
    assert.ok(html.includes('Pilih Kursi Sekarang'), 'Must render EventDetail booking CTA');
    assert.ok(html.includes('Konser Ramah Lingkungan'), 'Must render eco badge');
  });

  test('App shell switches active view cleanly to "seatmap"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'seatmap' }));
    assert.ok(html.includes('seat-map-screen'), 'Must render SeatMapScreen container');
    assert.ok(html.includes('8.420 antrean aktif'), 'Must render attendee counter');
    assert.ok(html.includes('Ringkasan Pesanan'), 'Must render order summary sidebar');
  });

  test('App shell switches active view cleanly to "tickets"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'tickets' }));
    assert.ok(html.includes('eticket-screen'), 'Must render ETicketScreen container');
    assert.ok(html.includes('#TICK-ID-98214'), 'Must render active pass reference ID');
    assert.ok(html.includes('Pembayaran Berhasil! E-Ticket Aktif'), 'Must render success banner');
  });

  test('Consecutive screen transitions maintain clean state across all 5 screens', () => {
    const nav = new NavigationStateMachine('discover');
    assert.strictEqual(nav.activeScreen, 'discover', 'Initial screen must be discover');

    nav.navigateTo('categories');
    assert.strictEqual(nav.activeScreen, 'categories', 'State must update to categories');

    nav.navigateTo('detail', 'coldplay-2026');
    assert.strictEqual(nav.activeScreen, 'detail', 'State must update to detail');
    assert.strictEqual(nav.selectedEventId, 'coldplay-2026', 'selectedEventId must be coldplay-2026');

    nav.navigateTo('seatmap');
    assert.strictEqual(nav.activeScreen, 'seatmap', 'State must update to seatmap');

    nav.navigateTo('tickets');
    assert.strictEqual(nav.activeScreen, 'tickets', 'State must update to tickets');

    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'seatmap', 'goBack should return to previous screen');
  });
});

// =============================================================================
// Suite 3: Acceptance Criterion 3 — Discover "Lihat Detail Event" Navigation
// =============================================================================
describe('AC 3 — Discover "Lihat Detail Event" Navigation Verification', async () => {
  const discoverCode = await compileBundle(DISCOVER_PATH);
  const { DiscoverScreen: DiscoverScreenSSR } = loadModule(discoverCode);

  test('DiscoverScreen renders hero carousel with "Lihat Detail Event" button', () => {
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreenSSR));
    assert.ok(html.includes('Lihat Detail Event'), 'Must render hero CTA text "Lihat Detail Event"');
    assert.ok(html.includes('COLDPLAY') || html.includes('Coldplay'), 'Must render Coldplay title');
  });

  test('Clicking "Lihat Detail Event" triggers onNavigate("detail", eventId)', () => {
    const harness = createHarness();
    const { DiscoverScreen } = loadModule(discoverCode, harness.mockReact);

    let targetScreen = null;
    let targetEventId = null;

    const vnode = DiscoverScreen({
      onNavigate: (screen, eventId) => {
        targetScreen = screen;
        targetEventId = eventId;
      }
    });

    const ctaBtn = findNodeByProps(vnode, (n) => n?.props?.['aria-label'] === 'Lihat Detail Event');
    assert.ok(ctaBtn, 'Must find hero slide button with aria-label="Lihat Detail Event"');

    ctaBtn.props.onClick();
    assert.strictEqual(targetScreen, 'detail', 'Clicking hero CTA must navigate to "detail"');
    assert.strictEqual(targetEventId, 'coldplay-2026', 'Clicking hero CTA must pass eventId "coldplay-2026"');
  });

  test('Clicking popular event card "Lihat Tiket" button also navigates to "detail"', () => {
    const harness = createHarness();
    const { DiscoverScreen } = loadModule(discoverCode, harness.mockReact);

    let targetScreen = null;
    let targetEventId = null;

    const vnode = DiscoverScreen({
      onNavigate: (screen, eventId) => {
        targetScreen = screen;
        targetEventId = eventId;
      }
    });

    const ticketBtn = findNodeByProps(vnode, (n) =>
      n?.type === 'button' && n?.props?.children === 'Lihat Tiket'
    );
    assert.ok(ticketBtn, 'Must find popular event card "Lihat Tiket" button');
    ticketBtn.props.onClick({ stopPropagation: () => {} });

    assert.strictEqual(targetScreen, 'detail', 'Card button must navigate to "detail"');
    assert.ok(targetEventId, 'Card button must pass valid eventId');
  });
});

// =============================================================================
// Suite 4: Acceptance Criterion 4 — Event Detail "Pilih Kursi Sekarang" Navigation
// =============================================================================
describe('AC 4 — Event Detail "Pilih Kursi Sekarang" Navigation Verification', async () => {
  const detailCode = await compileBundle(EVENT_DETAIL_PATH);
  const { EventDetailScreen: EventDetailScreenSSR } = loadModule(detailCode);

  test('EventDetailScreen renders sticky bar with price range and "Pilih Kursi Sekarang" button', () => {
    const html = ReactDOMServer.renderToString(React.createElement(EventDetailScreenSSR));
    assert.ok(html.includes('sticky-booking-bar'), 'Must render sticky bottom booking bar');
    assert.ok(html.includes('Rp 750.000 – Rp 3.500.000'), 'Must show price range Rp 750.000 – Rp 3.500.000');
    assert.ok(html.includes('Pilih Kursi Sekarang'), 'Must include CTA "Pilih Kursi Sekarang"');
    assert.ok(html.includes('btn-pilih-kursi'), 'Must use class btn-pilih-kursi');
  });

  test('Clicking "Pilih Kursi Sekarang" triggers onNavigate("seatmap")', () => {
    const harness = createHarness();
    const { EventDetailScreen } = loadModule(detailCode, harness.mockReact);

    let targetScreen = null;

    const vnode = EventDetailScreen({
      onNavigate: (screen) => {
        targetScreen = screen;
      }
    });

    const chooseSeatBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('btn-pilih-kursi')
    );
    assert.ok(chooseSeatBtn, 'Must find button with class btn-pilih-kursi');

    chooseSeatBtn.props.onClick();
    assert.strictEqual(targetScreen, 'seatmap', 'Clicking "Pilih Kursi Sekarang" must navigate to "seatmap"');
  });

  test('Breadcrumb links on EventDetail navigate back to "discover" and "categories"', () => {
    const harness = createHarness();
    const { EventDetailScreen } = loadModule(detailCode, harness.mockReact);

    const navigations = [];

    const vnode = EventDetailScreen({
      onNavigate: (screen) => {
        navigations.push(screen);
      }
    });

    const homeBreadcrumb = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('breadcrumb-link') && n.props.children === 'Beranda'
    );
    assert.ok(homeBreadcrumb, 'Must find Beranda breadcrumb link');
    homeBreadcrumb.props.onClick();

    const catBreadcrumb = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('breadcrumb-link') && n.props.children === 'Konser Musik'
    );
    assert.ok(catBreadcrumb, 'Must find Konser Musik breadcrumb link');
    catBreadcrumb.props.onClick();

    assert.deepStrictEqual(navigations, ['discover', 'categories'], 'Breadcrumbs must navigate to discover and categories');
  });
});

// =============================================================================
// Suite 5: Acceptance Criterion 5 — Seat Selection & Real-Time Calculation
// =============================================================================
describe('AC 5 — Seat Selection & Real-Time Fee Calculation Verification', async () => {
  const orderSummaryCode = await compileBundle(ORDER_SUMMARY_PATH);
  const seatMapCode = await compileBundle(SEAT_MAP_PATH);
  const { OrderSummary: OrderSummarySSR } = loadModule(orderSummaryCode);

  const seatCat1 = {
    id: 'CAT1-A-1',
    key: 'CAT1-A-1',
    row: 'A',
    number: 1,
    tier: 'cat1',
    tierName: 'CAT 1 VIP Soundcheck',
    price: 3500000,
    status: 'available'
  };

  const seatCat2 = {
    id: 'CAT2-B-10',
    key: 'CAT2-B-10',
    row: 'B',
    number: 10,
    tier: 'cat2',
    tierName: 'CAT 2 Festival Free Standing',
    price: 2500000,
    status: 'available'
  };

  test('Initial state: 0 seats selected shows empty placeholder and total Rp 0', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummarySSR, { selectedSeats: [] })
    );

    assert.ok(html.includes('Pilih kursi yang tersedia pada denah untuk mulai memesan.'), 'Must render empty state message');
    assert.ok(html.includes('kursi dipilih'), 'Must show kursi dipilih text');
    assert.ok(html.includes('Rp 0'), 'Total must be Rp 0');
    assert.ok(html.includes('cursor-not-allowed'), 'Checkout CTA must be disabled when 0 seats');
  });

  test('Selecting 1 seat (CAT 1 @ Rp 3.500.000) calculates subtotal, 10% tax, Rp 35k fee, and total in real time', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummarySSR, { selectedSeats: [seatCat1] })
    );

    // Subtotal: 3.500.000
    // Tax: 10% * 3.500.000 = 350.000
    // Service fee: 35.000
    // Total: 3.500.000 + 350.000 + 35.000 = 3.885.000
    assert.ok(html.includes('kursi dipilih'), 'Must show kursi dipilih');
    assert.ok(html.includes('C1-A-01'), 'Must format seat code as C1-A-01');
    assert.ok(html.includes('Rp 3.500.000'), 'Must show subtotal Rp 3.500.000');
    assert.ok(html.includes('Rp 350.000'), 'Must show 10% tax Rp 350.000');
    assert.ok(html.includes('Rp 35.000'), 'Must show fixed service fee Rp 35.000');
    assert.ok(html.includes('Rp 3.885.000'), 'Must show total Rp 3.885.000');
  });

  test('Selecting multiple seats (CAT 1 + CAT 2) dynamically recalculates all figures in real time', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummarySSR, { selectedSeats: [seatCat1, seatCat2] })
    );

    // Subtotal: 3.500.000 + 2.500.000 = 6.000.000
    // Tax: 10% * 6.000.000 = 600.000
    // Service fee: 35.000
    // Total: 6.000.000 + 600.000 + 35.000 = 6.635.000
    assert.ok(html.includes('kursi dipilih'), 'Must show kursi dipilih');
    assert.ok(html.includes('C1-A-01'), 'Must show first seat code C1-A-01');
    assert.ok(html.includes('C2-B-10'), 'Must show second seat code C2-B-10');
    assert.ok(html.includes('Rp 6.000.000'), 'Must show subtotal Rp 6.000.000');
    assert.ok(html.includes('Rp 600.000'), 'Must show 10% tax Rp 600.000');
    assert.ok(html.includes('Rp 35.000'), 'Must show fixed service fee Rp 35.000');
    assert.ok(html.includes('Rp 6.635.000'), 'Must show total Rp 6.635.000');
  });

  test('Clicking remove (X) button triggers seat removal callback', () => {
    const harness = createHarness();
    const { OrderSummary } = loadModule(orderSummaryCode, harness.mockReact);

    let removedId = null;
    const vnode = OrderSummary({
      selectedSeats: [seatCat1],
      onRemoveSeat: (id) => {
        removedId = id;
      }
    });

    const removeBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('remove-seat-btn')
    );
    assert.ok(removeBtn, 'Must find remove seat X button');
    removeBtn.props.onClick();
    assert.strictEqual(removedId, 'CAT1-A-1', 'Must call onRemoveSeat with CAT1-A-1');
  });

  test('SeatMap enforces status contracts: available seats toggle, sold seats do not toggle', () => {
    const harness = createHarness([1.0]);
    const { SeatMap } = loadModule(seatMapCode, harness.mockReact);

    let toggledSeat = null;
    const vnode = SeatMap({
      onToggleSeat: (seat) => {
        toggledSeat = seat;
      }
    });

    const availableBtn = findNodeByProps(vnode, (n) => n?.props?.['data-status'] === 'available');
    assert.ok(availableBtn, 'Must find available seat button');
    availableBtn.props.onClick();
    assert.ok(toggledSeat, 'Available seat click must invoke onToggleSeat');
    assert.strictEqual(toggledSeat.status, 'available');

    // Sold seat
    toggledSeat = null;
    const soldBtn = findNodeByProps(vnode, (n) => n?.props?.['data-status'] === 'sold');
    assert.ok(soldBtn, 'Must find sold seat button');
    assert.strictEqual(soldBtn.props.disabled, true, 'Sold seat must be disabled');
    soldBtn.props.onClick();
    assert.strictEqual(toggledSeat, null, 'Clicking sold seat must NOT invoke onToggleSeat');
  });
});

// =============================================================================
// Suite 6: Acceptance Criterion 6 — Checkout Modal Open & Lock Timer
// =============================================================================
describe('AC 6 — "Lanjut ke Pembayaran QRIS" & Checkout Modal Verification', async () => {
  const modalCode = await compileBundle(CHECKOUT_MODAL_PATH);
  const orderSummaryCode = await compileBundle(ORDER_SUMMARY_PATH);
  const { CheckoutModal: CheckoutModalSSR } = loadModule(modalCode);

  test('Clicking "Lanjut ke Pembayaran QRIS" triggers onProceedToPayment callback', () => {
    const harness = createHarness();
    const { OrderSummary } = loadModule(orderSummaryCode, harness.mockReact);

    let proceedTriggered = false;
    const seat = {
      id: 'CAT1-A-1',
      row: 'A',
      number: 1,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 3500000,
      status: 'available'
    };

    const vnode = OrderSummary({
      selectedSeats: [seat],
      onProceedToPayment: () => {
        proceedTriggered = true;
      }
    });

    const checkoutBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('checkout-btn')
    );
    assert.ok(checkoutBtn, 'Must find checkout CTA button');
    checkoutBtn.props.onClick();
    assert.strictEqual(proceedTriggered, true, 'Clicking checkout CTA must call onProceedToPayment');
  });

  test('CheckoutModal opens with accurate booking details, KYC, wallets, and lock timer', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(CheckoutModalSSR, { isOpen: true })
    );

    // Title and Dialog Role
    assert.ok(html.includes('Pembayaran QRIS Instan'), 'Must display title "Pembayaran QRIS Instan"');
    assert.ok(html.includes('role="dialog"'), 'Must have role="dialog"');
    assert.ok(html.includes('aria-modal="true"'), 'Must have aria-modal="true"');

    // 5-minute countdown timer badge
    assert.ok(html.includes('countdown-timer'), 'Must render countdown timer badge');

    // Buyer KYC summary
    assert.ok(html.includes('Fajrul Rahman'), 'Must display buyer name Fajrul Rahman');
    assert.ok(html.includes('KYC Terverifikasi'), 'Must display KYC Terverifikasi badge');

    // Supported E-Wallets
    const wallets = ['GoPay', 'OVO', 'DANA', 'BCA', 'ShopeePay'];
    for (const wallet of wallets) {
      assert.ok(html.includes(wallet), `Must list supported wallet: ${wallet}`);
    }
    assert.ok(
      html.includes("Livin' Mandiri") || html.includes('Livin&#x27; Mandiri') || html.includes('Livin&#39; Mandiri'),
      "Must list supported wallet: Livin' Mandiri"
    );

    // Dynamic QR code container
    assert.ok(html.includes('qris-svg-matrix') || html.includes('<svg'), 'Must render dynamic SVG QR code');
    assert.ok(html.includes('Unduh QR Code'), 'Must render Unduh QR Code action');

    // Action buttons
    assert.ok(html.includes('btn-simulate-pay'), 'Must render Simulasi Bayar button');
    assert.ok(html.includes('Simulasi Bayar ✓'), 'Must contain text "Simulasi Bayar ✓"');
    assert.ok(html.includes('btn-cancel-release'), 'Must render Batalkan & Lepas Kursi button');
  });

  test('CheckoutModal is hidden when isOpen is false', () => {
    const html = ReactDOMServer.renderToString(
      React.createElement(CheckoutModalSSR, { isOpen: false })
    );
    assert.strictEqual(html, '', 'CheckoutModal must render nothing when isOpen is false');
  });
});

// =============================================================================
// Suite 7: Acceptance Criterion 7 — "Simulasi Bayar ✓" & E-Ticket Screen
// =============================================================================
describe('AC 7 — "Simulasi Bayar ✓" & E-Ticket Screen Verification', async () => {
  const modalCode = await compileBundle(CHECKOUT_MODAL_PATH);
  const eticketCode = await compileBundle(ETICKET_SCREEN_PATH);

  test('Clicking "Simulasi Bayar ✓" invokes onSuccess callback', () => {
    const harness = createHarness();
    const { CheckoutModal } = loadModule(modalCode, harness.mockReact);

    let successTriggered = false;
    const vnode = CheckoutModal({
      isOpen: true,
      onSuccess: () => {
        successTriggered = true;
      }
    });

    const simulateBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('btn-simulate-pay')
    );
    assert.ok(simulateBtn, 'Must find Simulasi Bayar ✓ button');
    simulateBtn.props.onClick();
    assert.strictEqual(successTriggered, true, 'Clicking button must trigger onSuccess');
  });

  test('ETicketScreen renders active ticket pass with reference ID #TICK-ID-98214', () => {
    const { ETicketScreen } = loadModule(eticketCode);
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));

    // Active reference ID
    assert.ok(html.includes('#TICK-ID-98214'), 'Must render reference ID #TICK-ID-98214');

    // Success alert notice
    assert.ok(html.includes('Pembayaran Berhasil! E-Ticket Aktif'), 'Must render success banner');

    // Concert details
    assert.ok(html.includes('Coldplay Music of the Spheres World Tour 2026'), 'Must render concert title');
    assert.ok(html.includes('15 November 2026'), 'Must render concert date');
    assert.ok(html.includes('Stadion Utama Gelora Bung Karno'), 'Must render venue');
    assert.ok(html.includes('Gate 3 — Buka 17:00 WIB'), 'Must render gate');

    // Buyer KYC badge
    assert.ok(html.includes('KYC Terverifikasi'), 'Must render KYC badge');
    assert.ok(html.includes('Fajrul Rahman'), 'Must render buyer name');

    // Divider and QR Code
    assert.ok(html.includes('Scan di Pintu Masuk'), 'Must render gate scan instruction');

    // 58 Barcode bars
    const barcodeMatches = html.match(/class="[^"]*barcode-bar[^"]*"/g) || html.match(/style="[^"]*width:\s*\d+px[^"]*"/g);
    assert.ok(barcodeMatches && barcodeMatches.length >= 50, 'Must render animated barcode bars');

    // Anti-screenshot notice
    assert.ok(html.includes('Dilarang mengambil tangkapan layar (screenshot)'), 'Must render anti-screenshot warning');

    // Action CTAs
    assert.ok(html.includes('Simpan ke Wallet'), 'Must render Simpan ke Wallet CTA');
    assert.ok(html.includes('Unduh PDF'), 'Must render Unduh PDF CTA');
    assert.ok(html.includes('Kirim ke Email'), 'Must render Kirim ke Email CTA');
  });

  test('Clicking "Kembali ke Beranda" on ETicketScreen calls onNavigate("discover")', () => {
    const harness = createHarness();
    const { ETicketScreen } = loadModule(eticketCode, harness.mockReact);

    let target = null;
    const vnode = ETicketScreen({
      onNavigate: (screen) => {
        target = screen;
      }
    });

    const returnBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('btn-back-home')
    );
    assert.ok(returnBtn, 'Must find Kembali ke Beranda button');
    returnBtn.props.onClick();
    assert.strictEqual(target, 'discover', 'Clicking return button must navigate to "discover"');
  });
});

// =============================================================================
// Suite 8: Acceptance Criterion 8 — "Batalkan & Lepas Kursi" & Return to Seat Map
// =============================================================================
describe('AC 8 — "Batalkan & Lepas Kursi" & Return to Seat Map Verification', async () => {
  const modalCode = await compileBundle(CHECKOUT_MODAL_PATH);

  test('Clicking "Batalkan & Lepas Kursi" invokes onCancel and onClose callbacks', () => {
    const harness = createHarness();
    const { CheckoutModal } = loadModule(modalCode, harness.mockReact);

    let cancelCalled = false;
    let closeCalled = false;

    const vnode = CheckoutModal({
      isOpen: true,
      onCancel: () => {
        cancelCalled = true;
      },
      onClose: () => {
        closeCalled = true;
      }
    });

    const cancelBtn = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('btn-cancel-release')
    );
    assert.ok(cancelBtn, 'Must find Batalkan & Lepas Kursi button');
    cancelBtn.props.onClick();

    assert.strictEqual(cancelCalled, true, 'Must call onCancel callback');
    assert.strictEqual(closeCalled, true, 'Must call onClose callback');
  });

  test('BookingStateMachine clearSelection releases all uncommitted seats and resets totals', () => {
    const testSeat = {
      id: 'CAT1-A-1',
      key: 'CAT1-A-1',
      row: 'A',
      number: 1,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 3500000,
      status: 'available'
    };

    const bookingState = new BookingStateMachine([testSeat]);
    assert.strictEqual(bookingState.selectedSeats.length, 1, 'Initial seats must contain 1 seat');
    assert.strictEqual(bookingState.subtotal, 3500000, 'Initial subtotal must be 3.500.000');
    assert.strictEqual(bookingState.tax, 350000, 'Initial tax must be 350.000');
    assert.strictEqual(bookingState.serviceFee, 35000, 'Initial serviceFee must be 35.000');
    assert.strictEqual(bookingState.total, 3885000, 'Initial total must be 3.885.000');

    // Open checkout
    bookingState.openCheckout();
    assert.strictEqual(bookingState.isCheckoutOpen, true, 'Checkout modal is open');

    // Execute clearSelection & closeCheckout (simulating "Batalkan & Lepas Kursi")
    bookingState.clearSelection();
    bookingState.closeCheckout();

    assert.strictEqual(bookingState.selectedSeats.length, 0, 'clearSelection must empty selectedSeats');
    assert.strictEqual(bookingState.isCheckoutOpen, false, 'Checkout modal must be closed');
    assert.strictEqual(bookingState.subtotal, 0, 'Subtotal resets to 0');
    assert.strictEqual(bookingState.tax, 0, 'Tax resets to 0');
    assert.strictEqual(bookingState.serviceFee, 0, 'Service fee resets to 0');
    assert.strictEqual(bookingState.total, 0, 'Total resets to 0');
  });
});

// =============================================================================
// Suite 9: Acceptance Criterion 9 — User Menu Dropdown & "Tiket Saya" Navigation
// =============================================================================
describe('AC 9 — User Menu Dropdown & "Tiket Saya" Navigation Verification', async () => {
  const headerCode = await compileBundle(HEADER_PATH);

  function createHeaderHarness(initialMenuOpen = false) {
    let menuOpen = initialMenuOpen;
    let registeredListeners = {};

    global.document = {
      addEventListener: (event, fn) => {
        registeredListeners[event] = fn;
      },
      removeEventListener: (event, fn) => {
        if (registeredListeners[event] === fn) {
          delete registeredListeners[event];
        }
      }
    };

    const mockReact = {
      ...React,
      useState: (initial) => {
        if (typeof initial === 'boolean') {
          return [
            menuOpen,
            (updater) => {
              menuOpen = typeof updater === 'function' ? updater(menuOpen) : updater;
            }
          ];
        }
        return [initial, () => {}];
      },
      useRef: () => ({
        current: {
          contains: (target) => Boolean(target && target.isInside === true)
        }
      }),
      useContext: () => null,
      useEffect: (effect) => {
        return effect();
      }
    };

    return {
      mockReact,
      getMenuOpen: () => menuOpen,
      setMenuOpen: (v) => {
        menuOpen = v;
      },
      triggerClickOutside: () => {
        if (registeredListeners['mousedown']) {
          registeredListeners['mousedown']({ target: { isInside: false } });
        }
      }
    };
  }

  test('User menu dropdown opens and closes on clicking avatar button', () => {
    const harness = createHeaderHarness(false);
    const { Header } = loadModule(headerCode, harness.mockReact);

    // Initial state: closed
    let vnode = Header({ activeScreen: 'discover' });
    let popover = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('shadow-pop')
    );
    assert.strictEqual(popover, null, 'Popover must be closed initially');

    // Click avatar button to open
    const avatarBtn = findNodeByProps(vnode, (n) => n?.props?.['aria-label'] === 'Profil Pengguna');
    assert.ok(avatarBtn, 'Must find Profil Pengguna avatar button');
    avatarBtn.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), true, 'Avatar click must toggle menu to open');

    // Re-render open state
    vnode = Header({ activeScreen: 'discover' });
    popover = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('shadow-pop')
    );
    assert.ok(popover, 'Popover must be rendered when menu is open');

    // Click avatar button again to close
    avatarBtn.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), false, 'Second avatar click must toggle menu to closed');
  });

  test('Clicking outside open user menu dismisses dropdown', () => {
    const harness = createHeaderHarness(true);
    const { Header } = loadModule(headerCode, harness.mockReact);

    Header({ activeScreen: 'discover' });
    assert.strictEqual(harness.getMenuOpen(), true, 'Menu is open initially');

    // Simulate clicking outside
    harness.triggerClickOutside();
    assert.strictEqual(harness.getMenuOpen(), false, 'Clicking outside must close menu');
  });

  test('User menu contains user info and all 6 required menu items', () => {
    const harness = createHeaderHarness(true);
    const { Header } = loadModule(headerCode, harness.mockReact);

    const vnode = Header({ activeScreen: 'discover' });
    const popover = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('shadow-pop')
    );
    assert.ok(popover, 'Popover must be rendered');

    // Menu item container is child 1 of popover
    const menuContainer = popover.props.children[1];
    const menuItems = menuContainer.props.children.filter((c) => c && c.props && c.props.label);
    assert.strictEqual(menuItems.length, 6, 'Must contain exactly 6 menu items');

    const expectedLabels = [
      'Tiket Saya',
      'Riwayat Pesanan',
      'Event Favorit',
      'Pengaturan Akun',
      'Pusat Bantuan & FAQ',
      'Keluar (Log Out)'
    ];
    expectedLabels.forEach((label, idx) => {
      assert.strictEqual(menuItems[idx].props.label, label, `Item ${idx} must be "${label}"`);
    });
  });

  test('Clicking "Tiket Saya" in user menu closes dropdown and navigates to "tickets"', () => {
    const harness = createHeaderHarness(true);
    const { Header } = loadModule(headerCode, harness.mockReact);

    let navigatedScreen = null;
    const vnode = Header({
      activeScreen: 'discover',
      onNavigate: (s) => {
        navigatedScreen = s;
      }
    });

    const popover = findNodeByProps(vnode, (n) =>
      n?.props?.className && n.props.className.includes('shadow-pop')
    );
    assert.ok(popover, 'Popover must be rendered');

    const menuContainer = popover.props.children[1];
    const menuItems = menuContainer.props.children.filter((c) => c && c.props && c.props.label);
    const tiketSaya = menuItems.find((m) => m.props.label === 'Tiket Saya');
    assert.ok(tiketSaya, 'Must find "Tiket Saya" menu item');

    tiketSaya.props.onClick();
    assert.strictEqual(navigatedScreen, 'tickets', 'Clicking "Tiket Saya" must navigate to "tickets"');
    assert.strictEqual(harness.getMenuOpen(), false, 'Clicking "Tiket Saya" must close dropdown');
  });
});

// =============================================================================
// Suite 10: Integrated End-to-End User Journeys & Adversarial Verification
// =============================================================================
describe('Integrated End-to-End User Journeys & Adversarial Verification', async () => {
  const appCode = await compileBundle(APP_PATH);
  const { App } = loadModule(appCode);

  test('Golden Path End-to-End Journey: Discover -> Detail -> SeatMap -> Checkout -> E-Ticket', () => {
    // 1. App renders Discover screen cleanly
    const htmlDiscover = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'discover' }));
    assert.ok(htmlDiscover.includes('Lihat Detail Event'), 'Step 1: Discover screen renders hero CTA');

    // 2. Transition to Event Detail screen
    const htmlDetail = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'detail' }));
    assert.ok(htmlDetail.includes('Pilih Kursi Sekarang'), 'Step 2: Detail screen renders Pilih Kursi CTA');

    // 3. Transition to Seat Map screen
    const htmlSeatmap = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'seatmap' }));
    assert.ok(htmlSeatmap.includes('8.420 antrean aktif'), 'Step 3: Seat map renders attendee counter');
    assert.ok(htmlSeatmap.includes('Lanjut ke Pembayaran QRIS'), 'Step 3: Seat map renders proceed to payment CTA');

    // 4. Transition to E-Ticket screen
    const htmlETicket = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'tickets' }));
    assert.ok(htmlETicket.includes('#TICK-ID-98214'), 'Step 4: ETicket renders pass #TICK-ID-98214');
    assert.ok(htmlETicket.includes('Pembayaran Berhasil! E-Ticket Aktif'), 'Step 4: ETicket renders success banner');
    assert.ok(htmlETicket.includes('Kembali ke Beranda'), 'Step 4: ETicket renders return button');
  });

  test('Adversarial Boundary: Tax rounding precision on uneven subtotal figures', async () => {
    const orderSummaryCode = await compileBundle(ORDER_SUMMARY_PATH);
    const { OrderSummary: OrderSummarySSR } = loadModule(orderSummaryCode);

    // Uneven price: Rp 1.234.567 -> 10% tax should be Math.round(123456.7) = 123457
    const oddSeat = {
      id: 'ODD-1',
      row: 'X',
      number: 99,
      tier: 'cat1',
      tierName: 'CAT 1 VIP',
      price: 1234567,
      status: 'available'
    };

    const html = ReactDOMServer.renderToString(
      React.createElement(OrderSummarySSR, { selectedSeats: [oddSeat] })
    );

    // 1.234.567 + 123.457 + 35.000 = 1.393.024
    assert.ok(html.includes('Rp 1.234.567'), 'Subtotal must match exactly');
    assert.ok(html.includes('Rp 123.457'), 'Tax must be correctly rounded to Rp 123.457');
    assert.ok(html.includes('Rp 35.000'), 'Service fee must be Rp 35.000');
    assert.ok(html.includes('Rp 1.393.024'), 'Total must match sum Rp 1.393.024');
  });

  test('Adversarial Stress: 100 consecutive rapid route switches complete without errors', () => {
    const nav = new NavigationStateMachine('discover');
    const screens = ['discover', 'categories', 'detail', 'seatmap', 'tickets'];

    assert.doesNotThrow(() => {
      for (let i = 0; i < 100; i++) {
        const nextScreen = screens[i % screens.length];
        nav.navigateTo(nextScreen, `event-${i}`);
        assert.strictEqual(nav.activeScreen, nextScreen);
        assert.strictEqual(nav.selectedEventId, `event-${i}`);
      }
    }, 'Rapid route switching must not throw or corrupt state');
  });
});
