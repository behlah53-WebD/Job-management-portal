'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import StickyActionBar from '@/components/ui/mobile/StickyActionBar';
import {
  Building,
  Globe,
  MapPin,
  Users,
  CheckCircle2,
  Save,
  ChevronDown,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './company.module.css';

const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];
const INDUSTRIES = [
  'Healthcare & Biotech',
  'Enterprise Software',
  'Digital Design & Branding',
  'Artificial Intelligence',
  'FinTech',
  'CleanTech & Renewables',
  'E-commerce & Retail',
  'Education',
];

export default function EmployerCompanyProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    industry: 'Enterprise Software',
    size: '11-50',
    website: '',
    location: '',
    about: '',
    logo: '',
    isVerified: true,
  });
  const [initialData, setInitialData] = useState(null);

  // Mobile collapsible sections
  const [openSections, setOpenSections] = useState({
    basics: true,
    presence: true,
    about: true,
  });

  const toggleSection = (sectionKey) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey],
    }));
  };

  useEffect(() => {
    fetch('/api/companies?mine=true')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const loaded = {
            name: data.name || '',
            industry: data.industry || 'Enterprise Software',
            size: data.size || '11-50',
            website: data.website || '',
            location: data.location || 'Bengaluru, India',
            about: data.about || '',
            logo: data.logo || '',
            isVerified: data.isVerified !== false,
          };
          setFormData(loaded);
          setInitialData(loaded);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const isDirty =
    initialData !== null && JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleDiscard = () => {
    if (initialData) {
      setFormData(initialData);
      toast('Changes discarded', { icon: '↩️' });
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update company');
      setInitialData(formData);
      toast.success('Company profile updated successfully 🌿');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const initials = formData.name
    ? formData.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CO';

  return (
    <>
      {/* =========================================================================
          1. DESKTOP VIEW (>= 1024px)
          100% pixel-identical to original desktop layout.
         ========================================================================= */}
      <div className={styles.desktopView}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Company Brand Profile</h1>
              <p className={styles.subtitle}>
                Your public organization profile and verified details shown to candidates.
              </p>
            </div>
          </div>

          <Card padding="large" className={styles.card}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.topStatusRow}>
                <div className={styles.brandTitleGroup}>
                  <h3 className={styles.brandTitle}>{formData.name || 'Organization Name'}</h3>
                  {formData.isVerified && <Badge variant="verified">Verified Employer</Badge>}
                </div>
                <Button type="submit" variant="primary" loading={saving} icon={Save}>
                  Save Changes
                </Button>
              </div>

              <div className={styles.formGrid}>
                <Input
                  label="Organization Name"
                  required
                  placeholder="e.g. Acme Flora Labs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />

                <Select
                  label="Primary Industry"
                  options={INDUSTRIES}
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                />

                <Select
                  label="Company Size"
                  options={SIZES}
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                />

                <Input
                  label="Headquarters Location"
                  icon={MapPin}
                  placeholder="e.g. Bengaluru, India or Remote"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />

                <Input
                  label="Website URL"
                  icon={Globe}
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />

                <Input
                  label="Logo Image URL"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.logo}
                  onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  helperText="Provide a high-res square logo image URL."
                />
              </div>

              <div className={styles.aboutGroup}>
                <label className={styles.label}>About Company Mission & Culture</label>
                <textarea
                  rows={5}
                  className={styles.textarea}
                  placeholder="Describe your organization's mission, values, work rhythm, and culture..."
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                />
              </div>
            </form>
          </Card>
        </div>
      </div>

      {/* =========================================================================
          2. MOBILE VIEW (< 1024px)
          Native-feeling, grouped collapsible sections, 52px touch inputs,
          live thumbnail preview, and dirty-state StickyActionBar.
         ========================================================================= */}
      <div className={styles.mobileView}>
        {/* 2.1 Header Card */}
        <div className={styles.mobileHeaderCard}>
          <div className={styles.mobileAvatar}>
            {formData.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={formData.logo}
                alt={formData.name || 'Company Logo'}
                className={styles.mobileAvatarImg}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          <div className={styles.mobileBrandMeta}>
            <div className={styles.mobileBrandNameRow}>
              <h2 className={styles.mobileBrandName}>{formData.name || 'Organization Name'}</h2>
              {formData.isVerified && <Badge variant="verified">Verified</Badge>}
            </div>
            <p className={styles.mobileBrandSubline}>
              {formData.industry} · {formData.location || 'Remote'}
            </p>
          </div>
        </div>

        {/* 2.2 Section 1: Basics */}
        <div className={styles.mobileSectionCard}>
          <button
            type="button"
            className={styles.mobileSectionHeaderBtn}
            onClick={() => toggleSection('basics')}
            aria-expanded={openSections.basics}
          >
            <div className={styles.mobileSectionTitleRow}>
              <div className={styles.mobileSectionIconWrapper}>
                <Building size={17} />
              </div>
              <h3 className={styles.mobileSectionTitle}>Basics</h3>
            </div>
            <ChevronDown
              size={18}
              className={`${styles.mobileSectionChevron} ${
                openSections.basics ? styles.mobileSectionChevronRotated : ''
              }`}
            />
          </button>

          {openSections.basics && (
            <div className={styles.mobileSectionBody}>
              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>
                  Organization Name
                  <span className={styles.mobileFieldRequired}>*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Flora Labs"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.mobileInput}
                />
              </div>

              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>Primary Industry</label>
                <select
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  className={styles.mobileSelect}
                >
                  {INDUSTRIES.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>Company Size (Team members)</label>
                <div className={styles.mobileChipGroup}>
                  {SIZES.map((sizeOption) => {
                    const isActive = formData.size === sizeOption;
                    return (
                      <button
                        key={sizeOption}
                        type="button"
                        className={`${styles.mobileChipBtn} ${
                          isActive ? styles.mobileChipBtnActive : ''
                        }`}
                        onClick={() => setFormData({ ...formData, size: sizeOption })}
                      >
                        {sizeOption}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>Headquarters Location</label>
                <div className={styles.mobileInputWithIconWrapper}>
                  <MapPin size={18} className={styles.mobileFieldIcon} />
                  <input
                    type="text"
                    placeholder="e.g. Bengaluru, India or Remote"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={styles.mobileInputWithIcon}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2.3 Section 2: Online Presence */}
        <div className={styles.mobileSectionCard}>
          <button
            type="button"
            className={styles.mobileSectionHeaderBtn}
            onClick={() => toggleSection('presence')}
            aria-expanded={openSections.presence}
          >
            <div className={styles.mobileSectionTitleRow}>
              <div className={styles.mobileSectionIconWrapper}>
                <Globe size={17} />
              </div>
              <h3 className={styles.mobileSectionTitle}>Online Presence</h3>
            </div>
            <ChevronDown
              size={18}
              className={`${styles.mobileSectionChevron} ${
                openSections.presence ? styles.mobileSectionChevronRotated : ''
              }`}
            />
          </button>

          {openSections.presence && (
            <div className={styles.mobileSectionBody}>
              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>Website URL</label>
                <div className={styles.mobileInputWithIconWrapper}>
                  <Globe size={18} className={styles.mobileFieldIcon} />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className={styles.mobileInputWithIcon}
                  />
                </div>
              </div>

              <div className={styles.mobileFieldGroup}>
                <label className={styles.mobileFieldLabel}>Logo Image URL</label>
                <div className={styles.mobileLogoRow}>
                  <div className={styles.mobileLogoThumb}>
                    {formData.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.logo}
                        alt="Preview"
                        className={styles.mobileLogoThumbImg}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                    className={styles.mobileInput}
                  />
                </div>
                <span className={styles.mobileFieldHelper}>
                  Provide a square, high-resolution logo link.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 2.4 Section 3: About & Culture */}
        <div className={styles.mobileSectionCard}>
          <button
            type="button"
            className={styles.mobileSectionHeaderBtn}
            onClick={() => toggleSection('about')}
            aria-expanded={openSections.about}
          >
            <div className={styles.mobileSectionTitleRow}>
              <div className={styles.mobileSectionIconWrapper}>
                <Sparkles size={17} />
              </div>
              <h3 className={styles.mobileSectionTitle}>About & Culture</h3>
            </div>
            <ChevronDown
              size={18}
              className={`${styles.mobileSectionChevron} ${
                openSections.about ? styles.mobileSectionChevronRotated : ''
              }`}
            />
          </button>

          {openSections.about && (
            <div className={styles.mobileSectionBody}>
              <div className={styles.mobileTextareaWrapper}>
                <label className={styles.mobileFieldLabel}>
                  Company Mission, Values & Culture
                </label>
                <textarea
                  className={styles.mobileTextarea}
                  placeholder="Describe your organization's mission, values, work rhythm, and culture..."
                  value={formData.about}
                  onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                  maxLength={1000}
                />
                <div className={styles.mobileCharCounter}>
                  {(formData.about || '').length} / 1000 characters
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2.5 Sticky Bottom Action Bar (Appears when dirty) */}
        <StickyActionBar visible={isDirty}>
          <div className={styles.stickyActionBtns}>
            <Button
              type="button"
              variant="secondary"
              onClick={handleDiscard}
              className={styles.discardBtn}
              icon={RotateCcw}
            >
              Discard
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              loading={saving}
              className={styles.saveBtn}
              icon={Save}
            >
              Save Changes 🌿
            </Button>
          </div>
        </StickyActionBar>
      </div>
    </>
  );
}
