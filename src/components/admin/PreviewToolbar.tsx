'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/types';
import styles from './PreviewToolbar.module.css';

interface PreviewToolbarProps {
  draftCount: number;
}

export const PreviewToolbar: React.FC<PreviewToolbarProps> = ({ draftCount }) => {
  const { language, setLanguage } = useLanguage();
  const [showPublishInfo, setShowPublishInfo] = useState(false);

  return (
    <>
      <aside className={styles.toolbarDock} aria-label="Preview Editorial Toolbar">
        <div className={styles.statusGroup}>
          <span className={styles.liveDot} aria-hidden="true" />
          <span className={styles.modeLabel}>Preview</span>
          {draftCount > 0 ? (
            <span className={styles.draftBadge}>
              {draftCount} Draft{draftCount === 1 ? '' : 's'} Active
            </span>
          ) : (
            <span style={{ color: '#71717a', fontSize: '0.6875rem' }}>All Published</span>
          )}
        </div>

        <div className={styles.controlGroup}>
          {/* Language Switcher */}
          <div className={styles.langToggle} role="group" aria-label="Preview Language Toggle">
            <button
              type="button"
              className={`${styles.langButton} ${language === 'en' ? styles.langButtonActive : ''}`}
              onClick={() => setLanguage('en')}
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              className={`${styles.langButton} ${language === 'id' ? styles.langButtonActive : ''}`}
              onClick={() => setLanguage('id')}
              aria-pressed={language === 'id'}
            >
              ID
            </button>
          </div>

          {/* Return to Admin Console */}
          <Link href="/admin" className={styles.actionButton}>
            <span>Console</span>
            <span aria-hidden="true">↗</span>
          </Link>

          {/* Publish Boundary Action */}
          <button
            type="button"
            className={`${styles.actionButton} ${styles.publishButton}`}
            onClick={() => setShowPublishInfo(true)}
          >
            Publish
          </button>
        </div>
      </aside>

      {/* Boundary Modal for Publishing Guidance */}
      {showPublishInfo && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-dialog-title"
          onClick={() => setShowPublishInfo(false)}
        >
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div id="publish-dialog-title" className={styles.modalTitle}>
                Publication Architecture
              </div>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setShowPublishInfo(false)}
                style={{ padding: '0.2rem 0.5rem' }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                Preview accurately reflects your live Supabase database state including <strong>{draftCount} active draft{draftCount === 1 ? '' : 's'}</strong>.
              </p>
              <p style={{ margin: '0 0 0.75rem 0' }}>
                Individual items can be published immediately from their respective console editors in <strong>Initiatives</strong> or <strong>Philosophy</strong>.
              </p>
              <p style={{ margin: 0 }}>
                Global atomic batch publishing and instant edge cache purge are scheduled for <strong>Phase 4</strong>.
              </p>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.actionButton}
                onClick={() => setShowPublishInfo(false)}
              >
                Dismiss
              </button>
              <Link
                href="/admin/initiatives"
                className={`${styles.actionButton} ${styles.publishButton}`}
              >
                Go to Initiatives →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
