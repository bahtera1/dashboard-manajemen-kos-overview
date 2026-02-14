# Manajemen Kosan API

Backend API untuk aplikasi Manajemen Kosan, dibangun menggunakan Laravel 11.
Aplikasi ini menangani data Master (Kamar, Penghuni), Transaksi Keuangan (Pemasukan/Pengeluaran), Tagihan (Invoice), dan Laporan.

## Requirements
- PHP 8.2+
- Composer
- MySQL / MariaDB

## Instalasi

1. Clone repository ini.
2. Install dependencies:
   ```bash
   composer install
   ```
3. Copy file `.env.example` menjadi `.env` dan setting database:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` sesuaikan dengan DB lokal Anda.
4. Generate App Key:
   ```bash
   php artisan key:generate
   ```

## Migrasi & Seeding Data Dummy

Untuk menyiapkan database dan mengisi data awal (Kamar, Penghuni, Transaksi, Tagihan):

### 1. Migrasi Saja (Tanpa Data)
```bash
php artisan migrate
```

### 2. Migrasi + Data Dummy (Fresh Start)
**PERHATIAN:** Perintah ini akan MENGHAPUS semua data lama.
```bash
php artisan migrate:fresh --seed
```

### 3. Tambah Data Dummy (Tanpa Hapus Data Lama)
Jika Anda sudah punya database dan hanya ingin menambah data dummy:
```bash
php artisan db:seed
```

### 4. Menjalankan Seeder Spesifik (Pilihan)
Jika Anda hanya ingin mengisi tabel tertentu saja:
```bash
# Isi Data Kamar Saja
php artisan db:seed --class=KamarSeeder

# Isi Data Penghuni Saja (Pastikan Kamar sudah ada)
php artisan db:seed --class=PenghuniSeeder

# Isi Data Transaksi Saja
php artisan db:seed --class=TransaksiSeeder

# Isi Data Tagihan Saja
php artisan db:seed --class=TagihanSeeder
```

### Data Dummy yang Diinsert:
- **User Admin**: admin@example.com / password
- **Kamar**: 5 Kamar (Tipe Standard, VIP, Economis)
- **Penghuni**: 5 Penghuni (Aktif, Nonaktif, History)
- **Transaksi**: 5 Transaksi (Sewa, Listrik, Internet)
- **Tagihan**: 5 Invoice (Lunas & Belum Lunas)

## Snapshot Data Logic
Sejak Februari 2026, sistem menggunakan **Snapshot Data** untuk Transaksi dan Tagihan.
- Saat transaksi/tagihan dibuat, nama Penghuni & Kamar disalin ke tabel transaksi/tagihan.
- Jika data Master Penghuni dihapus, data di Laporan Keuangan **TETAP AMAN**.
- Foreign Key constraint ke `penghunis` dan `kamars` telah dihapus (nullable).

## API Endpoints Utama
- `POST /api/login` - Login & Get Token
- `GET /api/kamars` - List Kamar
- `GET /api/penghunis` - List Penghuni
- `GET /api/transaksis` - Laporan Keuangan
- `POST /api/tagihans` - Buat Tagihan Baru

## Testing
Untuk menjalankan feature checking:
```bash
php artisan test
```

## License
Private / Proprietary.
