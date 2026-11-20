'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Building, CheckCircle2, ShieldCheck, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/companies')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setCompanies(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleVerify = async (companyId, currentVerified) => {
    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, isVerified: !currentVerified }),
      });
      if (!res.ok) throw new Error('Failed to update');

      setCompanies((prev) =>
        prev.map((c) =>
          c._id === companyId ? { ...c, isVerified: !currentVerified } : c
        )
      );
      toast.success(!currentVerified ? 'Company verified! 🌿' : 'Verification removed');
    } catch (err) {
      toast.error('Failed to update verification');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
          Company Verification
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Grant or revoke the green 'Verified Company' trust tick on employer profiles.
        </p>
      </div>

      <div
        style={{
          backgroundColor: 'var(--white)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-card)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}>
            <tr>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Company Name
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Industry
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Size
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Status
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading companies...
                </td>
              </tr>
            ) : (
              companies.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--green-900)' }}>{c.name}</span>
                      {c.isVerified && (
                        <CheckCircle2 size={16} color="var(--green-600)" />
                      )}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.location}</span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px' }}>{c.industry}</td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {c.size} employees
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge variant={c.isVerified ? 'verified' : 'closed'}>
                      {c.isVerified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <Button
                      variant={c.isVerified ? 'ghost' : 'secondary'}
                      size="sm"
                      onClick={() => handleToggleVerify(c._id, c.isVerified)}
                    >
                      {c.isVerified ? 'Revoke Trust Tick' : 'Verify Company'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
