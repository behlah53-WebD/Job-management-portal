'use client';

import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import authStyles from './AuthForm.module.css';

/**
 * Shared text/email field used across login and registration forms so inputs
 * match the AuthShell design system (52px height, white autofill, focus ring).
 */
export default function AuthInputField({
  id,
  label,
  icon: Icon,
  error,
  isValid = false,
  pulseHighlight = false,
  disabled = false,
  required = false,
  inputRef,
  ...inputProps
}) {
  return (
    <div className={authStyles.fieldGroup}>
      <label htmlFor={id} className={authStyles.fieldLabel}>
        {label} {required && <span className={authStyles.requiredStar}>*</span>}
      </label>

      <div
        className={`${authStyles.inputBox} ${error ? authStyles.boxError : ''} ${
          pulseHighlight ? authStyles.boxPulse : ''
        } ${disabled ? authStyles.boxDisabled : ''}`}
      >
        {Icon && (
          <span className={authStyles.inputLeftIcon} aria-hidden="true">
            <Icon size={20} />
          </span>
        )}

        <input
          ref={inputRef}
          id={id}
          disabled={disabled}
          required={required}
          className={authStyles.nativeInput}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          suppressHydrationWarning
          {...inputProps}
        />

        {isValid && !error && (
          <span className={authStyles.validCheckIcon} aria-hidden="true">
            <CheckCircle2 size={18} />
          </span>
        )}
      </div>

      {error && (
        <p id={`${id}-error`} className={authStyles.fieldErrorMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
