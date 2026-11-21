'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import BookmarkLeafBtn from './BookmarkLeafBtn';
import ProgressRing from './ProgressRing';
import { formatSalary, timeAgo, getInitials, isNewJob, calculateJobMatch } from '@/lib/utils';
import styles from './JobCardMobile.module.css';

export default function JobCardMobile({
  job = {},
  isSaved = false,
  onSaveToggle,
  onApplyClick,
  seekerSkills = [],
  viewVariant = 'list', // 'list' or 'compact'
  showMatchRing = false,
  className = '',
}) {
  const router = useRouter();
  if (!job?._id) return null;

  const company = job.company || {};
  const isNew = isNewJob(job.createdAt);
  const salaryString = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryType
  );

  const matchPercent = calculateJobMatch(job, seekerSkills);

  const handleCardClick = (e) => {
    // If not clicking button or link, navigate to job
    if (e.target.closest('button') || e.target.closest('a')) return;
    router.push(`/jobs/${job._id}`);
  };

  const handleApplyClick = (e) => {
    e.stopPropagation();
    if (onApplyClick) {
      onApplyClick(job);
    } else {
      router.push(`/jobs/${job._id}`);
    }
  };

  return (
    <article
      className={`${styles.card} ${viewVariant === 'compact' ? styles.compactCard : ''} ${className}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick(e);
      }}
    >
      {/* Row 1: Logo + Title + Company + Bookmark */}
      <div className={styles.rowTop}>
        <div className={styles.logoAndMeta}>
          <div className={styles.logoBox}>
            {company.logo ? (
              <Image
                src={company.logo}
                alt={company.name || 'Company'}
                width={46}
                height={46}
                className={styles.logoImg}
              />
            ) : (
              <div className={styles.fallbackLogo}>
                {getInitials(company.name || job.title)}
              </div>
            )}
          </div>

          <div className={styles.titleArea}>
            <Link href={`/jobs/${job._id}`} className={styles.titleLink} onClick={(e) => e.stopPropagation()}>
              <h3 className={styles.jobTitle}>{job.title}</h3>
            </Link>
            <div className={styles.companyRow}>
              <span className={styles.companyName}>{company.name || 'Confidential'}</span>
              {company.isVerified !== false && (
                <CheckCircle2 size={13} className={styles.verifiedIcon} />
              )}
            </div>
          </div>
        </div>

        <div className={styles.topRightActions}>
          {showMatchRing && matchPercent > 0 && (
            <ProgressRing value={matchPercent} size={36} strokeWidth={4} />
          )}
          <BookmarkLeafBtn
            isSaved={isSaved}
            onToggle={() => onSaveToggle?.(job._id, !isSaved)}
            size={40}
          />
        </div>
      </div>

      {/* Row 2: Badges row */}
      {(isNew || job.isFeatured || (!showMatchRing && matchPercent > 0)) && (
        <div className={styles.badgeRow}>
          {isNew && <span className={styles.badgeNew}>New</span>}
          {job.isFeatured && <span className={styles.badgeHiring}>Hiring Fast</span>}
          {!showMatchRing && matchPercent > 0 && (
            <span className={styles.badgeMatch}>{matchPercent}% match</span>
          )}
        </div>
      )}

      {/* Row 3: Horizontal scrollable attribute chips (no multi-line wrap blowout) */}
      <div className={styles.chipsRow}>
        {job.jobType && <span className={styles.chip}>{job.jobType}</span>}
        {job.workMode && <span className={styles.chip}>{job.workMode}</span>}
        {job.experienceLevel && <span className={styles.chip}>{job.experienceLevel} exp</span>}
        {job.category && <span className={styles.chip}>{job.category}</span>}
      </div>

      <div className={styles.divider} />

      {/* Row 4: Location/Time left, Salary/Apply right */}
      <div className={styles.rowBottom}>
        <div className={styles.locationTimeCol}>
          <div className={styles.locationItem}>
            <MapPin size={13} className={styles.icon} />
            <span className={styles.locText}>{job.location || 'Remote'}</span>
          </div>
          <div className={styles.timeItem}>
            <Clock size={12} className={styles.icon} />
            <span suppressHydrationWarning className={styles.timeText}>{timeAgo(job.createdAt)}</span>
          </div>
        </div>

        <div className={styles.salaryActionCol}>
          <span className={styles.salaryText}>{salaryString}</span>
          <button
            type="button"
            className={styles.applyBtn}
            onClick={handleApplyClick}
          >
            <span>Apply</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  );
}
