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
} from 'lucide-react';
import { timeAgo, formatSalary } from '@/lib/utils';
import toast from 'react-hot-toast';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
            Job Postings Moderation
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Approve pending employer listings, feature standout roles, or remove expired posts.
          </p>
        </div>
        <Button variant="secondary" icon={Download} onClick={exportCSV}>
          Export CSV
        </Button>
      </div>

      <div style={{ width: '220px' }}>
        <Select
          options={[
            { value: 'all', label: 'All Statuses' },
            { value: 'Active', label: 'Active' },
            { value: 'Pending', label: 'Pending Approval' },
            { value: 'Closed', label: 'Closed' },
            { value: 'Draft', label: 'Draft' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
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
                Job & Company
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Discipline
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Status
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Featured
              </th>
              <th style={{ padding: '16px 20px', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--green-900)' }}>
                Posted
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
                <tr key={j._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px 20px' }}>
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
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {j.status === 'Pending' && (
                        <button
                          type="button"
                          style={{
                            background: 'var(--mint-100)',
                            color: 'var(--green-700)',
                            border: 'none',
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 600,
                          }}
                          onClick={() => handleStatusChange(j._id, 'Active')}
                        >
                          Approve
                        </button>
                      )}
                      {j.status === 'Active' ? (
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                          }}
                          title="Close Listing"
                          onClick={() => handleStatusChange(j._id, 'Closed')}
                        >
                          <XCircle size={16} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          style={{
                            background: 'none',
                            border: '1px solid var(--border)',
                            padding: '6px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            color: 'var(--green-600)',
                          }}
                          title="Activate Listing"
                          onClick={() => handleStatusChange(j._id, 'Active')}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
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
                        title="Delete Listing"
                        onClick={() => handleDelete(j._id)}
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
