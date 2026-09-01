'use client';

import React, { useState, useMemo } from 'react';
import { ECOSYSTEM_INITIATIVES } from '@/data/ecosystem';
import { useLanguage } from '@/context/LanguageContext';
import { RegistryFilter, EcosystemItem } from '@/types';
import { ItemCard } from './ItemCard';
import styles from './Registry.module.css';

interface RegistryProps {
  items?: EcosystemItem[];
}

export const Registry: React.FC<RegistryProps> = ({ items }) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<RegistryFilter>('all');
  const sourceItems = items !== undefined ? items : ECOSYSTEM_INITIATIVES;

  const filterTabs: { id: RegistryFilter; label: string; description: string; aria: string }[] = [
    {
      id: 'all',
      label: t.registry.tabs.all.label,
      description: t.registry.tabs.all.description,
      aria: t.registry.tabs.all.aria
    },
    {
      id: 'building',
      label: t.registry.tabs.building.label,
      description: t.registry.tabs.building.description,
      aria: t.registry.tabs.building.aria
    },
    {
      id: 'usable',
      label: t.registry.tabs.usable.label,
      description: t.registry.tabs.usable.description,
      aria: t.registry.tabs.usable.aria
    },
    {
      id: 'commercial',
      label: t.registry.tabs.commercial.label,
      description: t.registry.tabs.commercial.description,
      aria: t.registry.tabs.commercial.aria
    }
  ];

  const filteredItems = useMemo(() => {
    return sourceItems.filter((item) => {
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
  }, [sourceItems, activeFilter]);

  const activeTabMeta = filterTabs.find((tab) => tab.id === activeFilter) || filterTabs[0];

  return (
    <section className={styles.section} id="registry">
      <div className="container">
        {/* Section Header with Architectural Coordinate Notation */}
        <div className={styles.sectionHeader}>
          <div className={styles.tagWrap}>
            <span className={styles.sectionIndex}>[02]</span>
            <span className="section-tag">{t.registry.tag}</span>
          </div>
          <h2 className={styles.sectionTitle}>{t.registry.title}</h2>
          <p className={styles.lead}>
            {t.registry.lead}
          </p>
        </div>

        {/* Architectural Ledger Controls */}
        <div className={styles.filters} role="tablist" aria-label="Ecosystem Filter Options">
          {filterTabs.map((tab) => {
            const count = sourceItems.filter((item) => {
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
                aria-label={tab.aria}
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
              <p>{t.registry.emptyState}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

