'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  PlusCircle,
  Eye,
  Users,
  Clock,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './myJobs.module.css';

export default function EmployerMyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?mine=true&limit=50');
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

  const handleDuplicate = async (job) => {
    try {
      const { _id, createdAt, views, ...rest } = job;
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...rest,
          title: `${job.title} (Copy)`,
          status: 'Draft',
        }),
      });
      if (!res.ok) throw new Error('Failed to duplicate job');
      toast.success('Job duplicated as Draft 📋');
      fetchJobs();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (jobId) => {
    if (!confirm('Are you sure you want to remove this job listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      setJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Job Postings</h1>
          <p className={styles.subtitle}>
            Manage, duplicate, edit, or close your published career listings.
          </p>
        </div>
        <Link href="/dashboard/employer/post-job">
          <Button variant="primary" icon={PlusCircle}>
            Post a Job
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className={styles.loadingBox}>Loading listings...</div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs published yet 🌱"
          description="Create your first job listing to start receiving thoughtful applications."
          actionLabel="Post a Job"
          onAction={() => (window.location.href = '/dashboard/employer/post-job')}
        />
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Job Title</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Views</th>
                <th className={styles.th}>Posted</th>
                <th className={styles.th}>Deadline</th>
                <th className={styles.th} style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody className={styles.tbody}>
              {jobs.map((job) => (
                <tr key={job._id} className={styles.tr}>
                  <td className={styles.tdTitle}>
                    <Link href={`/jobs/${job._id}`} className={styles.titleLink}>
                      <span className={styles.jobTitleText}>{job.title}</span>
                    </Link>
                    <span className={styles.jobTypeSub}>
                      {job.category} • {job.jobType} • {job.workMode}
                    </span>
                  </td>

                  <td className={styles.td}>
                    <Badge variant={job.status}>{job.status}</Badge>
                  </td>

                  <td className={styles.td}>
                    <div className={styles.metaStat}>
                      <Eye size={14} />
                      <span>{job.views || 0}</span>
                    </div>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.dateText}>{timeAgo(job.createdAt)}</span>
                  </td>

                  <td className={styles.td}>
                    <span className={styles.dateText}>
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                    </span>
                  </td>

                  <td className={styles.tdActions}>
                    <div className={styles.actionButtons}>
                      {job.status === 'Active' ? (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          title="Close Job"
                          onClick={() => handleStatusChange(job._id, 'Closed')}
                        >
                          <XCircle size={17} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          className={styles.actionBtn}
                          title="Activate Job"
                          onClick={() => handleStatusChange(job._id, 'Active')}
                        >
                          <CheckCircle size={17} />
                        </button>
                      )}

                      <button
                        type="button"
                        className={styles.actionBtn}
                        title="Duplicate Job"
                        onClick={() => handleDuplicate(job)}
                      >
                        <Copy size={17} />
                      </button>

                      <Link href={`/jobs/${job._id}`} className={styles.actionBtn} title="View Live">
                        <ExternalLink size={17} />
                      </Link>

                      <button
                        type="button"
                        className={`${styles.actionBtn} ${styles.deleteAction}`}
                        title="Delete Listing"
                        onClick={() => handleDelete(job._id)}
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
