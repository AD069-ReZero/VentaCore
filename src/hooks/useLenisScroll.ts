import { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '../lib/gsap';

export interface UseLenisOptions {
  duration?: number;
  smoothWheel?: boolean;
  wheelMultiplier?: number;
  touchMultiplier?: number;
  syncWithGsap?: boolean;
}

export interface UseLenisReturn {
  lenis: Lenis | null;
  scrollTo: (target: string | number | HTMLElement, options?: { offset?: number; immediate?: boolean; duration?: number }) => void;
  pause: () => void;
  resume: () => void;
  isReducedMotion: boolean;
}

/**
 * Custom hook to initialize and configure Lenis smooth scrolling.
 * - Delivers a cinematic, momentum-based scrolling experience.
 * - Fully respects the 'prefers-reduced-motion: reduce' media query.
 * - Synchronizes with GSAP ScrollTrigger when enabled.
 * - Provides programmatic scrollTo, pause, and resume helpers.
 */
export function useLenisScroll(options: UseLenisOptions = {}): UseLenisReturn {
  const {
    duration = 1.25,
    smoothWheel = true,
    wheelMultiplier = 1.0,
    touchMultiplier = 1.5,
    syncWithGsap = true,
  } = options;

  const lenisRef = useRef<Lenis | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  // Programmatic scroll helper
  const scrollTo = useCallback((target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean; duration?: number }) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, opts);
    } else if (typeof window !== 'undefined') {
      if (typeof target === 'number') {
        window.scrollTo({ top: target, behavior: opts?.immediate ? 'auto' : 'smooth' });
      } else if (typeof target === 'string') {
        const el = document.querySelector(target);
        if (el) {
          el.scrollIntoView({ behavior: opts?.immediate ? 'auto' : 'smooth' });
        }
      } else if (target instanceof HTMLElement) {
        target.scrollIntoView({ behavior: opts?.immediate ? 'auto' : 'smooth' });
      }
    }
  }, []);

  const pause = useCallback(() => {
    lenisRef.current?.stop();
  }, []);

  const resume = useCallback(() => {
    lenisRef.current?.start();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => {
      setIsReducedMotion(mediaQuery.matches);
    };

    updateReducedMotion();

    // Check headless test environments
    const isHeadless =
      navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);

    // If reduced motion is requested or in headless testing, do not initialize smooth momentum scrolling
    if (mediaQuery.matches || isHeadless) {
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }

      const onChange = (e: MediaQueryListEvent) => {
        setIsReducedMotion(e.matches);
      };
      mediaQuery.addEventListener('change', onChange);
      return () => {
        mediaQuery.removeEventListener('change', onChange);
      };
    }

    // Initialize Lenis with cinematic exponential easing
    const lenis = new Lenis({
      duration,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel,
      wheelMultiplier,
      touchMultiplier,
      autoRaf: false, // We drive via GSAP ticker or RAF
    });

    lenisRef.current = lenis;

    let tickerCallback: ((time: number) => void) | null = null;
    let rafId: number | null = null;

    if (syncWithGsap && typeof gsap !== 'undefined') {
      // Connect Lenis to ScrollTrigger
      lenis.on('scroll', ScrollTrigger.update);

      tickerCallback = (time: number) => {
        lenis.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(0);
    } else {
      const step = (time: number) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(step);
      };
      rafId = requestAnimationFrame(step);
    }

    // Listen for changes in prefers-reduced-motion preference dynamically
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
      if (e.matches) {
        // User enabled reduced motion: destroy Lenis immediately
        if (tickerCallback) gsap.ticker.remove(tickerCallback);
        if (rafId) cancelAnimationFrame(rafId);
        lenis.destroy();
        lenisRef.current = null;
      }
    };
    mediaQuery.addEventListener('change', handleMotionChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMotionChange);
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [duration, smoothWheel, wheelMultiplier, touchMultiplier, syncWithGsap]);

  return {
    lenis: lenisRef.current,
    scrollTo,
    pause,
    resume,
    isReducedMotion,
  };
}
