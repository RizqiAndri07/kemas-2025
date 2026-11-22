# Spesifikasi Fitur: Manajemen Pendaftar (Registrations) & Rate Limiting Pendaftaran

Dokumen ini mendefinisikan spesifikasi fungsional, arsitektur teknis Domain-Driven Design (DDD), skema database PostgreSQL (Drizzle ORM), antarmuka Data Table Shadcn UI, serta mekanisme keamanan **Rate Limiting** untuk pendaftaran publik pada platform **Kemas Prasasti 2025**.

---

## 1. Latar Belakang & Masalah

1. **Perbaikan Tampilan Dropdown Formulir pada Competition Form:**
   - Dropdown pemilihan formulir pendaftaran aktif pada halaman pembuatan / edit kompetisi sebelumnya menampilkan string UUID mentah alih-alih nama formulir (`form.title`).
   - Perlu penyesuaian pada render child komponen `<SelectValue>` Base UI agar judul formulir dan jumlah section selalu tampil dengan jelas.

2. **Kebutuhan Manajemen Pendaftar (Admin Dashboard):**
   - Setelah formulir dinamis dibuat per kompetisi, panitia membutuhkan halaman terpusat untuk memantau, memfilter, mencari, dan memverifikasi data pendaftar yang masuk.
   - Setiap pendaftar memiliki status verifikasi:
     - `UNVERIFIED` (*Belum Terverifikasi / Menunggu Verifikasi*)
     - `VERIFIED` (*Terverifikasi / Diterima*)
     - `REJECTED` (*Ditolak / Berkas Tidak Sesuai*)
   - Panitia dapat melihat detail isian formulir dinamis (nama tim, anggota, kartu identitas, bukti bayar) serta mengubah status verifikasi dan memberikan catatan/alasan penolakan.

3. **Keamanan Formulir Publik (Anti-Spam & Anti-Bruteforce):**
   - Karena formulir pendaftaran dibuka secara publik tanpa login peserta, rentan terhadap spam bot atau pengiriman data massal (bruteforce).
   - Diperlukan mekanisme **Middleware Rate Limiting** yang membatasi maksimal **3 kali pendaftaran per menit per IP address / session**. Jika melampaui batas, sistem mengembalikan status HTTP 429 (*Too Many Requests*) dengan header `Retry-After`.

---

## 2. Arsitektur Database (PostgreSQL & Drizzle ORM)

### A. Enum Status Pendaftar (`registration_status`)
```typescript
export const registrationStatusEnum = pgEnum("registration_status", [
  "UNVERIFIED",
  "VERIFIED",
  "REJECTED",
]);
export type RegistrationStatus = (typeof registrationStatusEnum.enumValues)[number];
```

### B. Tabel Pendaftar (`registrationsTable`)
File: `modules/registration/infrastructure/registration.table.ts`

```typescript
export const registrationsTable = pgTable("registrations", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // Relasi ke Kompetisi & Formulir
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  formId: uuid("form_id")
    .notNull()
    .references(() => competitionFormsTable.id, { onDelete: "restrict" }),
  
  // Nomor Registrasi Unik (e.g., KP25-REG-1700000000000-001)
  registrationNumber: varchar("registration_number", { length: 60 }).notNull().unique(),
  
  // Data Isian Dinamis Formulir (JSONB)
  data: jsonb("data").$type<Record<string, any>>().notNull(),
  
  // Berkas yang diunggah (JSONB Array)
  files: jsonb("files").$type<Array<{
    fieldName: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }>>().default([]).notNull(),
  
  // Status Verifikasi
  status: registrationStatusEnum("status").default("UNVERIFIED").notNull(),
  
  // Catatan Verifikasi / Alasan Penolakan dari Admin
  notes: text("notes"),
  
  // Audit Trail & Metadata Klien
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  verifiedBy: uuid("verified_by").references(() => usersTable.id, { onDelete: "set null" }),
  
  // Standar Audit Trail (AGENTS.md Rule 7)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

---

## 3. Spesifikasi Halaman Pendaftar (`/dashboard/registrations`)

Mengikuti standar **AGENTS.md Rule 5 (Shadcn UI First)** dan **Rule 6 (Standar Data Table Shadcn UI)**:

1. **Toolbar & Filter Interaktif:**
   - **Filter Kompetisi:** Dropdown pilihan kompetisi (e.g., "Semua Kompetisi", "Futsal", "Try Out", dll.).
   - **Filter Status Pendaftaran:** Pilihan status `Semua`, `Belum Terverifikasi (Unverified)`, `Terverifikasi (Verified)`, `Ditolak (Rejected)`.
   - **Pencarian Global:** Pencarian instan berdasarkan Nomor Registrasi, Nama Pendaftar (ekstraksi dinamis dari field nama), email, atau nomor HP.
2. **Kolom Data Table:**
   - **Nomor Registrasi:** Teks kode unik pendaftaran (`KP25-REG-...`).
   - **Nama Pendaftar / Tim:** Diambil secara cerdas dari isian dinamis formulir (e.g. `fullName`, `namaLengkap`, `teamName`, atau nama field teks pertama).
   - **Kompetisi / Event:** Nama cabang lomba terkait dengan badge tipe kompetisi.
   - **Tanggal Daftar:** Waktu pendaftaran (*formatted datetime*) dengan sorting interaktif (Ascending/Descending).
   - **Status Verifikasi:**
     - `UNVERIFIED`: Badge kuning/amber (*Menunggu Verifikasi*).
     - `VERIFIED`: Badge hijau (*Terverifikasi*).
     - `REJECTED`: Badge merah/destructive (*Ditolak*).
   - **Aksi:** Dropdown menu / Icon button untuk "Lihat Detail Pendaftar" dan "Ubah Status Verifikasi".
3. **Paginasi Terpadu:**
   - Kontrol navigasi halaman dan opsi jumlah baris per halaman (5, 10, 20, 50).
4. **Modal / Dialog Detail Pendaftar & Verifikasi:**
   - Menampilkan seluruh rincian jawaban form per section.
   - Preview dan tautan unduh berkas yang diunggah (scan KTP/Kartu Pelajar, bukti bayar).
   - Formulir verifikasi: Ubah status menjadi `VERIFIED` atau `REJECTED` disertai input catatan/alasan penolakan.
   - Notifikasi toast Sonner di pojok kanan bawah (**Rule 8**).

---

## 4. Spesifikasi Middleware Rate Limiting

### A. Aturan Bisnis
- **Maksimal Permintaan:** 3x pendaftaran per 60 detik (1 menit).
- **Identifier Klien:**
  - IP Address diperoleh dari header: `x-forwarded-for` (IP pertama), `x-real-ip`, atau `request.ip`.
  - Dikombinasikan dengan fingerprint cookie/session unik `kp_reg_session` untuk akurasi tinggi pada jaringan bersama (NAT Wi-Fi).
- **Target Endpoint:**
  - URL pendaftaran publik: `/api/registrations`, `/competition/*/register`, atau invocation Server Action pendaftaran.

### B. Mekanisme Algoritma (Sliding Window In-Memory / Token Bucket)
- Sistem menyimpan timestamp request per client ID dalam cache memori dengan waktu kedaluwarsa 60 detik.
- Setiap request dihitung:
  - Jika jumlah request dalam 60 detik terakhir $\ge 3$:
    - Sistem mengembalikan response HTTP **429 Too Many Requests**.
    - Header respons:
      - `Retry-After: <detik tersisa hingga window reset>`
      - `X-RateLimit-Limit: 3`
      - `X-RateLimit-Remaining: 0`
      - `X-RateLimit-Reset: <epoch timestamp>`
    - Body JSON:
      ```json
      {
        "error": "Terlalu banyak permintaan pendaftaran dari perangkat/IP Anda. Batas maksimal adalah 3 pendaftaran per menit. Silakan coba lagi dalam beberapa saat.",
        "retryAfter": 45
      }
      ```
  - Jika jumlah request $< 3$:
    - Request diteruskan dan header `X-RateLimit-Remaining` dikurangi.

---

## 5. Rencana File & Modifikasi

1. **Bugfix Dropdown UUID:**
   - `modules/competition/presentation/components/competition-form.tsx`: Memperbaiki render child `SelectValue` agar memunculkan `title` formulir.
2. **Database & Migrasi:**
   - `modules/registration/domain/registration-status.enum.ts`: Definisi enum status verifikasi.
   - `modules/registration/infrastructure/registration.table.ts`: Definisi Drizzle table `registrations`.
   - `db/schema/index.ts`: Re-export table & enum baru.
   - Eksekusi migrasi Drizzle Kit PostgreSQL via Supabase.
3. **Repository & Server Actions:**
   - `modules/registration/infrastructure/registration.repository.ts`: Query pendaftar dengan filter kompetisi & status, pagination, serta mutasi status.
   - `modules/registration/application/registration.actions.ts`: Server action untuk update status, delete, dan submit pendaftar.
4. **Presentation Layer Dashboard:**
   - `modules/registration/presentation/components/registrations-table.tsx`: Data Table Shadcn UI pendaftar.
   - `modules/registration/presentation/components/registration-detail-dialog.tsx`: Dialog detail isian dinamis & aksi verifikasi status.
   - `app/(dashboard)/dashboard/registrations/page.tsx`: Halaman admin pendaftar.
   - `components/dashboard/DashboardSidebar.tsx`: Menambahkan menu "Data Pendaftar" di sidebar.
5. **Rate Limiter & Middleware:**
   - `lib/rate-limiter.ts`: Sliding-window memory rate limiter utility.
   - `middleware.ts`: Integrasi rate limiter untuk rute pendaftaran.
