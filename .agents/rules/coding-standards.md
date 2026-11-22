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

---

## 5. Standar Komponen Admin Dashboard (Shadcn UI & Reusability)

Seluruh antarmuka pada area **Admin Dashboard** (`app/(dashboard)`) **WAJIB** memenuhi standar arsitektur komponen berikut:

1. **Wajib Memanfaatkan Primitif Shadcn UI (`pnpm dlx shadcn@latest add`):**
   - Setiap komponen pada area dashboard wajib mengambil dan menggunakan komponen resmi dari Shadcn UI.
   - **Protokol Penambahan Komponen:**
     1. Periksa ketersediaan komponen di `components/ui/` terlebih dahulu. Jika sudah ada, gunakan yang sudah tersedia.
     2. Jika komponen belum tersedia di direktori proyek, lakukan download/instalasi dengan menjalankan perintah:
        ```bash
        pnpm dlx shadcn@latest add {component}
        ```
   - Dilarang membuat komponen atomik secara ad-hoc/manual jika padanannya tersedia di Shadcn UI (`Table`, `Card`, `Badge`, `Button`, `Dialog`, `DropdownMenu`, `Avatar`, `Input`, `Select`, `Tabs`, `Skeleton`, `Sheet`, `Switch`, `Textarea`, dll.).
2. **Modular & Reusable Component System (`components/dashboard/`):**
   - Halaman `page.tsx` di dalam `(dashboard)` hanya berfungsi sebagai perakit tata letak (*composition layer*) dan pengambil data (*data-fetching layer*), **bukan** tempat menulis ratusan baris markup UI inline.
   - Seluruh elemen dashboard umum wajib dipecah menjadi komponen reusable di `components/dashboard/`:
     - **`DashboardShell` & `DashboardLayout`:** Struktur shell terpadu yang membungkus konten admin.
     - **`DashboardSidebar`:** Navigasi sidebar responsif (desktop fixed + mobile drawer via `Sheet`).
     - **`DashboardHeader`:** Topbar dengan breadcrumb, indikator role admin, dan menu profil admin (`DropdownMenu` & `Avatar`).
     - **`StatCard`:** Kartu indikator metrik reusable (Title, Value, Change/Trend, Icon, Deskripsi) berbasis `Card`.
     - **`StatusBadge`:** Pemetaan status konsisten (`Pending`, `Verified`, `Rejected`, `Draft`, `Published`, `Open`, `Closed`) berbasis `Badge`.
     - **`PageHeader`:** Header halaman dashboard terstandarisasi dengan slot judul, subtitle/deskripsi, dan tombol aksi (misal "Tambah Artikel", "Ekspor CSV").
     - **`EmptyState`:** Indikator visual saat tabel/koleksi data kosong dengan ikon dan tombol aksi kontekstual.
     - **`DataTablePagination` / `DataTable`:** Pengendali paginasi, pencarian, dan filter tabel terpusat.
3. **Props Bersih & TypeScript Strict:**
   - Setiap komponen reusable wajib memiliki interface Props yang eksplisit (`[ComponentName]Props`).
   - Mendukung prop `className` opsional dengan `cn()` untuk ekstensi layout bila diperlukan.

