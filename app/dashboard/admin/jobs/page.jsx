'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import {
  Briefcase,
  CheckCircle,
  XCircle,
  Star,
  Trash2,
  ExternalLink,
  Download,
  Clock,
  MapPin,
} from 'lucide-react';
import { timeAgo, formatSalary } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './jobs.module.css';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?limit=50');
      const data = await res.json();
      if (data?.jobs) setJobs(data.jobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
      );
      toast.success(`Job marked as ${newStatus} 🌱`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleToggleFeatured = async (jobId, currentFeatured) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured: !currentFeatured }),
      });
      if (!res.ok) throw new Error('Failed to update featured flag');
      setJobs((prev) =>
        prev.map((j) => (j._id === jobId ? { ...j, isFeatured: !currentFeatured } : j))
      );
      toast.success(!currentFeatured ? 'Job Featured! ⭐️' : 'Job unfeatured');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to permanently remove this listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Listing removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const exportCSV = () => {
    const headers = 'ID,Title,Company,Category,Type,WorkMode,SalaryMin,SalaryMax,Status,CreatedAt\n';
    const rows = jobs
      .map(
        (j) =>
          `"${j._id}","${j.title}","${j.company?.name || ''}","${j.category}","${j.jobType}","${j.workMode}",${j.salaryMin},${j.salaryMax},"${j.status}","${j.createdAt}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `verdant_jobs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Jobs exported to CSV! 📥');
  };

  const filteredJobs =
    statusFilter === 'all' ? jobs : jobs.filter((j) => j.status === statusFilter);

  return (
    <div className={styles.container}>
      {/* Header Row */}
      <div className={styles.headerRow}>
        <div>
          <h1 className={styles.title}>Job Postings Moderation</h1>
          <p className={styles.subtitle}>
            Approve pending employer listings, feature standout roles, or remove expired posts.
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      {/* Filter Row */}
      <div className={styles.filterCard}>
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Closed', label: 'Closed' },
            { value: 'Draft', label: 'Draft' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* =========================================================================
          DESKTOP TABLE (>= 1024px) - 100% UNTOUCHED ORIGINAL
         ========================================================================= */}
      <div className={styles.desktopTableCard}>
        <table className={styles.desktopTable}>
          <thead>
            <tr>
              <th className={styles.desktopTh}>Job & Company</th>
              <th className={styles.desktopTh}>Discipline</th>
              <th className={styles.desktopTh}>Status</th>
              <th className={styles.desktopTh}>Featured</th>
              <th className={styles.desktopTh}>Posted</th>
              <th className={styles.desktopThRight}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading job records...
                </td>
              </tr>
            ) : filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No jobs found in this category.
                </td>
              </tr>
            ) : (
              filteredJobs.map((j) => (
                <tr key={j._id} className={styles.desktopTr}>
                  <td className={styles.desktopTd}>
                    <Link
                      href={`/jobs/${j._id}`}
                      style={{ fontWeight: 700, color: 'var(--green-900)', textDecoration: 'none' }}
                    >
                      {j.title}
                    </Link>
                    <span style={{ display: 'block', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {j.company?.name || 'Company'} • {j.location}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-main)' }}>
                    {j.category}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <Badge variant={j.status}>{j.status}</Badge>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <button
                      type="button"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: j.isFeatured ? '#B57F0E' : 'var(--border)',
                      }}
                      onClick={() => handleToggleFeatured(j._id, j.isFeatured)}
                      title="Toggle Featured"
                    >
                      <Star size={18} fill={j.isFeatured ? '#F2B84B' : 'none'} />
                    </button>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {timeAgo(j.createdAt)}
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                      <select
                        value={j.status}
                        onChange={(e) => handleStatusChange(j._id, e.target.value)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          fontSize: '12px',
                          color: 'var(--text-main)',
                          outline: 'none',
                          backgroundColor: 'var(--white)',
                        }}
                      >
                        <option value="Active">Active</option>
                        <option value="Closed">Closed</option>
                        <option value="Draft">Draft</option>
                      </select>
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
                        onClick={() => handleDelete(j._id)}
                        title="Delete listing"
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
          MOBILE JOB CARDS (< 1024px) - NO HORIZONTAL SCROLLING
         ========================================================================= */}
      <div className={styles.mobileCardsStack}>
        {loading ? (
          <div className={styles.mobileEmptyState}>Loading job records...</div>
        ) : filteredJobs.length === 0 ? (
          <div className={styles.mobileEmptyState}>No jobs found in this category.</div>
        ) : (
          filteredJobs.map((j) => (
            <div key={j._id} className={styles.mobileJobCard}>
              {/* Card Header: Title + Status */}
              <div className={styles.mobileCardHeader}>
                <div className={styles.mobileTitleGroup}>
                  <Link href={`/jobs/${j._id}`} className={styles.mobileJobTitle}>
                    {j.title}
                  </Link>
                  <span className={styles.mobileCompanyLine}>
                    {j.company?.name || 'Company'} • {j.location}
                  </span>
                </div>
                <Badge variant={j.status}>{j.status}</Badge>
              </div>

              {/* Meta Row: Discipline + Time + Featured */}
              <div className={styles.mobileMetaRow}>
                <span className={styles.mobileDisciplineChip}>{j.category}</span>
                <span className={styles.mobileMetaItem}>
                  <Clock size={12} />
                  <span>{timeAgo(j.createdAt)}</span>
                </span>
                <button
                  type="button"
                  className={`${styles.mobileFeaturedBtn} ${
                    j.isFeatured ? styles.mobileFeaturedBtnActive : ''
                  }`}
                  onClick={() => handleToggleFeatured(j._id, j.isFeatured)}
                >
                  <Star size={13} fill={j.isFeatured ? '#F2B84B' : 'none'} />
                  <span>{j.isFeatured ? 'Featured' : 'Feature'}</span>
                </button>
              </div>

              {/* Actions Row */}
              <div className={styles.mobileActionsRow}>
                <select
                  value={j.status}
                  onChange={(e) => handleStatusChange(j._id, e.target.value)}
                  className={styles.mobileStatusSelect}
                  aria-label="Change job status"
                >
                  <option value="Active">Status: Active</option>
                  <option value="Closed">Status: Closed</option>
                  <option value="Draft">Status: Draft</option>
                </select>
                <button
                  type="button"
                  className={styles.mobileDeleteBtn}
                  onClick={() => handleDelete(j._id)}
                  title="Delete listing"
                  aria-label="Delete listing"
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
