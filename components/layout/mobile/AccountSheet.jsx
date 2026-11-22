'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  User,
  Settings,
  Bookmark,
  HelpCircle,
  LogOut,
  ChevronRight,
  ExternalLink,
  Briefcase,
  Building,
} from 'lucide-react';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import ProgressRing from '@/components/ui/mobile/ProgressRing';
import { getInitials } from '@/lib/utils';
import styles from './AccountSheet.module.css';

export default function AccountSheet({
  isOpen = false,
  onClose,
  user,
  company,
  profile,
  strength = 75,
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const role = user?.role || (company ? 'employer' : 'jobseeker');

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      await signOut({ redirect: false });
      onClose?.();
      router.push('/');
      router.refresh();
    } catch {
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Account & Preferences">
      <div className={styles.container}>
        {/* User Profile Summary */}
        <div className={styles.userHeader}>
          <div className={styles.avatarCircle}>
            {getInitials(user?.name || 'User')}
          </div>
          <div className={styles.userMeta}>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.userEmail}>{user?.email}</span>
            <span className={styles.roleTag}>
              {role === 'employer' ? 'Employer Partner' : role === 'admin' ? 'Administrator' : 'Job Seeker'}
            </span>
          </div>
        </div>

        {/* Company Card (for Employers) */}
        {(role === 'employer' || company) && (
          <div className={styles.employerBrandCard}>
            <div className={styles.employerBrandLogo}>
              {company?.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={company.logo}
                  alt={company?.name || 'Company'}
                  className={styles.employerLogoImg}
                />
              ) : (
                <span>{getInitials(company?.name || 'Acme Flora Labs')}</span>
              )}
            </div>
            <div className={styles.employerBrandMeta}>
              <h3 className={styles.employerBrandName}>{company?.name || 'Acme Flora Labs'}</h3>
              <span className={styles.employerVerifiedChip}>Verified Employer</span>
            </div>
          </div>
        )}

        {/* Profile Strength Card (for Job Seekers) */}
        {role === 'jobseeker' && (
          <Link
            href="/dashboard/seeker/profile"
            className={styles.strengthCard}
            onClick={onClose}
          >
            <ProgressRing value={strength} size={54} strokeWidth={5} />
            <div className={styles.strengthMeta}>
              <span className={styles.strengthTitle}>Profile Strength: {strength}%</span>
              <span className={styles.strengthDesc}>
                {strength === 100
                  ? 'All details complete! Ready to shine 🌱'
                  : 'Add skills & experience to get 3x more views.'}
              </span>
            </div>
            <ChevronRight size={18} className={styles.chevron} />
          </Link>
        )}

        {/* Navigation Rows */}
        <div className={styles.menuGroup}>
          {role === 'jobseeker' && (
            <>
              <Link
                href="/dashboard/seeker/profile"
                className={styles.menuRow}
                onClick={onClose}
              >
                <div className={styles.menuIconBox}>
                  <User size={18} />
                </div>
                <span className={styles.menuLabel}>Edit Profile</span>
                <ChevronRight size={16} className={styles.menuChevron} />
              </Link>

              <Link
                href="/dashboard/seeker/saved"
                className={styles.menuRow}
                onClick={onClose}
              >
                <div className={styles.menuIconBox}>
                  <Bookmark size={18} />
                </div>
                <span className={styles.menuLabel}>Saved Jobs</span>
                <ChevronRight size={16} className={styles.menuChevron} />
              </Link>

              <Link
                href="/dashboard/seeker/settings"
                className={styles.menuRow}
                onClick={onClose}
              >
                <div className={styles.menuIconBox}>
                  <Settings size={18} />
                </div>
                <span className={styles.menuLabel}>Account Settings</span>
                <ChevronRight size={16} className={styles.menuChevron} />
              </Link>
            </>
          )}

          {role === 'employer' && (
            <>
              <Link
                href="/dashboard/employer/company"
                className={styles.menuRow}
                onClick={onClose}
              >
                <div className={styles.menuIconBox}>
                  <Building size={18} />
                </div>
                <span className={styles.menuLabel}>Company Profile</span>
                <ChevronRight size={16} className={styles.menuChevron} />
              </Link>

              <Link
                href="/dashboard/employer/settings"
                className={styles.menuRow}
                onClick={onClose}
              >
                <div className={styles.menuIconBox}>
                  <Settings size={18} />
                </div>
                <span className={styles.menuLabel}>Employer Settings</span>
                <ChevronRight size={16} className={styles.menuChevron} />
              </Link>
            </>
          )}

          {role === 'admin' && (
            <Link
              href="/dashboard/admin/settings"
              className={styles.menuRow}
              onClick={onClose}
            >
              <div className={styles.menuIconBox}>
                <Settings size={18} />
              </div>
              <span className={styles.menuLabel}>Console Settings</span>
              <ChevronRight size={16} className={styles.menuChevron} />
            </Link>
          )}

          <Link
            href="/jobs"
            className={styles.menuRow}
            onClick={onClose}
          >
            <div className={styles.menuIconBox}>
              <Briefcase size={18} />
            </div>
            <span className={styles.menuLabel}>View Platform</span>
            <ExternalLink size={15} className={styles.menuChevron} />
          </Link>

          <Link
            href="/about"
            className={styles.menuRow}
            onClick={onClose}
          >
            <div className={styles.menuIconBox}>
              <HelpCircle size={18} />
            </div>
            <span className={styles.menuLabel}>About Verdant & Help</span>
            <ChevronRight size={16} className={styles.menuChevron} />
          </Link>
        </div>

        {/* Sign Out Button Row */}
        <button
          type="button"
          className={styles.logoutBtn}
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut size={18} />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>
      </div>
    </BottomSheet>
  );
}
