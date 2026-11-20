'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sprout,
  Bell,
  Menu,
  X,
  User,
  Bookmark,
  LayoutDashboard,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import { getInitials } from '@/lib/utils';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  }, [pathname]);

  // Fetch notifications if logged in
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

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.navbar}`}>
        {/* Logo */}
        <Logo size="md" />

        {/* Center Nav */}
        <nav className={styles.desktopNav}>
          <Link
            href="/jobs"
            className={`${styles.navLink} ${pathname.startsWith('/jobs') ? styles.activeLink : ''}`}
          >
            Find Jobs
          </Link>
          <Link
            href="/companies"
            className={`${styles.navLink} ${pathname.startsWith('/companies') ? styles.activeLink : ''}`}
          >
            Companies
          </Link>
          <Link href="/#how-it-works" className={styles.navLink}>
            How it works
          </Link>
          <Link href="/dashboard/employer/post-job" className={styles.navLink}>
            For Employers
          </Link>
        </nav>

        {/* Right CTA / User State */}
        <div className={styles.rightActions}>
          {session?.user ? (
            <div className={styles.loggedInArea}>
              {/* Notifications */}
              <div className={styles.popoverWrapper}>
                <button
                  type="button"
                  className={styles.iconBtn}
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="View notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && <span className={styles.badgeCount}>{unreadCount}</span>}
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
                            className={`${styles.notificationItem} ${!n.isRead ? styles.unreadItem : ''}`}
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

              {/* Avatar Dropdown */}
              <div className={styles.popoverWrapper}>
                <button
                  type="button"
                  className={styles.userButton}
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className={styles.avatar}>
                    {getInitials(session.user.name)}
                  </div>
                  <span className={styles.userName}>{session.user.name?.split(' ')[0]}</span>
                  <ChevronDown size={15} className={styles.userChevron} />
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
                      Dashboard
                    </Link>
                    {role === 'jobseeker' && (
                      <>
                        <Link href="/dashboard/seeker/profile" className={styles.dropdownItem}>
                          <User size={16} />
                          My Profile
                        </Link>
                        <Link href="/dashboard/seeker/saved" className={styles.dropdownItem}>
                          <Bookmark size={16} />
                          Saved Jobs
                        </Link>
                      </>
                    )}
                    <div className={styles.dropdownDivider} />
                    <button
                      type="button"
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}

          {/* Hamburger Mobile */}
          <button
            type="button"
            className={styles.mobileToggle}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileLinks}>
            <Link href="/jobs" className={styles.mobileLink}>
              Find Jobs
            </Link>
            <Link href="/companies" className={styles.mobileLink}>
              Companies
            </Link>
            <Link href="/#how-it-works" className={styles.mobileLink}>
              How it works
            </Link>
            <Link href="/dashboard/employer/post-job" className={styles.mobileLink}>
              For Employers
            </Link>
          </div>

          <div className={styles.mobileAuthArea}>
            {session?.user ? (
              <>
                <Link href={dashboardLink} className={styles.mobileAuthBtn}>
                  <Button variant="primary" fullWidth>
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Log out
                </Button>
              </>
            ) : (
              <div className={styles.mobileAuthGrid}>
                <Link href="/login">
                  <Button variant="secondary" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" fullWidth>
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
