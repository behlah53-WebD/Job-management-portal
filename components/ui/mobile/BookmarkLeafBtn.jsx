'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bookmark, Leaf } from 'lucide-react';
import styles from './BookmarkLeafBtn.module.css';

/**
 * Signature element 4: Bookmark-to-leaf micro-animation
 * Saving a job morphs the bookmark into a small filled green leaf with a tiny scale pop.
 */
export default function BookmarkLeafBtn({
  isSaved = false,
  onToggle,
  loading = false,
  size = 44,
  className = '',
}) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loading) {
      onToggle?.();
    }
  };

  return (
    <button
      type="button"
      className={`${styles.btn} ${isSaved ? styles.btnSaved : ''} ${className}`}
      style={{ width: size, height: size }}
      onClick={handleClick}
      disabled={loading}
      aria-label={isSaved ? 'Remove from saved' : 'Save job'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isSaved ? (
          <motion.div
            key="leaf"
            initial={{ scale: 0.6, rotate: -20, opacity: 0 }}
            animate={{ scale: [1, 1.25, 1], rotate: 0, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className={styles.leafIconWrapper}
          >
            <Leaf size={18} className={styles.leafIcon} />
          </motion.div>
        ) : (
          <motion.div
            key="bookmark"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <Bookmark size={18} className={styles.bookmarkIcon} />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
