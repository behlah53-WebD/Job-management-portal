import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Terms of Service — Verdant',
  description: 'Terms and standards governing the Verdant community and hiring marketplace.',
};

export const revalidate = 3600;

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '56px', paddingBottom: '96px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--green-900)', marginBottom: '8px' }}>
          Terms of Service 🌿
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Last updated: November 2026 • Clear, fair guidelines for candidate and employer cooperation.
        </p>

        <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, fontSize: '15px', color: '#2c3e35' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>1. Platform Integrity & Listing Standards</h2>
            <p>
              Employers on Verdant agree to post only genuine, active employment opportunities with transparent compensation structures and clear requirements. Deceptive listings, unpaid test assignments exceeding reasonable scope, or discriminatory criteria will result in prompt listing suspension.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>2. Candidate Representations</h2>
            <p>
              Job seekers warrant that experience, qualifications, resumes, and portfolio artifacts provided in applications are accurate and submitted in good faith. Duplicate spam submissions or automated scraping of application forms is prohibited.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>3. Limitation of Liability</h2>
            <p>
              Verdant provides candidate and employer matchmaking infrastructure. We do not participate in employment agreements, salary negotiations, or workplace disputes beyond facilitating high-trust introductions.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
