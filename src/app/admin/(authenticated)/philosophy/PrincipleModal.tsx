'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/admin/admin.module.css';
import { updatePrincipleAction, createPrincipleAction } from './actions';
import { Database } from '@/types/database';

type Principle = Database['public']['Tables']['studio_principles']['Row'];
type PublicationStatus = Database['public']['Enums']['publication_status'];

interface PrincipleModalProps {
  isOpen: boolean;
  principle: Principle | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PrincipleModal({
  isOpen,
  principle,
  onClose,
  onSuccess,
}: PrincipleModalProps) {
  const isEditing = Boolean(principle);

  const [id, setId] = useState('');
  const [number, setNumber] = useState('01');
  const [titleEn, setTitleEn] = useState('');
  const [titleId, setTitleId] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [descriptionId, setDescriptionId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [status, setStatus] = useState<PublicationStatus>('published');

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (principle) {
      setId(principle.id);
      setNumber(principle.number);
      setTitleEn(principle.title_en);
      setTitleId(principle.title_id);
      setDescriptionEn(principle.description_en);
      setDescriptionId(principle.description_id);
      setSortOrder(String(principle.sort_order ?? 0));
      setStatus(principle.publication_status);
    } else {
      setId('');
      setNumber('05');
      setTitleEn('');
      setTitleId('');
      setDescriptionEn('');
      setDescriptionId('');
      setSortOrder('5');
      setStatus('published');
    }
    setError(null);
  }, [principle, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.set('number', number);
      formData.set('title_en', titleEn);
      formData.set('title_id', titleId);
      formData.set('description_en', descriptionEn);
      formData.set('description_id', descriptionId);
      formData.set('sort_order', sortOrder);
      formData.set('publication_status', status);

      if (isEditing && principle) {
        const res = await updatePrincipleAction(principle.id, formData);
        if (!res.success) {
          setError(res.error || 'Failed to update principle.');
          return;
        }
      } else {
        formData.set('id', id || `principle-${number}`);
        const res = await createPrincipleAction(formData);
        if (!res.success) {
          setError(res.error || 'Failed to create principle.');
          return;
        }
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="principle-modal-title">
      <div className={styles.modalCard} style={{ maxWidth: '840px', width: '90vw', maxHeight: '90vh', overflowY: 'auto', borderColor: 'var(--border-subtle, #27272a)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle, #27272a)' }}>
          <h2 id="principle-modal-title" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary, #ffffff)', margin: 0 }}>
            {isEditing ? `Edit Principle ${principle?.number}: ${principle?.title_en}` : 'Create New Principle'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted, #71717a)', cursor: 'pointer', fontFamily: 'var(--font-mono, monospace)', fontSize: '1rem', lineHeight: 1 }}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className={styles.messageError} role="alert" style={{ marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
            {!isEditing && (
              <div className={styles.formGroup}>
                <label htmlFor="pr-id" className={styles.formLabel}>
                  Principle Identifier (ID) *
                </label>
                <input
                  id="pr-id"
                  type="text"
                  required
                  disabled={isPending}
                  value={id}
                  onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="e.g. domain-independence"
                  className={styles.formInput}
                  style={{ fontFamily: 'var(--font-mono, monospace)' }}
                />
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="pr-num" className={styles.formLabel}>
                Sequence Number *
              </label>
              <input
                id="pr-num"
                type="text"
                required
                disabled={isPending}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="e.g. 01, 02"
                className={styles.formInput}
                style={{ fontFamily: 'var(--font-mono, monospace)' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pr-sort" className={styles.formLabel}>
                Sort Order
              </label>
              <input
                id="pr-sort"
                type="number"
                disabled={isPending}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={styles.formInput}
                style={{ fontFamily: 'var(--font-mono, monospace)' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="pr-status" className={styles.formLabel}>
                Publication Status
              </label>
              <select
                id="pr-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as PublicationStatus)}
                disabled={isPending}
                className={styles.formSelect}
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className={styles.bilingualGrid}>
            {/* English Column */}
            <div className={styles.bilingualColumn}>
              <div className={styles.langHeader}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>English Axiom</span>
                <span className={styles.langBadge}>EN</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pr-title-en" className={styles.formLabel}>
                  Principle Title (EN) *
                </label>
                <input
                  id="pr-title-en"
                  type="text"
                  required
                  disabled={isPending}
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Domain Independence"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pr-desc-en" className={styles.formLabel}>
                  Principle Description / Essay (EN) *
                </label>
                <textarea
                  id="pr-desc-en"
                  required
                  disabled={isPending}
                  rows={6}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Articulate the core philosophy and operational standard..."
                  className={styles.formTextarea}
                  style={{ minHeight: '160px' }}
                />
              </div>
            </div>

            {/* Indonesian Column */}
            <div className={styles.bilingualColumn}>
              <div className={styles.langHeader}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>Indonesian Axiom</span>
                <span className={styles.langBadge}>ID</span>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pr-title-id" className={styles.formLabel}>
                  Principle Title (ID) *
                </label>
                <input
                  id="pr-title-id"
                  type="text"
                  required
                  disabled={isPending}
                  value={titleId}
                  onChange={(e) => setTitleId(e.target.value)}
                  placeholder="e.g. Independensi Domain"
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="pr-desc-id" className={styles.formLabel}>
                  Principle Description / Essay (ID) *
                </label>
                <textarea
                  id="pr-desc-id"
                  required
                  disabled={isPending}
                  rows={6}
                  value={descriptionId}
                  onChange={(e) => setDescriptionId(e.target.value)}
                  placeholder="Uraikan filosofi inti dan standar operasional studio..."
                  className={styles.formTextarea}
                  style={{ minHeight: '160px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, #27272a)' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className={styles.btnSecondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className={styles.btnPrimary}
            >
              {isPending ? 'Saving...' : isEditing ? 'Update Principle' : 'Create Principle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
