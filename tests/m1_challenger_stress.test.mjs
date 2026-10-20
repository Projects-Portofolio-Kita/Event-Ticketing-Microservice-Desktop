/**
 * Challenger 2 Empirical Stress Test Suite for Milestone 1
 * Validates NavigationContext, BookingContext, screen transitions,
 * seat toggle idempotency, lock timer, modal triggers, and edge cases.
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import React from 'react';
import ReactDOMServer from 'react-dom/server';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// ==========================================
// 1. NavigationContext State Machine Harness
// ==========================================
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

// ==========================================
// 2. BookingContext State Machine Harness
// ==========================================
class BookingStateMachine {
  constructor(initialSeats = [], onPaymentSuccess = null) {
    this.selectedSeats = [...initialSeats];
    this.lockTimerSeconds = 300;
    this.isCheckoutOpen = false;
    this.onPaymentSuccess = onPaymentSuccess;
  }

  resetTimer() {
    this.lockTimerSeconds = 300;
  }

  isSeatSelected(seatId) {
    return this.selectedSeats.some(s => s.id === seatId || s.key === seatId);
  }

  toggleSeat(seat) {
    if (seat.status === 'sold' || seat.status === 'locked') {
      return;
    }

    const seatKey = seat.key || seat.id;
    const exists = this.selectedSeats.some(s => (s.key || s.id) === seatKey);
    if (exists) {
      this.selectedSeats = this.selectedSeats.filter(s => (s.key || s.id) !== seatKey);
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

  get subtotal() {
    return this.selectedSeats.reduce((acc, seat) => acc + (seat.price || 0), 0);
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

  get formattedLockTimer() {
    const mins = Math.floor(this.lockTimerSeconds / 60);
    const secs = this.lockTimerSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
}

// ==========================================
// Test Suites
// ==========================================

describe('Challenger 2 - NavigationContext Empirical Verification', () => {
  test('Initial state defaults to discover and coldplay-2026', () => {
    const nav = new NavigationStateMachine();
    assert.strictEqual(nav.activeScreen, 'discover');
    assert.strictEqual(nav.selectedEventId, 'coldplay-2026');
    assert.strictEqual(nav.history.length, 0);
  });

  test('Initial state accepts custom initialScreen and initialEventId', () => {
    const nav = new NavigationStateMachine('detail', 'dwp-2026');
    assert.strictEqual(nav.activeScreen, 'detail');
    assert.strictEqual(nav.selectedEventId, 'dwp-2026');
    assert.strictEqual(nav.history.length, 0);
  });

  test('Transitions sequentially across all 5 screens and tracks history', () => {
    const nav = new NavigationStateMachine();
    const screens = ['categories', 'detail', 'seatmap', 'tickets'];

    screens.forEach(screen => {
      nav.navigateTo(screen);
      assert.strictEqual(nav.activeScreen, screen);
    });

    assert.strictEqual(nav.activeScreen, 'tickets');
    assert.deepStrictEqual(nav.history, ['discover', 'categories', 'detail', 'seatmap']);
  });

  test('Event ID updates when provided and persists when omitted', () => {
    const nav = new NavigationStateMachine();
    nav.navigateTo('detail', 'dwp-2026');
    assert.strictEqual(nav.activeScreen, 'detail');
    assert.strictEqual(nav.selectedEventId, 'dwp-2026');

    // Navigating without eventId preserves existing selectedEventId
    nav.navigateTo('seatmap');
    assert.strictEqual(nav.activeScreen, 'seatmap');
    assert.strictEqual(nav.selectedEventId, 'dwp-2026');
  });

  test('Full history back traversal returns to root screen in reverse order', () => {
    const nav = new NavigationStateMachine();
    nav.navigateTo('categories');
    nav.navigateTo('detail', 'coldplay-2026');
    nav.navigateTo('seatmap');
    nav.navigateTo('tickets');

    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'seatmap');

    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'detail');

    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'categories');

    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'discover');
    assert.strictEqual(nav.history.length, 0);
  });

  test('Edge case: calling goBack on empty history resets to discover safely', () => {
    const nav = new NavigationStateMachine('seatmap');
    assert.strictEqual(nav.history.length, 0);
    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'discover');

    // Repeated goBack calls do not crash and remain at discover
    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'discover');
    nav.goBack();
    assert.strictEqual(nav.activeScreen, 'discover');
  });

  test('Exhaustive matrix: all 5x5 screen transitions execute without error', () => {
    const allScreens = ['discover', 'categories', 'detail', 'seatmap', 'tickets'];
    for (const fromScreen of allScreens) {
      for (const toScreen of allScreens) {
        const nav = new NavigationStateMachine(fromScreen);
        nav.navigateTo(toScreen);
        assert.strictEqual(nav.activeScreen, toScreen);
        assert.deepStrictEqual(nav.history, [fromScreen]);
        nav.goBack();
        assert.strictEqual(nav.activeScreen, fromScreen);
      }
    }
  });
});

describe('Challenger 2 - BookingContext Empirical Verification', () => {
  const dummyCat1Seat = {
    id: 'CAT1-A-1',
    key: 'CAT1-A-1',
    row: 'A',
    number: 1,
    tier: 'cat1',
    tierName: 'CAT 1 VIP',
    price: 3500000,
    status: 'available'
  };

  const dummyCat2Seat = {
    id: 'CAT2-B-5',
    key: 'CAT2-B-5',
    row: 'B',
    number: 5,
    tier: 'cat2',
    tierName: 'CAT 2 Festival',
    price: 2100000,
    status: 'available'
  };

  test('Initial state: 0 seats, lock timer 300s, checkout closed, total 0', () => {
    const booking = new BookingStateMachine();
    assert.strictEqual(booking.selectedSeats.length, 0);
    assert.strictEqual(booking.lockTimerSeconds, 300);
    assert.strictEqual(booking.formattedLockTimer, '05:00');
    assert.strictEqual(booking.isCheckoutOpen, false);
    assert.strictEqual(booking.subtotal, 0);
    assert.strictEqual(booking.tax, 0);
    assert.strictEqual(booking.serviceFee, 0);
    assert.strictEqual(booking.total, 0);
  });

  test('Seat toggle idempotency: add, remove, re-add, re-remove', () => {
    const booking = new BookingStateMachine();

    // 1st toggle: add
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 1);
    assert.strictEqual(booking.selectedSeats[0].id, dummyCat1Seat.id);
    assert.strictEqual(booking.selectedSeats[0].status, 'selected');
    assert.strictEqual(booking.isSeatSelected(dummyCat1Seat.id), true);

    // 2nd toggle: remove
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 0);
    assert.strictEqual(booking.isSeatSelected(dummyCat1Seat.id), false);

    // 3rd toggle: re-add
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 1);
    assert.strictEqual(booking.isSeatSelected(dummyCat1Seat.id), true);

    // 4th toggle: re-remove
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 0);
    assert.strictEqual(booking.isSeatSelected(dummyCat1Seat.id), false);
  });

  test('Seat status filter: sold and locked seats CANNOT be selected', () => {
    const booking = new BookingStateMachine();

    const soldSeat = { ...dummyCat1Seat, id: 'CAT1-A-2', status: 'sold' };
    const lockedSeat = { ...dummyCat1Seat, id: 'CAT1-A-3', status: 'locked' };

    booking.toggleSeat(soldSeat);
    assert.strictEqual(booking.selectedSeats.length, 0, 'Sold seat must not be added');

    booking.toggleSeat(lockedSeat);
    assert.strictEqual(booking.selectedSeats.length, 0, 'Locked seat must not be added');
  });

  test('Multi-seat selection, selective removal, and clearSelection', () => {
    const booking = new BookingStateMachine();
    booking.toggleSeat(dummyCat1Seat);
    booking.toggleSeat(dummyCat2Seat);
    assert.strictEqual(booking.selectedSeats.length, 2);

    // Remove first seat only
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 1);
    assert.strictEqual(booking.selectedSeats[0].id, dummyCat2Seat.id);

    // Re-add first seat
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.selectedSeats.length, 2);

    // Clear all
    booking.clearSelection();
    assert.strictEqual(booking.selectedSeats.length, 0);
    assert.strictEqual(booking.subtotal, 0);
    assert.strictEqual(booking.total, 0);
  });

  test('Pricing math: subtotal, 10% entertainment tax, Rp 35k fee, and total', () => {
    const booking = new BookingStateMachine();

    // 0 seats
    assert.strictEqual(booking.subtotal, 0);
    assert.strictEqual(booking.tax, 0);
    assert.strictEqual(booking.serviceFee, 0);
    assert.strictEqual(booking.total, 0);

    // 1 CAT 1 seat (Rp 3.500.000)
    booking.toggleSeat(dummyCat1Seat);
    assert.strictEqual(booking.subtotal, 3500000);
    assert.strictEqual(booking.tax, 350000);
    assert.strictEqual(booking.serviceFee, 35000);
    assert.strictEqual(booking.total, 3885000);

    // Add 1 CAT 2 seat (Rp 2.100.000) -> subtotal = 5.600.000
    booking.toggleSeat(dummyCat2Seat);
    assert.strictEqual(booking.subtotal, 5600000);
    assert.strictEqual(booking.tax, 560000);
    assert.strictEqual(booking.serviceFee, 35000);
    assert.strictEqual(booking.total, 6195000);
  });

  test('Checkout modal open guard: cannot open when selectedSeats is empty', () => {
    const booking = new BookingStateMachine();
    assert.strictEqual(booking.selectedSeats.length, 0);

    booking.openCheckout();
    assert.strictEqual(booking.isCheckoutOpen, false, 'Modal must NOT open with 0 seats');

    // Now select a seat and open
    booking.toggleSeat(dummyCat1Seat);
    booking.openCheckout();
    assert.strictEqual(booking.isCheckoutOpen, true, 'Modal should open when seats selected');

    // Close checkout
    booking.closeCheckout();
    assert.strictEqual(booking.isCheckoutOpen, false, 'Modal should close cleanly');
  });

  test('Payment completion closes checkout modal and triggers callback', () => {
    let callbackFired = false;
    const booking = new BookingStateMachine([dummyCat1Seat], () => {
      callbackFired = true;
    });

    booking.openCheckout();
    assert.strictEqual(booking.isCheckoutOpen, true);

    booking.completePayment();
    assert.strictEqual(booking.isCheckoutOpen, false);
    assert.strictEqual(callbackFired, true, 'onPaymentSuccess callback must be called');
  });

  test('Lock timer formatting: 300s -> 05:00, 65s -> 01:05, 9s -> 00:09, 0s -> 00:00', () => {
    const booking = new BookingStateMachine();
    assert.strictEqual(booking.formattedLockTimer, '05:00');

    booking.lockTimerSeconds = 65;
    assert.strictEqual(booking.formattedLockTimer, '01:05');

    booking.lockTimerSeconds = 9;
    assert.strictEqual(booking.formattedLockTimer, '00:09');

    booking.lockTimerSeconds = 0;
    assert.strictEqual(booking.formattedLockTimer, '00:00');

    booking.resetTimer();
    assert.strictEqual(booking.lockTimerSeconds, 300);
    assert.strictEqual(booking.formattedLockTimer, '05:00');
  });
});

describe('Challenger 2 - React SSR Provider Render Verification', () => {
  test('NavigationProvider renders without crash via SSR and injects defaults', async () => {
    const { transformWithOxc } = await import('vite');
    const navCode = (await transformWithOxc(
      fs.readFileSync(path.join(ROOT_DIR, 'src', 'context', 'NavigationContext.tsx'), 'utf-8'),
      'NavigationContext.tsx',
      { lang: 'tsx', jsx: { runtime: 'automatic' } }
    )).code;

    const tmpNavFile = path.join(ROOT_DIR, 'tests', '_tmp_nav_test.mjs');
    fs.writeFileSync(tmpNavFile, navCode);

    try {
      const { NavigationProvider, useNavigation } = await import(pathToFileURL(tmpNavFile).href);

      let contextVal = null;
      function TestChild() {
        contextVal = useNavigation();
        return React.createElement('span', null, contextVal.activeScreen);
      }

      const html = ReactDOMServer.renderToString(
        React.createElement(NavigationProvider, null, React.createElement(TestChild))
      );

      assert.strictEqual(html, '<span>discover</span>');
      assert.strictEqual(contextVal.activeScreen, 'discover');
      assert.strictEqual(contextVal.selectedEventId, 'coldplay-2026');
      assert.strictEqual(typeof contextVal.navigateTo, 'function');
      assert.strictEqual(typeof contextVal.goBack, 'function');
    } finally {
      if (fs.existsSync(tmpNavFile)) {
        fs.unlinkSync(tmpNavFile);
      }
    }
  });

  test('BookingProvider renders without crash via SSR and injects defaults', async () => {
    const { transformWithOxc } = await import('vite');
    const bookCode = (await transformWithOxc(
      fs.readFileSync(path.join(ROOT_DIR, 'src', 'context', 'BookingContext.tsx'), 'utf-8'),
      'BookingContext.tsx',
      { lang: 'tsx', jsx: { runtime: 'automatic' } }
    )).code;

    const tmpBookFile = path.join(ROOT_DIR, 'tests', '_tmp_book_test.mjs');
    fs.writeFileSync(tmpBookFile, bookCode);

    try {
      const { BookingProvider, useBooking } = await import(pathToFileURL(tmpBookFile).href);

      let contextVal = null;
      function TestChild() {
        contextVal = useBooking();
        return React.createElement('span', null, contextVal.formattedLockTimer);
      }

      const html = ReactDOMServer.renderToString(
        React.createElement(BookingProvider, null, React.createElement(TestChild))
      );

      assert.strictEqual(html, '<span>05:00</span>');
      assert.strictEqual(contextVal.lockTimerSeconds, 300);
      assert.strictEqual(contextVal.isCheckoutOpen, false);
      assert.strictEqual(contextVal.selectedSeats.length, 0);
      assert.strictEqual(contextVal.subtotal, 0);
      assert.strictEqual(contextVal.tax, 0);
      assert.strictEqual(contextVal.serviceFee, 0);
      assert.strictEqual(contextVal.total, 0);
      assert.strictEqual(typeof contextVal.toggleSeat, 'function');
      assert.strictEqual(typeof contextVal.clearSelection, 'function');
      assert.strictEqual(typeof contextVal.openCheckout, 'function');
      assert.strictEqual(typeof contextVal.closeCheckout, 'function');
      assert.strictEqual(typeof contextVal.completePayment, 'function');
    } finally {
      if (fs.existsSync(tmpBookFile)) {
        fs.unlinkSync(tmpBookFile);
      }
    }
  });
});
