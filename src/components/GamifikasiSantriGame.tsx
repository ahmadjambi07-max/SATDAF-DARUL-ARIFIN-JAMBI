import React, { useState, useMemo } from 'react';
import { Santri, Kamar, RecordMutabaahSantri, PelanggaranSantri } from '../types';
import { 
  calculateSantriGamificationStats, 
  MASTER_BADGES, 
  MASTER_REAL_REWARDS,
  BadgeItem,
  RealReward
} from '../data/gamificationEngine';
import { 
  Trophy, 
  Flame, 
  Award, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Star, 
  BookOpen, 
  Crown, 
  Target, 
  Gift, 
  Heart, 
  ChevronRight, 
  Info, 
  Activity, 
  Compass, 
  Medal, 
  BarChart3, 
  Send,
  Lock,
  Unlock,
  Check,
  Search,
  Filter,
  Ticket,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GamifikasiSantriGameProps {
  santri: Santri;
  kamarObj?: Kamar | null;
  mutabaahRecords: RecordMutabaahSantri[];
  pelanggaranList: PelanggaranSantri[];
}

export default function GamifikasiSantriGame({
  santri,
  kamarObj,
  mutabaahRecords,
  pelanggaranList
}: GamifikasiSantriGameProps) {
  // Active game navigation tab
  const [activeGameTab, setActiveGameTab] = useState<'rpg' | 'skills' | 'badges' | 'quests' | 'summary' | 'rewards'>('rpg');

  // Filter badge rarity
  const [badgeFilterRarity, setBadgeFilterRarity] = useState<'SEMUA' | 'Common' | 'Rare' | 'Epic' | 'Legendary'>('SEMUA');

  // Parent encouragement blessing state
  const [parentBlessingCount, setParentBlessingCount] = useState<number>(0);
  const [blessingMessage, setBlessingMessage] = useState<string>('');
  const [blessingHistory, setBlessingHistory] = useState<Array<{ text: string; date: string }>>([
    { text: "Barakallahu fiik ananda, terus tingkatkan Shalat Tahajud & Hafalan!", date: new Date().toLocaleDateString('id-ID') }
  ]);
  const [showBlessingSuccess, setShowBlessingSuccess] = useState<boolean>(false);

  // Claimed rewards local state
  const [claimedRewardIds, setClaimedRewardIds] = useState<string[]>([]);

  // Rewards Search & Filters (Master 09_MASTER_REWARD)
  const [rewardSearchQuery, setRewardSearchQuery] = useState<string>('');
  const [rewardCategoryFilter, setRewardCategoryFilter] = useState<string>('SEMUA');
  const [rewardStatusFilter, setRewardStatusFilter] = useState<'SEMUA' | 'SIAP_KLAIM' | 'TERKUNCI' | 'TERKLAIM'>('SEMUA');

  // Compute Gamification Engine Stats for selected Santri
  const stats = useMemo(() => {
    return calculateSantriGamificationStats(santri.id, mutabaahRecords, pelanggaranList);
  }, [santri.id, mutabaahRecords, pelanggaranList]);

  // Combined XP including parent blessings
  const totalDisplayXP = stats.netXP + (parentBlessingCount * 25);

  // Filter badges
  const filteredBadges = useMemo(() => {
    if (badgeFilterRarity === 'SEMUA') return stats.unlockedBadges;
    return stats.unlockedBadges.filter(b => b.jenis === badgeFilterRarity);
  }, [stats.unlockedBadges, badgeFilterRarity]);

  // Filter 100 Master Rewards
  const filteredRewards = useMemo(() => {
    return stats.availableRewards.filter(rw => {
      // Category filter
      if (rewardCategoryFilter !== 'SEMUA' && rw.kategori !== rewardCategoryFilter) {
        return false;
      }

      // Status filter
      const isClaimed = claimedRewardIds.includes(rw.id);
      if (rewardStatusFilter === 'SIAP_KLAIM' && (!rw.isUnlocked || isClaimed)) return false;
      if (rewardStatusFilter === 'TERKUNCI' && rw.isUnlocked) return false;
      if (rewardStatusFilter === 'TERKLAIM' && !isClaimed) return false;

      // Search query filter
      if (rewardSearchQuery.trim()) {
        const q = rewardSearchQuery.toLowerCase().trim();
        const matchId = rw.id.toLowerCase().includes(q);
        const matchNama = rw.nama.toLowerCase().includes(q);
        const matchKat = rw.kategori.toLowerCase().includes(q);
        const matchDesk = (rw.deskripsi || '').toLowerCase().includes(q);
        const matchSyarat = (rw.syaratMinimum || '').toLowerCase().includes(q);
        if (!matchId && !matchNama && !matchKat && !matchDesk && !matchSyarat) {
          return false;
        }
      }

      return true;
    });
  }, [stats.availableRewards, rewardCategoryFilter, rewardStatusFilter, rewardSearchQuery, claimedRewardIds]);

  // Count stats for rewards
  const rewardCounts = useMemo(() => {
    const total = stats.availableRewards.length; // 100
    const ready = stats.availableRewards.filter(r => r.isUnlocked && !claimedRewardIds.includes(r.id)).length;
    const claimed = claimedRewardIds.length;
    const locked = total - stats.availableRewards.filter(r => r.isUnlocked).length;
    return { total, ready, claimed, locked };
  }, [stats.availableRewards, claimedRewardIds]);

  // Quests list synchronized with Mutabaah Yaumiyah categories
  const questsList = useMemo(() => {
    const catScores = stats.categoryScores || {};
    const hasRecords = stats.totalLogsRecorded > 0;

    return [
      {
        id: 'Q001',
        nama: 'Quest Daily #1: Spiritual Discipline',
        target: 'Shalat Subuh, Dzuhur, Ashar, Maghrib, Isya Jamaah, Rawatib & Tahajud',
        kategori: 'SPIRITUAL DISCIPLINE',
        xp: 20,
        scorePct: catScores['SPIRITUAL DISCIPLINE'] || 0,
        done: hasRecords && (catScores['SPIRITUAL DISCIPLINE'] || 0) >= 70
      },
      {
        id: 'Q002',
        nama: 'Quest Daily #2: Dzikir & Doa Yaumiyah',
        target: 'Dzikir Ba\'da Shalat, Doa Orang Tua, Istighosah & Shalawat Diba\'',
        kategori: 'DZIKIR',
        xp: 20,
        scorePct: catScores['DZIKIR'] || 0,
        done: hasRecords && (catScores['DZIKIR'] || 0) >= 70
      },
      {
        id: 'Q003',
        nama: 'Quest Daily #3: Al-Qur\'an & Tahfizh',
        target: 'Tilawah Harian, Setoran Hafalan Baru & Murajaah',
        kategori: 'AL-QUR\'AN',
        xp: 25,
        scorePct: catScores['AL-QUR\'AN'] || 0,
        done: hasRecords && (catScores['AL-QUR\'AN'] || 0) >= 70
      },
      {
        id: 'Q004',
        nama: 'Quest Daily #4: Ilmu & Bahasa',
        target: 'Kosakata Arab, Kosakata Inggris & Belajar Ilmu Baru',
        kategori: 'ILMU',
        xp: 20,
        scorePct: catScores['ILMU'] || 0,
        done: hasRecords && (catScores['ILMU'] || 0) >= 70
      },
      {
        id: 'Q005',
        nama: 'Quest Daily #5: Healthy Life & Jasmani',
        target: 'Puasa Sunnah, Olahraga, Mandi & Tidur Teratur',
        kategori: 'HEALTHY LIFE',
        xp: 20,
        scorePct: catScores['HEALTHY LIFE'] || 0,
        done: hasRecords && (catScores['HEALTHY LIFE'] || 0) >= 70
      },
      {
        id: 'Q006',
        nama: 'Quest Daily #6: Character & Kedisiplinan',
        target: 'Pembersihan Kamar, Piket Asrama & Merapikan Lemari',
        kategori: 'CHARACTER',
        xp: 25,
        scorePct: catScores['CHARACTER'] || 0,
        done: hasRecords && (catScores['CHARACTER'] || 0) >= 70
      },
      {
        id: 'Q041',
        nama: 'Quest Weekly #1: Konsistensi Pekanan',
        target: 'Streak Mutabaah Yaumiyah 7 Hari Berturut-turut',
        kategori: 'ISTIQAMAH',
        xp: 50,
        scorePct: Math.min(100, Math.round((stats.currentStreakDays / 7) * 100)),
        done: hasRecords && stats.currentStreakDays >= 7
      },
      {
        id: 'Q071',
        nama: 'Quest Monthly #1: Konsistensi Bulanan (Perfect Month)',
        target: 'Tuntas Mutabaah Yaumiyah 30 Hari Penuh',
        kategori: 'ISTIQAMAH',
        xp: 150,
        scorePct: Math.min(100, Math.round((stats.currentStreakDays / 30) * 100)),
        done: hasRecords && stats.currentStreakDays >= 30
      }
    ];
  }, [stats.categoryScores, stats.totalLogsRecorded, stats.currentStreakDays]);

  // Handle Send Parent Blessing
  const handleSendBlessing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blessingMessage.trim()) return;

    setBlessingHistory(prev => [
      { text: blessingMessage, date: new Date().toLocaleDateString('id-ID') },
      ...prev
    ]);
    setParentBlessingCount(prev => prev + 1);
    setBlessingMessage('');
    setShowBlessingSuccess(true);
    setTimeout(() => setShowBlessingSuccess(false), 3500);
  };

  // Handle Claim Reward
  const handleClaimReward = (rwId: string, rwNama: string) => {
    if (claimedRewardIds.includes(rwId)) return;
    setClaimedRewardIds(prev => [...prev, rwId]);
    alert(`🎉 Selamat! Voucher / Privilege "${rwNama}" (${rwId}) berhasil diklaim untuk ananda ${santri.nama}.\n\nKode Klaim: KLAIM-${rwId}-${Date.now().toString().slice(-4)}\n\nTunjukkan voucher ini kepada Musyrif Kamar (${kamarObj?.waliKamar || 'Pengasuh'}) untuk penukaran.`);
  };

  return (
    <div className="space-y-6" id="gamifikasi-mutabaah-game-container">
      
      {/* ------------------------------------------------------------------------- */}
      {/* RPG CHARACTER HERO BANNER & AVATAR BADGE */}
      {/* ------------------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-slate-900 via-nature-forest-dark to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/40 relative overflow-hidden">
        
        {/* Glow Effects Backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-nature-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Left: Avatar Frame & Level Emblem */}
          <div className="flex items-center gap-5 w-full lg:w-auto">
            {/* Avatar Frame with Rarity Glow */}
            <div className="relative group">
              <div 
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1.5 shadow-2xl flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: stats.currentAvatar.warna }}
              >
                <div className="w-full h-full bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-center p-2 relative overflow-hidden">
                  {santri.fotoUrl ? (
                    <img src={santri.fotoUrl} alt={santri.nama} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-4xl">{stats.currentAvatar.icon}</span>
                  )}
                  <div className="absolute bottom-1 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[9px] font-black text-nature-gold border border-nature-gold/40">
                    {stats.currentAvatar.nama}
                  </div>
                </div>
              </div>

              {/* Rarity Star Crown Badge */}
              <div className="absolute -top-2 -right-2 bg-nature-gold text-slate-950 p-1.5 rounded-full shadow-lg border border-amber-300 animate-bounce">
                <Crown className="w-4 h-4" />
              </div>
            </div>

            {/* Character RPG Identity */}
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-nature-gold" /> Level {stats.levelData.currentLevel} — {stats.levelData.namaLevel}
                </span>
                <span className="px-2.5 py-0.5 bg-nature-gold/20 text-nature-gold border border-nature-gold/40 text-[10px] font-extrabold rounded-full">
                  Gelar: {stats.rpgTitle}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
                {santri.nama}
              </h2>

              <p className="text-xs text-slate-300 flex flex-wrap items-center gap-x-3 gap-y-1 font-medium">
                <span>NISN: <strong className="text-white font-mono">{santri.nis}</strong></span>
                <span>•</span>
                <span>Kamar: <strong className="text-white">{kamarObj?.namaKamar || 'Asrama'}</strong></span>
                <span>•</span>
                <span>Wali Kamar: <strong className="text-white">{kamarObj?.waliKamar || 'Musyrif'}</strong></span>
              </p>
            </div>
          </div>

          {/* Right: XP Gauge & Streak Meter */}
          <div className="w-full lg:w-80 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 space-y-3">
            
            {/* Level XP Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-slate-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-nature-gold fill-nature-gold" /> XP Kumulatif
                </span>
                <span className="font-mono font-black text-nature-gold text-sm">
                  {totalDisplayXP} XP
                </span>
              </div>

              <div className="w-full bg-slate-950/60 rounded-full h-3 p-0.5 border border-white/20 relative overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-emerald-400 via-teal-300 to-nature-gold h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.levelData.progressPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-300 font-medium">
                <span>Min: {stats.levelData.minXP} XP</span>
                <span>Progres: {stats.levelData.progressPct}%</span>
                <span>Max: {stats.levelData.maxXP} XP</span>
              </div>
            </div>

            {/* Streak Counter Bar */}
            <div className="flex items-center justify-between bg-black/30 p-2.5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 animate-pulse">
                  <Flame className="w-5 h-5 fill-rose-500" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-300 font-bold block uppercase leading-none">Streak Mutabaah</span>
                  <span className="text-xs font-black text-rose-300 leading-none">
                    {stats.currentStreakDays} Hari Berturut-turut
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[9px] text-slate-400 block font-bold">Gelar Streak</span>
                <span className="text-[11px] font-extrabold text-nature-gold">
                  {stats.currentStreakReward.titleReward}
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* GAME NAVIGATION TABS */}
      {/* ------------------------------------------------------------------------- */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-1.5 scrollbar-none">
        <button
          onClick={() => setActiveGameTab('rpg')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'rpg'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-nature-gold" /> Status Karakter
        </button>

        <button
          onClick={() => setActiveGameTab('skills')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'skills'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Compass className="w-4 h-4 text-emerald-400" /> Pohon Skill (6 Tree)
        </button>

        <button
          onClick={() => setActiveGameTab('badges')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'badges'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-amber-400" /> Badge Diraih ({stats.unlockedBadges.length})
        </button>

        <button
          onClick={() => setActiveGameTab('quests')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'quests'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Target className="w-4 h-4 text-sky-400" /> Quests & Target
        </button>

        <button
          onClick={() => setActiveGameTab('summary')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'summary'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-purple-400" /> Ringkasan Radar
        </button>

        <button
          onClick={() => setActiveGameTab('rewards')}
          className={`flex-1 min-w-[130px] px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeGameTab === 'rewards'
              ? 'bg-nature-forest text-white shadow-md'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Gift className="w-4 h-4 text-rose-400" /> Klaim Reward Nyata
        </button>
      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE I: RPG STATUS & PARENT BLESSING / DOA ORANG TUA */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'rpg' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Detailed Character Equipment & Streaks */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Stat Counters Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Hari Sempurna</span>
                <span className="text-xl font-black text-emerald-600 flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> {stats.perfectDaysCount} Hari
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Mutabaah 100% Target</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Streak Terpanjang</span>
                <span className="text-xl font-black text-amber-600 flex items-center justify-center gap-1">
                  <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> {stats.longestStreakDays} Hari
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Rekor Kedisiplinan</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Total Badge Unlocked</span>
                <span className="text-xl font-black text-purple-600 flex items-center justify-center gap-1">
                  <Award className="w-5 h-5 text-purple-500" /> {stats.unlockedBadges.length} Badge
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Koleksi Lencana</span>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs text-center space-y-1">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase block">Bintang Apresiasi Orang Tua</span>
                <span className="text-xl font-black text-rose-600 flex items-center justify-center gap-1">
                  <Star className="w-5 h-5 text-rose-500 fill-rose-500" /> {parentBlessingCount} Bintang
                </span>
                <span className="text-[9px] text-slate-400 block font-medium">Bonus +{parentBlessingCount * 25} XP</span>
              </div>
            </div>

            {/* Recent Earned Badges Showcase */}
            <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-base text-slate-800 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-nature-gold" /> Lencana Kehormatan Terbaru
                </h3>
                <button
                  onClick={() => setActiveGameTab('badges')}
                  className="text-xs font-bold text-nature-forest hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Lihat Semua ({stats.unlockedBadges.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.unlockedBadges.length > 0 ? (
                  stats.unlockedBadges.slice(0, 4).map(b => (
                    <div key={b.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1 hover:border-nature-forest transition-colors">
                      <span className="text-2xl block">{b.icon}</span>
                      <span className="font-extrabold text-xs text-slate-800 block truncate">{b.nama}</span>
                      <span className={`px-2 py-0.2 rounded-full text-[9px] font-black inline-block ${
                        b.jenis === 'Legendary' ? 'bg-amber-100 text-amber-800' :
                        b.jenis === 'Epic' ? 'bg-purple-100 text-purple-800' :
                        b.jenis === 'Rare' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {b.jenis} (+{b.xpBonus} XP)
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 sm:col-span-4 p-5 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center space-y-1.5">
                    <Medal className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-600">Belum Ada Lencana Kehormatan Diraih</p>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                      Data Mutabaah Yaumiyah santri saat ini kosong. Lakukan pengisian Mutabaah Yaumiyah harian untuk meraih lencana kehormatan pertama!
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Streak Roadmap */}
            <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-slate-800 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> Roadmap Milestone Streak (Master 07_MASTER_STREAK)
              </h3>
              
              <div className="space-y-3">
                {[
                  { days: 7, label: "7 Hari (The Starter)", bonus: "+30 XP + Badge B006", done: stats.currentStreakDays >= 7 },
                  { days: 14, label: "14 Hari (The Persistent)", bonus: "+60 XP + Badge B021", done: stats.currentStreakDays >= 14 },
                  { days: 30, label: "30 Hari (The Committed)", bonus: "+120 XP + Badge B036", done: stats.currentStreakDays >= 30 },
                  { days: 60, label: "60 Hari (The Disciplined)", bonus: "+250 XP + Badge B051", done: stats.currentStreakDays >= 60 },
                  { days: 180, label: "180 Hari (The Istiqamah)", bonus: "+800 XP + Badge B081", done: stats.currentStreakDays >= 180 },
                  { days: 365, label: "365 Hari (Legend of Consistency)", bonus: "+2000 XP + Badge B096", done: stats.currentStreakDays >= 365 }
                ].map((st, idx) => (
                  <div key={idx} className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold transition-all ${
                    st.done ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-500'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-black ${
                        st.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                      }`}>
                        {st.done ? <Check className="w-4 h-4" /> : <Lock className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="block font-black text-slate-800">{st.label}</span>
                        <span className="text-[10px] text-slate-500">{st.bonus}</span>
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      st.done ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {st.done ? 'TERCAPAI' : `Target ${st.days} Hari`}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col: Parent Encouragement & Doa Interactive Card */}
          <div className="space-y-6">
            
            {/* Interactive Blessing Card */}
            <div className="bg-gradient-to-br from-amber-500 via-orange-600 to-rose-600 text-white p-6 rounded-3xl shadow-lg border border-amber-400/30 space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/20 rounded-xl text-white">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-white">Kirim Doa & Apresiasi Orang Tua</h3>
                  <p className="text-[11px] text-amber-100">Beri semangat & +25 Bonus XP untuk ananda</p>
                </div>
              </div>

              {showBlessingSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/95 text-slate-900 p-3 rounded-2xl text-xs font-extrabold flex items-center gap-2 shadow-md border border-amber-300"
                >
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500 animate-spin" />
                  <span>Subhanallah! Doa & Apresiasi dikirim (+25 XP untuk ananda)</span>
                </motion.div>
              )}

              <form onSubmit={handleSendBlessing} className="space-y-3">
                <textarea
                  value={blessingMessage}
                  onChange={(e) => setBlessingMessage(e.target.value)}
                  placeholder="Tuliskan kata doa & motivasi Abi/Umi untuk ananda (misal: Semoga senantiasa istiqamah & rajin hafalan)..."
                  rows={3}
                  className="w-full p-3 bg-white/10 border border-white/20 rounded-2xl text-xs text-white placeholder-amber-100/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                  id="input-parent-blessing"
                />

                <button
                  type="submit"
                  disabled={!blessingMessage.trim()}
                  className="w-full py-3 bg-white text-rose-700 hover:bg-amber-100 font-extrabold text-xs rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  id="btn-send-blessing"
                >
                  <Send className="w-4 h-4 text-rose-600" /> Kirim Bintang Doa (+25 XP)
                </button>
              </form>

              {/* History of Parent Blessings */}
              <div className="space-y-2 pt-2 border-t border-white/20">
                <span className="text-[10px] font-extrabold uppercase text-amber-100 block">Riwayat Doa Abi & Umi:</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-none">
                  {blessingHistory.map((bl, i) => (
                    <div key={i} className="p-2.5 bg-black/20 rounded-xl text-xs space-y-0.5 border border-white/10">
                      <p className="text-white font-medium text-[11px]">"{bl.text}"</p>
                      <span className="text-[9px] text-amber-200 block text-right font-mono">{bl.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Summary Box */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-slate-500">
                Data Gamifikasi SATDAF
              </h4>
              <div className="space-y-2 text-xs font-semibold text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Tier Avatar</span>
                  <span className="font-bold text-slate-900">{stats.currentAvatar.nama}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Entry Mutabaah</span>
                  <span className="font-bold text-slate-900">{stats.totalLogsRecorded} Hari</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Potongan Pelanggaran</span>
                  <span className="font-bold text-rose-600">-{stats.totalViolationsCount * 15} XP</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Level Seluruhnya</span>
                  <span className="font-black text-nature-forest">Lvl {stats.levelData.currentLevel} / 100</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE II: POHON SKILL (SKILL TREE 6 TREES) */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'skills' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" /> Pohon Skill Santri (Master 05_MASTER_SKILL_TREE)
            </h3>
            <p className="text-xs text-slate-500">
              6 Cabang Utama Kemampuan Santri: Spiritual, Bahasa, Tahfizh, Akhlak, Leadership, dan Kesehatan
            </p>
          </div>

          {stats.totalLogsRecorded === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                <strong>Status Pohon Skill Kosong (Level 0):</strong> Belum ada data input Mutabaah Yaumiyah. Setiap pengisian Mutabaah Yaumiyah harian akan menaikkan level pada 6 pilar skill utama ini.
              </p>
            </div>
          )}

          {/* Skill Nodes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stats.skillTreeProgress.map((node) => (
              <div 
                key={node.id} 
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  !node.parentId 
                    ? 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100 border-emerald-300 shadow-sm' 
                    : 'bg-slate-50 border-slate-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 bg-white rounded-xl shadow-3xs">{node.icon}</span>
                    <div>
                      <h4 className="font-serif font-extrabold text-sm text-slate-800">{node.nama}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{node.kategori}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                    !node.parentId ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-800'
                  }`}>
                    Lvl {node.currentLevel} / {node.maxLevel}
                  </span>
                </div>

                {/* Progress Gauge */}
                <div className="space-y-1">
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${node.progressPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span>Kemajuan: {node.progressPct}%</span>
                    <span>+{node.xpPerLevel} XP / Lvl</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE III: BADGE COLLECTION (150 MASTER BADGES LOG) */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'badges' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Koleksi Lencana & Badge Kehormatan ({stats.unlockedBadges.length} Diraih)
              </h3>
              <p className="text-xs text-slate-500">
                Seluruh badge yang berhasil diraih ananda {santri.nama} berdasarkan akumulasi Mutabaah
              </p>
            </div>

            {/* Filter Rarity */}
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              {(['SEMUA', 'Common', 'Rare', 'Epic', 'Legendary'] as const).map(rarity => (
                <button
                  key={rarity}
                  onClick={() => setBadgeFilterRarity(rarity)}
                  className={`px-3 py-1.5 font-extrabold rounded-lg transition-all cursor-pointer ${
                    badgeFilterRarity === rarity 
                      ? 'bg-nature-forest text-white shadow-3xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {rarity}
                </button>
              ))}
            </div>
          </div>

          {stats.totalLogsRecorded === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <Info className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                <strong>Koleksi Lencana Kosong (0/150 Unlocked):</strong> Seluruh lencana dalam posisi terkunci karena data Mutabaah Yaumiyah santri dalam kondisi dikosongkan. Lakukan pengisian Mutabaah harian untuk membuka lencana kehormatan!
              </p>
            </div>
          )}

          {/* Badges Display Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {MASTER_BADGES.map(b => {
              const isEarned = stats.unlockedBadges.some(ub => ub.id === b.id);
              return (
                <div 
                  key={b.id} 
                  className={`p-4 rounded-2xl border text-center space-y-2 relative transition-all ${
                    isEarned 
                      ? 'bg-white border-slate-200 shadow-2xs hover:border-nature-forest hover:scale-105' 
                      : 'bg-slate-50 border-slate-200/60 opacity-40 grayscale'
                  }`}
                >
                  {!isEarned && (
                    <div className="absolute top-2 right-2 text-slate-400">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <span className="text-3xl block">{b.icon}</span>
                  <div>
                    <h5 className="font-serif font-black text-xs text-slate-800 truncate">{b.nama}</h5>
                    <span className="text-[9px] font-bold text-slate-400 block">{b.kategori}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black inline-block ${
                    b.jenis === 'Legendary' ? 'bg-amber-100 text-amber-800' :
                    b.jenis === 'Epic' ? 'bg-purple-100 text-purple-800' :
                    b.jenis === 'Rare' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {b.jenis} (+{b.xpBonus} XP)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE IV: QUESTS & ACHIEVEMENTS */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'quests' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
              <Target className="w-5 h-5 text-sky-600" /> Quests & Target Amalan Mutabaah Yaumiyah
            </h3>
            <p className="text-xs text-slate-500">Target amalan terukur yang disinkronkan langsung dengan rekapan input Mutabaah Yaumiyah santri</p>
          </div>

          {stats.totalLogsRecorded === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <Target className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                <strong>Status Quests Kosong (0% Progress):</strong> Belum ada data input Mutabaah Yaumiyah. Lakukan pengisian Mutabaah harian untuk menyelesaikan quest dan mengklaim bonus XP.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questsList.map(q => (
              <div key={q.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                q.done ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
                    q.done ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {q.done ? <Check className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <h5 className="font-serif font-extrabold text-xs text-slate-800">{q.nama}</h5>
                    <p className="text-[10px] text-slate-500">{q.target}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-bold text-slate-400">Kemajuan: {q.scorePct}%</span>
                    </div>
                  </div>
                </div>

                <span className="px-2.5 py-1 bg-nature-gold/20 text-nature-forest border border-nature-gold/30 text-[10px] font-black rounded-full shrink-0">
                  +{q.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE V: RADAR SUMMARY (12_MASTER_PARENT_SUMMARY) */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'summary' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" /> Ringkasan Analisis Orang Tua (6 Bidang Mutabaah)
            </h3>
            <p className="text-xs text-slate-500">Laporan evaluasi 6 bidang pengembangan santri dan analisis kekuatan/kelemahan secara otomatis</p>
          </div>

          {stats.totalLogsRecorded === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                <strong>Grafik Radar Mutabaah (0% Capaian):</strong> Nilai radar 6 bidang pengembangan dalam kondisi dikosongkan mengikuti ketiadaan data input Mutabaah Yaumiyah santri.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Radar Category Scores */}
            <div className="space-y-4">
              <h4 className="font-serif font-bold text-sm text-slate-800">Capaian 6 Kategori Utama:</h4>
              <div className="space-y-3">
                {stats.radarCategories.map((rc, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-extrabold">
                      <span className="text-slate-700">{rc.label}</span>
                      <span className="text-nature-forest">{rc.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-700 h-full rounded-full"
                        style={{ width: `${rc.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strength & Weakness Analysis Box */}
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> Bidang Kekuatan Utama (Strength)
                </span>
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  {stats.totalLogsRecorded === 0 ? (
                    "Belum ada data input Mutabaah Yaumiyah untuk dianalisis. Grafik kekuatan akan diperbarui secara otomatis setelah pengisian Mutabaah harian terisi."
                  ) : (
                    <>
                      Ananda <strong>{santri.nama}</strong> menunjukkan performa terbaik pada bidang <strong>{[...stats.radarCategories].sort((a, b) => b.score - a.score)[0]?.label}</strong> dengan pencapaian <strong>{[...stats.radarCategories].sort((a, b) => b.score - a.score)[0]?.score}%</strong>.
                    </>
                  )}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 space-y-2">
                <span className="text-xs font-black text-amber-800 flex items-center gap-1.5 uppercase">
                  <Info className="w-4 h-4 text-amber-600" /> Rekomendasi Peningkatan (Weakness Focus)
                </span>
                <p className="text-xs text-amber-900 leading-relaxed font-medium">
                  {stats.totalLogsRecorded === 0 ? (
                    "Belum ada data input. Rekomendasi bidang peningkatan akan dianalisis secara otomatis setelah rekapan data Mutabaah Yaumiyah terisi."
                  ) : (
                    <>
                      Perlu dorongan dan pembiasaan pada bidang <strong>{[...stats.radarCategories].sort((a, b) => a.score - b.score)[0]?.label}</strong> (pencapaian {[...stats.radarCategories].sort((a, b) => a.score - b.score)[0]?.score}%) agar seimbang dengan amalan harian lainnya.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* MODULE VI: REAL REWARDS (09_MASTER_REWARD - 100 MASTER REWARDS) */}
      {/* ------------------------------------------------------------------------- */}
      {activeGameTab === 'rewards' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          
          {/* Header & Description */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[11px] font-black rounded-full uppercase tracking-wider">
                  Master Data 09_MASTER_REWARD
                </span>
                <span className="px-2.5 py-0.5 bg-nature-forest/10 text-nature-forest text-[11px] font-black rounded-full">
                  Total 100 Reward
                </span>
              </div>
              <h3 className="font-serif font-bold text-xl text-slate-800 flex items-center gap-2">
                <Gift className="w-6 h-6 text-rose-500" /> Klaim Reward Nyata & Privilege Santri
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                Penukaran reward nyata (voucher kantin/koperasi, snack sehat, alat tulis, buku, piagam, bintang kamar, hingga beasiswa) berdasarkan level, streak, dan XP ananda <strong>{santri.nama}</strong>.
              </p>
            </div>

            {/* Quick Stat Counter Cards */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <div className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-2xl text-center min-w-[80px]">
                <span className="block text-[10px] font-bold text-emerald-600 uppercase">Siap Klaim</span>
                <span className="text-lg font-black text-emerald-700">{rewardCounts.ready}</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 px-3 py-2 rounded-2xl text-center min-w-[80px]">
                <span className="block text-[10px] font-bold text-amber-600 uppercase">Terklaim</span>
                <span className="text-lg font-black text-amber-700">{rewardCounts.claimed}</span>
              </div>
              <div className="bg-slate-100 border border-slate-200 px-3 py-2 rounded-2xl text-center min-w-[80px]">
                <span className="block text-[10px] font-bold text-slate-500 uppercase">Terkunci</span>
                <span className="text-lg font-black text-slate-700">{rewardCounts.locked}</span>
              </div>
            </div>
          </div>

          {stats.totalLogsRecorded === 0 && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
              <Gift className="w-5 h-5 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-900 font-medium">
                <strong>Belum Ada Reward Siap Diklaim (0 Ready):</strong> Seluruh 100 reward dan privilege dalam posisi terkunci karena data Mutabaah Yaumiyah santri dalam kondisi dikosongkan. Pengisian Mutabaah harian akan membuka voucher dan privilege secara otomatis.
              </p>
            </div>
          )}

          {/* Search Bar & Category Filters */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={rewardSearchQuery}
                  onChange={(e) => setRewardSearchQuery(e.target.value)}
                  placeholder="Cari reward (misal: RW001, Kurma, Buku, Voucher, Level 10)..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-nature-forest/30"
                />
                {rewardSearchQuery && (
                  <button
                    onClick={() => setRewardSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setRewardStatusFilter('SEMUA')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    rewardStatusFilter === 'SEMUA'
                      ? 'bg-nature-forest text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Semua ({rewardCounts.total})
                </button>
                <button
                  onClick={() => setRewardStatusFilter('SIAP_KLAIM')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    rewardStatusFilter === 'SIAP_KLAIM'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  Siap Klaim ({rewardCounts.ready})
                </button>
                <button
                  onClick={() => setRewardStatusFilter('TERKLAIM')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    rewardStatusFilter === 'TERKLAIM'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'text-amber-700 hover:bg-amber-50'
                  }`}
                >
                  Terklaim ({rewardCounts.claimed})
                </button>
                <button
                  onClick={() => setRewardStatusFilter('TERKUNCI')}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                    rewardStatusFilter === 'TERKUNCI'
                      ? 'bg-slate-700 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Terkunci ({rewardCounts.locked})
                </button>
              </div>

            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 pr-1">
                <Filter className="w-3.5 h-3.5" /> Kategori:
              </span>
              {[
                'SEMUA',
                'Aksesoris',
                'Alat Tulis',
                'Kartu Apresiasi',
                'Snack Sehat',
                'Buku',
                'Bintang Kamar',
                'Privilege',
                'Piagam',
                'Sertifikat'
              ].map((kat) => (
                <button
                  key={kat}
                  onClick={() => setRewardCategoryFilter(kat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                    rewardCategoryFilter === kat
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {kat}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Menampilkan <strong>{filteredRewards.length}</strong> dari <strong>100</strong> Master Reward
            </span>
            {(rewardSearchQuery || rewardCategoryFilter !== 'SEMUA' || rewardStatusFilter !== 'SEMUA') && (
              <button
                onClick={() => {
                  setRewardSearchQuery('');
                  setRewardCategoryFilter('SEMUA');
                  setRewardStatusFilter('SEMUA');
                }}
                className="text-emerald-700 hover:underline font-bold text-xs"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Reward Grid */}
          {filteredRewards.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-12 h-12 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mx-auto">
                <Gift className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Tidak Ada Reward Ditemukan</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Coba ubah kata kunci pencarian atau sesuaikan filter status/kategori yang dipilih.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRewards.map((rw) => {
                const isClaimed = claimedRewardIds.includes(rw.id);
                const isUnlocked = rw.isUnlocked;

                return (
                  <div
                    key={rw.id}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
                      isClaimed
                        ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                        : isUnlocked
                        ? 'bg-white border-emerald-200/90 shadow-sm hover:shadow-md hover:border-emerald-400'
                        : 'bg-slate-50/80 border-slate-200 opacity-80'
                    }`}
                  >
                    <div className="space-y-3">
                      
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-mono text-[10px] font-bold rounded-md border border-slate-200">
                            {rw.id}
                          </span>
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded-md border border-rose-200">
                            {rw.jenis}
                          </span>
                        </div>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-black text-[10px] rounded-full">
                          {rw.kategori}
                        </span>
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3">
                        <div className="text-3xl p-2 bg-slate-100/80 rounded-xl border border-slate-200/60 flex-shrink-0">
                          {rw.icon}
                        </div>
                        <div className="space-y-0.5">
                          <h4 className="font-serif font-extrabold text-sm text-slate-800 leading-snug">
                            {rw.nama}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {rw.deskripsi}
                          </p>
                        </div>
                      </div>

                      {/* Requirements & Value */}
                      <div className="pt-2 border-t border-slate-100 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">Syarat Minimum:</span>
                          <span className={`font-bold px-2 py-0.5 rounded-md ${
                            isUnlocked 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-slate-200 text-slate-700'
                          }`}>
                            {rw.syaratMinimum}
                          </span>
                        </div>

                        {rw.estimasiNilaiRp > 0 && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">Estimasi Nilai:</span>
                            <span className="font-black text-nature-forest">
                              Rp {rw.estimasiNilaiRp.toLocaleString('id-ID')}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={() => handleClaimReward(rw.id, rw.nama)}
                      disabled={!isUnlocked || isClaimed}
                      className={`w-full py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isClaimed
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 cursor-default'
                          : isUnlocked
                          ? 'bg-nature-forest text-white hover:bg-nature-forest-medium shadow-sm hover:shadow'
                          : 'bg-slate-200 text-slate-500 cursor-not-allowed border border-slate-300'
                      }`}
                    >
                      {isClaimed ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-amber-600" />
                          <span>Terklaim (Voucher Aktif)</span>
                        </>
                      ) : isUnlocked ? (
                        <>
                          <Gift className="w-4 h-4 text-nature-gold" />
                          <span>Klaim Voucher Nyata</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Terkunci (Syarat Belum Terpenuhi)</span>
                        </>
                      )}
                    </button>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
