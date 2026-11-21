'use client';

import React from 'react';
import { Sprout } from 'lucide-react';
import styles from './EmptyStateMobile.module.css';

export default function EmptyStateMobile({
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  icon: CustomIcon,
  className = '',
}) {
  const IconComp = CustomIcon || Sprout;

  return (
    <div className={`${styles.emptyBox} ${className}`}>
      <div className={styles.sproutCircle}>
        <div className={styles.sproutAnimContainer}>
          <IconComp size={40} className={styles.sproutIcon} />
        </div>
      </div>

      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {actionLabel && (
        <button
          type="button"
          className={styles.actionBtn}
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
