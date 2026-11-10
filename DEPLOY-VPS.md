# Deploy SATDAF ke VPS

Panduan menaruh aplikasi ini di VPS dengan domain sendiri, HTTPS otomatis, dan
database PostgreSQL milik sendiri (tanpa Firebase).
Isi repo sudah lengkap: `Dockerfile`, `docker-compose.prod.yml`, dan `Caddyfile`.

## 1. Siapkan domain

1. Beli domain (mis. `satdaf.id`) di DomaiNesia / Rumahweb / Cloudflare.
2. Di pengaturan DNS, buat:
   - `A` — `@` → IP VPS
   - `A` — `www` → IP VPS (opsional)
3. Tunggu propagasi DNS (biasanya 5–30 menit).

## 2. Siapkan VPS

Ubuntu 22.04/24.04, minimal 2 GB RAM.

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
docker --version && docker compose version

# Buka port web
ufw allow 22/tcp && ufw allow 80/tcp && ufw allow 443/tcp && ufw enable
```

## 3. Ambil kode & konfigurasi

```bash
git clone <URL-REPO-ANDA> satdaf
cd satdaf
```

Buat file `.env` (tidak ikut ter-commit):

```ini
DOMAIN=satdaf.id
POSTGRES_PASSWORD=ganti-dengan-kata-sandi-panjang-anda
GEMINI_API_KEY=isi-kunci-gemini-anda
APP_URL=https://satdaf.id
```

- `DOMAIN` wajib — Caddy memakainya untuk membuat sertifikat HTTPS.
- `POSTGRES_PASSWORD` wajib — dipakai database dan aplikasi. Buat sekali, jangan
  diubah setelah data tersimpan.
- `GEMINI_API_KEY` opsional; tanpa ini aplikasi tetap jalan, hanya fitur
  "Asisten AI SATDAF" yang menampilkan pesan belum dikonfigurasi.

## 4. Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Buka `https://satdaf.id`. Sertifikat HTTPS dibuat otomatis oleh Caddy saat
pertama kali diakses (butuh port 80 & 443 terbuka dan DNS sudah mengarah ke VPS).

## 5. Pindahkan data lama dari Firebase

Database PostgreSQL baru mulai dari data contoh. Untuk memasukkan data asli:

1. Buka aplikasi **lama** (versi Firebase) → menu **Status & Cadangan Data** →
   **Ekspor / Unduh Cadangan**. Simpan file `backup_satdaf_pesantren_*.json`.
2. Buka aplikasi **baru** di `https://satdaf.id` → **Status & Cadangan Data** →
   **Impor file cadangan**, pilih file tadi.
3. Data langsung masuk ke PostgreSQL dan tampil real-time di semua perangkat.

Impor menimpa data dengan `id` yang sama dan menambahkan sisanya, jadi aman
diulang. Kalau nanti ingin berhenti memakai Firebase sepenuhnya, Firebase Console
lama boleh dihapus setelah data terverifikasi pindah.

## Update aplikasi

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Backup database

Data ada di volume Docker `db_data`. Cadangan rutin:

```bash
docker compose -f docker-compose.prod.yml exec -T db \
  pg_dump -U satdaf satdaf | gzip > backup-satdaf-$(date +%F).sql.gz
```

Simpan file hasilnya di luar VPS. Selain itu, tombol **Status & Cadangan Data**
di aplikasi tetap bisa mengekspor seluruh data dalam bentuk JSON.

## Catatan

- Ganti domain cukup dengan mengubah `DOMAIN` di `.env`, lalu
  `docker compose -f docker-compose.prod.yml up -d` (Caddy membuat sertifikat baru).
- Real-time memakai Server-Sent Events (`/api/collections/:koleksi/events`), jadi
  tidak perlu konfigurasi tambahan di Nginx/Caddy.
- Cek log bila ada masalah: `docker compose -f docker-compose.prod.yml logs -f app`
