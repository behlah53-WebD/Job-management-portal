import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { Sprout, Heart, Shield, Sparkles, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'About Us — Verdant',
  description: 'Learn about the philosophy, calm ethos, and values behind Verdant.',
};

export const revalidate = 3600;

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '56px', paddingBottom: '96px', maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Our Ethos & Origin
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--green-900)', marginTop: '8px', marginBottom: '16px' }}>
            Cultivating intentional, calm careers 🌱
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '640px', margin: '0 auto' }}>
            Verdant was crafted to offer an antidote to chaotic, noisy hiring. We connect thoughtful makers and engineers with conscious teams building sustainable futures.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '48px' }}>
          <Card padding="normal">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e3f4e9', color: '#1e9a56', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Heart size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '8px' }}>Human First</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Job searches shouldn't feel dehumanizing. We respect candidates' time, provide transparent salary ranges, and prioritize dignified work-life harmony.
            </p>
          </Card>

          <Card padding="normal">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e3f4e9', color: '#1e9a56', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Shield size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '8px' }}>High Trust</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Every employer on Verdant undergoes verification. No ghost jobs, no bait-and-switch listings, and zero spam recruiters.
            </p>
          </Card>

          <Card padding="normal">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#e3f4e9', color: '#1e9a56', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--green-900)', marginBottom: '8px' }}>Dedicated Craft</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              From high-leverage product design to robust distributed systems, we celebrate deep mastery and continuous learning over superficial keywords.
            </p>
          </Card>
        </div>

        <div style={{ textAlign: 'center', background: '#fff', border: '1px solid #dcebe1', borderRadius: '20px', padding: '40px 24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '26px', color: 'var(--green-900)', marginBottom: '12px' }}>
            Ready to find where you flourish?
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '480px', margin: '0 auto 24px' }}>
            Explore verified openings across engineering, design, marketing, and leadership.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/jobs">
              <Button variant="primary">Browse Open Roles 🌿</Button>
            </Link>
            <Link href="/companies">
              <Button variant="secondary">Explore Companies</Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
