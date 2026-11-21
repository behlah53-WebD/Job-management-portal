'use client';

import React from 'react';
import styles from './ProgressRing.module.css';

/**
 * Growth Ring: Circular progress ring with brand green gradient stroke and rounded caps.
 * Used for Profile Strength and match percentage.
 */
export default function ProgressRing({
  value = 0,
  size = 72,
  strokeWidth = 6,
  showLabel = true,
  labelSuffix = '%',
  subtitle,
  className = '',
}) {
  const clampedValue = Math.min(100, Math.max(0, Math.round(value)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  const gradientId = `growth-grad-${size}-${clampedValue}`;

  return (
    <div
      className={`${styles.ringWrapper} ${className}`}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={styles.svg}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5CC689" />
            <stop offset="50%" stopColor="#2FB36A" />
            <stop offset="100%" stopColor="#1E9A56" />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={styles.track}
          strokeWidth={strokeWidth}
        />

        {/* Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          className={styles.indicator}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
        />
      </svg>

      {showLabel && (
        <div className={styles.labelCenter}>
          <span
            className={styles.valueText}
            style={{ fontSize: size >= 64 ? '18px' : size >= 48 ? '14px' : '11px' }}
          >
            {clampedValue}
            <span className={styles.suffix}>{labelSuffix}</span>
          </span>
          {subtitle && size >= 64 && (
            <span className={styles.subText}>{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
}
