'use client';

import React from 'react';
import { EcosystemItem, LifecycleStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from './StatusBadge';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: EcosystemItem;
  featured?: boolean;
}

// Subtle geometric stage glyph connecting card to the 5-stage lifecycle model
const StageGlyph: React.FC<{ status: LifecycleStatus }> = ({ status }) => {
  if (status === 'commercial') {
    return (
      <svg className={styles.glyph} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="5.5" stroke="#c084fc" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="7" cy="7" r="2.5" fill="#c084fc" />
      </svg>
    );
  }
  if (status === 'product') {
    return (
      <svg className={styles.glyph} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <rect x="2.5" y="2.5" width="9" height="9" stroke="#34d399" strokeWidth="1" />
        <circle cx="7" cy="7" r="2" fill="#34d399" />
      </svg>
    );
  }
  if (status === 'project') {
    return (
      <svg className={styles.glyph} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <polygon points="7,2 12,11.5 2,11.5" stroke="#38bdf8" strokeWidth="1" fill="none" />
        <circle cx="7" cy="8" r="1.5" fill="#38bdf8" />
      </svg>
    );
  }
  if (status === 'lab') {
    return (
      <svg className={styles.glyph} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2.5 2" />
        <line x1="7" y1="3.5" x2="7" y2="10.5" stroke="#fbbf24" strokeWidth="1" />
        <line x1="3.5" y1="7" x2="10.5" y2="7" stroke="#fbbf24" strokeWidth="1" />
      </svg>
    );
  }
  // Idea
  return (
    <svg className={styles.glyph} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="#a1a1aa" strokeWidth="1" strokeDasharray="1.5 1.5" />
      <circle cx="7" cy="7" r="1.5" fill="#a1a1aa" />
    </svg>
  );
};

export const ItemCard: React.FC<ItemCardProps> = ({ item, featured = false }) => {
  const { language, t } = useLanguage();
  const categoryLabel = t.itemCard.categories[item.category] || item.category;
  const accessLabel = t.itemCard.accessModels[item.accessModel] || item.accessModel;
  const badgeLabel = item.commercial?.badgeLabel?.[language] || (item.commercial ? t.itemCard.commercialCandidate : undefined);
  const actionLabel = item.commercial?.actionLabel?.[language] || t.itemCard.visit;

  return (
    <article 
      className={`${styles.card} ${featured ? styles.cardFeatured : ''}`}
      id={`item-${item.id}`}
    >
      <header className={styles.header}>
        <div className={styles.metaRow}>
          <div className={styles.categoryWrap}>
            <StageGlyph status={item.status} />
            <span className={styles.category}>{categoryLabel}</span>
          </div>
          <StatusBadge status={item.status} />
        </div>
        <h3 className={styles.title}>{item.name}</h3>
      </header>

      <p className={styles.tagline}>{item.tagline[language]}</p>
      <p className={styles.description}>{item.description[language]}</p>

      <footer className={styles.footer}>
        <div className={styles.accessTag}>
          <span className={styles.accessLabel}>{accessLabel}</span>
          {badgeLabel && (
            <span className={styles.pricingBadge}>{badgeLabel}</span>
          )}
        </div>

        {item.targetUrl ? (
          <a
            href={item.targetUrl}
            target={item.isExternal ? '_blank' : '_self'}
            rel={item.isExternal ? 'noopener noreferrer' : undefined}
            className={styles.link}
            aria-label={`${actionLabel} ${item.name}`}
          >
            <span>{actionLabel}</span>
            <span className={styles.arrow} aria-hidden="true">↗</span>
          </a>
        ) : (
          <span className={styles.disabledLink} title={t.itemCard.inFoundry}>
            <span>{t.itemCard.inFoundry}</span>
            <span className={styles.lock} aria-hidden="true">·</span>
          </span>
        )}
      </footer>
    </article>
  );
};
