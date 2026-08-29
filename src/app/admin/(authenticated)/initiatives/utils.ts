/**
 * Normalizes a string into a deterministic URL/database-safe slug:
 * - lowercase
 * - trim
 * - spaces to hyphens
 * - only [a-z0-9-]
 * - collapses multiple hyphens
 * - strips leading and trailing hyphens
 * - max 64 characters
 */
export function formatSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}
