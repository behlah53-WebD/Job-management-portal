import React from 'react';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import styles from './landing.module.css';

export default function RootLoading() {
  return (
    <div className={styles.pageWrapper} style={{ minHeight: '80vh', padding: '40px 24px' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      </div>
    </div>
  );
}
