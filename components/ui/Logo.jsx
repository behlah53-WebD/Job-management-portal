'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout } from 'lucide-react';
import styles from './Logo.module.css';

export default function Logo({
  href = '/',
  showText = true,
  size = 'md', // 'sm', 'md', 'lg'
  variant = 'default', // 'default', 'light' (for dark headers)
  className = '',
}) {
  const content = (
    <div className={`${styles.logoContainer} ${styles[size] || ''} ${className}`}>
      <div className={`${styles.badge} ${styles[`badge_${size}`] || styles.badge_md}`}>
        <Sprout className={styles.sproutIcon} />
      </div>
      {showText && (
        <span className={`${styles.brandText} ${variant === 'light' ? styles.brandTextLight : ''}`}>
          Verdant
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.logoLink} aria-label="Verdant Home">
        {content}
      </Link>
    );
  }

  return content;
}
