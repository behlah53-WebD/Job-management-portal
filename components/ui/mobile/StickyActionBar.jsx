'use client';

import React from 'react';
import styles from './StickyActionBar.module.css';

/**
 * StickyActionBar (Mobile): Fixed sticky bottom bar for mobile forms and actions.
 * Sits securely above the safe area.
 */
export default function StickyActionBar({
  children,
  className = '',
  visible = true,
}) {
  if (!visible) return null;

  return (
    <div className={`${styles.barWrapper} ${className}`}>
      <div className={styles.barInner}>{children}</div>
    </div>
  );
}
