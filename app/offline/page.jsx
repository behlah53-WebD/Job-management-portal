'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { WifiOff, RotateCw, Briefcase, MapPin, DollarSign, ArrowRight, ShieldAlert } from 'lucide-react';
import { getRecentJobs } from '@/lib/pwa/offlineDB';
import Logo from '@/components/ui/Logo';

export default function OfflinePage() {
  const [recentJobs, setRecentJobs] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [checking, setChecking] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(false);

  useEffect(() => {
    // Load recently viewed jobs from IndexedDB
    getRecentJobs(10).then((jobs) => {
      if (jobs && jobs.length > 0) {
        setRecentJobs(jobs);
      }
    });

    const updateStatus = () => {
      setOnlineStatus(navigator.onLine);
    };

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    setOnlineStatus(navigator.onLine);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  const handleRetry = async () => {
    setChecking(true);
    try {
      const res = await fetch('/api/health', { cache: 'no-store' });
      if (res.ok) {
        window.location.reload();
        return;
      }
    } catch {
      // Still offline
    } finally {
      setTimeout(() => setChecking(false), 800);
    }
  };

  const filteredJobs = recentJobs.filter((job) => {
    if (!filterQuery.trim()) return true;
    const q = filterQuery.toLowerCase();
    return (
      job.title?.toLowerCase().includes(q) ||
      job.company?.name?.toLowerCase().includes(q) ||
      job.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F7FBF8] text-[#12372A] flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-[#DCEBE1] bg-white/80 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full bg-[#FEF8ED] text-[#D97706] border border-[#FDE68A]">
          <WifiOff size={14} />
          <span>Offline Mode</span>
        </div>
      </header>

      {/* Main Hero Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-[#E3F4E9] text-[#1E9A56] flex items-center justify-center mb-6 shadow-sm border border-[#CBEBD6]">
          <WifiOff size={32} />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0B3D24] text-center mb-3">
          You’re currently offline
        </h1>
        <p className="text-[#5E7A6B] text-center max-w-md text-base leading-relaxed mb-8">
          No internet connection was detected. Verdant preserves your recently viewed roles in offline storage so you can keep exploring.
        </p>

        {/* Retry Action */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={handleRetry}
            disabled={checking}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#1E9A56] hover:bg-[#167A44] text-white font-semibold text-sm transition-all shadow-sm active:scale-95 disabled:opacity-75"
          >
            <RotateCw size={16} className={checking ? 'animate-spin' : ''} />
            {checking ? 'Checking network...' : 'Retry Connection'}
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-[#EEF7F1] text-[#12372A] border border-[#DCEBE1] font-semibold text-sm transition-all shadow-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Dashboards notice */}
        <div className="w-full bg-[#FEF8ED] border border-[#FDE68A] rounded-2xl p-4 mb-10 flex items-start gap-3 text-sm text-[#92400E]">
          <ShieldAlert size={20} className="shrink-0 mt-0.5 text-[#D97706]" />
          <div>
            <strong className="font-semibold">Note on private dashboards:</strong> Real-time dashboards, job applications, and candidate reviews require an active internet connection to safeguard your data.
          </div>
        </div>

        {/* Offline Cached Jobs Section */}
        <div className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl font-bold text-[#0B3D24]">
                Recently Viewed Roles ({filteredJobs.length})
              </h2>
              <p className="text-xs text-[#5E7A6B] mt-1">Available offline from your device cache</p>
            </div>

            {recentJobs.length > 0 && (
              <input
                type="text"
                placeholder="Filter cached roles..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="px-4 py-2 text-sm rounded-xl border border-[#DCEBE1] bg-white focus:outline-none focus:ring-2 focus:ring-[#1E9A56] text-[#12372A] w-full sm:w-64"
              />
            )}
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-[#DCEBE1] rounded-2xl p-5 hover:border-[#1E9A56] transition-all shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#EEF7F1] text-[#1E9A56]">
                        {job.jobType || 'Full-time'}
                      </span>
                      {job.workMode && (
                        <span className="text-xs text-[#5E7A6B] bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-full">
                          {job.workMode}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-lg text-[#0B3D24]">{job.title}</h3>
                    <p className="text-sm text-[#5E7A6B]">
                      {job.company?.name || 'Transparent Employer'} • {job.location || 'Remote'}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-[#5E7A6B] pt-1">
                      {job.salaryMin && job.salaryMax && (
                        <span className="inline-flex items-center gap-1 font-medium text-[#1E9A56]">
                          <DollarSign size={13} />
                          {job.salaryCurrency || '$'}{job.salaryMin.toLocaleString()} - {job.salaryMax.toLocaleString()}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {job.location || 'Remote'}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/jobs/${job._id}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#EEF7F1] hover:bg-[#1E9A56] hover:text-white text-[#1E9A56] font-semibold text-xs transition-colors shrink-0"
                  >
                    <span>View Role</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-[#DCEBE1] rounded-2xl p-8 text-center text-[#5E7A6B]">
              <Briefcase size={36} className="mx-auto mb-3 opacity-40 text-[#1E9A56]" />
              <p className="font-semibold text-sm text-[#0B3D24]">No roles cached yet</p>
              <p className="text-xs mt-1 max-w-sm mx-auto">
                As you browse jobs while online, Verdant automatically saves them here so you can revisit them offline.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DCEBE1] bg-white/60 py-6 px-6 text-center text-xs text-[#5E7A6B]">
        Verdant Progressive Web App • Built for resilient careers
      </footer>
    </div>
  );
}
