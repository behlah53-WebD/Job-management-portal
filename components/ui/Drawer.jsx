'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import styles from './Drawer.module.css';

export default function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  width = '520px',
  position = 'right', // 'right' | 'left' | 'bottom'
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose && onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        className={`${styles.drawer} ${styles[position]}`}
        style={position === 'bottom' ? { maxHeight: '80vh' } : { width, maxWidth: '100vw' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            {title && <h3 className={styles.title}>{title}</h3>}
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
}
