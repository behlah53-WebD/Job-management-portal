'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import JobCard from '@/components/jobs/JobCard';
import ApplyModal from '@/components/jobs/ApplyModal';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import Pagination from '@/components/ui/Pagination';
import Chip from '@/components/ui/Chip';
import Button from '@/components/ui/Button';
import MobileTopBar from '@/components/layout/mobile/MobileTopBar';
import MobileTabBar from '@/components/layout/mobile/MobileTabBar';
import AccountSheet from '@/components/layout/mobile/AccountSheet';
import BottomSheet from '@/components/ui/mobile/BottomSheet';
import JobCardMobile from '@/components/ui/mobile/JobCardMobile';
import EmptyStateMobile from '@/components/ui/mobile/EmptyStateMobile';
import { JobCardSkeletonMobile } from '@/components/ui/mobile/SkeletonMobile';
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
  ArrowUpDown,
  ArrowUp,
  Check,
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

const SALARY_PRESETS = [
  { label: '5 LPA', value: '500000' },
  { label: '10 LPA', value: '1000000' },
  { label: '15 LPA', value: '1500000' },
  { label: '25 LPA', value: '2500000' },
  { label: '50 LPA', value: '5000000' },
];

function JobsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

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
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [accountSheetOpen, setAccountSheetOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState(new Set());

  // Apply modal
  const [selectedJobForApply, setSelectedJobForApply] = useState(null);

  // Cancellation and debounce refs
  const abortControllerRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight * 1.5) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Fetch saved job IDs for seeker
  useEffect(() => {
    if (session?.user?.role === 'jobseeker') {
      fetch('/api/saved')
        .then((r) => (r.ok ? r.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setSavedJobIds(new Set(data.map((j) => j._id?.toString())));
          }
        })
        .catch(() => {});
    }
  }, [session]);

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
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

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

      const res = await fetch(`/api/jobs?${params.toString()}`, { signal: controller.signal });
      const data = await res.json();

      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

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
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch jobs error:', err);
      }
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
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
    syncToUrl,
  ]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Debounced keyword search
  const handleKeywordChange = (val) => {
    setKeyword(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setPage(1);
    }, 300);
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
    setKeyword('');
    setLocation('');
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

  const handleSaveToggle = (jobId, isSaved) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);
      if (isSaved) {
        next.add(jobId.toString());
      } else {
        next.delete(jobId.toString());
      }
      return next;
    });
  };

  const activeFilterCount =
    selectedTypes.length +
    selectedModes.length +
    selectedExp.length +
    (selectedCategory ? 1 : 0) +
    (datePosted ? 1 : 0) +
    (salaryMin || salaryMax ? 1 : 0) +
    (keyword ? 1 : 0) +
    (location ? 1 : 0);

  const isSeeker = session?.user?.role === 'jobseeker';

  return (
    <div className={styles.page}>
      {/* =========================================================================
          1. NAVIGATION:
          - Desktop (>= 1024px): Always original Navbar
          - Mobile (< 1024px):
            - If logged in as Job Seeker: MobileTopBar + MobileTabBar
            - If public / employer / admin: Navbar
         ========================================================================= */}
      <div className={styles.desktopOnlyNav}>
        <Navbar />
      </div>

      <div className={styles.mobileOnlyHeader}>
        {isSeeker ? (
          <>
            <MobileTopBar
              title="Find Jobs"
              onOpenAccount={() => setAccountSheetOpen(true)}
              hasSearch={true}
            />
            <div className={styles.mobileTopBarSpacer} aria-hidden="true" />
          </>
        ) : (
          <Navbar />
        )}
      </div>

      {/* =========================================================================
          2. DESKTOP MAIN LAYOUT (>= 1024px)
         ========================================================================= */}
      <div className={styles.desktopLayout}>
        <div className={`container ${styles.mainLayout}`}>
          {/* Left Sticky Filters (Desktop) */}
          <aside className={styles.filterSidebar}>
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
              </div>

              {/* Sidebar Search Fields */}
              <form onSubmit={handleSearchSubmit} className={styles.sidebarSearchForm}>
                <div className={styles.filterGroup}>
                  <span className={styles.groupLabel}>Search Keyword</span>
                  <div className={styles.sidebarSearchInputWrapper}>
                    <Search size={16} className={styles.sidebarFieldIcon} />
                    <input
                      type="text"
                      placeholder="Title, skill, or company..."
                      value={keyword}
                      onChange={(e) => handleKeywordChange(e.target.value)}
                      onFocus={() => setShowRecent(true)}
                      className={styles.sidebarSearchInput}
                    />
                    {keyword && (
                      <button
                        type="button"
                        className={styles.sidebarClearInputBtn}
                        onClick={() => {
                          setKeyword('');
                          setPage(1);
                        }}
                        aria-label="Clear keyword"
                      >
                        &times;
                      </button>
                    )}
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
                </div>

                <div className={styles.filterGroup}>
                  <span className={styles.groupLabel}>Location</span>
                  <div className={styles.sidebarSearchInputWrapper}>
                    <MapPin size={16} className={styles.sidebarFieldIcon} />
                    <input
                      type="text"
                      placeholder="City or Remote..."
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setPage(1);
                      }}
                      className={styles.sidebarSearchInput}
                    />
                    {location && (
                      <button
                        type="button"
                        className={styles.sidebarClearInputBtn}
                        onClick={() => {
                          setLocation('');
                          setPage(1);
                        }}
                        aria-label="Clear location"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              </form>

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
                        name="datePostedDesktop"
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
            </div>
          </aside>

          {/* Right Job Results (Desktop) */}
          <main className={styles.resultsArea}>
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
                      isSaved={savedJobIds.has(job._id?.toString())}
                      onSaveToggle={handleSaveToggle}
                      onApplyClick={(j) => setSelectedJobForApply(j)}
                    />
                  ))}
                </div>

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
      </div>

      {/* =========================================================================
          3. MOBILE LAYOUT (< 1024px)
          Engineered for 360px - 430px mobile + 768px tablet viewports.
         ========================================================================= */}
      <div className={styles.mobileLayout}>
        {/* Mobile Search Card */}
        <section className={styles.mobileSearchSection}>
          <form className={styles.mobileSearchCard} onSubmit={handleSearchSubmit}>
            {/* Row 1: Keyword */}
            <div className={styles.mobileSearchRow}>
              <Search size={18} className={styles.mobileFieldIcon} />
              <input
                type="text"
                placeholder="Search job title, skills, company..."
                value={keyword}
                onChange={(e) => handleKeywordChange(e.target.value)}
                className={styles.mobileSearchInput}
              />
              {keyword && (
                <button
                  type="button"
                  className={styles.mobileClearIconBtn}
                  onClick={() => {
                    setKeyword('');
                    setPage(1);
                  }}
                  aria-label="Clear keyword"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div className={styles.mobileHairline} />

            {/* Row 2: Location */}
            <div className={styles.mobileSearchRow}>
              <MapPin size={18} className={styles.mobileFieldIcon} />
              <input
                type="text"
                placeholder="City or 'Remote'..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className={styles.mobileSearchInput}
              />
              {location && (
                <button
                  type="button"
                  className={styles.mobileClearIconBtn}
                  onClick={() => {
                    setLocation('');
                    setPage(1);
                  }}
                  aria-label="Clear location"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              fullWidth
              className={styles.mobileSearchSubmit}
            >
              Search Jobs
            </Button>
          </form>
        </section>

        {/* Sticky Mobile Controls Bar (56px) */}
        <div className={styles.stickyControlsBar}>
          <div className={styles.mobileCountText}>
            <span className={styles.mobileCountNumber}>{total}</span> roles
          </div>

          <div className={styles.mobileControlsRight}>
            {/* Sort Button */}
            <button
              type="button"
              className={styles.mobilePillBtn}
              onClick={() => setMobileSortOpen(true)}
              aria-label="Sort jobs"
            >
              <ArrowUpDown size={15} />
              <span>
                {sort === 'salary' ? 'Salary' : sort === 'views' ? 'Viewed' : 'Recent'}
              </span>
            </button>

            {/* Filter Button */}
            <button
              type="button"
              className={`${styles.mobilePillBtn} ${
                activeFilterCount > 0 ? styles.mobilePillBtnActive : ''
              }`}
              onClick={() => setMobileFilterOpen(true)}
              aria-label="Filter jobs"
            >
              <SlidersHorizontal size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className={styles.mobileActiveFilterBadge}>{activeFilterCount}</span>
              )}
            </button>

            {/* 2-Segment View Toggle */}
            <div className={styles.mobileViewSegment}>
              <button
                type="button"
                className={`${styles.mobileSegmentBtn} ${
                  viewMode === 'list' ? styles.mobileSegmentActive : ''
                }`}
                onClick={() => setViewMode('list')}
                aria-label="List view"
              >
                <List size={16} />
              </button>
              <button
                type="button"
                className={`${styles.mobileSegmentBtn} ${
                  viewMode === 'grid' ? styles.mobileSegmentActive : ''
                }`}
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
              >
                <LayoutGrid size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Applied Filter Chips (Horizontally Scrollable) */}
        {activeFilterCount > 0 && (
          <div className={styles.mobileAppliedChipsContainer}>
            <div className={styles.mobileAppliedChipsTrack}>
              {selectedCategory && (
                <span className={styles.mobileAppliedChip}>
                  <span>{selectedCategory}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('')}
                    aria-label={`Remove ${selectedCategory}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {datePosted && (
                <span className={styles.mobileAppliedChip}>
                  <span>{DATE_POSTED_OPTIONS.find((o) => o.value === datePosted)?.label}</span>
                  <button
                    type="button"
                    onClick={() => setDatePosted('')}
                    aria-label="Remove date filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              {selectedModes.map((m) => (
                <span key={m} className={styles.mobileAppliedChip}>
                  <span>{m}</span>
                  <button
                    type="button"
                    onClick={() => toggleArrayFilter(selectedModes, setSelectedModes, m)}
                    aria-label={`Remove ${m}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {selectedTypes.map((t) => (
                <span key={t} className={styles.mobileAppliedChip}>
                  <span>{t}</span>
                  <button
                    type="button"
                    onClick={() => toggleArrayFilter(selectedTypes, setSelectedTypes, t)}
                    aria-label={`Remove ${t}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {selectedExp.map((e) => (
                <span key={e} className={styles.mobileAppliedChip}>
                  <span>Exp: {e}</span>
                  <button
                    type="button"
                    onClick={() => toggleArrayFilter(selectedExp, setSelectedExp, e)}
                    aria-label={`Remove experience ${e}`}
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              {salaryMin && (
                <span className={styles.mobileAppliedChip}>
                  <span>Min ₹{(salaryMin / 100000).toFixed(0)}L</span>
                  <button
                    type="button"
                    onClick={() => setSalaryMin('')}
                    aria-label="Remove salary filter"
                  >
                    <X size={13} />
                  </button>
                </span>
              )}
              <button
                type="button"
                className={styles.mobileResetAllBtn}
                onClick={clearAllFilters}
              >
                Clear all
              </button>
            </div>
          </div>
        )}

        {/* Mobile Jobs Results */}
        <div className={styles.mobileResultsList}>
          {loading ? (
            <div className={styles.mobileCardsStack}>
              {Array.from({ length: 4 }).map((_, i) => (
                <JobCardSkeletonMobile key={i} />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <EmptyStateMobile
              title="No roles match your search"
              description="Try relaxing your filters or searching another keyword. New verified roles arrive every week."
              actionLabel="Reset all filters"
              onAction={clearAllFilters}
            />
          ) : (
            <div
              className={
                viewMode === 'grid' ? styles.mobileGridContainer : styles.mobileListContainer
              }
            >
              {jobs.map((job) => (
                <JobCardMobile
                  key={job._id}
                  job={job}
                  isSaved={savedJobIds.has(job._id?.toString())}
                  onSaveToggle={handleSaveToggle}
                  onApplyClick={(j) => setSelectedJobForApply(j)}
                  viewVariant={viewMode === 'grid' ? 'compact' : 'list'}
                />
              ))}
            </div>
          )}

          {/* Mobile Pagination */}
          {!loading && jobs.length > 0 && totalPages > 1 && (
            <div className={styles.mobilePaginationRow}>
              <button
                type="button"
                className={styles.mobilePageBtn}
                disabled={page <= 1}
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Previous
              </button>
              <span className={styles.mobilePageIndicator}>
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className={styles.mobilePageBtn}
                disabled={page >= totalPages}
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          className={styles.backToTopBtn}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      {/* =========================================================================
          4. BOTTOM SHEETS FOR MOBILE
         ========================================================================= */}
      {/* 4.1 Filters BottomSheet (80% viewport height) */}
      <BottomSheet
        isOpen={mobileFilterOpen}
        onClose={() => setMobileFilterOpen(false)}
        title="Filter Opportunities"
      >
        <div className={styles.sheetFilterBody}>
          {/* Work Mode */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Work Mode</span>
            <div className={styles.sheetPillsRow}>
              {WORK_MODES.map((mode) => {
                const active = selectedModes.includes(mode);
                return (
                  <button
                    key={mode}
                    type="button"
                    className={`${styles.sheetPill} ${active ? styles.sheetPillActive : ''}`}
                    onClick={() => toggleArrayFilter(selectedModes, setSelectedModes, mode)}
                  >
                    {active && <Check size={14} className={styles.sheetCheckIcon} />}
                    <span>{mode}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Job Type */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Employment Type</span>
            <div className={styles.sheetPillsRow}>
              {JOB_TYPES.map((type) => {
                const active = selectedTypes.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    className={`${styles.sheetPill} ${active ? styles.sheetPillActive : ''}`}
                    onClick={() => toggleArrayFilter(selectedTypes, setSelectedTypes, type)}
                  >
                    {active && <Check size={14} className={styles.sheetCheckIcon} />}
                    <span>{type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Craft & Discipline</span>
            <select
              className={styles.sheetSelect}
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

          {/* Experience */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Experience (Years)</span>
            <div className={styles.sheetPillsRow}>
              {EXPERIENCE_LEVELS.map((exp) => {
                const active = selectedExp.includes(exp);
                return (
                  <button
                    key={exp}
                    type="button"
                    className={`${styles.sheetPill} ${active ? styles.sheetPillActive : ''}`}
                    onClick={() => toggleArrayFilter(selectedExp, setSelectedExp, exp)}
                  >
                    {active && <Check size={14} className={styles.sheetCheckIcon} />}
                    <span>{exp === 'Fresher' ? 'Fresher' : `${exp} yrs`}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Posted */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Date Posted</span>
            <div className={styles.sheetRadioList}>
              {DATE_POSTED_OPTIONS.map((opt) => {
                const active = datePosted === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`${styles.sheetRadioRow} ${
                      active ? styles.sheetRadioRowActive : ''
                    }`}
                    onClick={() => {
                      setDatePosted(opt.value);
                      setPage(1);
                    }}
                  >
                    <div className={styles.sheetRadioCircle}>
                      {active && <div className={styles.sheetRadioDot} />}
                    </div>
                    <span className={styles.sheetRadioText}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Min Salary */}
          <div className={styles.sheetFilterSection}>
            <span className={styles.sheetSectionLabel}>Minimum Salary</span>
            <div className={styles.sheetSalaryPresets}>
              {SALARY_PRESETS.map((preset) => {
                const active = salaryMin === preset.value;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    className={`${styles.sheetPill} ${active ? styles.sheetPillActive : ''}`}
                    onClick={() => {
                      setSalaryMin(active ? '' : preset.value);
                      setPage(1);
                    }}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <div className={styles.sheetSalaryInputWrapper}>
              <span className={styles.sheetRupee}>₹</span>
              <input
                type="number"
                placeholder="Or enter amount (e.g. 1500000)"
                value={salaryMin}
                onChange={(e) => {
                  setSalaryMin(e.target.value);
                  setPage(1);
                }}
                className={styles.sheetSalaryInput}
              />
            </div>
          </div>
        </div>

        {/* Sticky Sheet Footer */}
        <div className={styles.sheetStickyFooter}>
          {activeFilterCount > 0 ? (
            <button
              type="button"
              className={styles.sheetClearBtn}
              onClick={clearAllFilters}
            >
              Clear all
            </button>
          ) : (
            <div />
          )}
          <Button
            variant="primary"
            size="lg"
            className={styles.sheetShowRolesBtn}
            onClick={() => setMobileFilterOpen(false)}
          >
            Show {total} {total === 1 ? 'role' : 'roles'} 🌱
          </Button>
        </div>
      </BottomSheet>

      {/* 4.2 Sort BottomSheet */}
      <BottomSheet
        isOpen={mobileSortOpen}
        onClose={() => setMobileSortOpen(false)}
        title="Sort Opportunities"
      >
        <div className={styles.sheetSortBody}>
          {[
            { label: 'Most Recent', value: 'recent' },
            { label: 'Salary: High to Low', value: 'salary' },
            { label: 'Most Viewed', value: 'views' },
          ].map((item) => {
            const active = sort === item.value;
            return (
              <button
                key={item.value}
                type="button"
                className={`${styles.sheetSortOption} ${
                  active ? styles.sheetSortOptionActive : ''
                }`}
                onClick={() => {
                  setSort(item.value);
                  setPage(1);
                  setMobileSortOpen(false);
                }}
              >
                <span className={styles.sheetSortText}>{item.label}</span>
                {active && <Check size={18} className={styles.sheetSortCheck} />}
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* 4.3 Account Sheet (if jobseeker) */}
      {isSeeker && (
        <AccountSheet
          isOpen={accountSheetOpen}
          onClose={() => setAccountSheetOpen(false)}
        />
      )}

      {/* 4.4 Mobile Tab Bar (if jobseeker) */}
      {isSeeker && <MobileTabBar />}

      {/* 4.5 Apply Modal */}
      {selectedJobForApply && (
        <ApplyModal
          job={selectedJobForApply}
          isOpen={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
          onApplied={() => {
            setSelectedJobForApply(null);
          }}
        />
      )}

      {/* Desktop footer */}
      <div className={styles.desktopOnlyFooter}>
        <Footer />
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '40px' }}>
          <JobCardSkeleton />
        </div>
      }
    >
      <JobsContent />
    </Suspense>
  );
}
