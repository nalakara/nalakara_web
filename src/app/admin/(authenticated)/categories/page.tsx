import React from 'react';
import { createClient } from '@/lib/supabase/server';
import CategoriesTable, { CategoryWithCount } from './CategoriesTable';

export default async function AdminCategoriesPage() {
  const isDevBypass =
    process.env.NODE_ENV === 'development' &&
    process.env.ADMIN_DEV_BYPASS === 'true';

  let supabase;
  if (isDevBypass) {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    supabase = createAdminClient();
  } else {
    supabase = await createClient();
  }

  // Fetch categories ordered by sort_order ASC
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  // Fetch initiatives to compute assigned counts per category
  const { data: initiatives, error: initError } = await supabase
    .from('initiatives')
    .select('category_id');

  if (catError) {
    throw new Error(`Failed to load categories: ${catError.message}`);
  }

  // Count initiatives per category
  const countMap: Record<string, number> = {};
  if (initiatives) {
    for (const item of initiatives) {
      if (item.category_id) {
        countMap[item.category_id] = (countMap[item.category_id] || 0) + 1;
      }
    }
  }

  const categoriesWithCount: CategoryWithCount[] = (categories || []).map((cat) => ({
    ...cat,
    initiativesCount: countMap[cat.id] || 0,
  }));

  return <CategoriesTable initialCategories={categoriesWithCount} />;
}
