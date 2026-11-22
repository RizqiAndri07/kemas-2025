# Design System & UI Guidelines

Panduan gaya desain, tipografi, warna berbasis variabel CSS (*semantic tokens*), dan komponen antarmuka pengguna untuk **Kemas Prasasti 2025**.

---

## 1. Fondasi UI & Styling

- **Framework:** Tailwind CSS v4
- **Komponen Dasar:** Shadcn UI (berbasis `@base-ui/react` & Radix UI)
- **Ikonografi:** Lucide React
- **Animasi:** Motion (`motion/react` / Framer Motion) dan CSS Transitions
- **Rich Text / Kanvas Editor:** BlockNote (`@blocknote/core`, `@blocknote/react`, `@blocknote/shadcn`)

---

## 2. Prinsip Desain

1. **Energetik & Beridentitas:**
   - Desain modern, dinamis, dan memiliki kontras yang tegas untuk merepresentasikan semangat pemuda, mahasiswa, dan kompetisi akbar Kemas Prasasti.
2. **Mobile-First & Responsif:**
   - Semua alur pendaftaran, katalog kompetisi, dan kanvas editor diuji responsivitasnya dari perangkat seluler (< 640px) hingga layar monitor lebar.
3. **Variable-Driven & Dynamic Theming (Wajib):**
   - **Dilarang keras menggunakan utility warna statis/hardcoded** seperti `bg-white`, `bg-black`, `text-black`, `text-white`, atau palette numerik tetap (`bg-slate-900`) pada komponen aplikasi dan dashboard.
   - Semua warna wajib terikat pada *semantic CSS variables* (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--border`, dll.) agar ketika *Theme Mode* (Light/Dark/System) diaktifkan, seluruh elemen antarmuka berganti secara harmonis tanpa *visual glitch*.
4. **Accessibility (A11y):**
   - Rasio kontras teks dan latar belakang memenuhi standar WCAG AA.
   - Status interaktif (`hover`, `focus-visible`, `active`, `disabled`) harus terlihat jelas dan terukur.

---

## 3. Sistem Warna Berbasis Variabel CSS (Semantic Color System)

Sistem warna dikonfigurasi secara deklaratif di `app/globals.css` menggunakan format **OKLCH** untuk akurasi persepsi warna tinggi dan konsistensi lintas mode.

### A. Tabel Semantic Tokens & Variabel CSS

| Semantic Token | Variabel CSS | Mode Terang (`:root`) | Mode Gelap (`.dark`) | Peruntukan Penggunaan |
| :--- | :--- | :--- | :--- | :--- |
| `bg-background` | `--background` | `oklch(1 0 0)` (Putih) | `oklch(0.145 0 0)` (Gelap) | Latar belakang dasar halaman/layar utama |
| `text-foreground` | `--foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | Warna teks utama |
| `bg-card` / `text-card-foreground` | `--card`, `--card-foreground` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Kartu konten, kontainer elevate, panel data |
| `bg-popover` / `text-popover-foreground` | `--popover`, `--popover-foreground` | `oklch(1 0 0)` | `oklch(0.205 0 0)` | Dropdown menu, popover, tooltip, slash menu |
| `bg-primary` / `text-primary-foreground` | `--primary`, `--primary-foreground` | `oklch(0.205 0 0)` | `oklch(0.922 0 0)` | Tombol aksi utama, brand accent, indikator aktif |
| `bg-secondary` / `text-secondary-foreground` | `--secondary`, `--secondary-foreground` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Tombol sekunder, badge netral |
| `bg-muted` / `text-muted-foreground` | `--muted`, `--muted-foreground` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Latar belakang subtle, caption, label non-aktif |
| `bg-accent` / `text-accent-foreground` | `--accent`, `--accent-foreground` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | Efek hover baris tabel, item menu aktif |
| `bg-destructive` / `text-destructive` | `--destructive` | `oklch(0.577 0.245 27.325)` | `oklch(0.704 0.191 22.216)` | Tombol hapus, pesan error, alert bahaya |
| `border-border` | `--border` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 10%)` | Garis pemisah, border kartu dan tabel |
| `border-input` | `--input` | `oklch(0.922 0 0)` | `oklch(1 0 0 / 15%)` | Border form field |
| `ring-ring` | `--ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | Focus ring accessibility |

### B. Variabel Sidebar Dashboard (`--sidebar-*`)
- `--sidebar`: Latar belakang sidebar navigasi admin
- `--sidebar-foreground`: Warna teks menu sidebar
- `--sidebar-primary` & `--sidebar-primary-foreground`: Menu sidebar aktif / terfokus
- `--sidebar-accent`: Hover background item sidebar
- `--sidebar-border`: Garis pembatas vertikal sidebar

---

## 4. Sistem Komponen Admin Dashboard (Shadcn UI First)

Seluruh komponen pada area dashboard wajib mengambil komponen dari **Shadcn UI** untuk menjaga konsistensi dan modularitas:

```bash
pnpm dlx shadcn@latest add {component}
```

### A. Inventaris Komponen Reusable Dashboard (`components/dashboard/`)

| Komponen Reusable | Primitives Shadcn UI | Peran & Penggunaan Berbasis Variabel |
| :--- | :--- | :--- |
| **`DashboardSidebar`** | `Sidebar`, `SidebarMenu`, `SidebarMenuButton` | Navigasi menu utama yang otomatis beradaptasi dengan `--sidebar` & `--sidebar-accent`. |
| **`DashboardHeader`** | `DropdownMenu`, `Avatar`, `Button`, `Separator` | Header sticky dengan `bg-card/80` dan `border-border`, menu profil, role badge, dan trigger sidebar. |
| **`StatCard`** | `Card`, `CardHeader`, `CardTitle`, `CardContent` | Metrik ringkasan menggunakan `bg-card`, `text-foreground`, `bg-primary/10`, dan tren berbasis `text-primary` / `text-destructive`. |
| **`StatusBadge`** | `Badge` | Pill status adaptif berbasis variabel: <br>- Aktif/Valid: `border-primary/20 bg-primary/10 text-primary` <br>- Nonaktif/Batal: `border-destructive/20 bg-destructive/10 text-destructive` |
| **`PageHeader`** | Header Slot & Action Buttons | Judul halaman (`text-foreground`) dan deskripsi (`text-muted-foreground`) dengan garis pembatas `border-border`. |
| **`EmptyState`** | `Card`, `Button`, Lucide Icons | Tampilan state kosong dengan `bg-muted/20`, border putus-putus `border-border`, dan ikon `text-muted-foreground`. |

### B. Panduan Penggunaan Shadcn `Button` & Integrasi Navigasi `Link`

1. **Penggunaan Komponen `Button` Shadcn UI:**
   - Gunakan komponen `Button` dari Shadcn UI (`import { Button } from "@/components/ui/button"`) untuk seluruh elemen interaktif yang dirasa pas/tepat menggunakan tombol.
   - Manfaatkan prop `variant` (`default`, `outline`, `secondary`, `ghost`, `destructive`) dan `size` (`default`, `sm`, `xs`, `lg`, `icon`) agar hierarki visual tetap konsisten.

2. **Pola Navigasi Call-to-Action (`<Link>` Membungkus `<Button>`):**
   - Jika suatu aksi fungsionalnya merupakan navigasi perpindahan halaman (`next/link`), namun secara desain dan visual lebih masuk akal tampil sebagai tombol (misal: tombol aksi utama di `PageHeader`, tombol `+ Tulis Artikel Baru`, tombol aksi pada `EmptyState`, atau tombol kembali), **wajib membungkus komponen `<Button>` di dalam elemen `<Link>`**:
     ```tsx
     import Link from "next/link";
     import { Button } from "@/components/ui/button";
     import { Plus } from "lucide-react";

     // Contoh Aksi Utama Navigasi (Call-to-Action)
     <Link href="/dashboard/blog/create">
       <Button size="sm">
         <Plus className="mr-1.5 h-4 w-4" />
         Tulis Artikel Baru
       </Button>
     </Link>
     ```

3. **Kapan Menggunakan `<Link>` Murni vs `<Link>` Membungkus `<Button>`:**
   - **`<Link>` Murni:** Digunakan untuk tautan teks biasa di dalam paragraf, judul artikel yang dapat diklik pada tabel data, breadcrumb teks, atau link navigasi footer.
   - **`<Link>` Membungkus `<Button>`:** Digunakan untuk seluruh aksi navigasi yang memerlukan kontainer tombol yang tegas, tombol Call to Action (CTA) primer/sekunder, tombol pintasan di header, dan tombol aksi pada state kosong (*empty state*).

---

## 5. Integrasi Tema & Adaptasi Kanvas BlockNote

### Masalah Kanvas Gelap Statis Sebelumnya
Sebelumnya, kanvas editor BlockNote merender kotak hitam `#1f1f1f` karena dependensi internal `@blocknote/react` mendeteksi `prefers-color-scheme: dark` dari browser OS dan menimpa background dengan hex statis, tidak selaras dengan tema aplikasi.

### Solusi Sinkronisasi Tema Dinamis
Kanvas BlockNote kini telah disinkronkan 100% menggunakan CSS Variables di [globals.css](file:///home/kinggu/Documents/Project/kemas-2025/app/globals.css) dan hook reaktif di [blocknote-editor.tsx](file:///home/kinggu/Documents/Project/kemas-2025/modules/blog/presentation/components/blocknote-editor.tsx):

1. **CSS Variable Binding:**
   - `.bn-container`, `.bn-root`, dan `.bn-editor` diatur ke `background-color: transparent !important`.
   - Warna teks artikel dikunci ke `color: var(--foreground) !important`.
   - Toolbars, select, dan slash command menus menggunakan `var(--popover)`, `var(--popover-foreground)`, dan `var(--border)`.
   - Side menu handles (`::` dan `+`) menggunakan `var(--muted-foreground)` dan hover `var(--foreground)`.
2. **Reaktif terhadap Perubahan Class `.dark`:**
   Komponen `BlockNoteEditor` menyematkan `MutationObserver` pada elemen `<html>` untuk mendeteksi penambahan/penghapusan kelas `.dark`. Ketika mode tema berubah, state internal editor diperbarui secara seketika.
3. **Hasil:**
   - Pada mode terang: Kanvas editor menyatu bersih dengan latar halaman putih `var(--background)` dan teks hitam lembut `var(--foreground)`.
   - Pada mode gelap: Kanvas editor otomatis menyatu dengan latar gelap `var(--background)` dan teks terang `var(--foreground)`. Tidak ada kotak hitam/putih terisolasi.

---

## 6. Hasil Audit Komponen Dashboard

Berikut adalah verifikasi seluruh komponen pada dashboard terhadap penggunaan variabel CSS:

- [x] **`app/(dashboard)/layout.tsx`**: Menggunakan `bg-background text-foreground`, `SidebarInset` adaptif.
- [x] **`components/dashboard/DashboardHeader.tsx`**: Latar `bg-card/80`, pemisah `border-border`, avatar `bg-primary/10 text-primary`, menu profil `text-destructive`.
- [x] **`components/dashboard/DashboardSidebar.tsx`**: Menggunakan token resmi `bg-sidebar`, `text-sidebar-foreground`, `bg-primary text-primary-foreground`.
- [x] **`components/dashboard/StatCard.tsx`**: Bebas dari warna hardcoded `emerald/rose`; beralih penuh ke `text-primary` dan `text-destructive`.
- [x] **`components/dashboard/StatusBadge.tsx`**: Menggunakan `border-primary/20 bg-primary/10 text-primary` dan `border-destructive/20 bg-destructive/10 text-destructive`.
- [x] **`modules/blog/presentation/components/blog-form.tsx`**: Menggunakan `bg-background`, `border-border/60`, auto-expanding title `text-foreground`, banner alert `border-destructive/40 bg-destructive/10 text-destructive`.
- [x] **`modules/blog/presentation/components/blocknote-editor.tsx`**: Kanvas transparan adaptif terhadap `--background` dan `--foreground`.
