'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * High-performance scroll state hook with requestAnimationFrame throttling,
 * hysteresis thresholding, hide-on-scroll-down, and scroll progress calculation.
 * 
 * Runs all calculations on the animation frame, only triggering React state
 * updates when the discrete states actually change (preventing unnecessary re-renders).
 */
export function useScrollState({
  thresholdEnter = 32,
  thresholdExit = 12,
  enableHideOnScroll = true,
  hideThreshold = 140,
  hideDistance = 60,
  showDistance = 8,
  disabled = false,
} = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Mutable refs to track state without re-triggering effects
  const stateRef = useRef({
    isScrolled: false,
    isHidden: false,
    scrollProgress: 0,
    lastScrollY: 0,
    accumulatedDown: 0,
    accumulatedUp: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;

    // Synchronize initial state safely on mount
    const initialY = window.scrollY || 0;
    stateRef.current.lastScrollY = initialY;
    if (initialY > thresholdEnter) {
      stateRef.current.isScrolled = true;
      setIsScrolled(true);
    }

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = Math.max(0, window.scrollY || 0);
          const state = stateRef.current;
          const delta = currentY - state.lastScrollY;

          // 1. Hysteresis threshold for Floating state
          let nextIsScrolled = state.isScrolled;
          if (!state.isScrolled && currentY > thresholdEnter) {
            nextIsScrolled = true;
          } else if (state.isScrolled && currentY < thresholdExit) {
            nextIsScrolled = false;
          }

          if (nextIsScrolled !== state.isScrolled) {
            state.isScrolled = nextIsScrolled;
            setIsScrolled(nextIsScrolled);
          }

          // 2. Hide-on-scroll-down, show-on-scroll-up
          let nextIsHidden = state.isHidden;
          if (enableHideOnScroll && !disabled) {
            if (currentY <= hideThreshold) {
              // Always reveal near the top
              nextIsHidden = false;
              state.accumulatedDown = 0;
              state.accumulatedUp = 0;
            } else if (delta > 0) {
              // Scrolling downward
              state.accumulatedUp = 0;
              state.accumulatedDown += delta;
              if (state.accumulatedDown >= hideDistance && !state.isHidden) {
                nextIsHidden = true;
              }
            } else if (delta < 0) {
              // Scrolling upward
              state.accumulatedDown = 0;
              state.accumulatedUp += Math.abs(delta);
              if (state.accumulatedUp >= showDistance && state.isHidden) {
                nextIsHidden = false;
              }
            }

            if (nextIsHidden !== state.isHidden) {
              state.isHidden = nextIsHidden;
              setIsHidden(nextIsHidden);
            }
          }

          // 3. Scroll progress calculation (0 to 1)
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.min(1, Math.max(0, currentY / docHeight)) : 0;
          // Only update if difference is perceptible (> 0.005) to avoid excessive re-renders
          if (Math.abs(progress - state.scrollProgress) > 0.005) {
            state.scrollProgress = progress;
            setScrollProgress(progress);
          }

          state.lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [
    thresholdEnter,
    thresholdExit,
    enableHideOnScroll,
    hideThreshold,
    hideDistance,
    showDistance,
    disabled,
  ]);

  return { isScrolled, isHidden, scrollProgress };
}
