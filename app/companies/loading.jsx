import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Skeleton } from '@/components/ui/Skeleton';
import styles from './companies.module.css';

export default function CompaniesLoading() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className="container" style={{ paddingTop: '48px', paddingBottom: '96px' }}>
        <div style={{ marginBottom: '36px' }}>
          <Skeleton width="160px" height="20px" borderRadius="6px" />
          <Skeleton width="320px" height="36px" borderRadius="8px" style={{ marginTop: '8px' }} />
          <Skeleton width="480px" height="20px" borderRadius="6px" style={{ marginTop: '10px' }} />
        </div>

        <div className={styles.grid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid #e1eee5', borderRadius: '18px', padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <Skeleton width="56px" height="56px" borderRadius="14px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="70%" height="22px" />
                  <Skeleton width="40%" height="16px" style={{ marginTop: '6px' }} />
                </div>
              </div>
              <Skeleton width="100%" height="40px" style={{ marginBottom: '16px' }} />
              <Skeleton width="80px" height="32px" borderRadius="10px" />
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
