'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SeekerSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [saving, setSaving] = useState(false);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px' }}>
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
  );
}
