'use client';

import React, { useState, useMemo } from 'react';
import { ECOSYSTEM_INITIATIVES } from '@/data/ecosystem';
import { RegistryFilter } from '@/types';
import { ItemCard } from './ItemCard';
import styles from './Registry.module.css';

const FILTER_TABS: { id: RegistryFilter; label: string; description: string }[] = [
  {
    id: 'all',
    label: 'All Items',
    description: 'Complete ecosystem registry spanning all lifecycle stages.'
  },
  {
    id: 'building',
    label: "Things We're Building",
    description: 'Exploratory ideas, internal lab experiments, and projects under active development.'
  },
  {
    id: 'usable',
    label: 'Things You Can Use',
    description: 'Stable, public utilities ready for direct end-user deployment and access.'
  },
  {
    id: 'commercial',
    label: 'Things You Can Buy',
    description: 'Commercial platforms, production licenses, and professional studio offerings.'
  }
];

export const Registry: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<RegistryFilter>('all');

  const filteredItems = useMemo(() => {
    return ECOSYSTEM_INITIATIVES.filter((item) => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'building') {
        return item.status === 'idea' || item.status === 'lab' || item.status === 'project';
      }
      if (activeFilter === 'usable') {
        return item.status === 'product';
      }
      if (activeFilter === 'commercial') {
        return item.status === 'commercial';
      }
      return true;
    }).sort((a, b) => a.order - b.order);
  }, [activeFilter]);

  const activeTabMeta = FILTER_TABS.find((t) => t.id === activeFilter) || FILTER_TABS[0];

  return (
    <section className={styles.section} id="registry">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Ecosystem Index</span>
          <h2 className="section-title">The Registry</h2>
          <p className={styles.lead}>
            A unified taxonomy of ideas, experiments, software, and commercial offerings.
          </p>
        </div>

        {/* Filter Controls */}
        <div className={styles.filters} role="tablist" aria-label="Ecosystem Filter Options">
          {FILTER_TABS.map((tab) => {
            const count = ECOSYSTEM_INITIATIVES.filter((item) => {
              if (tab.id === 'all') return true;
              if (tab.id === 'building') return item.status === 'idea' || item.status === 'lab' || item.status === 'project';
              if (tab.id === 'usable') return item.status === 'product';
              if (tab.id === 'commercial') return item.status === 'commercial';
              return true;
            }).length;

            const isSelected = activeFilter === tab.id;

            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isSelected}
                className={`${styles.filterButton} ${isSelected ? styles.filterButtonActive : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                <span>{tab.label}</span>
                <span className={styles.counter}>{count}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.tabDescription}>
          <p>{activeTabMeta.description}</p>
        </div>

        {/* Filtered Grid */}
        <div className={styles.grid}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => <ItemCard key={item.id} item={item} />)
          ) : (
            <div className={styles.emptyState}>
              <p>No initiatives currently indexed under this filter.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
