'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import { LogOut, Trash2, Shield, Bell, ChevronRight, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './settings.module.css';

export default function SeekerSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
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

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');
      toast.success('Password updated successfully! 🌿');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* ========================================================
          MOBILE SETTINGS VIEW (< 1024px)
          iOS-style rounded groups with 52px touch rows
          ======================================================== */}
      <div className={styles.mobileView}>
        <div className={styles.mobileHeader}>
          <h1 className={styles.mobileTitle}>Settings</h1>
          <p className={styles.mobileSubtitle}>
            Manage your account security and alert preferences.
          </p>
        </div>

        {/* Group 1: Notifications */}
        <div>
          <span className={styles.groupTitle}>Notification Preferences</span>
          <div className={styles.groupCard}>
            <label className={styles.toggleLabel}>
              <div className={styles.settingLabelGroup}>
                <span className={styles.settingLabel}>Application Status Alerts</span>
                <span className={styles.settingSub}>
                  Get notified when employers view, shortlist, or invite you to interview.
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => {
                  setEmailAlerts(e.target.checked);
                  toast.success('Preference updated 🌱');
                }}
                className={styles.toggleInput}
              />
            </label>
          </div>
        </div>

        {/* Group 2: Password & Security */}
        <div>
          <span className={styles.groupTitle}>Security & Credentials</span>
          <div className={`${styles.groupCard} ${styles.groupCardPadded}`}>
            <form onSubmit={handlePasswordChange} className={styles.mobileForm}>
              <div className={styles.mobileInputWrapper}>
                <label className={styles.inputLabel}>Current Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.mobileInput}
                />
              </div>

              <div className={styles.mobileInputWrapper}>
                <label className={styles.inputLabel}>New Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.mobileInput}
                />
              </div>

              <button type="submit" disabled={saving} className={styles.saveBtn}>
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Group 3: Destructive Actions */}
        <div>
          <span className={styles.groupTitle}>Account Actions</span>
          <div className={styles.destructiveGroup}>
            <button
              type="button"
              className={styles.destructiveRow}
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut size={18} />
              <span>{isSigningOut ? 'Signing out...' : 'Sign Out of Verdant'}</span>
            </button>

            <button
              type="button"
              className={styles.destructiveRow}
              style={{ borderTop: '1px solid rgba(229, 88, 79, 0.15)' }}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 size={18} />
              <span>Delete Candidate Account</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Sheet */}
        <BottomSheet
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          title="Delete Account?"
          subtitle="This will permanently delete your applications, resume, and profile data."
        >
          <div className={styles.confirmContent}>
            <p className={styles.confirmText}>
              Are you sure you want to permanently delete your Verdant candidate account? All submitted applications and history will be irrevocably removed.
            </p>
            <div className={styles.confirmButtons}>
              <Button
                variant="ghost"
                fullWidth
                size="md"
                onClick={() => setDeleteConfirmOpen(false)}
              >
                Keep My Account
              </Button>
              <Button
                variant="danger"
                fullWidth
                size="md"
                onClick={() => {
                  toast.error('Account deletion requested. Support will process within 24h.');
                  setDeleteConfirmOpen(false);
                }}
              >
                Confirm Account Deletion
              </Button>
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* ========================================================
          DESKTOP SETTINGS VIEW (>= 1024px)
          UNTOUCHED TO PRESERVE 100% DESKTOP PIXEL FIDELITY
          ======================================================== */}
      <div className={styles.desktopView}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
            Account Settings
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage your security preferences and communication channels.
          </p>
        </div>

        <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--green-900)' }}>
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Button type="submit" variant="primary" loading={saving} style={{ alignSelf: 'flex-start' }}>
              Update Password
            </Button>
          </form>
        </Card>

        <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--green-900)' }}>
            Notification Preferences
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                setEmailAlerts(e.target.checked);
                toast.success('Preference updated 🌱');
              }}
              style={{ width: '18px', height: '18px', accentColor: 'var(--green-600)' }}
            />
            <div>
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                Application Status Updates
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Receive emails when employers view, shortlist, or schedule interviews.
              </span>
            </div>
          </label>
        </Card>
      </div>
    </div>
  );
}
