import React, { useState, useMemo } from 'react';
import { 
  KaryawanSDM, 
  PenilaianKinerjaSDM, 
  ProgramInovasiLitbang, 
  UnitKerjaSDM, 
  StatusKepegawaian, 
  KategoriKinerjaSDM,
  ItemPenilaianKPI,
  PengasuhGuru
} from '../types';
import { 
  Users, 
  Award, 
  TrendingUp, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Printer, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  BrainCircuit, 
  Briefcase, 
  Building2, 
  Sparkles, 
  X, 
  ChevronRight, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Target, 
  Check, 
  ShieldCheck, 
  GraduationCap, 
  UserCheck, 
  Info, 
  Download,
  Copy,
  Database,
  Layers,
  Settings,
  Terminal,
  Play,
  CheckCircle,
  RefreshCw,
  Sliders,
  Cpu,
  Table as TableIcon,
  Zap,
  BookOpen,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface LitbangSDMProps {
  karyawanList: KaryawanSDM[];
  guruList?: PengasuhGuru[];
  penilaianList: PenilaianKinerjaSDM[];
  programLitbangList: ProgramInovasiLitbang[];
  onSaveKaryawan: (item: KaryawanSDM) => void;
  onDeleteKaryawan: (id: string) => void;
  onSavePenilaian: (item: PenilaianKinerjaSDM) => void;
  onDeletePenilaian: (id: string) => void;
  onSaveProgramLitbang: (item: ProgramInovasiLitbang) => void;
  onDeleteProgramLitbang: (id: string) => void;
  onSyncSDM?: () => void;
  userRole?: string;
  username?: string;
}

export default function LitbangSDM({
  karyawanList,
  guruList = [],
  penilaianList,
  programLitbangList,
  onSaveKaryawan,
  onDeleteKaryawan,
  onSavePenilaian,
  onDeletePenilaian,
  onSaveProgramLitbang,
  onDeleteProgramLitbang,
  onSyncSDM,
  userRole = 'ADMIN',
  username = 'Pengguna'
}: LitbangSDMProps) {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'penilaian' | 'kriteria' | 'karyawan' | 'program' | 'analisis'>('kriteria');

  // State Penilaian Kriteria & Tugas Pokok SDM Pesantren (100 Poin & SKP)
  const [kriteriaSubTab, setKriteriaSubTab] = useState<'bobot-100' | 'multi-source' | 'skp-target' | 'pelanggaran' | 'workload-5level'>('bobot-100');
  
  // Simulator State Ustadz
  const [simUstadzName, setSimUstadzName] = useState('Ustadz Ahmad Fauzan');
  const [simRoles, setSimRoles] = useState<{ guru: boolean; bidang: boolean; musyrif: boolean; struktural: boolean }>({
    guru: true,
    bidang: true,
    musyrif: true,
    struktural: false
  });
  const [simScores, setSimScores] = useState<{ guru: number; bidang: number; musyrif: number; struktural: number }>({
    guru: 88,
    bidang: 90,
    musyrif: 82,
    struktural: 85
  });
  const [selectedBidangKpi, setSelectedBidangKpi] = useState<string>('Bahasa');
  
  // 360 Multi-Source
  const [sim360, setSim360] = useState<{ atasan: number; dataObjektif: number; peer: number; santri: number }>({
    atasan: 88,
    dataObjektif: 92,
    peer: 86,
    santri: 85
  });

  // Pelanggaran Disiplin Log State
  const [pelanggaranList, setPelanggaranList] = useState<Array<{ id: string; tanggal: string; ustadz: string; jenis: string; poin: number; ket: string }>>([
    { id: 'PEL-001', tanggal: '2026-08-01', ustadz: 'Ustadz Ahmad Fauzan', jenis: 'Terlambat Mengajar', poin: -1, ket: 'Terlambat 10 menit di kelas Wustho' },
    { id: 'PEL-002', tanggal: '2026-08-03', ustadz: 'Ustadz Rizky Ramadhan', jenis: 'Tidak Jalankan Piket Kamar', poin: -3, ket: 'Absen ronda malam piket kamar B3' }
  ]);
  const [formPelanggaran, setFormPelanggaran] = useState({
    ustadz: 'Ustadz Ahmad Fauzan',
    jenis: 'Terlambat Mengajar',
    poin: -1,
    ket: ''
  });

  // SKP Target & Realisasi State
  const [skpTargetList, setSkpTargetList] = useState<Array<{ id: string; ustadz: string; tugas: string; target: string; realisasi: string; persen: number; status: 'Tercapai' | 'Dalam Proses' | 'Perlu Perbaikan' }>>([
    { id: 'SKP-01', ustadz: 'Ustadz Ahmad Fauzan', tugas: 'Kehadiran Mengajar Jurnal', target: '≥ 95% Tepat Waktu', realisasi: '98%', persen: 98, status: 'Tercapai' },
    { id: 'SKP-02', ustadz: 'Ustadz Ahmad Fauzan', tugas: 'Pengawasan Program Mufrodat Bahasa', target: '4 Sesi / Bulan', realisasi: '4 Sesi Selesai', persen: 100, status: 'Tercapai' },
    { id: 'SKP-03', ustadz: 'Ustadz Ahmad Fauzan', tugas: 'Pemeriksaan & Kebersihan Kamar Santri', target: 'Kebersihan ≥ 90%', realisasi: '88%', persen: 88, status: 'Dalam Proses' },
    { id: 'SKP-04', ustadz: 'Ustadz Ahmad Fauzan', tugas: 'Penanganan Masalah Santri (Follow-up)', target: 'Maks 1x24 Jam', realisasi: 'Selesai 100%', persen: 100, status: 'Tercapai' }
  ]);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState<string>('SEMUA');
  const [selectedKategoriFilter, setSelectedKategoriFilter] = useState<string>('SEMUA');
  const [selectedPeriodeFilter, setSelectedPeriodeFilter] = useState<string>('SEMUA');

  // Modals
  const [isModalPenilaianOpen, setIsModalPenilaianOpen] = useState(false);
  const [editingPenilaian, setEditingPenilaian] = useState<PenilaianKinerjaSDM | null>(null);

  const [isModalKaryawanOpen, setIsModalKaryawanOpen] = useState(false);
  const [editingKaryawan, setEditingKaryawan] = useState<KaryawanSDM | null>(null);

  const [isModalProgramOpen, setIsModalProgramOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramInovasiLitbang | null>(null);

  const [detailPenilaianView, setDetailPenilaianView] = useState<PenilaianKinerjaSDM | null>(null);

  // Form State: Penilaian Kinerja
  const [formPenilaian, setFormPenilaian] = useState<{
    idKaryawan: string;
    periode: string;
    tanggalPenilaian: string;
    penilaiNama: string;
    itemsKPI: ItemPenilaianKPI[];
    skorKedisiplinanPresensi: number;
    skorAkhlakAdabPesantren: number;
    skorKompetensiPengasuhanPedagogik: number;
    skorInovasiRisetLitbang: number;
    skorPelayananSantriOrtu: number;
    rekomendasiLitbang: string;
    statusApproval: 'Draft' | 'Terverifikasi Litbang' | 'Disetujui Mudir';
    catatanMudir: string;
  }>({
    idKaryawan: '',
    periode: 'Semester Ganjil 2025/2026',
    tanggalPenilaian: new Date().toISOString().split('T')[0],
    penilaiNama: username || 'Ustadz Tim Litbang & SDM',
    itemsKPI: [
      { id: 'kpi-1', kpiName: 'Target Kinerja Utama & Kurikulum Unit', bobotPercent: 30, target: '90% Ketuntasan Target', pencapaianActual: '92% Tercapai', skorActual: 90, catatan: '' },
      { id: 'kpi-2', kpiName: 'Kedisiplinan Presensi & Ketepatan Laporan', bobotPercent: 20, target: '100% Tepat Waktu', pencapaianActual: '98% Tepat Waktu', skorActual: 95, catatan: '' },
      { id: 'kpi-3', kpiName: 'Inovasi & Kontribusi Litbang Pesantren', bobotPercent: 20, target: 'Min 1 Inovasi/Semester', pencapaianActual: '1 Program Dibuat', skorActual: 88, catatan: '' },
      { id: 'kpi-4', kpiName: 'Pengayoman Santri & Layanan Wali Santri', bobotPercent: 30, target: 'Nihil Keluhan & Respons Cepat', pencapaianActual: 'Sangat Baik', skorActual: 92, catatan: '' }
    ],
    skorKedisiplinanPresensi: 92,
    skorAkhlakAdabPesantren: 95,
    skorKompetensiPengasuhanPedagogik: 90,
    skorInovasiRisetLitbang: 88,
    skorPelayananSantriOrtu: 92,
    rekomendasiLitbang: 'Tingkatkan inovasi pembelajaran dan konsistensi pendampingan santri.',
    statusApproval: 'Draft',
    catatanMudir: ''
  });

  // Form State: Karyawan SDM
  const [formKaryawan, setFormKaryawan] = useState<Omit<KaryawanSDM, 'id'>>({
    nipKaryawan: `SDM-${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
    nama: '',
    gender: 'Laki-laki',
    jabatan: 'Musyrif / Pengajar',
    unitKerja: 'Pengasuhan Santri & Asrama',
    statusKepegawaian: 'Tetap',
    noHp: '',
    email: '',
    pendidikanTerakhir: 'S1 Pendidikan Islam',
    tanggalBergabung: new Date().toISOString().split('T')[0],
    catatanApresiasi: ''
  });

  // Form State: Program Litbang
  const [formProgram, setFormProgram] = useState<Omit<ProgramInovasiLitbang, 'id'>>({
    judulProgram: '',
    unitTujuan: 'Litbang, Kurikulum & SDM',
    penanggungJawab: '',
    targetOutput: '',
    progressPercent: 10,
    status: 'Perencanaan',
    tanggalMulai: new Date().toISOString().split('T')[0],
    tanggalSelesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    anggaranEst: 5000000,
    keterangan: ''
  });

  // Calculated Stats
  const totalEmployees = karyawanList.length;
  const totalEvaluations = penilaianList.length;
  
  const avgOverallScore = useMemo(() => {
    if (penilaianList.length === 0) return 0;
    const sum = penilaianList.reduce((acc, curr) => acc + curr.totalSkorFinal, 0);
    return Math.round((sum / penilaianList.length) * 10) / 10;
  }, [penilaianList]);

  const countCategoryA = penilaianList.filter(p => p.kategoriKinerja.startsWith('Sangat Baik')).length;
  const countCategoryB = penilaianList.filter(p => p.kategoriKinerja.startsWith('Baik')).length;
  const countCategoryC = penilaianList.filter(p => p.kategoriKinerja.startsWith('Cukup')).length;
  const countCategoryD = penilaianList.filter(p => p.kategoriKinerja.startsWith('Perlu Pembinaan')).length;

  const totalProgramsRunning = programLitbangList.filter(p => p.status === 'Sedang Berjalan').length;

  // Filtered Penilaian List
  const filteredPenilaian = useMemo(() => {
    return penilaianList.filter(p => {
      const matchSearch = p.namaKaryawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.nipKaryawan.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.jabatan.toLowerCase().includes(searchQuery.toLowerCase());
      const matchUnit = selectedUnitFilter === 'SEMUA' || p.unitKerja === selectedUnitFilter;
      const matchKategori = selectedKategoriFilter === 'SEMUA' || p.kategoriKinerja === selectedKategoriFilter;
      const matchPeriode = selectedPeriodeFilter === 'SEMUA' || p.periode === selectedPeriodeFilter;
      return matchSearch && matchUnit && matchKategori && matchPeriode;
    });
  }, [penilaianList, searchQuery, selectedUnitFilter, selectedKategoriFilter, selectedPeriodeFilter]);

  // Unique Periode List
  const availablePeriodes = useMemo(() => {
    const setP = new Set(penilaianList.map(p => p.periode));
    return Array.from(setP);
  }, [penilaianList]);

  // Handlers for Penilaian
  const handleOpenAddPenilaian = () => {
    setEditingPenilaian(null);
    if (karyawanList.length > 0) {
      setFormPenilaian(prev => ({
        ...prev,
        idKaryawan: karyawanList[0].id
      }));
    }
    setIsModalPenilaianOpen(true);
  };

  const handleOpenEditPenilaian = (p: PenilaianKinerjaSDM) => {
    setEditingPenilaian(p);
    setFormPenilaian({
      idKaryawan: p.idKaryawan,
      periode: p.periode,
      tanggalPenilaian: p.tanggalPenilaian,
      penilaiNama: p.penilaiNama,
      itemsKPI: p.itemsKPI || [],
      skorKedisiplinanPresensi: p.skorKedisiplinanPresensi,
      skorAkhlakAdabPesantren: p.skorAkhlakAdabPesantren,
      skorKompetensiPengasuhanPedagogik: p.skorKompetensiPengasuhanPedagogik,
      skorInovasiRisetLitbang: p.skorInovasiRisetLitbang,
      skorPelayananSantriOrtu: p.skorPelayananSantriOrtu,
      rekomendasiLitbang: p.rekomendasiLitbang,
      statusApproval: p.statusApproval,
      catatanMudir: p.catatanMudir || ''
    });
    setIsModalPenilaianOpen(true);
  };

  // KPI Calculations inside Form
  const calculatedKPI = useMemo(() => {
    if (!formPenilaian.itemsKPI || formPenilaian.itemsKPI.length === 0) return 0;
    let totalWeight = 0;
    let weightedScoreSum = 0;
    formPenilaian.itemsKPI.forEach(kpi => {
      const w = Number(kpi.bobotPercent) || 0;
      const s = Number(kpi.skorActual) || 0;
      totalWeight += w;
      weightedScoreSum += (s * w) / 100;
    });
    // Normalization if weights don't sum to 100
    if (totalWeight > 0 && totalWeight !== 100) {
      return Math.round((weightedScoreSum * (100 / totalWeight)) * 10) / 10;
    }
    return Math.round(weightedScoreSum * 10) / 10;
  }, [formPenilaian.itemsKPI]);

  const calculatedFinalScore = useMemo(() => {
    // Weight breakdown:
    // KPI (50%), Kedisiplinan (15%), Akhlak (15%), Kompetensi (10%), Inovasi (10%)
    const kpiPart = calculatedKPI * 0.50;
    const disPart = (formPenilaian.skorKedisiplinanPresensi || 0) * 0.15;
    const akhlakPart = (formPenilaian.skorAkhlakAdabPesantren || 0) * 0.15;
    const komPart = (formPenilaian.skorKompetensiPengasuhanPedagogik || 0) * 0.10;
    const inoPart = (formPenilaian.skorInovasiRisetLitbang || 0) * 0.10;

    const finalSum = kpiPart + disPart + akhlakPart + komPart + inoPart;
    return Math.round(finalSum * 10) / 10;
  }, [calculatedKPI, formPenilaian]);

  const calculatedKategori = useMemo((): KategoriKinerjaSDM => {
    const s = calculatedFinalScore;
    if (s >= 90) return 'Sangat Baik (A)';
    if (s >= 80) return 'Baik (B)';
    if (s >= 70) return 'Cukup (C)';
    return 'Perlu Pembinaan (D)';
  }, [calculatedFinalScore]);

  const handleSaveFormPenilaianSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = karyawanList.find(k => k.id === formPenilaian.idKaryawan);
    if (!emp) {
      alert('Silakan pilih Karyawan / SDM terlebih dahulu.');
      return;
    }

    const payload: PenilaianKinerjaSDM = {
      id: editingPenilaian ? editingPenilaian.id : `eval-${Date.now()}`,
      idKaryawan: emp.id,
      nipKaryawan: emp.nipKaryawan,
      namaKaryawan: emp.nama,
      jabatan: emp.jabatan,
      unitKerja: emp.unitKerja,
      periode: formPenilaian.periode,
      tanggalPenilaian: formPenilaian.tanggalPenilaian,
      penilaiNama: formPenilaian.penilaiNama,
      itemsKPI: formPenilaian.itemsKPI,
      skorTotalKPI: calculatedKPI,
      skorKedisiplinanPresensi: Number(formPenilaian.skorKedisiplinanPresensi),
      skorAkhlakAdabPesantren: Number(formPenilaian.skorAkhlakAdabPesantren),
      skorKompetensiPengasuhanPedagogik: Number(formPenilaian.skorKompetensiPengasuhanPedagogik),
      skorInovasiRisetLitbang: Number(formPenilaian.skorInovasiRisetLitbang),
      skorPelayananSantriOrtu: Number(formPenilaian.skorPelayananSantriOrtu),
      totalSkorFinal: calculatedFinalScore,
      kategoriKinerja: calculatedKategori,
      rekomendasiLitbang: formPenilaian.rekomendasiLitbang,
      statusApproval: formPenilaian.statusApproval,
      catatanMudir: formPenilaian.catatanMudir
    };

    onSavePenilaian(payload);
    setIsModalPenilaianOpen(false);
  };

  // PDF Exporter for Rapor SDM
  const handleExportPdfRapor = (p: PenilaianKinerjaSDM) => {
    const doc = new jsPDF();

    // Background header band
    doc.setFillColor(15, 76, 58); // Emerald Green
    doc.rect(0, 0, 210, 32, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('PONDOK PESANTREN DARUL ARIFIN', 105, 12, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LEMBAGA PENELITIAN, PENGEMBANGAN & SDM (LITBANG PESANTREN)', 105, 18, { align: 'center' });
    doc.setFontSize(8);
    doc.text('RAPOR EVALUASI KINERJA KARYAWAN & SDM PESANTREN (KPI SCORECARD)', 105, 24, { align: 'center' });

    // Accent line
    doc.setDrawColor(212, 175, 55); // Gold
    doc.setLineWidth(1);
    doc.line(10, 34, 200, 34);

    // Profile Box
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text('BIODATA & PROFIL KEPEGAWAIAN', 14, 42);

    doc.setFont('helvetica', 'normal');
    doc.text(`NIP Karyawan    : ${p.nipKaryawan}`, 14, 48);
    doc.text(`Nama Lengkap   : ${p.namaKaryawan}`, 14, 54);
    doc.text(`Jabatan / Peran  : ${p.jabatan}`, 14, 60);
    doc.text(`Unit Kerja SDM   : ${p.unitKerja}`, 14, 66);

    doc.text(`Periode Penilaian : ${p.periode}`, 120, 48);
    doc.text(`Tanggal Evaluasi : ${p.tanggalPenilaian}`, 120, 54);
    doc.text(`Penilai / Assessor : ${p.penilaiNama}`, 120, 60);
    doc.text(`Status Verifikasi : ${p.statusApproval}`, 120, 66);

    // Box Score Highlight
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 72, 182, 18, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(15, 76, 58);
    doc.text(`SKOR AKHIR KINERJA: ${p.totalSkorFinal} / 100`, 20, 83);
    doc.text(`GRADE / KATEGORI: ${p.kategoriKinerja}`, 105, 83);

    // KPI Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. CAPAIAN INDIKATOR KINERJA UTAMA (KEY PERFORMANCE INDICATORS / KPI)', 14, 98);

    const kpiRows = (p.itemsKPI || []).map((k, i) => [
      (i + 1).toString(),
      k.kpiName,
      `${k.bobotPercent}%`,
      k.target,
      k.pencapaianActual,
      `${k.skorActual} / 100`,
      k.catatan || '-'
    ]);

    autoTable(doc, {
      startY: 102,
      head: [['No', 'Indikator KPI SDM', 'Bobot', 'Target Minimal', 'Pencapaian Realisasi', 'Skor', 'Catatan Evaluator']],
      body: kpiRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 76, 58], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 15, halign: 'center' },
        3: { cellWidth: 32 },
        4: { cellWidth: 30 },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 25 }
      }
    });

    // Competencies Table
    const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 150;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('2. EVALUASI ASPEK KOMPETENSI, AKHLAK & KEDISIPLINAN PESANTREN', 14, finalY);

    const compRows = [
      ['Kedisiplinan Presensi & Ketepatan Jam Kerja/Piket', '15%', `${p.skorKedisiplinanPresensi} / 100`],
      ['Akhlak, Adab & Keteladanan Sunnah Pesantren', '15%', `${p.skorAkhlakAdabPesantren} / 100`],
      ['Kompetensi Pengasuhan / Pedagogik & Bimbingan Santri', '10%', `${p.skorKompetensiPengasuhanPedagogik} / 100`],
      ['Inovasi, Riset & Partisipasi Program Litbang', '10%', `${p.skorInovasiRisetLitbang} / 100`],
      ['Pelayanan Santri & Komunikasi Orang Tua / Wali', '10%', `${p.skorPelayananSantriOrtu} / 100`]
    ];

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Aspek Evaluasi Core Values', 'Bobot Penilaian', 'Skor Capaian']],
      body: compRows,
      theme: 'grid',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 32, halign: 'center' }
      }
    });

    const finalY2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : finalY + 45;

    // Recommendations & Signatures
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('CATATAN REKOMENDASI TIM LITBANG & SDM:', 14, finalY2);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.text(`"${p.rekomendasiLitbang}"`, 14, finalY2 + 5, { maxWidth: 180 });

    // Tanda Tangan Block
    const sigY = finalY2 + 22;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);

    doc.text('Dibuat oleh Assessor Litbang,', 30, sigY);
    doc.text('Disetujui oleh Mudir Pesantren,', 140, sigY);

    doc.setFont('helvetica', 'bold');
    doc.text(`( ${p.penilaiNama.split('(')[0]} )`, 25, sigY + 22);
    doc.text('( K.H. Ahmad Dahlan, Lc., M.A. )', 135, sigY + 22);

    doc.save(`Rapor_Kinerja_SDM_${p.nipKaryawan}_${p.namaKaryawan.replace(/\s+/g, '_')}.pdf`);
  };

  // Handlers for Karyawan
  const handleOpenAddKaryawan = () => {
    setEditingKaryawan(null);
    setFormKaryawan({
      nipKaryawan: `SDM-${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
      nama: '',
      gender: 'Laki-laki',
      jabatan: 'Musyrif / Pengajar',
      unitKerja: 'Pengasuhan Santri & Asrama',
      statusKepegawaian: 'Tetap',
      noHp: '',
      email: '',
      pendidikanTerakhir: 'S1 Pendidikan Islam',
      tanggalBergabung: new Date().toISOString().split('T')[0],
      catatanApresiasi: ''
    });
    setIsModalKaryawanOpen(true);
  };

  const handleOpenEditKaryawan = (k: KaryawanSDM) => {
    setEditingKaryawan(k);
    setFormKaryawan({
      nipKaryawan: k.nipKaryawan,
      nama: k.nama,
      gender: k.gender,
      jabatan: k.jabatan,
      unitKerja: k.unitKerja,
      statusKepegawaian: k.statusKepegawaian,
      noHp: k.noHp,
      email: k.email || '',
      pendidikanTerakhir: k.pendidikanTerakhir,
      tanggalBergabung: k.tanggalBergabung,
      catatanApresiasi: k.catatanApresiasi || ''
    });
    setIsModalKaryawanOpen(true);
  };

  const handleSaveFormKaryawanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKaryawan.nama.trim()) {
      alert('Nama karyawan tidak boleh kosong.');
      return;
    }
    const payload: KaryawanSDM = {
      id: editingKaryawan ? editingKaryawan.id : `emp-${Date.now()}`,
      ...formKaryawan
    };
    onSaveKaryawan(payload);
    setIsModalKaryawanOpen(false);
  };

  // Handlers for Program Litbang
  const handleOpenAddProgram = () => {
    setEditingProgram(null);
    setFormProgram({
      judulProgram: '',
      unitTujuan: 'Litbang, Kurikulum & SDM',
      penanggungJawab: username || 'Ustadz Tim Litbang',
      targetOutput: '',
      progressPercent: 10,
      status: 'Perencanaan',
      tanggalMulai: new Date().toISOString().split('T')[0],
      tanggalSelesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      anggaranEst: 5000000,
      keterangan: ''
    });
    setIsModalProgramOpen(true);
  };

  const handleSaveProgramSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProgram.judulProgram.trim()) {
      alert('Judul program tidak boleh kosong.');
      return;
    }
    const payload: ProgramInovasiLitbang = {
      id: editingProgram ? editingProgram.id : `prog-${Date.now()}`,
      ...formProgram
    };
    onSaveProgramLitbang(payload);
    setIsModalProgramOpen(false);
  };

  // Recharts Chart Data Prepared
  const barChartUnitPerformanceData = useMemo(() => {
    const units: UnitKerjaSDM[] = [
      'Pengasuhan Santri & Asrama',
      'Madrasah Diniyah & Tahfizh',
      'Sekolah Formal (SMP/SMA/MA)',
      'Administrasi, Keuangan & Humas',
      'Sarana Prasarana & Keamanan',
      'Litbang, Kurikulum & SDM'
    ];

    return units.map(u => {
      const items = penilaianList.filter(p => p.unitKerja === u);
      const avg = items.length > 0 
        ? Math.round((items.reduce((sum, curr) => sum + curr.totalSkorFinal, 0) / items.length) * 10) / 10
        : 0;
      return {
        unit: u.split(' ')[0] + ' ' + (u.split(' ')[1] || ''),
        fullUnit: u,
        skorAverage: avg,
        totalSDM: karyawanList.filter(k => k.unitKerja === u).length
      };
    });
  }, [penilaianList, karyawanList]);

  const pieChartCategoryData = [
    { name: 'Sangat Baik (A)', value: countCategoryA, color: '#10b981' },
    { name: 'Baik (B)', value: countCategoryB, color: '#3b82f6' },
    { name: 'Cukup (C)', value: countCategoryC, color: '#f59e0b' },
    { name: 'Perlu Pembinaan (D)', value: countCategoryD, color: '#ef4444' }
  ];

  const radarCompetencyData = useMemo(() => {
    if (penilaianList.length === 0) {
      return [
        { aspect: 'Kedisiplinan', score: 85 },
        { aspect: 'Akhlak & Adab', score: 90 },
        { aspect: 'Pedagogik', score: 88 },
        { aspect: 'Litbang & Inovasi', score: 82 },
        { aspect: 'Layanan Wali', score: 89 }
      ];
    }
    const sumDis = penilaianList.reduce((a, b) => a + b.skorKedisiplinanPresensi, 0);
    const sumAkh = penilaianList.reduce((a, b) => a + b.skorAkhlakAdabPesantren, 0);
    const sumPed = penilaianList.reduce((a, b) => a + b.skorKompetensiPengasuhanPedagogik, 0);
    const sumIno = penilaianList.reduce((a, b) => a + b.skorInovasiRisetLitbang, 0);
    const sumLay = penilaianList.reduce((a, b) => a + b.skorPelayananSantriOrtu, 0);
    const count = penilaianList.length;

    return [
      { aspect: 'Kedisiplinan', score: Math.round(sumDis / count) },
      { aspect: 'Akhlak & Adab', score: Math.round(sumAkh / count) },
      { aspect: 'Pedagogik', score: Math.round(sumPed / count) },
      { aspect: 'Litbang & Inovasi', score: Math.round(sumIno / count) },
      { aspect: 'Layanan Wali', score: Math.round(sumLay / count) }
    ];
  }, [penilaianList]);

  return (
    <div className="space-y-6 pb-12" id="litbang-sdm-module">
      
      {/* Module Banner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl border border-emerald-800/80 shadow-xl relative overflow-hidden">
        {/* Islamic Ornament Geometric Circles Background */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-nature-gold/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-nature-gold/20 text-nature-gold border border-nature-gold/30 rounded-full text-xs font-black uppercase tracking-widest">
              <BrainCircuit className="w-3.5 h-3.5" /> LITBANG & SDM CENTER
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-black tracking-tight text-white">
              Sistem Penilaian Kinerja Karyawan & SDM Pesantren
            </h1>
            <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed font-medium">
              Manajemen capaian KPI (Key Performance Indicator), evaluasi 360° kompetensi pengasuhan, kedisiplinan, akhlak adab, serta program riset & pengembangan SDM Pondok Pesantren Darul Arifin.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {onSyncSDM && (
              <button
                onClick={onSyncSDM}
                className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl border border-emerald-500/50 transition-all flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
                title="Sinkronkan data Pengasuh & Guru dengan SDM Litbang"
              >
                <BrainCircuit className="w-4 h-4 text-nature-gold animate-pulse" />
                Sinkron Guru ({guruList.length})
              </button>
            )}
            <button
              onClick={handleOpenAddPenilaian}
              className="px-4 py-2.5 bg-nature-gold hover:bg-amber-400 text-emerald-950 font-black text-xs rounded-xl shadow-lg hover:shadow-nature-gold/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Input Penilaian Kinerja
            </button>
            <button
              onClick={handleOpenAddKaryawan}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-nature-gold" /> Data SDM Baru
            </button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total SDM Pesantren</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalEmployees}</span>
            <span className="text-[10px] text-slate-500 font-medium">Karyawan & Guru</span>
          </div>
          <p className="text-[11px] text-slate-500">Terdaftar di 6 Unit Kerja Utama</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Rata-rata Skor Kinerja</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-600">{avgOverallScore}</span>
            <span className="text-[10px] text-slate-500 font-medium">/ 100 Skor Final</span>
          </div>
          <p className="text-[11px] text-slate-500">Hasil Evaluasi {totalEvaluations} Dokumen</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Kategori Unggul (A & B)</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{countCategoryA + countCategoryB}</span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {totalEvaluations > 0 ? Math.round(((countCategoryA + countCategoryB) / totalEvaluations) * 100) : 0}% SDM
            </span>
          </div>
          <p className="text-[11px] text-slate-500">Sangat Baik ({countCategoryA}) & Baik ({countCategoryB})</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Inovasi Litbang Aktif</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{totalProgramsRunning}</span>
            <span className="text-[10px] text-slate-500 font-medium">Program Riset</span>
          </div>
          <p className="text-[11px] text-slate-500">Total {programLitbangList.length} Program Litbang SDM</p>
        </div>
      </div>

      {/* Main Tabs Segment */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        
        {/* Navigation Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-4 pt-3 overflow-x-auto no-scrollbar gap-2">
          <button
            onClick={() => setActiveTab('penilaian')}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'penilaian'
                ? 'bg-white text-emerald-950 border-slate-200 border-b-white shadow-xs font-black'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-600" />
            <span>Matriks Penilaian KPI & Kinerja</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-extrabold">
              {penilaianList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('kriteria')}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'kriteria'
                ? 'bg-white text-emerald-950 border-slate-200 border-b-white shadow-xs font-black'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>Penilaian Kriteria & SKP Tugas Pokok</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
              100 Poin & SKP
            </span>
          </button>

          <button
            onClick={() => setActiveTab('karyawan')}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'karyawan'
                ? 'bg-white text-emerald-950 border-slate-200 border-b-white shadow-xs font-black'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <Users className="w-4 h-4 text-blue-600" />
            <span>Data Induk SDM & Karyawan</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-800 font-extrabold">
              {karyawanList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('program')}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'program'
                ? 'bg-white text-emerald-950 border-slate-200 border-b-white shadow-xs font-black'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <BrainCircuit className="w-4 h-4 text-amber-600" />
            <span>Program Riset & Inovasi Litbang</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-extrabold">
              {programLitbangList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analisis')}
            className={`px-4 py-3 text-xs font-extrabold rounded-t-2xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'analisis'
                ? 'bg-white text-emerald-950 border-slate-200 border-b-white shadow-xs font-black'
                : 'text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-600" />
            <span>Analisis & Radar Kinerja Unit</span>
          </button>
        </div>

        {/* TAB KRITERIA: PENILAIAN KRITERIA & SKP TUGAS POKOK SDM PESANTREN */}
        {activeTab === 'kriteria' && (
          <div className="p-6 space-y-6">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800/80 shadow-md space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
                    <Award className="w-3.5 h-3.5 text-nature-gold" /> KERANGKA MANAJEMEN KINERJA SDM PESANTREN
                  </div>
                  <h3 className="text-xl font-serif font-black text-white">
                    Sistem Penilaian Kriteria & SKP Tugas Pokok SDM Pesantren
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium max-w-3xl">
                    Sistem evaluasi berkeadilan 100 poin dengan <strong>Normalisasi Bobot Dinamis</strong>, <strong>Multi-Source Assessment 360°</strong>, <strong>Target SKP Bulanan</strong>, dan <strong>Indeks Beban Tugas Multi-Amanah</strong> untuk Ustadz/Ustadzah Pesantren.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className="px-3 py-2 bg-white/10 text-emerald-200 border border-white/20 font-mono text-xs rounded-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-nature-gold" />
                    <span>Integritas & Akhlak: <strong>Syarat Mutlak</strong></span>
                  </span>
                </div>
              </div>

              {/* 5 Prinsip Dasar Badge Row */}
              <div className="pt-3 border-t border-emerald-800/60 grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-nature-gold font-bold block text-[10px] uppercase">1. ADIL</span>
                  <span className="text-[11px] text-slate-200 font-medium">Sesuai tugas & amanah</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-nature-gold font-bold block text-[10px] uppercase">2. TERUKUR</span>
                  <span className="text-[11px] text-slate-200 font-medium">Indikator angka jelas</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-nature-gold font-bold block text-[10px] uppercase">3. BERBASIS BUKTI</span>
                  <span className="text-[11px] text-slate-200 font-medium">Bukan asumsi / suka-suka</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-nature-gold font-bold block text-[10px] uppercase">4. PERIODIK</span>
                  <span className="text-[11px] text-slate-200 font-medium">Bulanan, rekap semester</span>
                </div>
                <div className="p-2.5 bg-white/5 rounded-xl border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-nature-gold font-bold block text-[10px] uppercase">5. PEMBINAAN</span>
                  <span className="text-[11px] text-slate-200 font-medium">Meningkatkan kualitas SDM</span>
                </div>
              </div>
            </div>

            {/* Navigation Sub-Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 p-2 rounded-2xl gap-2 overflow-x-auto no-scrollbar text-xs font-extrabold">
              <button
                onClick={() => setKriteriaSubTab('bobot-100')}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  kriteriaSubTab === 'bobot-100'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>1. Bobot 100 Poin & Normalisasi</span>
              </button>

              <button
                onClick={() => setKriteriaSubTab('multi-source')}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  kriteriaSubTab === 'multi-source'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>2. Multi-Source 360° & Skala 1-5</span>
              </button>

              <button
                onClick={() => setKriteriaSubTab('skp-target')}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  kriteriaSubTab === 'skp-target'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>3. SKP Target & Realisasi</span>
              </button>

              <button
                onClick={() => setKriteriaSubTab('pelanggaran')}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  kriteriaSubTab === 'pelanggaran'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>4. Pelanggaran Disiplin & Poin</span>
              </button>

              <button
                onClick={() => setKriteriaSubTab('workload-5level')}
                className={`px-3.5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
                  kriteriaSubTab === 'workload-5level'
                    ? 'bg-emerald-800 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>5. Indeks Beban & 5 Level System</span>
              </button>
            </div>

            {/* SUB-TAB 1: BOBOT 100 POIN & NORMALISASI DINAMIS */}
            {kriteriaSubTab === 'bobot-100' && (
              <div className="space-y-6">
                
                {/* 4 Komponen Utama Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Komponen A */}
                  <div className="p-5 bg-white border border-emerald-200 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                    <div className="w-2 h-full bg-emerald-600 absolute left-0 top-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        KOMPONEN A (UTAMA)
                      </span>
                      <span className="text-xl font-black text-emerald-950">40%</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">A. Kinerja Guru / Mengajar</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Mengukur kehadiran mengajar, kelengkapan RPP/modul, pengelolaan kelas, dan evaluasi santri.
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium border-t border-slate-100 pt-2">
                      <li className="flex justify-between"><span>Kehadiran Mengajar</span><strong className="text-slate-900">10%</strong></li>
                      <li className="flex justify-between"><span>Persiapan & Perangkat</span><strong className="text-slate-900">5%</strong></li>
                      <li className="flex justify-between"><span>Pelaksanaan Pembelajaran</span><strong className="text-slate-900">10%</strong></li>
                      <li className="flex justify-between"><span>Penguasaan Materi</span><strong className="text-slate-900">5%</strong></li>
                      <li className="flex justify-between"><span>Pengelolaan Kelas</span><strong className="text-slate-900">5%</strong></li>
                      <li className="flex justify-between"><span>Evaluasi & Nilai Siswa</span><strong className="text-slate-900">3%</strong></li>
                      <li className="flex justify-between"><span>Administrasi Pembelajaran</span><strong className="text-slate-900">2%</strong></li>
                    </ul>
                  </div>

                  {/* Komponen B */}
                  <div className="p-5 bg-white border border-blue-200 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                    <div className="w-2 h-full bg-blue-600 absolute left-0 top-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                        KOMPONEN B
                      </span>
                      <span className="text-xl font-black text-blue-950">20%</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">B. Tugas Bidang Pondok</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Amanah operasional di unit khusus (Bahasa, Kebersihan, Dapur, Kesehatan, Tahfidz, dll).
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium border-t border-slate-100 pt-2">
                      <li className="flex justify-between"><span>Kehadiran & Kedisiplinan</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Pelaksanaan Program Kerja</span><strong className="text-slate-900">5%</strong></li>
                      <li className="flex justify-between"><span>Tanggung Jawab Operasional</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Hasil / Capaian Bidang</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Administrasi / Laporan</span><strong className="text-slate-900">2%</strong></li>
                      <li className="flex justify-between"><span>Kerja sama Tim</span><strong className="text-slate-900">1%</strong></li>
                    </ul>
                  </div>

                  {/* Komponen C */}
                  <div className="p-5 bg-white border border-amber-200 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                    <div className="w-2 h-full bg-amber-500 absolute left-0 top-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        KOMPONEN C
                      </span>
                      <span className="text-xl font-black text-amber-950">20%</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">C. Wali Kamar / Musyrif</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Pembinaan karakter, pengawasan kamar, ketertiban ibadah, & penanganan masalah santri 24 jam.
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium border-t border-slate-100 pt-2">
                      <li className="flex justify-between"><span>Kehadiran / Piket Kamar</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Pengawasan Santri</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Kedisiplinan Santri Binaan</span><strong className="text-slate-900">3%</strong></li>
                      <li className="flex justify-between"><span>Kebersihan Kamar Binaan</span><strong className="text-slate-900">2%</strong></li>
                      <li className="flex justify-between"><span>Pembinaan Akhlak & Adab</span><strong className="text-slate-900">3%</strong></li>
                      <li className="flex justify-between"><span>Penanganan Masalah</span><strong className="text-slate-900">2%</strong></li>
                      <li className="flex justify-between"><span>Komunikasi & Laporan</span><strong className="text-slate-900">2%</strong></li>
                    </ul>
                  </div>

                  {/* Komponen D */}
                  <div className="p-5 bg-white border border-purple-200 rounded-2xl shadow-xs space-y-3 relative overflow-hidden">
                    <div className="w-2 h-full bg-purple-600 absolute left-0 top-0" />
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                        KOMPONEN D
                      </span>
                      <span className="text-xl font-black text-purple-950">20%</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">D. Jabatan Struktural</h4>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Kepemimpinan struktural (Kepala Bidang, Wakil Kepala, Koordinator Unit) dalam memimpin tim.
                    </p>
                    <ul className="text-[11px] text-slate-600 space-y-1 font-medium border-t border-slate-100 pt-2">
                      <li className="flex justify-between"><span>Pencapaian Proker Unit</span><strong className="text-slate-900">5%</strong></li>
                      <li className="flex justify-between"><span>Kepemimpinan (Leadership)</span><strong className="text-slate-900">4%</strong></li>
                      <li className="flex justify-between"><span>Pengelolaan Anggota / Tim</span><strong className="text-slate-900">3%</strong></li>
                      <li className="flex justify-between"><span>Administrasi & Laporan</span><strong className="text-slate-900">3%</strong></li>
                      <li className="flex justify-between"><span>Penyelesaian Masalah</span><strong className="text-slate-900">2%</strong></li>
                      <li className="flex justify-between"><span>Inovasi / Pengembangan</span><strong className="text-slate-900">2%</strong></li>
                      <li className="flex justify-between"><span>Koordinasi Antar Unit</span><strong className="text-slate-900">1%</strong></li>
                    </ul>
                  </div>
                </div>

                {/* SIMULATOR NORMALISASI DINAMIS */}
                <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 border border-slate-800 shadow-md">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-nature-gold flex items-center justify-center font-bold">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-white">
                          Simulator Normalisasi Nilai Dinamis Per Pegawai
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Komponen yang tidak dipegang seseorang <strong>TIDAK diberi nilai 0</strong>, melainkan dinormalisasi otomatis ke skala 100.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Nama Simulasi Pegawai</span>
                      <input
                        type="text"
                        value={simUstadzName}
                        onChange={(e) => setSimUstadzName(e.target.value)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-0.5 text-xs text-amber-300 font-bold text-right"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Role Toggles & Score Inputs */}
                    <div className="lg:col-span-7 space-y-3">
                      <span className="text-xs font-bold text-amber-300 block">Pilih Tugas Active Pegawai & Input Skor Raw (0-100):</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        {/* Role A: Guru */}
                        <div className={`p-3 rounded-xl border transition-all space-y-2 ${simRoles.guru ? 'bg-emerald-950/60 border-emerald-500/80' : 'bg-slate-800/40 border-slate-700 opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-emerald-300">
                              <input
                                type="checkbox"
                                checked={simRoles.guru}
                                onChange={(e) => setSimRoles(r => ({ ...r, guru: e.target.checked }))}
                                className="rounded text-emerald-500 focus:ring-0"
                              />
                              <span>A. Kinerja Guru (40%)</span>
                            </label>
                            {simRoles.guru && <span className="text-[10px] bg-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded font-mono">Aktif</span>}
                          </div>
                          {simRoles.guru && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-300">Nilai Raw Guru:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={simScores.guru}
                                onChange={(e) => setSimScores(s => ({ ...s, guru: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                                className="w-16 bg-slate-900 border border-emerald-500/60 rounded px-2 py-1 text-right text-xs font-bold text-emerald-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Role B: Bidang */}
                        <div className={`p-3 rounded-xl border transition-all space-y-2 ${simRoles.bidang ? 'bg-blue-950/60 border-blue-500/80' : 'bg-slate-800/40 border-slate-700 opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-blue-300">
                              <input
                                type="checkbox"
                                checked={simRoles.bidang}
                                onChange={(e) => setSimRoles(r => ({ ...r, bidang: e.target.checked }))}
                                className="rounded text-blue-500 focus:ring-0"
                              />
                              <span>B. Tugas Bidang (20%)</span>
                            </label>
                            {simRoles.bidang && <span className="text-[10px] bg-blue-800/60 text-blue-200 px-2 py-0.5 rounded font-mono">Aktif</span>}
                          </div>
                          {simRoles.bidang && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-300">Nilai Raw Bidang:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={simScores.bidang}
                                onChange={(e) => setSimScores(s => ({ ...s, bidang: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                                className="w-16 bg-slate-900 border border-blue-500/60 rounded px-2 py-1 text-right text-xs font-bold text-blue-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Role C: Musyrif */}
                        <div className={`p-3 rounded-xl border transition-all space-y-2 ${simRoles.musyrif ? 'bg-amber-950/60 border-amber-500/80' : 'bg-slate-800/40 border-slate-700 opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300">
                              <input
                                type="checkbox"
                                checked={simRoles.musyrif}
                                onChange={(e) => setSimRoles(r => ({ ...r, musyrif: e.target.checked }))}
                                className="rounded text-amber-500 focus:ring-0"
                              />
                              <span>C. Musyrif Kamar (20%)</span>
                            </label>
                            {simRoles.musyrif && <span className="text-[10px] bg-amber-800/60 text-amber-200 px-2 py-0.5 rounded font-mono">Aktif</span>}
                          </div>
                          {simRoles.musyrif && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-300">Nilai Raw Musyrif:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={simScores.musyrif}
                                onChange={(e) => setSimScores(s => ({ ...s, musyrif: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                                className="w-16 bg-slate-900 border border-amber-500/60 rounded px-2 py-1 text-right text-xs font-bold text-amber-300"
                              />
                            </div>
                          )}
                        </div>

                        {/* Role D: Struktural */}
                        <div className={`p-3 rounded-xl border transition-all space-y-2 ${simRoles.struktural ? 'bg-purple-950/60 border-purple-500/80' : 'bg-slate-800/40 border-slate-700 opacity-60'}`}>
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer font-bold text-purple-300">
                              <input
                                type="checkbox"
                                checked={simRoles.struktural}
                                onChange={(e) => setSimRoles(r => ({ ...r, struktural: e.target.checked }))}
                                className="rounded text-purple-500 focus:ring-0"
                              />
                              <span>D. Jabatan Struktural (20%)</span>
                            </label>
                            {simRoles.struktural && <span className="text-[10px] bg-purple-800/60 text-purple-200 px-2 py-0.5 rounded font-mono">Aktif</span>}
                          </div>
                          {simRoles.struktural && (
                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[11px] text-slate-300">Nilai Raw Struktural:</span>
                              <input
                                type="number"
                                min={0}
                                max={100}
                                value={simScores.struktural}
                                onChange={(e) => setSimScores(s => ({ ...s, struktural: Math.min(100, Math.max(0, Number(e.target.value))) }))}
                                className="w-16 bg-slate-900 border border-purple-500/60 rounded px-2 py-1 text-right text-xs font-bold text-purple-300"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Live Calculation Output Card */}
                    <div className="lg:col-span-5 bg-slate-800/90 p-5 rounded-2xl border border-slate-700 flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">HASIL PERHITUNGAN NORMALISASI</span>
                        <div className="flex items-baseline justify-between border-b border-slate-700 pb-2">
                          <span className="text-xs text-slate-300">Total Bobot Aktif:</span>
                          <span className="text-sm font-black text-amber-300">{ (simRoles.guru ? 40 : 0) + (simRoles.bidang ? 20 : 0) + (simRoles.musyrif ? 20 : 0) + (simRoles.struktural ? 20 : 0) }%</span>
                        </div>
                        <div className="flex items-baseline justify-between border-b border-slate-700 pb-2">
                          <span className="text-xs text-slate-300">Skor Raw Terkumpul:</span>
                          <span className="text-sm font-bold text-slate-200">
                            { ( (simRoles.guru ? 40 * (simScores.guru/100) : 0) + (simRoles.bidang ? 20 * (simScores.bidang/100) : 0) + (simRoles.musyrif ? 20 * (simScores.musyrif/100) : 0) + (simRoles.struktural ? 20 * (simScores.struktural/100) : 0) ).toFixed(2) } Poin
                          </span>
                        </div>
                        
                        {/* Formula Explanation */}
                        <div className="p-2.5 bg-slate-900/80 rounded-xl text-[10.5px] font-mono text-emerald-300 space-y-0.5">
                          <div>Formula: (Raw Score / Total Bobot Aktif) &times; 100</div>
                          <div className="text-slate-400 text-[10px]">
                            = ({ ( (simRoles.guru ? 40 * (simScores.guru/100) : 0) + (simRoles.bidang ? 20 * (simScores.bidang/100) : 0) + (simRoles.musyrif ? 20 * (simScores.musyrif/100) : 0) + (simRoles.struktural ? 20 * (simScores.struktural/100) : 0) ).toFixed(2) } / { (simRoles.guru ? 40 : 0) + (simRoles.bidang ? 20 : 0) + (simRoles.musyrif ? 20 : 0) + (simRoles.struktural ? 20 : 0) }) &times; 100
                          </div>
                        </div>
                      </div>

                      {/* Final Normalized Badge */}
                      {(() => {
                        const activeWeight = (simRoles.guru ? 40 : 0) + (simRoles.bidang ? 20 : 0) + (simRoles.musyrif ? 20 : 0) + (simRoles.struktural ? 20 : 0);
                        const rawTotal = (simRoles.guru ? 40 * (simScores.guru/100) : 0) + (simRoles.bidang ? 20 * (simScores.bidang/100) : 0) + (simRoles.musyrif ? 20 * (simScores.musyrif/100) : 0) + (simRoles.struktural ? 20 * (simScores.struktural/100) : 0);
                        const normalized = activeWeight > 0 ? (rawTotal / activeWeight) * 100 : 0;
                        let predikat = 'Sangat Kurang';
                        let badgeColor = 'bg-red-500 text-white';
                        let followUp = 'Evaluasi Serius oleh Pimpinan';

                        if (normalized >= 90) {
                          predikat = 'Sangat Baik (A)';
                          badgeColor = 'bg-emerald-500 text-slate-950 font-black';
                          followUp = 'Reward / Penghargaan & Promosi SDM';
                        } else if (normalized >= 80) {
                          predikat = 'Baik (B)';
                          badgeColor = 'bg-blue-500 text-white font-extrabold';
                          followUp = 'Dipertahankan & Dikembangkan';
                        } else if (normalized >= 70) {
                          predikat = 'Cukup (C)';
                          badgeColor = 'bg-amber-500 text-slate-950 font-bold';
                          followUp = 'Pembinaan Tambahan';
                        } else if (normalized >= 60) {
                          predikat = 'Kurang (D)';
                          badgeColor = 'bg-orange-600 text-white font-bold';
                          followUp = 'Perbaikan Khusus & Konseling';
                        }

                        return (
                          <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-1.5 text-center">
                            <span className="text-[10px] text-slate-400 font-bold block uppercase">NILAI AKHIR NORMALISASI (0-100)</span>
                            <div className="text-3xl font-serif font-black text-amber-300">
                              {normalized.toFixed(1)} <span className="text-xs font-sans text-slate-400">/ 100</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 pt-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs ${badgeColor}`}>{predikat}</span>
                            </div>
                            <p className="text-[11px] text-emerald-200 font-medium pt-1 border-t border-slate-800">
                              <strong>Tindak Lanjut SDM:</strong> {followUp}
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* KPI Khusus Per-Bidang Dropdown & Detail */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        KPI Khusus Per-Bidang Pesantren (Bukan Sekadar Subjektif)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Setiap bidang kerja pesantren memiliki tolok ukur spesifik berbasis pencapaian nyata.
                      </p>
                    </div>

                    <select
                      value={selectedBidangKpi}
                      onChange={(e) => setSelectedBidangKpi(e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
                    >
                      <option value="Bahasa">Bagian Bahasa (Muharrik/Language)</option>
                      <option value="Kebersihan">Bagian Kebersihan & Lingkungan</option>
                      <option value="Dapur">Bagian Dapur & Konsumsi Santri</option>
                      <option value="Kesehatan">Bagian Kesehatan (UKS/Poliklinik)</option>
                      <option value="Keamanan">Bagian Keamanan & Ketertiban</option>
                      <option value="Tahfidz">Bagian Tahfidz & Al-Qur'an</option>
                    </select>
                  </div>

                  {selectedBidangKpi === 'Bahasa' && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Indikator KPI Konkret Bagian Bahasa:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">1. Program mufrodat harian berjalan konsisten</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">2. Pengawasan penggunaan bahasa di area asrama</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">3. Evaluasi & mahkamah bahasa mingguan</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">4. Pembinaan pengurus mulqi/language court</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">5. Laporan rekapitulasi pelanggaran tepat waktu</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">6. Capaian kelancaran bahasa Arab/Inggris santri</div>
                      </div>
                    </div>
                  )}

                  {selectedBidangKpi === 'Kebersihan' && (
                    <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200 space-y-3">
                      <div className="flex items-center gap-2 text-blue-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-blue-600" />
                        <span>Indikator KPI Konkret Bagian Kebersihan:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">1. Inspeksi kebersihan sanitasi & kamar mandi</div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">2. Jadwal ro'an & gotong royong terencana</div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">3. Pengelolaan bak sampah & pembuangan akhir</div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">4. Ketersediaan alat kebersihan di setiap gedung</div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">5. Laporan mingguan bebas sarang penyakit</div>
                        <div className="p-2.5 bg-white rounded-xl border border-blue-100 font-medium">6. Respon cepat tindak lanjut keluhan kebersihan</div>
                      </div>
                    </div>
                  )}

                  {selectedBidangKpi === 'Dapur' && (
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
                      <div className="flex items-center gap-2 text-amber-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-amber-600" />
                        <span>Indikator KPI Konkret Bagian Dapur & Konsumsi:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">1. Ketepatan waktu jam makan santri (Pagi/Siang/Malam)</div>
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">2. Kebersihan alat masak & tempat cuci piring</div>
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">3. Pemenuhan gizi & kelayakan lauk santri</div>
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">4. Kontrol stok bahan makanan & gas LPG</div>
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">5. Laporan belanja harian & LPJ bulanan</div>
                        <div className="p-2.5 bg-white rounded-xl border border-amber-100 font-medium">6. Pengawasan piket distribusi makan santri</div>
                      </div>
                    </div>
                  )}

                  {selectedBidangKpi === 'Kesehatan' && (
                    <div className="p-4 bg-red-50/60 rounded-2xl border border-red-200 space-y-3">
                      <div className="flex items-center gap-2 text-red-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-red-600" />
                        <span>Indikator KPI Konkret Bagian Kesehatan (UKS):</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">1. Kehadiran piket dokter / bidan / petugas UKS</div>
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">2. Ketersediaan obat-obatan dasar & P3K</div>
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">3. Pengawasan rekam medis santri sakit</div>
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">4. Penanganan rujukan darurat RS/Puskesmas</div>
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">5. Edukasi kesehatan & sosialisasi gizi santri</div>
                        <div className="p-2.5 bg-white rounded-xl border border-red-100 font-medium">6. Laporan rekap harian santri diistirahatkan</div>
                      </div>
                    </div>
                  )}

                  {selectedBidangKpi === 'Keamanan' && (
                    <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
                      <div className="flex items-center gap-2 text-purple-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-purple-600" />
                        <span>Indikator KPI Konkret Bagian Keamanan:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">1. Kedisiplinan jadwal perizinan keluar gerbang</div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">2. Monitoring CCTV & penerangan area pondok</div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">3. Ronda malam & pengawasan tidur santri</div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">4. Penanganan tindak pelanggaran berat/kabur</div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">5. Penerimaan & pemeriksaan tamu/orang tua</div>
                        <div className="p-2.5 bg-white rounded-xl border border-purple-100 font-medium">6. Laporan insiden keamanan 1x24 jam</div>
                      </div>
                    </div>
                  )}

                  {selectedBidangKpi === 'Tahfidz' && (
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
                      <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Indikator KPI Konkret Bagian Tahfidz & Qur'an:</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-slate-700">
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">1. Kehadiran pengampu majelis ziyadah & murojaah</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">2. Ketercapaian target hafalan per juz santri</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">3. Pelaksanaan tes leveling & tasmi' bulanan</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">4. Kedisiplinan jurnal mutabaah hafalan</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">5. Bimbingan fashohah & tajwid ustadz pengampu</div>
                        <div className="p-2.5 bg-white rounded-xl border border-emerald-100 font-medium">6. Laporan progres hafalan semesteran</div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUB-TAB 2: MULTI-SOURCE ASSESSMENT 360° & SKALA 1-5 */}
            {kriteriaSubTab === 'multi-source' && (
              <div className="space-y-6">
                
                {/* Multi Source Weightage Box */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        2. Penilaian Multi-Source Assessment (360-Degree)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Mencegah penilaian sepihak atasan dengan mengombinasikan data atasan, data objektif sistem, rekan kerja, dan santri.
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-[10px] font-black uppercase">
                      Objektif & Transparan
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-950">
                        <span>60% ATASAN LANGSUNG</span>
                        <span className="text-emerald-700 font-extrabold text-sm">60%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Kepala Sekolah, Kepala Bidang, Kepala Pondok, Wakil Kepala.
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-blue-950">
                        <span>20% DATA OBJEKTIF SISTEM</span>
                        <span className="text-blue-700 font-extrabold text-sm">20%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Absensi finger, Jurnal Mengajar, Laporan Proker, Kehadiran Piket.
                      </p>
                    </div>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-amber-950">
                        <span>10% REKAN KERJA (PEER)</span>
                        <span className="text-amber-700 font-extrabold text-sm">10%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Kerja sama tim, komunikasi, kedisiplinan, & dukungan sesama ustadz.
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-purple-950">
                        <span>10% EVALUASI SANTRI</span>
                        <span className="text-purple-700 font-extrabold text-sm">10%</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        Kemudahan dipahami, pengayoman musyrif, & keramahan (data pendukung).
                      </p>
                    </div>
                  </div>

                  {/* Simulator 360 Score Calculator */}
                  <div className="p-5 bg-slate-900 text-white rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-amber-300 uppercase block">Kalkulator Simulasi Multi-Source 360°:</span>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Nilai Atasan (60%):</label>
                        <input
                          type="number"
                          value={sim360.atasan}
                          onChange={(e) => setSim360(s => ({ ...s, atasan: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-emerald-300 font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Data Objektif (20%):</label>
                        <input
                          type="number"
                          value={sim360.dataObjektif}
                          onChange={(e) => setSim360(s => ({ ...s, dataObjektif: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-blue-300 font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Rekan Kerja (10%):</label>
                        <input
                          type="number"
                          value={sim360.peer}
                          onChange={(e) => setSim360(s => ({ ...s, peer: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-amber-300 font-bold text-center"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-300 block mb-1">Evaluasi Santri (10%):</label>
                        <input
                          type="number"
                          value={sim360.santri}
                          onChange={(e) => setSim360(s => ({ ...s, santri: Number(e.target.value) }))}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-purple-300 font-bold text-center"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                      <span className="text-xs text-slate-300">Hasil Skor Terimbang 360°:</span>
                      <span className="text-lg font-mono font-black text-amber-300">
                        { ((sim360.atasan * 0.6) + (sim360.dataObjektif * 0.2) + (sim360.peer * 0.1) + (sim360.santri * 0.1)).toFixed(2) } / 100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rubrik Skala 1-5 Thresholds */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Definisi Skala Nilai 1 - 5 (Panduan Penilai Supaya Konsisten)
                    </h4>
                    <span className="text-xs font-mono text-slate-500">Skala Universal 1 s/d 5</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <th className="p-3 rounded-tl-2xl">Nilai</th>
                          <th className="p-3">Keterangan Predikat</th>
                          <th className="p-3">Kriteria Kehadiran Mengajar & Piket</th>
                          <th className="p-3">Kriteria Pelaksanaan & Pengelolaan Kelas</th>
                          <th className="p-3 rounded-tr-2xl">Tindak Lanjut SDM</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-[11.5px]">
                        <tr className="bg-emerald-50/50">
                          <td className="p-3 font-mono font-black text-emerald-800 text-sm">5</td>
                          <td className="p-3 font-bold text-emerald-950">Sangat Baik</td>
                          <td className="p-3 text-slate-700">Kehadiran &ge; 98%, selalu tepat waktu & pengganti lengkap</td>
                          <td className="p-3 text-slate-700">Sangat kuasai kelas, inovatif, partisipasi santri aktif</td>
                          <td className="p-3 font-bold text-emerald-800">Reward, Prioritas Promosi / Beasiswa</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-black text-blue-800 text-sm">4</td>
                          <td className="p-3 font-bold text-blue-950">Baik</td>
                          <td className="p-3 text-slate-700">Kehadiran 95% – 97%, hadir tepat waktu</td>
                          <td className="p-3 text-slate-700">Metode sesuai RPP, kelas tertib, evaluasi berjalan</td>
                          <td className="p-3 font-bold text-blue-800">Dipertahankan & Dikembangkan</td>
                        </tr>
                        <tr className="bg-amber-50/50">
                          <td className="p-3 font-mono font-black text-amber-800 text-sm">3</td>
                          <td className="p-3 font-bold text-amber-950">Cukup</td>
                          <td className="p-3 text-slate-700">Kehadiran 90% – 94%, sesekali izin/terlambat</td>
                          <td className="p-3 text-slate-700">Standard mengajar terpenuhi, penguasaan kelas cukup</td>
                          <td className="p-3 font-bold text-amber-800">Pembinaan Internal Unit</td>
                        </tr>
                        <tr>
                          <td className="p-3 font-mono font-black text-orange-800 text-sm">2</td>
                          <td className="p-3 font-bold text-orange-950">Kurang</td>
                          <td className="p-3 text-slate-700">Kehadiran 80% – 89%, sering terlambat</td>
                          <td className="p-3 text-slate-700">Kelas kurang kondusif, RPP jarang diisi</td>
                          <td className="p-3 font-bold text-orange-800">Perbaikan Khusus & Konseling</td>
                        </tr>
                        <tr className="bg-red-50/50">
                          <td className="p-3 font-mono font-black text-red-800 text-sm">1</td>
                          <td className="p-3 font-bold text-red-950">Sangat Kurang</td>
                          <td className="p-3 text-slate-700">Kehadiran &lt; 80%, sering alpa tanpa kabar</td>
                          <td className="p-3 text-slate-700">Sering kosongkan jam mengajar, penanganan masalah buruk</td>
                          <td className="p-3 font-bold text-red-800">Evaluasi Serius oleh Mudir/Yayasan</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Filter Integritas & Akhlak */}
                <div className="p-5 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl space-y-2 border border-emerald-700/80">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-nature-gold" />
                    <h4 className="font-serif font-bold text-sm text-white">ASPEK KHUSUS: INTEGRITAS & AKHLAK PESANTREN</h4>
                  </div>
                  <p className="text-xs text-emerald-100/90 leading-relaxed font-medium">
                    Integritas (Kejujuran, Amanah, Menjaga Rahasia Lembaga) dan Akhlak (Adab kepada Pimpinan, Sesama Ustadz, & Santri) bertindak sebagai <strong>Syarat Kelayakan (Qualifier)</strong>. Guru yang kompeten namun melanggar akhlak/integritas tidak dapat dipromosikan atau diberi predikat Sangat Baik.
                  </p>
                </div>

              </div>
            )}

            {/* SUB-TAB 3: SKP TARGET & REALISASI */}
            {kriteriaSubTab === 'skp-target' && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      3. Sasaran Kinerja Pegawai (SKP) & Realisasi Target Bulanan
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Penilaian berbasis komitmen target riil ustadz (Target &rarr; Realisasi &rarr; Persentase Capaian).
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      const newSkp = {
                        id: `SKP-${Date.now().toString().slice(-3)}`,
                        ustadz: simUstadzName,
                        tugas: 'Target Baru Pembinaan',
                        target: '100%',
                        realisasi: '0%',
                        persen: 0,
                        status: 'Dalam Proses' as const
                      };
                      setSkpTargetList(prev => [newSkp, ...prev]);
                    }}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Tambah Target SKP
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skpTargetList.map((skp) => (
                    <div key={skp.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <span className="font-bold text-slate-900 text-xs">{skp.tugas}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          skp.status === 'Tercapai' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {skp.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Target Komitmen:</span>
                          <span className="font-extrabold text-slate-800">{skp.target}</span>
                        </div>
                        <div className="p-2 bg-white rounded-xl border border-slate-200">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Realisasi Bulanan:</span>
                          <span className="font-extrabold text-emerald-700">{skp.realisasi}</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-600">
                          <span>Persentase Capaian SKP:</span>
                          <span>{skp.persen}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 rounded-full transition-all" style={{ width: `${Math.min(100, skp.persen)}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SUB-TAB 4: PELANGGARAN DISIPLIN & POIN */}
            {kriteriaSubTab === 'pelanggaran' && (
              <div className="space-y-6">
                
                {/* Rules Banner */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        4. Sistem Catatan Disiplin & Deductions Poin Pelanggaran
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Catatan minus disiplin terpisah dari nilai kinerja kualitatif agar evaluasi tetap adil dan berbasis data.
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-[10px] font-black uppercase">
                      Penegakan Disiplin
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center text-xs">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                      <span className="text-red-700 font-black text-sm block">-1 Poin</span>
                      <span className="text-[11px] font-bold text-slate-800">Terlambat Mengajar</span>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                      <span className="text-red-700 font-black text-sm block">-5 Poin</span>
                      <span className="text-[11px] font-bold text-slate-800">Alpa Tanpa Kabar</span>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                      <span className="text-red-700 font-black text-sm block">-3 Poin</span>
                      <span className="text-[11px] font-bold text-slate-800">Tidak Piket Kamar</span>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                      <span className="text-red-700 font-black text-sm block">-2 Poin</span>
                      <span className="text-[11px] font-bold text-slate-800">Tidak Buat Laporan</span>
                    </div>

                    <div className="p-3 bg-red-50 border border-red-200 rounded-2xl space-y-1">
                      <span className="text-red-700 font-black text-sm block">-3 Poin</span>
                      <span className="text-[11px] font-bold text-slate-800">Meninggalkan Tugas</span>
                    </div>

                    <div className="p-3 bg-red-900 text-white rounded-2xl space-y-1">
                      <span className="text-nature-gold font-black text-sm block">-10 Poin</span>
                      <span className="text-[11px] font-bold text-white">Pelanggaran Berat</span>
                    </div>
                  </div>
                </div>

                {/* Form Log Pelanggaran Baru & Table */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Form */}
                  <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <h4 className="font-serif font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                      Catat Pelanggaran Disiplin
                    </h4>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Pilih Ustadz / Ustadzah:</label>
                        <select
                          value={formPelanggaran.ustadz}
                          onChange={(e) => setFormPelanggaran(f => ({ ...f, ustadz: e.target.value }))}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="Ustadz Ahmad Fauzan">Ustadz Ahmad Fauzan</option>
                          <option value="Ustadz Rizky Ramadhan">Ustadz Rizky Ramadhan</option>
                          <option value="Ustadzah Hurpatil Jannah S.Pd.I">Ustadzah Hurpatil Jannah S.Pd.I</option>
                          <option value="Ustadzah Aulia Rahma">Ustadzah Aulia Rahma</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Jenis Pelanggaran:</label>
                        <select
                          value={formPelanggaran.jenis}
                          onChange={(e) => {
                            const val = e.target.value;
                            let p = -1;
                            if (val === 'Alpa Tanpa Keterangan') p = -5;
                            if (val === 'Tidak Piket Kamar') p = -3;
                            if (val === 'Tidak Buat Laporan') p = -2;
                            if (val === 'Meninggalkan Tugas') p = -3;
                            if (val === 'Pelanggaran Berat') p = -10;
                            setFormPelanggaran(f => ({ ...f, jenis: val, poin: p }));
                          }}
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
                        >
                          <option value="Terlambat Mengajar">Terlambat Mengajar (-1 Poin)</option>
                          <option value="Alpa Tanpa Keterangan">Alpa Tanpa Keterangan (-5 Poin)</option>
                          <option value="Tidak Piket Kamar">Tidak Piket Kamar (-3 Poin)</option>
                          <option value="Tidak Buat Laporan">Tidak Buat Laporan (-2 Poin)</option>
                          <option value="Meninggalkan Tugas">Meninggalkan Tugas (-3 Poin)</option>
                          <option value="Pelanggaran Berat">Pelanggaran Berat (-10 Poin)</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Keterangan Tambahan:</label>
                        <textarea
                          rows={2}
                          value={formPelanggaran.ket}
                          onChange={(e) => setFormPelanggaran(f => ({ ...f, ket: e.target.value }))}
                          placeholder="Detail kejadian / catatan penanggung jawab..."
                          className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>

                      <button
                        onClick={() => {
                          if (!formPelanggaran.ket) return;
                          const newPel = {
                            id: `PEL-${Date.now().toString().slice(-3)}`,
                            tanggal: new Date().toISOString().split('T')[0],
                            ustadz: formPelanggaran.ustadz,
                            jenis: formPelanggaran.jenis,
                            poin: formPelanggaran.poin,
                            ket: formPelanggaran.ket
                          };
                          setPelanggaranList(prev => [newPel, ...prev]);
                          setFormPelanggaran(f => ({ ...f, ket: '' }));
                        }}
                        className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" /> Simpan Catatan Disiplin
                      </button>
                    </div>
                  </div>

                  {/* Table Log */}
                  <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Log Catatan Disiplin Terdaftar
                      </h4>
                      <span className="text-xs font-mono font-bold text-red-700">
                        Total Poin Minus: {pelanggaranList.reduce((acc, p) => acc + p.poin, 0)} Poin
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-900 text-white font-bold text-[11px]">
                            <th className="p-2.5 rounded-tl-2xl">Tgl</th>
                            <th className="p-2.5">Nama Ustadz</th>
                            <th className="p-2.5">Jenis Pelanggaran</th>
                            <th className="p-2.5">Poin</th>
                            <th className="p-2.5 rounded-tr-2xl">Keterangan</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-[11.5px]">
                          {pelanggaranList.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono text-slate-500 text-[10.5px]">{p.tanggal}</td>
                              <td className="p-2.5 font-bold text-slate-900">{p.ustadz}</td>
                              <td className="p-2.5 text-slate-700">{p.jenis}</td>
                              <td className="p-2.5 font-mono font-black text-red-700">{p.poin}</td>
                              <td className="p-2.5 text-slate-600 italic text-[11px]">{p.ket}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* SUB-TAB 5: INDEKS BEBAN TUGAS & 5-LEVEL SYSTEM */}
            {kriteriaSubTab === 'workload-5level' && (
              <div className="space-y-6">
                
                {/* Indeks Beban Tugas Section */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-serif font-bold text-slate-900 text-sm">
                        Indeks Beban Tugas Multi-Amanah (Workload Index)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Memastikan keadilan pembagian insentif dan evaluasi antara Ustadz single-role vs Ustadz multi-role.
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-[10px] font-black uppercase">
                      Keseimbangan Amanah
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-xs">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Guru</span>
                      <span className="text-emerald-700 font-black text-sm">1.0</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Musyrif</span>
                      <span className="text-emerald-700 font-black text-sm">1.0</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Anggota Bidang</span>
                      <span className="text-emerald-700 font-black text-sm">0.5</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Koordinator</span>
                      <span className="text-emerald-700 font-black text-sm">1.0</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Kepala Bidang</span>
                      <span className="text-emerald-700 font-black text-sm">1.5</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="font-bold text-slate-800 block">Wakil Kepala</span>
                      <span className="text-emerald-700 font-black text-sm">2.0</span>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 col-span-2 sm:col-span-1">
                      <span className="font-bold text-slate-800 block">Kepala Unit</span>
                      <span className="text-emerald-700 font-black text-sm">2.0</span>
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-amber-300 font-bold block uppercase">Beban Tugas {simUstadzName}:</span>
                      <p className="text-sm font-bold text-white">
                        Indeks Beban Kerja Terhitung = <span className="text-amber-300 font-black text-lg">{((simRoles.guru ? 1.0 : 0) + (simRoles.bidang ? 1.5 : 0) + (simRoles.musyrif ? 1.0 : 0) + (simRoles.struktural ? 2.0 : 0)).toFixed(1)}</span>
                      </p>
                    </div>

                    <p className="text-[11px] text-emerald-200 italic max-w-md">
                      "Digunakan oleh pimpinan untuk distribusi insentif beban kerja & evaluasi penambahan amanah baru agar ustadz tidak mengalami overload."
                    </p>
                  </div>
                </div>

                {/* 5 Level Integrated System Dashboard Cards */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <h4 className="font-serif font-bold text-slate-900 text-sm">
                      Arsitektur Sistem SDM Pesantren 5 Level Terintegrasi
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Alur manajemen dari pendaftaran data hingga eksekusi keputusan pimpinan.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                    {/* Level 1 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-800 text-white font-black text-[11px] flex items-center justify-center">1</div>
                      <h5 className="font-bold text-slate-900 text-xs">LEVEL 1: DATA KEPEGAWAIAN</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Profil NIP, Pendidikan, Unit, Mapel, Tugas Musyrif, Multi-Amanah, & Jam Mengajar.
                      </p>
                    </div>

                    {/* Level 2 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-blue-800 text-white font-black text-[11px] flex items-center justify-center">2</div>
                      <h5 className="font-bold text-slate-900 text-xs">LEVEL 2: TARGET KERJA (SKP)</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Penetapan komitmen target Bulanan, Semesteran, & Tahunan setiap ustadz.
                      </p>
                    </div>

                    {/* Level 3 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-amber-600 text-white font-black text-[11px] flex items-center justify-center">3</div>
                      <h5 className="font-bold text-slate-900 text-xs">LEVEL 3: PENILAIAN 360°</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Penilaian Guru + Bidang + Musyrif + Struktural dengan Dynamic Weight Normalization.
                      </p>
                    </div>

                    {/* Level 4 */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-800 text-white font-black text-[11px] flex items-center justify-center">4</div>
                      <h5 className="font-bold text-slate-900 text-xs">LEVEL 4: REKAP & DASHBOARD</h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        Ranking, Rekap Unit, Kedisiplinan, Point Minus Pelanggaran, & Indeks Beban.
                      </p>
                    </div>

                    {/* Level 5 */}
                    <div className="p-4 bg-slate-900 text-white border border-slate-800 rounded-2xl space-y-2">
                      <div className="w-6 h-6 rounded-lg bg-nature-gold text-slate-950 font-black text-[11px] flex items-center justify-center">5</div>
                      <h5 className="font-bold text-amber-300 text-xs">LEVEL 5: TINDAK LANJUT</h5>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                        Keputusan Leadership: Reward & Promosi, Pembinaan, Pelatihan, Rotasi, & Mutasi.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
        {activeTab === 'penilaian' && (
          <div className="p-6 space-y-6">
            
            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari NIP, nama karyawan, atau jabatan SDM..."
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Unit Filter */}
                <select
                  value={selectedUnitFilter}
                  onChange={(e) => setSelectedUnitFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="SEMUA">Semua Unit Kerja</option>
                  <option value="Pengasuhan Santri & Asrama">Pengasuhan & Asrama</option>
                  <option value="Madrasah Diniyah & Tahfizh">Diniyah & Tahfizh</option>
                  <option value="Sekolah Formal (SMP/SMA/MA)">Sekolah Formal</option>
                  <option value="Administrasi, Keuangan & Humas">Admin & Keuangan</option>
                  <option value="Sarana Prasarana & Keamanan">Sarpras & Keamanan</option>
                  <option value="Litbang, Kurikulum & SDM">Litbang & Kurikulum</option>
                </select>

                {/* Kategori Filter */}
                <select
                  value={selectedKategoriFilter}
                  onChange={(e) => setSelectedKategoriFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="SEMUA">Semua Kategori Grade</option>
                  <option value="Sangat Baik (A)">Sangat Baik (A)</option>
                  <option value="Baik (B)">Baik (B)</option>
                  <option value="Cukup (C)">Cukup (C)</option>
                  <option value="Perlu Pembinaan (D)">Perlu Pembinaan (D)</option>
                </select>

                {/* Periode Filter */}
                <select
                  value={selectedPeriodeFilter}
                  onChange={(e) => setSelectedPeriodeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
                >
                  <option value="SEMUA">Semua Periode</option>
                  {availablePeriodes.map(per => (
                    <option key={per} value={per}>{per}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Evaluation Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                    <th className="p-3.5">NIP & Karyawan SDM</th>
                    <th className="p-3.5">Unit Kerja & Jabatan</th>
                    <th className="p-3.5">Periode Evaluasi</th>
                    <th className="p-3.5 text-center">Skor KPI</th>
                    <th className="p-3.5 text-center">Skor Akhral</th>
                    <th className="p-3.5 text-center">Grade / Kategori</th>
                    <th className="p-3.5 text-center">Status Approval</th>
                    <th className="p-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs text-slate-800">
                  {filteredPenilaian.length > 0 ? (
                    filteredPenilaian.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-medium">
                          <div className="font-bold text-slate-900">{p.namaKaryawan}</div>
                          <div className="text-[10px] text-slate-500 font-mono">NIP: {p.nipKaryawan}</div>
                        </td>
                        <td className="p-3.5">
                          <div className="font-semibold text-slate-800">{p.jabatan}</div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold inline-block mt-0.5">
                            {p.unitKerja}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-slate-800">{p.periode}</div>
                          <div className="text-[10px] text-slate-400">Tgl: {p.tanggalPenilaian}</div>
                        </td>
                        <td className="p-3.5 text-center font-extrabold text-blue-700">
                          {p.skorTotalKPI} <span className="text-[9px] text-slate-400">/100</span>
                        </td>
                        <td className="p-3.5 text-center font-black text-emerald-700 text-sm">
                          {p.totalSkorFinal}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-block ${
                            p.kategoriKinerja.startsWith('Sangat Baik') ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            p.kategoriKinerja.startsWith('Baik') ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            p.kategoriKinerja.startsWith('Cukup') ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {p.kategoriKinerja}
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                            p.statusApproval === 'Disetujui Mudir' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                            p.statusApproval === 'Terverifikasi Litbang' ? 'bg-sky-50 text-sky-700 border border-sky-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {p.statusApproval === 'Disetujui Mudir' && <ShieldCheck className="w-3 h-3 text-emerald-600" />}
                            {p.statusApproval}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setDetailPenilaianView(p)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Detail Rapor SDM"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleExportPdfRapor(p)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              title="Cetak PDF Rapor Kinerja"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleOpenEditPenilaian(p)}
                              className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Penilaian"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus catatan penilaian kinerja untuk ${p.namaKaryawan}?`)) {
                                  onDeletePenilaian(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold">Belum Ada Data Penilaian Kinerja</p>
                        <p className="text-[11px] text-slate-400">Gunakan tombol 'Input Penilaian Kinerja' untuk mencatat evaluasi SDM baru.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 2: DATA INDUK SDM & KARYAWAN */}
        {activeTab === 'karyawan' && (
          <div className="p-6 space-y-6">
            
            {/* Sync Info Banner */}
            <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-3xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                  <GraduationCap className="w-5 h-5 text-nature-gold" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-emerald-950 flex items-center gap-2">
                    Satu Data SDM & Tenaga Pendidik Pesantren
                    <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-full text-[10px] font-extrabold">
                      {guruList.length} Pengasuh & Guru Terdaftar
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-800 mt-0.5 leading-snug">
                    Data pengasuh & guru tersinkron otomatis dengan modul Litbang SDM untuk evaluasi KPI, presensi, dan penilaian berkala.
                  </p>
                </div>
              </div>
              {onSyncSDM && (
                <button
                  onClick={onSyncSDM}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
                >
                  <BrainCircuit className="w-3.5 h-3.5 text-nature-gold" /> Sinkronkan Sekarang
                </button>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Data Induk SDM & Karyawan Pesantren</h3>
                <p className="text-xs text-slate-500">Daftar ustadz, pengasuh, pengajar, staf administrasi, keuangan, dan unit pendukung</p>
              </div>
              <button
                onClick={handleOpenAddKaryawan}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Tambah Karyawan SDM
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {karyawanList.map(emp => {
                const evalCount = penilaianList.filter(p => p.idKaryawan === emp.id).length;
                const lastEval = penilaianList.filter(p => p.idKaryawan === emp.id).sort((a,b) => new Date(b.tanggalPenilaian).getTime() - new Date(a.tanggalPenilaian).getTime())[0];
                const isTeacher = guruList.some(g => (g.nip && g.nip === emp.nipKaryawan) || g.nama.trim().toLowerCase() === emp.nama.trim().toLowerCase()) ||
                  emp.unitKerja === 'Pengasuhan Santri & Asrama' ||
                  emp.unitKerja === 'Madrasah Diniyah & Tahfizh' ||
                  emp.unitKerja === 'Sekolah Formal (SMP/SMA/MA)';

                return (
                  <div key={emp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-emerald-500/50 transition-all shadow-2xs">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                          {emp.nama.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug">{emp.nama}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-slate-500 font-mono block">NIP: {emp.nipKaryawan}</span>
                            {isTeacher && (
                              <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold inline-flex items-center gap-0.5">
                                <Check className="w-2.5 h-2.5" /> Guru/Pengasuh
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ${
                        emp.statusKepegawaian === 'Tetap' ? 'bg-emerald-100 text-emerald-800' :
                        emp.statusKepegawaian === 'Kontrak' ? 'bg-blue-100 text-blue-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {emp.statusKepegawaian}
                      </span>
                    </div>

                    <div className="space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-700">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Jabatan:</span>
                        <span className="font-bold">{emp.jabatan}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Unit Kerja:</span>
                        <span className="font-bold text-emerald-700">{emp.unitKerja}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pendidikan:</span>
                        <span>{emp.pendidikanTerakhir}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">No. WA/HP:</span>
                        <span className="font-mono">{emp.noHp}</span>
                      </div>
                    </div>

                    {emp.catatanApresiasi && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-[10px] text-emerald-900 font-medium">
                        ✨ <strong>Apresiasi:</strong> {emp.catatanApresiasi}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[10px]">
                      <span className="text-slate-500">
                        Evaluasi Terbit: <strong>{evalCount} Kali</strong> {lastEval && `(Skor: ${lastEval.totalSkorFinal})`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEditKaryawan(emp)}
                          className="p-1 text-slate-500 hover:text-amber-600 rounded-md hover:bg-slate-200/60 transition-colors"
                          title="Edit Profile SDM"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data karyawan SDM ${emp.nama}?`)) {
                              onDeleteKaryawan(emp.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-md hover:bg-slate-200/60 transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 3: PROGRAM RISET & INOVASI LITBANG */}
        {activeTab === 'program' && (
          <div className="p-6 space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-slate-900">Program Riset, Inovasi & Pengembangan SDM</h3>
                <p className="text-xs text-slate-500">Agenda pengembangan kurikulum, media ajar, sertifikasi pengasuhan, dan standardisasi SDM</p>
              </div>
              <button
                onClick={handleOpenAddProgram}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Program Inovasi Baru
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {programLitbangList.map(prog => (
                <div key={prog.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-amber-500/60 transition-all shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 uppercase">
                        {prog.unitTujuan}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-900 mt-1">{prog.judulProgram}</h4>
                      <p className="text-xs text-slate-500">Penanggung Jawab: <strong>{prog.penanggungJawab}</strong></p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold shrink-0 ${
                      prog.status === 'Diterapkan Permanen' ? 'bg-emerald-100 text-emerald-800' :
                      prog.status === 'Sedang Berjalan' ? 'bg-amber-100 text-amber-800' :
                      'bg-slate-200 text-slate-700'
                    }`}>
                      {prog.status}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>Progres Pencapaian</span>
                      <span className="text-amber-600">{prog.progressPercent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${prog.progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                    <p><strong>Target Output:</strong> {prog.targetOutput}</p>
                    {prog.keterangan && <p className="text-slate-500 text-[11px]">{prog.keterangan}</p>}
                    {prog.anggaranEst && (
                      <p className="text-[11px] text-emerald-700 font-bold pt-1">
                        Estimasi Anggaran: Rp {prog.anggaranEst.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-slate-400 pt-2 border-t border-slate-200">
                    <span>Periode: {prog.tanggalMulai} s/d {prog.tanggalSelesai}</span>
                    <button
                      onClick={() => {
                        if (confirm(`Hapus program litbang ${prog.judulProgram}?`)) {
                          onDeleteProgramLitbang(prog.id);
                        }
                      }}
                      className="text-rose-500 hover:text-rose-700 font-bold"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: ANALISIS & RADAR KINERJA UNIT */}
        {activeTab === 'analisis' && (
          <div className="p-6 space-y-8">
            
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif font-bold text-lg text-slate-900">Analisis Komparasi Kinerja & Gap Kompetensi SDM</h3>
              <p className="text-xs text-slate-500">Visualisasi statistik perbandingan antar unit kerja dan pemetaaan kekuatan SDM pesantren</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Bar Chart Average Score per Unit */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" /> Rata-rata Skor KPI per Unit Kerja
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartUnitPerformanceData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="unit" tick={{ fontSize: 10 }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                      <Tooltip formatter={(val: any) => [`${val} Skor`, 'Rata-rata Kinerja']} />
                      <Bar dataKey="skorAverage" fill="#0f766e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Radar Chart Competencies */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4 text-purple-600" /> Radar Competency Matrix (5 Pilar Utama)
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarCompetencyData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="aspect" tick={{ fontSize: 10, fill: '#334155' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar name="Skor Aspek" dataKey="score" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Pie Chart Grade Distribution */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-blue-600" /> Distribusi Grade/Kategori Kinerja SDM
                </h4>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartCategoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieChartCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Litbang Insight Box */}
              <div className="bg-emerald-950 text-white p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-nature-gold/20 text-nature-gold border border-nature-gold/30 rounded-full text-xs font-black">
                    <Sparkles className="w-3.5 h-3.5" /> REKOMENDASI INSIGHT LITBANG
                  </div>
                  <h4 className="font-serif font-bold text-base text-white">Evaluasi & Rencana Tindak Lanjut SDM</h4>
                  <ul className="text-xs text-emerald-100/90 space-y-2 list-disc pl-4 font-medium leading-relaxed">
                    <li><strong>Pengasuhan & Asrama:</strong> Tingkat konsistensi input Mutabaah Yaumiyah telah mencapai 98%. Perlu dipertahankan dengan apresiasi insentif semester.</li>
                    <li><strong>Sekolah Formal & Diniyah:</strong> Penguasaan media pembelajaran digital menunjukkan peningkatan signifikan (+18% partisipasi).</li>
                    <li><strong>Sarpras & Keamanan:</strong> Diperlukan workshop penyegaran SOP keamanan gerbang dan simulasi ronda malam secara rutin.</li>
                  </ul>
                </div>

                <div className="p-3 bg-white/10 rounded-xl text-[11px] text-emerald-200 font-mono">
                  Diverifikasi oleh Tim Assessor Litbang & HRD Pesantren Darul Arifin.
                </div>
              </div>

            </div>

          </div>
        )}



      </div>

      {/* MODAL 1: FORM INPUT / EDIT PENILAIAN KINERJA */}
      <AnimatePresence>
        {isModalPenilaianOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 my-8"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-slate-900">
                    {editingPenilaian ? 'Edit Penilaian Kinerja SDM' : 'Form Input Penilaian Kinerja SDM Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Lengkapi bobot KPI, pencapaian target, dan evaluasi core values pesantren
                  </p>
                </div>
                <button
                  onClick={() => setIsModalPenilaianOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFormPenilaianSubmit} className="space-y-6 text-xs">
                
                {/* Employee Selector & Period */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Pilih Karyawan SDM *</label>
                    <select
                      value={formPenilaian.idKaryawan}
                      onChange={(e) => setFormPenilaian({ ...formPenilaian, idKaryawan: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-medium"
                      required
                    >
                      <option value="">-- Pilih Karyawan --</option>
                      {karyawanList.map(k => (
                        <option key={k.id} value={k.id}>
                          {k.nama} ({k.nipKaryawan}) - {k.jabatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Periode Penilaian *</label>
                    <input
                      type="text"
                      value={formPenilaian.periode}
                      onChange={(e) => setFormPenilaian({ ...formPenilaian, periode: e.target.value })}
                      placeholder="e.g. Semester Ganjil 2025/2026"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tanggal Evaluasi</label>
                    <input
                      type="date"
                      value={formPenilaian.tanggalPenilaian}
                      onChange={(e) => setFormPenilaian({ ...formPenilaian, tanggalPenilaian: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Penilai / Assessor Litbang</label>
                    <input
                      type="text"
                      value={formPenilaian.penilaiNama}
                      onChange={(e) => setFormPenilaian({ ...formPenilaian, penilaiNama: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                {/* KPI Items Table Form */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" /> Key Performance Indicators (KPI) SDM
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const newKpi: ItemPenilaianKPI = {
                          id: `kpi-${Date.now()}`,
                          kpiName: 'Indikator KPI Baru',
                          bobotPercent: 20,
                          target: 'Target Minimum',
                          pencapaianActual: 'Pencapaian Realisasi',
                          skorActual: 85,
                          catatan: ''
                        };
                        setFormPenilaian({
                          ...formPenilaian,
                          itemsKPI: [...formPenilaian.itemsKPI, newKpi]
                        });
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Tambah Indikator KPI
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formPenilaian.itemsKPI.map((kpi, idx) => (
                      <div key={kpi.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-extrabold text-[11px] text-slate-800">
                            KPI #{idx + 1}
                          </span>
                          {formPenilaian.itemsKPI.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const nextList = formPenilaian.itemsKPI.filter((_, i) => i !== idx);
                                setFormPenilaian({ ...formPenilaian, itemsKPI: nextList });
                              }}
                              className="text-rose-500 hover:text-rose-700 font-bold text-[10px]"
                            >
                              Hapus KPI
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="col-span-1 md:col-span-2 space-y-0.5">
                            <label className="text-[10px] text-slate-500">Nama Indikator KPI</label>
                            <input
                              type="text"
                              value={kpi.kpiName}
                              onChange={(e) => {
                                const copy = [...formPenilaian.itemsKPI];
                                copy[idx].kpiName = e.target.value;
                                setFormPenilaian({ ...formPenilaian, itemsKPI: copy });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                              placeholder="Nama KPI"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500">Bobot (%)</label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={kpi.bobotPercent}
                              onChange={(e) => {
                                const copy = [...formPenilaian.itemsKPI];
                                copy[idx].bobotPercent = Number(e.target.value);
                                setFormPenilaian({ ...formPenilaian, itemsKPI: copy });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500">Target Minimal</label>
                            <input
                              type="text"
                              value={kpi.target}
                              onChange={(e) => {
                                const copy = [...formPenilaian.itemsKPI];
                                copy[idx].target = e.target.value;
                                setFormPenilaian({ ...formPenilaian, itemsKPI: copy });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500">Pencapaian Realisasi</label>
                            <input
                              type="text"
                              value={kpi.pencapaianActual}
                              onChange={(e) => {
                                const copy = [...formPenilaian.itemsKPI];
                                copy[idx].pencapaianActual = e.target.value;
                                setFormPenilaian({ ...formPenilaian, itemsKPI: copy });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                            />
                          </div>
                          <div className="space-y-0.5">
                            <label className="text-[10px] text-slate-500">Skor Capaian (0-100)</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={kpi.skorActual}
                              onChange={(e) => {
                                const copy = [...formPenilaian.itemsKPI];
                                copy[idx].skorActual = Number(e.target.value);
                                setFormPenilaian({ ...formPenilaian, itemsKPI: copy });
                              }}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                    <span className="font-bold text-emerald-900">Rata-rata Terbobot KPI:</span>
                    <span className="font-black text-emerald-800 text-sm">{calculatedKPI} / 100</span>
                  </div>
                </div>

                {/* Core Competencies Inputs */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-600" /> Aspek Competency & Core Values Pesantren (0 - 100)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kedisiplinan Presensi & Jam Kerja</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPenilaian.skorKedisiplinanPresensi}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, skorKedisiplinanPresensi: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Akhlak & Keteladanan Sunnah</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPenilaian.skorAkhlakAdabPesantren}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, skorAkhlakAdabPesantren: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Kompetensi Pengasuhan / Pedagogik</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPenilaian.skorKompetensiPengasuhanPedagogik}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, skorKompetensiPengasuhanPedagogik: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Inovasi & Riset Litbang</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPenilaian.skorInovasiRisetLitbang}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, skorInovasiRisetLitbang: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-1">
                      <label className="font-bold text-slate-700">Pelayanan Santri & Layanan Wali Santri</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formPenilaian.skorPelayananSantriOrtu}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, skorPelayananSantriOrtu: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Score Summary Box */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Hasil Kalkulasi Skor Akhir</span>
                    <h5 className="text-xl font-black text-white">{calculatedFinalScore} / 100</h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-200 uppercase font-bold block">Grade Kinerja</span>
                    <span className="px-3 py-1 bg-nature-gold text-emerald-950 font-black rounded-full text-xs inline-block">
                      {calculatedKategori}
                    </span>
                  </div>
                </div>

                {/* Recommendations & Approval */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Rekomendasi Tim Litbang & SDM</label>
                    <textarea
                      rows={2}
                      value={formPenilaian.rekomendasiLitbang}
                      onChange={(e) => setFormPenilaian({ ...formPenilaian, rekomendasiLitbang: e.target.value })}
                      placeholder="Catatan apresiasi, promosi, atau pelatihan..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Status Verifikasi & Approval</label>
                      <select
                        value={formPenilaian.statusApproval}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, statusApproval: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                      >
                        <option value="Draft">Draft Assessor</option>
                        <option value="Terverifikasi Litbang">Terverifikasi Litbang</option>
                        <option value="Disetujui Mudir">Disetujui Mudir Pesantren</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-slate-700">Catatan Mudir (Opsional)</label>
                      <input
                        type="text"
                        value={formPenilaian.catatanMudir}
                        onChange={(e) => setFormPenilaian({ ...formPenilaian, catatanMudir: e.target.value })}
                        placeholder="Catatan pimpinan..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalPenilaianOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-md"
                  >
                    Simpan Penilaian SDM
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: FORM INPUT KARYAWAN SDM */}
      <AnimatePresence>
        {isModalKaryawanOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl border border-slate-200 my-8"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  {editingKaryawan ? 'Edit Profil Karyawan SDM' : 'Tambah Karyawan SDM Baru'}
                </h3>
                <button onClick={() => setIsModalKaryawanOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveFormKaryawanSubmit} className="space-y-4 text-xs">
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">NIP Karyawan *</label>
                    <input
                      type="text"
                      value={formKaryawan.nipKaryawan}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, nipKaryawan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Gender</label>
                    <select
                      value={formKaryawan.gender}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, gender: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    value={formKaryawan.nama}
                    onChange={(e) => setFormKaryawan({ ...formKaryawan, nama: e.target.value })}
                    placeholder="e.g. Ustadz Ahmad, S.Pd.I."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Jabatan SDM *</label>
                    <input
                      type="text"
                      value={formKaryawan.jabatan}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, jabatan: e.target.value })}
                      placeholder="e.g. Musyrif Asrama"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Unit Kerja SDM *</label>
                    <select
                      value={formKaryawan.unitKerja}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, unitKerja: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Pengasuhan Santri & Asrama">Pengasuhan & Asrama</option>
                      <option value="Madrasah Diniyah & Tahfizh">Diniyah & Tahfizh</option>
                      <option value="Sekolah Formal (SMP/SMA/MA)">Sekolah Formal</option>
                      <option value="Administrasi, Keuangan & Humas">Admin & Keuangan</option>
                      <option value="Sarana Prasarana & Keamanan">Sarpras & Keamanan</option>
                      <option value="Litbang, Kurikulum & SDM">Litbang & Kurikulum</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status Kepegawaian</label>
                    <select
                      value={formKaryawan.statusKepegawaian}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, statusKepegawaian: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Tetap">Tetap</option>
                      <option value="Kontrak">Kontrak</option>
                      <option value="Pengabdian">Pengabdian</option>
                      <option value="Honorer / Guru Tamu">Honorer / Guru Tamu</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Pendidikan Terakhir</label>
                    <input
                      type="text"
                      value={formKaryawan.pendidikanTerakhir}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, pendidikanTerakhir: e.target.value })}
                      placeholder="e.g. S1 Pendidikan Islam"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">No WhatsApp / HP</label>
                    <input
                      type="text"
                      value={formKaryawan.noHp}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, noHp: e.target.value })}
                      placeholder="08123456789"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tanggal Bergabung</label>
                    <input
                      type="date"
                      value={formKaryawan.tanggalBergabung}
                      onChange={(e) => setFormKaryawan({ ...formKaryawan, tanggalBergabung: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Catatan Apresiasi / Prestasi (Opsional)</label>
                  <input
                    type="text"
                    value={formKaryawan.catatanApresiasi}
                    onChange={(e) => setFormKaryawan({ ...formKaryawan, catatanApresiasi: e.target.value })}
                    placeholder="e.g. Pemenang Lomba Inovasi Pembelajaran"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalKaryawanOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-800 text-white font-bold rounded-xl"
                  >
                    Simpan Data SDM
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: PROGRAM LITBANG */}
      <AnimatePresence>
        {isModalProgramOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 my-8 text-xs"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-serif font-bold text-lg text-slate-900">
                  Tambah Program Inovasi Litbang Baru
                </h3>
                <button onClick={() => setIsModalProgramOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProgramSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Judul Program Inovasi *</label>
                  <input
                    type="text"
                    value={formProgram.judulProgram}
                    onChange={(e) => setFormProgram({ ...formProgram, judulProgram: e.target.value })}
                    placeholder="e.g. Standardisasi SOP Pengasuhan Asrama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Unit Tujuan</label>
                    <select
                      value={formProgram.unitTujuan}
                      onChange={(e) => setFormProgram({ ...formProgram, unitTujuan: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Pengasuhan Santri & Asrama">Pengasuhan & Asrama</option>
                      <option value="Madrasah Diniyah & Tahfizh">Diniyah & Tahfizh</option>
                      <option value="Sekolah Formal (SMP/SMA/MA)">Sekolah Formal</option>
                      <option value="Administrasi, Keuangan & Humas">Admin & Keuangan</option>
                      <option value="Sarana Prasarana & Keamanan">Sarpras & Keamanan</option>
                      <option value="Litbang, Kurikulum & SDM">Litbang & Kurikulum</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Penanggung Jawab</label>
                    <input
                      type="text"
                      value={formProgram.penanggungJawab}
                      onChange={(e) => setFormProgram({ ...formProgram, penanggungJawab: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Target Output Program</label>
                  <input
                    type="text"
                    value={formProgram.targetOutput}
                    onChange={(e) => setFormProgram({ ...formProgram, targetOutput: e.target.value })}
                    placeholder="e.g. Modul Panduan & Video Tutorial"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Progres Capaian (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formProgram.progressPercent}
                      onChange={(e) => setFormProgram({ ...formProgram, progressPercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Status Program</label>
                    <select
                      value={formProgram.status}
                      onChange={(e) => setFormProgram({ ...formProgram, status: e.target.value as any })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="Perencanaan">Perencanaan</option>
                      <option value="Sedang Berjalan">Sedang Berjalan</option>
                      <option value="Selesai Evaluasi">Selesai Evaluasi</option>
                      <option value="Diterapkan Permanen">Diterapkan Permanen</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalProgramOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 font-bold rounded-xl"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 text-white font-bold rounded-xl"
                  >
                    Simpan Program Litbang
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: DETAIL RAPOR KINERJA SDM VIEW */}
      <AnimatePresence>
        {detailPenilaianView && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl border border-slate-200 my-8 text-xs max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
                    RAPOR EVALUASI KINERJA KARYAWAN & SDM
                  </span>
                  <h3 className="font-serif font-bold text-xl text-slate-900 mt-0.5">
                    {detailPenilaianView.namaKaryawan}
                  </h3>
                  <p className="text-slate-500 font-mono text-[11px]">NIP: {detailPenilaianView.nipKaryawan} | {detailPenilaianView.jabatan}</p>
                </div>
                <button
                  onClick={() => setDetailPenilaianView(null)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Score Header Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-900 via-emerald-850 to-slate-900 text-white rounded-2xl flex items-center justify-between shadow-md">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider">Total Skor Final SDM</span>
                  <div className="text-3xl font-black text-white">{detailPenilaianView.totalSkorFinal} <span className="text-xs text-emerald-300 font-medium">/ 100</span></div>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-[10px] text-emerald-200 uppercase font-bold block">Grade & Kategori Kinerja</span>
                  <span className="px-3 py-1 bg-nature-gold text-emerald-950 font-black rounded-full text-xs inline-block">
                    {detailPenilaianView.kategoriKinerja}
                  </span>
                </div>
              </div>

              {/* KPI Breakdown */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Capaian Key Performance Indicators (KPI)
                </h4>
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl overflow-hidden">
                  {(detailPenilaianView.itemsKPI || []).map((kpi, idx) => (
                    <div key={kpi.id || idx} className="p-3 bg-slate-50/60 flex items-center justify-between gap-3 text-xs">
                      <div className="space-y-0.5 flex-1">
                        <div className="font-bold text-slate-900">{kpi.kpiName}</div>
                        <div className="text-[11px] text-slate-500">
                          Target: <strong>{kpi.target}</strong> | Realisasi: <strong>{kpi.pencapaianActual}</strong>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-slate-500 block">Bobot: {kpi.bobotPercent}%</span>
                        <span className="font-black text-emerald-700 text-sm">{kpi.skorActual} / 100</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Competency Summary */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-800 uppercase tracking-wider text-xs">
                  Aspek Competency & Core Values Pesantren
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Kedisiplinan Presensi</span>
                    <span className="font-extrabold text-slate-900 text-sm">{detailPenilaianView.skorKedisiplinanPresensi}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Akhlak & Adab</span>
                    <span className="font-extrabold text-slate-900 text-sm">{detailPenilaianView.skorAkhlakAdabPesantren}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Pengasuhan/Pedagogik</span>
                    <span className="font-extrabold text-slate-900 text-sm">{detailPenilaianView.skorKompetensiPengasuhanPedagogik}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Inovasi Litbang</span>
                    <span className="font-extrabold text-slate-900 text-sm">{detailPenilaianView.skorInovasiRisetLitbang}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <span className="text-[10px] text-slate-500 block">Layanan Wali Santri</span>
                    <span className="font-extrabold text-slate-900 text-sm">{detailPenilaianView.skorPelayananSantriOrtu}</span>
                  </div>
                </div>
              </div>

              {/* Litbang Recommendation */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
                <span className="font-bold text-amber-900 block text-xs">Rekomendasi Litbang & SDM:</span>
                <p className="text-amber-900/90 leading-relaxed font-medium">"{detailPenilaianView.rekomendasiLitbang}"</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => handleExportPdfRapor(detailPenilaianView)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-xs flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Cetak PDF Rapor SDM
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
