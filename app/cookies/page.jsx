import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Cookie Policy — Verdant',
  description: 'How Verdant handles cookies, local state, and offline PWA storage.',
};

export const revalidate = 3600;

export default function CookiesPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '56px', paddingBottom: '96px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--green-900)', marginBottom: '8px' }}>
          Cookie Notice 🍪
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Clear and minimal cookie usage designed to protect your session and remember preferences.
        </p>

        <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, fontSize: '15px', color: '#2c3e35' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>Essential Authentication Cookies</h2>
            <p>
              We use strictly necessary encrypted HTTP-only session cookies (`next-auth.session-token`) to authenticate your account and ensure secure role-based dashboard navigation. These cookies do not track you across external websites.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>Local Storage & Offline Caching</h2>
            <p>
              Verdant stores your search filters, saved job IDs, and recent searches in browser local storage (`localStorage` & IndexedDB) to enable instant page loads, offline navigation, and uninterrupted browsing even on spotty internet connections.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
