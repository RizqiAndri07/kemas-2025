# Spesifikasi Fitur: Autentikasi & Manajemen Pengguna (Supabase Auth)

Dokumen ini mendefinisikan rancangan teknis, arsitektur aliran data, hak akses (RBAC), serta spesifikasi implementasi modul **Autentikasi & User Management** untuk platform **Kemas Prasasti 2025**.

---

## 1. Latar Belakang & Kebijakan Sistem

1. **Penggunaan Supabase Auth:**
   - Seluruh mekanisme otentikasi identitas, session management berbasis secure HTTP-only cookies, dan token hashing dikelola oleh **Supabase Auth** melalui pustaka `@supabase/ssr`.
2. **Tidak Ada Fitur Registrasi Publik (*No Public Registration*):**
   - Platform Kemas Prasasti 2025 adalah sistem tertutup untuk kepanitiaan (Admin Panel & CMS).
   - Publik atau peserta lomba tidak memiliki akses registrasi akun mandiri.
   - Tidak ada rute `/register` atau form pendaftaran akun umum.
3. **Pendaftaran Pengguna Hanya oleh Superadmin (*Add User via Superadmin*):**
   - Penambahan akun baru (Admin, CMS Writer, atau sesama Superadmin) **hanya dapat dilakukan oleh pengguna dengan peran `SUPERADMIN`** melalui dashboard `/dashboard/users`.
   - Superadmin cukup memasukkan `username`, `email`, dan `role` (tanpa perlu menginput password awal manual).
   - Akun dibuat di database PostgreSQL `users` dengan status awal `unverified` dan akun dibuat di Supabase Auth (`email_confirm: false`).
   - Sistem men-generate token verifikasi aman dengan **masa kedaluwarsa 12 jam** yang disimpan di tabel `auth_tokens`.
   - Sistem mengirimkan email verifikasi ke alamat pengguna (via SMTP Mailpit untuk local dev dan SMTP provider untuk production).
   - Pengguna mengklik tautan verifikasi pada email (`/auth/verify?token=...`).
   - Setelah tautan diklik dan token tervalidasi (< 12 jam & belum pernah dipakai):
     - Status pengguna di PostgreSQL menjadi `verified` dan di Supabase Auth menjadi `email_confirm: true`.
     - Sistem otomatis men-generate password acak yang aman (*secure random password*) dan mengirimkan email konfirmasi akun aktif beserta informasi password acak tersebut.
     - Sekaligus, pengguna langsung diarahkan ke halaman antarmuka pembaruan password (`/auth/setup-password?token=...`) agar pengguna dapat memasukkan password baru sesuai keinginannya sendiri secara mandiri.
4. **Fitur Reset Password oleh Superadmin (*Superadmin Password Reset*):**
   - Superadmin memiliki tombol "Reset Password" pada tabel manajemen pengguna.
   - Sistem men-generate token reset password dengan masa berlaku **12 jam** dan mengirimkan email link reset password (`/auth/reset-password?token=...`) ke pengguna.
   - Pengguna mengakses halaman tersebut dan menetapkan password baru.
5. **Fitur Kirim Ulang Email (*Resend Verification Email*):**
   - Superadmin memiliki tombol "Kirim Ulang Email" untuk pengguna berstatus `unverified` atau jika link sebelumnya telah kedaluwarsa (> 12 jam).
   - Sistem membatalkan token lama dan menerbitkan token baru yang berlaku selama 12 jam ke depan.
6. **Proteksi Rute Menyeluruh (*Route Protection Middleware*):**
   - Seluruh rute di bawah `/dashboard/*` diproteksi secara ketat menggunakan Next.js Middleware.
   - Pengguna tanpa sesi aktif akan dialihkan (*redirect*) ke halaman `/login`.
   - Pengguna yang sudah login akan dialihkan langsung ke `/dashboard` jika membuka halaman `/login`.

---

## 2. Alur Pengguna (User Flow)

### A. Alur Login (Sign In Flow)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin / Panitia
    participant UI as Halaman Login (/login)
    participant Action as loginAction (Server Action)
    participant Supabase as Supabase Auth Server
    participant DB as PostgreSQL (usersTable)
    participant MW as Next.js Middleware

    Admin->>UI: Masukkan Email & Password
    UI->>Action: Kirim data login via Server Action
    Action->>Action: Validasi payload dengan loginSchema (Zod)
    Action->>Supabase: signInWithPassword({ email, password })
    alt Kredensial Salah / Tidak Valid
        Supabase-->>Action: Auth Error
        Action-->>UI: Return error "Email atau kata sandi tidak valid"
        UI-->>Admin: Tampilkan pesan error pada form
    else Kredensial Benar
        Supabase-->>Action: Session Token & User Object
        Action->>Action: Set auth cookies via @supabase/ssr
        Action->>DB: recordLastLogin(user.id)
        Action-->>UI: Return success
        UI->>MW: Navigasi / Redirect ke /dashboard
        MW-->>Admin: Render Dashboard Overview
    end
```

### B. Alur Tambah Pengguna oleh Superadmin (Add User Flow)
```mermaid
sequenceDiagram
    autonumber
    actor SA as Superadmin
    participant UI as Dialog Tambah Pengguna (/dashboard/users)
    participant Action as createUserAction (Server Action)
    participant SupabaseAdmin as Supabase Admin API (Service Role)
    participant DB as PostgreSQL (usersTable & authTokensTable)
    participant Mailer as Email Service (Mailpit / SMTP)

    SA->>UI: Isi Username, Email, dan Role (tanpa password manual)
    UI->>Action: Submit Form Tambah Pengguna
    Action->>Action: Verifikasi sesi pemanggil (Wajib Role SUPERADMIN)
    Action->>Action: Validasi payload dengan createUserSchema (Zod)
    Action->>DB: Cek duplikasi username & email
    alt Duplikasi Ditemukan
        DB-->>Action: Record ada
        Action-->>UI: Error "Username atau Email sudah terdaftar"
    else Tidak Ada Duplikasi
        Action->>SupabaseAdmin: auth.admin.createUser({ email, password: randomTempPassword, email_confirm: false })
        SupabaseAdmin-->>Action: Auth User Created (auth.users.id)
        Action->>DB: insert into usersTable (id, username, email, role, status='unverified')
        Action->>DB: createToken({ userId, type: 'VERIFICATION', expiresAt: now() + 12 jam })
        Action->>Mailer: sendVerificationEmail({ to: email, token, username })
        Mailer-->>Action: Email Terkirim (ke Mailpit / SMTP)
        Action-->>UI: Berhasil membuat akun pengguna & email verifikasi terkirim
        UI-->>SA: Tutup dialog, refresh daftar pengguna & notifikasi sukses
    end
```

### C. Alur Verifikasi Email & Set Password Baru oleh Pengguna
```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna Baru
    participant Email as Inbox Pengguna (Mailpit / Email Client)
    participant Web as Halaman Verifikasi (/auth/verify)
    participant Action as verifyAndSetupAction (Server Action)
    participant SupabaseAdmin as Supabase Admin API
    participant DB as PostgreSQL (usersTable & authTokensTable)
    participant Mailer as Email Service

    User->>Email: Buka email & klik "Verifikasi Akun Saya"
    Email->>Web: Navigasi ke /auth/verify?token={token}
    Web->>Action: Verifikasi token
    Action->>DB: findToken(token)
    alt Token Tidak Ditemukan / Kedaluwarsa (> 12 Jam) / Sudah Digunakan
        DB-->>Action: Invalid / Expired
        Action-->>Web: Tampilkan pesan error "Link verifikasi telah kedaluwarsa atau tidak valid"
    else Token Valid (< 12 Jam)
        Action->>DB: markTokenUsed(token)
        Action->>DB: updateUserStatus(userId, 'verified')
        Action->>SupabaseAdmin: auth.admin.updateUserById(userId, { email_confirm: true, password: newRandomPassword })
        Action->>Mailer: sendWelcomeWithRandomPasswordEmail({ to: email, randomPassword })
        Action-->>Web: Redirect ke /auth/setup-password?token={sessionToken/oneTimeToken}
        Web-->>User: Tampilkan formulir Update Kata Sandi Mandiri
        User->>Web: Masukkan Kata Sandi Baru pilihan pengguna
        Web->>Action: updatePasswordAction(newPassword)
        Action->>SupabaseAdmin: auth.admin.updateUserById(userId, { password: newPassword })
        Action-->>Web: Kata sandi berhasil diperbarui!
        Web-->>User: Redirect ke /login dengan pesan sukses
    end
```

### D. Alur Reset Password oleh Superadmin
```mermaid
sequenceDiagram
    autonumber
    actor SA as Superadmin
    participant UI as Tabel Pengguna (/dashboard/users)
    participant Action as sendResetPasswordAction (Server Action)
    participant DB as PostgreSQL (authTokensTable)
    participant Mailer as Email Service (Mailpit / SMTP)
    actor User as Pengguna Target
    participant ResetPage as Halaman Reset Password (/auth/reset-password)

    SA->>UI: Klik aksi "Reset Password" pada dropdown baris user
    UI->>Action: trigger sendResetPasswordAction(userId)
    Action->>Action: Verifikasi sesi pemanggil (Wajib SUPERADMIN)
    Action->>DB: createToken({ userId, type: 'PASSWORD_RESET', expiresAt: now() + 12 jam })
    Action->>Mailer: sendResetPasswordEmail({ to: user.email, token })
    Mailer-->>Action: Email terkirim
    Action-->>UI: Sukses mengirimkan email reset password
    UI-->>SA: Notifikasi sukses
    User->>ResetPage: Klik link di email: /auth/reset-password?token={token}
    ResetPage->>ResetPage: Validasi token (< 12 jam)
    User->>ResetPage: Masukkan Kata Sandi Baru
    ResetPage->>Action: submitNewPasswordAction({ token, newPassword })
    Action->>SupabaseAdmin: auth.admin.updateUserById(userId, { password: newPassword })
    Action->>DB: markTokenUsed(token)
    Action-->>ResetPage: Password berhasil direset!
    ResetPage-->>User: Redirect ke /login
```

### E. Alur Kirim Ulang Email Verifikasi oleh Superadmin (Resend Email)
```mermaid
sequenceDiagram
    autonumber
    actor SA as Superadmin
    participant UI as Tabel Pengguna (/dashboard/users)
    participant Action as resendVerificationEmailAction (Server Action)
    participant DB as PostgreSQL (authTokensTable)
    participant Mailer as Email Service (Mailpit / SMTP)

    SA->>UI: Klik "Kirim Ulang Email" pada pengguna unverified
    UI->>Action: trigger resendVerificationEmailAction(userId)
    Action->>Action: Verifikasi hak akses SUPERADMIN
    Action->>DB: invalidateOldTokens(userId, 'VERIFICATION')
    Action->>DB: createToken({ userId, type: 'VERIFICATION', expiresAt: now() + 12 jam })
    Action->>Mailer: sendVerificationEmail({ to: user.email, token, username })
    Mailer-->>Action: Email terkirim
    Action-->>UI: Notifikasi "Email verifikasi berhasil dikirim ulang!"
    UI-->>SA: Toast sukses
```

### F. Alur Keluar Akun (Logout Flow)
```mermaid
sequenceDiagram
    autonumber
    actor Admin as Panitia / Admin
    participant Header as DashboardHeader (Dropdown Profile)
    participant Action as logoutAction (Server Action)
    participant Supabase as Supabase Auth
    participant Browser as Browser Client

    Admin->>Header: Klik "Keluar (Logout)"
    Header->>Action: Trigger logoutAction()
    Action->>Supabase: supabase.auth.signOut()
    Action->>Action: Hapus session cookies
    Action-->>Browser: Redirect ke /login
```

---

## 3. Struktur Hak Akses (Role-Based Access Control)

| Role | Login ke Dashboard | Akses CMS Blog | Verifikasi Lomba & Registrasi | Kelola Pengguna (Add/Edit/Delete User) |
| :--- | :---: | :---: | :---: | :---: |
| **SUPERADMIN** | ✅ Ya | ✅ Ya | ✅ Ya | ✅ **Ya (Eksklusif)** |
| **ADMIN** | ✅ Ya | ✅ Ya | ✅ Ya | ❌ Tidak (Read-only list atau hidden) |
| **CMS_WRITER** | ✅ Ya | ✅ Ya | ❌ Tidak | ❌ Tidak |

---

## 4. Arsitektur Domain-Driven Design (DDD) untuk Bounded Context `auth`

Modul `auth` dipetakan ke dalam 4 lapisan DDD:

```text
modules/auth/
├── domain/
│   ├── role.enum.ts              # Enum peran: SUPERADMIN, ADMIN, CMS_WRITER
│   ├── user-status.enum.ts       # Enum status: verified, unverified
│   ├── token-type.enum.ts        # Enum tipe token: VERIFICATION, PASSWORD_RESET
│   ├── user.entity.ts            # Tipe entitas User dan SessionUser
│   ├── auth.schema.ts            # Zod schema: loginSchema, createUserSchema, updatePasswordSchema, resetPasswordSchema
│   └── user.schema.ts            # Zod schema untuk profil dan form update
├── application/
│   ├── auth.actions.ts           # Server Actions: loginAction, logoutAction, verifyTokenAction, updatePasswordAction
│   └── user.actions.ts           # Server Actions: createUserAction, updateUserAction, deleteUserAction, resendEmailAction, triggerResetPasswordAction
├── infrastructure/
│   ├── user.table.ts             # Skema Drizzle ORM PostgreSQL (`usersTable`)
│   ├── auth-token.table.ts       # Skema Drizzle ORM PostgreSQL (`authTokensTable` dengan expires_at 12 jam)
│   ├── user.repository.ts        # Query database PostgreSQL via Drizzle
│   ├── auth-token.repository.ts  # CRUD token verifikasi & reset password
│   └── email.service.ts          # Layanan pengiriman email Nodemailer (Mailpit / SMTP)
└── presentation/
    └── components/
        ├── login-form.tsx        # Form Login responsif dengan Shadcn UI
        ├── user-dialog.tsx       # Dialog Tambah Pengguna (Username, Email, Role tanpa password)
        ├── user-table.tsx        # Tabel pengguna dengan aksi Reset Password & Kirim Ulang Email
        ├── verify-view.tsx       # Komponen verifikasi token & pesan status
        └── setup-password-form.tsx # Form update password mandiri sesuai input user
```

---

## 5. Rincian Skema & Validasi Data (Zod)

### A. Skema Login (`auth.schema.ts`)
```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  password: z
    .string()
    .min(6, "Kata sandi minimal 6 karakter"),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

### B. Skema Tambah Pengguna Baru oleh Superadmin (Tanpa Password Manual)
```typescript
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username minimal 3 karakter")
    .max(50, "Username maksimal 50 karakter")
    .regex(/^[a-zA-Z0-9_.-]+$/, {
      message: "Username hanya boleh huruf, angka, titik, underscore, dan strip",
    }),
  email: z
    .string()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid"),
  role: z.enum(["SUPERADMIN", "ADMIN", "CMS_WRITER"], {
    message: "Pilih peran pengguna yang valid",
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
```

### C. Skema Setel / Update Kata Sandi oleh Pengguna (`updatePasswordSchema`)
```typescript
export const setupPasswordSchema = z
  .object({
    token: z.string().min(1, "Token verifikasi wajib disertakan"),
    newPassword: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter")
      .regex(/[A-Z]/, "Kata sandi wajib memuat minimal 1 huruf besar")
      .regex(/[0-9]/, "Kata sandi wajib memuat minimal 1 angka"),
    confirmPassword: z.string().min(1, "Konfirmasi kata sandi wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export type SetupPasswordInput = z.infer<typeof setupPasswordSchema>;
```

---

## 6. Rate Limiting & Proteksi Brute Force Login

Sesuai aturan keamanan:
- **Ketentuan Percobaan:** Maksimal **3 kali percobaan login gagal dalam rentang waktu 1 menit**.
- **Konsekuensi Pelanggaran:** Jika gagal 3 kali berturut-turut dalam 1 menit, akun/identifier akan **dikunci (lockout) selama 10 menit**.
- **Mekanisme Penyimpanan:** Disimpan di tabel database `login_attempts`:
  - `identifier`: email atau IP pengguna.
  - `attempts`: penghitung percobaan gagal.
  - `last_attempt_at`: timestamp percobaan terakhir.
  - `locked_until`: timestamp hingga waktu lockout selesai (10 menit sejak percobaan gagal ke-3).
- **Alur Validasi Rate Limit:**
  1. Sebelum memproses `signInWithPassword`, periksa apakah `locked_until` masih berlaku (`locked_until > now()`). Jika ya, tolak login dan beri tahu sisa menit yang harus ditunggu.
  2. Jika percobaan terakhir sudah lebih dari 1 menit yang lalu dan belum pernah ter-lock, reset counter `attempts = 0`.
  3. Jika percobaan login gagal, increment `attempts`. Jika `attempts >= 3`, set `locked_until = now() + 10 minutes`.
  4. Jika login berhasil, bersihkan (*clear*) data percobaan untuk identifier tersebut.

---

## 7. Desain Antarmuka Login (`app/login/page.tsx`)

- **Komponen Shadcn UI yang Digunakan:**
  - `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
  - `Input` & `Label`
  - `Button` dengan state loading spinner
  - Visual branding khas Kemas Prasasti 2025 (warna primary brand, logo maskot, dan background subtle gradient).
- **Fitur Tambahan:**
  - Toggle show/hide password (ikon Eye / EyeOff).
  - Pesan error inline jika otentikasi gagal atau akun terkena lockout 10 menit.
  - Redirect otomatis ke rute tujuan semula (`?next=/dashboard/...`) setelah berhasil login.

---

## 8. Middleware Session Guard & Proteksi Controller Server Actions

1. **Middleware Guard (`middleware.ts`):**
   - Middleware berjalan di edge runtime untuk menyinkronkan token via `@supabase/ssr` (`updateSession`).
   - Jika rute `/dashboard/*` diakses tanpa sesi aktif: redirect ke `/login?next=${pathname}`.
   - Jika rute `/login` diakses oleh pengguna yang sudah memiliki sesi aktif: redirect ke `/dashboard`.
   - Mempertahankan penanganan URL usang / legacy (HTTP 410 Gone) yang sudah ada sebelumnya.

2. **Server Action Controller Protection (Defense in Depth):**
   - Seluruh Server Action controller untuk mutasi data di dashboard (Create, Update, Delete pada `user.actions.ts`, `blog.actions.ts`, `competition.actions.ts`, `registration.actions.ts`) **wajib memanggil guard `requireAuthUser()`** di awal eksekusi.
   - Jika sesi tidak valid, aksi akan langsung mengembalikan error `{ success: false, error: "Tidak memiliki hak akses / sesi telah berakhir" }`.

---

## 9. Inisialisasi Akun Superadmin Awal (First-Time Seeding)

Karena fitur registrasi publik tidak tersedia, akun Superadmin pertama akan disediakan melalui skrip seeder administratif:
- Perintah: `pnpm db:seed-superadmin` atau dieksekusi sekali melalui script `scripts/seed-superadmin.ts`.
- Membaca kredensial default dari `.env` (misal `SUPERADMIN_EMAIL` & `SUPERADMIN_PASSWORD`).
- Membuat entitas di `auth.users` Supabase dan tabel PostgreSQL `users` dengan peran `SUPERADMIN` dan status `verified`.
- Dengan ini, tim developer atau pemilik sistem dapat langsung login pertama kali dan mengelola sistem.

---

## 10. Status & Tahapan Pekerjaan

- [x] **Tahap 1: Analisis Kebutuhan & Dokumen Perencanaan** (Dokumen `docs/feateures/auth-feature.md` selesai dirancang)
- [x] **Tahap 2: Konfirmasi & Persetujuan Pengguna** (Disetujui: Login, Middleware Guard, Controller Protection, Rate Limit 3x/1menit -> 10 menit lockout)
- [x] **Tahap 3: Implementasi Skema Rate Limit & Domain Zod** (`login_attempts` table, `auth.schema.ts`, migrasi `0004_absurd_starjammers.sql`)
- [x] **Tahap 4: Implementasi Lapisan Infrastruktur & Service** (`login-attempt.repository.ts`, `lib/supabase/server.ts`)
- [x] **Tahap 5: Implementasi Lapisan Application & Server Actions** (`auth.actions.ts`, `auth.guard.ts` `requireAuthUser` & `requireSuperadmin`, integrasi `user.actions.ts` & `blog.actions.ts`)
- [x] **Tahap 6: Implementasi Middleware Guard** (`middleware.ts` berbasis `@supabase/ssr` untuk proteksi `/dashboard/*`, redirect `/login`, dan legacy 410 URLs)
- [x] **Tahap 7: Implementasi Halaman Login UI & Perbaruan User Dialog** (`app/(auth)/login/page.tsx`, `login-form.tsx`, `user-dialog.tsx` dengan password field, `DashboardHeader.tsx` profil dinamis & logout)
- [x] **Tahap 8: Skrip Seeder Superadmin & Verifikasi Menyeluruh** (`pnpm db:seed-superadmin`, pengujian rate limiting 100% lulus, `next build` berhasil)
- [x] **Tahap 9: Perencanaan Fitur Email Verification, Password Setup & Reset Password Superadmin** (Konfigurasi `.env.example`, Mailpit dev SMTP, skema `auth_tokens` 12 jam expiry, proposal disajikan untuk persetujuan pengguna)
- [x] **Tahap 10: Implementasi Skema Tabel `auth_tokens` & Migrasi PostgreSQL** (`auth-token.table.ts`, `auth_token_type` enum, DDL applied & verified)
- [x] **Tahap 11: Implementasi Modul Email Service (`email.service.ts` + Nodemailer + Mailpit)** (Template responsif untuk Verifikasi Akun, Password Acak, dan Reset Password)
- [x] **Tahap 12: Implementasi Server Actions & Alur Verifikasi (12 Jam Expiration, Auto-generate Password, Resend, Reset)** (`user.actions.ts`, `auth.actions.ts`, `auth-token.repository.ts`, pengujian alur 100% lulus)
- [x] **Tahap 13: Pembaruan Antarmuka UI (User Dialog tanpa password, User Table aksi Reset & Resend, Halaman `/auth/verify`, `/auth/setup-password`, `/auth/reset-password`)** (`next build` 100% sukses)
