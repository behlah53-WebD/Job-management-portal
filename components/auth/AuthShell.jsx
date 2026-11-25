'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import ShowcasePanel from './ShowcasePanel';
import SproutIllustration from './SproutIllustration';
import styles from './AuthShell.module.css';

export default function AuthShell({ children, mode = 'login' }) {
  const isRegister = mode === 'register';
  return (
    <div className={styles.pageContainer}>
      {/* Background Soft Blobs */}
      <div className={styles.bgBlobMint} aria-hidden="true" />
      <div className={styles.bgBlobGreen} aria-hidden="true" />

      {/* MOBILE COMPACT HERO (<768px) */}
      <header className={styles.mobileHero}>
        <div className={styles.mobileHeroPattern} aria-hidden="true" />
        <div className={styles.mobileHeroAurora} aria-hidden="true" />

        <div className={styles.mobileHeroContent}>
          <Link href="/" className={styles.mobileLogo} aria-label="Verdant Home">
            <div className={styles.mobileLogoBadge}>
              <Sprout size={18} />
            </div>
            <span className={styles.mobileLogoText}>Verdant</span>
          </Link>

          <div className={styles.mobileHeroBody}>
            <div className={styles.mobileHeroText}>
              <span className={styles.mobileTagline}>
                {isRegister ? 'GET STARTED' : 'WELCOME BACK'}
              </span>
              <h2 className={styles.mobileHeadline}>
                Grow your craft with <span className={styles.mobileHighlight}>intention</span>.
              </h2>
            </div>
            <div className={styles.mobileSproutPeeker} aria-hidden="true">
              <SproutIllustration size={100} />
            </div>
          </div>
        </div>
      </header>

      {/* MAIN TWO-PANEL GRID SHELL */}
      <main className={styles.gridShell}>
        {/* DESKTOP/TABLET SHOWCASE PANEL */}
        <aside className={styles.showcaseSlot} aria-label="Verdant Highlights">
          <ShowcasePanel mode={mode} />
        </aside>

        {/* FORM SLOT */}
        <section
          className={styles.formSlot}
          aria-label={isRegister ? 'Create an account' : 'Sign in credentials'}
        >
          <div className={styles.formCenterWrapper}>
            {children}
          </div>

          {/* Decorative faint leaf art in bottom right corner */}
          <div className={styles.decorativeCornerLeaf} aria-hidden="true">
            <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
              <path
                d="M180 180 C110 180 40 130 10 50 C50 10 130 30 180 180 Z"
                fill="#1E9A56"
                fillOpacity="0.04"
              />
              <path
                d="M180 180 C140 140 90 90 10 50"
                stroke="#1E9A56"
                strokeWidth="1.5"
                strokeOpacity="0.06"
              />
            </svg>
          </div>
        </section>
      </main>
    </div>
  );
}
