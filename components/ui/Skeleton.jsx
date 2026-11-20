import React from 'react';
import styles from './Skeleton.module.css';

export function Skeleton({ width, height, borderRadius, className = '', style = {} }) {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width,
        height,
        borderRadius: borderRadius || '8px',
        ...style,
      }}
    />
  );
}

export function JobCardSkeleton() {
  return (
    <div className={styles.jobCardSkeleton}>
      <div className={styles.headerRow}>
        <Skeleton width="56px" height="56px" borderRadius="14px" />
        <div className={styles.textCols}>
          <Skeleton width="60%" height="22px" />
          <Skeleton width="40%" height="16px" style={{ marginTop: '8px' }} />
        </div>
      </div>
      <div className={styles.chipRow}>
        <Skeleton width="70px" height="26px" borderRadius="999px" />
        <Skeleton width="80px" height="26px" borderRadius="999px" />
        <Skeleton width="65px" height="26px" borderRadius="999px" />
      </div>
      <div className={styles.footerRow}>
        <Skeleton width="35%" height="18px" />
        <Skeleton width="90px" height="38px" borderRadius="12px" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }) {
  return (
    <tr className={styles.tableRowSkeleton}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '16px' }}>
          <Skeleton width={i === 0 ? '70%' : '50%'} height="18px" />
        </td>
      ))}
    </tr>
  );
}
