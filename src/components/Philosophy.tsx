'use client';

import React from 'react';
import { STUDIO_PRINCIPLES } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Philosophy.module.css';

export const Philosophy: React.FC = () => {
  const { language, t } = useLanguage();

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
          {STUDIO_PRINCIPLES.map((principle) => (
            <div key={principle.number} className={styles.card}>
              <span className={styles.number}>{principle.number}</span>
              <h3 className={styles.title}>{principle.title[language]}</h3>
              <p className={styles.description}>{principle.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
