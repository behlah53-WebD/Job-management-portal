import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobDetailsClient from './JobDetailsClient';
import { getJobById, getJobs } from '@/lib/dataService';
import { getInitials, formatSalary, timeAgo } from '@/lib/utils';
import styles from './jobDetails.module.css';

export const revalidate = 120;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const { jobs } = await getJobs({ limit: 30, status: 'Active' });
    return (jobs || []).map((j) => ({
      id: j._id.toString(),
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  let job = null;
  try {
    job = await getJobById(resolvedParams.id);
  } catch {}

  if (!job) {
    return {
      title: 'Job Not Found — Verdant',
    };
  }

  const companyName = job.company?.name || 'Verdant Partner';
  return {
    title: `${job.title} at ${companyName} — Verdant`,
    description: `Apply for ${job.title} at ${companyName}. ${job.workMode} • ${job.location} • ${job.jobType}.`,
    openGraph: {
      title: `${job.title} — ${companyName}`,
      description: `Join ${companyName} as ${job.title}. Explore verified roles on Verdant.`,
    },
  };
}

export default async function JobDetailsPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  let job = null;
  try {
    job = await getJobById(resolvedParams.id);
  } catch {}

  if (!job) {
    notFound();
  }

  // Fetch similar jobs in the same category
  const { jobs: similarJobs } = await getJobs({
    category: job.category,
    limit: 4,
  });

  const filteredSimilar = similarJobs?.filter((j) => j._id?.toString() !== job._id?.toString()) || [];

  return (
    <div className={styles.page}>
      <Navbar />

      <main className="container" style={{ paddingTop: '32px', paddingBottom: '96px' }}>
        <JobDetailsClient job={job} similarJobs={filteredSimilar} />
      </main>

      <Footer />
    </div>
  );
}
