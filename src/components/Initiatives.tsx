'use client';

import React from 'react';
import { ECOSYSTEM_INITIATIVES } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import { EcosystemItem } from '@/types';
import { ItemCard } from './ItemCard';
import styles from './Initiatives.module.css';

interface InitiativesProps {
  items?: EcosystemItem[];
}

export const Initiatives: React.FC<InitiativesProps> = ({ items }) => {
  const { t } = useLanguage();
  const featuredItems = items !== undefined
    ? items
    : ECOSYSTEM_INITIATIVES.filter((item) => item.featured);

  return (
    <section className={styles.section} id="initiatives">
      <div className="container">
        {/* Section Header with Architectural Coordinate Notation */}
        <div className={styles.sectionHeader}>
          <div className={styles.tagWrap}>
            <span className={styles.sectionIndex}>[01]</span>
            <span className="section-tag">{t.initiatives.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>{t.initiatives.title}</h2>
          <p className={styles.lead}>
            {t.initiatives.lead}
          </p>
        </div>

        {/* Asymmetric Ledger Grid: Flagship First Initiative + Secondary Artifacts */}
        <div className={styles.grid}>
          {featuredItems.map((item, index) => (
            <div 
              key={item.id} 
              className={`${styles.itemWrapper} ${index === 0 ? styles.flagshipItem : styles.secondaryItem}`}
            >
              <ItemCard item={item} featured={index === 0} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

