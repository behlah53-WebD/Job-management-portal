'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight } from 'lucide-react';
import SproutIllustration from './SproutIllustration';
import FloatingGlassCard from './FloatingGlassCard';
import styles from './ShowcasePanel.module.css';

const QUOTES = [
  {
    id: 1,
    quotePrefix: 'Do work that enriches your ',
    highlight: 'spirit',
    quoteSuffix: ' as much as your craft.',
    sub: 'Connect directly with verified teams who honor dignity, calm work cultures, and transparent compensation.',
  },
  {
    id: 2,
    quotePrefix: "A career shouldn't feel like an endless uphill ",
    highlight: 'grind',
    quoteSuffix: '.',
    sub: 'Verdant brings you curated roles with upfront salaries, human response times, and mission-driven teammates.',
  },
  {
    id: 3,
    quotePrefix: 'Plant yourself where your talent can truly ',
    highlight: 'flourish',
    quoteSuffix: '.',
    sub: 'Join over 25,000 engineers, designers, and craftspeople growing at intentional, high-trust companies.',
  },
];

export default function ShowcasePanel({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  // Auto-advance quote carousel every 6s unless paused or prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) return;

    if (!isPaused) {
      timeoutRef.current = setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % QUOTES.length);
      }, 6000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [activeIndex, isPaused]);

  return (
    <div
      className={styles.showcasePanel}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Layer 1: Base Gradient & Aurora Glows */}
      <div className={styles.auroraGlowLime} aria-hidden="true" />
      <div className={styles.auroraGlowMint} aria-hidden="true" />

      {/* Layer 2: Subtle SVG Leaf Pattern & Grain */}
      <div className={styles.patternOverlay} aria-hidden="true" />
      <div className={styles.grainOverlay} aria-hidden="true" />

      {/* Layer 3: 12 Fixed CSS Floating Pollen Dots */}
      <div className={styles.pollenField} aria-hidden="true">
        <span className={`${styles.pollen} ${styles.p1}`} />
        <span className={`${styles.pollen} ${styles.p2}`} />
        <span className={`${styles.pollen} ${styles.p3}`} />
        <span className={`${styles.pollen} ${styles.p4}`} />
        <span className={`${styles.pollen} ${styles.p5}`} />
        <span className={`${styles.pollen} ${styles.p6}`} />
        <span className={`${styles.pollen} ${styles.p7}`} />
        <span className={`${styles.pollen} ${styles.p8}`} />
        <span className={`${styles.pollen} ${styles.p9}`} />
        <span className={`${styles.pollen} ${styles.p10}`} />
        <span className={`${styles.pollen} ${styles.p11}`} />
        <span className={`${styles.pollen} ${styles.p12}`} />
      </div>

      {/* Content Container */}
      <div className={styles.content}>
        {/* TOP BAR: Logo & Register Pill */}
        <div className={styles.topBar}>
          <Link href="/" className={styles.brandLogo} aria-label="Verdant Home">
            <div className={styles.logoBadge}>
              <Sprout size={22} className={styles.sproutIcon} />
            </div>
            <div className={styles.logoMeta}>
              <span className={styles.brandName}>Verdant</span>
              <span className={styles.brandTagline}>Grow your career</span>
            </div>
          </Link>

          <Link href={isRegister ? '/login' : '/register'} className={styles.glassRegisterPill}>
            <span>{isRegister ? 'Already a member? Sign in' : 'New here? Create account'}</span>
            <ArrowRight size={13} className={styles.pillArrow} />
          </Link>
        </div>

        {/* MIDDLE: Animated Sprout Illustration & Quote Carousel */}
        <div className={styles.middleHero}>
          <div className={styles.sproutWrap}>
            <SproutIllustration size={220} />
          </div>

          <div
            className={styles.quoteCarousel}
            role="region"
            aria-roledescription="carousel"
            aria-label="Inspirational thoughts"
          >
            <div className={styles.quoteTrack}>
              {QUOTES.map((q, idx) => {
                const isCurrent = idx === activeIndex;
                return (
                  <div
                    key={q.id}
                    className={`${styles.quoteSlide} ${isCurrent ? styles.activeSlide : ''}`}
                    aria-hidden={!isCurrent}
                  >
                    <h2 className={styles.quoteTitle}>
                      {q.quotePrefix}
                      <span className={styles.limeKeyword}>
                        {q.highlight}
                        <svg
                          className={styles.handDrawnUnderline}
                          viewBox="0 0 100 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 9 C25 3, 75 3, 98 8"
                            stroke="#C8F169"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </span>
                      {q.quoteSuffix}
                    </h2>
                    <p className={styles.quoteSub}>{q.sub}</p>
                  </div>
                );
              })}
            </div>

            {/* Carousel Dot Indicators */}
            <div className={styles.carouselDots} role="tablist" aria-label="Quote slides">
              {QUOTES.map((q, idx) => (
                <button
                  suppressHydrationWarning
                  key={q.id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`${styles.dotBtn} ${idx === activeIndex ? styles.dotActive : ''}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM: 3 Frosted Glass Cards */}
        <div className={styles.bottomCards}>
          <FloatingGlassCard type="verified" phase="a" />
          <FloatingGlassCard type="shortlist" phase="b" />
          <FloatingGlassCard type="social" phase="c" />
        </div>
      </div>
    </div>
  );
}
