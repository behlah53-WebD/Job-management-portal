'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Eye,
  PlusCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { timeAgo, getInitials } from '@/lib/utils';
import styles from './overview.module.css';

const DONUT_COLORS = ['#4A9FD8', '#8FAE9A', '#C8F169', '#F2B84B', '#1E9A56', '#E5584F'];

export default function EmployerOverviewPage() {
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [jobsRes, appsRes] = await Promise.all([
          fetch('/api/jobs?mine=true&limit=10'),
          fetch('/api/applications'),
        ]);
        const [jobsData, appsData] = await Promise.all([jobsRes.json(), appsRes.json()]);

        if (jobsData?.jobs) setJobs(jobsData.jobs);
        if (Array.isArray(appsData)) setApplicants(appsData);
      } catch (err) {
        console.error('Employer overview error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === 'Shortlisted').length;
  const totalViews = jobs.reduce((acc, curr) => acc + (curr.views || 0), 0);

  // Donut chart status breakdown
  const statusCounts = {
    Applied: applicants.filter((a) => a.status === 'Applied').length,
    Viewed: applicants.filter((a) => a.status === 'Viewed').length,
    Shortlisted: shortlistedCount,
    Interview: applicants.filter((a) => a.status === 'Interview').length,
    Offered: applicants.filter((a) => a.status === 'Offered').length,
    Rejected: applicants.filter((a) => a.status === 'Rejected').length,
  };

  const donutData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timelineData = dayNames.map((name) => {
    const appCount = applicants.filter((a) => {
      const d = new Date(a.appliedAt || a.createdAt);
      return !isNaN(d) && d.toLocaleDateString('en-US', { weekday: 'short' }) === name;
    }).length;
    return {
      name,
      applications: appCount,
      views: Math.round(totalViews / 7),
    };
  });

  return (
    <div className={styles.container}>
      {/* 4 Stat Cards */}
      <div className={styles.statsRow}>
        <StatCard
          label="Active Job Postings"
          value={activeJobsCount}
          icon={Briefcase}
          description="Currently accepting applicants"
          accentColor="green"
        />
        <StatCard
          label="Total Applicants"
          value={totalApplicantsCount}
          icon={Users}
          trend={18}
          trendLabel="vs last week"
          accentColor="green"
        />
        <StatCard
          label="Shortlisted Candidates"
          value={shortlistedCount}
          icon={CheckCircle2}
          description="Ready for interview round"
          accentColor="lime"
        />
        <StatCard
          label="Total Listing Views"
          value={totalViews}
          icon={Eye}
          trend={24}
          trendLabel="reach increase"
          accentColor="sage"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        {/* Applications Over Time (Recharts AreaChart) */}
        <Card padding="large" className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Applications & Views Over Time</h3>
              <p className={styles.chartSub}>Weekly traffic across your active roles</p>
            </div>
            <div className={styles.legendPills}>
              <span className={styles.legendApp}>• Applications</span>
              <span className={styles.legendView}>• Views</span>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E9A56" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#1E9A56" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8FAE9A" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8FAE9A" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9F3EC" />
                <XAxis dataKey="name" tick={{ fill: '#5E7A6B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5E7A6B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCEBE1',
                    boxShadow: '0 4px 16px rgba(15, 92, 51, 0.08)',
                  }}
                />
                <Area type="monotone" dataKey="views" stroke="#8FAE9A" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" isAnimationActive={false} />
                <Area type="monotone" dataKey="applications" stroke="#1E9A56" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Applicant Pipeline Donut Chart */}
        <Card padding="large" className={styles.donutCard}>
          <div className={styles.chartHeader}>
            <h3 className={styles.chartTitle}>Applicant Pipeline</h3>
            <span className={styles.totalBadge}>{totalApplicantsCount} Candidates</span>
          </div>

          <div className={styles.donutWrapper}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={84}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.donutLegend}>
            {donutData.map((d, idx) => (
              <div key={d.name} className={styles.legendItem}>
                <span
                  className={styles.legendDot}
                  style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                />
                <span className={styles.legendText}>
                  {d.name} ({d.value})
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Latest Applicants Table / Cards */}
      <Card padding="large" className={styles.latestCard}>
        <div className={styles.latestHeader}>
          <div>
            <h3 className={styles.chartTitle}>Latest Applicants</h3>
            <p className={styles.chartSub}>Recent candidates who submitted resumes for your roles</p>
          </div>
          <Link href="/dashboard/employer/applicants">
            <Button variant="secondary" size="sm" icon={ArrowRight} iconPosition="right">
              Open Kanban Board
            </Button>
          </Link>
        </div>

        <div className={styles.applicantsList}>
          {applicants.slice(0, 5).map((app) => {
            const applicant = app.applicant || {};
            const job = app.job || {};

            return (
              <div key={app._id} className={styles.applicantRow}>
                <div className={styles.applicantMeta}>
                  <div className={styles.appAvatar}>
                    {getInitials(applicant.name || 'Candidate')}
                  </div>
                  <div>
                    <h4 className={styles.applicantName}>{applicant.name || 'Candidate Name'}</h4>
                    <span className={styles.appliedJobText}>
                      Applied for <strong>{job.title || 'Role'}</strong> • {timeAgo(app.appliedAt || app.createdAt)}
                    </span>
                  </div>
                </div>

                <div className={styles.appRowRight}>
                  <Badge variant={app.status}>{app.status}</Badge>
                  <Link href="/dashboard/employer/applicants">
                    <Button variant="ghost" size="sm">
                      Review Candidate
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
