import { PenggunaApp } from '../types';

export const ALL_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', desc: 'Ringkasan statistik & indikator utama pesantren' },
  { id: 'tahfidz-gamifikasi', label: 'Tahfidz Gamifikasi', desc: 'Pencatatan setoran hafalan, XP, level & papan peringkat' },
  { id: 'santri', label: 'Data Santri', desc: 'Biodata lengkap & status akademik santri' },
  { id: 'kamar', label: 'Data Kamar (Asrama)', desc: 'Pengaturan kamar, inventaris & absensi malam' },
  { id: 'guru', label: 'Pengasuh & Guru', desc: 'Data ustadz, pengasuh & jadwal mengajar' },
  { id: 'litbang-sdm', label: 'Litbang & SDM', desc: 'Inovasi, program penelitian, evaluasi & KPI SDM pesantren' },
  { id: 'mutabaah', label: 'Mutabaah Yaumiyah Santri', desc: 'Catatan amalan harian, shalat fardhu/sunnah & target ibadah santri' },
  { id: 'portal-orangtua', label: 'Portal Orang Tua', desc: 'Akses khusus laporan perkembangan bagi wali santri' },
  { id: 'klinik', label: 'Klinik Kesehatan Santri', desc: 'Rekam medis, kunjungan berobat & stok obat UKS' },
  { id: 'pelanggaran', label: 'Pelanggaran Santri', desc: 'Pencatatan pelanggaran, takzir & kedisiplinan' },
  { id: 'prestasi', label: 'Prestasi & Penghargaan', desc: 'Apresiasi kejuaraan & hafalan santri/guru' },
  { id: 'monitoring-pimpinan', label: 'Monitoring Pimpinan', desc: 'Panel eksekutif untuk Mudir & Pengasuh Utama' },
  { id: 'monitoring', label: 'Monitoring Real-Time', desc: 'Live feed aktivitas & log operasional' },
  { id: 'role-pengguna', label: 'Role & Akses Pengguna', desc: 'Manajemen akun login & hak akses menu' },
  { id: 'laporan', label: 'Laporan Bulanan', desc: 'Laporan agregat & rekapan keuangan' },
];

export const ALL_MENU_IDS = ALL_MENU_ITEMS.map(item => item.id);

export const DEFAULT_PENGGUNA_APP: PenggunaApp[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    password: 'admin123',
    namaLengkap: 'Kiai Ahmad (Admin Utama)',
    role: 'ADMIN',
    status: 'Aktif',
    allowedMenus: [...ALL_MENU_IDS],
    jabatan: 'Kepala Sekretariat & IT',
    noHp: '081274569001',
    createdAt: '2026-01-01',
    lastLogin: '2026-08-01 18:00'
  },
  {
    id: 'usr-pengasuh-01',
    username: 'pengasuh',
    password: 'pengasuh123',
    namaLengkap: 'Ustd. Mahmud Hashem',
    role: 'PENGASUHAN',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'klinik', 'portal-orangtua', 'mutabaah', 'santri', 'guru', 'kamar', 'pelanggaran', 'laporan'],
    jabatan: 'Mudir Pengasuhan Asrama',
    noHp: '085266112233',
    createdAt: '2026-01-05',
    lastLogin: '2026-08-01 14:20'
  },
  {
    id: 'usr-akademik-01',
    username: 'akademik',
    password: 'akademik123',
    namaLengkap: 'Ust. Ridwan Saifullah',
    role: 'AKADEMIK',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'klinik', 'portal-orangtua', 'mutabaah', 'santri', 'guru', 'kamar', 'pelanggaran', 'prestasi', 'laporan'],
    jabatan: 'Kepala Bidang Kurikulum & KBM',
    noHp: '081388776655',
    createdAt: '2026-01-10',
    lastLogin: '2026-07-31 09:15'
  },
  {
    id: 'usr-musyrif-01',
    username: 'musyrif',
    password: 'musyrif123',
    namaLengkap: 'Ustadz Abdullah, S.Pd.I',
    role: 'GURU',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'kamar'],
    jabatan: 'Musyrif Halaqah Al-Fatih (Pa)',
    noHp: '081299001122',
    createdAt: '2026-02-10',
    lastLogin: '2026-08-12 05:00'
  },
  {
    id: 'usr-musyrif-02',
    username: 'musyrif_zayd',
    password: 'zayd123',
    namaLengkap: 'Ustadz Zayd bin Tsabit',
    role: 'GURU',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'kamar'],
    jabatan: 'Musyrif Halaqah Bilal bin Rabah (Pa)',
    noHp: '081299003344',
    createdAt: '2026-02-12',
    lastLogin: '2026-08-12 05:30'
  },
  {
    id: 'usr-musyrifah-01',
    username: 'musyrifah',
    password: 'musyrifah123',
    namaLengkap: 'Ustadzah Khadijah, S.Ag',
    role: 'GURU',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'kamar'],
    jabatan: 'Musyrifah Halaqah Maryam (Pi)',
    noHp: '081299005566',
    createdAt: '2026-02-15',
    lastLogin: '2026-08-12 06:00'
  },
  {
    id: 'usr-musyrifah-02',
    username: 'musyrifah_zainab',
    password: 'zainab123',
    namaLengkap: 'Ustadzah Zainab Al-Hafizhah',
    role: 'GURU',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'kamar'],
    jabatan: 'Musyrifah Halaqah Hafidzah Mutqinah (Pi)',
    noHp: '081299007788',
    createdAt: '2026-02-18',
    lastLogin: '2026-08-12 06:15'
  },
  {
    id: 'usr-klinik-01',
    username: 'klinik',
    password: 'klinik123',
    namaLengkap: 'dr. H. Syarif Hidayatullah',
    role: 'PETUGAS_KLINIK',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'klinik', 'santri', 'kamar'],
    jabatan: 'Penanggung Jawab Poskestren',
    noHp: '082199887766',
    createdAt: '2026-02-01',
    lastLogin: '2026-08-01 08:30'
  },
  {
    id: 'usr-orangtua-01',
    username: 'orangtua',
    password: 'orangtua123',
    namaLengkap: 'Bapak H. Ahmad Subarjo (Wali Santri)',
    role: 'ORANG_TUA',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'portal-orangtua', 'mutabaah', 'santri', 'klinik', 'prestasi', 'pelanggaran'],
    jabatan: 'Wali Santri (Orang Tua)',
    noHp: '081234567890',
    createdAt: '2026-03-01',
    lastLogin: '2026-08-01 10:15'
  }
];
