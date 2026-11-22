# Architecture & Data Layer Rules

Dokumen ini mengatur arsitektur sistem berbasis **Domain-Driven Design (DDD)**, pembagian tanggung jawab layanan, dan penanganan data menggunakan Supabase, PostgreSQL, dan Drizzle ORM.

---

## 1. Aturan Arsitektur Domain-Driven Design (DDD)

Sistem dibagi ke dalam **Bounded Contexts** di direktori `modules/` (`auth`, `competition`, `registration`, `blog`, `shared`). Setiap modul wajib mematuhi pemisahan 4 lapisan:

1. **Domain Layer (`modules/<domain>/domain/`):**
   - Murni TypeScript bisnis (Entities, Value Objects, Domain Interfaces, Domain Enums, Zod Schemas).
   - **Aturan Ketat:** DILARANG mengimpor library UI, React hooks, atau framework Next.js.
2. **Application Layer (`modules/<domain>/application/`):**
   - Use cases, orchestrator alur data, DTOs, dan Next.js Server Actions.
   - Mengambil data melalui repositori infrastruktur dan memvalidasi state menggunakan model domain.
3. **Infrastructure Layer (`modules/<domain>/infrastructure/`):**
   - Skema tabel Drizzle ORM (`pgTable`), implementasi repository data access, adapter Supabase Auth, dan adapter Supabase Storage.
4. **Presentation Layer (`modules/<domain>/presentation/`):**
   - Komponen UI spesifik per domain (misal: `CompetitionCard`, `RegistrationForm`, `TiptapEditor`).
   - Wajib dibangun di atas primitif atomik Shadcn UI dari `@/components/ui`.

---

## 2. Pembagian Peran Teknologi (Separation of Concerns)

Proyek ini memanfaatkan arsitektur modern fullstack:
- **Next.js App Router (React 19):** Web server, SSR, SSG/ISR untuk konten blog/landing page, dan API route handlers / Server Actions.
- **Supabase Auth:**
  - Menangani autentikasi admin panel (email/password & OAuth).
  - Manajemen sesi berbasis secure cookies melalui `@supabase/ssr` (mendukung Next.js Middleware, Server Components, dan Server Actions).
- **PostgreSQL (Supabase Database):**
  - Penyimpanan data utama yang relasional, konsisten, dan ACID-compliant.
  - Skema data terpusat di `db/schema/*.ts` dengan migrasi berkala via `drizzle-kit`.
- **Drizzle ORM:**
  - Data access layer TypeScript-first yang ultra-ringan tanpa overhead binary engine.
  - Type-safe querying menggunakan Drizzle query builder dan Relational Queries API (`db.query.*`).
  - Menyediakan inferensi tipe otomatis (`$inferSelect` dan `$inferInsert`) langsung dari definisi tabel PostgreSQL.
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
   - Selalu lakukan validasi payload dengan `schema.safeParse()` sebelum memanggil query Drizzle ORM.
3. **Storage Security:**
   - Folder/bucket privat (seperti bukti pembayaran & scan identitas) dibatasi akses baca publiknya dan hanya dapat diakses melalui signed URL atau oleh admin berwenang.

---

## 3. Struktur Pengorganisasian Kode Backend

- **`lib/supabase/`**:
  - `client.ts`: Inisialisasi Supabase Client untuk browser (`createBrowserClient` dari `@supabase/ssr`).
  - `server.ts`: Inisialisasi Supabase Client untuk Server Components & Actions (`createServerClient` dengan cookie store).
  - `middleware.ts`: Helper untuk sinkronisasi sesi & token refresh pada Next.js Middleware.
- **`db/`**:
  - `index.ts`: Inisialisasi koneksi `db` menggunakan `drizzle(postgres(process.env.DATABASE_URL!))` dengan driver `postgres.js` yang terhubung ke Supavisor pooler.
  - `schema/`: Definisi tabel dan relasi menggunakan `pgTable` dari `drizzle-orm/pg-core` (misal: `users.ts`, `competitions.ts`, `registrations.ts`, `blogs.ts`).
- **`drizzle.config.ts`**:
  - Konfigurasi `drizzle-kit` untuk membaca `db/schema/` dan menghasilkan artefak migrasi SQL di folder `drizzle/`.
- **`services/`**:
  - Berisi fungsi business logic yang memisahkan antara handler UI/API dan akses data mentah Drizzle.
