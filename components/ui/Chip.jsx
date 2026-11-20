'use client';

import React from 'react';
import styles from './Chip.module.css';

export default function Chip({
  children,
  active = false,
  onClick,
  icon: Icon,
  removable = false,
  onRemove,
  size = 'md',
  className = '',
}) {
  const Component = onClick ? 'button' : 'span';

  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={`${styles.chip} ${active ? styles.active : ''} ${styles[size]} ${
        onClick ? styles.clickable : ''
      } ${className}`}
      onClick={onClick}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} className={styles.icon} />}
      <span>{children}</span>
      {removable && (
        <button
          type="button"
          className={styles.removeBtn}
          onClick={(e) => {
            e.stopPropagation();
            onRemove && onRemove();
          }}
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </Component>
  );
}
