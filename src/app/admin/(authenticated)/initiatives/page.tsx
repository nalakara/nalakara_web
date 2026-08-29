import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from '../../admin.module.css';
import InitiativesTable from './InitiativesTable';

export const dynamic = 'force-dynamic';

export default async function AdminInitiativesPage() {
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  let supabase;
  if (isDevBypass) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  } else {
    supabase = await createClient();
  }

  // Fetch all initiatives and categories for filtering/display
  const [initiativesRes, categoriesRes] = await Promise.all([
    supabase
      .from('initiatives')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name_en, name_id')
      .order('sort_order', { ascending: true }),
  ]);

  const hasDbError = initiativesRes.error !== null;
  const dbErrorMessage = initiativesRes.error?.message || categoriesRes.error?.message;
  const initiatives = initiativesRes.data || [];
  const categories = categoriesRes.data || [];

  return (
    <div>
      <div className={styles.pageHeaderRow}>
        <div>
          <span className={styles.pageTag}>Operational Registry</span>
          <h1 className={styles.pageTitle}>Initiatives Management</h1>
          <p className={styles.pageLead}>
            Manage and publish initiatives across lifecycle stages and taxonomies.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/admin/initiatives/new" className={`${styles.btn} ${styles.btnPrimary}`}>
            + New Initiative
          </Link>
        </div>
      </div>

      {hasDbError && (
        <div className={styles.messageError} role="alert" style={{ marginBottom: '1.5rem' }}>
          <strong>Database Error:</strong> {dbErrorMessage}
        </div>
      )}

      {!hasDbError && (
        <InitiativesTable
          initialInitiatives={initiatives}
          categories={categories}
        />
      )}
    </div>
  );
}
