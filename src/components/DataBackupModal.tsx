import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  RefreshCw,
  FileJson
} from 'lucide-react';
import { motion } from 'motion/react';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestoreData: (backupData: any) => void;
  currentStats: {
    santri: number;
    guru: number;
    kamar: number;
    pelanggaran: number;
    keuangan: number;
    mutabaah: number;
    klinik: number;
    sdm: number;
    tahfidz: number;
  };
}

export default function DataBackupModal({
  isOpen,
  onClose,
  onRestoreData,
  currentStats
}: DataBackupModalProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleExportBackup = () => {
    try {
      const backupPayload: Record<string, any> = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        appName: "SATDAF Pesantren Al-Hikmah",
        data: {}
      };

      const keys = [
        'satdaf_santri',
        'satdaf_guru',
        'satdaf_kamar',
        'satdaf_logs',
        'satdaf_keuangan',
        'satdaf_pelanggaran',
        'satdaf_prestasi',
        'satdaf_mutabaah_targets',
        'satdaf_mutabaah_records',
        'satdaf_kunjungan_berobat',
        'satdaf_stok_obat',
        'satdaf_rekam_medis',
        'satdaf_absensi_petugas_klinik',
        'satdaf_pengguna_app',
        'satdaf_karyawan_sdm',
        'satdaf_penilaian_sdm',
        'satdaf_program_litbang',
        'satdaf_tahfidz_setoran'
      ];

      keys.forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          try {
            backupPayload.data[key] = JSON.parse(item);
          } catch {
            backupPayload.data[key] = item;
          }
        }
      });

      const blob = new Blob([JSON.stringify(backupPayload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `backup_satdaf_pesantren_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsSuccess(true);
      setImportStatus("Cadangan data berhasil diunduh ke komputer Anda!");
    } catch (e: any) {
      setImportStatus("Gagal mengekspor data: " + (e.message || e));
    }
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.data && typeof parsed !== 'object') {
          throw new Error("Format file cadangan tidak valid.");
        }

        const dataObj = parsed.data || parsed;
        Object.keys(dataObj).forEach(key => {
          if (key.startsWith('satdaf_')) {
            localStorage.setItem(key, JSON.stringify(dataObj[key]));
          }
        });

        onRestoreData(dataObj);
        setIsSuccess(true);
        setImportStatus("Data berhasil dipulihkan dari file cadangan!");
      } catch (err: any) {
        setIsSuccess(false);
        setImportStatus("Gagal membaca file: " + (err.message || "Format JSON tidak valid"));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs" id="data-backup-modal">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 text-slate-100 shadow-2xl overflow-hidden relative"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Status & Cadangan Data Sistem</h3>
              <p className="text-xs text-slate-400">Pengecekan Firebase Firestore & Manajemen Cadangan Data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Info */}
        <div className="mt-4 space-y-4">
          <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Data Firebase Firestore Tersimpan Aman</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Seluruh data inputan yang Anda masukkan tetap tersimpan di server Google Cloud Firebase dan sinkron dengan penyimpanan cache lokal peramban Anda.
            </p>
            <div className="pt-2">
              <a
                href="https://console.firebase.google.com/project/dulcet-day-2s7sz/firestore/databases/ai-studio-satdafsistemadmi-0afc1d6c-be3f-4056-a560-9b01eb2d1255/data?openUpgradeDialog=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-nature-gold hover:underline"
              >
                <span>Buka & Periksa Database di Firebase Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Current Stats Overview */}
          <div className="bg-slate-800/50 p-3.5 rounded-xl border border-slate-700/60">
            <h4 className="text-xs font-bold text-slate-300 mb-2.5">Ringkasan Data Saat Ini di Sistem:</h4>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Santri</span>
                <span className="font-bold text-emerald-400 text-sm">{currentStats.santri}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Guru / Pengasuh</span>
                <span className="font-bold text-blue-400 text-sm">{currentStats.guru}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Kamar Asrama</span>
                <span className="font-bold text-amber-400 text-sm">{currentStats.kamar}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Pelanggaran</span>
                <span className="font-bold text-rose-400 text-sm">{currentStats.pelanggaran}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Mutaba'ah</span>
                <span className="font-bold text-purple-400 text-sm">{currentStats.mutabaah}</span>
              </div>
              <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
                <span className="text-slate-400 block text-[10px]">Tahfidz Setoran</span>
                <span className="font-bold text-cyan-400 text-sm">{currentStats.tahfidz}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Export & Import */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Cadangkan Data (Unduh JSON)</span>
            </button>

            <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4 text-nature-gold" />
              <span>Pulihkan Data (Unggah JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Status Message */}
          {importStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              isSuccess 
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {isSuccess ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
