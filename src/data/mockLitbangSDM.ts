import { KaryawanSDM, PenilaianKinerjaSDM, ProgramInovasiLitbang } from '../types';

export const DEFAULT_KARYAWAN_SDM: KaryawanSDM[] = [
  {
    id: 'emp-001',
    nipKaryawan: 'SDM-20220101',
    nama: 'Ustadz Dr. H. M. Zainul Arifin, M.A.',
    gender: 'Laki-laki',
    jabatan: 'Kepala Bagian Litbang & Kurikulum',
    unitKerja: 'Litbang, Kurikulum & SDM',
    statusKepegawaian: 'Tetap',
    noHp: '081234567890',
    email: 'zainul.arifin@darularifin.sch.id',
    pendidikanTerakhir: 'S3 Pendidikan Islam & Hadits',
    tanggalBergabung: '2020-01-15',
    catatanApresiasi: 'Penggagas Metodologi Digital Mutabaah Yaumiyah Pesantren'
  },
  {
    id: 'emp-002',
    nipKaryawan: 'SDM-20220102',
    nama: 'Ustadz Ahmad Al-Hafizh, S.Pd.I.',
    gender: 'Laki-laki',
    jabatan: 'Musyrif Senior & Koordinator Tahfizh Asrama',
    unitKerja: 'Pengasuhan Santri & Asrama',
    statusKepegawaian: 'Tetap',
    noHp: '081298765432',
    email: 'ahmad.hafizh@darularifin.sch.id',
    pendidikanTerakhir: 'S1 Ilmu Al-Qur\'an & Tafsir',
    tanggalBergabung: '2021-06-01',
    catatanApresiasi: 'Capaian bimbingan 100% santri kamar lulus juz 30 tepat waktu'
  },
  {
    id: 'emp-003',
    nipKaryawan: 'SDM-20230210',
    nama: 'Ustadzah Fatimah Azzahra, M.Pd.',
    gender: 'Perempuan',
    jabatan: 'Guru Bahasa Arab & Kepala Lab Bahasa',
    unitKerja: 'Sekolah Formal (SMP/SMA/MA)',
    statusKepegawaian: 'Tetap',
    noHp: '081377889900',
    email: 'fatimah.azzahra@darularifin.sch.id',
    pendidikanTerakhir: 'S2 Pendidikan Bahasa Arab',
    tanggalBergabung: '2022-03-10',
    catatanApresiasi: 'Pemenang Lomba Inovasi Media Pembelajaran Bahasa Arab Nasional'
  },
  {
    id: 'emp-004',
    nipKaryawan: 'SDM-20230515',
    nama: 'Ustadz M. Ridwan, S.E.',
    gender: 'Laki-laki',
    jabatan: 'Staf Senior Keuangan & Administrasi Syahriah',
    unitKerja: 'Administrasi, Keuangan & Humas',
    statusKepegawaian: 'Tetap',
    noHp: '081122334455',
    email: 'ridwan.keuangan@darularifin.sch.id',
    pendidikanTerakhir: 'S1 Akuntansi Syariah',
    tanggalBergabung: '2022-05-15',
    catatanApresiasi: 'Disiplin rekonsiliasi kas pesantren & pelaporan keuangan transparan'
  },
  {
    id: 'emp-005',
    nipKaryawan: 'SDM-20240108',
    nama: 'Ustadz Budi Santoso, S.ST.',
    gender: 'Laki-laki',
    jabatan: 'Kepala Keamanan & Koordinator Sarpras',
    unitKerja: 'Sarana Prasarana & Keamanan',
    statusKepegawaian: 'Kontrak',
    noHp: '081399001122',
    pendidikanTerakhir: 'D4 Manajemen Logistik',
    tanggalBergabung: '2023-01-08'
  },
  {
    id: 'emp-006',
    nipKaryawan: 'SDM-20240720',
    nama: 'Ustadz M. Husni Thamrin, S.Hum.',
    gender: 'Laki-laki',
    jabatan: 'Pengajar Kitab Kuning Diniyah',
    unitKerja: 'Madrasah Diniyah & Tahfizh',
    statusKepegawaian: 'Pengabdian',
    noHp: '081266778899',
    pendidikanTerakhir: 'S1 Dirasat Islamiyah (Al-Azhar Cairo)',
    tanggalBergabung: '2024-07-20'
  }
];

export const DEFAULT_PENILAIAN_SDM: PenilaianKinerjaSDM[] = [
  {
    id: 'eval-2026-001',
    idKaryawan: 'emp-002',
    nipKaryawan: 'SDM-20220102',
    namaKaryawan: 'Ustadz Ahmad Al-Hafizh, S.Pd.I.',
    jabatan: 'Musyrif Senior & Koordinator Tahfizh Asrama',
    unitKerja: 'Pengasuhan Santri & Asrama',
    periode: 'Semester Ganjil 2025/2026',
    tanggalPenilaian: '2026-01-10',
    penilaiNama: 'Ustadz Dr. H. M. Zainul Arifin, M.A. (Litbang & SDM)',
    itemsKPI: [
      {
        id: 'kpi-1',
        kpiName: 'Target Kelulusan Hafalan Santri Binaan',
        bobotPercent: 25,
        target: 'Minimum 90% santri lulus target juz per semester',
        pencapaianActual: '95% Lulus Target',
        skorActual: 96,
        catatan: 'Sangat konsisten menyimak murajaah malam santri'
      },
      {
        id: 'kpi-2',
        kpiName: 'Kedisiplinan Input Mutabaah Yaumiyah & Presensi',
        bobotPercent: 20,
        target: '100% Pengisian Mutabaah Tepat Waktu',
        pencapaianActual: '98% Tepat Waktu',
        skorActual: 98,
        catatan: 'Laporan harian sangat teratur dan detail'
      },
      {
        id: 'kpi-3',
        kpiName: 'Bimbingan Akhlak & Pengasuhan Kamar',
        bobotPercent: 20,
        target: 'Nihil pelanggaran berat santri kamar binaan',
        pencapaianActual: '0 Pelanggaran Berat',
        skorActual: 95,
        catatan: 'Pendekatan persuasif dan keibuan/kebapakan yang sejuk'
      },
      {
        id: 'kpi-4',
        kpiName: 'Komunikasi & Layanan Wali Santri',
        bobotPercent: 15,
        target: 'Respons konsultasi wali santri < 2 jam',
        pencapaianActual: 'Rata-rata 20 menit',
        skorActual: 94,
        catatan: 'Mendapat apresiasi tinggi dari para wali santri'
      },
      {
        id: 'kpi-5',
        kpiName: 'Partisipasi Kegiatan Riset & Modul Litbang',
        bobotPercent: 20,
        target: 'Menyusun 1 Panduan / Modul Pengasuhan',
        pencapaianActual: '1 Buku Saku Pengasuhan Terbit',
        skorActual: 92,
        catatan: 'Aktif memberikan gagasan inovatif pada rapat Litbang'
      }
    ],
    skorTotalKPI: 95.3,
    skorKedisiplinanPresensi: 98,
    skorAkhlakAdabPesantren: 96,
    skorKompetensiPengasuhanPedagogik: 94,
    skorInovasiRisetLitbang: 90,
    skorPelayananSantriOrtu: 95,
    totalSkorFinal: 95.1,
    kategoriKinerja: 'Sangat Baik (A)',
    rekomendasiLitbang: 'Direkomendasikan untuk promosi sebagai Kepala Pengasuhan Putra & menerima Insentif Kinerja Semester.',
    statusApproval: 'Disetujui Mudir',
    catatanMudir: 'Baarakallahu fiik, tingkatkan terus keteladanan dalam pengasuhan.'
  },
  {
    id: 'eval-2026-002',
    idKaryawan: 'emp-003',
    nipKaryawan: 'SDM-20230210',
    namaKaryawan: 'Ustadzah Fatimah Azzahra, M.Pd.',
    jabatan: 'Guru Bahasa Arab & Kepala Lab Bahasa',
    unitKerja: 'Sekolah Formal (SMP/SMA/MA)',
    periode: 'Semester Ganjil 2025/2026',
    tanggalPenilaian: '2026-01-12',
    penilaiNama: 'Ustadz Dr. H. M. Zainul Arifin, M.A. (Litbang & SDM)',
    itemsKPI: [
      {
        id: 'kpi-201',
        kpiName: 'Ketuntasan Nilai KKM Bahasa Arab Santri',
        bobotPercent: 30,
        target: 'Min 85% Santri Mencapai KKM (80.0)',
        pencapaianActual: '92% Santri Mencapai KKM',
        skorActual: 94,
        catatan: 'Metode pengajaran interaktif audiovisual sangat efektif'
      },
      {
        id: 'kpi-202',
        kpiName: 'Penyusunan Perangkat Ajar & Silabus Diniyah',
        bobotPercent: 25,
        target: '100% RPP & Silabus Siap Sebelum Semester',
        pencapaianActual: 'Tuntas Lengkap',
        skorActual: 95
      },
      {
        id: 'kpi-203',
        kpiName: 'Inovasi Media Pembelajaran Bahasa (Riset Litbang)',
        bobotPercent: 25,
        target: 'Min 2 Aplikasi / Card Game Bahasa Arab',
        pencapaianActual: '3 Media Inovatif Dibuat',
        skorActual: 98,
        catatan: 'Sangat kreatif merancang flashcard muhadatsah'
      },
      {
        id: 'kpi-204',
        kpiName: 'Kedisiplinan Kehadiran & Piket Jam Mengajar',
        bobotPercent: 20,
        target: 'Presensi Mengajar ≥ 98%',
        pencapaianActual: '100% Hadir',
        skorActual: 100
      }
    ],
    skorTotalKPI: 96.2,
    skorKedisiplinanPresensi: 100,
    skorAkhlakAdabPesantren: 95,
    skorKompetensiPengasuhanPedagogik: 96,
    skorInovasiRisetLitbang: 97,
    skorPelayananSantriOrtu: 92,
    totalSkorFinal: 95.8,
    kategoriKinerja: 'Sangat Baik (A)',
    rekomendasiLitbang: 'Diajukan sebagai Nominator Guru Berprestasi Tingkat Provinsi & Pembina Program Pertukaran Bahasa.',
    statusApproval: 'Disetujui Mudir'
  },
  {
    id: 'eval-2026-003',
    idKaryawan: 'emp-004',
    nipKaryawan: 'SDM-20230515',
    namaKaryawan: 'Ustadz M. Ridwan, S.E.',
    jabatan: 'Staf Senior Keuangan & Administrasi Syahriah',
    unitKerja: 'Administrasi, Keuangan & Humas',
    periode: 'Semester Ganjil 2025/2026',
    tanggalPenilaian: '2026-01-14',
    penilaiNama: 'Ustadz Dr. H. M. Zainul Arifin, M.A. (Litbang & SDM)',
    itemsKPI: [
      {
        id: 'kpi-301',
        kpiName: 'Ketepatan Laporan Rekapitulasi Pembayaran SPP/Syahriah',
        bobotPercent: 30,
        target: 'Laporan Selesai Tgl 5 Setiap Bulan',
        pencapaianActual: 'Tgl 3 Selalu Tuntas',
        skorActual: 92
      },
      {
        id: 'kpi-302',
        kpiName: 'Akurasi Pencatatan Jurnal Kas Masuk & Keluar',
        bobotPercent: 30,
        target: 'Nihil Selisih Kas (0 Error)',
        pencapaianActual: 'Akurat 100%',
        skorActual: 90
      },
      {
        id: 'kpi-303',
        kpiName: 'Kedisiplinan Kerja & Pelayanan Orang Tua',
        bobotPercent: 40,
        target: 'Kepuasan Layanan Loket Pembayaran ≥ 90%',
        pencapaianActual: '88% Ramah & Cepat',
        skorActual: 86
      }
    ],
    skorTotalKPI: 89.0,
    skorKedisiplinanPresensi: 92,
    skorAkhlakAdabPesantren: 90,
    skorKompetensiPengasuhanPedagogik: 85,
    skorInovasiRisetLitbang: 82,
    skorPelayananSantriOrtu: 88,
    totalSkorFinal: 88.5,
    kategoriKinerja: 'Baik (B)',
    rekomendasiLitbang: 'Dipertahankan pada unit keuangan dengan rekomendasi pelatihan sistem akuntansi terpadu.',
    statusApproval: 'Terverifikasi Litbang'
  },
  {
    id: 'eval-2026-004',
    idKaryawan: 'emp-005',
    nipKaryawan: 'SDM-20240108',
    namaKaryawan: 'Ustadz Budi Santoso, S.ST.',
    jabatan: 'Kepala Keamanan & Koordinator Sarpras',
    unitKerja: 'Sarana Prasarana & Keamanan',
    periode: 'Semester Ganjil 2025/2026',
    tanggalPenilaian: '2026-01-15',
    penilaiNama: 'Ustadz Dr. H. M. Zainul Arifin, M.A. (Litbang & SDM)',
    itemsKPI: [
      {
        id: 'kpi-401',
        kpiName: 'Kondisi Keamanan & Ketertiban Gerbang Pesantren',
        bobotPercent: 40,
        target: 'Nihil Penyusup / Kebocoran Izin Keluar Santri',
        pencapaianActual: 'Terjadi 2 kali kelalaian izin santri',
        skorActual: 72,
        catatan: 'Perlu pengawasan lebih ketat saat jam kepulangan'
      },
      {
        id: 'kpi-402',
        kpiName: 'Pemeliharaan Fasilitas & Respon Kerusakan Sarpras',
        bobotPercent: 30,
        target: 'Perbaikan Kerusakan Sarpras < 24 jam',
        pencapaianActual: 'Rata-rata 48 jam',
        skorActual: 75
      },
      {
        id: 'kpi-403',
        kpiName: 'Kedisiplinan Presensi Patroli Malam',
        bobotPercent: 30,
        target: 'Presensi Ronda Night Shift 100%',
        pencapaianActual: '82% Terisi',
        skorActual: 78
      }
    ],
    skorTotalKPI: 74.7,
    skorKedisiplinanPresensi: 78,
    skorAkhlakAdabPesantren: 82,
    skorKompetensiPengasuhanPedagogik: 70,
    skorInovasiRisetLitbang: 68,
    skorPelayananSantriOrtu: 75,
    totalSkorFinal: 75.2,
    kategoriKinerja: 'Cukup (C)',
    rekomendasiLitbang: 'Perlu Pembinaan Khusus Standar Operasional Prosedur (SOP) Keamanan & Evaluasi Kontrak Kerja 6 Bulan.',
    statusApproval: 'Draft'
  }
];

export const DEFAULT_PROGRAM_LITBANG: ProgramInovasiLitbang[] = [
  {
    id: 'prog-01',
    judulProgram: 'Standardisasi Kurikulum & Digitalisasi Rapor Mutabaah SDM',
    unitTujuan: 'Litbang, Kurikulum & SDM',
    penanggungJawab: 'Ustadz Dr. H. M. Zainul Arifin, M.A.',
    targetOutput: 'Sistem Terintegrasi Evaluasi Kinerja SDM Pesantren berbasis KPI',
    progressPercent: 90,
    status: 'Sedang Berjalan',
    tanggalMulai: '2025-11-01',
    tanggalSelesai: '2026-02-28',
    anggaranEst: 15000000,
    keterangan: 'Penerapan rubrik penilaian 360 derajat untuk musyrif dan ustadz pengajar'
  },
  {
    id: 'prog-02',
    judulProgram: 'Workshop Inovasi Metode Pembelajaran Bahasa Arab & Inggris Fun Learning',
    unitTujuan: 'Sekolah Formal (SMP/SMA/MA)',
    penanggungJawab: 'Ustadzah Fatimah Azzahra, M.Pd.',
    targetOutput: '100% Pengajar Bahasa tersertifikasi media ajar modern',
    progressPercent: 100,
    status: 'Diterapkan Permanen',
    tanggalMulai: '2025-08-10',
    tanggalSelesai: '2025-10-15',
    anggaranEst: 8500000,
    keterangan: 'Meningkatkan skor Bahasa Arab & Inggris santri sebesar 24%'
  },
  {
    id: 'prog-03',
    judulProgram: 'Pelatihan Sertifikasi Musyrif Pengasuhan & Konseling Santri',
    unitTujuan: 'Pengasuhan Santri & Asrama',
    penanggungJawab: 'Ustadz Ahmad Al-Hafizh, S.Pd.I.',
    targetOutput: '15 Musyrif memiliki sertifikat pendampingan remaja Islam',
    progressPercent: 65,
    status: 'Sedang Berjalan',
    tanggalMulai: '2026-01-05',
    tanggalSelesai: '2026-04-30',
    anggaranEst: 12000000,
    keterangan: 'Fokus pada kesehatan mental santri dan pencegahan perundungan'
  }
];
