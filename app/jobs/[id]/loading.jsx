import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './jobDetails.module.css';

export default function JobDetailLoading() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className="container" style={{ paddingTop: '32px', paddingBottom: '96px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px' }}>
          <div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
              <Skeleton width="64px" height="64px" borderRadius="16px" />
              <div style={{ flex: 1 }}>
                <Skeleton width="60%" height="32px" />
                <Skeleton width="30%" height="18px" style={{ marginTop: '8px' }} />
              </div>
            </div>
            <Skeleton width="100%" height="220px" borderRadius="16px" style={{ marginBottom: '24px' }} />
            <Skeleton width="100%" height="360px" borderRadius="16px" />
          </div>

          <div>
            <Skeleton width="100%" height="320px" borderRadius="16px" />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
