# Spesifikasi Fitur: Kemas Prasasti 2025

Dokumen ini memetakan seluruh modul fitur yang akan dibangun, fungsi utama, dan kebutuhan datanya.

---

## 1. Modul Profil Organisasi & Landing Page

### Tujuan
Menyajikan representasi digital kegiatan "Kemas Prasasti 2025" yang menarik, responsif, dan informatif bagi masyarakat umum, calon peserta, dan sponsor.

### Sub-Fitur
- **Hero Section:** Banner utama dengan tema acara, slogan, tagline, dan Call-to-Action (CTA) untuk pendaftaran.
- **About Us Section:** Sejarah, visi, misi, dan nilai-nilai organisasi Kemas Prasasti.
- **Timeline / Jadwal Kegiatan:** Rangkaian agenda acara mulai dari pembukaan pendaftaran, technical meeting, hari pelaksanaan kegiatan, hingga malam penutupan/puncak.
- **Sponsorship & Media Partner Section:** Logo sponsor dan rekanan media pendukung acara.
- **Contact & FAQ:** Informasi contact person panitia (WhatsApp, email, media sosial) serta tanya-jawab seputar acara.

---

## 2. Modul Informasi & Katalog Kompetisi

### Tujuan
Menampilkan daftar kompetisi yang dibuka, syarat dan ketentuan, serta akses ke formulir pendaftaran masing-masing lomba.

### Sub-Fitur
- **Katalog Lomba:** Grid/list kartu kompetisi yang memuat:
  - Nama lomba & logo maskot.
  - Kategori (misal Olahraga, E-Sport, Akademik/Try Out, Seni).
  - Biaya pendaftaran (*free entry* atau berbayar).
  - Status pendaftaran (*Open*, *Closing Soon*, *Closed*).
- **Detail Lomba (`/competition/[id]`):**
  - Deskripsi lengkap cabang lomba.
  - Tempat dan tanggal pelaksanaan (*venue & date*).
  - Hadiah & penghargaan (*prize pool*).
  - Tombol unduh Buku Panduan / Rulebook (PDF).
  - Tombol CTA langsung menuju formulir pendaftaran lomba terkait.
  - Kontak narahubung (Contact Person) khusus cabang lomba tersebut.

---

## 3. Modul Sistem Pendaftaran (Registration Flow)

### Tujuan
Memfasilitasi pendaftaran peserta individu maupun tim secara online dengan validasi ketat dan verifikasi berkas.

### Sub-Fitur
- **Dynamic Form Builder / Form per Cabang Lomba:**
  - Setiap cabang lomba memiliki kebutuhan field berbeda (misal: Futsal membutuhkan Nama Tim, Nama Kapten, Asal Sekolah, dan Logo Tim; MLBB membutuhkan ID Game, Nickname, Nama Tim).
  - Validasi schema per lomba menggunakan **Zod**.
- **Upload Berkas Persyaratan:**
  - Bukti transfer pembayaran pendaftaran.
  - Kartu Tanda Pelajar / Mahasiswa / Identitas Peserta.
  - Berkas tambahan sesuai regulasi lomba (surat rekomendasi sekolah, foto anggota tim).
- **Halaman Konfirmasi & Bukti Pendaftaran:**
  - Ringkasan data yang disubmit.
  - Kode pendaftaran / Registration ID unik untuk pelacakan status.
  - Tautan grup WhatsApp peserta / narahubung panitia.

---

## 4. Modul Web CMS Blog & Publikasi

### Tujuan
Menjadi media publikasi artikel kegiatan, rilis pers, dokumentasi, pengumuman hasil seleksi, dan liputan berita.

### Sub-Fitur
- **Halaman Blog Publik (`/blog` & `/blog/[slug]`):**
  - Daftar artikel dengan paginasi, pencarian, dan filter kategori.
  - Halaman baca artikel dengan tipografi nyaman, gambar sampul, metadata SEO, dan share button.
- **CMS Editor (Sisi Admin):**
  - Rich-text editor (misal Tiptap atau Markdown editor) untuk menulis dan memformat artikel.
  - Unggah gambar sampul (cover image) dan gambar pendukung dalam artikel.
  - Pengaturan status artikel: *Draft*, *Published*, *Archived*.
  - Pengelolaan tag dan kategori artikel.

---

## 5. Modul Admin Dashboard

### Tujuan
Satu pintu bagi panitia untuk memantau pendaftar, memvalidasi bukti transaksi, dan memperbarui konten web.

### Sub-Fitur
- **Autentikasi & Proteksi Akses:**
  - Login khusus admin via Supabase Auth.
  - Proteksi rute menggunakan Next.js Middleware.
- **Manajemen Peserta & Pendaftaran:**
  - Tabel data peserta terfilter per cabang lomba.
  - Pratinjau berkas pendaftaran dan bukti transfer langsung di dashboard.
  - Aksi verifikasi: Set status *Pending*, *Verified*, atau *Rejected* (dengan catatan alasan penolakan).
  - Fitur ekspor data peserta ke format Excel/CSV.
- **Manajemen Konten Kompetisi:**
  - Update status buka/tutup pendaftaran cabang lomba.
  - Perbarui tanggal pelaksanaan, link buku panduan, atau narahubung.
- **Manajemen CMS Blog:**
  - Buat, edit, dan hapus artikel blog.
- **Statistik & Ringkasan Cepat:**
  - Jumlah total pendaftar per lomba.
  - Total pembayaran yang telah terverifikasi vs pending.

