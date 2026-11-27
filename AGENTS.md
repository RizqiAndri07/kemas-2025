# AGENTS.md - Kemas Prasasti 2025 (Frontend Application)

Selamat datang di repository **Kemas Prasasti 2025 Frontend Application (`fe-app`)**. File ini berfungsi sebagai panduan utama, aturan operasional, dan protokol kerja bagi AI Agent dan developer yang berkontribusi pada repository frontend ini.

---

## 1. Project Overview

**Kemas Prasasti 2025 (`fe-app`)** adalah aplikasi web berbasis Next.js App Router yang dirancang untuk mendukung seluruh rangkaian kegiatan organisasi "Kemas Prasasti":

1. **Company & Event Profile (Landing Page):**
   - Profile organisasi, visi-misi, dan identitas kegiatan.
   - Timeline kegiatan, sponsorship, media partner, dan kontak person panitia.
2. **Katalog & Detail Kompetisi:**
   - Halaman informasi kompetisi/event (deskripsi, syarat ketentuan, buku panduan/rulebook PDF, hadiah, biaya pendaftaran).
3. **Sistem Pendaftaran (Registration Flow):**
   - Halaman formulir pendaftaran online publik di luar dashboard (`/competition/[id]/register` & `/register/[competitionId]`).
   - Default field wajib email peserta & proteksi penolakan duplikasi email pendaftaran per lomba.
   - Proteksi anti-spam rate limiting (maksimal 3x/menit, pemblokiran IP 3 jam jika spam).
   - Validasi data ketat menggunakan Zod & unggah berkas pendaftaran (bukti transfer, scan kartu identitas) ke MinIO via backend API.
4. **Web CMS Blog & Berita:**
   - Publikasi artikel, rilis pers, berita seputar acara, dan dokumentasi interaktif (BlockNote / Tiptap).
5. **Admin Dashboard:**
   - Manajemen dan tombol aksi langsung `Validasi` pendaftar pada tabel data pendaftar.
   - Halaman khusus validasi pendaftar (`/dashboard/registrations/[id]`) dengan aksi Confirm (Verifikasi) dan Reject (Tolak).
   - Manajemen konten CMS blog & moderasi komentar.
   - Pengaturan lomba, form builder dinamis, dan master contact person.
   - Manajemen pengguna & RBAC (`SUPERADMIN`, `ADMIN`, `CMS_WRITER`).

---

## 2. Core Tech Stack

- **Framework:** Next.js 16 (App Router) & React 19
- **Language:** TypeScript (Strict mode)
- **UI & Styling:** Tailwind CSS v4, Lucide React, Shadcn UI / Radix UI, Motion (Framer Motion)
- **Data Table:** `@tanstack/react-table` + Shadcn UI Table
- **Validation Engine:** Zod (Single source of truth)
- **Rich Text Editor:** BlockNote (`@blocknote/react`, `@blocknote/shadcn`)
- **Feedback & Notifications:** Sonner Toast (`sonner` di posisi `top-right`)
- **Authentication:** Better Auth Client (`better-auth/react`), Next.js Middleware Session Guard, Bearer Relay
- **Backend Integration:** RESTful API Client via Express.js (`be-app`) & Server Actions (BFF)
- **Package Manager:** `pnpm`

---

## 3. Strict Operating Rules for Agents

Sebelum melakukan tindakan apa pun di repository `fe-app`, AI Agent **WAJIB** mematuhi aturan berikut:

1. **NO CODE WITHOUT APPROVAL:**
   - Dilarang menulis file implementasi fitur, refactor kode besar, atau modifikasi dependensi sebelum requirements, arsitektur, dan rencana implementasi didiskusikan dan disetujui oleh user.
2. **DOCUMENTATION-FIRST:**
   - Setiap fitur atau alur baru harus didokumentasikan di folder `docs/` dan dicatat statusnya sebelum kode diubah.
3. **PRESERVE STRUCTURE & COMPATIBILITY:**
   - Gunakan `pnpm` untuk instalasi package (`pnpm add`, bukan npm/yarn/bun).
   - Jaga konsistensi arsitektur App Router Next.js (Server Components secara default, Client Components hanya jika interaktif dengan `'use client'`).
4. **AGENT RULES & SKILLS COMPLIANCE:**
   - Rujuk dan patuhi aturan di folder `.agents/rules/` (`architecture-rules.md`, `coding-standards.md`, `workflow-rules.md`).
   - Gunakan skill workflow yang tersedia di `.agents/skills/` saat mengonstruksi fitur baru (`create-feature`, `design-taste-frontend`).
5. **SHADCN UI FIRST UNTUK DASHBOARD:**
   - Setiap komponen pada area dashboard **WAJIB** menggunakan komponen dari Shadcn UI.
   - **Alur Kerja Penggunaan:** Periksa terlebih dahulu ketersediaan komponen di `components/ui/`. Jika sudah tersedia, gunakan komponen yang ada. Jika belum tersedia, unduh menggunakan perintah resmi: `pnpm dlx shadcn@latest add {component}`. Dilarang membuat komponen atomik secara manual/ad-hoc jika padanannya ada di katalog Shadcn UI.
6. **STANDAR DATA TABLE SHADCN UI (BUKAN TABEL BIASA):**
   - Setiap tabel data yang dibuat pada seluruh antarmuka aplikasi (khususnya Admin Dashboard) **WAJIB** menggunakan standar Data Table berbasis Shadcn UI (`components/ui/table` didukung `@tanstack/react-table`), **dilarang membuat tabel biasa / HTML statis tanpa kontrol interaktif**.
   - **Fitur Standar Wajib pada Setiap Tabel:**
     1. **Sorting Interaktif:** Kolom data penting harus mendukung pengurutan arah (*Ascending / Descending*) menggunakan komponen `DataTableColumnHeader`.
     2. **Pencarian / Filtering Global:** Dilengkapi toolbar input pencarian reaktif untuk memfilter baris data secara instan.
     3. **Paginasi Terpadu:** Memiliki kontrol navigasi halaman dan opsi pemilih jumlah baris per halaman (*rows per page*: 5, 10, 20, 50) menggunakan komponen `DataTablePagination`.
     4. **Empty State:** Menampilkan status kosong yang informatif menggunakan `EmptyState` saat tidak ada data atau hasil pencarian nihil.
     5. **Aksi Terstruktur:** Tombol aksi pada tiap baris menggunakan pola `DropdownMenu` atau icon button dengan tooltip yang jelas.
7. **STANDAR NOTIFIKASI TOAST (SONNER DI KANAN ATAS):**
   - Setiap kali melakukan mutasi data, mengeksekusi Server Action, atau menangani error handling, status **BERHASIL** maupun **GAGAL/ERROR** **WAJIB** ditampilkan menggunakan komponen **Toast Shadcn UI (`sonner`)**.
   - **Posisi & Styling Notifikasi:** Notifikasi toast dikonfigurasi di posisi **kanan atas (`position="top-right"`)**, tanpa `richColors`, dengan visual card-like (menggunakan padding, warna `bg-card`/`text-card-foreground`, border `border-border`, ring subtle, dan rounded card).
   - **Standar Kode Penggunaan:**
     ```typescript
     import { toast } from "@/components/ui/sonner";

     // Aksi Berhasil
     toast.success(res.message || "Aksi berhasil diproses!");

     // Aksi Gagal / Error Handling
     toast.error(res.error || "Terjadi kesalahan saat memproses permintaan.");
     ```
8. **ISOLASI DATA LAYER (NO DIRECT DB IN FE-APP):**
   - `fe-app` tidak memiliki koneksi database langsung (PostgreSQL & Drizzle ORM sepenuhnya berada di `be-app`).
   - Seluruh pengambilan dan mutasi data dilakukan melalui REST API Client (`lib/api-client.ts`) atau Next.js Server Actions yang bertindak sebagai Backend-For-Frontend (BFF).
9. **MANAJEMEN SESI & ROUTE GUARD:**
   - Token otentikasi disimpan dalam cookie aman `kp_auth_token` (HTTP-Only, masa berlaku 12 jam).
   - Proteksi rute `/dashboard/*` dilakukan oleh `middleware.ts` yang memvalidasi token sesi ke endpoint `GET /api/auth/me` pada `be-app`.
10. **MANDATORY FULLSTACK SYNC & DUAL DOCUMENTATION:**
    - Setiap kali membuat atau memodifikasi fitur baru, **WAJIB** mengimplementasikan integrasi penuh antara antarmuka UI (`fe-app`) dan endpoint API riil (`be-app`), **dilarang membuat mockup UI tanpa backend yang berfungsi**.
    - **Wajib menulis dokumentasi di kedua sisi:**
      - Dokumentasikan UI/UX, alur user flow, dan validasi form di [fe-app/docs/feateures/](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/feateures/).
      - Pastikan spesifikasi endpoint API dan schema datanya tercatat serasi di [be-app/docs/api/](file:///home/kinggu/Documents/Project/kemas/be-app/docs/api/).

---

## 4. Directory Structure Mapping

Berikut adalah pembagian peran direktori utama pada `fe-app`:

```text
fe-app/
├── .agents/                   # Konfigurasi, rules, dan skills untuk Agent di FE
│   ├── rules/                 # Aturan koding, workflow, dan arsitektur DDD FE
│   └── skills/                # Workflow berulang (create-feature, design-taste-frontend)
├── docs/                      # Dokumentasi komprehensif sistem & UI/UX
│   ├── architechture/         # Desain arsitektur DDD frontend & integrasi API
│   ├── design/                # Desain UI/UX, tema, dan design system
│   ├── feateures/             # Spesifikasi fitur dan PRD
│   ├── infrastructure/        # Environment variables, deployment
│   └── projects/              # Overview, roadmap, dan timeline
├── app/                       # Next.js App Router (Routing, Layout, Pages, Composition)
│   ├── (landing)/             # Route group untuk landing page public
│   ├── (detail)/              # Route group untuk halaman detail
│   ├── (dashboard)/           # Route group untuk admin dashboard & CMS
│   ├── globals.css            # Styling Tailwind CSS v4
│   └── layout.tsx             # Root layout & Toaster provider
├── modules/                   # Domain-Driven Design (DDD) Bounded Contexts
│   ├── auth/                  # Domain Autentikasi & Profil Sesi
│   ├── competition/           # Domain Katalog Kompetisi & Form Builder
│   ├── registration/          # Domain Pendaftaran Peserta & Verifikasi
│   ├── blog/                  # Domain Web CMS Blog & Media
│   └── shared/                # Cross-cutting concerns & base types
├── components/                # Reusable UI components
│   ├── ui/                    # Atomic primitives Shadcn UI (Button, Card, Table, Dialog, dll.)
│   └── dashboard/             # Komponen modular dashboard (Sidebar, Header, StatCard, Data Table)
├── hooks/                     # Custom React Hooks
├── lib/                       # Utility global (cn helper, api-client)
│   ├── api-client.ts          # RESTful HTTP client untuk koneksi ke be-app
│   └── utils.ts               # cn() utility
├── schema/                    # Validasi Zod form global
├── types/                     # Global TypeScript interfaces & DTOs
└── middleware.ts              # Route guard & session relay ke be-app
```

---

## 5. Arsitektur Frontend & Komunikasi REST API

Aplikasi frontend beroperasi secara murni sebagai presentation & BFF layer yang berkomunikasi dengan backend Express (`be-app`):

- **Next.js App Router (React 19):** Rendering performan menggunakan Server Components untuk SEO dan initial load, serta Client Components untuk interaktivitas form.
- **REST API Client (`lib/api-client.ts`):** Mengarahkan permintaan ke `NEXT_PUBLIC_API_URL` (client-side) atau `API_INTERNAL_URL` (server-side/SSR) dengan otomatis menyertakan Bearer Token dari cookie `kp_auth_token`.
- **Server Actions sebagai BFF:** Menyediakan mutasi aman di sisi server Next.js yang memvalidasi input via Zod, memanggil `be-app`, dan mengembalikan state terstruktur ke UI.
- **MinIO Media Handling:** Upload berkas (gambar blog, rulebook lomba, bukti transfer pendaftar) dikirim melalui endpoint backend Express (`/api/blogs/upload-image`, `/api/competitions/upload-guidebook`, `/api/registrations`), dan URL publik MinIO disimpan di backend.

---

## 6. Indeks Dokumen, Aturan, dan Skill

### Rules & Skills (`.agents/`)
- [architecture-rules.md](file:///home/kinggu/Documents/Project/kemas/fe-app/.agents/rules/architecture-rules.md) - Arsitektur DDD Frontend, BFF & REST API Client
- [coding-standards.md](file:///home/kinggu/Documents/Project/kemas/fe-app/.agents/rules/coding-standards.md) - Standar koding TypeScript, Next.js, Shadcn UI & Data Table
- [workflow-rules.md](file:///home/kinggu/Documents/Project/kemas/fe-app/.agents/rules/workflow-rules.md) - Aturan operasional & workflow agen di frontend
- [SKILL.md (create-feature)](file:///home/kinggu/Documents/Project/kemas/fe-app/.agents/skills/create-feature/SKILL.md) - Skill panduan pembuatan fitur frontend bertahap
- [SKILL.md (design-taste-frontend)](file:///home/kinggu/Documents/Project/kemas/fe-app/.agents/skills/design-taste-frontend/SKILL.md) - Skill desain visual frontend & design tokens

### Dokumentasi Teknis (`docs/`)
- [ddd-architecture.md](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/architechture/ddd-architecture.md) - Arsitektur Domain-Driven Design (DDD) & lapisan modul
- [overview.md](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/projects/overview.md) - Ringkasan proyek, personas & ruang lingkup
- [feature-specifications.md](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/feateures/feature-specifications.md) - Rincian modul fitur utama
- [environment.md](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/infrastructure/environment.md) - Konfigurasi variabel lingkungan (.env)
- [design-system.md](file:///home/kinggu/Documents/Project/kemas/fe-app/docs/design/design-system.md) - Panduan desain antarmuka, warna & komponen

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
