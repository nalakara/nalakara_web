'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Database } from '@/types/database';
import styles from '../../admin.module.css';

type InitiativeRow = Database['public']['Tables']['initiatives']['Row'];
type CategoryRow = Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'name_en' | 'name_id'>;

interface InitiativesTableProps {
  initialInitiatives: InitiativeRow[];
  categories: CategoryRow[];
}

export default function InitiativesTable({
  initialInitiatives,
  categories,
}: InitiativesTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [lifecycleFilter, setLifecycleFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((cat) => {
      map.set(cat.id, cat.name_en);
    });
    return map;
  }, [categories]);

  const filteredInitiatives = useMemo(() => {
    return initialInitiatives.filter((item) => {
      // Publication status filter
      if (statusFilter !== 'all' && item.publication_status !== statusFilter) {
        return false;
      }
      // Lifecycle stage filter
      if (lifecycleFilter !== 'all' && item.lifecycle_stage !== lifecycleFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && item.category_id !== categoryFilter) {
        return false;
      }
      // Search filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesSlug = item.slug.toLowerCase().includes(q);
        const matchesTagline =
          item.tagline_en.toLowerCase().includes(q) ||
          item.tagline_id.toLowerCase().includes(q);
        if (!matchesName && !matchesSlug && !matchesTagline) {
          return false;
        }
      }
      return true;
    });
  }, [initialInitiatives, statusFilter, lifecycleFilter, categoryFilter, searchQuery]);

  return (
    <div>
      {/* Filtering Control Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label htmlFor="filter-status" className={styles.filterLabel}>
            Status:
          </label>
          <select
            id="filter-status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Statuses ({initialInitiatives.length})</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-lifecycle" className={styles.filterLabel}>
            Stage:
          </label>
          <select
            id="filter-lifecycle"
            value={lifecycleFilter}
            onChange={(e) => setLifecycleFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Stages</option>
            <option value="idea">Idea</option>
            <option value="lab">Lab</option>
            <option value="project">Project</option>
            <option value="product">Product</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="filter-category" className={styles.filterLabel}>
            Category:
          </label>
          <select
            id="filter-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup} style={{ flex: 1, minWidth: '180px' }}>
          <input
            type="search"
            placeholder="Search initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.formInput}
            style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.8125rem' }}
          />
        </div>
      </div>

      {/* Initiatives Data Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Initiative</th>
              <th>Category</th>
              <th>Stage</th>
              <th>Access</th>
              <th>Status</th>
              <th>Updated</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInitiatives.length > 0 ? (
              filteredInitiatives.map((item) => {
                const categoryLabel = categoryMap.get(item.category_id) || item.category_id;
                const formattedDate = new Date(item.updated_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <tr key={item.id}>
                    <td>
                      <code style={{ color: 'var(--text-muted, #71717a)' }}>
                        {String(item.sort_order).padStart(2, '0')}
                      </code>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Link
                          href={`/admin/initiatives/${item.id}`}
                          className={styles.actionLink}
                          style={{ fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}
                        >
                          {item.name}
                        </Link>
                        {item.featured && (
                          <span className={styles.featuredBadge}>Featured</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #71717a)', marginTop: '0.15rem' }}>
                        <code>/{item.slug}</code>
                      </div>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem' }}>{categoryLabel}</code>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem' }}>{item.lifecycle_stage}</code>
                    </td>
                    <td>
                      <code style={{ fontSize: '0.75rem' }}>{item.access_model}</code>
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
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted, #71717a)' }}>
                      {formattedDate}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.tableActions} style={{ justifyContent: 'flex-end' }}>
                        <Link
                          href={`/admin/initiatives/${item.id}`}
                          className={`${styles.btn} ${styles.btnSecondary}`}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.6875rem' }}
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted, #71717a)' }}>
                  {initialInitiatives.length === 0 ? (
                    <div>
                      <p style={{ margin: '0 0 1rem 0' }}>No initiatives found in the database registry.</p>
                      <Link href="/admin/initiatives/new" className={`${styles.btn} ${styles.btnPrimary}`}>
                        + Create Your First Initiative
                      </Link>
                    </div>
                  ) : (
                    <div>No initiatives match your selected filter criteria.</div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
