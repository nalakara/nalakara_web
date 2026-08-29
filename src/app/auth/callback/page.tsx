'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from '@/app/admin/admin.module.css';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      try {
        const supabase = createClient();
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error || errorDescription) {
          setStatus('error');
          setErrorMessage(errorDescription || 'Authentication failed or link expired. Please request a new Magic Link.');
          return;
        }

        if (code) {
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setStatus('error');
            setErrorMessage(exchangeError.message || 'Unable to exchange verification code. The link may have expired.');
            return;
          }

          if (data?.session) {
            setStatus('success');
            // Navigate cleanly to admin console
            window.location.href = '/admin';
            return;
          }
        }

        // If no code, check if session already exists in browser
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setStatus('success');
          window.location.href = '/admin';
          return;
        }

        setStatus('error');
        setErrorMessage('No authentication code found. Please request a new Magic Link.');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err?.message || 'An unexpected error occurred during verification.');
      }
    }

    handleAuth();
  }, [router]);

  return (
    <div className={styles.loginWrapper}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <div className={styles.loginLogo}>NALAKARA</div>
          <div className={styles.loginSubtext}>
            Content Console · Restricted Access
          </div>
        </div>

        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: '0.875rem',
              color: 'var(--text-primary, #ffffff)',
              marginBottom: '0.5rem'
            }}>
              Authenticating session...
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted, #71717a)',
              margin: 0
            }}>
              Verifying Magic Link credentials with Supabase.
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className={styles.messageSuccess} role="status">
            Authentication verified. Entering Content Console...
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className={styles.messageError} role="alert" style={{ marginBottom: '1.25rem' }}>
              {errorMessage}
            </div>
            <a
              href="/admin/login"
              className={styles.submitButton}
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none'
              }}
            >
              ← Return to Login
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
