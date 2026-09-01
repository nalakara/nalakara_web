'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PreviewHeroConfig } from '@/types';
import { ConstellationField } from './ConstellationField';
import styles from './Hero.module.css';

interface HeroProps {
  config?: PreviewHeroConfig;
}

export const Hero: React.FC<HeroProps> = ({ config }) => {
  const { language, t } = useLanguage();

  const isSpotlight = config?.mode === 'featured_initiative' && Boolean(config.featuredItem);
  const featuredItem = config?.featuredItem;
  const showLifecycle = config ? config.showLifecycleBar : true;

  const headline = isSpotlight && featuredItem
    ? featuredItem.name
    : t.hero.headline;

  const subhead = isSpotlight && featuredItem
    ? featuredItem.description[language] || featuredItem.tagline[language]
    : t.hero.subhead;

  const tagLabel = isSpotlight && featuredItem
    ? `${t.hero.tag} · Spotlight`
    : t.hero.tag;

  return (
    <section className={styles.hero} id="top">
      {/* 1. Atmospheric Fullscreen Constellation Field (z-index: 0) */}
      <div className={styles.fieldWrapper}>
        <ConstellationField density={0.65} speed={0.35} length={0.8} />
      </div>

      {/* 2. Architectural Vignette / Soft Gradient Mask (z-index: 1) */}
      <div className={styles.vignetteOverlay} aria-hidden="true" />

      {/* 3. Hero Content Container (z-index: 2) */}
      <div className={`container ${styles.heroContainer}`}>
        {/* Top Coordinate Annotation Bar */}
        <div className={styles.ledgerHeader}>
          <div className={styles.ledgerTagWrap}>
            <span className={styles.tagIndex}>[00]</span>
            <span className={styles.tag}>{tagLabel}</span>
          </div>
          <div className={styles.ledgerCoordinate}>
            <span>STUDIO & FOUNDRY · EST 2026</span>
          </div>
        </div>

        {/* Central Manifesto Composition */}
        <div className={styles.heroContent}>
          <h1 className={styles.headline}>
            {headline}
          </h1>

          <div className={styles.manifestoBody}>
            <p className={styles.subhead}>
              {subhead}
            </p>

            <div className={styles.actions}>
              {isSpotlight && featuredItem?.targetUrl ? (
                <a
                  href={featuredItem.targetUrl}
                  target={featuredItem.isExternal ? '_blank' : '_self'}
                  rel={featuredItem.isExternal ? 'noopener noreferrer' : undefined}
                  className={styles.primaryButton}
                >
                  {featuredItem.commercial?.actionLabel?.[language] || t.itemCard.visit}
                  <span className={styles.arrow} aria-hidden="true">↗</span>
                </a>
              ) : (
                <a href="#initiatives" className={styles.primaryButton}>
                  {t.hero.primaryCta}
                  <span className={styles.arrow} aria-hidden="true">↓</span>
                </a>
              )}
              <a href="#philosophy" className={styles.secondaryButton}>
                {t.hero.secondaryCta}
              </a>
            </div>
          </div>
        </div>

        {/* Continuous Lifecycle Matrix Footer Spine */}
        {showLifecycle && (
          <div className={styles.lifecycleBar} aria-label={t.hero.lifecycleTitle}>
            <div className={styles.lifecycleMeta}>
              <span className={styles.lifecycleIndex}>LIFECYCLE MATRIX</span>
              <span className={styles.lifecycleTitle}>{t.hero.lifecycleTitle}</span>
            </div>
            <div className={styles.lifecycleSteps}>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>01</span>
                <span className={styles.step}>{t.hero.stages.idea}</span>
              </div>
              <span className={styles.sep}>—</span>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>02</span>
                <span className={styles.step}>{t.hero.stages.lab}</span>
              </div>
              <span className={styles.sep}>—</span>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>03</span>
                <span className={styles.step}>{t.hero.stages.project}</span>
              </div>
              <span className={styles.sep}>—</span>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>04</span>
                <span className={styles.step}>{t.hero.stages.product}</span>
              </div>
              <span className={styles.sep}>—</span>
              <div className={styles.stepItem}>
                <span className={styles.stepNum}>05</span>
                <span className={styles.step}>{t.hero.stages.commercial}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
