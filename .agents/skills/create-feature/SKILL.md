---
name: create-feature
description: Workflow standar untuk merancang, mendokumentasikan, dan mengimplementasikan fitur baru di Frontend Kemas Prasasti 2025 (fe-app).
---

# Skill: Create Feature Workflow (Frontend)

Workflow ini digunakan oleh Agent atau developer ketika akan menambahkan fitur baru di `fe-app` (misalnya: modul CMS Blog, sistem Pendaftaran Lomba, Dashboard Verifikasi Peserta).

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
1. Tentukan TypeScript interface / DTO di folder `types/` atau `modules/<domain>/infrastructure/*.table.ts`.
2. Buat skema validasi Zod di `schema/` atau `modules/<domain>/domain/*.schema.ts`:
   - Validasi setiap input (panjang karakter, format email/telepon, tipe file berkas).
   - Pastikan pesan validasi berbahasa Indonesia yang jelas.
3. Sinkronisasikan kontrak payload dan response dengan endpoint backend (`be-app`).

---

## Tahap 3: Implementasi Data Service & Server Actions (BFF)
1. Buat repository data access di `modules/<domain>/infrastructure/*.repository.ts` yang memanggil `be-app` via `apiClient` (`lib/api-client.ts`).
2. Jika menggunakan Server Actions (`modules/<domain>/application/`):
   - Validasi otentikasi/otorisasi sesi jika route terproteksi via token cookie `kp_auth_token`.
   - Validasi payload dengan `schema.safeParse()`.
   - Error handling yang konsisten (mengembalikan format `{ success: boolean, message?: string, data?: T, error?: string }`).

---

## Tahap 4: Implementasi UI & Komponen (Shadcn UI & Sonner)
1. Pisahkan antara Server Component (pengambil data) dan Client Component (interaksi form/tombol).
2. Manfaatkan komponen resmi Shadcn UI (`components/ui/`). Jika belum ada: `pnpm dlx shadcn@latest add <component>`.
3. Gunakan standar Data Table Shadcn UI (`@tanstack/react-table`) untuk tampilan data tabular di dashboard.
4. Tampilkan notifikasi umpan balik menggunakan **Sonner Toast** di posisi **kanan atas (`top-right`)**.

---

## Tahap 5: Verifikasi & Sinkronisasi Dokumentasi
1. Uji alur positif (*happy path*) dan alur negatif (*validasi gagal, error koneksi backend*).
2. Pastikan tidak ada lint error atau type error (`pnpm build` atau `pnpm lint`).
3. **Dokumentasi Ganda Wajib:**
   - Tulis/update dokumen spesifikasi fitur di `docs/feateures/<nama-fitur>.md`.
   - Pastikan dokumentasi endpoint API di `be-app/docs/api/<nama-fitur>-api.md` sudah disinkronkan.
   - Update checklist di `AGENTS.md`.
