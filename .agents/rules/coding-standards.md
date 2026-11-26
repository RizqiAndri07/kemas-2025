# Coding Standards & Best Practices
**Kemas Prasasti 2025 - Frontend Application (`fe-app`)**

Panduan standar penulisan kode untuk aplikasi frontend berbasis Next.js App Router, React 19, Tailwind CSS v4, dan Shadcn UI.

---

## 1. TypeScript & Type Safety

- **Strict Mode:** Selalu gunakan type yang jelas dan hindari penggunaan `any`. Jika tipe dinamis diperlukan, gunakan `unknown` dengan type narrowing atau generics.
- **Pemisahan Tipe:**
  - Interfaces/types data global disimpan di folder `types/` (misal: `event.interface.ts`, `blog.interface.ts`, `user.interface.ts`).
  - DTO (Data Transfer Objects) untuk komunikasi dengan backend didefinisikan di `modules/<domain>/infrastructure/*.table.ts` sebagai pure TypeScript interfaces.
  - Tipe inferensi dari skema Zod diekspor langsung dari berkas schema terkait menggunakan `z.infer<typeof schema>`.
- **Naming Conventions:**
  - Interfaces diawali huruf `I` atau penamaan deskriptif (`ICompetition`, `BlogPost`, `RegistrationPayload`).
  - Tipe komponen React menggunakan format `[ComponentName]Props`.

---

## 2. Next.js App Router Conventions (React 19)

- **Server Components by Default:**
  - Seluruh komponen di dalam direktori `app/` adalah Server Components secara default.
  - Tambahkan direktif `'use client'` hanya pada komponen daun (leaf components) yang memerlukan hooks (`useState`, `useEffect`), event handlers (`onClick`, `onChange`), atau browser API.
- **Route Groups:**
  - `(landing)`: Halaman publik (beranda, tentang kami, timeline, kontak, katalog lomba).
  - `(detail)`: Halaman detail (detail kompetisi, detail artikel blog).
  - `(dashboard)`: Halaman administrasi yang dilindungi autentikasi (CMS blog, verifikasi peserta, settings).
- **Data Fetching:**
  - Fetch data di Server Component menggunakan async/await via Server Actions atau `apiClient` (`lib/api-client.ts`).
  - Hindari waterfall fetching; gunakan `Promise.all` bila melakukan beberapa query paralel.
  - Sediakan UI states: `loading.tsx`, `error.tsx`, dan `not-found.tsx` pada setiap route group yang relevan.

---

## 3. Validasi Data & Form (Zod)

- Setiap input formulir (pendaftaran, login admin, create blog) **wajib** divalidasi dengan Zod di sisi klien dan divalidasi ulang di sisi server (Server Action / Route Handler).
- Skema disimpan di direktori `schema/` atau `modules/<domain>/domain/*.schema.ts`.
- Skema harus memberikan pesan error yang ramah pengguna dalam Bahasa Indonesia.

---

## 4. UI & Styling (Tailwind CSS v4 + Shadcn UI)

- Gunakan class utility Tailwind CSS v4. Hindari inline style kecuali untuk nilai dinamis yang tidak dapat diprediksi.
- Komponen reusable berbasis Radix UI / Shadcn disimpan di `components/ui/`.
- Komponen domain-specific (misal: `CompetitionCard`, `HeroBanner`, `RegistrationForm`) disimpan di `modules/<domain>/presentation/` atau `components/`.
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
3. **Standar Data Table Shadcn UI (Wajib - Bukan Tabel Biasa):**
   - Setiap tabel data yang dibuat pada area admin dashboard **dilarang menggunakan tabel biasa / statis**.
   - Setiap tabel **wajib** mengintegrasikan kontrol standar Data Table (`@tanstack/react-table` + Shadcn UI Table):
     - Header sorting interaktif (`DataTableColumnHeader`) pada kolom-kolom utama.
     - Toolbar filter dan input pencarian reaktif.
     - Paginasi data lengkap (`DataTablePagination`) dengan pengaturan baris per halaman (*rows per page*: 5, 10, 20, 50).
     - Tampilan kosong (*empty state*) terstandarisasi dengan `EmptyState`.
     - Aksi terstruktur pada tiap baris menggunakan `DropdownMenu`.
4. **Props Bersih & TypeScript Strict:**
   - Setiap komponen reusable wajib memiliki interface Props yang eksplisit (`[ComponentName]Props`).
   - Mendukung prop `className` opsional dengan `cn()` untuk ekstensi layout bila diperlukan.

---

## 6. Standar Integrasi Data & Model Kontrak API (BFF / Server Actions)

Di `fe-app`, tidak ada akses database langsung (PostgreSQL/Drizzle ORM diisolasi di `be-app`):

1. **Konsumsi REST API:**
   - Seluruh komunikasi data dengan backend menggunakan `apiClient` (`lib/api-client.ts`) yang memanggil Express API di `NEXT_PUBLIC_API_URL` (client) atau `API_INTERNAL_URL` (server).
2. **Standard API Response Parsing:**
   - Response backend selalu mengikuti format envelope:
     ```typescript
     export interface ApiResponse<T = any> {
       success: boolean;
       message?: string;
       data?: T;
       error?: string;
       code?: string;
     }
     ```
3. **Audit Fields pada Model DTO:**
   - Setiap model entitas dari backend (`modules/<domain>/infrastructure/*.table.ts`) menyertakan field audit `createdAt` dan `updatedAt` bertipe `Date | string`.

---

## 7. Standar Notifikasi Toast & Feedback Error Handling (Shadcn UI)

Seluruh umpan balik aksi pengguna (*mutasi data, login, create, update, delete, submit form, upload berkas*) dan *error handling* **WAJIB** menggunakan komponen **Toast Shadcn UI (`sonner`)** di posisi **kanan atas (`top-right`)**:

1. **Posisi Standar Wajib:**
   - Toast selalu dikonfigurasi di **kanan atas** (`position="top-right"`).
2. **Penggunaan `toast`:**
   ```typescript
   import { toast } from "@/components/ui/sonner";

   // Notifikasi Berhasil:
   toast.success("Data berhasil diperbarui!");

   // Notifikasi Gagal / Error Handling:
   toast.error(res.error || "Gagal memproses data.");
   ```
3. **Aturan Integrasi:**
   - Jangan menampilkan alert statis yang mengganggu alur UI jika notifikasi toast sudah cukup mewakili informasi status.
   - Pada aksi asinkron berat, disarankan menggunakan `toast.loading()` atau `toast.promise()` jika diperlukan.
   - Pemasangan `<Toaster position="top-right" />` berada di root layout dengan styling menyerupai Card (border, padding, warna kartu tanpa richColors).
