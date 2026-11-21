# Design System & UI Guidelines

Panduan gaya desain, tipografi, warna, dan komponen antarmuka pengguna untuk **Kemas Prasasti 2025**.

---

## 1. Fondasi UI & Styling

- **Framework:** Tailwind CSS v4
- **Komponen Dasar:** Radix UI / Shadcn UI
- **Ikonografi:** Lucide React
- **Animasi:** Motion (`motion/react` / Framer Motion) dan CSS Transitions

---

## 2. Prinsip Desain

1. **Energetik & Beridentitas:**
   - Karena "Kemas Prasasti" adalah perhelatan besar pemuda/mahasiswa dengan ragam kompetisi (olahraga, seni, e-sports), desain harus terasa modern, dinamis, dan memiliki kontras yang tegas.
2. **Mobile-First & Responsif:**
   - Mayoritas peserta mendaftar dan melihat pengumuman melalui smartphone. Setiap layout dan tabel harus diuji kenyamanannya pada resolusi mobile (< 640px).
3. **Accessibility (A11y):**
   - Label form harus eksplisit.
   - Kontras warna antara teks dan latar belakang memenuhi standar WCAG AA.
   - State interaktif (`hover`, `focus-visible`, `active`, `disabled`) harus terlihat jelas.

---

## 3. Struktur Komponen UI

- **`components/ui/`**: Komponen atomik murni tanpa keterikatan logic bisnis (Button, Card, Dialog, Input, Dropdown, Table, Carousel).
- **`components/features/`**: Komponen gabungan yang membawa konteks bisnis spesifik (misal: `CompetitionCard`, `RegistrationSteps`, `BlogCard`).
- **`components/layout/`**: Elemen layout utama seperti `Navbar`, `Footer`, `SidebarDashboard`, dan `AdminHeader`.

