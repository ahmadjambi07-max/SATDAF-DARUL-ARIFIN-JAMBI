import React, { useState, useEffect } from 'react';
import { LogAktivitas, Santri, PengasuhGuru, Kamar } from '../types';
import { 
  Radio, 
  Activity, 
  Play, 
  RefreshCw, 
  Bell, 
  Clock, 
  Sparkles,
  UserCheck2,
  BookOpen,
  Home,
  Database,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RealTimeMonitoringProps {
  logs: LogAktivitas[];
  santri: Santri[];
  guru: PengasuhGuru[];
  kamar: Kamar[];
  onTriggerSimulatedLog: (customLog?: Omit<LogAktivitas, 'id' | 'timestamp'>) => void;
  onClearLogs: () => void;
}

export default function RealTimeMonitoring({
  logs,
  santri,
  guru,
  kamar,
  onTriggerSimulatedLog,
  onClearLogs
}: RealTimeMonitoringProps) {
  // Filters
  const [filterKategori, setFilterKategori] = useState<string>('Semua');

  // Local clock state
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Preset lists for simulated actions (in Indonesian)
  const simulationPresets = [
    {
      kategori: 'Santri' as const,
      tipe: 'success' as const,
      pesan: 'Santri melakukan setoran hafalan Juz 30 baru kepada Ustadzah Fatimah.',
      actor: 'Siti Aminah Az-Zahra'
    },
    {
      kategori: 'Akademik' as const,
      tipe: 'info' as const,
      pesan: 'Bel berbunyi, Pembelajaran Kitab Fathul Qorib Bab Faraidh telah dimulai.',
      actor: 'Ustadz Lukman Hakim'
    },
    {
      kategori: 'Kamar' as const,
      tipe: 'warning' as const,
      pesan: 'Pemeriksaan lemari asrama selesai. Ditemukan gagang pintu lemari Makkah 01 longgar.',
      actor: 'Tim Pengawas Asrama'
    },
    {
      kategori: 'Keuangan' as const,
      tipe: 'success' as const,
      pesan: 'Penerimaan dana Syahriah Bulanan berhasil ditransfer oleh Wali dari Santri Muhammad Al-Fatih.',
      actor: 'Syahriah Gateway'
    },
    {
      kategori: 'Sistem' as const,
      tipe: 'info' as const,
      pesan: 'Pembuatan backup database harian terjadwal berhasil disimpan di cloud server.',
      actor: 'Admin Sistem'
    },
    {
      kategori: 'Santri' as const,
      tipe: 'danger' as const,
      pesan: 'Santri terlambat masuk gerbang pondok setelah izin pulang akhir pekan.',
      actor: 'Yusuf Habibi'
    },
    {
      kategori: 'Kamar' as const,
      tipe: 'success' as const,
      pesan: 'Santriwati bergotong-royong membersihkan lingkungan Kamar Mina 01. Nilai kebersihan: Mumtaz.',
      actor: 'Ustadzah Fatimah'
    }
  ];

  // Trigger random simulation preset
  const handleRandomSimulation = () => {
    const randomIndex = Math.floor(Math.random() * simulationPresets.length);
    onTriggerSimulatedLog(simulationPresets[randomIndex]);
  };

  // Trigger specific category simulation
  const handleSimulateCategory = (cat: typeof simulationPresets[0]['kategori']) => {
    const candidates = simulationPresets.filter(p => p.kategori === cat);
    if (candidates.length > 0) {
      const randomSelected = candidates[Math.floor(Math.random() * candidates.length)];
      onTriggerSimulatedLog(randomSelected);
    }
  };

  // Filter logs list
  const filteredLogs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .filter(log => filterKategori === 'Semua' || log.kategori === filterKategori);

  return (
    <div className="space-y-6" id="monitoring-container">
      {/* Top Interactive Radar Header */}
      <div className="bg-gradient-to-r from-nature-forest to-nature-forest/90 p-6 rounded-2xl text-white border border-nature-forest shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden" id="monitoring-header">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(circle_at_right,_var(--tw-gradient-stops))] from-nature-gold via-transparent to-transparent pointer-events-none"></div>
        
        {/* Radar pulsing effect and titles */}
        <div className="flex items-center gap-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 border border-white/20 text-nature-gold">
            <span className="absolute inline-flex h-full w-full rounded-2xl bg-nature-gold opacity-15 animate-ping-slow"></span>
            <Radio className="w-7 h-7 text-nature-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-pulse"></span>
              <h1 className="text-lg font-serif font-bold text-white tracking-wide">Pusat Monitoring Real-Time</h1>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Stream pemantauan aktivitas akademis, gerbang, asrama, dan keuangan</p>
          </div>
        </div>

        {/* Live Digital Clock */}
        <div className="flex flex-col items-start md:items-end justify-center bg-black/25 border border-white/15 px-4 py-2.5 rounded-xl font-mono shrink-0">
          <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold flex items-center gap-1">
            <Clock className="w-3 h-3 text-nature-gold" /> Jam Digital Server
          </span>
          <span className="text-lg font-bold text-nature-gold mt-0.5 tracking-wider">{currentTime || '---'}</span>
        </div>
      </div>

      {/* Grid: Simulator Dashboard (Left) & Live Streams logs list (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="monitoring-grid">
        {/* Left Column: Interactive Simulation Control panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-5" id="simulator-controls">
            <div className="space-y-1 pb-3 border-b border-nature-border">
              <h2 className="text-sm font-serif font-bold text-nature-forest flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-nature-gold" /> Simulator Aktivitas Pondok
              </h2>
              <p className="text-xs text-slate-500">Gunakan simulator untuk menyuntikkan data event tiruan baru dan lihat reaksi dasbor secara langsung</p>
            </div>

            <div className="space-y-4">
              {/* Main instant random trigger button */}
              <button 
                onClick={handleRandomSimulation}
                className="w-full inline-flex items-center justify-center gap-2 py-3 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-98 cursor-pointer"
                id="simulate-random-btn"
              >
                <Play className="w-4 h-4 text-nature-gold" /> Simulasikan Aktivitas Acak
              </button>

              <div className="text-[11px] text-slate-400 font-bold uppercase tracking-wider text-center">Atau Simulasikan Per Kategori</div>

              {/* Categorized micro simulation triggers */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button 
                  onClick={() => handleSimulateCategory('Santri')}
                  className="p-2.5 bg-nature-beige/25 hover:bg-nature-beige/65 border border-nature-border rounded-xl text-nature-charcoal transition-all font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                >
                  <UserCheck2 className="w-3.5 h-3.5 text-nature-sage" /> Santri Baru
                </button>
                <button 
                  onClick={() => handleSimulateCategory('Akademik')}
                  className="p-2.5 bg-nature-beige/25 hover:bg-nature-beige/65 border border-nature-border rounded-xl text-nature-charcoal transition-all font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-nature-sage" /> Kelas Baru
                </button>
                <button 
                  onClick={() => handleSimulateCategory('Kamar')}
                  className="p-2.5 bg-nature-beige/25 hover:bg-nature-beige/65 border border-nature-border rounded-xl text-nature-charcoal transition-all font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                >
                  <Home className="w-3.5 h-3.5 text-nature-sage" /> Info Kamar
                </button>
                <button 
                  onClick={() => handleSimulateCategory('Keuangan')}
                  className="p-2.5 bg-nature-beige/25 hover:bg-nature-beige/65 border border-nature-border rounded-xl text-nature-charcoal transition-all font-bold flex items-center gap-1.5 justify-center cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-nature-sage" /> Kas Keuangan
                </button>
              </div>
            </div>

            {/* Instruction tooltip */}
            <div className="p-3.5 bg-nature-beige/20 rounded-xl border border-nature-border flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
              <Sparkles className="w-4 h-4 text-nature-gold shrink-0 mt-0.5" />
              <span>
                Setiap event baru yang disuntikkan akan otomatis terekam dalam log monitor sebelah kanan, serta langsung mengubah akumulasi metrik grafis pada menu dashboard pusat.
              </span>
            </div>
          </div>

          {/* Quick Metrics Checklist */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4" id="live-integrity-metrics">
            <h3 className="text-sm font-serif font-bold text-nature-forest">Integritas Basis Data</h3>
            
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between items-center p-2 rounded-lg bg-nature-beige/15 border border-nature-border">
                <span className="font-bold text-slate-700">Jumlah Record Santri</span>
                <span className="font-mono font-bold text-nature-forest">{santri.length} baris</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-nature-beige/15 border border-nature-border">
                <span className="font-bold text-slate-700">Jumlah Record Guru</span>
                <span className="font-mono font-bold text-nature-forest">{guru.length} baris</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-nature-beige/15 border border-nature-border">
                <span className="font-bold text-slate-700">Jumlah Record Kamar</span>
                <span className="font-mono font-bold text-nature-forest">{kamar.length} baris</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-nature-beige/15 border border-nature-border">
                <span className="font-bold text-slate-700">Sinyal Monitoring</span>
                <span className="text-nature-sage font-extrabold flex items-center gap-1 animate-pulse">
                  ● AKTIF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Event Stream Feed */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Feed Filter controls */}
          <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-xs flex flex-wrap justify-between items-center gap-3" id="feed-filters">
            <span className="text-sm font-serif font-bold text-nature-forest flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-red-500 animate-pulse-slow" /> Aliran Event Aktivitas ({filteredLogs.length})
            </span>

            <div className="flex gap-2">
              <select 
                value={filterKategori}
                onChange={(e) => setFilterKategori(e.target.value)}
                className="p-1.5 bg-nature-beige/30 border border-nature-border text-nature-charcoal rounded-xl text-xs font-bold cursor-pointer focus:outline-none"
                id="filter-log-category"
              >
                <option value="Semua">Semua Kategori</option>
                <option value="Santri">Santri</option>
                <option value="Akademik">Akademik</option>
                <option value="Kamar">Kamar</option>
                <option value="Keuangan">Keuangan</option>
                <option value="Sistem">Sistem</option>
              </select>

              <button 
                onClick={onClearLogs}
                className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer"
                id="clear-logs-btn"
              >
                Kosongkan Log
              </button>
            </div>
          </div>

          {/* Dynamic Feed list */}
          <div className="bg-white rounded-2xl border border-nature-border shadow-xs overflow-hidden" id="feed-logs-list">
            <div className="divide-y divide-nature-border max-h-[500px] overflow-y-auto" id="feed-list-scroll">
              <AnimatePresence initial={false}>
                {filteredLogs.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2"
                  >
                    <Bell className="w-8 h-8 text-slate-300" />
                    <span>Belum ada log terekam dalam kategori ini.</span>
                  </motion.div>
                ) : (
                  filteredLogs.map((log) => {
                    // Category styling resolver
                    const getCategoryColor = (cat: string) => {
                      switch (cat) {
                        case 'Santri': return 'bg-nature-beige text-nature-forest border-nature-sage/40 text-emerald-800';
                        case 'Akademik': return 'bg-blue-50 border-blue-100 text-blue-800';
                        case 'Kamar': return 'bg-amber-50 border-amber-100 text-amber-800';
                        case 'Keuangan': return 'bg-purple-50 border-purple-100 text-purple-800';
                        default: return 'bg-slate-100 border-slate-200 text-slate-700';
                      }
                    };

                    const getIndicatorColor = (type: string) => {
                      switch (type) {
                        case 'success': return 'bg-nature-forest';
                        case 'warning': return 'bg-nature-gold';
                        case 'danger': return 'bg-red-500';
                        default: return 'bg-nature-sage';
                      }
                    };

                    return (
                      <motion.div 
                        key={log.id}
                        initial={{ height: 0, opacity: 0, y: -20 }}
                        animate={{ height: 'auto', opacity: 1, y: 0 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="p-4 flex gap-4 items-start relative overflow-hidden hover:bg-nature-beige/10 transition-colors"
                      >
                        {/* Colored side indicator band */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${getIndicatorColor(log.tipe)}`}></div>

                        {/* Category badge */}
                        <span className={`px-2 py-0.5 rounded border text-[10px] font-bold shrink-0 scale-95 ${getCategoryColor(log.kategori)}`}>
                          {log.kategori}
                        </span>

                        {/* Message details */}
                        <div className="space-y-1 text-xs flex-1">
                          <p className="text-slate-800 leading-normal font-semibold text-nature-charcoal">{log.pesan}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400">
                            <span className="font-semibold flex items-center gap-0.5">
                              <Clock className="w-3 h-3 text-slate-300" />
                              {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                            </span>
                            <span>&bull;</span>
                            <span>Operator: {log.actor}</span>
                          </div>
                        </div>

                        {/* Small green check icon on success logs */}
                        {log.tipe === 'success' && (
                          <div className="w-4 h-4 rounded-full bg-nature-beige flex items-center justify-center shrink-0 border border-nature-sage/30">
                            <span className="w-1.5 h-1.5 rounded-full bg-nature-forest"></span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Logs metadata status */}
            <div className="p-4 bg-nature-beige/25 border-t border-nature-border flex justify-between items-center text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <span className="text-nature-forest">Status Monitoring: OK</span>
              <span className="text-nature-charcoal">Total buffer: {logs.length} Log</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
