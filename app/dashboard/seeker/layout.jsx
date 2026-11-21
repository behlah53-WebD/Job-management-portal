'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  Menu,
  X,
  TreePine,
} from 'lucide-react';
import { getGreeting, getInitials, calculateProfileStrength } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import styles from './dashboardLayout.module.css';

export default function SeekerDashboardLayout({ children }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Left Sidebar (260px) */}
      <aside className={`${styles.sidebar} ${mobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Logo size="sm" />
          <button
            type="button"
            className={styles.closeDrawerBtn}
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
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
                onClick={() => setMobileMenuOpen(false)}
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
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <div className={styles.mainContent}>
        {/* Top Bar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileHamburger}
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
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

        {/* Page Content */}
        <main className={styles.pageBody}>{children}</main>

        {/* Bottom Tab Bar for Mobile */}
        <nav className={styles.mobileTabBar}>
          {navItems.slice(0, 5).map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/seeker'
                ? pathname === '/dashboard/seeker'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.tabBarItem} ${isActive ? styles.tabBarActive : ''}`}
              >
                <Icon size={20} />
                <span className={styles.tabBarLabel}>{item.label.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
