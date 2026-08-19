import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Award, Sparkles, CheckCircle2, ShieldCheck, Download, FileText, X } from 'lucide-react';
import { RecordMutabaahSantri, PelanggaranSantri } from '../types';
import { downloadMutabaahWithGamificationPDF } from '../utils/pdfMutabaahExporter';

interface PDFExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: RecordMutabaahSantri;
  pelanggaranList?: PelanggaranSantri[];
  allMutabaahRecords?: RecordMutabaahSantri[];
  isPortalOrangTua?: boolean;
}

export default function PDFExportModal({
  isOpen,
  onClose,
  record,
  pelanggaranList = [],
  allMutabaahRecords = [],
  isPortalOrangTua = false
}: PDFExportModalProps) {
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('Inisialisasi Dokumen...');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsDone(false);
      setCurrentStage('Inisialisasi Dokumen...');
      return;
    }

    // Step 1: Initialize
    setProgress(15);
    setCurrentStage('Membaca Record Mutaba\'ah & Target Amalan...');

    const timer1 = setTimeout(() => {
      setProgress(45);
      setCurrentStage('Mengkalkulasi Lencana Gamifikasi, XP & Avatar...');
    }, 400);

    const timer2 = setTimeout(() => {
      setProgress(80);
      setCurrentStage('Merender Vektor Badge, Shield Level & Visual Bar...');
    }, 900);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setCurrentStage('Selesai! Laporan PDF Gamifikasi Siap...');
      setIsDone(true);

      // Trigger actual download
      downloadMutabaahWithGamificationPDF({
        record,
        pelanggaranList,
        allMutabaahRecords,
        isPortalOrangTua
      });
    }, 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, record, pelanggaranList, allMutabaahRecords, isPortalOrangTua]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-b from-emerald-950 via-nature-forest to-slate-900 text-white rounded-3xl max-w-md w-full p-6 sm:p-8 border border-emerald-500/30 shadow-2xl space-y-6 relative overflow-hidden text-center"
        >
          {/* Animated Background Rays */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-nature-gold/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />

          {/* Close Button (X) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-90"
            title="Tutup Modal"
            id="close-pdf-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Icon Badge Graphic */}
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            {/* Spinning Gold Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
              className="absolute inset-0 rounded-full border-2 border-dashed border-nature-gold/50"
            />
            {/* Pulsing Level Badge */}
            <motion.div
              animate={{ scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20 border border-yellow-200"
            >
              {isDone ? (
                <CheckCircle2 className="w-9 h-9 text-emerald-950" />
              ) : (
                <Trophy className="w-8 h-8 text-slate-950 animate-bounce" />
              )}
            </motion.div>

            {/* Floating Sparkles */}
            <motion.div
              animate={{ y: [-4, 4, -4], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute -top-1 -right-1 text-nature-gold"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <motion.div
              animate={{ y: [4, -4, 4], opacity: [0.6, 1, 0.6] }}
              transition={{ repeat: Infinity, duration: 1.8 }}
              className="absolute -bottom-1 -left-1 text-yellow-300"
            >
              <Award className="w-5 h-5" />
            </motion.div>
          </div>

          {/* Text Information */}
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5" /> Gamifikasi PDF Exporter
            </span>
            <h3 className="text-xl font-bold font-serif text-white">
              {isDone ? 'Dokumen PDF Selesai!' : 'Menerbitkan PDF Gamifikasi'}
            </h3>
            <p className="text-xs text-emerald-200/80 font-medium">
              Santri: <span className="text-white font-bold">{record.namaSantri}</span> ({record.tanggal})
            </p>
          </div>

          {/* Animated Progress Bar */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-white/10">
            <div className="flex justify-between items-center text-xs text-slate-300">
              <span className="font-mono text-[11px] font-semibold flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-nature-gold" />
                {currentStage}
              </span>
              <span className="font-bold text-nature-gold">{progress}%</span>
            </div>
            <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
                className="h-full bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 rounded-full"
              />
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-2">
            {isDone ? (
              <div className="space-y-2">
                <button
                  onClick={onClose}
                  className="w-full py-3 bg-nature-gold hover:bg-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" /> Unduh Lagi / Tutup
                </button>
                <p className="text-[10px] text-slate-400">
                  File PDF otomatis diunduh ke perangkat Anda.
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 animate-pulse">
                Mohon tunggu sebentar, dokumen sedang disusun secara presisi...
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
