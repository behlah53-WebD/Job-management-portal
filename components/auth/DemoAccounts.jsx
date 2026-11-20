'use client';

import React, { useState } from 'react';
import { Sparkles, ChevronDown, User, Briefcase, ShieldCheck } from 'lucide-react';
import styles from './DemoAccounts.module.css';

export default function DemoAccounts({ onSelectAccount }) {
  const [isOpen, setIsOpen] = useState(false);

  // Strictly render ONLY when enabled via environment variable
  const showDemo = process.env.NEXT_PUBLIC_SHOW_DEMO === 'true';
  if (!showDemo) return null;

  const demoRoles = [
    {
      id: 'seeker',
      role: 'Job Seeker',
      desc: 'Browse and apply',
      icon: User,
      email: 'ananya@gmail.com',
      password: 'Seeker@123',
      color: '#1E9A56',
    },
    {
      id: 'employer',
      role: 'Employer',
      desc: 'Post and hire',
      icon: Briefcase,
      email: 'aarav@floralabs.io',
      password: 'Employer@123',
      color: '#167A44',
    },
    {
      id: 'admin',
      role: 'Admin',
      desc: 'Manage platform',
      icon: ShieldCheck,
      email: 'admin@verdant.com',
      password: 'Admin@123',
      color: '#0B3D24',
    },
  ];

  return (
    <div className={styles.container}>
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={styles.headerToggle}
        aria-expanded={isOpen}
      >
        <div className={styles.headerLeft}>
          <div className={styles.sparkleBadge}>
            <Sparkles size={14} className={styles.sparkleIcon} />
          </div>
          <span className={styles.headerTitle}>Explore with a demo account</span>
        </div>
        <ChevronDown size={16} className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} />
      </button>

      {isOpen && (
        <div className={styles.bodyGrid}>
          {demoRoles.map((demo) => {
            const Icon = demo.icon;
            return (
              <button
                suppressHydrationWarning
                key={demo.id}
                type="button"
                onClick={() => onSelectAccount(demo.email, demo.password)}
                className={styles.demoCard}
              >
                <div className={styles.cardTop}>
                  <div className={styles.roleIcon} style={{ color: demo.color }}>
                    <Icon size={16} />
                  </div>
                  <span className={styles.roleName}>{demo.role}</span>
                </div>
                <span className={styles.roleDesc}>{demo.desc}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
