# Agent Workflow Rules
**Kemas Prasasti 2025 - Frontend Application (`fe-app`)**

Dokumen ini mendefinisikan aturan operasional wajib bagi AI Agent yang bekerja pada repositori frontend **Kemas Prasasti 2025 (`fe-app`)**.

---

## 1. Fase Perencanaan & Diskusi (Strict Requirement)

- **Jangan Menulis Kode Implementasi Sebelum Disetujui:**
  - AI Agent dilarang langsung membuat atau memodifikasi file aplikasi (`app/`, `components/`, `lib/`, `modules/`, dll.) tanpa konfirmasi dan rencana kerja yang jelas.
  - Setiap inisiatif baru harus diawali dengan diskusi kebutuhan, perumusan spesifikasi, dan pembaruan dokumen terkait di folder `docs/`.
- **Konfirmasi Desain UI & Kontrak API:**
  - Untuk setiap penambahan halaman baru, form, atau integrasi API backend, ajukan arsitektur/desainnya serta kontrak endpoint `be-app` terlebih dahulu kepada pengguna.

---

## 2. Manajemen Dependensi & Environment

- **Gunakan Package Manager `pnpm`:**
  - Segala instalasi dependensi harus menggunakan `pnpm add <pkg>` atau `pnpm add -D <pkg>`.
  - Hindari `npm install`, `yarn add`, atau `bun install` untuk menjaga konsistensi `pnpm-lock.yaml`.
- **Keamanan Kredensial & Variabel Lingkungan:**
  - Jangan pernah menyimpan secret keys, token, atau kredensial sensitif di dalam kode client-side publik.
  - Gunakan `.env` / `.env.local` dan definisikan kontrak variabelnya di `.env.example`:
    - `NEXT_PUBLIC_APP_URL`
    - `NEXT_PUBLIC_API_URL`
    - `API_INTERNAL_URL`

---

## 3. Sinkronisasi Dokumentasi (Documentation-First)

- Setiap kali ada fitur yang dirancang atau diubah, agent berkewajiban:
  1. Memperbarui dokumen di `docs/feateures/` atau `docs/architechture/`.
  2. Memastikan catatan di `AGENTS.md` tetap akurat.
- Jika ada perbedaan antara kode yang ada dan dokumentasi, agent harus meminta klarifikasi pengguna sebelum melakukan refactoring.

---

## 4. Standar Commit & Perubahan Berkas

- Lakukan perubahan secara bertahap dan terisolasi per fitur (modular).
- Gunakan format conventional commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
- Jangan menghapus komentar atau kode yang sudah ada tanpa alasan yang jelas atau konfirmasi dari pengguna.
