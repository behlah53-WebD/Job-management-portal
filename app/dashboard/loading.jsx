import React from 'react';
import { Skeleton, TableRowSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLoading() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <Skeleton width="220px" height="32px" borderRadius="8px" />
        <Skeleton width="340px" height="18px" borderRadius="6px" style={{ marginTop: '8px' }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <Skeleton width="100%" height="110px" borderRadius="14px" />
        <Skeleton width="100%" height="110px" borderRadius="14px" />
        <Skeleton width="100%" height="110px" borderRadius="14px" />
        <Skeleton width="100%" height="110px" borderRadius="14px" />
      </div>

      <div style={{ background: '#fff', border: '1px solid #e1eee5', borderRadius: '16px', padding: '24px' }}>
        <Skeleton width="180px" height="24px" style={{ marginBottom: '16px' }} />
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <TableRowSkeleton cols={4} />
            <TableRowSkeleton cols={4} />
            <TableRowSkeleton cols={4} />
          </tbody>
        </table>
      </div>
    </div>
  );
}
