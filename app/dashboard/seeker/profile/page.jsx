'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Chip from '@/components/ui/Chip';
import Modal from '@/components/ui/Modal';
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  UploadCloud,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import styles from './profile.module.css';

export default function SeekerProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // New skill input
  const [newSkill, setNewSkill] = useState('');

  // Experience modal
  const [expModalOpen, setExpModalOpen] = useState(false);
  const [expForm, setExpForm] = useState({ title: '', company: '', from: '', to: '', description: '' });

  // Education modal
  const [eduModalOpen, setEduModalOpen] = useState(false);
  const [eduForm, setEduForm] = useState({ degree: '', institute: '', year: '' });

  useEffect(() => {
    fetch('/api/users/profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) setUser(data.user);
        if (data?.profile) setProfile(data.profile);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const saveProfileUpdate = async (updatedFields) => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Failed to update profile');
      toast.success('Profile updated with care 🌿');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    const currentSkills = profile?.skills || [];
    if (currentSkills.includes(newSkill.trim())) {
      toast('Skill already added!');
      return;
    }
    const updatedSkills = [...currentSkills, newSkill.trim()];
    setProfile({ ...profile, skills: updatedSkills });
    setNewSkill('');
    saveProfileUpdate({ skills: updatedSkills });
  };

  const handleRemoveSkill = (skillToRemove) => {
    const updatedSkills = (profile?.skills || []).filter((s) => s !== skillToRemove);
    setProfile({ ...profile, skills: updatedSkills });
    saveProfileUpdate({ skills: updatedSkills });
  };

  const handleSaveExperience = (e) => {
    e.preventDefault();
    const updatedExp = [expForm, ...(profile?.experience || [])];
    setProfile({ ...profile, experience: updatedExp });
    saveProfileUpdate({ experience: updatedExp });
    setExpModalOpen(false);
    setExpForm({ title: '', company: '', from: '', to: '', description: '' });
  };

  const handleSaveEducation = (e) => {
    e.preventDefault();
    const updatedEdu = [eduForm, ...(profile?.education || [])];
    setProfile({ ...profile, education: updatedEdu });
    saveProfileUpdate({ education: updatedEdu });
    setEduModalOpen(false);
    setEduForm({ degree: '', institute: '', year: '' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported.');
      return;
    }

    const fakeUrl = URL.createObjectURL(file);
    const updated = {
      ...profile,
      resumeUrl: fakeUrl,
      resumeName: file.name,
    };
    setProfile(updated);
    saveProfileUpdate({ resumeUrl: fakeUrl, resumeName: file.name });
    toast.success('Resume uploaded successfully 🌱');
  };

  if (loading) {
    return <div className={styles.loadingBox}>Loading profile details...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Cover Banner */}
      <div className={styles.coverStrip}>
        <div className={styles.coverPattern} />
      </div>

      {/* Profile Header Bar */}
      <div className={styles.headerBar}>
        <div className={styles.avatarWrapper}>
          <div className={styles.avatar}>
            {getInitials(user?.name || session?.user?.name)}
          </div>
          <button
            type="button"
            className={styles.avatarEditBtn}
            onClick={() => toast('Avatar upload enabled in production! 🌱')}
            aria-label="Change photo"
          >
            <Camera size={16} />
          </button>
        </div>

        <div className={styles.userMainMeta}>
          <div className={styles.nameRow}>
            <h1 className={styles.userName}>{user?.name || session?.user?.name}</h1>
            <span className={styles.roleBadge}>Job Seeker</span>
          </div>
          <p className={styles.userHeadline}>
            {profile?.headline || 'Add your professional headline (e.g. Senior Frontend Engineer)'}
          </p>
          <div className={styles.metaRow}>
            <span className={styles.metaItem}>
              <Mail size={14} /> {user?.email || session?.user?.email}
            </span>
            <span className={styles.metaItem}>
              <MapPin size={14} /> {user?.location || 'Bengaluru, India'}
            </span>
          </div>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={Edit2}
          className={styles.editHeadlineBtn}
          onClick={() => {
            const headline = prompt('Enter your headline:', profile?.headline || '');
            if (headline !== null) {
              setProfile({ ...profile, headline });
              saveProfileUpdate({ headline });
            }
          }}
        >
          Edit Headline
        </Button>
      </div>

      <div className={styles.grid}>
        {/* Left Column (2/3) */}
        <div className={styles.leftCol}>
          {/* About Section */}
          <Card padding="large" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>About Me</h3>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => {
                  const about = prompt('Update about me bio:', profile?.about || '');
                  if (about !== null) {
                    setProfile({ ...profile, about });
                    saveProfileUpdate({ about });
                  }
                }}
              >
                <Edit2 size={16} />
              </button>
            </div>
            <p className={styles.aboutText}>
              {profile?.about ||
                'Tell employers what drives you, your core strengths, and what kind of work brings you joy.'}
            </p>
          </Card>

          {/* Skills Section */}
          <Card padding="large" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Skills & Competencies</h3>
            </div>
            <form onSubmit={handleAddSkill} className={styles.addSkillForm}>
              <Input
                placeholder="Type a skill (e.g. Next.js, Figma, Python) and press Enter..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
              />
              <Button type="submit" variant="secondary" size="md" icon={Plus}>
                Add
              </Button>
            </form>

            <div className={styles.skillsWrapper}>
              {(profile?.skills || []).map((skill) => (
                <Chip
                  key={skill}
                  size="md"
                  removable
                  onRemove={() => handleRemoveSkill(skill)}
                >
                  {skill}
                </Chip>
              ))}
            </div>
          </Card>

          {/* Experience Section */}
          <Card padding="large" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Work Experience</h3>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setExpModalOpen(true)}
              >
                Add Experience
              </Button>
            </div>

            <div className={styles.timelineList}>
              {(profile?.experience || []).length === 0 ? (
                <p className={styles.emptyNotice}>No work experience added yet.</p>
              ) : (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className={styles.expItem}>
                    <div className={styles.expDot} />
                    <div className={styles.expContent}>
                      <h4 className={styles.expTitle}>{exp.title}</h4>
                      <span className={styles.expCompany}>
                        {exp.company} • {exp.from} - {exp.to || 'Present'}
                      </span>
                      {exp.description && (
                        <p className={styles.expDesc}>{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Education Section */}
          <Card padding="large" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Education</h3>
              <Button
                variant="secondary"
                size="sm"
                icon={Plus}
                onClick={() => setEduModalOpen(true)}
              >
                Add Degree
              </Button>
            </div>

            <div className={styles.eduList}>
              {(profile?.education || []).length === 0 ? (
                <p className={styles.emptyNotice}>No education records listed.</p>
              ) : (
                profile.education.map((edu, idx) => (
                  <div key={idx} className={styles.eduItem}>
                    <GraduationCap className={styles.eduIcon} size={22} />
                    <div>
                      <h4 className={styles.eduDegree}>{edu.degree}</h4>
                      <span className={styles.eduInstitute}>
                        {edu.institute} • Class of {edu.year}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (1/3) */}
        <div className={styles.rightCol}>
          {/* Resume Upload Card */}
          <Card padding="normal" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Attached Resume</h3>
            </div>

            {profile?.resumeUrl ? (
              <div className={styles.resumePreviewBox}>
                <FileText size={32} className={styles.resumeIcon} />
                <div className={styles.resumeInfo}>
                  <span className={styles.resumeName}>
                    {profile.resumeName || 'Candidate_Resume.pdf'}
                  </span>
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.resumeViewLink}
                  >
                    View Document <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            ) : (
              <p className={styles.emptyNotice}>No resume uploaded yet.</p>
            )}

            <div className={styles.uploadZone}>
              <input
                type="file"
                id="profileResumeUpload"
                accept=".pdf"
                onChange={handleFileUpload}
                className={styles.fileHidden}
              />
              <label htmlFor="profileResumeUpload" className={styles.uploadLabel}>
                <UploadCloud size={20} />
                <span>Upload New PDF Resume (max 5MB)</span>
              </label>
            </div>
          </Card>

          {/* Links Card */}
          <Card padding="normal" className={styles.card}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Portfolio & Profiles</h3>
            </div>
            <div className={styles.linksList}>
              <div className={styles.linkItem}>
                <span className={styles.linkName}>GitHub</span>
                <span className={styles.linkUrl}>
                  {profile?.links?.github || 'Not provided'}
                </span>
              </div>
              <div className={styles.linkItem}>
                <span className={styles.linkName}>LinkedIn</span>
                <span className={styles.linkUrl}>
                  {profile?.links?.linkedin || 'Not provided'}
                </span>
              </div>
              <div className={styles.linkItem}>
                <span className={styles.linkName}>Portfolio</span>
                <span className={styles.linkUrl}>
                  {profile?.links?.portfolio || 'Not provided'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Experience Modal */}
      <Modal
        isOpen={expModalOpen}
        onClose={() => setExpModalOpen(false)}
        title="Add Experience"
        subtitle="Share your previous impact and responsibilities."
      >
        <form onSubmit={handleSaveExperience} className={styles.modalForm}>
          <Input
            label="Job Title"
            required
            placeholder="e.g. Senior Frontend Engineer"
            value={expForm.title}
            onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
          />
          <Input
            label="Company"
            required
            placeholder="e.g. Acme Botanical Systems"
            value={expForm.company}
            onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
          />
          <div className={styles.dateRow}>
            <Input
              label="From Year"
              required
              placeholder="e.g. 2021"
              value={expForm.from}
              onChange={(e) => setExpForm({ ...expForm, from: e.target.value })}
            />
            <Input
              label="To Year"
              placeholder="Present"
              value={expForm.to}
              onChange={(e) => setExpForm({ ...expForm, to: e.target.value })}
            />
          </div>
          <div className={styles.descField}>
            <label className={styles.formLabel}>Summary of Achievements</label>
            <textarea
              rows={3}
              className={styles.textarea}
              placeholder="Key accomplishments, tools used, and systems built..."
              value={expForm.description}
              onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
            />
          </div>
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setExpModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Experience
            </Button>
          </div>
        </form>
      </Modal>

      {/* Add Education Modal */}
      <Modal
        isOpen={eduModalOpen}
        onClose={() => setEduModalOpen(false)}
        title="Add Education"
        subtitle="Degree or certification."
      >
        <form onSubmit={handleSaveEducation} className={styles.modalForm}>
          <Input
            label="Degree or Program"
            required
            placeholder="e.g. B.Tech in Computer Science"
            value={eduForm.degree}
            onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
          />
          <Input
            label="Institute or University"
            required
            placeholder="e.g. NIT Karnataka"
            value={eduForm.institute}
            onChange={(e) => setEduForm({ ...eduForm, institute: e.target.value })}
          />
          <Input
            label="Graduation Year"
            required
            placeholder="e.g. 2020"
            value={eduForm.year}
            onChange={(e) => setEduForm({ ...eduForm, year: e.target.value })}
          />
          <div className={styles.modalActions}>
            <Button type="button" variant="ghost" onClick={() => setEduModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Education
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
