'use client';

import React, { useState, useEffect } from 'react';
import styles from '@/app/admin/admin.module.css';
import { createCategoryAction, updateCategoryAction } from './actions';
import { Database } from '@/types/database';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryModalProps {
  isOpen: boolean;
  category: Category | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CategoryModal({
  isOpen,
  category,
  onClose,
  onSuccess,
}: CategoryModalProps) {
  const isEditing = Boolean(category);

  const [id, setId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameId, setNameId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isActive, setIsActive] = useState(true);

  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setId(category.id);
      setNameEn(category.name_en);
      setNameId(category.name_id);
      setSortOrder(String(category.sort_order ?? 0));
      setIsActive(category.is_active);
    } else {
      setId('');
      setNameEn('');
      setNameId('');
      setSortOrder('0');
      setIsActive(true);
    }
    setError(null);
  }, [category, isOpen]);

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
      formData.set('name_en', nameEn);
      formData.set('name_id', nameId);
      formData.set('sort_order', sortOrder);
      formData.set('is_active', isActive ? 'true' : 'false');

      if (isEditing && category) {
        const res = await updateCategoryAction(category.id, formData);
        if (!res.success) {
          setError(res.error || 'Failed to update category.');
          return;
        }
      } else {
        formData.set('id', id);
        const res = await createCategoryAction(formData);
        if (!res.success) {
          setError(res.error || 'Failed to create category.');
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
    <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
      <div className={styles.modalCard} style={{ maxWidth: '580px', borderColor: 'var(--border-subtle, #27272a)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle, #27272a)' }}>
          <h2 id="category-modal-title" style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-primary, #ffffff)', margin: 0 }}>
            {isEditing ? `Edit Category: ${category?.id}` : 'Create New Category'}
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
          <div className={styles.formGroup}>
            <label htmlFor="cat-id" className={styles.formLabel}>
              Category Identifier (Slug) {isEditing && <span style={{ color: 'var(--text-muted, #71717a)' }}>(Immutable)</span>}
            </label>
            <input
              id="cat-id"
              type="text"
              required
              disabled={isEditing || isPending}
              value={id}
              onChange={(e) => setId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
              placeholder="e.g. creative-tool, digital-system"
              className={styles.formInput}
              style={{ fontFamily: 'var(--font-mono, monospace)', opacity: isEditing ? 0.7 : 1 }}
            />
            {!isEditing && (
              <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #71717a)', fontFamily: 'var(--font-mono, monospace)' }}>
                Lowercase alphanumeric and hyphens only. Permanent identifier used in database references.
              </span>
            )}
          </div>

          <div className={styles.bilingualGrid}>
            <div className={styles.bilingualColumn}>
              <div className={styles.langHeader}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>English Name</span>
                <span className={styles.langBadge}>EN</span>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cat-name-en" className={styles.formLabel}>
                  Display Label (EN) *
                </label>
                <input
                  id="cat-name-en"
                  type="text"
                  required
                  disabled={isPending}
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Software"
                  className={styles.formInput}
                />
              </div>
            </div>

            <div className={styles.bilingualColumn}>
              <div className={styles.langHeader}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary, #ffffff)' }}>Indonesian Name</span>
                <span className={styles.langBadge}>ID</span>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="cat-name-id" className={styles.formLabel}>
                  Display Label (ID) *
                </label>
                <input
                  id="cat-name-id"
                  type="text"
                  required
                  disabled={isPending}
                  value={nameId}
                  onChange={(e) => setNameId(e.target.value)}
                  placeholder="e.g. Perangkat Lunak"
                  className={styles.formInput}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div className={styles.formGroup}>
              <label htmlFor="cat-sort" className={styles.formLabel}>
                Sort Order
              </label>
              <input
                id="cat-sort"
                type="number"
                disabled={isPending}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className={styles.formInput}
                style={{ fontFamily: 'var(--font-mono, monospace)' }}
              />
            </div>

            <div className={styles.formGroup} style={{ justifyContent: 'center' }}>
              <span className={styles.formLabel}>Catalog Visibility</span>
              <label className={styles.checkboxContainer} style={{ marginTop: '0.35rem' }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  disabled={isPending}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span>Active in Ecosystem</span>
              </label>
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
              {isPending ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
