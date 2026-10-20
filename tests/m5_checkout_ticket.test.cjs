/**
 * Automated Verification Suite for Milestone 5 - TickId Desktop Application
 * Tests:
 *  - QrCode: Algorithmic SVG 25x25 QR code generator, 3 finder patterns, center brand badge, seed determinism.
 *  - CheckoutModal: QRIS modal overlay, 5-minute countdown timer, buyer KYC summary, supported e-wallets,
 *    order breakdown (tax 10%, service fee Rp 35k), "Simulasi Bayar ✓" navigation to 'tickets',
 *    "Batalkan & Lepas Kursi", and backdrop dismissal.
 *  - ETicketScreen: High-fidelity boarding-pass ticket, reference ID #TICK-ID-98214, success notice,
 *    concert details, buyer KYC badge, perforated divider, gate scan QR code, 58 animated barcode bars,
 *    anti-screenshot notice, action CTAs, and return to 'discover'.
 *  - App: Master application shell coordinating NavigationProvider, BookingProvider, Header,
 *    screen switching across all 5 screens, and modal overlay without backend dependencies.
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
const QR_CODE_PATH = path.join(ROOT_DIR, 'src', 'components', 'QrCode.tsx');
const CHECKOUT_MODAL_PATH = path.join(ROOT_DIR, 'src', 'components', 'CheckoutModal.tsx');
const ETICKET_SCREEN_PATH = path.join(ROOT_DIR, 'src', 'screens', 'ETicketScreen.tsx');
const APP_PATH = path.join(ROOT_DIR, 'src', 'App.tsx');
const NAV_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx');
const BOOKING_CONTEXT_PATH = path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx');

let cachedQrCode = null;
let cachedCheckoutModal = null;
let cachedETicketScreen = null;
let cachedApp = null;
let cachedNavContext = null;
let cachedBookingContext = null;

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
describe('Milestone 5 - Static Quality & Clean Architecture Verification', () => {
  test('all required M5 source files exist', () => {
    assert.strictEqual(fs.existsSync(QR_CODE_PATH), true, 'QrCode.tsx must exist');
    assert.strictEqual(fs.existsSync(CHECKOUT_MODAL_PATH), true, 'CheckoutModal.tsx must exist');
    assert.strictEqual(fs.existsSync(ETICKET_SCREEN_PATH), true, 'ETicketScreen.tsx must exist');
    assert.strictEqual(fs.existsSync(APP_PATH), true, 'App.tsx must exist');
  });

  test('QrCode exports both named and default', () => {
    const content = fs.readFileSync(QR_CODE_PATH, 'utf-8');
    assert.match(content, /export const QrCode/, 'Named QrCode export required');
    assert.match(content, /export default QrCode/, 'Default QrCode export required');
  });

  test('CheckoutModal exports both named and default', () => {
    const content = fs.readFileSync(CHECKOUT_MODAL_PATH, 'utf-8');
    assert.match(content, /export const CheckoutModal/, 'Named CheckoutModal export required');
    assert.match(content, /export default CheckoutModal/, 'Default CheckoutModal export required');
  });

  test('ETicketScreen exports both named and default', () => {
    const content = fs.readFileSync(ETICKET_SCREEN_PATH, 'utf-8');
    assert.match(content, /export const ETicketScreen/, 'Named ETicketScreen export required');
    assert.match(content, /export default ETicketScreen/, 'Default ETicketScreen export required');
  });

  test('App exports both named and default', () => {
    const content = fs.readFileSync(APP_PATH, 'utf-8');
    assert.match(content, /export function App/, 'Named App export required');
    assert.match(content, /export default App/, 'Default App export required');
  });

  test('adheres to Clean Architecture: 0 backend API calls', () => {
    [QR_CODE_PATH, CHECKOUT_MODAL_PATH, ETICKET_SCREEN_PATH, APP_PATH].forEach((file) => {
      const content = fs.readFileSync(file, 'utf-8');
      assert.doesNotMatch(content, /fetch\s*\(/, `${file} must not call fetch()`);
      assert.doesNotMatch(content, /axios/, `${file} must not import axios`);
      assert.doesNotMatch(content, /XMLHttpRequest/, `${file} must not use XMLHttpRequest`);
      assert.doesNotMatch(content, /from\s+['"].*services\/api['"]/, `${file} must not couple to services/api`);
    });
  });
});

// -----------------------------------------------------------------------------
// Suite 2: QrCode Component Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - QrCode Component Verification', async () => {
  if (!cachedQrCode) cachedQrCode = await compileBundle(QR_CODE_PATH);
  const { QrCode } = await loadComponent(cachedQrCode);

  test('renders valid SVG element with 25x25 viewBox and accessible role', () => {
    const html = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 190, seed: 21 }));
    assert.ok(html.includes('<svg'), 'Must render SVG element');
    assert.ok(html.includes('viewBox="0 0 25 25"'), 'Must have 0 0 25 25 viewBox');
    assert.ok(html.includes('width="190"'), 'Default width must be 190');
    assert.ok(html.includes('height="190"'), 'Default height must be 190');
    assert.ok(html.includes('role="img"'), 'Must have role="img"');
    assert.ok(html.includes('aria-label="QR Code Matrix"'), 'Must have aria-label');
  });

  test('renders 3 corner position detection patterns (7x7 outer, 5x5 white, 3x3 black)', () => {
    const html = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 190, seed: 21 }));
    // Top-left finder at (0,0): (0,0) is outer border, (1,1) is white, (2,2) is inner square
    assert.ok(html.includes('x="0" y="0"'), 'Top-left outer corner must be dark');
    assert.ok(!html.includes('x="1" y="1"'), 'Top-left ring (1,1) must be white (not rendered)');
    assert.ok(html.includes('x="2" y="2"'), 'Top-left inner square (2,2) must be dark');

    // Top-right finder at (18,0): (18,0) is outer border, (19,1) is white, (20,2) is inner square
    assert.ok(html.includes('x="18" y="0"'), 'Top-right outer corner must be dark');
    assert.ok(!html.includes('x="19" y="1"'), 'Top-right ring (19,1) must be white');
    assert.ok(html.includes('x="20" y="2"'), 'Top-right inner square (20,2) must be dark');

    // Bottom-left finder at (0,18): (0,18) is outer border, (1,19) is white, (2,20) is inner square
    assert.ok(html.includes('x="0" y="18"'), 'Bottom-left outer corner must be dark');
    assert.ok(!html.includes('x="1" y="19"'), 'Bottom-left ring (1,19) must be white');
    assert.ok(html.includes('x="2" y="20"'), 'Bottom-left inner square (2,20) must be dark');
  });

  test('renders center brand badge (Ticket icon / stylized mark) in center 5x5 region', () => {
    const html = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 190, seed: 21 }));
    assert.ok(html.includes('qr-brand-badge'), 'Must include center brand badge container');
    assert.ok(html.includes('fill="#4f46e5"'), 'Must render indigo ticket icon');
    assert.ok(html.includes('circle'), 'Must render ticket perforation notches');
  });

  test('seed determinism: same seed produces identical output; different seed produces different output', () => {
    const html1 = ReactDOMServer.renderToString(React.createElement(QrCode, { seed: 42 }));
    const html2 = ReactDOMServer.renderToString(React.createElement(QrCode, { seed: 42 }));
    const html3 = ReactDOMServer.renderToString(React.createElement(QrCode, { seed: 999 }));

    assert.strictEqual(html1, html2, 'Identical seeds must produce identical SVG output');
    assert.notStrictEqual(html1, html3, 'Different seeds must produce different QR data modules');
  });

  test('custom size and className props apply correctly', () => {
    const html = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 140, className: 'custom-qr-class' }));
    assert.ok(html.includes('width="140"'), 'Custom width should be 140');
    assert.ok(html.includes('height="140"'), 'Custom height should be 140');
    assert.ok(html.includes('custom-qr-class'), 'Custom className must be applied');
  });
});

// -----------------------------------------------------------------------------
// Suite 3: CheckoutModal Component SSR & Structure Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - CheckoutModal SSR & Structure Verification', async () => {
  if (!cachedCheckoutModal) cachedCheckoutModal = await compileBundle(CHECKOUT_MODAL_PATH);
  const { CheckoutModal } = await loadComponent(cachedCheckoutModal);

  test('renders cleanly via ReactDOMServer with 0 errors', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('checkout-modal-card'), 'Must contain modal card');
    assert.ok(html.includes('backdrop-blur-sm'), 'Must have backdrop blur');
  });

  test('renders top bar with title "Pembayaran QRIS Instan", timer, and Close button', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('Pembayaran QRIS Instan'), 'Must display title "Pembayaran QRIS Instan"');
    assert.ok(html.includes('countdown-timer'), 'Must display countdown timer element');
    assert.ok(html.includes('btn-close-modal'), 'Must render Close (X) button');
  });

  test('renders dynamic QRIS code container with QrCode and "Unduh QR Code" button', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('qris-code-container'), 'Must render QRIS code container');
    assert.ok(html.includes('qr-code-svg'), 'Must render QrCode component inside modal');
    assert.ok(html.includes('btn-download-qris'), 'Must render "Unduh QR Code" button');
    assert.ok(html.includes('Unduh QR Code'), 'Must have button text "Unduh QR Code"');
    assert.ok(html.includes('ID1020268892110'), 'Must include official NMID');
  });

  test('renders all 6 supported e-wallets list badges (GoPay, OVO, DANA, BCA, Livin\' Mandiri, ShopeePay)', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('GoPay'), 'Must include GoPay badge');
    assert.ok(html.includes('OVO'), 'Must include OVO badge');
    assert.ok(html.includes('DANA'), 'Must include DANA badge');
    assert.ok(html.includes('BCA'), 'Must include BCA badge');
    assert.ok(html.includes("Livin&#39; Mandiri") || html.includes("Livin' Mandiri") || html.includes('Livin'), 'Must include Livin\' Mandiri badge');
    assert.ok(html.includes('ShopeePay'), 'Must include ShopeePay badge');
  });

  test('renders buyer details summary with name, email, phone, and "KYC Terverifikasi" badge', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('Fajrul Rahman'), 'Must display buyer name "Fajrul Rahman"');
    assert.ok(html.includes('fajrul@example.com'), 'Must display buyer email');
    assert.ok(html.includes('+62 812-3456-7890'), 'Must display buyer phone');
    assert.ok(html.includes('KYC Terverifikasi'), 'Must display "KYC Terverifikasi" badge');
  });

  test('renders order totals breakdown: Subtotal, Pajak Hiburan 10%, Biaya Layanan Rp 35.000, Total Pembayaran', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('Subtotal Tiket'), 'Must display Subtotal Tiket');
    assert.ok(html.includes('Pajak Hiburan 10%'), 'Must display Pajak Hiburan 10%');
    assert.ok(html.includes('Biaya Layanan'), 'Must display Biaya Layanan');
    assert.ok(html.includes('Total Pembayaran'), 'Must display Total Pembayaran');
    assert.ok(html.includes('35.000'), 'Must display service fee Rp 35.000');
  });

  test('renders action buttons: "Simulasi Bayar ✓" and "Batalkan & Lepas Kursi"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: true }));
    assert.ok(html.includes('btn-simulate-pay'), 'Must render primary simulate pay button');
    assert.ok(html.includes('Simulasi Bayar ✓'), 'Must include button label "Simulasi Bayar ✓"');
    assert.ok(html.includes('btn-cancel-release'), 'Must render cancel and release button');
    assert.ok(html.includes('Batalkan &amp; Lepas Kursi') || html.includes('Batalkan & Lepas Kursi'), 'Must include cancel button text');
  });

  test('modal returns null when isOpen is explicitly false', () => {
    const html = ReactDOMServer.renderToString(React.createElement(CheckoutModal, { isOpen: false }));
    assert.strictEqual(html, '', 'Must render empty string when closed');
  });
});

// -----------------------------------------------------------------------------
// Suite 4: CheckoutModal Interactive & State Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - CheckoutModal Interactive Verification', async () => {
  if (!cachedCheckoutModal) cachedCheckoutModal = await compileBundle(CHECKOUT_MODAL_PATH);
  const harness = createHarness();
  const { CheckoutModal } = await loadComponent(cachedCheckoutModal, harness.mockReact);

  test('clicking "Simulasi Bayar ✓" calls onSuccess callback', () => {
    let successCalled = false;
    const vnode = CheckoutModal({
      isOpen: true,
      onSuccess: () => {
        successCalled = true;
      }
    });

    function findButton(node, className) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes(className)) {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findButton(child, className);
          if (found) return found;
        }
      }
      return null;
    }

    const payBtn = findButton(vnode, 'btn-simulate-pay');
    assert.ok(payBtn, 'Should find Simulasi Bayar button');
    payBtn.props.onClick();
    assert.strictEqual(successCalled, true, 'Simulasi Bayar click must trigger onSuccess callback');
  });

  test('clicking "Batalkan & Lepas Kursi" calls onCancel and onClose callbacks', () => {
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

    function findButton(node, className) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes(className)) {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findButton(child, className);
          if (found) return found;
        }
      }
      return null;
    }

    const cancelBtn = findButton(vnode, 'btn-cancel-release');
    assert.ok(cancelBtn, 'Should find cancel button');
    cancelBtn.props.onClick();
    assert.strictEqual(cancelCalled, true, 'Cancel click must trigger onCancel');
    assert.strictEqual(closeCalled, true, 'Cancel click must trigger onClose');
  });

  test('clicking Close (X) button calls onClose callback', () => {
    let closeCalled = false;
    const vnode = CheckoutModal({
      isOpen: true,
      onClose: () => {
        closeCalled = true;
      }
    });

    function findButton(node, className) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes(className)) {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findButton(child, className);
          if (found) return found;
        }
      }
      return null;
    }

    const closeBtn = findButton(vnode, 'btn-close-modal');
    assert.ok(closeBtn, 'Should find Close button');
    closeBtn.props.onClick();
    assert.strictEqual(closeCalled, true, 'Close button click must trigger onClose');
  });

  test('clicking backdrop overlay calls onClose callback', () => {
    let closeCalled = false;
    const vnode = CheckoutModal({
      isOpen: true,
      onClose: () => {
        closeCalled = true;
      }
    });

    // The root backdrop container
    assert.ok(vnode.props && typeof vnode.props.onClick === 'function', 'Root backdrop must have onClick handler');
    vnode.props.onClick();
    assert.strictEqual(closeCalled, true, 'Backdrop click must trigger onClose');
  });

  test('clicking inside modal card stops propagation (does not close)', () => {
    const vnode = CheckoutModal({
      isOpen: true,
      onClose: () => {}
    });

    // The modal card child
    const modalCard = vnode.props.children;
    assert.ok(modalCard.props && typeof modalCard.props.onClick === 'function', 'Modal card must have stopPropagation handler');

    let stopped = false;
    modalCard.props.onClick({
      stopPropagation: () => {
        stopped = true;
      }
    });
    assert.strictEqual(stopped, true, 'Click inside modal card must stopPropagation');
  });
});

// -----------------------------------------------------------------------------
// Suite 5: ETicketScreen SSR & Render Structure Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - ETicketScreen SSR & Render Structure Verification', async () => {
  if (!cachedETicketScreen) cachedETicketScreen = await compileBundle(ETICKET_SCREEN_PATH);
  const { ETicketScreen } = await loadComponent(cachedETicketScreen);

  test('renders cleanly via ReactDOMServer with 0 errors', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('eticket-screen'), 'Must render eticket-screen container');
    assert.ok(html.includes('boarding-pass-card'), 'Must render boarding-pass-card');
  });

  test('renders reference ID #TICK-ID-98214 in header and card', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('#TICK-ID-98214'), 'Must render official reference ID #TICK-ID-98214');
  });

  test('renders success alert notice: "Pembayaran Berhasil! E-Ticket Aktif"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('Pembayaran Berhasil! E-Ticket Aktif'), 'Must include success alert title');
    assert.ok(html.includes('success-alert-banner'), 'Must render alert banner container');
  });

  test('renders concert details: Title, Date (15 November 2026), Venue (GBK), Gate (Gate 3 — Buka 17:00 WIB)', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('Coldplay Music of the Spheres World Tour 2026'), 'Must render concert title');
    assert.ok(html.includes('15 November 2026'), 'Must render concert date 15 November 2026');
    assert.ok(html.includes('Stadion Utama Gelora Bung Karno'), 'Must render GBK venue');
    assert.ok(html.includes('Gate 3 — Buka 17:00 WIB'), 'Must render Gate 3 — Buka 17:00 WIB');
  });

  test('renders buyer KYC badge ("KYC Terverifikasi") and buyer name ("Fajrul Rahman")', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('Fajrul Rahman'), 'Must display buyer name Fajrul Rahman');
    assert.ok(html.includes('KYC Terverifikasi'), 'Must render KYC Terverifikasi badge');
  });

  test('renders tier name (CAT 1 — VIP) and seats list', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('CAT 1 — VIP') || html.includes('CAT 1 VIP'), 'Must render tier name');
    assert.ok(html.includes('NOMOR KURSI'), 'Must include seat numbers label');
  });

  test('renders perforated ticket divider with semicircles and dashed line', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('border-dashed'), 'Must render dashed perforation line');
    assert.ok(html.includes('rounded-full'), 'Must render circular notch cutouts');
  });

  test('renders gate scan dynamic QR code (<QrCode size={140} seed={21} />) with label "Scan di Pintu Masuk"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('Scan di Pintu Masuk'), 'Must include label "Scan di Pintu Masuk"');
    assert.ok(html.includes('SCAN DI GATE'), 'Must include label "SCAN DI GATE"');
    assert.ok(html.includes('width="140"'), 'Gate QR code must have size 140');
    assert.ok(html.includes('height="140"'), 'Gate QR code must have size 140');
  });

  test('renders animated barcode bars (exactly 58 bars with breathe micro-animation)', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('barcode-container'), 'Must render barcode container');
    assert.ok(html.includes('breathe'), 'Must apply breathe micro-animation class');
    const matches = html.match(/barcode-bar/g);
    assert.ok(matches && matches.length === 58, `Must render exactly 58 barcode bars (found ${matches ? matches.length : 0})`);
  });

  test('renders anti-screenshot notice text', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(
      html.includes('Dilarang mengambil tangkapan layar (screenshot). Tunjukkan e-ticket langsung dari aplikasi saat masuk gate.'),
      'Must render anti-screenshot warning notice'
    );
  });

  test('renders action buttons: "Simpan ke Wallet", "Unduh PDF", "Kirim ke Email"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('btn-save-wallet'), 'Must render Simpan ke Wallet button');
    assert.ok(html.includes('Simpan ke Wallet'), 'Must contain text "Simpan ke Wallet"');
    assert.ok(html.includes('btn-download-pdf'), 'Must render Unduh PDF button');
    assert.ok(html.includes('Unduh PDF'), 'Must contain text "Unduh PDF"');
    assert.ok(html.includes('btn-email-ticket'), 'Must render Kirim ke Email button');
    assert.ok(html.includes('Kirim ke Email'), 'Must contain text "Kirim ke Email"');
  });

  test('renders return button "Kembali ke Beranda"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(ETicketScreen));
    assert.ok(html.includes('btn-back-home'), 'Must render return button');
    assert.ok(html.includes('Kembali ke Beranda'), 'Must include text "Kembali ke Beranda"');
  });
});

// -----------------------------------------------------------------------------
// Suite 6: ETicketScreen Interactive & Navigation Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - ETicketScreen Interactive Verification', async () => {
  if (!cachedETicketScreen) cachedETicketScreen = await compileBundle(ETICKET_SCREEN_PATH);
  const harness = createHarness();
  const { ETicketScreen } = await loadComponent(cachedETicketScreen, harness.mockReact);

  test('clicking "Kembali ke Beranda" calls onNavigate("discover")', () => {
    let navigatedScreen = null;
    const vnode = ETicketScreen({
      onNavigate: (screen) => {
        navigatedScreen = screen;
      }
    });

    function findButton(node, className) {
      if (!node) return null;
      if (node.props && node.props.className && node.props.className.includes(className)) {
        return node;
      }
      if (node.props && node.props.children) {
        const children = Array.isArray(node.props.children) ? node.props.children : [node.props.children];
        for (const child of children) {
          const found = findButton(child, className);
          if (found) return found;
        }
      }
      return null;
    }

    const backBtn = findButton(vnode, 'btn-back-home');
    assert.ok(backBtn, 'Should find Kembali ke Beranda button');
    backBtn.props.onClick();
    assert.strictEqual(navigatedScreen, 'discover', 'Return button must navigate to "discover"');
  });
});

// -----------------------------------------------------------------------------
// Suite 7: Master App Integration Shell Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - Master App Integration Shell Verification', async () => {
  if (!cachedApp) cachedApp = await compileBundle(APP_PATH);
  const { App } = await loadComponent(cachedApp);

  test('App renders cleanly via ReactDOMServer with 0 errors', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App));
    assert.ok(html.includes('app-container'), 'Must render app-container root');
    assert.ok(html.includes('main-content-region'), 'Must render main-content-region');
  });

  test('App renders Header component with brand logo and navigation controls', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App));
    assert.ok(html.includes('<header'), 'Must render <header> element');
    assert.ok(html.includes('TickId'), 'Must render brand name TickId');
    assert.ok(html.includes('Jakarta, ID'), 'Must render location badge');
  });

  test('App renders DiscoverScreen by default (initialScreen: discover)', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'discover' }));
    assert.ok(html.includes('Lihat Detail Event'), 'Must render DiscoverScreen hero CTA');
    assert.ok(html.includes('Event Populer &amp; Mendatang') || html.includes('Event Populer & Mendatang'), 'Must render popular events section');
  });

  test('App renders CategoriesScreen when initialScreen is "categories"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'categories' }));
    assert.ok(html.includes('Jelajahi Kategori Event'), 'Must render Categories title');
    assert.ok(html.includes('Temukan event favoritmu'), 'Must render Categories subtitle');
  });

  test('App renders EventDetailScreen when initialScreen is "detail"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'detail' }));
    assert.ok(html.includes('event-detail-screen'), 'Must render EventDetailScreen container');
    assert.ok(html.includes('Konser Ramah Lingkungan'), 'Must render eco badge');
  });

  test('App renders SeatMapScreen when initialScreen is "seatmap"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'seatmap' }));
    assert.ok(html.includes('seat-map-screen'), 'Must render SeatMapScreen container');
    assert.ok(html.includes('8.420 antrean aktif'), 'Must render attendee badge');
  });

  test('App renders ETicketScreen when initialScreen is "tickets"', () => {
    const html = ReactDOMServer.renderToString(React.createElement(App, { initialScreen: 'tickets' }));
    assert.ok(html.includes('eticket-screen'), 'Must render ETicketScreen container');
    assert.ok(html.includes('Pembayaran Berhasil! E-Ticket Aktif'), 'Must render success banner');
    assert.ok(html.includes('#TICK-ID-98214'), 'Must render reference ID');
  });
});

// -----------------------------------------------------------------------------
// Suite 8: Adversarial & Edge Case Verification
// -----------------------------------------------------------------------------
describe('Milestone 5 - Adversarial & Edge Case Verification', async () => {
  if (!cachedQrCode) cachedQrCode = await compileBundle(QR_CODE_PATH);
  const { QrCode } = await loadComponent(cachedQrCode);

  test('QrCode handles edge seed values (0, negative, large) without NaN or throw', () => {
    assert.doesNotThrow(() => {
      ReactDOMServer.renderToString(React.createElement(QrCode, { seed: 0 }));
      ReactDOMServer.renderToString(React.createElement(QrCode, { seed: -123 }));
      ReactDOMServer.renderToString(React.createElement(QrCode, { seed: 999999999 }));
    });
  });

  test('QrCode handles extreme sizes gracefully', () => {
    const htmlSmall = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 50 }));
    assert.ok(htmlSmall.includes('width="50"'), 'Small size 50 should render');
    const htmlLarge = ReactDOMServer.renderToString(React.createElement(QrCode, { size: 600 }));
    assert.ok(htmlLarge.includes('width="600"'), 'Large size 600 should render');
  });
});
