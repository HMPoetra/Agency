# COP-S (Cops On Supply)

COP-S (Cops On Supply) adalah agensi penyedia personil kepolisian elit dan aset digital untuk server roleplay FiveM. Kami mengatasi masalah roleplay yang timpang melalui SOP ketat, patroli 24/7, serta unit taktis khusus. Platform ini dilengkapi dashboard admin canggih untuk mengelola roster, kontrak MOU, absensi, hingga rating kepuasan klien.

## 🌟 Fitur Utama

### 1. Landing Page Dinamis
- **Hero & Statistik**: Menampilkan jumlah personil aktif, server partner, dan total jam terbang roleplay (terkalkulasi otomatis dari database).
- **Roster Explorer**: Mesin pencari personil berdasarkan divisi, pangkat, atau nama dengan UI/UX ala intelijen.
- **Marquee Kontrak**: Menampilkan logo server partner secara interaktif.
- **Katalog Aset & Harga**: Daftar paket langganan personil serta skrip/aset custom (MDT, EUP, Vehicle Handling).
- **Review Inbox**: Formulir interaktif bagi klien untuk mengirimkan rating (bintang) dan pesan.

### 2. Admin Dashboard (CMS)
- **Personil & Divisi**: Manajemen penuh data anggota (Pangkat, Callsign, Status, Divisi).
- **Absensi Terintegrasi**: Sistem *clock-in/clock-out* otomatis serta input jam manual untuk menghitung jam terbang anggota.
- **Kemitraan (Kontrak & Harga)**: Mengelola server klien yang menyewa jasa COP-S beserta penetapan harga per tier.
- **Toko Aset (Script & Assets)**: Menambahkan skrip/aset dengan dukungan multi-foto (Carousel) dan link video.
- **Manajemen Ulasan**: Mengontrol testimoni mana yang ditayangkan ke halaman utama.

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router) / React 19
- **Styling**: Tailwind CSS v4, Framer Motion (Animations), Lucide (Icons)
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Notifications**: Sonner (Toasts)

## 🚀 Cara Menjalankan (Local Development)

1. Clone repositori ini.
2. Install semua dependencies:
   ```bash
   npm install
   ```
3. Buat file `.env` di *root directory* dan masukkan *Connection String* Neon PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://user:password@endpoint.neon.tech/dbname?sslmode=require"
   JWT_SECRET="rahasia-token-anda"
   ```
4. Setup Database (Jalankan migrasi tabel):
   ```bash
   npm run db:setup
   ```
5. Jalankan server *development*:
   ```bash
   npm run dev
   ```
6. Buka `http://localhost:3000` di browser Anda. (Akses Admin: `http://localhost:3000/admin` dengan default username `admin`).
