'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { FoundryField } from './FoundryField';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className={styles.hero} id="top">
      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left / Primary: Editorial Manifesto & Actions */}
          <div className={styles.heroContent}>
            <div className={styles.tagWrapper}>
              <span className={styles.tag}>{t.hero.tag}</span>
            </div>

            <h1 className={styles.headline}>
              {t.hero.headline}
            </h1>

            <p className={styles.subhead}>
              {t.hero.subhead}
            </p>

            <div className={styles.actions}>
              <a href="#registry" className={styles.primaryButton}>
                {t.hero.primaryCta}
                <span className={styles.arrow} aria-hidden="true">↓</span>
              </a>
              <a href="#philosophy" className={styles.secondaryButton}>
                {t.hero.secondaryCta}
              </a>
            </div>

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
