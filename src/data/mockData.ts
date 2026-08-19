import { Santri, PengasuhGuru, Kamar, LogAktivitas, CatatanKeuangan, PelanggaranSantri, Prestasi } from '../types';

export const DEFAULT_SANTRI: Santri[] = [
  {
    id: 's-1',
    nis: '202601001',
    nama: 'Muhammad Al-Fatih',
    gender: 'Laki-laki',
    tempatLahir: 'Jakarta',
    tanggalLahir: '2010-05-12',
    alamat: 'Jl. Pemuda No. 45, Jakarta Timur',
    namaWali: 'Achmad Fauzi',
    noHpWali: '081234567890',
    tanggalMasuk: '2024-07-15',
    status: 'Aktif',
    idKamar: 'k-1',
    kelas: '10-A (Ula)',
  },
  {
    id: 's-2',
    nis: '202601002',
    nama: 'Ahmad Rafif Syahputra',
    gender: 'Laki-laki',
    tempatLahir: 'Bandung',
    tanggalLahir: '2011-02-28',
    alamat: 'Kopo Permai Blok C, Bandung',
    namaWali: 'Budi Syahputra',
    noHpWali: '081398765432',
    tanggalMasuk: '2024-07-15',
    status: 'Aktif',
    idKamar: 'k-1',
    kelas: '10-A (Ula)',
  },
  {
    id: 's-3',
    nis: '202601003',
    nama: 'Zahra Amelia Putri',
    gender: 'Perempuan',
    tempatLahir: 'Bogor',
    tanggalLahir: '2010-11-05',
    alamat: 'Jl. Pajajaran No. 12, Bogor',
    namaWali: 'Heri Gunawan',
    noHpWali: '085612345678',
    tanggalMasuk: '2024-07-16',
    status: 'Aktif',
    idKamar: 'k-3',
    kelas: '10-B (Ula)',
  },
  {
    id: 's-4',
    nis: '202601004',
    nama: 'Siti Aminah Az-Zahra',
    gender: 'Perempuan',
    tempatLahir: 'Cirebon',
    tanggalLahir: '2012-08-17',
    alamat: 'Perumahan Sumber Cirebon Indah',
    namaWali: 'M. Yusuf',
    noHpWali: '082187654321',
    tanggalMasuk: '2025-01-10',
    status: 'Aktif',
    idKamar: 'k-3',
    kelas: '9-B (Wustha)',
  },
  {
    id: 's-5',
    nis: '202601005',
    nama: 'Yusuf Habibi',
    gender: 'Laki-laki',
    tempatLahir: 'Solo',
    tanggalLahir: '2009-04-03',
    alamat: 'Jl. Slamet Riyadi No. 102, Surakarta',
    namaWali: 'Suryo Habibi',
    noHpWali: '089876543210',
    tanggalMasuk: '2023-07-15',
    status: 'Aktif',
    idKamar: 'k-2',
    kelas: '11-A (Wustha)',
  },
  {
    id: 's-6',
    nis: '202502010',
    nama: 'Rizqi Mahendra',
    gender: 'Laki-laki',
    tempatLahir: 'Semarang',
    tanggalLahir: '2008-12-12',
    alamat: 'Gayamsari Indah, Semarang',
    namaWali: 'Edi Mahendra',
    noHpWali: '081255554444',
    tanggalMasuk: '2023-07-15',
    status: 'Pindah',
    idKamar: 'k-2',
    kelas: '11-A (Wustha)',
  },
  {
    id: 's-7',
    nis: '202601007',
    nama: 'Aisyah Humaira',
    gender: 'Perempuan',
    tempatLahir: 'Surabaya',
    tanggalLahir: '2011-09-21',
    alamat: 'Jl. Manyar Sabrangan No. 8, Surabaya',
    namaWali: 'Sudirman',
    noHpWali: '087812123434',
    tanggalMasuk: '2024-07-16',
    status: 'Aktif',
    idKamar: 'k-4',
    kelas: '10-B (Ula)',
  }
];

export const DEFAULT_GURU_PENGASUH: PengasuhGuru[] = [
  {
    id: 'g-1',
    nip: '1985031201',
    nama: 'K.H. Ahmad Dahlan, Lc.',
    gender: 'Laki-laki',
    peran: 'Pengasuh & Guru',
    spesialisasi: 'Tafsir Al-Qur\'an & Fiqih',
    noHp: '081122334455',
    alamat: 'Kompleks Pesantren Blok A, Jambi',
    jadwal: [
      { id: 'j-1', hari: 'Senin', jamMulai: '05:30', jamSelesai: '07:00', mataPelajaran: 'Tafsir Jalalain', kelas: 'Kelas Aliyah' },
      { id: 'j-2', hari: 'Kamis', jamMulai: '18:30', jamSelesai: '20:00', mataPelajaran: 'Fiqih Fathul Qorib', kelas: 'Semua Santri' }
    ]
  },
  {
    id: 'g-2',
    nip: '1990082402',
    nama: 'Ustadzah Fatimah Azzahra, S.Pd.I',
    gender: 'Perempuan',
    peran: 'Guru',
    spesialisasi: 'Tahfidz & Tajwid',
    noHp: '085299887766',
    alamat: 'Perumahan Guru Blok C-3, Jambi',
    jadwal: [
      { id: 'j-3', hari: 'Selasa', jamMulai: '07:30', jamSelesai: '09:00', mataPelajaran: 'Tahfidzul Qur\'an', kelas: 'Kamar Putri Mina' },
      { id: 'j-4', hari: 'Rabu', jamMulai: '14:00', jamSelesai: '15:30', mataPelajaran: 'Tajwid Sulamun Nayyirain', kelas: 'Santriwati Ula' }
    ]
  },
  {
    id: 'g-3',
    nip: '1992110503',
    nama: 'Ustadz Muhammad Syakir, M.Ag',
    gender: 'Laki-laki',
    peran: 'Guru',
    spesialisasi: 'Bahasa Arab & Nahwu Sharaf',
    noHp: '081377889900',
    alamat: 'Kost Syariah Darul Arifin, Jambi',
    jadwal: [
      { id: 'j-5', hari: 'Senin', jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Nahwu Jurumiyah', kelas: 'Santri Putra 10-A' },
      { id: 'j-6', hari: 'Rabu', jamMulai: '08:00', jamSelesai: '09:30', mataPelajaran: 'Shorof Amtsilah Tashrifiyah', kelas: 'Santri Putra 10-A' },
      { id: 'j-7', hari: 'Sabtu', jamMulai: '10:00', jamSelesai: '11:30', mataPelajaran: 'Muhadatsah Arabiyah', kelas: 'Semua Santri Putra' }
    ]
  },
  {
    id: 'g-4',
    nip: '1988011504',
    nama: 'Ustadz Lukman Hakim',
    gender: 'Laki-laki',
    peran: 'Pengasuh',
    spesialisasi: 'Kepengasuhan & Akhlak',
    noHp: '082155667788',
    alamat: 'Kompleks Asrama Putra Utama, Jambi',
    jadwal: [
      { id: 'j-8', hari: 'Ahad', jamMulai: '19:30', jamSelesai: '21:00', mataPelajaran: 'Kitab Ta\'limul Muta\'allim', kelas: 'Semua Santri Putra' }
    ]
  }
];

export const DEFAULT_KAMAR: Kamar[] = [
  {
    id: 'k-1',
    namaKamar: 'Makkah 01',
    gedung: 'Asrama Putra (Pa)',
    kapasitas: 8,
    inventaris: [
      { id: 'i-1', namaBarang: 'Kasur Busa', jumlah: 8, kondisi: 'Baik' },
      { id: 'i-2', namaBarang: 'Lemari Pakaian Kayu', jumlah: 8, kondisi: 'Baik' },
      { id: 'i-3', namaBarang: 'Kipas Angin Dinding', jumlah: 2, kondisi: 'Baik' },
      { id: 'i-4', namaBarang: 'Meja Mengaji Lipat', jumlah: 8, kondisi: 'Baik' }
    ],
    absensiHariIni: [
      { idSantri: 's-1', namaSantri: 'Muhammad Al-Fatih', statusKamar: 'Hadir' },
      { idSantri: 's-2', namaSantri: 'Ahmad Rafif Syahputra', statusKamar: 'Hadir' }
    ],
    waliKamar: 'Ustadz Lukman Hakim'
  },
  {
    id: 'k-2',
    namaKamar: 'Madinah 02',
    gedung: 'Asrama Putra (Pa)',
    kapasitas: 6,
    inventaris: [
      { id: 'i-5', namaBarang: 'Kasur Tingkat', jumlah: 3, kondisi: 'Baik' },
      { id: 'i-6', namaBarang: 'Lemari Pakaian Besi', jumlah: 6, kondisi: 'Baik' },
      { id: 'i-7', namaBarang: 'Kipas Angin Dinding', jumlah: 1, kondisi: 'Rusak Ringan' },
      { id: 'i-8', namaBarang: 'Rak Kitab Bersama', jumlah: 1, kondisi: 'Baik' }
    ],
    absensiHariIni: [
      { idSantri: 's-5', namaSantri: 'Yusuf Habibi', statusKamar: 'Hadir' }
    ],
    waliKamar: 'Ustadz Muhammad Syakir, M.Ag'
  },
  {
    id: 'k-3',
    namaKamar: 'Mina 01',
    gedung: 'Asrama Putri (Pi)',
    kapasitas: 10,
    inventaris: [
      { id: 'i-9', namaBarang: 'Kasur Busa Lantai', jumlah: 10, kondisi: 'Baik' },
      { id: 'i-10', namaBarang: 'Lemari Plastik Laci', jumlah: 10, kondisi: 'Baik' },
      { id: 'i-11', namaBarang: 'Kipas Angin Dinding', jumlah: 2, kondisi: 'Baik' },
      { id: 'i-12', namaBarang: 'Cermin Rias Besar', jumlah: 1, kondisi: 'Baik' }
    ],
    absensiHariIni: [
      { idSantri: 's-3', namaSantri: 'Zahra Amelia Putri', statusKamar: 'Hadir' },
      { idSantri: 's-4', namaSantri: 'Siti Aminah Az-Zahra', statusKamar: 'Izin' }
    ],
    waliKamar: 'Ustadzah Fatimah Azzahra, S.Pd.I'
  },
  {
    id: 'k-4',
    namaKamar: 'Arafah 02',
    gedung: 'Asrama Putri (Pi)',
    kapasitas: 8,
    inventaris: [
      { id: 'i-13', namaBarang: 'Kasur Busa Lantai', jumlah: 8, kondisi: 'Baik' },
      { id: 'i-14', namaBarang: 'Lemari Pakaian Kayu', jumlah: 8, kondisi: 'Rusak Berat' },
      { id: 'i-15', namaBarang: 'Kipas Angin Dinding', jumlah: 2, kondisi: 'Baik' }
    ],
    absensiHariIni: [
      { idSantri: 's-7', namaSantri: 'Aisyah Humaira', statusKamar: 'Sakit' }
    ],
    waliKamar: 'Ustadzah Fatimah Azzahra, S.Pd.I'
  }
];

export const DEFAULT_LOGS: LogAktivitas[] = [
  {
    id: 'log-1',
    timestamp: '2026-07-14T05:00:00.000Z',
    kategori: 'Santri',
    tipe: 'info',
    pesan: 'Santri melakukan Shalat Subuh berjamaah di Masjid Utama.',
    actor: 'Kamtib Pesantren'
  },
  {
    id: 'log-2',
    timestamp: '2026-07-14T06:30:00.000Z',
    kategori: 'Kamar',
    tipe: 'success',
    pesan: 'Absensi Kamar Asrama Putra selesai. 100% hadir di Makkah 01.',
    actor: 'Ustadz Lukman Hakim'
  },
  {
    id: 'log-3',
    timestamp: '2026-07-14T07:45:00.000Z',
    kategori: 'Akademik',
    tipe: 'info',
    pesan: 'Kegiatan Belajar Mengajar Kitab Nahwu Sharaf dimulai.',
    actor: 'Ustadz Muhammad Syakir'
  },
  {
    id: 'log-4',
    timestamp: '2026-07-14T11:00:00.000Z',
    kategori: 'Sistem',
    tipe: 'success',
    pesan: 'Sinkronisasi data santri dengan server Kemenag EMIS berhasil.',
    actor: 'Admin Sistem'
  },
  {
    id: 'log-5',
    timestamp: '2026-07-14T14:30:00.000Z',
    kategori: 'Kamar',
    tipe: 'warning',
    pesan: 'Laporan inventaris Lemari di Kamar Arafah 02 terdeteksi "Rusak Berat".',
    actor: 'Ustadzah Fatimah'
  },
  {
    id: 'log-6',
    timestamp: '2026-07-14T15:15:00.000Z',
    kategori: 'Santri',
    tipe: 'danger',
    pesan: 'Santri Rizqi Mahendra menyelesaikan administrasi kepindahan ke sekolah luar.',
    actor: 'Bagian Administrasi'
  }
];

export const DEFAULT_KEUANGAN: CatatanKeuangan[] = [
  // 2026 Monthly Data for reporting
  { id: 'f-1', tanggal: '2026-07-01', tipe: 'Pemasukan', kategori: 'Iuran Syahriah Bulanan', nominal: 14500000, keterangan: 'Iuran syahriah 58 santri aktif' },
  { id: 'f-2', tanggal: '2026-07-03', tipe: 'Pemasukan', kategori: 'Donasi Yayasan', nominal: 5000000, keterangan: 'Donasi Hamba Allah untuk pembangunan aula' },
  { id: 'f-3', tanggal: '2026-07-05', tipe: 'Pengeluaran', kategori: 'Honorarium Guru & Pengasuh', nominal: 7500000, keterangan: 'Gaji bulanan 4 Ustadz/Ustadzah' },
  { id: 'f-4', tanggal: '2026-07-07', tipe: 'Pengeluaran', kategori: 'Operasional Dapur & Konsumsi', nominal: 3400000, keterangan: 'Bahan pangan mingguan santri' },
  { id: 'f-5', tanggal: '2026-07-10', tipe: 'Pengeluaran', kategori: 'Listrik & WiFi', nominal: 850000, keterangan: 'Tagihan utilitas kompleks asrama' },
  { id: 'f-6', tanggal: '2026-06-01', tipe: 'Pemasukan', kategori: 'Iuran Syahriah Bulanan', nominal: 14250000, keterangan: 'Iuran syahriah Juni' },
  { id: 'f-7', tanggal: '2026-06-15', tipe: 'Pengeluaran', kategori: 'Buku & Kitab Kuning', nominal: 2100000, keterangan: 'Pembelian kitab baru dari penerbit' },
  { id: 'f-8', tanggal: '2026-05-02', tipe: 'Pemasukan', kategori: 'Zakat, Infaq, Sedekah', nominal: 8900000, keterangan: 'Penerimaan ZIS dari wali santri' },
  { id: 'f-9', tanggal: '2026-05-10', tipe: 'Pengeluaran', kategori: 'Pemeliharaan Gedung', nominal: 4300000, keterangan: 'Perbaikan atap bocor Asrama Putri' }
];

export const DEFAULT_PELANGGARAN: PelanggaranSantri[] = [
  {
    id: 'p-1',
    idSantri: 's-1',
    namaSantri: 'Muhammad Al-Fatih',
    kelasSantri: '10-A (Ula)',
    tanggal: '2026-07-10',
    kategori: 'Ringan',
    jenisPelanggaran: 'Terlambat mengikuti shalat berjamaah subuh',
    hukuman: 'Membaca Al-Quran sebanyak 1 juz di serambi masjid',
    catatan: 'Terlambat bangun karena tidur terlalu malam',
    petugas: 'Ustadz Lukman Hakim'
  },
  {
    id: 'p-2',
    idSantri: 's-2',
    namaSantri: 'Ahmad Rafif Syahputra',
    kelasSantri: '10-A (Ula)',
    tanggal: '2026-07-12',
    kategori: 'Sedang',
    jenisPelanggaran: 'Keluar komplek asrama tanpa surat izin resmi',
    hukuman: 'Melakukan piket kebersihan halaman masjid selama 3 hari berturut-turut',
    catatan: 'Keluar untuk membeli alat tulis di toko luar asrama',
    petugas: 'Ustadz Ahmad Syahroni'
  },
  {
    id: 'p-3',
    idSantri: 's-5',
    namaSantri: 'Yusuf Habibi',
    kelasSantri: '11-A (Wustha)',
    tanggal: '2026-07-14',
    kategori: 'Berat',
    jenisPelanggaran: 'Membawa dan menggunakan handphone (HP) di lingkungan asrama',
    hukuman: 'Penyitaan HP selama 1 semester dan pemanggilan orang tua/wali',
    catatan: 'HP ditemukan tersembunyi di bawah kasur saat sidak kamar',
    petugas: 'Ustadz Lukman Hakim'
  }
];

export const DEFAULT_PRESTASI: Prestasi[] = [
  {
    id: 'p-p-1',
    penerimaTipe: 'Santri',
    penerimaId: 's-1',
    penerimaNama: 'Muhammad Al-Fatih',
    judul: "Juara 1 Qira'atil Kutub (MQK) Kitab Fathul Qorib",
    kategori: 'Keagamaan',
    tanggal: '2026-06-15',
    penyelenggara: 'Kantor Wilayah Kementerian Agama Provinsi',
    deskripsi: 'Berhasil memperoleh nilai tertinggi dalam pemahaman nahwu, sharaf, serta fiqih mazhab Syafi\'i pada ajang perlombaan membaca kitab kuning (MQK) tingkat wilayah Jambi.',
    fotoUrl: ''
  },
  {
    id: 'p-p-2',
    penerimaTipe: 'Guru',
    penerimaId: 'g-2',
    penerimaNama: 'Ustadzah Fatimah Azzahra, S.Pd.I',
    judul: 'Penghargaan Mentor Tahfidz Inspiratif & Pembina Sanad Qur\'an',
    kategori: 'Pengabdian',
    tanggal: '2026-07-01',
    penyelenggara: 'Yayasan IT Center Darul Arifin',
    deskripsi: 'Diberikan atas kontribusi luar biasa dalam membimbing santri putri hingga menyelesaikan setoran hafalan 30 Juz Al-Qur\'an secara mutqin dengan sanad bersambung.',
    fotoUrl: ''
  }
];

