'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, X, ArrowLeft, Mail } from 'lucide-react';
import styles from '../signin/auth.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldError, setFieldError] = useState('');

  useEffect(() => {
    // If user is already signed in, redirect to home
    if (session) {
      router.push('/');
    }
  }, [session, router]);

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setFieldError('');

    const emailError = validateEmail(email);
    if (emailError) {
      setFieldError(emailError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email. Please try again.');
      } else {
        setSuccess(data.message || 'If an account with that email exists, a password reset link has been sent.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password?</h1>
        <p className={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password
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
            <Mail size={18} className={styles.successIcon} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="email">
              Email Address <span className={styles.required}>*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldError) {
                  setFieldError('');
                }
              }}
              required
              placeholder="your@email.com"
              className={fieldError ? styles.inputError : ''}
              aria-invalid={!!fieldError}
              aria-describedby={fieldError ? 'email-error' : undefined}
            />
            {fieldError && (
              <span id="email-error" className={styles.fieldError}>
                {fieldError}
              </span>
            )}
          </div>

          <div className={styles.buttonWrapper}>
            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? (
                <>
                  <span className={styles.spinner}></span>
                  Sending...
                </>
              ) : (
                <>
                  <Mail size={18} />
                  Send Reset Link
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

        <p className={styles.footer}>
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

