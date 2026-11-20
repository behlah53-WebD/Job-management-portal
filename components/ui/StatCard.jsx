'use client';

import React, { useEffect, useState } from 'react';
import Card from './Card';
import styles from './StatCard.module.css';

export default function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendLabel,
  description,
  accentColor = 'green', // 'green' | 'lime' | 'sage'
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const isNumber = typeof value === 'number';

  useEffect(() => {
    if (!isNumber) return;
    let start = 0;
    const duration = 800;
    const steps = 30;
    const increment = value / steps;
    const intervalTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [value, isNumber]);

  return (
    <Card className={`${styles.statCard} ${className}`} padding="normal">
      <div className={styles.topRow}>
        <span className={styles.label}>{label}</span>
        {Icon && (
          <div className={`${styles.iconCircle} ${styles[accentColor]}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>
          {isNumber ? displayValue.toLocaleString() : value}
        </span>
      </div>
      {(trend || description) && (
        <div className={styles.bottomRow}>
          {trend && (
            <span
              className={`${styles.trend} ${
                trend > 0 ? styles.trendUp : styles.trendDown
              }`}
            >
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span className={styles.description}>
            {trendLabel || description}
          </span>
        </div>
      )}
    </Card>
  );
}
