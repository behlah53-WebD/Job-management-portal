'use client';

import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';
import styles from './FloatingGlassCard.module.css';

export default function FloatingGlassCard({ type = 'verified', phase = 'a', className = '' }) {
  if (type === 'verified') {
    return (
      <div className={`${styles.glassCard} ${styles[`phase_${phase}`]} ${className}`}>
        <div className={styles.iconCircle}>
          <ShieldCheck size={20} className={styles.iconLime} />
        </div>
        <div className={styles.textStack}>
          <span className={styles.primaryText}>Verified Employers Only</span>
          <span className={styles.secondaryText}>100% human-vetted postings</span>
        </div>
      </div>
    );
  }

  if (type === 'shortlist') {
    return (
      <div className={`${styles.glassCard} ${styles[`phase_${phase}`]} ${styles.hideOnTablet} ${className}`}>
        <div className={styles.notificationDot} />
        <div className={styles.textStack}>
          <div className={styles.inlineHeader}>
            <span className={styles.primaryText}>Application shortlisted</span>
            <span className={styles.sproutBadge}>🌱</span>
          </div>
          <span className={styles.secondaryText}>Fern & Stone • 2 min ago</span>
        </div>
      </div>
    );
  }

  if (type === 'social') {
    return (
      <div className={`${styles.glassCard} ${styles[`phase_${phase}`]} ${className}`}>
        <div className={styles.avatarStack}>
          <span className={`${styles.avatar} ${styles.avatar1}`}>AK</span>
          <span className={`${styles.avatar} ${styles.avatar2}`}>SL</span>
          <span className={`${styles.avatar} ${styles.avatar3}`}>RV</span>
          <span className={`${styles.avatar} ${styles.avatar4}`}>MJ</span>
        </div>
        <div className={styles.textStack}>
          <span className={styles.primaryText}>25,000+ Candidates</span>
          <span className={styles.secondaryText}>Growing their craft on Verdant</span>
        </div>
      </div>
    );
  }

  return null;
}
