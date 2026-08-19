import React, { useState, useMemo } from 'react';
import { 
  Santri, 
  Kamar, 
  PengasuhGuru, 
  TargetMasterItem, 
  RecordMutabaahSantri, 
  KategoriMutabaah,
  MutabaahItemResult,
  AbsensiSantriKamar,
  PenggunaApp
} from '../types';
import { 
  DEFAULT_TARGET_MASTERS, 
  calculateMutabaahItemResult,
  generateMockRecordForSantri 
} from '../data/mockMutabaah';
import { 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  FileText, 
  Printer, 
  Download, 
  Upload, 
  Save, 
  Calendar, 
  Sparkles, 
  Award, 
  TrendingUp, 
  Users, 
  Heart, 
  BookOpen, 
  Dumbbell, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft,
  UserCheck,
  Zap,
  BarChart3,
  Layers,
  Database,
  RefreshCw,
  FileSpreadsheet,
  Check,
  Star,
  Info,
  Trophy,
  Building2,
  ClipboardList,
  FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { downloadMutabaahWithGamificationPDF } from '../utils/pdfMutabaahExporter';
import PDFExportModal from './PDFExportModal';

interface MutabaahSantriProps {
  santri: Santri[];
  kamar: Kamar[];
  guru: PengasuhGuru[];
  penggunaList?: PenggunaApp[];
  mutabaahTargets: TargetMasterItem[];
  mutabaahRecords: RecordMutabaahSantri[];
  onSaveTarget: (target: TargetMasterItem) => void;
  onDeleteTarget?: (id: string) => void;
  onResetTargets?: () => void;
  onSaveRecord: (record: RecordMutabaahSantri) => void;
  onBatchSaveRecords: (records: RecordMutabaahSantri[]) => void;
  onDeleteRecord: (id: string) => void;
  onClearAllMutabaahRecords?: () => void;
  onUpdateKamarAttendance?: (idKamar: string, absensi: AbsensiSantriKamar[]) => void;
  userRole: 'ADMIN' | 'PENGASUHAN' | 'AKADEMIK';
  username: string;
}

export default function MutabaahSantri({
  santri,
  kamar,
  guru,
  penggunaList = [],
  mutabaahTargets,
  mutabaahRecords,
  onSaveTarget,
  onDeleteTarget,
  onResetTargets,
  onSaveRecord,
  onBatchSaveRecords,
  onDeleteRecord,
  onClearAllMutabaahRecords,
  onUpdateKamarAttendance,
  userRole,
  username
}: MutabaahSantriProps) {

  // Effective target sheet items (uses Firestore targets or default masters fallback)
  const masterTargets = useMemo(() => {
    if (mutabaahTargets.length >= 33) return mutabaahTargets;
    if (mutabaahTargets.length === 0) return DEFAULT_TARGET_MASTERS;
    // Smart merge: guarantee all 33 criteria items are present
    const map = new Map<string, TargetMasterItem>();
    DEFAULT_TARGET_MASTERS.forEach(t => map.set(t.id, t));
    mutabaahTargets.forEach(t => map.set(t.id, t));
    return Array.from(map.values());
  }, [mutabaahTargets]);

  // Active View Tab inside Mutaba'ah
  const [activeTab, setActiveTab] = useState<'dashboard' | 'input' | 'absensikamar' | 'mastersheet' | 'massexport' | 'backup'>('dashboard');

  // Active Perspective Role Switcher (Musyrif, Kepala Asrama, Mudir, Orang Tua)
  const [roleView, setRoleView] = useState<'MUSYRIF' | 'KEPALA_ASRAMA' | 'MUDIR' | 'ORANG_TUA'>('MUSYRIF');

  // --- STATE PROTEKSI & ISOLASI AKSES WALI KAMAR ---
  const [isWaliKamarMode, setIsWaliKamarMode] = useState<boolean>(false);
  const [lockedWaliKamarName, setLockedWaliKamarName] = useState<string>('');

  // Current logged in user object from penggunaList
  const currentUserObj = useMemo(() => {
    if (!penggunaList || !username) return null;
    return penggunaList.find(u => u.username.toLowerCase() === username.toLowerCase() || u.namaLengkap.toLowerCase().includes(username.toLowerCase()));
  }, [penggunaList, username]);

  // List of Kamar IDs assigned directly to current logged-in user
  const userAssignedKamarIds = useMemo(() => {
    if (currentUserObj && currentUserObj.assignedKamarIds && currentUserObj.assignedKamarIds.length > 0) {
      return currentUserObj.assignedKamarIds;
    }
    return [];
  }, [currentUserObj]);

  // Extract distinct list of Wali Kamar names from kamar data
  const listWaliKamar = useMemo(() => {
    const setWali = new Set<string>();
    kamar.forEach(k => {
      if (k.waliKamar && k.waliKamar.trim()) {
        setWali.add(k.waliKamar.trim());
      }
    });
    return Array.from(setWali);
  }, [kamar]);

  // General Filter States
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [selectedKamarId, setSelectedKamarId] = useState<string>('');
  const [selectedGender, setSelectedGender] = useState<'semua' | 'Laki-laki' | 'Perempuan'>('semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Toast feedback state
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [pdfModalRecord, setPdfModalRecord] = useState<RecordMutabaahSantri | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // --- STATE FOR ABSENSI HARIAN KAMAR ---
  const [selectedRoomIdAbsensi, setSelectedRoomIdAbsensi] = useState<string>(() => kamar.length > 0 ? kamar[0].id : '');
  const [attendanceDate, setAttendanceDate] = useState<string>(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [tempAttendance, setTempAttendance] = useState<AbsensiSantriKamar[]>([]);
  const [absensiGenderFilter, setAbsensiGenderFilter] = useState<'semua' | 'putra' | 'putri'>('semua');

  // Format Indonesian Date Helper
  const formatTanggalIndo = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const bulanIndo = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const tgl = parseInt(parts[2], 10);
    const bln = parseInt(parts[1], 10) - 1;
    const thn = parts[0];
    return `${tgl} ${bulanIndo[bln]} ${thn}`;
  };

  // Active room for attendance tab
  const activeRoomAbsensi = useMemo(() => {
    return kamar.find(k => k.id === selectedRoomIdAbsensi) || kamar[0];
  }, [kamar, selectedRoomIdAbsensi]);

  // Filtered rooms for attendance tab
  const filteredKamarAbsensi = useMemo(() => {
    return kamar.filter(k => {
      if (userAssignedKamarIds.length > 0) {
        if (!userAssignedKamarIds.includes(k.id)) return false;
      } else if (isWaliKamarMode && lockedWaliKamarName) {
        if (k.waliKamar !== lockedWaliKamarName) return false;
      }
      if (absensiGenderFilter === 'putra') return k.gedung.toLowerCase().includes('putra');
      if (absensiGenderFilter === 'putri') return k.gedung.toLowerCase().includes('putri');
      return true;
    });
  }, [kamar, absensiGenderFilter, isWaliKamarMode, lockedWaliKamarName, userAssignedKamarIds]);

  // Load attendance list when active room changes
  React.useEffect(() => {
    if (activeRoomAbsensi) {
      const activeSantriInRoom = santri.filter(s => s.idKamar === activeRoomAbsensi.id && s.status === 'Aktif');
      const list = activeSantriInRoom.map(s => {
        const existing = activeRoomAbsensi.absensiHariIni?.find(a => a.idSantri === s.id);
        return {
          idSantri: s.id,
          namaSantri: s.nama,
          statusKamar: existing ? existing.statusKamar : ('Hadir' as const)
        };
      });
      setTempAttendance(list);
    }
  }, [selectedRoomIdAbsensi, activeRoomAbsensi, santri]);

  // Toggle single student attendance status in kamar
  const toggleAttendanceStatus = (idSantri: string, status: 'Hadir' | 'Izin' | 'Sakit' | 'Tanpa Keterangan') => {
    setTempAttendance(prev => 
      prev.map(item => item.idSantri === idSantri ? { ...item, statusKamar: status } : item)
    );
  };

  // Save room attendance
  const handleSaveAttendance = () => {
    if (!activeRoomAbsensi) return;
    if (onUpdateKamarAttendance) {
      onUpdateKamarAttendance(activeRoomAbsensi.id, tempAttendance);
    }
    showToast(`Berhasil menyimpan presensi kamar "${activeRoomAbsensi.namaKamar}" untuk tanggal ${formatTanggalIndo(attendanceDate)}!`);
  };

  // Export Room Attendance Recap to PDF
  const handleExportKamarPDF = () => {
    if (!activeRoomAbsensi) return;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Green Header bar
    doc.setFillColor(31, 62, 41);
    doc.rect(10, 10, 190, 4, 'F');

    // Title Pondok
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(31, 62, 41);
    doc.text('PONDOK PESANTREN DARUL ARIFIN JAMBI', 105, 22, { align: 'center' });

    // Subtitle
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text('Sistem Administrasi Terpadu & Portal Monitoring Santri (SATDAF)', 105, 27, { align: 'center' });
    doc.text('Jl. Lintas Jambi - Ma. Bulian KM 21, Pijoan, Kec. Jambi Luar Kota, Kab. Muaro Jambi', 105, 31, { align: 'center' });

    // Divider Lines
    doc.setDrawColor(180, 150, 80);
    doc.setLineWidth(0.5);
    doc.line(10, 34, 200, 34);
    doc.setDrawColor(31, 62, 41);
    doc.setLineWidth(1);
    doc.line(10, 35.5, 200, 35.5);

    // Document Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('LAPORAN REKAPITULASI PRESENSI HARIAN ASRAMA', 105, 43, { align: 'center' });

    // Metadata
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');
    doc.text('DATA ASRAMA:', 10, 52);

    doc.setFont('Helvetica', 'normal');
    doc.text(`Kamar Asrama  : ${activeRoomAbsensi.namaKamar}`, 10, 57);
    doc.text(`Gedung/Asrama : ${activeRoomAbsensi.gedung}`, 10, 62);
    doc.text(`Wali Kamar    : ${activeRoomAbsensi.waliKamar || 'Belum ditentukan'}`, 10, 67);

    doc.text(`Tanggal Rekap  : ${formatTanggalIndo(attendanceDate)}`, 130, 57);
    doc.text(`Waktu Cetak    : ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB`, 130, 62);
    doc.text(`Status Laporan : Terverifikasi`, 130, 67);

    // Table Columns & Rows
    const tableHeaders = [['No', 'Nama Santri', 'NISN', 'Kelas', 'Status Kehadiran', 'Keterangan']];
    const tableData = tempAttendance.map((attend, idx) => {
      const s = santri.find(item => item.id === attend.idSantri);
      return [
        idx + 1,
        attend.namaSantri.toUpperCase(),
        s?.nis || '-',
        s?.kelas || '-',
        attend.statusKamar === 'Tanpa Keterangan' ? 'ALPA (A)' : attend.statusKamar.toUpperCase(),
        attend.statusKamar === 'Hadir' ? 'Terverifikasi di Kamar' : 'Berhalangan di Kamar'
      ];
    });

    // Generate table with jspdf-autotable
    autoTable(doc, {
      startY: 72,
      head: tableHeaders,
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [31, 62, 41],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { fontStyle: 'bold', cellWidth: 55 },
        2: { halign: 'center', cellWidth: 25 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', fontStyle: 'bold', cellWidth: 35 },
        5: { cellWidth: 43 }
      },
      didParseCell: function(data: any) {
        if (data.section === 'body' && data.column.index === 4) {
          const val = data.cell.raw;
          if (val === 'ALPA (A)') {
            data.cell.styles.textColor = [185, 28, 28];
          } else if (val === 'HADIR') {
            data.cell.styles.textColor = [21, 128, 61];
          } else if (val === 'IZIN' || val === 'SAKIT') {
            data.cell.styles.textColor = [180, 130, 20];
          }
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 150;

    // Statistics Summary Box
    const startStatY = finalY + 8;
    if (startStatY < 240) {
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(226, 232, 240);
      doc.roundedRect(10, startStatY, 190, 18, 2, 2, 'FD');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('RINGKASAN KEHADIRAN KAMAR:', 15, startStatY + 5);

      doc.setFont('Helvetica', 'normal');
      const total = tempAttendance.length;
      const hadir = tempAttendance.filter(t => t.statusKamar === 'Hadir').length;
      const izin = tempAttendance.filter(t => t.statusKamar === 'Izin').length;
      const sakit = tempAttendance.filter(t => t.statusKamar === 'Sakit').length;
      const alpa = tempAttendance.filter(t => t.statusKamar === 'Tanpa Keterangan').length;

      doc.text(`Total Santri: ${total} Orang   |   Hadir: ${hadir}   |   Izin: ${izin}   |   Sakit: ${sakit}   |   Alpa: ${alpa}`, 15, startStatY + 12);
    }

    // Signature segment
    const startSigY = finalY + 34;
    if (startSigY < 250) {
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(30, 41, 59);

      doc.text(`Muaro Jambi, ${formatTanggalIndo(attendanceDate)}`, 140, startSigY);

      doc.text('Mengetahui / Melaporkan,', 15, startSigY + 6);
      doc.setFont('Helvetica', 'bold');
      doc.text('Wali Kamar Asrama', 15, startSigY + 11);
      doc.line(15, startSigY + 32, 65, startSigY + 32);
      doc.setFont('Helvetica', 'normal');
      doc.text(activeRoomAbsensi.waliKamar || '( ________________________ )', 15, startSigY + 36);

      doc.text('Menyetujui,', 140, startSigY + 6);
      doc.setFont('Helvetica', 'bold');
      
      const isPutri = activeRoomAbsensi.gedung.toLowerCase().includes('putri');
      const kepalaTitle = isPutri ? 'Kepala Pengasuhan Santri Putri' : 'Kepala Pengasuhan Santri Putra';
      const kepalaName = isPutri ? 'Tri Lestari, S.Pd' : 'Kenny Syah Putra, S.Ag, S.Pd';

      doc.text(kepalaTitle, 140, startSigY + 11);
      doc.line(140, startSigY + 32, 190, startSigY + 32);
      doc.setFont('Helvetica', 'normal');
      doc.text(kepalaName, 140, startSigY + 36);
    }

    const fileName = `PRESENSI_KAMAR_${activeRoomAbsensi.namaKamar.replace(/\s+/g, '_')}_${attendanceDate}.pdf`;
    
    try {
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
    } catch (e) {
      console.warn('Direct Blob download failed, falling back to doc.save:', e);
      doc.save(fileName);
    }
  };

  // --- STATE FOR INPUT FORM ---
  const [inputSantriId, setInputSantriId] = useState<string>('');
  const [inputCapaians, setInputCapaians] = useState<{ [programId: string]: number }>({});
  const [catatanMusyrif, setCatatanMusyrif] = useState<string>('');
  const [rekomendasiMusyrif, setRekomendasiMusyrif] = useState<string>('');
  const [selectedAutoFillItemId, setSelectedAutoFillItemId] = useState<string>('');

  // --- DIAGRAM STATUS KAMAR STATE ---
  const [diagramStatusFilter, setDiagramStatusFilter] = useState<'semua' | 'sudah' | 'sebagian' | 'belum'>('semua');
  const [diagramViewMode, setDiagramViewMode] = useState<'bars' | 'grid'>('bars');

  // Selected Santri object for Input
  const selectedInputSantri = useMemo(() => {
    return santri.find(s => s.id === inputSantriId);
  }, [santri, inputSantriId]);

  // Selected Kamar for Input
  const selectedInputKamar = useMemo(() => {
    if (!selectedInputSantri) return kamar.find(k => k.id === selectedKamarId);
    return kamar.find(k => k.id === selectedInputSantri.idKamar);
  }, [kamar, selectedInputSantri, selectedKamarId]);

  // Load existing record into input form if already saved
  const handleSelectSantriForInput = (santriId: string) => {
    setInputSantriId(santriId);
    const sObj = santri.find(s => s.id === santriId);
    if (!sObj) return;

    // Check if record exists for this santri & date
    const existing = mutabaahRecords.find(r => r.idSantri === santriId && r.tanggal === selectedDate);
    const initialMap: { [key: string]: number } = {};

    masterTargets.forEach(tm => {
      if (existing) {
        const found = existing.items.find(i => i.programId === tm.id || i.programName === tm.program);
        initialMap[tm.id] = found ? found.capaian : 0;
      } else {
        initialMap[tm.id] = 0;
      }
    });

    setInputCapaians(initialMap);
    setCatatanMusyrif(existing?.catatanMusyrif || '');
    setRekomendasiMusyrif(existing?.rekomendasi || '');
  };

  // Stepper / Switch value change handler
  const handleCapaianChange = (programId: string, val: number) => {
    setInputCapaians(prev => ({
      ...prev,
      [programId]: Math.max(0, val)
    }));
  };

  // Quick fill all targets button for single santri
  const handleQuickFillTarget = () => {
    const fullMap: { [key: string]: number } = {};
    masterTargets.forEach(tm => {
      fullMap[tm.id] = tm.target;
    });
    setInputCapaians(fullMap);
    showToast('Telah mengisi seluruh item form santri ini sesuai nilai target ideal!');
  };

  // Auto-Fill 1 SPECIFIC Target Item for ALL santri in selected room with 1-click
  const handleFillItemForKamar = (targetItem: TargetMasterItem) => {
    if (!selectedKamarId) {
      alert('Silakan pilih kamar terlebih dahulu!');
      return;
    }

    const kObj = kamar.find(k => k.id === selectedKamarId);
    const roomSantriList = santri.filter(s => s.idKamar === selectedKamarId && s.status === 'Aktif');

    if (roomSantriList.length === 0) {
      alert(`Tidak ada santri aktif di ${kObj?.namaKamar || 'kamar ini'}.`);
      return;
    }

    const batchRecords: RecordMutabaahSantri[] = roomSantriList.map(s => {
      const existingRec = mutabaahRecords.find(r => r.idSantri === s.id && r.tanggal === selectedDate);
      
      const capaianMap: { [key: string]: number } = {};
      masterTargets.forEach(tm => {
        if (existingRec) {
          const itemRes = existingRec.items.find(it => it.programId === tm.id || it.programName === tm.program);
          capaianMap[tm.id] = itemRes ? itemRes.capaian : 0;
        } else {
          capaianMap[tm.id] = 0;
        }
      });

      // Update ONLY the specific target item to full target!
      capaianMap[targetItem.id] = targetItem.target;

      const itemsResult: MutabaahItemResult[] = masterTargets.map(tm => {
        const cap = capaianMap[tm.id] || 0;
        return calculateMutabaahItemResult(tm, cap);
      });

      const totalSkor = itemsResult.reduce((sum, item) => sum + item.skor, 0);
      const avgPct = Math.round(itemsResult.reduce((sum, item) => sum + item.persentase, 0) / (itemsResult.length || 1));

      return {
        id: existingRec ? existingRec.id : `mutabaah_${s.id}_${selectedDate}`,
        idSantri: s.id,
        namaSantri: s.nama,
        nisSantri: s.nis,
        idKamar: s.idKamar,
        namaKamar: kObj ? kObj.namaKamar : 'Kamar Asrama',
        musyrifNama: kObj?.waliKamar || username || 'Musyrif Asrama',
        tanggal: selectedDate,
        items: itemsResult,
        totalSkor,
        rataRataPersentase: avgPct,
        catatanMusyrif: existingRec?.catatanMusyrif || 'Catatan terisi per item otomatis.',
        rekomendasi: existingRec?.rekomendasi || 'Pertahankan ketekunan ibadah.',
        updatedAt: new Date().toISOString()
      };
    });

    onBatchSaveRecords(batchRecords);

    // If currently selected input santri is in this room, update inputCapaians UI for that item
    if (selectedInputSantri && selectedInputSantri.idKamar === selectedKamarId) {
      setInputCapaians(prev => ({
        ...prev,
        [targetItem.id]: targetItem.target
      }));
    }

    showToast(`⚡ Auto-Fill "${targetItem.program}" (${targetItem.target} ${targetItem.satuan}) terisi untuk seluruh ${roomSantriList.length} santri di ${kObj?.namaKamar}!`);
  };

  // Submit Mutaba'ah Entry
  const handleSaveMutabaah = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInputSantri) {
      alert('Pilih santri terlebih dahulu!');
      return;
    }

    const itemsResult: MutabaahItemResult[] = masterTargets.map(tm => {
      const cap = inputCapaians[tm.id] || 0;
      return calculateMutabaahItemResult(tm, cap);
    });

    const totalSkor = itemsResult.reduce((sum, item) => sum + item.skor, 0);
    const avgPct = Math.round(itemsResult.reduce((sum, item) => sum + item.persentase, 0) / itemsResult.length);

    const kObj = kamar.find(k => k.id === selectedInputSantri.idKamar);

    const newRecord: RecordMutabaahSantri = {
      id: `mutabaah_${selectedInputSantri.id}_${selectedDate}`,
      idSantri: selectedInputSantri.id,
      namaSantri: selectedInputSantri.nama,
      nisSantri: selectedInputSantri.nis,
      idKamar: selectedInputSantri.idKamar,
      namaKamar: kObj ? kObj.namaKamar : 'Tanpa Kamar',
      musyrifNama: kObj?.waliKamar || username || 'Musyrif Asrama',
      tanggal: selectedDate,
      items: itemsResult,
      totalSkor,
      rataRataPersentase: avgPct,
      catatanMusyrif: catatanMusyrif.trim() || 'Tetap istiqomah menjalankan target ibadah harian.',
      rekomendasi: rekomendasiMusyrif.trim() || 'Pertahankan hafalan & kehadiran jamaah tepat waktu.',
      updatedAt: new Date().toISOString()
    };

    onSaveRecord(newRecord);
    showToast(`Berhasil menyimpan Mutabaah Yaumiyah Santri untuk ${selectedInputSantri.nama}!`);
  };

  // --- STATE FOR ORANG TUA SEARCH ---
  const [parentQuery, setParentQuery] = useState<string>('');
  const [selectedParentSantri, setSelectedParentSantri] = useState<Santri | null>(null);

  // Search Santri for Parent Portal
  const handleSearchParentSantri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentQuery.trim()) return;
    const q = parentQuery.toLowerCase().trim();
    const found = santri.find(s => s.nis.toLowerCase() === q || s.nama.toLowerCase().includes(q));
    if (found) {
      setSelectedParentSantri(found);
    } else {
      alert('Santri dengan NISN atau Nama tersebut tidak ditemukan.');
    }
  };

  // Record for selected Parent Santri
  const parentSantriRecord = useMemo(() => {
    if (!selectedParentSantri) return null;
    return mutabaahRecords.find(r => r.idSantri === selectedParentSantri.id && r.tanggal === selectedDate) 
      || generateMockRecordForSantri(
          selectedParentSantri.id,
          selectedParentSantri.nama,
          selectedParentSantri.nis,
          selectedParentSantri.idKamar,
          kamar.find(k => k.id === selectedParentSantri.idKamar)?.namaKamar || 'Arafah 01',
          kamar.find(k => k.id === selectedParentSantri.idKamar)?.waliKamar || 'Ustadz Musyrif',
          selectedDate,
          1.0,
          masterTargets
        );
  }, [selectedParentSantri, selectedDate, mutabaahRecords, kamar, masterTargets]);

  // --- STATE FOR MASTER SHEET TARGET EDITOR ---
  const [editingTargetItem, setEditingTargetItem] = useState<TargetMasterItem | null>(null);
  const [isAddingTarget, setIsAddingTarget] = useState<boolean>(false);

  // Handle Save Master Sheet Item
  const handleSaveMasterItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetItem) return;
    onSaveTarget(editingTargetItem);
    setEditingTargetItem(null);
    setIsAddingTarget(false);
    showToast(`Master target "${editingTargetItem.program}" berhasil diperbarui!`);
  };

  // --- PDF GENERATION SINGLE & MASS WITH GAMIFIKASI & GAME ACHIEVEMENTS ---
  const handleExportPDFSingle = (record: RecordMutabaahSantri) => {
    setPdfModalRecord(record);
  };

  // Mass Export Batch PDFs for Selected Kamar
  const handleMassExportPDF = () => {
    if (!selectedKamarId) {
      alert('Silakan pilih kamar untuk cetak PDF massal!');
      return;
    }

    const kObj = kamar.find(k => k.id === selectedKamarId);
    const roomSantriList = santri.filter(s => s.idKamar === selectedKamarId);

    if (roomSantriList.length === 0) {
      alert('Tidak ada santri di kamar ini.');
      return;
    }

    showToast(`Memproses ${roomSantriList.length} laporan PDF untuk kamar ${kObj?.namaKamar}...`);

    roomSantriList.forEach((st, idx) => {
      setTimeout(() => {
        let rec = mutabaahRecords.find(r => r.idSantri === st.id && r.tanggal === selectedDate);
        if (!rec) {
          rec = generateMockRecordForSantri(
            st.id,
            st.nama,
            st.nis,
            st.idKamar,
            kObj?.namaKamar || 'Kamar Asrama',
            kObj?.waliKamar || 'Musyrif',
            selectedDate,
            1.0,
            masterTargets
          );
        }
        handleExportPDFSingle(rec);
      }, idx * 300);
    });
  };

  // Direct Browser Print
  const handleDirectPrint = () => {
    window.print();
  };

  // --- BACKUP & RESTORE JSON ---
  const handleExportBackupJSON = () => {
    const backupData = {
      app: 'SATDAF DARUL ARIFIN',
      module: 'MUTABA_AH_SANTRI',
      exportedAt: new Date().toISOString(),
      targets: masterTargets,
      records: mutabaahRecords
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SATDAF_Mutabaah_Backup_${selectedDate}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Berhasil mengunduh file backup JSON mutaba’ah!');
  };

  const handleImportBackupJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.targets && Array.isArray(json.targets)) {
          json.targets.forEach((t: TargetMasterItem) => onSaveTarget(t));
        }
        if (json.records && Array.isArray(json.records)) {
          onBatchSaveRecords(json.records);
        }
        showToast('Berhasil me-restore database mutaba’ah dari file backup!');
      } catch (err) {
        alert('Format file backup JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered Kamar list based on selected Gender, User Account Assignment, and Wali Kamar Lock Mode
  const filteredKamarList = useMemo(() => {
    return kamar.filter(k => {
      if (userAssignedKamarIds.length > 0) {
        if (!userAssignedKamarIds.includes(k.id)) return false;
      } else if (isWaliKamarMode && lockedWaliKamarName) {
        if (k.waliKamar !== lockedWaliKamarName) return false;
      }
      if (selectedGender === 'Laki-laki') {
        return k.gedung.includes('Putra');
      }
      if (selectedGender === 'Perempuan') {
        return k.gedung.includes('Putri');
      }
      return true;
    });
  }, [kamar, selectedGender, isWaliKamarMode, lockedWaliKamarName, userAssignedKamarIds]);

  // Auto-sync selected room & absensi room when User Account Assignment or Wali Kamar Lock mode is active
  React.useEffect(() => {
    if (userAssignedKamarIds.length > 0) {
      if (!selectedKamarId || !userAssignedKamarIds.includes(selectedKamarId)) {
        setSelectedKamarId(userAssignedKamarIds[0]);
      }
      if (!selectedRoomIdAbsensi || !userAssignedKamarIds.includes(selectedRoomIdAbsensi)) {
        setSelectedRoomIdAbsensi(userAssignedKamarIds[0]);
      }
    } else if (isWaliKamarMode && lockedWaliKamarName) {
      const assignedRooms = kamar.filter(k => k.waliKamar === lockedWaliKamarName);
      if (assignedRooms.length > 0) {
        const isCurrentSelectedValid = assignedRooms.some(k => k.id === selectedKamarId);
        if (!isCurrentSelectedValid) {
          setSelectedKamarId(assignedRooms[0].id);
        }
        const isCurrentAbsensiValid = assignedRooms.some(k => k.id === selectedRoomIdAbsensi);
        if (!isCurrentAbsensiValid) {
          setSelectedRoomIdAbsensi(assignedRooms[0].id);
        }
      }
    }
  }, [isWaliKamarMode, lockedWaliKamarName, kamar, selectedKamarId, selectedRoomIdAbsensi, userAssignedKamarIds]);

  // Handler to switch gender filter and maintain clean selected room & santri states
  const handleGenderFilterChange = (gender: 'semua' | 'Laki-laki' | 'Perempuan') => {
    setSelectedGender(gender);

    // Reset selected room if it doesn't match the newly selected gender filter
    if (selectedKamarId && gender !== 'semua') {
      const kObj = kamar.find(k => k.id === selectedKamarId);
      if (kObj) {
        const isPutra = kObj.gedung.includes('Putra');
        if ((gender === 'Laki-laki' && !isPutra) || (gender === 'Perempuan' && isPutra)) {
          setSelectedKamarId('');
        }
      }
    }

    // Reset selected santri if they don't match the new gender filter
    if (inputSantriId && gender !== 'semua') {
      const sObj = santri.find(s => s.id === inputSantriId);
      if (sObj && sObj.gender !== gender) {
        setInputSantriId('');
      }
    }
  };

  // --- STATISTICAL COMPUTATIONS FOR DASHBOARDS ---
  const filteredSantriList = useMemo(() => {
    return santri.filter(s => {
      if (userAssignedKamarIds.length > 0) {
        if (!userAssignedKamarIds.includes(s.idKamar)) return false;
      } else if (isWaliKamarMode && lockedWaliKamarName) {
        const kObj = kamar.find(k => k.id === s.idKamar);
        if (!kObj || kObj.waliKamar !== lockedWaliKamarName) return false;
      }
      if (selectedKamarId && s.idKamar !== selectedKamarId) return false;
      if (selectedGender !== 'semua' && s.gender !== selectedGender) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return s.nama.toLowerCase().includes(q) || s.nis.toLowerCase().includes(q);
      }
      return true;
    });
  }, [santri, selectedKamarId, selectedGender, searchQuery, isWaliKamarMode, lockedWaliKamarName, kamar, userAssignedKamarIds]);

  // Today's records map for fast lookup
  const todayRecordsMap = useMemo(() => {
    const map = new Map<string, RecordMutabaahSantri>();
    mutabaahRecords.filter(r => r.tanggal === selectedDate).forEach(r => {
      map.set(r.idSantri, r);
    });
    return map;
  }, [mutabaahRecords, selectedDate]);

  // Total input count
  const alreadyInputCount = useMemo(() => {
    return filteredSantriList.filter(s => todayRecordsMap.has(s.id)).length;
  }, [filteredSantriList, todayRecordsMap]);

  const notYetInputCount = filteredSantriList.length - alreadyInputCount;

  // --- KAMAR INPUT STATUS COMPUTATION FOR DIAGRAM & CHART ---
  const kamarInputStatusList = useMemo(() => {
    return filteredKamarList.map(km => {
      const roomSantri = santri.filter(s => s.idKamar === km.id && s.status === 'Aktif');
      const totalSantri = roomSantri.length;
      const santriInputCount = roomSantri.filter(s => todayRecordsMap.has(s.id)).length;
      const santriBelumCount = totalSantri - santriInputCount;
      const pct = totalSantri > 0 ? Math.round((santriInputCount / totalSantri) * 100) : 0;

      let statusCategory: 'SUDAH' | 'SEBAGIAN' | 'BELUM' = 'BELUM';
      if (totalSantri > 0 && santriInputCount === totalSantri) {
        statusCategory = 'SUDAH';
      } else if (santriInputCount > 0) {
        statusCategory = 'SEBAGIAN';
      } else {
        statusCategory = 'BELUM';
      }

      return {
        kamar: km,
        totalSantri,
        santriInputCount,
        santriBelumCount,
        pct,
        statusCategory,
        waliKamar: km.waliKamar || 'Musyrif Asrama',
        roomSantri
      };
    });
  }, [filteredKamarList, santri, todayRecordsMap]);

  const kamarSudahCount = useMemo(() => kamarInputStatusList.filter(k => k.statusCategory === 'SUDAH').length, [kamarInputStatusList]);
  const kamarSebagianCount = useMemo(() => kamarInputStatusList.filter(k => k.statusCategory === 'SEBAGIAN').length, [kamarInputStatusList]);
  const kamarBelumCount = useMemo(() => kamarInputStatusList.filter(k => k.statusCategory === 'BELUM').length, [kamarInputStatusList]);

  const filteredDiagramKamarList = useMemo(() => {
    return kamarInputStatusList.filter(item => {
      if (diagramStatusFilter === 'sudah') return item.statusCategory === 'SUDAH';
      if (diagramStatusFilter === 'sebagian') return item.statusCategory === 'SEBAGIAN';
      if (diagramStatusFilter === 'belum') return item.statusCategory === 'BELUM';
      return true;
    });
  }, [kamarInputStatusList, diagramStatusFilter]);

  // Category Colors mapping
  const categoryBgMap: { [key in KategoriMutabaah]: string } = {
    'SPIRITUAL DISCIPLINE': 'bg-emerald-50 border-emerald-200 text-emerald-800',
    'DZIKIR': 'bg-amber-50 border-amber-200 text-amber-800',
    'AL-QUR\'AN': 'bg-teal-50 border-teal-200 text-teal-800',
    'ILMU': 'bg-blue-50 border-blue-200 text-blue-800',
    'HEALTHY LIFE': 'bg-rose-50 border-rose-200 text-rose-800',
    'CHARACTER': 'bg-purple-50 border-purple-200 text-purple-800'
  };

  return (
    <div className="space-y-6 pb-12" id="mutabaah-container">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-nature-forest text-white px-4 py-3 rounded-2xl shadow-xl border border-nature-gold/40 flex items-center gap-3 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-nature-gold animate-spin" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-nature-forest-dark via-nature-forest to-[#1A3823] text-white p-6 rounded-3xl shadow-lg border border-nature-border/30 relative overflow-hidden">
        {/* Islamic star pattern overlay */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-nature-gold/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-gold/15 text-nature-gold text-[10px] font-extrabold uppercase tracking-wider border border-nature-gold/30">
              <Zap className="w-3.5 h-3.5" /> Mutabaah Yaumiyah Santri
            </div>
            <h1 className="text-2xl font-black font-serif tracking-wide text-white">
              Mutabaah Yaumiyah Santri
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Sistem pencatatan dan evaluasi kedisiplinan spiritual, ibadah, tahfidz, dzikir, serta karakter santri Pondok Pesantren Darul Arifin Jambi.
            </p>
          </div>

          {/* Role Perspective Switcher Pills */}
          <div className="bg-nature-forest-dark/80 p-1.5 rounded-2xl border border-white/10 flex flex-wrap gap-1">
            <button
              onClick={() => setRoleView('MUSYRIF')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleView === 'MUSYRIF' ? 'bg-nature-gold text-nature-forest-dark shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🟢 Musyrif
            </button>
            <button
              onClick={() => setRoleView('KEPALA_ASRAMA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleView === 'KEPALA_ASRAMA' ? 'bg-nature-gold text-nature-forest-dark shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🔵 Kepala Asrama
            </button>
            <button
              onClick={() => setRoleView('MUDIR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleView === 'MUDIR' ? 'bg-nature-gold text-nature-forest-dark shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🟣 Mudir
            </button>
            <button
              onClick={() => setRoleView('ORANG_TUA')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                roleView === 'ORANG_TUA' ? 'bg-nature-gold text-nature-forest-dark shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              🟠 Orang Tua
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'dashboard' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Dashboard
          </button>

          <button
            onClick={() => setActiveTab('input')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'input' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Edit3 className="w-4 h-4" /> Input Mutabaah Yaumiyah Santri
          </button>

          <button
            onClick={() => setActiveTab('absensikamar')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'absensikamar' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Absensi Harian Kamar
          </button>

          <button
            onClick={() => setActiveTab('mastersheet')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'mastersheet' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> Master Target & Dalil
          </button>

          <button
            onClick={() => setActiveTab('massexport')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'massexport' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Printer className="w-4 h-4" /> Export PDF Massal
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'backup' ? 'bg-white text-nature-forest shadow-md' : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Database className="w-4 h-4" /> Backup & Restore
          </button>
        </div>
      </div>

      {/* BARIS KONTROL & PROTEKSI ISOLASI HAK AKSES WALI KAMAR */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-4.5 rounded-3xl border border-emerald-800/60 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4" id="wali-kamar-isolation-bar">
        <div className="flex items-start md:items-center gap-3.5">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Proteksi & Isolasi Akses Wali Kamar</span>
              {(userAssignedKamarIds.length > 0 || isWaliKamarMode) && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] font-black border border-emerald-500/40 animate-pulse flex items-center gap-1">
                  <span>🔒</span> HAK AKSES TERKUNCI
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300">
              {userAssignedKamarIds.length > 0
                ? `Akun "${currentUserObj?.namaLengkap || username}" terhubung ke ${userAssignedKamarIds.length} Kamar Binaan (${userAssignedKamarIds.map(id => kamar.find(k => k.id === id)?.namaKamar || id).join(', ')}). Pengisian mutaba'ah & absensi terkunci otomatis.`
                : isWaliKamarMode && lockedWaliKamarName
                ? `Mode Musyrif/Wali Kamar Aktif: "${lockedWaliKamarName}". Seluruh pengisian & presensi dikunci khusus untuk kamar kelolaan beliau.`
                : 'Pilih nama Wali Kamar atau atur Penugasan Kamar di menu Role & Akses Pengguna untuk mengisolasi input santri.'}
            </p>
          </div>
        </div>

        {userAssignedKamarIds.length === 0 && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-emerald-500/30">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <select
                value={lockedWaliKamarName}
                onChange={(e) => {
                  const val = e.target.value;
                  setLockedWaliKamarName(val);
                  if (val) {
                    setIsWaliKamarMode(true);
                    showToast(`🔒 Akses dikunci khusus untuk Wali Kamar: "${val}"`);
                  } else {
                    setIsWaliKamarMode(false);
                    showToast('🔓 Mode umum dinonaktifkan (Akses Seluruh Kamar)');
                  }
                }}
                className="bg-transparent text-white text-xs font-extrabold focus:outline-none cursor-pointer pr-2"
              >
                <option value="" className="bg-slate-900 text-slate-300">-- Mode Pengurus Utama (Semua Kamar) --</option>
                {listWaliKamar.map((wName, idx) => (
                  <option key={idx} value={wName} className="bg-slate-900 text-emerald-300 font-bold">
                    🔒 Khusus Kamar Wali: {wName}
                  </option>
                ))}
              </select>
            </div>

            {isWaliKamarMode && (
              <button
                type="button"
                onClick={() => {
                  setIsWaliKamarMode(false);
                  setLockedWaliKamarName('');
                  showToast('🔓 Mode isolasi Wali Kamar dinonaktifkan (Buka Semua Kamar)');
                }}
                className="px-3.5 py-2 bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700 rounded-2xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shadow-sm"
              >
                Buka Akses Semua Kamar
              </button>
            )}
          </div>
        )}
      </div>
      <div className="bg-white p-4 rounded-2xl border border-nature-border/60 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <div className="flex items-center gap-2 bg-nature-beige/30 px-3 py-1.5 rounded-xl border border-nature-border">
            <Calendar className="w-4 h-4 text-nature-forest" />
            <span className="text-xs font-bold text-slate-600">Tanggal:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-nature-forest focus:outline-none cursor-pointer"
            />
          </div>

          {/* Kamar Filter */}
          <div className="flex items-center gap-2 bg-nature-beige/30 px-3 py-1.5 rounded-xl border border-nature-border">
            <Filter className="w-4 h-4 text-nature-forest" />
            <span className="text-xs font-bold text-slate-600">Kamar:</span>
            <select
              value={selectedKamarId}
              onChange={(e) => setSelectedKamarId(e.target.value)}
              className="bg-transparent text-xs font-extrabold text-nature-forest focus:outline-none cursor-pointer"
            >
              <option value="">-- Semua Kamar --</option>
              {filteredKamarList.map(k => (
                <option key={k.id} value={k.id}>{k.namaKamar} ({k.gedung})</option>
              ))}
            </select>
          </div>

          {/* Asrama / Gender Filter */}
          <div className="flex items-center gap-2 bg-nature-beige/30 px-3 py-1.5 rounded-xl border border-nature-border">
            <span className="text-xs font-bold text-slate-600">Asrama:</span>
            <select
              value={selectedGender}
              onChange={(e) => handleGenderFilterChange(e.target.value as any)}
              className="bg-transparent text-xs font-extrabold text-nature-forest focus:outline-none cursor-pointer"
            >
              <option value="semua">Semua Asrama</option>
              <option value="Laki-laki">Asrama Putra</option>
              <option value="Perempuan">Asrama Putri</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Cari Santri / NISN..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-nature-beige/20 border border-nature-border rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
          />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. TAB DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Active Perspective Badge Indicator */}
          <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-700">
              <Info className="w-4 h-4 text-nature-forest" />
              <span>Perspektif Dashboard: </span>
              <span className="px-2.5 py-0.5 rounded-full bg-nature-forest text-white">
                {roleView === 'MUSYRIF' && 'Dashboard Musyrif Kamar'}
                {roleView === 'KEPALA_ASRAMA' && 'Dashboard Kepala Asrama'}
                {roleView === 'MUDIR' && 'Dashboard Mudir / Pimpinan Pesantren'}
                {roleView === 'ORANG_TUA' && 'Dashboard Ringkasan Orang Tua'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold">
              Terhubung ke Firestore & Google Sheet Target
            </span>
          </div>

          {/* KPI METRIC CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-nature-border/60 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Santri Target</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-800">{filteredSantriList.length}</span>
                <span className="text-xs text-slate-500 font-bold">Orang</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-nature-forest h-full w-full" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">Sudah Input Hari Ini</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700">{alreadyInputCount}</span>
                <span className="text-xs font-extrabold text-emerald-600">
                  {filteredSantriList.length > 0 ? Math.round((alreadyInputCount / filteredSantriList.length) * 100) : 0}%
                </span>
              </div>
              <div className="w-full bg-emerald-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-emerald-600 h-full transition-all" 
                  style={{ width: `${filteredSantriList.length > 0 ? (alreadyInputCount / filteredSantriList.length) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200/80 bg-rose-50/30 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block">Belum Input</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-rose-700">{notYetInputCount}</span>
                <span className="text-xs font-extrabold text-rose-600">Santri</span>
              </div>
              <div className="w-full bg-rose-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div 
                  className="bg-rose-500 h-full transition-all" 
                  style={{ width: `${filteredSantriList.length > 0 ? (notYetInputCount / filteredSantriList.length) * 100 : 0}%` }} 
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-nature-border/60 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Rata-rata Skor</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-nature-forest">
                  {alreadyInputCount > 0 
                    ? Math.round(
                        mutabaahRecords
                          .filter(r => r.tanggal === selectedDate)
                          .reduce((sum, r) => sum + r.totalSkor, 0) / alreadyInputCount
                      )
                    : '-'}
                </span>
                <span className="text-xs font-bold text-slate-500">Poin</span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-nature-gold h-full" style={{ width: alreadyInputCount > 0 ? '75%' : '0%' }} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-nature-border/60 shadow-sm space-y-1">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Persentase Capaian</span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-emerald-700">
                  {alreadyInputCount > 0 
                    ? `${Math.round(
                        mutabaahRecords
                          .filter(r => r.tanggal === selectedDate)
                          .reduce((sum, r) => sum + r.rataRataPersentase, 0) / alreadyInputCount
                      )}%`
                    : '-'}
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {alreadyInputCount > 0 ? 'Sesuai Target' : 'Belum Ada Input'}
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
                <div className="bg-emerald-500 h-full" style={{ width: alreadyInputCount > 0 ? `${Math.min(100, Math.round(mutabaahRecords.filter(r => r.tanggal === selectedDate).reduce((sum, r) => sum + r.rataRataPersentase, 0) / alreadyInputCount))}%` : '0%' }} />
              </div>
            </div>
          </div>

          {/* DIAGRAM STATUS INPUT PER KAMAR (ASRAMA) */}
          <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-5" id="diagram-status-kamar-section">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                  <Building2 className="w-3.5 h-3.5 text-emerald-700" /> Monitoring Status Asrama & Kamar
                </div>
                <h2 className="font-serif font-black text-xl text-slate-800 flex items-center gap-2">
                  <span>Diagram Status Input Mutabaah Per Kamar</span>
                  <span className="text-xs font-extrabold text-nature-forest font-sans bg-nature-beige/60 px-2.5 py-1 rounded-lg border border-nature-border">
                    {selectedDate}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Diagram real-time status pengisian mutabaah harian santri oleh Musyrif / Wali Kamar di tiap asrama.
                </p>
              </div>

              {/* Filter Buttons & View Mode Controls */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Status Filters */}
                <div className="bg-slate-100 p-1 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDiagramStatusFilter('semua')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                      diagramStatusFilter === 'semua' ? 'bg-white text-slate-800 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua ({kamarInputStatusList.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagramStatusFilter('sudah')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      diagramStatusFilter === 'sudah' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sudah ({kamarSudahCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagramStatusFilter('sebagian')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      diagramStatusFilter === 'sebagian' ? 'bg-amber-500 text-white shadow-sm' : 'text-amber-700 hover:bg-amber-50'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" /> Sebagian ({kamarSebagianCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagramStatusFilter('belum')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                      diagramStatusFilter === 'belum' ? 'bg-rose-600 text-white shadow-sm' : 'text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" /> Belum ({kamarBelumCount})
                  </button>
                </div>

                {/* View Mode Toggle: Bars vs Grid Cards */}
                <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDiagramViewMode('bars')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      diagramViewMode === 'bars' ? 'bg-nature-forest text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Diagram Batang Progress"
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiagramViewMode('grid')}
                    className={`p-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      diagramViewMode === 'grid' ? 'bg-nature-forest text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title="Kartu Diagram Grid"
                  >
                    <Layers className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Overall Progress Bar Overview Banner */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-extrabold">
                <div className="flex items-center gap-2">
                  <span className="text-slate-700">Tingkat Pengisian Seluruh Kamar Asrama:</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px]">
                    {kamarSudahCount} dari {kamarInputStatusList.length} Kamar Lengkap (100%)
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Sudah Input: {kamarSudahCount}
                  </span>
                  <span className="text-amber-700 font-black flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Sebagian: {kamarSebagianCount}
                  </span>
                  <span className="text-rose-700 font-black flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Belum: {kamarBelumCount}
                  </span>
                </div>
              </div>

              {/* Multi-Segment Stacked Progress Bar Diagram */}
              <div className="w-full h-3.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                {kamarInputStatusList.length > 0 && (
                  <>
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-500" 
                      style={{ width: `${(kamarSudahCount / kamarInputStatusList.length) * 100}%` }}
                      title={`Sudah Input Lengkap: ${kamarSudahCount} Kamar`}
                    />
                    <div 
                      className="bg-amber-400 h-full transition-all duration-500" 
                      style={{ width: `${(kamarSebagianCount / kamarInputStatusList.length) * 100}%` }}
                      title={`Sebagian Terisi: ${kamarSebagianCount} Kamar`}
                    />
                    <div 
                      className="bg-rose-500 h-full transition-all duration-500" 
                      style={{ width: `${(kamarBelumCount / kamarInputStatusList.length) * 100}%` }}
                      title={`Belum Input: ${kamarBelumCount} Kamar`}
                    />
                  </>
                )}
              </div>
            </div>

            {/* DIAGRAM RENDER CONTENT */}
            {diagramViewMode === 'bars' && (
              <div className="space-y-3 pt-1">
                {filteredDiagramKamarList.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
                    Tidak ada kamar dengan filter status "{diagramStatusFilter}".
                  </div>
                ) : (
                  filteredDiagramKamarList.map((item) => (
                    <div 
                      key={item.kamar.id} 
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        item.statusCategory === 'SUDAH' ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300' :
                        item.statusCategory === 'SEBAGIAN' ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300' :
                        'bg-rose-50/40 border-rose-200 hover:border-rose-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border shrink-0 ${
                            item.statusCategory === 'SUDAH' ? 'bg-emerald-100 border-emerald-300 text-emerald-800' :
                            item.statusCategory === 'SEBAGIAN' ? 'bg-amber-100 border-amber-300 text-amber-800' :
                            'bg-rose-100 border-rose-300 text-rose-800'
                          }`}>
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="font-extrabold text-sm text-slate-800">{item.kamar.namaKamar}</h4>
                              <span className="text-[10px] text-slate-500 font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                {item.kamar.gedung}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Wali Kamar / Musyrif: <strong className="text-slate-700">{item.waliKamar}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <span className={`inline-flex items-center gap-1 text-xs font-black px-2.5 py-1 rounded-full ${
                              item.statusCategory === 'SUDAH' ? 'bg-emerald-100 text-emerald-800' :
                              item.statusCategory === 'SEBAGIAN' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {item.statusCategory === 'SUDAH' && <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SUDAH INPUT (100%)</>}
                              {item.statusCategory === 'SEBAGIAN' && <><AlertCircle className="w-3.5 h-3.5 text-amber-600" /> SEBAGIAN ({item.pct}%)</>}
                              {item.statusCategory === 'BELUM' && <><XCircle className="w-3.5 h-3.5 text-rose-600" /> BELUM INPUT (0%)</>}
                            </span>
                            <span className="text-[11px] text-slate-500 font-bold block mt-1">
                              {item.santriInputCount} dari {item.totalSantri} Santri Terisi
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedKamarId(item.kamar.id);
                              setActiveTab('input');
                              showToast(`Membuka form input untuk ${item.kamar.namaKamar}`);
                            }}
                            className="px-3.5 py-2 bg-nature-forest hover:bg-nature-forest-dark text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-nature-gold" />
                            <span>Input Kamar Ini</span>
                          </button>
                        </div>
                      </div>

                      {/* Visual Bar Diagram Progress */}
                      <div className="space-y-1">
                        <div className="w-full bg-white/80 h-3 rounded-full overflow-hidden border border-slate-200/80 p-0.5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              item.statusCategory === 'SUDAH' ? 'bg-emerald-600' :
                              item.statusCategory === 'SEBAGIAN' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* MODE 2: GRID CARDS DIAGRAM */}
            {diagramViewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {filteredDiagramKamarList.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 text-xs font-bold">
                    Tidak ada kamar dengan filter status "{diagramStatusFilter}".
                  </div>
                ) : (
                  filteredDiagramKamarList.map((item) => (
                    <div 
                      key={item.kamar.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        item.statusCategory === 'SUDAH' ? 'bg-emerald-50/40 border-emerald-200 hover:shadow-md' :
                        item.statusCategory === 'SEBAGIAN' ? 'bg-amber-50/40 border-amber-200 hover:shadow-md' :
                        'bg-rose-50/40 border-rose-200 hover:shadow-md'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-extrabold text-sm text-slate-800">{item.kamar.namaKamar}</h4>
                            <span className="text-[10px] font-bold text-slate-500 block">{item.kamar.gedung}</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                            item.statusCategory === 'SUDAH' ? 'bg-emerald-100 text-emerald-800' :
                            item.statusCategory === 'SEBAGIAN' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {item.statusCategory === 'SUDAH' ? 'SUDAH INPUT' : item.statusCategory === 'SEBAGIAN' ? 'SEBAGIAN' : 'BELUM INPUT'} ({item.pct}%)
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 space-y-1">
                          <p>Wali: <strong className="text-slate-800">{item.waliKamar}</strong></p>
                          <p className="text-[11px] text-slate-500 font-semibold">
                            Status: <strong className="text-emerald-700">{item.santriInputCount} terisi</strong>, <strong className="text-rose-600">{item.santriBelumCount} belum</strong> (total {item.totalSantri} santri)
                          </p>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-white h-2.5 rounded-full overflow-hidden border border-slate-200">
                          <div 
                            className={`h-full transition-all duration-500 ${
                              item.statusCategory === 'SUDAH' ? 'bg-emerald-600' :
                              item.statusCategory === 'SEBAGIAN' ? 'bg-amber-500' :
                              'bg-rose-500'
                            }`}
                            style={{ width: `${item.pct}%` }}
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKamarId(item.kamar.id);
                          setActiveTab('input');
                          showToast(`Membuka form input untuk ${item.kamar.namaKamar}`);
                        }}
                        className="w-full py-2 bg-nature-forest hover:bg-nature-forest-dark text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-nature-gold" />
                        <span>Input Mutabaah Kamar Ini</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* CONDITIONAL PERSPECTIVE CONTENT */}
          
          {/* A. MUSYRIF PERSPECTIVE */}
          {roleView === 'MUSYRIF' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Santri List with Today Input Status */}
              <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-slate-800">Daftar Santri & Status Mutabaah Yaumiyah Santri</h3>
                    <p className="text-xs text-slate-500">Pencatatan harian per santri di kamar asrama</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('input')}
                    className="px-3.5 py-2 bg-nature-forest text-white rounded-xl text-xs font-bold hover:bg-nature-forest-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-nature-gold" /> Input Mutabaah Yaumiyah Santri
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold">
                        <th className="py-2.5 px-3">No</th>
                        <th className="py-2.5 px-3">Nama Santri</th>
                        <th className="py-2.5 px-3">NISN</th>
                        <th className="py-2.5 px-3">Status Today</th>
                        <th className="py-2.5 px-3">Skor</th>
                        <th className="py-2.5 px-3">Capaian</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredSantriList.map((st, idx) => {
                        const rec = todayRecordsMap.get(st.id);
                        return (
                          <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-3">
                              <span className="font-extrabold text-slate-800 block">{st.nama}</span>
                              <span className="text-[10px] text-slate-400">
                                {kamar.find(k => k.id === st.idKamar)?.namaKamar || 'Kamar -'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-600">{st.nis}</td>
                            <td className="py-3 px-3">
                              {rec ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Sudah Input
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-extrabold text-[10px]">
                                  <XCircle className="w-3 h-3 text-rose-600" /> Belum
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-nature-forest">
                              {rec ? rec.totalSkor : '-'}
                            </td>
                            <td className="py-3 px-3 font-extrabold text-emerald-700">
                              {rec ? `${rec.rataRataPersentase}%` : '-'}
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => {
                                  handleSelectSantriForInput(st.id);
                                  setActiveTab('input');
                                }}
                                className="px-3 py-1.5 bg-nature-beige text-nature-forest font-bold text-[11px] rounded-lg hover:bg-nature-gold hover:text-nature-forest-dark transition-colors cursor-pointer"
                              >
                                {rec ? 'Edit' : 'Input'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Program Category Progress Summary */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-slate-800">Target Per Kategori</h3>
                <p className="text-xs text-slate-500">Ringkasan capaian santri tanggal {selectedDate}</p>

                <div className="space-y-3.5">
                  {(() => {
                    const recordsForDate = mutabaahRecords.filter(r => r.tanggal === selectedDate);
                    const hasRecords = recordsForDate.length > 0;
                    const categories: Array<{ label: KategoriMutabaah; color: string }> = [
                      { label: 'SPIRITUAL DISCIPLINE', color: 'bg-emerald-600' },
                      { label: 'DZIKIR', color: 'bg-amber-500' },
                      { label: 'AL-QUR\'AN', color: 'bg-teal-600' },
                      { label: 'ILMU', color: 'bg-blue-600' },
                      { label: 'HEALTHY LIFE', color: 'bg-rose-500' },
                      { label: 'CHARACTER', color: 'bg-purple-600' },
                    ];

                    return categories.map((cat, i) => {
                      let sumPct = 0;
                      let count = 0;
                      if (hasRecords) {
                        recordsForDate.forEach(r => {
                          r.items.forEach(it => {
                            if (it.kategori === cat.label) {
                              sumPct += it.persentase || 0;
                              count++;
                            }
                          });
                        });
                      }
                      const avgPct = count > 0 ? Math.round(sumPct / count) : 0;

                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs font-bold">
                            <span className="text-slate-700">{cat.label}</span>
                            <span className="text-nature-forest font-black">
                              {hasRecords && count > 0 ? `${avgPct}%` : '-'}
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className={`${cat.color} h-full rounded-full`} style={{ width: `${hasRecords && count > 0 ? Math.min(100, avgPct) : 0}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* B. KEPALA ASRAMA PERSPECTIVE */}
          {roleView === 'KEPALA_ASRAMA' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ranking Kamar */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-nature-gold" /> Ranking Kamar Asrama
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Total {kamar.length} Kamar</span>
                </div>

                <div className="space-y-3">
                  {kamar.map((km, idx) => {
                    const kamarSantriIds = santri.filter(s => s.idKamar === km.id).map(s => s.id);
                    const kamarRecords = mutabaahRecords.filter(r => r.tanggal === selectedDate && kamarSantriIds.includes(r.idSantri));
                    const hasKamarData = kamarRecords.length > 0;
                    const avgPct = hasKamarData 
                      ? Math.round(kamarRecords.reduce((sum, r) => sum + r.rataRataPersentase, 0) / kamarRecords.length)
                      : 0;
                    const avgSkor = hasKamarData
                      ? Math.round(kamarRecords.reduce((sum, r) => sum + r.totalSkor, 0) / kamarRecords.length)
                      : 0;

                    return (
                      <div key={km.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                            idx === 0 ? 'bg-amber-400 text-amber-950 shadow-md' :
                            idx === 1 ? 'bg-slate-300 text-slate-800' :
                            idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            #{idx + 1}
                          </div>
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 block">{km.namaKamar}</span>
                            <span className="text-[10px] text-slate-500">Wali: {km.waliKamar || 'Musyrif'}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-black text-sm text-emerald-700 block">
                            {hasKamarData ? `${avgPct}%` : '-'}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {hasKamarData ? `Skor Rata2: ${avgSkor}` : 'Belum Ada Input'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Santri Perlu Pembinaan */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-rose-500" /> Santri Perlu Pembinaan Fokus
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">Perlu Atensi</span>
                </div>

                <div className="space-y-3">
                  {(() => {
                    const recordsForDate = mutabaahRecords.filter(r => r.tanggal === selectedDate);
                    const lowPerformers = recordsForDate.filter(r => r.rataRataPersentase < 70);

                    if (lowPerformers.length === 0) {
                      return (
                        <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl text-center space-y-1">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                          <p className="text-xs font-bold text-slate-700">Tidak ada santri dengan persentase di bawah 70%</p>
                          <p className="text-[10px] text-slate-400">
                            {recordsForDate.length === 0 ? 'Belum ada input Mutabaah Yaumiyah pada tanggal ini.' : 'Semua santri yang terisi mencapai target mutabaah.'}
                          </p>
                        </div>
                      );
                    }

                    return lowPerformers.map((rec) => {
                      const st = santri.find(s => s.id === rec.idSantri);
                      const kmName = kamar.find(k => k.id === rec.idKamar)?.namaKamar || 'Kamar';

                      return (
                        <div key={rec.id} className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-200 flex items-center justify-between">
                          <div>
                            <span className="font-extrabold text-xs text-slate-800 block">{rec.namaSantri || st?.nama}</span>
                            <span className="text-[10px] text-slate-500">Kamar: {kmName}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-rose-700 block">Capaian: {rec.rataRataPersentase}%</span>
                            <span className="text-[10px] font-bold text-rose-600">Perlu Pendampingan</span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* C. MUDIR PERSPECTIVE */}
          {roleView === 'MUDIR' && (
            <div className="space-y-6">
              {/* Pesantren Wide Heatmap & Target Comparison */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-nature-forest" /> Stat Pesantren & Perbandingan Asrama Putra vs Putri
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(() => {
                    const recordsForDate = mutabaahRecords.filter(r => r.tanggal === selectedDate);
                    const paSantriIds = santri.filter(s => s.gender === 'Laki-laki').map(s => s.id);
                    const piSantriIds = santri.filter(s => s.gender === 'Perempuan').map(s => s.id);

                    const paRecords = recordsForDate.filter(r => paSantriIds.includes(r.idSantri));
                    const piRecords = recordsForDate.filter(r => piSantriIds.includes(r.idSantri));

                    const paAvg = paRecords.length > 0 
                      ? Math.round(paRecords.reduce((sum, r) => sum + r.rataRataPersentase, 0) / paRecords.length)
                      : null;
                    const piAvg = piRecords.length > 0
                      ? Math.round(piRecords.reduce((sum, r) => sum + r.rataRataPersentase, 0) / piRecords.length)
                      : null;

                    return (
                      <>
                        {/* Asrama Putra */}
                        <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-emerald-900 text-sm">ASRAMA PUTRA (PA)</span>
                            <span className="text-xs font-extrabold bg-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              {paAvg !== null ? `${paAvg}% Target` : 'Belum Ada Input'}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Total Santri Terisi</span>
                              <span className="font-bold text-emerald-800">{paRecords.length} Santri</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rata-rata Persentase Capaian</span>
                              <span className="font-bold text-emerald-800">{paAvg !== null ? `${paAvg}%` : '-'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Asrama Putri */}
                        <div className="p-5 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="font-black text-teal-900 text-sm">ASRAMA PUTRI (PI)</span>
                            <span className="text-xs font-extrabold bg-teal-200 text-teal-800 px-2.5 py-0.5 rounded-full">
                              {piAvg !== null ? `${piAvg}% Target` : 'Belum Ada Input'}
                            </span>
                          </div>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span>Total Santri Terisi</span>
                              <span className="font-bold text-teal-800">{piRecords.length} Santri</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rata-rata Persentase Capaian</span>
                              <span className="font-bold text-teal-800">{piAvg !== null ? `${piAvg}%` : '-'}</span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* D. ORANG TUA PERSPECTIVE QUICK LINK */}
          {roleView === 'ORANG_TUA' && (
            <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl text-center space-y-3">
              <Sparkles className="w-8 h-8 text-amber-600 mx-auto" />
              <h3 className="font-serif font-bold text-lg text-slate-800">Portal Laporan Orang Tua Santri</h3>
              <p className="text-xs text-slate-600 max-w-lg mx-auto">
                Orang tua dapat memantau seluruh catatan Mutabaah Yaumiyah Santri anak, grafik perkembangan, serta dalil dan nilai amal yang diraih.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="px-5 py-2.5 bg-nature-forest text-white rounded-xl text-xs font-bold hover:bg-nature-forest-medium transition-all cursor-pointer"
              >
                Buka Portal Laporan Orang Tua
              </button>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2B. TAB ABSENSI HARIAN KAMAR */}
      {/* ========================================================================= */}
      {activeTab === 'absensikamar' && (
        <div className="space-y-6" id="tab-absensi-kamar">
          <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-nature-forest" /> Presensi Harian Kamar Asrama
                </h2>
                <p className="text-xs text-slate-500">Lakukan verifikasi keberadaan santri di kamar asrama pada jam malam</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-nature-gold" /> Simpan Presensi
                </button>
                <button
                  type="button"
                  onClick={handleExportKamarPDF}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold text-xs rounded-xl transition-colors border border-rose-200 active:scale-95 cursor-pointer"
                >
                  <FileDown className="w-4 h-4 text-rose-600" /> Export PDF
                </button>
              </div>
            </div>

            {/* Filter Gender & Date Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-nature-forest" />
                  <span className="text-xs font-extrabold text-slate-700 uppercase">Gedung Asrama:</span>
                </div>
                <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setAbsensiGenderFilter('semua')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      absensiGenderFilter === 'semua'
                        ? 'bg-nature-forest text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbsensiGenderFilter('putra')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      absensiGenderFilter === 'putra'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    Putra
                  </button>
                  <button
                    type="button"
                    onClick={() => setAbsensiGenderFilter('putri')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      absensiGenderFilter === 'putri'
                        ? 'bg-pink-600 text-white shadow-xs'
                        : 'text-pink-600 hover:bg-pink-50'
                    }`}
                  >
                    Putri
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-nature-sage" />
                <span className="text-xs font-extrabold text-slate-700">Tanggal Pengabsenan:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Kamar Selection list */}
            <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">
                Pilih Kamar Asrama ({filteredKamarAbsensi.length})
              </h2>

              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredKamarAbsensi.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    Tidak ada kamar asrama yang sesuai dengan filter ini.
                  </p>
                ) : (
                  filteredKamarAbsensi.map(k => {
                    const count = santri.filter(s => s.idKamar === k.id && s.status === 'Aktif').length;
                    return (
                      <button
                        key={k.id}
                        type="button"
                        onClick={() => setSelectedRoomIdAbsensi(k.id)}
                        className={`w-full text-left p-3.5 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                          activeRoomAbsensi?.id === k.id
                            ? 'bg-nature-beige text-nature-forest border-nature-forest font-bold shadow-xs'
                            : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold">{k.namaKamar}</div>
                          <span className="text-[10px] font-semibold text-slate-400">{k.gedung}</span>
                        </div>
                        <span className="text-[10px] bg-white text-nature-forest font-bold px-2 py-0.5 rounded-md border border-slate-200">
                          {count} Santri
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Checklist */}
            {activeRoomAbsensi && (
              <div className="xl:col-span-2 bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold font-serif text-nature-forest">
                      Lembar Presensi Harian: {activeRoomAbsensi.namaKamar}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Gedung: <span className="font-bold text-slate-700">{activeRoomAbsensi.gedung}</span> | Wali Kamar: <span className="font-bold text-slate-700">{activeRoomAbsensi.waliKamar || 'Belum ditentukan'}</span>
                    </p>
                  </div>
                </div>

                {tempAttendance.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400 italic">
                    Tidak ada santri yang terdaftar di kamar "{activeRoomAbsensi.namaKamar}" untuk diabsen.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs text-slate-400 font-bold px-2 uppercase tracking-wider">
                      <span>Nama Santri</span>
                      <span>Status Kehadiran Kamar</span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                      {tempAttendance.map((attend) => (
                        <div key={attend.idSantri} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white text-xs hover:bg-slate-50/50 gap-2">
                          <div className="font-bold text-slate-800">{attend.namaSantri}</div>

                          {/* Attendance Toggle Switches */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => toggleAttendanceStatus(attend.idSantri, 'Hadir')}
                              className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer ${
                                attend.statusKamar === 'Hadir'
                                  ? 'bg-emerald-700 text-white shadow-3xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Hadir
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAttendanceStatus(attend.idSantri, 'Izin')}
                              className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer ${
                                attend.statusKamar === 'Izin'
                                  ? 'bg-amber-600 text-white shadow-3xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Izin
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAttendanceStatus(attend.idSantri, 'Sakit')}
                              className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer ${
                                attend.statusKamar === 'Sakit'
                                  ? 'bg-nature-gold text-slate-900 shadow-3xs font-black'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Sakit
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleAttendanceStatus(attend.idSantri, 'Tanpa Keterangan')}
                              className={`px-3 py-1.5 rounded-lg font-extrabold text-[10px] transition-all cursor-pointer ${
                                attend.statusKamar === 'Tanpa Keterangan'
                                  ? 'bg-rose-700 text-white shadow-3xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              Alpa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Visual Summary */}
                    <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 inline-block" /> Hadir: {tempAttendance.filter(t => t.statusKamar === 'Hadir').length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Izin: {tempAttendance.filter(t => t.statusKamar === 'Izin').length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-nature-gold inline-block" /> Sakit: {tempAttendance.filter(t => t.statusKamar === 'Sakit').length}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-700 inline-block" /> Alpa: {tempAttendance.filter(t => t.statusKamar === 'Tanpa Keterangan').length}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. TAB INPUT MUTABA'AH */}
      {/* ========================================================================= */}
      {activeTab === 'input' && (
        <form onSubmit={handleSaveMutabaah} className="space-y-6">
          
          {/* Header Input controls */}
          <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-serif font-bold text-xl text-slate-800">Form Input Mutabaah Yaumiyah Santri</h2>
                <p className="text-xs text-slate-500">Pilih santri untuk mengisi checklist amalan secara lengkap</p>
              </div>

              <button
                type="button"
                onClick={handleQuickFillTarget}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-extrabold hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" /> Isi Target Ideal Otomatis
              </button>
            </div>

            {/* Tombol Pembeda Asrama Putra dan Asrama Putri */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200" id="input-asrama-filter-buttons">
              <div className="flex items-center gap-2">
                <Building2 className="w-4.5 h-4.5 text-nature-forest" />
                <div>
                  <span className="text-xs font-extrabold text-slate-800 block uppercase tracking-wider">Filter Asrama:</span>
                  <span className="text-[11px] text-slate-500">Pilih untuk memfilter kamar & santri Putra atau Putri</span>
                </div>
              </div>

              <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => handleGenderFilterChange('semua')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === 'semua'
                      ? 'bg-nature-forest text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  Semua Asrama ({santri.length})
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderFilterChange('Laki-laki')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedGender === 'Laki-laki'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                  Asrama Putra ({santri.filter(s => s.gender === 'Laki-laki').length})
                </button>

                <button
                  type="button"
                  onClick={() => handleGenderFilterChange('Perempuan')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    selectedGender === 'Perempuan'
                      ? 'bg-pink-600 text-white shadow-xs'
                      : 'text-pink-600 hover:text-pink-800 hover:bg-pink-50'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse" />
                  Asrama Putri ({santri.filter(s => s.gender === 'Perempuan').length})
                </button>
              </div>
            </div>

            {/* Selector Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-600 block mb-1">Pilih Tanggal</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 block mb-1">
                  Pilih Kamar {selectedGender === 'Laki-laki' ? '(Asrama Putra)' : selectedGender === 'Perempuan' ? '(Asrama Putri)' : ''}
                </label>
                <select
                  value={selectedKamarId}
                  onChange={(e) => setSelectedKamarId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
                >
                  <option value="">-- Semua Kamar {selectedGender === 'Laki-laki' ? 'Putra' : selectedGender === 'Perempuan' ? 'Putri' : ''} --</option>
                  {filteredKamarList.map(k => (
                    <option key={k.id} value={k.id}>{k.namaKamar} ({k.gedung})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-600 block mb-1">
                  Pilih Nama Santri {selectedGender === 'Laki-laki' ? '(Putra)' : selectedGender === 'Perempuan' ? '(Putri)' : ''} *
                </label>
                <select
                  value={inputSantriId}
                  onChange={(e) => handleSelectSantriForInput(e.target.value)}
                  className="w-full p-2.5 bg-nature-forest text-white border border-nature-forest-medium rounded-xl text-xs font-bold focus:outline-none cursor-pointer"
                  required
                >
                  <option value="">-- Pilih Santri --</option>
                  {filteredSantriList.map(s => (
                    <option key={s.id} value={s.id}>{s.nama} (NISN: {s.nis})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Quick 1-Click Per-Item Auto-Fill Banner for Selected Kamar */}
            {selectedKamarId && (() => {
              const kObj = kamar.find(k => k.id === selectedKamarId);
              const roomSantriList = santri.filter(s => s.idKamar === selectedKamarId && s.status === 'Aktif');

              return (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-nature-forest via-emerald-800 to-teal-900 text-white p-5 rounded-2xl shadow-md border border-emerald-600/50 space-y-4 mt-2"
                  id="batch-fill-kamar-banner"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="p-2.5 bg-nature-gold/20 rounded-xl border border-nature-gold/30 text-nature-gold shrink-0">
                        <Zap className="w-6 h-6 fill-nature-gold" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-nature-gold text-nature-forest text-[10px] font-black uppercase tracking-wide">
                            Auto Fill Per Item Penilaian
                          </span>
                          <h3 className="font-serif font-bold text-base text-white">
                            1-Klik Isi Target Per Item: <span className="text-nature-gold underline decoration-nature-gold/60">{kObj?.namaKamar}</span> ({roomSantriList.length} Santri)
                          </h3>
                        </div>
                        <p className="text-xs text-slate-200 mt-1">
                          Pilih item / amalan di bawah ini (contoh: <strong className="text-nature-gold">Sholat Subuh Berjama'ah</strong>) untuk langsung mengisi target 100% tuntas untuk seluruh <strong className="text-white font-black">{roomSantriList.length} santri</strong> di kamar ini pada tanggal <strong className="text-nature-gold">{selectedDate}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Select Item + Action Button */}
                  <div className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/15">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block mb-1">
                        Pilih Item / Program Amalan Yang Ingin Di-Auto Fill:
                      </label>
                      <select
                        value={selectedAutoFillItemId || (masterTargets[0]?.id || '')}
                        onChange={(e) => setSelectedAutoFillItemId(e.target.value)}
                        className="w-full p-2.5 bg-slate-900 text-white border border-emerald-500/50 rounded-xl text-xs font-bold focus:outline-none focus:border-nature-gold cursor-pointer"
                      >
                        {masterTargets.map(item => (
                          <option key={item.id} value={item.id}>
                            [{item.kategori}] {item.program} (Target: {item.target} {item.satuan})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const targetId = selectedAutoFillItemId || masterTargets[0]?.id;
                        const targetItem = masterTargets.find(t => t.id === targetId);
                        if (targetItem) {
                          handleFillItemForKamar(targetItem);
                        }
                      }}
                      disabled={roomSantriList.length === 0}
                      className="w-full sm:w-auto px-5 py-3 bg-nature-gold hover:bg-yellow-400 text-nature-forest font-black text-xs rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed group mt-auto"
                      id="btn-auto-fill-selected-item"
                    >
                      <Sparkles className="w-4 h-4 text-nature-forest group-hover:scale-110 transition-transform" />
                      <span>⚡ Auto Fill Item Ini ({roomSantriList.length} Santri)</span>
                    </button>
                  </div>

                  {/* Quick Action Chips for All Master Targets */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">
                      ⚡ 1-Klik Cepat Auto Fill Per Item Pilihan:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {masterTargets.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleFillItemForKamar(item)}
                          disabled={roomSantriList.length === 0}
                          className="px-3 py-1.5 bg-white/15 hover:bg-nature-gold hover:text-nature-forest text-white border border-white/20 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
                          title={`Isi ${item.program} (${item.target} ${item.satuan}) untuk seluruh ${roomSantriList.length} santri`}
                        >
                          <Zap className="w-3 h-3 text-nature-gold hover:text-nature-forest" />
                          <span>{item.program}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })()}
          </div>

          {selectedInputSantri ? (
            <>
              {/* Target Categories Accordion / Sections (A through F) */}
              {[
                'SPIRITUAL DISCIPLINE',
                'DZIKIR',
                'AL-QUR\'AN',
                'ILMU',
                'HEALTHY LIFE',
                'CHARACTER'
              ].map((catKey) => {
                const categoryItems = masterTargets.filter(t => t.kategori === catKey);
                if (categoryItems.length === 0) return null;

                return (
                  <div key={catKey} className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${categoryBgMap[catKey as KategoriMutabaah]}`}>
                        {catKey}
                      </span>
                      <span className="text-xs text-slate-400 font-bold">{categoryItems.length} Program Target</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryItems.map((item) => {
                        const currentCap = inputCapaians[item.id] || 0;
                        const pct = Math.round((currentCap / (item.target || 1)) * 100);

                        return (
                          <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <span className="font-extrabold text-sm text-slate-800 block">{item.program}</span>
                                <span className="text-[10px] font-extrabold text-nature-forest">
                                  Target: {item.target} {item.satuan}
                                </span>
                              </div>

                              <div className="text-right">
                                <span className="text-xs font-black text-emerald-700 block">{pct}%</span>
                                <span className="text-[9px] text-slate-400 font-bold">Skor: {currentCap}</span>
                              </div>
                            </div>

                            {/* Stepper OR Switch Input */}
                            {item.tipeInput === 'stepper' ? (
                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-600">Capaian:</span>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCapaianChange(item.id, currentCap - 1)}
                                    className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-black hover:bg-slate-200 transition-colors cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="w-12 text-center font-black text-sm text-slate-800">
                                    {currentCap}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleCapaianChange(item.id, currentCap + 1)}
                                    className="w-7 h-7 rounded-lg bg-nature-forest text-white font-black hover:bg-nature-forest-medium transition-colors cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-xs font-bold text-slate-600">Laksanakan:</span>
                                <button
                                  type="button"
                                  onClick={() => handleCapaianChange(item.id, currentCap === 1 ? 0 : 1)}
                                  className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                    currentCap === 1 ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-500'
                                  }`}
                                >
                                  {currentCap === 1 ? 'YA (TERLAKSANA)' : 'TIDAK'}
                                </button>
                              </div>
                            )}

                            {/* Quick 1-Click Auto Fill Buttons for this Item */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-200/60">
                              <button
                                type="button"
                                onClick={() => handleCapaianChange(item.id, item.target)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                              >
                                <Zap className="w-3 h-3 text-emerald-600" />
                                <span>Auto Fill Item Ini (1 Santri)</span>
                              </button>

                              {selectedKamarId && (
                                <button
                                  type="button"
                                  onClick={() => handleFillItemForKamar(item)}
                                  className="px-2.5 py-1 bg-nature-forest/10 hover:bg-nature-forest hover:text-white text-nature-forest border border-nature-forest/30 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Zap className="w-3 h-3 text-nature-gold" />
                                  <span>Auto Fill Item Ini (Semua Santri Kamar)</span>
                                </button>
                              )}
                            </div>

                            {/* Dalil & Nilai Amal Info */}
                            <div className="text-[10px] text-slate-500 bg-white/60 p-2 rounded-lg border border-slate-100 space-y-0.5">
                              <span className="font-extrabold text-amber-800 block">Nilai Amal: {item.nilaiAmal}</span>
                              <span className="block italic">Dalil: {item.dalil} ({item.referensi})</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Musyrif Notes Box */}
              <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-lg text-slate-800">Catatan & Rekomendasi Musyrif Kamar</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Catatan Evaluasi Musyrif</label>
                    <textarea
                      value={catatanMusyrif}
                      onChange={(e) => setCatatanMusyrif(e.target.value)}
                      placeholder="Contoh: Ananda istiqomah shalat berjamaah dan tahajud..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-extrabold text-slate-600 block mb-1">Rekomendasi Bimbingan / Apresiasi</label>
                    <textarea
                      value={rekomendasiMusyrif}
                      onChange={(e) => setRekomendasiMusyrif(e.target.value)}
                      placeholder="Contoh: Pertahankan hafalan dan jadilah penceramah saat bakda maghrib..."
                      rows={3}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-nature-forest"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    className="px-6 py-3 bg-nature-forest text-white font-extrabold text-xs rounded-xl hover:bg-nature-forest-medium shadow-md transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4 text-nature-gold" /> Simpan Data Mutabaah Yaumiyah Santri
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center bg-white rounded-3xl border border-nature-border/60 space-y-2">
              <Info className="w-10 h-10 text-nature-forest mx-auto opacity-40" />
              <h3 className="font-serif font-bold text-lg text-slate-700">Pilih Santri Terlebih Dahulu</h3>
              <p className="text-xs text-slate-400">Silakan tentukan nama santri dari dropdown di atas untuk membuka seluruh form checklist Mutabaah Yaumiyah Santri.</p>
            </div>
          )}
        </form>
      )}

      {/* ========================================================================= */}
      {/* 3. TAB MASTER SHEET TARGET & DALIL */}
      {/* ========================================================================= */}
      {activeTab === 'mastersheet' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-serif font-bold text-xl text-slate-800">Master Sheet Target & Dalil</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {masterTargets.length} Poin Kriteria Penilaian
                  </span>
                </div>
                <p className="text-xs text-slate-500">Seluruh target tidak ditulis di kode, melainkan dikelola langsung dari Sheet ini</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onResetTargets && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Apakah Anda yakin ingin MENGEMBALIKAN 33 POIN TARGET MASTER PENILAIAN MUTABAAH YAUMIYAH ke kondisi standar default?')) {
                        onResetTargets();
                        showToast('Seluruh 33 target master penilaian mutabaah telah berhasil dikembalikan seperti semula!');
                      }
                    }}
                    className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-700" /> Kembalikan 33 Target Default
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setEditingTargetItem({
                      id: `m-${Date.now()}`,
                      kategori: 'SPIRITUAL DISCIPLINE',
                      program: '',
                      target: 1,
                      satuan: 'Rakaat',
                      nilaiAmal: '',
                      dalil: '',
                      referensi: '',
                      tipeInput: 'stepper'
                    });
                    setIsAddingTarget(true);
                  }}
                  className="px-4 py-2 bg-nature-forest text-white rounded-xl text-xs font-bold hover:bg-nature-forest-medium transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-4 h-4 text-nature-gold" /> Tambah Program Target Baru
                </button>
              </div>
            </div>

            {/* Master Sheet Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-extrabold bg-slate-50">
                    <th className="py-3 px-3">No</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Program</th>
                    <th className="py-3 px-3">Target & Satuan</th>
                    <th className="py-3 px-3">Nilai Amal</th>
                    <th className="py-3 px-3">Dalil & Referensi</th>
                    <th className="py-3 px-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {masterTargets.map((tm, idx) => (
                    <tr key={tm.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-slate-100 text-slate-700">
                          {tm.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-800">{tm.program}</td>
                      <td className="py-3 px-3 font-black text-nature-forest">
                        {tm.target} {tm.satuan}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-800">{tm.nilaiAmal}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <span>{tm.dalil}</span>
                        <span className="text-[10px] text-slate-400 block font-mono">[{tm.referensi}]</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingTargetItem(tm)}
                            className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Edit
                          </button>
                          {onDeleteTarget && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Hapus program target "${tm.program}"?`)) {
                                  onDeleteTarget(tm.id);
                                  showToast(`Program target "${tm.program}" berhasil dihapus.`);
                                }
                              }}
                              className="p-1 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 font-bold text-[11px] transition-colors cursor-pointer"
                              title="Hapus Target"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Edit / Add Modal */}
          {editingTargetItem && (
            <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white p-6 rounded-3xl max-w-lg w-full space-y-4 shadow-2xl border border-slate-200">
                <h3 className="font-serif font-bold text-lg text-slate-800">
                  {isAddingTarget ? 'Tambah Target Baru' : 'Edit Target Master Sheet'}
                </h3>

                <form onSubmit={handleSaveMasterItem} className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Kategori Program</label>
                    <select
                      value={editingTargetItem.kategori}
                      onChange={(e) => setEditingTargetItem({ ...editingTargetItem, kategori: e.target.value as any })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                    >
                      <option value="SPIRITUAL DISCIPLINE">SPIRITUAL DISCIPLINE</option>
                      <option value="DZIKIR">DZIKIR</option>
                      <option value="AL-QUR'AN">AL-QUR'AN</option>
                      <option value="ILMU">ILMU</option>
                      <option value="HEALTHY LIFE">HEALTHY LIFE</option>
                      <option value="CHARACTER">CHARACTER</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nama Program</label>
                    <input
                      type="text"
                      value={editingTargetItem.program}
                      onChange={(e) => setEditingTargetItem({ ...editingTargetItem, program: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Target</label>
                      <input
                        type="number"
                        step="any"
                        value={editingTargetItem.target}
                        onChange={(e) => setEditingTargetItem({ ...editingTargetItem, target: Number(e.target.value) })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Satuan</label>
                      <input
                        type="text"
                        value={editingTargetItem.satuan}
                        onChange={(e) => setEditingTargetItem({ ...editingTargetItem, satuan: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-600 block mb-1">Nilai Amal</label>
                    <input
                      type="text"
                      value={editingTargetItem.nilaiAmal}
                      onChange={(e) => setEditingTargetItem({ ...editingTargetItem, nilaiAmal: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Dalil</label>
                      <input
                        type="text"
                        value={editingTargetItem.dalil}
                        onChange={(e) => setEditingTargetItem({ ...editingTargetItem, dalil: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 block mb-1">Referensi</label>
                      <input
                        type="text"
                        value={editingTargetItem.referensi}
                        onChange={(e) => setEditingTargetItem({ ...editingTargetItem, referensi: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setEditingTargetItem(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-nature-forest text-white rounded-xl text-xs font-bold"
                    >
                      Simpan Sheet Item
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB EXPORT PDF MASSAL & CETAK */}
      {/* ========================================================================= */}
      {activeTab === 'massexport' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-800">Cetak & Export PDF Massal per Kamar</h2>
            <p className="text-xs text-slate-500">Generate seluruh PDF laporan Mutabaah Yaumiyah Santri dalam satu kamar sekaligus</p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4 max-w-lg">
            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Pilih Kamar Asrama</label>
              <select
                value={selectedKamarId}
                onChange={(e) => setSelectedKamarId(e.target.value)}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800"
              >
                <option value="">-- Pilih Kamar --</option>
                {filteredKamarList.map(k => (
                  <option key={k.id} value={k.id}>{k.namaKamar} ({k.gedung})</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleMassExportPDF}
                className="flex-1 py-3 bg-nature-forest text-white font-extrabold text-xs rounded-xl hover:bg-nature-forest-medium shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-nature-gold" /> Generate PDF Massal (30 Santri)
              </button>

              <button
                onClick={handleDirectPrint}
                className="py-3 px-4 bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl hover:bg-slate-300 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Cetak Langsung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB BACKUP & RESTORE */}
      {/* ========================================================================= */}
      {activeTab === 'backup' && (
        <div className="bg-white p-6 rounded-3xl border border-nature-border/60 shadow-sm space-y-6">
          <div>
            <h2 className="font-serif font-bold text-xl text-slate-800">Backup & Restore Database Mutabaah Yaumiyah Santri</h2>
            <p className="text-xs text-slate-500">Backup seluruh data ke file JSON atau restore data dari file cadangan</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
              <Download className="w-8 h-8 text-emerald-700" />
              <h3 className="font-bold text-sm text-emerald-900">Backup Database</h3>
              <p className="text-xs text-emerald-700">Unduh seluruh master target sheet dan rekaman Mutabaah Yaumiyah Santri ke file lokal.</p>
              <button
                onClick={handleExportBackupJSON}
                className="px-4 py-2.5 bg-emerald-700 text-white font-bold text-xs rounded-xl hover:bg-emerald-800 transition-all cursor-pointer"
              >
                Unduh Backup JSON
              </button>
            </div>

            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200 space-y-3">
              <Upload className="w-8 h-8 text-blue-700" />
              <h3 className="font-bold text-sm text-blue-900">Restore Database</h3>
              <p className="text-xs text-blue-700">Pulihkan data Mutabaah Yaumiyah Santri dari file backup JSON Spreadsheet.</p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackupJSON}
                className="text-xs font-bold text-slate-600"
              />
            </div>

            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 space-y-3">
              <Trash2 className="w-8 h-8 text-rose-700" />
              <h3 className="font-bold text-sm text-rose-900">Kosongkan & Refresh Data</h3>
              <p className="text-xs text-rose-700">Hapus seluruh data hasil input Mutabaah Yaumiyah semua santri agar kembali dalam kondisi fresh/bersih tanpa inputan.</p>
              <button
                onClick={() => {
                  if (confirm('Apakah Anda YAKIN ingin MENGHAPUS SEMUA DATA HASIL INPUT MUTABAAH YAUMIYAH SELURUH SANTRI?\n\nTindakan ini akan mengosongkan seluruh inputan sehingga semua santri berada dalam kondisi FRESH/BERSIH.')) {
                    if (onClearAllMutabaahRecords) {
                      onClearAllMutabaahRecords();
                      showToast('Seluruh data input Mutabaah Yaumiyah telah dibersihkan (Kondisi Fresh).');
                    }
                  }
                }}
                className="px-4 py-2.5 bg-rose-700 text-white font-bold text-xs rounded-xl hover:bg-rose-800 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Reset Data (Kondisi Fresh)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Export Animated Modal */}
      {pdfModalRecord && (
        <PDFExportModal
          isOpen={!!pdfModalRecord}
          onClose={() => setPdfModalRecord(null)}
          record={pdfModalRecord}
          allMutabaahRecords={mutabaahRecords}
          isPortalOrangTua={false}
        />
      )}

    </div>
  );
}
