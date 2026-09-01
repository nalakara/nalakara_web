'use client';

import React from 'react';
import { STUDIO_META } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer} id="about">
      <div className="container">
        {/* Footer Ledger Top Header */}
        <div className={styles.footerHeader}>
          <div className={styles.footerTagWrap}>
            <span className={styles.footerIndex}>[04]</span>
            <span className={styles.footerTag}>STUDIO ARCHIVE & COLOPHON</span>
          </div>
          <div className={styles.footerCoord}>
            <span>COORDINATES · BANDUNG / GLOBAL</span>
          </div>
        </div>

        <div className={styles.topRow}>
          <div className={styles.aboutBlock}>
            <div className={styles.brand}>{STUDIO_META.name}</div>
            <p className={styles.tagline}>{t.footer.desc}</p>
            <p className={styles.location}>
              {t.footer.locationLabel}: {t.footer.locationValue}
            </p>
            <p className={styles.origin}>
              {t.footer.originFootnote}
            </p>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.colCoordinates}</h4>
              <ul className={styles.linkList}>
                <li>
                  <a href={`mailto:${STUDIO_META.email}`} className={styles.link}>
                    {STUDIO_META.email}
                  </a>
                </li>
                <li>
                  <a 
                    href={STUDIO_META.github} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={styles.link}
                  >
                    GitHub ↗
                  </a>
                </li>
              </ul>
            </div>

            <div className={styles.col}>
              <h4 className={styles.colTitle}>{t.footer.colInitiatives}</h4>
              <ul className={styles.linkList}>
                <li>
                  <a href="#item-bros" className={styles.link}>
                    B.R.O.S.
                  </a>
                </li>
                <li>
                  <a href="#item-roast-navigator" className={styles.link}>
                    Roast Navigator
                  </a>
                </li>
                <li>
                  <a href="#item-beauty-batch-os" className={styles.link}>
                    Beauty Batch OS
                  </a>
                </li>
                <li>
                  <a href="#item-skill-factory" className={styles.link}>
                    Nalakara Skill Factory
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.colophon}>
            <span>{t.footer.rights}</span>
            <span className={styles.dot}>•</span>
            <span>{t.footer.tagline}</span>
            <span className={styles.dot}>•</span>
            <span>nalakara.com</span>
          </div>

          <div className={styles.backToTop}>
            <a href="#top" className={styles.topLink}>
              {t.footer.backToTop} ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
