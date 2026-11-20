'use client';

import React from 'react';
import styles from './Tabs.module.css';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`${styles.tabsContainer} ${className}`} role="tablist">
      {tabs.map((tab) => {
        const id = typeof tab === 'object' ? tab.id : tab;
        const label = typeof tab === 'object' ? tab.label : tab;
        const count = typeof tab === 'object' ? tab.count : undefined;
        const isActive = activeTab === id;

        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`${styles.tabBtn} ${isActive ? styles.active : ''}`}
            onClick={() => onChange(id)}
          >
            <span>{label}</span>
            {count !== undefined && (
              <span className={`${styles.countBadge} ${isActive ? styles.countActive : ''}`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
