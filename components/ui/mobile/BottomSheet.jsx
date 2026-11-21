'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './BottomSheet.module.css';

export default function BottomSheet({
  isOpen = false,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = '90dvh',
  showCloseBtn = true,
  className = '',
}) {
  const sheetRef = useRef(null);

  // Close on Escape key & manage body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keydown', handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlayRoot}>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            ref={sheetRef}
            className={`${styles.sheet} ${className}`}
            style={{ maxHeight }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose?.();
              }
            }}
            role="dialog"
            aria-modal="true"
          >
            {/* Drag Handle Bar */}
            <div className={styles.handleArea}>
              <div className={styles.handleBar} />
            </div>

            {/* Header if title provided */}
            {(title || showCloseBtn) && (
              <div className={styles.header}>
                <div className={styles.headerText}>
                  {title && <h3 className={styles.title}>{title}</h3>}
                  {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                </div>
                {showCloseBtn && (
                  <button
                    type="button"
                    className={styles.closeBtn}
                    onClick={onClose}
                    aria-label="Close"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Content area */}
            <div className={styles.content}>{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
