import React, { useState, useMemo } from 'react';
import { 
  Santri, 
  Kamar, 
  PengasuhGuru, 
  KunjunganBerobat, 
  RekamMedisSantri, 
  AbsensiPetugasKlinik, 
  StokObatLogistik,
  ResepObatItem,
  TriageLevel,
  StatusIstirahatKlinik,
  KategoriObat,
  PeranPetugasKlinik,
  ShiftKlinik
} from '../types';
import { 
  Stethoscope, 
  HeartPulse, 
  Activity, 
  Pill, 
  UserCheck, 
  FileText, 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Printer, 
  Filter, 
  Building2, 
  User, 
  Thermometer, 
  Ambulance, 
  Eye, 
  Package, 
  AlertCircle, 
  Heart, 
  Trash2, 
  Edit3, 
  Sparkles, 
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Award,
  ChevronDown,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface KlinikKesehatanProps {
  santri: Santri[];
  kamar: Kamar[];
  guru: PengasuhGuru[];
  kunjunganList: KunjunganBerobat[];
  stokObatList: StokObatLogistik[];
  rekamMedisList: RekamMedisSantri[];
  absensiPetugasList: AbsensiPetugasKlinik[];
  onSaveKunjungan: (item: KunjunganBerobat) => void;
  onDeleteKunjungan: (id: string) => void;
  onSaveStokObat: (item: StokObatLogistik) => void;
  onDeleteStokObat: (id: string) => void;
  onSaveRekamMedis: (item: RekamMedisSantri) => void;
  onSaveAbsensiPetugas: (item: AbsensiPetugasKlinik) => void;
  onDeleteAbsensiPetugas: (id: string) => void;
  userRole: 'ADMIN' | 'PENGASUHAN' | 'AKADEMIK';
  username: string;
}

type TabKlinik = 'dashboard' | 'kunjungan' | 'rekam-medis' | 'absensi' | 'stok-obat' | 'laporan';

export default function KlinikKesehatan({
  santri,
  kamar,
  guru,
  kunjunganList = [],
  stokObatList = [],
  rekamMedisList = [],
  absensiPetugasList = [],
  onSaveKunjungan,
  onDeleteKunjungan,
  onSaveStokObat,
  onDeleteStokObat,
  onSaveRekamMedis,
  onSaveAbsensiPetugas,
  onDeleteAbsensiPetugas,
  userRole,
  username
}: KlinikKesehatanProps) {
  // Active Sub-Tab
  const [activeTab, setActiveTab] = useState<TabKlinik>('dashboard');

  // Active Klinik Unit (Putra vs Putri vs Semua)
  const [klinikUnit, setKlinikUnit] = useState<'PUTRA' | 'PUTRI' | 'SEMUA'>('PUTRA');

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [filterTriage, setFilterTriage] = useState<string>('semua');
  const [filterStatusIstirahat, setFilterStatusIstirahat] = useState<string>('semua');
  const [filterKategoriObat, setFilterKategoriObat] = useState<string>('semua');
  
  // Date State (Today default: YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Selected Item Modals
  const [selectedSantriForMedis, setSelectedSantriForMedis] = useState<Santri | null>(null);
  const [selectedKunjunganForSurat, setSelectedKunjunganForSurat] = useState<KunjunganBerobat | null>(null);
  const [showFormKunjunganModal, setShowFormKunjunganModal] = useState<boolean>(false);
  const [showAddObatModal, setShowAddObatModal] = useState<boolean>(false);
  const [editingObat, setEditingObat] = useState<StokObatLogistik | null>(null);
  const [showAddAbsensiModal, setShowAddAbsensiModal] = useState<boolean>(false);
  const [showEditRekamMedisModal, setShowEditRekamMedisModal] = useState<boolean>(false);

  // Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --- FORM STATE FOR KUNJUNGAN BEROBAT ---
  const [formKunjungan, setFormKunjungan] = useState<{
    idSantri: string;
    tanggal: string;
    jam: string;
    keluhanUtama: string;
    triage: TriageLevel;
    suhu: string;
    sistol: string;
    diastol: string;
    diagnosis: string;
    kategoriDiagnosis: 'ISPA & Flu' | 'Gangguan Pencernaan / Maag' | 'Penyakit Kulit / Scabies' | 'Demam & Pusing' | 'Cedera / Fisik' | 'Mata & Telinga' | 'Lain-lain';
    tindakanTerapi: string;
    resep: ResepObatItem[];
    statusIstirahat: StatusIstirahatKlinik;
    lamaIstirahatHari: string;
    petugas: string;
    catatanPerkembangan: string;
  }>({
    idSantri: '',
    tanggal: todayStr,
    jam: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    keluhanUtama: '',
    triage: 'Hijau (Ringan)',
    suhu: '36.5',
    sistol: '120',
    diastol: '80',
    diagnosis: '',
    kategoriDiagnosis: 'ISPA & Flu',
    tindakanTerapi: '',
    resep: [],
    statusIstirahat: 'Kembali ke Kamar/KBM',
    lamaIstirahatHari: '0',
    petugas: username || 'dr. H. Hendra Wijaya',
    catatanPerkembangan: ''
  });

  // Resep Temp Input
  const [tempIdObat, setTempIdObat] = useState('');
  const [tempJumlahObat, setTempJumlahObat] = useState('1');
  const [tempAturanPakai, setTempAturanPakai] = useState('3x1 sesudah makan');

  // --- FORM STATE FOR STOK OBAT ---
  const [formObat, setFormObat] = useState<Partial<StokObatLogistik>>({
    kodeObat: '',
    namaObat: '',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 100,
    stokMin: 20,
    satuan: 'Tablet',
    tanggalKadaluarsa: '2027-12-31',
    lokasiRak: 'Rak A-01',
    catatan: ''
  });

  // --- FORM STATE FOR ABSENSI PETUGAS ---
  const [formAbsensi, setFormAbsensi] = useState<Partial<AbsensiPetugasKlinik>>({
    tanggal: todayStr,
    namaPetugas: '',
    peran: 'Dokter Pondok',
    shift: 'Pagi (07.00 - 14.00)',
    jamMasuk: '07:30',
    status: 'Hadir Jaga',
    keterangan: 'Jaga Poli Kesehatan UKS'
  });

  // --- FORM STATE FOR EDIT REKAM MEDIS ---
  const [formMedisEdit, setFormMedisEdit] = useState<{
    idSantri: string;
    golonganDarah: 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu';
    riwayatAlergiText: string;
    riwayatPenyakitKronisText: string;
    catatanKhusus: string;
    kontakDaruratOrtu: string;
  }>({
    idSantri: '',
    golonganDarah: 'O',
    riwayatAlergiText: '',
    riwayatPenyakitKronisText: '',
    catatanKhusus: '',
    kontakDaruratOrtu: ''
  });

  // Derived Data by Active Klinik Unit (Putra / Putri / Semua)
  const santriByUnit = useMemo(() => {
    return santri.filter(s => {
      if (klinikUnit === 'PUTRA') return s.gender === 'Laki-laki';
      if (klinikUnit === 'PUTRI') return s.gender === 'Perempuan';
      return true;
    });
  }, [santri, klinikUnit]);

  // Filtered santri list for Form Pemeriksaan
  const filteredSantriForForm = useMemo(() => {
    if (!patientSearchQuery.trim()) return santriByUnit;
    const query = patientSearchQuery.toLowerCase();
    return santriByUnit.filter(s => {
      const kObj = kamar.find(k => k.id === s.idKamar);
      const namaKamar = kObj ? kObj.namaKamar.toLowerCase() : '';
      return s.nama.toLowerCase().includes(query) ||
             s.nis.toLowerCase().includes(query) ||
             s.kelas.toLowerCase().includes(query) ||
             namaKamar.includes(query);
    });
  }, [santriByUnit, patientSearchQuery, kamar]);

  const kunjunganListByUnit = useMemo(() => {
    return kunjunganList.filter(k => {
      if (klinikUnit === 'PUTRA') return k.gender === 'Laki-laki';
      if (klinikUnit === 'PUTRI') return k.gender === 'Perempuan';
      return true;
    });
  }, [kunjunganList, klinikUnit]);

  const rekamMedisByUnit = useMemo(() => {
    return rekamMedisList.filter(rm => {
      const s = santri.find(item => item.id === rm.idSantri);
      if (!s) return true;
      if (klinikUnit === 'PUTRA') return s.gender === 'Laki-laki';
      if (klinikUnit === 'PUTRI') return s.gender === 'Perempuan';
      return true;
    });
  }, [rekamMedisList, santri, klinikUnit]);

  // Derived Metrics for Dashboard
  const kunjunganHariIni = useMemo(() => {
    return kunjunganListByUnit.filter(k => k.tanggal === selectedDate);
  }, [kunjunganListByUnit, selectedDate]);

  const kunjunganPutraHariIni = useMemo(() => {
    return kunjunganList.filter(k => k.gender === 'Laki-laki' && k.tanggal === selectedDate);
  }, [kunjunganList, selectedDate]);

  const kunjunganPutriHariIni = useMemo(() => {
    return kunjunganList.filter(k => k.gender === 'Perempuan' && k.tanggal === selectedDate);
  }, [kunjunganList, selectedDate]);

  const rawatInapAktif = useMemo(() => {
    return kunjunganListByUnit.filter(k => k.statusIstirahat === 'Rawat Inap UKS' && !k.isSelesaiRawatInap);
  }, [kunjunganListByUnit]);

  const stokKritisList = useMemo(() => {
    return stokObatList.filter(o => o.stokSekarang <= o.stokMin);
  }, [stokObatList]);

  const petugasJagaHariIni = useMemo(() => {
    return absensiPetugasList.filter(a => a.tanggal === selectedDate && a.status === 'Hadir Jaga');
  }, [absensiPetugasList, selectedDate]);

  // Category counts for diagnoses
  const diagnosaStats = useMemo(() => {
    const counts: { [key: string]: number } = {};
    kunjunganListByUnit.forEach(k => {
      const cat = k.kategoriDiagnosis || 'Lain-lain';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [kunjunganListByUnit]);

  // Selected Santri Object for Form
  const selectedSantriObj = useMemo(() => {
    return santri.find(s => s.id === formKunjungan.idSantri);
  }, [santri, formKunjungan.idSantri]);

  // Reset/Populate Edit Obat Form
  const handleOpenEditObat = (item: StokObatLogistik) => {
    setEditingObat(item);
    setFormObat({ ...item });
    setShowAddObatModal(true);
  };

  const handleOpenAddObat = () => {
    setEditingObat(null);
    setFormObat({
      kodeObat: `OBT-${Math.floor(100 + Math.random() * 900)}`,
      namaObat: '',
      kategori: 'Obat Bebas & P3K',
      stokSekarang: 50,
      stokMin: 15,
      satuan: 'Tablet',
      tanggalKadaluarsa: '2027-12-31',
      lokasiRak: 'Rak A-01',
      catatan: ''
    });
    setShowAddObatModal(true);
  };

  // Add Item to Resep Temporary List
  const handleAddResepItem = () => {
    if (!tempIdObat) {
      alert('Silahkan pilih obat dari daftar stok!');
      return;
    }
    const obatObj = stokObatList.find(o => o.id === tempIdObat);
    if (!obatObj) return;

    const qty = parseInt(tempJumlahObat) || 1;
    if (qty > obatObj.stokSekarang) {
      alert(`Stok ${obatObj.namaObat} hanya tersisa ${obatObj.stokSekarang} ${obatObj.satuan}!`);
      return;
    }

    const newItem: ResepObatItem = {
      idObat: obatObj.id,
      namaObat: obatObj.namaObat,
      jumlah: qty,
      satuan: obatObj.satuan,
      aturanPakai: tempAturanPakai || '3x1 sesudah makan'
    };

    setFormKunjungan(prev => ({
      ...prev,
      resep: [...prev.resep, newItem]
    }));

    setTempIdObat('');
    setTempJumlahObat('1');
    setTempAturanPakai('3x1 sesudah makan');
  };

  const handleRemoveResepItem = (index: number) => {
    setFormKunjungan(prev => ({
      ...prev,
      resep: prev.resep.filter((_, i) => i !== index)
    }));
  };

  // Submit Form Kunjungan
  const handleSubmitKunjungan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKunjungan.idSantri) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }
    if (!formKunjungan.keluhanUtama || !formKunjungan.diagnosis) {
      alert('Lengkapi keluhan utama dan diagnosis!');
      return;
    }

    const s = santri.find(item => item.id === formKunjungan.idSantri);
    if (!s) return;

    const kamarObj = kamar.find(k => k.id === s.idKamar);
    const namaKamar = kamarObj ? kamarObj.namaKamar : 'Kamar Utama';

    const newKunjungan: KunjunganBerobat = {
      id: `kjg-${Date.now()}`,
      idSantri: s.id,
      namaSantri: s.nama,
      nisSantri: s.nis,
      kelas: s.kelas,
      kamar: namaKamar,
      gender: s.gender,
      tanggal: formKunjungan.tanggal,
      jam: formKunjungan.jam,
      keluhanUtama: formKunjungan.keluhanUtama,
      triage: formKunjungan.triage,
      suhu: parseFloat(formKunjungan.suhu) || 36.5,
      tekananDarah: `${formKunjungan.sistol}/${formKunjungan.diastol}`,
      sistol: parseInt(formKunjungan.sistol) || 120,
      diastol: parseInt(formKunjungan.diastol) || 80,
      diagnosis: formKunjungan.diagnosis,
      kategoriDiagnosis: formKunjungan.kategoriDiagnosis,
      tindakanTerapi: formKunjungan.tindakanTerapi || 'Istirahat dan observasi',
      resepObat: formKunjungan.resep,
      statusIstirahat: formKunjungan.statusIstirahat,
      lamaIstirahatHari: parseInt(formKunjungan.lamaIstirahatHari) || 0,
      petugas: formKunjungan.petugas || username || 'Dokter Pondok',
      catatanPerkembangan: formKunjungan.catatanPerkembangan,
      isSelesaiRawatInap: formKunjungan.statusIstirahat !== 'Rawat Inap UKS'
    };

    // Deduct stock for given prescription
    formKunjungan.resep.forEach(r => {
      const o = stokObatList.find(item => item.id === r.idObat);
      if (o) {
        const updatedObat: StokObatLogistik = {
          ...o,
          stokSekarang: Math.max(0, o.stokSekarang - r.jumlah)
        };
        onSaveStokObat(updatedObat);
      }
    });

    onSaveKunjungan(newKunjungan);
    setShowFormKunjunganModal(false);
    triggerToast(`Kunjungan berobat santri ${s.nama} berhasil dicatat.`);

    // Reset Form
    setFormKunjungan({
      idSantri: '',
      tanggal: todayStr,
      jam: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      keluhanUtama: '',
      triage: 'Hijau (Ringan)',
      suhu: '36.5',
      sistol: '120',
      diastol: '80',
      diagnosis: '',
      kategoriDiagnosis: 'ISPA & Flu',
      tindakanTerapi: '',
      resep: [],
      statusIstirahat: 'Kembali ke Kamar/KBM',
      lamaIstirahatHari: '0',
      petugas: username || 'dr. H. Hendra Wijaya',
      catatanPerkembangan: ''
    });
  };

  // Selesaikan Rawat Inap
  const handleSelesaikanRawatInap = (item: KunjunganBerobat) => {
    const updated: KunjunganBerobat = {
      ...item,
      isSelesaiRawatInap: true,
      catatanPerkembangan: `${item.catatanPerkembangan || ''} [Telah dinyatakan sembuh & kembali ke kamar pada ${new Date().toLocaleDateString('id-ID')}]`
    };
    onSaveKunjungan(updated);
    triggerToast(`Santri ${item.namaSantri} dinyatakan sembuh dan kembali ke kamar.`);
  };

  // Submit Save Stok Obat
  const handleSubmitObat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formObat.namaObat) {
      alert('Nama obat wajib diisi!');
      return;
    }

    const item: StokObatLogistik = {
      id: editingObat ? editingObat.id : `obt-${Date.now()}`,
      kodeObat: formObat.kodeObat || `OBT-${Math.floor(100 + Math.random() * 900)}`,
      namaObat: formObat.namaObat,
      kategori: formObat.kategori || 'Obat Bebas & P3K',
      stokSekarang: Number(formObat.stokSekarang) || 0,
      stokMin: Number(formObat.stokMin) || 10,
      satuan: formObat.satuan || 'Tablet',
      tanggalKadaluarsa: formObat.tanggalKadaluarsa || '2028-12-31',
      lokasiRak: formObat.lokasiRak || 'Rak A-01',
      catatan: formObat.catatan || ''
    };

    onSaveStokObat(item);
    setShowAddObatModal(false);
    triggerToast(`Data obat ${item.namaObat} berhasil disimpan.`);
  };

  // Submit Save Absensi Petugas
  const handleSubmitAbsensi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAbsensi.namaPetugas) {
      alert('Nama petugas wajib diisi!');
      return;
    }

    const item: AbsensiPetugasKlinik = {
      id: `abs-${Date.now()}`,
      tanggal: formAbsensi.tanggal || todayStr,
      namaPetugas: formAbsensi.namaPetugas,
      peran: formAbsensi.peran || 'Musyrif Kesehatan',
      shift: formAbsensi.shift || 'Pagi (07.00 - 14.00)',
      jamMasuk: formAbsensi.jamMasuk || '07:30',
      status: formAbsensi.status || 'Hadir Jaga',
      keterangan: formAbsensi.keterangan || ''
    };

    onSaveAbsensiPetugas(item);
    setShowAddAbsensiModal(false);
    triggerToast(`Absensi petugas ${item.namaPetugas} berhasil dicatat.`);
  };

  // Submit Save Rekam Medis Edit
  const handleSubmitRekamMedis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMedisEdit.idSantri) return;

    const alergiList = formMedisEdit.riwayatAlergiText
      .split(',')
      .map(x => x.trim())
      .filter(x => x.length > 0);

    const penyakitList = formMedisEdit.riwayatPenyakitKronisText
      .split(',')
      .map(x => x.trim())
      .filter(x => x.length > 0);

    const item: RekamMedisSantri = {
      idSantri: formMedisEdit.idSantri,
      golonganDarah: formMedisEdit.golonganDarah,
      riwayatAlergi: alergiList,
      riwayatPenyakitKronis: penyakitList,
      catatanKhusus: formMedisEdit.catatanKhusus,
      kontakDaruratOrtu: formMedisEdit.kontakDaruratOrtu,
      updatedAt: todayStr
    };

    onSaveRekamMedis(item);
    setShowEditRekamMedisModal(false);
    triggerToast(`Rekam medis santri berhasil diperbarui.`);
  };

  // Filtered Kunjungan
  const filteredKunjunganList = useMemo(() => {
    return kunjunganListByUnit.filter(k => {
      const matchSearch = k.namaSantri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.nisSantri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        k.keluhanUtama.toLowerCase().includes(searchQuery.toLowerCase());

      const matchTriage = filterTriage === 'semua' || k.triage.toLowerCase().includes(filterTriage);
      const matchStatus = filterStatusIstirahat === 'semua' || k.statusIstirahat === filterStatusIstirahat;

      return matchSearch && matchTriage && matchStatus;
    });
  }, [kunjunganListByUnit, searchQuery, filterTriage, filterStatusIstirahat]);

  // Filtered Stok Obat
  const filteredStokObatList = useMemo(() => {
    return stokObatList.filter(o => {
      const matchSearch = o.namaObat.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.kodeObat.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKategori = filterKategoriObat === 'semua' || o.kategori === filterKategoriObat;
      return matchSearch && matchKategori;
    });
  }, [stokObatList, searchQuery, filterKategoriObat]);

  return (
    <div className="space-y-6 select-none" id="klinik-kesehatan-view">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold">{toastMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KLINIK BRANDING HEADER BANNER */}
      <div className="bg-gradient-to-r from-emerald-900 via-nature-forest to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl border border-emerald-700/30 relative overflow-hidden">
        {/* Subtle Background Medics SVG */}
        <div className="absolute -right-10 -bottom-10 opacity-10 text-emerald-300 pointer-events-none">
          <HeartPulse className="w-64 h-64" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-extrabold uppercase tracking-widest border border-emerald-400/30">
              <Ambulance className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Unit Kesehatan Santri (UKS) & Poli Pondok
            </div>
            <h1 className="font-serif font-black text-2xl md:text-3xl text-white tracking-wide flex items-center gap-3">
              <span>KLINIK KESEHATAN DARUL ARIFIN</span>
              <span className="text-xs font-sans font-bold bg-nature-gold/20 text-nature-gold px-3 py-1 rounded-full border border-nature-gold/30">
                Pondok Pesantren
              </span>
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/80 max-w-2xl leading-relaxed">
              Sistem Terpadu Layanan Kesehatan, Rekam Medis Santri, Manajemen Stok Obat, dan Logistik Pos Kesehatan Pesantren Darul Arifin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setFormKunjungan(prev => ({ ...prev, tanggal: todayStr }));
                setShowFormKunjunganModal(true);
              }}
              className="px-5 py-3 bg-nature-gold hover:bg-yellow-500 text-nature-forest-dark font-black text-xs rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2 shrink-0"
              id="btn-catat-kunjungan-header"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Catat Pasien Berobat</span>
            </button>

            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 flex items-center gap-3">
              <Calendar className="w-4 h-4 text-nature-gold" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white text-xs font-extrabold cursor-pointer focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SUB-NAVIGATION TAB BAR */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-white/10 overflow-x-auto no-scrollbar" id="klinik-tab-bar">
          {[
            { id: 'dashboard', label: 'Dashboard Klinik', icon: Activity },
            { id: 'kunjungan', label: 'Catatan Kunjungan', icon: Stethoscope, badge: kunjunganHariIni.length },
            { id: 'rekam-medis', label: 'Rekam Medis Santri', icon: FileText },
            { id: 'absensi', label: 'Absensi Petugas', icon: UserCheck, badge: petugasJagaHariIni.length },
            { id: 'stok-obat', label: 'Stok & Logistik Obat', icon: Pill, alert: stokKritisList.length > 0 },
            { id: 'laporan', label: 'Laporan Ringkasan', icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabKlinik)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-lg font-extrabold'
                    : 'text-emerald-100/70 hover:text-white hover:bg-white/10'
                }`}
                id={`tab-btn-${tab.id}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-emerald-300'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-700 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.alert && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" title="Ada stok obat kritis!" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* PEMBAGIAN UNIT KLINIK UKS (PUTRA & PUTRI) */}
      <div className="bg-white p-4 md:p-5 rounded-3xl border border-nature-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              Unit Layanan UKS Terpilih
            </span>
            <h2 className="font-serif font-black text-base md:text-lg text-slate-800 flex items-center gap-2">
              {klinikUnit === 'PUTRA' && (
                <>
                  <span className="text-blue-600">♂️ KLINIK KESEHATAN SANTRI PUTRA</span>
                  <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold border border-blue-200">UKS Asrama Putra</span>
                </>
              )}
              {klinikUnit === 'PUTRI' && (
                <>
                  <span className="text-pink-600">♀️ KLINIK KESEHATAN SANTRI PUTRI</span>
                  <span className="text-[10px] bg-pink-50 text-pink-700 px-2 py-0.5 rounded-md font-bold border border-pink-200">UKS Asrama Putri</span>
                </>
              )}
              {klinikUnit === 'SEMUA' && (
                <>
                  <span className="text-emerald-800">🏥 POS KESEHATAN UTAMA (TERPADU)</span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-bold border border-emerald-200">Gabungan Putra & Putri</span>
                </>
              )}
            </h2>
          </div>
        </div>

        {/* Switcher Buttons */}
        <div className="flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 shrink-0 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setKlinikUnit('PUTRA')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              klinikUnit === 'PUTRA'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>♂️ Klinik Santri Putra</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              klinikUnit === 'PUTRA' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
            }`}>
              {kunjunganPutraHariIni.length} Pasien
            </span>
          </button>

          <button
            type="button"
            onClick={() => setKlinikUnit('PUTRI')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              klinikUnit === 'PUTRI'
                ? 'bg-pink-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>♀️ Klinik Santri Putri</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              klinikUnit === 'PUTRI' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-800'
            }`}>
              {kunjunganPutriHariIni.length} Pasien
            </span>
          </button>

          <button
            type="button"
            onClick={() => setKlinikUnit('SEMUA')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              klinikUnit === 'SEMUA'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>🏥 Semua Unit</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
              klinikUnit === 'SEMUA' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {kunjunganList.filter(k => k.tanggal === selectedDate).length}
            </span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. DASHBOARD TAB */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* STATS SUMMARY METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stat 1: Total Berobat Hari Ini */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Kunjungan Berobat Hari Ini</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-2xl text-slate-800">{kunjunganHariIni.length}</span>
                  <span className="text-xs font-extrabold text-emerald-700">Pasien Santri</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Tanggal: {selectedDate}
                </span>
              </div>
            </div>

            {/* Stat 2: Rawat Inap UKS / Istirahat */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-200">
                <HeartPulse className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Rawat Inap / Rest UKS</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-2xl text-slate-800">{rawatInapAktif.length}</span>
                  <span className="text-xs font-extrabold text-amber-700">Bed Terisi</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Penyembuhan aktif di UKS
                </span>
              </div>
            </div>

            {/* Stat 3: Stok Obat Kritis */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${
                stokKritisList.length > 0 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-blue-100 text-blue-800 border-blue-200'
              }`}>
                <Pill className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Stok Obat Kritis</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-2xl text-slate-800">{stokKritisList.length}</span>
                  <span className="text-xs font-extrabold text-rose-700">Perlu Restock</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Dibawah batas minimum
                </span>
              </div>
            </div>

            {/* Stat 4: Petugas Jaga Shift Ini */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center shrink-0 border border-indigo-200">
                <UserCheck className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block">Petugas Jaga Aktif</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-serif font-black text-2xl text-slate-800">{petugasJagaHariIni.length}</span>
                  <span className="text-xs font-extrabold text-indigo-700">Tim Kesehatan</span>
                </div>
                <span className="text-[10px] text-slate-500 font-medium block">
                  Dokter, Perawat & PMR
                </span>
              </div>
            </div>
          </div>

          {/* TWO COLUMN GRID: ACTIVE INPATIENT vs DIAGNOSIS DISTRIBUTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT 2 COLS: DAFTAR SANTRI RAWAT INAP UKS SAAT INI */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                    <HeartPulse className="w-3.5 h-3.5 text-amber-700" /> Monitoring Bed Pasien
                  </div>
                  <h3 className="font-serif font-black text-lg text-slate-800">
                    Pasien Rest / Rawat Inap di UKS ({rawatInapAktif.length})
                  </h3>
                </div>

                <button
                  onClick={() => setActiveTab('kunjungan')}
                  className="text-xs font-bold text-nature-forest hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Lihat Semua Kunjungan</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {rawatInapAktif.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">Alhamdulillah! Tidak ada santri yang sedang rawat inap di UKS saat ini.</p>
                  <p className="text-[11px] text-slate-400">Seluruh santri dalam keadaan sehat atau beristirahat di kamar masing-masing.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {rawatInapAktif.map((item) => (
                    <div 
                      key={item.id}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-amber-300"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-amber-200/80 text-amber-900 font-black text-sm flex items-center justify-center shrink-0 border border-amber-300">
                          {item.namaSantri.charAt(0)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm text-slate-800">{item.namaSantri}</h4>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-800">
                              NISN: {item.nisSantri}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            Kelas: <strong>{item.kelas}</strong> | Kamar: <strong>{item.kamar}</strong>
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-700">
                            <span className="font-bold text-rose-700">Diagnosa: {item.diagnosis}</span>
                            <span className="text-slate-400">•</span>
                            <span>Suhu: <strong>{item.suhu}°C</strong></span>
                            <span className="text-slate-400">•</span>
                            <span>TD: <strong>{item.tekananDarah}</strong></span>
                          </div>
                          {item.resepObat && item.resepObat.length > 0 && (
                            <div className="text-[11px] text-slate-500 font-medium">
                              Obat: {item.resepObat.map(r => `${r.namaObat} (${r.aturanPakai})`).join(', ')}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          onClick={() => handleSelesaikanRawatInap(item)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Selesai Inap / Sembuh</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT 1 COL: DIAGNOSIS & PENYAKIT TERBANYAK */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-extrabold uppercase">
                  <Activity className="w-3.5 h-3.5 text-indigo-700" /> Analisis Diagnosa
                </div>
                <h3 className="font-serif font-black text-lg text-slate-800">
                  Distribusi Keluhan Penyakit
                </h3>
              </div>

              <div className="space-y-3">
                {diagnosaStats.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">Belum ada riwayat diagnosa tercatat.</p>
                ) : (
                  diagnosaStats.slice(0, 5).map(([kat, count]) => {
                    const total = kunjunganList.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <div key={kat} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-extrabold text-slate-700">
                          <span>{kat}</span>
                          <span>{count} Kasus ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* QUICK ACTION BANNER */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 space-y-3 pt-4">
                <h4 className="font-extrabold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  Pintasan Cepat Klinik
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setFormKunjungan(prev => ({ ...prev, tanggal: todayStr }));
                      setShowFormKunjunganModal(true);
                    }}
                    className="p-2.5 bg-white hover:bg-emerald-100/60 border border-emerald-200 rounded-xl text-left text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Input Pasien</span>
                  </button>

                  <button
                    onClick={() => setShowAddAbsensiModal(true)}
                    className="p-2.5 bg-white hover:bg-indigo-100/60 border border-indigo-200 rounded-xl text-left text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                    <span>Absen Petugas</span>
                  </button>

                  <button
                    onClick={handleOpenAddObat}
                    className="p-2.5 bg-white hover:bg-amber-100/60 border border-amber-200 rounded-xl text-left text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Pill className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Tambah Obat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('laporan')}
                    className="p-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-left text-xs font-bold text-slate-800 shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                    <span>Cetak Laporan</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CATATAN KUNJUNGAN BEROBAT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'kunjungan' && (
        <div className="space-y-6">
          {/* TOP CONTROLS & FILTER BAR */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-emerald-700" />
                  <span>Daftar Kunjungan Berobat Santri</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Data rekam medis harian pemeriksaan fisik, diagnosis, dan pemberian resep obat santri di Klinik Darul Arifin.
                </p>
              </div>

              <button
                onClick={() => {
                  setFormKunjungan(prev => ({ ...prev, tanggal: todayStr }));
                  setShowFormKunjunganModal(true);
                }}
                className="px-5 py-2.5 bg-nature-forest hover:bg-nature-forest-dark text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-auto"
                id="btn-tambah-kunjungan"
              >
                <Plus className="w-4 h-4 text-nature-gold stroke-[3]" />
                <span>Tambah Catatan Kunjungan</span>
              </button>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama santri, NISN, keluhan, diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600 focus:bg-white"
                />
              </div>

              <div>
                <select
                  value={filterTriage}
                  onChange={(e) => setFilterTriage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="semua">-- Semua Level Triage --</option>
                  <option value="hijau">Hijau (Ringan)</option>
                  <option value="kuning">Kuning (Sedang)</option>
                  <option value="merah">Merah (Darurat)</option>
                </select>
              </div>

              <div>
                <select
                  value={filterStatusIstirahat}
                  onChange={(e) => setFilterStatusIstirahat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
                >
                  <option value="semua">-- Semua Status Istirahat --</option>
                  <option value="Kembali ke Kamar/KBM">Kembali ke Kamar/KBM</option>
                  <option value="Rawat Inap UKS">Rawat Inap UKS</option>
                  <option value="Rujuk Rumah Sakit">Rujuk Rumah Sakit</option>
                  <option value="Izin Pulang Berobat">Izin Pulang Berobat</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABEL DAFTAR KUNJUNGAN */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Tanggal & Jam</th>
                    <th className="p-4">Santri Pasien</th>
                    <th className="p-4">Triage & Tanda Vital</th>
                    <th className="p-4">Keluhan & Diagnosis</th>
                    <th className="p-4">Resep Obat & Terapi</th>
                    <th className="p-4">Status Istirahat</th>
                    <th className="p-4">Petugas</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredKunjunganList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        Tidak ada catatan kunjungan berobat yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredKunjunganList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-4 whitespace-nowrap font-bold text-slate-800">
                          <div>{item.tanggal}</div>
                          <div className="text-[10px] text-slate-500 font-normal flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" /> {item.jam} WIB
                          </div>
                        </td>

                        <td className="p-4">
                          <div className="font-extrabold text-slate-800">{item.namaSantri}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            NISN: {item.nisSantri} | {item.kelas} ({item.kamar})
                          </div>
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.triage.includes('Hijau') ? 'bg-emerald-100 text-emerald-800' :
                            item.triage.includes('Kuning') ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {item.triage}
                          </span>
                          <div className="text-[10px] text-slate-600 font-bold mt-1">
                            Suhu: {item.suhu}°C | TD: {item.tekananDarah}
                          </div>
                        </td>

                        <td className="p-4 max-w-xs">
                          <div className="font-extrabold text-rose-800">{item.diagnosis}</div>
                          <div className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">{item.keluhanUtama}</div>
                        </td>

                        <td className="p-4 max-w-xs">
                          {item.resepObat && item.resepObat.length > 0 ? (
                            <div className="space-y-0.5">
                              {item.resepObat.map((r, idx) => (
                                <div key={idx} className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                                  <Pill className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span>{r.namaObat} ({r.jumlah} {r.satuan})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">Tanpa resep obat</span>
                          )}
                        </td>

                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                            item.statusIstirahat === 'Rawat Inap UKS' ? 'bg-amber-50 text-amber-800 border-amber-300' :
                            item.statusIstirahat === 'Rujuk Rumah Sakit' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                            'bg-emerald-50 text-emerald-800 border-emerald-300'
                          }`}>
                            {item.statusIstirahat}
                          </span>
                        </td>

                        <td className="p-4 whitespace-nowrap text-slate-700 font-bold">
                          {item.petugas}
                        </td>

                        <td className="p-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedKunjunganForSurat(item)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="Cetak Surat Sakit / Rujukan UKS"
                            >
                              <Printer className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan kunjungan berobat ${item.namaSantri}?`)) {
                                  onDeleteKunjungan(item.id);
                                  triggerToast(`Catatan kunjungan ${item.namaSantri} dihapus.`);
                                }
                              }}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Catatan"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REKAM MEDIS PASIEN TAB */}
      {/* ========================================================================= */}
      {activeTab === 'rekam-medis' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-700" />
                  <span>Rekam Medis Santri Darul Arifin</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar riwayat kesehatan, golongan darah, riwayat alergi obat/makanan, dan penyakit kronis santri.
                </p>
              </div>

              <div className="w-full md:w-80 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari santri..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>
          </div>

          {/* GRID KARTU REKAM MEDIS SANTRI */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {santri
              .filter(s => s.nama.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery))
              .map((s) => {
                const medis = rekamMedisList.find(r => r.idSantri === s.id);
                const riwayatSantri = kunjunganList.filter(k => k.idSantri === s.id);
                const kamarObj = kamar.find(k => k.id === s.idKamar);

                return (
                  <div
                    key={s.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 font-black text-lg flex items-center justify-center shrink-0 border border-indigo-200">
                            {s.nama.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-extrabold text-sm text-slate-800">{s.nama}</h3>
                            <span className="text-[10px] text-slate-500 font-bold block">
                              NISN: {s.nis} | Kelas {s.kelas}
                            </span>
                            <span className="text-[10px] text-indigo-700 font-semibold block">
                              {kamarObj ? kamarObj.namaKamar : 'Kamar Utama'}
                            </span>
                          </div>
                        </div>

                        <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-black">
                          GolDarah: {medis ? medis.golonganDarah : 'Belum Tahu'}
                        </span>
                      </div>

                      {/* ALERGI & KRONIS */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                        <div className="flex items-start gap-1.5 text-rose-700 font-semibold">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-600" />
                          <span>
                            Alergi: {medis && medis.riwayatAlergi.length > 0 ? medis.riwayatAlergi.join(', ') : 'Tidak ada'}
                          </span>
                        </div>

                        <div className="flex items-start gap-1.5 text-amber-800 font-semibold">
                          <Heart className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                          <span>
                            Penyakit Kronis: {medis && medis.riwayatPenyakitKronis.length > 0 ? medis.riwayatPenyakitKronis.join(', ') : 'Tidak ada'}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Total Riwayat Berobat:</span>
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-black">
                          {riwayatSantri.length} Kali
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setSelectedSantriForMedis(s)}
                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Rekam Medis</span>
                      </button>

                      <button
                        onClick={() => {
                          const m = rekamMedisList.find(r => r.idSantri === s.id);
                          setFormMedisEdit({
                            idSantri: s.id,
                            golonganDarah: m ? m.golonganDarah : 'Belum Tahu',
                            riwayatAlergiText: m ? m.riwayatAlergi.join(', ') : '',
                            riwayatPenyakitKronisText: m ? m.riwayatPenyakitKronis.join(', ') : '',
                            catatanKhusus: m ? (m.catatanKhusus || '') : '',
                            kontakDaruratOrtu: m ? (m.kontakDaruratOrtu || '') : ''
                          });
                          setShowEditRekamMedisModal(true);
                        }}
                        className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                        title="Edit Profil Kesehatan Santri"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ABSENSI PETUGAS YANG HADIR TAB */}
      {/* ========================================================================= */}
      {activeTab === 'absensi' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-700" />
                  <span>Absensi & Kehadiran Petugas Klinik Jaga</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Pencatatan daftar hadir Dokter Pondok, Perawat, Bidan, Musyrif Kesehatan, dan Tim PMR Santri yang bertugas harian.
                </p>
              </div>

              <button
                onClick={() => setShowAddAbsensiModal(true)}
                className="px-5 py-2.5 bg-nature-forest hover:bg-nature-forest-dark text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <Plus className="w-4 h-4 text-nature-gold stroke-[3]" />
                <span>Catat Absensi Petugas</span>
              </button>
            </div>
          </div>

          {/* TABEL PETUGAS HADIR */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Tanggal</th>
                    <th className="p-4">Nama Petugas Jaga</th>
                    <th className="p-4">Peran & Shift</th>
                    <th className="p-4">Jam Masuk</th>
                    <th className="p-4">Status Kehadiran</th>
                    <th className="p-4">Keterangan / Tugas</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {absensiPetugasList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-bold">
                        Belum ada catatan absensi petugas klinik.
                      </td>
                    </tr>
                  ) : (
                    absensiPetugasList.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 whitespace-nowrap font-bold text-slate-800">
                          {item.tanggal}
                        </td>
                        <td className="p-4 font-extrabold text-slate-800">
                          {item.namaPetugas}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-emerald-800">{item.peran}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">{item.shift}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap font-bold text-slate-700">
                          {item.jamMasuk} WIB
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                            item.status === 'Hadir Jaga' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          {item.keterangan || '-'}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm(`Hapus absensi petugas ${item.namaPetugas}?`)) {
                                onDeleteAbsensiPetugas(item.id);
                                triggerToast('Absensi petugas dihapus.');
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. STOK DAN LOGISTIK OBAT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'stok-obat' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-amber-700" />
                  <span>Stok & Logistik Obat Pos Kesehatan</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Pengelolaan persediaan obat-obatan, vitamin, alat kesehatan, dan tanggal kadaluarsa (expired date).
                </p>
              </div>

              <button
                onClick={handleOpenAddObat}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer flex items-center gap-2 shrink-0"
                id="btn-tambah-obat"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Tambah Master Obat</span>
              </button>
            </div>

            {/* FILTERS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama obat, kode obat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <select
                  value={filterKategoriObat}
                  onChange={(e) => setFilterKategoriObat(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer"
                >
                  <option value="semua">-- Semua Kategori Obat --</option>
                  <option value="Obat Bebas & P3K">Obat Bebas & P3K</option>
                  <option value="Obat Resep / Keras">Obat Resep / Keras</option>
                  <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                  <option value="Salep & Obat Luar">Salep & Obat Luar</option>
                  <option value="Alat Kesehatan & Balut">Alat Kesehatan & Balut</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABEL STOK OBAT */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Kode & Nama Obat</th>
                    <th className="p-4">Kategori</th>
                    <th className="p-4">Stok Sekarang</th>
                    <th className="p-4">Min. Stok</th>
                    <th className="p-4">Status Stok</th>
                    <th className="p-4">Kadaluarsa (ED)</th>
                    <th className="p-4">Lokasi Rak</th>
                    <th className="p-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredStokObatList.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        Belum ada stok obat yang sesuai filter.
                      </td>
                    </tr>
                  ) : (
                    filteredStokObatList.map((o) => {
                      const isKritis = o.stokSekarang <= o.stokMin;
                      return (
                        <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4">
                            <div className="font-black text-slate-800">{o.namaObat}</div>
                            <div className="text-[10px] text-slate-400 font-bold">Kode: {o.kodeObat}</div>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-extrabold border border-slate-200">
                              {o.kategori}
                            </span>
                          </td>

                          <td className="p-4 font-black text-slate-800">
                            <span className="text-sm">{o.stokSekarang}</span> {o.satuan}
                          </td>

                          <td className="p-4 text-slate-500 font-bold">
                            {o.stokMin} {o.satuan}
                          </td>

                          <td className="p-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                              isKritis ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {isKritis ? '⚠️ KRITIS / HABIS' : '✅ AMAN'}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-slate-700 whitespace-nowrap">
                            {o.tanggalKadaluarsa}
                          </td>

                          <td className="p-4 text-slate-600 font-bold">
                            {o.lokasiRak}
                          </td>

                          <td className="p-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditObat(o)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                                title="Edit Obat / Restock"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Hapus obat ${o.namaObat}?`)) {
                                    onDeleteStokObat(o.id);
                                    triggerToast(`Obat ${o.namaObat} dihapus.`);
                                  }
                                }}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. LAPORAN RINGKASAN TAB */}
      {/* ========================================================================= */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700" />
                  <span>Ringkasan Laporan Kesehatan Santri Pondok</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Laporan rekapitulasi kesehatan berkala Klinik Pesantren Darul Arifin untuk Pimpinan dan Pengasuhan.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-2xl shadow transition-all cursor-pointer flex items-center gap-2 self-start md:self-auto shrink-0"
              >
                <Printer className="w-4 h-4 text-nature-gold" />
                <span>Cetak / Export PDF Laporan</span>
              </button>
            </div>

            {/* REPORT SUMMARY CARD */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider block">Total Kunjungan Tercatat</span>
                <span className="font-serif font-black text-2xl text-emerald-950">{kunjunganList.length} Pasien</span>
                <span className="text-[10px] text-emerald-700 font-medium block">Pemeriksaan fisik klinik</span>
              </div>

              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block">Total Rawat Inap UKS</span>
                <span className="font-serif font-black text-2xl text-amber-950">
                  {kunjunganList.filter(k => k.statusIstirahat === 'Rawat Inap UKS').length} Santri
                </span>
                <span className="text-[10px] text-amber-700 font-medium block">Perawatan tempat tidur UKS</span>
              </div>

              <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 space-y-1">
                <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">Rujukan Ke Rumah Sakit</span>
                <span className="font-serif font-black text-2xl text-rose-950">
                  {kunjunganList.filter(k => k.statusIstirahat === 'Rujuk Rumah Sakit').length} Kasus
                </span>
                <span className="text-[10px] text-rose-700 font-medium block">Tindakan darurat medis eksternal</span>
              </div>
            </div>

            {/* PREVIEW KOP LAPORAN RESMI */}
            <div className="bg-slate-50 p-6 md:p-8 rounded-3xl border border-slate-300 space-y-6" id="printable-klinik-report">
              {/* Kop Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-800 pb-4">
                <h3 className="font-serif font-black text-xl text-slate-900 tracking-wide uppercase">KLINIK POS KESEHATAN PESANTREN (POSKESTREN)</h3>
                <h4 className="font-serif font-bold text-md text-emerald-800">PONDOK PESANTREN DARUL ARIFIN</h4>
                <p className="text-[11px] text-slate-600 italic">
                  Jl. Pesantren Darul Arifin No. 01 | Telp: (0741) 889900 | Email: uks@darularifin.sch.id
                </p>
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-black text-sm text-slate-800 uppercase underline tracking-wider">
                  LAPORAN RINGKASAN REKAPITULASI KESEHATAN SANTRI
                </h4>
                <p className="text-xs text-slate-500 font-medium">Periode Laporan: Bulan {new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</p>
              </div>

              {/* Table Ringkasan */}
              <table className="w-full text-left border-collapse border border-slate-300 text-xs">
                <thead>
                  <tr className="bg-slate-200 text-slate-800 font-black">
                    <th className="p-2.5 border border-slate-300">No</th>
                    <th className="p-2.5 border border-slate-300">Kategori Diagnosa Penyakit</th>
                    <th className="p-2.5 border border-slate-300">Jumlah Kasus Santri</th>
                    <th className="p-2.5 border border-slate-300">Persentase</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosaStats.map(([kat, count], idx) => {
                    const total = kunjunganList.length || 1;
                    const pct = Math.round((count / total) * 100);
                    return (
                      <tr key={kat} className="border-b border-slate-300">
                        <td className="p-2.5 border border-slate-300 font-bold">{idx + 1}</td>
                        <td className="p-2.5 border border-slate-300 font-extrabold text-slate-800">{kat}</td>
                        <td className="p-2.5 border border-slate-300 font-bold">{count} Santri</td>
                        <td className="p-2.5 border border-slate-300 font-bold text-emerald-800">{pct}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="pt-8 grid grid-cols-2 text-center text-xs text-slate-800 font-bold">
                <div>
                  <p>Mengetahui,</p>
                  <p className="font-black text-emerald-900 mt-1">Pimpinan / Pengasuh Pondok</p>
                  <div className="h-16" />
                  <p className="underline font-black">( KH. Ahmad Zaki, M.Pd )</p>
                </div>

                <div>
                  <p>Jambi, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  <p className="font-black text-emerald-900 mt-1">Dokter / Penanggung Jawab UKS</p>
                  <div className="h-16" />
                  <p className="underline font-black">( dr. H. Hendra Wijaya )</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: FORM CATAT KUNJUNGAN BEROBAT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showFormKunjunganModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 p-6 md:p-8 space-y-6 my-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-2xl">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-serif font-black text-lg text-slate-800">Form Pemeriksaan Kunjungan Berobat</h3>
                    <p className="text-xs text-slate-500">
                      Poli: <span className="font-bold text-emerald-800">{klinikUnit === 'PUTRA' ? '♂️ UKS Santri Putra' : klinikUnit === 'PUTRI' ? '♀️ UKS Santri Putri' : '🏥 Pos Kesehatan Utama'}</span> — Catat vital sign, diagnosis, dan resep obat.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowFormKunjunganModal(false);
                    setPatientSearchQuery('');
                  }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 cursor-pointer"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitKunjungan} className="space-y-5 text-xs font-bold text-slate-700">
                {/* 1. PILIH SANTRI */}
                <div className="space-y-2 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-extrabold text-slate-800 block">Pilih Santri Pasien *</label>
                    <span className="text-[10px] text-slate-500 font-bold">
                      Unit: {klinikUnit === 'PUTRA' ? 'Santri Putra' : klinikUnit === 'PUTRI' ? 'Santri Putri' : 'Semua'} ({filteredSantriForForm.length} / {santriByUnit.length})
                    </span>
                  </div>

                  {/* Kolom Pencarian Nama Santri */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={patientSearchQuery}
                      onChange={(e) => setPatientSearchQuery(e.target.value)}
                      placeholder="🔍 Cari nama santri, NISN, kelas, atau kamar..."
                      className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                    {patientSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setPatientSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-100 hover:bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                        title="Hapus pencarian"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={formKunjungan.idSantri}
                    onChange={(e) => setFormKunjungan(prev => ({ ...prev, idSantri: e.target.value }))}
                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-emerald-600 cursor-pointer"
                    required
                  >
                    <option value="">
                      {filteredSantriForForm.length === 0 
                        ? `-- Tidak ada santri ditemukan untuk "${patientSearchQuery}" --` 
                        : `-- Pilih Santri Pasien (${filteredSantriForForm.length} Ditemukan) --`}
                    </option>
                    {filteredSantriForForm.map(s => {
                      const kObj = kamar.find(k => k.id === s.idKamar);
                      return (
                        <option key={s.id} value={s.id}>
                          {s.gender === 'Laki-laki' ? '♂️' : '♀️'} {s.nama} (NISN: {s.nis} - Kelas {s.kelas} - {kObj ? kObj.namaKamar : 'Kamar'})
                        </option>
                      );
                    })}
                  </select>

                  {selectedSantriObj && (
                    <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs text-emerald-900 font-extrabold">
                      <span>Pasien Terpilih: {selectedSantriObj.nama} ({selectedSantriObj.gender === 'Laki-laki' ? 'Santri Putra' : 'Santri Putri'})</span>
                      <span className="text-emerald-700">NISN: {selectedSantriObj.nis} | Kelas {selectedSantriObj.kelas}</span>
                    </div>
                  )}
                </div>

                {/* 2. TANGGAL, JAM & TRIAGE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-extrabold">Tanggal Pemeriksaan</label>
                    <input
                      type="date"
                      value={formKunjungan.tanggal}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, tanggal: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Jam (WIB)</label>
                    <input
                      type="text"
                      value={formKunjungan.jam}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, jam: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Level Triage</label>
                    <select
                      value={formKunjungan.triage}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, triage: e.target.value as TriageLevel }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="Hijau (Ringan)">Hijau (Ringan)</option>
                      <option value="Kuning (Sedang)">Kuning (Sedang)</option>
                      <option value="Merah (Darurat)">Merah (Darurat)</option>
                    </select>
                  </div>
                </div>

                {/* 3. VITAL SIGNS: SUHU & TEKANAN DARAH */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <label className="block mb-1 font-extrabold text-slate-800">Suhu Tubuh (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formKunjungan.suhu}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, suhu: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold text-slate-800">Tekanan Darah (Sistol)</label>
                    <input
                      type="number"
                      placeholder="120"
                      value={formKunjungan.sistol}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, sistol: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold text-slate-800">Tekanan Darah (Diastol)</label>
                    <input
                      type="number"
                      placeholder="80"
                      value={formKunjungan.diastol}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, diastol: e.target.value }))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* 4. KELUHAN UTAMA */}
                <div>
                  <label className="block mb-1 font-extrabold">Keluhan Utama & Anamnesa *</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Demam sejak semalam, mual, pusing, batuk dahak..."
                    value={formKunjungan.keluhanUtama}
                    onChange={(e) => setFormKunjungan(prev => ({ ...prev, keluhanUtama: e.target.value }))}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-emerald-600"
                    required
                  />
                </div>

                {/* 5. DIAGNOSIS & KATEGORI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 font-extrabold">Diagnosis Medis *</label>
                    <input
                      type="text"
                      placeholder="Contoh: Febris Akut + ISPA Ringan"
                      value={formKunjungan.diagnosis}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, diagnosis: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Kategori Penyakit</label>
                    <select
                      value={formKunjungan.kategoriDiagnosis}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, kategoriDiagnosis: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="ISPA & Flu">ISPA & Flu</option>
                      <option value="Gangguan Pencernaan / Maag">Gangguan Pencernaan / Maag</option>
                      <option value="Penyakit Kulit / Scabies">Penyakit Kulit / Scabies</option>
                      <option value="Demam & Pusing">Demam & Pusing</option>
                      <option value="Cedera / Fisik">Cedera / Fisik</option>
                      <option value="Mata & Telinga">Mata & Telinga</option>
                      <option value="Lain-lain">Lain-lain</option>
                    </select>
                  </div>
                </div>

                {/* 6. TINDAKAN TERAPI */}
                <div>
                  <label className="block mb-1 font-extrabold">Tindakan & Terapi Medis</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kompres hangat, istirahat bed UKS, pembersihan luka..."
                    value={formKunjungan.tindakanTerapi}
                    onChange={(e) => setFormKunjungan(prev => ({ ...prev, tindakanTerapi: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* 7. RESEP OBAT SECTION */}
                <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
                  <h4 className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                    <Pill className="w-4 h-4 text-emerald-700" />
                    <span>Pemberian Resep Obat (Memotong Stok)</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={tempIdObat}
                      onChange={(e) => setTempIdObat(e.target.value)}
                      className="p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                    >
                      <option value="">-- Pilih Obat dari Stok --</option>
                      {stokObatList.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.namaObat} (Stok: {o.stokSekarang} {o.satuan})
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      placeholder="Jumlah"
                      value={tempJumlahObat}
                      onChange={(e) => setTempJumlahObat(e.target.value)}
                      className="p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                    />

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Aturan Pakai (3x1 sesudah makan)"
                        value={tempAturanPakai}
                        onChange={(e) => setTempAturanPakai(e.target.value)}
                        className="flex-1 p-2 bg-white border border-emerald-300 rounded-xl text-xs font-bold"
                      />
                      <button
                        type="button"
                        onClick={handleAddResepItem}
                        className="px-3 py-2 bg-emerald-700 text-white rounded-xl font-bold cursor-pointer hover:bg-emerald-800 shrink-0"
                      >
                        + Tambah
                      </button>
                    </div>
                  </div>

                  {formKunjungan.resep.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {formKunjungan.resep.map((r, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-xl border border-emerald-200 text-xs">
                          <span>
                            <strong>{r.namaObat}</strong> — {r.jumlah} {r.satuan} ({r.aturanPakai})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveResepItem(idx)}
                            className="text-rose-600 hover:text-rose-800 font-bold"
                          >
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 8. STATUS ISTIRAHAT & PETUGAS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 font-extrabold">Status Istirahat</label>
                    <select
                      value={formKunjungan.statusIstirahat}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, statusIstirahat: e.target.value as StatusIstirahatKlinik }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 cursor-pointer"
                    >
                      <option value="Kembali ke Kamar/KBM">Kembali ke Kamar/KBM</option>
                      <option value="Rawat Inap UKS">Rawat Inap UKS</option>
                      <option value="Rujuk Rumah Sakit">Rujuk Rumah Sakit</option>
                      <option value="Izin Pulang Berobat">Izin Pulang Berobat</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Lama Istirahat (Hari)</label>
                    <input
                      type="number"
                      value={formKunjungan.lamaIstirahatHari}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, lamaIstirahatHari: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-extrabold">Nama Dokter / Petugas *</label>
                    <input
                      type="text"
                      value={formKunjungan.petugas}
                      onChange={(e) => setFormKunjungan(prev => ({ ...prev, petugas: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                      required
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFormKunjunganModal(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-2xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-nature-forest hover:bg-nature-forest-dark text-white font-extrabold rounded-2xl shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-nature-gold" />
                    <span>Simpan Kunjungan</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: STOK OBAT ADD/EDIT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddObatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-black text-lg text-slate-800">
                  {editingObat ? 'Edit Data Master Obat' : 'Tambah Master Obat Baru'}
                </h3>
                <button
                  onClick={() => setShowAddObatModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitObat} className="space-y-4 text-xs font-bold text-slate-700">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Kode Obat</label>
                    <input
                      type="text"
                      value={formObat.kodeObat}
                      onChange={(e) => setFormObat(prev => ({ ...prev, kodeObat: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1">Nama Obat *</label>
                    <input
                      type="text"
                      value={formObat.namaObat}
                      onChange={(e) => setFormObat(prev => ({ ...prev, namaObat: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Kategori Obat</label>
                    <select
                      value={formObat.kategori}
                      onChange={(e) => setFormObat(prev => ({ ...prev, kategori: e.target.value as KategoriObat }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Obat Bebas & P3K">Obat Bebas & P3K</option>
                      <option value="Obat Resep / Keras">Obat Resep / Keras</option>
                      <option value="Vitamin & Suplemen">Vitamin & Suplemen</option>
                      <option value="Salep & Obat Luar">Salep & Obat Luar</option>
                      <option value="Alat Kesehatan & Balut">Alat Kesehatan & Balut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Satuan</label>
                    <select
                      value={formObat.satuan}
                      onChange={(e) => setFormObat(prev => ({ ...prev, satuan: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Botol">Botol</option>
                      <option value="Strip">Strip</option>
                      <option value="Box">Box</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Tube/Salep">Tube/Salep</option>
                      <option value="Roll/Perban">Roll/Perban</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Stok Sekarang</label>
                    <input
                      type="number"
                      value={formObat.stokSekarang}
                      onChange={(e) => setFormObat(prev => ({ ...prev, stokSekarang: Number(e.target.value) }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Batas Minimum Stok</label>
                    <input
                      type="number"
                      value={formObat.stokMin}
                      onChange={(e) => setFormObat(prev => ({ ...prev, stokMin: Number(e.target.value) }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Tanggal Kadaluarsa (ED)</label>
                    <input
                      type="date"
                      value={formObat.tanggalKadaluarsa}
                      onChange={(e) => setFormObat(prev => ({ ...prev, tanggalKadaluarsa: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Lokasi Rak Simpan</label>
                    <input
                      type="text"
                      placeholder="Rak A-01"
                      value={formObat.lokasiRak}
                      onChange={(e) => setFormObat(prev => ({ ...prev, lokasiRak: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddObatModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 text-white rounded-xl font-bold"
                  >
                    Simpan Obat
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 3: ABSENSI PETUGAS ADD */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddAbsensiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-black text-lg text-slate-800">Absensi Petugas Klinik</h3>
                <button onClick={() => setShowAddAbsensiModal(false)} className="text-slate-400">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitAbsensi} className="space-y-3 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Nama Petugas *</label>
                  <input
                    type="text"
                    placeholder="dr. Hendra / Ns. Siti / Musyrif Rahmat"
                    value={formAbsensi.namaPetugas}
                    onChange={(e) => setFormAbsensi(prev => ({ ...prev, namaPetugas: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Peran</label>
                    <select
                      value={formAbsensi.peran}
                      onChange={(e) => setFormAbsensi(prev => ({ ...prev, peran: e.target.value as PeranPetugasKlinik }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Dokter Pondok">Dokter Pondok</option>
                      <option value="Perawat / Bidan">Perawat / Bidan</option>
                      <option value="Musyrif Kesehatan">Musyrif Kesehatan</option>
                      <option value="Tim PMR Santri">Tim PMR Santri</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">Shift Jaga</label>
                    <select
                      value={formAbsensi.shift}
                      onChange={(e) => setFormAbsensi(prev => ({ ...prev, shift: e.target.value as ShiftKlinik }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Pagi (07.00 - 14.00)">Pagi (07.00 - 14.00)</option>
                      <option value="Sore (14.00 - 21.00)">Sore (14.00 - 21.00)</option>
                      <option value="Malam/Mider (21.00 - 07.00)">Malam/Mider (21.00 - 07.00)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1">Jam Masuk</label>
                    <input
                      type="text"
                      value={formAbsensi.jamMasuk}
                      onChange={(e) => setFormAbsensi(prev => ({ ...prev, jamMasuk: e.target.value }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Status</label>
                    <select
                      value={formAbsensi.status}
                      onChange={(e) => setFormAbsensi(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    >
                      <option value="Hadir Jaga">Hadir Jaga</option>
                      <option value="Izin">Izin</option>
                      <option value="Sakit">Sakit</option>
                      <option value="Piket Emergency">Piket Emergency</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1">Keterangan / Tugas</label>
                  <input
                    type="text"
                    value={formAbsensi.keterangan}
                    onChange={(e) => setFormAbsensi(prev => ({ ...prev, keterangan: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowAddAbsensiModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-700 text-white font-bold rounded-xl">Simpan Absensi</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 4: DETAIL REKAM MEDIS SANTRI */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedSantriForMedis && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 md:p-8 space-y-6 my-auto max-h-[90vh] overflow-y-auto"
            >
              {(() => {
                const s = selectedSantriForMedis;
                const m = rekamMedisList.find(r => r.idSantri === s.id);
                const history = kunjunganList.filter(k => k.idSantri === s.id);
                const kamarObj = kamar.find(k => k.id === s.idKamar);

                return (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-900 font-black text-xl flex items-center justify-center border border-indigo-200">
                          {s.nama.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-serif font-black text-lg text-slate-800">{s.nama}</h3>
                          <p className="text-xs text-slate-500 font-medium">
                            NISN: {s.nis} | Kelas {s.kelas} | {kamarObj ? kamarObj.namaKamar : 'Kamar Utama'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedSantriForMedis(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                      >
                        <XCircle className="w-6 h-6" />
                      </button>
                    </div>

                    {/* PROFIL KESEHATAN KARTU */}
                    <div className="grid grid-cols-2 gap-3 bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 text-xs text-indigo-950 font-extrabold">
                      <div>
                        <span>Golongan Darah:</span>
                        <span className="block text-sm font-black text-indigo-900 mt-0.5">{m ? m.golonganDarah : 'Belum Tahu'}</span>
                      </div>
                      <div>
                        <span>Kontak Darurat Wali:</span>
                        <span className="block text-slate-700 mt-0.5">{m && m.kontakDaruratOrtu ? m.kontakDaruratOrtu : s.noHpWali}</span>
                      </div>
                      <div className="col-span-2 pt-2 border-t border-indigo-200/60 text-rose-800">
                        <span>Alergi: {m && m.riwayatAlergi.length > 0 ? m.riwayatAlergi.join(', ') : 'Tidak ada'}</span>
                      </div>
                      <div className="col-span-2 text-amber-800">
                        <span>Penyakit Kronis: {m && m.riwayatPenyakitKronis.length > 0 ? m.riwayatPenyakitKronis.join(', ') : 'Tidak ada'}</span>
                      </div>
                    </div>

                    {/* TIMELINE KRONOLOGIS RIWAYAT BEROBAT */}
                    <div className="space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-600" />
                        <span>Kronologi Riwayat Kunjungan Berobat ({history.length})</span>
                      </h4>

                      {history.length === 0 ? (
                        <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-xl">Belum ada riwayat kunjungan berobat untuk santri ini.</p>
                      ) : (
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                          {history.map((item) => (
                            <div key={item.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs">
                              <div className="flex justify-between items-center font-extrabold">
                                <span className="text-slate-800">{item.tanggal} ({item.jam} WIB)</span>
                                <span className="text-rose-800">Diagnosa: {item.diagnosis}</span>
                              </div>
                              <p className="text-slate-600">Keluhan: {item.keluhanUtama}</p>
                              <div className="text-[11px] text-slate-500 font-semibold">
                                Suhu: {item.suhu}°C | TD: {item.tekananDarah} | Status: {item.statusIstirahat}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 5: SURAT KETERANGAN SAKIT / RUJUKAN CETAK */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {selectedKunjunganForSurat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-black text-lg text-slate-800">Surat Keterangan Sakit / Istirahat UKS</h3>
                <button onClick={() => setSelectedKunjunganForSurat(null)} className="text-slate-400">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* SURAT CONTENT */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-300 space-y-4 text-xs text-slate-800">
                <div className="text-center border-b border-slate-800 pb-2">
                  <h4 className="font-black text-sm uppercase">POS KESEHATAN PESANTREN (POSKESTREN)</h4>
                  <h5 className="font-bold text-emerald-800">PONDOK PESANTREN DARUL ARIFIN</h5>
                </div>

                <div className="text-center font-bold underline">
                  SURAT KETERANGAN ISTIRAHAT KESEHATAN
                </div>

                <p>Yang bertanda tangan di bawah ini menerangkan bahwa:</p>

                <div className="pl-4 space-y-1 font-bold text-slate-900">
                  <p>Nama Santri : {selectedKunjunganForSurat.namaSantri}</p>
                  <p>NISN / Kelas : {selectedKunjunganForSurat.nisSantri} / {selectedKunjunganForSurat.kelas}</p>
                  <p>Kamar Asrama: {selectedKunjunganForSurat.kamar}</p>
                  <p>Diagnosis   : {selectedKunjunganForSurat.diagnosis}</p>
                </div>

                <p>
                  Berdasarkan hasil pemeriksaan medis pada tanggal <strong>{selectedKunjunganForSurat.tanggal}</strong>, santri tersebut dalam kondisi sakit dan diberikan <strong>{selectedKunjunganForSurat.statusIstirahat}</strong> selama <strong>{selectedKunjunganForSurat.lamaIstirahatHari || 1} Hari</strong>.
                </p>

                <div className="pt-6 text-right">
                  <p>Jambi, {selectedKunjunganForSurat.tanggal}</p>
                  <p className="font-bold">Dokter / Tim Kesehatan UKS</p>
                  <div className="h-12" />
                  <p className="font-black underline">( {selectedKunjunganForSurat.petugas} )</p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-nature-forest text-white font-extrabold text-xs rounded-xl shadow cursor-pointer flex items-center gap-2"
                >
                  <Printer className="w-4 h-4 text-nature-gold" />
                  <span>Cetak Surat</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 6: EDIT REKAM MEDIS SANTRI */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showEditRekamMedisModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-serif font-black text-lg text-slate-800">Edit Profil Kesehatan Santri</h3>
                <button onClick={() => setShowEditRekamMedisModal(false)} className="text-slate-400">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitRekamMedis} className="space-y-3 text-xs font-bold text-slate-700">
                <div>
                  <label className="block mb-1">Golongan Darah</label>
                  <select
                    value={formMedisEdit.golonganDarah}
                    onChange={(e) => setFormMedisEdit(prev => ({ ...prev, golonganDarah: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Belum Tahu">Belum Tahu</option>
                    <option value="A">Golongan A</option>
                    <option value="B">Golongan B</option>
                    <option value="AB">Golongan AB</option>
                    <option value="O">Golongan O</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1">Riwayat Alergi (Pisahkan Koma)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Seafood, Udang, Amoxicillin"
                    value={formMedisEdit.riwayatAlergiText}
                    onChange={(e) => setFormMedisEdit(prev => ({ ...prev, riwayatAlergiText: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1">Riwayat Penyakit Kronis (Pisahkan Koma)</label>
                  <input
                    type="text"
                    placeholder="Contoh: Asma, Gastritis, Sinusitis"
                    value={formMedisEdit.riwayatPenyakitKronisText}
                    onChange={(e) => setFormMedisEdit(prev => ({ ...prev, riwayatPenyakitKronisText: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block mb-1">Catatan Khusus Kesehatan</label>
                  <textarea
                    rows={2}
                    placeholder="Catatan khusus dari orang tua / dokter..."
                    value={formMedisEdit.catatanKhusus}
                    onChange={(e) => setFormMedisEdit(prev => ({ ...prev, catatanKhusus: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowEditRekamMedisModal(false)} className="px-4 py-2 bg-slate-100 rounded-xl">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-indigo-700 text-white font-bold rounded-xl">Simpan Profil Medis</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
