'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Check,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import PasswordField from './PasswordField';
import DemoAccounts from './DemoAccounts';
import styles from './LoginForm.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mapAuthError(rawError) {
  if (!rawError) return '';
  const err = String(rawError).toLowerCase();

  if (err.includes('credentials') || err.includes('invalid email') || err.includes('password')) {
    return "That email and password don't match. Please try again.";
  }
  if (err.includes('suspended') || err.includes('blocked')) {
    return 'This account has been suspended. Please contact support.';
  }
  if (err.includes('429') || err.includes('too many') || err.includes('rate')) {
    return 'Too many attempts. Try again in a few minutes.';
  }
  if (err.includes('fetch') || err.includes('network') || err.includes('failed to fetch')) {
    return "Can't reach Verdant. Check your connection.";
  }
  return rawError;
}

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Validation & status states
  const [emailError, setEmailError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [hasShaken, setHasShaken] = useState(false);
  const [pulseHighlight, setPulseHighlight] = useState(false);

  // Element refs for focus management
  const emailInputRef = useRef(null);
  const submitButtonRef = useRef(null);

  // Prefetch dashboard routes and restore remembered email on mount
  useEffect(() => {
    try {
      router.prefetch('/dashboard');
      router.prefetch('/dashboard/seeker');
      router.prefetch('/dashboard/employer');
      router.prefetch('/dashboard/admin');

      const savedEmail = localStorage.getItem('verdant_remember_email');
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
        if (EMAIL_REGEX.test(savedEmail)) {
          setIsEmailValid(true);
        }
      }
    } catch {}
  }, [router]);

  // Validate email on blur
  const handleEmailBlur = () => {
    if (!email.trim()) {
      setEmailError('Please enter your email address');
      setIsEmailValid(false);
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email (e.g. name@company.com)');
      setIsEmailValid(false);
      return;
    }
    setEmailError('');
    setIsEmailValid(true);
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (emailError) setEmailError('');
    setIsEmailValid(EMAIL_REGEX.test(val));
  };

  // Demo account selection handler
  const handleSelectDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setEmailError('');
    setPasswordError('');
    setAuthError('');
    setIsEmailValid(true);

    // Pulse highlight both inputs
    setPulseHighlight(true);
    setTimeout(() => setPulseHighlight(false), 900);

    // Focus submit button
    setTimeout(() => {
      submitButtonRef.current?.focus();
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (status === 'loading' || status === 'success') return;

    // Reset error banner
    setAuthError('');
    let hasValidationError = false;

    if (!email.trim() || !EMAIL_REGEX.test(email)) {
      setEmailError('Please enter a valid email address');
      hasValidationError = true;
      emailInputRef.current?.focus();
    }

    if (!password) {
      setPasswordError('Please enter your password');
      hasValidationError = true;
    } else {
      setPasswordError('');
    }

    if (hasValidationError) return;

    setStatus('loading');

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      if (!res?.ok) {
        const friendlyMessage = mapAuthError(res?.error || 'Invalid credentials');
        setAuthError(friendlyMessage);
        setStatus('error');

        // Trigger horizontal shake
        setHasShaken(true);
        setTimeout(() => setHasShaken(false), 600);

        emailInputRef.current?.focus();
        return;
      }

      // Persist / clear remember me
      try {
        if (rememberMe) {
          localStorage.setItem('verdant_remember_email', email.trim());
        } else {
          localStorage.removeItem('verdant_remember_email');
        }
      } catch {}

      // Transition to success state
      setStatus('success');
      toast.success('Welcome back to Verdant! 🌿');

      // Immediate redirect: no artificial delay and no extra /api/auth/session fetch waterfall
      const target = callbackUrl || '/dashboard';
      router.push(target);
      router.refresh();
    } catch (err) {
      const friendlyMessage = mapAuthError(err.message);
      setAuthError(friendlyMessage);
      setStatus('error');
      setHasShaken(true);
      setTimeout(() => setHasShaken(false), 600);
    }
  };

  return (
    <div className={styles.formContainer}>
      {/* 1. Lime-tinted Eyebrow Pill */}
      <div className={styles.eyebrowPill}>
        <Sparkles size={13} className={styles.eyebrowIcon} />
        <span>WELCOME BACK</span>
      </div>

      {/* 2. Main Title */}
      <h1 className={styles.title}>
        Sign in to Verdant <span className={styles.titleEmoji} aria-hidden="true">🌿</span>
      </h1>

      {/* 3. Subtitle */}
      <p className={styles.subtitle}>
        Sign in to manage your applications or your candidate pipeline.
      </p>

      {/* Error Alert Banner */}
      {authError && (
        <div className={styles.errorAlertBanner} role="alert" aria-live="assertive">
          <AlertCircle size={18} className={styles.errorIcon} />
          <span className={styles.errorText}>{authError}</span>
        </div>
      )}

      {/* 4. Form */}
      <form
        onSubmit={handleSubmit}
        noValidate
        className={`${styles.form} ${hasShaken ? styles.shakeForm : ''}`}
      >
        {/* Email Field */}
        <div className={styles.fieldGroup}>
          <label htmlFor="login-email" className={styles.fieldLabel}>
            Work or personal email <span className={styles.requiredStar}>*</span>
          </label>

          <div
            className={`${styles.inputBox} ${emailError ? styles.boxError : ''} ${
              pulseHighlight ? styles.boxPulse : ''
            }`}
          >
            <span className={styles.inputLeftIcon} aria-hidden="true">
              <Mail size={20} />
            </span>

            <input
              ref={emailInputRef}
              id="login-email"
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              placeholder="name@company.com"
              autoComplete="username"
              inputMode="email"
              autoCapitalize="none"
              spellCheck={false}
              disabled={status === 'loading' || status === 'success'}
              required
              className={styles.nativeInput}
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'login-email-error' : undefined}
              suppressHydrationWarning
            />

            {/* Valid Check Icon */}
            {isEmailValid && !emailError && (
              <span className={styles.validCheckIcon} aria-hidden="true">
                <CheckCircle2 size={18} />
              </span>
            )}
          </div>

          {emailError && (
            <p id="login-email-error" className={styles.fieldErrorMessage} role="alert">
              {emailError}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className={styles.fieldGroup}>
          <div className={pulseHighlight ? styles.boxPulse : ''}>
            <PasswordField
              id="login-password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              error={passwordError}
              disabled={status === 'loading' || status === 'success'}
              required
            />
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <label className={styles.rememberRow}>
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className={styles.hiddenCheckbox}
            disabled={status === 'loading' || status === 'success'}
          />
          <span className={`${styles.customCheckbox} ${rememberMe ? styles.checkboxChecked : ''}`}>
            {rememberMe && <Check size={13} className={styles.checkCheckmark} />}
          </span>
          <span className={styles.rememberLabel}>Keep me signed in on this device</span>
        </label>

        {/* Submit Button */}
        <button
          ref={submitButtonRef}
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          aria-busy={status === 'loading'}
          className={`${styles.submitBtn} ${status === 'success' ? styles.submitSuccess : ''}`}
        >
          <span className={styles.shimmerEffect} aria-hidden="true" />

          {status === 'loading' && (
            <span className={styles.btnContent}>
              <RotateCw size={18} className={styles.spinner} />
              <span>Signing you in...</span>
            </span>
          )}

          {status === 'success' && (
            <span className={styles.btnContent}>
              <Check size={20} className={styles.successCheck} />
              <span>Welcome back!</span>
            </span>
          )}

          {status !== 'loading' && status !== 'success' && (
            <span className={styles.btnContent}>
              <span>Sign in to Verdant</span>
              <ArrowRight size={18} className={styles.submitArrow} />
            </span>
          )}
        </button>
      </form>

      {/* 5. Demo Accounts Section (Rendered ONLY when NEXT_PUBLIC_SHOW_DEMO === 'true') */}
      <DemoAccounts onSelectAccount={handleSelectDemo} />

      {/* 6. Footer Links */}
      <div className={styles.formFooter}>
        <p className={styles.registerPrompt}>
          New to Verdant?{' '}
          <Link href="/register" className={styles.registerLink}>
            <span>Create an account</span>
            <ArrowRight size={14} className={styles.registerArrow} />
          </Link>
        </p>

        <p className={styles.legalNotice}>
          By continuing you agree to our{' '}
          <Link href="/terms" className={styles.legalLink}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className={styles.legalLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
