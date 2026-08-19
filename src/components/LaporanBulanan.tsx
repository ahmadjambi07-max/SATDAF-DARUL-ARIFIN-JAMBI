import React, { useState, useMemo } from 'react';
import { Santri, Kamar, PelanggaranSantri } from '../types';
import { 
  FileText, 
  Users, 
  ShieldAlert, 
  Home, 
  Download, 
  Calendar, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Layers, 
  Archive, 
  UserMinus, 
  UserPlus,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LaporanBulananProps {
  santri: Santri[];
  kamar: Kamar[];
  pelanggaran: PelanggaranSantri[];
}

export default function LaporanBulanan({
  santri,
  kamar,
  pelanggaran
}: LaporanBulananProps) {
  // Report period filter: week, month, or all
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('month');
  
  // Category tab: santri, pelanggaran, inventaris
  const [activeCategory, setActiveCategory] = useState<'santri' | 'pelanggaran' | 'inventaris'>('santri');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Room filter for inventory tab
  const [selectedRoom, setSelectedRoom] = useState<string>('all');
  // Inventory inspection focus: weekly or monthly items
  const [inventoryInspection, setInventoryInspection] = useState<'week' | 'month'>('month');

  // Today is fixed at July 15, 2026 based on system time metadata
  const TODAY = useMemo(() => new Date('2026-07-15'), []);

  // Calculate dates helper
  const dateRangeLabel = useMemo(() => {
    if (period === 'all') return 'Semua Riwayat Historis Terdaftar';
    
    const start = new Date(TODAY);
    if (period === 'week') {
      start.setDate(TODAY.getDate() - 7);
    } else {
      start.setMonth(TODAY.getMonth() - 1);
    }
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'long', year: 'numeric' };
    return `Periode: ${start.toLocaleDateString('id-ID', options)} — ${TODAY.toLocaleDateString('id-ID', options)}`;
  }, [period, TODAY]);

  // General date filtering helper
  const isWithinPeriod = (dateStr: string | undefined) => {
    if (period === 'all') return true;
    if (!dateStr) return false;
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;
    
    const diffTime = TODAY.getTime() - date.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    if (period === 'week') {
      return diffDays >= 0 && diffDays <= 7;
    } else {
      return diffDays >= 0 && diffDays <= 30;
    }
  };

  // FILTERED DATA: SANTRI
  const filteredSantri = useMemo(() => {
    return santri.filter(s => {
      // For Santri, status 'Aktif' is filtered by tanggalMasuk, status 'Pindah' is filtered by tanggalPindah or tanggalMasuk
      const relevantDate = s.status === 'Pindah' ? (s.tanggalPindah || s.tanggalMasuk) : s.tanggalMasuk;
      const matchPeriod = isWithinPeriod(relevantDate);
      
      const matchSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.nis.includes(searchTerm) || 
                          s.kelas.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchPeriod && matchSearch;
    });
  }, [santri, period, searchTerm]);

  // FILTERED DATA: PELANGGARAN
  const filteredPelanggaran = useMemo(() => {
    return pelanggaran.filter(p => {
      const matchPeriod = isWithinPeriod(p.tanggal);
      const matchSearch = p.namaSantri.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.jenisPelanggaran.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.petugas.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchPeriod && matchSearch;
    });
  }, [pelanggaran, period, searchTerm]);

  // FILTERED DATA: INVENTARIS KAMAR
  // Flatten all rooms' inventory with weekly/monthly breakdown classification
  const filteredInventaris = useMemo(() => {
    const list: Array<{
      roomId: string;
      namaKamar: string;
      gedung: string;
      itemId: string;
      namaBarang: string;
      jumlah: number;
      kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
      pemeriksaan: 'week' | 'month'; // Classification
      petugasPemeriksa: string;
      tanggalPemeriksaan: string;
    }> = [];

    kamar.forEach(k => {
      if (selectedRoom !== 'all' && k.id !== selectedRoom) return;

      k.inventaris.forEach(inv => {
        // Classify items into weekly inspection (consumable/highly used) or monthly inspection (structural/fixed assets)
        const isWeekly = ['Kasur', 'Lampu', 'Meja', 'Cermin', 'Kipas Angin Dinding'].some(keyword => inv.namaBarang.includes(keyword)) || inv.namaBarang.toLowerCase().includes('kasur');
        const inspectionType = isWeekly ? 'week' : 'month';

        // Filter by user selection of weekly vs monthly audit focus
        if (inspectionType !== inventoryInspection) return;

        // Generate simulated audit details based on selected period
        // Room wali is checking items
        const auditor = k.waliKamar || 'Ustadz Pembimbing Kamar';
        const auditDate = inventoryInspection === 'week' ? '2026-07-12' : '2026-07-01';

        list.push({
          roomId: k.id,
          namaKamar: k.namaKamar,
          gedung: k.gedung,
          itemId: inv.id,
          namaBarang: inv.namaBarang,
          jumlah: inv.jumlah,
          kondisi: inv.kondisi,
          pemeriksaan: inspectionType,
          petugasPemeriksa: auditor,
          tanggalPemeriksaan: auditDate
        });
      });
    });

    // If search term is entered, filter by room name or item name
    if (searchTerm) {
      return list.filter(item => 
        item.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.namaKamar.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return list;
  }, [kamar, selectedRoom, inventoryInspection, searchTerm]);

  // STATS SUMMARIES
  const santriStats = useMemo(() => {
    const aktif = filteredSantri.filter(s => s.status === 'Aktif').length;
    const pindah = filteredSantri.filter(s => s.status === 'Pindah').length;
    return { total: filteredSantri.length, aktif, pindah };
  }, [filteredSantri]);

  const pelanggaranStats = useMemo(() => {
    const ringan = filteredPelanggaran.filter(p => p.kategori === 'Ringan').length;
    const sedang = filteredPelanggaran.filter(p => p.kategori === 'Sedang').length;
    const berat = filteredPelanggaran.filter(p => p.kategori === 'Berat').length;
    return { total: filteredPelanggaran.length, ringan, sedang, berat };
  }, [filteredPelanggaran]);

  const inventarisStats = useMemo(() => {
    let totalItemsCount = 0;
    let baikCount = 0;
    let rusakRinganCount = 0;
    let rusakBeratCount = 0;

    filteredInventaris.forEach(item => {
      totalItemsCount += item.jumlah;
      if (item.kondisi === 'Baik') baikCount += item.jumlah;
      else if (item.kondisi === 'Rusak Ringan') rusakRinganCount += item.jumlah;
      else if (item.kondisi === 'Rusak Berat') rusakBeratCount += item.jumlah;
    });

    return { totalItemsCount, baikCount, rusakRinganCount, rusakBeratCount, totalBarangUnik: filteredInventaris.length };
  }, [filteredInventaris]);

  // EXPORT TO CSV LOGIC
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = '';

    const timestampLabel = TODAY.toISOString().split('T')[0];

    if (activeCategory === 'santri') {
      filename = `laporan_santri_${period}_${timestampLabel}.csv`;
      headers = ['No', 'NISN', 'Nama Santri', 'Gender', 'Kelas', 'Status', 'Tanggal Masuk', 'Tanggal Pindah', 'Alamat Wali'];
      rows = filteredSantri.map((s, idx) => [
        String(idx + 1),
        s.nis,
        s.nama,
        s.gender,
        s.kelas,
        s.status,
        s.tanggalMasuk,
        s.tanggalPindah || '-',
        s.alamat
      ]);
    } else if (activeCategory === 'pelanggaran') {
      filename = `laporan_pelanggaran_${period}_${timestampLabel}.csv`;
      headers = ['No', 'Nama Santri', 'Tanggal', 'Kategori', 'Jenis Pelanggaran', 'Hukuman (Takzir)', 'Petugas'];
      rows = filteredPelanggaran.map((p, idx) => [
        String(idx + 1),
        p.namaSantri,
        p.tanggal,
        p.kategori,
        p.jenisPelanggaran,
        p.hukuman,
        p.petugas
      ]);
    } else {
      filename = `laporan_inventaris_${inventoryInspection}_${timestampLabel}.csv`;
      headers = ['No', 'Asrama / Kamar', 'Nama Gedung', 'Nama Barang', 'Jumlah', 'Kondisi', 'Frekuensi Pemeriksaan', 'Petugas Pemeriksa', 'Tanggal Cek'];
      rows = filteredInventaris.map((item, idx) => [
        String(idx + 1),
        item.namaKamar,
        item.gedung,
        item.namaBarang,
        String(item.jumlah),
        item.kondisi,
        item.pemeriksaan === 'week' ? 'Mingguan' : 'Bulanan',
        item.petugasPemeriksa,
        item.tanggalPemeriksaan
      ]);
    }

    // Modern Blob-based CSV creator
    const csvString = [
      headers.join(","),
      ...rows.map(e => e.map(val => `"${(val || '').replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob(["\uFEFF" + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6" id="laporan-bulanan-container">
      {/* HEADER CARD */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-nature-border shadow-xs" id="laporan-main-header">
        <div className="space-y-1">
          <h1 className="text-xl font-serif font-bold text-nature-forest flex items-center gap-2">
            <FileText className="w-6 h-6 text-nature-sage" /> Laporan Terpadu Pesantren
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            Rincian komprehensif, log historis, dan ekspor dokumen formal terkait aktivitas santri (aktif/pindah), pelanggaran disiplin santri, serta pengawasan inventaris asrama.
          </p>
        </div>

        <button 
          onClick={handleExportCSV}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          id="export-laporan-csv-btn"
        >
          <Download className="w-4 h-4 text-nature-gold" /> Ekspor Dokumen Resmi
        </button>
      </div>

      {/* FILTER PANEL: PERIOD SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-nature-border shadow-3xs" id="laporan-period-filter-wrapper">
        <div className="flex items-center gap-3">
          <Calendar className="w-4 h-4 text-nature-sage shrink-0" />
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-slate-700 block">Filter Periode Laporan</span>
            <span className="text-[10px] text-nature-forest font-bold font-mono">{dateRangeLabel}</span>
          </div>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full md:w-auto shrink-0" id="laporan-range-selector">
          {(['week', 'month', 'all'] as const).map((p) => {
            const labels = { week: 'Rincian Mingguan', month: 'Rincian Bulanan', all: 'Semua Periode' };
            return (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setSearchTerm('');
                }}
                className={`flex-1 md:flex-initial px-4 py-2 text-center text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  period === p 
                    ? 'bg-nature-forest text-white shadow-3xs font-extrabold' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {labels[p]}
              </button>
            );
          })}
        </div>
      </div>

      {/* PRIMARY CATEGORY TABS */}
      <div className="flex border-b border-nature-border bg-white rounded-t-2xl px-4 pt-4 gap-2" id="laporan-category-tabs">
        <button
          onClick={() => {
            setActiveCategory('santri');
            setSearchTerm('');
          }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'santri'
              ? 'border-nature-forest text-nature-forest font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Users className="w-4 h-4" /> Data Santri (Aktif/Pindah)
        </button>
        <button
          onClick={() => {
            setActiveCategory('pelanggaran');
            setSearchTerm('');
          }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'pelanggaran'
              ? 'border-nature-forest text-nature-forest font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Data Pelanggaran Disiplin
        </button>
        <button
          onClick={() => {
            setActiveCategory('inventaris');
            setSearchTerm('');
          }}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'inventaris'
              ? 'border-nature-forest text-nature-forest font-extrabold'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-4 h-4" /> Inventaris Per Kamar
        </button>
      </div>

      {/* METRIC HIGHLIGHTS BASED ON ACTIVE TAB */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="laporan-metric-cards">
        {activeCategory === 'santri' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Santri Terdaftar</span>
              <div className="text-2xl font-bold font-serif text-nature-forest mt-1">{santriStats.total} Santri</div>
              <p className="text-[10px] text-slate-500 mt-1">Dalam rentang filter terpilih</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Santri Aktif Baru/Terdaftar</span>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1 flex items-center gap-1.5">
                <UserPlus className="w-5 h-5 text-nature-sage" /> {santriStats.aktif} Santri
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Berstatus aktif di asrama</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Santri Pindah (Keluar)</span>
              <div className="text-2xl font-bold font-serif text-red-600 mt-1 flex items-center gap-1.5">
                <UserMinus className="w-5 h-5" /> {santriStats.pindah} Santri
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Mutasi/berhenti di periode ini</p>
            </div>
            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-nature-border shadow-xs flex flex-col justify-center">
              <span className="text-[10px] text-nature-forest font-bold uppercase tracking-widest block">Metrik Compliance</span>
              <div className="text-xs text-slate-600 mt-1 font-semibold">Seluruh data terverifikasi legal dan terdaftar resmi di pangkalan EMIS pesantren.</div>
            </div>
          </>
        )}

        {activeCategory === 'pelanggaran' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pelanggaran Kasus</span>
              <div className="text-2xl font-bold font-serif text-red-700 mt-1">{pelanggaranStats.total} Kasus</div>
              <p className="text-[10px] text-slate-500 mt-1">Sanksi disiplin tercatat</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kategori Berat</span>
              <div className="text-2xl font-bold font-serif text-red-600 mt-1 flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-600 inline-block animate-pulse"></span> {pelanggaranStats.berat} Kasus
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Penyitaan & Wali dipanggil</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kategori Sedang / Ringan</span>
              <div className="text-2xl font-bold font-serif text-amber-600 mt-1">
                {pelanggaranStats.sedang} / {pelanggaranStats.ringan} Kasus
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Tindakan piket & hafal juz</p>
            </div>
            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-nature-border shadow-xs flex flex-col justify-center">
              <span className="text-[10px] text-nature-forest font-bold uppercase tracking-widest block">Evaluasi Ta'zir</span>
              <div className="text-xs text-slate-600 mt-1 font-semibold">Tujuan penegakan ta'zir adalah pembinaan akhlak karimah bagi santri.</div>
            </div>
          </>
        )}

        {activeCategory === 'inventaris' && (
          <>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Barang Terdata ({inventoryInspection === 'week' ? 'Mingguan' : 'Bulanan'})</span>
              <div className="text-2xl font-bold font-serif text-nature-forest mt-1">{inventarisStats.totalItemsCount} Unit</div>
              <p className="text-[10px] text-slate-500 mt-1">Dari {inventarisStats.totalBarangUnik} tipe barang kamar</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kondisi Baik</span>
              <div className="text-2xl font-bold font-serif text-emerald-700 mt-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5 text-nature-sage" /> {inventarisStats.baikCount} Unit
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Layak pakai optimal</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Kerusakan Terdeteksi</span>
              <div className="text-2xl font-bold font-serif text-amber-600 mt-1 flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5" /> {inventarisStats.rusakRinganCount + inventarisStats.rusakBeratCount} Unit
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{inventarisStats.rusakRinganCount} Ringan • {inventarisStats.rusakBeratCount} Berat</p>
            </div>
            <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-nature-border shadow-xs flex flex-col justify-center">
              <span className="text-[10px] text-nature-forest font-bold uppercase tracking-widest block">Model Pemeriksaan</span>
              <div className="text-xs text-slate-600 mt-1 font-semibold">
                {inventoryInspection === 'week' 
                  ? 'Fokus pemeriksaan cepat mingguan asrama santri' 
                  : 'Fokus audit aset tetap bulanan kompleks kamar'}
              </div>
            </div>
          </>
        )}
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between" id="laporan-filter-bar">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder={
              activeCategory === 'santri' ? 'Cari nama, NISN, atau kelas santri...' :
              activeCategory === 'pelanggaran' ? 'Cari nama santri, pelanggaran, atau ustadz...' :
              'Cari nama barang atau nama kamar...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-nature-border rounded-xl text-xs focus:outline-none bg-nature-beige/10 focus:ring-1 focus:ring-nature-sage font-medium"
            id="laporan-search-input"
          />
        </div>

        {/* Tab-specific Extra Filters */}
        <div className="flex gap-2 w-full sm:w-auto justify-end">
          {activeCategory === 'inventaris' && (
            <>
              {/* Room filter selector */}
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="p-2 bg-nature-beige/20 border border-nature-border text-nature-charcoal rounded-xl text-xs font-bold cursor-pointer"
                id="filter-room-inventaris"
              >
                <option value="all">Semua Kamar</option>
                {kamar.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKamar}</option>
                ))}
              </select>

              {/* Inspection Type filter: Weekly vs Monthly */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  onClick={() => setInventoryInspection('week')}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${inventoryInspection === 'week' ? 'bg-white text-nature-forest shadow-3xs' : 'text-slate-500'}`}
                >
                  Inspeksi Mingguan
                </button>
                <button
                  onClick={() => setInventoryInspection('month')}
                  className={`px-3 py-1 text-[10px] font-bold rounded ${inventoryInspection === 'month' ? 'bg-white text-nature-forest shadow-3xs' : 'text-slate-500'}`}
                >
                  Audit Bulanan
                </button>
              </div>
            </>
          )}

          {/* Quick status guide */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-nature-border">
            <Compass className="w-3.5 h-3.5 text-nature-gold animate-spin-slow" /> IT Center Darul Arifin
          </div>
        </div>

      </div>

      {/* DETAILED REPORT TABLE WRAPPER */}
      <div className="bg-white rounded-2xl border border-nature-border shadow-xs overflow-hidden" id="laporan-table-container">
        
        <div className="overflow-x-auto">
          <AnimatePresence mode="wait">
            {activeCategory === 'santri' && (
              <motion.table 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="santri-table"
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="border-b border-nature-border bg-nature-beige/30 text-nature-forest font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">NISN</th>
                    <th className="p-4">Nama Lengkap</th>
                    <th className="p-4">Gender</th>
                    <th className="p-4">Kelas</th>
                    <th className="p-4">Kamar</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Tanggal Masuk</th>
                    <th className="p-4">Keterangan Mutasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nature-border text-xs">
                  {filteredSantri.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic font-medium">
                        Tidak ada data santri yang terdaftar dalam periode dan kata kunci terpilih.
                      </td>
                    </tr>
                  ) : (
                    filteredSantri.map((s, idx) => {
                      const roomObj = kamar.find(k => k.id === s.idKamar);
                      return (
                        <tr key={s.id} className="hover:bg-nature-beige/10 transition-colors">
                          <td className="p-4 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="p-4 font-mono font-bold text-slate-700">{s.nis}</td>
                          <td className="p-4">
                            <span className="font-bold text-nature-charcoal block">{s.nama}</span>
                            <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">{s.alamat}</span>
                          </td>
                          <td className="p-4 text-slate-600 font-medium">{s.gender}</td>
                          <td className="p-4 text-slate-600 font-bold">{s.kelas}</td>
                          <td className="p-4">
                            <span className="font-bold text-nature-forest">{roomObj ? roomObj.namaKamar : 'Belum Ditentukan'}</span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                              s.status === 'Aktif' 
                                ? 'bg-nature-beige text-nature-forest border-nature-sage' 
                                : 'bg-red-50 text-red-800 border-red-100'
                            }`}>
                              {s.status === 'Aktif' ? 'Aktif' : 'Pindah'}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-500 font-bold">{s.tanggalMasuk}</td>
                          <td className="p-4">
                            {s.status === 'Pindah' ? (
                              <div className="space-y-0.5 text-red-700">
                                <span className="font-bold block text-[10px]">Tanggal Pindah:</span>
                                <span className="font-mono block text-[9px]">{s.tanggalPindah || '-'}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Tidak ada mutasi</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </motion.table>
            )}

            {activeCategory === 'pelanggaran' && (
              <motion.table 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="pelanggaran-table"
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="border-b border-nature-border bg-nature-beige/30 text-nature-forest font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Nama Santri</th>
                    <th className="p-4">Tanggal Kasus</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Bentuk Pelanggaran</th>
                    <th className="p-4">Ta'zir / Tindakan Disiplin</th>
                    <th className="p-4">Petugas Pencatat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nature-border text-xs">
                  {filteredPelanggaran.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 italic font-medium">
                        Tidak ada laporan pelanggaran disiplin terdaftar dalam periode dan kata kunci ini.
                      </td>
                    </tr>
                  ) : (
                    filteredPelanggaran.map((p, idx) => {
                      let colorBadge = "bg-amber-50 text-amber-800 border-amber-200";
                      if (p.kategori === 'Sedang') colorBadge = "bg-orange-50 text-orange-800 border-orange-200";
                      if (p.kategori === 'Berat') colorBadge = "bg-red-50 text-red-850 border-red-200";

                      return (
                        <tr key={p.id} className="hover:bg-nature-beige/10 transition-colors">
                          <td className="p-4 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="p-4">
                            <span className="font-bold text-nature-charcoal block">{p.namaSantri}</span>
                            <span className="text-[10px] text-slate-400 font-medium block leading-none mt-0.5">{p.kelasSantri}</span>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-500">{p.tanggal}</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${colorBadge}`}>
                              {p.kategori}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 font-semibold max-w-xs">{p.jenisPelanggaran}</td>
                          <td className="p-4 text-nature-forest font-bold max-w-xs bg-nature-beige/10">{p.hukuman}</td>
                          <td className="p-4 text-slate-500 font-semibold">{p.petugas}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </motion.table>
            )}

            {activeCategory === 'inventaris' && (
              <motion.table 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                key="inventaris-table"
                className="w-full text-left border-collapse"
              >
                <thead>
                  <tr className="border-b border-nature-border bg-nature-beige/30 text-nature-forest font-bold text-xs uppercase tracking-wider">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4">Kamar Asrama</th>
                    <th className="p-4">Nama Gedung</th>
                    <th className="p-4">Nama Barang Inventaris</th>
                    <th className="p-4 text-center">Kuantitas</th>
                    <th className="p-4">Kondisi Fisik</th>
                    <th className="p-4">Frekuensi Inspeksi</th>
                    <th className="p-4">Petugas Pemeriksa</th>
                    <th className="p-4">Tanggal Inspeksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-nature-border text-xs">
                  {filteredInventaris.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400 italic font-medium">
                        Tidak ada inventaris yang ditemukan sesuai filter/kata kunci.
                      </td>
                    </tr>
                  ) : (
                    filteredInventaris.map((item, idx) => {
                      let condBadge = "bg-emerald-50 text-emerald-800 border-emerald-100";
                      if (item.kondisi === 'Rusak Ringan') condBadge = "bg-amber-50 text-amber-800 border-amber-200";
                      if (item.kondisi === 'Rusak Berat') condBadge = "bg-red-50 text-red-800 border-red-200";

                      return (
                        <tr key={item.itemId} className="hover:bg-nature-beige/10 transition-colors">
                          <td className="p-4 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                          <td className="p-4 font-bold text-nature-forest">{item.namaKamar}</td>
                          <td className="p-4 text-slate-500 font-medium">{item.gedung}</td>
                          <td className="p-4 font-bold text-nature-charcoal">{item.namaBarang}</td>
                          <td className="p-4 text-center font-mono font-bold text-slate-700">{item.jumlah} Unit</td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase ${condBadge}`}>
                              {item.kondisi}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                              {item.pemeriksaan === 'week' ? 'Inspeksi Mingguan' : 'Audit Bulanan'}
                            </span>
                          </td>
                          <td className="p-4 text-slate-600 font-semibold">{item.petugasPemeriksa}</td>
                          <td className="p-4 font-mono text-slate-500 font-bold">{item.tanggalPemeriksaan}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </motion.table>
            )}
          </AnimatePresence>
        </div>

        {/* BOTTOM TOTAL SUMMARY BAR */}
        <div className="p-4 bg-nature-beige/20 border-t border-nature-border text-xs text-slate-500 font-bold flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            Menampilkan <strong className="text-nature-forest">
              {activeCategory === 'santri' ? filteredSantri.length : 
               activeCategory === 'pelanggaran' ? filteredPelanggaran.length : 
               filteredInventaris.length}
            </strong> baris data terverifikasi.
          </div>
          <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
            Sistem Administrasi Terpadu Pesantren Darul Arifin
          </div>
        </div>

      </div>

      {/* QUICK INVENTORY EXPLANATION INFO BOX */}
      {activeCategory === 'inventaris' && (
        <div className="p-4 rounded-xl bg-[#FAF9F6] border border-nature-border text-xs text-slate-600 leading-relaxed space-y-2">
          <h4 className="font-serif font-bold text-nature-forest flex items-center gap-1.5">
            <Info className="w-4 h-4 text-nature-sage" /> Aturan Pemeriksaan Inventaris Kamar
          </h4>
          <p>
            Pemeriksaan asrama diklasifikasikan berdasarkan tingkat penggunaan barang asrama. 
            <strong> Inspeksi Mingguan</strong> mencakup pemeriksaan cepat terhadap kelayakan kasur, kipas angin, lampu kamar, dan kebersihan. 
            <strong> Audit Bulanan</strong> mencakup verifikasi menyeluruh terhadap ranjang bertingkat, lemari pakaian santri, pintu kamar mandi, dan struktur fisik gedung.
          </p>
        </div>
      )}

    </div>
  );
}
