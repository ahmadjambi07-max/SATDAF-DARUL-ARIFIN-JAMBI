import { RecordSetoranTahfidz, ProfilGamifikasiSantri, LevelRankTahfidz, BadgeTahfidz, Santri, MajelisHalaqah } from '../types';

export interface SurahItem {
  no: number;
  nama: string;
  namaArab: string;
  jumlahAyat: number;
  juzDefault: number;
}

export const SURAH_LIST: SurahItem[] = [
  { no: 1, nama: 'Al-Fatihah', namaArab: 'الفاتحة', jumlahAyat: 7, juzDefault: 1 },
  { no: 2, nama: 'Al-Baqarah', namaArab: 'البقرة', jumlahAyat: 286, juzDefault: 1 },
  { no: 3, nama: 'Ali \'Imran', namaArab: 'آل عمران', jumlahAyat: 200, juzDefault: 3 },
  { no: 4, nama: 'An-Nisa\'', namaArab: 'النساء', jumlahAyat: 176, juzDefault: 4 },
  { no: 5, nama: 'Al-Ma\'idah', namaArab: 'المائدة', jumlahAyat: 120, juzDefault: 6 },
  { no: 6, nama: 'Al-An\'am', namaArab: 'الأنعام', jumlahAyat: 165, juzDefault: 7 },
  { no: 7, nama: 'Al-A\'raf', namaArab: 'الأعراف', jumlahAyat: 206, juzDefault: 8 },
  { no: 8, nama: 'Al-Anfal', namaArab: 'الأنفال', jumlahAyat: 75, juzDefault: 9 },
  { no: 9, nama: 'At-Taubah', namaArab: 'التوبة', jumlahAyat: 129, juzDefault: 10 },
  { no: 10, nama: 'Yunus', namaArab: 'يونس', jumlahAyat: 109, juzDefault: 11 },
  { no: 18, nama: 'Al-Kahf', namaArab: 'الكهف', jumlahAyat: 110, juzDefault: 15 },
  { no: 36, nama: 'Yasin', namaArab: 'يس', jumlahAyat: 83, juzDefault: 22 },
  { no: 55, nama: 'Ar-Rahman', namaArab: 'الرحمن', jumlahAyat: 78, juzDefault: 27 },
  { no: 56, nama: 'Al-Waqi\'ah', namaArab: 'الواقعة', jumlahAyat: 96, juzDefault: 27 },
  { no: 67, nama: 'Al-Mulk', namaArab: 'الملك', jumlahAyat: 30, juzDefault: 29 },
  { no: 78, nama: 'An-Naba\'', namaArab: 'النبأ', jumlahAyat: 40, juzDefault: 30 },
  { no: 79, nama: 'An-Nazi\'at', namaArab: 'النازعات', jumlahAyat: 46, juzDefault: 30 },
  { no: 80, nama: '\'Abasa', namaArab: 'عبس', jumlahAyat: 42, juzDefault: 30 },
  { no: 81, nama: 'At-Takwir', namaArab: 'التكوير', jumlahAyat: 29, juzDefault: 30 },
  { no: 82, nama: 'Al-Infitar', namaArab: 'الإنفطار', jumlahAyat: 19, juzDefault: 30 },
  { no: 83, nama: 'Al-Mutaffifin', namaArab: 'المطففين', jumlahAyat: 36, juzDefault: 30 },
  { no: 84, nama: 'Al-Insyiqaq', namaArab: 'الإنشقاق', jumlahAyat: 25, juzDefault: 30 },
  { no: 85, nama: 'Al-Buruj', namaArab: 'البروج', jumlahAyat: 22, juzDefault: 30 },
  { no: 86, nama: 'At-Tariq', namaArab: 'الطارق', jumlahAyat: 17, juzDefault: 30 },
  { no: 87, nama: 'Al-A\'la', namaArab: 'الأعلى', jumlahAyat: 19, juzDefault: 30 },
  { no: 88, nama: 'Al-Ghasyiyah', namaArab: 'الغاشية', jumlahAyat: 26, juzDefault: 30 },
  { no: 89, nama: 'Al-Fajr', namaArab: 'الفجر', jumlahAyat: 30, juzDefault: 30 },
  { no: 90, nama: 'Al-Balad', namaArab: 'البلد', jumlahAyat: 20, juzDefault: 30 },
  { no: 91, nama: 'Asy-Syams', namaArab: 'الشمس', jumlahAyat: 15, juzDefault: 30 },
  { no: 92, nama: 'Al-Lail', namaArab: 'الليل', jumlahAyat: 21, juzDefault: 30 },
  { no: 93, nama: 'Ad-Duha', namaArab: 'الضحى', jumlahAyat: 11, juzDefault: 30 },
  { no: 94, nama: 'Asy-Syarh', namaArab: 'الشرح', jumlahAyat: 8, juzDefault: 30 },
  { no: 95, nama: 'At-Tin', namaArab: 'التين', jumlahAyat: 8, juzDefault: 30 },
  { no: 96, nama: 'Al-\'Alaq', namaArab: 'العلق', jumlahAyat: 19, juzDefault: 30 },
  { no: 97, nama: 'Al-Qadr', namaArab: 'القدر', jumlahAyat: 5, juzDefault: 30 },
  { no: 98, nama: 'Al-Bayyinah', namaArab: 'البينة', jumlahAyat: 8, juzDefault: 30 },
  { no: 99, nama: 'Az-Zalzalah', namaArab: 'Zalzalah', jumlahAyat: 8, juzDefault: 30 },
  { no: 100, nama: 'Al-\'Adiyat', namaArab: 'العاديات', jumlahAyat: 11, juzDefault: 30 },
  { no: 101, nama: 'Al-Qari\'ah', namaArab: 'القارعة', jumlahAyat: 11, juzDefault: 30 },
  { no: 102, nama: 'At-Takasur', namaArab: 'التكاثر', jumlahAyat: 8, juzDefault: 30 },
  { no: 103, nama: 'Al-\'Asr', namaArab: 'العصر', jumlahAyat: 3, juzDefault: 30 },
  { no: 104, nama: 'Al-Humazah', namaArab: 'الهمزة', jumlahAyat: 9, juzDefault: 30 },
  { no: 105, nama: 'Al-Fil', namaArab: 'الفيل', jumlahAyat: 5, juzDefault: 30 },
  { no: 106, nama: 'Quraisy', namaArab: 'قريش', jumlahAyat: 4, juzDefault: 30 },
  { no: 107, nama: 'Al-Ma\'un', namaArab: 'المواعون', jumlahAyat: 7, juzDefault: 30 },
  { no: 108, nama: 'Al-Kausar', namaArab: 'الكوثر', jumlahAyat: 3, juzDefault: 30 },
  { no: 109, nama: 'Al-Kafirun', namaArab: 'Kafirun', jumlahAyat: 6, juzDefault: 30 },
  { no: 110, nama: 'An-Nasr', namaArab: 'النصر', jumlahAyat: 3, juzDefault: 30 },
  { no: 111, nama: 'Al-Lahab', namaArab: 'اللمس', jumlahAyat: 5, juzDefault: 30 },
  { no: 112, nama: 'Al-Ikhlas', namaArab: 'الإخلاص', jumlahAyat: 4, juzDefault: 30 },
  { no: 113, nama: 'Al-Falaq', namaArab: 'الفلق', jumlahAyat: 5, juzDefault: 30 },
  { no: 114, nama: 'An-Nas', namaArab: 'الناس', jumlahAyat: 6, juzDefault: 30 }
];

export const ALL_BADGES: BadgeTahfidz[] = [
  {
    id: 'badge_penjaga_fajr',
    title: 'Penjaga Fajr',
    description: 'Murojaah dilakukan setelah Subuh selama 7 hari berturut-turut',
    iconName: 'Flame',
    colorBg: 'bg-amber-100 border-amber-300',
    colorText: 'text-amber-800'
  },
  {
    id: 'badge_istiqamah_warrior',
    title: 'Istiqamah Warrior',
    description: '30 hari murojaah berturut-turut tanpa putus',
    iconName: 'Shield',
    colorBg: 'bg-emerald-100 border-emerald-300',
    colorText: 'text-emerald-800'
  },
  {
    id: 'badge_penjaga_ayat',
    title: 'Penjaga Ayat',
    description: 'Lulus Murojaah 1 (Hafalan lancar 1 majelis, maks 3 bantuan)',
    iconName: 'CheckCircle2',
    colorBg: 'bg-teal-100 border-teal-300',
    colorText: 'text-teal-800'
  },
  {
    id: 'badge_hafalan_stabil',
    title: 'Hafalan Stabil',
    description: 'Lulus Murojaah 2 (Jawab 3 soal acak hafalan 4 hari sebelumnya)',
    iconName: 'Star',
    colorBg: 'bg-blue-100 border-blue-300',
    colorText: 'text-blue-800'
  },
  {
    id: 'badge_mutqin_diamond',
    title: 'Mutqin Diamond',
    description: 'Tercapai 40x murojaah pada satu juz (Disiplin & Mandiri)',
    iconName: 'Sparkles',
    colorBg: 'bg-purple-100 border-purple-300',
    colorText: 'text-purple-800'
  },
  {
    id: 'badge_penakluk_juz',
    title: 'Penakluk Juz',
    description: '1 juz disetor tuntas tanpa kesalahan (Setara Murojaah Mahir)',
    iconName: 'Award',
    colorBg: 'bg-indigo-100 border-indigo-300',
    colorText: 'text-indigo-800'
  },
  {
    id: 'badge_hafidz_3juz',
    title: 'Tahapan Hafidz - 3 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 3 juz',
    iconName: 'BookOpen',
    colorBg: 'bg-green-100 border-green-300',
    colorText: 'text-green-800'
  },
  {
    id: 'badge_hafidz_5juz',
    title: 'Tahapan Hafidz - 5 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 5 juz',
    iconName: 'BookOpen',
    colorBg: 'bg-emerald-100 border-emerald-300',
    colorText: 'text-emerald-900'
  },
  {
    id: 'badge_hafidz_10juz',
    title: 'Tahapan Hafidz - 10 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 10 juz',
    iconName: 'Trophy',
    colorBg: 'bg-amber-200 border-amber-400',
    colorText: 'text-amber-900'
  },
  {
    id: 'badge_hafidz_15juz',
    title: 'Tahapan Hafidz - 15 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 15 juz (Separuh Qur\'an)',
    iconName: 'Crown',
    colorBg: 'bg-yellow-200 border-yellow-400',
    colorText: 'text-yellow-900'
  },
  {
    id: 'badge_hafidz_20juz',
    title: 'Tahapan Hafidz - 20 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 20 juz',
    iconName: 'Crown',
    colorBg: 'bg-orange-200 border-orange-400',
    colorText: 'text-orange-950'
  },
  {
    id: 'badge_hafidz_25juz',
    title: 'Tahapan Hafidz - 25 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 25 juz',
    iconName: 'Crown',
    colorBg: 'bg-rose-200 border-rose-400',
    colorText: 'text-rose-950'
  },
  {
    id: 'badge_hafidz_30juz',
    title: 'Tahapan Hafidz - 30 Juz',
    description: 'Total juz hafalan tervalidasi guru mencapai 30 juz (Khatam Mutqin)',
    iconName: 'Crown',
    colorBg: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border-amber-500',
    colorText: 'text-amber-950 font-black'
  },
  {
    id: 'badge_pemburu_bunyi',
    title: 'Pemburu Bunyi (Tahsin)',
    description: 'Lulus Menara Pembeda Bunyi (Seluruh 10 Boss Battle tuntas)',
    iconName: 'Zap',
    colorBg: 'bg-cyan-100 border-cyan-300',
    colorText: 'text-cyan-800'
  },
  {
    id: 'badge_master_tilawah',
    title: 'Master Tilawah',
    description: 'Jalan Tilawah selesai: 9 level + Khatam Juz 1-5 + konsistensi (5 Crystal Tilawah Emas)',
    iconName: 'Medal',
    colorBg: 'bg-gradient-to-r from-teal-200 to-emerald-300 border-emerald-400',
    colorText: 'text-emerald-950 font-extrabold'
  }
];

// Reference Table Data according to PDF guide
export interface ReferensiXPItem {
  program: 'Tahsin' | 'Tahfidz';
  kategori: string;
  aktivitas: string;
  xp: number;
  keterangan?: string;
}

export const REFERENSI_XP_LIST: ReferensiXPItem[] = [
  // Tahsin Harian
  { program: 'Tahsin', kategori: 'Harian', aktivitas: 'Membaca latihan Carakan 5 kali', xp: 5 },
  { program: 'Tahsin', kategori: 'Harian', aktivitas: 'Menyelesaikan misi harian', xp: 10 },
  { program: 'Tahsin', kategori: 'Harian', aktivitas: 'Setor kepada guru', xp: 20 },
  { program: 'Tahsin', kategori: 'Harian', aktivitas: 'Lulus tanpa koreksi (bonus)', xp: 10 },
  // Tahsin Kelulusan
  { program: 'Tahsin', kategori: 'Kelulusan', aktivitas: 'Lulus satu huruf', xp: 20 },
  { program: 'Tahsin', kategori: 'Kelulusan', aktivitas: 'Lulus Boss Battle', xp: 50 },
  { program: 'Tahsin', kategori: 'Kelulusan', aktivitas: 'Lulus Menara Pembeda Bunyi', xp: 75 },
  // Tahsin Al-Quran
  { program: 'Tahsin', kategori: 'Al-Quran', aktivitas: 'Membaca 2 baris Al-Qur\'an', xp: 10 },
  { program: 'Tahsin', kategori: 'Al-Quran', aktivitas: 'Membaca 1 halaman Al-Qur\'an', xp: 50 },
  // Tahsin Area
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Menyelesaikan latihan (area)', xp: 20 },
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Menemukan contoh (area)', xp: 10 },
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Setor (area)', xp: 20 },
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Tanpa koreksi (area)', xp: 10 },
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Bonus sempurna (area)', xp: 20 },
  { program: 'Tahsin', kategori: 'Area', aktivitas: 'Bonus area lengkap', xp: 100 },
  // Tahsin Jalan Tilawah
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Menyelesaikan 1 hari', xp: 10 },
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Menyelesaikan 1 level', xp: 50 },
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Menyelesaikan 1 juz (khatam)', xp: 100 },
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Konsisten 7 hari berturut-turut', xp: 50 },
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Konsisten 30 hari berturut-turut', xp: 200 },
  { program: 'Tahsin', kategori: 'Jalan Tilawah', aktivitas: 'Khatam Juz 5 (selesai)', xp: 500 },

  // Tahfidz Harian
  { program: 'Tahfidz', kategori: 'Harian', aktivitas: 'Setoran 1 halaman', xp: 10 },
  { program: 'Tahfidz', kategori: 'Harian', aktivitas: 'Setoran 2 halaman', xp: 30 },
  // Tahfidz Murojaah
  { program: 'Tahfidz', kategori: 'Murojaah', aktivitas: 'Murojaah 2 halaman', xp: 10 },
  { program: 'Tahfidz', kategori: 'Murojaah', aktivitas: 'Murojaah 5 halaman', xp: 25 },
  { program: 'Tahfidz', kategori: 'Murojaah', aktivitas: 'Murojaah 10 halaman', xp: 60 },
  { program: 'Tahfidz', kategori: 'Murojaah', aktivitas: 'Murojaah 1 juz', xp: 150 },
  // Tahfidz Kualitas
  { program: 'Tahfidz', kategori: 'Kualitas', aktivitas: 'Tajwid sangat baik', xp: 10 },
  { program: 'Tahfidz', kategori: 'Kualitas', aktivitas: 'Tanpa kesalahan', xp: 20 },
  { program: 'Tahfidz', kategori: 'Kualitas', aktivitas: 'Tasmi\' lancar', xp: 30 },
  // Tahfidz Ujian
  { program: 'Tahfidz', kategori: 'Ujian', aktivitas: 'Lulus Murojaah 1', xp: 50 },
  { program: 'Tahfidz', kategori: 'Ujian', aktivitas: 'Lulus Murojaah 2', xp: 80 },
  { program: 'Tahfidz', kategori: 'Ujian', aktivitas: 'Murojaah Mahir', xp: 200 },
  // Tahfidz Istiqamah
  { program: 'Tahfidz', kategori: 'Istiqamah', aktivitas: '7 hari berturut-turut setor', xp: 50 },
  { program: 'Tahfidz', kategori: 'Istiqamah', aktivitas: '14 hari berturut-turut', xp: 120 },
  { program: 'Tahfidz', kategori: 'Istiqamah', aktivitas: '30 hari berturut-turut', xp: 300 }
];

// Tabel 9 Level Jalan Tilawah
export interface LevelJalanTilawahItem {
  level: number;
  targetPerShalat: string;
  durasiWajibHari: number;
}

export const TABEL_JALAN_TILAWAH: LevelJalanTilawahItem[] = [
  { level: 1, targetPerShalat: '1 baris', durasiWajibHari: 28 },
  { level: 2, targetPerShalat: '2 baris', durasiWajibHari: 13 },
  { level: 3, targetPerShalat: '3 baris', durasiWajibHari: 18 },
  { level: 4, targetPerShalat: '4 baris', durasiWajibHari: 19 },
  { level: 5, targetPerShalat: '5 baris', durasiWajibHari: 6 },
  { level: 6, targetPerShalat: '6 baris', durasiWajibHari: 6 },
  { level: 7, targetPerShalat: '7 baris', durasiWajibHari: 6 },
  { level: 8, targetPerShalat: '1/2 halaman', durasiWajibHari: 6 },
  { level: 9, targetPerShalat: '1 halaman', durasiWajibHari: 6 }
];

// Official Tahfidz Levels Reference
export interface OfficialTahfidzLevel {
  level: number;
  namaLevel: string;
  syaratPemberian: string;
}

export const OFFICIAL_TAHFIDZ_LEVELS: OfficialTahfidzLevel[] = [
  { level: 1, namaLevel: 'Penjaga Huruf', syaratPemberian: 'Murojaah dasar - mampu membaca dan menjaga hafalan awal' },
  { level: 2, namaLevel: 'Penjaga Ayat', syaratPemberian: 'Lulus Murojaah 1 - hafalan lancar 1 majelis, maksimal 3 bantuan' },
  { level: 3, namaLevel: 'Penjaga Halaman', syaratPemberian: 'Lulus Murojaah 2 - jawab 3 soal acak hafalan 4 hari sebelumnya' },
  { level: 4, namaLevel: 'Penakluk Juz', syaratPemberian: 'Murojaah Mahir - satu juz selesai tanpa kesalahan' },
  { level: 5, namaLevel: 'Pejuang Istiqamah', syaratPemberian: 'Murojaah 40 kali secara mandiri dengan disiplin / ulang seluruh hafalan tiap 10 hari' },
  { level: 6, namaLevel: 'Mutqin Master', syaratPemberian: 'Seluruh 10 Boss Battle tuntas / Mutqin Diamond' }
];

export function calculateXPForSetoran(
  tipe: 'Hafalan Baru (Ziyadah)' | 'Muroja\'ah Hafalan' | 'Tilawah / Membaca Qur\'an',
  kelancaran: 'Mumtaz (A+)' | 'Jayyid Jiddan (A)' | 'Jayyid (B)' | 'Maqbul (C)',
  halamanJumlah: number,
  isStreak: boolean = false
): number {
  let baseXP = 0;
  if (tipe === 'Hafalan Baru (Ziyadah)') {
    baseXP = 80 * Math.max(1, halamanJumlah);
  } else if (tipe === 'Muroja\'ah Hafalan') {
    baseXP = 50 * Math.max(1, halamanJumlah);
  } else {
    // Tilawah / Membaca
    baseXP = 30 * Math.max(1, halamanJumlah);
  }

  let multiplier = 1.0;
  switch (kelancaran) {
    case 'Mumtaz (A+)':
      multiplier = 1.25;
      break;
    case 'Jayyid Jiddan (A)':
      multiplier = 1.0;
      break;
    case 'Jayyid (B)':
      multiplier = 0.75;
      break;
    case 'Maqbul (C)':
      multiplier = 0.5;
      break;
  }

  let finalXP = Math.round(baseXP * multiplier);
  if (isStreak) {
    finalXP += 25; // Bonus streak
  }
  return finalXP;
}

export function getRankInfoFromXP(totalXP: number): {
  level: number;
  rankTitle: LevelRankTahfidz;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  nextLevelXP: number;
  progressPercent: number;
} {
  if (totalXP >= 2000) {
    return {
      level: 5,
      rankTitle: 'Al-Hafiz Al-Kamil',
      badgeBg: 'bg-gradient-to-r from-amber-500 via-purple-600 to-indigo-600',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-white font-black',
      nextLevelXP: 3000,
      progressPercent: Math.min(100, Math.round((totalXP / 3000) * 100))
    };
  } else if (totalXP >= 1200) {
    return {
      level: 4,
      rankTitle: 'Hamilul Qur\'an',
      badgeBg: 'bg-gradient-to-r from-emerald-600 to-teal-700',
      badgeBorder: 'border-emerald-300',
      badgeText: 'text-white font-bold',
      nextLevelXP: 2000,
      progressPercent: Math.round(((totalXP - 1200) / 800) * 100)
    };
  } else if (totalXP >= 700) {
    return {
      level: 3,
      rankTitle: 'Mutqin Muda',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-amber-600',
      badgeBorder: 'border-amber-200',
      badgeText: 'text-amber-950 font-bold',
      nextLevelXP: 1200,
      progressPercent: Math.round(((totalXP - 700) / 500) * 100)
    };
  } else if (totalXP >= 300) {
    return {
      level: 2,
      rankTitle: 'Hafiz Pemula',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-400',
      badgeBorder: 'border-slate-200',
      badgeText: 'text-slate-900 font-bold',
      nextLevelXP: 700,
      progressPercent: Math.round(((totalXP - 300) / 400) * 100)
    };
  } else {
    return {
      level: 1,
      rankTitle: 'Thalibul \'Ilmi',
      badgeBg: 'bg-amber-800/80',
      badgeBorder: 'border-amber-600',
      badgeText: 'text-amber-100 font-bold',
      nextLevelXP: 300,
      progressPercent: Math.round((totalXP / 300) * 100)
    };
  }
}

export const DEFAULT_TAHFIDZ_SETORAN: RecordSetoranTahfidz[] = [
  {
    id: 'tfd_1',
    idSantri: 's1',
    namaSantri: 'Abdullah Ahmad',
    kelasSantri: '7A',
    tanggal: '2026-08-12',
    waktu: '06:30',
    tipeSetoran: 'Hafalan Baru (Ziyadah)',
    surahMulai: 'An-Naba\'',
    ayatMulai: 1,
    surahSelesai: 'An-Naba\'',
    ayatSelesai: 40,
    juzNumber: 30,
    halamanJumlah: 2,
    kelancaran: 'Mumtaz (A+)',
    xpObtained: 225, // 160 * 1.25 + 25 bonus streak
    musyrifNama: 'Ustadz Abdullah, S.Pd.I',
    catatanMusyrif: 'Makhraj sangat tajam, tajwid tertib. Memenuhi syarat naik ke Surah An-Nazi\'at.',
    isStreakBonusApplied: true
  },
  {
    id: 'tfd_2',
    idSantri: 's2',
    namaSantri: 'Muhammad Farhan',
    kelasSantri: '7A',
    tanggal: '2026-08-12',
    waktu: '06:45',
    tipeSetoran: 'Muroja\'ah Hafalan',
    surahMulai: 'Al-Mulk',
    ayatMulai: 1,
    surahSelesai: 'Al-Mulk',
    ayatSelesai: 30,
    juzNumber: 29,
    halamanJumlah: 2,
    kelancaran: 'Mumtaz (A+)',
    xpObtained: 150,
    musyrifNama: 'Ustadz Abdullah, S.Pd.I',
    catatanMusyrif: 'Lancar luar kepala. Sangat terbiasa dengan irama Nahawand.',
    isStreakBonusApplied: true
  },
  {
    id: 'tfd_3',
    idSantri: 's3',
    namaSantri: 'Ahmad Rizky',
    kelasSantri: '8A',
    tanggal: '2026-08-11',
    waktu: '16:15',
    tipeSetoran: 'Hafalan Baru (Ziyadah)',
    surahMulai: 'An-Nazi\'at',
    ayatMulai: 1,
    surahSelesai: 'An-Nazi\'at',
    ayatSelesai: 26,
    juzNumber: 30,
    halamanJumlah: 1.5,
    kelancaran: 'Jayyid Jiddan (A)',
    xpObtained: 120,
    musyrifNama: 'Ustadz M. Ridwan, M.Ag',
    catatanMusyrif: 'Perhatikan Ghunnah di ayat 15-18.',
    isStreakBonusApplied: false
  },
  {
    id: 'tfd_4',
    idSantri: 's4',
    namaSantri: 'Zaidan Ali',
    kelasSantri: '9A',
    tanggal: '2026-08-11',
    waktu: '06:20',
    tipeSetoran: 'Tilawah / Membaca Qur\'an',
    surahMulai: 'Al-Kahf',
    ayatMulai: 1,
    surahSelesai: 'Al-Kahf',
    ayatSelesai: 110,
    juzNumber: 15,
    halamanJumlah: 11,
    kelancaran: 'Mumtaz (A+)',
    xpObtained: 412,
    musyrifNama: 'Ustadz Abdullah, S.Pd.I',
    catatanMusyrif: 'Membaca dengan tartil dalam Halaqah Shubuh.',
    isStreakBonusApplied: true
  },
  {
    id: 'tfd_5',
    idSantri: 's5',
    namaSantri: 'Maryam Safiyyah',
    kelasSantri: '7B',
    tanggal: '2026-08-10',
    waktu: '16:30',
    tipeSetoran: 'Hafalan Baru (Ziyadah)',
    surahMulai: 'Al-A\'la',
    ayatMulai: 1,
    surahSelesai: 'Al-Ghasyiyah',
    ayatSelesai: 26,
    juzNumber: 30,
    halamanJumlah: 2,
    kelancaran: 'Mumtaz (A+)',
    xpObtained: 200,
    musyrifNama: 'Ustadzah Fatimah, S.Ag',
    catatanMusyrif: 'Sangat halus bacaannya, Tajwid Mumtaz.',
    isStreakBonusApplied: false
  },
  {
    id: 'tfd_6',
    idSantri: 's1',
    namaSantri: 'Abdullah Ahmad',
    kelasSantri: '7A',
    tanggal: '2026-08-11',
    waktu: '06:30',
    tipeSetoran: 'Muroja\'ah Hafalan',
    surahMulai: 'An-Naba\'',
    ayatMulai: 1,
    surahSelesai: 'An-Naba\'',
    ayatSelesai: 40,
    juzNumber: 30,
    halamanJumlah: 2,
    kelancaran: 'Mumtaz (A+)',
    xpObtained: 125,
    musyrifNama: 'Ustadz Abdullah, S.Pd.I',
    catatanMusyrif: 'Murojaah harian sangat mantap.',
    isStreakBonusApplied: true
  },
  {
    id: 'tfd_7',
    idSantri: 's2',
    namaSantri: 'Muhammad Farhan',
    kelasSantri: '7A',
    tanggal: '2026-08-10',
    waktu: '06:40',
    tipeSetoran: 'Hafalan Baru (Ziyadah)',
    surahMulai: 'Al-Mulk',
    ayatMulai: 1,
    surahSelesai: 'Al-Mulk',
    ayatSelesai: 30,
    juzNumber: 29,
    halamanJumlah: 2,
    kelancaran: 'Jayyid Jiddan (A)',
    xpObtained: 160,
    musyrifNama: 'Ustadz Abdullah, S.Pd.I',
    catatanMusyrif: 'Persiapan bagus.',
    isStreakBonusApplied: false
  }
];

export function generateGamifikasiProfiles(
  setoranList: RecordSetoranTahfidz[],
  santriList: Santri[]
): ProfilGamifikasiSantri[] {
  const profileMap = new Map<string, ProfilGamifikasiSantri>();

  // Ensure all registered active santri have a profile
  santriList.forEach((s) => {
    profileMap.set(s.id, {
      idSantri: s.id,
      namaSantri: s.nama,
      kelasSantri: s.kelas || 'Umum',
      totalXP: 0, // Baseline entry XP
      level: 1,
      rankTitle: 'Thalibul \'Ilmi',
      totalHalamanHafalan: 0,
      totalJuzHafal: 0,
      totalJuzTilawah: 0,
      streakDays: 0,
      badges: [] // No badges initially
    });
  });

  // Calculate stats from setoran list
  setoranList.forEach((st) => {
    let p = profileMap.get(st.idSantri);
    if (!p) {
      p = {
        idSantri: st.idSantri,
        namaSantri: st.namaSantri,
        kelasSantri: st.kelasSantri || 'Umum',
        totalXP: 0,
        level: 1,
        rankTitle: 'Thalibul \'Ilmi',
        totalHalamanHafalan: 0,
        totalJuzHafal: 0,
        totalJuzTilawah: 0,
        streakDays: 0,
        badges: []
      };
      profileMap.set(st.idSantri, p);
    }

    p.totalXP += st.xpObtained;
    if (st.tipeSetoran === 'Hafalan Baru (Ziyadah)') {
      p.totalHalamanHafalan += st.halamanJumlah;
    } else if (st.tipeSetoran === 'Tilawah / Membaca Qur\'an') {
      p.totalJuzTilawah += st.halamanJumlah / 20; // 20 halaman = 1 juz approx
    } else {
      p.totalHalamanHafalan += (st.halamanJumlah * 0.5); // Murojaah adds weight
    }

    // Update level and rank title
    const rInfo = getRankInfoFromXP(p.totalXP);
    p.level = rInfo.level;
    p.rankTitle = rInfo.rankTitle;

    // Estimate juz hafal
    p.totalJuzHafal = parseFloat((p.totalHalamanHafalan / 20).toFixed(1));

    // Dynamic badge unlocks
    const userBadges = new Set<string>(p.badges.map(b => b.id));
    
    // Fajr Subuh & Istiqamah Streak
    if (st.waktu && st.waktu <= '07:00') {
      userBadges.add('badge_penjaga_fajr');
    }
    if (st.isStreakBonusApplied || p.totalXP > 300) {
      p.streakDays = Math.max(p.streakDays, 7);
      userBadges.add('badge_penjaga_fajr');
    }
    if (p.streakDays >= 30 || p.totalXP >= 1000) {
      userBadges.add('badge_istiqamah_warrior');
    }

    // Quality & Ujian Badges
    if (st.kelancaran === 'Mumtaz (A+)') {
      userBadges.add('badge_penjaga_ayat');
    }
    if (p.totalXP >= 500) {
      userBadges.add('badge_hafalan_stabil');
    }
    if (p.totalXP >= 800) {
      userBadges.add('badge_mutqin_diamond');
    }
    if (st.halamanJumlah >= 20 || p.totalJuzHafal >= 1) {
      userBadges.add('badge_penakluk_juz');
    }

    // Milestone Juz Badges
    if (p.totalJuzHafal >= 3) userBadges.add('badge_hafidz_3juz');
    if (p.totalJuzHafal >= 5) userBadges.add('badge_hafidz_5juz');
    if (p.totalJuzHafal >= 10) userBadges.add('badge_hafidz_10juz');
    if (p.totalJuzHafal >= 15) userBadges.add('badge_hafidz_15juz');
    if (p.totalJuzHafal >= 20) userBadges.add('badge_hafidz_20juz');
    if (p.totalJuzHafal >= 25) userBadges.add('badge_hafidz_25juz');
    if (p.totalJuzHafal >= 30) userBadges.add('badge_hafidz_30juz');

    p.badges = ALL_BADGES.filter(b => userBadges.has(b.id));
  });

  return Array.from(profileMap.values()).sort((a, b) => b.totalXP - a.totalXP);
}

export const INITIAL_MAJELIS_HALAQAH: MajelisHalaqah[] = [
  // 1. MUBTADI'IN (Putra & Putri)
  {
    id: 'maj_mubtadiin_pa_1',
    namaMajelis: 'Majelis Mubtadi\'in Al-Fatih (Pa)',
    tingkat: "Mubtadi'in",
    gender: 'Laki-laki',
    musyrif: 'Ustadz Ahmad Farhan',
    lokasi: 'Masjid Lantai 1 - Sayap Kanan',
    jadwal: 'Ba\'da Subuh & Ba\'da Asar',
    targetSelesai: 'Pembelajaran Iqra 1-6 & Juz 30 (Juz Amma)',
    keterangan: 'Khusus santri putra tingkat dasar pemula tajwid dan makhraj.',
    santriIds: ['1', '3', '5']
  },
  {
    id: 'maj_mubtadiin_pa_2',
    namaMajelis: 'Majelis Mubtadi\'in An-Nur (Pa)',
    tingkat: "Mubtadi'in",
    gender: 'Laki-laki',
    musyrif: 'Ustadz Ridwan Malik',
    lokasi: 'Selasar Serbaguna Utama',
    jadwal: 'Ba\'da Maghrib & Ba\'da Isya',
    targetSelesai: 'Kelulusan Tajwid Dasar & Surat-surat Pendek',
    keterangan: 'Pendampingan khusus tajwid binaan awal.',
    santriIds: ['7', '9']
  },
  {
    id: 'maj_mubtadiin_pi_1',
    namaMajelis: 'Majelis Mubtadi\'in Fatimah Az-Zahra (Pi)',
    tingkat: "Mubtadi'in",
    gender: 'Perempuan',
    musyrif: 'Ustadzah Khadijah',
    lokasi: 'Musalla Putri - Karpet Hijau',
    jadwal: 'Ba\'da Subuh & Ba\'da Asar',
    targetSelesai: 'Tahsin Huruf Hijaiyah & Matan Jazariyyah Dasar',
    keterangan: 'Khusus santri putri dasar tajwid & kelancaran membaca.',
    santriIds: ['2', '4']
  },
  {
    id: 'maj_mubtadiin_pi_2',
    namaMajelis: 'Majelis Mubtadi\'in Maryam Al-Adawiyah (Pi)',
    tingkat: "Mubtadi'in",
    gender: 'Perempuan',
    musyrif: 'Ustadzah Zaitun',
    lokasi: 'Gazebo Putri 02',
    jadwal: 'Ba\'da Maghrib',
    targetSelesai: 'Pengenalan Makhraj & Sifat Huruf',
    keterangan: 'Bimbingan intensif makhraj dan kelancaran membaca Al-Qur\'an.',
    santriIds: ['6', '8']
  },

  // 2. WUSTHO (Putra & Putri)
  {
    id: 'maj_wustho_pa_1',
    namaMajelis: 'Majelis Wustho Al-Hikmah (Pa)',
    tingkat: 'Wustho',
    gender: 'Laki-laki',
    musyrif: 'Ustadz Zulkifli Hasan',
    lokasi: 'Masjid Lantai 2 - Pojok Mihrab',
    jadwal: 'Ba\'da Subuh & Ba\'da Maghrib',
    targetSelesai: 'Muroja\'ah Lancar Juz 1 - 5 & Binnazhar 30 Juz',
    keterangan: 'Pendampingan kelancaran bacaan Binnazhar dan hafalan tingkat menengah.',
    santriIds: ['10', '12']
  },
  {
    id: 'maj_wustho_pa_2',
    namaMajelis: 'Majelis Wustho Al-Furqan (Pa)',
    tingkat: 'Wustho',
    gender: 'Laki-laki',
    musyrif: 'Ustadz Luqman Hakim',
    lokasi: 'Perpustakaan Qur\'an Putra',
    jadwal: 'Ba\'da Asar & Ba\'da Isya',
    targetSelesai: 'Peningkatan Kecepatan Bacaan & Mutqin Juz 29-30',
    keterangan: 'Program transisi dari Tahsin ke Tahfidz Murni.',
    santriIds: ['11', '13']
  },
  {
    id: 'maj_wustho_pi_1',
    namaMajelis: 'Majelis Wustho Aisyah Ar-Rasyidah (Pi)',
    tingkat: 'Wustho',
    gender: 'Perempuan',
    musyrif: 'Ustadzah Aminah Nur',
    lokasi: 'Aula Putri Lantai 1',
    jadwal: 'Ba\'da Subuh & Ba\'da Maghrib',
    targetSelesai: 'Setoran Binnazhar Juz 1-10 & Tajwid Terapan',
    keterangan: 'Penguatan kelancaran tilawah & tajwid mahir santri putri.',
    santriIds: ['14', '16']
  },
  {
    id: 'maj_wustho_pi_2',
    namaMajelis: 'Majelis Wustho Asma Binti Abu Bakar (Pi)',
    tingkat: 'Wustho',
    gender: 'Perempuan',
    musyrif: 'Ustadzah Salma',
    lokasi: 'Selasar Musalla Putri',
    jadwal: 'Ba\'da Asar',
    targetSelesai: 'Muroja\'ah Berkala Juz 28, 29, 30',
    keterangan: 'Majelis persiapan tasmi\' santri putri menengah.',
    santriIds: ['15']
  },

  // 3. TAHFIDZ (Putra & Putri)
  {
    id: 'maj_tahfidz_pa_1',
    namaMajelis: 'Majelis Tahfidz Mutqin 30 Juz (Pa)',
    tingkat: 'Tahfidz',
    gender: 'Laki-laki',
    musyrif: 'Ustadz Hamzah Al-Hafiz',
    lokasi: 'Ruang Khusus Tahfidz Center Pa',
    jadwal: '03:30 (Qiyamul Lail) & Ba\'da Subuh & Ba\'da Maghrib',
    targetSelesai: 'Target Ziyadah 1 Halaman/Hari & Mutqin 30 Juz',
    keterangan: 'Majelis akselerasi hafalan murni & tasmi\' sekali duduk.',
    santriIds: ['1', '5', '10']
  },
  {
    id: 'maj_tahfidz_pa_2',
    namaMajelis: 'Majelis Tahfidz Al-Kahfi (Pa)',
    tingkat: 'Tahfidz',
    gender: 'Laki-laki',
    musyrif: 'Ustadz Ibrahim Mansur',
    lokasi: 'Masjid Lantai 1 - Sayap Kiri',
    jadwal: 'Ba\'da Subuh & Ba\'da Asar',
    targetSelesai: 'Ziyadah Juz 1 - 15 & Muroja\'ah Harian 1 Juz',
    keterangan: 'Pendampingan ziayadah harian dan ujian muroja\'ah berkala.',
    santriIds: ['3', '7']
  },
  {
    id: 'maj_tahfidz_pi_1',
    namaMajelis: 'Majelis Tahfidz Hafidzah Mutqinah (Pi)',
    tingkat: 'Tahfidz',
    gender: 'Perempuan',
    musyrif: 'Ustadzah Zainab Al-Hafizhah',
    lokasi: 'Ruang Tahfidz Center Putri',
    jadwal: '03:30 (Qiyamul Lail) & Ba\'da Subuh & Ba\'da Maghrib',
    targetSelesai: 'Khatam Ziyadah 30 Juz & Sanad Al-Qur\'an',
    keterangan: 'Majelis khusus hafidzah putri pencapai target 30 juz mutqin.',
    santriIds: ['2', '6', '14']
  },
  {
    id: 'maj_tahfidz_pi_2',
    namaMajelis: 'Majelis Tahfidz Ar-Rayyan (Pi)',
    tingkat: 'Tahfidz',
    gender: 'Perempuan',
    musyrif: 'Ustadzah Ruqayyah',
    lokasi: 'Musalla Putri Utama',
    jadwal: 'Ba\'da Subuh & Ba\'da Asar',
    targetSelesai: 'Target 10 Juz Mutqin & Ziyadah Konsisten',
    keterangan: 'Majelis hafalan murni santri putri bertarget.',
    santriIds: ['4', '8']
  }
];

