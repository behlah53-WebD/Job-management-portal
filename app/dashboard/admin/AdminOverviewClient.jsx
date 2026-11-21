'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Users,
  Building,
  Briefcase,
  FileCheck,
  CheckCircle,
  XCircle,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import styles from './adminOverview.module.css';

export default function AdminOverviewClient({ initialData = {} }) {
  const [stats] = useState(
    initialData.stats || {
      totalUsers: 0,
      totalEmployers: 0,
      totalJobs: 0,
      totalApplications: 0,
      pendingJobs: 0,
      pendingReports: 0,
      growth: [],
    }
  );
  const [pendingJobsList, setPendingJobsList] = useState(initialData.pendingJobsList || []);

  const handleApproveJob = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Active' }),
      });
      if (!res.ok) throw new Error('Failed to approve');
      setPendingJobsList((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job approved and published live 🌱');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRejectJob = async (jobId) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      if (!res.ok) throw new Error('Failed to reject');
      setPendingJobsList((prev) => prev.filter((j) => j._id !== jobId));
      toast.success('Job rejected');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Control Overview</h1>
          <p className={styles.subtitle}>
            Platform-wide metrics, approval queues, and operational health.
          </p>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className={styles.statsRow}>
        <StatCard
          label="Job Seekers"
          value={stats.totalUsers}
          icon={Users}
          trend={22}
          trendLabel="active this month"
          accentColor="green"
        />
        <StatCard
          label="Employers"
          value={stats.totalEmployers}
          icon={Building}
          trend={15}
          trendLabel="verified teams"
          accentColor="lime"
        />
        <StatCard
          label="Published Jobs"
          value={stats.totalJobs}
          icon={Briefcase}
          trend={34}
          trendLabel="openings"
          accentColor="green"
        />
        <StatCard
          label="Applications"
          value={stats.totalApplications}
          icon={FileCheck}
          trend={41}
          trendLabel="all-time applies"
          accentColor="sage"
        />
      </div>

      {/* Growth Chart */}
      <Card padding="large" className={styles.growthCard}>
        <div className={styles.growthHeader}>
          <div>
            <h3 className={styles.cardTitle}>Platform Candidate & Talent Growth</h3>
            <p className={styles.cardSubtitle}>Monthly registered users and active postings</p>
          </div>
          <div className={styles.chartLegend}>
            <span className={styles.legCand}>• Candidates</span>
            <span className={styles.legJobs}>• Jobs</span>
          </div>
        </div>

        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={stats.growth || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCandidates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1E9A56" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#1E9A56" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorJobs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8F169" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C8F169" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EC" />
              <XAxis dataKey="month" tick={{ fill: '#5E7A6B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5E7A6B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #DCEBE1',
                }}
              />
              <Area type="monotone" dataKey="candidates" stroke="#1E9A56" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCandidates)" isAnimationActive={false} />
              <Area type="monotone" dataKey="jobs" stroke="#A7DB34" strokeWidth={2} fillOpacity={1} fill="url(#colorJobs)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Two Column Lower Section */}
      <div className={styles.lowerGrid}>
        {/* Pending Approvals */}
        <Card padding="large" className={styles.pendingCard}>
          <div className={styles.pendingHeader}>
            <div>
              <h3 className={styles.cardTitle}>Listing Moderation Queue</h3>
              <p className={styles.cardSubtitle}>Roles requiring admin review before going live</p>
            </div>
            <Link href="/dashboard/admin/jobs">
              <Button variant="ghost" size="sm" icon={ArrowRight} iconPosition="right">
                All Jobs
              </Button>
            </Link>
          </div>

          <div className={styles.pendingList}>
            {pendingJobsList.map((job) => (
              <div key={job._id} className={styles.pendingItem}>
                <div className={styles.pendingMeta}>
                  <h4 className={styles.pendingJobTitle}>{job.title}</h4>
                  <span className={styles.pendingComp}>
                    {job.company?.name || 'Company'} • {job.location} • {job.jobType}
                  </span>
                </div>
                <div className={styles.pendingActions}>
                  <button
                    type="button"
                    className={styles.approveBtn}
                    onClick={() => handleApproveJob(job._id)}
                    title="Approve Listing"
                  >
                    <CheckCircle size={18} />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    className={styles.rejectBtn}
                    onClick={() => handleRejectJob(job._id)}
                    title="Reject Listing"
                  >
                    <XCircle size={18} />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card padding="large" className={styles.feedCard}>
          <div className={styles.feedHeader}>
            <Activity size={18} className={styles.feedIcon} />
            <h3 className={styles.cardTitle}>Recent Activity</h3>
          </div>

          <div className={styles.activityFeed}>
            <div className={styles.feedItem}>
              <div className={styles.feedDot} />
              <div>
                <span className={styles.feedText}>
                  <strong>Ananya Rao</strong> submitted an application to Flora Labs
                </span>
                <span className={styles.feedTime}>3 minutes ago</span>
              </div>
            </div>
            <div className={styles.feedItem}>
              <div className={styles.feedDot} />
              <div>
                <span className={styles.feedText}>
                  <strong>Sproutify Cloud</strong> published "Principal Cloud Systems Architect"
                </span>
                <span className={styles.feedTime}>25 minutes ago</span>
              </div>
            </div>
            <div className={styles.feedItem}>
              <div className={styles.feedDot} />
              <div>
                <span className={styles.feedText}>
                  <strong>Fern & Stone Studio</strong> scheduled an interview with Aditya Joshi
                </span>
                <span className={styles.feedTime}>1 hour ago</span>
              </div>
            </div>
            <div className={styles.feedItem}>
              <div className={styles.feedDot} />
              <div>
                <span className={styles.feedText}>
                  Scheduled Cron Job: closed 0 expired jobs
                </span>
                <span className={styles.feedTime}>2 hours ago</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
