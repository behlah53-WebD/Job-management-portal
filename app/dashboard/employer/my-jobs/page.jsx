'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import DataCard from '@/components/ui/mobile/DataCard';
import SegmentedTabs from '@/components/ui/mobile/SegmentedTabs';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import {
  PlusCircle,
  Eye,
  Users,
  Clock,
  Calendar,
  MoreVertical,
  Edit2,
  Copy,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  Sprout,
  AlertTriangle,
} from 'lucide-react';
import { formatSalary, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './myJobs.module.css';

export default function EmployerMyJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [deleteTargetJob, setDeleteTargetJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDelete = async () => {
    if (!deleteTargetJob) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${deleteTargetJob._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete job');
      setJobs((prev) => prev.filter((j) => j._id !== deleteTargetJob._id));
      toast.success('Job listing removed 🌱');
      setDeleteTargetJob(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Filtered jobs calculation
  const filteredJobs = useMemo(() => {
    return jobs.filter((j) => {
      // Tab filter
      if (activeTab !== 'All' && j.status !== activeTab) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = j.title?.toLowerCase().includes(q);
        const matchesCat = j.category?.toLowerCase().includes(q);
        const matchesLoc = j.location?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCat && !matchesLoc) return false;
      }
      return true;
    });
  }, [jobs, activeTab, searchQuery]);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      All: jobs.length,
      Active: jobs.filter((j) => j.status === 'Active').length,
      Closed: jobs.filter((j) => j.status === 'Closed').length,
      Draft: jobs.filter((j) => j.status === 'Draft').length,
    };
  }, [jobs]);

  const tabs = [
    { id: 'All', label: 'All', count: tabCounts.All },
    { id: 'Active', label: 'Active', count: tabCounts.Active },
    { id: 'Closed', label: 'Closed', count: tabCounts.Closed },
    { id: 'Draft', label: 'Draft', count: tabCounts.Draft },
  ];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Job Postings</h1>
          <p className={styles.subtitle}>
            Manage, duplicate, edit, or close your published career listings.
          </p>
        </div>
        <div className={styles.desktopPostBtn}>
          <Link href="/dashboard/employer/post-job">
            <Button variant="primary" icon={PlusCircle}>
              Post a Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Mobile-only "Post a Job" full-width button */}
      <div className={styles.mobilePostCtaWrapper}>
        <Link href="/dashboard/employer/post-job" className={styles.mobilePostCtaBtn}>
          <PlusCircle size={18} />
          <span>Post a Job</span>
        </Link>
      </div>

      {/* Mobile Search and Segmented Tabs */}
      <div className={styles.mobileFilterStrip}>
        <div className={styles.mobileSearchInputBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your listings..."
            className={styles.mobileSearchInput}
          />
        </div>

        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
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
        <>
          {/* =========================================================================
              DESKTOP 6-COLUMN TABLE (>= 1024px) - 100% UNTOUCHED
             ========================================================================= */}
          <div className={styles.desktopTableWrapper}>
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
                          onClick={() => setDeleteTargetJob(job)}
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

          {/* =========================================================================
              MOBILE DATACARD LIST (< 1024px)
             ========================================================================= */}
          <div className={styles.mobileCardsStack}>
            {filteredJobs.length === 0 ? (
              <div className={styles.emptyFilterBox}>
                <Sprout size={36} className={styles.emptySproutIcon} />
                <h4 className={styles.emptyFilterTitle}>No {activeTab.toLowerCase()} jobs found</h4>
                <p className={styles.emptyFilterSub}>
                  Try clearing your search keyword or switching tabs.
                </p>
                {searchQuery && (
                  <button
                    type="button"
                    className={styles.clearSearchBtn}
                    onClick={() => setSearchQuery('')}
                  >
                    Clear search
                  </button>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <DataCard key={job._id} className={styles.jobDataCard}>
                  {/* Row 1: Title + Status Chip */}
                  <div className={styles.cardHeaderRow}>
                    <Link href={`/jobs/${job._id}`} className={styles.cardTitleLink}>
                      <h3 className={styles.cardJobTitle}>{job.title}</h3>
                    </Link>
                    <Badge variant={job.status}>{job.status}</Badge>
                  </div>

                  {/* Row 2: Meta Chips (Category, Type, Mode) */}
                  <div className={styles.cardChipsRow}>
                    <span className={styles.metaChip}>{job.category}</span>
                    <span className={styles.metaChip}>{job.jobType}</span>
                    <span className={styles.metaChip}>{job.workMode}</span>
                  </div>

                  {/* Row 3: Stat blocks (Views, Posted, Deadline) */}
                  <div className={styles.cardStatsGrid}>
                    <div className={styles.statBlock}>
                      <Eye size={14} className={styles.statIcon} />
                      <div className={styles.statBlockMeta}>
                        <span className={styles.statBlockVal}>{job.views || 0}</span>
                        <span className={styles.statBlockLabel}>Views</span>
                      </div>
                    </div>

                    <div className={styles.statBlock}>
                      <Clock size={14} className={styles.statIcon} />
                      <div className={styles.statBlockMeta}>
                        <span className={styles.statBlockVal}>{timeAgo(job.createdAt)}</span>
                        <span className={styles.statBlockLabel}>Posted</span>
                      </div>
                    </div>

                    <div className={styles.statBlock}>
                      <Calendar size={14} className={styles.statIcon} />
                      <div className={styles.statBlockMeta}>
                        <span className={styles.statBlockVal}>
                          {job.deadline ? new Date(job.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Rolling'}
                        </span>
                        <span className={styles.statBlockLabel}>Deadline</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Action Bar (Four 44px icon buttons) */}
                  <div className={styles.cardActionsRow}>
                    <Link
                      href="/dashboard/employer/applicants"
                      className={styles.mobileActionBtn}
                      title="View Applicants"
                      aria-label="View Applicants"
                    >
                      <Users size={18} />
                    </Link>

                    <button
                      type="button"
                      className={styles.mobileActionBtn}
                      title="Duplicate Listing"
                      aria-label="Duplicate Listing"
                      onClick={() => handleDuplicate(job)}
                    >
                      <Copy size={18} />
                    </button>

                    <Link
                      href={`/jobs/${job._id}`}
                      className={styles.mobileActionBtn}
                      title="Preview Listing"
                      aria-label="Preview Listing"
                    >
                      <ExternalLink size={18} />
                    </Link>

                    <button
                      type="button"
                      className={`${styles.mobileActionBtn} ${styles.mobileDeleteBtn}`}
                      title="Delete Listing"
                      aria-label="Delete Listing"
                      onClick={() => setDeleteTargetJob(job)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </DataCard>
              ))
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation BottomSheet (Mobile & Tablet) */}
      <BottomSheet
        isOpen={Boolean(deleteTargetJob)}
        onClose={() => setDeleteTargetJob(null)}
        title="Remove Listing"
      >
        {deleteTargetJob && (
          <div className={styles.deleteSheetBody}>
            <div className={styles.deleteIconCircle}>
              <AlertTriangle size={28} />
            </div>
            <h3 className={styles.deleteSheetTitle}>
              Remove "{deleteTargetJob.title}"?
            </h3>
            <p className={styles.deleteSheetDesc}>
              This listing will no longer appear in candidate search results and applications will be paused.
            </p>

            <div className={styles.deleteSheetActions}>
              <button
                type="button"
                className={styles.confirmDeleteBtn}
                onClick={confirmDelete}
                disabled={deleting}
              >
                {deleting ? 'Removing...' : 'Yes, Remove Listing'}
              </button>

              <button
                type="button"
                className={styles.cancelDeleteBtn}
                onClick={() => setDeleteTargetJob(null)}
              >
                Keep Listing
              </button>
            </div>
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
