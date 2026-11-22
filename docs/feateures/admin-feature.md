# Spesifikasi Fitur: Admin Dashboard & Manajemen Sistem

Dokumen ini mendefinisikan rancangan, arsitektur antarmuka, hak akses (RBAC), dan spesifikasi modul **Admin Dashboard** untuk platform **Kemas Prasasti 2025**.

> [!NOTE]
> Modul Manajemen Kompetisi pada dokumen ini memuat struktur operasional tingkat tinggi (status, kuota, rulebook, verifikasi). Rincian mendalam mengenai cabang lomba dan formulir dinamis spesifik akan diselaraskan setelah penjelasan tambahan diberikan oleh pengguna.

---

## 1. Arsitektur Rute & Navigasi Admin (`app/(dashboard)`)

Struktur hierarki antarmuka dashboard admin dirancang menggunakan layout terpadu dengan navigasi berbasis sidebar:

```text
app/(dashboard)/
├── layout.tsx                     # Layout utama: Sidebar, Header admin, Auth Guard
├── dashboard/
│   ├── page.tsx                   # Overview Dashboard (Ringkasan metrik & analitik)
│   ├── blog/
│   │   ├── page.tsx               # Daftar artikel blog, filter, & status
│   │   ├── create/page.tsx        # Editor artikel baru
│   │   └── [id]/edit/page.tsx     # Editor perbarui artikel
│   ├── competition/
│   │   ├── page.tsx               # Manajemen status & daftar kompetisi
│   │   └── [id]/page.tsx          # Detail operasional kompetisi & data pendaftar
│   ├── registrations/
│   │   ├── page.tsx               # Antrean verifikasi berkas & bukti bayar
│   │   └── [id]/page.tsx          # Detail pendaftar, pratinjau berkas, & aksi verifikasi
│   └── users/
│       ├── page.tsx               # Manajemen akun admin & role panitia
│       └── activity-log/page.tsx  # Riwayat audit log aktivitas admin
```

---

## 2. Role-Based Access Control (RBAC) & Manajemen User

Sistem otentikasi admin memanfaatkan **Supabase Auth** (`@supabase/ssr`) yang divalidasi sesinya di server melalui Next.js Middleware dan Server Components.

### A. Level Peran (Roles)
| Role | Deskripsi Hak Akses |
| :--- | :--- |
| **Superadmin** | Akses penuh: mengelola akun admin lain, pengaturan umum website, verifikasi pembayaran, manajemen kompetisi, dan CMS blog. |
| **Admin** | Akses operasional: memverifikasi pendaftaran peserta, memperbarui status kuota lomba, mengunduh data pendaftar (Excel/CSV). |
| **CMS Writer** | Akses editorial: menulis, mengedit, dan mempublikasikan artikel blog serta liputan berita kegiatan. |

### B. Fitur Manajemen User & Autentikasi
- **Autentikasi Tertutup (No Public Registration):** Tidak ada registrasi publik untuk umum. Pengguna hanya dapat dibuat oleh pengguna berhak akses `Superadmin`.
- **Integrasi Supabase Auth:** Akun disinkronkan langsung ke `auth.users` Supabase via Supabase Admin SDK dan PostgreSQL `usersTable`. Rincian lengkap ada pada [auth-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/auth-feature.md).
- **Daftar Pengguna:** Menampilkan avatar, username, email, role, status verifikasi (`verified`/`unverified`), waktu terakhir login, dan tanggal pembuatan akun.
- **Tambah / Edit Pengguna:** Superadmin dapat menambahkan akun baru dengan menetapkan username, email, role, dan kata sandi awal melalui modal dialog.
- **Filter & Pencarian Cepat:** Pencarian berdasarkan username/email dan filter berdasarkan level peran (`Superadmin`, `Admin`, `CMS Writer`) serta status verifikasi.
- **Audit / Activity Log:** Mencatat jejak audit krusial (misal: *Admin X memverifikasi Pendaftar Y*, *Admin Z mengubah status pendaftaran Futsal menjadi Closed*).

### C. Skema Database Pengguna (`usersTable`)
- **Tabel:** `users`
- **Definisi Kolom:**
  - `id`: `uuid` (Primary Key, default: `gen_random_uuid()`)
  - `username`: `varchar(50)` (Unique, Not Null)
  - `email`: `varchar(255)` (Unique, Not Null)
  - `role`: `user_role` (`SUPERADMIN`, `ADMIN`, `CMS_WRITER`) (Not Null, default: `ADMIN`)
  - `status`: `user_status` (`verified`, `unverified`) (Not Null, default: `unverified`)
  - `last_login`: `timestamp with time zone` (Nullable)
  - `created_at`: `timestamp with time zone` (Not Null, default: `now()`)
  - `updated_at`: `timestamp with time zone` (Not Null, default: `now()`)
- **Status Implementasi:** ✅ Selesai (Migrasi `drizzle/0003_green_iron_lad.sql`, UI tersedia di `/dashboard/users`).

---

## 3. Manajemen Blog (Web CMS)

Modul ini memfasilitasi publikasi artikel berita, dokumentasi, dan rilis pers kegiatan.

### Fitur Utama:
1. **Daftar Artikel (Table View):**
   - Menampilkan judul, kategori, tags, penulis (author), status (*Draft*, *Published*, *Archived*), dan tanggal dibuat.
   - Filter cepat berdasarkan status atau kategori dan fitur pencarian judul.
2. **Editor Artikel (Create & Edit):**
   - **Form Metadata:** Judul artikel, slug otomatis/kustom, deskripsi singkat (excerpt), kategori, tags.
   - **Media Upload:** Upload cover image / thumbnail utama ke Supabase Storage (`blog-media`).
   - **Content Editor:** Rich-text atau Markdown editor yang mendukung formatting teks, heading, quote, list, dan penyematan gambar di dalam artikel.
   - **Action Bar:** Tombol *Save as Draft*, *Preview Article*, dan *Publish*.
3. **Kategori & Tag Management:**
   - Tambah/edit kategori (misal: *Berita Acara, Pengumuman, Edukasi, Dokumentasi*).

---

## 4. Manajemen Kompetisi (Competition Management)

Modul ini berfokus pada pengendalian operasional kompetisi dan event secara terpusat oleh panitia. Rincian skema dan spesifikasi lengkap didokumentasikan di [competition-feature.md](file:///home/kinggu/Documents/Project/kemas-2025/docs/feateures/competition-feature.md).

### Fitur Utama:
1. **Katalog Manajemen Kompetisi & Event:**
   - Tabel dan kartu status seluruh cabang kompetisi (Tournament) maupun agenda kegiatan (Event).
   - Menampilkan: Nama, Tipe (`Tournament` / `Event`), Periode Buka & Tutup Pendaftaran, Jadwal Pelaksanaan Acara, Biaya (Rp / Free Entry), dan Status.
2. **Kontrol Cepat (Quick Actions):**
   - **Toggle Status Pendaftaran:** Saklar (*switch*) untuk membuka atau menutup registrasi secara instan.
   - **Form Tambah & Edit Kompetisi:** Input nama, tipe, jadwal registrasi, jadwal acara, biaya, kuota, dan deskripsi.
   - **Hapus Kompetisi:** Konfirmasi penghapusan aman via `AlertDialog`.

---

## 5. Manajemen Pendaftaran & Verifikasi Peserta (Registrations)

Modul krusial untuk validasi data pendaftar dan bukti transaksi keuangan:

### Fitur Utama:
1. **Tabel Antrean Pendaftar:**
   - Filter per cabang lomba, filter per status verifikasi:
     - 🟡 `Pending` (menunggu peninjauan panitia)
     - 🟢 `Verified` (berkas & pembayaran valid)
     - 🔴 `Rejected` (berkas tidak sesuai / pembayaran bermasalah)
   - Kolom pencarian: Nama tim/peserta, nomor kontak, kode registrasi unik.
2. **Detail & Pratinjau Berkas:**
   - Pratinjau langsung bukti transfer / pembayaran dalam modal/drawer tanpa harus mengunduh file.
   - Pratinjau identitas peserta (kartu pelajar/mahasiswa/KTP).
   - Rincian data anggota tim.
3. **Aksi Verifikasi:**
   - Tombol **Setujui (Verify)**: Mengubah status peserta menjadi terverifikasi.
   - Tombol **Tolak (Reject)**: Mengharuskan admin memasukkan alasan penolakan (misal: *"Bukti transfer tidak terbaca"* atau *"Kartu identitas tidak sesuai"*).
4. **Ekspor Data:**
   - Ekspor tabel peserta ke format **Excel (.xlsx)** atau **CSV** untuk digunakan oleh panitia divisi acara dan perlengkapan di hari pelaksanaan.

---

## 6. Dasbor Ringkasan & Metrik Utama (Dashboard Overview)

Tampilan awal saat admin login ke `/dashboard`:
- **Kartu Metrik (KPI Cards):**
  - Total Peserta Terdaftar (akumulasi seluruh lomba).
  - Pendaftaran Menunggu Verifikasi (*Pending Review Count*).
  - Pembayaran Terverifikasi (*Verified Total*).
  - Total Artikel Blog Tayang (*Published Articles*).
- **Grafik Distribusi Peserta:**
  - Diagram pendaftar per cabang lomba.
- **Antrean Registrasi Terbaru:**
  - 5-10 pendaftar terbaru yang memerlukan verifikasi cepat oleh panitia.

---

## 7. Arsitektur Komponen UI (100% Shadcn & Reusable)

Sesuai instruksi dan panduan standar, **seluruh antarmuka admin dashboard wajib dibangun menggunakan komponen Shadcn UI** dan terbagi menjadi modul-modul reusable:

### A. Primitif Shadcn UI Wajib (`components/ui/`)
1. **`Table`**: Basis perenderan seluruh antrean pendaftar, manajemen kompetisi, daftar artikel CMS blog, daftar akun panitia, dan audit log.
2. **`Card`**: Penopang kartu statistik metrik (`StatCard`), panel kontainer data, dan pratinjau ringkasan pendaftar.
3. **`Badge`**: Penanda status terstandarisasi (`StatusBadge`) untuk registrasi (`Pending`, `Verified`, `Rejected`), status artikel (`Draft`, `Published`), serta status pendaftaran lomba (`Open`, `Closed`).
4. **`Button`**: Seluruh tombol interaksi (aksi verifikasi, tombol submit, filter, navigasi, dan trigger modal).
5. **`Dialog`**: Modal pop-up untuk pratinjau bukti bayar, konfirmasi persetujuan/penolakan pendaftar, dan dialog tambah akun admin.
6. **`DropdownMenu`**: Menu opsi baris tabel (aksi per entitas: *Edit, Hapus, Detail, Verifikasi*) dan menu profil admin di topbar header.
7. **`Avatar`**: Menampilkan inisial atau foto profil panitia yang sedang login.
8. **`Input` & `Select`**: Kolom pencarian, input teks formulir admin, dan dropdown filter kategori/status.
9. **`Sheet`**: Drawer navigasi sidebar responsif untuk tampilan mobile (< 1024px) serta drawer detail berkas.
10. **`Tabs`**: Tab navigasi cepat antar-kategori status (misal: Semua, Pending, Verified, Rejected).
11. **`Skeleton`**: Animasi loading placeholder saat data sedang diambil secara asinkronus dari PostgreSQL.

### B. Modul Komponen Reusable Dashboard (`components/dashboard/`)
- **`DashboardSidebar.tsx`**: Sidebar navigasi modular dengan dukungan desktop fixed dan mobile drawer.
- **`DashboardHeader.tsx`**: Header terpadu dengan breadcrumb dan menu profil admin.
- **`StatCard.tsx`**: Komponen reusable kartu metrik dengan visual ikon, title, value, tren, dan deskripsi.
- **`StatusBadge.tsx`**: Komponen status badge yang memetakan status data ke token visual warna secara konsisten.
- **`PageHeader.tsx`**: Komponen header reusable untuk setiap sub-halaman dashboard (judul, deskripsi, slot tombol aksi).
- **`EmptyState.tsx`**: Tampilan visual terpadu saat tabel atau koleksi data masih kosong.
- **`DataTablePagination.tsx`**: Pengendali pagination dan navigasi halaman tabel terpadu.

