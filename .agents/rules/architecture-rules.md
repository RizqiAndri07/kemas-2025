# Architecture & Data Layer Rules

Dokumen ini mengatur arsitektur sistem, pembagian tanggung jawab layanan, dan penanganan data menggunakan Supabase, PostgreSQL, dan Prisma ORM.

---

## 1. Pembagian Peran Teknologi (Separation of Concerns)

Proyek ini memanfaatkan arsitektur modern fullstack:
- **Next.js App Router (React 19):** Web server, SSR, SSG/ISR untuk konten blog/landing page, dan API route handlers / Server Actions.
- **Supabase Auth:**
  - Menangani autentikasi admin panel (email/password & OAuth).
  - Manajemen sesi berbasis secure cookies melalui `@supabase/ssr` (mendukung Next.js Middleware, Server Components, dan Server Actions).
- **PostgreSQL (Supabase Database):**
  - Penyimpanan data utama yang relasional, konsisten, dan ACID-compliant.
  - Skema data terpusat di `prisma/schema.prisma` dengan migrasi berkala via Prisma CLI.
- **Prisma ORM:**
  - Data access layer type-safe untuk querying, mutasi, transaksi data relasional kompleks (Peserta, Tim, Cabang Lomba, Verifikasi Transaksi, Artikel Blog).
- **Supabase Storage:**
  - Menyimpan file & gambar (bukti transfer pembayaran, kartu tanda pengenal peserta, cover blog, gambar media konten).
  - Dilindungi oleh Storage Row Level Security (RLS) dan validasi ukuran/tipe file.
- **Supabase Realtime:**
  - Sinkronisasi event real-time jika dibutuhkan (misal pembaruan sisa kuota lomba atau status verifikasi langsung di dashboard panitia).
- **Zod:**
  - Single source of truth untuk validasi schema di sisi frontend dan backend sebelum data diproses oleh database.

---

## 2. Aturan Keamanan & Akses Data

1. **Client vs Server Boundary:**
   - Kredensial rahasia (`SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`) **HANYA** boleh diakses di runtime server (Server Components, Route Handlers, Server Actions).
   - Di sisi browser (`'use client'`), hanya kredensial publik Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) yang diizinkan untuk kebutuhan client SDK.
2. **Server Actions & Route Handlers:**
   - Semua mutasi data (CREATE, UPDATE, DELETE) harus memvalidasi sesi dan peran pengguna (role-based access control, khususnya peran Admin).
   - Selalu lakukan validasi payload dengan `schema.safeParse()` sebelum memanggil Prisma.
3. **Storage Security:**
   - Folder/bucket privat (seperti bukti pembayaran & scan identitas) dibatasi akses baca publiknya dan hanya dapat diakses melalui signed URL atau oleh admin berwenang.

---

## 3. Struktur Pengorganisasian Kode Backend

- **`lib/supabase/`**:
  - `client.ts`: Inisialisasi Supabase Client untuk browser (`createBrowserClient` dari `@supabase/ssr`).
  - `server.ts`: Inisialisasi Supabase Client untuk Server Components & Actions (`createServerClient` dengan cookie store).
  - `middleware.ts`: Helper untuk sinkronisasi sesi & token refresh pada Next.js Middleware.
- **`lib/prisma.ts`**:
  - Singleton instance Prisma Client untuk mencegah pembuatan connection pool berlebih di Next.js development mode.
- **`services/`**:
  - Berisi fungsi business logic yang memisahkan antara handler UI/API dan akses data mentah Prisma.
