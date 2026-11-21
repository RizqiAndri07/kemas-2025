---
name: create-feature
description: Workflow standar untuk merancang, mendokumentasikan, dan mengimplementasikan fitur baru di Kemas Prasasti 2025.
---

# Skill: Create Feature Workflow

Workflow ini digunakan oleh Agent atau developer ketika akan menambahkan fitur baru (misalnya: modul CMS Blog, sistem Pendaftaran Lomba, Dashboard Verifikasi Peserta).

---

## Tahap 1: Analisis Kebutuhan & Perencanaan Dokumen
1. Jangan langsung menulis kode.
2. Identifikasi scope fitur:
   - Apakah fitur publik (`app/(landing)`), detail (`app/(detail)`), atau admin (`app/(dashboard)`)?
   - Siapa penggunanya (Public Guest, Peserta, Admin)?
3. Tulis atau perbarui spesifikasi fitur di `docs/feateures/<nama-fitur>.md`:
   - Latar belakang & tujuan.
   - User flow / alur proses.
   - Struktur field & kebutuhan data.
4. Minta konfirmasi dan persetujuan pengguna sebelum melangkah ke tahap implementasi.

---

## Tahap 2: Definisi Tipe Data & Skema Validasi
1. Tentukan TypeScript interface di folder `types/`.
2. Buat skema validasi Zod di folder `schema/`:
   - Validasi setiap input (panjang karakter, format email/telepon, tipe file berkas).
   - Pastikan pesan validasi berbahasa Indonesia yang jelas.
3. Jika melibatkan tabel database baru di Prisma / skema PostgreSQL, dokumentasikan model datanya di `docs/architechture/`.

---

## Tahap 3: Implementasi Backend / Data Service
1. Buat service / data access function di `lib/` atau `services/`.
2. Jika menggunakan Server Actions, pastikan:
   - Validasi otentikasi/otorisasi pengguna (jika route terproteksi).
   - Validasi payload dengan `schema.safeParse()`.
   - Error handling yang konsisten (mengembalikan format `{ success: boolean, data?: T, error?: string }`).

---

## Tahap 4: Implementasi UI & Komponen
1. Pisahkan antara Server Component (pengambil data) dan Client Component (interaksi form/tombol).
2. Manfaatkan komponen dari `components/ui/` (Shadcn/Radix UI).
3. Berikan feedback interaktif kepada pengguna:
   - Loading indicator saat submit.
   - Toast/Alert notifikasi saat berhasil atau gagal.
   - Validasi error per-field form.

---

## Tahap 5: Verifikasi & Sinkronisasi
1. Uji alur positif (happy path) dan alur negatif (validasi gagal, error koneksi).
2. Pastikan tidak ada lint error atau type error (`pnpm lint`).
3. Update dokumentasi roadmap / checklist di `docs/feateures/` dan `AGENTS.md`.

