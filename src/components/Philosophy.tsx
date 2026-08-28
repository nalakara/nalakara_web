import React from 'react';
import { STUDIO_PRINCIPLES } from '@/data/ecosystem';
import styles from './Philosophy.module.css';

export const Philosophy: React.FC = () => {
  return (
    <section className={styles.section} id="philosophy">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Methodology</span>
          <h2 className="section-title">Studio Principles</h2>
          <p className={styles.lead}>
            The architectural, design, and operational values that govern how we build.
          </p>
        </div>

        <div className={styles.grid}>
          {STUDIO_PRINCIPLES.map((principle) => (
            <div key={principle.number} className={styles.card}>
              <span className={styles.number}>{principle.number}</span>
              <h3 className={styles.title}>{principle.title}</h3>
              <p className={styles.description}>{principle.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
