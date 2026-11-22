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
  MapPin,
  Clock,
} from 'lucide-react';
import { timeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './users.module.css';

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
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>User Management</h1>
          <p className={styles.subtitle}>
            Inspect all registered job seekers, employers, and administrator accounts.
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Filter Card */}
      <Card padding="normal">
        <form onSubmit={handleSearchSubmit} className={styles.filterForm}>
          <div className={styles.searchWrapper}>
            <Input
              placeholder="Search by candidate or employer name, email..."
              icon={Search}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.roleSelectWrapper}>
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

      {/* =========================================================================
          DESKTOP TABLE (>= 1024px) - 100% UNTOUCHED ORIGINAL
         ========================================================================= */}
      <div className={styles.desktopTableCard}>
        <table className={styles.desktopTable}>
          <thead>
            <tr>
              <th className={styles.desktopTh}>User</th>
              <th className={styles.desktopTh}>Role</th>
              <th className={styles.desktopTh}>Location</th>
              <th className={styles.desktopTh}>Status</th>
              <th className={styles.desktopTh}>Joined</th>
              <th className={styles.desktopThRight}>Actions</th>
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
                <tr key={u._id} className={styles.desktopTr}>
                  <td className={styles.desktopTd}>
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
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                        title={u.isBlocked ? 'Unblock user' : 'Block user'}
                      >
                        {u.isBlocked ? <CheckCircle size={15} /> : <Ban size={15} />}
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
                        onClick={() => handleDelete(u._id)}
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          MOBILE USER CARDS (< 1024px) - NO HORIZONTAL SCROLLING
         ========================================================================= */}
      <div className={styles.mobileCardsStack}>
        {loading ? (
          <div className={styles.mobileEmptyState}>Loading users...</div>
        ) : users.length === 0 ? (
          <div className={styles.mobileEmptyState}>No users found matching query.</div>
        ) : (
          users.map((u) => (
            <div key={u._id} className={styles.mobileUserCard}>
              {/* Card Header: Avatar + Name + Email + Status */}
              <div className={styles.mobileCardHeader}>
                <div className={styles.mobileUserInfo}>
                  <div className={styles.mobileAvatar}>
                    {getInitials(u.name)}
                  </div>
                  <div className={styles.mobileNameGroup}>
                    <span className={styles.mobileUserName}>{u.name}</span>
                    <span className={styles.mobileUserEmail}>{u.email}</span>
                  </div>
                </div>
                <Badge variant={u.isBlocked ? 'rejected' : 'active'}>
                  {u.isBlocked ? 'Blocked' : 'Active'}
                </Badge>
              </div>

              {/* Meta Row: Role + Location + Joined */}
              <div className={styles.mobileMetaRow}>
                <span className={styles.mobileRoleChip}>{u.role}</span>
                <span className={styles.mobileMetaItem}>
                  <MapPin size={12} />
                  <span>{u.location || 'India'}</span>
                </span>
                <span className={styles.mobileMetaItem}>
                  <Clock size={12} />
                  <span>{timeAgo(u.createdAt)}</span>
                </span>
              </div>

              {/* Actions Row */}
              <div className={styles.mobileActionsRow}>
                <button
                  type="button"
                  className={`${styles.mobileBlockBtn} ${
                    u.isBlocked ? styles.mobileBlockBtnSuccess : styles.mobileBlockBtnDanger
                  }`}
                  onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                >
                  {u.isBlocked ? (
                    <>
                      <CheckCircle size={15} />
                      <span>Unblock</span>
                    </>
                  ) : (
                    <>
                      <Ban size={15} />
                      <span>Block</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className={styles.mobileDeleteBtn}
                  onClick={() => handleDelete(u._id)}
                  title="Delete user"
                  aria-label="Delete user"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
