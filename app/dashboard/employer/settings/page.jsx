'use client';

import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function EmployerSettingsPage() {
  const [notifyOnApply, setNotifyOnApply] = useState(true);

  return (
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
  );
}
