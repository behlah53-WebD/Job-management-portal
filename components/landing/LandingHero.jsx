'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Users,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import styles from './LandingHero.module.css';

const MOBILE_HERO_JOBS = [
  {
    title: 'Staff Design Engineer',
    company: 'Fern & Stone • Remote',
    salary: '₹28 - 36 LPA',
    badge: 'New',
  },
  {
    title: 'Lead Product Designer',
    company: 'Sproutify • Bangalore',
    salary: '₹32 - 45 LPA',
    badge: 'Hiring Fast',
  },
  {
    title: 'Founding Engineer (Next.js)',
    company: 'Canopy AI • Remote',
    salary: '₹35 - 50 LPA',
    badge: 'Verified',
  },
];

export default function LandingHero({ jobCount }) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [activeJobIndex, setActiveJobIndex] = useState(0);

  // Auto-rotate mobile active card every 4s with reduced-motion support
  useEffect(() => {
    const isReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    const timer = setInterval(() => {
      setActiveJobIndex((prev) => (prev + 1) % MOBILE_HERO_JOBS.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('q', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  const handleTagClick = (tag) => {
    router.push(`/jobs?q=${encodeURIComponent(tag)}`);
  };

  const activeMobileJob = MOBILE_HERO_JOBS[activeJobIndex];

  return (
    <section className={styles.heroSection}>
      {/* Organic blob decorations */}
      <div className={styles.blobOne} />
      <div className={styles.blobTwo} />

      <div className={`container ${styles.heroContainer}`}>
        {/* Left Column: Headline, Subtext, Search, Tags, Mobile Activity Stack */}
        <div className={styles.leftCol}>
          <div className={styles.pillBadge}>
            <Sparkles size={14} className={styles.pillIcon} />
            <span>
              {typeof jobCount === 'number'
                ? `${jobCount} verified ${jobCount === 1 ? 'opening' : 'openings'} available`
                : 'Verified career opportunities'}
            </span>
          </div>

          <h1 className={styles.heroTitle}>
            Find work that helps you <span className={styles.growWord}>grow</span>.
          </h1>

          <p className={styles.heroSubtitle}>
            A calm, conscious career platform connecting thoughtful candidates with
            sustainable, flourishing companies. No noise, just meaningful craft.
          </p>

          <form className={styles.searchBar} onSubmit={handleSearch}>
            <div className={styles.searchSegment}>
              <Search size={20} className={styles.segmentIcon} />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="Job title, keyword, or company..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className={styles.segmentInput}
              />
            </div>

            <div className={styles.divider} />

            <div className={styles.searchSegment}>
              <MapPin size={20} className={styles.segmentIcon} />
              <input
                suppressHydrationWarning
                type="text"
                placeholder="City or 'Remote'..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={styles.segmentInput}
              />
            </div>

            <Button type="submit" variant="primary" size="md" className={styles.searchBtn}>
              Search Jobs
            </Button>
          </form>

          {/* Popular tags */}
          <div className={styles.popularTags}>
            <span className={styles.popularLabel}>Popular searches:</span>
            <div className={styles.tagsRow}>
              {['React', 'Remote', 'Internship', 'Design', 'Next.js'].map((tag) => (
                <button
                  suppressHydrationWarning
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  className={styles.tagBtn}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Only: Tidy Centered Live Activity Card Stack (< 1024px) */}
          <div className={styles.mobileActivityStack}>
            {/* Offset Card Behind */}
            <div className={styles.mobileBackdropCard} />

            {/* Top Interactive Card */}
            <div className={styles.mobileActiveCard}>
              <div className={styles.mobileActiveLogo}>🌱</div>
              <div className={styles.mobileActiveMeta}>
                <div className={styles.mobileActiveTitleRow}>
                  <span className={styles.mobileActiveTitle}>
                    {activeMobileJob.title}
                  </span>
                  <span className={styles.mobileActiveBadge}>
                    {activeMobileJob.badge}
                  </span>
                </div>
                <span className={styles.mobileActiveCompany}>
                  {activeMobileJob.company}
                </span>
                <span className={styles.mobileActiveSalary}>
                  {activeMobileJob.salary}
                </span>
              </div>
            </div>

            {/* Notification Pill */}
            <div className={styles.mobileShortlistPill}>
              <div className={styles.mobileShortlistIcon}>
                <CheckCircle2 size={16} />
              </div>
              <div className={styles.mobileShortlistText}>
                <span className={styles.shortlistBold}>Application Shortlisted!</span>
                <span className={styles.shortlistSub}>Invited to round 1 interview</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Layered floating collage (Desktop >= 1024px only) */}
        <div className={styles.rightCol}>
          {/* Card 1: Mini Job Card */}
          <div className={`${styles.floatingCard} ${styles.jobCardFloat}`}>
            <div className={styles.floatLogo}>🌱</div>
            <div className={styles.floatJobMeta}>
              <span className={styles.floatJobTitle}>Staff Design Engineer</span>
              <span className={styles.floatCompany}>Fern & Stone • Remote</span>
              <span className={styles.floatSalary}>₹28 - 36 LPA</span>
            </div>
            <div className={styles.floatBadge}>New</div>
          </div>

          {/* Card 2: Notification Shortlisted */}
          <div className={`${styles.floatingCard} ${styles.notificationFloat}`}>
            <div className={styles.notifIconCircle}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className={styles.notifTitle}>Application Shortlisted!</span>
              <span className={styles.notifSub}>Sproutify Cloud invited you to interview</span>
            </div>
          </div>

          {/* Card 3: Stats Floating Card */}
          <div className={`${styles.floatingCard} ${styles.statsFloat}`}>
            <div className={styles.statsIconCircle}>
              <TrendingUp size={18} />
            </div>
            <div>
              <span className={styles.statsNum}>96%</span>
              <span className={styles.statsLabel}>Hiring match satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
