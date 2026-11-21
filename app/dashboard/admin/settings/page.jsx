'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Sliders, Shield, Bell, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
          Platform Settings & Security
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Control platform-wide moderation rules, cron schedules, and currency defaults.
        </p>
      </div>

      <Card padding="large" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--green-900)' }}>
              Require Admin Approval for New Jobs
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '520px', marginTop: '4px' }}>
              When enabled, employer postings will be placed in 'Pending' status until approved in the moderation queue.
            </p>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
            <input
              type="checkbox"
              checked={requireApproval}
              onChange={(e) => handleToggle(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--green-600)', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
              {requireApproval ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '18px', color: 'var(--green-900)' }}>
              Scheduled Job Expiry Cron
            </h4>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Endpoint: <code>/api/cron/expire-jobs</code> (Protected by CRON_SECRET).
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
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
