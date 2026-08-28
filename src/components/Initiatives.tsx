import React from 'react';
import { ECOSYSTEM_INITIATIVES } from '@/data/ecosystem';
import { ItemCard } from './ItemCard';
import styles from './Initiatives.module.css';

export const Initiatives: React.FC = () => {
  const featuredItems = ECOSYSTEM_INITIATIVES.filter((item) => item.featured);

  return (
    <section className={styles.section} id="initiatives">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">In The Foundry</span>
          <h2 className="section-title">Current Initiatives</h2>
          <p className={styles.lead}>
            Curated active developments, stable utilities, and commercial systems across the ecosystem.
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
