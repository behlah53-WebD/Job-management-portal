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
      {/* Non-intrusive Banner / Card */}
      <aside
        aria-label="Install Verdant App"
        className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[9990] bg-white border border-[#DCEBE1] rounded-2xl p-4 shadow-xl shadow-green-950/10 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#1E9A56] p-2 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Image
              src="/icons/icon-96x96.png"
              alt="Verdant Logo"
              width={36}
              height={36}
              className="rounded-lg object-contain"
            />
          </div>
          <div>
            <h4 className="font-serif text-sm font-bold text-[#0B3D24]">Install Verdant</h4>
            <p className="text-xs text-[#5E7A6B] line-clamp-1">
              Add to Home screen for 1-tap access & job alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E9A56] hover:bg-[#167A44] text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Download size={14} />
            <span>Install</span>
          </button>
          <button
            onClick={dismissPrompt}
            aria-label="Dismiss install prompt"
            className="p-1.5 rounded-lg text-[#5E7A6B] hover:text-[#12372A] hover:bg-[#EEF7F1] transition-colors"
          >
            <X size={16} />
          </button>
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
