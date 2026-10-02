# COP-S (Cops On Supply) - User Guidebook

Selamat datang di sistem manajemen **COP-S (Cops On Supply)**. Dokumen ini adalah panduan lengkap cara menggunakan *Admin Dashboard* untuk mengelola operasional server COP-S Anda.

---

## 1. Login Admin
- Akses URL: `/login` (misal: `http://localhost:3000/login`)
- Username default: `admin` (Dapat diatur melalui script database atau JWT config).
- Password default: Sesuai konfigurasi env atau database awal (`password` / `admin`).

---

## 2. Navigasi Sidebar (Admin Dashboard)
Dashboard memiliki menu navigasi di sebelah kiri (atau di bawah/hamburger pada versi mobile):
- **Overview (Dashboard)**: Melihat statistik harian, ringkasan kehadiran, dan info cepat.
- **Data Personil**: Mengelola Roster (Anggota) dan Jabatan/Pangkat.
- **Divisi & Unit**: Mengelola departemen atau divisi khusus (misal: SWAT, Traffic, dll).
- **Absensi & Log**: Memeriksa riwayat absensi personil (*clock-in / clock-out*) dan kalkulasi jam bertugas.
- **Harga & Kontrak**: Mengelola MOU dengan server partner (Klien) dan *Pricing Tiers* (Paket Langganan).
- **Script & Assets**: Etalase jualan aset digital (Script, EUP, Kendaraan, MLO).
- **Rating & Pesan**: Mengelola ulasan (Reviews) dari klien dan menampilkannya di halaman utama.

---

## 3. Manajemen Personil (Roster)
**Tujuan**: Menambah anggota polisi baru atau mengubah pangkat dan status mereka.
1. Masuk ke menu **Data Personil**.
2. Klik tombol **+ Tambah Personil**.
3. Isi kolom: Nama Lengkap, Pangkat, Callsign (opsional), Divisi, dan Jenis Kelamin.
4. Tentukan **Status**:
   - `Active`: Aktif di COP-S (Namun tidak sedang bertugas).
   - `On-Duty`: Sedang dalam masa sewa/patroli.
   - `Standby`: Bersiap untuk panggilan darurat.
   - `Inactive`: Sedang cuti atau pensiun.
5. Klik **Simpan**. Data akan otomatis tampil di Halaman Utama (Roster Explorer).

---

## 4. Manajemen Absensi (Kehadiran)
**Tujuan**: Mencatat total jam bermain (roleplay) dari para personil untuk keperluan internal atau KPI (Key Performance Indicator).
1. Masuk ke menu **Absensi & Log**.
2. Personil (lewat link publik `/absensi` tanpa login) dapat menekan tombol **Clock In** saat mulai bertugas, dan **Clock Out** saat selesai.
3. Di halaman Admin, Anda dapat melihat riwayat absensi tersebut.
4. Anda juga bisa menekan tombol **+ Input Manual** jika ada personil yang lupa absen melalui sistem.

---

## 5. Manajemen Kemitraan (Kontrak & Paket Harga)
**Tujuan**: Mendata server roleplay mana saja yang sedang menyewa jasa COP-S.

**A. Membuat Paket Harga**
1. Ke menu **Harga & Kontrak**, fokus ke bagian "Paket Harga (Langganan)".
2. Klik **+ Tambah Paket**.
3. Isi: Nama Paket, Harga (Angka), Periode Penagihan (misal: /Minggu, /Bulan), dan fitur-fitur yang didapatkan.
4. Jika ingin disorot, centang **Tandai sebagai Populer (POPULAR)**.

**B. Membuat Kontrak Baru (MOU)**
1. Ke menu **Harga & Kontrak**, fokus ke bagian "Kontrak MOU (Partner)".
2. Klik **+ Tambah Kontrak**.
3. Isi: Nama Server (Klien), Detail (opsional), Jumlah Personil yang disewa.
4. Tentukan **Status Kontrak**: `Active` (Aktif), `Pending` (Tertunda), `Expired` (Habis Masa Berlaku).
5. Nama Server dengan kontrak "Active" akan muncul di fitur **Marquee Berjalan** pada Halaman Utama.

---

## 6. Manajemen Script & Assets
**Tujuan**: Menambahkan produk jualan selain penyewaan personil (misal MDT Custom).
1. Ke menu **Script & Assets**.
2. Klik **+ Tambah Script/Asset**.
3. Isi detail produk: Judul, Harga, Deskripsi, Kategori, URL Video Youtube (Opsional).
4. Masukkan **URL Foto** (Bisa lebih dari 1 foto, pisahkan setiap URL menggunakan Enter / Baris Baru). URL bisa didapat dari link Discord/Imgur.
5. Klik Simpan. Produk akan tampil pada bagian **Products** di Landing Page lengkap dengan Image Carousel!

---

## 7. Manajemen Rating & Pesan (Review Klien)
**Tujuan**: Membaca masukkan klien dan menampilkan testimoni terbaik ke halaman depan.
1. Klien (umum) dapat mengisi *Feedback Form* (Bintang & Pesan) di bagian paling bawah Halaman Utama.
2. Form yang dikirim akan otomatis berstatus **Menunggu Persetujuan** di database.
3. Admin masuk ke menu **Rating & Pesan**.
4. Di sini Anda dapat membaca seluruh ulasan yang masuk.
5. Klik tombol *Toggle* **Terbitkan** (Ikon Ceklis/Silang) pada baris ulasan untuk menampilkan atau menyembunyikan ulasan tersebut dari Halaman Utama.
6. Anda juga dapat Mengubah (Edit) pesan ulasan jika mengandung kata kotor, atau menghapusnya secara permanen dengan tombol **Tong Sampah**.

---

## Catatan Penting
- Semua perubahan yang berhasil disimpan (Tambah, Edit, Hapus) akan memunculkan *Notification Box (Toast)* di pojok kanan bawah layar.
- Pastikan memasukkan URL gambar yang valid (akhiran `.png`, `.jpg`, `.webp`) pada bagian Asset agar foto dapat dimuat oleh Next.js.
- Jika ada kendala, hubungi Developer Web Anda. Selamat Mengelola COP-S!
