/**
 * Milestone 1 Router & State Stress Test Suite
 * Empirical Challenger Verification for TickId Desktop Application
 * 
 * Verifies:
 *  1. Barrel exports in src/pages/index.ts and page controller contracts
 *  2. Header standalone rendering resilience (outside Router context) and router hook integration
 *  3. CheckoutModal navigation to #/tickets and #/seatmap without unhandled rejections
 *  4. BookingProvider persistence across route switches (seats, totals, timers, checkout state)
 *  5. App isomorphic router architecture (HashRouter / MemoryRouter) and Layout persistence
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
const PAGES_INDEX_PATH = path.join(ROOT_DIR, 'src', 'pages', 'index.ts');
const HEADER_PATH = path.join(ROOT_DIR, 'src', 'components', 'Header.tsx');
const CHECKOUT_MODAL_PATH = path.join(ROOT_DIR, 'src', 'components', 'CheckoutModal.tsx');
const LAYOUT_PATH = path.join(ROOT_DIR, 'src', 'components', 'Layout.tsx');
const BOOKING_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx');
const APP_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const MOCK_SEATS_PATH = path.join(ROOT_DIR, 'src', 'data', 'mockSeats.ts');

// Bundle caching for efficient execution
const bundleCache = new Map();

async function compileBundle(entryPath, externalDeps = ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', 'react-router-dom']) {
  const cacheKey = `${entryPath}:${externalDeps.join(',')}`;
  if (bundleCache.has(cacheKey)) {
    return bundleCache.get(cacheKey);
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
        external: externalDeps
      }
    }
  });

  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  bundleCache.set(cacheKey, chunk.code);
  return chunk.code;
}

function loadModule(code, customRequires = {}) {
  const m = new Module('bundle.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);

  if (Object.keys(customRequires).length > 0) {
    m.require = (id) => {
      if (customRequires[id]) return customRequires[id];
      return require(id);
    };
  }

  m._compile(code, 'bundle.cjs');
  return m.exports;
}

// Interactive React hook harness for Node.js
function createHookHarness(initialCustomState = [], contextValue = null) {
  const stateMap = new Map();
  let stateIndex = 0;

  initialCustomState.forEach((val, idx) => {
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
    useContext: (ctx) => contextValue,
    createContext: (def) => ({ Provider: ({ value, children }) => children, _def: def })
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

// Helper to find a React virtual element by class name substring
function findByClass(node, className) {
  if (!node) return null;
  if (node.props && node.props.className && typeof node.props.className === 'string' && node.props.className.includes(className)) {
    return node;
  }
  if (node.props && node.props.children) {
    const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
    for (const child of children) {
      const found = findByClass(child, className);
      if (found) return found;
    }
  }
  return null;
}

// =============================================================================
// Suite 1: Page Exports & Router Page Controller Contracts
// =============================================================================
describe('M1 Router Stress — Suite 1: Page Exports & Router Page Controller Contracts', async () => {
  const pagesCode = await compileBundle(PAGES_INDEX_PATH);
  const pages = loadModule(pagesCode);

  test('src/pages/index.ts exports all 5 core router pages', () => {
    const expectedExports = [
      'DiscoverPage',
      'CategoriesPage',
      'EventDetailPage',
      'SeatMapPage',
      'ETicketPage'
    ];

    for (const exp of expectedExports) {
      assert.ok(pages[exp], `src/pages/index.ts must export ${exp}`);
      assert.strictEqual(typeof pages[exp], 'function', `${exp} must be a functional React component`);
    }
  });

  test('each page file exists and has corresponding default and named exports', () => {
    const pageFiles = [
      'DiscoverPage.tsx',
      'CategoriesPage.tsx',
      'EventDetailPage.tsx',
      'SeatMapPage.tsx',
      'ETicketPage.tsx'
    ];

    for (const file of pageFiles) {
      const filePath = path.join(ROOT_DIR, 'src', 'pages', file);
      assert.ok(fs.existsSync(filePath), `File must exist: ${filePath}`);
      const content = fs.readFileSync(filePath, 'utf8');
      assert.ok(content.includes('export const') || content.includes('export function'), `${file} must have named export`);
      assert.ok(content.includes('export default'), `${file} must have default export`);
    }
  });

  test('EventDetailPage reads :eventId from route params and handles navigation', () => {
    let lastNavigated = null;
    const harness = createHookHarness([], { navigateTo: () => {} });
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useParams: () => ({ eventId: 'jakarta-jazz-2027' }),
        useNavigate: () => (target) => { lastNavigated = target; }
      }
    };

    const localPages = loadModule(pagesCode, customRequires);
    const vnode = localPages.EventDetailPage({});
    assert.strictEqual(vnode.props.eventId, 'jakarta-jazz-2027', 'EventDetailPage must pass parsed eventId to screen');

    // Test navigation callback
    vnode.props.onNavigate('seatmap');
    assert.strictEqual(lastNavigated, '/seatmap/jakarta-jazz-2027', 'Navigating to seatmap must include active eventId');

    vnode.props.onNavigate('categories');
    assert.strictEqual(lastNavigated, '/categories', 'Navigating to categories must route to /categories');

    vnode.props.onNavigate('discover');
    assert.strictEqual(lastNavigated, '/', 'Navigating to discover must route to /');
  });

  test('SeatMapPage connects :eventId and useBooking().openCheckout', () => {
    let lastNavigated = null;
    let checkoutOpened = false;

    const mockBookingContext = {
      openCheckout: () => { checkoutOpened = true; },
      navigateTo: () => {}
    };

    const harness = createHookHarness([], mockBookingContext);
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useParams: () => ({ eventId: 'dwp-2026' }),
        useNavigate: () => (target) => { lastNavigated = target; }
      }
    };

    const localPages = loadModule(pagesCode, customRequires);
    const vnode = localPages.SeatMapPage({});

    assert.ok(typeof vnode.props.onProceedToPayment === 'function', 'SeatMapPage must provide onProceedToPayment');
    vnode.props.onProceedToPayment();
    assert.strictEqual(checkoutOpened, true, 'onProceedToPayment must invoke BookingContext openCheckout');

    vnode.props.onNavigate('detail');
    assert.strictEqual(lastNavigated, '/event/dwp-2026', 'Navigating to detail must include eventId');
  });

  test('ETicketPage reads :bookingRef from params and attaches selectedSeats from context', () => {
    let lastNavigated = null;
    const customSeats = [{ id: 'cat1-test', price: 3500000, tier: 'cat1' }];

    const mockBookingContext = {
      selectedSeats: customSeats,
      navigateTo: () => {}
    };

    const harness = createHookHarness([], mockBookingContext);
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useParams: () => ({ bookingRef: 'TEST-REF-777' }),
        useNavigate: () => (target) => { lastNavigated = target; }
      }
    };

    const localPages = loadModule(pagesCode, customRequires);
    const vnode = localPages.ETicketPage({});

    assert.strictEqual(vnode.props.selectedSeats, customSeats, 'ETicketPage must pass selectedSeats from context');
    assert.strictEqual(vnode.props.ticketData.referenceId, '#TEST-REF-777', 'ETicketPage must format referenceId with # prefix');

    vnode.props.onNavigate('discover');
    assert.strictEqual(lastNavigated, '/', 'Navigating to discover must route to /');
  });
});

// =============================================================================
// Suite 2: Header Standalone Rendering Resilience & Router Hook Gracefulness
// =============================================================================
describe('M1 Router Stress — Suite 2: Header Standalone Rendering Resilience & Router Hook Gracefulness', async () => {
  const headerCode = await compileBundle(HEADER_PATH);

  test('<Header /> renders via ReactDOMServer completely outside Router context without throwing', () => {
    const { Header } = loadModule(headerCode);

    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(React.createElement(Header));
      assert.ok(html.includes('<header'), 'Must render <header> element');
      assert.ok(html.includes('TickId'), 'Must render brand title');
      assert.ok(html.includes('Jakarta, ID'), 'Must render location selector');
    }, 'Header must NOT throw when rendered without Router or NavigationContext');
  });

  test('<Header /> standalone button clicks execute cleanly without errors when no Router or callbacks provided', () => {
    const harness = createHookHarness();
    const { Header } = loadModule(headerCode, { react: harness.mockReact });

    const vnode = Header({});
    assert.ok(vnode, 'Header vnode must be created');

    // Left brand button
    const leftContainer = vnode.props.children[0];
    const brandBtn = leftContainer.props.children[0];
    assert.doesNotThrow(() => {
      brandBtn.props.onClick();
    }, 'Brand click must not throw without router');

    // Center home button
    const centerContainer = vnode.props.children[1];
    const homeBtn = centerContainer.props.children[0];
    assert.doesNotThrow(() => {
      homeBtn.props.onClick();
    }, 'Home click must not throw without router');

    // Category button in search pill
    const searchPill = centerContainer.props.children[1];
    const catBtn = searchPill.props.children[3];
    assert.doesNotThrow(() => {
      catBtn.props.onClick();
    }, 'Category click must not throw without router');
  });

  test('<Header /> honors onNavigate prop callback when rendered standalone', () => {
    const harness = createHookHarness();
    const { Header } = loadModule(headerCode, { react: harness.mockReact });

    let navigatedScreen = null;
    const vnode = Header({ onNavigate: (screen) => { navigatedScreen = screen; } });

    // Brand click
    const brandBtn = vnode.props.children[0].props.children[0];
    brandBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Brand click must call onNavigate("discover")');

    // Home click
    const homeBtn = vnode.props.children[1].props.children[0];
    homeBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Home click must call onNavigate("discover")');

    // Category click
    const catBtn = vnode.props.children[1].props.children[1].props.children[3];
    catBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'categories', 'Category click must call onNavigate("categories")');
  });

  test('<Header /> inside Router context computes active screen from location pathname and navigates via router', () => {
    const testCases = [
      { pathname: '/', expectedActive: 'discover' },
      { pathname: '/discover', expectedActive: 'discover' },
      { pathname: '/categories', expectedActive: 'categories' },
      { pathname: '/event/coldplay-2026', expectedActive: 'detail' },
      { pathname: '/seatmap/coldplay-2026', expectedActive: 'seatmap' },
      { pathname: '/tickets', expectedActive: 'tickets' }
    ];

    for (const tc of testCases) {
      let routerNavTarget = null;
      const harness = createHookHarness();
      const customRequires = {
        react: harness.mockReact,
        'react-router-dom': {
          ...require('react-router-dom'),
          useLocation: () => ({ pathname: tc.pathname }),
          useNavigate: () => (target) => { routerNavTarget = target; }
        }
      };

      const { Header } = loadModule(headerCode, customRequires);
      const vnode = Header({});

      // Test active button styling when on discover
      if (tc.expectedActive === 'discover') {
        const homeBtn = vnode.props.children[1].props.children[0];
        assert.ok(homeBtn.props.className.includes('bg-subtle'), 'Home button should have active bg-subtle on discover');
      }

      // Test router navigation on brand button
      const brandBtn = vnode.props.children[0].props.children[0];
      brandBtn.props.onClick();
      assert.strictEqual(routerNavTarget, '/', 'Clicking brand must navigate to "/"');

      // Test router navigation on category button
      const catBtn = vnode.props.children[1].props.children[1].props.children[3];
      catBtn.props.onClick();
      assert.strictEqual(routerNavTarget, '/categories', 'Clicking category button must navigate to "/categories"');
    }
  });
});

// =============================================================================
// Suite 3: CheckoutModal Navigation & Action Handlers
// =============================================================================
describe('M1 Router Stress — Suite 3: CheckoutModal Navigation & Action Handlers', async () => {
  const modalCode = await compileBundle(CHECKOUT_MODAL_PATH);

  test('<CheckoutModal /> renders via ReactDOMServer outside Router without throwing', () => {
    const { CheckoutModal } = loadModule(modalCode);

    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
      assert.ok(html.includes('Pembayaran QRIS Instan'), 'Must render modal title');
      assert.ok(html.includes('btn-simulate-pay'), 'Must render Simulasi Bayar CTA');
      assert.ok(html.includes('btn-cancel-release'), 'Must render Batalkan & Lepas Kursi CTA');
      assert.ok(html.includes('NMID: ID1020268892110'), 'Must render merchant NMID');
    }, 'CheckoutModal must render cleanly outside Router context');
  });

  test('<CheckoutModal /> standalone clicks invoke callbacks without router', () => {
    const harness = createHookHarness();
    const { CheckoutModal } = loadModule(modalCode, { react: harness.mockReact });

    let successFired = false;
    let cancelFired = false;
    let closeFired = false;

    const vnode = CheckoutModal({
      isOpen: true,
      onSuccess: () => { successFired = true; },
      onCancel: () => { cancelFired = true; },
      onClose: () => { closeFired = true; }
    });

    const payBtn = findByClass(vnode, 'btn-simulate-pay');
    const cancelBtn = findByClass(vnode, 'btn-cancel-release');

    assert.ok(payBtn, 'Must find btn-simulate-pay');
    assert.ok(cancelBtn, 'Must find btn-cancel-release');

    payBtn.props.onClick();
    assert.strictEqual(successFired, true, 'Payment simulation must invoke onSuccess');

    cancelBtn.props.onClick();
    assert.strictEqual(cancelFired, true, 'Cancellation must invoke onCancel');
    assert.strictEqual(closeFired, true, 'Cancellation must invoke onClose');
  });

  test('<CheckoutModal /> inside Router context navigates to #/tickets on simulation without unhandled rejections', () => {
    let navigatedPath = null;
    let paymentCompleted = false;

    const mockBookingContext = {
      isCheckoutOpen: true,
      completePayment: () => { paymentCompleted = true; },
      closeCheckout: () => {},
      clearSelection: () => {},
      selectedSeats: [{ id: 's1', price: 1000 }],
      navigateTo: () => {}
    };

    const harness = createHookHarness([], mockBookingContext);
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useNavigate: () => (target) => { navigatedPath = target; }
      }
    };

    const { CheckoutModal } = loadModule(modalCode, customRequires);
    const vnode = CheckoutModal({ isOpen: true });

    const payBtn = findByClass(vnode, 'btn-simulate-pay');
    assert.doesNotThrow(() => {
      payBtn.props.onClick();
    });

    assert.strictEqual(navigatedPath, '/tickets', 'Simulate pay must route to /tickets');
    assert.strictEqual(paymentCompleted, true, 'Simulate pay must invoke completePayment in BookingContext');
  });

  test('<CheckoutModal /> inside Router context navigates to #/seatmap/coldplay-2026 on cancel/release', () => {
    let navigatedPath = null;
    let selectionCleared = false;
    let checkoutClosed = false;

    const mockBookingContext = {
      isCheckoutOpen: true,
      closeCheckout: () => { checkoutClosed = true; },
      clearSelection: () => { selectionCleared = true; },
      selectedSeats: [{ id: 's1', price: 1000 }],
      navigateTo: () => {}
    };

    const harness = createHookHarness([], mockBookingContext);
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useNavigate: () => (target) => { navigatedPath = target; }
      }
    };

    const { CheckoutModal } = loadModule(modalCode, customRequires);
    const vnode = CheckoutModal({ isOpen: true });

    const cancelBtn = findByClass(vnode, 'btn-cancel-release');
    assert.doesNotThrow(() => {
      cancelBtn.props.onClick();
    });

    assert.strictEqual(navigatedPath, '/seatmap/coldplay-2026', 'Cancel & release must route to /seatmap/coldplay-2026');
    assert.strictEqual(selectionCleared, true, 'Cancel & release must clear selection');
    assert.strictEqual(checkoutClosed, true, 'Cancel & release must close checkout modal');
  });

  test('50 rapid sequential executions of modal actions produce 0 exceptions or rejections', () => {
    let payCount = 0;
    let cancelCount = 0;

    const mockBookingContext = {
      isCheckoutOpen: true,
      completePayment: () => {},
      closeCheckout: () => {},
      clearSelection: () => {},
      selectedSeats: [{ id: 's1', price: 1000 }],
      navigateTo: () => {}
    };

    const harness = createHookHarness([], mockBookingContext);
    const customRequires = {
      react: harness.mockReact,
      'react-router-dom': {
        ...require('react-router-dom'),
        useNavigate: () => (target) => {
          if (target === '/tickets') payCount++;
          if (target.startsWith('/seatmap')) cancelCount++;
        }
      }
    };

    const { CheckoutModal } = loadModule(modalCode, customRequires);
    const vnode = CheckoutModal({ isOpen: true });
    const payBtn = findByClass(vnode, 'btn-simulate-pay');
    const cancelBtn = findByClass(vnode, 'btn-cancel-release');

    for (let i = 0; i < 50; i++) {
      assert.doesNotThrow(() => {
        payBtn.props.onClick();
        cancelBtn.props.onClick();
      }, `Iteration ${i} of rapid modal actions must not throw`);
    }

    assert.strictEqual(payCount, 50, 'Pay action must have fired exactly 50 times');
    assert.strictEqual(cancelCount, 50, 'Cancel action must have fired exactly 50 times');
  });
});

// =============================================================================
// Suite 4: BookingProvider Persistence Across Route Transitions
// =============================================================================
describe('M1 Router Stress — Suite 4: BookingProvider Persistence Across Route Transitions', async () => {
  const bookingCode = await compileBundle(BOOKING_CONTEXT_PATH);
  const seatsModule = await compileBundle(MOCK_SEATS_PATH);
  const { mockSeats } = loadModule(seatsModule);

  test('App.tsx layout structure verifies BookingProvider encloses AppRoutes and Outlet', () => {
    const appContent = fs.readFileSync(APP_PATH, 'utf8');
    assert.ok(appContent.includes('<BookingProvider>'), 'App.tsx must include <BookingProvider>');
    assert.ok(appContent.includes('<AppRoutes />'), 'App.tsx must include <AppRoutes />');
    assert.ok(
      appContent.match(/<BookingProvider>[\s\S]*?<AppRoutes \/>[\s\S]*?<\/BookingProvider>/),
      '<BookingProvider> must enclose <AppRoutes />'
    );
  });

  test('BookingProvider retains seat selections when route changes (seatmap -> categories -> seatmap)', () => {
    const harness = createHookHarness();
    const { BookingProvider } = loadModule(bookingCode, { react: harness.mockReact });

    // Initial render of BookingProvider on route '/seatmap/coldplay-2026'
    let providerVNode = BookingProvider({ children: null });
    let contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 0, 'Initial seats must be empty');

    // 1. User selects CAT 1 seat on seatmap page
    const seat1 = mockSeats.find((s) => s.status === 'available' && s.tier === 'cat1');
    assert.ok(seat1, 'Available CAT 1 seat must exist');
    contextValue.toggleSeat(seat1);

    // Re-render provider reflecting state update
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 1, '1 seat must be selected');
    assert.strictEqual(contextValue.selectedSeats[0].id, seat1.id);
    assert.strictEqual(contextValue.subtotal, seat1.price);

    // 2. Route transitions to '/categories' (simulating user navigating away)
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 1, 'Seat must remain selected after navigating to categories');
    assert.strictEqual(contextValue.selectedSeats[0].id, seat1.id);

    // 3. Route transitions to '/event/coldplay-2026'
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 1, 'Seat must remain selected after navigating to event detail');

    // 4. Route transitions back to '/seatmap/coldplay-2026' and selects a second seat (CAT 2)
    const seat2 = mockSeats.find((s) => s.status === 'available' && s.tier === 'cat2');
    assert.ok(seat2, 'Available CAT 2 seat must exist');
    contextValue.toggleSeat(seat2);

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 2, '2 seats must now be selected');
    const expectedSubtotal = seat1.price + seat2.price;
    const expectedTax = Math.round(expectedSubtotal * 0.1);
    const expectedTotal = expectedSubtotal + expectedTax + 35000;
    assert.strictEqual(contextValue.subtotal, expectedSubtotal, 'Subtotal must match sum of both seats');
    assert.strictEqual(contextValue.tax, expectedTax, 'Tax must be 10% of subtotal');
    assert.strictEqual(contextValue.total, expectedTotal, 'Total must equal subtotal + tax + 35k fee');

    // 5. Route transitions to '/tickets'
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 2, 'Both seats must persist on /tickets');
  });

  test('BookingProvider checkout modal state persists across route transitions', () => {
    const harness = createHookHarness();
    const { BookingProvider } = loadModule(bookingCode, { react: harness.mockReact });

    let providerVNode = BookingProvider({ children: null });
    let contextValue = providerVNode.props.value;

    const seat = mockSeats.find((s) => s.status === 'available');
    contextValue.toggleSeat(seat);

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;

    // Open checkout modal
    contextValue.openCheckout();

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.isCheckoutOpen, true, 'Checkout modal must be open');

    // Simulate route change to /categories
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.isCheckoutOpen, true, 'Checkout modal open state must persist across route change');

    // Close checkout
    contextValue.closeCheckout();

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.isCheckoutOpen, false, 'Checkout modal must close on closeCheckout');
  });

  test('50 rapid route switches across 5 screens maintain 100% state integrity and zero leakage', () => {
    const harness = createHookHarness();
    const { BookingProvider } = loadModule(bookingCode, { react: harness.mockReact });

    let providerVNode = BookingProvider({ children: null });
    let contextValue = providerVNode.props.value;

    // Select 3 seats across different tiers
    const cat1 = mockSeats.find((s) => s.status === 'available' && s.tier === 'cat1');
    const cat2 = mockSeats.find((s) => s.status === 'available' && s.tier === 'cat2');
    const cat3 = mockSeats.find((s) => s.status === 'available' && s.tier === 'cat3');
    contextValue.toggleSeat(cat1);
    contextValue.toggleSeat(cat2);
    contextValue.toggleSeat(cat3);

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;

    const initialSeatsCount = contextValue.selectedSeats.length;
    const initialTotal = contextValue.total;
    assert.strictEqual(initialSeatsCount, 3, 'Should have 3 seats selected initially');

    const routeSimulationPath = [
      '/',
      '/categories',
      '/event/coldplay-2026',
      '/seatmap/coldplay-2026',
      '/tickets'
    ];

    for (let i = 0; i < 50; i++) {
      const currentRoute = routeSimulationPath[i % routeSimulationPath.length];
      harness.resetIndex();
      providerVNode = BookingProvider({ children: null });
      contextValue = providerVNode.props.value;

      assert.strictEqual(
        contextValue.selectedSeats.length,
        initialSeatsCount,
        `Route ${currentRoute} (iteration ${i}) must preserve exactly ${initialSeatsCount} seats`
      );
      assert.strictEqual(
        contextValue.total,
        initialTotal,
        `Route ${currentRoute} (iteration ${i}) must preserve calculated total`
      );
    }
  });

  test('clearSelection releases all seats and persists cleared state across route changes', () => {
    const harness = createHookHarness();
    const { BookingProvider } = loadModule(bookingCode, { react: harness.mockReact });

    let providerVNode = BookingProvider({ children: null });
    let contextValue = providerVNode.props.value;

    const seat = mockSeats.find((s) => s.status === 'available');
    contextValue.toggleSeat(seat);

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 1);

    // Clear selection
    contextValue.clearSelection();

    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 0, 'Selection must be cleared');
    assert.strictEqual(contextValue.total, 0, 'Total must be reset to 0');

    // Simulate route change to /seatmap/coldplay-2026
    harness.resetIndex();
    providerVNode = BookingProvider({ children: null });
    contextValue = providerVNode.props.value;
    assert.strictEqual(contextValue.selectedSeats.length, 0, 'Empty selection must persist on new route');
    assert.strictEqual(contextValue.total, 0, 'Total 0 must persist on new route');
  });
});

// =============================================================================
// Suite 5: App Multi-Page Architecture & Route Fallbacks
// =============================================================================
describe('M1 Router Stress — Suite 5: App Multi-Page Architecture & Route Fallbacks', async () => {
  // Externalize react-router-dom so App uses the shared instance
  const appCode = await compileBundle(APP_PATH, ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']);
  const { App, AppRoutes, AppShell } = loadModule(appCode);
  const layoutCode = await compileBundle(LAYOUT_PATH, ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']);
  const { Layout } = loadModule(layoutCode);

  test('App component exports all required named and default symbols', () => {
    assert.strictEqual(typeof App, 'function', 'App must be a function');
    assert.strictEqual(typeof AppRoutes, 'function', 'AppRoutes must be a function');
    assert.strictEqual(typeof AppShell, 'function', 'AppShell must be a function');
  });

  test('Layout component contains persistent <Header />, <Outlet />, and conditional modal', () => {
    const layoutContent = fs.readFileSync(LAYOUT_PATH, 'utf8');
    assert.ok(layoutContent.includes('<Header />') || layoutContent.includes('<Header'), 'Layout must include Header');
    assert.ok(layoutContent.includes('<Outlet />') || layoutContent.includes('<Outlet'), 'Layout must include Outlet');
    assert.ok(layoutContent.includes('<CheckoutModal'), 'Layout must include CheckoutModal');
    assert.ok(layoutContent.includes('isCheckoutOpen &&'), 'CheckoutModal must be guarded by isCheckoutOpen');
  });

  test('App renders DiscoverPage at initial route "/" via SSR MemoryRouter fallback', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialEntries: ['/'] }));
    assert.ok(html.includes('app-container'), 'Must render app-container root');
    assert.ok(html.includes('main-content-region'), 'Must render main-content-region');
    assert.ok(html.includes('Lihat Detail Event'), 'Must render DiscoverScreen hero action');
  });

  test('App with initialScreen: "categories" renders CategoriesPage', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'categories' }));
    assert.ok(html.includes('Jelajahi Kategori Event'), 'Must render Categories title');
  });

  test('App with initialScreen: "detail" renders EventDetailPage', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'detail' }));
    assert.ok(html.includes('event-detail-screen'), 'Must render event-detail-screen container');
    assert.ok(html.includes('Pilih Kursi Sekarang'), 'Must render CTA button');
  });

  test('App with initialScreen: "seatmap" renders SeatMapPage', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'seatmap' }));
    assert.ok(html.includes('seat-map-screen'), 'Must render seat-map-screen container');
    assert.ok(html.includes('Lanjut ke Pembayaran QRIS'), 'Must render order summary CTA');
  });

  test('App with initialScreen: "tickets" renders ETicketPage', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'tickets' }));
    assert.ok(html.includes('eticket-screen'), 'Must render eticket-screen container');
    assert.ok(html.includes('#TICK-ID-98214'), 'Must render default reference ID');
  });

  test('App with arbitrary unknown path routes safely to fallback without throwing', () => {
    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(
        React.createElement(App, { initialEntries: ['/some/deep/unknown/path/404'] })
      );
      assert.ok(html.includes('app-container'), 'Fallback route must render application shell');
      assert.ok(html.includes('main-content-region'), 'Fallback route must render main-content-region');
    });
  });
});
