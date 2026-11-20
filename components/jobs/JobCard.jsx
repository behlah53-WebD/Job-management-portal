'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import { formatSalary, timeAgo, isNewJob, getInitials, calculateMatchScore } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './JobCard.module.css';

export default function JobCard({
  job,
  seekerSkills = [],
  isSaved: initialIsSaved = false,
  onSaveToggle,
  onApplyClick,
  viewMode = 'list', // 'list' | 'grid'
  className = '',
}) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isSaving, setIsSaving] = useState(false);

  const company = job.company || {};
  const isNew = isNewJob(job.createdAt);
  const salaryString = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryType
  );
  const matchScore = calculateMatchScore(seekerSkills, job.skills);

  const handleBookmark = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsSaving(true);
    const newSaved = !isSaved;
    setIsSaved(newSaved);

    try {
      const res = await fetch('/api/saved', {
        method: newSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id }),
      });

      if (!res.ok) {
        // If unauthenticated, notify politely
        if (res.status === 401) {
          toast('Sign in as a job seeker to save jobs 🌿');
          setIsSaved(!newSaved);
          return;
        }
        throw new Error('Failed to update saved job');
      }

      toast.success(newSaved ? 'Job saved to your bookmarks 🌱' : 'Job removed from saved jobs');
      onSaveToggle && onSaveToggle(job._id, newSaved);
    } catch {
      // Revert state if error
      toast.error('Could not update saved job');
      setIsSaved(!newSaved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <article
      className={`${styles.card} ${viewMode === 'grid' ? styles.gridCard : styles.listCard} ${className}`}
    >
      <div className={styles.topRow}>
        <div className={styles.companyMeta}>
          {company.logo ? (
            <div className={styles.logoWrapper}>
              <Image
                src={company.logo}
                alt={company.name || 'Company logo'}
                width={56}
                height={56}
                className={styles.logoImage}
              />
            </div>
          ) : (
            <div className={styles.logoFallback}>
              {getInitials(company.name || job.title)}
            </div>
          )}

          <div className={styles.titleArea}>
            <div className={styles.badgesRow}>
              {isNew && <Badge variant="new">New</Badge>}
              {job.isFeatured && (
                <Badge variant="hiring-fast" dot={false}>
                  <Zap size={12} className={styles.badgeIcon} />
                  Hiring fast
                </Badge>
              )}
              {seekerSkills?.length > 0 && (
                <span className={styles.matchPill}>
                  <Sparkles size={12} />
                  {matchScore}% match
                </span>
              )}
            </div>

            <Link href={`/jobs/${job._id}`} className={styles.titleLink}>
              <h3 className={styles.title}>{job.title}</h3>
            </Link>

            <div className={styles.companyRow}>
              <Link
                href={company._id ? `/companies/${company._id}` : `/jobs?q=${encodeURIComponent(company.name || '')}`}
                className={styles.companyName}
              >
                {company.name || 'Confidential'}
              </Link>
              {company.isVerified !== false && (
                <span className={styles.verifiedTick} title="Verified Employer">
                  <CheckCircle2 size={15} />
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          suppressHydrationWarning
          type="button"
          className={`${styles.bookmarkBtn} ${isSaved ? styles.bookmarked : ''}`}
          onClick={handleBookmark}
          disabled={isSaving}
          aria-label={isSaved ? 'Remove from saved' : 'Save job'}
        >
          <Bookmark size={20} fill={isSaved ? '#1E9A56' : 'none'} />
        </button>
      </div>

      <div className={styles.chipsRow}>
        {job.jobType && <Chip size="sm">{job.jobType}</Chip>}
        {job.workMode && <Chip size="sm">{job.workMode}</Chip>}
        {job.experienceLevel && <Chip size="sm">{job.experienceLevel} exp</Chip>}
        {job.category && (
          <span className={styles.categoryChip}>{job.category}</span>
        )}
      </div>

      <div className={styles.metaRow}>
        <div className={styles.location}>
          <MapPin size={16} className={styles.pinIcon} />
          <span>{job.location}</span>
        </div>
        <div className={styles.salary}>{salaryString}</div>
      </div>

      <div className={styles.footerRow}>
        <span suppressHydrationWarning className={styles.postedTime}>Posted {timeAgo(job.createdAt)}</span>
        <div className={styles.actions}>
          <Link href={`/jobs/${job._id}`}>
            <Button
              variant="primary"
              size="sm"
              onClick={(e) => {
                if (onApplyClick) {
                  e.preventDefault();
                  onApplyClick(job);
                }
              }}
            >
              Apply now
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
