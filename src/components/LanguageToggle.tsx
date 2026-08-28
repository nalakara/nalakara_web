'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './LanguageToggle.module.css';

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className={styles.toggleWrapper} role="group" aria-label={t.header.languageToggleAria}>
      <button
        type="button"
        className={`${styles.langButton} ${language === 'en' ? styles.active : ''}`}
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        aria-label="Switch to English"
      >
        EN
      </button>
      <span className={styles.divider} aria-hidden="true">/</span>
      <button
        type="button"
        className={`${styles.langButton} ${language === 'id' ? styles.active : ''}`}
        onClick={() => setLanguage('id')}
        aria-pressed={language === 'id'}
        aria-label="Ganti ke Bahasa Indonesia"
      >
        ID
      </button>
    </div>
  );
};
