'use client';

import React, { useState, useEffect } from 'react';
import JobCard from '@/components/jobs/JobCard';
import ApplyModal from '@/components/jobs/ApplyModal';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SeekerRecommendedPage() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [jobsRes, profRes] = await Promise.all([
          fetch('/api/jobs?limit=12'),
          fetch('/api/users/profile'),
        ]);
        const [jobsData, profData] = await Promise.all([jobsRes.json(), profRes.json()]);

        if (jobsData?.jobs) setJobs(jobsData.jobs);
        if (profData?.profile) setProfile(profData.profile);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--green-600)" />
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '28px', color: 'var(--green-900)' }}>
            Recommended For You
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Curated opportunities matching your declared skills and experience preferences.
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <JobCardSkeleton />
          <JobCardSkeleton />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No recommendations yet 🌱"
          description="Add your skills in your profile to let our matching algorithm discover relevant roles for you."
          actionLabel="Edit Profile Skills"
          onAction={() => (window.location.href = '/dashboard/seeker/profile')}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              seekerSkills={profile?.skills || []}
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
          onApplied={() => toast.success('Application submitted!')}
        />
      )}
    </div>
  );
}
