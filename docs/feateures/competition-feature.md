# Spesifikasi Fitur: Manajemen Kompetisi & Event (Competition Management)

Dokumen ini mendefinisikan rancangan teknis, skema database, aturan validasi, arsitektur Domain-Driven Design (DDD), serta alur antarmuka modul **Manajemen Kompetisi & Event** untuk platform **Kemas Prasasti 2025**.

---

## 1. Latar Belakang & Tujuan

Modul Manajemen Kompetisi & Event adalah modul inti pada Admin Dashboard yang memfasilitasi panitia dalam mengatur seluruh cabang kompetisi dan agenda event yang diselenggarakan pada Kemas Prasasti 2025. 

Tujuan utama:
1. Menyediakan antarmuka terpusat bagi panitia untuk mengelola kompetisi (Create, Read, Update, Delete).
2. Mendukung klasifikasi tipe kegiatan antara **Turnamen (*Tournament*)** dan **Acara (*Event*)**.
3. Mengatur jadwal krusial: periode buka pendaftaran, penutupan pendaftaran, serta tanggal pelaksanaan acara.
4. Menetapkan skema biaya pendaftaran (gratis atau nominal biaya dalam Rupiah).

---

## 2. Struktur Input & Kebutuhan Data

Sesuai kebutuhan sistem, setiap entitas kompetisi memiliki atribut input berikut:

| Field Input | Tipe Data | Keterangan | Validasi Zod |
| :--- | :--- | :--- | :--- |
| **`name`** (Nama) | String | Nama kompetisi atau nama event (misal: "Futsal Cup 2025", "Mobile Legends Tournament", "National Try Out") | Min. 3 karakter, Maks. 200 karakter |
| **`type`** (Tipe) | Enum | Klasifikasi jenis agenda: `'TOURNAMENT'` atau `'EVENT'` | Wajib dipilih (`TOURNAMENT` / `EVENT`) |
| **`registrationStartDate`** (Tgl Buka Pendaftaran) | Timestamp (Date) | Tanggal dan jam registrasi peserta mulai dibuka | Wajib diisi format tanggal valid |
| **`registrationEndDate`** (Tgl Tutup Pendaftaran) | Timestamp (Date) | Batas akhir waktu registrasi peserta ditutup (*close register*) | Wajib $\ge$ `registrationStartDate` |
| **`eventStartDate`** (Tgl Dimulai Acara) | Timestamp (Date) | Hari dan jam pelaksanaan acara/lomba dimulai | Wajib diisi format tanggal valid |
| **`eventEndDate`** (Tgl Selesai Acara / Tanggal) | Timestamp (Date) | Hari dan jam pelaksanaan acara/lomba selesai | Wajib $\ge$ `eventStartDate` |
| **`priceList`** (Daftar Harga / Price List) | JSONB Array | Daftar tingkatan harga kompetisi (misal: Normal Price, Presale 1, Early Bird). Default: `[{ id: 'default', name: 'Normal Price', price: 0 }]` | Minimal 1 item valid |
| **`selectedPriceId`** (Tier Harga Aktif) | String | ID dari tier price list yang sedang aktif dan diterapkan untuk event ini | Wajib mengacu ke salah satu item di `priceList` |
| **`fee`** (Biaya Aktif) | Integer / Number | Biaya registrasi aktif dalam Rupiah (Rp) yang disinkronkan otomatis dari tier terpilih (`selectedPriceId`). Nilai `0` berarti gratis (*Free Entry*). Input manual biaya aktif dihilangkan dari form karena langsung terikat pada tier harga. | Min. 0 |
| **`contactPersonIds`** (Contact Person) | Array UUID (Opsional) | Daftar ID narahubung panitia yang ditugaskan untuk kompetisi ini (Relasi Many-to-Many). Dipilih via dropdown dan bisa ditambah inline. | Opsional |
| **`guidebookUrl`** (Buku Panduan / Rulebook PDF) | Text / URL (Opsional) | URL relatif publik berkas PDF panduan teknis/juknis lomba yang disimpan di direktori `public/documents/guidebooks/` dengan penamaan random UUID (Maks. 2MB, MIME: `application/pdf`). Bernilai `null` jika tidak diunggah. | Nullable / Optional valid path string |
| **`description`** (Deskripsi) | Text (Opsional) | Ringkasan informasi, syarat singkat, atau format perlombaan | Opsional |
| **`maxQuota`** (Batas Kuota) | Integer (Opsional) | Maksimal kuota tim/peserta yang diterima (jika dibatasi) | Min. 1 jika diisi |
| **`status`** (Status Pendaftaran) | Enum | Status operasional registrasi: `OPEN`, `CLOSED`, `UPCOMING`, `COMPLETED` | Default: `OPEN` |

---

## 3. Skema Database PostgreSQL & Drizzle ORM

Skema tabel didefinisikan secara deklaratif di `modules/competition/infrastructure/competition.table.ts`:

```typescript
import { pgTable, uuid, varchar, text, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";

export const competitionTypeEnum = pgEnum("competition_type", [
  "EVENT",
  "TOURNAMENT",
]);

export const competitionStatusEnum = pgEnum("competition_status", [
  "UPCOMING",
  "OPEN",
  "CLOSED",
  "COMPLETED",
]);

export interface PriceListItem {
  id: string;
  name: string;
  price: number;
}

export const competitionsTable = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: competitionTypeEnum("type").default("TOURNAMENT").notNull(),
  registrationStartDate: timestamp("registration_start_date", { withTimezone: true }).notNull(),
  registrationEndDate: timestamp("registration_end_date", { withTimezone: true }).notNull(),
  eventStartDate: timestamp("event_start_date", { withTimezone: true }).notNull(),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }).notNull(),
  fee: integer("fee").default(0).notNull(), // Biaya aktif tersinkron dari tier terpilih
  priceList: jsonb("price_list")
    .$type<PriceListItem[]>()
    .default([{ id: "default", name: "Normal Price", price: 0 }])
    .notNull(),
  selectedPriceId: varchar("selected_price_id", { length: 50 })
    .default("default")
    .notNull(),
  guidebookUrl: text("guidebook_url"), // Nullable: URL publik PDF rulebook di folder public (Maks. 2MB)
  description: text("description"),
  maxQuota: integer("max_quota"),
  status: competitionStatusEnum("status").default("OPEN").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const contactPersonsTable = pgTable("contact_persons", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  phone: varchar("phone", { length: 30 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// Relasi Many-to-Many: 1 CP punya banyak kompetisi, 1 kompetisi punya banyak CP
export const competitionContactPersonsTable = pgTable(
  "competition_contact_persons",
  {
    competitionId: uuid("competition_id")
      .notNull()
      .references(() => competitionsTable.id, { onDelete: "cascade" }),
    contactPersonId: uuid("contact_person_id")
      .notNull()
      .references(() => contactPersonsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.competitionId, table.contactPersonId] }),
  ]
);

// Relasi 1:N: 1 Kompetisi memiliki banyak Dokumen/Berkas (event_documents)
export const eventDocumentsTable = pgTable("event_documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  filePath: text("file_path").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

---

## 4. Tampilan Kartu Kompetisi (Nama Price List & Harga Langsung)

Pada kartu kompetisi (`CompetitionCard`):
1. **Penyajian Harga Langsung:** Menampilkan nama price list aktif dan harga nominalnya secara langsung (contoh: `Normal Price: Free Entry` atau `Presale 1: Rp 35.000`), sehingga panitia langsung melihat tier yang sedang berlaku tanpa perlu membuka menu edit.
2. **Badge Tier Aktif:** Badge tier harga diletakkan tegas di samping status kompetisi.

---

## 5. Price List Selector (Terintegrasi Penuh)

Sistem presale terintegrasi langsung ke dalam Form Kompetisi (*Add/Edit Event*) melalui komponen **Price List Selector Dropdown**:
1. **Default State:** Setiap pembuatan event baru secara otomatis memiliki tier default `Normal Price = Rp 0` dengan ID `default`.
2. **Dropdown Interaktif:**
   - Memilih tier harga aktif: Memilih tier pada dropdown langsung mengubah nilai `selectedPriceId` dan nominal `fee` secara otomatis.
   - Menambahkan tier baru: Terdapat form inline di dalam dropdown untuk memasukkan nama tier (misal: "Presale 1") dan nominal harga (misal: 30000).
   - Mengedit & Menghapus tier: Langsung dari dalam dropdown selector.
3. **Peniadaan Input Terpisah:** Input "Nominal Biaya Aktif" dihapus dari form karena nominal biaya secara otomatis selalu mengikuti harga dari tier price list yang sedang terpilih.

---

## 6. Fitur Manajemen Contact Person (Sub-Menu & Dropdown Selector)

Narahubung panitia dikelola secara terpusat dengan relasi **Many-to-Many ($M:N$)**:
1. **Halaman Sub-Kompetisi (`/dashboard/competition/contact-person`):**
   - Halaman khusus pada sub-menu Events di sidebar dashboard untuk mengelola seluruh data narahubung panitia.
   - Kolom data: **Nama Lengkap**, **Nomor WhatsApp / HP**, **Daftar Kompetisi Terkait**, serta aksi Edit dan Hapus.
   - Modal Dialog Tambah & Edit Contact Person.
2. **Komponen `ContactPersonSelector` pada Form Kompetisi:**
   - Berupa Dropdown / Popover interaktif (mirip dengan `PriceListSelector`).
   - Panitia dapat memilih 1 atau lebih contact person yang sudah ada di database untuk dikaitkan dengan kompetisi.
   - Menyediakan form penambahan contact person baru secara inline (input Nama & Nomor HP) langsung di dalam dropdown tanpa harus keluar dari halaman formulir kompetisi.
   - Saat disimpan, relasi M:N disinkronkan otomatis pada tabel `competition_contact_persons`.

---

## 7. Fitur Unggah Buku Panduan / Rulebook PDF (Folder Publik & Random URL)

Untuk menghemat kuota cloud storage Supabase, berkas **Buku Panduan / Rulebook (PDF)** disimpan langsung di direktori publik lokal Next.js (`public/documents/guidebooks/`) dan dapat diakses secara umum (*publicly accessible*):
1. **Penyimpanan & Penamaan Berkas:**
   - **Lokasi Penyimpanan:** Direktori `public/documents/guidebooks/`.
   - **Akses Publik:** URL statis Next.js: `/documents/guidebooks/{random-name}.pdf`.
   - **Generasi Nama Acak:** Menggunakan UUID acak (`crypto.randomUUID()`) atau token kriptografi unik (contoh: `d3b07384-d113-4632-9c98-466a978f8502.pdf`) untuk mencegah tabrakan nama, menjaga keamanan URL, dan menghindari enumerasi nama file.
   - **Maksimal Ukuran File:** 2 MB ($2 \times 1024 \times 1024$ bytes = $2.097.152$ bytes).
   - **Format yang Diizinkan:** Berkas PDF saja (`application/pdf`).
2. **Alur Interaksi Upload & Validasi:**
   - **Komponen Input File (Shadcn UI & Drag-Drop):** Area upload intuitif dengan preview nama berkas, ukuran, dan format.
   - **Validasi Klien & Server:**
     - Ukuran berkas dicek langsung saat dipilih ($> 2\text{ MB}$ akan memicu pesan peringatan yang ramah).
     - MIME type dicek ketat (`application/pdf`).
   - **Penanganan State:**
     - Jika kompetisi sudah memiliki berkas PDF, ditampilkan kartu preview berkas dengan tombol unduh/buka tab baru serta tombol **"Ganti Berkas"** dan **"Hapus Berkas"**.
     - Berkas bersifat opsional (*nullable*), admin bebas menyimpan form tanpa mengunggah PDF.
   - **Pembersihan Berkas Fisik:**
     - Saat berkas diganti atau dihapus, berkas lama di `public/documents/guidebooks/` otomatis dibersihkan via filesystem API (`fs/promises.unlink`) dengan proteksi sanitasi path.

---

## 8. Alur Pengguna (User Flow)

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Panitia / Admin
    participant Catalog as Halaman Katalog (/dashboard/competition)
    participant CreatePage as Halaman Form (/dashboard/competition/create)
    participant Action as competition.actions (Server Action)
    participant FS as Local Filesystem (public/documents/guidebooks)
    participant Guard as requireAuthUser (Session Guard)
    participant DB as PostgreSQL (competitionsTable)

    Admin->>Catalog: Buka halaman /dashboard/competition
    Catalog->>DB: Ambil seluruh data kompetisi & event
    DB-->>Catalog: Tampilkan Grid Kartu Event + Kartu "Tambah Event Baru"

    Admin->>Catalog: Klik Kartu "Tambah Event Baru"
    Catalog->>CreatePage: Navigasi ke /dashboard/competition/create
    Admin->>CreatePage: Isi form (Nama, Tipe, Jadwal, Biaya, Kuota, Deskripsi)
    opt Unggah Buku Panduan (Opsional)
        Admin->>CreatePage: Pilih file PDF (Maks. 2MB)
        CreatePage->>Action: uploadCompetitionGuidebookAction(formData)
        Action->>Guard: Verifikasi sesi autentikasi admin
        Action->>Action: Validasi ukuran <= 2MB & MIME PDF
        Action->>FS: Simpan berkas dengan nama acak UUID ke public/documents/guidebooks/
        FS-->>Action: Berhasil (/documents/guidebooks/{random-uuid}.pdf)
        Action-->>CreatePage: Kembalikan URL publik berkas PDF
    end
    Admin->>CreatePage: Klik tombol "Simpan Event"
    CreatePage->>Action: createCompetitionAction(payload with guidebookUrl)
    Action->>Guard: Verifikasi sesi autentikasi admin
    Action->>Action: Validasi payload dengan competitionFormSchema (Zod)
    Action->>DB: Simpan ke tabel competitionsTable
    DB-->>Action: Sukses simpan
    Action-->>CreatePage: Redirect ke /dashboard/competition & revalidate
    CreatePage-->>Catalog: Halaman menampilkan kartu kompetisi yang baru ditambahkan
```

---

## 9. Arsitektur Domain-Driven Design (DDD) untuk Bounded Context `competition`

```text
modules/competition/
├── domain/
│   ├── competition-type.enum.ts      # Enum: EVENT, TOURNAMENT
│   ├── competition-status.enum.ts    # Enum: UPCOMING, OPEN, CLOSED, ONGOING, COMPLETED
│   ├── competition.entity.ts         # Tipe entitas Competition
│   └── competition.schema.ts         # Zod validation schema (competitionFormSchema dengan guidebookUrl)
├── application/
│   ├── competition.actions.ts        # Server Actions: create, update, delete, toggleStatus
│   ├── contact-person.actions.ts     # Server Actions: CRUD contact person
│   └── competition-upload.action.ts  # Server Action: upload & delete PDF guidebook di folder public/
├── infrastructure/
│   ├── competition.table.ts          # Skema Drizzle ORM PostgreSQL (kolom guidebook_url nullable)
│   ├── competition.repository.ts     # Data access queries
│   ├── contact-person.table.ts       # Skema tabel contact person & pivot relation
│   ├── contact-person.repository.ts  # Repository contact person
│   └── competition-file.helper.ts    # Helper penulisan & penghapusan berkas fisik di public/documents/guidebooks/
└── presentation/
    └── components/
        ├── competition-card.tsx      # Komponen kartu detail (dilengkapi badge/link download PDF jika ada)
        ├── add-competition-card.tsx  # Kartu khusus "Tambah Event Baru" (mengarah ke /create)
        ├── competition-form.tsx      # Form pembuatan & pengeditan kompetisi (Shadcn UI + PDF uploader)
        ├── competition-guidebook-uploader.tsx # Komponen uploader file PDF dengan preview & validasi 2MB
        ├── price-list-selector.tsx   # Dropdown selector & manager price list tier
        ├── contact-person-selector.tsx # Dropdown selector & inline creator contact person
        ├── competition-grid.tsx      # Grid tampilan kartu kompetisi dengan pencarian & filter
        └── competition-stats.tsx     # Kartu metrik (Total, Tournament, Event, Pendaftaran Terbuka)
```

---

## 10. Desain Antarmuka Dashboard

Antarmuka dibangun **100% menggunakan primitif Shadcn UI**:
1. **Halaman Katalog (`/dashboard/competition`):**
   - **Kartu Metrik Ringkasan:** Total Kompetisi, Total Turnamen, Total Event, Pendaftaran Terbuka.
   - **Filter & Search Bar:** Filter tipe (`Semua`, `Tournament`, `Event`), status (`Semua`, `Buka`, `Tutup`), dan pencarian teks.
   - **Grid Kartu Kompetisi:**
     - **Kartu Pertama:** `AddCompetitionCard` (kartu bergaris putus-putus elegan dengan ikon Plus bertuliskan *"Tambah Kompetisi / Event Baru"* yang langsung mengarahkan ke `/dashboard/competition/create`).
     - **Kartu Kompetisi:** Menampilkan Badge Tipe, Badge Status, Nama Lomba, Biaya Registrasi (Rp), Jadwal Registrasi, Jadwal Pelaksanaan Acara, Kuota, Deskripsi singkat, Badge Buku Panduan PDF (jika ada, link preview), tombol Edit (`/dashboard/competition/[id]/edit`), tombol Toggle Buka/Tutup Pendaftaran, dan tombol Hapus.
2. **Halaman Formulir (`/dashboard/competition/create` & `/dashboard/competition/[id]/edit`):**
   - Menggunakan komponen Shadcn UI (`Card`, `Input`, `Label`, `Select`, `Textarea`, `Button`).
   - Tombol "Kembali ke Katalog".
   - Field yang rapi, responsif, dan validasi Zod error inline.
   - **Section Buku Panduan / Rulebook (PDF):** Area unggah berkas PDF dengan batas maksimal 2MB, progress/status upload, nama berkas, tombol unduh untuk melihat dokumen, serta tombol ganti/hapus.
   - Tombol "Simpan Kompetisi" dengan loading spinner yang otomatis redirect ke `/dashboard/competition` ketika berhasil disimpan.

---

## 11. Proteksi Controller & Keamanan Akses

- **Middleware Route Protection:** Rute `/dashboard/competition` diproteksi secara otomatis oleh `middleware.ts`.
- **Server Action Controller Protection:** Seluruh mutasi data (`createCompetitionAction`, `updateCompetitionAction`, `deleteCompetitionAction`, `toggleCompetitionStatusAction`, `uploadCompetitionGuidebookAction`) memanggil `await requireAuthUser()` untuk memastikan request berasal dari admin yang sah.

---

## 12. Status & Tahapan Pekerjaan

- [x] **Tahap 1: Analisis Kebutuhan & Dokumen Perencanaan** (Dokumen `docs/feateures/competition-feature.md` selesai dirancang)
- [x] **Tahap 2: Konfirmasi & Persetujuan Pengguna** (Disetujui: Add Event Card, Halaman Form `/create` & `/[id]/edit`, input lengkap nama, tipe, jadwal registrasi & acara, biaya, kuota, deskripsi)
- [x] **Tahap 3: Implementasi Lapisan Domain & Skema Validasi** (`competition-type.enum.ts`, `competition-status.enum.ts`, `competition.schema.ts`)
- [x] **Tahap 4: Implementasi Lapisan Infrastruktur & Migrasi Database** (`competition.table.ts`, `competition.repository.ts`, migrasi `0005_lively_black_bird.sql` & `0007_mushy_kate_bishop.sql`)
- [x] **Tahap 5: Implementasi Lapisan Application & Server Actions** (`competition.actions.ts` dengan guard autentikasi `requireAuthUser`)
- [x] **Tahap 6: Implementasi Lapisan Presentation & UI Dashboard** (`add-competition-card.tsx`, `competition-card.tsx`, `competition-grid.tsx`, `competition-stats.tsx`, `competition-form.tsx`, halaman `/dashboard/competition`, `/create`, `/[id]/edit`)
- [x] **Tahap 7: Update Fitur Input File PDF Buku Panduan / Rulebook (Folder Public & Random URL):**
  - [x] Penyiapan direktori `public/documents/guidebooks/`.
  - [x] Penambahan kolom `guidebook_url` (text, nullable) di `competitionsTable` & migrasi Drizzle (`0009_icy_tombstone.sql`).
  - [x] Update validasi Zod di `competition.schema.ts` (`guidebookUrl`).
  - [x] Pembuatan Server Action & Helper upload/delete file PDF dengan generate random UUID name (`competition-file.helper.ts`, `competition-upload.action.ts`).
  - [x] Integrasi komponen upload PDF di `CompetitionForm` (`competition-guidebook-uploader.tsx`) dan penanda link rulebook di `CompetitionCard`.
- [x] **Tahap 8: Verifikasi & Pengujian Fungsional Menyeluruh** (Build & lint clean, uji upload PDF, validasi ukuran > 2MB, update & hapus file PDF)
