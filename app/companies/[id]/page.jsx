import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/jobs/JobCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getCompanies, getCompanyById, getJobs } from '@/lib/dataService';
import dbConnect from '@/lib/dbConnect';
import Job from '@/models/Job';
import { MapPin, Users, Globe, ExternalLink, ArrowLeft, CheckCircle2, Briefcase } from 'lucide-react';
import styles from '../companies.module.css';

export const revalidate = 180;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const companies = await getCompanies(30);
    return (companies || []).map((comp) => ({
      id: comp._id.toString(),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  let company = null;
  try {
    company = await getCompanyById(resolvedParams.id);
  } catch {}

  if (!company) {
    return { title: 'Company Not Found — Verdant' };
  }
  return {
    title: `${company.name} — Careers & Team at Verdant`,
    description: company.about
      ? company.about.slice(0, 150)
      : `Explore verified opportunities and studio culture at ${company.name}.`,
  };
}

export default async function CompanyDetailPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  let company = null;
  try {
    company = await getCompanyById(resolvedParams.id);
  } catch {}

  if (!company) {
    notFound();
  }

  await dbConnect();
  const openRoles = await Job.find({ company: company._id, status: 'Active' })
    .populate({
      path: 'company',
      select: 'name logo location isVerified industry size website',
    })
    .sort({ createdAt: -1 })
    .lean();

  const plainRoles = JSON.parse(JSON.stringify(openRoles));

  return (
    <div className={styles.page}>
      <Navbar />

      <main className="container" style={{ paddingTop: '36px', paddingBottom: '96px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <Link href="/companies" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--green-700)', fontSize: '14px', fontWeight: 600 }}>
            <ArrowLeft size={16} />
            <span>Back to Companies</span>
          </Link>
        </div>

        <Card padding="large" style={{ marginBottom: '36px' }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: '#e3f4e9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
              {company.logo ? (
                <Image src={company.logo} alt={company.name} width={80} height={80} style={{ objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '32px', fontFamily: 'var(--font-serif)', color: 'var(--green-800)' }}>
                  {company.name?.[0] || 'C'}
                </span>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '260px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '32px', color: 'var(--green-900)', margin: 0 }}>
                  {company.name}
                </h1>
                {company.isVerified && (
                  <span title="Verified Company" style={{ color: 'var(--green-600)', display: 'inline-flex' }}>
                    <CheckCircle2 size={20} />
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '16px', color: 'var(--text-muted)', fontSize: '14px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Briefcase size={15} />
                  <span>{company.industry || 'Technology'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={15} />
                  <span>{company.location || 'Remote'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={15} />
                  <span>{company.size || '11-50'} members</span>
                </div>
              </div>

              {company.about && (
                <p style={{ fontSize: '15px', color: '#2c3e35', lineHeight: 1.6, maxWidth: '780px' }}>
                  {company.about}
                </p>
              )}
            </div>

            {company.website && (
              <a href={company.website} target="_blank" rel="noreferrer">
                <Button variant="secondary" size="sm">
                  <span>Visit Website</span>
                  <ExternalLink size={14} style={{ marginLeft: '6px' }} />
                </Button>
              </a>
            )}
          </div>
        </Card>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '24px', color: 'var(--green-900)', margin: 0 }}>
              Open Roles at {company.name} ({plainRoles.length})
            </h2>
          </div>

          {plainRoles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: '#fff', border: '1px solid #dcebe1', borderRadius: '16px' }}>
              <p style={{ fontSize: '15px', color: 'var(--text-muted)', margin: 0 }}>
                {company.name} does not have any publicly listed active positions right now. Check back soon 🌱
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {plainRoles.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
