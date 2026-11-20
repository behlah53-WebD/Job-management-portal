'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import styles from './ApplyModal.module.css';

export default function ApplyModal({
  job,
  isOpen,
  onClose,
  onApplied,
}) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [resumeType, setResumeType] = useState('profile'); // 'profile' | 'upload'
  const [uploadedResume, setUploadedResume] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [step, setStep] = useState(1); // 1: form, 2: confirm, 3: success
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Fetch seeker profile when modal opens
  useEffect(() => {
    if (isOpen && session?.user?.role === 'jobseeker') {
      fetch('/api/users/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.profile) {
            setProfile(data.profile);
            if (!data.profile.resumeUrl) {
              setResumeType('upload');
            }
          }
        })
        .catch(() => {});
    }
    // Reset state
    setStep(1);
    setError('');
  }, [isOpen, session]);

  if (!isOpen || !job) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Only PDF resumes are supported.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Resume must be under 5MB.');
      return;
    }

    setError('');
    // Create local object URL for preview/testing
    const fakeUrl = URL.createObjectURL(file);
    setUploadedResume({
      name: file.name,
      url: fakeUrl,
      size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
    });
  };

  const handleProceedToConfirm = (e) => {
    e.preventDefault();
    if (resumeType === 'profile' && !profile?.resumeUrl) {
      setError('Please upload a resume or add one to your profile.');
      return;
    }
    if (resumeType === 'upload' && !uploadedResume) {
      setError('Please choose a PDF resume to attach.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmitApplication = async () => {
    setSubmitting(true);
    setError('');

    const resumeUrl =
      resumeType === 'profile'
        ? profile?.resumeUrl
        : uploadedResume?.url;

    if (!resumeUrl) {
      setError('Please attach or upload your resume before submitting.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job._id,
          resumeUrl,
          coverLetter,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      setStep(3);
      onApplied && onApplied(data.application);

      // Trigger botanical confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2FB36A', '#1E9A56', '#C8F169', '#9ADBB1', '#0F5C33'],
        });
      } catch {}
    } catch (err) {
      setError(err.message);
      setStep(1);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={step === 3 ? 'Application Sent!' : `Apply to ${job.title}`}
      subtitle={step === 3 ? 'Your seeds have been planted 🌱' : job.company?.name}
      maxWidth="560px"
    >
      {!session?.user ? (
        <div className={styles.unauthBox}>
          <p className={styles.unauthText}>
            Please sign in to your Verdant account or create one to apply for this position.
          </p>
          <div className={styles.unauthActions}>
            <Link href={`/login?callbackUrl=/jobs/${job._id}`}>
              <Button variant="primary">Log in</Button>
            </Link>
            <Link href="/register">
              <Button variant="secondary">Create Account</Button>
            </Link>
          </div>
        </div>
      ) : session.user.role !== 'jobseeker' ? (
        <div className={styles.unauthBox}>
          <p className={styles.unauthText}>
            You are currently signed in as an <strong>{session.user.role}</strong>. Please sign in with a Job Seeker account to apply.
          </p>
        </div>
      ) : step === 1 ? (
        <form onSubmit={handleProceedToConfirm} className={styles.form}>
          {error && (
            <div className={styles.errorBanner}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Resume Choice */}
          <div className={styles.section}>
            <label className={styles.sectionLabel}>Select Resume</label>
            <div className={styles.resumeOptions}>
              {profile?.resumeUrl && (
                <label
                  className={`${styles.resumeOptionCard} ${
                    resumeType === 'profile' ? styles.optionActive : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="resumeType"
                    checked={resumeType === 'profile'}
                    onChange={() => setResumeType('profile')}
                    className={styles.radioInput}
                  />
                  <FileText className={styles.optionIcon} size={22} />
                  <div className={styles.optionInfo}>
                    <span className={styles.optionTitle}>Use Profile Resume</span>
                    <span className={styles.optionMeta}>
                      {profile.resumeName || 'Saved in profile'}
                    </span>
                  </div>
                </label>
              )}

              <label
                className={`${styles.resumeOptionCard} ${
                  resumeType === 'upload' ? styles.optionActive : ''
                }`}
              >
                <input
                  type="radio"
                  name="resumeType"
                  checked={resumeType === 'upload'}
                  onChange={() => setResumeType('upload')}
                  className={styles.radioInput}
                />
                <UploadCloud className={styles.optionIcon} size={22} />
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>Upload New Resume</span>
                  <span className={styles.optionMeta}>PDF format (max 5MB)</span>
                </div>
              </label>
            </div>

            {resumeType === 'upload' && (
              <div className={styles.uploadBox}>
                <input
                  type="file"
                  id="resumeUploadInput"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className={styles.fileHidden}
                />
                <label htmlFor="resumeUploadInput" className={styles.uploadDropZone}>
                  <UploadCloud size={28} className={styles.dropZoneIcon} />
                  <span className={styles.dropZoneText}>
                    {uploadedResume ? uploadedResume.name : 'Click to select PDF or drag & drop'}
                  </span>
                  {uploadedResume && (
                    <span className={styles.dropZoneSize}>{uploadedResume.size}</span>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          <div className={styles.section}>
            <div className={styles.labelWithCounter}>
              <label className={styles.sectionLabel}>
                Cover Note <span className={styles.optionalText}>(optional)</span>
              </label>
              <span className={styles.charCounter}>{coverLetter.length} / 2000</span>
            </div>
            <textarea
              className={styles.textarea}
              rows={4}
              maxLength={2000}
              placeholder="Share what excites you about this role and how your strengths align..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
            />
          </div>

          <div className={styles.footerBtns}>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Review & Continue
            </Button>
          </div>
        </form>
      ) : step === 2 ? (
        <div className={styles.confirmBox}>
          <div className={styles.confirmHeader}>
            <FileCheck size={28} className={styles.confirmIcon} />
            <div>
              <h4 className={styles.confirmTitle}>Confirm Submission</h4>
              <p className={styles.confirmSubtitle}>
                You are submitting your application to {job.company?.name || 'the employer'}.
              </p>
            </div>
          </div>

          <div className={styles.summaryList}>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Applicant:</span>
              <span className={styles.summaryVal}>{session.user.name} ({session.user.email})</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Position:</span>
              <span className={styles.summaryVal}>{job.title}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Resume:</span>
              <span className={styles.summaryVal}>
                {resumeType === 'profile'
                  ? profile?.resumeName || 'Profile Resume'
                  : uploadedResume?.name}
              </span>
            </div>
            {coverLetter && (
              <div className={styles.summaryCoverBox}>
                <span className={styles.summaryLabel}>Cover Note:</span>
                <p className={styles.summaryCoverText}>"{coverLetter}"</p>
              </div>
            )}
          </div>

          <div className={styles.footerBtns}>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep(1)}
              disabled={submitting}
            >
              Back to edit
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmitApplication}
              loading={submitting}
            >
              Confirm & Submit 🌱
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.successBox}>
          <div className={styles.successAnimation}>
            <div className={styles.successRing}>
              <CheckCircle2 size={48} className={styles.checkIcon} />
            </div>
          </div>
          <h3 className={styles.successTitle}>Application Delivered!</h3>
          <p className={styles.successDesc}>
            Nice! Your application is on its way to {job.company?.name || 'the team'}. You can track its live status in your candidate dashboard.
          </p>
          <div className={styles.successActions}>
            <Link href="/dashboard/seeker/applications">
              <Button variant="primary">View My Applications</Button>
            </Link>
            <Button variant="ghost" onClick={onClose}>
              Back to Browse
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
