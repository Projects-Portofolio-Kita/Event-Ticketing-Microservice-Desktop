/**
 * Automated Verification Suite for Milestone 2 - TickId Desktop Application
 * Tests Header component structure, design tokens, SSR rendering,
 * navigation interactions, user profile dropdown popover, and outside click dismissal.
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
const HEADER_PATH = path.join(ROOT_DIR, 'src', 'components', 'Header.tsx');

// Helper to bundle Header.tsx in memory with Vite for SSR and runtime execution
let cachedCompiledCode = null;
async function getCompiledHeaderCode() {
  if (cachedCompiledCode) return cachedCompiledCode;

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
  cachedCompiledCode = chunk.code;
  return cachedCompiledCode;
}

// Helper to instantiate Header component from compiled bundle
async function loadHeaderComponent(customReact = null) {
  const code = await getCompiledHeaderCode();
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
    Header: m.exports.Header,
    default: m.exports.default
  };
}

describe('Milestone 2 - Header Static Quality & Clean Architecture Verification', () => {
  test('src/components/Header.tsx exists and has genuine implementation', () => {
    assert.ok(fs.existsSync(HEADER_PATH), 'Header.tsx file must exist');
    const content = fs.readFileSync(HEADER_PATH, 'utf8');
    assert.ok(content.length > 1000, 'Header.tsx must have substantial genuine logic');
    assert.ok(!content.includes('NotImplemented'), 'No dummy stubs permitted');
    assert.ok(!content.includes('TODO'), 'No TODO placeholders permitted');
  });

  test('Header exports both named Header and default Header', () => {
    const content = fs.readFileSync(HEADER_PATH, 'utf8');
    assert.ok(content.includes('export const Header') || content.includes('export { Header }'), 'Must have named export Header');
    assert.ok(content.includes('export default Header'), 'Must have default export Header');
  });

  test('Header imports all required Lucide icons with 0 extraneous dependencies', () => {
    const content = fs.readFileSync(HEADER_PATH, 'utf8');
    const expectedIcons = [
      'Ticket',
      'MapPin',
      'ChevronDown',
      'Home',
      'Search',
      'LayoutGrid',
      'Bell',
      'Receipt',
      'Heart',
      'Settings',
      'CircleHelp',
      'LogOut'
    ];

    for (const icon of expectedIcons) {
      assert.ok(content.includes(icon), `Header.tsx must import and use Lucide icon: ${icon}`);
    }
  });

  test('Header adheres to Clean Architecture: pure client state, 0 backend calls', () => {
    const content = fs.readFileSync(HEADER_PATH, 'utf8');
    assert.ok(content.includes("from '../context/NavigationContext'"), 'Must import useNavigation');
    assert.ok(content.includes("from '../data/mockUser'"), 'Must import mockUser');
    assert.ok(!content.includes("from '../services/api'"), 'Must NOT import backend API services');
    assert.ok(!content.includes('fetch(') && !content.includes('axios'), 'Must NOT execute raw HTTP network calls');
  });

  test('Header contains exact design tokens, gradients, and micro-animation classes', () => {
    const content = fs.readFileSync(HEADER_PATH, 'utf8');
    const expectedClasses = [
      'sticky',
      'h-[68px]',
      'bg-canvas',
      'border-line',
      'grad-brand',
      'text-grad-brand',
      'shadow-brand',
      'shadow-pop',
      'pop-in',
      'bg-danger',
      'bg-emerald',
      'text-violet',
      'bg-violet/10'
    ];

    for (const cls of expectedClasses) {
      assert.ok(content.includes(cls), `Header.tsx missing design class/token: ${cls}`);
    }
  });
});

describe('Milestone 2 - Header SSR & Render Structure Verification', () => {
  test('Header renders cleanly via ReactDOMServer with 0 errors or warnings', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'discover' }));
    assert.ok(html.length > 500, 'Rendered HTML should have substantial content');
    assert.ok(html.includes('<header'), 'Rendered HTML must contain <header>');
  });

  test('Header renders Brand Logo with Ticket icon, dark Tick and gradient Id', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header));
    assert.ok(html.includes('Tick'), 'Must contain Tick brand text');
    assert.ok(html.includes('Id'), 'Must contain Id brand text');
    assert.ok(html.includes('text-grad-brand'), 'Id must use text-grad-brand class');
    assert.ok(html.includes('grad-brand'), 'Logo box must use grad-brand class');
    assert.ok(html.includes('shadow-brand'), 'Logo box must use shadow-brand');
  });

  test('Header renders Location Selector pill with MapPin and Jakarta, ID', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header));
    assert.ok(html.includes('Jakarta, ID'), 'Must display Jakarta, ID');
  });

  test('Header renders Home Quick button with Beranda title', async () => {
    const { Header } = await loadHeaderComponent();
    const htmlDiscover = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'discover' }));
    assert.ok(htmlDiscover.includes('title="Beranda"'), 'Home button must have title Beranda');
    assert.ok(htmlDiscover.includes('bg-subtle text-ink'), 'Home button should highlight with bg-subtle text-ink when on discover');

    const htmlCategories = ReactDOMServer.renderToString(React.createElement(Header, { activeScreen: 'categories' }));
    assert.ok(htmlCategories.includes('bg-panel text-ink-soft'), 'Home button should be inactive when on other screens');
  });

  test('Header renders Global Search pill with placeholder and Category browse button', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header));
    assert.ok(html.includes('Konser, artis, festival, atau venue apa?'), 'Must contain search placeholder');
    assert.ok(html.includes('title="Kategori"'), 'Must contain category browse button');
    assert.ok(html.includes('max-w-[540px]'), 'Search bar must use max-w-[540px] pill styling');
  });

  test('Header renders Notification Bell with red count badge 3', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header));
    assert.ok(html.includes('bg-danger'), 'Notification badge must use bg-danger');
    assert.ok(html.includes('>3<'), 'Notification badge must display count 3');
  });

  test('Header renders User Profile Avatar button with image and emerald online indicator', async () => {
    const { Header } = await loadHeaderComponent();
    const html = ReactDOMServer.renderToString(React.createElement(Header));
    assert.ok(html.includes('bg-emerald'), 'Online status must use bg-emerald');
    assert.ok(html.includes('alt="Fajrul Rahman"'), 'Avatar image must include alt with user name');
  });
});

describe('Milestone 2 - Header Behavioral State & Interaction Verification', () => {
  function createInteractiveHarness() {
    let menuOpenState = false;
    let registeredMousedown = null;

    const mockDocument = {
      addEventListener: (event, fn) => {
        if (event === 'mousedown') registeredMousedown = fn;
      },
      removeEventListener: (event, fn) => {
        if (event === 'mousedown' && registeredMousedown === fn) registeredMousedown = null;
      }
    };
    global.document = mockDocument;

    const mockReact = {
      ...React,
      useState: (initial) => {
        if (typeof initial === 'boolean') {
          return [menuOpenState, (updater) => {
            menuOpenState = typeof updater === 'function' ? updater(menuOpenState) : updater;
          }];
        }
        return [initial, () => {}];
      },
      useRef: () => ({
        current: {
          contains: (target) => target && target.isInside === true
        }
      }),
      useContext: () => null,
      useEffect: (effect) => {
        const cleanup = effect();
        return cleanup;
      }
    };

    return {
      mockReact,
      getMenuOpenState: () => menuOpenState,
      setMenuOpenState: (v) => { menuOpenState = v; },
      getRegisteredMousedown: () => registeredMousedown
    };
  }

  test('Brand Logo click triggers navigateTo("discover")', async () => {
    const harness = createInteractiveHarness();
    const { Header } = await loadHeaderComponent(harness.mockReact);
    let navigatedScreen = null;
    const onNavigate = (screen) => { navigatedScreen = screen; };

    const rendered = Header({ onNavigate, activeScreen: 'categories' });

    // Left container -> Brand button is child 0 of left container
    const leftContainer = rendered.props.children[0];
    const brandButton = leftContainer.props.children[0];
    brandButton.props.onClick();

    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Brand Logo must navigate to discover');
  });

  test('Home Quick button click triggers navigateTo("discover")', async () => {
    const harness = createInteractiveHarness();
    const { Header } = await loadHeaderComponent(harness.mockReact);
    let navigatedScreen = null;
    const onNavigate = (screen) => { navigatedScreen = screen; };

    const rendered = Header({ onNavigate, activeScreen: 'categories' });
    const centerContainer = rendered.props.children[1];
    const homeButton = centerContainer.props.children[0];
    homeButton.props.onClick();

    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Home Quick button must navigate to discover');
  });

  test('Category browse button click triggers navigateTo("categories")', async () => {
    const harness = createInteractiveHarness();
    const { Header } = await loadHeaderComponent(harness.mockReact);
    let navigatedScreen = null;
    const onNavigate = (screen) => { navigatedScreen = screen; };

    const rendered = Header({ onNavigate, activeScreen: 'discover' });
    const centerContainer = rendered.props.children[1];
    const searchPill = centerContainer.props.children[1];
    const categoryButton = searchPill.props.children[3]; // Search icon, input, divider, category button
    categoryButton.props.onClick();

    assert.strictEqual(navigatedScreen, 'categories', 'Clicking Category button must navigate to categories');
  });

  test('User Profile Avatar click toggles user menu popover and renders all 6 items', async () => {
    let menuOpenState = false;
    let registeredMousedown = null;

    const mockDocument = {
      addEventListener: (event, fn) => {
        if (event === 'mousedown') registeredMousedown = fn;
      },
      removeEventListener: (event, fn) => {
        if (event === 'mousedown' && registeredMousedown === fn) registeredMousedown = null;
      }
    };
    global.document = mockDocument;

    const mockReact = {
      ...React,
      useState: (initial) => {
        if (typeof initial === 'boolean') {
          return [menuOpenState, (updater) => {
            menuOpenState = typeof updater === 'function' ? updater(menuOpenState) : updater;
          }];
        }
        return [initial, () => {}];
      },
      useRef: () => ({
        current: {
          contains: (target) => target && target.isInside === true
        }
      }),
      useContext: () => null,
      useEffect: (effect) => {
        const cleanup = effect();
        return cleanup;
      }
    };

    const { Header } = await loadHeaderComponent(mockReact);

    let navigatedScreen = null;
    const onNavigate = (screen) => { navigatedScreen = screen; };

    // 1. Initial State: Closed
    menuOpenState = false;
    let tree = Header({ onNavigate, activeScreen: 'discover' });
    let avatarWrapper = tree.props.children[2].props.children[1];
    let avatarButton = avatarWrapper.props.children[0];
    let popover = avatarWrapper.props.children[1];
    assert.strictEqual(popover, false, 'Popover must be initially closed');

    // 2. Click Avatar: Open Popover
    avatarButton.props.onClick();
    assert.strictEqual(menuOpenState, true, 'Avatar click must toggle menuOpenState to true');

    // Re-render with open state
    tree = Header({ onNavigate, activeScreen: 'discover' });
    avatarWrapper = tree.props.children[2].props.children[1];
    popover = avatarWrapper.props.children[1];
    assert.ok(popover, 'Popover menu must be rendered when isMenuOpen is true');

    // Verify User Info Header in Popover
    const userInfoHeader = popover.props.children[0];
    const userInfoTextContainer = userInfoHeader.props.children[1];
    const nameP = userInfoTextContainer.props.children[0];
    const emailP = userInfoTextContainer.props.children[1];
    const badgeSpan = userInfoTextContainer.props.children[2];

    assert.strictEqual(nameP.props.children, 'Fajrul Rahman', 'User name must be Fajrul Rahman');
    assert.strictEqual(emailP.props.children, 'fajrul@example.com', 'User email must be fajrul@example.com');
    assert.strictEqual(badgeSpan.props.children, 'VIP Silver Member', 'User badge must be VIP Silver Member');

    // Verify 6 Menu Items
    const menuItemsContainer = popover.props.children[1];
    // Filter actual MenuItem components (excluding divider divs)
    const menuItems = menuItemsContainer.props.children.filter(c => c && c.props && c.props.label);
    assert.strictEqual(menuItems.length, 6, 'Must contain exactly 6 menu items');

    assert.strictEqual(menuItems[0].props.label, 'Tiket Saya');
    assert.ok(menuItems[0].props.badge.includes('2 Aktif'), 'Tiket Saya must have 2 Aktif badge');

    assert.strictEqual(menuItems[1].props.label, 'Riwayat Pesanan');
    assert.strictEqual(menuItems[2].props.label, 'Event Favorit');
    assert.strictEqual(menuItems[3].props.label, 'Pengaturan Akun');
    assert.ok(menuItems[4].props.label.includes('Pusat Bantuan'), 'Must include Pusat Bantuan');
    assert.ok(menuItems[5].props.label.includes('Keluar'), 'Must include Keluar');
    assert.strictEqual(menuItems[5].props.danger, true, 'Keluar must have danger flag');

    // 3. Click "Tiket Saya" -> Navigate to 'tickets' and close dropdown
    menuItems[0].props.onClick();
    assert.strictEqual(navigatedScreen, 'tickets', 'Clicking Tiket Saya must navigate to tickets');
    assert.strictEqual(menuOpenState, false, 'Clicking Tiket Saya must close dropdown popover');

    // 4. Test Outside Click dismiss
    menuOpenState = true;
    assert.ok(typeof registeredMousedown === 'function', 'Mousedown event listener must be registered on document');

    // Click outside
    registeredMousedown({ target: { isInside: false } });
    assert.strictEqual(menuOpenState, false, 'Clicking outside popover menu must close it');

    // Click inside
    menuOpenState = true;
    registeredMousedown({ target: { isInside: true } });
    assert.strictEqual(menuOpenState, true, 'Clicking inside popover menu must NOT close it');
  });
});

describe('Milestone 2 - NavigationContext Integration & Fallback Verification', () => {
  test('Header works inside NavigationProvider seamlessly', async () => {
    // Bundle NavigationContext as well
    const navResult = await vite.build({
      logLevel: 'silent',
      build: {
        write: false,
        lib: {
          entry: path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx'),
          formats: ['cjs'],
          fileName: () => 'nav.cjs'
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'react/jsx-runtime']
        }
      }
    });

    const navChunk = Array.isArray(navResult) ? navResult[0].output[0] : navResult.output[0];
    const mNav = new Module('nav.cjs');
    mNav.paths = Module._nodeModulePaths(ROOT_DIR);
    mNav._compile(navChunk.code, 'nav.cjs');
    const { NavigationProvider } = mNav.exports;

    const { Header } = await loadHeaderComponent();

    // Render Header inside NavigationProvider
    const html = ReactDOMServer.renderToString(
      React.createElement(
        NavigationProvider,
        { initialScreen: 'categories' },
        React.createElement(Header)
      )
    );

    assert.ok(html.includes('text-indigo'), 'Category button should reflect active indigo styling from context');
  });

  test('Header falls back gracefully without NavigationProvider', async () => {
    const { Header } = await loadHeaderComponent();
    // Render Header standalone without any provider
    assert.doesNotThrow(() => {
      const html = ReactDOMServer.renderToString(React.createElement(Header));
      assert.ok(html.includes('Tick'), 'Should render brand cleanly even without provider');
    }, 'Standalone Header must not throw when NavigationProvider is missing');
  });
});
