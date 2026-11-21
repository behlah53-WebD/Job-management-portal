'use client';

import React, { useRef, useEffect } from 'react';
import styles from './SegmentedTabs.module.css';

/**
 * SegmentedTabs (Mobile): Single horizontally scrollable row with snap, edge fades,
 * sticky positioning, and auto-scroll of selected tab.
 */
export default function SegmentedTabs({
  tabs = [],
  activeTab,
  onChange,
  sticky = false,
  className = '',
}) {
  const containerRef = useRef(null);
  const activeBtnRef = useRef(null);

  // Auto-scroll active tab into view smoothly
  useEffect(() => {
    if (activeBtnRef.current && containerRef.current) {
      const container = containerRef.current;
      const btn = activeBtnRef.current;
      const btnLeft = btn.offsetLeft;
      const btnWidth = btn.offsetWidth;
      const containerWidth = container.offsetWidth;
      const targetScroll = btnLeft - containerWidth / 2 + btnWidth / 2;

      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [activeTab]);

  return (
    <div className={`${styles.tabsOuterWrapper} ${sticky ? styles.stickyTabs : ''} ${className}`}>
      <div className={styles.scrollContainer} ref={containerRef} role="tablist">
        {tabs.map((tab) => {
          const id = typeof tab === 'object' ? tab.id : tab;
          const label = typeof tab === 'object' ? tab.label : tab;
          const count = typeof tab === 'object' ? tab.count : undefined;
          const isActive = activeTab === id;

          return (
            <button
              key={id}
              ref={isActive ? activeBtnRef : null}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${styles.tabPill} ${isActive ? styles.activePill : ''}`}
              onClick={() => onChange(id)}
            >
              <span className={styles.tabLabel}>{label}</span>
              {count !== undefined && (
                <span className={`${styles.countCircle} ${isActive ? styles.activeCountCircle : ''}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
