# System & Architecture Overview

Dokumen ini menjelaskan arsitektur teknis, aliran data, dan integrasi antar komponen di dalam platform **Kemas Prasasti 2025** yang sepenuhnya mengadopsi **Supabase** dan **PostgreSQL** dengan **Prisma ORM**.

---

## 1. Diagram Arsitektur Tingkat Tinggi

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer (Browser)"]
        BrowserPublic["Public User (Landing / Lomba / Blog)"]
        BrowserAdmin["Admin User (Dashboard CMS)"]
    end

    subgraph NextJSLayer ["Next.js App Router (Fullstack)"]
        SSR["Server Components (SSR / ISR)"]
        Actions["Server Actions / Route Handlers"]
        Middleware["Auth & Route Guard Middleware (@supabase/ssr)"]
        ZodValidation["Zod Schema Validation Engine"]
    end

    subgraph SupabasePlatform ["Supabase Platform & Services"]
        SupabaseAuth["Supabase Auth (Admin Session & JWT)"]
        SupabaseStorage[("Supabase Storage (Bukti Bayar, Media, Dokumen)")]
        SupabaseRealtime["Supabase Realtime (Live status & Broadcast)"]
    end

    subgraph DataLayer ["Data Access & Database"]
        PrismaClient["Prisma ORM Client (Singleton)"]
        PostgresDB[("PostgreSQL Database (Hosted on Supabase)")]
    end

    BrowserPublic --> SSR
    BrowserAdmin --> Middleware
    Middleware -->|Verifikasi Session Cookie| SupabaseAuth
    Middleware --> SSR
    BrowserAdmin --> Actions
    BrowserPublic --> Actions

    Actions --> ZodValidation
    ZodValidation --> PrismaClient
    PrismaClient -->|Pooler / Direct SQL| PostgresDB

    BrowserAdmin -.->|Login Client SDK| SupabaseAuth
    Actions --> SupabaseStorage
    Actions -.-> SupabaseRealtime
```

---

## 2. Peran Komponen Arsitektur

### A. Next.js 16 (App Router)
- **Routing Group:**
  - `(landing)`: Komponen publik dengan fokus optimasi SEO, Web Vitals, dan visual animasi.
  - `(detail)`: Halaman spesifik seperti rincian lomba dan artikel blog dengan Dynamic Metadata.
  - `(dashboard)`: Antarmuka dashboard admin yang diproteksi oleh Supabase Auth Session melalui Next.js Middleware.
- **Data Rendering Strategy:**
  - Landing page dan detail lomba menggunakan Server-Side Rendering (SSR) atau Incremental Static Regeneration (ISR) untuk performa instan.
  - Form pendaftaran dan dashboard admin menggunakan Client Components terisolasi yang berkomunikasi via Server Actions.

### B. Validasi dengan Zod
- Menjadi **single source of truth** untuk semua data yang masuk.
- Mencegah inkonsistensi tipe antara formulir di frontend dan payload di backend.
- Digunakan untuk formulir pendaftaran dinamis per kompetisi, manajemen admin, dan CMS blog.

### C. Supabase Platform & Services
- **Supabase Auth:**
  - Digunakan untuk autentikasi admin panel (email/password atau SSO).
  - Menggunakan library `@supabase/ssr` untuk manajemen sesi cookie yang aman, kompatibel dengan Server Components, Server Actions, dan Middleware.
- **Supabase Storage:**
  - Menyimpan unggahan berkas peserta (bukti transfer, scan kartu identitas, logo tim, pamflet lomba, gambar artikel).
  - Bucket dikelompokkan:
    - `registration-proofs`: Privat (dilindungi RLS, hanya admin dan pendaftar terkait yang dapat mengakses via Signed URL).
    - `blog-media`: Publik untuk gambar cover dan konten artikel.
    - `competition-assets`: Publik untuk pamflet dan rulebook PDF lomba.
- **Supabase Realtime:**
  - Sinkronisasi realtime status kuota pendaftaran kompetisi dan notifikasi aktivitas verifikasi di dashboard admin.

### D. PostgreSQL Database & Prisma ORM
- **PostgreSQL:**
  - Menjadi database relasional utama (single source of truth) yang di-host di Supabase.
  - Mendukung transaksi ACID, relasi antar tabel (Peserta, Tim, Lomba, Pembayaran, Log Verifikasi, Artikel Blog).
- **Prisma ORM:**
  - Data access layer type-safe untuk querying dan mutasi.
  - Mengelola skema dan migrasi database (`prisma migrate dev` & `prisma migrate deploy`).
  - Dikonfigurasi dengan `DATABASE_URL` (Supavisor connection pooling pada port 6543) untuk Server Actions / API routes, serta `DIRECT_URL` (port 5432) untuk eksekusi migrasi.

---

## 3. Pola Integrasi Supabase, PostgreSQL & Prisma ORM

Arsitektur ini sepenuhnya menyatukan data layer dan autentikasi ke dalam ekosistem PostgreSQL:

```
[Browser Form] 
       ↓ (Submit)
[Server Action] 
       ↓ (Validasi payload)
[Zod Schema] 
       ↓ (Query / Mutasi)
[Prisma ORM] 
       ↓ (SQL over Connection Pooler)
[PostgreSQL on Supabase]
```

1. **User Auth Flow:**
   - Admin login melalui form login -> Supabase Auth menerbitkan auth session cookies.
   - Middleware memeriksa auth session cookies menggunakan `@supabase/ssr`. Jika belum terotentikasi, redirect ke `/login`.
2. **File Upload Flow:**
   - Berkas pendaftaran/media blog diunggah ke Supabase Storage via Server Action atau Supabase Client.
   - URL path atau storage key disimpan ke PostgreSQL melalui Prisma ORM.
3. **Data Mutation Flow:**
   - Input pendaftar divalidasi oleh Zod -> Disimpan ke PostgreSQL melalui Prisma ORM dengan jaminan integritas relasional (foreign keys).
