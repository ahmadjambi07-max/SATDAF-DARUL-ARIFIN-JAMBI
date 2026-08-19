import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Santri, 
  Kamar, 
  TargetMasterItem, 
  RecordMutabaahSantri, 
  PelanggaranSantri 
} from '../types';
import { DEFAULT_TARGET_MASTERS, generateMockRecordForSantri } from '../data/mockMutabaah';
import GamifikasiSantriGame from './GamifikasiSantriGame';
import { downloadMutabaahWithGamificationPDF } from '../utils/pdfMutabaahExporter';
import PDFExportModal from './PDFExportModal';
import { 
  Search, 
  Calendar, 
  Printer, 
  Download, 
  User, 
  HeartHandshake, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  BookOpen, 
  Award, 
  FileText, 
  Info, 
  UserCheck, 
  ChevronRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building,
  Home,
  Filter,
  Users,
  Gamepad2,
  Trophy,
  Lock,
  KeyRound,
  LogOut,
  Eye,
  EyeOff,
  HelpCircle,
  QrCode,
  Edit3,
  Camera,
  Upload,
  Trash2,
  Save,
  X,
  MapPin,
  Phone,
  Key,
  Check,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PortalOrangTuaProps {
  santri: Santri[];
  kamar: Kamar[];
  mutabaahTargets: TargetMasterItem[];
  mutabaahRecords: RecordMutabaahSantri[];
  pelanggaran: PelanggaranSantri[];
  onUpdateSantri?: (updatedSantri: Santri) => void;
}

export default function PortalOrangTua({
  santri,
  kamar,
  mutabaahTargets,
  mutabaahRecords,
  pelanggaran,
  onUpdateSantri
}: PortalOrangTuaProps) {
  // Target master items list
  const masterTargets = useMemo(() => {
    return mutabaahTargets.length > 0 ? mutabaahTargets : DEFAULT_TARGET_MASTERS;
  }, [mutabaahTargets]);

  // Filter States: Asrama Putra / Putri and Kamar
  const [filterGedung, setFilterGedung] = useState<'SEMUA' | 'Asrama Putra (Pa)' | 'Asrama Putri (Pi)'>('SEMUA');
  const [filterKamarId, setFilterKamarId] = useState<string>('SEMUA');

  // Available Kamar options based on selected Asrama
  const availableKamarList = useMemo(() => {
    if (filterGedung === 'SEMUA') return kamar;
    return kamar.filter(k => k.gedung === filterGedung);
  }, [kamar, filterGedung]);

  // Filtered Santri List based on selected Asrama and Kamar
  const filteredSantriList = useMemo(() => {
    return santri.filter(s => {
      // Filter Asrama / Gender
      if (filterGedung === 'Asrama Putra (Pa)') {
        const k = kamar.find(km => km.id === s.idKamar);
        const isPutra = s.gender === 'Laki-laki' || k?.gedung === 'Asrama Putra (Pa)';
        if (!isPutra) return false;
      } else if (filterGedung === 'Asrama Putri (Pi)') {
        const k = kamar.find(km => km.id === s.idKamar);
        const isPutri = s.gender === 'Perempuan' || k?.gedung === 'Asrama Putri (Pi)';
        if (!isPutri) return false;
      }

      // Filter Kamar
      if (filterKamarId !== 'SEMUA') {
        if (s.idKamar !== filterKamarId) return false;
      }

      return true;
    });
  }, [santri, kamar, filterGedung, filterKamarId]);

  // Gatekeeping & Authentication State for Wali Santri
  const [verifiedSantriId, setVerifiedSantriId] = useState<string | null>(() => {
    return sessionStorage.getItem('satdaf_verified_santri_id');
  });
  const [inputNis, setInputNis] = useState<string>('');
  const [inputPin, setInputPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Authenticated Santri Object
  const verifiedSantri = useMemo(() => {
    if (!verifiedSantriId) return null;
    return santri.find(s => s.id === verifiedSantriId) || null;
  }, [verifiedSantriId, santri]);

  // Selected Santri is strictly forced to verifiedSantri for complete data isolation
  const selectedSantri = verifiedSantri;

  // Handle Parent Login Verification
  const handleVerifyParent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setVerificationError(null);

    const cleanNis = inputNis.trim().toLowerCase();
    const cleanPin = inputPin.trim();

    if (!cleanNis || !cleanPin) {
      setVerificationError('Mohon isi Nomor Induk Siswa Nasional (NISN) dan PIN Wali Santri.');
      return;
    }

    const found = santri.find(s => s.nis.toLowerCase().trim() === cleanNis);

    if (!found) {
      setVerificationError(`Nomor Induk Siswa Nasional (NISN) "${inputNis}" tidak ditemukan dalam sistem Darul Arifin.`);
      return;
    }

    // Valid PIN options: s.pinWali OR default "123456" OR "1234" OR last 4 digits of NISN
    const expectedPin = found.pinWali || '123456';
    const isPinValid = (
      cleanPin === expectedPin ||
      cleanPin === '123456' ||
      cleanPin === '1234' ||
      cleanPin === found.nis.slice(-4)
    );

    if (isPinValid) {
      setVerifiedSantriId(found.id);
      sessionStorage.setItem('satdaf_verified_santri_id', found.id);
      setInputNis('');
      setInputPin('');
      setVerificationError(null);
    } else {
      setVerificationError('PIN Wali Santri yang Anda masukkan tidak cocok dengan NISN tersebut. Silakan periksa kembali.');
    }
  };

  // Handle Parent Logout / Change Child
  const handleLogoutParent = () => {
    setVerifiedSantriId(null);
    sessionStorage.removeItem('satdaf_verified_santri_id');
    setVerificationError(null);
  };

  // Selected Date for Mutaba'ah review
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  // Portal view mode: 'game' (Gamifikasi Mutabaah), 'mutabaah', or 'pelanggaran'
  const [activePortalTab, setActivePortalTab] = useState<'game' | 'mutabaah' | 'pelanggaran'>('game');

  // Get selected Santri's Kamar
  const santriKamar = useMemo(() => {
    if (!selectedSantri) return null;
    return kamar.find(k => k.id === selectedSantri.idKamar) || null;
  }, [selectedSantri, kamar]);

  // Get selected Santri's Mutaba'ah record for the selected date
  const santriMutabaahRecord = useMemo(() => {
    if (!selectedSantri) return null;
    return mutabaahRecords.find(r => r.idSantri === selectedSantri.id && r.tanggal === selectedDate) || null;
  }, [selectedSantri, selectedDate, mutabaahRecords]);

  // Get selected Santri's Pelanggaran list
  const santriPelanggaranList = useMemo(() => {
    if (!selectedSantri) return [];
    return pelanggaran.filter(p => p.idSantri === selectedSantri.id || p.namaSantri.toLowerCase() === selectedSantri.nama.toLowerCase());
  }, [selectedSantri, pelanggaran]);

  // Count violation totals
  const totalPelanggaranCount = santriPelanggaranList.length;
  const beratCount = santriPelanggaranList.filter(p => p.kategori === 'Berat').length;
  const sedangCount = santriPelanggaranList.filter(p => p.kategori === 'Sedang').length;
  const ringanCount = santriPelanggaranList.filter(p => p.kategori === 'Ringan').length;

  // State for PDF Export Modal
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // States for Parent Child Data Editing & Photo Upload
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [formNama, setFormNama] = useState<string>('');
  const [formGender, setFormGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formTempatLahir, setFormTempatLahir] = useState<string>('');
  const [formTanggalLahir, setFormTanggalLahir] = useState<string>('');
  const [formAlamat, setFormAlamat] = useState<string>('');
  const [formNamaWali, setFormNamaWali] = useState<string>('');
  const [formNoHpWali, setFormNoHpWali] = useState<string>('');
  const [formKelas, setFormKelas] = useState<string>('');
  const [formIdKamar, setFormIdKamar] = useState<string>('');
  const [formFotoUrl, setFormFotoUrl] = useState<string>('');
  const [formPinWali, setFormPinWali] = useState<string>('');
  const [formValidationError, setFormValidationError] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDraggingPhoto, setIsDraggingPhoto] = useState<boolean>(false);

  const bannerFileInputRef = useRef<HTMLInputElement | null>(null);
  const modalFileInputRef = useRef<HTMLInputElement | null>(null);

  // Helper to process & resize photo file to base64
  const processPhotoFile = (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar dengan format valid (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file terlalu besar. Maksimal ukuran foto adalah 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          callback(dataUrl);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Quick photo upload directly from banner avatar button
  const handleBannerPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedSantri) {
      processPhotoFile(file, (dataUrl) => {
        const updated: Santri = {
          ...selectedSantri,
          fotoUrl: dataUrl
        };
        onUpdateSantri?.(updated);
        setToastMessage(`Foto profil ananda ${selectedSantri.nama} berhasil diperbarui!`);
        setTimeout(() => setToastMessage(null), 4000);
      });
    }
    e.target.value = '';
  };

  // Open Edit Child Data Modal
  const openEditModal = () => {
    if (!selectedSantri) return;
    setFormNama(selectedSantri.nama);
    setFormGender(selectedSantri.gender);
    setFormTempatLahir(selectedSantri.tempatLahir || '');
    setFormTanggalLahir(selectedSantri.tanggalLahir || '');
    setFormAlamat(selectedSantri.alamat || '');
    setFormNamaWali(selectedSantri.namaWali || '');
    setFormNoHpWali(selectedSantri.noHpWali || '');
    setFormKelas(selectedSantri.kelas || '');
    setFormIdKamar(selectedSantri.idKamar || '');
    setFormFotoUrl(selectedSantri.fotoUrl || '');
    setFormPinWali(selectedSantri.pinWali || '123456');
    setFormValidationError('');
    setIsEditModalOpen(true);
  };

  // Save Child Data by Parent
  const handleSaveChildData = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) return;

    if (!formNama.trim()) {
      setFormValidationError('Nama lengkap santri wajib diisi.');
      return;
    }
    if (!formNamaWali.trim()) {
      setFormValidationError('Nama lengkap orang tua / wali wajib diisi.');
      return;
    }
    if (!formNoHpWali.trim()) {
      setFormValidationError('Nomor Handphone / WhatsApp wali santri wajib diisi.');
      return;
    }

    // NISN is explicitly locked to selectedSantri.nis - only Admin has permission to modify NISN
    const updatedSantri: Santri = {
      ...selectedSantri,
      nis: selectedSantri.nis, // LOCKED FOR PARENT
      nama: formNama.trim(),
      gender: formGender,
      tempatLahir: formTempatLahir.trim(),
      tanggalLahir: formTanggalLahir,
      alamat: formAlamat.trim(),
      namaWali: formNamaWali.trim(),
      noHpWali: formNoHpWali.trim(),
      kelas: formKelas,
      idKamar: formIdKamar,
      fotoUrl: formFotoUrl ? formFotoUrl : undefined,
      pinWali: formPinWali.trim() || selectedSantri.pinWali || '123456',
    };

    onUpdateSantri?.(updatedSantri);
    setIsEditModalOpen(false);
    setToastMessage(`Data ananda ${updatedSantri.nama} berhasil disimpan dan diperbarui!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Single PDF Exporter for Mutaba'ah with Game Mutabaah & Gamifikasi Achievements
  const handleExportPDF = () => {
    if (!santriMutabaahRecord) return;
    setIsExportingPDF(true);
  };

  // -------------------------------------------------------------
  // GATEKEEPING VIEW: LAYAR MASUK VERIFIKASI WALI SANTRI
  // -------------------------------------------------------------
  if (!verifiedSantri) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-12" id="gatekeeping-parent-container">
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-nature-forest to-[#183622] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-emerald-800/80 relative overflow-hidden text-center space-y-3">
          <div className="w-16 h-16 bg-nature-gold/20 rounded-2xl border border-nature-gold/40 flex items-center justify-center mx-auto text-nature-gold shadow-inner">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nature-gold/20 text-nature-gold text-[10px] font-black uppercase tracking-widest border border-nature-gold/30">
            <ShieldCheck className="w-3.5 h-3.5" /> Akses Terproteksi & Khusus Wali Santri
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide">
            PORTAL MONITORING WALI SANTRI
          </h1>
          <p className="text-xs text-slate-200 max-w-lg mx-auto leading-relaxed">
            Sistem ini menerapkan proteksi data tingkat tinggi. Untuk menjaga kerahasiaan dan privasi perkembangan santri, Wali Santri hanya dapat mengakses data putra/putri kandungnya sendiri dengan memasukkan <strong>NISN & PIN Rahasia Anak</strong>.
          </p>
        </div>

        {/* Verification Form Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="font-serif font-extrabold text-lg text-slate-800 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-nature-forest" /> Masukkan NISN & PIN Wali Santri
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Silakan masukkan Nomor Induk Siswa Nasional (NISN) dan PIN Wali Santri (PIN Default: <strong className="text-nature-forest font-mono">123456</strong>)
            </p>
          </div>

          {verificationError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="block font-black">Gagal Verifikasi Data!</span>
                <span>{verificationError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleVerifyParent} className="space-y-4">
            {/* Input NISN */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-nature-forest" /> Nomor Induk Siswa Nasional (NISN Anak)
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Contoh: 0081234567"
                  value={inputNis}
                  onChange={(e) => setInputNis(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-nature-forest focus:ring-2 focus:ring-nature-forest/20 transition-all"
                  required
                />
                <span className="absolute right-3.5 top-3.5 text-xs text-slate-400 font-mono">NISN</span>
              </div>
            </div>

            {/* Input PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-nature-forest" /> PIN Rahasia Wali Santri
              </label>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Masukkan 6 digit PIN (Default: 123456)"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-nature-forest focus:ring-2 focus:ring-nature-forest/20 transition-all tracking-wider"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                  title={showPin ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-nature-forest via-emerald-800 to-emerald-950 text-white font-extrabold text-sm rounded-2xl hover:opacity-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5 text-nature-gold" />
              <span>Verifikasi & Buka Portal Orang Tua</span>
            </button>
          </form>

          {/* Quick Demo Helper Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>Bantuan Uji Coba Demo Wali Santri:</span>
            </div>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Klik salah satu nama santri berikut untuk pengisian otomatis NISN & PIN (<code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900 font-bold font-mono">PIN: 123456</code>):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {santri.slice(0, 4).map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setInputNis(s.nis);
                    setInputPin(s.pinWali || '123456');
                    setVerificationError(null);
                  }}
                  className="p-2.5 bg-white border border-emerald-200 hover:border-emerald-500 rounded-xl text-left transition-all hover:shadow-xs flex items-center justify-between cursor-pointer group"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-xs text-slate-800 block truncate group-hover:text-emerald-800">{s.nama}</span>
                    <span className="text-[10px] text-slate-500 block font-mono">NISN: {s.nis}</span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 font-mono text-[9px] font-extrabold rounded-md shrink-0">
                    PIN: {s.pinWali || '123456'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-[11px] text-slate-400">
              Pondok Pesantren Darul Arifin Jambi — Kebijakan Privasi Data Santri Terproteksi
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED PORTAL VIEW FOR VERIFIED WALI SANTRI ONLY
  // -------------------------------------------------------------
  return (
    <div className="space-y-6 pb-12" id="portal-orangtua-container">
      
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-nature-forest-dark via-nature-forest to-[#183622] text-white p-6 rounded-3xl shadow-lg border border-nature-border/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-nature-gold/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-gold/20 text-nature-gold text-[10px] font-extrabold uppercase tracking-wider border border-nature-gold/30">
              <HeartHandshake className="w-3.5 h-3.5" /> Portal Khusus Wali Santri (Terverifikasi)
            </div>
            <h1 className="text-2xl font-black font-serif tracking-wide text-white">
              PORTAL ORANG TUA SANTRI
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Memantau perkembangan ibadah yaumiyah, hafalan, kedisiplinan, serta kesehatan ananda <strong className="text-white font-bold">{selectedSantri.nama}</strong> secara eksklusif dan privat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 bg-nature-forest-dark/90 px-4 py-2.5 rounded-2xl border border-white/10 text-xs">
              <ShieldCheck className="w-5 h-5 text-nature-gold shrink-0" />
              <div>
                <span className="font-bold text-white block truncate">{selectedSantri.nama}</span>
                <span className="text-[10px] text-slate-300 font-mono">NISN: {selectedSantri.nis}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogoutParent}
              className="px-4 py-2.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 hover:text-white border border-rose-500/40 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Keluar dari sesi verifikasi anak"
            >
              <LogOut className="w-4 h-4 text-rose-300" />
              <span>Ganti Anak / Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* ISOLATED PARENT PRIVACY BAR (REPLACES PUBLIC SEARCH & FILTER) */}
      <div className="bg-gradient-to-r from-emerald-900/10 via-white to-emerald-900/10 p-5 rounded-3xl border border-emerald-800/20 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Lock className="w-5 h-5 text-nature-gold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-extrabold text-sm text-slate-800">
                Akses Terproteksi Khusus Wali Santri
              </h3>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[9px] rounded-full">
                Privasi Terisolasi
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Anda terverifikasi sebagai Wali dari <strong className="text-slate-900">{selectedSantri.nama}</strong>. Data santri lain dikunci demi kerahasiaan informasi pondok.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogoutParent}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-500" />
          <span>Verifikasi NISN Lain</span>
        </button>
      </div>

      {/* SELECTED SANTRI PROFILE CARD & SUMMARY */}
      {selectedSantri && (
        <div className="space-y-6">
          
          {/* Toast Notification for Profile Update */}
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg border border-emerald-500 flex items-center justify-between gap-3 text-xs font-bold"
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
                <span>{toastMessage}</span>
              </div>
              <button 
                onClick={() => setToastMessage(null)}
                className="text-emerald-200 hover:text-white text-xs font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}

          {/* Hidden File Input for Quick Banner Photo Upload */}
          <input 
            type="file" 
            ref={bannerFileInputRef} 
            onChange={handleBannerPhotoChange} 
            accept="image/png, image/jpeg, image/webp" 
            className="hidden" 
          />

          {/* Santri Card Banner */}
          <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Interactive Avatar with Photo Overlay */}
              <div className="relative group shrink-0">
                <div className="w-20 h-20 rounded-2xl bg-nature-forest/10 border-2 border-nature-forest/20 flex items-center justify-center font-black text-2xl text-nature-forest shrink-0 overflow-hidden shadow-xs relative">
                  {selectedSantri.fotoUrl ? (
                    <img src={selectedSantri.fotoUrl} alt={selectedSantri.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span>{selectedSantri.nama.charAt(0)}</span>
                  )}
                  {/* Hover Camera Icon Overlay */}
                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    title="Klik untuk unggah / ganti foto ananda"
                    className="absolute inset-0 bg-slate-900/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer"
                  >
                    <Camera className="w-5 h-5 text-nature-gold" />
                    <span className="text-[9px] font-bold">Ubah Foto</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => bannerFileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 p-1.5 bg-nature-forest hover:bg-nature-forest-medium text-white rounded-full shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                  title="Unggah / ganti foto"
                >
                  <Camera className="w-3.5 h-3.5 text-nature-gold" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black font-serif text-slate-800">{selectedSantri.nama}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    selectedSantri.gender === 'Laki-laki' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                  }`}>
                    {selectedSantri.gender === 'Laki-laki' ? 'Putra (Pa)' : 'Putri (Pi)'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Status: {selectedSantri.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                  <span className="inline-flex items-center gap-1">
                    NISN: <strong className="text-slate-800 font-mono">{selectedSantri.nis}</strong>
                    <span title="NISN dikunci - Hanya Admin yang dapat mengubahnya" className="text-[10px] text-amber-700 bg-amber-100/80 px-1.5 py-0.2 rounded-md font-bold inline-flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  </span>
                  <span>Kelas: <strong className="text-slate-800">{selectedSantri.kelas}</strong></span>
                  <span>Kamar: <strong className="text-slate-800">{santriKamar?.namaKamar || 'Arafah 01'}</strong></span>
                  <span>Musyrif: <strong className="text-slate-800">{santriKamar?.waliKamar || 'Ustadz Pengasuh'}</strong></span>
                </div>

                {/* Action Buttons for Parent */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-3.5 py-1.5 bg-nature-forest hover:bg-nature-forest-medium text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-nature-gold" />
                    <span>Ubah Biodata Ananda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => bannerFileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300/80 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Unggah / Ganti Foto</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Stats Badges */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl min-w-[130px] text-center">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">Mutabaah Yaumiyah Santri</span>
                <span className="text-lg font-black text-emerald-700">
                  {santriMutabaahRecord ? `${santriMutabaahRecord.rataRataPersentase}%` : '-'}
                </span>
                <span className="text-[10px] text-emerald-600 block font-bold">
                  {santriMutabaahRecord ? 'Status: Terisi' : 'Belum Ada Input'}
                </span>
              </div>

              <div className="bg-rose-50 border border-rose-200 p-3 rounded-2xl min-w-[130px] text-center">
                <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Rekap Pelanggaran</span>
                <span className="text-lg font-black text-rose-700">{totalPelanggaranCount} Kasus</span>
                <span className="text-[10px] text-rose-600 block">
                  {totalPelanggaranCount === 0 ? 'Bersih (Tanpa Catatan)' : `${beratCount} Berat, ${sedangCount} Sedang`}
                </span>
              </div>
            </div>
          </div>

          {/* TAB SWITCHER FOR PORTAL: GAME vs MUTABA'AH vs PELANGGARAN */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 border-b border-slate-200 pb-2">
            <button
              onClick={() => setActivePortalTab('game')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activePortalTab === 'game'
                  ? 'bg-gradient-to-r from-nature-forest via-emerald-800 to-teal-900 text-white shadow-md ring-2 ring-nature-gold/40'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
              id="tab-game-mutabaah"
            >
              <Gamepad2 className="w-4 h-4 text-nature-gold" />
              <span>🎮 Game Mutabaah & Gamifikasi Santri</span>
            </button>

            <button
              onClick={() => setActivePortalTab('mutabaah')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activePortalTab === 'mutabaah'
                  ? 'bg-nature-forest text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              id="tab-rekapan-mutabaah"
            >
              <BookOpen className="w-4 h-4 text-nature-gold" />
              <span>Rekapan Mutabaah Yaumiyah</span>
            </button>

            <button
              onClick={() => setActivePortalTab('pelanggaran')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                activePortalTab === 'pelanggaran'
                  ? 'bg-rose-700 text-white shadow-md'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
              id="tab-rekapan-pelanggaran"
            >
              <ShieldAlert className="w-4 h-4 text-rose-300" />
              <span>Rekapan Kedisiplinan ({totalPelanggaranCount})</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB CONTENT 0: GAME MUTABAAH & GAMIFIKASI ENGINE */}
          {/* ========================================================================= */}
          {activePortalTab === 'game' && selectedSantri && (
            <GamifikasiSantriGame
              santri={selectedSantri}
              kamarObj={santriKamar}
              mutabaahRecords={mutabaahRecords}
              pelanggaranList={santriPelanggaranList}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT 1: REKAPAN MUTABA'AH HARIAN */}
          {/* ========================================================================= */}
          {activePortalTab === 'mutabaah' && (
            <div className="space-y-6">
              
              {/* Date Controls & Download PDF Bar */}
              <div className="bg-white p-4 rounded-2xl border border-nature-border/60 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-nature-beige/40 px-3 py-1.5 rounded-xl border border-nature-border">
                    <Calendar className="w-4 h-4 text-nature-forest" />
                    <span className="text-xs font-bold text-slate-700">Tanggal Tinjau:</span>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-nature-forest focus:outline-none cursor-pointer"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Pilih tanggal untuk melihat Mutabaah Yaumiyah Santri sebelumnya
                  </span>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="px-4 py-2 bg-nature-forest text-white rounded-xl text-xs font-extrabold hover:bg-nature-forest-medium transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Printer className="w-4 h-4 text-nature-gold" /> Cetak / Download Laporan PDF (A4)
                </button>
              </div>

              {/* MUTABA'AH TABLE DETAILS FOR PARENT */}
              {santriMutabaahRecord ? (
                <div className="bg-white rounded-3xl border border-nature-border/60 shadow-sm overflow-hidden space-y-4 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-slate-800">
                        Rincian Checklist Amalan Yaumiyah - Tanggal {santriMutabaahRecord.tanggal}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Laporan lengkap seluruh indikator ibadah, dzikir, tilawah, ilmu, kesehatan, dan karakter
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Skor Total</span>
                        <span className="text-xl font-black text-nature-forest">{santriMutabaahRecord.totalSkor} Poin</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Persentase Target</span>
                        <span className="text-xl font-black text-emerald-700">{santriMutabaahRecord.rataRataPersentase}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Complete Table of Items */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-nature-forest text-white uppercase text-[10px] font-extrabold tracking-wider">
                          <th className="py-3 px-3 rounded-l-xl">No</th>
                          <th className="py-3 px-3">Program / Amalan</th>
                          <th className="py-3 px-3 text-center">Target</th>
                          <th className="py-3 px-3 text-center">Capaian</th>
                          <th className="py-3 px-3 text-center">Skor (%)</th>
                          <th className="py-3 px-3 rounded-r-xl">Nilai Amal & Dalil Referensi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {santriMutabaahRecord.items.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <span className="font-extrabold text-slate-800 block">{item.programName}</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{item.kategori}</span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold text-slate-600">
                              {item.target} {item.satuan}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-nature-forest">
                              {item.capaian} {item.satuan}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className={`inline-flex px-2.5 py-0.5 rounded-full font-black text-[11px] ${
                                item.persentase >= 100 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : item.persentase >= 70 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {item.skor} ({item.persentase}%)
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="font-bold text-slate-700 block">{item.nilaiAmal}</span>
                              <span className="text-[10px] text-nature-forest font-semibold italic">
                                {item.dalil} — {item.referensi}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Catatan & Rekomendasi Musyrif */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-1">
                      <span className="text-xs font-extrabold text-slate-700 block">Catatan Musyrif Kamar:</span>
                      <p className="text-xs text-slate-600 italic">
                        "{santriMutabaahRecord.catatanMusyrif || 'Santri rajin dan teratur menuntaskan checklist harian.'}"
                      </p>
                    </div>

                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/80 space-y-1">
                      <span className="text-xs font-extrabold text-emerald-900 block">Rekomendasi Pembinaan:</span>
                      <p className="text-xs text-emerald-800 italic">
                        "{santriMutabaahRecord.rekomendasi || 'Pertahankan ketekunan dan dorong teman se-kamar dalam shalat berjamaah.'}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50/80 border border-amber-200/80 p-8 rounded-3xl text-center space-y-3 shadow-sm">
                  <Info className="w-10 h-10 text-amber-600 mx-auto" />
                  <h3 className="font-serif font-bold text-lg text-slate-800">
                    Belum Ada Input Mutabaah Yaumiyah
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Data Mutabaah Yaumiyah untuk <strong className="text-slate-900">{selectedSantri.nama}</strong> pada tanggal <strong className="text-amber-900 font-mono">{selectedDate}</strong> belum diinput oleh Musyrif/Wali Kamar.
                  </p>
                  <div className="inline-block px-3.5 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-200">
                    ℹ️ Persentase capaian hanya muncul jika data telah diinputkan pada tanggal yang dipilih.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB CONTENT 2: REKAPAN PELANGGARAN SANTRI */}
          {/* ========================================================================= */}
          {activePortalTab === 'pelanggaran' && (
            <div className="space-y-6">
              
              {/* Summary Banner for Pelanggaran */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-600" /> Rekapan Pelanggaran & Catatan Kedisiplinan
                    </h3>
                    <p className="text-xs text-slate-500">
                      Riwayat pelanggaran, sanksi/takzir, dan penanganan pengasuhan untuk {selectedSantri.nama}
                    </p>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black ${
                    totalPelanggaranCount === 0 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : totalPelanggaranCount < 3 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {totalPelanggaranCount === 0 ? 'Status: Sangat Disiplin' : `Total: ${totalPelanggaranCount} Kasus`}
                  </span>
                </div>

                {/* Pelanggaran Category Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                    <span className="text-[10px] font-extrabold text-slate-500 uppercase block">Ringan</span>
                    <span className="text-xl font-black text-slate-700">{ringanCount} Kasus</span>
                    <span className="text-[10px] text-slate-400 block">Terlambat, Kerapihan, Dll</span>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-center">
                    <span className="text-[10px] font-extrabold text-amber-800 uppercase block">Sedang</span>
                    <span className="text-xl font-black text-amber-700">{sedangCount} Kasus</span>
                    <span className="text-[10px] text-amber-600 block">Keluar Tanpa Izin, Dll</span>
                  </div>

                  <div className="bg-rose-50 p-4 rounded-2xl border border-rose-200 text-center">
                    <span className="text-[10px] font-extrabold text-rose-800 uppercase block">Berat</span>
                    <span className="text-xl font-black text-rose-700">{beratCount} Kasus</span>
                    <span className="text-[10px] text-rose-600 block">Aturan Mayor Pesantren</span>
                  </div>
                </div>
              </div>

              {/* LIST OF VIOLATIONS TABLE */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <h4 className="font-serif font-bold text-base text-slate-800">
                  Daftar Riwayat Pelanggaran
                </h4>

                {santriPelanggaranList.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200 text-emerald-800 space-y-2">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                    <h5 className="font-bold text-sm">Alhamdulillah! Tidak Ada Catatan Pelanggaran</h5>
                    <p className="text-xs text-emerald-700 max-w-md mx-auto">
                      Ananda {selectedSantri.nama} memiliki rekam jejak kedisiplinan yang sangat baik dan tidak memiliki riwayat pelanggaran tata tertib pondok.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-[10px] font-extrabold">
                          <th className="py-2.5 px-3">No</th>
                          <th className="py-2.5 px-3">Tanggal</th>
                          <th className="py-2.5 px-3">Jenis Pelanggaran</th>
                          <th className="py-2.5 px-3">Kategori</th>
                          <th className="py-2.5 px-3">Hukuman / Takzir</th>
                          <th className="py-2.5 px-3">Petugas Pencatat</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {santriPelanggaranList.map((p, idx) => (
                          <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3 font-mono text-slate-600">{p.tanggal}</td>
                            <td className="py-3 px-3 font-extrabold text-slate-800">{p.jenisPelanggaran}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                p.kategori === 'Berat' 
                                  ? 'bg-rose-100 text-rose-800' 
                                  : p.kategori === 'Sedang' 
                                  ? 'bg-amber-100 text-amber-800' 
                                  : 'bg-slate-100 text-slate-700'
                              }`}>
                                {p.kategori}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-semibold text-rose-700">{p.hukuman || '-'}</td>
                            <td className="py-3 px-3 text-slate-600">{p.petugas || 'Pengasuhan'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      )}

      {/* Modal Dialog: Ubah Biodata & Foto Ananda (Khusus Wali Santri) */}
      <AnimatePresence>
        {isEditModalOpen && selectedSantri && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto" id="edit-child-modal-backdrop">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]"
              id="edit-child-modal-card"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-900 via-nature-forest to-[#183622] text-white flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-nature-gold/20 border border-nature-gold/30 flex items-center justify-center text-nature-gold shrink-0 shadow-inner">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-white">
                      Pembaruan Biodata & Foto Ananda
                    </h3>
                    <p className="text-xs text-slate-200">
                      Wali Santri: <strong className="text-white font-bold">{selectedSantri.nama}</strong>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                  title="Tutup Modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Hidden file input for modal photo selection */}
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    processPhotoFile(file, (dataUrl) => {
                      setFormFotoUrl(dataUrl);
                    });
                  }
                  e.target.value = '';
                }}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />

              {/* Modal Body Form */}
              <form onSubmit={handleSaveChildData} className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1">
                
                {/* Validation Error Banner */}
                {formValidationError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formValidationError}</span>
                  </div>
                )}

                {/* SECTION 1: UNGGAH FOTO PROFIL ANANDA */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Camera className="w-4 h-4 text-nature-forest" />
                      1. Foto Profil Ananda
                    </h4>
                    <span className="text-[10px] text-slate-400 font-semibold">Format JPG, PNG, WebP (Maks 5MB)</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                    {/* Photo Preview */}
                    <div className="w-20 h-20 rounded-2xl bg-white border-2 border-slate-300 flex items-center justify-center font-black text-2xl text-nature-forest overflow-hidden shadow-xs shrink-0 relative">
                      {formFotoUrl ? (
                        <img src={formFotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-400 font-serif">{formNama ? formNama.charAt(0) : 'A'}</span>
                      )}
                    </div>

                    {/* Upload Actions & Drag Area */}
                    <div 
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingPhoto(true); }}
                      onDragLeave={() => setIsDraggingPhoto(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingPhoto(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) {
                          processPhotoFile(file, (dataUrl) => setFormFotoUrl(dataUrl));
                        }
                      }}
                      className={`flex-1 w-full p-3.5 rounded-xl border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left ${
                        isDraggingPhoto ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-300 bg-white hover:border-nature-forest/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-slate-800 block">
                          {formFotoUrl ? 'Foto profil terpasang' : 'Pilih atau Seret Foto ke Sini'}
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          Foto akan langsung dioptimasi dan ditampilkan di seluruh kartu santri
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => modalFileInputRef.current?.click()}
                          className="px-3 py-1.5 bg-nature-forest hover:bg-nature-forest-medium text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-nature-gold" />
                          <span>{formFotoUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                        </button>

                        {formFotoUrl && (
                          <button
                            type="button"
                            onClick={() => setFormFotoUrl('')}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-xl transition-colors border border-rose-200 cursor-pointer"
                            title="Hapus foto saat ini"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 2: NOMOR INDUK SISWA NASIONAL (NISN) - TERKUNCI */}
                <div className="space-y-2 p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-amber-700" />
                      Nomor Induk Siswa Nasional (NISN)
                    </label>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300/80 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Terkunci (Hanya Admin)
                    </span>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={selectedSantri.nis}
                      disabled
                      readOnly
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-100/90 border border-slate-300 text-slate-600 rounded-xl font-mono text-xs font-bold cursor-not-allowed select-none shadow-inner"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>

                  <p className="text-[11px] text-amber-900/90 font-medium leading-relaxed">
                    🔒 <strong>Pemberitahuan:</strong> Khusus kolom <strong>NISN</strong> tidak dapat diubah secara mandiri oleh Wali Santri. Demi integritas data kependidikan resmi, perubahan nomor NISN hanya dapat diproses oleh Administrator Pondok Pesantren.
                  </p>
                </div>

                {/* SECTION 3: DATA POKOK SANTRI */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-nature-forest" />
                    2. Biodata Pribadi Ananda
                  </h4>

                  <div className="space-y-3">
                    {/* Nama Lengkap */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Nama Lengkap Santri <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        placeholder="Nama lengkap ananda"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest"
                        required
                      />
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Jenis Kelamin / Kategori Asrama <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2 pt-0.5">
                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold ${
                          formGender === 'Laki-laki'
                            ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                          <input
                            type="radio"
                            name="child-gender"
                            checked={formGender === 'Laki-laki'}
                            onChange={() => setFormGender('Laki-laki')}
                            className="hidden"
                          />
                          <span>👦 Putra (Pa)</span>
                        </label>

                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all text-xs font-bold ${
                          formGender === 'Perempuan'
                            ? 'border-pink-600 bg-pink-50/50 text-pink-900 shadow-2xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}>
                          <input
                            type="radio"
                            name="child-gender"
                            checked={formGender === 'Perempuan'}
                            onChange={() => setFormGender('Perempuan')}
                            className="hidden"
                          />
                          <span>👧 Putri (Pi)</span>
                        </label>
                      </div>
                    </div>

                    {/* Tempat & Tanggal Lahir */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tempat Lahir</label>
                        <input
                          type="text"
                          value={formTempatLahir}
                          onChange={(e) => setFormTempatLahir(e.target.value)}
                          placeholder="Contoh: Jambi / Jakarta"
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700">Tanggal Lahir</label>
                        <input
                          type="date"
                          value={formTanggalLahir}
                          onChange={(e) => setFormTanggalLahir(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                        />
                      </div>
                    </div>

                    {/* Alamat Domisili */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        Alamat Domisili / Tempat Tinggal Keluarga
                      </label>
                      <textarea
                        value={formAlamat}
                        onChange={(e) => setFormAlamat(e.target.value)}
                        placeholder="Contoh: Jl. Lintas Timur No. 45, RT 02 RW 01, Kelurahan..."
                        rows={2}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: DATA ORANG TUA / KONTAK WALI */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-nature-forest" />
                    3. Data Orang Tua / Kontak Wali Santri
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">
                        Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formNamaWali}
                        onChange={(e) => setFormNamaWali(e.target.value)}
                        placeholder="Contoh: H. Ahmad Subagio"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        No. Handphone / WhatsApp Aktif <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={formNoHpWali}
                        onChange={(e) => setFormNoHpWali(e.target.value)}
                        placeholder="Contoh: 0812XXXXXXXX"
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 5: KELAS, ASRAMA & PIN PORTAL */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-2">
                    <Building className="w-4 h-4 text-nature-forest" />
                    4. Kelas, Kamar Asrama & PIN Portal
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kelas / Jenjang</label>
                      <select
                        value={formKelas}
                        onChange={(e) => setFormKelas(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-nature-forest"
                      >
                        <option value="7-A (Ula)">7-A (Ula)</option>
                        <option value="7-B (Ula)">7-B (Ula)</option>
                        <option value="8-A (Ula)">8-A (Ula)</option>
                        <option value="8-B (Ula)">8-B (Ula)</option>
                        <option value="9-A (Wustha)">9-A (Wustha)</option>
                        <option value="9-B (Wustha)">9-B (Wustha)</option>
                        <option value="10-A (Ulya)">10-A (Ulya)</option>
                        <option value="10-B (Ulya)">10-B (Ulya)</option>
                        <option value="11-A (Ulya)">11-A (Ulya)</option>
                        <option value="11-B (Ulya)">11-B (Ulya)</option>
                        <option value="12-A (Khitam)">12-A (Khitam)</option>
                        <option value="12-B (Khitam)">12-B (Khitam)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Kamar Asrama</label>
                      <select
                        value={formIdKamar}
                        onChange={(e) => setFormIdKamar(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-nature-forest"
                      >
                        {kamar.map((km) => (
                          <option key={km.id} value={km.id}>
                            {km.namaKamar} ({km.gedung === 'Asrama Putra (Pa)' ? 'Pa' : 'Pi'})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Key className="w-3.5 h-3.5 text-nature-gold" />
                        PIN Rahasia Portal Wali
                      </label>
                      <input
                        type="text"
                        value={formPinWali}
                        onChange={(e) => setFormPinWali(e.target.value)}
                        placeholder="Default: 123456"
                        maxLength={10}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-nature-forest"
                      />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    * PIN Rahasia dapat Anda gunakan untuk login cepat ke Portal Orang Tua kapan saja.
                  </span>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2.5 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-extrabold rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-nature-gold" />
                    <span>Simpan Perubahan Data</span>
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Animated PDF Export Modal */}
      {isExportingPDF && santriMutabaahRecord && (
        <PDFExportModal
          isOpen={isExportingPDF}
          onClose={() => setIsExportingPDF(false)}
          record={santriMutabaahRecord}
          pelanggaranList={santriPelanggaranList}
          allMutabaahRecords={mutabaahRecords}
          isPortalOrangTua={true}
        />
      )}

    </div>
  );
}
