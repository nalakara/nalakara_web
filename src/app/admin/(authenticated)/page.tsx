import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import styles from '../admin.module.css';

export default async function AdminDashboardPage() {
  // Determine whether local development bypass is active
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  let supabase;
  if (isDevBypass) {
    // Dynamic server-only import to guarantee zero client bundle leakage
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  } else {
    supabase = await createClient();
  }

  // Fetch metrics and recent items with explicit error capture
  const [
    initiativesRes,
    categoriesRes,
    heroConfigRes,
    principlesRes,
  ] = await Promise.all([
    supabase
      .from('initiatives')
      .select('id, name, category_id, lifecycle_stage, publication_status, sort_order, updated_at')
      .order('sort_order', { ascending: true }),
    supabase.from('categories').select('id, name_en, is_active'),
    supabase.from('hero_config').select('mode, featured_initiative_id, show_lifecycle_bar').eq('id', 'primary').single(),
    supabase.from('studio_principles').select('id, number, title_en'),
  ]);

  const queryErrors = [
    initiativesRes.error ? `Initiatives: ${initiativesRes.error.message}` : null,
    categoriesRes.error ? `Categories: ${categoriesRes.error.message}` : null,
    heroConfigRes.error ? `Hero Config: ${heroConfigRes.error.message}` : null,
    principlesRes.error ? `Principles: ${principlesRes.error.message}` : null,
  ].filter(Boolean);

  const initiatives = initiativesRes.data;
  const categories = categoriesRes.data;
  const heroConfig = heroConfigRes.data;
  const principles = principlesRes.data;

  const totalInitiatives = initiatives?.length ?? 0;
  const publishedCount = initiatives?.filter((i) => i.publication_status === 'published').length ?? 0;
  const draftCount = initiatives?.filter((i) => i.publication_status === 'draft').length ?? 0;
  const archivedCount = initiatives?.filter((i) => i.publication_status === 'archived').length ?? 0;
  const activeCategoriesCount = categories?.filter((c) => c.is_active).length ?? 0;

  return (
    <div>
      <div className={styles.pageHeader}>
        <span className={styles.pageTag}>Operational Overview</span>
        <h1 className={styles.pageTitle}>System Status & Content Registry</h1>
        <p className={styles.pageLead}>
          Nalakara Web v1.2 content console. Manage initiatives, taxonomies, and presentation modes.
        </p>
      </div>

      {queryErrors.length > 0 && (
        <div className={styles.messageError} role="alert" style={{ marginBottom: '2rem' }}>
          <strong>Database Connection Error:</strong>
          <ul style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
            {queryErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Initiatives</div>
          <div className={styles.statValue}>{totalInitiatives}</div>
          <div className={styles.statDetail}>
            {publishedCount} Published · {draftCount} Draft · {archivedCount} Archived
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Categories</div>
          <div className={styles.statValue}>{categories?.length ?? 0}</div>
          <div className={styles.statDetail}>{activeCategoriesCount} Active Taxonomies</div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Hero Presentation</div>
          <div className={styles.statValue} style={{ fontSize: '1.25rem', textTransform: 'uppercase' }}>
            {heroConfig?.mode === 'studio' ? 'Studio Mode' : 'Featured Mode'}
          </div>
          <div className={styles.statDetail}>
            Lifecycle Bar: {heroConfig?.show_lifecycle_bar ? 'Active' : 'Hidden'}
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statLabel}>Studio Principles</div>
          <div className={styles.statValue}>{principles?.length ?? 0}</div>
          <div className={styles.statDetail}>Axioms Configured</div>
        </div>
      </div>

      <div className={styles.sectionBlock}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Initiatives Status Matrix</h2>
        </div>

        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Initiative</th>
              <th>Category</th>
              <th>Lifecycle Stage</th>
              <th>Publication Status</th>
              <th>Order</th>
            </tr>
          </thead>
          <tbody>
            {initiatives && initiatives.length > 0 ? (
              initiatives.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <code>{item.category_id}</code>
                  </td>
                  <td>
                    <code>{item.lifecycle_stage}</code>
                  </td>
                  <td>
                    <span
                      className={`${styles.statusTag} ${
                        item.publication_status === 'published'
                          ? styles.statusPublished
                          : item.publication_status === 'draft'
                          ? styles.statusDraft
                          : styles.statusArchived
                      }`}
                    >
                      {item.publication_status}
                    </span>
                  </td>
                  <td>{item.sort_order}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: '#71717a' }}>
                  No initiatives found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
