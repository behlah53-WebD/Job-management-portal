import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { JobCardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import styles from './jobs.module.css';

export default function JobsLoading() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '80px' }}>
        <div style={{ marginBottom: '28px' }}>
          <Skeleton width="220px" height="32px" borderRadius="8px" />
          <Skeleton width="380px" height="18px" borderRadius="6px" style={{ marginTop: '8px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }}>
          <div style={{ display: 'none', md: 'block' }}>
            <Skeleton width="100%" height="420px" borderRadius="16px" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
