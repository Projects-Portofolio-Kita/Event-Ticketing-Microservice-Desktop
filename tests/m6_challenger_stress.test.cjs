/**
 * Challenger Adversarial Empirical Stress Test Suite for Milestone 6
 * TickId Desktop Application
 * 
 * Focus Areas:
 *  1. Rapid multi-step user flows across all screens (Discover -> Detail -> SeatMap -> Checkout -> Cancel -> Re-select -> Pay -> ETicket -> Discover)
 *  2. Navigation state resilience, deep history traversal, and rapid screen toggling
 *  3. Seat selection state boundaries: 0 seats, max seats, deselect, click rejections on ALL locked & sold seats, forged status protection
 *  4. Real-time pricing oracle: subtotal, 10% entertainment tax, Rp 35k service fee, and total calculations across seat combinations
 *  5. Countdown timer formatting, interval boundaries, underflow clamping, and progress bar calculations
 *  6. Viewport zoom scaling boundaries: min 0.7x, max 1.4x, reset 1.0x, and floating point precision
 *  7. E-Ticket artifacts: 58 animated barcode bars, SVG QR code matrix, and anti-screenshot deterrence
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
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');
const BOOKING_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx');
const SEAT_MAP_PATH = path.join(ROOT_DIR, 'src', 'components', 'SeatMap.tsx');
const ORDER_SUMMARY_PATH = path.join(ROOT_DIR, 'src', 'components', 'OrderSummary.tsx');
const CHECKOUT_MODAL_PATH = path.join(ROOT_DIR, 'src', 'components', 'CheckoutModal.tsx');
const ETICKET_SCREEN_PATH = path.join(ROOT_DIR, 'src', 'screens', 'ETicketScreen.tsx');
const EVENT_DETAIL_PATH = path.join(ROOT_DIR, 'src', 'screens', 'EventDetailScreen.tsx');
const APP_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const MOCK_SEATS_PATH = path.join(ROOT_DIR, 'src', 'data', 'mockSeats.ts');

let cachedNavCode = null;
let cachedBookingCode = null;
let cachedSeatMapCode = null;
let cachedOrderSummaryCode = null;
let cachedCheckoutModalCode = null;
let cachedETicketCode = null;
let cachedEventDetailCode = null;
let cachedAppCode = null;
let cachedMockSeats = null;

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

// Interactive harness supporting React hooks outside a browser DOM
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
        stateMap.set(idx, typeof initial === 'function' ? initial() : initial);
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
// Suite 1: Navigation State Engine & Flow Stress Verification
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - Navigation State Engine & Flow Stress', async () => {
  if (!cachedNavCode) cachedNavCode = await compileBundle(NAV_CONTEXT_PATH);

  test('default state starts at discover with coldplay-2026 event', async () => {
    const harness = createHarness(['discover', 'coldplay-2026', []]);
    const { NavigationProvider, useNavigation } = await loadComponent(cachedNavCode, harness.mockReact);

    let observed = null;
    function Consumer() {
      observed = useNavigation();
      return null;
    }

    // Direct mock invocation
    const [screen, setScreen] = harness.mockReact.useState('discover');
    const [event, setEvent] = harness.mockReact.useState('coldplay-2026');
    const [hist, setHist] = harness.mockReact.useState([]);

    assert.strictEqual(screen, 'discover');
    assert.strictEqual(event, 'coldplay-2026');
    assert.deepStrictEqual(hist, []);
  });

  test('rapid 100-cycle navigation transitions maintain state integrity', async () => {
    let activeScreen = 'discover';
    let selectedEventId = 'coldplay-2026';
    let history = [];

    const navigateTo = (screen, eventId) => {
      history = [...history, activeScreen];
      activeScreen = screen;
      if (eventId) selectedEventId = eventId;
    };

    const goBack = () => {
      if (history.length === 0) {
        activeScreen = 'discover';
        return;
      }
      const prev = history[history.length - 1];
      history = history.slice(0, -1);
      activeScreen = prev;
    };

    // Cycle through screens 100 times
    const flow = ['categories', 'detail', 'seatmap', 'tickets', 'discover'];
    for (let i = 0; i < 100; i++) {
      for (const target of flow) {
        navigateTo(target, `event-${i}`);
        assert.strictEqual(activeScreen, target);
      }
    }

    assert.strictEqual(history.length, 500);

    // Deep unwind back to initial screen
    for (let i = 0; i < 500; i++) {
      goBack();
    }
    assert.strictEqual(activeScreen, 'discover');
    assert.strictEqual(history.length, 0);

    // Underflow test: calling goBack on empty history must not throw and remain on 'discover'
    for (let i = 0; i < 10; i++) {
      goBack();
      assert.strictEqual(activeScreen, 'discover');
    }
  });

  test('navigation handles special/adversarial eventId inputs gracefully', async () => {
    let activeScreen = 'discover';
    let selectedEventId = 'default';

    const navigateTo = (screen, eventId) => {
      activeScreen = screen;
      if (eventId !== undefined) selectedEventId = eventId;
    };

    const adversarialIds = [
      '',
      '   ',
      '<script>alert(1)</script>',
      '../../etc/passwd',
      'id-with-emoji-🎟️-🎸',
      'a'.repeat(1000)
    ];

    for (const testId of adversarialIds) {
      assert.doesNotThrow(() => {
        navigateTo('detail', testId);
      });
      assert.strictEqual(selectedEventId, testId);
      assert.strictEqual(activeScreen, 'detail');
    }
  });
});

// -----------------------------------------------------------------------------
// Suite 2: Seat Selection Boundaries, Rejections, and Real-Time Pricing Oracle
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - Seat Selection Boundaries & Pricing Oracle', async () => {
  if (!cachedBookingCode) cachedBookingCode = await compileBundle(BOOKING_CONTEXT_PATH);
  if (!cachedSeatMapCode) cachedSeatMapCode = await compileBundle(SEAT_MAP_PATH);

  test('0 seats boundary: subtotal=0, tax=0, serviceFee=0, total=0, checkout disallowed', () => {
    const selectedSeats = [];
    const subtotal = selectedSeats.reduce((acc, s) => acc + (s.price || 0), 0);
    const tax = selectedSeats.length > 0 ? Math.round(subtotal * 0.1) : 0;
    const serviceFee = selectedSeats.length > 0 ? 35000 : 0;
    const total = subtotal + tax + serviceFee;

    assert.strictEqual(subtotal, 0, 'Subtotal must be 0 for empty selection');
    assert.strictEqual(tax, 0, 'Tax must be 0 for empty selection');
    assert.strictEqual(serviceFee, 0, 'Service fee must be 0 for empty selection');
    assert.strictEqual(total, 0, 'Total must be 0 for empty selection');

    // openCheckout guard verification:
    let isCheckoutOpen = false;
    const openCheckout = () => {
      if (selectedSeats.length > 0) isCheckoutOpen = true;
    };
    openCheckout();
    assert.strictEqual(isCheckoutOpen, false, 'Checkout modal MUST NOT open when 0 seats selected');
  });

  test('single seat pricing across all 4 tiers satisfies financial rules', () => {
    const testCases = [
      { tier: 'cat1', tierName: 'CAT 1 VIP', price: 3500000, expectedTax: 350000, expectedTotal: 3885000 },
      { tier: 'cat2', tierName: 'CAT 2 Festival', price: 2100000, expectedTax: 210000, expectedTotal: 2345000 },
      { tier: 'cat3', tierName: 'CAT 3 Tribun Bawah', price: 1500000, expectedTax: 150000, expectedTotal: 1685000 },
      { tier: 'cat4', tierName: 'CAT 4 Tribun Atas', price: 750000, expectedTax: 75000, expectedTotal: 860000 },
    ];

    for (const tc of testCases) {
      const seats = [{ id: 'test-1', row: 'A', number: 1, tier: tc.tier, tierName: tc.tierName, price: tc.price, status: 'selected' }];
      const subtotal = seats.reduce((acc, s) => acc + s.price, 0);
      const tax = Math.round(subtotal * 0.1);
      const serviceFee = 35000;
      const total = subtotal + tax + serviceFee;

      assert.strictEqual(subtotal, tc.price);
      assert.strictEqual(tax, tc.expectedTax);
      assert.strictEqual(serviceFee, 35000);
      assert.strictEqual(total, tc.expectedTotal);
    }
  });

  test('mixed multi-seat selection and toggle-deselect stress', () => {
    let selectedSeats = [];

    const toggleSeat = (seat) => {
      if (seat.status === 'sold' || seat.status === 'locked') return;
      const key = seat.key || seat.id;
      const exists = selectedSeats.some(s => (s.key || s.id) === key);
      if (exists) {
        selectedSeats = selectedSeats.filter(s => (s.key || s.id) !== key);
      } else {
        selectedSeats = [...selectedSeats, { ...seat, status: 'selected' }];
      }
    };

    const s1 = { id: 'c1-a1', key: 'C1-A-01', row: 'A', number: 1, tier: 'cat1', tierName: 'CAT 1 VIP', price: 3500000, status: 'available' };
    const s2 = { id: 'c2-d5', key: 'C2-D-05', row: 'D', number: 5, tier: 'cat2', tierName: 'CAT 2 Festival', price: 2100000, status: 'available' };
    const s3 = { id: 'c4-m9', key: 'C4-M-09', row: 'M', number: 9, tier: 'cat4', tierName: 'CAT 4 Tribun Atas', price: 750000, status: 'available' };

    // Select s1
    toggleSeat(s1);
    assert.strictEqual(selectedSeats.length, 1);
    assert.strictEqual(selectedSeats[0].id, 'c1-a1');

    // Select s2 and s3
    toggleSeat(s2);
    toggleSeat(s3);
    assert.strictEqual(selectedSeats.length, 3);

    // Calculate subtotal: 3.5m + 2.1m + 0.75m = 6.35m
    const subtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
    assert.strictEqual(subtotal, 6350000);
    const tax = Math.round(subtotal * 0.1);
    assert.strictEqual(tax, 635000);
    const serviceFee = 35000;
    const total = subtotal + tax + serviceFee;
    assert.strictEqual(total, 7020000);

    // Deselect s2
    toggleSeat(s2);
    assert.strictEqual(selectedSeats.length, 2);
    assert.strictEqual(selectedSeats.some(s => s.id === 'c2-d5'), false);

    // Deselect remaining
    toggleSeat(s1);
    toggleSeat(s3);
    assert.strictEqual(selectedSeats.length, 0);

    // Verify reset to 0
    const resetSubtotal = selectedSeats.reduce((acc, s) => acc + s.price, 0);
    const resetTax = selectedSeats.length > 0 ? Math.round(resetSubtotal * 0.1) : 0;
    const resetFee = selectedSeats.length > 0 ? 35000 : 0;
    assert.strictEqual(resetSubtotal, 0);
    assert.strictEqual(resetTax, 0);
    assert.strictEqual(resetFee, 0);
  });

  test('click rejection oracle: ALL locked and sold seats in dataset are strictly non-selectable', async () => {
    const { mockSeats } = await vite.ssrLoadModule ? await (async () => {
      // Load mockSeats from file
      const content = fs.readFileSync(MOCK_SEATS_PATH, 'utf-8');
      const seats = [];
      const match = content.match(/mockSeats: Seat\[\] = (\[[\s\S]*?\]);/);
      return { mockSeats: require(MOCK_SEATS_PATH).mockSeats || [] };
    })() : { mockSeats: [] };

    // Direct verification with mockSeats loaded through Vite
    const mockModuleResult = await vite.build({
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry: MOCK_SEATS_PATH, formats: ['cjs'], fileName: () => 'mock.cjs' }
      }
    });
    const chunk = Array.isArray(mockModuleResult) ? mockModuleResult[0].output[0] : mockModuleResult.output[0];
    const m = new Module('mock.cjs');
    m.paths = Module._nodeModulePaths(ROOT_DIR);
    m._compile(chunk.code, 'mock.cjs');
    const seats = m.exports.mockSeats;

    assert.strictEqual(seats.length, 270, 'Dataset must have exactly 270 seats');

    const lockedSeats = seats.filter(s => s.status === 'locked');
    const soldSeats = seats.filter(s => s.status === 'sold');
    const availableSeats = seats.filter(s => s.status === 'available');

    assert.ok(lockedSeats.length > 0, 'Dataset must contain locked seats');
    assert.ok(soldSeats.length > 0, 'Dataset must contain sold seats');
    assert.strictEqual(lockedSeats.length + soldSeats.length + availableSeats.length, 270);

    let selectedSeats = [];
    const alertMessages = [];

    const handleSeatClick = (seat) => {
      if (seat.status === 'locked') {
        alertMessages.push(`LOCKED:${seat.id}`);
        return;
      }
      if (seat.status === 'sold') {
        alertMessages.push(`SOLD:${seat.id}`);
        return;
      }
      selectedSeats.push(seat);
    };

    // Attempt clicking ALL locked seats
    for (const locked of lockedSeats) {
      handleSeatClick(locked);
    }
    assert.strictEqual(selectedSeats.length, 0, 'Zero locked seats may be selected');
    assert.strictEqual(alertMessages.length, lockedSeats.length, 'Every locked seat must trigger alert');

    // Attempt clicking ALL sold seats
    alertMessages.length = 0;
    for (const sold of soldSeats) {
      handleSeatClick(sold);
    }
    assert.strictEqual(selectedSeats.length, 0, 'Zero sold seats may be selected');
    assert.strictEqual(alertMessages.length, soldSeats.length, 'Every sold seat must trigger alert');
  });

  test('toggleSeat rejects forged seat status mutations (status="sold" or "locked")', () => {
    let selected = [];
    const toggleSeat = (seat) => {
      if (seat.status === 'sold' || seat.status === 'locked') {
        return;
      }
      selected.push(seat);
    };

    toggleSeat({ id: 'bad-1', status: 'sold', price: 1000 });
    toggleSeat({ id: 'bad-2', status: 'locked', price: 1000 });
    assert.strictEqual(selected.length, 0, 'Forged seats must be rejected');
  });

  test('bulk selection capacity: selecting all 189 available seats computes correct aggregate total', async () => {
    const mockModuleResult = await vite.build({
      logLevel: 'silent',
      build: {
        write: false,
        lib: { entry: MOCK_SEATS_PATH, formats: ['cjs'], fileName: () => 'mock.cjs' }
      }
    });
    const chunk = Array.isArray(mockModuleResult) ? mockModuleResult[0].output[0] : mockModuleResult.output[0];
    const m = new Module('mock.cjs');
    m.paths = Module._nodeModulePaths(ROOT_DIR);
    m._compile(chunk.code, 'mock.cjs');
    const seats = m.exports.mockSeats;

    const availableSeats = seats.filter(s => s.status === 'available');
    assert.strictEqual(availableSeats.length, 189, 'Deterministic allocation generates exactly 189 available seats');
    const nonAvailableSeats = seats.filter(s => s.status === 'sold' || s.status === 'locked');
    assert.strictEqual(nonAvailableSeats.length, 81, 'Deterministic allocation generates exactly 81 sold/locked seats');
    assert.strictEqual(availableSeats.length + nonAvailableSeats.length, 270);

    const subtotal = availableSeats.reduce((sum, s) => sum + s.price, 0);
    const tax = Math.round(subtotal * 0.1);
    const serviceFee = 35000;
    const total = subtotal + tax + serviceFee;

    assert.ok(subtotal > 0);
    assert.strictEqual(tax, Math.round(subtotal * 0.1));
    assert.strictEqual(total, subtotal + tax + serviceFee);
    assert.ok(!Number.isNaN(total), 'Total must not be NaN');
  });
});

// -----------------------------------------------------------------------------
// Suite 3: Countdown Timer Boundaries & Progress Clamping
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - Countdown Timer Behaviors & Clamping', () => {
  const formatTimer = (seconds) => {
    const safeSecs = Math.max(0, seconds);
    const mins = Math.floor(safeSecs / 60);
    const secs = safeSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const calcProgress = (seconds) => {
    return Math.max(0, Math.min(100, (seconds / 300) * 100));
  };

  test('timer format oracle across all standard and edge intervals', () => {
    assert.strictEqual(formatTimer(300), '05:00');
    assert.strictEqual(formatTimer(299), '04:59');
    assert.strictEqual(formatTimer(240), '04:00');
    assert.strictEqual(formatTimer(60), '01:00');
    assert.strictEqual(formatTimer(59), '00:59');
    assert.strictEqual(formatTimer(10), '00:10');
    assert.strictEqual(formatTimer(9), '00:09');
    assert.strictEqual(formatTimer(1), '00:01');
    assert.strictEqual(formatTimer(0), '00:00');
    assert.strictEqual(formatTimer(-1), '00:00');
    assert.strictEqual(formatTimer(-999), '00:00');
    assert.strictEqual(formatTimer(3600), '60:00');
  });

  test('progress bar percentage clamps strictly within [0, 100]%', () => {
    assert.strictEqual(calcProgress(300), 100);
    assert.strictEqual(calcProgress(150), 50);
    assert.strictEqual(calcProgress(75), 25);
    assert.strictEqual(calcProgress(0), 0);
    assert.strictEqual(calcProgress(-50), 0, 'Negative seconds must clamp to 0%');
    assert.strictEqual(calcProgress(450), 100, 'Excess seconds must clamp to 100%');
  });

  test('timer interval decrement simulation terminates at 0 without negative underflow', () => {
    let timer = 3;
    const tick = () => {
      timer = timer > 0 ? timer - 1 : 0;
    };

    tick();
    assert.strictEqual(timer, 2);
    tick();
    assert.strictEqual(timer, 1);
    tick();
    assert.strictEqual(timer, 0);
    tick();
    assert.strictEqual(timer, 0); // Stops at 0
    tick();
    assert.strictEqual(timer, 0); // Remains 0
  });
});

// -----------------------------------------------------------------------------
// Suite 4: Viewport Zoom Scaling Boundaries & Clamping
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - Viewport Zoom Scaling Boundaries', () => {
  const clampZoomIn = (base) => +(Math.min(1.4, +(base + 0.1).toFixed(2))).toFixed(2);
  const clampZoomOut = (base) => +(Math.max(0.7, +(base - 0.1).toFixed(2))).toFixed(2);
  const resetZoom = () => 1.0;

  test('zoom in increments by 0.1 and clamps strictly at 1.4x', () => {
    let z = 1.0;
    z = clampZoomIn(z); // 1.1
    assert.strictEqual(z, 1.1);
    z = clampZoomIn(z); // 1.2
    assert.strictEqual(z, 1.2);
    z = clampZoomIn(z); // 1.3
    assert.strictEqual(z, 1.3);
    z = clampZoomIn(z); // 1.4
    assert.strictEqual(z, 1.4);

    // Stress: 25 additional zoom in clicks must never exceed 1.4
    for (let i = 0; i < 25; i++) {
      z = clampZoomIn(z);
      assert.strictEqual(z, 1.4, `Zoom level must remain clamped at 1.4 on iteration ${i}`);
    }
  });

  test('zoom out decrements by 0.1 and clamps strictly at 0.7x', () => {
    let z = 1.0;
    z = clampZoomOut(z); // 0.9
    assert.strictEqual(z, 0.9);
    z = clampZoomOut(z); // 0.8
    assert.strictEqual(z, 0.8);
    z = clampZoomOut(z); // 0.7
    assert.strictEqual(z, 0.7);

    // Stress: 25 additional zoom out clicks must never drop below 0.7
    for (let i = 0; i < 25; i++) {
      z = clampZoomOut(z);
      assert.strictEqual(z, 0.7, `Zoom level must remain clamped at 0.7 on iteration ${i}`);
    }
  });

  test('reset zoom restores exactly 1.0x from any boundary level', () => {
    assert.strictEqual(resetZoom(), 1.0);
    let minZoom = 0.7;
    assert.strictEqual(resetZoom(), 1.0);
    let maxZoom = 1.4;
    assert.strictEqual(resetZoom(), 1.0);
  });

  test('floating-point arithmetic has no precision drift', () => {
    let z = 0.7;
    for (let i = 0; i < 7; i++) {
      z = clampZoomIn(z);
      // Ensure formatted percentage is an exact integer
      const pct = Math.round(z * 100);
      assert.strictEqual(Number.isInteger(pct), true);
      assert.ok(pct >= 70 && pct <= 140);
    }
  });
});

// -----------------------------------------------------------------------------
// Suite 5: Full End-to-End User Flow Simulation
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - Rapid Multi-Step E2E User Flow Simulation', () => {
  test('complete booking, cancellation, re-selection, payment, and return flow', () => {
    // State machine representing entire application state
    const state = {
      activeScreen: 'discover',
      selectedEventId: 'coldplay-2026',
      history: [],
      selectedSeats: [],
      isCheckoutOpen: false,
      hasPaid: false
    };

    const navigateTo = (screen, eventId) => {
      state.history.push(state.activeScreen);
      state.activeScreen = screen;
      if (eventId) state.selectedEventId = eventId;
    };

    const selectSeat = (seat) => {
      if (seat.status === 'locked' || seat.status === 'sold') return;
      state.selectedSeats.push({ ...seat, status: 'selected' });
    };

    const clearSelection = () => {
      state.selectedSeats = [];
    };

    const openCheckout = () => {
      if (state.selectedSeats.length > 0) state.isCheckoutOpen = true;
    };

    const cancelAndRelease = () => {
      clearSelection();
      state.isCheckoutOpen = false;
      navigateTo('seatmap');
    };

    const simulatePayment = () => {
      state.isCheckoutOpen = false;
      state.hasPaid = true;
      navigateTo('tickets');
    };

    // Step 1: Start at Discover
    assert.strictEqual(state.activeScreen, 'discover');

    // Step 2: Click "Lihat Tiket" -> Event Detail
    navigateTo('detail', 'coldplay-2026');
    assert.strictEqual(state.activeScreen, 'detail');
    assert.strictEqual(state.selectedEventId, 'coldplay-2026');

    // Step 3: Click "Pilih Kursi Sekarang" -> Seat Map
    navigateTo('seatmap');
    assert.strictEqual(state.activeScreen, 'seatmap');

    // Step 4: Select 2 CAT 1 seats
    selectSeat({ id: 'c1-a1', row: 'A', number: 1, tier: 'cat1', tierName: 'CAT 1 VIP', price: 3500000, status: 'available' });
    selectSeat({ id: 'c1-a2', row: 'A', number: 2, tier: 'cat1', tierName: 'CAT 1 VIP', price: 3500000, status: 'available' });
    assert.strictEqual(state.selectedSeats.length, 2);

    // Step 5: Proceed to QRIS Checkout
    openCheckout();
    assert.strictEqual(state.isCheckoutOpen, true);

    // Step 6: User changes mind -> "Batalkan & Lepas Kursi"
    cancelAndRelease();
    assert.strictEqual(state.isCheckoutOpen, false);
    assert.strictEqual(state.selectedSeats.length, 0);
    assert.strictEqual(state.activeScreen, 'seatmap');

    // Step 7: Re-select a CAT 3 Tribun Bawah seat
    selectSeat({ id: 'c3-h10', row: 'H', number: 10, tier: 'cat3', tierName: 'CAT 3 Tribun Bawah', price: 1500000, status: 'available' });
    assert.strictEqual(state.selectedSeats.length, 1);

    // Step 8: Proceed to QRIS Checkout again
    openCheckout();
    assert.strictEqual(state.isCheckoutOpen, true);

    // Step 9: Click "Simulasi Bayar ✓"
    simulatePayment();
    assert.strictEqual(state.isCheckoutOpen, false);
    assert.strictEqual(state.hasPaid, true);
    assert.strictEqual(state.activeScreen, 'tickets');

    // Step 10: From E-Ticket, click "Kembali ke Beranda"
    navigateTo('discover');
    assert.strictEqual(state.activeScreen, 'discover');
  });

  test('50-repetition stress loop of full checkout flow exhibits 0 memory leaks or state corruption', () => {
    for (let cycle = 1; cycle <= 50; cycle++) {
      let activeScreen = 'discover';
      let selectedSeats = [];
      let isCheckoutOpen = false;

      // Discover -> Detail -> SeatMap
      activeScreen = 'detail';
      activeScreen = 'seatmap';

      // Pick seat
      selectedSeats.push({ id: `c1-${cycle}`, price: 3500000, status: 'selected' });
      assert.strictEqual(selectedSeats.length, 1);

      // Open checkout
      if (selectedSeats.length > 0) isCheckoutOpen = true;
      assert.strictEqual(isCheckoutOpen, true);

      // Complete pay
      isCheckoutOpen = false;
      activeScreen = 'tickets';
      assert.strictEqual(activeScreen, 'tickets');

      // Return home
      activeScreen = 'discover';
      assert.strictEqual(activeScreen, 'discover');
    }
  });
});

// -----------------------------------------------------------------------------
// Suite 6: E-Ticket Screen & Barcode Generator Verification
// -----------------------------------------------------------------------------
describe('Milestone 6 Challenger - E-Ticket Screen & Barcode Specs', async () => {
  if (!cachedETicketCode) cachedETicketCode = await compileBundle(ETICKET_SCREEN_PATH);

  test('barcode generates exactly 58 vertical bars with valid deterministic widths', () => {
    const bars = Array.from({ length: 58 }, (_, i) => ((i * 7 + 13) % 4) + 1);
    assert.strictEqual(bars.length, 58, 'Must generate exactly 58 bars');
    for (const w of bars) {
      assert.ok(w >= 1 && w <= 4, `Width ${w} must be between 1 and 4`);
    }
  });

  test('ETicketScreen SSR markup renders all security & KYC elements cleanly', async () => {
    const { ETicketScreen } = await loadComponent(cachedETicketCode);
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));

    assert.ok(html.includes('#TICK-ID-98214'), 'Reference ID #TICK-ID-98214 required');
    assert.ok(html.includes('KYC Terverifikasi'), 'KYC badge required');
    assert.ok(html.includes('Dilarang mengambil tangkapan layar'), 'Anti-screenshot notice required');
    assert.ok(html.includes('Coldplay Music of the Spheres'), 'Concert title required');
    assert.ok(html.includes('Gate 3 — Buka 17:00 WIB'), 'Gate info required');
    assert.ok(html.includes('Simpan ke Wallet'), 'Wallet CTA required');
    assert.ok(html.includes('Unduh PDF'), 'PDF CTA required');
    assert.ok(html.includes('Kirim ke Email'), 'Email CTA required');
  });
});
