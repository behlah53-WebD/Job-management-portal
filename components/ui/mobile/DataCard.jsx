'use client';

import React from 'react';
import styles from './DataCard.module.css';

/**
 * DataCard (Mobile): Replaces rigid desktop table rows with a touch-friendly,
 * tactile card surface matching the Verdant "Growth" design language.
 */
export default function DataCard({
  children,
  onClick,
  className = '',
  as = 'div',
  ...rest
}) {
  const Component = as;
  const isClickable = Boolean(onClick);

  return (
    <Component
      className={`${styles.card} ${isClickable ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      {...rest}
    >
      {children}
    </Component>
  );
}
