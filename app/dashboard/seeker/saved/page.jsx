'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import JobCard from '@/components/jobs/JobCard';
import ApplyModal from '@/components/jobs/ApplyModal';
import EmptyState from '@/components/ui/EmptyState';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';

export default function SeekerSavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

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
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
          Saved Opportunities
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Jobs you have bookmarked to review or apply to later.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
