# Nalakara Web v1.2 — Master Project Continuity Memo

**Dokumen**: Master Project Continuity & Handover Memo  
**Status Terakhir**: **Phase 3 (Live Preview & Toolbar) Selesai & Ter-Freeze**  
**Git Branch**: `main` — Clean working tree  
**Tanggal**: 31 Agustus 2026  
**Target Utama Proyek**: Nalakara Content Console v1.2  

---

## 1. Ringkasan Eksekutif (Executive Summary)

Proyek **Nalakara Web v1.2** bertujuan membangun **Content Console (`/admin`)** internal yang aman, elegan, dan mandiri untuk pemilik studio (Owner) guna mengelola seluruh konten studio (Initiatives, Categories, Hero, Principles) secara dinamis menggunakan **Supabase PostgreSQL & Next.js App Router Server Actions**, tanpa mengorbankan performa publik yang 100% statis (*sub-second static edge serving*).

Sampai saat ini, **Phase 0, Phase 1, Phase 2A, Phase 2B, Phase 2C, dan Phase 3 telah selesai 100%** dan telah di-push ke branch `main`.

---

## 2. Status Pencapaian Per Phase (Milestone History)

| Phase | Nama Milestone | Status | Deskripsi Hasil & Kemampuan |
| :--- | :--- | :---: | :--- |
| **Phase 0** | **Supabase Foundation** | **SELESAI** | Database schema, ENUMs (`lifecycle_stage`, `access_model`, `publication_status`, `hero_mode`), triggers `updated_at`, dan RLS policies berbasis single-owner allowlist (`admin_users`). |
| **Phase 1** | **Data Migration & Parity** | **SELESAI** | Migrasi seluruh data awal v1.1 ke database Supabase (5 categories, 4 initiatives, 4 principles, 1 hero singleton) dengan verifikasi parity 1:1. |
| **Phase 2A** | **Admin Auth & Shell** | **SELESAI** | Passwordless Auth (Magic Link via Supabase), route protection middleware (`/admin/*`), dan monospace editorial shell layout. |
| **Phase 2B** | **Initiatives Management** | **SELESAI** | Registry table, deterministic slug creator, side-by-side bilingual editor (EN & ID), validasi publikasi (required vs optional fields), perbaikan PKCE callback (`route.ts`), serta lifecycle/danger zone. |
| **Phase 2C** | **Taxonomy & Studio Config** | **SELESAI** | Editor Category (`/admin/categories`), Hero Presentation Config (`/admin/hero`), dan Studio Principles Editor (`/admin/philosophy`). |
| **Phase 3** | **Live Preview & Toolbar** | **SELESAI** | Rute `/admin/preview` terisolasi merender seluruh status Supabase live (termasuk draf dengan badge monospace `[DRAFT]`) menggunakan komponen publik asli, dilengkapi Floating Preview Toolbar bilingual (EN/ID). |


---

## 3. Kondisi Sistem Saat Ini (Current System State)

### A. Admin Console (`/admin`)
* **Live Database Connection**: Admin Console membaca dan menulis langsung ke database live Supabase PostgreSQL.
* **Domain yang Sudah Aktif & Berfungsi Penuh**:
  1. **Dashboard Overview (`/admin`)**: Status matrix & statistik konten.
  2. **Initiatives Management (`/admin/initiatives`)**: List, Create (`/new`), Edit (`/[id]`), Save Draft, Publish to Live, Archive, Delete.
  3. **Category Classifications (`/admin/categories`)**: List dengan chip jumlah inisiatif, Create category, Edit bilingual label, Toggle status aktif/inaktif, Foreign-key protected deletion.
  4. **Hero Presentation (`/admin/hero`)**: Switcher mode (`Studio Manifesto` vs `Featured Initiative`), dropdown inisiatif terbitan, toggle 5-stage lifecycle bar.
  5. **Foundational Principles (`/admin/philosophy`)**: Matrix aksioma studio `01`–`04`, editor bilingual esai, penomoran urutan dan status publikasi.

### B. Public Website (`/`)
* **Arsitektur Publik Masih Statis**: Halaman depan publik (`nalakara.com`) saat ini **sengaja masih membaca file data statis (`src/data/ecosystem.ts` & `src/data/i18n.ts`)**.
* **Keuntungan**: Website publik tetap 100% cepat, tidak terpengaruh oleh draf eksperimen admin, dan tidak memiliki risiko downtime database saat admin sedang diuji coba.
* **Jadwal Migrasi Publik**: Migrasi pembacaan data publik ke Supabase yang di-cache (*Incremental Static Regeneration / on-demand revalidation*) dijadwalkan pada **Phase 5**.

### C. Keamanan & Autentikasi
* **Single-Owner Allowlist**: Hanya akun terdaftar di tabel `admin_users` (`nalakara.id@gmail.com`) yang memiliki izin tulis.
* **Server Action Protection**: Setiap Server Action diverifikasi oleh `verifyOwner()`.
* **PKCE Auth Callback**: Menggunakan canonical Next.js App Router Server Route Handler di `src/app/auth/callback/route.ts`.
* **Service Role Key**: Kunci rahasia `SUPABASE_SERVICE_ROLE_KEY` terlindungi penuh oleh `server-only` dan tidak bocor ke client JS bundle.

---

## 4. Invarian & Keputusan Desain Penting (Architectural Invariants)

1. **Prinsip Bilingual**: Bahasa Inggris (`EN`) dan Bahasa Indonesia (`ID`) adalah **dua ekspresi asli yang sejajar** (*"One meaning. Two native expressions."*), bukan hubungan "sumber dan terjemahan". Seluruh form editor menyediakan input berdampingan (*side-by-side*).
2. **Tanpa Perubahan Skema yang Tidak Perlu**: Skema database yang dibuat di Phase 0 terbukti mencakup seluruh kebutuhan konten tanpa perlu migrasi DDL tambahan.
3. **Konsep "Initiative Visual"**: Representasi visual inisiatif (tangkapan layar, render 3D, diagram arsitektur) **tidak dimasukkan secara terburu-buru** ke Phase 2. Titik integrasinya telah didokumentasikan untuk fase khusus **Media & Asset Management** di masa depan.

---

## 5. Roadmap Langkah Selanjutnya Saat Melanjutkan Proyek

Ketika Anda siap melanjutkan proyek ini di masa mendatang, urutan fase berikutnya adalah:

```
┌─────────────────────────────────────────────────────────────┐
│  Phase 0 s/d Phase 2C (SELESAI & FROZEN)                    │
│  - Database Foundation                                      │
│  - Data Migration                                           │
│  - Admin Shell & Auth                                       │
│  - Initiatives, Categories, Hero, Philosophy Editors        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 3 — LIVE PREVIEW & TOOLBAR (/admin/preview)          │
│  - Halaman preview terotentikasi merender draf langsung     │
│    menggunakan komponen publik asli.                        │
│  - Floating toolbar dengan tombol toggle bahasa EN/ID dan   │
│    tombol Publish.                                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 4 — PUBLISHING & ON-DEMAND REVALIDATION              │
│  - Server Action publikasi massal & on-demand cache purge   │
│    (revalidateTag('ecosystem') & revalidatePath('/')).      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 5 — PUBLIC SOURCE MIGRATION & CUTOVER                │
│  - Menghubungkan halaman publik (/) untuk membaca data      │
│    Supabase yang di-cache dengan fallback data lokal.       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  Phase 6 — PRODUCTION VERIFICATION & FINAL FREEZE           │
│  - Audit menyeluruh performa Edge, Lighthouse 98+, dan rilis│
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Checklist Verifikasi Cepat Saat Memulai Kembali

Sebelum mulai coding fase berikutnya, jalankan perintah berikut di terminal:

```bash
# 1. Pastikan TypeScript bersih (0 error)
npx tsc --noEmit

# 2. Pastikan build Next.js sukses
npm run build

# 3. Jalankan suite regresi lengkap
npx tsx --env-file=.env.local scripts/test-phase-2c-master.ts
npx tsx --env-file=.env.local scripts/test-phase-2b-refinement.ts

# 4. Jalankan dev server lokal
npm run dev -- -p 7000
```

---

*Memo ini telah disimpan di root repository sebagai `PROJECT_STATUS_MEMO.md` untuk memudahkan peninjauan kembali.*
