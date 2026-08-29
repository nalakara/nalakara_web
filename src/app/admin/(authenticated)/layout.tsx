import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/app/admin/login/actions';
import styles from '../admin.module.css';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Development-only UI inspection bypass. Must never be enabled in production.
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  // If unauthenticated and bypass not active, redirect to login
  if (!user && !isDevBypass) {
    redirect('/admin/login');
  }

  // Verify single-owner allowlist membership when a real user session exists
  if (user) {
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', user.id)
      .single();

    if (!adminUser) {
      return (
        <div className={styles.accessDeniedContainer}>
          <div className={styles.accessDeniedCard}>
            <div className={styles.accessDeniedTitle}>403 · Access Restricted</div>
            <p className={styles.accessDeniedText}>
              Authenticated as <strong>{user.email}</strong>, but this account is not registered in the Nalakara owner allowlist.
            </p>
            <form action={signOutAction}>
              <button type="submit" className={styles.logoutButton}>
                Sign Out →
              </button>
            </form>
          </div>
        </div>
      );
    }
  }

  return (
    <div className={styles.adminContainer}>
      <header className={styles.topBar}>
        <div className={styles.brandGroup}>
          <Link href="/admin" className={styles.brandName}>
            NALAKARA
          </Link>
          <span className={styles.badge}>Content Console</span>
        </div>

        <nav className={styles.navLinks} aria-label="Admin Navigation">
          <Link href="/admin" className={styles.navLink}>
            Dashboard
          </Link>
          <Link href="/admin/initiatives" className={styles.navLink}>
            Initiatives
          </Link>
          <Link href="/admin/categories" className={styles.navLink}>
            Categories
          </Link>
          <Link href="/admin/hero" className={styles.navLink}>
            Hero
          </Link>
          <Link href="/admin/philosophy" className={styles.navLink}>
            Philosophy
          </Link>
          <Link href="/admin/preview" className={styles.navLink} target="_blank">
            Preview ↗
          </Link>
        </nav>

        <div className={styles.userGroup}>
          {isDevBypass && !user ? (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: '0.6875rem',
                color: '#eab308',
                backgroundColor: 'rgba(234, 179, 8, 0.1)',
                border: '1px solid rgba(234, 179, 8, 0.3)',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              LOCAL DEV BYPASS
            </span>
          ) : (
            <span className={styles.userEmail}>{user?.email}</span>
          )}
          {user && (
            <form action={signOutAction}>
              <button type="submit" className={styles.logoutButton}>
                Sign Out
              </button>
            </form>
          )}
        </div>
      </header>

      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
