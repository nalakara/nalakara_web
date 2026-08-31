'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { PreviewHeroConfig } from '@/types';
import { FoundryField } from './FoundryField';
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
      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left / Primary: Editorial Manifesto & Actions */}
          <div className={styles.heroContent}>
            <div className={styles.tagWrapper}>
              <span className={styles.tag}>{tagLabel}</span>
            </div>

            <h1 className={styles.headline}>
              {headline}
            </h1>

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
                <a href="#registry" className={styles.primaryButton}>
                  {t.hero.primaryCta}
                  <span className={styles.arrow} aria-hidden="true">↓</span>
                </a>
              )}
              <a href="#philosophy" className={styles.secondaryButton}>
                {t.hero.secondaryCta}
              </a>
            </div>

            {showLifecycle && (
              <div className={styles.lifecycleBar} aria-label={t.hero.lifecycleTitle}>
                <div className={styles.lifecycleTitle}>{t.hero.lifecycleTitle}</div>
                <div className={styles.lifecycleSteps}>
                  <span className={styles.step}>{t.hero.stages.idea}</span>
                  <span className={styles.sep}>→</span>
                  <span className={styles.step}>{t.hero.stages.lab}</span>
                  <span className={styles.sep}>→</span>
                  <span className={styles.step}>{t.hero.stages.project}</span>
                  <span className={styles.sep}>→</span>
                  <span className={styles.step}>{t.hero.stages.product}</span>
                  <span className={styles.sep}>→</span>
                  <span className={styles.step}>{t.hero.stages.commercial}</span>
                </div>
              </div>
            )}
          </div>

          {/* Right / Spatial Artifact: The Foundry Tensor Field */}
          <div className={styles.heroArtifact}>
            <FoundryField />
          </div>
        </div>
      </div>
    </section>
  );
};

