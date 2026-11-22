'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import styles from './settings.module.css';

export default function AdminSettingsPage() {
  const [requireApproval, setRequireApproval] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data?.requireJobApproval !== undefined) {
          setRequireApproval(data.requireJobApproval);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (val) => {
    setRequireApproval(val);
    setSaving(true);
    try {
      const res = await fetch('/api/admin/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'requireJobApproval', value: val }),
      });
      if (!res.ok) throw new Error('Failed to update setting');
      toast.success(
        val
          ? 'Strict Moderation Enabled: all new jobs require admin approval'
          : 'Instant Publishing Enabled: new employer jobs go live immediately.'
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div>
        <h1 className={styles.title}>
          Platform Settings & Security
        </h1>
        <p className={styles.subtitle}>
          Control platform-wide moderation rules, cron schedules, and currency defaults.
        </p>
      </div>

      <Card padding="large" className={styles.card}>
        <div className={styles.settingRow}>
          <div className={styles.textGroup}>
            <h4 className={styles.rowTitle}>
              Require Admin Approval for New Jobs
            </h4>
            <p className={styles.rowDesc}>
              When enabled, employer postings will be placed in 'Pending' status until approved in the moderation queue.
            </p>
          </div>
          <label className={styles.toggleLabel}>
            <span className={styles.toggleStatusText}>
              {requireApproval ? 'Enabled' : 'Disabled'}
            </span>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => handleToggle(e.target.checked)}
              className={styles.checkboxInput}
            />
          </label>
        </div>

        <div className={styles.settingRowLast}>
          <div className={styles.textGroup}>
            <h4 className={styles.rowTitle}>
              Scheduled Job Expiry Cron
            </h4>
            <p className={styles.rowDesc}>
              Endpoint: <code>/api/cron/expire-jobs</code> (Protected by CRON_SECRET).
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className={styles.actionBtn}
            onClick={async () => {
              try {
                const res = await fetch('/api/cron/expire-jobs');
                const data = await res.json();
                toast.success(data.message || 'Cron triggered');
              } catch {
                toast.error('Cron failed');
              }
            }}
          >
            Trigger Test Run
          </Button>
        </div>
      </Card>
    </div>
  );
}
