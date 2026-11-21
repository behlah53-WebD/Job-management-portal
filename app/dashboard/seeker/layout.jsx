'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sprout,
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Sparkles,
  User,
  Settings,
  LogOut,
  TreePine,
} from 'lucide-react';
import { getGreeting, getInitials, calculateProfileStrength } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import MobileTopBar from '@/components/layout/mobile/MobileTopBar';
import MobileTabBar from '@/components/layout/mobile/MobileTabBar';
import AccountSheet from '@/components/layout/mobile/AccountSheet';
import styles from './dashboardLayout.module.css';

export default function SeekerDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      await signOut({ redirect: false });
      router.push('/');
      router.refresh();
    } catch {
      window.location.href = '/';
    }
  };

  useEffect(() => {
    if (session?.user) {
      try {
        const cached = sessionStorage.getItem(`seeker_profile_${session.user.id}`);
        if (cached) {
          setProfile(JSON.parse(cached));
          return;
        }
      } catch {}

      fetch('/api/users/profile')
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data?.profile) {
            setProfile(data.profile);
            try {
              sessionStorage.setItem(`seeker_profile_${session.user.id}`, JSON.stringify(data.profile));
            } catch {}
          }
        })
        .catch(() => {});

      // Notifications count
      fetch('/api/notifications')
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setUnreadNotifications(data.filter((n) => !n.isRead).length);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  const strength = calculateProfileStrength(profile, session?.user);
  const userName = session?.user?.name?.split(' ')[0] || 'Candidate';
  const greeting = getGreeting(userName);

  const navItems = [
    { label: 'Overview', href: '/dashboard/seeker', icon: LayoutDashboard },
    { label: 'My Applications', href: '/dashboard/seeker/applications', icon: Briefcase },
    { label: 'Saved Jobs', href: '/dashboard/seeker/saved', icon: Bookmark },
    { label: 'Recommended', href: '/dashboard/seeker/recommended', icon: Sparkles },
    { label: 'My Profile', href: '/dashboard/seeker/profile', icon: User },
    { label: 'Settings', href: '/dashboard/seeker/settings', icon: Settings },
  ];

  return (
    <div className={styles.layoutWrapper}>
      {/* ========================================================
          DESKTOP SIDEBAR (>= 1024px only)
          ======================================================== */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <Logo size="sm" />
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/seeker'
                ? pathname === '/dashboard/seeker'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Completion Progress Card */}
        <div className={styles.profileProgressCard}>
          <div className={styles.progressTop}>
            <div className={styles.treeIconCircle}>
              {strength >= 80 ? (
                <TreePine size={20} className={styles.treeGrown} />
              ) : (
                <Sprout size={20} className={styles.sproutGrowing} />
              )}
            </div>
            <div>
              <span className={styles.progressTitle}>Profile Strength</span>
              <span className={styles.progressPercent}>{strength}% Complete</span>
            </div>
          </div>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              style={{ width: `${strength}%` }}
            />
          </div>
          <Link href="/dashboard/seeker/profile" className={styles.completeProfileLink}>
            {strength === 100 ? 'View your profile' : 'Add details to reach 100%'}
          </Link>
        </div>

        <div className={styles.sidebarFooter}>
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut size={16} />
            <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className={styles.mainContent}>
        {/* ========================================================
            DESKTOP TOPBAR (>= 1024px only)
            ======================================================== */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <h2 suppressHydrationWarning className={styles.greetingText}>{greeting}</h2>
          </div>

          <div className={styles.topbarRight}>
            <Link href="/jobs" className={styles.findJobsLink}>
              Find Jobs
            </Link>

            <Link href="/dashboard/seeker/profile" className={styles.userProfileLink}>
              <div className={styles.topAvatar}>
                {getInitials(session?.user?.name)}
              </div>
              <span className={styles.topUserName}>{session?.user?.name}</span>
            </Link>
          </div>
        </header>

        {/* ========================================================
            MOBILE TOPBAR (< 1024px only)
            ======================================================== */}
        <MobileTopBar
          user={session?.user}
          onOpenAccount={() => setAccountSheetOpen(true)}
          unreadNotifications={unreadNotifications}
        />

        {/* Page Content */}
        <main className={styles.pageBody}>{children}</main>

        {/* ========================================================
            MOBILE FLOATING BOTTOM TAB BAR (< 1024px only)
            ======================================================== */}
        <MobileTabBar
          role="seeker"
          applicationsBadge={0}
          isSheetOpen={accountSheetOpen}
        />

        {/* ========================================================
            MOBILE ACCOUNT SHEET (replaces side drawer)
            ======================================================== */}
        <AccountSheet
          isOpen={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          user={session?.user}
          profile={profile}
          strength={strength}
        />
      </div>
    </div>
  );
}
