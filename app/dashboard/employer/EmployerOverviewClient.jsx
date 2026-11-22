'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import DataCard from '@/components/ui/mobile/DataCard';
import SegmentedTabs from '@/components/ui/mobile/SegmentedTabs';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Eye,
  ArrowRight,
  PlusCircle,
  Calendar,
  ChevronRight,
  Sparkles,
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
} from 'recharts';
import { timeAgo, getInitials } from '@/lib/utils';
import styles from './overview.module.css';

const DONUT_COLORS = ['#4A9FD8', '#8FAE9A', '#C8F169', '#F2B84B', '#1E9A56', '#E5584F'];

export default function EmployerOverviewClient({ initialData = {} }) {
  const { data: session } = useSession();
  const [jobs] = useState(initialData.jobs || []);
  const [applicants] = useState(initialData.applicants || []);
  const [chartRange, setChartRange] = useState('7D');

  const activeJobsCount = jobs.filter((j) => j.status === 'Active').length;
  const totalApplicantsCount = applicants.length;
  const shortlistedCount = applicants.filter((a) => a.status === 'Shortlisted').length;
  const interviewCount = applicants.filter((a) => a.status === 'Interview').length;
  const offeredCount = applicants.filter((a) => a.status === 'Offered').length;
  const totalViews = jobs.reduce((acc, curr) => acc + (curr.views || 0), 0);

  const userName = session?.user?.name?.split(' ')[0] || 'Partner';

  // Donut chart status breakdown
  const statusCounts = {
    Applied: applicants.filter((a) => a.status === 'Applied').length,
    Viewed: applicants.filter((a) => a.status === 'Viewed').length,
    Shortlisted: shortlistedCount,
    Interview: interviewCount,
    Offered: offeredCount,
    Rejected: applicants.filter((a) => a.status === 'Rejected').length,
  };

  const donutData = Object.entries(statusCounts)
    .filter(([_, count]) => count > 0)
    .map(([name, value]) => ({ name, value }));

  const dayNames7D = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timelineData7D = dayNames7D.map((name) => {
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

  const timelineData30D = [
    { name: 'W1', applications: Math.round(totalApplicantsCount * 0.2), views: Math.round(totalViews * 0.2) },
    { name: 'W2', applications: Math.round(totalApplicantsCount * 0.25), views: Math.round(totalViews * 0.28) },
    { name: 'W3', applications: Math.round(totalApplicantsCount * 0.3), views: Math.round(totalViews * 0.32) },
    { name: 'W4', applications: Math.round(totalApplicantsCount * 0.25), views: Math.round(totalViews * 0.2) },
  ];

  const activeChartData = chartRange === '30D' ? timelineData30D : timelineData7D;

  return (
    <div className={styles.container}>
      {/* =========================================================================
          MOBILE-ONLY HERO & QUICK ACTIONS (< 1024px)
         ========================================================================= */}
      <div className={styles.mobileHeroSection}>
        {/* 1. Greeting Block */}
        <div className={styles.mobileGreetingBlock}>
          <span className={styles.mobileOverline}>Good morning</span>
          <h1 className={styles.mobileNameSerif}>{userName}</h1>
          <p className={styles.mobileSupportiveLine}>
            Your candidate pipeline is alive and growing today.
          </p>
        </div>

        {/* 2. Quick Actions Row */}
        <div className={styles.mobileQuickActions}>
          <Link href="/dashboard/employer/post-job" className={styles.quickActionPrimary}>
            <PlusCircle size={18} />
            <span>Post a Job</span>
          </Link>
          <Link href="/dashboard/employer/applicants" className={styles.quickActionTonal}>
            <Users size={18} />
            <span>Open Pipeline</span>
          </Link>
        </div>

        {/* 3. Horizontally Scrollable Stat Cards (148px snap-start with peeking) */}
        <div className={styles.mobileStatsScroll}>
          <div className={styles.mobileStatCard}>
            <div className={`${styles.mobileStatChip} ${styles.chipGreen}`}>
              <Briefcase size={16} />
            </div>
            <span className={styles.mobileStatNumber}>{activeJobsCount}</span>
            <span className={styles.mobileStatLabel}>Active Jobs</span>
            <span className={styles.mobileStatDelta}>Accepting</span>
          </div>

          <div className={styles.mobileStatCard}>
            <div className={`${styles.mobileStatChip} ${styles.chipLime}`}>
              <Users size={16} />
            </div>
            <span className={styles.mobileStatNumber}>{totalApplicantsCount}</span>
            <span className={styles.mobileStatLabel}>Total Applicants</span>
            <span className={styles.mobileStatDelta}>+18%</span>
          </div>

          <div className={styles.mobileStatCard}>
            <div className={`${styles.mobileStatChip} ${styles.chipSage}`}>
              <Calendar size={16} />
            </div>
            <span className={styles.mobileStatNumber}>{interviewCount}</span>
            <span className={styles.mobileStatLabel}>Interviews</span>
            <span className={styles.mobileStatDelta}>Scheduled</span>
          </div>

          <div className={styles.mobileStatCard}>
            <div className={`${styles.mobileStatChip} ${styles.chipGold}`}>
              <CheckCircle2 size={16} />
            </div>
            <span className={styles.mobileStatNumber}>{offeredCount}</span>
            <span className={styles.mobileStatLabel}>Offers Made</span>
            <span className={styles.mobileStatDelta}>Offered</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          DESKTOP 4 STAT CARDS (>= 1024px) - UNTOUCHED FOR DESKTOP FIDELITY
         ========================================================================= */}
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

      {/* =========================================================================
          CHARTS ROW: APPLICATIONS CHART & PIPELINE DONUT
         ========================================================================= */}
      <div className={styles.chartsGrid}>
        {/* Applications Over Time */}
        <Card padding="large" className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div>
              <h3 className={styles.chartTitle}>Applications & Views</h3>
              <p className={styles.chartSub}>Weekly traffic across your active roles</p>
            </div>
            <div className={styles.rangeSelectorWrapper}>
              <div className={styles.mobileRangeTabs}>
                <SegmentedTabs
                  tabs={[
                    { id: '7D', label: '7D' },
                    { id: '30D', label: '30D' },
                  ]}
                  activeTab={chartRange}
                  onChange={setChartRange}
                />
              </div>
              <div className={styles.legendPills}>
                <span className={styles.legendApp}>• Applications</span>
                <span className={styles.legendView}>• Views</span>
              </div>
            </div>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height={260} className={styles.desktopChartHeight}>
              <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            <div className={styles.donutCenterInfo}>
              <span className={styles.donutTotalNum}>{totalApplicantsCount}</span>
              <span className={styles.donutTotalLabel}>Total</span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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

      {/* =========================================================================
          LATEST APPLICANTS SECTION
         ========================================================================= */}
      {/* Desktop View (>= 1024px) */}
      <Card padding="large" className={styles.latestCardDesktop}>
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

      {/* Mobile View (< 1024px): DataCard List */}
      <div className={styles.mobileApplicantsSection}>
        <div className={styles.mobileSectionHeader}>
          <div>
            <h3 className={styles.mobileSectionTitle}>Latest Applicants</h3>
            <p className={styles.mobileSectionSub}>Recent candidates seeking your roles</p>
          </div>
          <Link href="/dashboard/employer/applicants" className={styles.openKanbanBtn}>
            Open Kanban
          </Link>
        </div>

        <div className={styles.mobileDataCardStack}>
          {applicants.slice(0, 4).map((app) => {
            const applicant = app.applicant || {};
            const job = app.job || {};

            return (
              <DataCard key={app._id} className={styles.applicantDataCard}>
                <div className={styles.dataCardTop}>
                  <div className={styles.dataCardAvatar}>
                    {getInitials(applicant.name || 'Candidate')}
                  </div>
                  <div className={styles.dataCardInfo}>
                    <h4 className={styles.dataCardName}>{applicant.name || 'Candidate Name'}</h4>
                    <span className={styles.dataCardRole}>
                      Applied for {job.title || 'Role'} · {timeAgo(app.appliedAt || app.createdAt)}
                    </span>
                  </div>
                  <div className={styles.dataCardBadge}>
                    <Badge variant={app.status}>{app.status}</Badge>
                  </div>
                </div>

                <div className={styles.dataCardFooter}>
                  <Link href="/dashboard/employer/applicants" className={styles.dataCardReviewLink}>
                    <span>Review Candidate</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </DataCard>
            );
          })}

          {applicants.length > 4 && (
            <Link href="/dashboard/employer/applicants" className={styles.viewAllAppsBtn}>
              View all {applicants.length} applicants
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
