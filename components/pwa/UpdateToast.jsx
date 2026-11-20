'use client';

import React, { useState, useEffect } from 'react';
import { RefreshCw, Sparkles, X } from 'lucide-react';

export default function UpdateToast({ registration }) {
  const [waitingWorker, setWaitingWorker] = useState(null);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!registration) return;

    // Check if there is already a waiting worker
    if (registration.waiting) {
      setWaitingWorker(registration.waiting);
      setShowToast(true);
    }

    // Listen for new worker updates found
    const handleUpdateFound = () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          setWaitingWorker(newWorker);
          setShowToast(true);
        }
      });
    };

    registration.addEventListener('updatefound', handleUpdateFound);

    // Periodic check every 60 minutes
    const interval = setInterval(() => {
      registration.update().catch(() => {});
    }, 60 * 60 * 1000);

    return () => {
      registration.removeEventListener('updatefound', handleUpdateFound);
      clearInterval(interval);
    };
  }, [registration]);

  const handleUpdate = () => {
    if (!waitingWorker) return;

    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    });

    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    setShowToast(false);
  };

  if (!showToast) return null;

  return (
    <aside
      aria-label="New version available"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[9995] bg-[#0B3D24] text-white border border-[#167A44] rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#1E9A56] flex items-center justify-center text-white shrink-0 shadow-sm">
          <Sparkles size={18} />
        </div>
        <div>
          <h4 className="font-serif text-sm font-bold text-white">Update Available</h4>
          <p className="text-xs text-[#CBEBD6]">A fresh version of Verdant is ready.</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleUpdate}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E9A56] hover:bg-[#28A15E] text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
        >
          <RefreshCw size={14} />
          <span>Update</span>
        </button>
        <button
          onClick={() => setShowToast(false)}
          aria-label="Dismiss update"
          className="p-1.5 rounded-lg text-[#CBEBD6] hover:text-white hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
}
