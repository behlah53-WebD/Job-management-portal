'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
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
import styles from './adminLayout.module.css';

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
      {/* Admin Dark Control Sidebar (green-900) */}
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
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className={styles.mainContent}>
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
      </div>
    </div>
  );
}
