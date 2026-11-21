'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import EmptyState from '@/components/ui/EmptyState';
import Modal from '@/components/ui/Modal';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import SegmentedTabs from '@/components/ui/mobile/SegmentedTabs';
import SproutStepper from '@/components/ui/mobile/SproutStepper';
import EmptyStateMobile from '@/components/ui/mobile/EmptyStateMobile';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import { CardSkeletonMobile } from '@/components/ui/mobile/SkeletonMobile';
import {
  FileText,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  Circle,
  FileX,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { formatSalary, timeAgo, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './applications.module.css';

const STATUS_PIPELINE = ['Applied', 'Viewed', 'Shortlisted', 'Interview', 'Offered'];

export default function SeekerApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetch('/api/applications')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setApplications(data);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!withdrawTarget) return;
    setWithdrawing(true);

    try {
      const res = await fetch('/api/applications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: withdrawTarget._id,
          status: 'Withdrawn',
        }),
      });

      if (!res.ok) throw new Error('Failed to withdraw application');

      setApplications((prev) =>
        prev.map((a) =>
          a._id === withdrawTarget._id ? { ...a, status: 'Withdrawn' } : a
        )
      );
      toast.success('Application withdrawn successfully');
      setWithdrawTarget(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setWithdrawing(false);
    }
  };

  // Status counts
  const tabCounts = {
    all: applications.length,
    Applied: applications.filter((a) => a.status === 'Applied').length,
    Shortlisted: applications.filter((a) => a.status === 'Shortlisted').length,
    Interview: applications.filter((a) => a.status === 'Interview').length,
    Offered: applications.filter((a) => a.status === 'Offered').length,
    Rejected: applications.filter((a) => a.status === 'Rejected').length,
    Withdrawn: applications.filter((a) => a.status === 'Withdrawn').length,
  };

  const tabs = [
    { id: 'all', label: 'All', count: tabCounts.all },
    { id: 'Applied', label: 'Applied', count: tabCounts.Applied },
    { id: 'Shortlisted', label: 'Shortlisted', count: tabCounts.Shortlisted },
    { id: 'Interview', label: 'Interview', count: tabCounts.Interview },
    { id: 'Offered', label: 'Offered', count: tabCounts.Offered },
    { id: 'Rejected', label: 'Rejected', count: tabCounts.Rejected },
    { id: 'Withdrawn', label: 'Withdrawn', count: tabCounts.Withdrawn },
  ];

  // Desktop tab label format
  const desktopTabs = [
    { id: 'all', label: 'All Applications', count: tabCounts.all },
    { id: 'Applied', label: 'Applied', count: tabCounts.Applied },
    { id: 'Shortlisted', label: 'Shortlisted', count: tabCounts.Shortlisted },
    { id: 'Interview', label: 'Interview', count: tabCounts.Interview },
    { id: 'Offered', label: 'Offered', count: tabCounts.Offered },
    { id: 'Rejected', label: 'Rejected', count: tabCounts.Rejected },
    { id: 'Withdrawn', label: 'Withdrawn', count: tabCounts.Withdrawn },
  ];

  const filteredApplications =
    activeTab === 'all'
      ? applications
      : applications.filter((a) => a.status === activeTab);

  return (
    <div className={styles.container}>
      {/* ========================================================
          MOBILE APPLICATIONS VIEW (< 1024px)
          Eliminates horizontal overflow completely
          ======================================================== */}
      <div className={styles.mobileView}>
        <div className={styles.mobileHeader}>
          <h1 className={styles.mobileTitle}>My Applications</h1>
          <p className={styles.mobileSubtitle}>
            Monitor your live candidate pipeline and communications.
          </p>
        </div>

        {/* Sticky horizontal SegmentedTabs with snap & edge fade */}
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          sticky={true}
        />

        {loading ? (
          <div className={styles.mobileList}>
            <CardSkeletonMobile />
            <CardSkeletonMobile />
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyStateMobile
            title={`No ${activeTab === 'all' ? '' : activeTab} applications`}
            description="Explore curated openings that honor your craft and submit your application."
            actionLabel="Browse Jobs"
            onAction={() => router.push('/jobs')}
          />
        ) : (
          <div className={styles.mobileList}>
            {filteredApplications.map((app) => {
              const job = app.job || {};
              const company = job.company || {};
              const salaryStr = formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryType);

              const statusSentence =
                app.status === 'Interview'
                  ? 'Interview scheduled with hiring team'
                  : app.status === 'Shortlisted'
                  ? 'Application shortlisted by employer'
                  : app.status === 'Offered'
                  ? 'Formal offer extended! Congratulations 🌿'
                  : app.status === 'Viewed'
                  ? 'Application reviewed by hiring manager'
                  : 'Application successfully submitted';

              return (
                <article
                  key={app._id}
                  className={styles.mobileCard}
                  onClick={() => router.push(`/jobs/${job._id}`)}
                  role="button"
                  tabIndex={0}
                >
                  {/* Row 1: Logo + Title + Company + Status Badge */}
                  <div className={styles.mobileCardTop}>
                    <div className={styles.mobileLogoBox}>
                      {getInitials(company.name || job.title)}
                    </div>
                    <div className={styles.mobileCardMeta}>
                      <h3 className={styles.mobileJobTitle}>{job.title || 'Role'}</h3>
                      <span className={styles.mobileCompLine}>
                        {company.name || 'Company'} • {job.location || 'Remote'}
                      </span>
                    </div>
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>

                  {salaryStr && (
                    <span className={styles.mobileSalaryChip}>{salaryStr}</span>
                  )}

                  {/* Middle: SproutStepper Growth Path */}
                  <SproutStepper
                    status={app.status}
                    statusSentence={statusSentence}
                  />

                  {/* Employer Note if any */}
                  {app.employerNote && (
                    <div className={styles.mobileNoteBox}>
                      <span className={styles.mobileNoteLabel}>Hiring note:</span>
                      <p className={styles.mobileNoteBody}>"{app.employerNote}"</p>
                    </div>
                  )}

                  {/* Bottom: Date left, Actions right */}
                  <div className={styles.mobileCardBottom}>
                    <span className={styles.mobileAppliedTime}>
                      <Clock size={12} />
                      Applied {timeAgo(app.appliedAt || app.createdAt)}
                    </span>

                    <div className={styles.mobileActionsGroup}>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.actionBtnSecondary}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText size={14} />
                          <span>Resume</span>
                        </a>
                      )}

                      <Link
                        href={`/jobs/${job._id}`}
                        className={styles.actionBtnPrimary}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span>View role</span>
                        <ChevronRight size={14} />
                      </Link>

                      {app.status !== 'Withdrawn' && !['Rejected', 'Offered'].includes(app.status) && (
                        <button
                          type="button"
                          className={styles.mobileWithdrawLink}
                          onClick={(e) => {
                            e.stopPropagation();
                            setWithdrawTarget(app);
                          }}
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Mobile Withdraw Bottom Sheet */}
        <BottomSheet
          isOpen={!!withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          title="Withdraw Application?"
          subtitle="This action cannot be undone."
        >
          <div className={styles.withdrawSheetContent}>
            <p className={styles.withdrawSheetText}>
              Are you sure you want to withdraw your application for{' '}
              <strong>{withdrawTarget?.job?.title}</strong>? The employer will be notified that you are no longer in consideration.
            </p>

            <div className={styles.withdrawSheetButtons}>
              <Button
                variant="ghost"
                fullWidth
                size="md"
                onClick={() => setWithdrawTarget(null)}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                fullWidth
                size="md"
                onClick={handleWithdraw}
                loading={withdrawing}
              >
                Withdraw Application
              </Button>
            </div>
          </div>
        </BottomSheet>
      </div>

      {/* ========================================================
          DESKTOP APPLICATIONS VIEW (>= 1024px)
          PIXEL-IDENTICAL TO ORIGINAL BASELINE
          ======================================================== */}
      <div className={styles.desktopView}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>My Applications</h1>
            <p className={styles.subtitle}>
              Monitor your live candidate pipeline and communication from employers.
            </p>
          </div>
        </div>

        <Tabs tabs={desktopTabs} activeTab={activeTab} onChange={setActiveTab} />

        {loading ? (
          <div className={styles.list}>
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        ) : filteredApplications.length === 0 ? (
          <EmptyState
            title={`No ${activeTab === 'all' ? '' : activeTab} applications`}
            description="Submit an application to roles that match your craft to see them tracked here."
            actionLabel="Find Opportunities"
            onAction={() => (window.location.href = '/jobs')}
          />
        ) : (
          <div className={styles.list}>
            {filteredApplications.map((app) => {
              const job = app.job || {};
              const company = job.company || {};
              const isClosed = ['Rejected', 'Withdrawn'].includes(app.status);

              return (
                <Card key={app._id} className={styles.appCard} padding="normal">
                  <div className={styles.cardHeader}>
                    <div className={styles.jobInfo}>
                      <div className={styles.titleRow}>
                        <Link href={`/jobs/${job._id}`} className={styles.jobLink}>
                          <h3 className={styles.jobTitle}>{job.title || 'Role'}</h3>
                        </Link>
                        <Badge variant={app.status}>{app.status}</Badge>
                      </div>
                      <span className={styles.companyMeta}>
                        {company.name || 'Company'} • {job.location || 'Remote'} •{' '}
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryType)}
                      </span>
                    </div>

                    {app.status !== 'Withdrawn' && (
                      <button
                        type="button"
                        className={styles.withdrawTrigger}
                        onClick={() => setWithdrawTarget(app)}
                      >
                        Withdraw
                      </button>
                    )}
                  </div>

                  {/* Horizontal Timeline */}
                  {!isClosed ? (
                    <div className={styles.timelineWrapper}>
                      <div className={styles.timeline}>
                        {STATUS_PIPELINE.map((step, idx) => {
                          const reached =
                            app.statusHistory?.some((h) => h.status === step) ||
                            app.status === step;
                          const isCurrent = app.status === step;

                          return (
                            <React.Fragment key={step}>
                              <div className={styles.timelineNode}>
                                <div
                                  className={`${styles.nodeCircle} ${
                                    reached ? styles.nodeReached : ''
                                  } ${isCurrent ? styles.nodeCurrent : ''}`}
                                >
                                  {reached ? <CheckCircle2 size={16} /> : <Circle size={12} />}
                                </div>
                                <span className={styles.nodeLabel}>{step}</span>
                              </div>
                              {idx < STATUS_PIPELINE.length - 1 && (
                                <div
                                  className={`${styles.nodeConnector} ${
                                    reached ? styles.connectorReached : ''
                                  }`}
                                />
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className={styles.closedNotice}>
                      <AlertCircle size={16} />
                      <span>
                        Application has been marked as <strong>{app.status}</strong>.
                      </span>
                    </div>
                  )}

                  {/* Cover letter or notes */}
                  {app.employerNote && (
                    <div className={styles.employerNoteBox}>
                      <span className={styles.noteLabel}>Note from hiring team:</span>
                      <p className={styles.noteBody}>"{app.employerNote}"</p>
                    </div>
                  )}

                  <div className={styles.cardFooter}>
                    <div className={styles.footerMeta}>
                      <span className={styles.metaItem}>
                        <Clock size={14} />
                        Applied {timeAgo(app.appliedAt || app.createdAt)}
                      </span>
                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.resumeLink}
                        >
                          <FileText size={14} />
                          View Attached Resume
                        </a>
                      )}
                    </div>

                    <Link href={`/jobs/${job._id}`}>
                      <Button variant="ghost" size="sm" icon={ExternalLink}>
                        View Role
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Desktop Withdraw Modal */}
        <Modal
          isOpen={!!withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          title="Withdraw Application?"
          subtitle="This action cannot be undone."
        >
          <div className={styles.withdrawModalContent}>
            <p className={styles.withdrawText}>
              Are you sure you want to withdraw your application for{' '}
              <strong>{withdrawTarget?.job?.title}</strong>? The employer will be notified that you are no longer in the running.
            </p>

            <div className={styles.withdrawActions}>
              <Button
                variant="ghost"
                onClick={() => setWithdrawTarget(null)}
                disabled={withdrawing}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleWithdraw}
                loading={withdrawing}
              >
                Withdraw Application
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
