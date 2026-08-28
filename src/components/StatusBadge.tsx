'use client';

import React from 'react';
import { LifecycleStatus } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import styles from './StatusBadge.module.css';

interface StatusBadgeProps {
  status: LifecycleStatus;
}

const STATUS_CONFIG: Record<LifecycleStatus, { label: string; className: string }> = {
  idea: { label: 'Idea', className: styles.idea },
  lab: { label: 'Lab', className: styles.lab },
  project: { label: 'Project', className: styles.project },
  product: { label: 'Product', className: styles.product },
  commercial: { label: 'Commercial', className: styles.commercial },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const { language } = useLanguage();
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;
  const ariaLabel = language === 'id' ? `Tahapan status: ${config.label}` : `Lifecycle status: ${config.label}`;

  return (
    <span className={`${styles.badge} ${config.className}`} aria-label={ariaLabel}>
      <span className={styles.dot} />
      {config.label}
    </span>
  );
};
