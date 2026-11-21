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
import ProgressRing from '@/components/ui/mobile/ProgressRing';
import SproutStepper from '@/components/ui/mobile/SproutStepper';
import JobCardMobile from '@/components/ui/mobile/JobCardMobile';
import EmptyStateMobile from '@/components/ui/mobile/EmptyStateMobile';
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
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { formatSalary, timeAgo, calculateProfileStrength, getInitials } from '@/lib/utils';
import styles from './overview.module.css';

export default function SeekerOverviewClient({ initialData = {} }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [applications] = useState(initialData.applications || []);
  const [savedJobs] = useState(initialData.savedJobs || []);
  const [recommendedJobs] = useState(initialData.recommendedJobs || []);
  const [profile] = useState(initialData.profile || null);
  const loading = false;

  // Compute stat counts
  const appliedCount = applications.length;
  const inReviewCount = applications.filter((a) =>
    ['Viewed', 'Shortlisted'].includes(a.status)
  ).length;
  const interviewApps = applications.filter((a) => a.status === 'Interview');
  const interviewCount = interviewApps.length;
  const savedCount = savedJobs.length;
  const strength = calculateProfileStrength(profile, initialData.user || session?.user);

  const candidateName = session?.user?.name?.split(' ')[0] || 'Candidate';
  const hour = new Date().getHours();
  const timeOfDayGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // First upcoming interview if any
  const upcomingInterview = interviewApps[0];

  return (
    <div className={styles.container}>
      {/* ========================================================
          MOBILE OVERVIEW EXPERIENCE (< 1024px)
          ======================================================== */}
      <div className={styles.mobileLayout}>
        {/* 1. Greeting Block */}
        <section className={styles.mobileGreetingBlock}>
          <span className={styles.mobileOverline}>{timeOfDayGreeting}</span>
          <h2 className={styles.mobileGreetingName}>{candidateName}</h2>
          <p className={styles.mobileSupportiveText}>
            Here is your live career activity snapshot and top matches for today.
          </p>
        </section>

        {/* 2. Primary Snapshot Card with Growth Ring */}
        <section className={styles.snapshotCard}>
          <div className={styles.snapshotLeft}>
            <ProgressRing value={strength} size={72} strokeWidth={6} />
          </div>
          <div className={styles.snapshotRight}>
            <span className={styles.snapshotTitle}>Profile Strength: {strength}%</span>
            <p className={styles.snapshotDesc}>
              {strength >= 80
                ? 'Your profile is flourishing! Standout candidates receive 3x more views.'
                : 'Add more skills and portfolio links to reach 100% and unlock recommended roles.'}
            </p>
            <Link href="/dashboard/seeker/profile" className={styles.snapshotAction}>
              <span>{strength === 100 ? 'View profile' : 'Complete profile'}</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>

        {/* 3. Mobile Stats 2x2 Grid (all cards in front, no side scroll) */}
        <section className={styles.mobileStatsSection}>
          <div className={styles.mobileStatsGrid}>
            <div
              className={styles.mobileStatCard}
              onClick={() => router.push('/dashboard/seeker/applications')}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.mobileStatIconBox} ${styles.iconBoxGreen}`}>
                <Send size={18} />
              </div>
              <span className={styles.mobileStatNumber}>{appliedCount}</span>
              <span className={styles.mobileStatLabel}>Total Applied</span>
              <span className={styles.mobileDeltaChip}>
                <TrendingUp size={11} /> +12%
              </span>
            </div>

            <div
              className={styles.mobileStatCard}
              onClick={() => router.push('/dashboard/seeker/applications')}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.mobileStatIconBox} ${styles.iconBoxLime}`}>
                <Eye size={18} />
              </div>
              <span className={styles.mobileStatNumber}>{inReviewCount}</span>
              <span className={styles.mobileStatLabel}>In Review</span>
              <span className={styles.mobileStatSub}>Shortlisted</span>
            </div>

            <div
              className={styles.mobileStatCard}
              onClick={() => router.push('/dashboard/seeker/applications')}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.mobileStatIconBox} ${styles.iconBoxGreen}`}>
                <CalendarCheck2 size={18} />
              </div>
              <span className={styles.mobileStatNumber}>{interviewCount}</span>
              <span className={styles.mobileStatLabel}>Interviews</span>
              <span className={styles.mobileStatSub}>Scheduled</span>
            </div>

            <div
              className={styles.mobileStatCard}
              onClick={() => router.push('/dashboard/seeker/saved')}
              role="button"
              tabIndex={0}
            >
              <div className={`${styles.mobileStatIconBox} ${styles.iconBoxSage}`}>
                <Bookmark size={18} />
              </div>
              <span className={styles.mobileStatNumber}>{savedCount}</span>
              <span className={styles.mobileStatLabel}>Saved Jobs</span>
              <span className={styles.mobileStatSub}>To Apply</span>
            </div>
          </div>
        </section>

        {/* 4. Upcoming Interview Card (if any) */}
        {upcomingInterview && (
          <section className={styles.interviewHighlightCard}>
            <div className={styles.interviewDateBlock}>
              <span className={styles.interviewDayNumber}>
                {new Date(upcomingInterview.updatedAt || Date.now()).getDate()}
              </span>
              <span className={styles.interviewMonth}>
                {new Date(upcomingInterview.updatedAt || Date.now()).toLocaleString('default', { month: 'short' })}
              </span>
            </div>
            <div className={styles.interviewInfo}>
              <span className={styles.interviewOverline}>Upcoming Interview</span>
              <h4 className={styles.interviewRoleTitle}>
                {upcomingInterview.job?.title || 'Engineering Role'}
              </h4>
              <span className={styles.interviewCompanyName}>
                {upcomingInterview.job?.company?.name || 'Verdant Partner'}
              </span>
            </div>
            <Link
              href="/dashboard/seeker/applications"
              className={styles.interviewChevronBtn}
              aria-label="View interview details"
            >
              <ChevronRight size={20} />
            </Link>
          </section>
        )}

        {/* 5. Recent Applications */}
        <section className={styles.mobileSection}>
          <div className={styles.mobileSectionHeader}>
            <div>
              <h3 className={styles.mobileSectionTitle}>Recent Applications</h3>
              <span className={styles.mobileSectionCount}>{applications.length} active</span>
            </div>
            <Link href="/dashboard/seeker/applications" className={styles.mobileViewAllLink}>
              View all
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyStateMobile
              title="No applications yet 🌱"
              description="Explore curated openings that honor your craft and submit your first application."
              actionLabel="Explore Jobs"
              onAction={() => router.push('/jobs')}
            />
          ) : (
            <div className={styles.mobileAppsList}>
              {applications.slice(0, 3).map((app) => {
                const job = app.job || {};
                const company = job.company || {};
                return (
                  <div
                    key={app._id}
                    className={styles.mobileAppCard}
                    onClick={() => router.push(`/jobs/${job._id}`)}
                    role="button"
                    tabIndex={0}
                  >
                    <div className={styles.mobileAppRowTop}>
                      <div className={styles.mobileAppLogo}>
                        {getInitials(company.name || job.title)}
                      </div>
                      <div className={styles.mobileAppMeta}>
                        <h4 className={styles.mobileAppJobTitle}>{job.title || 'Role'}</h4>
                        <span className={styles.mobileAppComp}>
                          {company.name || 'Company'} • {job.location || 'Remote'}
                        </span>
                      </div>
                      <Badge variant={app.status}>{app.status}</Badge>
                    </div>

                    {/* Compact Sprout Stepper */}
                    <SproutStepper
                      status={app.status}
                      compact={true}
                      statusSentence={
                        app.status === 'Interview'
                          ? 'Interview conversation scheduled'
                          : app.status === 'Shortlisted'
                          ? 'Application shortlisted by hiring team'
                          : undefined
                      }
                    />

                    <div className={styles.mobileAppFooter}>
                      <span className={styles.mobileAppDate}>
                        Applied {timeAgo(app.appliedAt || app.createdAt)}
                      </span>
                      <Link
                        href={`/jobs/${job._id}`}
                        className={styles.mobileAppViewLink}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>Role info</span>
                        <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 6. Recommended For You Carousel */}
        {recommendedJobs.length > 0 && (
          <section className={styles.mobileSection}>
            <div className={styles.mobileSectionHeader}>
              <div className={styles.sparkleTitleRow}>
                <Sparkles size={18} className={styles.sparkleIcon} />
                <h3 className={styles.mobileSectionTitle}>Recommended For You</h3>
              </div>
              <Link href="/dashboard/seeker/recommended" className={styles.mobileViewAllLink}>
                See more
              </Link>
            </div>

            <div className={styles.mobileRecomCarousel}>
              {recommendedJobs.slice(0, 4).map((job) => (
                <JobCardMobile
                  key={job._id}
                  job={job}
                  viewVariant="compact"
                  seekerSkills={profile?.skills || []}
                  showMatchRing={true}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ========================================================
          DESKTOP OVERVIEW EXPERIENCE (>= 1024px)
          UNTOUCHED TO GUARANTEE 100% DESKTOP PIXEL FIDELITY
          ======================================================== */}
      <div className={styles.desktopLayout}>
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
    </div>
  );
}
