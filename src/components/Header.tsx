import React from 'react';
import { STUDIO_META } from '@/data/ecosystem';
import styles from './Header.module.css';

export const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <div className={`container ${styles.container}`}>
        <div className={styles.brand}>
          <a href="#top" className={styles.logo} aria-label="Nalakara · Home">
            {STUDIO_META.name}
          </a>
          <span className={styles.statusPill}>
            <span className={styles.statusDot} />
            {STUDIO_META.status}
          </span>
        </div>

        <nav className={styles.nav} aria-label="Main Navigation">
          <ul className={styles.navList}>
            <li>
              <a href="#initiatives" className={styles.navLink}>
                Initiatives
              </a>
            </li>
            <li>
              <a href="#registry" className={styles.navLink}>
                Registry
              </a>
            </li>
            <li>
              <a href="#philosophy" className={styles.navLink}>
                Philosophy
              </a>
            </li>
            <li>
              <a href="#about" className={styles.navLink}>
                About
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
