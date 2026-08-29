'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, LifecycleStage, AccessModel, PublicationStatus } from '@/types/database';
import {
  createInitiativeAction,
  updateInitiativeDraftAction,
  publishInitiativeAction,
  archiveInitiativeAction,
  deleteInitiativeAction,
  ActionResult,
} from './actions';
import { formatSlug } from './utils';
import styles from '../../admin.module.css';

type InitiativeRow = Database['public']['Tables']['initiatives']['Row'];
type CategoryRow = Pick<Database['public']['Tables']['categories']['Row'], 'id' | 'name_en' | 'name_id'>;

interface InitiativeFormProps {
  mode: 'create' | 'edit';
  initialData?: InitiativeRow;
  categories: CategoryRow[];
  nextSortOrder?: number;
}

export default function InitiativeForm({
  mode,
  initialData,
  categories,
  nextSortOrder = 0,
}: InitiativeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [isSlugCustomized, setIsSlugCustomized] = useState(mode === 'edit');

  const [categoryId, setCategoryId] = useState(
    initialData?.category_id || (categories.length > 0 ? categories[0].id : '')
  );
  const [lifecycleStage, setLifecycleStage] = useState<LifecycleStage>(
    initialData?.lifecycle_stage || 'idea'
  );
  const [accessModel, setAccessModel] = useState<AccessModel>(
    initialData?.access_model || 'concept'
  );
  const [sortOrder, setSortOrder] = useState<number>(
    initialData ? initialData.sort_order : nextSortOrder
  );
  const [targetUrl, setTargetUrl] = useState(initialData?.target_url || '');
  const [isExternal, setIsExternal] = useState(
    initialData ? initialData.is_external : true
  );
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [publicationStatus, setPublicationStatus] = useState<PublicationStatus>(
    initialData?.publication_status || 'draft'
  );

  // Bilingual State
  const [taglineEn, setTaglineEn] = useState(initialData?.tagline_en || '');
  const [taglineId, setTaglineId] = useState(initialData?.tagline_id || '');
  const [descriptionEn, setDescriptionEn] = useState(initialData?.description_en || '');
  const [descriptionId, setDescriptionId] = useState(initialData?.description_id || '');

  const [commercialBadgeEn, setCommercialBadgeEn] = useState(
    initialData?.commercial_badge_en || ''
  );
  const [commercialBadgeId, setCommercialBadgeId] = useState(
    initialData?.commercial_badge_id || ''
  );
  const [commercialActionEn, setCommercialActionEn] = useState(
    initialData?.commercial_action_en || ''
  );
  const [commercialActionId, setCommercialActionId] = useState(
    initialData?.commercial_action_id || ''
  );

  // UI Feedback
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [generalSuccess, setGeneralSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');

  // Auto-slug generator for Create mode
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (mode === 'create' && !isSlugCustomized) {
      setSlug(formatSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugCustomized(true);
    setSlug(formatSlug(e.target.value));
  };

  // Build FormData for Server Action submission
  const buildFormData = (): FormData => {
    const fd = new FormData();
    fd.set('name', name);
    fd.set('slug', slug);
    fd.set('category_id', categoryId);
    fd.set('lifecycle_stage', lifecycleStage);
    fd.set('access_model', accessModel);
    fd.set('sort_order', String(sortOrder));
    fd.set('target_url', targetUrl);
    fd.set('is_external', isExternal ? 'true' : 'false');
    fd.set('featured', featured ? 'true' : 'false');

    fd.set('tagline_en', taglineEn);
    fd.set('tagline_id', taglineId);
    fd.set('description_en', descriptionEn);
    fd.set('description_id', descriptionId);

    fd.set('commercial_badge_en', commercialBadgeEn);
    fd.set('commercial_badge_id', commercialBadgeId);
    fd.set('commercial_action_en', commercialActionEn);
    fd.set('commercial_action_id', commercialActionId);

    return fd;
  };

  // SAVE DRAFT
  const handleSaveDraft = async () => {
    setGeneralError(null);
    setGeneralSuccess(null);
    setFieldErrors({});

    const formData = buildFormData();

    startTransition(async () => {
      let result: ActionResult<{ id?: string } | unknown>;

      if (mode === 'create') {
        const createRes = await createInitiativeAction(formData);
        result = createRes;
        if (createRes.success && createRes.data?.id) {
          router.push(`/admin/initiatives/${createRes.data.id}`);
          return;
        }
      } else {
        result = await updateInitiativeDraftAction(initialData!.id, formData);
      }

      if (!result.success) {
        setGeneralError(result.error || 'Failed to save draft.');
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
      } else {
        setGeneralSuccess('Draft successfully saved to database.');
        router.refresh();
      }
    });
  };

  // PUBLISH ACTION
  const handlePublish = async () => {
    setGeneralError(null);
    setGeneralSuccess(null);
    setFieldErrors({});

    const formData = buildFormData();

    startTransition(async () => {
      let targetId = initialData?.id;

      // If creating, first save as draft to obtain valid row ID, then publish
      if (mode === 'create') {
        const createRes = await createInitiativeAction(formData);
        if (!createRes.success || !createRes.data?.id) {
          setGeneralError(createRes.error || 'Validation failed during creation.');
          if (createRes.fieldErrors) setFieldErrors(createRes.fieldErrors);
          return;
        }
        targetId = createRes.data.id;
      }

      const pubRes = await publishInitiativeAction(targetId!, formData);

      if (!pubRes.success) {
        setGeneralError(pubRes.error || 'Publication validation failed.');
        if (pubRes.fieldErrors) {
          setFieldErrors(pubRes.fieldErrors);
        }
      } else {
        setPublicationStatus('published');
        setGeneralSuccess('Initiative successfully published to live ecosystem registry.');
        if (mode === 'create') {
          router.push(`/admin/initiatives/${targetId}`);
        } else {
          router.refresh();
        }
      }
    });
  };

  // ARCHIVE ACTION
  const handleArchive = async () => {
    if (!initialData) return;
    setGeneralError(null);
    setGeneralSuccess(null);

    startTransition(async () => {
      const res = await archiveInitiativeAction(initialData.id);
      if (!res.success) {
        setGeneralError(res.error || 'Failed to archive initiative.');
      } else {
        setPublicationStatus('archived');
        setGeneralSuccess('Initiative archived. It will no longer appear on public listing.');
        router.refresh();
      }
    });
  };

  // DELETE ACTION
  const handleDelete = async () => {
    if (!initialData) return;
    setGeneralError(null);

    startTransition(async () => {
      const res = await deleteInitiativeAction(initialData.id);
      if (!res.success) {
        setGeneralError(res.error || 'Failed to delete initiative.');
        setShowDeleteModal(false);
      } else {
        router.push('/admin/initiatives');
      }
    });
  };

  return (
    <div>
      {/* Top Header & Context Actions */}
      <div className={styles.pageHeaderRow}>
        <div>
          <Link
            href="/admin/initiatives"
            className={styles.actionLink}
            style={{ display: 'inline-block', marginBottom: '0.5rem' }}
          >
            ← Back to Initiatives
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 className={styles.pageTitle} style={{ margin: 0 }}>
              {mode === 'create' ? 'Create New Initiative' : name || initialData?.id}
            </h1>
            {mode === 'edit' && (
              <span
                className={`${styles.statusTag} ${
                  publicationStatus === 'published'
                    ? styles.statusPublished
                    : publicationStatus === 'draft'
                    ? styles.statusDraft
                    : styles.statusArchived
                }`}
              >
                {publicationStatus}
              </span>
            )}
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={isPending}
            className={`${styles.btn} ${styles.btnDraft}`}
          >
            {isPending ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPending}
            className={`${styles.btn} ${styles.btnPublish}`}
          >
            {isPending ? 'Publishing...' : 'Publish to Live'}
          </button>
        </div>
      </div>

      {/* General Notification Messages */}
      {generalError && (
        <div className={styles.messageError} role="alert" style={{ marginBottom: '1.5rem' }}>
          <strong>Action Failed:</strong> {generalError}
        </div>
      )}

      {generalSuccess && (
        <div className={styles.messageSuccess} role="status" style={{ marginBottom: '1.5rem' }}>
          {generalSuccess}
        </div>
      )}

      {/* SECTION 1: SYSTEM METADATA */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>System Metadata & Taxonomies</h2>
          <span className={styles.cardSubtitle}>Core operational attributes</span>
        </div>

        <div className={styles.formGrid}>
          {/* Initiative Name */}
          <div className={styles.formGroup}>
            <label htmlFor="input-name" className={styles.formLabel}>
              Initiative Name *
            </label>
            <input
              id="input-name"
              type="text"
              required
              maxLength={64}
              value={name}
              onChange={handleNameChange}
              placeholder="e.g. Roast Navigator"
              className={styles.formInput}
              disabled={isPending}
            />
            {fieldErrors.name && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>{fieldErrors.name}</div>
            )}
          </div>

          {/* Slug & Identifier */}
          <div className={styles.formGroup}>
            <label htmlFor="input-slug" className={styles.formLabel}>
              Slug Identifier *
            </label>
            <input
              id="input-slug"
              type="text"
              required
              maxLength={64}
              value={slug}
              onChange={handleSlugChange}
              placeholder="e.g. roast-navigator"
              className={styles.formInput}
              disabled={isPending || mode === 'edit'}
            />
            <div className={styles.fieldMeta}>
              <span>Stable identifier · must be unique</span>
              <span>{slug.length}/64</span>
            </div>
            {fieldErrors.slug && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>{fieldErrors.slug}</div>
            )}
          </div>

          {/* Category */}
          <div className={styles.formGroup}>
            <label htmlFor="input-category" className={styles.formLabel}>
              Category *
            </label>
            <select
              id="input-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className={styles.formSelect}
              disabled={isPending}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name_en} ({cat.id})
                </option>
              ))}
            </select>
            {fieldErrors.category_id && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                {fieldErrors.category_id}
              </div>
            )}
          </div>

          {/* Lifecycle Stage */}
          <div className={styles.formGroup}>
            <label htmlFor="input-lifecycle" className={styles.formLabel}>
              Lifecycle Stage *
            </label>
            <select
              id="input-lifecycle"
              value={lifecycleStage}
              onChange={(e) => setLifecycleStage(e.target.value as LifecycleStage)}
              className={styles.formSelect}
              disabled={isPending}
            >
              <option value="idea">01 Idea</option>
              <option value="lab">02 Lab</option>
              <option value="project">03 Project</option>
              <option value="product">04 Product</option>
              <option value="commercial">05 Commercial</option>
            </select>
            {fieldErrors.lifecycle_stage && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                {fieldErrors.lifecycle_stage}
              </div>
            )}
          </div>

          {/* Access Model */}
          <div className={styles.formGroup}>
            <label htmlFor="input-access" className={styles.formLabel}>
              Access Model *
            </label>
            <select
              id="input-access"
              value={accessModel}
              onChange={(e) => setAccessModel(e.target.value as AccessModel)}
              className={styles.formSelect}
              disabled={isPending}
            >
              <option value="concept">Concept</option>
              <option value="private-alpha">Private Alpha</option>
              <option value="public-beta">Public Beta</option>
              <option value="production">Production</option>
              <option value="commercial">Commercial</option>
            </select>
            {fieldErrors.access_model && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                {fieldErrors.access_model}
              </div>
            )}
          </div>

          {/* Sort Order */}
          <div className={styles.formGroup}>
            <label htmlFor="input-order" className={styles.formLabel}>
              Sort Order (Optional · default 0)
            </label>
            <input
              id="input-order"
              type="number"
              min={0}
              value={sortOrder}
              onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
              className={styles.formInput}
              disabled={isPending}
            />
            {fieldErrors.sort_order && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                {fieldErrors.sort_order}
              </div>
            )}
          </div>

          {/* Target URL */}
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label htmlFor="input-url" className={styles.formLabel}>
              Target URL (Optional)
            </label>
            <input
              id="input-url"
              type="url"
              maxLength={255}
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://initiative.nalakara.com"
              className={styles.formInput}
              disabled={isPending}
            />
            {fieldErrors.target_url && (
              <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                {fieldErrors.target_url}
              </div>
            )}
          </div>
        </div>

        {/* Checkbox Toggles */}
        <div style={{ display: 'flex', gap: '2rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle, #27272a)' }}>
          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className={styles.checkboxInput}
              disabled={isPending}
            />
            <span>Featured Initiative (Highlight in Current Initiatives)</span>
          </label>

          <label className={styles.checkboxContainer}>
            <input
              type="checkbox"
              checked={isExternal}
              onChange={(e) => setIsExternal(e.target.checked)}
              className={styles.checkboxInput}
              disabled={isPending}
            />
            <span>External Link Target</span>
          </label>
        </div>
      </div>

      {/* SECTION 2: BILINGUAL CONTENT (SIDE-BY-SIDE) */}
      <div className={styles.formCard}>
        <div className={styles.cardHeader}>
          <div>
            <h2 className={styles.cardTitle}>Bilingual Editorial Content</h2>
            <span className={styles.cardSubtitle}>
              &quot;One meaning. Two native expressions.&quot;
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted, #71717a)' }}>
            Side-by-side comparison
          </span>
        </div>

        <div className={styles.bilingualGrid}>
          {/* ENGLISH COLUMN */}
          <div className={styles.bilingualColumn}>
            <div className={styles.langHeader}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>English</span>
              <span className={styles.langBadge}>EN</span>
            </div>

            {/* Tagline EN */}
            <div className={styles.formGroup}>
              <label htmlFor="input-tagline-en" className={styles.formLabel}>
                Tagline (EN) *
              </label>
              <textarea
                id="input-tagline-en"
                maxLength={140}
                rows={2}
                value={taglineEn}
                onChange={(e) => setTaglineEn(e.target.value)}
                placeholder="Autonomous operations and system intelligence framework."
                className={styles.formTextarea}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Max 140 characters</span>
                <span style={{ color: taglineEn.length > 130 ? '#facc15' : 'inherit' }}>
                  {taglineEn.length}/140
                </span>
              </div>
              {fieldErrors.tagline_en && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.tagline_en}
                </div>
              )}
            </div>

            {/* Description EN */}
            <div className={styles.formGroup}>
              <label htmlFor="input-desc-en" className={styles.formLabel}>
                Description (EN) *
              </label>
              <textarea
                id="input-desc-en"
                maxLength={320}
                rows={4}
                value={descriptionEn}
                onChange={(e) => setDescriptionEn(e.target.value)}
                placeholder="Detailed explanation of the architecture, utility, and scope..."
                className={styles.formTextarea}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Max 320 characters</span>
                <span style={{ color: descriptionEn.length > 300 ? '#facc15' : 'inherit' }}>
                  {descriptionEn.length}/320
                </span>
              </div>
              {fieldErrors.description_en && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.description_en}
                </div>
              )}
            </div>

            {/* Commercial Badge EN */}
            <div className={styles.formGroup}>
              <label htmlFor="input-comm-badge-en" className={styles.formLabel}>
                Commercial Badge (EN, Optional)
              </label>
              <input
                id="input-comm-badge-en"
                type="text"
                maxLength={40}
                value={commercialBadgeEn}
                onChange={(e) => setCommercialBadgeEn(e.target.value)}
                placeholder="e.g. Commercial Candidate"
                className={styles.formInput}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Max 40 chars</span>
                <span>{commercialBadgeEn.length}/40</span>
              </div>
              {fieldErrors.commercial_badge_en && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.commercial_badge_en}
                </div>
              )}
            </div>

            {/* Commercial Action EN */}
            <div className={styles.formGroup}>
              <label htmlFor="input-comm-action-en" className={styles.formLabel}>
                Commercial Action (EN, Optional)
              </label>
              <input
                id="input-comm-action-en"
                type="text"
                maxLength={40}
                value={commercialActionEn}
                onChange={(e) => setCommercialActionEn(e.target.value)}
                placeholder="e.g. Inquire for Access"
                className={styles.formInput}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Max 40 chars</span>
                <span>{commercialActionEn.length}/40</span>
              </div>
              {fieldErrors.commercial_action_en && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.commercial_action_en}
                </div>
              )}
            </div>
          </div>

          {/* BAHASA INDONESIA COLUMN */}
          <div className={styles.bilingualColumn}>
            <div className={styles.langHeader}>
              <span style={{ fontWeight: 600, fontSize: '0.8125rem' }}>Bahasa Indonesia</span>
              <span className={styles.langBadge}>ID</span>
            </div>

            {/* Tagline ID */}
            <div className={styles.formGroup}>
              <label htmlFor="input-tagline-id" className={styles.formLabel}>
                Tagline (ID) *
              </label>
              <textarea
                id="input-tagline-id"
                maxLength={140}
                rows={2}
                value={taglineId}
                onChange={(e) => setTaglineId(e.target.value)}
                placeholder="Kerangka kerja operasi mandiri dan kecerdasan sistem."
                className={styles.formTextarea}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Maks 140 karakter</span>
                <span style={{ color: taglineId.length > 130 ? '#facc15' : 'inherit' }}>
                  {taglineId.length}/140
                </span>
              </div>
              {fieldErrors.tagline_id && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.tagline_id}
                </div>
              )}
            </div>

            {/* Description ID */}
            <div className={styles.formGroup}>
              <label htmlFor="input-desc-id" className={styles.formLabel}>
                Deskripsi (ID) *
              </label>
              <textarea
                id="input-desc-id"
                maxLength={320}
                rows={4}
                value={descriptionId}
                onChange={(e) => setDescriptionId(e.target.value)}
                placeholder="Penjelasan mendalam mengenai arsitektur, kegunaan, dan ruang lingkup..."
                className={styles.formTextarea}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Maks 320 karakter</span>
                <span style={{ color: descriptionId.length > 300 ? '#facc15' : 'inherit' }}>
                  {descriptionId.length}/320
                </span>
              </div>
              {fieldErrors.description_id && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.description_id}
                </div>
              )}
            </div>

            {/* Commercial Badge ID */}
            <div className={styles.formGroup}>
              <label htmlFor="input-comm-badge-id" className={styles.formLabel}>
                Badge Komersial (ID, Opsional)
              </label>
              <input
                id="input-comm-badge-id"
                type="text"
                maxLength={40}
                value={commercialBadgeId}
                onChange={(e) => setCommercialBadgeId(e.target.value)}
                placeholder="e.g. Kandidat Komersial"
                className={styles.formInput}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Maks 40 karakter</span>
                <span>{commercialBadgeId.length}/40</span>
              </div>
              {fieldErrors.commercial_badge_id && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.commercial_badge_id}
                </div>
              )}
            </div>

            {/* Commercial Action ID */}
            <div className={styles.formGroup}>
              <label htmlFor="input-comm-action-id" className={styles.formLabel}>
                Aksi Komersial (ID, Opsional)
              </label>
              <input
                id="input-comm-action-id"
                type="text"
                maxLength={40}
                value={commercialActionId}
                onChange={(e) => setCommercialActionId(e.target.value)}
                placeholder="e.g. Hubungi untuk Akses"
                className={styles.formInput}
                disabled={isPending}
              />
              <div className={styles.fieldMeta}>
                <span>Maks 40 karakter</span>
                <span>{commercialActionId.length}/40</span>
              </div>
              {fieldErrors.commercial_action_id && (
                <div style={{ color: '#f87171', fontSize: '0.75rem' }}>
                  {fieldErrors.commercial_action_id}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 3: LIFECYCLE MANAGEMENT (EDIT MODE ONLY) */}
      {mode === 'edit' && initialData && (
        <div className={styles.lifecycleSection}>
          <div className={styles.lifecycleHeader}>
            <h3 className={styles.lifecycleTitle}>Lifecycle Management</h3>
            <p className={styles.lifecycleDesc}>
              Standard lifecycle status transitions. Archiving hides the initiative from the live public registry while preserving full editorial draft history.
            </p>
          </div>

          <div style={{ marginTop: '1rem' }}>
            {publicationStatus !== 'archived' ? (
              <button
                type="button"
                onClick={handleArchive}
                disabled={isPending}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Archive Initiative
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isPending}
                className={`${styles.btn} ${styles.btnDraft}`}
              >
                Restore to Draft Status
              </button>
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: DANGER ZONE (EDIT MODE ONLY) */}
      {mode === 'edit' && initialData && (
        <div className={styles.dangerZone}>
          <div className={styles.dangerZoneHeader}>
            <h3 className={styles.dangerZoneTitle}>Danger Zone</h3>
            <p className={styles.dangerZoneDesc}>
              Irreversible destructive operations. Deleting will permanently remove this initiative record from the database.
            </p>
          </div>

          <div className={styles.dangerZoneActions}>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirmationInput('');
                setShowDeleteModal(true);
              }}
              disabled={isPending}
              className={`${styles.btn} ${styles.btnDanger}`}
            >
              Delete Initiative Permanently
            </button>
          </div>
        </div>
      )}

      {/* DESTRUCTIVE DELETE CONFIRMATION MODAL */}
      {showDeleteModal && initialData && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="modal-delete-title">
          <div className={styles.modalCard}>
            <h3 id="modal-delete-title" className={styles.modalTitle}>
              Confirm Permanent Deletion
            </h3>
            <p className={styles.modalText}>
              Are you sure you want to permanently delete <strong>{initialData.name}</strong> (<code>{initialData.id}</code>)?
              This operation cannot be undone.
            </p>
            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="confirm-slug-input" className={styles.formLabel}>
                Type <code>{initialData.id}</code> to confirm:
              </label>
              <input
                id="confirm-slug-input"
                type="text"
                value={deleteConfirmationInput}
                onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                placeholder={initialData.id}
                className={styles.formInput}
              />
            </div>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className={`${styles.btn} ${styles.btnSecondary}`}
                disabled={isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending || deleteConfirmationInput !== initialData.id}
                className={`${styles.btn} ${styles.btnDanger}`}
              >
                {isPending ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
