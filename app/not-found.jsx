import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '40px 24px',
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 88 88"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ marginBottom: '24px', filter: 'drop-shadow(0 8px 24px rgba(30, 154, 86, 0.15))' }}
        >
          <circle cx="44" cy="44" r="40" fill="#E3F4E9" />
          <path d="M44 64V36" stroke="#1E9A56" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M44 48C44 40 32 36 28 36C28 48 36 52 44 48Z" fill="#5CC689" stroke="#1E9A56" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M44 42C44 32 58 28 62 28C62 42 52 46 44 42Z" fill="#C8F169" stroke="#1E9A56" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M26 64C34 62 54 62 62 64" stroke="#8FAE9A" strokeWidth="3" strokeLinecap="round" />
        </svg>

        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '36px',
            color: 'var(--green-900)',
            marginBottom: '12px',
          }}
        >
          This page hasn't grown yet 🌱
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-muted)',
            maxWidth: '460px',
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          The page or opportunity you are looking for may have sprouted elsewhere or been moved.
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/">
            <Button variant="primary">Return Home 🌿</Button>
          </Link>
          <Link href="/jobs">
            <Button variant="secondary">Browse Open Roles</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
