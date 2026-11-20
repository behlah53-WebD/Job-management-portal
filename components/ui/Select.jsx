'use client';

import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import styles from './Select.module.css';

export default function Select({
  label,
  options = [],
  error,
  icon: Icon,
  id,
  className = '',
  required,
  placeholder,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={selectId} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={`${styles.selectContainer} ${error ? styles.hasError : ''}`}>
        {Icon && (
          <span className={styles.leftIcon}>
            <Icon size={18} />
          </span>
        )}
        <select
          id={selectId}
          className={`${styles.select} ${Icon ? styles.withIcon : ''}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>
        <span className={styles.chevron}>
          <ChevronDown size={18} />
        </span>
      </div>
      {error && (
        <div className={styles.errorMessage}>
          <AlertCircle size={14} className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
