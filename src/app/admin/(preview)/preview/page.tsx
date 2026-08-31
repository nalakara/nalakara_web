import React from 'react';
import { getPreviewData } from '@/lib/supabase/preview';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Initiatives } from '@/components/Initiatives';
import { Registry } from '@/components/Registry';
import { Philosophy } from '@/components/Philosophy';
import { Footer } from '@/components/Footer';
import { PreviewToolbar } from '@/components/admin/PreviewToolbar';
import styles from '@/app/page.module.css';

export default async function AdminPreviewPage() {
  const previewData = await getPreviewData();

  return (
    <div className={styles.mainWrapper}>
      <Header />
      <main id="main-content">
        <Hero config={previewData.heroConfig} />
        <Initiatives items={previewData.featuredInitiatives} />
        <Registry items={previewData.initiatives} />
        <Philosophy principles={previewData.principles} />
      </main>
      <Footer />
      <PreviewToolbar draftCount={previewData.draftCount} />
    </div>
  );
}
