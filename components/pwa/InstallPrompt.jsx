'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Share, PlusSquare, X, Download } from 'lucide-react';
import { useInstallPrompt } from '@/hooks/useInstallPrompt';

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
      {/* Elegant install prompt — anchored bottom-right */}
      <aside
        aria-label="Install Verdant App"
        className="fixed bottom-6 right-6 z-[9990] w-full max-w-xs relative overflow-hidden rounded-[22px] border border-green-100/70 bg-white/80 backdrop-blur-xl backdrop-saturate-150 shadow-[0_20px_40px_-10px_rgba(11,61,36,0.14)] shadow-green-950/10 animate-in slide-in-from-bottom-4 fade-in duration-500 ease-out hover:-translate-y-1 hover:shadow-[0_24px_48px_-12px_rgba(11,61,36,0.18)] transition-all duration-300 flex items-center justify-between gap-4 p-6"
      >
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#2FB36A] via-[#1E9A56] to-[#0F5C33]" />

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#5CC689]/40 to-[#1E9A56]/20 blur opacity-80" />
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#2FB36A] to-[#1E9A56] flex items-center justify-center shadow-[0_8px_16px_rgba(30,154,86,0.35)]">
              <Image
                src="/icons/icon-96x96.png"
                alt="Verdant Logo"
                width={40}
                height={40}
                className="rounded-xl object-contain relative z-10"
              />
            </div>
          </div>
          <div className="leading-tight">
            <h4 className="font-serif text-base font-bold text-[#0B3D24] tracking-tight">
              Install Verdant
            </h4>
            <p className="text-xs text-[#5E7A6B] mt-[2px]">
              Add to Home screen for 1-tap access &amp; job alerts.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-br from-[#1E9A56] to-[#167A44] text-white text-xs font-bold shadow-[0_6px_16px_rgba(30,154,86,0.30)] hover:from-[#2FB36A] hover:to-[#1E9A56] hover:shadow-[0_8px_20px_rgba(30,154,86,0.40)] active:scale-95 transition-all duration-200"
            >
              <Download size={13} />
              <span>Install</span>
            </button>
            <button
              onClick={dismissPrompt}
              aria-label="Dismiss install prompt"
              className="p-2 rounded-xl text-[#5E7A6B] hover:text-[#12372A] hover:bg-[#EEF7F1] transition-colors duration-200"
            >
              <X size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* iOS Safari Guided Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#DCEBE1] text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-[#E3F4E9] text-[#1E9A56] flex items-center justify-center mx-auto">
              <Image
                src="/icons/icon-96x96.png"
                alt="Verdant Icon"
                width={40}
                height={40}
                className="rounded-xl"
              />
            </div>

            <div>
              <h3 className="font-serif text-lg font-bold text-[#0B3D24]">
                Install Verdant on iOS
              </h3>
              <p className="text-xs text-[#5E7A6B] mt-1">
                Install Verdant to your iPhone or iPad home screen in two quick taps:
              </p>
            </div>

            <div className="bg-[#F7FBF8] border border-[#DCEBE1] rounded-2xl p-4 text-left space-y-3 text-xs text-[#12372A]">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1E9A56] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <span className="flex items-center gap-1.5">
                  Tap the <Share size={15} className="text-[#1E9A56]" /> <strong>Share</strong> button in Safari's toolbar.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#1E9A56] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <span className="flex items-center gap-1.5">
                  Scroll down and choose <PlusSquare size={15} className="text-[#1E9A56]" /> <strong>Add to Home Screen</strong>.
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                dismissPrompt();
              }}
              className="w-full py-2.5 rounded-xl bg-[#1E9A56] hover:bg-[#167A44] text-white font-semibold text-xs transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
