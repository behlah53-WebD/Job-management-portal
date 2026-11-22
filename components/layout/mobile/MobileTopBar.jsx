'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Bell, ArrowLeft, X, Plus } from 'lucide-react';
import { getInitials, getGreeting } from '@/lib/utils';
import NotificationsSheet from './NotificationsSheet';
import styles from './MobileTopBar.module.css';

/**
 * Mobile Top App Bar
 * Left: 40px avatar or company logo button -> opens AccountSheet
 * Center: Serif Page Title (never wraps, cross-fades on scroll)
 * Right:
 *   - Seekers: search icon + notification bell
 *   - Employers: notification bell + circular "+" post-job button
 */
export default function MobileTopBar({
  role = 'seeker',
  company = null,
  user,
  onOpenAccount,
  title: customTitle,
  unreadNotifications: propUnreadNotifications,
  onOpenNotifications,
  hasSearch = true,
  hasPostJobBtn = false,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);

  const isEmployer = role === 'employer' || pathname.startsWith('/dashboard/employer');
  const showSearch = isEmployer ? false : hasSearch;
  const showPostJob = isEmployer ? true : hasPostJobBtn;

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef(null);

  // Notifications state
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(propUnreadNotifications ?? 0);

  useEffect(() => {
    if (propUnreadNotifications !== undefined) {
      setUnreadCount(propUnreadNotifications);
    }
  }, [propUnreadNotifications]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications on mount or when opening sheet
  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setNotifications(data);
          setUnreadCount(data.filter((n) => !n.isRead).length);
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Focus search input when search opens
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    const q = searchQuery.trim();
    setIsSearchOpen(false);
    if (q) {
      router.push(`/jobs?q=${encodeURIComponent(q)}`);
    } else {
      router.push('/jobs');
    }
  };

  const handleBellClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      fetchNotifications();
      setNotificationsOpen(true);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {}
  };

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
      {isSearchOpen ? (
        /* Expanded Search Mode */
        <div className={styles.searchBarRow}>
          <button
            type="button"
            className={styles.searchCloseBtn}
            onClick={() => setIsSearchOpen(false)}
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </button>

          <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
            <Search size={17} className={styles.searchFormIcon} />
            <input
              ref={searchInputRef}
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs, skills, companies..."
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={styles.searchClearBtn}
                aria-label="Clear"
              >
                <X size={14} />
              </button>
            )}
            <button type="submit" className={styles.searchSubmitBtn}>
              Search
            </button>
          </form>
        </div>
      ) : (
        /* Default Top Bar Mode */
        <div className={styles.barInner}>
          {/* Left: 40px Avatar or Company Logo Button */}
          <button
            type="button"
            className={styles.avatarBtn}
            onClick={onOpenAccount}
            aria-label={isEmployer ? 'Open company and account menu' : 'Open account menu'}
          >
            {isEmployer && company?.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={company.logo}
                alt={company?.name || 'Company'}
                className={styles.companyLogoThumb}
              />
            ) : (
              <span className={styles.avatarInitials}>
                {getInitials(isEmployer ? company?.name || user?.name || 'Flora' : user?.name || 'Verdant')}
              </span>
            )}
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

          {/* Right: Actions */}
          <div className={styles.actionsRight}>
            {showSearch && (
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search jobs"
              >
                <Search size={19} />
              </button>
            )}

            <button
              type="button"
              className={styles.iconBtn}
              onClick={handleBellClick}
              aria-label="Notifications"
            >
              <Bell size={19} />
              {unreadCount > 0 && <span className={styles.notifBadge} />}
            </button>

            {showPostJob && (
              <Link
                href="/dashboard/employer/post-job"
                className={styles.postJobCircleBtn}
                aria-label="Post a Job"
              >
                <Plus size={20} />
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Notifications Bottom Sheet */}
      <NotificationsSheet
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
      />
    </header>
  );
}
