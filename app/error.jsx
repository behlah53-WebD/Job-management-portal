'use client';

import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error('App runtime error boundary caught:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '70vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '32px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '24px',
          marginBottom: '20px',
        }}
      >
        🌿
      </div>
      <h2
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '28px',
          color: 'var(--green-900)',
          marginBottom: '8px',
        }}
      >
        Something needs a little watering
      </h2>
      <p
        style={{
          fontSize: '15px',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          marginBottom: '24px',
        }}
      >
        An unexpected error occurred while rendering this page. You can try refreshing or resetting this view.
      </p>
      <Button variant="primary" onClick={() => reset()}>
        Try Again
      </Button>
    </div>
  );
}
