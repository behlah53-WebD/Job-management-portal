import React from 'react';
import styles from './SkeletonMobile.module.css';

export function CardSkeletonMobile() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.rowTop}>
        <div className={`${styles.shimmer} ${styles.logoSkeleton}`} />
        <div className={styles.titleArea}>
          <div className={`${styles.shimmer} ${styles.lineTitle}`} />
          <div className={`${styles.shimmer} ${styles.lineSub}`} />
        </div>
      </div>
      <div className={styles.chipsRow}>
        <div className={`${styles.shimmer} ${styles.chipSkeleton}`} />
        <div className={`${styles.shimmer} ${styles.chipSkeleton}`} />
        <div className={`${styles.shimmer} ${styles.chipSkeleton}`} />
      </div>
      <div className={styles.rowBottom}>
        <div className={`${styles.shimmer} ${styles.lineMeta}`} />
        <div className={`${styles.shimmer} ${styles.btnSkeleton}`} />
      </div>
    </div>
  );
}

// Alias for convenience
export const JobCardSkeletonMobile = CardSkeletonMobile;

export function StatCardSkeletonMobile() {
  return (
    <div className={styles.statSkeleton}>
      <div className={`${styles.shimmer} ${styles.statIconSkeleton}`} />
      <div className={`${styles.shimmer} ${styles.statNumSkeleton}`} />
      <div className={`${styles.shimmer} ${styles.statLabelSkeleton}`} />
    </div>
  );
}
