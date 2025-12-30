'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, X, Lock, ArrowLeft } from 'lucide-react';
import styles from '../signin/auth.module.css';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});

  useEffect(() => {
    // If user is already signed in, redirect to home
    if (session) {
      router.push('/');
      return;
    }

    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
      setValidating(false);
      return;
    }

    setToken(tokenParam);
    validateToken(tokenParam);
  }, [searchParams, session, router]);

  const validateToken = async (tokenToValidate: string) => {
    try {
      const response = await fetch(`/api/auth/reset-password?token=${tokenToValidate}`);
      const data = await response.json();

      if (data.valid) {
        setTokenValid(true);
      } else {
        setError(data.error || 'Invalid or expired reset token. Please request a new password reset.');
      }
    } catch (err) {
      setError('Failed to validate reset token. Please try again.');
    } finally {
      setValidating(false);
    }
  };

  const validateForm = () => {
    const errors: { password?: string; confirmPassword?: string } = {};

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password. Please try again.');
      } else {
        setSuccess(data.message || 'Password reset successfully!');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <span className={styles.spinner} style={{ width: '24px', height: '24px', margin: '0 auto', display: 'block' }}></span>
            <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Validating reset token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>Invalid Reset Link</h1>
          
          {error && (
            <div className={styles.error}>
              <AlertCircle size={18} className={styles.errorIcon} />
              <span>{error}</span>
            </div>
          )}

          <p style={{ textAlign: 'center', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '24px' }}>
            The password reset link is invalid or has expired. Password reset links expire after 5 minutes.
          </p>

          <div className={styles.buttonWrapper}>
            <Link href="/auth/forgot-password" className={styles.button} style={{ textDecoration: 'none' }}>
              Request New Reset Link
            </Link>
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Link href="/auth/signin" className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>
        <p className={styles.subtitle}>
          Enter your new password below
        </p>

        {error && (
          <div className={styles.error}>
            <AlertCircle size={18} className={styles.errorIcon} />
            <span>{error}</span>
            <button 
              type="button"
              onClick={() => setError('')}
              className={styles.errorClose}
              aria-label="Close error"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className={styles.success}>
            <CheckCircle size={18} className={styles.successIcon} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="password">
              New Password <span className={styles.required}>*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (fieldErrors.password) {
                  setFieldErrors({ ...fieldErrors, password: undefined });
                }
                if (confirmPassword && fieldErrors.confirmPassword) {
                  setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                }
              }}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={fieldErrors.password ? styles.inputError : ''}
              aria-invalid={!!fieldErrors.password}
              aria-describedby={fieldErrors.password ? 'password-error' : undefined}
            />
            {fieldErrors.password && (
              <span id="password-error" className={styles.fieldError}>
                {fieldErrors.password}
              </span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">
              Confirm New Password <span className={styles.required}>*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (fieldErrors.confirmPassword) {
                  setFieldErrors({ ...fieldErrors, confirmPassword: undefined });
                }
              }}
              required
              placeholder="Re-enter your new password"
              className={fieldErrors.confirmPassword ? styles.inputError : ''}
              aria-invalid={!!fieldErrors.confirmPassword}
              aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
            {fieldErrors.confirmPassword && (
              <span id="confirmPassword-error" className={styles.fieldError}>
                {fieldErrors.confirmPassword}
              </span>
            )}
          </div>

          <div className={styles.buttonWrapper}>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  <Lock size={18} />
                  Reset Password
                </>
              )}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link href="/auth/signin" className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

