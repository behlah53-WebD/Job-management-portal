'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Mail,
  User,
  Building,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Check,
  RotateCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthInputField from './AuthInputField';
import PasswordField from './PasswordField';
import authStyles from './AuthForm.module.css';
import styles from './RegisterForm.module.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const getPasswordStrength = (pass) => {
  if (!pass) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pass.length >= 6) score += 1;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#E5584F' };
  if (score <= 3) return { score: 2, label: 'Good', color: '#F2B84B' };
  return { score: 3, label: 'Strong', color: '#1E9A56' };
};

export default function RegisterForm() {
  const router = useRouter();

  const [role, setRole] = useState('jobseeker'); // 'jobseeker' | 'employer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [error, setError] = useState('');
  const [hasShaken, setHasShaken] = useState(false);

  const isBusy = status === 'loading' || status === 'success';
  const isEmailValid = EMAIL_REGEX.test(email.trim());
  const strength = getPasswordStrength(password);

  useEffect(() => {
    try {
      router.prefetch('/dashboard/seeker');
      router.prefetch('/dashboard/employer');
      router.prefetch('/login');
    } catch {}
  }, [router]);

  const triggerShake = () => {
    setHasShaken(true);
    setTimeout(() => setHasShaken(false), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBusy) return;

    setStatus('loading');
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setStatus('error');
      triggerShake();
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          companyName: role === 'employer' ? companyName : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setStatus('success');
      toast.success('Account created! Signing you in... 🌱');

      // Auto sign-in
      const signInRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInRes?.ok) {
        if (role === 'employer') {
          router.push('/dashboard/employer');
        } else {
          router.push('/dashboard/seeker');
        }
      } else if (signInRes?.error) {
        // Sign-in failed after successful registration
        toast.error('Account created but sign-in failed. Please log in manually.');
        router.push('/login');
      } else {
        router.push('/login');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setStatus('error');
      triggerShake();
    }
  };

  return (
    <div className={authStyles.formContainer}>
      {/* 1. Lime-tinted Eyebrow Pill */}
      <div className={authStyles.eyebrowPill}>
        <Sparkles size={13} className={authStyles.eyebrowIcon} />
        <span>GET STARTED</span>
      </div>

      {/* 2. Main Title */}
      <h1 className={authStyles.title}>
        Join Verdant <span className={authStyles.titleEmoji} aria-hidden="true">🌿</span>
      </h1>

      {/* 3. Subtitle */}
      <p className={authStyles.subtitle}>
        Create your account to grow your career.
      </p>

      {/* Segmented Role Toggle */}
      <div className={styles.roleToggle} role="group" aria-label="Account role">
        <button
          suppressHydrationWarning
          type="button"
          className={`${styles.roleOption} ${role === 'jobseeker' ? styles.roleActive : ''}`}
          aria-pressed={role === 'jobseeker'}
          disabled={isBusy}
          onClick={() => setRole('jobseeker')}
        >
          I&apos;m a Job Seeker
        </button>
        <button
          suppressHydrationWarning
          type="button"
          className={`${styles.roleOption} ${role === 'employer' ? styles.roleActive : ''}`}
          aria-pressed={role === 'employer'}
          disabled={isBusy}
          onClick={() => setRole('employer')}
        >
          I&apos;m an Employer
        </button>
      </div>

      {/* Error Alert Banner */}
      {error && (
        <div className={authStyles.errorAlertBanner} role="alert" aria-live="assertive">
          <AlertCircle size={18} className={authStyles.errorIcon} />
          <span className={authStyles.errorText}>{error}</span>
        </div>
      )}

      {/* 4. Form */}
      <form
        onSubmit={handleSubmit}
        className={`${authStyles.form} ${hasShaken ? authStyles.shakeForm : ''}`}
      >
        <AuthInputField
          id="register-name"
          name="name"
          label={role === 'employer' ? 'Your Full Name' : 'Full Name'}
          type="text"
          icon={User}
          required
          placeholder="e.g. Maya Sharma"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isBusy}
        />

        {role === 'employer' && (
          <AuthInputField
            id="register-company"
            name="companyName"
            label="Company / Studio Name"
            type="text"
            icon={Building}
            required
            placeholder="e.g. Acme Botanics"
            autoComplete="organization"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            disabled={isBusy}
          />
        )}

        <AuthInputField
          id="register-email"
          name="email"
          label="Work or Personal Email"
          type="email"
          icon={Mail}
          required
          placeholder="maya@company.com"
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isValid={isEmailValid}
          disabled={isBusy}
        />

        <div className={authStyles.fieldGroup}>
          <PasswordField
            id="register-password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isBusy}
            required
            placeholder="At least 6 characters"
            showForgotPassword={false}
            autoComplete="new-password"
          />

          {password && (
            <div className={styles.strengthMeter}>
              <div className={styles.meterBars}>
                {[1, 2, 3].map((level) => (
                  <div
                    key={level}
                    className={styles.meterBar}
                    style={{
                      backgroundColor: strength.score >= level ? strength.color : '#E9F3EC',
                    }}
                  />
                ))}
              </div>
              <span className={styles.strengthLabel} style={{ color: strength.color }}>
                {strength.label}
              </span>
            </div>
          )}
        </div>

        <button
          suppressHydrationWarning
          type="submit"
          disabled={isBusy}
          aria-busy={status === 'loading'}
          className={`${authStyles.submitBtn} ${status === 'success' ? authStyles.submitSuccess : ''}`}
        >
          <span className={authStyles.shimmerEffect} aria-hidden="true" />

          {status === 'loading' && (
            <span className={authStyles.btnContent}>
              <RotateCw size={18} className={authStyles.spinner} />
              <span>Creating your account...</span>
            </span>
          )}

          {status === 'success' && (
            <span className={authStyles.btnContent}>
              <Check size={20} className={authStyles.successCheck} />
              <span>Account created!</span>
            </span>
          )}

          {status !== 'loading' && status !== 'success' && (
            <span className={authStyles.btnContent}>
              <span>{role === 'employer' ? 'Create Employer Account' : 'Create Seeker Account'}</span>
              <ArrowRight size={18} className={authStyles.submitArrow} />
            </span>
          )}
        </button>
      </form>

      {/* 5. Footer Links */}
      <div className={authStyles.formFooter}>
        <p className={authStyles.registerPrompt}>
          Already have an account?{' '}
          <Link href="/login" className={authStyles.registerLink}>
            <span>Sign in</span>
            <ArrowRight size={14} className={authStyles.registerArrow} />
          </Link>
        </p>

        <p className={authStyles.legalNotice}>
          By continuing you agree to our{' '}
          <Link href="/terms" className={authStyles.legalLink}>
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className={authStyles.legalLink}>
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
