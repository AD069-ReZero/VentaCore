import test from 'node:test';
import assert from 'node:assert/strict';

// Pure logic tests for scroll easing and reduced-motion decisions
function calculateCinematicEasing(t: number): number {
  return Math.min(1, 1.001 - Math.pow(2, -10 * t));
}

function shouldEnableSmoothScroll(prefersReducedMotion: boolean, isHeadless: boolean): boolean {
  if (prefersReducedMotion || isHeadless) {
    return false;
  }
  return true;
}

test('cinematic easing starts at 0 and approaches 1 smoothly', () => {
  const atZero = calculateCinematicEasing(0);
  assert.ok(atZero <= 0.01, 'Should start near 0');

  const atHalf = calculateCinematicEasing(0.5);
  assert.ok(atHalf > 0.95 && atHalf <= 1, 'Should ramp up gracefully by midpoint');

  const atOne = calculateCinematicEasing(1.0);
  assert.equal(atOne, 1, 'Should clamp to 1 at completion');
});

test('respects prefers-reduced-motion media query', () => {
  assert.equal(shouldEnableSmoothScroll(true, false), false, 'Should disable when reduced motion is preferred');
  assert.equal(shouldEnableSmoothScroll(false, false), true, 'Should enable when reduced motion is false and not headless');
  assert.equal(shouldEnableSmoothScroll(false, true), false, 'Should disable during headless testing to avoid test flakiness');
});
