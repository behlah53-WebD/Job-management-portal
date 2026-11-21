'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Briefcase,
  Bookmark,
  Sparkles,
  User,
  PlusCircle,
  Users,
  Building,
  Shield,
  FolderTree,
} from 'lucide-react';
import styles from './MobileTabBar.module.css';

/**
 * Signature element 3: Bottom Navigation with sliding "petal" indicator
 * Framer Motion layoutId="petal" spring gliding behind active icon.
 * Floating rounded bar: inset 12px, 8px above safe area, 64px height, 24px radius.
 */
export default function MobileTabBar({
  role = 'seeker',
  applicationsBadge = 0,
  isSheetOpen = false,
}) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Define tabs per role
  const getTabs = () => {
    if (role === 'employer') {
      return [
        { label: 'Home', href: '/dashboard/employer', icon: LayoutDashboard },
        { label: 'My Jobs', href: '/dashboard/employer/my-jobs', icon: Briefcase },
        { label: 'Post', href: '/dashboard/employer/post-job', icon: PlusCircle, isCta: true },
        { label: 'Applicants', href: '/dashboard/employer/applicants', icon: Users },
        { label: 'Company', href: '/dashboard/employer/company', icon: Building },
      ];
    }
    if (role === 'admin') {
      return [
        { label: 'Home', href: '/dashboard/admin', icon: LayoutDashboard },
        { label: 'Users', href: '/dashboard/admin/users', icon: Users },
        { label: 'Jobs', href: '/dashboard/admin/jobs', icon: Briefcase },
        { label: 'Reports', href: '/dashboard/admin/reports', icon: Shield },
        { label: 'Categories', href: '/dashboard/admin/categories', icon: FolderTree },
      ];
    }
    // Default Seeker tabs
    return [
      { label: 'Home', href: '/dashboard/seeker', icon: LayoutDashboard },
      { label: 'Applications', href: '/dashboard/seeker/applications', icon: Briefcase, badge: applicationsBadge },
      { label: 'Saved', href: '/dashboard/seeker/saved', icon: Bookmark },
      { label: 'For You', href: '/dashboard/seeker/recommended', icon: Sparkles },
      { label: 'Profile', href: '/dashboard/seeker/profile', icon: User },
    ];
  };

  const tabs = getTabs();

  // Scroll direction detection: hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY.current;

      // Always show near top or on short pages
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else if (scrollDiff > 8 && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else if (scrollDiff < -8) {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard open detection (using visualViewport height change)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;

    const initialHeight = window.visualViewport.height;
    const handleResize = () => {
      if (!window.visualViewport) return;
      const currentHeight = window.visualViewport.height;
      // If viewport shrinks by more than 150px, keyboard is almost certainly open
      setIsKeyboardOpen(initialHeight - currentHeight > 150);
    };

    window.visualViewport.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, []);

  // Hide if sheet open or keyboard open
  const shouldHide = !isVisible || isKeyboardOpen || isSheetOpen;

  return (
    <nav
      className={`${styles.barWrapper} ${shouldHide ? styles.barHidden : ''}`}
      aria-label="Mobile Bottom Navigation"
    >
      <div className={styles.barPill}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            tab.href === '/dashboard/seeker' ||
            tab.href === '/dashboard/employer' ||
            tab.href === '/dashboard/admin'
              ? pathname === tab.href
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`${styles.tabItem} ${isActive ? styles.tabActive : ''} ${
                tab.isCta ? styles.tabCta : ''
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className={styles.iconContainer}>
                {/* Sliding Petal Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="mobileNavPetal"
                    className={styles.petalIndicator}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}

                <Icon size={tab.isCta ? 22 : 20} className={styles.tabIcon} />

                {/* Badge if any */}
                {tab.badge > 0 && (
                  <span className={styles.badge}>{tab.badge}</span>
                )}
              </div>

              <span className={styles.tabLabel}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
