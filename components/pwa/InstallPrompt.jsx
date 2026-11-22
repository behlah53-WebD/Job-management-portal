'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Share, PlusSquare, X, Download, Zap, Bell, Sparkles } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';
import styles from './InstallPrompt.module.css';

export default function InstallPrompt() {
  const { isInstallable, isStandalone, isIOS, promptInstall, dismissPrompt } = useInstallPrompt();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (!isInstallable || isStandalone) return null;

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await promptInstall();
    }
  };

  return (
    <>
      {/* =========================================================================
          VERDANT ULTRA-ATTRACTIVE PWA INSTALL POPUP
          Anchored securely in the right bottom corner.
         ========================================================================= */}
      <aside aria-label="Install Verdant App" className={styles.promptWrapper}>
        <div className={styles.promptCard}>
          {/* Top Emerald Gradient Accent Bar */}
          <div className={styles.topAccentBar} />

          {/* Ambient Corner Glow */}
          <div className={styles.cardGlowBg} />

          {/* Header Row: Icon + Title/Subtitle + Close Button */}
          <div className={styles.headerRow}>
            <div className={styles.brandGroup}>
              <div className={styles.appIconContainer}>
                <Image
                  src="/icons/icon-96x96.png"
                  alt="Verdant Logo"
                  width={34}
                  height={34}
                  className={styles.appIconImg}
                />
                <span className={styles.liveIndicatorPulse} aria-hidden="true" />
              </div>

              <div className={styles.titleMeta}>
                <h4 className={styles.titleText}>Install Verdant App</h4>
                <div className={styles.badgePill}>
                  <span className={styles.badgeDot} />
                  <span>Fast · Offline · 1-Tap Access</span>
                </div>
              </div>
            </div>

            <button
              onClick={dismissPrompt}
              aria-label="Dismiss install prompt"
              className={styles.closeBtn}
            >
              <X size={16} />
            </button>
          </div>

          {/* Micro-features pill tags */}
          <div className={styles.featuresRow}>
            <span className={styles.featureTag}>
              <Zap size={11} />
              <span>Instant Launch</span>
            </span>
            <span className={styles.featureTag}>
              <Sparkles size={11} />
              <span>Offline Ready</span>
            </span>
            <span className={styles.featureTag}>
              <Bell size={11} />
              <span>Job Alerts</span>
            </span>
          </div>

          {/* Action Row: Not now & Install Button */}
          <div className={styles.actionsRow}>
            <button
              type="button"
              onClick={dismissPrompt}
              className={styles.dismissBtn}
            >
              Not now
            </button>

            <button
              type="button"
              onClick={handleInstallClick}
              className={styles.installPrimaryBtn}
            >
              <Download size={14} />
              <span>Install Now 🌿</span>
            </button>
          </div>
        </div>
      </aside>

      {/* =========================================================================
          iOS SAFARI GUIDED MODAL
         ========================================================================= */}
      {showIOSModal && (
        <div className={styles.iosModalBackdrop} onClick={() => setShowIOSModal(false)}>
          <div
            className={styles.iosModalCard}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ios-modal-title"
          >
            <div className={styles.iosAppIcon}>
              <Image
                src="/icons/icon-96x96.png"
                alt="Verdant Icon"
                width={40}
                height={40}
                className="rounded-xl"
              />
            </div>

            <div>
              <h3 id="ios-modal-title" className={styles.iosModalTitle}>
                Install Verdant on iOS
              </h3>
              <p className={styles.iosModalSub}>
                Add Verdant to your Home Screen in 2 simple taps:
              </p>
            </div>

            <div className={styles.iosStepsList}>
              <div className={styles.iosStepItem}>
                <span className={styles.iosStepNumber}>1</span>
                <span className={styles.iosStepText}>
                  Tap the <Share size={15} style={{ display: 'inline', color: '#1E9A56', verticalAlign: '-2px' }} /> <strong>Share</strong> button in Safari toolbar.
                </span>
              </div>
              <div className={styles.iosStepItem}>
                <span className={styles.iosStepNumber}>2</span>
                <span className={styles.iosStepText}>
                  Scroll and select <PlusSquare size={15} style={{ display: 'inline', color: '#1E9A56', verticalAlign: '-2px' }} /> <strong>Add to Home Screen</strong>.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowIOSModal(false);
                dismissPrompt();
              }}
              className={styles.iosCloseBtn}
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
