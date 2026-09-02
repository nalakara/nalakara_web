'use client';

import React from 'react';
import { EcosystemItem, LifecycleStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from './StatusBadge';
import styles from './ItemCard.module.css';

interface ItemCardProps {
  item: EcosystemItem;
  featured?: boolean;
  variant?: 'initiative' | 'registry';
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
        <circle cx="7" cy="2" fill="#34d399" />
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

export const ItemCard: React.FC<ItemCardProps> = ({ item, featured = false, variant = 'initiative' }) => {
  const { language, t } = useLanguage();
  const categoryLabel = t.itemCard.categories[item.category] || item.category;
  const accessLabel = t.itemCard.accessModels[item.accessModel] || item.accessModel;
  const badgeLabel = item.commercial?.badgeLabel?.[language] || (item.commercial ? t.itemCard.commercialCandidate : undefined);
  const actionLabel = item.commercial?.actionLabel?.[language] || t.itemCard.visit;
  const hasMedia = Boolean(item.coverMedia && item.coverMedia.url);

  // 1. INITIATIVES VARIANT: Full-Bleed 16:9 Visual Portfolio Panel
  if (variant === 'initiative' && hasMedia && item.coverMedia) {
    return (
      <article
        className={`${styles.card} ${styles.visualCard} ${featured ? styles.cardFeatured : ''}`}
        id={`item-${item.id}`}
      >
        {/* Full-Bleed 16:9 Media Canvas Surface */}
        <div className={styles.mediaSurface}>
          {item.coverMedia.type === 'video' ? (
            <video
              src={item.coverMedia.url}
              poster={item.coverMedia.posterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              className={styles.mediaAsset}
            />
          ) : (
            <img
              src={item.coverMedia.url}
              alt={item.name}
              className={styles.mediaAsset}
              style={{ objectPosition: item.coverMedia.focalPosition || 'center' }}
            />
          )}
          {/* Architectural Dark Vignette Overlay */}
          <div className={styles.vignetteOverlay} aria-hidden="true" />
        </div>

        {/* Layered Architectural Ledger Typography & Annotations */}
        <div className={styles.overlayContent}>
          {/* Header Annotation Layer */}
          <header className={styles.visualHeader}>
            <div className={styles.sequenceWrap}>
              <span className={styles.itemIndex}>[0{item.order}]</span>
              <div className={styles.categoryWrap}>
                <StageGlyph status={item.status} />
                <span className={styles.category}>{categoryLabel}</span>
              </div>
            </div>
            <div className={styles.statusWrap}>
              {item.isDraft && (
                <span className={styles.draftBadge} title="Draft item not yet published">
                  <span className={styles.draftDot} />
                  Draft
                </span>
              )}
              <StatusBadge status={item.status} />
            </div>
          </header>

          {/* Body Section: Primary Title & Hover Editorial Reveal Layer */}
          <div className={styles.visualBody}>
            <div className={styles.titleWrap}>
              <h3 className={styles.visualTitle}>{item.name}</h3>
            </div>

            {/* Editorial Metadata Reveal Panel (Reveals on Hover, Graceful on Touch) */}
            <div className={styles.revealPanel}>
              <div className={styles.revealDivider} aria-hidden="true" />

              <p className={styles.revealTagline}>{item.tagline[language]}</p>

              <div className={styles.revealMetaGrid}>
                <div className={styles.revealMetaCol}>
                  <span className={styles.revealMetaLabel}>STATUS</span>
                  <span className={styles.revealMetaValue}>{accessLabel.toUpperCase()}</span>
                </div>

                <div className={styles.revealMetaCol}>
                  <span className={styles.revealMetaLabel}>YEAR</span>
                  <span className={styles.revealMetaValue}>{item.updatedAt ? item.updatedAt.split('-')[0] : '2026'}</span>
                </div>

                {badgeLabel && (
                  <div className={styles.revealMetaCol}>
                    <span className={styles.revealMetaLabel}>MODEL</span>
                    <span className={styles.revealMetaValueHighlight}>{badgeLabel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action Layer */}
          <footer className={styles.visualFooter}>
            {item.targetUrl ? (
              <a
                href={item.targetUrl}
                target={item.isExternal ? '_blank' : '_self'}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                className={styles.visualLink}
                aria-label={`View project ${item.name}`}
              >
                <span>{language === 'id' ? 'LIHAT PROYEK' : 'VIEW PROJECT'}</span>
                <span className={styles.arrow} aria-hidden="true">→</span>
              </a>
            ) : (
              <span className={styles.visualDisabledLink} title={t.itemCard.inFoundry}>
                <span>{t.itemCard.inFoundry}</span>
                <span className={styles.lock} aria-hidden="true">·</span>
              </span>
            )}
          </footer>
        </div>
      </article>
    );
  }

  // 2. REGISTRY VARIANT (Catalogue Mode) OR Fallback Editorial Text Card
  return (
    <article 
      className={`${styles.card} ${variant === 'registry' ? styles.registryCard : styles.textCard} ${featured ? styles.cardFeatured : ''}`}
      id={`item-${item.id}`}
    >
      {/* Registry Catalogue Top Media Frame (when Cover Media exists) */}
      {variant === 'registry' && hasMedia && item.coverMedia && (
        <div className={styles.registryMediaFrame}>
          {item.coverMedia.type === 'video' ? (
            <video
              src={item.coverMedia.url}
              poster={item.coverMedia.posterUrl || undefined}
              autoPlay
              muted
              loop
              playsInline
              className={styles.registryMediaAsset}
            />
          ) : (
            <img
              src={item.coverMedia.url}
              alt={item.name}
              className={styles.registryMediaAsset}
              style={{ objectPosition: item.coverMedia.focalPosition || 'center' }}
            />
          )}
          {/* Subtle Top Metadata Stamp inside Media Frame */}
          <div className={styles.registryMediaHeader}>
            <div className={styles.sequenceWrap}>
              <span className={styles.itemIndex}>[0{item.order}]</span>
              <div className={styles.categoryWrap}>
                <StageGlyph status={item.status} />
                <span className={styles.category}>{categoryLabel}</span>
              </div>
            </div>
            <div className={styles.statusWrap}>
              <StatusBadge status={item.status} />
            </div>
          </div>
        </div>
      )}

      {/* Header (Only when no top media frame exists in text-card fallback) */}
      {(!hasMedia || variant !== 'registry') && (
        <header className={styles.header}>
          <div className={styles.metaRow}>
            <div className={styles.sequenceWrap}>
              <span className={styles.itemIndex}>[0{item.order}]</span>
              <div className={styles.categoryWrap}>
                <StageGlyph status={item.status} />
                <span className={styles.category}>{categoryLabel}</span>
              </div>
            </div>
            <div className={styles.statusWrap}>
              {item.isDraft && (
                <span className={styles.draftBadge} title="Draft item not yet published">
                  <span className={styles.draftDot} />
                  Draft
                </span>
              )}
              <StatusBadge status={item.status} />
            </div>
          </div>
          <h3 className={styles.title}>{item.name}</h3>
        </header>
      )}

      {/* Editorial Content Below Image */}
      {variant === 'registry' && hasMedia && (
        <div className={styles.registryBody}>
          <h3 className={styles.registryTitle}>{item.name}</h3>
        </div>
      )}

      <p className={styles.tagline}>{item.tagline[language]}</p>
      <p className={styles.description}>{item.description[language]}</p>

      <footer className={styles.footer}>
        <div className={styles.accessTag}>
          <span className={styles.accessModelLabel}>ACCESS</span>
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
