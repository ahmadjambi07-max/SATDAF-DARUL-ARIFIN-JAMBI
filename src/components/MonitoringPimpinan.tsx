import React from 'react';
import { 
  ExternalLink, 
  HeartPulse, 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck,
  Compass,
  Tv,
  Info,
  Coins
} from 'lucide-react';
import { motion } from 'motion/react';

export default function MonitoringPimpinan() {
  const monitoringServices = [
    {
      id: 'klinik-kesehatan',
      title: 'KLINIK KESEHATAN DARUL ARIFIN JAMBI',
      url: 'https://sistem-informasi-uks.ai.studio/',
      icon: HeartPulse,
      accentColor: 'rose',
      description: 'Sistem Informasi Unit Kesehatan Sekolah (UKS) & Klinik Kesehatan Pesantren. Berfungsi untuk pemantauan rekam medis santri, riwayat pemeriksaan kesehatan, deteksi dini penyakit, serta manajemen stok obat-obatan pesantren secara terintegrasi.',
      badge: 'Layanan Kesehatan',
      features: [
        'Rekam Medis Santri & Pengajar',
        'Manajemen Obat & Alkes',
        'Riwayat Pemeriksaan Bulanan',
        'Pemberitahuan Kondisi Darurat'
      ]
    },
    {
      id: 'akademik-terpadu',
      title: 'SISTEM AKADEMIK TERPADU DARUL ARIFIN JAMBI',
      url: 'https://absensi-hafalan-majelis-qur-an-pondok-pesantren-d-620463839495.asia-southeast1.run.app/',
      icon: GraduationCap,
      accentColor: 'amber',
      description: 'Sistem Informasi Kehadiran (Absensi) Terpadu, Perkembangan Hafalan Al-Qur\'an (Tahfidz & Tahsin), serta Evaluasi Majelis Qur\'an Santri. Memudahkan pimpinan memantau progres hafalan dan kedisiplinan belajar santri secara harian.',
      badge: 'Layanan Akademik & Tahfidz',
      features: [
        'Absensi & Kehadiran Kelas',
        'Pencatatan Progres Hafalan (Ziyadah/Muraja\'ah)',
        'Raport Majelis Qur\'an Santri',
        'Grafik Perkembangan Belajar'
      ]
    },
    {
      id: 'keuangan-pesantren',
      title: 'KEUANGAN DARUL ARIFIN JAMBI',
      url: 'https://keuangan.darularifinjambi.ponpes.id/',
      icon: Coins,
      accentColor: 'emerald',
      description: 'Sistem Pengelolaan Keuangan Syariah, Pembayaran SPP Bulanan, Administrasi Uang Saku Santri, serta Pelaporan Arus Kas Pondok Pesantren secara real-time. Memudahkan transparansi laporan kepada pimpinan dan wali santri.',
      badge: 'Layanan Keuangan & SPP',
      features: [
        'Manajemen SPP & Daftar Ulang',
        'E-Money Uang Saku Santri',
        'Laporan Arus Kas Bulanan',
        'Integritas Donatur & Wakaf'
      ]
    }
  ];

  return (
    <div className="space-y-6" id="monitoring-pimpinan-view">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="pimpinan-header">
        <div>
          <h1 className="text-xl font-serif font-black text-nature-forest flex items-center gap-2 tracking-tight">
            <ShieldCheck className="w-6 h-6 text-nature-gold animate-pulse" />
            Monitoring Pimpinan
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pusat kendali integrasi ekosistem digital Pondok Pesantren Darul Arifin Jambi.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold bg-[#FAF9F6] px-3 py-1.5 rounded-lg border border-nature-border self-start md:self-auto">
          <Compass className="w-3.5 h-3.5 text-nature-gold" /> IT Center Darul Arifin
        </div>
      </div>

      {/* Intro Banner */}
      <div className="bg-gradient-to-br from-nature-forest to-nature-forest-medium text-white rounded-3xl p-6 shadow-md border border-nature-border/30 relative overflow-hidden" id="pimpinan-intro-banner">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-nature-gold/5 rounded-full blur-2xl -ml-12 -mb-12" />
        
        <div className="relative z-10 max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1 bg-white/10 text-nature-gold text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10">
            <Sparkles className="w-3 h-3" /> Dashboard Eksekutif
          </span>
          <h2 className="font-serif font-black text-lg sm:text-xl text-white tracking-tight leading-snug">
            Selamat Datang di Portal Pengawasan Pesantren
          </h2>
          <p className="text-xs text-slate-200 leading-relaxed font-normal">
            Melalui halaman khusus pimpinan ini, Anda dapat memantau seluruh aktivitas, perkembangan santri, 
            klinik kesehatan, dan sistem akademik yang saling terhubung dalam ekosistem digital Darul Arifin Jambi secara cepat dan akurat.
          </p>
        </div>
      </div>

      {/* Monitoring Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="monitoring-services-grid">
        {monitoringServices.map((service, idx) => {
          const ServiceIcon = service.icon;
          const isRose = service.accentColor === 'rose';
          const isAmber = service.accentColor === 'amber';

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={service.id}
              className="bg-white rounded-3xl border border-nature-border hover:border-nature-gold/40 shadow-3xs hover:shadow-md transition-all p-6 flex flex-col justify-between space-y-6"
              id={`service-card-${service.id}`}
            >
              <div className="space-y-4">
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className={`p-3.5 rounded-2xl border ${
                    isRose 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : isAmber 
                      ? 'bg-amber-50 text-amber-600 border-amber-100'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    <ServiceIcon className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider ${
                    isRose
                      ? 'bg-rose-50/70 text-rose-700 border-rose-100'
                      : isAmber
                      ? 'bg-amber-50/70 text-amber-700 border-amber-100'
                      : 'bg-emerald-50/70 text-emerald-700 border-emerald-100'
                  }`}>
                    {service.badge}
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="font-serif font-black text-slate-800 text-sm leading-snug tracking-tight">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-normal min-h-[72px]">
                    {service.description}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <div className="pt-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Cakupan Sistem Pendataan:
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {service.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          isRose ? 'bg-rose-500' : isAmber ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Redirect Action Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold">
                  <Info className="w-3.5 h-3.5 text-slate-350 shrink-0" />
                  <span>Akan dialihkan ke tab baru</span>
                </div>
                
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-3xs hover:shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isRose 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : isAmber 
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  id={`link-btn-${service.id}`}
                >
                  Hubungkan Sistem <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Footnote */}
      <div className="bg-nature-beige/40 p-4 rounded-2xl border border-nature-border flex items-start gap-3 text-xs text-slate-500 leading-relaxed" id="pimpinan-footnote">
        <Tv className="w-5 h-5 text-nature-forest shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-700 block mb-0.5">Catatan Keamanan Akses:</span>
          Sistem pimpinan ini dilindungi enkripsi end-to-end. Membuka tautan luar di atas akan membawa Anda secara aman ke server pendataan masing-masing modul. Gunakan otorisasi login yang sama yang didaftarkan di IT Center Darul Arifin untuk mengakses informasi detail di dalamnya.
        </div>
      </div>
    </div>
  );
}
