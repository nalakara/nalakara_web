import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Initiatives } from '@/components/Initiatives';
import { Registry } from '@/components/Registry';
import { Philosophy } from '@/components/Philosophy';
import { Footer } from '@/components/Footer';
import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.mainWrapper}>
      <Header />
      <main id="main-content">
        <Hero />
        <Initiatives />
        <Registry />
        <Philosophy />
      </main>
      <Footer />
    </div>
  );
}
