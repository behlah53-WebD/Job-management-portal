'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { getInitials, getGreeting } from '@/lib/utils';
import styles from './MobileTopBar.module.css';

/**
 * Mobile Top App Bar (56px + safe area)
 * Left: 40px avatar button (initials) -> opens AccountSheet
 * Center: Serif Page Title (never wraps, cross-fades on scroll)
 * Right: 40px search button + 40px notification bell
 */
export default function MobileTopBar({
  user,
  onOpenAccount,
  title: customTitle,
  unreadNotifications = 0,
  onOpenNotifications,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    if (customTitle) return customTitle;
    if (pathname === '/dashboard/seeker') {
      const firstName = user?.name?.split(' ')[0] || 'Candidate';
      return getGreeting(firstName);
    }
    if (pathname.includes('/applications')) return 'Applications';
    if (pathname.includes('/saved')) return 'Saved';
    if (pathname.includes('/recommended')) return 'For You';
    if (pathname.includes('/profile')) return 'Profile';
    if (pathname.includes('/settings')) return 'Settings';

    // Employer
    if (pathname === '/dashboard/employer') {
      const firstName = user?.name?.split(' ')[0] || 'Partner';
      return getGreeting(firstName);
    }
    if (pathname.includes('/post-job')) return 'Post a Job';
    if (pathname.includes('/my-jobs')) return 'My Jobs';
    if (pathname.includes('/applicants')) return 'Applicants';
    if (pathname.includes('/company')) return 'Company';

    // Admin
    if (pathname === '/dashboard/admin') return 'Admin Console';
    if (pathname.includes('/users')) return 'Manage Users';
    if (pathname.includes('/jobs')) return 'Moderate Jobs';
    if (pathname.includes('/companies')) return 'Companies';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/categories')) return 'Categories';

    return 'Verdant';
  };

  const pageTitle = getPageTitle();

  return (
    <header className={`${styles.bar} ${isScrolled ? styles.barScrolled : ''}`}>
      <div className={styles.barInner}>
        {/* Left: 40px Avatar Button */}
        <button
          type="button"
          className={styles.avatarBtn}
          onClick={onOpenAccount}
          aria-label="Open account menu"
        >
          <span className={styles.avatarInitials}>
            {getInitials(user?.name || 'Verdant')}
          </span>
        </button>

        {/* Center: Serif Page Title */}
        <div className={styles.titleContainer}>
          <h1
            className={`${styles.pageTitle} ${
              isScrolled ? styles.titleCompact : ''
            }`}
          >
            {pageTitle}
          </h1>
        </div>

        {/* Right: Search & Bell */}
        <div className={styles.actionsRight}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => router.push('/jobs')}
            aria-label="Search jobs"
          >
            <Search size={19} />
          </button>

          <button
            type="button"
            className={styles.iconBtn}
            onClick={onOpenNotifications || (() => router.push('/dashboard/seeker'))}
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadNotifications > 0 && (
              <span className={styles.notifBadge} />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
