'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Bell,
  User,
  Bookmark,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { getInitials } from '@/lib/utils';
import { useScrollState } from './useScrollState';
import styles from './Navbar.module.css';

/**
 * FEATURE TOGGLE FLAGS:
 * You can toggle any optional polish feature on or off with these one-line flags:
 */
export const ENABLE_HIDE_ON_SCROLL = true; // Slide up on fast downward scroll, slide down on scroll up
export const ENABLE_ACTIVE_PILL = true;     // Sliding soft mint pill indicator behind current page link
export const ENABLE_SCROLL_PROGRESS = true; // 2px green gradient progress line at bottom of floating pill

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Route awareness: Only home ('/') features the full hero glow.
  // Other pages (e.g. /jobs, /pricing, /about) start in the elevated glass state for immediate contrast.
  const hasHero = pathname === '/';

  // UI state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch {
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  // High-performance scroll tracking
  const { isScrolled, isHidden, scrollProgress } = useScrollState({
    thresholdEnter: 32,
    thresholdExit: 12,
    enableHideOnScroll: ENABLE_HIDE_ON_SCROLL,
    disabled: mobileMenuOpen || userDropdownOpen || notificationsOpen || isFocused,
  });

  // Effective floating state
  // On pages with a hero, float only after scrolling down (isScrolled = true).
  // On pages without a hero, use the floating glass style immediately.
  const isFloating = hasHero ? isScrolled : true;

  // Refs for click outside handling
  const navbarRef = useRef(null);
  const userMenuRef = useRef(null);
  const notifMenuRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Close menus on Escape key & outside clicks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
        setNotificationsOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [mobileMenuOpen]);

  // Fetch notifications for authenticated user
  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications')
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const role = session?.user?.role || 'jobseeker';
  const dashboardLink =
    role === 'admin'
      ? '/dashboard/admin'
      : role === 'employer'
      ? '/dashboard/employer'
      : '/dashboard/seeker';

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'POST' });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
  };

  // Role-specific navigation links for Employer, Employee (Job Seeker), Admin, and Guests
  let navLinks = [];
  if (session?.user) {
    if (role === 'employer') {
      navLinks = [
        { label: 'Dashboard', href: '/dashboard/employer', active: pathname === '/dashboard/employer' },
        { label: 'Post a Job', href: '/dashboard/employer/post-job', active: pathname.startsWith('/dashboard/employer/post-job') },
        { label: 'Applicants', href: '/dashboard/employer/applicants', active: pathname.startsWith('/dashboard/employer/applicants') },
        { label: 'Companies', href: '/companies', active: pathname.startsWith('/companies') },
      ];
    } else if (role === 'admin') {
      navLinks = [
        { label: 'Console', href: '/dashboard/admin', active: pathname.startsWith('/dashboard/admin') },
        { label: 'Jobs', href: '/jobs', active: pathname.startsWith('/jobs') },
        { label: 'Companies', href: '/companies', active: pathname.startsWith('/companies') },
      ];
    } else {
      // Job Seeker / Employee
      navLinks = [
        { label: 'Find Jobs', href: '/jobs', active: pathname.startsWith('/jobs') },
        { label: 'Companies', href: '/companies', active: pathname.startsWith('/companies') },
        { label: 'My Applications', href: '/dashboard/seeker/applications', active: pathname.startsWith('/dashboard/seeker/applications') },
        { label: 'Saved Jobs', href: '/dashboard/seeker/saved', active: pathname.startsWith('/dashboard/seeker/saved') },
      ];
    }
  } else {
    // Unauthenticated Guest
    navLinks = [
      { label: 'Find Jobs', href: '/jobs', active: pathname.startsWith('/jobs') },
      { label: 'Companies', href: '/companies', active: pathname.startsWith('/companies') },
      { label: 'How it works', href: '/#how-it-works', active: false },
      { label: 'For Employers', href: '/dashboard/employer/post-job', active: pathname.startsWith('/dashboard/employer') },
    ];
  }

  return (
    <>
      {/* 1. Permanent Layout Spacer: Guarantees zero layout shift when navbar changes state */}
      <div className={styles.navbarSpacer} aria-hidden="true" />

      {/* 2. Fixed Outer Container */}
      <header
        ref={navbarRef}
        onFocus={() => setIsFocused(true)}
        onBlur={(e) => {
          if (!navbarRef.current?.contains(e.relatedTarget)) {
            setIsFocused(false);
          }
        }}
        className={`${styles.headerFixedWrapper} ${styles.initialEntrance} ${
          isHidden && !mobileMenuOpen ? styles.headerHidden : ''
        }`}
      >
        {/* 3. The Transforming Navbar Bar */}
        <nav
          aria-label="Main"
          className={`${styles.navbarBar} ${
            isFloating ? styles.barFloating : styles.barMerged
          }`}
        >
          <div className={styles.barInner}>
            {/* Logo */}
            <div className={`${styles.logoWrapper} ${isFloating ? styles.logoCompact : ''}`}>
              <Logo size="md" />
            </div>

            {/* Desktop Navigation Links */}
            <div className={styles.desktopNav}>
              {navLinks.map((item) => {
                const isActive = item.active;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                  >
                    {ENABLE_ACTIVE_PILL && isActive && (
                      <span className={styles.activeLinkPill} aria-hidden="true" />
                    )}
                    <span className={styles.navLinkText}>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Action Controls */}
            <div className={styles.rightActions}>
              {session?.user ? (
                <div className={styles.loggedInArea}>
                  {/* Notifications Popover */}
                  <div className={styles.popoverWrapper} ref={notifMenuRef}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => setNotificationsOpen(!notificationsOpen)}
                      aria-label="View notifications"
                      aria-expanded={notificationsOpen}
                    >
                      <Bell size={19} />
                      {unreadCount > 0 && (
                        <span className={styles.badgeCount}>{unreadCount}</span>
                      )}
                    </button>

                    {notificationsOpen && (
                      <div className={styles.popoverDropdown}>
                        <div className={styles.popoverHeader}>
                          <span className={styles.popoverTitle}>Notifications</span>
                          {unreadCount > 0 && (
                            <button
                              type="button"
                              className={styles.markReadBtn}
                              onClick={markAllRead}
                            >
                              Mark all as read
                            </button>
                          )}
                        </div>
                        <div className={styles.popoverBody}>
                          {notifications.length === 0 ? (
                            <div className={styles.emptyNotification}>
                              <span>No new notifications 🌱</span>
                            </div>
                          ) : (
                            notifications.slice(0, 5).map((n) => (
                              <Link
                                key={n._id}
                                href={n.link || '#'}
                                className={`${styles.notificationItem} ${
                                  !n.isRead ? styles.unreadItem : ''
                                }`}
                                onClick={() => setNotificationsOpen(false)}
                              >
                                <p className={styles.notifMsg}>{n.message}</p>
                                <span className={styles.notifTime}>Just now</span>
                              </Link>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Profile Dropdown */}
                  <div className={styles.popoverWrapper} ref={userMenuRef}>
                    <button
                      type="button"
                      className={styles.userButton}
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      aria-expanded={userDropdownOpen}
                      aria-label="User navigation menu"
                    >
                      <div className={styles.avatar}>
                        {getInitials(session.user.name)}
                      </div>
                      <span className={styles.userName}>
                        {session.user.name?.split(' ')[0]}
                      </span>
                      <ChevronDown
                        size={15}
                        className={`${styles.userChevron} ${
                          userDropdownOpen ? styles.userChevronOpen : ''
                        }`}
                      />
                    </button>

                    {userDropdownOpen && (
                      <div className={styles.userDropdown}>
                        <div className={styles.dropdownUserInfo}>
                          <span className={styles.dropdownName}>{session.user.name}</span>
                          <span className={styles.dropdownRole}>{session.user.role}</span>
                        </div>
                        <div className={styles.dropdownDivider} />
                        <Link href={dashboardLink} className={styles.dropdownItem}>
                          <LayoutDashboard size={16} />
                          <span>Dashboard</span>
                        </Link>
                        {role === 'jobseeker' && (
                          <>
                            <Link href="/dashboard/seeker/profile" className={styles.dropdownItem}>
                              <User size={16} />
                              <span>My Profile</span>
                            </Link>
                            <Link href="/dashboard/seeker/saved" className={styles.dropdownItem}>
                              <Bookmark size={16} />
                              <span>Saved Jobs</span>
                            </Link>
                          </>
                        )}
                        <div className={styles.dropdownDivider} />
                        <button
                          type="button"
                          className={`${styles.dropdownItem} ${styles.logoutItem}`}
                          onClick={handleSignOut}
                          disabled={isSigningOut}
                        >
                          <LogOut size={16} />
                          <span>{isSigningOut ? 'Signing out...' : 'Log out'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Unauthenticated Auth Buttons */
                <div className={styles.authButtons}>
                  <Link href="/login">
                    <Button variant="ghost" size="md" className={styles.authBtnLogin}>
                      Log in
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="md" className={styles.authBtnSignup}>
                      Sign up
                    </Button>
                  </Link>
                </div>
              )}

              {/* Animated Hamburger Icon */}
              <button
                type="button"
                className={`${styles.mobileToggle} ${
                  mobileMenuOpen ? styles.mobileToggleActive : ''
                }`}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-drawer"
              >
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
                <span className={styles.hamburgerLine} />
              </button>
            </div>
          </div>

          {/* 4. Thin Green Scroll Progress Indicator */}
          {ENABLE_SCROLL_PROGRESS && isFloating && (
            <div className={styles.progressTrack} aria-hidden="true">
              <div
                className={styles.progressBar}
                style={{ transform: `scaleX(${scrollProgress})` }}
              />
            </div>
          )}

          {/* 5. Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div
              id="mobile-navigation-drawer"
              className={styles.mobileDrawer}
            >
              <nav className={styles.mobileLinks}>
                {navLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.mobileLink} ${
                      item.active ? styles.mobileLinkActive : ''
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className={styles.mobileAuthArea}>
                {session?.user ? (
                  <>
                    <Link
                      href={dashboardLink}
                      className={styles.mobileAuthBtn}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" fullWidth size="md">
                        Go to Dashboard
                      </Button>
                    </Link>
                    <Button
                      variant="secondary"
                      fullWidth
                      size="md"
                      onClick={handleSignOut}
                      loading={isSigningOut}
                      disabled={isSigningOut}
                    >
                      {isSigningOut ? 'Signing out...' : 'Log out'}
                    </Button>
                  </>
                ) : (
                  <div className={styles.mobileAuthGrid}>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" fullWidth size="md">
                        Log in
                      </Button>
                    </Link>
                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" fullWidth size="md">
                        Sign up
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>
    </>
  );
}
