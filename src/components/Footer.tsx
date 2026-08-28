import React from 'react';
import { STUDIO_META } from '@/data/ecosystem';
import styles from './Footer.module.css';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footer} id="about">
      <div className="container">
        <div className={styles.topRow}>
          <div className={styles.aboutBlock}>
            <div className={styles.brand}>{STUDIO_META.name}</div>
            <p className={styles.tagline}>{STUDIO_META.tagline}</p>
            <p className={styles.location}>Location: {STUDIO_META.location}</p>
          </div>

          <div className={styles.linksBlock}>
            <div className={styles.col}>
              <h4 className={styles.colTitle}>Coordinates</h4>
              <ul className={styles.linkList}>
                <li>
                  <a href={`mailto:${STUDIO_META.email}`} className={styles.link}>
                    {STUDIO_META.email}
                  </a>
                </li>
                <li>
                  <a 
                    href="https://github.com/nalakara" 
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
              <h4 className={styles.colTitle}>Initiatives</h4>
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
                    Skill Factory
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.bottomRow}>
          <div className={styles.colophon}>
            <span>Next.js Static Architecture</span>
            <span className={styles.dot}>•</span>
            <span>Hosted on Vercel</span>
            <span className={styles.dot}>•</span>
            <span>Domain: nalakara.com</span>
          </div>

          <div className={styles.backToTop}>
            <a href="#top" className={styles.topLink}>
              Back to top ↑
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
