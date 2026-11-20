'use client';

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './PasswordField.module.css';

export default function PasswordField({
  id = 'password',
  name = 'password',
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = true,
  placeholder = '••••••••',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyEvent = (e) => {
    if (typeof e.getModifierState === 'function') {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleForgotPassword = () => {
    toast('A secure reset link has been dispatched to your email! 🌱', {
      icon: '🌿',
      duration: 4500,
    });
  };

  return (
    <div className={styles.fieldWrapper}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          Password {required && <span className={styles.requiredStar}>*</span>}
        </label>
        <button
          suppressHydrationWarning
          type="button"
          onClick={handleForgotPassword}
          className={styles.forgotLink}
          tabIndex={0}
        >
          Forgot password?
        </button>
      </div>

      <div
        className={`${styles.inputContainer} ${isFocused ? styles.focused : ''} ${
          error ? styles.hasError : ''
        } ${disabled ? styles.disabled : ''}`}
      >
        <span className={`${styles.leftIcon} ${isFocused ? styles.iconActive : ''}`} aria-hidden="true">
          <Lock size={20} />
        </span>

        <input
          id={id}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            setCapsLockActive(false);
            onBlur && onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyEvent}
          onKeyUp={handleKeyEvent}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="current-password"
          className={styles.nativeInput}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          suppressHydrationWarning
        />

        <button
          suppressHydrationWarning
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={styles.eyeBtn}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      {/* Caps Lock Alert Hint */}
      {capsLockActive && (
        <div className={styles.capsLockHint} role="status" aria-live="polite">
          <AlertTriangle size={13} className={styles.capsIcon} />
          <span>Caps Lock is on</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <p id={`${id}-error`} className={styles.errorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
