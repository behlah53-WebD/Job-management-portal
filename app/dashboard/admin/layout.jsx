'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  Sprout,
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  AlertTriangle,
  FolderTree,
  BarChart3,
  Sliders,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
} from 'lucide-react';
import MobileTopBar from '@/components/layout/mobile/MobileTopBar';
import MobileTabBar from '@/components/layout/mobile/MobileTabBar';
import AccountSheet from '@/components/layout/mobile/AccountSheet';
import useMobileLayoutCheck from '@/hooks/useMobileLayoutCheck';
import styles from './adminLayout.module.css';

export default function AdminDashboardLayout({ children }) {
  useMobileLayoutCheck();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
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
    } finally {
      setIsSigningOut(false);
    }
  };

  const getPageTitle = () => {
    if (pathname === '/dashboard/admin') return 'Admin Console';
    if (pathname.includes('/users')) return 'Manage Users';
    if (pathname.includes('/jobs')) return 'Moderate Jobs';
    if (pathname.includes('/companies')) return 'Companies';
    if (pathname.includes('/reports')) return 'Reports';
    if (pathname.includes('/categories')) return 'Categories';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Admin';
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard/admin', icon: LayoutDashboard },
    { label: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
    { label: 'Moderate Jobs', href: '/dashboard/admin/jobs', icon: Briefcase },
    { label: 'Companies', href: '/dashboard/admin/companies', icon: Building },
    { label: 'Reports', href: '/dashboard/admin/reports', icon: AlertTriangle },
    { label: 'Categories', href: '/dashboard/admin/categories', icon: FolderTree },
    { label: 'Settings', href: '/dashboard/admin/settings', icon: Sliders },
  ];

  return (
    <div className={styles.layout}>
      {/* Mobile Top Bar (< 1024px) */}
      <div className={styles.mobileTopBarWrapper}>
        <MobileTopBar
          title={getPageTitle()}
          onOpenAccount={() => setAccountSheetOpen(true)}
        />
      </div>

      {/* Admin Dark Control Sidebar (green-900) - Desktop >= 1024px */}
      <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Sprout size={20} />
            </div>
            <div className={styles.logoMeta}>
              <span className={styles.logoText}>Verdant</span>
              <span className={styles.adminBadge}>Admin Console</span>
            </div>
          </Link>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/admin'
                ? pathname === '/dashboard/admin'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} className={styles.navIcon} />
                <span>{item.label}</span>
                {isActive && <div className={styles.limeActivePill} />}
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <Link href="/jobs" className={styles.viewPublicLink}>
            <ExternalLink size={15} />
            <span>View Public Platform</span>
          </Link>
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

      {/* Main Admin Workspace */}
      <div className={styles.mainContent}>
        {/* Desktop Top Bar (>= 1024px) */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileToggle}
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className={styles.securityIndicator}>
              <Shield size={16} className={styles.shieldIcon} />
              <span>Verdant SuperAdmin • Secure Session</span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <span className={styles.envBadge}>Production Node</span>
          </div>
        </header>

        <main className={styles.pageBody}>{children}</main>

        {/* Floating Mobile Tab Bar (< 1024px) */}
        <MobileTabBar role="admin" />

        {/* Mobile Account Sheet (< 1024px) */}
        <AccountSheet
          isOpen={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
          user={session?.user}
        />
      </div>
    </div>
  );
}
