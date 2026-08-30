'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '@/app/admin/admin.module.css';
import { updateHeroConfigAction } from './actions';
import { Database } from '@/types/database';

type HeroConfig = Database['public']['Tables']['hero_config']['Row'];
type InitiativeOption = {
  id: string;
  name: string;
  lifecycle_stage: string;
  publication_status: string;
};

interface HeroConfigFormProps {
  initialConfig: HeroConfig;
  publishedInitiatives: InitiativeOption[];
}

export default function HeroConfigForm({
  initialConfig,
  publishedInitiatives,
}: HeroConfigFormProps) {
  const router = useRouter();

  const [mode, setMode] = useState<'studio' | 'featured_initiative'>(initialConfig.mode);
  const [featuredInitiativeId, setFeaturedInitiativeId] = useState<string>(
    initialConfig.featured_initiative_id || (publishedInitiatives[0]?.id ?? '')
  );
  const [showLifecycleBar, setShowLifecycleBar] = useState<boolean>(initialConfig.show_lifecycle_bar);

  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.set('mode', mode);
      formData.set('featured_initiative_id', mode === 'featured_initiative' ? featuredInitiativeId : '');
      formData.set('show_lifecycle_bar', showLifecycleBar ? 'true' : 'false');

      const res = await updateHeroConfigAction(formData);
      if (res.success) {
        setFeedback({
          type: 'success',
          message: 'Hero configuration successfully updated and saved to database.',
        });
        router.refresh();
      } else {
        setFeedback({
          type: 'error',
          message: res.error || 'Failed to update hero configuration.',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div>
      <div className={styles.pageHeaderRow}>
        <div>
          <span className={styles.pageTag}>Homepage Presentation</span>
          <h1 className={styles.pageTitle}>Hero Configuration</h1>
          <p className={styles.pageLead}>
            Configure the presentation mode and visual focus of the primary entrance section.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={feedback.type === 'success' ? styles.messageSuccess : styles.messageError}
          role="alert"
          style={{ marginBottom: '1.75rem' }}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>1. Presentation Mode</span>
            <span className={styles.cardSubtitle}>Governs the narrative structure of the top section</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Mode Option: Studio */}
            <div
              onClick={() => setMode('studio')}
              style={{
                border: `1px solid ${mode === 'studio' ? 'var(--text-primary, #ffffff)' : 'var(--border-subtle, #27272a)'}`,
                backgroundColor: mode === 'studio' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(24, 24, 27, 0.3)',
                borderRadius: '6px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <input
                  type="radio"
                  name="hero_mode"
                  checked={mode === 'studio'}
                  onChange={() => setMode('studio')}
                  style={{ accentColor: '#ffffff' }}
                />
                <strong style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Studio Manifesto Mode
                </strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #a1a1aa)', margin: 0, lineHeight: 1.45 }}>
                Displays the canonical Nalakara studio manifesto, foundational positioning tagline, and ecosystem overview.
              </p>
            </div>

            {/* Mode Option: Featured Initiative */}
            <div
              onClick={() => setMode('featured_initiative')}
              style={{
                border: `1px solid ${mode === 'featured_initiative' ? 'var(--text-primary, #ffffff)' : 'var(--border-subtle, #27272a)'}`,
                backgroundColor: mode === 'featured_initiative' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(24, 24, 27, 0.3)',
                borderRadius: '6px',
                padding: '1.25rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.5rem' }}>
                <input
                  type="radio"
                  name="hero_mode"
                  checked={mode === 'featured_initiative'}
                  onChange={() => setMode('featured_initiative')}
                  style={{ accentColor: '#ffffff' }}
                />
                <strong style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Featured Initiative Mode
                </strong>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary, #a1a1aa)', margin: 0, lineHeight: 1.45 }}>
                Spotlights a specific live initiative directly in the hero block, highlighting its lifecycle stage and direct access link.
              </p>
            </div>
          </div>

          {/* Featured Initiative Selection Sub-Section */}
          {mode === 'featured_initiative' && (
            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(24, 24, 27, 0.5)', border: '1px solid var(--border-subtle, #27272a)', borderRadius: '6px', marginTop: '1rem' }}>
              <div className={styles.formGroup}>
                <label htmlFor="featured-select" className={styles.formLabel}>
                  Select Initiative to Spotlight in Hero *
                </label>
                {publishedInitiatives.length > 0 ? (
                  <select
                    id="featured-select"
                    value={featuredInitiativeId}
                    onChange={(e) => setFeaturedInitiativeId(e.target.value)}
                    disabled={isPending}
                    className={styles.formSelect}
                    style={{ width: '100%', maxWidth: '480px' }}
                  >
                    {publishedInitiatives.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.id}) · Stage: {item.lifecycle_stage}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={styles.messageError} style={{ margin: 0 }}>
                    No published initiatives available in the registry. Please publish at least one initiative before activating Featured Initiative Mode.
                  </div>
                )}
                <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted, #71717a)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Only initiatives currently in 'published' status can be spotlighted.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Visual Elements */}
        <div className={styles.formCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>2. Auxiliary Visual Indicators</span>
            <span className={styles.cardSubtitle}>Controls accompanying UI elements</span>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={showLifecycleBar}
                onChange={(e) => setShowLifecycleBar(e.target.checked)}
                disabled={isPending}
                className={styles.checkboxInput}
              />
              <div>
                <strong style={{ display: 'block', color: 'var(--text-primary, #ffffff)' }}>
                  Display 5-Stage Lifecycle Indicator Bar
                </strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #71717a)' }}>
                  Renders the visual progression bar (Idea → Lab → Project → Product → Commercial) across the hero footer.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button
            type="submit"
            disabled={isPending || (mode === 'featured_initiative' && publishedInitiatives.length === 0)}
            className={`${styles.btn} ${styles.btnPrimary}`}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            {isPending ? 'Saving...' : 'Save Hero Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
