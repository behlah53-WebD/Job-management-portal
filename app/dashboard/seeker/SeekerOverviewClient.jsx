'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import {
  Send,
  Eye,
  CalendarCheck2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  Building2,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { formatSalary, timeAgo, calculateProfileStrength } from '@/lib/utils';
import styles from './overview.module.css';

export default function SeekerOverviewClient({ initialData = {} }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [applications] = useState(initialData.applications || []);
  const [savedJobs] = useState(initialData.savedJobs || []);
  const [recommendedJobs] = useState(initialData.recommendedJobs || []);
  const [profile] = useState(initialData.profile || null);
  const loading = false; // Initial data rendered directly from the server on first paint!

  // Compute stat counts
  const appliedCount = applications.length;
  const inReviewCount = applications.filter((a) =>
    ['Viewed', 'Shortlisted'].includes(a.status)
  ).length;
  const interviewCount = applications.filter((a) => a.status === 'Interview').length;
  const savedCount = savedJobs.length;
  const strength = calculateProfileStrength(profile, initialData.user || session?.user);

  return (
    <div className={styles.container}>
      {/* 4 Stat Cards Row */}
      <div className={styles.statsRow}>
        <StatCard
          label="Total Applications"
          value={appliedCount}
          icon={Send}
          trend={12}
          trendLabel="vs last month"
          accentColor="green"
        />
        <StatCard
          label="In Review"
          value={inReviewCount}
          icon={Eye}
          description="Viewed or shortlisted"
          accentColor="lime"
        />
        <StatCard
          label="Interviews Scheduled"
          value={interviewCount}
          icon={CalendarCheck2}
          description="Upcoming conversations"
          accentColor="green"
        />
        <StatCard
          label="Saved Opportunities"
          value={savedCount}
          icon={Bookmark}
          description="Bookmarked to apply"
          accentColor="sage"
        />
      </div>

      {/* Main 2-column workspace */}
      <div className={styles.contentGrid}>
        {/* Left Column (2/3): Recent Applications */}
        <div className={styles.leftCol}>
          <Card padding="large" className={styles.appsCard}>
            <div className={styles.cardHeader}>
              <div>
                <h3 className={styles.cardTitle}>Recent Applications</h3>
                <p className={styles.cardSubtitle}>
                  Track your status updates across active applications.
                </p>
              </div>
              <Link href="/dashboard/seeker/applications">
                <Button variant="ghost" size="sm">
                  View all ({applications.length})
                </Button>
              </Link>
            </div>

            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <JobCardSkeleton />
                <JobCardSkeleton />
              </div>
            ) : applications.length === 0 ? (
              <EmptyState
                title="No applications yet 🌱"
                description="Browse curated openings that align with your craft and submit your first application."
                actionLabel="Explore Jobs"
                onAction={() => router.push('/jobs')}
              />
            ) : (
              <div className={styles.appsList}>
                {applications.slice(0, 4).map((app) => {
                  const job = app.job || {};
                  const company = job.company || {};
                  return (
                    <div key={app._id} className={styles.appItem}>
                      <div className={styles.appTop}>
                        <div className={styles.appJobInfo}>
                          <Link href={`/jobs/${job._id}`} className={styles.appTitleLink}>
                            <h4 className={styles.appJobTitle}>{job.title || 'Role'}</h4>
                          </Link>
                          <span className={styles.appCompanyName}>
                            {company.name || 'Company'} • {job.location || 'Remote'}
                          </span>
                        </div>
                        <Badge variant={app.status}>{app.status}</Badge>
                      </div>

                      {/* Mini Application Stepper */}
                      <div className={styles.miniStepper}>
                        {['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered'].map(
                          (stepName, idx) => {
                            const reached =
                              app.statusHistory?.some((h) => h.status === stepName) ||
                              app.status === stepName;
                            const isCurrent = app.status === stepName;

                            return (
                              <React.Fragment key={stepName}>
                                <div
                                  className={`${styles.stepNode} ${
                                    reached ? styles.stepReached : ''
                                  } ${isCurrent ? styles.stepCurrent : ''}`}
                                  title={stepName}
                                >
                                  {reached ? <CheckCircle2 size={12} /> : <Circle size={10} />}
                                  <span className={styles.stepNodeLabel}>{stepName}</span>
                                </div>
                                {idx < 4 && (
                                  <div
                                    className={`${styles.stepConnector} ${
                                      reached ? styles.connectorReached : ''
                                    }`}
                                  />
                                )}
                              </React.Fragment>
                            );
                          }
                        )}
                      </div>

                      <div className={styles.appFooter}>
                        <span className={styles.appliedDate}>
                          Applied {timeAgo(app.appliedAt || app.createdAt)}
                        </span>
                        {app.employerNote && (
                          <span className={styles.noteIndicator}>
                            Note: "{app.employerNote.slice(0, 45)}..."
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className={styles.rightCol}>
          {/* Profile Strength Card */}
          <Card padding="normal" className={styles.profileRingCard}>
            <div className={styles.ringHeader}>
              <h4 className={styles.ringTitle}>Profile Strength</h4>
              <span className={styles.ringScore}>{strength}%</span>
            </div>
            <p className={styles.ringDesc}>
              Complete profiles receive 3x more views and interview invitations.
            </p>
            <div className={styles.ringBarTrack}>
              <div
                className={styles.ringBarFill}
                style={{ width: `${strength}%` }}
              />
            </div>
            <Link href="/dashboard/seeker/profile">
              <Button variant="secondary" size="sm" fullWidth>
                Edit Profile Details
              </Button>
            </Link>
          </Card>

          {/* Upcoming Interview Alert (if any) */}
          {interviewCount > 0 && (
            <div className={styles.interviewAlert}>
              <div className={styles.alertIconCircle}>
                <CalendarCheck2 size={20} />
              </div>
              <div>
                <span className={styles.alertTitle}>Upcoming Interview</span>
                <span className={styles.alertSub}>Check your email for video link details</span>
              </div>
            </div>
          )}

          {/* Recommended Jobs Mini List */}
          <Card padding="normal" className={styles.recomCard}>
            <div className={styles.recomHeader}>
              <div className={styles.recomTitleRow}>
                <Sparkles size={16} className={styles.sparkleIcon} />
                <h4 className={styles.recomTitle}>Recommended for you</h4>
              </div>
              <Link href="/jobs" className={styles.recomSeeAll}>
                Browse
              </Link>
            </div>

            <div className={styles.recomList}>
              {recommendedJobs.slice(0, 3).map((job) => (
                <Link
                  key={job._id}
                  href={`/jobs/${job._id}`}
                  className={styles.recomItem}
                >
                  <div className={styles.recomItemMeta}>
                    <span className={styles.recomJobTitle}>{job.title}</span>
                    <span className={styles.recomCompany}>
                      {job.company?.name} • {job.location}
                    </span>
                  </div>
                  <span className={styles.recomSalary}>
                    {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryType)}
                  </span>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
