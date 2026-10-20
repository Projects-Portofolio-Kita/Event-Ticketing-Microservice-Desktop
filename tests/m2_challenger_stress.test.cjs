/**
 * Challenger 1 Adversarial Empirical Stress Test Suite for Milestone 2
 * Focus: Header.tsx interactions, dropdown state machine, outside-click dismissal,
 * route transitions from multiple entry points, and edge-case resilience.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const path = require('path');
const Module = require('module');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const vite = require('vite');

const ROOT_DIR = path.resolve(__dirname, '..');
const HEADER_PATH = path.join(ROOT_DIR, 'src', 'components', 'Header.tsx');
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');

let cachedCompiledHeader = null;
let cachedCompiledNav = null;

async function getCompiledHeader() {
  if (cachedCompiledHeader) return cachedCompiledHeader;

  const result = await vite.build({
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: HEADER_PATH,
        formats: ['cjs'],
        fileName: () => 'header.cjs'
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']
      }
    }
  });

  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  cachedCompiledHeader = chunk.code;
  return cachedCompiledHeader;
}

async function getCompiledNav() {
  if (cachedCompiledNav) return cachedCompiledNav;

  const result = await vite.build({
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: NAV_CONTEXT_PATH,
        formats: ['cjs'],
        fileName: () => 'nav.cjs'
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime']
      }
    }
  });

  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  cachedCompiledNav = chunk.code;
  return cachedCompiledNav;
}

async function loadHeader(customReact = null) {
  const code = await getCompiledHeader();
  const m = new Module('header.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);

  if (customReact) {
    m.require = (id) => {
      if (id === 'react') return customReact;
      return require(id);
    };
  }

  m._compile(code, 'header.cjs');
  return {
    Header: m.exports.Header || m.exports.default
  };
}

// Interactive test harness for stateful component testing without browser
function createHarness(initialMenuOpen = false) {
  let menuOpen = initialMenuOpen;
  let searchQuery = '';
  let registeredListeners = {};
  let effectCleanup = null;

  const mockDocument = {
    addEventListener: (event, fn) => {
      registeredListeners[event] = fn;
    },
    removeEventListener: (event, fn) => {
      if (registeredListeners[event] === fn) {
        delete registeredListeners[event];
      }
    }
  };

  global.document = mockDocument;

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
      if (typeof initial === 'string') {
        return [
          searchQuery,
          (updater) => {
            searchQuery = typeof updater === 'function' ? updater(searchQuery) : updater;
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
      effectCleanup = effect();
      return effectCleanup;
    }
  };

  return {
    mockReact,
    getMenuOpen: () => menuOpen,
    setMenuOpen: (v) => { menuOpen = v; },
    getSearchQuery: () => searchQuery,
    setSearchQuery: (v) => { searchQuery = v; },
    getListeners: () => registeredListeners,
    triggerMousedown: (eventObj) => {
      if (registeredListeners['mousedown']) {
        registeredListeners['mousedown'](eventObj);
      }
    },
    unmount: () => {
      if (typeof effectCleanup === 'function') {
        effectCleanup();
      }
    }
  };
}

describe('Challenger 1 - Adversarial User Dropdown State Machine', () => {
  test('Stress Test: 50 rapid alternating toggles maintain exact state parity', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    for (let i = 1; i <= 50; i++) {
      const tree = Header({});
      const avatarButton = tree.props.children[2].props.children[1].props.children[0];
      avatarButton.props.onClick();

      const expected = i % 2 !== 0; // odd -> true, even -> false
      assert.strictEqual(
        harness.getMenuOpen(),
        expected,
        `Toggle iteration ${i} expected menuOpen to be ${expected}`
      );
    }
  });

  test('Open -> Outside click -> Repeated outside click stress: state stays false without throwing', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    // Initial render
    let tree = Header({});
    const avatarButton = tree.props.children[2].props.children[1].props.children[0];

    // Open dropdown
    avatarButton.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), true, 'Menu must be open');

    // Click outside once
    harness.triggerMousedown({ target: { isInside: false } });
    assert.strictEqual(harness.getMenuOpen(), false, 'Outside click must close menu');

    // Repeated outside clicks while already closed
    for (let i = 0; i < 20; i++) {
      assert.doesNotThrow(() => {
        harness.triggerMousedown({ target: { isInside: false } });
      });
      assert.strictEqual(harness.getMenuOpen(), false, 'Menu must stay closed on redundant outside clicks');
    }

    // Handles null / undefined event target gracefully
    assert.doesNotThrow(() => {
      harness.triggerMousedown({ target: null });
    });
    assert.doesNotThrow(() => {
      harness.triggerMousedown({});
    });
  });

  test('Open -> Inside click hierarchy stress: clicks inside popover do not close dropdown', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    // Open dropdown
    const tree = Header({});
    const avatarButton = tree.props.children[2].props.children[1].props.children[0];
    avatarButton.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), true);

    // Simulate clicking inside container
    harness.triggerMousedown({ target: { isInside: true } });
    assert.strictEqual(harness.getMenuOpen(), true, 'Inside click must NOT close dropdown');

    // Simulate multiple nested clicks inside
    for (let i = 0; i < 10; i++) {
      harness.triggerMousedown({ target: { isInside: true, depth: i } });
      assert.strictEqual(harness.getMenuOpen(), true, 'Nested inside click must NOT close dropdown');
    }
  });

  test('Outside click listener cleanup on unmount prevents listener leaks', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    Header({});
    assert.ok(
      typeof harness.getListeners()['mousedown'] === 'function',
      'Mousedown listener must be active after mount'
    );

    // Unmount
    harness.unmount();
    assert.strictEqual(
      harness.getListeners()['mousedown'],
      undefined,
      'Mousedown listener must be cleaned up on unmount'
    );

    // Firing mousedown after unmount does nothing and does not crash
    assert.doesNotThrow(() => {
      harness.triggerMousedown({ target: { isInside: false } });
    });
  });
});

describe('Challenger 1 - Dropdown Menu Items & Auto-Close Verification', () => {
  test('Clicking "Tiket Saya" navigates to tickets AND closes dropdown', async () => {
    const harness = createHarness(true); // Dropdown open
    const { Header } = await loadHeader(harness.mockReact);

    let navigatedTo = null;
    const tree = Header({ onNavigate: (screen) => { navigatedTo = screen; } });

    const popover = tree.props.children[2].props.children[1].props.children[1];
    assert.ok(popover, 'Popover must be rendered when menuOpen is true');

    const menuItemsContainer = popover.props.children[1];
    const menuItems = menuItemsContainer.props.children.filter(c => c && c.props && c.props.label);

    const tiketSayaItem = menuItems.find(m => m.props.label === 'Tiket Saya');
    assert.ok(tiketSayaItem, '"Tiket Saya" menu item must exist');

    tiketSayaItem.props.onClick();

    assert.strictEqual(navigatedTo, 'tickets', '"Tiket Saya" must navigate to "tickets"');
    assert.strictEqual(harness.getMenuOpen(), false, '"Tiket Saya" click MUST close the dropdown');
  });

  test('All other 5 menu items close dropdown when clicked', async () => {
    const harness = createHarness(true);
    const { Header } = await loadHeader(harness.mockReact);

    const otherLabels = [
      'Riwayat Pesanan',
      'Event Favorit',
      'Pengaturan Akun',
      'Pusat Bantuan & FAQ',
      'Keluar (Log Out)'
    ];

    for (const label of otherLabels) {
      harness.setMenuOpen(true);
      const tree = Header({});
      const popover = tree.props.children[2].props.children[1].props.children[1];
      const menuItems = popover.props.children[1].props.children.filter(c => c && c.props && c.props.label);

      const item = menuItems.find(m => m.props.label === label);
      assert.ok(item, `Menu item "${label}" must exist`);

      item.props.onClick();
      assert.strictEqual(
        harness.getMenuOpen(),
        false,
        `Clicking "${label}" must close the dropdown`
      );
    }
  });

  test('"Keluar (Log Out)" item has danger styling enabled', async () => {
    const harness = createHarness(true);
    const { Header } = await loadHeader(harness.mockReact);
    const tree = Header({});
    const popover = tree.props.children[2].props.children[1].props.children[1];
    const menuItems = popover.props.children[1].props.children.filter(c => c && c.props && c.props.label);

    const logoutItem = menuItems.find(m => m.props.label === 'Keluar (Log Out)');
    assert.ok(logoutItem, 'Logout item must exist');
    assert.strictEqual(logoutItem.props.danger, true, 'Logout item must have danger prop true');
  });
});

describe('Challenger 1 - Route Transitions from Multiple Entry Points', () => {
  test('Brand Logo click: navigates to "discover" via onNavigate, NavigationContext, or standalone', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    // 1. With onNavigate
    let navigated = null;
    let tree = Header({ onNavigate: (s) => { navigated = s; }, activeScreen: 'categories' });
    let logoButton = tree.props.children[0].props.children[0];
    logoButton.props.onClick();
    assert.strictEqual(navigated, 'discover', 'Logo click must navigate to discover');

    // 2. Standalone without onNavigate or context: must not throw
    tree = Header({ activeScreen: 'categories' });
    logoButton = tree.props.children[0].props.children[0];
    assert.doesNotThrow(() => {
      logoButton.props.onClick();
    }, 'Logo click standalone without callback must not throw');
  });

  test('Home Quick Button click: navigates to "discover" via onNavigate, NavigationContext, or standalone', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    let navigated = null;
    let tree = Header({ onNavigate: (s) => { navigated = s; }, activeScreen: 'categories' });
    let homeButton = tree.props.children[1].props.children[0];
    homeButton.props.onClick();
    assert.strictEqual(navigated, 'discover', 'Home button click must navigate to discover');

    // Standalone
    tree = Header({ activeScreen: 'categories' });
    homeButton = tree.props.children[1].props.children[0];
    assert.doesNotThrow(() => {
      homeButton.props.onClick();
    }, 'Home button standalone without callback must not throw');
  });

  test('Category browse button click: navigates to "categories" via onNavigate, NavigationContext, or standalone', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    let navigated = null;
    let tree = Header({ onNavigate: (s) => { navigated = s; }, activeScreen: 'discover' });
    let searchPill = tree.props.children[1].props.children[1];
    let categoryButton = searchPill.props.children[3];
    categoryButton.props.onClick();
    assert.strictEqual(navigated, 'categories', 'Category button click must navigate to categories');

    // Standalone
    tree = Header({ activeScreen: 'discover' });
    searchPill = tree.props.children[1].props.children[1];
    categoryButton = searchPill.props.children[3];
    assert.doesNotThrow(() => {
      categoryButton.props.onClick();
    }, 'Category button standalone without callback must not throw');
  });

  test('Exhaustive Multi-Entry Transition Sequence (Stress Loop)', async () => {
    const harness = createHarness(false);
    const { Header } = await loadHeader(harness.mockReact);

    const history = [];
    const onNavigate = (screen) => history.push(screen);

    // Sequence of clicks:
    // 1. Category button -> 'categories'
    // 2. Home button -> 'discover'
    // 3. Category button -> 'categories'
    // 4. Logo button -> 'discover'
    // 5. Open popover -> "Tiket Saya" -> 'tickets'
    // 6. Home button -> 'discover'

    let tree = Header({ onNavigate, activeScreen: 'discover' });
    let searchPill = tree.props.children[1].props.children[1];
    let categoryButton = searchPill.props.children[3];
    categoryButton.props.onClick(); // -> 'categories'

    tree = Header({ onNavigate, activeScreen: 'categories' });
    let homeButton = tree.props.children[1].props.children[0];
    homeButton.props.onClick(); // -> 'discover'

    tree = Header({ onNavigate, activeScreen: 'discover' });
    searchPill = tree.props.children[1].props.children[1];
    categoryButton = searchPill.props.children[3];
    categoryButton.props.onClick(); // -> 'categories'

    tree = Header({ onNavigate, activeScreen: 'categories' });
    let logoButton = tree.props.children[0].props.children[0];
    logoButton.props.onClick(); // -> 'discover'

    // Open dropdown and click "Tiket Saya"
    harness.setMenuOpen(true);
    tree = Header({ onNavigate, activeScreen: 'discover' });
    let popover = tree.props.children[2].props.children[1].props.children[1];
    let menuItems = popover.props.children[1].props.children.filter(c => c && c.props && c.props.label);
    let tiketSaya = menuItems.find(m => m.props.label === 'Tiket Saya');
    tiketSaya.props.onClick(); // -> 'tickets'

    tree = Header({ onNavigate, activeScreen: 'tickets' });
    homeButton = tree.props.children[1].props.children[0];
    homeButton.props.onClick(); // -> 'discover'

    assert.deepStrictEqual(
      history,
      ['categories', 'discover', 'categories', 'discover', 'tickets', 'discover'],
      'Multi-entry transition sequence must match exact expected history'
    );
  });
});

describe('Challenger 1 - Active State Highlighting Across All Screen Types', () => {
  const allScreens = ['discover', 'categories', 'detail', 'seatmap', 'tickets'];

  for (const screen of allScreens) {
    test(`Screen "${screen}" renders correct active/inactive classes on Home & Category buttons`, async () => {
      const { Header } = await loadHeader();
      const html = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: screen }));

      if (screen === 'discover') {
        assert.ok(html.includes('bg-subtle text-ink'), 'Home button must be active on discover');
        assert.ok(!html.includes('text-indigo" title="Kategori"'), 'Category button must NOT be active on discover');
      } else if (screen === 'categories') {
        assert.ok(html.includes('text-indigo'), 'Category button must be active on categories');
        assert.ok(html.includes('bg-panel text-ink-soft'), 'Home button must be inactive on categories');
      } else {
        // detail, seatmap, tickets: both inactive
        assert.ok(html.includes('bg-panel text-ink-soft'), `Home button must be inactive on ${screen}`);
      }
    });
  }

  test('Prop Precedence: activeScreen prop overrides active prop and fallback', async () => {
    const { Header } = await loadHeader();
    // activeScreen='discover', active='categories' -> activeScreen must win
    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { activeScreen: 'discover', active: 'categories' })
    );
    assert.ok(html.includes('bg-subtle text-ink'), 'activeScreen must take precedence over active prop');
  });

  test('Prop Precedence: active prop works when activeScreen is omitted', async () => {
    const { Header } = await loadHeader();
    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { active: 'categories' })
    );
    assert.ok(html.includes('text-indigo'), 'active prop should be recognized when activeScreen is omitted');
  });
});

describe('Challenger 1 - Boundary Conditions & Custom User Profiles', () => {
  test('User with 0 notifications, offline, and 0 active tickets renders cleanly', async () => {
    const customUser = {
      name: 'Budi Santoso',
      email: 'budi@domain.com',
      avatarUrl: 'https://example.com/budi.jpg',
      isOnline: false,
      membershipTier: 'Regular Member',
      unreadNotificationsCount: 0,
      activeTicketsCount: 0
    };

    const { Header } = await loadHeader();
    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { user: customUser })
    );

    assert.ok(html.includes('>0<'), 'Must display 0 notifications');
    assert.ok(html.includes('alt="Budi Santoso"'), 'Must have alt with custom user name');
    assert.ok(!html.includes('bg-emerald ring-2 ring-canvas'), 'Offline user must NOT have green online dot');
  });

  test('User with 99+ notifications and online status renders with emerald dot', async () => {
    const customUser = {
      name: 'Siti Rahma',
      email: 'siti@domain.com',
      avatarUrl: 'https://example.com/siti.jpg',
      isOnline: true,
      membershipTier: 'VIP Gold Member',
      unreadNotificationsCount: 99,
      activeTicketsCount: 5
    };

    const { Header } = await loadHeader();
    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { user: customUser })
    );

    assert.ok(html.includes('>99<'), 'Must display 99 notifications');
    assert.ok(html.includes('bg-emerald ring-2 ring-canvas'), 'Online user must have emerald online dot');
  });

  test('User with undefined unread count falls back gracefully to default', async () => {
    const customUser = {
      name: 'Dewi Lestari',
      email: 'dewi@domain.com',
      avatarUrl: 'https://example.com/dewi.jpg',
      isOnline: true,
      membershipTier: 'Member',
      unreadNotificationsCount: undefined,
      activeTicketsCount: undefined
    };

    const { Header } = await loadHeader();
    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { user: customUser })
    );

    assert.ok(html.includes('Dewi Lestari'), 'Must render user name');
    assert.ok(html.includes('>3<'), 'Must fallback to default count 3 when unreadNotificationsCount is undefined');
  });
});
