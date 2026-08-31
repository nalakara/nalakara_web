import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { signOutAction } from '@/app/admin/login/actions';
import styles from '../admin.module.css';

export default async function AdminPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Development-only UI inspection bypass
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  if (!user && !isDevBypass) {
    redirect('/admin/login');
  }

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

  // Render children in full-bleed viewport without admin top nav
  return <>{children}</>;
}
