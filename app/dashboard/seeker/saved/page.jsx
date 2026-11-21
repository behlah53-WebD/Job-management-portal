'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpDown } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import JobCardMobile from '@/components/ui/mobile/JobCardMobile';
import EmptyStateMobile from '@/components/ui/mobile/EmptyStateMobile';
import { CardSkeletonMobile } from '@/components/ui/mobile/SkeletonMobile';
import ApplyModal from '@/components/jobs/ApplyModal';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import styles from './saved.module.css';

export default function SeekerSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    fetch('/api/saved')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSavedJobs(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs((prev) => prev.filter((j) => j._id !== jobId));
      toast('Removed from saved 🌱');
    }
  };

  const handleSortToggle = () => {
    const nextSort = !sortAsc;
    setSortAsc(nextSort);
    const sorted = [...savedJobs].sort((a, b) => {
      const titleA = a.title?.toLowerCase() || '';
      const titleB = b.title?.toLowerCase() || '';
      return nextSort ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
    });
    setSavedJobs(sorted);
    toast(nextSort ? 'Sorted A to Z' : 'Sorted Z to A');
  };

  return (
    <div className={styles.container}>
      {/* ========================================================
          MOBILE VIEW (< 1024px)
          ======================================================== */}
      <div className={styles.mobileView}>
        <div className={styles.mobileHeaderRow}>
          <div className={styles.mobileTitleGroup}>
            <h1 className={styles.mobileTitle}>Saved</h1>
            <span className={styles.countChip}>{savedJobs.length}</span>
          </div>

          {savedJobs.length > 1 && (
            <button
              type="button"
              className={styles.sortBtn}
              onClick={handleSortToggle}
              aria-label="Sort saved jobs"
            >
              <ArrowUpDown size={17} />
            </button>
          )}
        </div>

        {loading ? (
          <div className={styles.mobileList}>
            <CardSkeletonMobile />
            <CardSkeletonMobile />
          </div>
        ) : savedJobs.length === 0 ? (
          <EmptyStateMobile
            title="No saved jobs yet 🌱"
            description="Bookmark jobs while browsing to keep your top picks organized in one place."
            actionLabel="Browse Available Jobs"
            onAction={() => (window.location.href = '/jobs')}
          />
        ) : (
          <div className={styles.mobileList}>
            {savedJobs.map((job) => (
              <JobCardMobile
                key={job._id}
                job={job}
                isSaved={true}
                onSaveToggle={handleSaveToggle}
                onApplyClick={(j) => setSelectedJobForApply(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          DESKTOP VIEW (>= 1024px)
          UNTOUCHED TO KEEP 100% DESKTOP PIXEL FIDELITY
          ======================================================== */}
      <div className={styles.desktopView}>
        <div className={styles.desktopHeader}>
          <h1 className={styles.desktopTitle}>Saved Opportunities</h1>
          <p className={styles.desktopSub}>
            Jobs you have bookmarked to review or apply to later.
          </p>
        </div>

        {loading ? (
          <div className={styles.desktopList}>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : savedJobs.length === 0 ? (
          <EmptyState
            title="No saved jobs yet 🌱"
            description="Bookmark jobs while browsing to keep your top picks organized in one place."
            actionLabel="Browse Available Jobs"
            onAction={() => (window.location.href = '/jobs')}
          />
        ) : (
          <div className={styles.desktopList}>
            {savedJobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                isSaved={true}
                onSaveToggle={handleSaveToggle}
                onApplyClick={(j) => setSelectedJobForApply(j)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onApplied={() => {
            toast.success('Applied successfully!');
          }}
        />
      )}
    </div>
  );
}
