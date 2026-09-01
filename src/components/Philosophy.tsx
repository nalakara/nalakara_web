'use client';

import React from 'react';
import { STUDIO_PRINCIPLES } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import { StudioPrinciple } from '@/types';
import styles from './Philosophy.module.css';

interface PhilosophyProps {
  principles?: StudioPrinciple[];
}

export const Philosophy: React.FC<PhilosophyProps> = ({ principles }) => {
  const { language, t } = useLanguage();
  const sourcePrinciples = principles !== undefined ? principles : STUDIO_PRINCIPLES;

  return (
    <section className={styles.section} id="philosophy">
      <div className="container">
        {/* Section Header with Architectural Coordinate Notation */}
        <div className={styles.sectionHeader}>
          <div className={styles.tagWrap}>
            <span className={styles.sectionIndex}>[03]</span>
            <span className="section-tag">{t.philosophy.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>{t.philosophy.title}</h2>
          <p className={styles.lead}>
            {t.philosophy.lead}
          </p>
        </div>

        {/* Architectural Principles Matrix */}
        <div className={styles.grid}>
          {sourcePrinciples.map((principle) => (
            <div key={principle.number} className={styles.card}>
              <div className={styles.principleHeader}>
                <span className={styles.number}>[{principle.number}]</span>
                {principle.isDraft && (
                  <span className={styles.draftBadge}>
                    Draft
                  </span>
                )}
              </div>
              <h3 className={styles.title}>{principle.title[language]}</h3>
              <p className={styles.description}>{principle.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

