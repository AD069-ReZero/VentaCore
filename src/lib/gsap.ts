import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

// Register ScrollTrigger plugin with GSAP
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };

/**
 * Connect Lenis smooth scrolling with GSAP ScrollTrigger
 * Keeps scroll-driven animations synchronized with Lenis interpolation.
 */
export function initSmoothScrollWithGsap(): { lenis: Lenis | null; cleanup: () => void } {
  if (typeof window === 'undefined') {
    return { lenis: null, cleanup: () => {} };
  }

  const isHeadless =
    navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

  // If in headless test runner, run standard or lightweight scrolling
  if (isHeadless) {
    return {
      lenis: null,
      cleanup: () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      },
    };
  }

  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 1.5,
  });

  // Synchronize Lenis scroll position with ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Connect GSAP ticker to Lenis requestAnimationFrame
  const tickerCallback = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  const cleanup = () => {
    gsap.ticker.remove(tickerCallback);
    lenis.destroy();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };

  return { lenis, cleanup };
}

/**
 * Utility to create a scroll-triggered text reveal using GSAP
 */
export function animateTextLinesOnScroll(
  elements: HTMLElement[] | NodeListOf<HTMLElement> | string,
  triggerElement: HTMLElement | string,
  options: {
    yOffset?: number;
    stagger?: number;
    duration?: number;
    start?: string;
  } = {}
) {
  const { yOffset = 40, stagger = 0.08, duration = 0.9, start = 'top 85%' } = options;

  return gsap.fromTo(
    elements,
    {
      opacity: 0,
      y: yOffset,
      clipPath: 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)',
    },
    {
      opacity: 1,
      y: 0,
      clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      duration,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerElement,
        start,
        once: true,
      },
    }
  );
}

/**
 * Utility for pinned parallax section transitions
 */
export function animateParallaxSection(
  target: HTMLElement | string,
  container: HTMLElement | string,
  yDistance = -100
) {
  return gsap.to(target, {
    y: yDistance,
    ease: 'none',
    scrollTrigger: {
      trigger: container,
      start: 'top bottom',
      end: 'bottom top',
      scrub: true,
    },
  });
}
