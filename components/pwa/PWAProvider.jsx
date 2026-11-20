'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import OfflineBanner from './OfflineBanner';
import InstallPrompt from './InstallPrompt';
import UpdateToast from './UpdateToast';
import { clearOfflineData } from '@/lib/pwa/offlineDB';

/**
 * Converts a base64 string to a Uint8Array for VAPID applicationServerKey
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PWAProvider() {
  const { status: authStatus } = useSession();
  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const isProduction = process.env.NODE_ENV === 'production';
    const allowDevPwa = process.env.NEXT_PUBLIC_PWA_DEV === 'true';

    if (!isProduction && !allowDevPwa) {
      console.log('Service Worker registration skipped in development (enable with NEXT_PUBLIC_PWA_DEV=true).');
      return;
    }

    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(async (registration) => {
        setSwRegistration(registration);
        console.log('Verdant Service Worker registered with scope:', registration.scope);

        // Auto-subscribe to Web Push if permission is already granted and VAPID key is configured
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        if (
          'PushManager' in window &&
          publicVapidKey &&
          Notification.permission === 'granted'
        ) {
          try {
            let subscription = await registration.pushManager.getSubscription();
            if (!subscription) {
              const convertedKey = urlBase64ToUint8Array(publicVapidKey);
              subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey,
              });
            }

            if (subscription) {
              await fetch('/api/push/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  subscription,
                  userAgent: navigator.userAgent,
                }),
              });
            }
          } catch (pushErr) {
            console.warn('Silent push sync error:', pushErr);
          }
        }
      })
      .catch((err) => {
        console.warn('Service Worker registration failed:', err);
      });
  }, []);

  // Handle logout cleanup
  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      // Clear private caches
      if ('caches' in window) {
        caches.delete('pages-cache').catch(() => {});
      }
      // Clear IndexedDB queue
      clearOfflineData().catch(() => {});
      // Clear app badge
      if ('clearAppBadge' in navigator) {
        navigator.clearAppBadge().catch(() => {});
      }
    }
  }, [authStatus]);

  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
      <UpdateToast registration={swRegistration} />
    </>
  );
}
