'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/jobs/JobCard';
import ApplyModal from '@/components/jobs/ApplyModal';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  LayoutGrid,
  List,
  X,
  ChevronDown,
  Clock,
  History,
} from 'lucide-react';
import styles from './jobs.module.css';

const JOB_TYPES = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance'];
const WORK_MODES = ['Remote', 'Hybrid', 'On-site'];
const EXPERIENCE_LEVELS = ['Fresher', '1-3', '3-5', '5+'];
const DATE_POSTED_OPTIONS = [
  { label: 'Any time', value: '' },
  { label: 'Last 24 hours', value: '24h' },
  { label: 'Past week', value: '7d' },
  { label: 'Past month', value: '30d' },
];

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search state
  const [keyword, setKeyword] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);

  // Filter states
  const [selectedTypes, setSelectedTypes] = useState(searchParams.getAll('jobType'));
  const [selectedModes, setSelectedModes] = useState(searchParams.getAll('workMode'));
  const [selectedExp, setSelectedExp] = useState(searchParams.getAll('experience'));
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [datePosted, setDatePosted] = useState(searchParams.get('datePosted') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salaryMin') || '');
  const [salaryMax, setSalaryMax] = useState(searchParams.get('salaryMax') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'recent');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Results & UI
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Apply modal
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('verdant_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Fetch categories
  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => setCategories(data))
      .catch(() => {});
  }, []);

  // URL sync helper
  const syncToUrl = useCallback(
    (newParams) => {
      const params = new URLSearchParams();
      if (newParams.q) params.set('q', newParams.q);
      if (newParams.location) params.set('location', newParams.location);
      if (newParams.category) params.set('category', newParams.category);
      if (newParams.datePosted) params.set('datePosted', newParams.datePosted);
      if (newParams.salaryMin) params.set('salaryMin', newParams.salaryMin);
      if (newParams.salaryMax) params.set('salaryMax', newParams.salaryMax);
      if (newParams.sort && newParams.sort !== 'recent') params.set('sort', newParams.sort);
      if (newParams.page && newParams.page > 1) params.set('page', newParams.page.toString());

      newParams.jobType?.forEach((t) => params.append('jobType', t));
      newParams.workMode?.forEach((m) => params.append('workMode', m));
      newParams.experience?.forEach((e) => params.append('experience', e));

      router.replace(`/jobs?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Fetch jobs
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (keyword) params.set('q', keyword);
      if (location) params.set('location', location);
      if (selectedCategory) params.set('category', selectedCategory);
      if (datePosted) params.set('datePosted', datePosted);
      if (salaryMin) params.set('salaryMin', salaryMin);
      if (salaryMax) params.set('salaryMax', salaryMax);
      if (sort) params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '12');

      selectedTypes.forEach((t) => params.append('jobType', t));
      selectedModes.forEach((m) => params.append('workMode', m));
      selectedExp.forEach((e) => params.append('experience', e));

      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();

      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error('Fetch jobs error:', err);
    } finally {
      setLoading(false);
    }
  }, [
    keyword,
    location,
    selectedCategory,
    datePosted,
    salaryMin,
    salaryMax,
    sort,
    page,
    selectedTypes,
    selectedModes,
    selectedExp,
  ]);

  useEffect(() => {
    fetchJobs();
    syncToUrl({
      q: keyword,
      location,
      category: selectedCategory,
      datePosted,
      salaryMin,
      salaryMax,
      sort,
      page,
      jobType: selectedTypes,
      workMode: selectedModes,
      experience: selectedExp,
    });
  }, [fetchJobs, syncToUrl]);

  // Debounced keyword search
  const handleKeywordChange = (val) => {
    setKeyword(val);
    setPage(1);
  };

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;
    const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('verdant_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowRecent(false);
    if (keyword) saveRecentSearch(keyword);
    setPage(1);
    fetchJobs();
  };

  const clearAllFilters = () => {
    setSelectedTypes([]);
    setSelectedModes([]);
    setSelectedExp([]);
    setSelectedCategory('');
    setDatePosted('');
    setSalaryMin('');
    setSalaryMax('');
    setPage(1);
  };

  const toggleArrayFilter = (arr, setter, val) => {
    setPage(1);
    if (arr.includes(val)) {
      setter(arr.filter((item) => item !== val));
    } else {
      setter([...arr, val]);
    }
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedModes.length +
    selectedExp.length +
    (selectedCategory ? 1 : 0) +
    (datePosted ? 1 : 0) +
    (salaryMin || salaryMax ? 1 : 0);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* Top Sticky Search Bar */}
      <section className={styles.searchHeader}>
        <div className="container">
          <form className={styles.compactSearch} onSubmit={handleSearchSubmit}>
            <div className={styles.searchFieldWrapper}>
              <Search size={18} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Search job title, skills, or company..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                onFocus={() => setShowRecent(true)}
                className={styles.compactInput}
              />
              {/* Recent searches dropdown */}
              {showRecent && recentSearches.length > 0 && (
                <div className={styles.recentDropdown}>
                  <div className={styles.recentHeader}>
                    <History size={14} />
                    <span>Recent searches</span>
                  </div>
                  {recentSearches.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={styles.recentItem}
                      onClick={() => {
                        setKeyword(s);
                        setShowRecent(false);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.fieldDivider} />

            <div className={styles.searchFieldWrapper}>
              <MapPin size={18} className={styles.fieldIcon} />
              <input
                type="text"
                placeholder="Location (city or Remote)..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className={styles.compactInput}
              />
            </div>

            <Button type="submit" variant="primary" size="md">
              Search
            </Button>

            <button
              type="button"
              className={styles.mobileFilterToggle}
              onClick={() => setMobileFilterOpen(true)}
            >
              <SlidersHorizontal size={18} />
              <span>Filters ({activeFilterCount})</span>
            </button>
          </form>
        </div>
      </section>

      {/* Main 2-Column Content */}
      <div className={`container ${styles.mainLayout}`}>
        {/* Left Sticky Filters (Desktop) */}
        <aside
          className={`${styles.filterSidebar} ${
            mobileFilterOpen ? styles.mobileFilterDrawerOpen : ''
          }`}
        >
          <div className={styles.filterCard}>
            <div className={styles.filterCardHeader}>
              <div className={styles.filterTitleRow}>
                <SlidersHorizontal size={18} className={styles.filterIcon} />
                <h3 className={styles.filterTitle}>Filter Roles</h3>
              </div>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className={styles.clearAllBtn}
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              )}
              {mobileFilterOpen && (
                <button
                  type="button"
                  className={styles.drawerClose}
                  onClick={() => setMobileFilterOpen(false)}
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Filter 1: Work Mode */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Work Mode</span>
              <div className={styles.chipGroup}>
                {WORK_MODES.map((mode) => {
                  const active = selectedModes.includes(mode);
                  return (
                    <Chip
                      key={mode}
                      size="sm"
                      active={active}
                      onClick={() => toggleArrayFilter(selectedModes, setSelectedModes, mode)}
                    >
                      {mode}
                    </Chip>
                  );
                })}
              </div>
            </div>

            {/* Filter 2: Job Type */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Employment Type</span>
              <div className={styles.checkboxList}>
                {JOB_TYPES.map((type) => (
                  <label key={type} className={styles.checkLabel}>
                    <input
                      type="checkbox"
                      checked={selectedTypes.includes(type)}
                      onChange={() => toggleArrayFilter(selectedTypes, setSelectedTypes, type)}
                      className={styles.checkbox}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 3: Category */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Craft & Discipline</span>
              <select
                className={styles.selectFilter}
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">All Disciplines</option>
                {categories.map((c) => (
                  <option key={c.slug} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter 4: Experience Level */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Experience (Years)</span>
              <div className={styles.chipGroup}>
                {EXPERIENCE_LEVELS.map((exp) => {
                  const active = selectedExp.includes(exp);
                  return (
                    <Chip
                      key={exp}
                      size="sm"
                      active={active}
                      onClick={() => toggleArrayFilter(selectedExp, setSelectedExp, exp)}
                    >
                      {exp === 'Fresher' ? 'Fresher' : `${exp} yrs`}
                    </Chip>
                  );
                })}
              </div>
            </div>

            {/* Filter 5: Date Posted */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Date Posted</span>
              <div className={styles.radioList}>
                {DATE_POSTED_OPTIONS.map((opt) => (
                  <label key={opt.value} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="datePosted"
                      checked={datePosted === opt.value}
                      onChange={() => {
                        setDatePosted(opt.value);
                        setPage(1);
                      }}
                      className={styles.radio}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Filter 6: Min Salary */}
            <div className={styles.filterGroup}>
              <span className={styles.groupLabel}>Min Salary (INR / LPA)</span>
              <div className={styles.salaryInputRow}>
                <input
                  type="number"
                  placeholder="e.g. 1500000"
                  value={salaryMin}
                  onChange={(e) => {
                    setSalaryMin(e.target.value);
                    setPage(1);
                  }}
                  className={styles.numInput}
                />
              </div>
            </div>

            {/* Mobile bottom apply sticky button */}
            {mobileFilterOpen && (
              <div className={styles.mobileApplyBottom}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => setMobileFilterOpen(false)}
                >
                  Apply Filters ({total} found)
                </Button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Job Results */}
        <main className={styles.resultsArea}>
          {/* Results Header */}
          <div className={styles.resultsHeader}>
            <div className={styles.countText}>
              <span className={styles.highlightCount}>{total}</span>{' '}
              {total === 1 ? 'opportunity' : 'opportunities'} found
            </div>

            <div className={styles.viewAndSort}>
              <div className={styles.sortWrapper}>
                <span className={styles.sortLabel}>Sort by:</span>
                <select
                  className={styles.sortSelect}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="recent">Most Recent</option>
                  <option value="salary">Salary: High to Low</option>
                  <option value="views">Most Viewed</option>
                </select>
              </div>

              <div className={styles.viewToggle}>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'list' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={18} />
                </button>
                <button
                  type="button"
                  className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.viewActive : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Applied filters tags */}
          {activeFilterCount > 0 && (
            <div className={styles.appliedChipsRow}>
              {selectedCategory && (
                <Chip size="sm" removable onRemove={() => setSelectedCategory('')}>
                  Category: {selectedCategory}
                </Chip>
              )}
              {datePosted && (
                <Chip size="sm" removable onRemove={() => setDatePosted('')}>
                  Time: {DATE_POSTED_OPTIONS.find((o) => o.value === datePosted)?.label}
                </Chip>
              )}
              {selectedModes.map((m) => (
                <Chip
                  key={m}
                  size="sm"
                  removable
                  onRemove={() => toggleArrayFilter(selectedModes, setSelectedModes, m)}
                >
                  {m}
                </Chip>
              ))}
              {selectedTypes.map((t) => (
                <Chip
                  key={t}
                  size="sm"
                  removable
                  onRemove={() => toggleArrayFilter(selectedTypes, setSelectedTypes, t)}
                >
                  {t}
                </Chip>
              ))}
              {selectedExp.map((e) => (
                <Chip
                  key={e}
                  size="sm"
                  removable
                  onRemove={() => toggleArrayFilter(selectedExp, setSelectedExp, e)}
                >
                  Exp: {e}
                </Chip>
              ))}
              {salaryMin && (
                <Chip size="sm" removable onRemove={() => setSalaryMin('')}>
                  Min ₹{(salaryMin / 100000).toFixed(0)}L
                </Chip>
              )}
              <button
                type="button"
                className={styles.resetBtn}
                onClick={clearAllFilters}
              >
                Reset all
              </button>
            </div>
          )}

          {/* Jobs Listing */}
          {loading ? (
            <div className={viewMode === 'grid' ? styles.jobsGrid : styles.jobsList}>
              {Array.from({ length: 6 }).map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              title="No roles match your search 🌱"
              description="Try relaxing your filters or exploring another craft category. We add new verified opportunities every week."
              actionLabel="Clear all filters"
              onAction={clearAllFilters}
            />
          ) : (
            <>
              <div className={viewMode === 'grid' ? styles.jobsGrid : styles.jobsList}>
                {jobs.map((job) => (
                  <JobCard
                    key={job._id}
                    job={job}
                    viewMode={viewMode}
                    onApplyClick={(j) => setSelectedJobForApply(j)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  setPage(p);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </>
          )}
        </main>
      </div>

      {/* Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onApplied={() => {
            // refresh or update state
          }}
        />
      )}

      <Footer />
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: '40px' }}><JobCardSkeleton /></div>}>
      <JobsContent />
    </Suspense>
  );
}
