'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import CategoryModal from './CategoryModal';
import { toggleCategoryActiveAction, deleteCategoryAction } from './actions';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

export interface CategoryWithCount extends Category {
  initiativesCount: number;
}

interface CategoriesTableProps {
  initialCategories: CategoryWithCount[];
}

export default function CategoriesTable({ initialCategories }: CategoriesTableProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setModalOpen(true);
    setFeedback(null);
  };

  const handleOpenEdit = (category: Category) => {
    setEditingCategory(category);
    setModalOpen(true);
    setFeedback(null);
  };

  const handleToggleActive = async (cat: CategoryWithCount) => {
    setTogglingId(cat.id);
    setFeedback(null);
    try {
      const res = await toggleCategoryActiveAction(cat.id, !cat.is_active);
      if (res.success) {
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to toggle category status.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'An unexpected error occurred.' });
    } finally {
      setTogglingId(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await deleteCategoryAction(deleteTarget.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Category '${deleteTarget.id}' successfully removed.` });
        setDeleteTarget(null);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete category.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'An unexpected error occurred.' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeaderRow}>
        <div>
          <span className={styles.pageTag}>Taxonomy Governance</span>
          <h1 className={styles.pageTitle}>Category Classifications</h1>
          <p className={styles.pageLead}>
            Define and manage product classifications used across the ecosystem registry.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            + New Category
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.messageSuccess : styles.messageError}
          role="alert"
          style={{ marginBottom: '1.5rem' }}
        >
          {feedback.message}
        </div>
      )}

      <div className={styles.tableWrapper}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Identifier (Slug)</th>
              <th>English Label</th>
              <th>Indonesian Label</th>
              <th>Initiatives Assigned</th>
              <th>Sort Order</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {initialCategories.length > 0 ? (
              initialCategories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem', color: 'var(--text-primary, #ffffff)' }}>
                      {cat.id}
                    </code>
                  </td>
                  <td>
                    <strong>{cat.name_en}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-secondary, #a1a1aa)' }}>{cat.name_id}</span>
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontSize: '0.6875rem',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: cat.initiativesCount > 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(113, 113, 122, 0.1)',
                        color: cat.initiativesCount > 0 ? 'var(--text-primary, #ffffff)' : 'var(--text-muted, #71717a)',
                        border: '1px solid var(--border-subtle, #27272a)',
                      }}
                    >
                      {cat.initiativesCount} {cat.initiativesCount === 1 ? 'initiative' : 'initiatives'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)' }}>{cat.sort_order}</span>
                  </td>
                  <td>
                    <button
                      type="button"
                      disabled={togglingId === cat.id}
                      onClick={() => handleToggleActive(cat)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      <span
                        className={`${styles.statusTag} ${
                          cat.is_active ? styles.statusPublished : styles.statusArchived
                        }`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle active state"
                      >
                        {cat.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(cat)}
                        className={styles.actionLink}
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteTarget(cat);
                          setFeedback(null);
                        }}
                        className={styles.actionLink}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: 0,
                          color: '#f87171',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted, #71717a)' }}>
                  No categories found in database.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Category Modal (Create / Edit) */}
      <CategoryModal
        isOpen={modalOpen}
        category={editingCategory}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setFeedback({
            type: 'success',
            message: editingCategory
              ? `Category '${editingCategory.id}' successfully updated.`
              : 'New category successfully created.',
          });
          router.refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>Confirm Category Removal</div>
            <p className={styles.modalText}>
              Are you sure you want to delete category <strong>{deleteTarget.name_en}</strong> (<code>{deleteTarget.id}</code>)?
            </p>
            {deleteTarget.initiativesCount > 0 ? (
              <div className={styles.messageError} style={{ marginBottom: '1.25rem' }}>
                Warning: {deleteTarget.initiativesCount} initiative(s) currently reference this category. Deletion will be rejected by database constraints until all initiatives are reassigned.
              </div>
            ) : (
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted, #71717a)', marginBottom: '1.25rem' }}>
                This category has 0 assigned initiatives and can be safely deleted.
              </p>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className={styles.btnSecondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className={styles.btnDanger}
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
