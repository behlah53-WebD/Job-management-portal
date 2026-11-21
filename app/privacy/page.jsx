import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';

export const metadata = {
  title: 'Privacy Notice — Verdant',
  description: 'Our commitment to data privacy, ethical candidate tracking, and security.',
};

export const revalidate = 3600;

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '56px', paddingBottom: '96px', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', color: 'var(--green-900)', marginBottom: '8px' }}>
          Privacy Notice 🌿
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
          Last updated: November 2026 • We treat your personal and career data with absolute reverence.
        </p>

        <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '24px', lineHeight: 1.7, fontSize: '15px', color: '#2c3e35' }}>
          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>1. Information We Collect</h2>
            <p>
              When you register as a job seeker or employer, we collect necessary account data including your name, email, encrypted password hash, and optional profile details (work experience, education, resume links, and salary expectations).
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>2. How We Use Candidate Information</h2>
            <p>
              Your application details and uploaded resumes are shared exclusively with the employers whose job postings you intentionally apply to. We never sell, rent, or syndicate candidate resumes to third-party data brokers or spam recruiting networks.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>3. Data Storage & Security Standards</h2>
            <p>
              All passwords are encrypted with industry-standard bcrypt hashes. Sensitive sessions are governed by secure HTTP-only cookies. Database transmissions are TLS-encrypted and access-restricted with strict least-privilege principles.
            </p>
          </section>

          <section>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '10px' }}>4. Your Rights & Data Portability</h2>
            <p>
              You maintain total ownership of your career profile. You can edit your portfolio links, withdraw pending applications, or request complete account erasure at any time via your dashboard settings or by contacting privacy@verdant.com.
            </p>
          </section>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
