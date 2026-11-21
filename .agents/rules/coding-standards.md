# Coding Standards & Best Practices

Panduan standar penulisan kode untuk proyek **Kemas Prasasti 2025**.

---

## 1. TypeScript & Type Safety

- **Strict Mode:** Selalu gunakan type yang jelas dan hindari penggunaan `any`. Jika tipe dinamis diperlukan, gunakan `unknown` dengan type narrowing atau generics.
- **Pemisahan Tipe:**
  - Interfaces/types data global disimpan di folder `types/` (misal: `event.interface.ts`, `blog.interface.ts`, `user.interface.ts`).
  - Tipe inferensi dari skema Zod diekspor langsung dari berkas schema terkait menggunakan `z.infer<typeof schema>`.
- **Naming Conventions:**
  - Interfaces diawali huruf `I` atau penamaan deskriptif (`ICompetition`, `BlogPost`, `RegistrationPayload`).
  - Tipe komponen React menggunakan format `[ComponentName]Props`.

---

## 2. Next.js App Router Conventions

- **Server Components by Default:**
  - Seluruh komponen di dalam direktori `app/` adalah Server Components secara default.
  - Tambahkan direktif `'use client'` hanya pada komponen daun (leaf components) yang memerlukan hooks (`useState`, `useEffect`), event handlers (`onClick`, `onChange`), atau browser API.
- **Route Groups:**
  - `(landing)`: Halaman publik (beranda, tentang kami, timeline, kontak, katalog lomba).
  - `(detail)`: Halaman detail (detail kompetisi, detail artikel blog).
  - `(dashboard)`: Halaman administrasi yang dilindungi autentikasi (CMS blog, verifikasi peserta, settings).
- **Data Fetching:**
  - Fetch data di Server Component menggunakan async/await atau Server Actions.
  - Hindari waterfall fetching; gunakan `Promise.all` bila melakukan beberapa query paralel.
  - Sediakan UI states: `loading.tsx`, `error.tsx`, dan `not-found.tsx` pada setiap route group yang relevan.

---

## 3. Validasi Data & Form (Zod)

- Setiap input formulir (pendaftaran, login admin, create blog) **wajib** divalidasi dengan Zod di sisi klien dan divalidasi ulang di sisi server (Server Action / Route Handler).
- Skema disimpan di direktori `schema/` (contoh: `schema/competition-registration.schema.ts`, `schema/blog-post.schema.ts`).
- Skema harus memberikan pesan error yang ramah pengguna dalam Bahasa Indonesia.

---

## 4. UI & Styling (Tailwind CSS v4 + Shadcn UI)

- Gunakan class utility Tailwind CSS v4. Hindari inline style kecuali untuk nilai dinamis yang tidak dapat diprediksi.
- Komponen reusable berbasis Radix UI / Shadcn disimpan di `components/ui/`.
- Komponen domain-specific (misal: `CompetitionCard`, `HeroBanner`, `RegistrationForm`) disimpan di `components/features/` atau subfolder komponen yang relevan.
- Gunakan helper `cn()` dari `lib/utils.ts` untuk penggabungan conditional class.

