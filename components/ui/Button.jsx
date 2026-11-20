'use client';

import React from 'react';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'ghost' | 'danger' | 'lime'
  size = 'md', // 'sm' | 'md' | 'lg'
  icon: Icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  disabled = false,
  ...props
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    fullWidth ? styles.fullWidth : '',
    loading ? styles.loading : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button suppressHydrationWarning className={classes} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className={styles.spinner} aria-hidden="true" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={styles.icon} size={size === 'sm' ? 16 : 18} />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className={styles.icon} size={size === 'sm' ? 16 : 18} />}
        </>
      )}
    </button>
  );
}
