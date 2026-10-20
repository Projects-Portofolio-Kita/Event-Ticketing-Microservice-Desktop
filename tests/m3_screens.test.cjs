/**
 * Automated Verification Suite for Milestone 3 - TickId Desktop Application
 * Tests DiscoverScreen and CategoriesScreen:
 *  - Static quality & Clean Architecture (0 backend dependencies, strict types, tokens)
 *  - SSR rendering of Hero Carousel & 8 Popular Indonesian Events
 *  - SSR rendering of 12 Category Visual Cards with tilted artwork
 *  - Carousel auto-rotation timer (6000ms) & manual previous/next/dots cycling
 *  - Click navigation on hero CTA, event cards, "Lihat Tiket", and category cards
 *  - NavigationContext integration & standalone fallback
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
const DISCOVER_PATH = path.join(ROOT_DIR, 'src', 'screens', 'DiscoverScreen.tsx');
const CATEGORIES_PATH = path.join(ROOT_DIR, 'src', 'screens', 'CategoriesScreen.tsx');
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');

let cachedDiscoverCode = null;
let cachedCategoriesCode = null;
let cachedNavCode = null;

async function getCompiledDiscoverCode() {
  if (cachedDiscoverCode) return cachedDiscoverCode;
  const result = await vite.build({
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: DISCOVER_PATH,
        formats: ['cjs'],
        fileName: () => 'discover.cjs'
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']
      }
    }
  });
  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  cachedDiscoverCode = chunk.code;
  return cachedDiscoverCode;
}

async function getCompiledCategoriesCode() {
  if (cachedCategoriesCode) return cachedCategoriesCode;
  const result = await vite.build({
    logLevel: 'silent',
    build: {
      write: false,
      lib: {
        entry: CATEGORIES_PATH,
        formats: ['cjs'],
        fileName: () => 'categories.cjs'
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react']
      }
    }
  });
  const chunk = Array.isArray(result) ? result[0].output[0] : result.output[0];
  cachedCategoriesCode = chunk.code;
  return cachedCategoriesCode;
}

async function getCompiledNavCode() {
  if (cachedNavCode) return cachedNavCode;
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
  cachedNavCode = chunk.code;
  return cachedNavCode;
}

async function loadDiscoverComponent(customReact = null) {
  const code = await getCompiledDiscoverCode();
  const m = new Module('discover.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);

  if (customReact) {
    m.require = (id) => {
      if (id === 'react') return customReact;
      return require(id);
    };
  }

  m._compile(code, 'discover.cjs');
  return {
    DiscoverScreen: m.exports.DiscoverScreen,
    default: m.exports.default
  };
}

async function loadCategoriesComponent(customReact = null) {
  const code = await getCompiledCategoriesCode();
  const m = new Module('categories.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);

  if (customReact) {
    m.require = (id) => {
      if (id === 'react') return customReact;
      return require(id);
    };
  }

  m._compile(code, 'categories.cjs');
  return {
    CategoriesScreen: m.exports.CategoriesScreen,
    default: m.exports.default
  };
}

async function loadNavModule() {
  const code = await getCompiledNavCode();
  const m = new Module('nav.cjs');
  m.paths = Module._nodeModulePaths(ROOT_DIR);
  m._compile(code, 'nav.cjs');
  return m.exports;
}

function createInteractiveHarness() {
  let activeSlideIndex = 0;
  let intervalCallback = null;
  let intervalMs = null;

  const mockReact = {
    ...React,
    useState: (initial) => {
      if (typeof initial === 'number') {
        return [activeSlideIndex, (updater) => {
          activeSlideIndex = typeof updater === 'function' ? updater(activeSlideIndex) : updater;
        }];
      }
      return [initial, () => {}];
    },
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useRef: (initial) => ({ current: initial }),
    useEffect: (effect) => {
      const originalSetInterval = global.setInterval;
      const originalClearInterval = global.clearInterval;

      global.setInterval = (cb, ms) => {
        intervalCallback = cb;
        intervalMs = ms;
        return 999;
      };
      global.clearInterval = () => {
        intervalCallback = null;
      };

      const cleanup = effect();

      global.setInterval = originalSetInterval;
      global.clearInterval = originalClearInterval;
      return cleanup;
    },
    useContext: () => null
  };

  return {
    mockReact,
    getActiveSlideIndex: () => activeSlideIndex,
    setActiveSlideIndex: (i) => { activeSlideIndex = i; },
    triggerInterval: () => { if (intervalCallback) intervalCallback(); },
    getIntervalDelay: () => intervalMs
  };
}

// ==============================================================================
// 1. STATIC QUALITY & CLEAN ARCHITECTURE VERIFICATION
// ==============================================================================
describe('Milestone 3 - Static Quality & Clean Architecture Verification', () => {
  test('src/screens/DiscoverScreen.tsx exists and has genuine implementation', () => {
    assert.ok(fs.existsSync(DISCOVER_PATH), 'DiscoverScreen.tsx must exist');
    const content = fs.readFileSync(DISCOVER_PATH, 'utf8');
    assert.ok(content.length > 1000, 'DiscoverScreen.tsx must contain substantial implementation');
    assert.ok(!content.includes('NotImplemented'), 'No dummy stubs permitted');
    assert.ok(!content.includes('TODO'), 'No TODO placeholders permitted');
  });

  test('src/screens/CategoriesScreen.tsx exists and has genuine implementation', () => {
    assert.ok(fs.existsSync(CATEGORIES_PATH), 'CategoriesScreen.tsx must exist');
    const content = fs.readFileSync(CATEGORIES_PATH, 'utf8');
    assert.ok(content.length > 800, 'CategoriesScreen.tsx must contain substantial implementation');
    assert.ok(!content.includes('NotImplemented'), 'No dummy stubs permitted');
    assert.ok(!content.includes('TODO'), 'No TODO placeholders permitted');
  });

  test('DiscoverScreen exports both named DiscoverScreen and default DiscoverScreen', () => {
    const content = fs.readFileSync(DISCOVER_PATH, 'utf8');
    assert.ok(
      content.includes('export const DiscoverScreen') || content.includes('export { DiscoverScreen }'),
      'Must have named export DiscoverScreen'
    );
    assert.ok(content.includes('export default DiscoverScreen'), 'Must have default export DiscoverScreen');
  });

  test('CategoriesScreen exports both named CategoriesScreen and default CategoriesScreen', () => {
    const content = fs.readFileSync(CATEGORIES_PATH, 'utf8');
    assert.ok(
      content.includes('export const CategoriesScreen') || content.includes('export { CategoriesScreen }'),
      'Must have named export CategoriesScreen'
    );
    assert.ok(content.includes('export default CategoriesScreen'), 'Must have default export CategoriesScreen');
  });

  test('DiscoverScreen imports required Lucide icons with 0 extraneous dependencies', () => {
    const content = fs.readFileSync(DISCOVER_PATH, 'utf8');
    const expectedIcons = ['Flame', 'ChevronLeft', 'ChevronRight', 'Calendar', 'MapPin', 'ArrowRight'];
    for (const icon of expectedIcons) {
      assert.ok(content.includes(icon), `DiscoverScreen.tsx must import and use Lucide icon: ${icon}`);
    }
  });

  test('Screens adhere to Clean Architecture: pure client state, 0 backend API calls', () => {
    const discover = fs.readFileSync(DISCOVER_PATH, 'utf8');
    const categories = fs.readFileSync(CATEGORIES_PATH, 'utf8');

    for (const [name, content] of [['DiscoverScreen', discover], ['CategoriesScreen', categories]]) {
      assert.ok(content.includes("from '../context/NavigationContext'"), `${name} must import useNavigation`);
      assert.ok(!content.includes("from '../services/api'"), `${name} must NOT import backend API services`);
      assert.ok(!content.includes('fetch(') && !content.includes('axios'), `${name} must NOT make HTTP requests`);
    }

    assert.ok(discover.includes("from '../data/mockEvents'"), 'DiscoverScreen must import mockEvents');
    assert.ok(categories.includes("from '../data/mockCategories'"), 'CategoriesScreen must import mockCategories');
  });

  test('DiscoverScreen contains exact design tokens, gradients, and carousel classes', () => {
    const content = fs.readFileSync(DISCOVER_PATH, 'utf8');
    const expectedClasses = [
      'grad-brand',
      'shadow-brand',
      'shadow-card',
      'bg-canvas',
      'border-line',
      'bg-subtle',
      'text-ink',
      'text-indigo',
      'text-coral',
      'rounded-[20px]',
      'h-[340px]',
      'transition-opacity'
    ];

    for (const cls of expectedClasses) {
      assert.ok(content.includes(cls), `DiscoverScreen.tsx missing design class/token: ${cls}`);
    }
  });

  test('CategoriesScreen contains exact grid, color, aspect-ratio, and tilted artwork classes', () => {
    const content = fs.readFileSync(CATEGORIES_PATH, 'utf8');
    const expectedClasses = [
      'aspect-[8/5]',
      'rounded-2xl',
      'overflow-hidden',
      'rotate-[25deg]',
      'shadow-xl',
      'hover:scale-[1.02]',
      'transition-transform',
      'bg-canvas'
    ];

    for (const cls of expectedClasses) {
      assert.ok(content.includes(cls), `CategoriesScreen.tsx missing design class/token: ${cls}`);
    }
  });
});

// ==============================================================================
// 2. DISCOVERSCREEN SSR & RENDER STRUCTURE VERIFICATION
// ==============================================================================
describe('Milestone 3 - DiscoverScreen SSR & Render Structure Verification', () => {
  test('DiscoverScreen renders cleanly via ReactDOMServer with 0 errors or warnings', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));
    assert.ok(html.length > 2000, 'Rendered HTML should have substantial content');
    assert.ok(html.includes('<section'), 'Rendered HTML must contain sections');
  });

  test('Hero carousel renders 3 major slides (Coldplay 2026, DWP 2026, Jakarta Jazz Festival 2027)', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));

    assert.ok(html.includes('COLDPLAY: Music of the Spheres'), 'Must render Coldplay slide title');
    assert.ok(html.includes('DJAKARTA WAREHOUSE'), 'Must render DWP slide title');
    assert.ok(html.includes('JAKARTA JAZZ'), 'Must render Jakarta Jazz Festival slide title');
  });

  test('Hero slide content overlay includes category badge, date, venue, starting price, and CTA', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));

    assert.ok(html.includes('On Sale Now — 8.500+ antrean tiket aktif'), 'Must render active queue badge');
    assert.ok(html.includes('14 November 2026'), 'Must render concert date');
    assert.ok(html.includes('Gelora Bung Karno'), 'Must render venue location');
    assert.ok(html.includes('Mulai dari Rp 750.000'), 'Must render starting price');
    assert.ok(html.includes('Lihat Detail Event'), 'Must render primary CTA button');
  });

  test('Hero carousel renders manual controls: previous button, next button, and 3 dot indicators', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));

    assert.ok(html.includes('aria-label="Sebelumnya"'), 'Must have Previous slide button with accessible label');
    assert.ok(html.includes('aria-label="Berikutnya"'), 'Must have Next slide button with accessible label');
    assert.ok(html.includes('aria-label="Slide 1"'), 'Must have Slide 1 dot indicator');
    assert.ok(html.includes('aria-label="Slide 2"'), 'Must have Slide 2 dot indicator');
    assert.ok(html.includes('aria-label="Slide 3"'), 'Must have Slide 3 dot indicator');
  });

  test('Popular events section renders header "Event Populer & Mendatang" and subtitle', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));

    assert.ok(
      html.includes('Event Populer &amp; Mendatang') || html.includes('Event Populer & Mendatang'),
      'Must render header title'
    );
    assert.ok(
      html.includes('Pilihan konser dan festival musik terbaik terkurasi di Indonesia'),
      'Must render section subtitle'
    );
    assert.ok(html.includes('Lihat semua'), 'Must render "Lihat semua" button');
  });

  test('Popular events section renders all 8 Indonesian events with badges, dates, venues, IDR pricing, and "Lihat Tiket"', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const html = ReactDOMServer.renderToString(React.createElement(DiscoverScreen));

    const expectedEvents = [
      { title: 'Ethereal Nights', artist: 'Tulus', price: 'Rp 450.000', badge: 'PRESALE AKTIF' },
      { title: 'Djakarta Warehouse Project', artist: 'Various Artists', price: 'Rp 1.250.000', badge: 'SISA SEDIKIT' },
      { title: 'The Eras Experience', artist: 'Symphony Orchestra', price: 'Rp 680.000', badge: 'PRESALE AKTIF' },
      { title: 'Jakarta Jazz Festival', artist: 'Various Legends', price: 'Rp 550.000', badge: 'SISA SEDIKIT' },
      { title: 'Neon Circuit Rave', artist: 'Alan Walker', price: 'Rp 850.000', badge: 'PRESALE AKTIF' },
      { title: 'Derby Ibu Kota', artist: 'Persija vs Persib', price: 'Rp 300.000', badge: 'PRESALE AKTIF' },
      { title: 'Soundrenaline 2027', artist: 'Various Artists', price: 'Rp 975.000', badge: 'PRESALE AKTIF' },
      { title: 'Klasik: Beethoven Night', artist: 'Jakarta Concert Orchestra', price: 'Rp 400.000', badge: 'SISA SEDIKIT' }
    ];

    for (const ev of expectedEvents) {
      assert.ok(html.includes(ev.title), `Must render event title: ${ev.title}`);
      assert.ok(html.includes(ev.artist), `Must render event artist: ${ev.artist}`);
      assert.ok(html.includes(ev.price), `Must render event price: ${ev.price}`);
      assert.ok(html.includes(ev.badge), `Must render event status badge: ${ev.badge}`);
    }

    // Verify 8 "Lihat Tiket" buttons
    const countLihatTiket = (html.match(/Lihat Tiket/g) || []).length;
    assert.strictEqual(countLihatTiket, 8, 'Must render exactly 8 "Lihat Tiket" buttons');
  });
});

// ==============================================================================
// 3. CATEGORIESSCREEN SSR & RENDER STRUCTURE VERIFICATION
// ==============================================================================
describe('Milestone 3 - CategoriesScreen SSR & Render Structure Verification', () => {
  test('CategoriesScreen renders cleanly via ReactDOMServer with 0 errors or warnings', async () => {
    const { CategoriesScreen } = await loadCategoriesComponent();
    const html = ReactDOMServer.renderToString(React.createElement(CategoriesScreen));
    assert.ok(html.length > 1000, 'CategoriesScreen rendered HTML should have substantial content');
  });

  test('CategoriesScreen renders header with title "Jelajahi Kategori Event" and subtitle', async () => {
    const { CategoriesScreen } = await loadCategoriesComponent();
    const html = ReactDOMServer.renderToString(React.createElement(CategoriesScreen));

    assert.ok(html.includes('Jelajahi Kategori Event'), 'Must render title "Jelajahi Kategori Event"');
    assert.ok(
      html.includes('Temukan event favoritmu berdasarkan kategori'),
      'Must render description subtitle'
    );
  });

  test('CategoriesScreen renders exactly 12 category visual cards with colors and tilted artwork', async () => {
    const { CategoriesScreen } = await loadCategoriesComponent();
    const html = ReactDOMServer.renderToString(React.createElement(CategoriesScreen));

    const expectedCategories = [
      'Konser',
      'Festival',
      'Olahraga',
      'Teater &amp; Seni',
      'Musik Indonesia',
      'K-pop',
      'EDM &amp; Electronic',
      'Jazz &amp; Klasik',
      'Trending',
      'Charts',
      'Stand-up Comedy',
      'Untuk Kamu'
    ];

    for (const cat of expectedCategories) {
      const normalizedCat = cat.replace('&amp;', '&');
      assert.ok(
        html.includes(cat) || html.includes(normalizedCat),
        `Must render category: ${normalizedCat}`
      );
    }

    // Check count indicators (e.g. "24 Event", "18 Event")
    assert.ok(html.includes('24 Event'), 'Must display event count for Konser');
    assert.ok(html.includes('18 Event'), 'Must display event count for Festival');
    assert.ok(html.includes('32 Event'), 'Must display event count for Musik Indonesia');

    // Check tilted artwork CSS class rotation
    const rotationMatches = (html.match(/rotate-\[25deg\]/g) || []).length;
    assert.strictEqual(rotationMatches, 12, 'All 12 category cards must have 25deg tilted artwork');
  });
});

// ==============================================================================
// 4. CAROUSEL AUTO-ROTATION & MANUAL CYCLING VERIFICATION
// ==============================================================================
describe('Milestone 3 - Hero Carousel Cycling & Behavioral State Verification', () => {
  test('Hero carousel registers 6000ms auto-rotation timer', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    DiscoverScreen({});
    assert.strictEqual(harness.getIntervalDelay(), 6000, 'Auto-rotation timer interval must be 6000ms');
  });

  test('Timer tick rotates carousel to next slide modulo slides count', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    DiscoverScreen({});
    assert.strictEqual(harness.getActiveSlideIndex(), 0, 'Initial slide is 0');

    harness.triggerInterval();
    assert.strictEqual(harness.getActiveSlideIndex(), 1, 'Tick 1 moves to slide 1');

    harness.triggerInterval();
    assert.strictEqual(harness.getActiveSlideIndex(), 2, 'Tick 2 moves to slide 2');

    harness.triggerInterval();
    assert.strictEqual(harness.getActiveSlideIndex(), 0, 'Tick 3 wraps around to slide 0');
  });

  test('Previous button click cycles backward modulo slides count', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    const tree = DiscoverScreen({});
    const heroSection = tree.props.children[0];
    const prevButton = heroSection.props.children[1];

    assert.strictEqual(prevButton.props['aria-label'], 'Sebelumnya');

    // Click Previous at slide 0 -> should wrap to slide 2
    prevButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 2, 'Clicking Previous at slide 0 wraps to slide 2');

    // Click Previous at slide 2 -> should move to slide 1
    prevButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 1, 'Clicking Previous at slide 2 moves to slide 1');
  });

  test('Next button click cycles forward modulo slides count', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    const tree = DiscoverScreen({});
    const heroSection = tree.props.children[0];
    const nextButton = heroSection.props.children[2];

    assert.strictEqual(nextButton.props['aria-label'], 'Berikutnya');

    // Click Next at slide 0 -> slide 1
    nextButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 1, 'Clicking Next moves from 0 to 1');

    // Click Next at slide 1 -> slide 2
    nextButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 2, 'Clicking Next moves from 1 to 2');

    // Click Next at slide 2 -> slide 0
    nextButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 0, 'Clicking Next at slide 2 wraps to 0');
  });

  test('Dot indicator click selects target slide directly', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    const tree = DiscoverScreen({});
    const heroSection = tree.props.children[0];
    const dotsContainer = heroSection.props.children[3];
    const dots = dotsContainer.props.children;

    assert.strictEqual(dots.length, 3, 'Must have 3 dot buttons');

    // Click dot 2 (index 2)
    dots[2].props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 2, 'Clicking dot 2 navigates to slide 2');

    // Click dot 1 (index 1)
    dots[1].props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 1, 'Clicking dot 1 navigates to slide 1');
  });
});

// ==============================================================================
// 5. NAVIGATION & CLICK INTERACTIONS VERIFICATION
// ==============================================================================
describe('Milestone 3 - Navigation & Click Interactions Verification', () => {
  test('Clicking hero CTA "Lihat Detail Event" calls onNavigate("detail", slide.id)', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);
    let navigatedScreen = null;
    let navigatedEventId = null;

    const onNavigate = (screen, eventId) => {
      navigatedScreen = screen;
      navigatedEventId = eventId;
    };

    const tree = DiscoverScreen({ onNavigate });
    const heroSection = tree.props.children[0];
    const slides = heroSection.props.children[0];
    const firstSlide = slides[0];

    // Find CTA button inside slide content: [bgImage, overlay, content]
    const slideContent = firstSlide.props.children[2];
    const ctaButton = slideContent.props.children[4];

    assert.ok(
      ctaButton.props['aria-label'] === 'Lihat Detail Event' ||
      JSON.stringify(ctaButton).includes('Lihat Detail Event'),
      'CTA button must have "Lihat Detail Event"'
    );
    ctaButton.props.onClick();

    assert.strictEqual(navigatedScreen, 'detail', 'Clicking CTA must navigate to detail screen');
    assert.strictEqual(navigatedEventId, 'coldplay-2026', 'Clicking CTA on slide 0 must pass coldplay-2026 eventId');
  });

  test('Clicking popular event card navigates to "detail" with eventId', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);
    let navigatedScreen = null;
    let navigatedEventId = null;

    const onNavigate = (screen, eventId) => {
      navigatedScreen = screen;
      navigatedEventId = eventId;
    };

    const tree = DiscoverScreen({ onNavigate });
    const popularSection = tree.props.children[1];
    const grid = popularSection.props.children[1];
    const firstEventCard = grid.props.children[0];

    firstEventCard.props.onClick();
    assert.strictEqual(navigatedScreen, 'detail', 'Clicking card must navigate to detail');
    assert.strictEqual(navigatedEventId, 'ethereal-nights', 'Clicking first card must pass ethereal-nights');
  });

  test('Clicking "Lihat Tiket" button on event card navigates to "detail" with eventId and stops propagation', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);
    let navigatedScreen = null;
    let navigatedEventId = null;

    const onNavigate = (screen, eventId) => {
      navigatedScreen = screen;
      navigatedEventId = eventId;
    };

    const tree = DiscoverScreen({ onNavigate });
    const popularSection = tree.props.children[1];
    const grid = popularSection.props.children[1];
    const secondEventCard = grid.props.children[1]; // DWP 2026

    // Find "Lihat Tiket" button in card body footer
    const cardBody = secondEventCard.props.children[1];
    const footer = cardBody.props.children[3];
    const lihatTiketBtn = footer.props.children[1];

    let stopped = false;
    lihatTiketBtn.props.onClick({
      stopPropagation: () => { stopped = true; }
    });

    assert.strictEqual(stopped, true, 'Clicking Lihat Tiket must stop event propagation');
    assert.strictEqual(navigatedScreen, 'detail', 'Clicking Lihat Tiket must navigate to detail');
    assert.strictEqual(navigatedEventId, 'dwp-2026', 'Clicking Lihat Tiket on DWP card must pass dwp-2026');
  });

  test('Clicking "Lihat semua" in popular events header navigates to "categories"', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);
    let navigatedScreen = null;

    const onNavigate = (screen) => {
      navigatedScreen = screen;
    };

    const tree = DiscoverScreen({ onNavigate });
    const popularSection = tree.props.children[1];
    const header = popularSection.props.children[0];
    const lihatSemuaBtn = header.props.children[1];

    lihatSemuaBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'categories', 'Clicking Lihat semua must navigate to categories');
  });

  test('Clicking any of the 12 category cards navigates to "discover"', async () => {
    const harness = createInteractiveHarness();
    const { CategoriesScreen } = await loadCategoriesComponent(harness.mockReact);
    let navigatedScreen = null;

    const onNavigate = (screen) => {
      navigatedScreen = screen;
    };

    const tree = CategoriesScreen({ onNavigate });
    const grid = tree.props.children[1];
    const cards = grid.props.children;

    assert.strictEqual(cards.length, 12, 'Must have 12 category cards');

    // Click Konser (card 0)
    cards[0].props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Konser category must navigate to discover');

    // Click Olahraga (card 2)
    navigatedScreen = null;
    cards[2].props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Olahraga category must navigate to discover');

    // Click Untuk Kamu (card 11)
    navigatedScreen = null;
    cards[11].props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Clicking Untuk Kamu category must navigate to discover');
  });
});

// ==============================================================================
// 6. NAVIGATIONCONTEXT INTEGRATION & FALLBACK VERIFICATION
// ==============================================================================
describe('Milestone 3 - NavigationContext Integration & Fallback Verification', () => {
  test('DiscoverScreen and CategoriesScreen work seamlessly within NavigationProvider', async () => {
    const { NavigationProvider } = await loadNavModule();
    const { DiscoverScreen } = await loadDiscoverComponent();
    const { CategoriesScreen } = await loadCategoriesComponent();

    const discoverHtml = ReactDOMServer.renderToString(
      React.createElement(NavigationProvider, null, React.createElement(DiscoverScreen))
    );
    assert.ok(
      discoverHtml.includes('COLDPLAY: Music of the Spheres'),
      'DiscoverScreen renders inside NavigationProvider'
    );

    const categoriesHtml = ReactDOMServer.renderToString(
      React.createElement(NavigationProvider, null, React.createElement(CategoriesScreen))
    );
    assert.ok(
      categoriesHtml.includes('Jelajahi Kategori Event'),
      'CategoriesScreen renders inside NavigationProvider'
    );
  });

  test('DiscoverScreen and CategoriesScreen fall back gracefully without NavigationProvider', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();
    const { CategoriesScreen } = await loadCategoriesComponent();

    let navigated = null;
    const discoverHtml = ReactDOMServer.renderToString(
      React.createElement(DiscoverScreen, { onNavigate: (s) => { navigated = s; } })
    );
    assert.ok(discoverHtml.length > 1000, 'DiscoverScreen renders without NavigationProvider');

    const categoriesHtml = ReactDOMServer.renderToString(
      React.createElement(CategoriesScreen, { onNavigate: (s) => { navigated = s; } })
    );
    assert.ok(categoriesHtml.length > 500, 'CategoriesScreen renders without NavigationProvider');
  });
});

// ==============================================================================
// 7. ADVERSARIAL EDGE CASES & BOUNDARY CONDITIONS VERIFICATION
// ==============================================================================
describe('Milestone 3 - Adversarial Edge Cases & Boundary Conditions', () => {
  test('DiscoverScreen handles custom slides array of length 1 safely', async () => {
    const harness = createInteractiveHarness();
    const { DiscoverScreen } = await loadDiscoverComponent(harness.mockReact);

    const singleSlide = [
      {
        id: 'solo-show',
        badge: 'Tiket Eksklusif',
        title: 'Solo Acoustic Night',
        meta: '20 Des 2026 • Teater Jakarta',
        img: 'https://example.com/solo.jpg',
        overlay: 'from-blue-900 to-transparent'
      }
    ];

    const tree = DiscoverScreen({ slides: singleSlide });
    const heroSection = tree.props.children[0];
    const prevButton = heroSection.props.children[1];
    const nextButton = heroSection.props.children[2];

    assert.strictEqual(harness.getActiveSlideIndex(), 0);

    // Prev on single slide stays at 0
    prevButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 0);

    // Next on single slide stays at 0
    nextButton.props.onClick();
    assert.strictEqual(harness.getActiveSlideIndex(), 0);

    // Timer tick on single slide stays at 0
    harness.triggerInterval();
    assert.strictEqual(harness.getActiveSlideIndex(), 0);
  });

  test('DiscoverScreen handles custom events with minimal fields and no status badge', async () => {
    const { DiscoverScreen } = await loadDiscoverComponent();

    const minimalEvents = [
      {
        id: 'indie-gig',
        title: 'Indie Gig Volume 1',
        category: 'Konser',
        date: '10 Jan 2027',
        venue: 'M Bloc Space',
        priceStart: 150000,
        img: 'https://example.com/indie.jpg',
        description: 'Indie music night'
      }
    ];

    const html = ReactDOMServer.renderToString(
      React.createElement(DiscoverScreen, { popularEvents: minimalEvents })
    );

    assert.ok(html.includes('Indie Gig Volume 1'), 'Renders custom title');
    assert.ok(html.includes('Rp 150.000'), 'Formats price from priceStart');
    assert.ok(html.includes('M Bloc Space'), 'Renders venue');
  });

  test('CategoriesScreen handles custom categories with missing count and fallback image', async () => {
    const { CategoriesScreen } = await loadCategoriesComponent();

    const customCategories = [
      {
        id: 'workshop',
        name: 'Workshop & Edukasi',
        label: 'Workshop & Edukasi',
        color: '#10b981',
        img: 'https://example.com/workshop.jpg'
      }
    ];

    const html = ReactDOMServer.renderToString(
      React.createElement(CategoriesScreen, { categories: customCategories })
    );

    assert.ok(html.includes('Workshop &amp; Edukasi') || html.includes('Workshop & Edukasi'), 'Renders custom category name');
    assert.ok(html.includes('Event Aktif'), 'Falls back to Event Aktif when count is undefined or 0');
    assert.ok(html.includes('background-color:#10b981'), 'Applies custom color');
  });

  test('Timer unmount cleanup clears registered interval', async () => {
    let cleared = false;
    let registeredCallback = null;

    const mockReact = {
      ...React,
      useState: (initial) => [initial, () => {}],
      useCallback: (fn) => fn,
      useMemo: (fn) => fn(),
      useRef: (initial) => ({ current: initial }),
      useEffect: (effect) => {
        const originalSetInterval = global.setInterval;
        const originalClearInterval = global.clearInterval;

        global.setInterval = (cb) => {
          registeredCallback = cb;
          return 777;
        };
        global.clearInterval = (id) => {
          if (id === 777) cleared = true;
        };

        const cleanup = effect();
        if (typeof cleanup === 'function') {
          cleanup();
        }

        global.setInterval = originalSetInterval;
        global.clearInterval = originalClearInterval;
      },
      useContext: () => null
    };

    const { DiscoverScreen } = await loadDiscoverComponent(mockReact);
    DiscoverScreen({});
    assert.strictEqual(cleared, true, 'Unmounting DiscoverScreen must clear carousel interval');
  });
});

