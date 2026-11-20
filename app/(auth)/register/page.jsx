'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import {
  Sprout,
  Mail,
  Lock,
  User,
  Building,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Logo from '@/components/ui/Logo';
import toast from 'react-hot-toast';
import styles from './register.module.css';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState('jobseeker'); // 'jobseeker' | 'employer'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password strength calculation
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

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.splitLayout}>
      {/* Left 50% Brand Panel */}
      <div className={styles.brandPanel}>
        <div className={styles.brandContent}>
          <Logo size="md" />

          <div className={styles.quoteBlock}>
            <h2 className={styles.quoteHeadline}>
              "Start where you are. Use what you have. Grow what matters."
            </h2>
            <p className={styles.quoteSub}>
              Whether you are discovering your next career milestone or building an intentional team, Verdant provides the clean, respectful space you deserve.
            </p>
          </div>

          <div className={styles.floatingPreview}>
            <div className={styles.previewIcon}>🌱</div>
            <div>
              <span className={styles.previewTitle}>Transparent Salaries</span>
              <span className={styles.previewSub}>Clear salary bands on every post</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right 50% Form Container */}
      <div className={styles.formContainer}>
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h1 className={styles.formTitle}>Join Verdant</h1>
            <p className={styles.formSubtitle}>Create your account to grow your career.</p>
          </div>

          {/* Segmented Role Toggle */}
          <div className={styles.roleToggle}>
            <button
              type="button"
              className={`${styles.roleOption} ${role === 'jobseeker' ? styles.roleActive : ''}`}
              onClick={() => setRole('jobseeker')}
            >
              I'm a Job Seeker
            </button>
            <button
              type="button"
              className={`${styles.roleOption} ${role === 'employer' ? styles.roleActive : ''}`}
              onClick={() => setRole('employer')}
            >
              I'm an Employer
            </button>
          </div>

          {error && <div className={styles.errorAlert}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label={role === 'employer' ? 'Your Full Name' : 'Full Name'}
              type="text"
              icon={User}
              required
              placeholder="e.g. Maya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {role === 'employer' && (
              <Input
                label="Company / Studio Name"
                type="text"
                icon={Building}
                required
                placeholder="e.g. Acme Botanics"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            )}

            <Input
              label="Work or Personal Email"
              type="email"
              icon={Mail}
              required
              placeholder="maya@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className={styles.passwordField}>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                icon={Lock}
                required
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />

              {password && (
                <div className={styles.strengthMeter}>
                  <div className={styles.meterBars}>
                    <div
                      className={styles.meterBar}
                      style={{
                        backgroundColor: strength.score >= 1 ? strength.color : '#E9F3EC',
                      }}
                    />
                    <div
                      className={styles.meterBar}
                      style={{
                        backgroundColor: strength.score >= 2 ? strength.color : '#E9F3EC',
                      }}
                    />
                    <div
                      className={styles.meterBar}
                      style={{
                        backgroundColor: strength.score >= 3 ? strength.color : '#E9F3EC',
                      }}
                    />
                  </div>
                  <span className={styles.strengthLabel} style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
            >
              {role === 'employer' ? 'Create Employer Account 🌱' : 'Create Seeker Account 🌿'}
            </Button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link href="/login" className={styles.switchLink}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
