'use client';

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      setIsOffline(false);
      setShowRestored(true);
      const timer = setTimeout(() => {
        setShowRestored(false);
      }, 3500);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowRestored(false);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline && !showRestored) return null;

  if (showRestored) {
    return (
      <aside
        aria-live="polite"
        className="fixed top-0 inset-x-0 z-[9999] bg-[#1E9A56] text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-md transition-all duration-300"
      >
        <Wifi size={14} className="animate-pulse" />
        <span>Back online! Live synchronization restored.</span>
      </aside>
    );
  }

  return (
    <aside
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-[9999] bg-[#FEF8ED] border-b border-[#FDE68A] text-[#92400E] text-xs font-medium px-4 py-2 flex items-center justify-center gap-2 shadow-sm transition-all duration-300"
    >
      <WifiOff size={14} className="text-[#D97706] shrink-0" />
      <span>You are currently browsing offline. Some real-time features may be limited.</span>
    </aside>
  );
}
