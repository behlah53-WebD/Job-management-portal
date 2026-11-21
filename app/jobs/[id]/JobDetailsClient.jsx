'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  MapPin,
  Briefcase,
  Clock,
  Calendar,
  Share2,
  Bookmark,
  CheckCircle2,
  Building,
  Flag,
  Globe,
  Users,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Chip from '@/components/ui/Chip';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { saveRecentJob } from '@/lib/pwa/offlineDB';
import JobCard from '@/components/jobs/JobCard';
import ApplyModal from '@/components/jobs/ApplyModal';
import Modal from '@/components/ui/Modal';
import { formatSalary, timeAgo, getInitials, isNewJob } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './jobDetails.module.css';

export default function JobDetailsClient({ job, similarJobs = [] }) {
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);

  const company = job.company || {};
  const isNew = isNewJob(job.createdAt);
  const salaryString = formatSalary(
    job.salaryMin,
    job.salaryMax,
    job.salaryCurrency,
    job.salaryType
  );

  useEffect(() => {
    if (job) {
      saveRecentJob(job);
    }

    fetch('/api/saved')
      .then((r) => (r.ok ? r.json() : []))
      .then((saved) => {
        if (Array.isArray(saved)) {
          const match = saved.some((s) => s._id?.toString() === job?._id?.toString());
          setIsSaved(match);
        }
      })
      .catch(() => {});
  }, [job]);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.title} at ${job.company?.name || 'Verdant'}`,
          text: `Check out this opening for ${job.title} on Verdant!`,
          url: window.location.href,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }

    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard! 📋');
  };

  const handleBookmarkToggle = async () => {
    setSavingBookmark(true);
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    try {
      const res = await fetch('/api/saved', {
        method: nextSaved ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast('Sign in as a job seeker to bookmark jobs 🌿');
          setIsSaved(!nextSaved);
          return;
        }
        throw new Error('Failed to update bookmark');
      }

      toast.success(nextSaved ? 'Job saved to your bookmarks! 🌱' : 'Removed from bookmarks');
    } catch (err) {
      toast.error('Could not update saved job');
      setIsSaved(!nextSaved);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!reportReason.trim()) return;

    setReportSubmitting(true);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job._id, reason: reportReason.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit report');

      toast.success(data.message || 'Thank you. Our trust & safety team will review this role.');
      setReportModalOpen(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.message || 'Failed to submit report');
    } finally {
      setReportSubmitting(false);
    }
  };

  // Calculate days remaining until deadline
  const deadlineDate = job.deadline ? new Date(job.deadline) : null;
  const daysLeft = deadlineDate
    ? Math.max(0, Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <ChevronRight size={14} className={styles.breadSep} />
        <Link href="/jobs">Jobs</Link>
        <ChevronRight size={14} className={styles.breadSep} />
        <Link href={`/jobs?category=${encodeURIComponent(job.category || '')}`}>
          {job.category}
        </Link>
        <ChevronRight size={14} className={styles.breadSep} />
        <span className={styles.breadCurrent}>{job.title}</span>
      </nav>

      {/* Header Card */}
      <div className={styles.headerCard}>
        <div className={styles.headerLeft}>
          {company.logo ? (
            <div className={styles.companyLogo}>
              <Image
                src={company.logo}
                alt={company.name || 'Company'}
                width={72}
                height={72}
                className={styles.logoImg}
              />
            </div>
          ) : (
            <div className={styles.companyLogoFallback}>
              {getInitials(company.name || job.title)}
            </div>
          )}

          <div className={styles.headerMeta}>
            <div className={styles.badgeRow}>
              {isNew && <Badge variant="new">New</Badge>}
              {job.isFeatured && <Badge variant="hiring-fast">Hiring Fast</Badge>}
              <span className={styles.deadlinePill}>
                <Clock size={12} />
                {daysLeft !== null ? `${daysLeft} days left to apply` : 'Open'}
              </span>
            </div>

            <h1 className={styles.jobTitle}>{job.title}</h1>

            <div className={styles.companyMetaRow}>
              <Link
                href={company._id ? `/companies/${company._id}` : `/jobs?q=${encodeURIComponent(company.name || '')}`}
                className={styles.companyName}
              >
                {company.name || 'Confidential'}
              </Link>
              {company.isVerified !== false && (
                <span className={styles.verifiedTick} title="Verified Company">
                  <CheckCircle2 size={16} />
                </span>
              )}
              <span className={styles.dot}>•</span>
              <span className={styles.locationText}>
                <MapPin size={15} className={styles.inlineIcon} />
                {job.location}
              </span>
              <span className={styles.dot}>•</span>
              <span suppressHydrationWarning className={styles.postedText}>Posted {timeAgo(job.createdAt)}</span>
            </div>

            <div className={styles.chipsRow}>
              <Chip size="sm">{job.jobType}</Chip>
              <Chip size="sm">{job.workMode}</Chip>
              <Chip size="sm">{job.experienceLevel} exp</Chip>
              <span className={styles.salaryChip}>{salaryString}</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <Button
            variant="primary"
            size="lg"
            onClick={() => setApplyModalOpen(true)}
            className={styles.applyBtn}
          >
            Apply Now 🌱
          </Button>

          <div className={styles.subActionButtons}>
            <Button
              variant="secondary"
              size="md"
              icon={Bookmark}
              loading={savingBookmark}
              onClick={handleBookmarkToggle}
            >
              {isSaved ? 'Saved' : 'Bookmark'}
            </Button>
            <Button
              variant="ghost"
              size="md"
              icon={Share2}
              onClick={handleShare}
            >
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className={styles.bodyGrid}>
        {/* Left Column (2/3) */}
        <div className={styles.leftCol}>
          {/* Section: Description */}
          <Card className={styles.contentCard} padding="large">
            <h3 className={styles.sectionHeading}>About the Opportunity</h3>
            <p className={styles.descriptionText}>{job.description}</p>

            {/* Responsibilities */}
            {job.responsibilities?.length > 0 && (
              <div className={styles.contentSection}>
                <h4 className={styles.subHeading}>Key Responsibilities</h4>
                <ul className={styles.bulletList}>
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className={styles.bulletItem}>
                      <span className={styles.bulletCheck}>
                        <Check size={14} />
                      </span>
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements */}
            {job.requirements?.length > 0 && (
              <div className={styles.contentSection}>
                <h4 className={styles.subHeading}>Qualifications & Craft</h4>
                <ul className={styles.bulletList}>
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className={styles.bulletItem}>
                      <span className={styles.bulletCheck}>
                        <Check size={14} />
                      </span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills?.length > 0 && (
              <div className={styles.contentSection}>
                <h4 className={styles.subHeading}>Skills & Technologies</h4>
                <div className={styles.skillsGrid}>
                  {job.skills.map((skill) => (
                    <Chip key={skill} size="md">
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (1/3) Sticky */}
        <div className={styles.rightCol}>
          {/* Job Overview Card */}
          <Card className={styles.overviewCard} padding="normal">
            <h4 className={styles.overviewTitle}>Job Overview</h4>
            <div className={styles.overviewList}>
              <div className={styles.overviewItem}>
                <Calendar size={18} className={styles.overviewIcon} />
                <div>
                  <span className={styles.ovLabel}>Date Posted</span>
                  <span className={styles.ovValue}>{timeAgo(job.createdAt)}</span>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <Clock size={18} className={styles.overviewIcon} />
                <div>
                  <span className={styles.ovLabel}>Application Deadline</span>
                  <span className={styles.ovValue}>
                    {deadlineDate ? deadlineDate.toLocaleDateString() : 'Rolling'}
                  </span>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <MapPin size={18} className={styles.overviewIcon} />
                <div>
                  <span className={styles.ovLabel}>Location</span>
                  <span className={styles.ovValue}>{job.location} ({job.workMode})</span>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <Briefcase size={18} className={styles.overviewIcon} />
                <div>
                  <span className={styles.ovLabel}>Job Type</span>
                  <span className={styles.ovValue}>{job.jobType}</span>
                </div>
              </div>

              <div className={styles.overviewItem}>
                <Users size={18} className={styles.overviewIcon} />
                <div>
                  <span className={styles.ovLabel}>Openings</span>
                  <span className={styles.ovValue}>{job.openings || 1} available</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Card */}
          <Card className={styles.companyCard} padding="normal">
            <div className={styles.compHeader}>
              <div className={styles.compHeaderLeft}>
                <h4 className={styles.compName}>{company.name || 'Company'}</h4>
                <span className={styles.compIndustry}>{company.industry || 'Technology'}</span>
              </div>
              {company.isVerified !== false && (
                <Badge variant="verified">Verified</Badge>
              )}
            </div>

            {company.about && (
              <p className={styles.compAbout}>{company.about.slice(0, 160)}...</p>
            )}

            <div className={styles.compMetaRows}>
              {company.size && (
                <div className={styles.compMetaItem}>
                  <Users size={15} />
                  <span>{company.size} employees</span>
                </div>
              )}
              {company.website && (
                <div className={styles.compMetaItem}>
                  <Globe size={15} />
                  <a href={company.website} target="_blank" rel="noreferrer" className={styles.compWebLink}>
                    Visit website
                  </a>
                </div>
              )}
            </div>

            <div className={styles.companyActions}>
              <Link href={company._id ? `/companies/${company._id}` : `/jobs?q=${encodeURIComponent(company.name || '')}`}>
                <Button variant="secondary" size="sm" fullWidth>
                  View Company Profile
                </Button>
              </Link>
              <button
                type="button"
                className={styles.reportBtn}
                onClick={() => setReportModalOpen(true)}
              >
                <Flag size={13} />
                <span>Report this listing</span>
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Similar Jobs Section */}
      {similarJobs.length > 0 && (
        <section className={styles.similarSection}>
          <div className={styles.similarHeader}>
            <h3 className={styles.similarTitle}>Similar Opportunities</h3>
            <Link href={`/jobs?category=${encodeURIComponent(job.category || '')}`} className={styles.seeMoreLink}>
              Browse more in {job.category}
            </Link>
          </div>
          <div className={styles.similarGrid}>
            {similarJobs.slice(0, 3).map((sJob) => (
              <JobCard key={sJob._id} job={sJob} viewMode="grid" />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom Bar */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileSalaryBox}>
          <span className={styles.mobileSalaryVal}>{salaryString}</span>
          <span className={styles.mobileLocation}>{job.location}</span>
        </div>
        <Button variant="primary" size="md" onClick={() => setApplyModalOpen(true)}>
          Apply Now 🌱
        </Button>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        onApplied={() => {
          setApplyModalOpen(false);
          toast.success('Application submitted successfully!');
        }}
      />

      {/* Report Modal */}
      <Modal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        title="Report Job Listing"
        subtitle="Help keep Verdant clean, accurate, and safe."
      >
        <form onSubmit={handleReportSubmit} className={styles.reportForm}>
          <label className={styles.reportLabel}>
            Reason for reporting:
          </label>
          <textarea
            required
            rows={4}
            className={styles.reportTextarea}
            placeholder="Please describe why this listing is inaccurate, misleading, or violates guidelines..."
            value={reportReason}
            onChange={(e) => setReportReason(e.target.value)}
          />
          <div className={styles.reportActions}>
            <Button type="button" variant="ghost" onClick={() => setReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" loading={reportSubmitting}>
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
