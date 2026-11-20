'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Badge from '@/components/ui/Badge';
import { Building, Globe, MapPin, Users, CheckCircle2, Save } from 'lucide-react';
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

  useEffect(() => {
    fetch('/api/companies?mine=true')
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setFormData({
            name: data.name || '',
            industry: data.industry || 'Enterprise Software',
            size: data.size || '11-50',
            website: data.website || '',
            location: data.location || 'Bengaluru, India',
            about: data.about || '',
            logo: data.logo || '',
            isVerified: data.isVerified !== false,
          });
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/companies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update company');
      toast.success('Company profile updated successfully 🌿');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
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
  );
}
