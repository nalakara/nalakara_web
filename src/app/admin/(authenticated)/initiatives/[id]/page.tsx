import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import InitiativeForm from '../InitiativeForm';
import styles from '../../../admin.module.css';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInitiativePage({ params }: PageProps) {
  const { id } = await params;

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

  // Fetch target initiative and categories concurrently
  const [initiativeRes, categoriesRes] = await Promise.all([
    supabase.from('initiatives').select('*').eq('id', id).single(),
    supabase
      .from('categories')
      .select('id, name_en, name_id')
      .order('sort_order', { ascending: true }),
  ]);

  if (initiativeRes.error || !initiativeRes.data) {
    return (
      <div className={styles.sectionBlock}>
        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <h1 className={styles.pageTitle} style={{ color: '#f87171', marginBottom: '1rem' }}>
            Initiative Not Found
          </h1>
          <p className={styles.pageLead} style={{ marginBottom: '2rem' }}>
            The initiative with identifier <code>{id}</code> could not be located in the database registry.
          </p>
          <Link href="/admin/initiatives" className={`${styles.btn} ${styles.btnPrimary}`}>
            ← Return to Initiatives Registry
          </Link>
        </div>
      </div>
    );
  }

  const initiative = initiativeRes.data;
  const categories = categoriesRes.data || [];

  return (
    <InitiativeForm
      mode="edit"
      initialData={initiative}
      categories={categories}
    />
  );
}
