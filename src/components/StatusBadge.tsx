import React from 'react';
import { LifecycleStatus } from '@/types';
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
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.idea;

  return (
    <span className={`${styles.badge} ${config.className}`} aria-label={`Lifecycle status: ${config.label}`}>
      <span className={styles.dot} />
      {config.label}
    </span>
  );
};
