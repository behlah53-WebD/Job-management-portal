'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sprout,
  ArrowRight,
  Github,
  Twitter,
  Linkedin,
  Instagram,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import Logo from '@/components/ui/Logo';
import toast from 'react-hot-toast';
import styles from './Footer.module.css';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});

  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to subscribe');
      toast.success(data.message || 'Subscribed with care 🌱');
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <div className={styles.brandLogoRow}>
              <Logo size="md" />
            </div>
            <p className={styles.tagline}>
              Grow your career in a serene space. Verdant bridges high-trust companies
              with candidates who value thoughtful craft and intentional growth.
            </p>
            <div className={styles.socialRow}>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className={styles.socialIcon}
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            {/* Column 1: For Job Seekers */}
            <div className={styles.linkCol}>
              {/* Desktop Header */}
              <h4 className={styles.colTitleDesktop}>For Job Seekers</h4>

              {/* Mobile Accordion Toggle */}
              <button
                suppressHydrationWarning
                type="button"
                className={styles.mobileAccordionToggle}
                onClick={() => toggleAccordion('seekers')}
                aria-expanded={!!openAccordions['seekers']}
              >
                <span className={styles.colTitleMobile}>For Job Seekers</span>
                <ChevronDown
                  size={16}
                  className={`${styles.accordionChevron} ${
                    openAccordions['seekers'] ? styles.chevronOpen : ''
                  }`}
                />
              </button>

              <ul
                className={`${styles.linkList} ${
                  openAccordions['seekers'] ? styles.linkListOpen : ''
                }`}
              >
                <li><Link href="/jobs">Browse All Jobs</Link></li>
                <li><Link href="/jobs?workMode=Remote">Remote Opportunities</Link></li>
                <li><Link href="/companies">Company Directory</Link></li>
                <li><Link href="/dashboard/seeker/profile">Build Profile</Link></li>
                <li><Link href="/jobs?category=Software+Engineering">Tech Roles</Link></li>
              </ul>
            </div>

            {/* Column 2: For Employers */}
            <div className={styles.linkCol}>
              {/* Desktop Header */}
              <h4 className={styles.colTitleDesktop}>For Employers</h4>

              {/* Mobile Accordion Toggle */}
              <button
                suppressHydrationWarning
                type="button"
                className={styles.mobileAccordionToggle}
                onClick={() => toggleAccordion('employers')}
                aria-expanded={!!openAccordions['employers']}
              >
                <span className={styles.colTitleMobile}>For Employers</span>
                <ChevronDown
                  size={16}
                  className={`${styles.accordionChevron} ${
                    openAccordions['employers'] ? styles.chevronOpen : ''
                  }`}
                />
              </button>

              <ul
                className={`${styles.linkList} ${
                  openAccordions['employers'] ? styles.linkListOpen : ''
                }`}
              >
                <li><Link href="/dashboard/employer/post-job">Post a Job</Link></li>
                <li><Link href="/dashboard/employer/applicants">Candidate Kanban</Link></li>
                <li><Link href="/dashboard/employer/company">Company Branding</Link></li>
                <li><Link href="/register">Employer Sign Up</Link></li>
                <li><Link href="/pricing">Pricing & Plans</Link></li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className={styles.linkCol}>
              {/* Desktop Header */}
              <h4 className={styles.colTitleDesktop}>Platform</h4>

              {/* Mobile Accordion Toggle */}
              <button
                suppressHydrationWarning
                type="button"
                className={styles.mobileAccordionToggle}
                onClick={() => toggleAccordion('platform')}
                aria-expanded={!!openAccordions['platform']}
              >
                <span className={styles.colTitleMobile}>Platform</span>
                <ChevronDown
                  size={16}
                  className={`${styles.accordionChevron} ${
                    openAccordions['platform'] ? styles.chevronOpen : ''
                  }`}
                />
              </button>

              <ul
                className={`${styles.linkList} ${
                  openAccordions['platform'] ? styles.linkListOpen : ''
                }`}
              >
                <li><Link href="/#how-it-works">How Verdant Works</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/privacy">Privacy Notice</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/dashboard/admin">Admin Portal</Link></li>
              </ul>
            </div>

            {/* Column 4: Newsletter */}
            <div className={`${styles.linkCol} ${styles.newsletterCol}`}>
              <h4 className={styles.colTitleDesktop}>Stay in the Loop</h4>
              <p className={styles.newsletterText}>
                Receive weekly curated roles and career growth essays.
              </p>
              <form className={styles.newsletterForm} onSubmit={handleSubscribe}>
                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder="your.email@work.com"
                  className={styles.newsletterInput}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  required
                />
                <button
                  suppressHydrationWarning
                  type="submit"
                  className={styles.newsletterBtn}
                  disabled={submitting}
                  aria-label="Subscribe"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <ArrowRight size={18} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Verdant. All rights reserved. Made with care
            for flourishing careers.
          </p>
          <div className={styles.legalLinks}>
            <Link href="/privacy">Privacy</Link>
            <span className={styles.dot}>•</span>
            <Link href="/terms">Terms</Link>
            <span className={styles.dot}>•</span>
            <Link href="/cookies">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
