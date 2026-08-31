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
        <div className="section-header">
          <span className="section-tag">{t.philosophy.tag}</span>
          <h2 className="section-title">{t.philosophy.title}</h2>
          <p className={styles.lead}>
            {t.philosophy.lead}
          </p>
        </div>

        <div className={styles.grid}>
          {sourcePrinciples.map((principle) => (
            <div key={principle.number} className={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={styles.number}>{principle.number}</span>
                {principle.isDraft && (
                  <span
                    style={{
                      fontFamily: 'var(--font-mono, monospace)',
                      fontSize: '0.625rem',
                      letterSpacing: '0.08em',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: '#fbbf24',
                      backgroundColor: 'rgba(251, 191, 36, 0.1)',
                      border: '1px solid rgba(251, 191, 36, 0.35)',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '3px',
                    }}
                  >
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

