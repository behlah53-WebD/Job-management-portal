import React from 'react';
import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'applied', // 'applied' | 'viewed' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn' | 'verified' | 'hiring-fast' | 'new' | 'custom'
  dot = true,
  size = 'md',
  className = '',
}) {
  const normVariant = variant.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`${styles.badge} ${styles[normVariant] || styles.applied} ${styles[size]} ${className}`}>
      {dot && <span className={styles.dot} />}
      {children}
    </span>
  );
}
