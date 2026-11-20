'use client';

import React from 'react';
import Link from 'next/link';
import { Sprout, ArrowRight, Github, Twitter, Linkedin, Instagram } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        <div className={styles.topSection}>
          <div className={styles.brandCol}>
            <Logo size="md" />
            <p className={styles.tagline}>
              Grow your career in a serene space. Verdant bridges high-trust companies with candidates who value thoughtful craft and intentional growth.
            </p>
            <div className={styles.socialRow}>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Twitter">
                <Twitter size={18} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                <Linkedin size={18} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="GitHub">
                <Github size={18} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={styles.socialIcon} aria-label="Instagram">
                <Instagram size={18} />
              </a>
            </div>
          </div>

          <div className={styles.linksGrid}>
            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>For Job Seekers</h4>
              <ul className={styles.linkList}>
                <li><Link href="/jobs">Browse All Jobs</Link></li>
                <li><Link href="/jobs?workMode=Remote">Remote Opportunities</Link></li>
                <li><Link href="/companies">Company Directory</Link></li>
                <li><Link href="/dashboard/seeker/profile">Build Profile</Link></li>
                <li><Link href="/jobs?category=Software+Engineering">Tech Roles</Link></li>
              </ul>
            </div>

            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>For Employers</h4>
              <ul className={styles.linkList}>
                <li><Link href="/dashboard/employer/post-job">Post a Job</Link></li>
                <li><Link href="/dashboard/employer/applicants">Candidate Kanban</Link></li>
                <li><Link href="/dashboard/employer/company">Company Branding</Link></li>
                <li><Link href="/register">Employer Sign Up</Link></li>
                <li><Link href="/pricing">Pricing & Plans</Link></li>
              </ul>
            </div>

            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Platform</h4>
              <ul className={styles.linkList}>
                <li><Link href="/#how-it-works">How Verdant Works</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/privacy">Privacy Notice</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/dashboard/admin">Admin Portal</Link></li>
              </ul>
            </div>

            <div className={styles.linkCol}>
              <h4 className={styles.colTitle}>Stay in the Loop</h4>
              <p className={styles.newsletterText}>
                Receive weekly curated roles and career growth essays.
              </p>
              <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
                <input
                  suppressHydrationWarning
                  type="email"
                  placeholder="your.email@work.com"
                  className={styles.newsletterInput}
                  required
                />
                <button
                  suppressHydrationWarning
                  type="submit"
                  className={styles.newsletterBtn}
                  aria-label="Subscribe"
                >
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Verdant. All rights reserved. Made with care for flourishing careers.
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
