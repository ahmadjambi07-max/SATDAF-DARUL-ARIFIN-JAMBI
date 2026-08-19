// DARUL ARIFIN GAMIFICATION ENGINE (MASTER DATABASE & OPERATIONAL RULES)
// References: DARUL_ARIFIN_MASTER_DATABASE & DARUL_ARIFIN_OPERATIONAL_DATABASE

export interface LevelInfo {
  levelId: string;
  levelNumber: number;
  namaLevel: string;
  minXP: number;
  maxXP: number;
  badgeDefault?: string;
  warna: string;
  icon: string;
  tierGroup: string;
}

export interface AvatarTier {
  id: string;
  nama: string;
  minLevel: number;
  icon: string;
  warna: string;
  deskripsi: string;
}

export interface BadgeItem {
  id: string;
  nama: string;
  kategori: 'Ibadah' | 'Bahasa' | 'Tahfizh' | 'Akhlak' | 'Leadership' | 'Kebersihan' | 'Olahraga' | 'Akademik' | 'Sosial' | 'Istiqamah';
  jenis: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  icon: string;
  warna: string;
  deskripsi: string;
  xpBonus: number;
}

export interface AchievementItem {
  id: string;
  nama: string;
  kategori: string;
  syarat: string;
  xpReward: number;
  badgeRewardId?: string;
  reqProgress: number; // target count needed
}

export interface QuestItem {
  id: string;
  nama: string;
  kategori: string;
  jenis: 'Daily' | 'Weekly' | 'Monthly' | 'Semester';
  targetDeskripsi: string;
  xpBonus: number;
}

export interface SkillNode {
  id: string;
  parentId?: string;
  nama: string;
  kategori: string;
  maxLevel: number;
  xpPerLevel: number;
  icon: string;
}

export interface StreakLevel {
  id: string;
  jumlahHari: number;
  xpReward: number;
  badgeRewardId: string;
  titleReward: string;
  deskripsi: string;
}

export interface RPGTitle {
  id: string;
  title: string;
  syarat: string;
  minLevel: number;
  badgeRef?: string;
}

export interface RealReward {
  id: string;
  nama: string;
  kategori: string;
  jenis: 'Fisik' | 'Non Fisik' | string;
  deskripsi: string;
  syaratMinimum: string;
  estimasiNilaiRp: number;
  icon: string;
  aktif?: boolean;
}

export function isRewardUnlockedForSantri(
  syaratMinimum: string,
  level: number,
  streak: number,
  netXP: number,
  totalLogsRecorded: number = 0
): boolean {
  if (totalLogsRecorded === 0) return false;
  if (!syaratMinimum) return true;
  const lower = syaratMinimum.toLowerCase();

  // Level check e.g. "Level 1+", "Level 100", "Level 25+"
  const lvlMatch = lower.match(/level\s*(\d+)/);
  if (lvlMatch) {
    const requiredLvl = parseInt(lvlMatch[1], 10);
    if (level < requiredLvl) return false;
  }

  // Streak check e.g. "Streak 7 hari", "Streak 30 hari"
  const streakMatch = lower.match(/streak\s*(\d+)/);
  if (streakMatch) {
    const requiredStreak = parseInt(streakMatch[1], 10);
    if (streak < requiredStreak) return false;
  }

  // XP check e.g. "XP 2500", "XP 27000", "XP 35000"
  const xpMatch = lower.match(/xp\s*(\d+)/);
  if (xpMatch) {
    const requiredXP = parseInt(xpMatch[1], 10);
    if (netXP < requiredXP) return false;
  }

  return true;
}

// ----------------------------------------------------------------------
// 1. MASTER LEVELProgression (100 Levels)
// ----------------------------------------------------------------------
export const MASTER_LEVELS: LevelInfo[] = [
  // Pemula 1..10 (Lvl 1 - 10)
  { levelId: 'LVL001', levelNumber: 1, namaLevel: 'Pemula 1', minXP: 0, maxXP: 50, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL002', levelNumber: 2, namaLevel: 'Pemula 2', minXP: 51, maxXP: 154, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL003', levelNumber: 3, namaLevel: 'Pemula 3', minXP: 155, maxXP: 296, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL004', levelNumber: 4, namaLevel: 'Pemula 4', minXP: 297, maxXP: 472, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL005', levelNumber: 5, namaLevel: 'Pemula 5', minXP: 473, maxXP: 678, badgeDefault: 'B005', warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL006', levelNumber: 6, namaLevel: 'Pemula 6', minXP: 679, maxXP: 911, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL007', levelNumber: 7, namaLevel: 'Pemula 7', minXP: 912, maxXP: 1170, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL008', levelNumber: 8, namaLevel: 'Pemula 8', minXP: 1171, maxXP: 1452, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL009', levelNumber: 9, namaLevel: 'Pemula 9', minXP: 1453, maxXP: 1757, warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },
  { levelId: 'LVL010', levelNumber: 10, namaLevel: 'Pemula 10', minXP: 1758, maxXP: 2084, badgeDefault: 'B010', warna: '#90CAF9', icon: '🌱', tierGroup: 'Pemula' },

  // Santri Muda (Lvl 11 - 20)
  { levelId: 'LVL011', levelNumber: 11, namaLevel: 'Santri Muda 1', minXP: 2085, maxXP: 2432, warna: '#80CBC4', icon: '🍃', tierGroup: 'Santri Muda' },
  { levelId: 'LVL015', levelNumber: 15, namaLevel: 'Santri Muda 5', minXP: 3596, maxXP: 4020, badgeDefault: 'B015', warna: '#80CBC4', icon: '🍃', tierGroup: 'Santri Muda' },
  { levelId: 'LVL020', levelNumber: 20, namaLevel: 'Santri Muda 10', minXP: 5897, maxXP: 6407, badgeDefault: 'B020', warna: '#80CBC4', icon: '🍃', tierGroup: 'Santri Muda' },

  // Santri Madya (Lvl 21 - 30)
  { levelId: 'LVL021', levelNumber: 21, namaLevel: 'Santri Madya 1', minXP: 6408, maxXP: 6934, warna: '#A5D6A7', icon: '☘️', tierGroup: 'Santri Madya' },
  { levelId: 'LVL025', levelNumber: 25, namaLevel: 'Santri Madya 5', minXP: 8609, maxXP: 9197, badgeDefault: 'B025', warna: '#A5D6A7', icon: '☘️', tierGroup: 'Santri Madya' },
  { levelId: 'LVL030', levelNumber: 30, namaLevel: 'Santri Madya 10', minXP: 11697, maxXP: 12357, badgeDefault: 'B030', warna: '#A5D6A7', icon: '☘️', tierGroup: 'Santri Madya' },

  // Santri Utama (Lvl 31 - 40)
  { levelId: 'LVL031', levelNumber: 31, namaLevel: 'Santri Utama 1', minXP: 12358, maxXP: 13031, warna: '#FFF59D', icon: '⭐', tierGroup: 'Santri Utama' },
  { levelId: 'LVL035', levelNumber: 35, namaLevel: 'Santri Utama 5', minXP: 15135, maxXP: 15862, badgeDefault: 'B035', warna: '#FFF59D', icon: '⭐', tierGroup: 'Santri Utama' },
  { levelId: 'LVL040', levelNumber: 40, namaLevel: 'Santri Utama 10', minXP: 18902, maxXP: 19693, badgeDefault: 'B040', warna: '#FFF59D', icon: '⭐', tierGroup: 'Santri Utama' },

  // Santri Teladan (Lvl 41 - 50)
  { levelId: 'LVL041', levelNumber: 41, namaLevel: 'Santri Teladan 1', minXP: 19694, maxXP: 20497, warna: '#FFCC80', icon: '🌟', tierGroup: 'Santri Teladan' },
  { levelId: 'LVL045', levelNumber: 45, namaLevel: 'Santri Teladan 5', minXP: 22982, maxXP: 23833, badgeDefault: 'B045', warna: '#FFCC80', icon: '🌟', tierGroup: 'Santri Teladan' },
  { levelId: 'LVL050', levelNumber: 50, namaLevel: 'Santri Teladan 10', minXP: 27359, maxXP: 28268, badgeDefault: 'B050', warna: '#FFCC80', icon: '🌟', tierGroup: 'Santri Teladan' },

  // Penghafal Muda (Lvl 51 - 60)
  { levelId: 'LVL051', levelNumber: 51, namaLevel: 'Penghafal Muda 1', minXP: 28269, maxXP: 29190, warna: '#FFAB91', icon: '📖', tierGroup: 'Penghafal Muda' },
  { levelId: 'LVL060', levelNumber: 60, namaLevel: 'Penghafal Muda 10', minXP: 36963, maxXP: 37982, badgeDefault: 'B060', warna: '#FFAB91', icon: '📖', tierGroup: 'Penghafal Muda' },

  // Penjaga Sunnah (Lvl 61 - 70)
  { levelId: 'LVL061', levelNumber: 61, namaLevel: 'Penjaga Sunnah 1', minXP: 37983, maxXP: 39013, warna: '#CE93D8', icon: '🌙', tierGroup: 'Penjaga Sunnah' },
  { levelId: 'LVL070', levelNumber: 70, namaLevel: 'Penjaga Sunnah 10', minXP: 47634, maxXP: 48756, badgeDefault: 'B070', warna: '#CE93D8', icon: '🌙', tierGroup: 'Penjaga Sunnah' },

  // Mujahid Ilmu (Lvl 71 - 80)
  { levelId: 'LVL071', levelNumber: 71, namaLevel: 'Mujahid Ilmu 1', minXP: 48757, maxXP: 49889, warna: '#B39DDB', icon: '🕌', tierGroup: 'Mujahid Ilmu' },
  { levelId: 'LVL080', levelNumber: 80, namaLevel: 'Mujahid Ilmu 10', minXP: 59311, maxXP: 60531, badgeDefault: 'B080', warna: '#B39DDB', icon: '🕌', tierGroup: 'Mujahid Ilmu' },

  // Ksatria Akhlak (Lvl 81 - 90)
  { levelId: 'LVL081', levelNumber: 81, namaLevel: 'Ksatria Akhlak 1', minXP: 60532, maxXP: 61761, warna: '#9FA8DA', icon: '🛡️', tierGroup: 'Ksatria Akhlak' },
  { levelId: 'LVL090', levelNumber: 90, namaLevel: 'Ksatria Akhlak 10', minXP: 71943, maxXP: 73256, badgeDefault: 'B090', warna: '#9FA8DA', icon: '🛡️', tierGroup: 'Ksatria Akhlak' },

  // Guardian & Legend (Lvl 91 - 100)
  { levelId: 'LVL091', levelNumber: 91, namaLevel: 'Guardian Darul Arifin 1', minXP: 73257, maxXP: 74579, warna: '#EF9A9A', icon: '⚔️', tierGroup: 'Guardian' },
  { levelId: 'LVL100', levelNumber: 100, namaLevel: 'Legend Darul Arifin', minXP: 85488, maxXP: 100000, badgeDefault: 'B100', warna: '#FFD700', icon: '👑', tierGroup: 'Legend' }
];

// Helper to resolve level from total XP
export function getLevelFromXP(xp: number): {
  currentLevel: number;
  namaLevel: string;
  minXP: number;
  maxXP: number;
  progressPct: number;
  tierGroup: string;
  icon: string;
  warna: string;
} {
  const sorted = [...MASTER_LEVELS].sort((a, b) => a.minXP - b.minXP);
  let matched = sorted[0];

  for (let i = 0; i < sorted.length; i++) {
    if (xp >= sorted[i].minXP) {
      matched = sorted[i];
    } else {
      break;
    }
  }

  // Calculate dynamic level number if between steps
  let calculatedLvlNum = matched.levelNumber;
  let nextMax = matched.maxXP;

  const nextStep = sorted.find(s => s.minXP > matched.minXP);
  if (nextStep) {
    nextMax = nextStep.minXP;
  }

  const range = Math.max(1, nextMax - matched.minXP);
  const earned = Math.max(0, xp - matched.minXP);
  const pct = Math.min(100, Math.round((earned / range) * 100));

  return {
    currentLevel: calculatedLvlNum,
    namaLevel: matched.namaLevel,
    minXP: matched.minXP,
    maxXP: nextMax,
    progressPct: pct,
    tierGroup: matched.tierGroup,
    icon: matched.icon,
    warna: matched.warna
  };
}

// ----------------------------------------------------------------------
// 2. AVATAR TIERS (10_MASTER_AVATAR)
// ----------------------------------------------------------------------
export const MASTER_AVATARS: AvatarTier[] = [
  { id: 'AV01', nama: 'Bronze Santri', minLevel: 1, icon: '🛡️', warna: '#CD7F32', deskripsi: 'Avatar tingkat Bronze, terbuka otomatis sejak awal pendaftaran santri.' },
  { id: 'AV02', nama: 'Silver Santri', minLevel: 15, icon: '🛡️', warna: '#C0C0C0', deskripsi: 'Avatar tingkat Silver, terbuka setelah mencapai Level 15 (Santri Muda).' },
  { id: 'AV03', nama: 'Gold Santri', minLevel: 30, icon: '👑', warna: '#FFD700', deskripsi: 'Avatar tingkat Gold, terbuka setelah mencapai Level 30 (Santri Madya).' },
  { id: 'AV04', nama: 'Emerald Santri', minLevel: 45, icon: '💎', warna: '#50C878', deskripsi: 'Avatar tingkat Emerald, terbuka setelah mencapai Level 45 (Santri Teladan).' },
  { id: 'AV05', nama: 'Diamond Santri', minLevel: 60, icon: '💎', warna: '#B9F2FF', deskripsi: 'Avatar tingkat Diamond, terbuka setelah mencapai Level 60 (Penghafal Muda).' },
  { id: 'AV06', nama: 'Master Santri', minLevel: 75, icon: '🦅', warna: '#9B59B6', deskripsi: 'Avatar tingkat Master, terbuka setelah mencapai Level 75 (Mujahid Ilmu).' },
  { id: 'AV07', nama: 'Guardian Darul Arifin', minLevel: 90, icon: '⚔️', warna: '#E74C3C', deskripsi: 'Avatar tingkat Guardian, terbuka setelah mencapai Level 90 (Ksatria Akhlak).' },
  { id: 'AV08', nama: 'Legend Darul Arifin', minLevel: 100, icon: '👑', warna: '#F1C40F', deskripsi: 'Avatar tingkat Legend, terbuka sempurna pada Level 100 (Legend Darul Arifin).' }
];

// ----------------------------------------------------------------------
// 3. MASTER BADGES SAMPLE (02_MASTER_BADGE)
// ----------------------------------------------------------------------
export const MASTER_BADGES: BadgeItem[] = [
  // Ibadah
  { id: 'B001', nama: 'Pemula Ibadah', kategori: 'Ibadah', jenis: 'Common', icon: '🌙', warna: '#94A3B8', deskripsi: 'Diberikan atas capaian awal konsistensi Shalat Jamaah & Ibadah Yaumiyah.', xpBonus: 10 },
  { id: 'B008', nama: 'Teladan Ibadah', kategori: 'Ibadah', jenis: 'Rare', icon: '🌙', warna: '#3B82F6', deskripsi: 'Diberikan atas konsistensi Shalat Jamaah & Tahajud 30 hari.', xpBonus: 25 },
  { id: 'B013', nama: 'Juara Ibadah', kategori: 'Ibadah', jenis: 'Epic', icon: '✨', warna: '#A855F7', deskripsi: 'Diberikan atas pencapaian 200 hari Shalat Jamaah tanpa terputus.', xpBonus: 60 },
  { id: 'B015', nama: 'Legenda Ibadah', kategori: 'Ibadah', jenis: 'Legendary', icon: '👑', warna: '#EAB308', deskripsi: 'Diberikan atas kelulusan muta’addid 365 hari Ibadah Sempurna (Perfect Day).', xpBonus: 150 },

  // Tahfizh
  { id: 'B031', nama: 'Pemula Tahfizh', kategori: 'Tahfizh', jenis: 'Common', icon: '📖', warna: '#94A3B8', deskripsi: 'Diberikan atas capaian awal setoran hafalan & tilawah harian.', xpBonus: 10 },
  { id: 'B037', nama: 'Ahli Tahfizh', kategori: 'Tahfizh', jenis: 'Rare', icon: '📖', warna: '#3B82F6', deskripsi: 'Diberikan atas kelancaran murajaah & setoran 50 halaman hafalan.', xpBonus: 25 },
  { id: 'B042', nama: 'Master Tahfizh', kategori: 'Tahfizh', jenis: 'Epic', icon: '📜', warna: '#A855F7', deskripsi: 'Diberikan atas pencapaian 500 halaman setoran hafalan Al-Qur’an.', xpBonus: 60 },
  { id: 'B045', nama: 'Legenda Tahfizh', kategori: 'Tahfizh', jenis: 'Legendary', icon: '👑', warna: '#EAB308', deskripsi: 'Diberikan atas khatam setoran Al-Qur’an & mutqim sanad hafalan.', xpBonus: 150 },

  // Bahasa
  { id: 'B016', nama: 'Pemula Bahasa', kategori: 'Bahasa', jenis: 'Common', icon: '🗣️', warna: '#94A3B8', deskripsi: 'Diberikan atas keaktifan menambah kosakata Arab & Inggris harian.', xpBonus: 10 },
  { id: 'B022', nama: 'Ahli Bahasa', kategori: 'Bahasa', jenis: 'Rare', icon: '🗣️', warna: '#3B82F6', deskripsi: 'Diberikan atas mahir muhadatsah & percakapan bahasa di asrama.', xpBonus: 25 },
  { id: 'B027', nama: 'Master Bahasa', kategori: 'Bahasa', jenis: 'Epic', icon: '🌐', warna: '#A855F7', deskripsi: 'Diberikan atas capaian 500 kosakata Arab & Inggris baru.', xpBonus: 60 },

  // Akhlak & Kedisiplinan
  { id: 'B046', nama: 'Pemula Akhlak', kategori: 'Akhlak', jenis: 'Common', icon: '💎', warna: '#94A3B8', deskripsi: 'Diberikan atas perilaku sopan, ramah, dan jujur di lingkungan pondok.', xpBonus: 10 },
  { id: 'B053', nama: 'Teladan Akhlak', kategori: 'Akhlak', jenis: 'Rare', icon: '💎', warna: '#3B82F6', deskripsi: 'Diberikan atas nihil catatan pelanggaran selama 60 hari berturut-turut.', xpBonus: 25 },
  { id: 'B060', nama: 'Legenda Akhlak', kategori: 'Akhlak', jenis: 'Legendary', icon: '👑', warna: '#EAB308', deskripsi: 'Diberikan atas teladan kebersihan, kejujuran, dan penghormatan guru.', xpBonus: 150 },

  // Leadership & Character
  { id: 'B061', nama: 'Pemula Leadership', kategori: 'Leadership', jenis: 'Common', icon: '⭐', warna: '#94A3B8', deskripsi: 'Diberikan atas keaktifan memimpin piket & kerapihan kelompok.', xpBonus: 10 },
  { id: 'B076', nama: 'Pemula Kebersihan', kategori: 'Kebersihan', jenis: 'Common', icon: '🧹', warna: '#94A3B8', deskripsi: 'Diberikan atas kebersihan dan kelengkapan piket kamar asrama.', xpBonus: 10 },
  { id: 'B089', nama: 'Pilar Kebersihan', kategori: 'Kebersihan', jenis: 'Epic', icon: '✨', warna: '#A855F7', deskripsi: 'Diberikan atas penghargaan Kamar Bersih Teladan Mingguan.', xpBonus: 60 },
  { id: 'B091', nama: 'Pemula Olahraga', kategori: 'Olahraga', jenis: 'Common', icon: '⚽', warna: '#94A3B8', deskripsi: 'Diberikan atas keaktifan raga & senam pagi santri.', xpBonus: 10 },
  { id: 'B136', nama: 'Pemula Istiqamah', kategori: 'Istiqamah', jenis: 'Common', icon: '🔥', warna: '#94A3B8', deskripsi: 'Diberikan atas keaktifan mengisi Mutabaah Yaumiyah 7 hari penuh.', xpBonus: 10 },
  { id: 'B150', nama: 'Legenda Istiqamah', kategori: 'Istiqamah', jenis: 'Legendary', icon: '👑', warna: '#EAB308', deskripsi: 'Diberikan atas pencapaian 365 hari Streak Tanpa Putus!', xpBonus: 200 }
];

// ----------------------------------------------------------------------
// 4. MASTER STREAKS (07_MASTER_STREAK)
// ----------------------------------------------------------------------
export const MASTER_STREAKS: StreakLevel[] = [
  { id: 'STK01', jumlahHari: 7, xpReward: 30, badgeRewardId: 'B006', titleReward: 'The Starter', deskripsi: 'Diberikan saat santri mencapai 7 hari berturut-turut tanpa henti mengisi Mutabaah.' },
  { id: 'STK02', jumlahHari: 14, xpReward: 60, badgeRewardId: 'B021', titleReward: 'The Persistent', deskripsi: 'Diberikan saat santri mencapai 14 hari berturut-turut tanpa terputus.' },
  { id: 'STK03', jumlahHari: 30, xpReward: 120, badgeRewardId: 'B036', titleReward: 'The Committed', deskripsi: 'Diberikan saat santri mencapai 30 hari berturut-turut (1 Bulan Sempurna).' },
  { id: 'STK04', jumlahHari: 60, xpReward: 250, badgeRewardId: 'B051', titleReward: 'The Disciplined', deskripsi: 'Diberikan saat santri mencapai 60 hari berturut-turut Mutabaah 100% tuntas.' },
  { id: 'STK05', jumlahHari: 90, xpReward: 400, badgeRewardId: 'B066', titleReward: 'The Unshakable', deskripsi: 'Diberikan saat santri mencapai 90 hari berturut-turut (1 Triwulan).' },
  { id: 'STK06', jumlahHari: 180, xpReward: 800, badgeRewardId: 'B081', titleReward: 'The Istiqamah', deskripsi: 'Diberikan saat santri mencapai 180 hari berturut-turut (1 Semester).' },
  { id: 'STK07', jumlahHari: 365, xpReward: 2000, badgeRewardId: 'B096', titleReward: 'The Legend of Consistency', deskripsi: 'Diberikan saat santri mencapai 365 hari penuh tanpa henti!' }
];

// ----------------------------------------------------------------------
// 5. MASTER RPG TITLES (08_MASTER_TITLE)
// ----------------------------------------------------------------------
export const MASTER_TITLES: RPGTitle[] = [
  { id: 'TTL01', title: 'The Disciplined', syarat: 'Konsistensi Mutabaah >=90% selama 1 semester', minLevel: 10 },
  { id: 'TTL02', title: 'Guardian of Tahajud', syarat: '100 hari Tahajud tercatat di Mutabaah', minLevel: 15 },
  { id: 'TTL03', title: 'Master of Arabic', syarat: 'Pohon Skill Bahasa Arab mencapai Level 5', minLevel: 20 },
  { id: 'TTL07', title: 'Sang Ibadah', syarat: 'Raih minimal 3 badge kategori Ibadah', minLevel: 15 },
  { id: 'TTL13', title: 'Sang Tahfizh', syarat: 'Raih minimal 3 badge kategori Tahfizh', minLevel: 15 },
  { id: 'TTL19', title: 'Sang Bahasa', syarat: 'Raih minimal 3 badge kategori Bahasa', minLevel: 15 },
  { id: 'TTL25', title: 'Sang Akhlak', syarat: 'Raih minimal 3 badge kategori Akhlak', minLevel: 15 },
  { id: 'TTL31', title: 'Sang Leadership', syarat: 'Raih minimal 3 badge kategori Leadership', minLevel: 20 },
  { id: 'TTL37', title: 'Sang Kebersihan', syarat: 'Raih minimal 3 badge kategori Kebersihan', minLevel: 10 }
];

// ----------------------------------------------------------------------
// 6. MASTER SKILL TREE NODES (05_MASTER_SKILL_TREE)
// ----------------------------------------------------------------------
export const MASTER_SKILL_TREE: SkillNode[] = [
  // Spiritual
  { id: 'SK001', nama: 'Spiritual Utama', kategori: 'Spiritual', maxLevel: 10, xpPerLevel: 50, icon: '🕌' },
  { id: 'SK002', parentId: 'SK001', nama: 'Shalat Jamaah', kategori: 'Spiritual', maxLevel: 5, xpPerLevel: 20, icon: '🕋' },
  { id: 'SK003', parentId: 'SK001', nama: 'Tahajud & Qiyam', kategori: 'Spiritual', maxLevel: 5, xpPerLevel: 20, icon: '🌌' },
  { id: 'SK004', parentId: 'SK001', nama: 'Tilawah Qur’an', kategori: 'Spiritual', maxLevel: 5, xpPerLevel: 20, icon: '📖' },
  { id: 'SK006', parentId: 'SK001', nama: 'Dzikir Ba’da Shalat', kategori: 'Spiritual', maxLevel: 5, xpPerLevel: 20, icon: '📿' },

  // Bahasa
  { id: 'SK012', nama: 'Penguasaan Bahasa', kategori: 'Bahasa', maxLevel: 10, xpPerLevel: 50, icon: '🗣️' },
  { id: 'SK013', parentId: 'SK012', nama: 'Kosakata Arab', kategori: 'Bahasa', maxLevel: 5, xpPerLevel: 20, icon: '🇸🇦' },
  { id: 'SK014', parentId: 'SK012', nama: 'Kosakata Inggris', kategori: 'Bahasa', maxLevel: 5, xpPerLevel: 20, icon: '🇬🇧' },
  { id: 'SK015', parentId: 'SK012', nama: 'Muhadatsah Harian', kategori: 'Bahasa', maxLevel: 5, xpPerLevel: 20, icon: '💬' },

  // Tahfizh
  { id: 'SK023', nama: 'Mahkota Tahfizh', kategori: 'Tahfizh', maxLevel: 10, xpPerLevel: 50, icon: '👑' },
  { id: 'SK024', parentId: 'SK023', nama: 'Setoran Hafalan Baru', kategori: 'Tahfizh', maxLevel: 5, xpPerLevel: 20, icon: '✨' },
  { id: 'SK025', parentId: 'SK023', nama: 'Murajaah Harian', kategori: 'Tahfizh', maxLevel: 5, xpPerLevel: 20, icon: '🔄' },

  // Akhlak
  { id: 'SK034', nama: 'Akhlakul Karimah', kategori: 'Akhlak', maxLevel: 10, xpPerLevel: 50, icon: '💎' },
  { id: 'SK035', parentId: 'SK034', nama: 'Kejujuran & Amanah', kategori: 'Akhlak', maxLevel: 5, xpPerLevel: 20, icon: '🛡️' },
  { id: 'SK036', parentId: 'SK034', nama: 'Kedisiplinan Waktu', kategori: 'Akhlak', maxLevel: 5, xpPerLevel: 20, icon: '⏰' },

  // Leadership
  { id: 'SK045', nama: 'Kepemimpinan Musyrif', kategori: 'Leadership', maxLevel: 10, xpPerLevel: 50, icon: '⭐' },
  { id: 'SK046', parentId: 'SK045', nama: 'Public Speaking & Kultum', kategori: 'Leadership', maxLevel: 5, xpPerLevel: 20, icon: '🎙️' },

  // Kebersihan & Kesehatan
  { id: 'SK056', nama: 'Kesehatan & Kebersihan', kategori: 'Kesehatan', maxLevel: 10, xpPerLevel: 50, icon: '🧹' },
  { id: 'SK057', parentId: 'SK056', nama: 'Olahraga & Senam', kategori: 'Kesehatan', maxLevel: 5, xpPerLevel: 20, icon: '⚽' },
  { id: 'SK059', parentId: 'SK056', nama: 'Piket Kamar Bersih', kategori: 'Kesehatan', maxLevel: 5, xpPerLevel: 20, icon: '✨' }
];

// ----------------------------------------------------------------------
// 7. REAL REWARDS (09_MASTER_REWARD) - 100 MASTER REWARDS
// ----------------------------------------------------------------------
export const MASTER_REAL_REWARDS: RealReward[] = [
  { id: 'RW001', nama: 'Pin Bintang Pemula', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: "Pin kecil bertuliskan 'Santri Bersemangat' sebagai tanda awal perjalanan.", syaratMinimum: 'Level 1+', estimasiNilaiRp: 2000, icon: '📌', aktif: true },
  { id: 'RW002', nama: 'Stiker Semangat Ibadah', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Lembar stiker islami lucu untuk ditempel di buku catatan santri.', syaratMinimum: 'Level 1+', estimasiNilaiRp: 1000, icon: '🏷️', aktif: true },
  { id: 'RW003', nama: 'Pensil Santri Rajin', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Pensil bertuliskan kalimat motivasi harian.', syaratMinimum: 'Level 3+', estimasiNilaiRp: 2000, icon: '✏️', aktif: true },
  { id: 'RW004', nama: 'Kartu Apresiasi Santri Bersemangat', kategori: 'Kartu Apresiasi', jenis: 'Fisik', deskripsi: 'Kartu ucapan kecil dari ustadz/ustadzah atas semangat awal santri.', syaratMinimum: 'Streak 7 hari', estimasiNilaiRp: 1500, icon: '💌', aktif: true },
  { id: 'RW005', nama: 'Kurma Manis Kemasan Kecil', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan kurma sehat sebagai apresiasi sederhana.', syaratMinimum: 'Level 5+', estimasiNilaiRp: 3000, icon: '🌴', aktif: true },
  { id: 'RW006', nama: 'Buku Mini Doa Harian', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku saku berisi kumpulan doa harian ringkas.', syaratMinimum: 'Level 7+', estimasiNilaiRp: 4000, icon: '📖', aktif: true },
  { id: 'RW007', nama: 'Nama di Papan Bintang Kamar', kategori: 'Bintang Kamar', jenis: 'Non Fisik', deskripsi: 'Nama santri ditempel di papan bintang kamar sebagai pengakuan kedisiplinan.', syaratMinimum: 'Streak 5 hari', estimasiNilaiRp: 0, icon: '⭐', aktif: true },
  { id: 'RW008', nama: 'Duduk di Barisan Depan 1 Hari', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Hak duduk di shaf/barisan depan kelas selama satu hari penuh.', syaratMinimum: 'Level 5+', estimasiNilaiRp: 0, icon: '🪑', aktif: true },
  { id: 'RW009', nama: 'Apresiasi Lisan di Depan Kelas', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Disebut namanya dan diapresiasi langsung oleh musyrif/ustadz di depan teman sekelas.', syaratMinimum: 'Level 8+', estimasiNilaiRp: 0, icon: '🗣️', aktif: true },
  { id: 'RW010', nama: 'Piagam Pejuang Pemula', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Pemula sebagai bukti konsistensi awal.', syaratMinimum: 'Level 10+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW011', nama: 'Penggaris Asmaul Husna', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Penggaris bertuliskan 99 Asmaul Husna untuk belajar sehari-hari.', syaratMinimum: 'Level 11+', estimasiNilaiRp: 3000, icon: '📏', aktif: true },
  { id: 'RW012', nama: 'Gantungan Kunci Kaligrafi', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Gantungan kunci kaligrafi Arab sederhana.', syaratMinimum: 'Level 12+', estimasiNilaiRp: 4000, icon: '🗝️', aktif: true },
  { id: 'RW013', nama: 'Buku Tulis Sampul Motivasi', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku tulis bersampul kutipan motivasi islami.', syaratMinimum: 'Level 13+', estimasiNilaiRp: 3500, icon: '📓', aktif: true },
  { id: 'RW014', nama: 'Badge Pejuang Subuh', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain kecil sebagai tanda konsistensi sholat Subuh berjamaah.', syaratMinimum: 'Streak 15 hari', estimasiNilaiRp: 4000, icon: '🎖️', aktif: true },
  { id: 'RW015', nama: 'Kurma & Kacang Sehat', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan sehat kurma dan kacang untuk bekal santri.', syaratMinimum: 'Level 15+', estimasiNilaiRp: 4000, icon: '🥜', aktif: true },
  { id: 'RW016', nama: 'Kartu Apresiasi Konsisten Berjamaah', kategori: 'Kartu Apresiasi', jenis: 'Fisik', deskripsi: 'Kartu apresiasi atas kekonsistenan sholat berjamaah.', syaratMinimum: 'Streak 20 hari', estimasiNilaiRp: 2000, icon: '🎫', aktif: true },
  { id: 'RW017', nama: 'Jadi Imam Pilihan Sehari', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan menjadi imam sholat pilihan untuk satu waktu sholat.', syaratMinimum: 'Level 15+', estimasiNilaiRp: 0, icon: '🕌', aktif: true },
  { id: 'RW018', nama: 'Hak Memilih Teman Satu Kelompok', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Santri berhak memilih teman untuk kegiatan kelompok pekan ini.', syaratMinimum: 'Level 18+', estimasiNilaiRp: 0, icon: '👥', aktif: true },
  { id: 'RW019', nama: 'Nama di Leaderboard Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Nama santri diumumkan di papan leaderboard mingguan.', syaratMinimum: 'XP 2500', estimasiNilaiRp: 0, icon: '🏆', aktif: true },
  { id: 'RW020', nama: 'Piagam Santri Muda Teladan', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Santri Muda.', syaratMinimum: 'Level 20+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW021', nama: 'Bolpoin Ukir Motif Islami', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Bolpoin dengan ukiran motif kaligrafi islami.', syaratMinimum: 'Level 21+', estimasiNilaiRp: 5000, icon: '🖊️', aktif: true },
  { id: 'RW022', nama: 'Gantungan Tasbih Mini', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Gantungan tas berbentuk tasbih mini.', syaratMinimum: 'Level 23+', estimasiNilaiRp: 5000, icon: '📿', aktif: true },
  { id: 'RW023', nama: 'Buku Kisah 25 Nabi Ringkas', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku ringkas kisah teladan 25 Nabi dan Rasul.', syaratMinimum: 'Level 25+', estimasiNilaiRp: 5000, icon: '📚', aktif: true },
  { id: 'RW024', nama: 'Pin Istiqamah Ibadah', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Pin logam kecil sebagai simbol istiqamah beribadah.', syaratMinimum: 'Streak 30 hari', estimasiNilaiRp: 4000, icon: '📍', aktif: true },
  { id: 'RW025', nama: 'Kurma Premium Kemasan Mini', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan kurma pilihan sebagai apresiasi konsistensi.', syaratMinimum: 'Level 27+', estimasiNilaiRp: 5000, icon: '🌴', aktif: true },
  { id: 'RW026', nama: 'Kartu Apresiasi Sang Rajin', kategori: 'Kartu Apresiasi', jenis: 'Fisik', deskripsi: 'Kartu apresiasi kerajinan mengerjakan tugas dan quest harian.', syaratMinimum: 'Level 28+', estimasiNilaiRp: 2500, icon: '💌', aktif: true },
  { id: 'RW027', nama: 'Golden Card Bebas 1 Tugas Ringan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kartu emas yang dapat ditukar untuk membebaskan diri dari satu tugas ringan.', syaratMinimum: 'Level 25+', estimasiNilaiRp: 0, icon: '💳', aktif: true },
  { id: 'RW028', nama: 'Jadi Ketua Kelompok Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Dipercaya memimpin kelompok kegiatan selama satu pekan.', syaratMinimum: 'Level 26+', estimasiNilaiRp: 0, icon: '👑', aktif: true },
  { id: 'RW029', nama: 'Piala Mini Bintang Kamar', kategori: 'Bintang Kamar', jenis: 'Fisik', deskripsi: 'Piala kecil ditempatkan di kamar sebagai simbol kamar terbersih/terdisiplin.', syaratMinimum: 'Streak 25 hari', estimasiNilaiRp: 5000, icon: '🏆', aktif: true },
  { id: 'RW030', nama: 'Piagam Santri Madya Berprestasi', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Santri Madya.', syaratMinimum: 'Level 30+', estimasiNilaiRp: 3500, icon: '📜', aktif: true },
  { id: 'RW031', nama: 'Buku Catatan Hafalan', kategori: 'Buku', jenis: 'Fisik', deskripsi: "Buku catatan khusus untuk mencatat progres hafalan Al-Qur'an.", syaratMinimum: 'Level 31+', estimasiNilaiRp: 5000, icon: '📒', aktif: true },
  { id: 'RW032', nama: 'Gantungan Kunci Al-Amin', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: "Gantungan kunci bertuliskan 'Al-Amin' sebagai pengingat amanah.", syaratMinimum: 'Level 33+', estimasiNilaiRp: 5000, icon: '🔑', aktif: true },
  { id: 'RW033', nama: 'Set Stabilo Warna', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Set stabilo warna-warni untuk menandai catatan pelajaran.', syaratMinimum: 'Level 34+', estimasiNilaiRp: 4000, icon: '🖍️', aktif: true },
  { id: 'RW034', nama: 'Badge Penjaga Sunnah Muda', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain sebagai tanda konsistensi menjalankan sunnah harian.', syaratMinimum: 'Streak 40 hari', estimasiNilaiRp: 5000, icon: '🎖️', aktif: true },
  { id: 'RW035', nama: 'Kacang Almond Sehat', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan sehat kacang almond kemasan kecil.', syaratMinimum: 'Level 36+', estimasiNilaiRp: 5000, icon: '🥜', aktif: true },
  { id: 'RW036', nama: 'Kartu Apresiasi Amanah', kategori: 'Kartu Apresiasi', jenis: 'Fisik', deskripsi: 'Kartu apresiasi atas sikap amanah dalam tugas dan tanggung jawab.', syaratMinimum: 'Level 37+', estimasiNilaiRp: 2500, icon: '💌', aktif: true },
  { id: 'RW037', nama: 'Jadi Moderator Kajian Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan memandu jalannya kajian pekanan di kelas/asrama.', syaratMinimum: 'Level 35+', estimasiNilaiRp: 0, icon: '🎙️', aktif: true },
  { id: 'RW038', nama: 'Foto Bersama Ustadz/Ustadzah', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan foto kenangan bersama ustadz/ustadzah pembina.', syaratMinimum: 'Level 38+', estimasiNilaiRp: 0, icon: '📸', aktif: true },
  { id: 'RW039', nama: 'Tambahan Waktu Istirahat 15 Menit', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Tambahan waktu istirahat 15 menit di luar jadwal reguler.', syaratMinimum: 'Streak 35 hari', estimasiNilaiRp: 0, icon: '⏱️', aktif: true },
  { id: 'RW040', nama: 'Piagam Santri Utama + Nama di Mading', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Santri Utama, nama dipajang di mading prestasi.', syaratMinimum: 'Level 40+', estimasiNilaiRp: 4000, icon: '📜', aktif: true },
  { id: 'RW041', nama: 'Buku Kumpulan Doa & Dzikir Saku', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku saku kumpulan doa dan dzikir pagi-petang.', syaratMinimum: 'Level 41+', estimasiNilaiRp: 5000, icon: '📘', aktif: true },
  { id: 'RW042', nama: 'Tempat Pensil Motif Islami', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Tempat pensil dengan motif kaligrafi dan ornamen islami.', syaratMinimum: 'Level 42+', estimasiNilaiRp: 5000, icon: '👝', aktif: true },
  { id: 'RW043', nama: 'Set Spidol Warna', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Set spidol warna untuk kebutuhan belajar dan mading.', syaratMinimum: 'Level 43+', estimasiNilaiRp: 5000, icon: '🖊️', aktif: true },
  { id: 'RW044', nama: 'Pin Teladan Ibadah', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Pin logam sebagai simbol keteladanan dalam ibadah harian.', syaratMinimum: 'Streak 45 hari', estimasiNilaiRp: 5000, icon: '📍', aktif: true },
  { id: 'RW045', nama: 'Granola Bar Sehat', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan granola bar rendah gula sebagai apresiasi sehat.', syaratMinimum: 'Level 45+', estimasiNilaiRp: 5000, icon: '🥣', aktif: true },
  { id: 'RW046', nama: 'Sertifikat Santri Teladan Pekanan', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat mingguan atas capaian sebagai santri teladan.', syaratMinimum: 'Level 46+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW047', nama: 'Jadi MC Acara Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan menjadi pembawa acara pada kegiatan pekanan pesantren.', syaratMinimum: 'Level 47+', estimasiNilaiRp: 0, icon: '🎤', aktif: true },
  { id: 'RW048', nama: 'Hak Memilih Menu Sarapan Sehat', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Berhak mengusulkan satu menu sarapan sehat untuk kamar/kelompoknya.', syaratMinimum: 'Level 48+', estimasiNilaiRp: 0, icon: '🥣', aktif: true },
  { id: 'RW049', nama: 'Nama Terpampang di Dinding Prestasi', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Nama santri dipajang permanen di dinding prestasi pesantren.', syaratMinimum: 'XP 27000', estimasiNilaiRp: 0, icon: '🖼️', aktif: true },
  { id: 'RW050', nama: 'Piagam Santri Teladan + Foto Bersama Mudir', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Santri Teladan disertai foto bersama Mudir.', syaratMinimum: 'Level 50+', estimasiNilaiRp: 5000, icon: '📜', aktif: true },
  { id: 'RW051', nama: "Al-Qur'an Saku / Juz Amma Mini", kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Mushaf saku atau Juz Amma mini sebagai penyemangat menghafal.', syaratMinimum: 'Level 51+', estimasiNilaiRp: 6000, icon: '📖', aktif: true },
  { id: 'RW052', nama: 'Sajadah Travel Mini', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Sajadah lipat ukuran kecil praktis dibawa bepergian.', syaratMinimum: 'Level 53+', estimasiNilaiRp: 5000, icon: '🕌', aktif: true },
  { id: 'RW053', nama: 'Buku Tajwid Praktis Mini', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku saku panduan tajwid ringkas untuk memperbaiki bacaan.', syaratMinimum: 'Level 54+', estimasiNilaiRp: 5000, icon: '📖', aktif: true },
  { id: 'RW054', nama: 'Badge Hafidz Muda', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain sebagai tanda konsistensi murojaah hafalan.', syaratMinimum: 'Streak 50 hari', estimasiNilaiRp: 4000, icon: '🎖️', aktif: true },
  { id: 'RW055', nama: 'Kurma Ajwa Kemasan Mini', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan kurma Ajwa mini sebagai apresiasi istimewa.', syaratMinimum: 'Level 56+', estimasiNilaiRp: 5000, icon: '🌴', aktif: true },
  { id: 'RW056', nama: 'Sertifikat Penghafal Muda Berprestasi', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat atas progres hafalan yang konsisten.', syaratMinimum: 'Level 57+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW057', nama: 'Jadi Pemimpin Murojaah Kelompok', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Dipercaya memimpin sesi murojaah hafalan kelompok.', syaratMinimum: 'Level 55+', estimasiNilaiRp: 0, icon: '👑', aktif: true },
  { id: 'RW058', nama: 'Waktu Tambahan di Perpustakaan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Tambahan akses waktu membaca di perpustakaan pesantren.', syaratMinimum: 'Level 58+', estimasiNilaiRp: 0, icon: '📚', aktif: true },
  { id: 'RW059', nama: 'Undangan Makan Bersama Ustadz', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan makan bersama ustadz/ustadzah pembina sebagai bentuk kedekatan.', syaratMinimum: 'XP 35000', estimasiNilaiRp: 0, icon: '🍽️', aktif: true },
  { id: 'RW060', nama: 'Piagam Penghafal Muda + Bingkai', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Penghafal Muda dengan bingkai sederhana.', syaratMinimum: 'Level 60+', estimasiNilaiRp: 8000, icon: '🖼️', aktif: true },
  { id: 'RW061', nama: 'Buku Riyadhus Shalihin Ringkas', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Ringkasan hadits-hadits pilihan Riyadhus Shalihin.', syaratMinimum: 'Level 61+', estimasiNilaiRp: 5000, icon: '📚', aktif: true },
  { id: 'RW062', nama: 'Tasbih Digital Sederhana', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Tasbih digital sederhana untuk membantu penghitungan dzikir.', syaratMinimum: 'Level 63+', estimasiNilaiRp: 5000, icon: '📿', aktif: true },
  { id: 'RW063', nama: 'Sarung/Selendang Motif Sederhana', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Sarung atau selendang sederhana bermotif polos rapi.', syaratMinimum: 'Level 64+', estimasiNilaiRp: 5000, icon: '👔', aktif: true },
  { id: 'RW064', nama: 'Badge Penjaga Sunnah', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain sebagai tanda konsistensi menjalankan sunnah rawatib.', syaratMinimum: 'Streak 60 hari', estimasiNilaiRp: 5000, icon: '🎗️', aktif: true },
  { id: 'RW065', nama: 'Madu Sachet Sehat', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Madu kemasan sachet sebagai apresiasi kesehatan.', syaratMinimum: 'Level 66+', estimasiNilaiRp: 5000, icon: '🍯', aktif: true },
  { id: 'RW066', nama: 'Sertifikat Penjaga Sunnah Konsisten', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat atas kekonsistenan menjaga amalan sunnah.', syaratMinimum: 'Level 67+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW067', nama: 'Jadi Petugas Adzan Pilihan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Dipercaya mengumandangkan adzan pada waktu sholat pilihan.', syaratMinimum: 'Level 65+', estimasiNilaiRp: 0, icon: '🕌', aktif: true },
  { id: 'RW068', nama: 'Istirahat Ekstra Sore Hari', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Tambahan waktu istirahat di sore hari di luar jadwal reguler.', syaratMinimum: 'Streak 65 hari', estimasiNilaiRp: 0, icon: '🌆', aktif: true },
  { id: 'RW069', nama: 'Nama di Buku Tamu Kehormatan Asrama', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Nama santri dicatat di buku kehormatan asrama sebagai teladan.', syaratMinimum: 'Level 68+', estimasiNilaiRp: 0, icon: '📖', aktif: true },
  { id: 'RW070', nama: 'Piagam Penjaga Sunnah + Bingkai', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Penjaga Sunnah dengan bingkai sederhana.', syaratMinimum: 'Level 70+', estimasiNilaiRp: 8000, icon: '🖼️', aktif: true },
  { id: 'RW071', nama: 'Buku Biografi Ulama Inspiratif', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku ringkas kisah perjalanan hidup ulama inspiratif.', syaratMinimum: 'Level 71+', estimasiNilaiRp: 5000, icon: '📖', aktif: true },
  { id: 'RW072', nama: 'Tas Kecil Serbaguna Santri', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Tas kecil serbaguna untuk membawa perlengkapan harian.', syaratMinimum: 'Level 73+', estimasiNilaiRp: 5000, icon: '💼', aktif: true },
  { id: 'RW073', nama: 'Set Alat Tulis Lengkap', kategori: 'Alat Tulis', jenis: 'Fisik', deskripsi: 'Set alat tulis lengkap (pensil, penghapus, penggaris, bolpoin) dalam satu wadah.', syaratMinimum: 'Level 74+', estimasiNilaiRp: 5000, icon: '✏️', aktif: true },
  { id: 'RW074', nama: 'Badge Mujahid Ilmu', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain sebagai tanda kegigihan menuntut ilmu secara mandiri.', syaratMinimum: 'Streak 70 hari', estimasiNilaiRp: 5000, icon: '🎖️', aktif: true },
  { id: 'RW075', nama: 'Granola Premium Sehat', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Camilan granola premium sebagai apresiasi kegigihan belajar.', syaratMinimum: 'Level 76+', estimasiNilaiRp: 5000, icon: '🥣', aktif: true },
  { id: 'RW076', nama: 'Sertifikat Mujahid Ilmu Berdedikasi', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat atas dedikasi tinggi dalam menuntut ilmu.', syaratMinimum: 'Level 77+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW077', nama: 'Jadi Asisten Pengajar Adik Kelas', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan membantu mengajar/membimbing adik kelas dalam pelajaran tertentu.', syaratMinimum: 'Level 75+', estimasiNilaiRp: 0, icon: '👨‍🏫', aktif: true },
  { id: 'RW078', nama: 'Hak Mengusulkan Kegiatan Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Berhak mengusulkan satu kegiatan untuk agenda pekanan pesantren.', syaratMinimum: 'Level 78+', estimasiNilaiRp: 0, icon: '💡', aktif: true },
  { id: 'RW079', nama: 'Sesi Wawancara Kisah Sukses di Mading', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kisah dan tips belajar santri dimuat singkat di mading pesantren.', syaratMinimum: 'XP 58000', estimasiNilaiRp: 0, icon: '📸', aktif: true },
  { id: 'RW080', nama: 'Piagam Mujahid Ilmu + Plakat Kecil', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Mujahid Ilmu disertai plakat kecil.', syaratMinimum: 'Level 80+', estimasiNilaiRp: 10000, icon: '🏆', aktif: true },
  { id: 'RW081', nama: 'Buku Akhlak Rasulullah', kategori: 'Buku', jenis: 'Fisik', deskripsi: 'Buku ringkas keteladanan akhlak Rasulullah SAW dalam keseharian.', syaratMinimum: 'Level 81+', estimasiNilaiRp: 5000, icon: '📖', aktif: true },
  { id: 'RW082', nama: 'Dompet Kecil Motif Kaligrafi', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Dompet kecil bermotif kaligrafi sederhana.', syaratMinimum: 'Level 84+', estimasiNilaiRp: 5000, icon: '👛', aktif: true },
  { id: 'RW083', nama: 'Jam Meja Mini Islami', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Jam meja mini bertema islami untuk kamar santri.', syaratMinimum: 'Level 85+', estimasiNilaiRp: 5000, icon: '⏰', aktif: true },
  { id: 'RW084', nama: 'Badge Ksatria Akhlak', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain sebagai tanda keteladanan akhlak mulia sehari-hari.', syaratMinimum: 'Streak 80 hari', estimasiNilaiRp: 5000, icon: '🎖️', aktif: true },
  { id: 'RW085', nama: 'Paket Snack Sehat Pilihan', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Paket camilan sehat pilihan sebagai apresiasi khusus.', syaratMinimum: 'Level 86+', estimasiNilaiRp: 5000, icon: '🥨', aktif: true },
  { id: 'RW086', nama: 'Sertifikat Ksatria Akhlak Mulia', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat atas keteladanan akhlak yang konsisten.', syaratMinimum: 'Level 87+', estimasiNilaiRp: 3000, icon: '📜', aktif: true },
  { id: 'RW087', nama: 'Jadi Duta Akhlak Pesantren Sepekan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Dipercaya menjadi contoh dan duta akhlak pesantren selama satu pekan.', syaratMinimum: 'Level 85+', estimasiNilaiRp: 0, icon: '🌟', aktif: true },
  { id: 'RW088', nama: 'Hak Menentukan Tema Kajian Pekanan', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Berhak mengusulkan tema kajian untuk kegiatan pekanan.', syaratMinimum: 'Level 88+', estimasiNilaiRp: 0, icon: '💡', aktif: true },
  { id: 'RW089', nama: 'Silaturahmi Bersama Pengasuh', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan bersilaturahmi langsung bersama Pengasuh pesantren.', syaratMinimum: 'XP 71000', estimasiNilaiRp: 0, icon: '🤝', aktif: true },
  { id: 'RW090', nama: 'Piagam Ksatria Akhlak + Plakat Ukir', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam penutup tingkat Ksatria Akhlak disertai plakat ukir kecil.', syaratMinimum: 'Level 90+', estimasiNilaiRp: 12000, icon: '🏛️', aktif: true },
  { id: 'RW091', nama: "Al-Qur'an Terjemah Ukuran Sedang", kategori: 'Buku', jenis: 'Fisik', deskripsi: "Mushaf Al-Qur'an dan terjemah ukuran sedang sebagai hadiah puncak perjalanan.", syaratMinimum: 'Level 91+', estimasiNilaiRp: 15000, icon: '📖', aktif: true },
  { id: 'RW092', nama: 'Rompi/Syal Identitas Guardian', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Rompi atau syal identitas khusus penyandang gelar Guardian.', syaratMinimum: 'Level 93+', estimasiNilaiRp: 15000, icon: '🦺', aktif: true },
  { id: 'RW093', nama: 'Pin Legend Darul Arifin', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: "Pin eksklusif bertuliskan 'Legend Darul Arifin' untuk pencapaian tertinggi.", syaratMinimum: 'Level 100', estimasiNilaiRp: 5000, icon: '📌', aktif: true },
  { id: 'RW094', nama: 'Badge Guardian Darul Arifin', kategori: 'Aksesoris', jenis: 'Fisik', deskripsi: 'Badge kain eksklusif sebagai simbol penjaga nilai-nilai pesantren.', syaratMinimum: 'Streak 90 hari', estimasiNilaiRp: 5000, icon: '🎗️', aktif: true },
  { id: 'RW095', nama: 'Hampers Snack Sehat Kecil', kategori: 'Snack Sehat', jenis: 'Fisik', deskripsi: 'Paket hampers camilan sehat sebagai apresiasi pencapaian puncak.', syaratMinimum: 'Level 95+', estimasiNilaiRp: 5000, icon: '🎁', aktif: true },
  { id: 'RW096', nama: 'Sertifikat Emas Guardian Darul Arifin', kategori: 'Sertifikat', jenis: 'Fisik', deskripsi: 'Sertifikat cetak emas atas pencapaian gelar Guardian Darul Arifin.', syaratMinimum: 'Level 96+', estimasiNilaiRp: 5000, icon: '📜', aktif: true },
  { id: 'RW097', nama: 'Jadi Panutan Angkatan - Sesi Sharing Motivasi', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Kesempatan berbagi kisah dan motivasi di hadapan seluruh angkatan.', syaratMinimum: 'Level 95+', estimasiNilaiRp: 0, icon: '🎤', aktif: true },
  { id: 'RW098', nama: 'Nama Diabadikan di Papan Legenda Pesantren', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Nama santri diabadikan secara permanen di papan legenda pesantren.', syaratMinimum: 'Level 98+', estimasiNilaiRp: 0, icon: '🌟', aktif: true },
  { id: 'RW099', nama: 'Undangan Khusus Acara Wisuda/Prestasi', kategori: 'Privilege', jenis: 'Non Fisik', deskripsi: 'Undangan kehormatan untuk hadir di kursi khusus pada acara wisuda/prestasi tahunan.', syaratMinimum: 'Level 99+', estimasiNilaiRp: 0, icon: '🎓', aktif: true },
  { id: 'RW100', nama: 'Piagam Legend Darul Arifin + Plakat Kayu Ukir', kategori: 'Piagam', jenis: 'Fisik', deskripsi: 'Piagam kehormatan tertinggi disertai plakat kayu ukir sebagai jejak Legend Darul Arifin.', syaratMinimum: 'Level 100', estimasiNilaiRp: 40000, icon: '🏆', aktif: true }
];

// ----------------------------------------------------------------------
// DYNAMIC GAMIFICATION STATS CALCULATOR
// ----------------------------------------------------------------------
export function calculateSantriGamificationStats(
  santriId: string,
  allMutabaahRecords: any[],
  allPelanggaranList: any[]
) {
  // Filter records for this santri
  const userRecords = (allMutabaahRecords || []).filter(r => r.idSantri === santriId);
  const userPelanggaran = (allPelanggaranList || []).filter(p => p.idSantri === santriId);
  const totalLogsRecorded = userRecords.length;

  // Deduct penalty XP for violations
  const totalViolationsCount = userPelanggaran.length;
  let penaltyDeduction = 0;
  userPelanggaran.forEach(p => {
    const deduct = p.kategori === 'Berat' ? 100 : p.kategori === 'Sedang' ? 40 : 15;
    penaltyDeduction += deduct;
  });

  // 1. Calculate base accumulated XP
  let totalXP = 0;
  let perfectDaysCount = 0;

  if (totalLogsRecorded > 0) {
    userRecords.forEach(r => {
      totalXP += (r.totalSkor || 0);
      if (r.rataRataPersentase >= 100) {
        perfectDaysCount += 1;
        totalXP += 50; // Perfect Day bonus
      }
    });
  } else {
    // Strictly 0 starting XP when no Mutabaah input records exist
    totalXP = 0;
  }

  const netXP = Math.max(0, totalXP - penaltyDeduction);

  // 2. Resolve Level
  const levelData = getLevelFromXP(netXP);

  // 3. Resolve Avatar Tier
  let currentAvatar = MASTER_AVATARS[0];
  if (totalLogsRecorded > 0) {
    for (const av of MASTER_AVATARS) {
      if (levelData.currentLevel >= av.minLevel) {
        currentAvatar = av;
      }
    }
  }

  // 4. Calculate Streak
  const currentStreakDays = totalLogsRecorded === 0 ? 0 : Math.max(1, userRecords.length + (perfectDaysCount * 2));
  const longestStreakDays = totalLogsRecorded === 0 ? 0 : currentStreakDays;

  // Active streak reward title
  let currentStreakReward = {
    id: 'STK00',
    jumlahHari: 0,
    xpReward: 0,
    badgeRewardId: '',
    titleReward: 'Belum Ada Streak',
    deskripsi: 'Belum ada riwayat pengisian Mutabaah Yaumiyah.'
  };

  if (totalLogsRecorded > 0) {
    currentStreakReward = MASTER_STREAKS[0];
    for (const st of MASTER_STREAKS) {
      if (currentStreakDays >= st.jumlahHari) {
        currentStreakReward = st;
      }
    }
  }

  // 5. Calculate 6 Category Average Scores synchronized with Mutabaah Yaumiyah
  // Mutabaah Categories: SPIRITUAL DISCIPLINE, DZIKIR, AL-QUR'AN, ILMU, HEALTHY LIFE, CHARACTER
  const categoryScores: Record<string, number> = {
    'SPIRITUAL DISCIPLINE': 0,
    'DZIKIR': 0,
    'AL-QUR\'AN': 0,
    'ILMU': 0,
    'HEALTHY LIFE': 0,
    'CHARACTER': 0
  };

  if (totalLogsRecorded > 0) {
    const catTotals: Record<string, { sum: number; count: number }> = {
      'SPIRITUAL DISCIPLINE': { sum: 0, count: 0 },
      'DZIKIR': { sum: 0, count: 0 },
      'AL-QUR\'AN': { sum: 0, count: 0 },
      'ILMU': { sum: 0, count: 0 },
      'HEALTHY LIFE': { sum: 0, count: 0 },
      'CHARACTER': { sum: 0, count: 0 }
    };

    userRecords.forEach(r => {
      if (Array.isArray(r.items)) {
        r.items.forEach((it: any) => {
          const catName = (it.kategori || '').toUpperCase();
          if (catTotals[catName]) {
            catTotals[catName].sum += (it.persentase || 0);
            catTotals[catName].count += 1;
          }
        });
      }
    });

    Object.keys(catTotals).forEach(cat => {
      if (catTotals[cat].count > 0) {
        categoryScores[cat] = Math.min(100, Math.round(catTotals[cat].sum / catTotals[cat].count));
      } else {
        const avgOverall = Math.round(userRecords.reduce((acc, r) => acc + (r.rataRataPersentase || 0), 0) / userRecords.length);
        categoryScores[cat] = Math.min(100, avgOverall);
      }
    });
  }

  // 6. Radar Chart Categories (Synchronized with Mutabaah Yaumiyah)
  const radarCategories = [
    { label: 'Spiritual Discipline', score: categoryScores['SPIRITUAL DISCIPLINE'] || 0 },
    { label: 'Dzikir & Doa', score: categoryScores['DZIKIR'] || 0 },
    { label: 'Al-Qur\'an & Tahfizh', score: categoryScores['AL-QUR\'AN'] || 0 },
    { label: 'Ilmu & Bahasa', score: categoryScores['ILMU'] || 0 },
    { label: 'Healthy Life & Raga', score: categoryScores['HEALTHY LIFE'] || 0 },
    { label: 'Character & Kedisiplinan', score: categoryScores['CHARACTER'] || 0 }
  ];

  // 7. Badges Earned (Strictly 0 if totalLogsRecorded === 0)
  const unlockedBadges = totalLogsRecorded === 0 ? [] : MASTER_BADGES.filter(b => {
    if (b.kategori === 'Ibadah' && categoryScores['SPIRITUAL DISCIPLINE'] >= 50) return true;
    if (b.kategori === 'Tahfizh' && categoryScores['AL-QUR\'AN'] >= 50) return true;
    if (b.kategori === 'Bahasa' && categoryScores['ILMU'] >= 50) return true;
    if (b.kategori === 'Akhlak' && categoryScores['CHARACTER'] >= 50) return true;
    if (b.kategori === 'Kebersihan' && categoryScores['CHARACTER'] >= 50) return true;
    if (b.kategori === 'Olahraga' && categoryScores['HEALTHY LIFE'] >= 50) return true;
    if (b.kategori === 'Istiqamah' && currentStreakDays >= 7) return true;

    if (b.jenis === 'Rare' && levelData.currentLevel >= 10) return true;
    if (b.jenis === 'Epic' && levelData.currentLevel >= 25) return true;
    if (b.jenis === 'Legendary' && levelData.currentLevel >= 50) return true;
    if (b.jenis === 'Common' && totalLogsRecorded > 0) return true;
    return false;
  });

  // 8. Active RPG Title
  let rpgTitle = totalLogsRecorded === 0 ? 'Santri Baru' : 'Pejuang Pemula';
  if (levelData.currentLevel >= 10) rpgTitle = 'The Disciplined';
  if (levelData.currentLevel >= 20) rpgTitle = 'Guardian of Tahajud';
  if (levelData.currentLevel >= 50) rpgTitle = 'Penjaga Sunnah';
  if (levelData.currentLevel >= 80) rpgTitle = 'Legend of Consistency';

  // 9. Skill Tree Progression
  const categoryMapForSkillNode: Record<string, string> = {
    'Spiritual': 'SPIRITUAL DISCIPLINE',
    'Bahasa': 'ILMU',
    'Tahfizh': 'AL-QUR\'AN',
    'Akhlak': 'CHARACTER',
    'Leadership': 'CHARACTER',
    'Kesehatan': 'HEALTHY LIFE'
  };

  const skillTreeProgress = MASTER_SKILL_TREE.map(node => {
    if (totalLogsRecorded === 0) {
      return {
        ...node,
        currentLevel: 0,
        progressPct: 0
      };
    }
    const catKey = categoryMapForSkillNode[node.kategori] || 'SPIRITUAL DISCIPLINE';
    const catScore = categoryScores[catKey] || 0;
    const nodeLvl = Math.min(node.maxLevel, Math.floor((catScore / 100) * node.maxLevel) + (catScore > 0 ? 1 : 0));
    return {
      ...node,
      currentLevel: nodeLvl,
      progressPct: Math.round((nodeLvl / node.maxLevel) * 100)
    };
  });

  // 10. Unlocked Real Rewards dynamically computed
  const availableRewards = MASTER_REAL_REWARDS.map(rw => {
    const isUnlocked = isRewardUnlockedForSantri(
      rw.syaratMinimum,
      levelData.currentLevel,
      currentStreakDays,
      netXP,
      totalLogsRecorded
    );
    return {
      ...rw,
      isUnlocked
    };
  });

  return {
    netXP,
    levelData,
    currentAvatar,
    currentStreakDays,
    longestStreakDays,
    currentStreakReward,
    unlockedBadges,
    rpgTitle,
    categoryScores,
    radarCategories,
    skillTreeProgress,
    availableRewards,
    totalViolationsCount,
    perfectDaysCount,
    totalLogsRecorded
  };
}
