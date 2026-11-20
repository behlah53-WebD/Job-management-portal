'use client';

import { useState, useEffect } from 'react';

const DISMISS_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check standalone mode
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsStandalone(standaloneMode);

    if (standaloneMode) return;

    // Check iOS Safari
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isSafari = /safari/.test(ua) && !/chrome|crios|fxios/.test(ua);
    const isIOSSafari = isIOSDevice && isSafari && !standaloneMode;
    setIsIOS(isIOSSafari);

    // Check dismissal cooldown
    const lastDismissed = localStorage.getItem('verdant_pwa_dismissed_at');
    if (lastDismissed && Date.now() - parseInt(lastDismissed, 10) < DISMISS_COOLDOWN_MS) {
      return;
    }

    if (isIOSSafari) {
      setIsInstallable(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstallable(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      console.log('Verdant PWA installed successfully');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (isIOS) {
      return { outcome: 'ios_instructions' };
    }

    if (!deferredPrompt) return null;

    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setIsInstallable(false);

    if (choice.outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    } else {
      localStorage.setItem('verdant_pwa_dismissed_at', Date.now().toString());
    }

    return choice;
  };

  const dismissPrompt = () => {
    localStorage.setItem('verdant_pwa_dismissed_at', Date.now().toString());
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isStandalone,
    isIOS,
    promptInstall,
    dismissPrompt,
  };
}
