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
        <div className="section-header">
          <span className="section-tag">{t.initiatives.tag}</span>
          <h2 className="section-title">{t.initiatives.title}</h2>
          <p className={styles.lead}>
            {t.initiatives.lead}
          </p>
        </div>

        <div className={styles.grid}>
          {featuredItems.map((item) => (
            <ItemCard key={item.id} item={item} featured={true} />
          ))}
        </div>
      </div>
    </section>
  );
};

