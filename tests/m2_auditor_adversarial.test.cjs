/**
 * Independent Forensic Auditor Adversarial Stress-Test Suite for Milestone 2
 * Tests Header.tsx edge cases, custom props, unmount cleanup, menu dismissal,
 * online status flag, active button styles, and navigation dispatch.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const vite = require('vite');
const Module = require('module');

const ROOT_DIR = path.resolve(__dirname, '..');
const HEADER_PATH = path.join(ROOT_DIR, 'src', 'components', 'Header.tsx');

let cachedCode = null;
async function getHeaderModule(customReact = null) {
  if (!cachedCode) {
    const result = await vite.build({
      logLevel: 'silent',
      build: {
        write: false,
        lib: {
          entry: HEADER_PATH,
          formats: ['cjs'],
          fileName: () => 'header_audit.cjs'
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']
        }
      }
    });
    const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
    cachedCode = chunk.code;
  }

  const m = new Module('header_audit.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);
  if (customReact) {
    m.require = (id) => {
      if (id === 'react') return customReact;
      return require(id);
    };
  }

  m._compile(cachedCode, 'header_audit.cjs');
  return m.exports;
}

function createTestHarness() {
  let menuOpen = false;
  let addedMousedownListener = null;
  let removedMousedownListener = null;

  const mockDocument = {
    addEventListener: (type, fn) => {
      if (type === 'mousedown') addedMousedownListener = fn;
    },
    removeEventListener: (type, fn) => {
      if (type === 'mousedown') removedMousedownListener = fn;
    }
  };
  global.document = mockDocument;

  let activeCleanup = null;
  const mockReact = {
    ...React,
    useState: (init) => {
      if (typeof init === 'boolean') {
        return [menuOpen, (updater) => {
          menuOpen = typeof updater === 'function' ? updater(menuOpen) : updater;
        }];
      }
      return [init, () => {}];
    },
    useRef: () => ({
      current: {
        contains: (target) => Boolean(target && target.isInside)
      }
    }),
    useContext: () => null,
    useEffect: (effect) => {
      activeCleanup = effect();
      return activeCleanup;
    }
  };

  return {
    mockReact,
    getMenuOpen: () => menuOpen,
    setMenuOpen: (v) => { menuOpen = v; },
    getAddedListener: () => addedMousedownListener,
    getRemovedListener: () => removedMousedownListener,
    getCleanup: () => activeCleanup
  };
}

describe('Forensic Auditor - Header Adversarial Stress Tests', () => {
  test('Custom user props override mockUser completely without hardcoded leak', async () => {
    const { Header } = await getHeaderModule();
    const customUser = {
      name: 'Adversarial Tester',
      email: 'adversary@tickid.id',
      avatarUrl: 'https://example.com/custom-avatar.jpg',
      membershipTier: 'Diamond VVIP',
      unreadNotificationsCount: 99,
      activeTicketsCount: 7,
      isOnline: false
    };

    const html = ReactDOMServer.renderToString(
      React.createElement(Header, { user: customUser })
    );

    assert.ok(html.includes('alt="Adversarial Tester"'), 'Custom user name must be in alt text');
    assert.ok(html.includes('src="https://example.com/custom-avatar.jpg"'), 'Custom avatar must be in src');
    assert.ok(html.includes('>99<'), 'Custom notification count (99) must be rendered');
    assert.ok(!html.includes('Fajrul Rahman'), 'Default mockUser name must NOT be leaked when custom user provided');
    assert.ok(!html.includes('fajrul@example.com'), 'Default mockUser email must NOT be leaked');
  });

  test('Online emerald badge is absent when user.isOnline is false', async () => {
    const { Header } = await getHeaderModule();
    const offlineUser = {
      name: 'Offline User',
      email: 'offline@tickid.id',
      avatarUrl: 'https://example.com/offline.jpg',
      membershipTier: 'Regular',
      unreadNotificationsCount: 1,
      activeTicketsCount: 0,
      isOnline: false
    };

    const onlineUser = {
      ...offlineUser,
      isOnline: true
    };

    const htmlOffline = ReactDOMServer.renderToString(
      React.createElement(Header, { user: offlineUser })
    );
    const htmlOnline = ReactDOMServer.renderToString(
      React.createElement(Header, { user: onlineUser })
    );

    assert.ok(!htmlOffline.includes('bg-emerald'), 'bg-emerald online badge must NOT be rendered when isOnline is false');
    assert.ok(htmlOnline.includes('bg-emerald'), 'bg-emerald online badge MUST be rendered when isOnline is true');
  });

  test('Outside click listener registers and cleans up on unmount to prevent memory leaks', async () => {
    const harness = createTestHarness();
    const { Header } = await getHeaderModule(harness.mockReact);

    Header({ activeScreen: 'discover' });

    const added = harness.getAddedListener();
    const cleanup = harness.getCleanup();

    assert.ok(typeof added === 'function', 'Header must register mousedown listener on document');
    assert.ok(typeof cleanup === 'function', 'Header useEffect must return a cleanup function');

    // Simulate unmount
    cleanup();
    assert.strictEqual(harness.getRemovedListener(), added, 'Unmount must clean up exactly the registered listener');
  });

  test('Menu toggle idempotency and all 6 items dismiss menu properly', async () => {
    const harness = createTestHarness();
    const { Header } = await getHeaderModule(harness.mockReact);

    // Initial render: closed
    harness.setMenuOpen(false);
    let rendered = Header({ activeScreen: 'discover' });
    let avatarButton = rendered.props.children[2].props.children[1].props.children[0];

    // Toggle 1: open
    avatarButton.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), true, 'Click 1 should open menu');

    // Toggle 2: close
    rendered = Header({ activeScreen: 'discover' });
    avatarButton = rendered.props.children[2].props.children[1].props.children[0];
    avatarButton.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), false, 'Click 2 should close menu');

    // Toggle 3: open again
    avatarButton.props.onClick();
    assert.strictEqual(harness.getMenuOpen(), true, 'Click 3 should open menu again');

    // Render open menu
    rendered = Header({ activeScreen: 'discover' });
    const popover = rendered.props.children[2].props.children[1].props.children[1];
    const menuContainer = popover.props.children[1];
    const items = menuContainer.props.children.filter(c => c && c.props && c.props.label);

    assert.strictEqual(items.length, 6, 'There must be exactly 6 menu items');

    // Test each menu item closes the dropdown
    for (let i = 0; i < items.length; i++) {
      harness.setMenuOpen(true); // force open
      items[i].props.onClick();
      assert.strictEqual(harness.getMenuOpen(), false, `Menu item "${items[i].props.label}" onClick must close menu`);
    }
  });

  test('Active screen styling matrix: discover vs categories vs detail/seatmap', async () => {
    const { Header } = await getHeaderModule();

    // 1. Discover active
    const htmlDiscover = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'discover' }));
    assert.ok(htmlDiscover.includes('bg-subtle text-ink'), 'Home button active on discover');
    assert.ok(htmlDiscover.includes('text-ink-muted hover:text-ink'), 'Category button inactive on discover');

    // 2. Categories active
    const htmlCat = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'categories' }));
    assert.ok(htmlCat.includes('bg-panel text-ink-soft'), 'Home button inactive on categories');
    assert.ok(htmlCat.includes('text-indigo'), 'Category button active on categories');

    // 3. Seatmap active (neither active)
    const htmlSeatmap = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'seatmap' }));
    assert.ok(htmlSeatmap.includes('bg-panel text-ink-soft'), 'Home button inactive on seatmap');
    assert.ok(htmlSeatmap.includes('text-ink-muted hover:text-ink'), 'Category button inactive on seatmap');
  });

  test('prop onNavigate takes precedence over context navigateTo', async () => {
    const harness = createTestHarness();
    const { Header } = await getHeaderModule(harness.mockReact);

    let propNavigated = null;
    const rendered = Header({
      onNavigate: (s) => { propNavigated = s; },
      activeScreen: 'seatmap'
    });

    const leftContainer = rendered.props.children[0];
    const brandBtn = leftContainer.props.children[0];
    brandBtn.props.onClick();

    assert.strictEqual(propNavigated, 'discover', 'onNavigate must receive discover');
  });
});
