'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import styles from '../admin.module.css';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('nalakara.id@gmail.com');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }

    setIsPending(true);

    try {
      const supabase = createClient();
      const origin = window.location.origin || 'http://localhost:3005';

      const { error: authError } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes('rate limit') || msg.includes('over_email_send_rate_limit')) {
          setError('Email delivery limit has been temporarily reached by Supabase. Please wait a few minutes before requesting another Magic Link.');
        } else if (msg.includes('invalid email') || msg.includes('validation')) {
          setError('The email address provided is invalid. Please check and try again.');
        } else {
          setError(authError.message || 'Unable to send magic link. Please check your configuration.');
        }
      } else {
        setSuccess(`Magic link successfully sent to ${trimmedEmail}. Please check your inbox and click the authentication link to enter the Content Console.`);
      }
    } catch (err: any) {
      setError('A network error occurred while connecting to Supabase. Please check your internet connection.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>NALAKARA</div>
          <div className={styles.loginSubtext}>
            Content Console · Restricted Access
          </div>
        </div>

        {error && (
          <div className={styles.messageError} role="alert">
            {error}
          </div>
        )}

        {success ? (
          <div className={styles.messageSuccess} role="status">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>
                Authorized Owner Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@nalakara.com"
                className={styles.formInput}
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isPending}
            >
              {isPending ? 'Sending Magic Link...' : 'Send Magic Link →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
