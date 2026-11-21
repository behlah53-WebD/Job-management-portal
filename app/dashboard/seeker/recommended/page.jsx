'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import JobCard from '@/components/jobs/JobCard';
import JobCardMobile from '@/components/ui/mobile/JobCardMobile';
import EmptyStateMobile from '@/components/ui/mobile/EmptyStateMobile';
import { CardSkeletonMobile } from '@/components/ui/mobile/SkeletonMobile';
import ApplyModal from '@/components/jobs/ApplyModal';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import toast from 'react-hot-toast';
import styles from './recommended.module.css';

export default function SeekerRecommendedPage() {
  const [jobs, setJobs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);
  const [activeFilterSkill, setActiveFilterSkill] = useState('All');

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

  const seekerSkills = profile?.skills || [];
  const skillChips = ['All', ...seekerSkills];

  const filteredJobs =
    activeFilterSkill === 'All'
      ? jobs
      : jobs.filter((job) =>
          job.skills?.some(
            (s) => s.toLowerCase() === activeFilterSkill.toLowerCase()
          ) ||
          job.title?.toLowerCase().includes(activeFilterSkill.toLowerCase())
        );

  return (
    <div className={styles.container}>
      {/* ========================================================
          MOBILE VIEW (< 1024px)
          ======================================================== */}
      <div className={styles.mobileView}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTitleRow}>
            <Sparkles size={22} className={styles.sparkleIcon} />
            <h1 className={styles.mobileTitle}>For You</h1>
          </div>
          <p className={styles.mobileSubtitle}>
            Curated opportunities matching your craft and skill preferences.
          </p>
        </div>

        {/* Skill / Filter Chip Row */}
        {skillChips.length > 1 && (
          <div className={styles.filterChipsRow}>
            {skillChips.map((skill) => (
              <button
                key={skill}
                type="button"
                className={`${styles.filterChip} ${
                  activeFilterSkill === skill ? styles.filterChipActive : ''
                }`}
                onClick={() => setActiveFilterSkill(skill)}
              >
                {skill}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.mobileList}>
            <CardSkeletonMobile />
            <CardSkeletonMobile />
          </div>
        ) : filteredJobs.length === 0 ? (
          <EmptyStateMobile
            title="No matches right now 🌱"
            description="Try selecting 'All' or add more skills to your profile to broaden your recommendations."
            actionLabel="Edit Profile Skills"
            onAction={() => (window.location.href = '/dashboard/seeker/profile')}
          />
        ) : (
          <div className={styles.mobileList}>
            {filteredJobs.map((job) => (
              <JobCardMobile
                key={job._id}
                job={job}
                seekerSkills={seekerSkills}
                showMatchRing={true}
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
          <div className={styles.desktopTitleRow}>
            <Sparkles size={20} color="var(--green-600)" />
            <h1 className={styles.desktopTitle}>Recommended For You</h1>
          </div>
          <p className={styles.desktopSub}>
            Curated opportunities matching your declared skills and experience preferences.
          </p>
        </div>

        {loading ? (
          <div className={styles.desktopList}>
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
          <div className={styles.desktopList}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                seekerSkills={seekerSkills}
                onApplyClick={(j) => setSelectedJobForApply(j)}
              />
            ))}
          </div>
        )}
      </div>

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
