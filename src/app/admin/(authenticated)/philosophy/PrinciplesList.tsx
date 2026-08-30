'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import PrincipleModal from './PrincipleModal';
import { deletePrincipleAction } from './actions';
import { Database } from '@/types/database';

type Principle = Database['public']['Tables']['studio_principles']['Row'];

interface PrinciplesListProps {
  initialPrinciples: Principle[];
}

export default function PrinciplesList({ initialPrinciples }: PrinciplesListProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPrinciple, setEditingPrinciple] = useState<Principle | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Principle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleOpenCreate = () => {
    setEditingPrinciple(null);
    setModalOpen(true);
    setFeedback(null);
  };

  const handleOpenEdit = (principle: Principle) => {
    setEditingPrinciple(principle);
    setModalOpen(true);
    setFeedback(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setFeedback(null);

    try {
      const res = await deletePrincipleAction(deleteTarget.id);
      if (res.success) {
        setFeedback({ type: 'success', message: `Principle '${deleteTarget.number}' successfully removed.` });
        setDeleteTarget(null);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete principle.' });
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
          <span className={styles.pageTag}>Studio Axioms</span>
          <h1 className={styles.pageTitle}>Foundational Principles</h1>
          <p className={styles.pageLead}>
            Manage the core operational philosophies and craftsmanship standards articulated on the public site.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleOpenCreate}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            + New Principle
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.messageSuccess : styles.messageError}
          role="alert"
          style={{ marginBottom: '1.75rem' }}
        >
          {feedback.message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {initialPrinciples.length > 0 ? (
          initialPrinciples.map((item) => (
            <div key={item.id} className={styles.formCard} style={{ margin: 0, padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '1.125rem',
                      fontWeight: 700,
                      color: 'var(--text-primary, #ffffff)',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid var(--border-subtle, #27272a)',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '4px',
                      lineHeight: 1,
                    }}
                  >
                    {item.number}
                  </span>
                  <div>
                    <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)', margin: '0 0 0.25rem 0' }}>
                      {item.title_en}
                    </h3>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #a1a1aa)' }}>
                      {item.title_id}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    style={{ padding: '0.4rem 0.875rem' }}
                  >
                    Edit Axiom
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
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
              </div>

              {/* Side-by-side snippet preview */}
              <div className={styles.bilingualGrid} style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(39, 39, 42, 0.5)' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: 'var(--text-muted, #71717a)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    English Copy (EN)
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #a1a1aa)', margin: 0, lineHeight: 1.5 }}>
                    {item.description_en}
                  </p>
                </div>

                <div>
                  <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.6875rem', color: 'var(--text-muted, #71717a)', textTransform: 'uppercase', display: 'block', marginBottom: '0.35rem' }}>
                    Indonesian Copy (ID)
                  </span>
                  <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #a1a1aa)', margin: 0, lineHeight: 1.5 }}>
                    {item.description_id}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.formCard} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ color: 'var(--text-muted, #71717a)', margin: 0 }}>No studio principles found in database.</p>
          </div>
        )}
      </div>

      {/* Principle Modal */}
      <PrincipleModal
        isOpen={modalOpen}
        principle={editingPrinciple}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setFeedback({
            type: 'success',
            message: editingPrinciple
              ? `Principle ${editingPrinciple.number} successfully updated.`
              : 'New principle successfully created.',
          });
          router.refresh();
        }}
      />

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true">
          <div className={styles.modalCard}>
            <div className={styles.modalTitle}>Confirm Principle Removal</div>
            <p className={styles.modalText}>
              Are you sure you want to delete principle <strong>{deleteTarget.number}: {deleteTarget.title_en}</strong>?
            </p>
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
