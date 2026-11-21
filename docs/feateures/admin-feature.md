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
| **Admin Panitia (Committee)** | Akses operasional: memverifikasi pendaftaran peserta, memperbarui status kuota lomba, mengunduh data pendaftar (Excel/CSV). |
| **Content Editor / Writer** | Akses editorial: menulis, mengedit, dan mempublikasikan artikel blog serta galeri berita. |

### B. Fitur Manajemen User
- **Daftar Admin:** Menampilkan nama, email, role, status aktif, dan waktu login terakhir.
- **Undang / Tambah Admin:** Superadmin dapat mendaftarkan akun panitia baru dengan menetapkan role tertentu.
- **Audit / Activity Log:** Mencatat jejak audit krusial (misal: *Admin X memverifikasi Pendaftar Y*, *Admin Z mengubah status pendaftaran Futsal menjadi Closed*).

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

Modul ini berfokus pada pengendalian operasional kompetisi secara terpusat oleh panitia:

### Fitur Utama:
1. **Katalog Manajemen Lomba:**
   - Kartu/tabel status seluruh cabang lomba.
   - Menampilkan: Nama lomba, status (*Open*, *Closing Soon*, *Closed*), jumlah pendaftar, dan kuota maksimal (jika ada batasan).
2. **Kontrol Cepat (Quick Actions):**
   - **Toggle Status Pendaftaran:** Saklar (*switch*) untuk membuka atau menutup registrasi secara instan.
   - **Pembaruan Link & Berkas:** Ubah URL buku panduan (Rulebook PDF), link grup koordinasi peserta, atau contact person narahubung.
   - **Pengaturan Tanggal Penting:** Perbarui tanggal *technical meeting*, batas akhir pendaftaran, dan hari pelaksanaan.
3. **Tautan Langsung ke Peserta Lomba:**
   - Satu klik untuk melihat seluruh peserta yang terdaftar khusus pada cabang kompetisi tersebut.

> *Catatan Detail Kompetisi:* Struktur form pendaftaran dinamis, persyaratan khusus, dan aturan validasi per cabang lomba akan ditambahkan setelah rincian spesifik diberikan.

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
