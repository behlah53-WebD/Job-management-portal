import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Link from 'next/link';
import { Check, Sparkles, Building2, Zap } from 'lucide-react';

export const metadata = {
  title: 'Pricing & Plans — Verdant',
  description: 'Transparent and predictable hiring plans for conscious teams and studios.',
};

export const revalidate = 3600;

export default function PricingPage() {
  const plans = [
    {
      name: 'Seedling',
      price: 'Free',
      period: 'forever',
      desc: 'Ideal for early-stage teams exploring their first critical hires.',
      features: [
        '1 Active job listing at a time',
        'Standard candidate applications pipeline',
        'Company profile in directory',
        'Community candidate pool access',
        'Email applicant alerts',
      ],
      cta: 'Start Free',
      href: '/register',
      popular: false,
    },
    {
      name: 'Canopy Studio',
      price: '₹14,999',
      period: 'per month',
      desc: 'For thriving studios and tech scale-ups actively building out teams.',
      features: [
        'Up to 10 Active listings simultaneously',
        'Featured "Hiring Fast" badges on cards',
        'Interactive Kanban candidate management',
        'Direct candidate messaging & notes',
        'Automated status change push notifications',
        'Priority placement in search results',
      ],
      cta: 'Get Canopy Plan',
      href: '/register',
      popular: true,
    },
    {
      name: 'Old Growth',
      price: '₹34,999',
      period: 'per quarter',
      desc: 'Comprehensive recruiting ecosystem for high-volume engineering orgs.',
      features: [
        'Unlimited active listings',
        'Verified Partner employer checkmark',
        'Dedicated talent curator support',
        'Direct ATS webhook & API integrations',
        'Tailored employer branding showcase',
        'Multi-admin team access controls',
      ],
      cta: 'Contact Sales',
      href: '/register',
      popular: false,
    },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-page)' }}>
      <Navbar />

      <main className="container" style={{ flex: 1, paddingTop: '56px', paddingBottom: '96px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--green-600)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Predictable & Transparent
          </span>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '38px', color: 'var(--green-900)', marginTop: '8px', marginBottom: '16px' }}>
            Hiring plans that grow with your team 🌿
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--text-muted)', maxWidth: '580px', margin: '0 auto' }}>
            No hidden contingency commissions or predatory lock-ins. Simple, serene subscriptions designed for conscious founders.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', alignItems: 'stretch' }}>
          {plans.map((p) => (
            <Card
              key={p.name}
              padding="large"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                border: p.popular ? '2px solid var(--green-600)' : '1px solid #dcebe1',
              }}
            >
              {p.popular && (
                <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }}>
                  <Badge variant="hiring-fast" dot={false}>
                    <Sparkles size={12} style={{ marginRight: '4px' }} />
                    Most Flourishing Choice
                  </Badge>
                </div>
              )}

              <div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green-900)', marginBottom: '6px' }}>{p.name}</h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px', minHeight: '42px' }}>{p.desc}</p>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '24px' }}>
                  <span style={{ fontFamily: 'var(--font-serif)', fontSize: '36px', fontWeight: 700, color: 'var(--green-900)' }}>{p.price}</span>
                  <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>/ {p.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  {p.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '14px', color: '#2c3e35' }}>
                      <Check size={16} color="var(--green-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link href={p.href} style={{ width: '100%' }}>
                <Button variant={p.popular ? 'primary' : 'secondary'} style={{ width: '100%' }}>
                  {p.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
