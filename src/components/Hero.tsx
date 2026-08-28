import React from 'react';
import { FoundryField } from './FoundryField';
import styles from './Hero.module.css';

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero} id="top">
      <div className="container">
        <div className={styles.heroGrid}>
          {/* Left / Primary: Editorial Manifesto & Actions */}
          <div className={styles.heroContent}>
            <div className={styles.tagWrapper}>
              <span className={styles.tag}>Ecosystem & Discovery</span>
            </div>

            <h1 className={styles.headline}>
              A studio and foundry that turns ideas into useful things.
            </h1>

            <p className={styles.subhead}>
              Nalakara is an autonomous ecosystem where ideas, experiments, systems, and 
              products evolve across different domains: from intelligence frameworks and 
              specialty instruments to domain operating systems.
            </p>

            <div className={styles.actions}>
              <a href="#registry" className={styles.primaryButton}>
                Explore Registry
                <span className={styles.arrow} aria-hidden="true">↓</span>
              </a>
              <a href="#philosophy" className={styles.secondaryButton}>
                Studio Philosophy
              </a>
            </div>

            <div className={styles.lifecycleBar} aria-label="Ecosystem lifecycle phases">
              <div className={styles.lifecycleTitle}>Lifecycle Stages:</div>
              <div className={styles.lifecycleSteps}>
                <span className={styles.step}>01 Idea</span>
                <span className={styles.sep}>→</span>
                <span className={styles.step}>02 Lab</span>
                <span className={styles.sep}>→</span>
                <span className={styles.step}>03 Project</span>
                <span className={styles.sep}>→</span>
                <span className={styles.step}>04 Product</span>
                <span className={styles.sep}>→</span>
                <span className={styles.step}>05 Commercial</span>
              </div>
            </div>
          </div>

          {/* Right / Spatial Artifact: The Foundry Tensor Field */}
          <div className={styles.heroArtifact}>
            <FoundryField />
          </div>
        </div>
      </div>
    </section>
  );
};
