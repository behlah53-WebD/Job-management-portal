'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Input.module.css';

export default function Input({
  label,
  error,
  icon: Icon,
  rightElement,
  helperText,
  id,
  className = '',
  required,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label} {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={`${styles.inputContainer} ${error ? styles.hasError : ''}`}>
        {Icon && (
          <span className={styles.leftIcon}>
            <Icon size={18} />
          </span>
        )}
        <input
          suppressHydrationWarning
          id={inputId}
          className={`${styles.input} ${Icon ? styles.withIcon : ''} ${
            rightElement ? styles.withRightElement : ''
          }`}
          {...props}
        />
        {rightElement && <div className={styles.rightElement}>{rightElement}</div>}
      </div>
      {error ? (
        <div className={styles.errorMessage}>
          <AlertCircle size={14} className={styles.errorIcon} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span className={styles.helperText}>{helperText}</span>
      ) : null}
    </div>
  );
}
