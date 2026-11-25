# Architecture & Frontend Layer Rules
**Kemas Prasasti 2025 - Frontend Application (`fe-app`)**

Dokumen ini mengatur arsitektur aplikasi Frontend berbasis **Domain-Driven Design (DDD)**, pembagian tanggung jawab layanan, dan penanganan data melalui komunikasi RESTful API dengan Backend Express.js (`be-app`).

---

## 1. Aturan Arsitektur Domain-Driven Design (DDD) di Frontend

Aplikasi frontend dibagi ke dalam **Bounded Contexts** di direktori `modules/` (`auth`, `competition`, `registration`, `blog`, `shared`). Setiap modul mematuhi pemisahan 4 lapisan:

1. **Domain Layer (`modules/<domain>/domain/`):**
   - Murni TypeScript bisnis (Entities, Value Objects, Domain Interfaces, Domain Enums, Zod Schemas).
   - **Aturan Ketat:** DILARANG mengimpor library UI, React hooks, atau framework Next.js.
2. **Application Layer (`modules/<domain>/application/`):**
   - Use cases, orchestrator alur data, DTOs, dan Next.js Server Actions.
   - Bertindak sebagai jembatan/BFF (Backend-For-Frontend) yang memvalidasi form input via Zod lalu meneruskannya ke REST API `be-app`.
3. **Infrastructure Layer (`modules/<domain>/infrastructure/`):**
   - Definisi tipe data respons DTO (`*.table.ts` sebagai pure TypeScript interfaces).
   - Repositori frontend (`*.repository.ts`) yang memanggil endpoint Express backend via `apiClient` (`lib/api-client.ts`).
   - DILARANG memanggil database langsung (PostgreSQL/Supabase/Drizzle) dari layer ini.
4. **Presentation Layer (`modules/<domain>/presentation/`):**
   - Komponen UI spesifik per domain (misal: `CompetitionCard`, `RegistrationForm`, `TiptapEditor`).
   - Wajib dibangun di atas primitif atomik Shadcn UI dari `@/components/ui`.

---

## 2. Pembagian Peran Teknologi (Separation of Concerns)

- **Next.js App Router (React 19):** Web server, SSR, SSG/ISR untuk konten blog/landing page, dan Server Actions / API Proxy.
- **RESTful API Client (`lib/api-client.ts`):**
  - Mengirim HTTP request ke Express backend (`NEXT_PUBLIC_API_URL` / `API_INTERNAL_URL`).
  - Menangani penerusan otentikasi Bearer Token dari cookie `kp_auth_token`.
- **Shadcn UI & Tailwind CSS v4:**
  - Standar antarmuka pengguna interaktif dan responsif.
  - Komponen dialog, form, sheet, dropdown, dan data-table.
- **Sonner Toast:**
  - Notifikasi interaktif di posisi `top-right`.
- **Zod:**
  - Single source of truth untuk validasi formulir dan skema input di sisi frontend.

---

## 3. Aturan Keamanan & Akses Data

1. **Client vs Server Boundary:**
   - Tidak ada koneksi database langsung di `fe-app`.
   - `NEXT_PUBLIC_API_URL` digunakan untuk client-side fetch jika diperlukan, dan `API_INTERNAL_URL` untuk SSR / Server Actions ke backend.
2. **Server Actions & Route Guard:**
   - Proteksi rute `/dashboard/*` dikelola melalui `middleware.ts` yang memvalidasi cookie `kp_auth_token` ke endpoint `GET /api/auth/me` pada `be-app`.
   - Server Actions meneruskan token sesi pengguna ke backend untuk diverifikasi hak aksesnya (RBAC).

---

## 4. Standar Interface Data & Audit Timestamps

Setiap tipe data DTO entitas dari backend (`*.table.ts`):
1. **Atribut Wajib Audit:** Memiliki `createdAt` dan `updatedAt` bertipe `Date | string`.
2. **Pure TypeScript:** Seluruh definisi model data di `fe-app` menggunakan `interface` atau `type` murni tanpa library ORM eksternal.
