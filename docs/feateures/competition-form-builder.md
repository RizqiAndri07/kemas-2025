# Spesifikasi Fitur: Formulir Pendaftaran Dinamis (Dynamic Form Builder) & Sub-Kompetisi

Dokumen ini mendefinisikan rancangan teknis, arsitektur Domain-Driven Design (DDD), skema database, aturan validasi, serta implementasi antarmuka untuk fitur **Formulir Pendaftaran Dinamis (*Form Builder*)** sebagai sub-modul dari **Manajemen Kompetisi & Event (Competition Management)** pada platform **Kemas Prasasti 2025**.

---

## 1. Latar Belakang & Tujuan

Setiap cabang lomba atau kegiatan memiliki kebutuhan data registrasi yang berbeda-beda:
- **Turnamen Futsal / Basket:** Membutuhkan data Nama Tim, Nama Kapten, Nomor WhatsApp, Bukti Pembayaran, Scan Kartu Pelajar (PDF/Gambar), dan Logo Tim.
- **Turnamen E-Sport (MLBB / PUBG / Valorant):** Membutuhkan Nama Tim, Game ID, Server ID, In-Game Nickname, dan Screenshot Akun.
- **Acara Umum / Akademik (Try Out / Workshop / Seminar):** Membutuhkan Nama Lengkap, Asal Instansi/Sekolah, Jurusan, Nomor HP, atau bahkan Tautan Portofolio.
- **Acara Bebas Terbuka (Opening Ceremony / Pameran / Konser Bebas):** Tidak memerlukan formulir pendaftaran (*no registration needed*).

### Tujuan Utama:
1. Memberikan fleksibilitas penuh kepada Admin Event untuk membuat formulir pendaftaran dinamis per kompetisi.
2. Menerapkan relasi **1 Kompetisi memiliki 1 Formulir Pendaftaran (1-to-1)** yang melekat secara terintegrasi langsung pada kompetisi tersebut, mengeliminasi kompleksitas halaman perantara daftar formulir.
3. Alur direct builder: Saat membuat event baru dan menekan tombol *"Simpan & Lanjut Buat Formulir"*, admin langsung diarahkan ke form builder `/dashboard/competition/[id]/form`.
4. Menyediakan kontrol **Switch "No Registration Needed" (Tanpa Pendaftaran)** untuk event publik terbuka.
5. Menegakkan aturan integritas data: **Kompetisi tidak dapat dibuka pendaftarannya (`status === 'OPEN'`) jika switch tanpa pendaftaran nonaktif dan formulir pendaftaran belum memiliki field/section**.

---

## 2. Struktur Tipe Input & Fitur Form Builder

### A. Pengelompokan Berbasis Section
Setiap formulir dapat diorganisir ke dalam beberapa **Section** (misal: *"Informasi Tim"*, *"Data Penanggung Jawab"*, *"Dokumen Persyaratan"*).
- Setiap section memiliki: Judul section, Deskripsi/Petunjuk, dan Daftar Field.
- Section dan Field dapat diubah urutannya (*reordered*).

### C. Pengalaman Pengguna Bergaya Google Forms (Inline Question Cards - No Dialog)

Form Builder mengadopsi interaksi visual modern menyerupai **Google Forms**:
1. **Penyuntingan Langsung (*In-Place / Inline Editing*):**
   - Tidak ada dialog modal (*pop-up dialog*) untuk konfigurasi detail field.
   - Setiap pertanyaan direpresentasikan sebagai kartu interaktif langsung (*Question Card*) di dalam canvas.
   - Mengklik kartu pertanyaan mengaktifkan *Active State* dengan aksen bar vertikal di sisi kiri (`border-l-4 border-l-primary`), menandakan field tersebut sedang difokuskan.
2. **Struktur Anatomi Kartu Pertanyaan:**
   - **Header Kartu:**
     - Input judul pertanyaan / label field secara langsung (`<Input value={field.label} />`).
     - Dropdown pemilih tipe input (`<Select value={field.type} />`) lengkap dengan ikon representatif di sisi kanan.
   - **Body Kartu (Dinamis Sesuai Tipe Input):**
     - *Teks / Paragraf / URL / Angka:* Pratinjau input langsung, ditambah kontrol ekspansi inline untuk *Placeholder* dan *Petunjuk / Helper Text*.
     - *Pilihan Ganda / Dropdown / Checkbox:* Editor daftar opsi inline (tambah opsi baru dengan 1-klik, edit teks opsi langsung, dan hapus opsi).
     - *Upload Berkas:* Pengaturan inline langsung untuk jenis berkas yang diizinkan (Gambar, PDF) dan batas maksimal ukuran berkas (1MB - 10MB).
   - **Toolbar Aksi Bawah:**
     - Tombol Reorder (*Pindah Atas / Pindah Bawah*).
     - Tombol Duplikasi (*Duplicate Field*) untuk menyalin field seketika.
     - Tombol Hapus (*Delete Field*).
     - Garis pemisah (*separator*).
     - Sakelar (*Switch*) **"Wajib diisi" (`required`)** di pojok kanan bawah.
     - Menu opsi tambahan (`MoreVertical`) untuk menampilkan input *Deskripsi / Helper Text* atau penyesuaian kustom *Slug ID*.
3. **Drag & Drop Reordering (Urutan Pertanyaan & Section):**
   - **Pertanyaan:** Setiap kartu pertanyaan memiliki *drag handle* ikon titik 6 (`GripHorizontal`) di bagian atas tengah (khas Google Forms). Menarik handle ini memungkinkan penyusunan ulang urutan pertanyaan secara interaktif dengan animasi halus berbasis `motion/react` `Reorder`.
   - **Section:** Setiap section dilengkapi ikon *drag handle* (`GripVertical`) pada header toolbar untuk memindahkan seluruh urutan section.
   - Tetap didukung tombol alternatif *Pindah Atas / Pindah Bawah* (`ChevronUp` / `ChevronDown`) untuk aksesibilitas maksimal.
4. **Penambahan Field Instan & Penempatan Tombol Section:**
   - Tombol **"+ Tambah Pertanyaan"** berada di bagian bawah tiap section untuk menyisipkan kartu baru secara langsung tanpa modal.
   - Tombol **"+ Tambah Section / Bagian Baru"** diposisikan secara strategis di bawah section paling akhir, memudahkan alur penulisan formulir secara berurutan dari atas ke bawah.

---

## 3. Logika Transisi Status Kompetisi (*Open Register Guard*)

Kompetisi memiliki status: `UPCOMING`, `OPEN`, `CLOSED`, `COMPLETED`.

Aturan bisnis sistem untuk membuka pendaftaran:
1. **Penyimpanan Draft:** Admin **dapat** menyimpan/memperbarui data kompetisi meskipun formulir pendaftaran masih kosong atau belum dipilih, dengan syarat status kompetisi adalah `UPCOMING` atau `CLOSED`.
2. **Pembukaan Pendaftaran (`status = OPEN`):** Hanya diperbolehkan jika salah satu kondisi berikut terpenuhi:
   - **Kondisi 1:** Switch `noRegistrationNeeded` bernilai `true` (Acara terbuka tanpa pendaftaran).
   - **Kondisi 2:** Switch `noRegistrationNeeded` bernilai `false` **DAN** formulir pendaftaran 1:1 kompetisi tersebut telah dibuat dan memiliki minimal 1 section/field pertanyaan.
3. **Pencegahan Pelanggaran:** Jika panitia mencoba mengubah status menjadi `OPEN` saat `noRegistrationNeeded == false` dan formulir belum memiliki field yang dirancang, sistem akan menolak dengan pesan error:
   > *"Pendaftaran tidak dapat dibuka (status OPEN) karena formulir pendaftaran belum memiliki field/pertanyaan. Silakan rancang formulir terlebih dahulu atau nyalakan switch 'Tanpa Pendaftaran'."*

---

## 4. Skema Database PostgreSQL (Drizzle ORM)

### A. Tabel `competitions` (Pembaruan)
Menambahkan kolom `no_registration_needed` dan `active_form_id`:

```typescript
// modules/competition/infrastructure/competition.table.ts
export const competitionsTable = pgTable("competitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  type: competitionTypeEnum("type").default("TOURNAMENT").notNull(),
  registrationStartDate: timestamp("registration_start_date", { withTimezone: true }).notNull(),
  registrationEndDate: timestamp("registration_end_date", { withTimezone: true }).notNull(),
  eventStartDate: timestamp("event_start_date", { withTimezone: true }).notNull(),
  eventEndDate: timestamp("event_end_date", { withTimezone: true }).notNull(),
  fee: integer("fee").default(0).notNull(),
  priceList: jsonb("price_list").notNull(),
  selectedPriceId: varchar("selected_price_id", { length: 50 }).default("default").notNull(),
  guidebookUrl: text("guidebook_url"),
  description: text("description"),
  maxQuota: integer("max_quota"),
  status: competitionStatusEnum("status").default("UPCOMING").notNull(),
  
  // Field Baru:
  noRegistrationNeeded: boolean("no_registration_needed").default(false).notNull(),
  activeFormId: uuid("active_form_id"), // FK ke competition_forms.id
  
  // Standar Audit Trail (AGENTS.md Rule 7)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

### B. Tabel Baru `competition_forms` (One-to-Many)
Menampung konfigurasi formulir pendaftaran milik kompetisi:

```typescript
// modules/competition/infrastructure/competition-form.table.ts
export const competitionFormsTable = pgTable("competition_forms", {
  id: uuid("id").defaultRandom().primaryKey(),
  competitionId: uuid("competition_id")
    .notNull()
    .references(() => competitionsTable.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  sections: jsonb("sections").$type<FormSectionConfig[]>().notNull().default([]),
  
  // Standar Audit Trail (AGENTS.md Rule 7)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

---

## 5. Arsitektur Domain-Driven Design (DDD)

Sesuai pola yang telah diterapkan di `modules/competition/`:
```text
modules/competition/
├── domain/
│   ├── competition.schema.ts         # Validasi Zod form kompetisi + Guard .refine() status OPEN
│   ├── competition-form.interface.ts # Interface TypeScript FormSectionConfig & FormFieldConfig
│   └── competition-form.schema.ts    # Validasi Zod konfigurasi builder form
├── infrastructure/
│   ├── competition.table.ts          # Skema Drizzle competitions (tambah noRegistrationNeeded & activeFormId)
│   ├── competition-form.table.ts     # Skema Drizzle competition_forms
│   ├── competition.repository.ts     # Data access kompetisi + setActiveForm()
│   └── competition-form.repository.ts# Data access CRUD & Duplikasi formulir
├── application/
│   ├── competition.actions.ts        # Server action kompetisi (terapkan guard status OPEN)
│   └── competition-form.actions.ts   # Server actions manajemen formulir & builder
└── presentation/
    └── components/
        ├── competition-form.tsx      # Form event + switch No Registration & Form Selector
        ├── form-builder/             # Komponen Form Builder (Google Forms Inline Style)
        │   ├── form-builder-editor.tsx
        │   ├── question-card.tsx     # Kartu pertanyaan inline bergaya Google Forms
        │   └── form-live-preview.tsx # Pratinjau interaktif formulir pendaftar
        └── form-list/                # Daftar formulir di dashboard
            └── competition-forms-manager.tsx
```

---

## 6. Antarmuka Pengguna & Rute Dashboard

- **Rute Daftar Formulir:** `/dashboard/competition/[id]/forms`
  Menampilkan semua formulir yang dibuat untuk kompetisi terkait, indikator form aktif, tombol ubah status aktif, edit, duplikasi, dan hapus.
- **Rute Form Builder:** `/dashboard/competition/[id]/forms/[formId]`
  Editor visual drag/reorder section, penambahan field dengan tipe data beragam, dan live preview.
- **Rute Form Event:** `/dashboard/competition/create` & `/dashboard/competition/[id]/edit`
  Menyertakan kontrol switch *"No Registration Needed"* dan dropdown pemilih *"Formulir Pendaftaran Aktif"*.
