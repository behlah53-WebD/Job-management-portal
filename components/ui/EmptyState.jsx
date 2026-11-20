'use client';

import React from 'react';
import Button from './Button';
import styles from './EmptyState.module.css';

export default function EmptyState({
  title = 'No items found',
  description = 'There are currently no records here. Check back soon or try adjusting your search filters.',
  actionLabel,
  onAction,
  icon: CustomIcon,
  className = '',
}) {
  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.illustrationWrapper}>
        {CustomIcon ? (
          <div className={styles.iconCircle}>
            <CustomIcon size={32} className={styles.icon} />
          </div>
        ) : (
          <svg
            className={styles.sproutSvg}
            width="88"
            height="88"
            viewBox="0 0 88 88"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="44" cy="44" r="40" fill="#E3F4E9" />
            <path
              d="M44 64V36"
              stroke="#1E9A56"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M44 48C44 40 32 36 28 36C28 48 36 52 44 48Z"
              fill="#5CC689"
              stroke="#1E9A56"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M44 42C44 32 58 28 62 28C62 42 52 46 44 42Z"
              fill="#C8F169"
              stroke="#1E9A56"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M26 64C34 62 54 62 62 64"
              stroke="#8FAE9A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      {actionLabel && onAction && (
        <div className={styles.action}>
          <Button variant="primary" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
