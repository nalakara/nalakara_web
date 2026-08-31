if (process.env.NODE_ENV !== 'test' && typeof window !== 'undefined') {
  throw new Error('This module can only be loaded on the server.');
}

import { revalidatePath, revalidateTag } from 'next/cache';

export const CACHE_TAGS = {
  ECOSYSTEM: 'ecosystem',
  INITIATIVES: 'ecosystem:initiatives',
  HERO: 'ecosystem:hero',
  PRINCIPLES: 'ecosystem:principles',
  CATEGORIES: 'ecosystem:categories',
} as const;

export type ContentDomain = 'initiatives' | 'hero' | 'principles' | 'categories' | 'all';

export interface RevalidationOptions {
  domain: ContentDomain;
  id?: string;
  extraPaths?: string[];
}

/**
 * Centralized, non-destructive cache revalidation service for the Nalakara ecosystem.
 *
 * Execution Pattern:
 * 1. Invoked strictly POST-COMMIT after a successful database mutation.
 * 2. Purges relevant domain-specific cache tag and the master 'ecosystem' tag.
 * 3. Invalidates associated Next.js route paths for immediate admin/preview reflection.
 * 4. Error isolation: Any runtime failure or warning during cache purging is caught and
 *    logged without failing or rolling back the underlying database state.
 */
export function revalidateEcosystemCache(options: RevalidationOptions): { success: boolean; error?: string } {
  const { domain, id, extraPaths = [] } = options;

  try {
    // 1. Tag Invalidation
    try {
      revalidateTag(CACHE_TAGS.ECOSYSTEM);

      if (domain === 'initiatives') {
        revalidateTag(CACHE_TAGS.INITIATIVES);
      } else if (domain === 'hero') {
        revalidateTag(CACHE_TAGS.HERO);
      } else if (domain === 'principles') {
        revalidateTag(CACHE_TAGS.PRINCIPLES);
      } else if (domain === 'categories') {
        revalidateTag(CACHE_TAGS.CATEGORIES);
      }
    } catch (tagErr: any) {
      // Gracefully handle if called in static or CLI environment where revalidateTag is a no-op
      console.warn(`[Revalidation Engine] revalidateTag warning for domain '${domain}':`, tagErr?.message || tagErr);
    }

    // 2. Route Path Invalidation
    try {
      // Always purge public homepage and dashboard overview
      revalidatePath('/');
      revalidatePath('/admin');
      revalidatePath('/admin/preview');

      if (domain === 'initiatives') {
        revalidatePath('/admin/initiatives');
        if (id) {
          revalidatePath(`/admin/initiatives/${id}`);
        }
      } else if (domain === 'hero') {
        revalidatePath('/admin/hero');
      } else if (domain === 'principles') {
        revalidatePath('/admin/philosophy');
      } else if (domain === 'categories') {
        revalidatePath('/admin/categories');
        revalidatePath('/admin/initiatives');
      }

      // Any additional custom paths requested by the caller
      for (const p of extraPaths) {
        revalidatePath(p);
      }
    } catch (pathErr: any) {
      console.warn(`[Revalidation Engine] revalidatePath warning for domain '${domain}':`, pathErr?.message || pathErr);
    }

    return { success: true };
  } catch (err: any) {
    const errorMsg = err?.message || 'Unknown revalidation failure';
    console.error(`[Revalidation Engine] Unexpected error revalidating domain '${domain}':`, errorMsg);
    // Non-destructive: return failure metadata without throwing
    return { success: false, error: errorMsg };
  }
}
