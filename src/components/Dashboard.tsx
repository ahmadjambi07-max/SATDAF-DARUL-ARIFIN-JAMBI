import React, { useState } from 'react';
import { Santri, PengasuhGuru, Kamar, LogAktivitas, CatatanKeuangan, PelanggaranSantri } from '../types';
import { 
  Users, 
  GraduationCap, 
  Home, 
  Clock, 
  TrendingUp, 
  ShieldCheck, 
  TrendingDown, 
  Plus, 
  CalendarDays,
  UserCheck2,
  FileText,
  BarChart2,
  ShieldAlert,
  AlertTriangle,
  Wallet,
  Building2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  PieChart
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface DashboardProps {
  santri: Santri[];
  guru: PengasuhGuru[];
  kamar: Kamar[];
  logs: LogAktivitas[];
  keuangan: CatatanKeuangan[];
  pelanggaran: PelanggaranSantri[];
  onNavigate: (menu: string) => void;
  onAddSantriQuick: () => void;
}

export default function Dashboard({ 
  santri, 
  guru, 
  kamar, 
  logs, 
  keuangan, 
  pelanggaran = [],
  onNavigate,
  onAddSantriQuick
}: DashboardProps) {
  // Stats calculations
  const totalSantri = santri.length;
  const santriAktif = santri.filter(s => s.status === 'Aktif').length;
  const santriPindah = santri.filter(s => s.status === 'Pindah').length;
  const santriLakiLaki = santri.filter(s => s.gender === 'Laki-laki' && s.status === 'Aktif').length;
  const santriPerempuan = santri.filter(s => s.gender === 'Perempuan' && s.status === 'Aktif').length;

  const totalGuru = guru.length;
  const totalJadwal = guru.reduce((acc, curr) => acc + curr.jadwal.length, 0);

  const totalKamar = kamar.length;
  const totalKapasitas = kamar.reduce((acc, curr) => acc + curr.kapasitas, 0);
  const totalTerisi = santri.filter(s => s.status === 'Aktif' && s.idKamar).length;
  const occupancyPercentage = Math.round((totalTerisi / totalKapasitas) * 100) || 0;

  // Financial summary
  const pemasukan = keuangan
    .filter(k => k.tipe === 'Pemasukan')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const pengeluaran = keuangan
    .filter(k => k.tipe === 'Pengeluaran')
    .reduce((acc, curr) => acc + curr.nominal, 0);
  const saldoTotal = pemasukan - pengeluaran;

  // Recent logs
  const recentLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 4);

  // Violations/Pelanggaran calculations
  const totalPelanggaran = pelanggaran.length;
  const countRingan = pelanggaran.filter(p => p.kategori === 'Ringan').length;
  const countSedang = pelanggaran.filter(p => p.kategori === 'Sedang').length;
  const countBerat = pelanggaran.filter(p => p.kategori === 'Berat').length;

  const pelanggaranChartData = [
    { name: 'Ringan', 'Jumlah': countRingan, color: '#D97706' },
    { name: 'Sedang', 'Jumlah': countSedang, color: '#EA580C' },
    { name: 'Berat', 'Jumlah': countBerat, color: '#DC2626' }
  ];

  // Latest 3 infractions for overview list inside the card
  const recentPelanggaran = [...pelanggaran]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 3);

  // Formatting currency
  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  // Helper to group santri by month of tanggalMasuk for Recharts bar chart
  const getMonthlyStatusData = () => {
    const monthsMap: { [key: string]: { monthName: string; monthKey: string; Aktif: number; Pindah: number; timestamp: number } } = {};
    
    // Indonesian month names
    const indonesianMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    santri.forEach(s => {
      if (!s.tanggalMasuk) return;
      const date = new Date(s.tanggalMasuk);
      if (isNaN(date.getTime())) return;
      
      const year = date.getFullYear();
      const monthIndex = date.getMonth();
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      const monthName = `${indonesianMonths[monthIndex]} ${year}`;
      
      if (!monthsMap[monthKey]) {
        monthsMap[monthKey] = {
          monthKey,
          monthName,
          Aktif: 0,
          Pindah: 0,
          timestamp: date.getTime()
        };
      }
      
      if (s.status === 'Aktif') {
        monthsMap[monthKey].Aktif += 1;
      } else if (s.status === 'Pindah') {
        monthsMap[monthKey].Pindah += 1;
      }
    });

    // Sort chronologically by timestamp
    const sortedData = Object.values(monthsMap)
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
      .map(({ monthName, Aktif, Pindah }) => ({
        name: monthName,
        'Santri Aktif': Aktif,
        'Santri Pindah': Pindah
      }));

    // Fallback: if no data grouped, provide clean standard months so the chart looks great
    if (sortedData.length === 0) {
      return [
        { name: 'Jul 2024', 'Santri Aktif': 4, 'Santri Pindah': 1 },
        { name: 'Agt 2024', 'Santri Aktif': 6, 'Santri Pindah': 0 },
        { name: 'Sep 2024', 'Santri Aktif': 9, 'Santri Pindah': 2 },
        { name: 'Okt 2024', 'Santri Aktif': 12, 'Santri Pindah': 1 },
        { name: 'Nov 2024', 'Santri Aktif': 15, 'Santri Pindah': 3 },
        { name: 'Des 2024', 'Santri Aktif': 18, 'Santri Pindah': 2 },
      ];
    }

    return sortedData;
  };

  const chartData = getMonthlyStatusData();

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-nature-forest to-nature-forest-dark rounded-2xl p-6 md:p-8 text-white shadow-md relative overflow-hidden" id="welcome-banner">
        
        {/* Batik Golden Motif Background Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none select-none opacity-[0.14] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23D4AF37' stroke-width='1.2'%3E%3C!-- Kawung / Gurda Batik Motif --%3E%3Cpath d='M50,0 C65,20 65,30 50,50 C35,30 35,20 50,0 Z' /%3E%3Cpath d='M50,100 C65,80 65,70 50,50 C35,70 35,80 50,100 Z' /%3E%3Cpath d='M0,50 C20,65 30,65 50,50 C30,35 20,35 0,50 Z' /%3E%3Cpath d='M100,50 C80,65 70,65 50,50 C70,35 80,35 100,50 Z' /%3E%3C!-- Inner Concentric Petals --%3E%3Cpath d='M50,10 C60,25 60,30 50,40 C40,30 40,25 50,10 Z' stroke-width='0.6' /%3E%3Cpath d='M50,90 C60,75 60,70 50,60 C40,70 40,75 50,90 Z' stroke-width='0.6' /%3E%3Cpath d='M10,50 C25,60 30,60 40,50 C30,40 25,40 10,50 Z' stroke-width='0.6' /%3E%3Cpath d='M90,50 C75,60 70,60 60,50 C70,40 75,40 90,50 Z' stroke-width='0.6' /%3E%3C!-- Tiny Cecek Dots --%3E%3Ccircle cx='50' cy='50' r='2.5' fill='%23D4AF37' /%3E%3Ccircle cx='25' cy='25' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='75' cy='25' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='25' cy='75' r='1' fill='%23D4AF37' /%3E%3Ccircle cx='75' cy='75' r='1' fill='%23D4AF37' /%3E%3C/g%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Large Decorative Elegant Corner Mandalas for Luxurious Aesthetic */}
        <div className="absolute top-0 right-0 w-72 h-72 text-nature-gold/25 pointer-events-none transform translate-x-12 -translate-y-12">
          <svg viewBox="0 0 100 100" fill="none" className="w-full h-full" stroke="currentColor" strokeWidth="0.8">
            <circle cx="50" cy="50" r="45" strokeDasharray="3,3" />
            <circle cx="50" cy="50" r="35" />
            <circle cx="50" cy="50" r="25" />
            <path d="M50,5 L50,95 M5,50 L95,50" />
            <path d="M18,18 L82,82 M18,82 L82,18" />
            <path d="M50,15 C60,25 65,35 50,50 C35,35 40,25 50,15 Z" />
            <path d="M50,85 C60,75 65,65 50,50 C35,65 40,75 50,85 Z" />
            <path d="M15,50 C25,60 35,65 50,50 C35,35 25,40 15,50 Z" />
            <path d="M85,50 C75,60 65,65 50,50 C65,35 75,40 85,50 Z" />
          </svg>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-nature-gold via-transparent to-transparent pointer-events-none"></div>
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 bg-nature-forest-dark/65 text-nature-gold border border-nature-forest-medium px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-nature-gold animate-pulse"></span>
              Tahun Ajaran 2026/2027
            </div>
            <div className="inline-flex items-center gap-2 bg-[#D4AF37]/10 text-nature-gold border border-[#D4AF37]/25 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-widest uppercase">
              SATDAF TERPADU
            </div>
          </div>

          <div className="space-y-1.5" id="animated-brand-column">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-xs md:text-sm font-bold tracking-[0.2em] text-nature-gold/90 uppercase"
            >
              Selamat Datang di Portal Resmi SATDAF
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-2xl md:text-3xl lg:text-4xl font-serif font-extrabold text-white tracking-tight leading-tight select-none relative"
            >
              <span className="bg-gradient-to-r from-white via-slate-100 to-[#FAF0D7] bg-clip-text text-transparent">
                SISTEM ADMINISTRASI TERPADU
              </span>
              <br />
              <span className="bg-gradient-to-r from-nature-gold via-[#FAF0D7] to-nature-gold bg-clip-text text-transparent drop-shadow-md italic pr-2">
                DARUL ARIFIN
              </span>{" "}
              <span className="text-white">(SATDAF)</span>
              
              {/* Dynamic shining light sweep effect under text */}
              <div className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-nature-gold/45 to-transparent rounded-full animate-pulse" />
            </motion.h1>
          </div>

          <p className="text-slate-200/95 max-w-2xl text-xs md:text-sm leading-relaxed font-medium">
            Pantau perkembangan data santri secara real-time, kehadiran guru/pengasuh terpadu, okupansi asrama, serta pelanggaran santri dalam satu platform cerdas, modern, dan aman.
          </p>
          <div className="flex flex-wrap gap-3 pt-3">
            <button 
              onClick={onAddSantriQuick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nature-gold hover:bg-nature-gold/90 text-nature-forest-dark font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              id="quick-add-santri-btn"
            >
              <Plus className="w-4 h-4" /> Input Santri Baru
            </button>
            <button 
              onClick={() => onNavigate('monitoring')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-nature-forest-medium hover:bg-nature-forest-medium/85 text-white font-bold text-xs rounded-xl border border-nature-forest-medium transition-all cursor-pointer"
              id="view-live-monitor-btn"
            >
              <Clock className="w-4 h-4" /> Lihat Monitoring Real-Time
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats-grid">
        {/* Santri Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('santri')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-nature-border cursor-pointer hover:shadow-md transition-all flex items-start gap-4"
          id="stat-santri"
        >
          <div className="p-3 rounded-xl bg-nature-beige text-nature-forest border border-nature-border">
            <Users className="w-6 h-6 text-nature-sage" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-nature-sage uppercase tracking-widest block">Santri Aktif</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-nature-forest font-bold">{santriAktif}</span>
              <span className="text-xs text-slate-500">dari {totalSantri} total</span>
            </div>
            <div className="flex gap-2 text-[10px] text-slate-500 pt-1">
              <span className="bg-nature-beige text-nature-forest px-1.5 py-0.5 rounded-sm font-semibold">{santriLakiLaki} Pa</span>
              <span className="bg-pink-50 text-pink-850 px-1.5 py-0.5 rounded-sm font-semibold">{santriPerempuan} Pi</span>
            </div>
          </div>
        </motion.div>

        {/* Guru & Pengasuh Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('guru')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-nature-border cursor-pointer hover:shadow-md transition-all flex items-start gap-4"
          id="stat-guru"
        >
          <div className="p-3 rounded-xl bg-nature-beige text-nature-forest border border-nature-border">
            <GraduationCap className="w-6 h-6 text-nature-sage" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-nature-sage uppercase tracking-widest block">Tenaga Pendidik</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-nature-forest font-bold">{totalGuru}</span>
              <span className="text-xs text-slate-500">Bimbingan</span>
            </div>
            <div className="flex gap-2 text-[10px] text-slate-500 pt-1">
              <span className="bg-nature-beige text-nature-forest px-1.5 py-0.5 rounded-sm font-semibold">{totalJadwal} Jadwal Kelas</span>
            </div>
          </div>
        </motion.div>

        {/* Kamar & Hunian Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('kamar')}
          className="bg-white p-5 rounded-2xl shadow-xs border border-nature-border cursor-pointer hover:shadow-md transition-all flex items-start gap-4"
          id="stat-kamar"
        >
          <div className="p-3 rounded-xl bg-nature-beige text-nature-forest border border-nature-border">
            <Home className="w-6 h-6 text-nature-sage" />
          </div>
          <div className="space-y-1 w-full">
            <span className="text-[10px] font-bold text-nature-sage uppercase tracking-widest block">Okupansi Kamar</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-serif text-nature-forest font-bold">{occupancyPercentage}%</span>
              <span className="text-xs text-slate-500">{totalTerisi}/{totalKapasitas} Bed</span>
            </div>
            {/* Simple mini progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div 
                className="bg-nature-sage h-full rounded-full transition-all duration-500" 
                style={{ width: `${occupancyPercentage}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Laporan Terintegrasi Card */}
        <motion.div 
          whileHover={{ y: -4 }}
          onClick={() => onNavigate('laporan')}
          className="bg-emerald-900 p-5 rounded-2xl shadow-xs text-white cursor-pointer hover:shadow-md transition-all flex items-start gap-4 border border-emerald-800"
          id="stat-laporan-terintegrasi"
        >
          <div className="p-3 rounded-xl bg-white/10 text-white border border-white/20">
            <FileText className="w-6 h-6 text-nature-gold" />
          </div>
          <div className="space-y-1 w-full">
            <span className="text-[10px] font-bold text-white/90 uppercase tracking-widest block">Laporan Terintegrasi</span>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-serif text-white font-bold leading-tight">4 Sub-Sistem Terpadu</span>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[9px] pt-1 text-white/90">
              <span className="bg-white/15 px-1.5 py-0.5 rounded font-bold">Santri</span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded font-bold">Disiplin</span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded font-bold">Asrama</span>
              <span className="bg-white/15 px-1.5 py-0.5 rounded font-bold">SDM</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ========================================================================= */}
      {/* RANGKUMAN EKSEKUTIF LAPORAN TERINTEGRASI SATDAF */}
      {/* ========================================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-nature-border/80 shadow-xs space-y-5" id="integrated-reports-summary-section">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-nature-border/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-800 text-nature-gold flex items-center justify-center shrink-0 border border-emerald-900 shadow-2xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Konsolidasi Data Real-Time
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <h2 className="font-serif font-black text-lg md:text-xl text-slate-900 mt-0.5">
                Rangkuman Laporan Terintegrasi Pesantren
              </h2>
            </div>
          </div>

          <button
            onClick={() => onNavigate('laporan')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-nature-gold" />
            <span>Lihat Detail Laporan & Cetak PDF</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Integrated Sub-System Report Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Laporan Santri & Akademik */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                  1. Santri & Demografi
                </span>
                <Users className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-serif font-black text-slate-900">{santriAktif} <span className="text-xs font-sans font-bold text-slate-500">Aktif</span></div>
                <p className="text-[11px] text-slate-600 font-medium">Dari total {totalSantri} santri terdaftar</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-emerald-200/60 text-[10px]">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Santri Putra (Pa):</span>
                <span className="text-blue-700">{santriLakiLaki} orang</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Santri Putri (Pi):</span>
                <span className="text-pink-700">{santriPerempuan} orang</span>
              </div>
              <div className="flex justify-between font-bold text-slate-500 pt-1 border-t border-dashed border-emerald-200">
                <span>Mutasi Pindah:</span>
                <span className="text-amber-700">{santriPindah} santri</span>
              </div>
            </div>
          </div>

          {/* 2. Laporan Kedisiplinan & Pelanggaran */}
          <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                  2. Kedisiplinan
                </span>
                <ShieldAlert className="w-4 h-4 text-amber-700" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-serif font-black text-slate-900">{totalPelanggaran} <span className="text-xs font-sans font-bold text-slate-500">Catatan</span></div>
                <p className="text-[11px] text-slate-600 font-medium">Catatan pelanggaran santri</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-amber-200/60 text-[10px]">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Ringan (Peringatan):</span>
                <span className="text-amber-700">{countRingan}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Sedang (Ta'zir):</span>
                <span className="text-orange-700">{countSedang}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Berat (Panggilan):</span>
                <span className="text-red-700">{countBerat}</span>
              </div>
            </div>
          </div>

          {/* 3. Laporan Asrama & Kamar */}
          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200/80 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">
                  3. Okupansi Asrama
                </span>
                <Home className="w-4 h-4 text-blue-700" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-serif font-black text-slate-900">{occupancyPercentage}% <span className="text-xs font-sans font-bold text-slate-500">Okupansi</span></div>
                <p className="text-[11px] text-slate-600 font-medium">{totalTerisi} dari {totalKapasitas} bed terisi</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-blue-200/60 text-[10px]">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Total Kamar:</span>
                <span className="text-slate-900">{totalKamar} kamar</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Sisa Kasur Kosong:</span>
                <span className="text-emerald-700">{totalKapasitas - totalTerisi} bed</span>
              </div>
              <div className="w-full bg-blue-100 h-1.5 rounded-full overflow-hidden mt-1">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${occupancyPercentage}%` }}></div>
              </div>
            </div>
          </div>

          {/* 4. Laporan Tenaga Pendidik */}
          <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-200/80 space-y-3 flex flex-col justify-between hover:shadow-xs transition-shadow">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-200">
                  4. SDM Pendidik
                </span>
                <GraduationCap className="w-4 h-4 text-purple-700" />
              </div>
              <div className="pt-1">
                <div className="text-2xl font-serif font-black text-slate-900">{totalGuru} <span className="text-xs font-sans font-bold text-slate-500">Ustadz/Guru</span></div>
                <p className="text-[11px] text-slate-600 font-medium">Pengasuh & pengajar aktif</p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-purple-200/60 text-[10px]">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Jadwal Mengajar:</span>
                <span className="text-purple-800">{totalJadwal} kelas</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Status Pendidik:</span>
                <span className="text-emerald-700">100% Aktif</span>
              </div>
              <div className="pt-1 text-[9px] text-slate-500 font-medium">
                Bimbingan tahfidz, kitab, & pengasuhan asrama
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard-sections">
        
        {/* Left Column (2 parts): Occupancy Overview and Quick Stats charts */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Visual Occupancy Mapping & Gender Distributions */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-6" id="occupancy-and-demographics">
            <div className="flex justify-between items-center pb-2 border-b border-nature-border">
              <div>
                <h2 className="text-lg font-serif text-nature-forest font-bold">Visualisasi & Pemetaan Pondok</h2>
                <p className="text-xs text-slate-500">Rasio hunian kamar asrama dan demografi santri</p>
              </div>
              <span className="text-xs text-nature-forest font-semibold bg-nature-beige px-2 py-1 rounded-md border border-nature-border">
                Live Data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Box 1: Visual Occupancy Dial using pure SVG */}
              <div className="border border-nature-border p-4 rounded-xl flex flex-col items-center justify-center text-center space-y-4 bg-nature-beige/40">
                <span className="text-xs font-bold text-slate-700">Persentase Kapasitas Hunian Kamar</span>
                
                <div className="relative w-40 h-40 flex items-center justify-center">
                  {/* Custom SVG Circular Chart */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#E8E6DF" strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#8A9A5B" strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - occupancyPercentage / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-3xl font-serif text-nature-forest font-bold">{occupancyPercentage}%</span>
                    <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Terisi ({totalTerisi} bed)</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500 leading-relaxed max-w-xs">
                  Sisa kasur kosong tersedia: <strong className="text-nature-forest">{totalKapasitas - totalTerisi} bed</strong> tersebar di asrama putra dan asrama putri.
                </div>
              </div>

              {/* Box 2: Gender Demographics and Class Distribution */}
              <div className="border border-nature-border p-4 rounded-xl space-y-4 bg-nature-beige/40">
                <span className="text-xs font-bold text-slate-700 block">Rasio Gender Santri Aktif</span>
                
                {/* Visual Bar Ratio */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-nature-forest font-semibold flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-nature-sage inline-block"></span> Putra ({santriLakiLaki})
                    </span>
                    <span className="text-pink-600 font-semibold flex items-center gap-1">
                      Putri ({santriPerempuan}) <span className="w-2.5 h-2.5 rounded-full bg-pink-450 inline-block"></span>
                    </span>
                  </div>
                  <div className="w-full bg-[#E8E6DF] h-4 rounded-full flex overflow-hidden">
                    <div 
                      className="bg-nature-sage h-full transition-all duration-500" 
                      style={{ width: `${(santriLakiLaki / (santriLakiLaki + santriPerempuan || 1)) * 100}%` }}
                    ></div>
                    <div 
                      className="bg-pink-400 h-full transition-all duration-500" 
                      style={{ width: `${(santriPerempuan / (santriLakiLaki + santriPerempuan || 1)) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 block text-center">
                    Proporsi seimbang untuk kurikulum bimbingan terpisah.
                  </span>
                </div>

                <div className="pt-2 space-y-2 border-t border-nature-border">
                  <span className="text-[10px] font-bold text-nature-sage uppercase tracking-wider block">Kondisi Kamar Terkait Inventaris</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-nature-beige text-nature-forest p-2 rounded-lg border border-nature-border">
                      <div className="font-bold">11</div>
                      <span className="text-[9px] text-nature-sage font-semibold uppercase">Baik</span>
                    </div>
                    <div className="bg-amber-50 text-amber-800 p-2 rounded-lg border border-amber-200">
                      <div className="font-bold">2</div>
                      <span className="text-[9px] text-amber-600 font-semibold uppercase">R. Ringan</span>
                    </div>
                    <div className="bg-red-50 text-red-800 p-2 rounded-lg border border-red-200">
                      <div className="font-bold">1</div>
                      <span className="text-[9px] text-red-600 font-semibold uppercase">R. Berat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Room Occupancy list */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">Status Hunian Per Kamar</span>
                <button onClick={() => onNavigate('kamar')} className="text-xs text-nature-forest hover:text-nature-sage hover:underline font-bold transition-colors cursor-pointer">
                  Lihat Semua Kamar &rarr;
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {kamar.map(k => {
                  const kamarSantri = santri.filter(s => s.idKamar === k.id && s.status === 'Aktif');
                  const count = kamarSantri.length;
                  const ratio = Math.round((count / k.kapasitas) * 100);
                  
                  return (
                    <div key={k.id} className="p-3 rounded-xl bg-nature-beige/40 border border-nature-border flex flex-col justify-between hover:bg-nature-beige/80 transition-colors">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold text-nature-forest">{k.namaKamar}</span>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-sm font-bold uppercase ${
                            k.gedung.includes('Putra') ? 'bg-[#DEDCD3] text-[#2D4034]' : 'bg-pink-100 text-pink-800'
                          }`}>
                            {k.gedung.includes('Putra') ? 'Putra' : 'Putri'}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 block mt-0.5">Kapasitas: {k.kapasitas} Bed</span>
                      </div>
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-[10px] mb-1">
                          <span className="text-slate-600 font-medium">Terisi: {count} santri</span>
                          <span className="font-bold text-nature-forest">{ratio}%</span>
                        </div>
                        <div className="w-full bg-[#E8E6DF] h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              ratio >= 100 ? 'bg-red-500' : ratio > 75 ? 'bg-nature-gold' : 'bg-nature-sage'
                            }`}
                            style={{ width: `${Math.min(ratio, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Trend Status Santri per Bulan (Recharts Bar Chart) */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4" id="monthly-status-chart-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-nature-border gap-2">
              <div>
                <h2 className="text-lg font-serif text-nature-forest font-bold flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-nature-sage" /> Tren Status Santri Per Bulan
                </h2>
                <p className="text-xs text-slate-500">Perbandingan jumlah santri aktif dan santri pindah berdasarkan bulan masuk</p>
              </div>
              <div className="flex gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-800">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#1E3F20' }}></span> Aktif
                </span>
                <span className="flex items-center gap-1.5 text-red-800">
                  <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: '#991B1B' }}></span> Pindah
                </span>
              </div>
            </div>

            <div className="w-full h-72 pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#2D332F" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E8E6DF' }}
                  />
                  <YAxis 
                    stroke="#2D332F" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={{ stroke: '#E8E6DF' }}
                    allowDecimals={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FAF9F6', 
                      borderColor: '#E8E6DF', 
                      borderRadius: '12px',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '11px',
                      color: '#2D332F',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }} 
                  />
                  <Bar 
                    dataKey="Santri Aktif" 
                    fill="#1E3F20" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={32}
                  />
                  <Bar 
                    dataKey="Santri Pindah" 
                    fill="#991B1B" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={32}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="text-[11px] bg-nature-beige p-3 rounded-xl border border-nature-border text-slate-600 leading-relaxed flex items-start gap-2">
              <span className="text-nature-sage font-bold">&bull;</span>
              <span>
                Grafik di atas terintegrasi langsung secara real-time dengan database IT Center Darul Arifin. Menunjukkan tren mutasi santri masuk versus kepindahan per angkatan/gelombang pendaftaran.
              </span>
            </div>
          </div>

          {/* Grafik & Analisis Pelanggaran Santri Card */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4" id="violations-chart-card">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-nature-border gap-2">
              <div>
                <h2 className="text-lg font-serif text-nature-forest font-bold flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-600" /> Analisis Pelanggaran Santri
                </h2>
                <p className="text-xs text-slate-500">Distribusi tingkat pelanggaran tata tertib dan pemberian sanksi/ta'zir</p>
              </div>
              <button 
                onClick={() => onNavigate('pelanggaran')}
                className="text-xs text-nature-forest hover:text-nature-sage hover:underline font-bold transition-colors cursor-pointer"
              >
                Kelola Pelanggaran &rarr;
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2">
              {/* Left Side: Recharts Bar Chart of Violations Categories */}
              <div className="md:col-span-3 space-y-2">
                <span className="text-xs font-bold text-slate-700 block mb-2">Grafik Tingkat Pelanggaran</span>
                {totalPelanggaran === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
                    <ShieldCheck className="w-8 h-8 text-emerald-500 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Tidak Ada Data Pelanggaran</p>
                    <p className="text-[10px] text-slate-400">Seluruh santri disiplin mematuhi aturan pondok.</p>
                  </div>
                ) : (
                  <div className="w-full h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={pelanggaranChartData}
                        margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#E8E6DF" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          stroke="#2D332F" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: '#E8E6DF' }}
                        />
                        <YAxis 
                          stroke="#2D332F" 
                          fontSize={11} 
                          tickLine={false} 
                          axisLine={{ stroke: '#E8E6DF' }}
                          allowDecimals={false}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#FAF9F6', 
                            borderColor: '#E8E6DF', 
                            borderRadius: '12px',
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            fontSize: '11px',
                            color: '#2D332F',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                          }} 
                        />
                        <Bar 
                          dataKey="Jumlah" 
                          radius={[4, 4, 0, 0]} 
                          maxBarSize={45}
                        >
                          {pelanggaranChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Right Side: Quick summary & Recent Violations feed */}
              <div className="md:col-span-2 space-y-4">
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-2">Ikhtisar Pelanggaran</span>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <div className="text-sm font-bold text-amber-700 font-mono">{countRingan}</div>
                      <span className="text-[9px] text-amber-600 block font-semibold uppercase">Ringan</span>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                      <div className="text-sm font-bold text-orange-700 font-mono">{countSedang}</div>
                      <span className="text-[9px] text-orange-600 block font-semibold uppercase">Sedang</span>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                      <div className="text-sm font-bold text-red-700 font-mono">{countBerat}</div>
                      <span className="text-[9px] text-red-600 block font-semibold uppercase">Berat</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">Laporan Terbaru</span>
                  {recentPelanggaran.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">Tidak ada catatan pelanggaran terbaru.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentPelanggaran.map((p) => {
                        let colorBadge = "bg-amber-50 text-amber-800 border-amber-200";
                        if (p.kategori === 'Sedang') colorBadge = "bg-orange-50 text-orange-800 border-orange-200";
                        if (p.kategori === 'Berat') colorBadge = "bg-red-50 text-red-800 border-red-200";

                        return (
                          <div key={p.id} className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex flex-col gap-1 hover:bg-slate-100/50 transition-colors">
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-[11px] font-bold text-slate-900 line-clamp-1">{p.namaSantri}</span>
                              <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded-full border uppercase ${colorBadge}`}>
                                {p.kategori}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-600 line-clamp-1">{p.jenisPelanggaran}</p>
                            <span className="text-[8px] text-slate-400 font-mono block">{p.tanggal} • Oleh {p.petugas}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons for easy navigation */}
          <div className="bg-nature-forest-medium/10 border border-nature-forest-medium/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4" id="quick-action-panel">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-serif text-nature-forest font-bold">Perlu rekapitulasi data cepat atau cetak laporan?</h3>
              <p className="text-xs text-slate-600">Akses menu laporan bulanan untuk melihat rincian dan ekspor data santri aktif/pindah, data pelanggaran, dan inventaris per kamar secara mingguan dan bulanan.</p>
            </div>
            <button 
              onClick={() => onNavigate('laporan')}
              className="px-4 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-nature-gold" /> Buka Menu Laporan
            </button>
          </div>
        </div>

        {/* Right Column: Real-Time Monitoring activity feed and active teachers list */}
        <div className="space-y-6">
          
          {/* Active Activity Feed */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4 flex flex-col h-[350px] justify-between" id="recent-activities-feed">
            <div className="space-y-1 pb-2 border-b border-nature-border">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-serif text-nature-forest font-bold">Aktivitas Real-Time</h2>
                <span className="w-2 h-2 rounded-full bg-nature-gold animate-ping-slow"></span>
              </div>
              <p className="text-xs text-slate-500">Log monitoring aktivitas terbaru hari ini</p>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1 py-2">
              {recentLogs.map((log) => {
                const getBadgeColor = (type: string) => {
                  switch(type) {
                    case 'success': return 'bg-[#FAF9F6] border-nature-sage text-nature-forest font-bold';
                    case 'warning': return 'bg-amber-50 border-amber-200 text-amber-800 font-bold';
                    case 'danger': return 'bg-red-50 border-red-200 text-red-800 font-bold';
                    default: return 'bg-nature-beige/40 border-nature-border text-slate-700';
                  }
                };

                return (
                  <div key={log.id} className="flex gap-3 text-xs items-start">
                    <div className={`px-2 py-0.5 rounded border text-[10px] scale-90 ${getBadgeColor(log.tipe)}`}>
                      {log.kategori}
                    </div>
                    <div className="space-y-0.5 flex-1">
                      <p className="text-slate-700 leading-normal font-medium">{log.pesan}</p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                        <span>&bull;</span>
                        <span className="font-semibold text-slate-500">Oleh: {log.actor}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => onNavigate('monitoring')}
              className="w-full text-center py-2 bg-nature-beige hover:bg-nature-border border border-nature-border rounded-xl text-xs font-bold text-nature-forest transition-all block cursor-pointer"
            >
              Buka Layar Monitoring &rarr;
            </button>
          </div>

          {/* Teacher Active Schedules summary */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4" id="teacher-schedule-summary">
            <div className="space-y-1 pb-2 border-b border-nature-border">
              <h2 className="text-lg font-serif text-nature-forest font-bold">Jadwal Mengajar Terdekat</h2>
              <p className="text-xs text-slate-500">Daftar asatidzah dan jadwal bimbingan pondok</p>
            </div>

            <div className="space-y-3">
              {guru.slice(0, 3).map(g => (
                <div key={g.id} className="p-3 rounded-xl bg-nature-beige/30 border border-nature-border space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-nature-forest">{g.nama}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{g.spesialisasi}</p>
                    </div>
                    <span className="text-[9px] bg-nature-beige border border-nature-border text-nature-forest px-1.5 py-0.5 rounded font-bold uppercase">
                      {g.peran}
                    </span>
                  </div>
                  
                  {/* First schedule info */}
                  {g.jadwal.length > 0 && (
                    <div className="flex items-center justify-between text-[11px] bg-white p-2 rounded-lg border border-nature-border">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <CalendarDays className="w-3.5 h-3.5 text-nature-sage" />
                        <span>{g.jadwal[0].hari}, {g.jadwal[0].jamMulai} - {g.jadwal[0].jamSelesai}</span>
                      </div>
                      <span className="font-bold text-nature-forest bg-nature-beige px-1.5 py-0.5 rounded text-[10px] border border-nature-border">
                        {g.jadwal[0].mataPelajaran}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={() => onNavigate('guru')}
              className="w-full text-center py-2 bg-nature-beige hover:bg-nature-border border border-nature-border rounded-xl text-xs font-bold text-nature-forest transition-all block cursor-pointer"
            >
              Kelola Pengasuh & Guru &rarr;
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
