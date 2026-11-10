# Deploy SATDAF ke VPS

Panduan menaruh aplikasi ini di VPS dengan domain sendiri dan HTTPS otomatis.
Isi repo sudah lengkap: `Dockerfile`, `docker-compose.prod.yml`, dan `Caddyfile`.

## 1. Siapkan domain

1. Beli domain (mis. `satdaf.id`) di DomaiNesia / Rumahweb / Cloudflare.
2. Di pengaturan DNS, buat:
   - `A` — `@` → IP VPS
   - `A` — `www` → IP VPS (opsional)
3. Tunggu propagasi DNS (biasanya 5–30 menit).

## 2. Siapkan VPS

Ubuntu 22.04/24.04, minimal 1 GB RAM (2 GB lebih nyaman untuk build).

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
GEMINI_API_KEY=isi-kunci-gemini-anda
APP_URL=https://satdaf.id
```

- `DOMAIN` wajib — Caddy memakainya untuk membuat sertifikat HTTPS.
- `GEMINI_API_KEY` opsional; tanpa ini aplikasi tetap jalan, hanya fitur
  "Asisten AI SATDAF" yang menampilkan pesan belum dikonfigurasi.

## 4. Jalankan

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
```

Buka `https://satdaf.id`. Sertifikat HTTPS dibuat otomatis oleh Caddy saat
pertama kali diakses (butuh port 80 & 443 terbuka dan DNS sudah mengarah ke VPS).

## 5. Daftarkan domain di Firebase

Firebase Console → Authentication → Settings → **Authorized domains** →
tambahkan `satdaf.id`. Tanpa langkah ini login/Firestore bisa ditolak di domain baru.

## Update aplikasi

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

## Catatan

- Data aplikasi tersimpan di Firebase Firestore, bukan di VPS — jadi tidak ada
  database/volume yang perlu di-backup di server.
- Ganti domain cukup dengan mengubah `DOMAIN` di `.env`, lalu
  `docker compose -f docker-compose.prod.yml up -d` (Caddy membuat sertifikat baru).
- Cek log bila ada masalah: `docker compose -f docker-compose.prod.yml logs -f app`
