'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Stepper from '@/components/ui/Stepper';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Chip from '@/components/ui/Chip';
import JobCard from '@/components/jobs/JobCard';
import {
  Briefcase,
  Layers,
  IndianRupee,
  Eye,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './postJob.module.css';

const CATEGORIES = [
  'Software Engineering',
  'Product & Design',
  'Marketing & Growth',
  'Sales & BD',
  'Data & AI',
  'Finance & Legal',
  'People & HR',
  'Customer Experience',
];

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const EXP_LEVELS = ['Fresher', '1-3', '3-5', '5+'];

export default function PostJobWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data.map((c) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Software Engineering',
    jobType: 'Full-time',
    workMode: 'Remote',
    location: '',
    description: '',
    responsibilities: [],
    requirements: [],
    skills: [],
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'INR',
    salaryType: 'yearly',
    experienceLevel: '3-5',
    openings: 1,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Temporary inputs for lists
  const [newResp, setNewResp] = useState('');
  const [newReq, setNewReq] = useState('');
  const [newSkill, setNewSkill] = useState('');

  const steps = [
    { title: 'Basics', subtitle: 'Role & location' },
    { title: 'Details', subtitle: 'Craft & skills' },
    { title: 'Compensation', subtitle: 'Bands & dates' },
    { title: 'Preview & Launch', subtitle: 'Final review' },
  ];

  const handleAddResponsibility = (e) => {
    e.preventDefault();
    if (!newResp.trim()) return;
    setFormData({
      ...formData,
      responsibilities: [...formData.responsibilities, newResp.trim()],
    });
    setNewResp('');
  };

  const handleRemoveResponsibility = (idx) => {
    setFormData({
      ...formData,
      responsibilities: formData.responsibilities.filter((_, i) => i !== idx),
    });
  };

  const handleAddRequirement = (e) => {
    e.preventDefault();
    if (!newReq.trim()) return;
    setFormData({
      ...formData,
      requirements: [...formData.requirements, newReq.trim()],
    });
    setNewReq('');
  };

  const handleRemoveRequirement = (idx) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== idx),
    });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    if (formData.skills.includes(newSkill.trim())) {
      toast('Skill already added!');
      return;
    }
    setFormData({
      ...formData,
      skills: [...formData.skills, newSkill.trim()],
    });
    setNewSkill('');
  };

  const handleRemoveSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Please provide a job title');
        return;
      }
      if (!formData.location.trim()) {
        toast.error('Please provide a location');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.description.trim().length < 20) {
        toast.error('Please enter a description with at least 20 characters');
        return;
      }
      if (formData.skills.length === 0) {
        toast.error('Please add at least 1 skill');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handlePublish = async (status = 'Active') => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to post job');

      toast.success(data.message || 'Job posted successfully! 🌿');
      router.push('/dashboard/employer/my-jobs');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock job object for Live Preview Card
  const previewJob = {
    _id: 'preview-sample',
    title: formData.title || 'Senior Full Stack Engineer',
    company: {
      name: 'Your Organization',
      location: formData.location || 'Remote',
      isVerified: true,
    },
    category: formData.category,
    jobType: formData.jobType,
    workMode: formData.workMode,
    location: formData.location,
    salaryMin: Number(formData.salaryMin),
    salaryMax: Number(formData.salaryMax),
    salaryCurrency: formData.salaryCurrency,
    salaryType: formData.salaryType,
    experienceLevel: formData.experienceLevel,
    skills: formData.skills,
    createdAt: new Date().toISOString(),
    isFeatured: true,
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Post a New Opportunity</h1>
          <p className={styles.subtitle}>
            Create an intentional, dignified job listing in 4 calm steps.
          </p>
        </div>
      </div>

      <Stepper steps={steps} currentStep={currentStep} />

      <div className={styles.wizardLayout}>
        {/* Left Form Card (60%) */}
        <Card padding="large" className={styles.formCard}>
          {/* STEP 1: BASICS */}
          {currentStep === 1 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepHeader}>Step 1: Role Basics</h3>
              <Input
                label="Job Title"
                required
                placeholder="e.g. Lead Frontend Architect"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                helperText="Use clear industry-standard titles without buzzwords (no 'Ninjas' or 'Rockstars')."
              />

              <div className={styles.formGridTwo}>
                <Select
                  label="Craft / Category"
                  required
                  options={categories}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
                <Select
                  label="Employment Type"
                  required
                  options={JOB_TYPES}
                  value={formData.jobType}
                  onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
                />
              </div>

              <div className={styles.formGridTwo}>
                <Select
                  label="Work Mode"
                  required
                  options={WORK_MODES}
                  value={formData.workMode}
                  onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
                />
                <Input
                  label="Location"
                  required
                  placeholder="e.g. Remote, Bengaluru, or Hybrid"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS */}
          {currentStep === 2 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepHeader}>Step 2: Role Details & Craft</h3>

              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Job Description <span className={styles.required}>*</span>
                </label>
                <textarea
                  rows={5}
                  className={styles.textarea}
                  placeholder="Describe your team mission, what success looks like in this role, and the environment candidates will join..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* Responsibilities list */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Key Responsibilities</label>
                <div className={styles.addInlineRow}>
                  <input
                    type="text"
                    placeholder="Add a core duty..."
                    value={newResp}
                    onChange={(e) => setNewResp(e.target.value)}
                    className={styles.inlineInput}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddResponsibility}>
                    Add
                  </Button>
                </div>
                <div className={styles.itemsList}>
                  {formData.responsibilities.map((resp, i) => (
                    <div key={i} className={styles.listItem}>
                      <span>{resp}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveResponsibility(i)}
                        className={styles.removeIconBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Qualifications list */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Qualifications & Experience</label>
                <div className={styles.addInlineRow}>
                  <input
                    type="text"
                    placeholder="Add a qualification..."
                    value={newReq}
                    onChange={(e) => setNewReq(e.target.value)}
                    className={styles.inlineInput}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddRequirement}>
                    Add
                  </Button>
                </div>
                <div className={styles.itemsList}>
                  {formData.requirements.map((req, i) => (
                    <div key={i} className={styles.listItem}>
                      <span>{req}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveRequirement(i)}
                        className={styles.removeIconBtn}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skills Chips */}
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Skills & Tech Stack</label>
                <div className={styles.addInlineRow}>
                  <input
                    type="text"
                    placeholder="Add skill tag (e.g. Next.js, Figma, SQL)..."
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    className={styles.inlineInput}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={handleAddSkill}>
                    Add Tag
                  </Button>
                </div>
                <div className={styles.chipsRow}>
                  {formData.skills.map((skill) => (
                    <Chip key={skill} size="md" removable onRemove={() => handleRemoveSkill(skill)}>
                      {skill}
                    </Chip>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: COMPENSATION */}
          {currentStep === 3 && (
            <div className={styles.stepContent}>
              <h3 className={styles.stepHeader}>Step 3: Compensation & Timeline</h3>

              <div className={styles.formGridTwo}>
                <Select
                  label="Compensation Period"
                  options={[
                    { value: 'yearly', label: 'Yearly Salary (LPA)' },
                    { value: 'monthly', label: 'Monthly' },
                    { value: 'stipend', label: 'Stipend (Internship)' },
                  ]}
                  value={formData.salaryType}
                  onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                />
                <Select
                  label="Experience Level"
                  options={EXP_LEVELS}
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                />
              </div>

              <div className={styles.formGridTwo}>
                <Input
                  label="Minimum (INR)"
                  type="number"
                  required
                  placeholder="e.g. 1800000"
                  value={formData.salaryMin}
                  onChange={(e) => setFormData({ ...formData, salaryMin: e.target.value })}
                  helperText="₹18 LPA"
                />
                <Input
                  label="Maximum (INR)"
                  type="number"
                  required
                  placeholder="e.g. 2800000"
                  value={formData.salaryMax}
                  onChange={(e) => setFormData({ ...formData, salaryMax: e.target.value })}
                  helperText="₹28 LPA"
                />
              </div>

              <div className={styles.formGridTwo}>
                <Input
                  label="Openings Available"
                  type="number"
                  required
                  min={1}
                  value={formData.openings}
                  onChange={(e) => setFormData({ ...formData, openings: e.target.value })}
                />
                <Input
                  label="Application Deadline"
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & LAUNCH */}
          {currentStep === 4 && (
            <div className={styles.stepContent}>
              <div className={styles.previewSuccessBanner}>
                <Sparkles size={22} className={styles.sparkle} />
                <div>
                  <h4 className={styles.bannerTitle}>Your listing is ready to bloom!</h4>
                  <p className={styles.bannerSub}>
                    Review your parameters below and launch whenever you are ready.
                  </p>
                </div>
              </div>

              <div className={styles.summaryTable}>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Job Title:</span>
                  <span className={styles.sumVal}>{formData.title}</span>
                </div>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Category:</span>
                  <span className={styles.sumVal}>{formData.category}</span>
                </div>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Type & Mode:</span>
                  <span className={styles.sumVal}>{formData.jobType} • {formData.workMode}</span>
                </div>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Location:</span>
                  <span className={styles.sumVal}>{formData.location}</span>
                </div>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Compensation:</span>
                  <span className={styles.sumVal}>
                    ₹{(formData.salaryMin / 100000).toFixed(0)} - {(formData.salaryMax / 100000).toFixed(0)} LPA
                  </span>
                </div>
                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Deadline:</span>
                  <span className={styles.sumVal}>{new Date(formData.deadline).toLocaleDateString()}</span>
                </div>
              </div>

              <div className={styles.launchButtons}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handlePublish('Active')}
                  loading={submitting}
                >
                  Publish Role Now 🌿
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => handlePublish('Draft')}
                  loading={submitting}
                >
                  Save as Draft
                </Button>
              </div>
            </div>
          )}

          {/* Step Navigation Footer */}
          <div className={styles.stepFooter}>
            {currentStep > 1 && (
              <Button variant="ghost" size="md" icon={ArrowLeft} onClick={handlePrev}>
                Back
              </Button>
            )}
            <div style={{ marginLeft: 'auto' }}>
              {currentStep < 4 && (
                <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right" onClick={handleNext}>
                  Continue
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Right Live Preview Card (40%) */}
        <div className={styles.previewSidebar}>
          <div className={styles.previewSticky}>
            <div className={styles.previewHeader}>
              <Eye size={16} />
              <span>Live Job Card Preview</span>
            </div>
            <JobCard job={previewJob} />
            <p className={styles.previewNote}>
              This is how your posting appears to candidates on search pages and feeds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
