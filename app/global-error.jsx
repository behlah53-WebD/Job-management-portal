'use client';

import React, { useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('Global application error caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#F8FBF9' }}>
        <div
          style={{
            minHeight: '100vh',
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
              backgroundColor: '#FDECEB',
              color: '#E5584F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              marginBottom: '20px',
            }}
          >
            🌿
          </div>
          <h2 style={{ fontSize: '28px', color: '#12372A', marginBottom: '8px' }}>
            Something needs a little watering
          </h2>
          <p style={{ fontSize: '15px', color: '#5C7A6D', maxWidth: '440px', marginBottom: '24px', lineHeight: 1.5 }}>
            A temporary application exception occurred. You can reset this view or refresh the page to continue flourishing.
          </p>
          <Button variant="primary" onClick={() => reset()}>
            Reset View 🌱
          </Button>
        </div>
      </body>
    </html>
  );
}
