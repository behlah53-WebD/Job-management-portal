'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  Users,
  Search,
  Download,
  Ban,
  CheckCircle,
  Trash2,
  Mail,
  Shield,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/users?role=${roleFilter}&q=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleBlock = async (userId, currentBlocked) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBlocked: !currentBlocked }),
      });
      if (!res.ok) throw new Error('Failed to update user');
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, isBlocked: !currentBlocked } : u))
      );
      toast.success(!currentBlocked ? 'User blocked' : 'User unblocked');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportCSV = () => {
    const headers = 'ID,Name,Email,Role,Location,IsBlocked,CreatedAt\n';
    const rows = users
      .map(
        (u) =>
          `"${u._id}","${u.name}","${u.email}","${u.role}","${u.location || ''}",${u.isBlocked},"${u.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdant_users_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('User list exported to CSV! 📥');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
            User Management
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Inspect all registered job seekers, employers, and administrator accounts.
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      <Card padding="normal">
        <form
          onSubmit={handleSearchSubmit}
          style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: '240px' }}>
            <Input
              placeholder="Search by candidate or employer name, email..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div style={{ width: '180px' }}>
            <Select
              options={[
                { value: 'all', label: 'All Roles' },
                { value: 'jobseeker', label: 'Job Seekers' },
                { value: 'employer', label: 'Employers' },
                { value: 'admin', label: 'Admins' },
              ]}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            Filter
          </Button>
        </form>
      </Card>

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
                User
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Role
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Location
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Status
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Joined
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)', textAlign: 'right' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading users...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No users found matching query.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--mint-100)',
                          color: 'var(--green-700)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '13px',
                        }}
                      >
                        {getInitials(u.name)}
                      </div>
                      <div>
                        <span style={{ fontWeight: 600, color: 'var(--text-main)', display: 'block' }}>
                          {u.name}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', textTransform: 'capitalize', fontSize: '13px', fontWeight: 600 }}>
                    {u.role}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {u.location || 'India'}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge variant={u.isBlocked ? 'rejected' : 'active'}>
                      {u.isBlocked ? 'Blocked' : 'Active'}
                    </Badge>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {timeAgo(u.createdAt)}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: u.isBlocked ? 'var(--green-600)' : 'var(--danger)',
                        }}
                        title={u.isBlocked ? 'Unblock user' : 'Block user'}
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                      >
                        {u.isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                      </button>
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: '1px solid var(--border)',
                          padding: '6px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          color: 'var(--danger)',
                        }}
                        title="Delete user"
                        onClick={() => handleDelete(u._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
