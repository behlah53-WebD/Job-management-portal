'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import {
  Bell,
  Mail,
  Users,
  UserPlus,
  AlertTriangle,
  ShieldAlert,
  Check,
  Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './settings.module.css';

export default function EmployerSettingsPage() {
  // Notification states
  const [notifyOnApply, setNotifyOnApply] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(true);
  const [interviewAlerts, setInterviewAlerts] = useState(true);

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    {
      id: '1',
      name: 'Aarav Patel',
      email: 'aarav@floralabs.io',
      role: 'Owner & Admin',
      initials: 'AP',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      email: 'priya@floralabs.io',
      role: 'Hiring Lead',
      initials: 'PS',
    },
  ]);

  // Sheets
  const [inviteSheetOpen, setInviteSheetOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Recruiter');
  const [dangerSheetOpen, setDangerSheetOpen] = useState(false);

  const handleToggle = (key, currentVal, setter, label) => {
    setter(!currentVal);
    toast.success(`${label} updated 🌱`);
  };

  const handleInviteSubmit = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      initials: inviteEmail.slice(0, 2).toUpperCase(),
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setInviteEmail('');
    setInviteSheetOpen(false);
    toast.success(`Invitation sent to ${newMember.email} 🌿`);
  };

  return (
    <>
      {/* =========================================================================
          1. DESKTOP VIEW (>= 1024px)
          100% pixel-identical to original desktop layout.
         ========================================================================= */}
      <div className={styles.desktopView}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
              Hiring Preferences & Team
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Configure notification alerts and candidate pipeline defaults.
            </p>
          </div>

          <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--green-900)' }}>
              Email Alerts
            </h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={notifyOnApply}
                onChange={(e) => {
                  setNotifyOnApply(e.target.checked);
                  toast.success('Settings saved 🌱');
                }}
                style={{ width: '18px', height: '18px', accentColor: 'var(--green-600)' }}
              />
              <div>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                  Instant Candidate Notifications
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Get an instant digest when a candidate applies to any of your active roles.
                </span>
              </div>
            </label>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          2. MOBILE VIEW (< 1024px)
          iOS-style grouped cards with 48px hit switches, team roster, and danger sheet.
         ========================================================================= */}
      <div className={styles.mobileView}>
        {/* Title Block */}
        <div className={styles.mobileHeader}>
          <h1 className={styles.mobileTitle}>Hiring Preferences</h1>
          <p className={styles.mobileSubtitle}>
            Configure notification digests and team hiring access.
          </p>
        </div>

        {/* Group 1: Email Alerts */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeaderRow}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.cardIconCircle}>
                <Mail size={16} />
              </div>
              <h2 className={styles.cardTitle}>Email Alerts</h2>
            </div>
          </div>

          <div className={styles.rowsList}>
            {/* Row 1: Instant Candidate Alerts */}
            <div className={styles.settingRow}>
              <div className={styles.rowTextGroup}>
                <span className={styles.rowLabel}>Instant Candidate Notifications</span>
                <span className={styles.rowDesc}>
                  Receive an immediate email when a candidate applies to an open job.
                </span>
              </div>
              <button
                type="button"
                className={styles.switchHitArea}
                onClick={() =>
                  handleToggle('instant', notifyOnApply, setNotifyOnApply, 'Candidate alerts')
                }
                role="switch"
                aria-checked={notifyOnApply}
                aria-label="Toggle instant candidate notifications"
              >
                <div
                  className={`${styles.switchTrack} ${
                    notifyOnApply ? styles.switchTrackActive : ''
                  }`}
                >
                  <div
                    className={`${styles.switchThumb} ${
                      notifyOnApply ? styles.switchThumbActive : ''
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Row 2: Weekly Digest */}
            <div className={styles.settingRow}>
              <div className={styles.rowTextGroup}>
                <span className={styles.rowLabel}>Weekly Pipeline Digest</span>
                <span className={styles.rowDesc}>
                  Monday morning summary of total views, applicants, and stages.
                </span>
              </div>
              <button
                type="button"
                className={styles.switchHitArea}
                onClick={() =>
                  handleToggle('weekly', weeklyDigest, setWeeklyDigest, 'Weekly digest')
                }
                role="switch"
                aria-checked={weeklyDigest}
                aria-label="Toggle weekly pipeline digest"
              >
                <div
                  className={`${styles.switchTrack} ${
                    weeklyDigest ? styles.switchTrackActive : ''
                  }`}
                >
                  <div
                    className={`${styles.switchThumb} ${
                      weeklyDigest ? styles.switchThumbActive : ''
                    }`}
                  />
                </div>
              </button>
            </div>

            {/* Row 3: Interview Reminders */}
            <div className={styles.settingRow}>
              <div className={styles.rowTextGroup}>
                <span className={styles.rowLabel}>Interview Reminders</span>
                <span className={styles.rowDesc}>
                  Reminder email 1 hour before scheduled candidate conversations.
                </span>
              </div>
              <button
                type="button"
                className={styles.switchHitArea}
                onClick={() =>
                  handleToggle(
                    'interview',
                    interviewAlerts,
                    setInterviewAlerts,
                    'Interview reminders'
                  )
                }
                role="switch"
                aria-checked={interviewAlerts}
                aria-label="Toggle interview reminders"
              >
                <div
                  className={`${styles.switchTrack} ${
                    interviewAlerts ? styles.switchTrackActive : ''
                  }`}
                >
                  <div
                    className={`${styles.switchThumb} ${
                      interviewAlerts ? styles.switchThumbActive : ''
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Group 2: Hiring Team */}
        <div className={styles.settingsCard}>
          <div className={styles.cardHeaderRow}>
            <div className={styles.cardTitleGroup}>
              <div className={styles.cardIconCircle}>
                <Users size={16} />
              </div>
              <h2 className={styles.cardTitle}>Hiring Team</h2>
            </div>
            <button
              type="button"
              className={styles.cardActionBtn}
              onClick={() => setInviteSheetOpen(true)}
            >
              <UserPlus size={14} />
              <span>Invite</span>
            </button>
          </div>

          <div className={styles.rowsList}>
            {teamMembers.map((member) => (
              <div key={member.id} className={styles.teammateRow}>
                <div className={styles.teammateLeft}>
                  <div className={styles.teammateAvatar}>{member.initials}</div>
                  <div className={styles.teammateInfo}>
                    <div className={styles.teammateNameRow}>
                      <span className={styles.teammateName}>{member.name}</span>
                      <span
                        className={`${styles.teammateRoleBadge} ${
                          member.role.includes('Admin') ? styles.teammateRoleBadgeAdmin : ''
                        }`}
                      >
                        {member.role}
                      </span>
                    </div>
                    <span className={styles.teammateEmail}>{member.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group 3: Danger Zone */}
        <div className={styles.dangerCard}>
          <div className={styles.dangerRow}>
            <div className={styles.dangerTitleGroup}>
              <span className={styles.dangerTitle}>Deactivate Organization</span>
              <span className={styles.dangerDesc}>
                Temporarily pause all active jobs and candidate pipelines.
              </span>
            </div>
            <button
              type="button"
              className={styles.dangerBtn}
              onClick={() => setDangerSheetOpen(true)}
            >
              Deactivate
            </button>
          </div>
        </div>

        {/* Invite Teammate BottomSheet */}
        <BottomSheet
          isOpen={inviteSheetOpen}
          onClose={() => setInviteSheetOpen(false)}
          title="Invite Teammate"
          subtitle="Collaborate on candidate pipelines and reviews"
        >
          <form onSubmit={handleInviteSubmit} className={styles.sheetForm}>
            <div className={styles.sheetFieldGroup}>
              <label className={styles.sheetFieldLabel}>Work Email Address</label>
              <input
                type="email"
                required
                placeholder="colleague@floralabs.io"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={styles.sheetInput}
              />
            </div>

            <div className={styles.sheetFieldGroup}>
              <label className={styles.sheetFieldLabel}>Role & Permissions</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className={styles.sheetSelect}
              >
                <option value="Recruiter">Recruiter (Can review & advance applicants)</option>
                <option value="Hiring Manager">Hiring Manager (Can post jobs & review)</option>
                <option value="Admin">Admin (Full company access)</option>
              </select>
            </div>

            <Button type="submit" variant="primary" fullWidth size="lg">
              Send Invitation 🌿
            </Button>
          </form>
        </BottomSheet>

        {/* Danger Confirmation BottomSheet */}
        <BottomSheet
          isOpen={dangerSheetOpen}
          onClose={() => setDangerSheetOpen(false)}
          title="Deactivate Organization"
        >
          <div className={styles.confirmSheetContent}>
            <div className={styles.confirmWarningBox}>
              <AlertTriangle size={22} color="#DC2626" style={{ flexShrink: 0 }} />
              <div className={styles.confirmWarningText}>
                Deactivating your organization will pause all live job postings and hide them from
                public discovery. Applicants currently in review will remain saved.
              </div>
            </div>

            <div className={styles.confirmActionsRow}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDangerSheetOpen(false)}
                className={styles.confirmCancelBtn}
              >
                Keep Active
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  setDangerSheetOpen(false);
                  toast.success('Organization deactivated');
                }}
                className={styles.confirmDeleteBtn}
              >
                Confirm Deactivate
              </Button>
            </div>
          </div>
        </BottomSheet>
      </div>
    </>
  );
}
