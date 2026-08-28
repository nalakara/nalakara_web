'use client';

import React from 'react';
import { STUDIO_META } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageToggle } from './LanguageToggle';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <a href="#top" className={styles.logo} aria-label={t.header.logoAria}>
            {STUDIO_META.name}
          </a>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            {t.header.status}
          </span>
        </div>

        <div className={styles.navGroup}>
          <nav className={styles.nav} aria-label="Main Navigation">
            <ul className={styles.navList}>
              <li>
                <a href="#initiatives" className={styles.navLink}>
                  {t.header.nav.initiatives}
                </a>
              </li>
              <li>
                <a href="#registry" className={styles.navLink}>
                  {t.header.nav.registry}
                </a>
              </li>
              <li>
                <a href="#philosophy" className={styles.navLink}>
                  {t.header.nav.philosophy}
                </a>
              </li>
              <li>
                <a href="#about" className={styles.navLink}>
                  {t.header.nav.about}
                </a>
              </li>
            </ul>
          </nav>

          <LanguageToggle />
        </div>
      </div>
    </header>
  );
};
