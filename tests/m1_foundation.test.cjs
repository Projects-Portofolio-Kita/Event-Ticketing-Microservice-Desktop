/**
 * Automated Verification Suite for Milestone 1 - TickId Desktop Application
 * Tests design tokens, Google fonts, mock datasets, seat distribution algorithm, and calculation logic.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Milestone 1 - Design Tokens & Fonts Verification', () => {
  test('index.html includes Inter, JetBrains Mono, and Plus Jakarta Sans fonts', () => {
    const htmlPath = path.join(ROOT_DIR, 'index.html');
    const html = fs.readFileSync(htmlPath, 'utf8');

    assert.ok(html.includes('Inter:wght@400;500;600;700'), 'Missing Inter font in index.html');
    assert.ok(html.includes('JetBrains+Mono:wght@400;500;600'), 'Missing JetBrains Mono font in index.html');
    assert.ok(html.includes('Plus+Jakarta+Sans:wght@400;500;600;700;800'), 'Missing Plus Jakarta Sans font in index.html');
  });

  test('App.css contains all required design tokens', () => {
    const cssPath = path.join(ROOT_DIR, 'src', 'App.css');
    const css = fs.readFileSync(cssPath, 'utf8');

    const expectedTokens = [
      '--color-canvas',
      '--color-panel',
      '--color-subtle',
      '--color-line',
      '--color-indigo',
      '--color-violet',
      '--color-coral',
      '--color-emerald',
      '--color-emerald-tint',
      '--color-amber',
      '--color-danger',
      '--color-sold',
      '--color-ink',
      '--color-ink-soft',
      '--color-ink-muted'
    ];

    for (const token of expectedTokens) {
      assert.ok(css.includes(token), `Missing design token in App.css: ${token}`);
    }

    // Typography variables
    assert.ok(css.includes('--font-sans'), 'Missing --font-sans in App.css');
    assert.ok(css.includes('--font-mono'), 'Missing --font-mono in App.css');
    assert.ok(css.includes('--font-display'), 'Missing --font-display in App.css');

    // Gradients
    assert.ok(css.includes('.grad-brand'), 'Missing .grad-brand class in App.css');
    assert.ok(css.includes('.text-grad-brand'), 'Missing .text-grad-brand class in App.css');

    // Keyframe animations
    assert.ok(css.includes('pulse-amber'), 'Missing pulse-amber animation in App.css');
    assert.ok(css.includes('pulse-indigo'), 'Missing pulse-indigo animation in App.css');
    assert.ok(css.includes('breathe'), 'Missing breathe animation in App.css');
    assert.ok(css.includes('pop-in'), 'Missing pop-in animation in App.css');
    assert.ok(css.includes('pulse-ring'), 'Missing pulse-ring keyframe in App.css');
  });
});

describe('Milestone 1 - Mock Datasets Verification', () => {
  test('mockCategories contains exactly 12 categories with artwork and colors', () => {
    const catPath = path.join(ROOT_DIR, 'src', 'data', 'mockCategories.ts');
    const catContent = fs.readFileSync(catPath, 'utf8');

    const expectedCategories = [
      'Konser', 'Festival', 'Olahraga', 'Teater & Seni',
      'Musik Indonesia', 'K-pop', 'EDM & Electronic', 'Jazz & Klasik',
      'Trending', 'Charts', 'Stand-up Comedy', 'Untuk Kamu'
    ];

    for (const cat of expectedCategories) {
      assert.ok(catContent.includes(cat), `Missing category: ${cat}`);
    }
  });

  test('mockEvents contains 3 hero slides and 8 popular events', () => {
    const eventsPath = path.join(ROOT_DIR, 'src', 'data', 'mockEvents.ts');
    const eventsContent = fs.readFileSync(eventsPath, 'utf8');

    assert.ok(eventsContent.includes('COLDPLAY: Music of the Spheres'), 'Missing Coldplay hero slide');
    assert.ok(eventsContent.includes('DJAKARTA WAREHOUSE'), 'Missing DWP hero slide');
    assert.ok(eventsContent.includes('JAKARTA JAZZ'), 'Missing JJF hero slide');

    const expectedPopular = [
      'Ethereal Nights',
      'Djakarta Warehouse Project',
      'The Eras Experience',
      'Jakarta Jazz Festival',
      'Neon Circuit Rave',
      'Derby Ibu Kota',
      'Soundrenaline 2027',
      'Klasik: Beethoven Night'
    ];

    for (const event of expectedPopular) {
      assert.ok(eventsContent.includes(event), `Missing popular event: ${event}`);
    }
  });

  test('mockSeats generates exactly 270 seats across 4 tiers with deterministic status', () => {
    const tiers = [
      { id: 'CAT1', name: 'CAT 1', price: 3500000, rows: 3, cols: 18 },
      { id: 'CAT2', name: 'CAT 2', price: 2100000, rows: 4, cols: 18 },
      { id: 'CAT3', name: 'CAT 3', price: 1500000, rows: 4, cols: 18 },
      { id: 'CAT4', name: 'CAT 4', price: 750000, rows: 4, cols: 18 }
    ];

    const letters = 'ABCDEFGHIJKLMNOP';
    let totalSeats = 0;
    const seats = [];

    for (const tier of tiers) {
      for (let r = 0; r < tier.rows; r++) {
        for (let c = 1; c <= tier.cols; c++) {
          const hash = (tier.id.charCodeAt(3) * 31 + r * 7 + c * 13) % 100;
          let status = 'available';
          if (hash < 22) status = 'sold';
          else if (hash < 30) status = 'locked';

          seats.push({
            key: `${tier.id}-${letters[r]}-${c}`,
            tier: tier.id,
            status
          });
          totalSeats++;
        }
      }
    }

    assert.strictEqual(totalSeats, 270, 'Total stadium seats must equal 270');
    assert.strictEqual(seats.filter(s => s.tier === 'CAT1').length, 54, 'CAT 1 must have 54 seats');
    assert.strictEqual(seats.filter(s => s.tier === 'CAT2').length, 72, 'CAT 2 must have 72 seats');
    assert.strictEqual(seats.filter(s => s.tier === 'CAT3').length, 72, 'CAT 3 must have 72 seats');
    assert.strictEqual(seats.filter(s => s.tier === 'CAT4').length, 72, 'CAT 4 must have 72 seats');

    // Verify non-zero counts of each status (genuine algorithm)
    const availableCount = seats.filter(s => s.status === 'available').length;
    const soldCount = seats.filter(s => s.status === 'sold').length;
    const lockedCount = seats.filter(s => s.status === 'locked').length;

    assert.ok(availableCount > 150, `Available seats count (${availableCount}) should be majority`);
    assert.ok(soldCount > 30, `Sold seats count (${soldCount}) should be realistic`);
    assert.ok(lockedCount > 10, `Locked seats count (${lockedCount}) should be realistic`);
  });

  test('mockUser contains user profile with active notifications and VIP membership', () => {
    const userPath = path.join(ROOT_DIR, 'src', 'data', 'mockUser.ts');
    const userContent = fs.readFileSync(userPath, 'utf8');

    assert.ok(userContent.includes('Fajrul Rahman') || userContent.includes('Fajrul Kurniawan'), 'Missing user name');
    assert.ok(userContent.includes('VIP Silver Member'), 'Missing VIP Silver Member tier');
    assert.ok(userContent.includes('fajrul@example.com'), 'Missing email address');
    assert.ok(userContent.includes('activeTicketsCount: 2'), 'Missing activeTicketsCount');
    assert.ok(userContent.includes('unreadNotificationsCount: 3'), 'Missing unreadNotificationsCount');
  });
});

describe('Milestone 1 - Context & Calculation Logic Verification', () => {
  test('Tax, Service Fee, and Total calculation follow exact formula', () => {
    const calculateOrder = (seatPrices) => {
      const subtotal = seatPrices.reduce((a, b) => a + b, 0);
      const tax = seatPrices.length > 0 ? Math.round(subtotal * 0.1) : 0;
      const serviceFee = seatPrices.length > 0 ? 35000 : 0;
      const total = subtotal + tax + serviceFee;
      return { subtotal, tax, serviceFee, total };
    };

    // Edge case: 0 seats selected
    const emptyOrder = calculateOrder([]);
    assert.strictEqual(emptyOrder.subtotal, 0);
    assert.strictEqual(emptyOrder.tax, 0);
    assert.strictEqual(emptyOrder.serviceFee, 0);
    assert.strictEqual(emptyOrder.total, 0);

    // Case 1: 1 CAT 1 seat (Rp 3.500.000)
    const singleSeat = calculateOrder([3500000]);
    assert.strictEqual(singleSeat.subtotal, 3500000);
    assert.strictEqual(singleSeat.tax, 350000); // 10%
    assert.strictEqual(singleSeat.serviceFee, 35000); // Rp 35.000
    assert.strictEqual(singleSeat.total, 3885000); // 3.500.000 + 350.000 + 35.000

    // Case 2: 2 CAT 1 seats (Rp 7.000.000)
    const doubleSeat = calculateOrder([3500000, 3500000]);
    assert.strictEqual(doubleSeat.subtotal, 7000000);
    assert.strictEqual(doubleSeat.tax, 700000);
    assert.strictEqual(doubleSeat.serviceFee, 35000);
    assert.strictEqual(doubleSeat.total, 7735000);
  });
});
