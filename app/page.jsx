import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import LandingHero from '@/components/landing/LandingHero';
import JobCard from '@/components/jobs/JobCard';
import Button from '@/components/ui/Button';
import { getJobs, getCategories, getCompanies, getPlatformStats } from '@/lib/dataService';
import {
  Code,
  Palette,
  Megaphone,
  TrendingUp,
  Database,
  BadgeDollarSign,
  Users,
  HeartHandshake,
  ArrowRight,
  UserCheck,
  Search,
  Sparkles,
  Building2,
  Check,
} from 'lucide-react';
import styles from './landing.module.css';

const ICON_MAP = {
  Code,
  Palette,
  Megaphone,
  TrendingUp,
  Database,
  BadgeDollarSign,
  Users,
  HeartHandshake,
};

export const revalidate = 60;

export default async function HomePage() {
  const [{ jobs: featuredJobs }, categories, companies, stats] = await Promise.all([
    getJobs({ limit: 6, sort: 'recent' }),
    getCategories(),
    getCompanies(6),
    getPlatformStats(),
  ]);

  return (
    <div className={styles.pageWrapper}>
      <Navbar />

      <main>
        {/* 1. Hero */}
        <LandingHero jobCount={stats.activeJobs} />

        {/* 2. Trusted By Strip */}
        <section className={styles.trustedStrip}>
          <div className="container">
            <span className={styles.trustedLabel}>
              Trusted by conscious founders & high-growth teams
            </span>
            <div className={styles.trustedLogos}>
              {companies.length > 0 ? (
                companies.map((comp) => (
                  <Link
                    key={comp._id}
                    href={`/jobs?q=${encodeURIComponent(comp.name)}`}
                    className={styles.brandBadge}
                  >
                    🌿 {comp.name}
                  </Link>
                ))
              ) : (
                <div className={styles.brandBadge}>🌿 Verified Employers</div>
              )}
            </div>
          </div>
        </section>

        {/* 3. Browse By Category */}
        <section className={styles.categorySection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionSub}>Explore Disciplines</span>
                <h2 className={styles.sectionTitle}>Browse Roles by Craft</h2>
              </div>
              <Link href="/jobs" className={styles.viewAllLink}>
                <span>Explore all crafts</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className={styles.categoryGrid}>
              {categories.map((cat) => {
                const IconComp = ICON_MAP[cat.icon] || Code;
                return (
                  <Link
                    key={cat.slug}
                    href={`/jobs?category=${encodeURIComponent(cat.name)}`}
                    className={styles.categoryCard}
                  >
                    <div className={styles.categoryIconCircle}>
                      <IconComp size={24} />
                    </div>
                    <h3 className={styles.categoryName}>{cat.name}</h3>
                    <span className={styles.categoryCount}>
                      {cat.jobCount} open {cat.jobCount === 1 ? 'role' : 'roles'}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. Featured Jobs */}
        <section className={styles.featuredSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <div>
                <span className={styles.sectionSub}>Handpicked Opportunities</span>
                <h2 className={styles.sectionTitle}>Featured Positions</h2>
              </div>
              <Link href="/jobs" className={styles.viewAllLink}>
                <span>View all {stats.activeJobs} open {stats.activeJobs === 1 ? 'role' : 'roles'}</span>
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className={styles.featuredGrid}>
              {featuredJobs?.map((job) => (
                <JobCard key={job._id} job={job} viewMode="grid" />
              ))}
            </div>
          </div>
        </section>

        {/* 5. How It Works */}
        <section id="how-it-works" className={styles.howItWorksSection}>
          <div className="container">
            <div className={styles.howHeader}>
              <span className={styles.sectionSub}>The Verdant Way</span>
              <h2 className={styles.sectionTitle}>How Your Next Step Grows</h2>
              <p className={styles.howSubtitle}>
                A simple, dignified process free from applicant tracking black holes.
              </p>
            </div>

            <div className={styles.stepsGrid}>
              {/* Step 1 */}
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>01</div>
                <div className={styles.stepIconBox}>
                  <UserCheck size={28} />
                </div>
                <h3 className={styles.stepTitle}>Craft Your Profile</h3>
                <p className={styles.stepDesc}>
                  Highlight your genuine skills, portfolio links, and preferred salary transparently. No keyword stuffing required.
                </p>
              </div>

              {/* Step 2 */}
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>02</div>
                <div className={styles.stepIconBox}>
                  <Search size={28} />
                </div>
                <h3 className={styles.stepTitle}>Discover & Apply</h3>
                <p className={styles.stepDesc}>
                  Search with calm filters, see verified salary bands upfront, and apply in 1-click with customized notes.
                </p>
              </div>

              {/* Step 3 */}
              <div className={styles.stepCard}>
                <div className={styles.stepNumber}>03</div>
                <div className={styles.stepIconBox}>
                  <Sparkles size={28} />
                </div>
                <h3 className={styles.stepTitle}>Grow With Confidence</h3>
                <p className={styles.stepDesc}>
                  Track live status updates on your candidate dashboard, schedule interviews, and accept offers that honor your value.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Stats Band */}
        <section className={styles.statsBand}>
          <div className={`container ${styles.statsGrid}`}>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.activeJobs}</span>
              <span className={styles.statLabel}>Active Opportunities</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.verifiedCompanies || stats.totalCompanies}</span>
              <span className={styles.statLabel}>Partner Companies</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{stats.totalApplications}</span>
              <span className={styles.statLabel}>Candidate Applications</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNumber}>{categories.length}</span>
              <span className={styles.statLabel}>Career Disciplines</span>
            </div>
          </div>
        </section>

        {/* 7. Testimonials */}
        <section className={styles.testimonialsSection}>
          <div className="container">
            <div className={styles.howHeader}>
              <span className={styles.sectionSub}>Candidate & Founder Stories</span>
              <h2 className={styles.sectionTitle}>Voices from the Garden</h2>
            </div>

            <div className={styles.testimonialsGrid}>
              <div className={styles.testCard}>
                <p className={styles.testQuote}>
                  "Finding a role through Verdant was the first time job hunting didn't feel exhausting. Salary was upfront, and within 4 days I was interviewing with the design director."
                </p>
                <div className={styles.testAuthor}>
                  <div className={styles.testAvatar}>AR</div>
                  <div>
                    <span className={styles.testName}>Ananya Rao</span>
                    <span className={styles.testRole}>Lead Frontend Engineer, Sproutify</span>
                  </div>
                </div>
              </div>

              <div className={styles.testCard}>
                <p className={styles.testQuote}>
                  "The quality of applicants on Verdant is noticeably higher. Candidates care about mission alignment and craftsmanship, which is essential for our culture."
                </p>
                <div className={styles.testAuthor}>
                  <div className={styles.testAvatar}>AS</div>
                  <div>
                    <span className={styles.testName}>Aarav Sharma</span>
                    <span className={styles.testRole}>Co-founder & CEO, Flora Labs</span>
                  </div>
                </div>
              </div>

              <div className={styles.testCard}>
                <p className={styles.testQuote}>
                  "The Kanban applicant workflow for employers is so clean. We hired two senior AI engineers in less than three weeks without hiring agency recruiters."
                </p>
                <div className={styles.testAuthor}>
                  <div className={styles.testAvatar}>RV</div>
                  <div>
                    <span className={styles.testName}>Rohan Verma</span>
                    <span className={styles.testRole}>VP of Engineering, SageMetrics</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. Employer CTA Banner */}
        <section className={styles.ctaSection}>
          <div className="container">
            <div className={styles.ctaBanner}>
              <div className={styles.ctaContent}>
                <span className={styles.ctaSub}>Ready to expand your team?</span>
                <h2 className={styles.ctaTitle}>Hiring? Post a job in 5 minutes.</h2>
                <p className={styles.ctaDesc}>
                  Put your opportunities in front of thoughtful, high-agency candidates.
                  Full candidate pipeline and Kanban board included.
                </p>
                <div className={styles.ctaActions}>
                  <Link href="/dashboard/employer/post-job">
                    <Button variant="primary" size="lg">
                      Post an Opening Now 🌱
                    </Button>
                  </Link>
                  <Link href="/companies">
                    <Button variant="secondary" size="lg">
                      Explore Companies
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
