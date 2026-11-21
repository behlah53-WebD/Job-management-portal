'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  PlusCircle,
  Briefcase,
  Users,
  Building,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { getGreeting, getInitials } from '@/lib/utils';
import Logo from '@/components/ui/Logo';
import MobileTopBar from '@/components/layout/mobile/MobileTopBar';
import MobileTabBar from '@/components/layout/mobile/MobileTabBar';
import AccountSheet from '@/components/layout/mobile/AccountSheet';
import styles from './employerLayout.module.css';

export default function EmployerDashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [company, setCompany] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  useEffect(() => {
    try {
      const cached = sessionStorage.getItem('employer_company');
      if (cached) {
        setCompany(JSON.parse(cached));
        return;
      }
    } catch {}

    fetch('/api/companies?mine=true')
      .then((r) => r.json())
      .then((data) => {
        setCompany(data);
        try {
          sessionStorage.setItem('employer_company', JSON.stringify(data));
        } catch {}
      })
      .catch(() => {});
  }, []);

  const userName = session?.user?.name?.split(' ')[0] || 'Partner';
  const greeting = getGreeting(userName);

  const getPageTitle = () => {
    if (pathname === '/dashboard/employer') return `Good day, ${userName}`;
    if (pathname.includes('/post-job')) return 'Post a Job';
    if (pathname.includes('/my-jobs')) return 'My Jobs';
    if (pathname.includes('/applicants')) return 'Pipeline';
    if (pathname.includes('/company')) return 'Company Profile';
    if (pathname.includes('/settings')) return 'Settings';
    return 'Employer Console';
  };

  const navItems = [
    { label: 'Overview', href: '/dashboard/employer', icon: LayoutDashboard },
    { label: 'Post a Job', href: '/dashboard/employer/post-job', icon: PlusCircle },
    { label: 'My Jobs', href: '/dashboard/employer/my-jobs', icon: Briefcase },
    { label: 'Applicants (Kanban)', href: '/dashboard/employer/applicants', icon: Users },
    { label: 'Company Profile', href: '/dashboard/employer/company', icon: Building },
    { label: 'Settings', href: '/dashboard/employer/settings', icon: Settings },
  ];

  return (
    <div className={styles.layoutWrapper}>
      {/* Mobile Top Bar (< 1024px) */}
      <div className={styles.mobileTopBarWrapper}>
        <MobileTopBar
          title={getPageTitle()}
          onOpenAccount={() => setAccountSheetOpen(true)}
        />
      </div>

      {/* Left Sidebar (260px) - Desktop >= 1024px */}
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

        {/* Company Card Header */}
        <div className={styles.employerBrandCard}>
          <div className={styles.brandIconCircle}>
            {company?.logo ? (
              <Image
                src={company.logo}
                alt={company?.name || 'Company logo'}
                width={44}
                height={44}
                className={styles.brandLogoImg}
              />
            ) : (
              getInitials(company?.name || 'Company')
            )}
          </div>
          <div className={styles.brandMeta}>
            <span className={styles.brandName}>{company?.name || 'My Organization'}</span>
            <span className={styles.brandBadge}>Verified Employer</span>
          </div>
        </div>

        <nav className={styles.navMenu}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/dashboard/employer'
                ? pathname === '/dashboard/employer'
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

        <div className={styles.sidebarFooter}>
          <Link href="/dashboard/employer/post-job" className={styles.postJobCta}>
            <PlusCircle size={16} />
            <span>Post New Role</span>
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

      {/* Main Workspace */}
      <div className={styles.mainContent}>
        {/* Desktop Top Bar (>= 1024px) */}
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
            <Link href="/jobs" className={styles.browseJobsLink}>
              View Platform
              <ExternalLink size={13} />
            </Link>

            <Link href="/dashboard/employer/post-job" className={styles.topPostBtn}>
              + Post a Job
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className={styles.pageBody}>{children}</main>

        {/* Floating Mobile Tab Bar (< 1024px) */}
        <MobileTabBar role="employer" />

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
