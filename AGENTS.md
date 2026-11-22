# AGENTS.md - Kemas Prasasti 2025

Selamat datang di repository project **Kemas Prasasti 2025**. File ini berfungsi sebagai panduan utama, aturan operasional, dan protokol kerja bagi AI Agent dan developer yang berkontribusi pada repository ini.

---

## 1. Project Overview

**Kemas Prasasti 2025** adalah aplikasi web serbaguna yang dirancang untuk mendukung seluruh rangkaian kegiatan organisasi "Kemas Prasasti". Aplikasi ini mencakup:

1. **Company & Event Profile (Landing Page):**
   - Profile organisasi, visi-misi, dan identitas kegiatan.
   - Timeline kegiatan, sponsorship, media partner, dan kontak person.
2. **Katalog & Detail Kompetisi:**
   - Halaman informasi kompetisi/event (deskripsi, syarat ketentuan, buku panduan/rulebook, hadiah, biaya pendaftaran).
3. **Sistem Pendaftaran (Registration Flow):**
   - Formulir pendaftaran dinamis/spesifik per cabang lomba (misal: Futsal, MLBB, Try Out, dll.).
   - Validasi data ketat menggunakan Zod.
   - Unggah berkas (bukti bayar, kartu identitas, logo tim, dll.).
4. **Web CMS Blog & Berita:**
   - Publikasi artikel, rilis pers, berita seputar acara, dan dokumentasi.
5. **Admin Dashboard:**
   - Manajemen data peserta lomba & verifikasi pembayaran.
   - Manajemen konten CMS blog (create, read, update, delete).
   - Pengaturan lomba dan data master.
   - Ekspor data peserta (Excel/CSV/PDF).

---

## 2. Core Tech Stack

- **Framework:** Next.js (App Router) & React 19
- **Language:** TypeScript (Strict mode)
- **UI & Styling:** Tailwind CSS v4, Lucide React, Shadcn UI / Radix UI, Motion (Framer Motion)
- **Validation:** Zod
- **ORM & Data Layer:** Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `postgres`)
- **Backend & Cloud Database:** Supabase (Supabase Auth, Supabase Storage, Supabase Realtime) & PostgreSQL
- **Package Manager:** `pnpm`

---

## 3. Strict Operating Rules for Agents

Sebelum melakukan tindakan apa pun di repository ini, AI Agent **WAJIB** mematuhi aturan berikut:

1. **NO CODE WITHOUT APPROVAL:**
   - Dilarang menulis file implementasi fitur, refactor kode, atau mengeksekusi script eksekusi/migrasi sebelum requirements, arsitektur, dan rencana implementasi didiskusikan dan disetujui oleh user.
2. **DOCUMENTATION-FIRST:**
   - Setiap fitur, perubahan skema database, atau arsitektur baru harus didokumentasikan di folder `docs/` dan dicatat statusnya sebelum kode diubah.
3. **PRESERVE STRUCTURE & COMPATIBILITY:**
   - Gunakan `pnpm` untuk instalasi package (jangan gunakan npm/yarn/bun secara acak).
   - Jaga konsistensi arsitektur App Router Next.js (Server Components secara default, Client Components hanya jika interaktif dengan `'use client'`).
4. **AGENT RULES & SKILLS COMPLIANCE:**
   - Rujuk dan patuhi aturan di folder `.agents/rules/`.
   - Gunakan skill workflow yang tersedia di `.agents/skills/` saat mengonstruksi fitur baru.
5. **SHADCN UI FIRST UNTUK DASHBOARD:**
   - Setiap komponen pada area dashboard **WAJIB** menggunakan komponen dari Shadcn UI.
   - **Alur Kerja Penggunaan:** Periksa terlebih dahulu ketersediaan komponen di `components/ui/`. Jika sudah tersedia, gunakan komponen yang ada. Jika belum tersedia, unduh menggunakan perintah resmi: `pnpm dlx shadcn@latest add {component}`. Dilarang membuat komponen atomik secara manual/ad-hoc jika padanannya ada di katalog Shadcn UI.

---

## 4. Directory Structure Mapping

Berikut adalah pembagian peran direktori utama:

```text
kemas-2025/
├── .agents/                   # Konfigurasi, rules, dan skills untuk Agent
│   ├── rules/                 # Aturan koding, workflow, dan arsitektur DDD
│   └── skills/                # Workflow berulang (e.g., create-feature)
├── docs/                      # Dokumentasi komprehensif sistem
│   ├── architechture/         # Desain arsitektur DDD, Supabase, PostgreSQL & Drizzle
│   ├── design/                # Desain UI/UX, tema, dan design system
│   ├── feateures/             # Spesifikasi fitur dan PRD
│   ├── infrastructure/        # Environment variables, deployment, cloud setup
│   └── projects/              # Overview, roadmap, dan timeline
├── app/                       # Next.js App Router (Routing, Layout, Pages, Composition)
│   ├── (landing)/             # Route group untuk landing page public
│   ├── (detail)/              # Route group untuk halaman detail
│   └── (dashboard)/           # Route group untuk admin dashboard & CMS
├── modules/                   # Domain-Driven Design (DDD) Bounded Contexts
│   ├── auth/                  # Domain Autentikasi, RBAC & User Management
│   ├── competition/           # Domain Manajemen & Katalog Kompetisi
│   ├── registration/          # Domain Pendaftaran & Verifikasi Pembayaran
│   ├── blog/                  # Domain Web CMS Blog & Media
│   └── shared/                # Cross-cutting concerns (DB, Supabase, Base types)
├── components/                # Reusable UI components
│   ├── ui/                    # Atomic primitives Shadcn UI (Button, Card, Table, dll.)
│   └── dashboard/             # Komponen reusable dashboard admin
├── db/                        # Aggregator Drizzle ORM schema & client instance
│   ├── schema/                # Titik kumpul ekspor skema tabel untuk drizzle-kit
│   └── index.ts               # Inisialisasi koneksi Drizzle database
├── drizzle/                   # Output migrasi SQL oleh drizzle-kit
├── drizzle.config.ts          # Konfigurasi Drizzle Kit untuk PostgreSQL
└── lib/                       # Utility global (cn helper, formatter)
```

---

## 5. Arsitektur Supabase & PostgreSQL (Drizzle ORM)

Arsitektur backend dan data layer secara penuh menggunakan **Supabase** dan **PostgreSQL**:
- **Supabase Auth:** Autentikasi admin dengan session cookies terenkripsi (SSR) via `@supabase/ssr`, RBAC (Superadmin, Committee, Content Editor).
- **PostgreSQL (Supabase Database):** Single source of truth untuk seluruh entitas data relasional (Peserta, Pendaftaran, Cabang Lomba, Verifikasi Pembayaran, Artikel Blog).
- **Drizzle ORM:** Data access layer TypeScript-first yang ultra-ringan tanpa overhead binary engine. Skema didefinisikan secara deklaratif di `db/schema/`, query type-safe dengan SQL-like syntax & Relational Queries, serta migrasi terstruktur via `drizzle-kit`.
- **Supabase Storage:** Penyimpanan berkas pendaftaran peserta, scan identitas, dan aset gambar/media artikel CMS Blog.
- **Supabase Realtime:** Sinkronisasi realtime status kuota lomba dan pembaruan data secara live melalui Postgres Changes / Broadcast.

*Catatan:* Rincian konfigurasi koneksi dan flow data dirumuskan dalam [system-overview.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/architechture/system-overview.md).

---

## 6. Indeks Dokumen, Aturan, dan Skill

### Rules & Skills (`.agents/`)
- [workflow-rules.md](file:///home/kinggu/Documents/Project/kemas-2025/.agents/rules/workflow-rules.md) - Aturan operasional & workflow agen
- [coding-standards.md](file:///home/kinggu/Documents/Project/kemas-2025/.agents/rules/coding-standards.md) - Standar koding TypeScript, Next.js, dan Zod
- [architecture-rules.md](file:///home/kinggu/Documents/Project/kemas-2025/.agents/rules/architecture-rules.md) - Arsitektur Supabase, PostgreSQL & Drizzle ORM
- [SKILL.md (create-feature)](file:///home/kinggu/Documents/Project/kemas-2025/.agents/skills/create-feature/SKILL.md) - Skill panduan pembuatan fitur bertahap

### Dokumentasi Teknis (`docs/`)
- [ddd-architecture.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/architechture/ddd-architecture.md) - Arsitektur Domain-Driven Design (DDD) & lapisan modul
- [overview.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/projects/overview.md) - Ringkasan proyek, personas & ruang lingkup
- [system-overview.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/architechture/system-overview.md) - Arsitektur sistem & integrasi Supabase + PostgreSQL
- [feature-specifications.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/feature-specifications.md) - Rincian 5 modul fitur utama
- [auth-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/auth-feature.md) - Spesifikasi Autentikasi Supabase Auth & Alur Superadmin Add User
- [competition-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/competition-feature.md) - Spesifikasi Manajemen Kompetisi & Event (Input Jadwal, Biaya & Tipe)
- [admin-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/admin-feature.md) - Spesifikasi modul Admin (Blog, User, Kompetisi, Registrasi)
- [blog-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/blog-feature.md) - Spesifikasi CMS Blog & integrasi Tiptap Editor
- [environment.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/infrastructure/environment.md) - Konfigurasi variabel lingkungan (.env)
- [design-system.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/design/design-system.md) - Panduan desain antarmuka, warna & komponen

