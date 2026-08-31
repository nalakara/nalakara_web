import React from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Initiatives } from '@/components/Initiatives';
import { Registry } from '@/components/Registry';
import { Philosophy } from '@/components/Philosophy';
import { Footer } from '@/components/Footer';
import { getPublicEcosystemData } from '@/lib/supabase/public';
import styles from './page.module.css';

export default async function Home() {
  const data = await getPublicEcosystemData();

  return (
    <div className={styles.mainWrapper}>
      <Header />
      <main id="main-content">
        <Hero config={data.heroConfig} />
        <Initiatives items={data.featuredInitiatives} />
        <Registry items={data.initiatives} />
        <Philosophy principles={data.principles} />
      </main>
      <Footer />
    </div>
  );
}

