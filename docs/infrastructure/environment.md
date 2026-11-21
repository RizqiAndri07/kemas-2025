# Environment Variables & Infrastructure

Dokumen ini mendefinisikan variabel lingkungan (*environment variables*) yang diperlukan untuk menjalankan aplikasi **Kemas Prasasti 2025** dengan **Supabase** dan **PostgreSQL**.

---

## 1. Daftar Variabel Lingkungan (`.env.local`)

Salin template berikut ke berkas `.env.local` pada environment development lokal Anda:

```bash
# ==========================================
# APP SETTINGS
# ==========================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ==========================================
# SUPABASE CONFIGURATION (Public / Client)
# ==========================================
# URL project Supabase Anda (misal: https://xyzcompany.supabase.co)
NEXT_PUBLIC_SUPABASE_URL="https://your-project-id.supabase.co"
# Anon public key untuk browser runtime
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ==========================================
# SUPABASE SERVER ROLE KEY (Server Runtime Only)
# ==========================================
# Service role key dengan hak akses bypass RLS untuk operasi administratif di server
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# ==========================================
# DATABASE & PRISMA ORM (PostgreSQL)
# ==========================================
# Connection URL ke PostgreSQL Supabase via connection pooler (Supavisor / PgBouncer, port 6543)
DATABASE_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# DIRECT_URL untuk koneksi langsung (port 5432) yang digunakan Prisma Migrate
DIRECT_URL="postgresql://postgres.[project-id]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# ==========================================
# STORAGE BUCKETS
# ==========================================
NEXT_PUBLIC_STORAGE_BUCKET_BLOG="blog-media"
NEXT_PUBLIC_STORAGE_BUCKET_REGISTRATION="registration-proofs"
NEXT_PUBLIC_STORAGE_BUCKET_ASSETS="competition-assets"
```

---

## 2. Keamanan & Best Practices

1. **Prinsip Least Privilege:**
   - Kredensial `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, dan `DIRECT_URL` **TIDAK BOLEH** diawali dengan prefiks `NEXT_PUBLIC_`. Hal ini memastikan kunci rahasia tidak pernah bocor ke bundle JavaScript browser.
2. **Git Ignore:**
   - File `.env`, `.env.local`, dan file kredensial rahasia telah dimasukkan ke `.gitignore`. Jangan pernah melakukan git commit pada file-file ini.
3. **Penyimpanan Berkas (Supabase Storage):**
   - Berkas pendaftaran peserta (bukti pembayaran dan identitas) diunggah ke bucket privat dengan aturan Storage RLS (Row Level Security) yang membatasi akses baca hanya untuk admin atau peserta pemilik berkas.
   - Aset gambar blog dan pamflet lomba diunggah ke bucket publik untuk rendering cepat via CDN Supabase.
