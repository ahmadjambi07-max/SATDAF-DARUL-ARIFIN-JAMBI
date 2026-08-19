import React, { useState, useEffect } from 'react';
import { 
  Santri, 
  PengasuhGuru, 
  Kamar, 
  LogAktivitas, 
  CatatanKeuangan, 
  AbsensiSantriKamar, 
  PelanggaranSantri, 
  Prestasi, 
  TargetMasterItem, 
  RecordMutabaahSantri,
  KunjunganBerobat,
  StokObatLogistik,
  RekamMedisSantri,
  AbsensiPetugasKlinik,
  PenggunaApp,
  KaryawanSDM,
  PenilaianKinerjaSDM,
  ProgramInovasiLitbang,
  RecordSetoranTahfidz
} from './types';
import { 
  DEFAULT_SANTRI, 
  DEFAULT_GURU_PENGASUH, 
  DEFAULT_KAMAR, 
  DEFAULT_LOGS, 
  DEFAULT_KEUANGAN,
  DEFAULT_PELANGGARAN,
  DEFAULT_PRESTASI
} from './data/mockData';
import { DEFAULT_TARGET_MASTERS, DEFAULT_MUTABAAH_RECORDS } from './data/mockMutabaah';
import { 
  DEFAULT_KUNJUNGAN_BEROBAT, 
  DEFAULT_STOK_OBAT, 
  DEFAULT_REKAM_MEDIS, 
  DEFAULT_ABSENSI_PETUGAS_KLINIK 
} from './data/mockKlinik';
import { DEFAULT_PENGGUNA_APP } from './data/mockPengguna';
import { DEFAULT_KARYAWAN_SDM, DEFAULT_PENILAIAN_SDM, DEFAULT_PROGRAM_LITBANG } from './data/mockLitbangSDM';
import { DEFAULT_TAHFIDZ_SETORAN } from './data/mockTahfidzGamifikasi';
import {
  getStoredItem,
  setStoredItem,
  mergeCollections,
  markIdAsDeleted,
  unmarkIdAsDeleted
} from './utils/persistentStorage';
import {
  subscribeSantri,
  subscribeGuru,
  subscribeKamar,
  subscribeLogs,
  subscribeKeuangan,
  subscribePelanggaran,
  saveSantriDoc,
  deleteSantriDoc,
  saveGuruDoc,
  deleteGuruDoc,
  saveKamarDoc,
  deleteKamarDoc,
  saveLogsDoc,
  saveKeuanganDoc,
  deleteKeuanganDoc,
  savePelanggaranDoc,
  deletePelanggaranDoc,
  clearLogsInDb,
  bootstrapDatabaseIfEmpty,
  subscribePrestasi,
  savePrestasiDoc,
  deletePrestasiDoc,
  subscribeMutabaahTargets,
  subscribeMutabaahRecords,
  saveMutabaahTargetDoc,
  deleteMutabaahTargetDoc,
  resetMutabaahTargetsInDb,
  ensureMutabaahTargets33Once,
  saveMutabaahRecordDoc,
  batchSaveMutabaahRecords,
  deleteMutabaahRecordDoc,
  clearAllMutabaahRecordsInDb,
  resetAllMutabaahRecordsOnce,
  subscribeKunjunganBerobat,
  subscribeStokObat,
  subscribeRekamMedis,
  subscribeAbsensiPetugasKlinik,
  saveKunjunganBerobatDoc,
  deleteKunjunganBerobatDoc,
  saveStokObatDoc,
  deleteStokObatDoc,
  saveRekamMedisDoc,
  saveAbsensiPetugasKlinikDoc,
  deleteAbsensiPetugasKlinikDoc,
  subscribePenggunaApp,
  savePenggunaAppDoc,
  deletePenggunaAppDoc,
  subscribeKaryawanSDM,
  saveKaryawanSDMDoc,
  deleteKaryawanSDMDoc,
  subscribePenilaianSDM,
  savePenilaianSDMDoc,
  deletePenilaianSDMDoc,
  subscribeProgramLitbang,
  saveProgramLitbangDoc,
  deleteProgramLitbangDoc,
  subscribeTahfidzSetoran,
  saveTahfidzSetoranDoc,
  deleteTahfidzSetoranDoc,
  seedTahfidzSetoranIfEmpty,
  clearAllTahfidzSetoranInDb,
  clearAllTahfidzSetoranOnce,
  onQuotaExceededChange
} from './firebase';

// Synchronous critical components
import Dashboard from './components/Dashboard';
import LoginScreen from './components/LoginScreen';
import BatikBackground from './components/BatikBackground';
import BatikJawaSidebar, { BatikJawaType } from './components/BatikJawaSidebar';

// Direct component imports for instant zero-delay navigation
import DataSantri from './components/DataSantri';
import DataPengasuhGuru from './components/DataPengasuhGuru';
import DataKamar from './components/DataKamar';
import RealTimeMonitoring from './components/RealTimeMonitoring';
import LaporanBulanan from './components/LaporanBulanan';
import DataPelanggaran from './components/DataPelanggaran';
import PrestasiPenghargaan from './components/PrestasiPenghargaan';
import MonitoringPimpinan from './components/MonitoringPimpinan';
import MutabaahSantri from './components/MutabaahSantri';
import PortalOrangTua from './components/PortalOrangTua';
import KlinikKesehatan from './components/KlinikKesehatan';
import RolePengguna from './components/RolePengguna';
import LitbangSDM from './components/LitbangSDM';
import TahfidzGamifikasi from './components/TahfidzGamifikasi';
import AIAssistantModal from './components/AIAssistantModal';
import BookmarkGuideModal from './components/BookmarkGuideModal';
import DataBackupModal from './components/DataBackupModal';
import IslamicHeaderBar from './components/IslamicHeaderBar';

import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Home, 
  Radio, 
  FilePieChart,
  BookOpen,
  Menu,
  X,
  Bell,
  LogOut,
  Sparkles,
  Database,
  Compass,
  ShieldAlert,
  ShieldCheck,
  Trophy,
  Tv,
  Zap,
  HeartHandshake,
  Stethoscope,
  Smartphone,
  BrainCircuit,
  AlertTriangle,
  ExternalLink,
  Flame,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Authentication & Role-based Access State
  const [userRole, setUserRole] = useState<string | null>(() => {
    return localStorage.getItem('satdaf_role');
  });
  const [username, setUsername] = useState<string | null>(() => localStorage.getItem('satdaf_username'));

  // Navigation Menu
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Lock body scroll on mobile drawer open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // States with persistent offline cache & fallbacks
  const [santri, setSantri] = useState<Santri[]>(() => getStoredItem('satdaf_santri', DEFAULT_SANTRI));
  const [guru, setGuru] = useState<PengasuhGuru[]>(() => getStoredItem('satdaf_guru', DEFAULT_GURU_PENGASUH));
  const [kamar, setKamar] = useState<Kamar[]>(() => getStoredItem('satdaf_kamar', DEFAULT_KAMAR));
  const [logs, setLogs] = useState<LogAktivitas[]>(() => getStoredItem('satdaf_logs', DEFAULT_LOGS));
  const [keuangan, setKeuangan] = useState<CatatanKeuangan[]>(() => getStoredItem('satdaf_keuangan', DEFAULT_KEUANGAN));
  const [pelanggaran, setPelanggaran] = useState<PelanggaranSantri[]>(() => getStoredItem('satdaf_pelanggaran', DEFAULT_PELANGGARAN));
  const [prestasi, setPrestasi] = useState<Prestasi[]>(() => getStoredItem('satdaf_prestasi', DEFAULT_PRESTASI));
  const [mutabaahTargets, setMutabaahTargets] = useState<TargetMasterItem[]>(() => getStoredItem('satdaf_mutabaah_targets', DEFAULT_TARGET_MASTERS));
  const [mutabaahRecords, setMutabaahRecords] = useState<RecordMutabaahSantri[]>(() => getStoredItem('satdaf_mutabaah_records', DEFAULT_MUTABAAH_RECORDS));

  // Klinik Kesehatan States
  const [kunjunganList, setKunjunganList] = useState<KunjunganBerobat[]>(() => getStoredItem('satdaf_kunjungan_berobat', DEFAULT_KUNJUNGAN_BEROBAT));
  const [stokObatList, setStokObatList] = useState<StokObatLogistik[]>(() => getStoredItem('satdaf_stok_obat', DEFAULT_STOK_OBAT));
  const [rekamMedisList, setRekamMedisList] = useState<RekamMedisSantri[]>(() => getStoredItem('satdaf_rekam_medis', DEFAULT_REKAM_MEDIS));
  const [absensiPetugasList, setAbsensiPetugasList] = useState<AbsensiPetugasKlinik[]>(() => getStoredItem('satdaf_absensi_petugas_klinik', DEFAULT_ABSENSI_PETUGAS_KLINIK));

  // User Accounts State
  const [penggunaList, setPenggunaList] = useState<PenggunaApp[]>(() => getStoredItem('satdaf_pengguna_app', DEFAULT_PENGGUNA_APP));

  // Litbang & SDM States
  const [karyawanList, setKaryawanList] = useState<KaryawanSDM[]>(() => getStoredItem('satdaf_karyawan_sdm', DEFAULT_KARYAWAN_SDM));
  const [penilaianList, setPenilaianList] = useState<PenilaianKinerjaSDM[]>(() => getStoredItem('satdaf_penilaian_sdm', DEFAULT_PENILAIAN_SDM));
  const [programLitbangList, setProgramLitbangList] = useState<ProgramInovasiLitbang[]>(() => getStoredItem('satdaf_program_litbang', DEFAULT_PROGRAM_LITBANG));

  // Tahfidz Gamifikasi State
  const [tahfidzSetoranList, setTahfidzSetoranList] = useState<RecordSetoranTahfidz[]>(() => getStoredItem('satdaf_tahfidz_setoran', DEFAULT_TAHFIDZ_SETORAN));

  // Quota & offline banner state
  const [isQuotaExceeded, setIsQuotaExceeded] = useState<boolean>(false);
  const [dismissQuotaBanner, setDismissQuotaBanner] = useState<boolean>(false);

  // Trigger quick add santri from dashboard
  const [quickAddSantriTrigger, setQuickAddSantriTrigger] = useState<boolean>(false);

  // Real-time live notifications stack
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Bookmark / Home Screen Icon Modal Guide
  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);

  // Background Batik Bali settings
  const [batikOpacity, setBatikOpacity] = useState<number>(0.06);
  const [showBatikCorners, setShowBatikCorners] = useState<boolean>(true);

  // Background Batik Jawa Sidebar settings
  const [batikJawaType, setBatikJawaType] = useState<BatikJawaType>('kawung');
  const [batikJawaOpacity, setBatikJawaOpacity] = useState<number>(0.08);

  // Load from Firebase on mount
  useEffect(() => {
    const unsubQuota = onQuotaExceededChange((exceeded) => {
      if (exceeded) {
        setIsQuotaExceeded(true);
      }
    });

    const initDb = async () => {
      try {
        await bootstrapDatabaseIfEmpty(
          DEFAULT_SANTRI,
          DEFAULT_GURU_PENGASUH,
          DEFAULT_KAMAR,
          DEFAULT_LOGS,
          DEFAULT_KEUANGAN,
          DEFAULT_PELANGGARAN,
          DEFAULT_PRESTASI
        );
      } catch (e) {
        console.warn("Notice during bootstrap check:", e);
      }
    };
    initDb();

    const unsubSantri = subscribeSantri((items) => {
      setSantri(prev => {
        const merged = mergeCollections(prev, items, 'santri', (a, b) => a.nama.localeCompare(b.nama));
        setStoredItem('satdaf_santri', merged);
        return merged;
      });
    });
    const unsubGuru = subscribeGuru((items) => {
      setGuru(prev => {
        const merged = mergeCollections(prev, items, 'guru', (a, b) => a.nama.localeCompare(b.nama));
        setStoredItem('satdaf_guru', merged);
        return merged;
      });
    });
    const unsubKamar = subscribeKamar((items) => {
      setKamar(prev => {
        const merged = mergeCollections(prev, items, 'kamar', (a, b) => a.namaKamar.localeCompare(b.namaKamar));
        setStoredItem('satdaf_kamar', merged);
        return merged;
      });
    });
    const unsubLogs = subscribeLogs((items) => {
      setLogs(prev => {
        const merged = mergeCollections(prev, items, 'logs', (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setStoredItem('satdaf_logs', merged);
        return merged;
      });
    });
    const unsubKeuangan = subscribeKeuangan((items) => {
      setKeuangan(prev => {
        const merged = mergeCollections(prev, items, 'keuangan', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_keuangan', merged);
        return merged;
      });
    });
    const unsubPelanggaran = subscribePelanggaran((items) => {
      setPelanggaran(prev => {
        const merged = mergeCollections(prev, items, 'pelanggaran', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_pelanggaran', merged);
        return merged;
      });
    });
    const unsubPrestasi = subscribePrestasi((items) => {
      setPrestasi(prev => {
        const merged = mergeCollections(prev, items, 'prestasi', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_prestasi', merged);
        return merged;
      });
    });
    const unsubMutabaahTargets = subscribeMutabaahTargets((items) => {
      setMutabaahTargets(prev => {
        const merged = mergeCollections(prev, items, 'mutabaah_targets');
        setStoredItem('satdaf_mutabaah_targets', merged);
        return merged;
      });
    });
    const unsubMutabaahRecords = subscribeMutabaahRecords((items) => {
      setMutabaahRecords(prev => {
        const merged = mergeCollections(prev, items, 'mutabaah_records', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_mutabaah_records', merged);
        return merged;
      });
    });

    // Klinik Subscriptions with Fallbacks
    const unsubKunjungan = subscribeKunjunganBerobat((items) => {
      setKunjunganList(prev => {
        const merged = mergeCollections(prev, items, 'kunjungan_berobat', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_kunjungan_berobat', merged);
        return merged;
      });
    });
    const unsubStokObat = subscribeStokObat((items) => {
      setStokObatList(prev => {
        const merged = mergeCollections(prev, items, 'stok_obat', (a, b) => a.namaObat.localeCompare(b.namaObat));
        setStoredItem('satdaf_stok_obat', merged);
        return merged;
      });
    });
    const unsubRekamMedis = subscribeRekamMedis((items) => {
      setRekamMedisList(prev => {
        const merged = mergeCollections(prev, items, 'rekam_medis');
        setStoredItem('satdaf_rekam_medis', merged);
        return merged;
      });
    });
    const unsubAbsensiPetugas = subscribeAbsensiPetugasKlinik((items) => {
      setAbsensiPetugasList(prev => {
        const merged = mergeCollections(prev, items, 'absensi_petugas_klinik', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_absensi_petugas_klinik', merged);
        return merged;
      });
    });
    const unsubPengguna = subscribePenggunaApp((items) => {
      setPenggunaList(prev => {
        const merged = mergeCollections(prev, items, 'pengguna_app', (a, b) => a.username.localeCompare(b.username));
        setStoredItem('satdaf_pengguna_app', merged);
        return merged;
      });
    });
    const unsubKaryawan = subscribeKaryawanSDM((items) => {
      setKaryawanList(prev => {
        const merged = mergeCollections(prev, items, 'karyawan_sdm', (a, b) => a.nama.localeCompare(b.nama));
        setStoredItem('satdaf_karyawan_sdm', merged);
        return merged;
      });
    });
    const unsubPenilaian = subscribePenilaianSDM((items) => {
      setPenilaianList(prev => {
        const merged = mergeCollections(prev, items, 'penilaian_sdm', (a, b) => b.tanggalPenilaian.localeCompare(a.tanggalPenilaian));
        setStoredItem('satdaf_penilaian_sdm', merged);
        return merged;
      });
    });
    const unsubProgramLitbang = subscribeProgramLitbang((items) => {
      setProgramLitbangList(prev => {
        const merged = mergeCollections(prev, items, 'program_litbang', (a, b) => b.tanggalMulai.localeCompare(a.tanggalMulai));
        setStoredItem('satdaf_program_litbang', merged);
        return merged;
      });
    });
    const unsubTahfidz = subscribeTahfidzSetoran((items) => {
      setTahfidzSetoranList(prev => {
        const merged = mergeCollections(prev, items, 'tahfidz_setoran', (a, b) => b.tanggal.localeCompare(a.tanggal));
        setStoredItem('satdaf_tahfidz_setoran', merged);
        return merged;
      });
    });

    return () => {
      unsubQuota();
      unsubSantri();
      unsubGuru();
      unsubKamar();
      unsubLogs();
      unsubKeuangan();
      unsubPelanggaran();
      unsubPrestasi();
      unsubMutabaahTargets();
      unsubMutabaahRecords();
      unsubKunjungan();
      unsubStokObat();
      unsubRekamMedis();
      unsubAbsensiPetugas();
      unsubPengguna();
      unsubKaryawan();
      unsubPenilaian();
      unsubProgramLitbang();
      unsubTahfidz();
    };
  }, []);

  // Helper helper to append dynamic logs in real-time
  const pushNotificationLog = (kategori: LogAktivitas['kategori'], tipe: LogAktivitas['tipe'], pesan: string, actor: string) => {
    const newLog: LogAktivitas = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      kategori,
      tipe,
      pesan,
      actor
    };
    saveLogsDoc(newLog);

    // Trigger toast overlay notification
    setToastNotification(pesan);
    setTimeout(() => {
      setToastNotification(null);
    }, 4500);
  };

  // SANTRI OPERATIONALS
  const handleAddPelanggaran = (newPelanggaran: Omit<PelanggaranSantri, 'id'>) => {
    const fresh: PelanggaranSantri = {
      ...newPelanggaran,
      id: `p-${Date.now()}`
    };
    unmarkIdAsDeleted('pelanggaran', fresh.id);
    setPelanggaran(prev => {
      const updated = [...prev.filter(p => p.id !== fresh.id), fresh].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_pelanggaran', updated);
      return updated;
    });
    savePelanggaranDoc(fresh);
    pushNotificationLog(
      'Santri',
      'danger',
      `Pelanggaran dicatat untuk ${fresh.namaSantri}: "${fresh.jenisPelanggaran}" (${fresh.kategori}).`,
      fresh.petugas
    );
  };

  const handleUpdatePelanggaran = (updated: PelanggaranSantri) => {
    unmarkIdAsDeleted('pelanggaran', updated.id);
    setPelanggaran(prev => {
      const list = prev.map(p => p.id === updated.id ? updated : p).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_pelanggaran', list);
      return list;
    });
    savePelanggaranDoc(updated);
    pushNotificationLog(
      'Santri',
      'warning',
      `Data pelanggaran ${updated.namaSantri} diperbarui.`,
      updated.petugas
    );
  };

  const handleDeletePelanggaran = (id: string) => {
    const target = pelanggaran.find(p => p.id === id);
    markIdAsDeleted('pelanggaran', id);
    setPelanggaran(prev => {
      const list = prev.filter(p => p.id !== id);
      setStoredItem('satdaf_pelanggaran', list);
      return list;
    });
    deletePelanggaranDoc(id);
    if (target) {
      pushNotificationLog(
        'Santri',
        'info',
        `Catatan pelanggaran ${target.namaSantri} dihapus dari sistem.`,
        'Keamanan Pondok'
      );
    }
  };

  const handleAddSantri = (newSantri: Omit<Santri, 'id'>) => {
    const fresh: Santri = {
      ...newSantri,
      id: `s-${Date.now()}`
    };
    unmarkIdAsDeleted('santri', fresh.id);
    setSantri(prev => {
      const list = [...prev.filter(s => s.id !== fresh.id), fresh].sort((a, b) => a.nama.localeCompare(b.nama));
      setStoredItem('satdaf_santri', list);
      return list;
    });
    saveSantriDoc(fresh);
    pushNotificationLog(
      'Santri',
      'success',
      `Santri baru bernama "${fresh.nama}" (NISN: ${fresh.nis}) berhasil didaftarkan di kelas ${fresh.kelas}.`,
      'Admin Sistem'
    );
  };

  const handleUpdateSantri = (updatedSantri: Santri) => {
    const original = santri.find(s => s.id === updatedSantri.id);
    unmarkIdAsDeleted('santri', updatedSantri.id);
    setSantri(prev => {
      const list = prev.map(s => s.id === updatedSantri.id ? updatedSantri : s).sort((a, b) => a.nama.localeCompare(b.nama));
      setStoredItem('satdaf_santri', list);
      return list;
    });
    saveSantriDoc(updatedSantri);

    // Check if status changed
    if (original && original.status !== updatedSantri.status) {
      pushNotificationLog(
        'Santri',
        'warning',
        `Status santri "${updatedSantri.nama}" diubah dari "${original.status}" menjadi "${updatedSantri.status}".`,
        'Bagian Administrasi'
      );
    } else {
      pushNotificationLog(
        'Santri',
        'info',
        `Profil data induk santri "${updatedSantri.nama}" berhasil diperbarui.`,
        'Bagian Administrasi'
      );
    }
  };

  const handleDeleteSantri = (id: string) => {
    const original = santri.find(s => s.id === id);
    markIdAsDeleted('santri', id);
    setSantri(prev => {
      const list = prev.filter(s => s.id !== id);
      setStoredItem('satdaf_santri', list);
      return list;
    });
    deleteSantriDoc(id);
    if (original) {
      pushNotificationLog(
        'Santri',
        'danger',
        `Arsip data induk santri "${original.nama}" dihapus permanen dari basis data.`,
        'Admin Sistem'
      );
    }
  };

  // GURU & PENGASUH OPERATIONALS
  const handleAddGuru = (newGuru: Omit<PengasuhGuru, 'id'>) => {
    const fresh: PengasuhGuru = {
      ...newGuru,
      id: `g-${Date.now()}`
    };
    unmarkIdAsDeleted('guru', fresh.id);
    setGuru(prev => {
      const list = [...prev.filter(g => g.id !== fresh.id), fresh].sort((a, b) => a.nama.localeCompare(b.nama));
      setStoredItem('satdaf_guru', list);
      return list;
    });
    saveGuruDoc(fresh);

    // Auto-sync with Litbang SDM
    const existingSDM = karyawanList.find(
      k => (k.nipKaryawan && k.nipKaryawan === fresh.nip) || k.nama.trim().toLowerCase() === fresh.nama.trim().toLowerCase()
    );
    const sdmPayload: KaryawanSDM = {
      id: existingSDM ? existingSDM.id : `sdm-g-${fresh.id}`,
      nipKaryawan: fresh.nip || `SDM-${Date.now()}`,
      nama: fresh.nama,
      gender: fresh.gender,
      jabatan: `${fresh.peran}${fresh.spesialisasi ? ' - ' + fresh.spesialisasi : ''}`,
      unitKerja: fresh.peran.includes('Pengasuh') ? 'Pengasuhan Santri & Asrama' : 'Madrasah Diniyah & Tahfizh',
      statusKepegawaian: existingSDM ? existingSDM.statusKepegawaian : 'Tetap',
      noHp: fresh.noHp,
      email: existingSDM?.email || `${fresh.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@darularifin.sch.id`,
      pendidikanTerakhir: existingSDM?.pendidikanTerakhir || 'S1 Pendidikan Agama Islam',
      tanggalBergabung: existingSDM?.tanggalBergabung || new Date().toISOString().split('T')[0],
      catatanApresiasi: existingSDM?.catatanApresiasi || `Terdaftar sebagai Tenaga Pendidik / Pengasuh (${fresh.peran})`
    };
    unmarkIdAsDeleted('karyawan_sdm', sdmPayload.id);
    setKaryawanList(prev => {
      const list = [...prev.filter(k => k.id !== sdmPayload.id), sdmPayload];
      setStoredItem('satdaf_karyawan_sdm', list);
      return list;
    });
    saveKaryawanSDMDoc(sdmPayload);

    pushNotificationLog(
      'Akademik',
      'success',
      `Tenaga pendidik "${fresh.nama}" (Spesialis: ${fresh.spesialisasi}) terdaftar & disinkronkan ke Litbang SDM.`,
      'Bagian Kurikulum'
    );
  };

  const handleUpdateGuru = (updatedGuru: PengasuhGuru) => {
    unmarkIdAsDeleted('guru', updatedGuru.id);
    setGuru(prev => {
      const list = prev.map(g => g.id === updatedGuru.id ? updatedGuru : g).sort((a, b) => a.nama.localeCompare(b.nama));
      setStoredItem('satdaf_guru', list);
      return list;
    });
    saveGuruDoc(updatedGuru);

    // Sync updates to KaryawanSDM if present
    const existingSDM = karyawanList.find(
      k => (k.nipKaryawan && k.nipKaryawan === updatedGuru.nip) || k.nama.trim().toLowerCase() === updatedGuru.nama.trim().toLowerCase()
    );
    if (existingSDM) {
      const updatedSDM = {
        ...existingSDM,
        nama: updatedGuru.nama,
        gender: updatedGuru.gender,
        noHp: updatedGuru.noHp,
        jabatan: `${updatedGuru.peran}${updatedGuru.spesialisasi ? ' - ' + updatedGuru.spesialisasi : ''}`
      };
      unmarkIdAsDeleted('karyawan_sdm', updatedSDM.id);
      setKaryawanList(prev => {
        const list = prev.map(k => k.id === updatedSDM.id ? updatedSDM : k);
        setStoredItem('satdaf_karyawan_sdm', list);
        return list;
      });
      saveKaryawanSDMDoc(updatedSDM);
    }

    pushNotificationLog(
      'Akademik',
      'info',
      `Profil ustadz/ustadzah "${updatedGuru.nama}" dimodifikasi & disinkronkan ke SDM.`,
      'Bagian Kurikulum'
    );
  };

  const handleDeleteGuru = (id: string) => {
    const original = guru.find(g => g.id === id);
    markIdAsDeleted('guru', id);
    setGuru(prev => {
      const list = prev.filter(g => g.id !== id);
      setStoredItem('satdaf_guru', list);
      return list;
    });
    deleteGuruDoc(id);
    if (original) {
      pushNotificationLog(
        'Akademik',
        'danger',
        `Profil pengajar "${original.nama}" berhasil dihapus dari sistem.`,
        'Admin Kurikulum'
      );
    }
  };

  // KAMAR / ASRAMA OPERATIONALS
  const handleAddKamar = (newKamar: Omit<Kamar, 'id' | 'absensiHariIni'>) => {
    const fresh: Kamar = {
      ...newKamar,
      id: `k-${Date.now()}`,
      absensiHariIni: []
    };
    unmarkIdAsDeleted('kamar', fresh.id);
    setKamar(prev => {
      const list = [...prev.filter(k => k.id !== fresh.id), fresh].sort((a, b) => a.namaKamar.localeCompare(b.namaKamar));
      setStoredItem('satdaf_kamar', list);
      return list;
    });
    saveKamarDoc(fresh);
    pushNotificationLog(
      'Kamar',
      'success',
      `Kamar asrama baru "${fresh.namaKamar}" (${fresh.gedung}) dengan kapasitas ${fresh.kapasitas} bed dibuat.`,
      'Kepala Sarpras'
    );
  };

  const handleUpdateKamar = (updatedKamar: Kamar) => {
    unmarkIdAsDeleted('kamar', updatedKamar.id);
    setKamar(prev => {
      const list = prev.map(k => k.id === updatedKamar.id ? updatedKamar : k);
      setStoredItem('satdaf_kamar', list);
      return list;
    });
    saveKamarDoc(updatedKamar);
    pushNotificationLog(
      'Kamar',
      'info',
      `Informasi kamar / inventaris untuk "${updatedKamar.namaKamar}" diperbarui.`,
      'Pengurus Asrama'
    );
  };

  const handleDeleteKamar = (id: string) => {
    const original = kamar.find(k => k.id === id);
    markIdAsDeleted('kamar', id);
    setKamar(prev => {
      const list = prev.filter(k => k.id !== id);
      setStoredItem('satdaf_kamar', list);
      return list;
    });
    deleteKamarDoc(id);
    if (original) {
      pushNotificationLog(
        'Kamar',
        'danger',
        `Kamar asrama "${original.namaKamar}" dihapus. Santri di dalam kamar diatur ulang.`,
        'Admin Sarpras'
      );
    }
  };

  const handleUpdateKamarAttendance = (idKamar: string, absensi: AbsensiSantriKamar[]) => {
    const roomObj = kamar.find(k => k.id === idKamar);
    if (roomObj) {
      const updatedRoom = {
        ...roomObj,
        absensiHariIni: absensi
      };
      setKamar(prev => {
        const list = prev.map(k => k.id === idKamar ? updatedRoom : k);
        setStoredItem('satdaf_kamar', list);
        return list;
      });
      saveKamarDoc(updatedRoom);

      const absentCount = absensi.filter(a => a.statusKamar !== 'Hadir').length;
      const desc = absentCount > 0 
        ? `Absensi kamar selesai untuk "${roomObj.namaKamar}". Terdeteksi ${absentCount} santri berhalangan hadir.`
        : `Absensi kamar selesai untuk "${roomObj.namaKamar}". Semua santri terverifikasi hadir lengkap.`;

      pushNotificationLog(
        'Kamar',
        absentCount > 0 ? 'warning' : 'success',
        desc,
        'Keamanan Pondok'
      );
    }
  };

  // FINANCIAL OPERATIONALS
  const handleAddKeuangan = (newKeuangan: Omit<CatatanKeuangan, 'id'>) => {
    const fresh: CatatanKeuangan = {
      ...newKeuangan,
      id: `f-${Date.now()}`
    };
    unmarkIdAsDeleted('keuangan', fresh.id);
    setKeuangan(prev => {
      const list = [...prev.filter(k => k.id !== fresh.id), fresh].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_keuangan', list);
      return list;
    });
    saveKeuanganDoc(fresh);

    pushNotificationLog(
      'Keuangan',
      fresh.tipe === 'Pemasukan' ? 'success' : 'warning',
      `Jurnal Kas ${fresh.tipe} direkam: "${fresh.kategori}" sebesar Rp ${fresh.nominal.toLocaleString('id-ID')}.`,
      'Bendahara Pondok'
    );
  };

  const handleDeleteKeuangan = (id: string) => {
    const original = keuangan.find(k => k.id === id);
    markIdAsDeleted('keuangan', id);
    setKeuangan(prev => {
      const list = prev.filter(k => k.id !== id);
      setStoredItem('satdaf_keuangan', list);
      return list;
    });
    deleteKeuanganDoc(id);
    if (original) {
      pushNotificationLog(
        'Keuangan',
        'danger',
        `Catatan transaksi kas "${original.kategori}" senilai Rp ${original.nominal.toLocaleString('id-ID')} dibatalkan/dihapus.`,
        'Bendahara Pondok'
      );
    }
  };

  // TRIGGER SIMULATION MANUALLY FROM THE STREAM PAGE
  const handleTriggerSimulatedLog = (customPreset?: Omit<LogAktivitas, 'id' | 'timestamp'>) => {
    if (customPreset) {
      pushNotificationLog(
        customPreset.kategori,
        customPreset.tipe,
        customPreset.pesan,
        customPreset.actor
      );
    } else {
      pushNotificationLog(
        'Sistem',
        'info',
        'Simulasi ping heartbeat sistem monitoring normal.',
        'Pemberitahu Otomatis'
      );
    }
  };

  // Reset Logs
  const handleClearLogs = () => {
    clearLogsInDb();
    setLogs([]);
    setStoredItem('satdaf_logs', []);
    setToastNotification('Seluruh log pemantauan telah dikosongkan.');
    setTimeout(() => setToastNotification(null), 3000);
  };

  // PRESTASI OPERATIONALS
  const handleAddPrestasi = (newPrestasi: Omit<Prestasi, 'id'>) => {
    const fresh: Prestasi = {
      ...newPrestasi,
      id: `p-p-${Date.now()}`
    };
    unmarkIdAsDeleted('prestasi', fresh.id);
    setPrestasi(prev => {
      const list = [...prev.filter(p => p.id !== fresh.id), fresh].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_prestasi', list);
      return list;
    });
    savePrestasiDoc(fresh);
    pushNotificationLog(
      'Sistem',
      'success',
      `Penghargaan baru dicatat untuk ${fresh.penerimaNama}: "${fresh.judul}" (${fresh.kategori}).`,
      'Arsip Pesantren'
    );
  };

  const handleUpdatePrestasi = (updated: Prestasi) => {
    unmarkIdAsDeleted('prestasi', updated.id);
    setPrestasi(prev => {
      const list = prev.map(p => p.id === updated.id ? updated : p).sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_prestasi', list);
      return list;
    });
    savePrestasiDoc(updated);
    pushNotificationLog(
      'Sistem',
      'info',
      `Arsip data prestasi "${updated.judul}" milik ${updated.penerimaNama} diperbarui.`,
      'Arsip Pesantren'
    );
  };

  const handleDeletePrestasi = (id: string) => {
    const target = prestasi.find(p => p.id === id);
    markIdAsDeleted('prestasi', id);
    setPrestasi(prev => {
      const list = prev.filter(p => p.id !== id);
      setStoredItem('satdaf_prestasi', list);
      return list;
    });
    deletePrestasiDoc(id);
    if (target) {
      pushNotificationLog(
        'Sistem',
        'warning',
        `Arsip prestasi "${target.judul}" milik ${target.penerimaNama} dihapus permanen.`,
        'Admin Arsip'
      );
    }
  };

  // Mutabaah Handlers
  const handleSaveMutabaahTarget = (item: TargetMasterItem) => {
    unmarkIdAsDeleted('mutabaah_targets', item.id);
    setMutabaahTargets(prev => {
      const list = [...prev.filter(t => t.id !== item.id), item];
      setStoredItem('satdaf_mutabaah_targets', list);
      return list;
    });
    saveMutabaahTargetDoc(item);
    pushNotificationLog(
      'Sistem',
      'info',
      `Target Master Sheet "${item.program}" (${item.target} ${item.satuan}) diperbarui.`,
      'Kurikulum Pesantren'
    );
  };

  const handleDeleteMutabaahTarget = (id: string) => {
    markIdAsDeleted('mutabaah_targets', id);
    setMutabaahTargets(prev => {
      const list = prev.filter(t => t.id !== id);
      setStoredItem('satdaf_mutabaah_targets', list);
      return list;
    });
    deleteMutabaahTargetDoc(id);
    pushNotificationLog(
      'Sistem',
      'warning',
      `Target Master Sheet (${id}) dihapus.`,
      'Kurikulum Pesantren'
    );
  };

  const handleResetMutabaahTargets = async () => {
    await resetMutabaahTargetsInDb();
    setMutabaahTargets(DEFAULT_TARGET_MASTERS);
    setStoredItem('satdaf_mutabaah_targets', DEFAULT_TARGET_MASTERS);
    pushNotificationLog(
      'Sistem',
      'success',
      'Berhasil mengembalikan seluruh 33 Target Master Penilaian Mutabaah Yaumiyah seperti semula.',
      'Kurikulum Pesantren'
    );
  };

  const handleSaveMutabaahRecord = (record: RecordMutabaahSantri) => {
    unmarkIdAsDeleted('mutabaah_records', record.id);
    setMutabaahRecords(prev => {
      const list = [...prev.filter(r => r.id !== record.id), record].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_mutabaah_records', list);
      return list;
    });
    saveMutabaahRecordDoc(record);
    pushNotificationLog(
      'Santri',
      'success',
      `Mutabaah Yaumiyah Santri ${record.namaSantri} tanggal ${record.tanggal} disimpan (Skor: ${record.totalSkor}, ${record.rataRataPersentase}%).`,
      record.musyrifNama
    );
  };

  const handleBatchSaveMutabaahRecords = (records: RecordMutabaahSantri[]) => {
    records.forEach(r => unmarkIdAsDeleted('mutabaah_records', r.id));
    setMutabaahRecords(prev => {
      const newIds = new Set(records.map(r => r.id));
      const list = [...prev.filter(r => !newIds.has(r.id)), ...records].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_mutabaah_records', list);
      return list;
    });
    batchSaveMutabaahRecords(records);
    pushNotificationLog(
      'Sistem',
      'success',
      `Berhasil menyimpan batch ${records.length} data Mutabaah Yaumiyah Santri.`,
      'Musyrif Pengasuhan'
    );
  };

  const handleDeleteMutabaahRecord = (id: string) => {
    markIdAsDeleted('mutabaah_records', id);
    setMutabaahRecords(prev => {
      const list = prev.filter(r => r.id !== id);
      setStoredItem('satdaf_mutabaah_records', list);
      return list;
    });
    deleteMutabaahRecordDoc(id);
    pushNotificationLog(
      'Sistem',
      'warning',
      `Catatan Mutabaah Yaumiyah Santri telah dihapus.`,
      'Pengasuhan'
    );
  };

  const handleClearAllMutabaahRecords = async () => {
    try {
      await clearAllMutabaahRecordsInDb();
      setMutabaahRecords([]);
      setStoredItem('satdaf_mutabaah_records', []);
      pushNotificationLog(
        'Sistem',
        'danger',
        'Seluruh data Mutabaah Yaumiyah santri telah berhasil dibersihkan & di-refresh (kondisi fresh).',
        'Admin Sistem'
      );
    } catch (err) {
      console.error('Error clearing mutabaah records:', err);
    }
  };

  // Klinik Kesehatan Handlers
  const handleSaveKunjungan = (item: KunjunganBerobat) => {
    unmarkIdAsDeleted('kunjungan_berobat', item.id);
    setKunjunganList(prev => {
      const list = [...prev.filter(k => k.id !== item.id), item].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_kunjungan_berobat', list);
      return list;
    });
    saveKunjunganBerobatDoc(item);
    pushNotificationLog(
      'Klinik',
      'info',
      `Catatan berobat santri ${item.namaSantri} (Diagnosa: ${item.diagnosis}) disimpan.`,
      item.petugas
    );
  };

  const handleDeleteKunjungan = (id: string) => {
    markIdAsDeleted('kunjungan_berobat', id);
    setKunjunganList(prev => {
      const list = prev.filter(k => k.id !== id);
      setStoredItem('satdaf_kunjungan_berobat', list);
      return list;
    });
    deleteKunjunganBerobatDoc(id);
    pushNotificationLog(
      'Klinik',
      'warning',
      `Catatan kunjungan berobat telah dihapus.`,
      'Petugas UKS'
    );
  };

  const handleSaveStokObat = (item: StokObatLogistik) => {
    unmarkIdAsDeleted('stok_obat', item.id);
    setStokObatList(prev => {
      const list = [...prev.filter(s => s.id !== item.id), item].sort((a, b) => a.namaObat.localeCompare(b.namaObat));
      setStoredItem('satdaf_stok_obat', list);
      return list;
    });
    saveStokObatDoc(item);
    pushNotificationLog(
      'Klinik',
      'info',
      `Data master obat ${item.namaObat} (Stok: ${item.stokSekarang} ${item.satuan}) diperbarui.`,
      'Logistik Klinik'
    );
  };

  const handleDeleteStokObat = (id: string) => {
    markIdAsDeleted('stok_obat', id);
    setStokObatList(prev => {
      const list = prev.filter(s => s.id !== id);
      setStoredItem('satdaf_stok_obat', list);
      return list;
    });
    deleteStokObatDoc(id);
    pushNotificationLog(
      'Klinik',
      'warning',
      `Data obat telah dihapus dari logistik.`,
      'Logistik Klinik'
    );
  };

  const handleSaveRekamMedis = (item: RekamMedisSantri) => {
    unmarkIdAsDeleted('rekam_medis', item.idSantri);
    setRekamMedisList(prev => {
      const list = [...prev.filter(r => r.idSantri !== item.idSantri), item];
      setStoredItem('satdaf_rekam_medis', list);
      return list;
    });
    saveRekamMedisDoc(item);
    pushNotificationLog(
      'Klinik',
      'info',
      `Profil rekam medis santri diperbarui (GolDarah: ${item.golonganDarah}).`,
      'Petugas UKS'
    );
  };

  const handleSaveAbsensiPetugas = (item: AbsensiPetugasKlinik) => {
    unmarkIdAsDeleted('absensi_petugas_klinik', item.id);
    setAbsensiPetugasList(prev => {
      const list = [...prev.filter(a => a.id !== item.id), item].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_absensi_petugas_klinik', list);
      return list;
    });
    saveAbsensiPetugasKlinikDoc(item);
    pushNotificationLog(
      'Klinik',
      'success',
      `Absensi petugas jaga ${item.namaPetugas} (${item.shift}) berhasil dicatat.`,
      'Piket UKS'
    );
  };

  const handleDeleteAbsensiPetugas = (id: string) => {
    markIdAsDeleted('absensi_petugas_klinik', id);
    setAbsensiPetugasList(prev => {
      const list = prev.filter(a => a.id !== id);
      setStoredItem('satdaf_absensi_petugas_klinik', list);
      return list;
    });
    deleteAbsensiPetugasKlinikDoc(id);
    pushNotificationLog(
      'Klinik',
      'warning',
      `Catatan absensi petugas telah dihapus.`,
      'Piket UKS'
    );
  };

  // PENGGUNA APP OPERATIONALS
  const handleSavePengguna = (item: PenggunaApp) => {
    unmarkIdAsDeleted('pengguna_app', item.id);
    setPenggunaList(prev => {
      const list = [...prev.filter(p => p.id !== item.id), item].sort((a, b) => a.username.localeCompare(b.username));
      setStoredItem('satdaf_pengguna_app', list);
      return list;
    });
    savePenggunaAppDoc(item);
    pushNotificationLog(
      'Sistem',
      'info',
      `Akun pengguna @${item.username} (${item.role}) disimpan.`,
      username || 'Admin'
    );
  };

  const handleDeletePengguna = (id: string) => {
    markIdAsDeleted('pengguna_app', id);
    setPenggunaList(prev => {
      const list = prev.filter(p => p.id !== id);
      setStoredItem('satdaf_pengguna_app', list);
      return list;
    });
    deletePenggunaAppDoc(id);
    pushNotificationLog(
      'Sistem',
      'warning',
      `Akun pengguna telah dihapus dari sistem.`,
      username || 'Admin'
    );
  };

  // LITBANG & SDM OPERATIONALS
  const handleSyncGuruAndSDM = () => {
    let syncedToSDM = 0;
    let syncedToGuru = 0;

    // 1. Sync PengasuhGuru -> KaryawanSDM
    guru.forEach(g => {
      const existsSDM = karyawanList.some(
        k => (k.nipKaryawan && k.nipKaryawan === g.nip) || k.nama.trim().toLowerCase() === g.nama.trim().toLowerCase()
      );
      if (!existsSDM) {
        const sdmDoc: KaryawanSDM = {
          id: `sdm-g-${g.id}`,
          nipKaryawan: g.nip || `SDM-${Date.now()}`,
          nama: g.nama,
          gender: g.gender,
          jabatan: `${g.peran}${g.spesialisasi ? ' - ' + g.spesialisasi : ''}`,
          unitKerja: g.peran.includes('Pengasuh') ? 'Pengasuhan Santri & Asrama' : 'Madrasah Diniyah & Tahfizh',
          statusKepegawaian: 'Tetap',
          noHp: g.noHp,
          email: `${g.nama.toLowerCase().replace(/[^a-z0-9]/g, '')}@darularifin.sch.id`,
          pendidikanTerakhir: 'S1 Pendidikan Agama Islam',
          tanggalBergabung: '2022-07-15',
          catatanApresiasi: `Terdaftar di Pengasuh & Guru (${g.peran})`
        };
        unmarkIdAsDeleted('karyawan_sdm', sdmDoc.id);
        saveKaryawanSDMDoc(sdmDoc);
        syncedToSDM++;
      }
    });

    // 2. Sync KaryawanSDM -> PengasuhGuru
    karyawanList.forEach(k => {
      const isTeacherRole = 
        k.unitKerja === 'Pengasuhan Santri & Asrama' ||
        k.unitKerja === 'Madrasah Diniyah & Tahfizh' ||
        k.unitKerja === 'Sekolah Formal (SMP/SMA/MA)' ||
        k.jabatan.toLowerCase().includes('guru') ||
        k.jabatan.toLowerCase().includes('pengasuh') ||
        k.jabatan.toLowerCase().includes('ustadz') ||
        k.jabatan.toLowerCase().includes('musyrif');

      if (isTeacherRole) {
        const existsGuru = guru.some(
          g => (g.nip && g.nip === k.nipKaryawan) || g.nama.trim().toLowerCase() === k.nama.trim().toLowerCase()
        );
        if (!existsGuru) {
          const guruDoc: PengasuhGuru = {
            id: `guru-sdm-${k.id}`,
            nip: k.nipKaryawan || `199${Math.floor(100000 + Math.random() * 900000)}`,
            nama: k.nama,
            gender: k.gender,
            peran: k.jabatan.toLowerCase().includes('pengasuh') ? 'Pengasuh & Guru' : 'Guru',
            spesialisasi: k.jabatan,
            noHp: k.noHp,
            alamat: k.unitKerja,
            jadwal: []
          };
          unmarkIdAsDeleted('guru', guruDoc.id);
          saveGuruDoc(guruDoc);
          syncedToGuru++;
        }
      }
    });

    const infoMsg = `Sinkronisasi Data SDM & Pengasuh/Guru Selesai! (+${syncedToSDM} ke SDM Litbang, +${syncedToGuru} ke Pengasuh/Guru)`;
    pushNotificationLog('Sistem', 'success', infoMsg, username || 'Admin SDM');
    setToastNotification(infoMsg);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleSaveKaryawan = (item: KaryawanSDM) => {
    unmarkIdAsDeleted('karyawan_sdm', item.id);
    setKaryawanList(prev => {
      const list = [...prev.filter(k => k.id !== item.id), item].sort((a, b) => a.nama.localeCompare(b.nama));
      setStoredItem('satdaf_karyawan_sdm', list);
      return list;
    });
    saveKaryawanSDMDoc(item);

    // Auto sync to Pengasuh & Guru if role is teaching/pengasuhan
    const isTeacherRole = 
      item.unitKerja === 'Pengasuhan Santri & Asrama' ||
      item.unitKerja === 'Madrasah Diniyah & Tahfizh' ||
      item.unitKerja === 'Sekolah Formal (SMP/SMA/MA)' ||
      item.jabatan.toLowerCase().includes('guru') ||
      item.jabatan.toLowerCase().includes('pengasuh') ||
      item.jabatan.toLowerCase().includes('ustadz') ||
      item.jabatan.toLowerCase().includes('musyrif');

    if (isTeacherRole) {
      const existingGuru = guru.find(
        g => (g.nip && g.nip === item.nipKaryawan) || g.nama.trim().toLowerCase() === item.nama.trim().toLowerCase()
      );
      const guruPayload: PengasuhGuru = {
        id: existingGuru ? existingGuru.id : `guru-sdm-${item.id}`,
        nip: item.nipKaryawan || `199${Math.floor(100000 + Math.random() * 900000)}`,
        nama: item.nama,
        gender: item.gender,
        peran: item.jabatan.toLowerCase().includes('pengasuh') ? 'Pengasuh & Guru' : 'Guru',
        spesialisasi: item.jabatan,
        noHp: item.noHp,
        alamat: existingGuru?.alamat || item.unitKerja,
        jadwal: existingGuru?.jadwal || []
      };
      unmarkIdAsDeleted('guru', guruPayload.id);
      setGuru(prev => {
        const list = [...prev.filter(g => g.id !== guruPayload.id), guruPayload].sort((a, b) => a.nama.localeCompare(b.nama));
        setStoredItem('satdaf_guru', list);
        return list;
      });
      saveGuruDoc(guruPayload);
    }

    pushNotificationLog('Sistem', 'success', `Data karyawan SDM "${item.nama}" telah disimpan & disinkronkan.`, username || 'Admin');
  };
  const handleDeleteKaryawan = (id: string) => {
    markIdAsDeleted('karyawan_sdm', id);
    setKaryawanList(prev => {
      const list = prev.filter(k => k.id !== id);
      setStoredItem('satdaf_karyawan_sdm', list);
      return list;
    });
    deleteKaryawanSDMDoc(id);
    pushNotificationLog('Sistem', 'warning', `Data karyawan SDM dihapus dari sistem.`, username || 'Admin');
  };

  const handleSavePenilaian = (item: PenilaianKinerjaSDM) => {
    unmarkIdAsDeleted('penilaian_sdm', item.id);
    setPenilaianList(prev => {
      const list = [...prev.filter(p => p.id !== item.id), item].sort((a, b) => b.tanggalPenilaian.localeCompare(a.tanggalPenilaian));
      setStoredItem('satdaf_penilaian_sdm', list);
      return list;
    });
    savePenilaianSDMDoc(item);
    pushNotificationLog('Sistem', 'success', `Evaluasi kinerja SDM untuk "${item.namaKaryawan}" (Skor: ${item.totalSkorFinal}) berhasil disimpan.`, username || 'Admin');
  };
  const handleDeletePenilaian = (id: string) => {
    markIdAsDeleted('penilaian_sdm', id);
    setPenilaianList(prev => {
      const list = prev.filter(p => p.id !== id);
      setStoredItem('satdaf_penilaian_sdm', list);
      return list;
    });
    deletePenilaianSDMDoc(id);
    pushNotificationLog('Sistem', 'warning', `Catatan penilaian kinerja SDM dihapus.`, username || 'Admin');
  };

  const handleSaveProgramLitbang = (item: ProgramInovasiLitbang) => {
    unmarkIdAsDeleted('program_litbang', item.id);
    setProgramLitbangList(prev => {
      const list = [...prev.filter(p => p.id !== item.id), item].sort((a, b) => b.tanggalMulai.localeCompare(a.tanggalMulai));
      setStoredItem('satdaf_program_litbang', list);
      return list;
    });
    saveProgramLitbangDoc(item);
    pushNotificationLog('Sistem', 'info', `Program inovasi Litbang "${item.judulProgram}" disimpan.`, username || 'Admin');
  };
  const handleDeleteProgramLitbang = (id: string) => {
    markIdAsDeleted('program_litbang', id);
    setProgramLitbangList(prev => {
      const list = prev.filter(p => p.id !== id);
      setStoredItem('satdaf_program_litbang', list);
      return list;
    });
    deleteProgramLitbangDoc(id);
    pushNotificationLog('Sistem', 'warning', `Program inovasi Litbang dihapus.`, username || 'Admin');
  };

  const handleSaveTahfidzSetoran = (item: RecordSetoranTahfidz) => {
    unmarkIdAsDeleted('tahfidz_setoran', item.id);
    setTahfidzSetoranList(prev => {
      const list = [...prev.filter(t => t.id !== item.id), item].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
      setStoredItem('satdaf_tahfidz_setoran', list);
      return list;
    });
    saveTahfidzSetoranDoc(item);
    pushNotificationLog('Sistem', 'success', `Setoran hafalan "${item.surahMulai}" untuk ${item.namaSantri} (+${item.xpObtained} XP) disimpan.`, username || 'Musyrif');
  };
  const handleDeleteTahfidzSetoran = (id: string) => {
    markIdAsDeleted('tahfidz_setoran', id);
    setTahfidzSetoranList(prev => {
      const list = prev.filter(t => t.id !== id);
      setStoredItem('satdaf_tahfidz_setoran', list);
      return list;
    });
    deleteTahfidzSetoranDoc(id);
    pushNotificationLog('Sistem', 'warning', `Catatan setoran hafalan dihapus.`, username || 'Musyrif');
  };
  const handleClearAllTahfidzSetoran = async () => {
    try {
      await clearAllTahfidzSetoranInDb();
      setTahfidzSetoranList([]);
      setStoredItem('satdaf_tahfidz_setoran', []);
      pushNotificationLog(
        'Sistem',
        'danger',
        'Seluruh data setoran & penilaian XP santri di Tahfidz Gamifikasi telah dibersihkan (kondisi fresh 0 XP).',
        username || 'Admin'
      );
    } catch (err) {
      console.error('Error clearing tahfidz setoran:', err);
    }
  };

  const handleRestoreData = (dataObj: any) => {
    if (dataObj.satdaf_santri) setSantri(dataObj.satdaf_santri);
    if (dataObj.satdaf_guru) setGuru(dataObj.satdaf_guru);
    if (dataObj.satdaf_kamar) setKamar(dataObj.satdaf_kamar);
    if (dataObj.satdaf_logs) setLogs(dataObj.satdaf_logs);
    if (dataObj.satdaf_keuangan) setKeuangan(dataObj.satdaf_keuangan);
    if (dataObj.satdaf_pelanggaran) setPelanggaran(dataObj.satdaf_pelanggaran);
    if (dataObj.satdaf_prestasi) setPrestasi(dataObj.satdaf_prestasi);
    if (dataObj.satdaf_mutabaah_targets) setMutabaahTargets(dataObj.satdaf_mutabaah_targets);
    if (dataObj.satdaf_mutabaah_records) setMutabaahRecords(dataObj.satdaf_mutabaah_records);
    if (dataObj.satdaf_kunjungan_berobat) setKunjunganList(dataObj.satdaf_kunjungan_berobat);
    if (dataObj.satdaf_stok_obat) setStokObatList(dataObj.satdaf_stok_obat);
    if (dataObj.satdaf_rekam_medis) setRekamMedisList(dataObj.satdaf_rekam_medis);
    if (dataObj.satdaf_absensi_petugas_klinik) setAbsensiPetugasList(dataObj.satdaf_absensi_petugas_klinik);
    if (dataObj.satdaf_pengguna_app) setPenggunaList(dataObj.satdaf_pengguna_app);
    if (dataObj.satdaf_karyawan_sdm) setKaryawanList(dataObj.satdaf_karyawan_sdm);
    if (dataObj.satdaf_penilaian_sdm) setPenilaianList(dataObj.satdaf_penilaian_sdm);
    if (dataObj.satdaf_program_litbang) setProgramLitbangList(dataObj.satdaf_program_litbang);
    if (dataObj.satdaf_tahfidz_setoran) setTahfidzSetoranList(dataObj.satdaf_tahfidz_setoran);

    pushNotificationLog('Sistem', 'success', 'Seluruh data berhasil dipulihkan dari cadangan.', username || 'Admin');
  };

  // Navigation Items (Static List)
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tahfidz-gamifikasi', label: 'Tahfidz Gamifikasi', icon: Flame },
    { id: 'santri', label: 'Data Santri', icon: Users },
    { id: 'kamar', label: 'Data Kamar (Asrama)', icon: Home },
    { id: 'guru', label: 'Pengasuh & Guru', icon: GraduationCap },
    { id: 'litbang-sdm', label: 'Litbang & SDM', icon: BrainCircuit },
    { id: 'mutabaah', label: 'Mutabaah Yaumiyah Santri', icon: Zap },
    { id: 'portal-orangtua', label: 'Portal Orang Tua', icon: HeartHandshake },
    { id: 'klinik', label: 'Klinik Kesehatan Santri', icon: Stethoscope },
    { id: 'pelanggaran', label: 'Pelanggaran Santri', icon: ShieldAlert },
    { id: 'prestasi', label: 'Prestasi & Penghargaan', icon: Trophy },
    { id: 'monitoring-pimpinan', label: 'Monitoring Pimpinan', icon: Tv },
    { id: 'monitoring', label: 'Monitoring Real-Time', icon: Radio },
    { id: 'role-pengguna', label: 'Role & Akses Pengguna', icon: ShieldCheck },
    { id: 'laporan', label: 'Laporan Bulanan', icon: FilePieChart },
  ];

  // Active User Account details
  const activeUserList = penggunaList.length > 0 ? penggunaList : DEFAULT_PENGGUNA_APP;
  const currentAccount = activeUserList.find(u => u.username.toLowerCase() === (username || '').toLowerCase());

  // Dynamic Allowed Menus from user account
  const allowedMenuIds = currentAccount 
    ? (userRole === 'ADMIN' || currentAccount.role === 'ADMIN'
        ? Array.from(new Set([...(currentAccount.allowedMenus || []), ...menuItems.map(m => m.id)]))
        : (currentAccount.allowedMenus || []))
    : userRole === 'ADMIN'
      ? menuItems.map(m => m.id)
      : ['dashboard', 'tahfidz-gamifikasi', 'klinik', 'portal-orangtua', 'mutabaah', 'santri', 'guru', 'litbang-sdm', 'kamar', 'pelanggaran', 'laporan'];

  // Filtered menu items based on user's specific allowed menus
  const filteredMenuItems = userRole 
    ? menuItems.filter(item => allowedMenuIds.includes(item.id))
    : [];

  // Route protection and sync effect
  useEffect(() => {
    if (userRole && filteredMenuItems.length > 0) {
      const isAllowed = filteredMenuItems.some(m => m.id === activeMenu);
      if (!isAllowed) {
        setActiveMenu(filteredMenuItems[0].id);
      }
    }
  }, [userRole, activeMenu, filteredMenuItems]);

  // Auth Operations
  const handleLogin = (
    role: string, 
    user: string, 
    allowedMenus?: string[], 
    namaLengkap?: string
  ) => {
    setUserRole(role);
    setUsername(user);
    localStorage.setItem('satdaf_role', role);
    localStorage.setItem('satdaf_username', user);

    const targetUser = activeUserList.find(u => u.username.toLowerCase() === user.toLowerCase());
    const initialMenus = targetUser?.allowedMenus || allowedMenus || menuItems.map(m => m.id);

    if (initialMenus.length > 0) {
      setActiveMenu(initialMenus[0]);
    }

    pushNotificationLog('Sistem', 'success', `Berhasil masuk sebagai ${namaLengkap || user} (${role}).`, 'Keamanan');
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername(null);
    localStorage.removeItem('satdaf_role');
    localStorage.removeItem('satdaf_username');
    pushNotificationLog('Sistem', 'info', 'Anda berhasil keluar dari sistem.', 'Keamanan');
  };

  // Render Login page if not authenticated
  if (!userRole) {
    return (
      <LoginScreen 
        penggunaList={activeUserList} 
        onLogin={handleLogin} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-nature-beige text-nature-charcoal flex flex-col md:flex-row relative overflow-x-hidden font-sans" id="app-viewport">
      
      {/* Background Ornamen Batik Bali Klasik */}
      <BatikBackground opacity={batikOpacity} showCorners={showBatikCorners} />

      {/* 1. Side Navigation Menu Bar for Desktop */}
      <aside className="relative hidden md:flex flex-col w-64 bg-emerald-950 text-white border-r border-emerald-800/80 shrink-0 select-none z-30" id="desktop-sidebar">
        {/* Background Batik Jawa Ornament for Sidebar */}
        <BatikJawaSidebar type={batikJawaType} opacity={batikJawaOpacity} />

        {/* Brand Header */}
        <div className="p-6 border-b border-emerald-800/80 bg-gradient-to-b from-emerald-900 via-emerald-950 to-emerald-950 relative overflow-hidden z-10" id="desktop-brand-header">
          {/* Subtle glowing orb */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-nature-gold/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* Animated Logo Container with Spinning Islamic Star Pattern Outer Ring */}
            <motion.div 
              className="relative w-11 h-11 flex items-center justify-center shrink-0"
              whileHover={{ scale: 1.05 }}
            >
              {/* Outer Glowing Star Pattern Rotating SVG */}
              <motion.div 
                className="absolute inset-0 text-nature-gold/30"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
              >
                <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3" className="w-full h-full">
                  <path d="M50,5 L63,35 L95,37 L70,60 L78,92 L50,75 L22,92 L30,60 L5,37 L37,35 Z" strokeDasharray="4,2" />
                </svg>
              </motion.div>
              
              {/* Core Icon Container */}
              <div className="w-8 h-8 rounded-lg bg-emerald-800/80 text-white flex items-center justify-center border border-nature-gold/20 shadow-inner z-10">
                <BookOpen className="w-4 h-4 text-nature-gold animate-pulse" />
              </div>
            </motion.div>

            {/* Title text with fade-in slide-up container */}
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-0.5"
            >
              <span className="text-[14px] font-black text-nature-gold uppercase tracking-[0.15em] block leading-none">SATDAF</span>
              <h2 className="font-serif italic text-xs font-bold text-white tracking-wide leading-tight drop-shadow-sm mt-0.5">
                DARUL ARIFIN
              </h2>
              <span className="text-[7px] text-emerald-200 font-bold uppercase tracking-[0.05em] block leading-none mt-0.5">SISTEM ADMINISTRASI TERPADU</span>
            </motion.div>
          </div>

          {/* Quick Bookmark / Home Screen Icon Trigger Button */}
          <button
            onClick={() => setShowBookmarkModal(true)}
            className="mt-3.5 w-full py-1.5 px-2.5 bg-nature-gold/15 hover:bg-nature-gold/25 text-nature-gold border border-nature-gold/30 rounded-xl text-[10px] font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
            title="Cara menyimpan ikon SATDAF di layar depan HP"
            id="desktop-sidebar-bookmark-btn"
          >
            <Smartphone className="w-3.5 h-3.5 text-nature-gold animate-pulse" />
            <span>Simpan Ikon SATDAF di HP</span>
          </button>
        </div>



        {/* Menu Items */}
        <nav className="flex-1 px-4 space-y-1.5 relative z-10" id="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeMenu === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  setQuickAddSantriTrigger(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-white text-emerald-950 font-black shadow-lg shadow-black/20 border-r-4 border-nature-gold' 
                    : 'text-white hover:bg-white/10 hover:text-white'
                }`}
                id={`menu-btn-${item.id}`}
              >
                <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-800' : 'text-emerald-200'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>
        
        {/* User Card & Logout segment */}
        <div className="relative z-10 p-4 border-t border-nature-forest-medium/60 bg-[#1F2E24]/40 mt-auto" id="sidebar-user-card">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-nature-gold/15 text-nature-gold flex items-center justify-center border border-nature-gold/30 shrink-0 font-extrabold text-xs">
              {userRole?.substring(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-100 truncate uppercase">{username || 'Pengguna'}</h4>
              <span className="text-[9px] text-nature-gold font-extrabold uppercase tracking-widest block leading-none mt-0.5">{userRole}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-500/10 hover:text-rose-400 text-slate-400 rounded-xl transition-colors cursor-pointer shrink-0"
              title="Keluar dari Sistem"
              id="logout-btn-desktop"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Footer info and database status (Hidden on Portal Orang Tua & for Parent Role) */}
        <div className="relative z-10 p-4 border-t border-nature-forest-medium text-[10px] text-slate-400 space-y-2">
          {activeMenu !== 'portal-orangtua' && userRole !== 'ORANG_TUA' && (
            <button
              onClick={() => setShowBackupModal(true)}
              className="w-full flex justify-between items-center bg-[#26362C] hover:bg-[#2f4236] p-2 rounded border border-nature-forest-medium text-left cursor-pointer transition-colors"
              title="Buka Status & Cadangan Data"
            >
              <span className="font-mono flex items-center gap-1 text-slate-300">
                <Database className="w-3 h-3 text-nature-gold" /> STATUS & CADANGAN
              </span>
              <span className="text-nature-sage font-extrabold animate-pulse">● AKTIF</span>
            </button>
          )}
          <p className="text-center opacity-60">IT CENTER DARUL ARIFIN @SATDAF 2026</p>
        </div>
      </aside>

      {/* 2. Mobile Responsive Topbar and Hamburger drawer */}
      <header className="md:hidden bg-nature-forest text-white px-4 py-3.5 border-b border-nature-forest-medium flex justify-between items-center select-none z-30" id="mobile-topbar">
        <div className="flex items-center gap-3">
          <motion.div 
            className="relative w-8 h-8 flex items-center justify-center shrink-0"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
          >
            <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="absolute inset-0 text-nature-gold/30">
              <path d="M50,5 L63,35 L95,37 L70,60 L78,92 L50,75 L22,92 L30,60 L5,37 L37,35 Z" />
            </svg>
            <BookOpen className="w-3.5 h-3.5 text-nature-gold relative z-10" />
          </motion.div>
          <div>
            <span className="text-[12px] font-black text-nature-gold uppercase tracking-[0.15em] block leading-none">SATDAF</span>
            <h2 className="font-serif italic text-[11px] font-bold text-white tracking-wide leading-tight mt-0.5">DARUL ARIFIN</h2>
            <span className="text-[7px] text-nature-sage font-bold uppercase tracking-[0.05em] block leading-none mt-0.5">SISTEM ADMINISTRASI TERPADU</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeMenu !== 'portal-orangtua' && userRole !== 'ORANG_TUA' && (
            <button
              onClick={() => setShowBackupModal(true)}
              className="p-1.5 bg-emerald-800/40 hover:bg-emerald-800/60 text-emerald-300 border border-emerald-700/50 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              title="Status & Cadangan Data"
            >
              <Database className="w-3.5 h-3.5 text-nature-gold" />
              <span className="hidden sm:inline">Data</span>
            </button>
          )}
          <button
            onClick={() => setShowBookmarkModal(true)}
            className="p-1.5 bg-nature-gold/15 hover:bg-nature-gold/25 text-nature-gold border border-nature-gold/30 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
            title="Ikon HP / Bookmark"
            id="mobile-topbar-bookmark-btn"
          >
            <Smartphone className="w-3.5 h-3.5 text-nature-gold" />
            <span className="hidden sm:inline">Ikon HP</span>
          </button>
          <span className="text-[10px] font-extrabold text-nature-gold bg-nature-forest-medium px-2.5 py-1 rounded-full border border-nature-gold/20">
            {userRole}
          </span>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-nature-forest-medium rounded-xl text-slate-200 transition-colors cursor-pointer"
            id="mobile-hamburger-btn"
            aria-label="Buka Menu Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-nature-gold" /> : <Menu className="w-5 h-5 text-white" />}
          </button>
        </div>
      </header>

      {/* Quick Mobile Horizontal Scroll Navigation Pill Bar */}
      <div className="md:hidden bg-nature-forest/95 backdrop-blur-md px-3 py-2 border-b border-nature-forest-medium/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar select-none z-20">
        {filteredMenuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeMenu === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                setQuickAddSantriTrigger(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-nature-gold text-nature-forest-dark font-extrabold shadow-sm'
                  : 'text-slate-300 hover:text-white bg-nature-forest-medium/40 hover:bg-nature-forest-medium'
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? 'text-nature-forest-dark' : 'text-nature-sage'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile Drawer Menu Overlays & Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs z-40 md:hidden"
            />

            {/* Mobile Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed inset-y-0 left-0 w-72 bg-emerald-950 text-white p-6 flex flex-col justify-between z-50 md:hidden shadow-2xl border-r border-emerald-800/80 overflow-y-auto"
              id="mobile-drawer"
            >
            {/* Background Batik Jawa Ornament for Sidebar */}
            <BatikJawaSidebar type={batikJawaType} opacity={batikJawaOpacity} />

            <div className="space-y-6 relative z-10">
              <div className="flex justify-between items-center pb-4 border-b border-emerald-800/80">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="relative w-8 h-8 flex items-center justify-center shrink-0"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                  >
                    <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="4" className="absolute inset-0 text-nature-gold/30">
                      <path d="M50,5 L63,35 L95,37 L70,60 L78,92 L50,75 L22,92 L30,60 L5,37 L37,35 Z" />
                    </svg>
                    <BookOpen className="w-3.5 h-3.5 text-nature-gold relative z-10" />
                  </motion.div>
                  <div>
                    <span className="text-[12px] font-black text-nature-gold uppercase tracking-[0.15em] block leading-none">SATDAF</span>
                    <h3 className="font-serif italic text-[11px] font-bold text-white tracking-wide leading-tight mt-0.5">DARUL ARIFIN</h3>
                    <span className="text-[7px] text-emerald-200 font-bold uppercase tracking-[0.05em] block leading-none mt-0.5">SISTEM ADMINISTRASI TERPADU</span>
                  </div>
                </div>
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 hover:bg-emerald-800/60 rounded-full text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>



              {/* Navigation Items list */}
              <nav className="space-y-1.5">
                {filteredMenuItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setIsMobileMenuOpen(false);
                        setQuickAddSantriTrigger(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-white text-emerald-950 font-black shadow-lg border-r-4 border-nature-gold' 
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-800' : 'text-emerald-200'}`} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
            
            {/* Mobile User Card & Logout segment */}
            <div className="relative z-10 p-3.5 bg-[#26362C] border border-nature-forest-medium/50 rounded-xl space-y-2.5 mt-4" id="mobile-user-card">
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-nature-gold/15 text-nature-gold flex items-center justify-center border border-nature-gold/30 shrink-0 font-extrabold text-[11px]">
                    {userRole?.substring(0, 2)}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-[11px] font-bold text-slate-100 truncate uppercase leading-none">{username || 'Pengguna'}</h4>
                    <span className="text-[8px] text-nature-gold font-extrabold uppercase tracking-widest block leading-none mt-1">{userRole}</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-[9px] rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                  id="logout-btn-mobile"
                >
                  <LogOut className="w-3.5 h-3.5" /> Keluar
                </button>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-nature-forest-medium text-center text-[10px] text-slate-400 font-medium">
              IT CENTER DARUL ARIFIN @SATDAF 2026
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {/* 3. Main content area viewport */}
      <main className="flex-1 flex flex-col p-3.5 sm:p-5 md:p-8 pb-24 md:pb-8 overflow-y-auto max-h-screen relative" id="main-scroll-viewport">
        
        {/* Real-time Toast Notifications */}
        <AnimatePresence>
          {toastNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 right-4 left-4 md:left-auto md:w-96 bg-slate-900/95 text-slate-100 border border-slate-800 px-4 py-3.5 rounded-xl shadow-2xl flex items-start gap-3 backdrop-blur-xs z-50 pointer-events-auto"
              id="real-time-notification-toast"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 scale-95 mt-0.5">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div className="space-y-0.5 flex-1">
                <div className="text-[10px] text-pesantren-gold-500 font-extrabold uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Notifikasi Sistem
                </div>
                <p className="text-xs text-slate-300 leading-snug">{toastNotification}</p>
              </div>
              <button 
                onClick={() => setToastNotification(null)}
                className="text-slate-500 hover:text-slate-300 transition-colors self-start scale-90"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quota Limit Notice & Cloud Console Link Banner */}
        {isQuotaExceeded && !dismissQuotaBanner && (
          <div className="mb-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 px-4 py-3 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md" id="quota-exceeded-banner">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-amber-300 text-xs">Pemberitahuan Kuota Firestore (Free Tier Spark)</p>
                <p className="text-amber-200/80 text-[11px] leading-tight mt-0.5">
                  Batas kuota pembacaan harian (Free Tier) tercapai. Sistem beroperasi stabil dalam mode aman / cache lokal tanpa gangguan. Kuota direset otomatis setiap 24 jam.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 flex-wrap">
              <button
                onClick={() => setShowBackupModal(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-[11px] cursor-pointer"
              >
                <Database className="w-3 h-3" />
                Cadangkan Data (JSON)
              </button>
              <a
                href="https://console.firebase.google.com/project/dulcet-day-2s7sz/firestore/databases/ai-studio-satdafsistemadmi-0afc1d6c-be3f-4056-a560-9b01eb2d1255/data?openUpgradeDialog=true"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition-colors inline-flex items-center gap-1 text-[11px]"
              >
                Konsol Firebase
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                onClick={() => setDismissQuotaBanner(true)}
                className="p-1 text-amber-300/60 hover:text-amber-200 rounded-lg hover:bg-amber-500/20 transition-colors"
                title="Tutup pemberitahuan"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Universal Islamic Header: Kalender Hijriyah & Masehi + Jadwal Waktu Sholat Kemenag & GPS */}
        <IslamicHeaderBar
          currentMenuTitle={menuItems.find(m => m.id === activeMenu)?.label || 'Menu Utama'}
          currentMenuSubtitle="Pondok Pesantren Darul Arifin Jambi"
        />

        {/* Render Active Component based on route */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMenu + (quickAddSantriTrigger ? '-add' : '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-7xl mx-auto flex-1"
          >
            {activeMenu === 'dashboard' && (
                <Dashboard 
                  santri={santri}
                  guru={guru}
                  kamar={kamar}
                  logs={logs}
                  keuangan={keuangan}
                  pelanggaran={pelanggaran}
                  onNavigate={(menu) => setActiveMenu(menu)}
                  onAddSantriQuick={() => {
                    setActiveMenu('santri');
                    setQuickAddSantriTrigger(true);
                  }}
                />
              )}

              {activeMenu === 'tahfidz-gamifikasi' && (
                <TahfidzGamifikasi 
                  santriList={santri}
                  guruList={guru}
                  tahfidzSetoranList={tahfidzSetoranList}
                  onSaveSetoran={handleSaveTahfidzSetoran}
                  onDeleteSetoran={handleDeleteTahfidzSetoran}
                  onClearAllSetoran={handleClearAllTahfidzSetoran}
                  userRole={(userRole as any) || 'ADMIN'}
                  currentUsername={username || 'Musyrif'}
                />
              )}

              {activeMenu === 'role-pengguna' && (
                <RolePengguna 
                  penggunaList={activeUserList}
                  onSavePengguna={handleSavePengguna}
                  onDeletePengguna={handleDeletePengguna}
                  currentUsername={username || 'admin'}
                  kamarList={kamar}
                />
              )}

              {activeMenu === 'litbang-sdm' && (
                <LitbangSDM 
                  karyawanList={karyawanList}
                  guruList={guru}
                  penilaianList={penilaianList}
                  programLitbangList={programLitbangList}
                  onSaveKaryawan={handleSaveKaryawan}
                  onDeleteKaryawan={handleDeleteKaryawan}
                  onSavePenilaian={handleSavePenilaian}
                  onDeletePenilaian={handleDeletePenilaian}
                  onSaveProgramLitbang={handleSaveProgramLitbang}
                  onDeleteProgramLitbang={handleDeleteProgramLitbang}
                  onSyncSDM={handleSyncGuruAndSDM}
                  userRole={(userRole as any) || 'ADMIN'}
                  username={username || 'Ustadz Litbang'}
                />
              )}

              {activeMenu === 'portal-orangtua' && (
                <PortalOrangTua 
                  santri={santri}
                  kamar={kamar}
                  mutabaahTargets={mutabaahTargets}
                  mutabaahRecords={mutabaahRecords}
                  pelanggaran={pelanggaran}
                  onUpdateSantri={handleUpdateSantri}
                />
              )}

              {activeMenu === 'klinik' && (
                <KlinikKesehatan 
                  santri={santri}
                  kamar={kamar}
                  guru={guru}
                  kunjunganList={kunjunganList}
                  stokObatList={stokObatList}
                  rekamMedisList={rekamMedisList}
                  absensiPetugasList={absensiPetugasList}
                  onSaveKunjungan={handleSaveKunjungan}
                  onDeleteKunjungan={handleDeleteKunjungan}
                  onSaveStokObat={handleSaveStokObat}
                  onDeleteStokObat={handleDeleteStokObat}
                  onSaveRekamMedis={handleSaveRekamMedis}
                  onSaveAbsensiPetugas={handleSaveAbsensiPetugas}
                  onDeleteAbsensiPetugas={handleDeleteAbsensiPetugas}
                  userRole={(userRole as any) || 'ADMIN'}
                  username={username || 'Pengguna'}
                />
              )}

              {activeMenu === 'mutabaah' && (
                <MutabaahSantri 
                  santri={santri}
                  kamar={kamar}
                  guru={guru}
                  penggunaList={activeUserList}
                  mutabaahTargets={mutabaahTargets}
                  mutabaahRecords={mutabaahRecords}
                  onSaveTarget={handleSaveMutabaahTarget}
                  onDeleteTarget={handleDeleteMutabaahTarget}
                  onResetTargets={handleResetMutabaahTargets}
                  onSaveRecord={handleSaveMutabaahRecord}
                  onBatchSaveRecords={handleBatchSaveMutabaahRecords}
                  onDeleteRecord={handleDeleteMutabaahRecord}
                  onClearAllMutabaahRecords={handleClearAllMutabaahRecords}
                  onUpdateKamarAttendance={handleUpdateKamarAttendance}
                  userRole={(userRole as any) || 'ADMIN'}
                  username={username || 'Musyrif'}
                />
              )}

              {activeMenu === 'santri' && (
                <DataSantri 
                  santri={santri}
                  kamar={kamar}
                  onAddSantri={handleAddSantri}
                  onUpdateSantri={handleUpdateSantri}
                  onDeleteSantri={handleDeleteSantri}
                  triggerQuickAddOpen={quickAddSantriTrigger}
                  setTriggerQuickAddOpen={setQuickAddSantriTrigger}
                />
              )}

              {activeMenu === 'pelanggaran' && (
                <DataPelanggaran 
                  pelanggaran={pelanggaran}
                  santri={santri}
                  guru={guru}
                  onAddPelanggaran={handleAddPelanggaran}
                  onUpdatePelanggaran={handleUpdatePelanggaran}
                  onDeletePelanggaran={handleDeletePelanggaran}
                />
              )}

              {activeMenu === 'guru' && (
                <DataPengasuhGuru 
                  guru={guru}
                  karyawanList={karyawanList}
                  onAddGuru={handleAddGuru}
                  onUpdateGuru={handleUpdateGuru}
                  onDeleteGuru={handleDeleteGuru}
                  onSyncSDM={handleSyncGuruAndSDM}
                />
              )}

              {activeMenu === 'kamar' && (
                <DataKamar 
                  kamar={kamar}
                  santri={santri}
                  guru={guru}
                  onAddKamar={handleAddKamar}
                  onUpdateKamar={handleUpdateKamar}
                  onDeleteKamar={handleDeleteKamar}
                  onUpdateKamarAttendance={handleUpdateKamarAttendance}
                />
              )}

              {activeMenu === 'monitoring' && (
                <RealTimeMonitoring 
                  logs={logs}
                  santri={santri}
                  guru={guru}
                  kamar={kamar}
                  onTriggerSimulatedLog={handleTriggerSimulatedLog}
                  onClearLogs={handleClearLogs}
                />
              )}

              {activeMenu === 'laporan' && (
                <LaporanBulanan 
                  santri={santri}
                  kamar={kamar}
                  pelanggaran={pelanggaran}
                />
              )}

              {activeMenu === 'prestasi' && (
                <PrestasiPenghargaan
                  prestasi={prestasi}
                  santri={santri}
                  guru={guru}
                  onAddPrestasi={handleAddPrestasi}
                  onUpdatePrestasi={handleUpdatePrestasi}
                  onDeletePrestasi={handleDeletePrestasi}
                />
              )}

              {activeMenu === 'monitoring-pimpinan' && (
                <MonitoringPimpinan />
              )}
          </motion.div>
        </AnimatePresence>

        {/* Global Floating AI Assistant Button & Modal across all menus */}
        <AIAssistantModal 
          santri={santri}
          kamar={kamar}
          mutabaahRecords={mutabaahRecords}
          pelanggaran={pelanggaran}
          prestasi={prestasi}
          guru={guru}
          keuangan={keuangan}
          userRole={userRole || undefined}
          username={username || undefined}
        />

        {/* Modal Panduan Bookmark & Ikon HP */}
        <BookmarkGuideModal 
          isOpen={showBookmarkModal}
          onClose={() => setShowBookmarkModal(false)}
        />

      </main>

      {/* 4. Mobile Fixed Bottom Navigation Bar for Android & Smartphone Ergonomics */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1A261E] border-t border-nature-forest-medium/80 z-30 px-1 py-1.5 flex items-center justify-around shadow-2xl backdrop-blur-md text-white select-none" id="mobile-bottom-nav">
        <button
          onClick={() => { setActiveMenu('dashboard'); setQuickAddSantriTrigger(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'dashboard' ? 'text-nature-gold font-black scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight">Beranda</span>
        </button>

        <button
          onClick={() => { setActiveMenu('tahfidz-gamifikasi'); setQuickAddSantriTrigger(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'tahfidz-gamifikasi' ? 'text-nature-gold font-black scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <BookOpen className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight">Tahfidz</span>
        </button>

        <button
          onClick={() => { setActiveMenu('santri'); setQuickAddSantriTrigger(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'santri' ? 'text-nature-gold font-black scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <GraduationCap className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight">Santri</span>
        </button>

        <button
          onClick={() => { setActiveMenu('mutabaah'); setQuickAddSantriTrigger(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'mutabaah' ? 'text-nature-gold font-black scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <CheckCircle2 className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight">Mutaba'ah</span>
        </button>

        <button
          onClick={() => { setActiveMenu('klinik'); setQuickAddSantriTrigger(false); }}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
            activeMenu === 'klinik' ? 'text-nature-gold font-black scale-105' : 'text-slate-300 hover:text-white'
          }`}
        >
          <Stethoscope className="w-5 h-5 mb-0.5" />
          <span className="text-[9px] font-bold tracking-tight">Klinik</span>
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5 mb-0.5 text-nature-gold" />
          <span className="text-[9px] font-bold tracking-tight">Semua</span>
        </button>
      </nav>

      {/* Data Backup & Cloud Status Modal (Admin Only - Restricted from Parent Portal) */}
      <DataBackupModal
        isOpen={showBackupModal && activeMenu !== 'portal-orangtua' && userRole !== 'ORANG_TUA'}
        onClose={() => setShowBackupModal(false)}
        onRestoreData={handleRestoreData}
        currentStats={{
          santri: santri.length,
          guru: guru.length,
          kamar: kamar.length,
          pelanggaran: pelanggaran.length,
          keuangan: keuangan.length,
          mutabaah: mutabaahRecords.length,
          klinik: kunjunganList.length,
          sdm: karyawanList.length,
          tahfidz: tahfidzSetoranList.length
        }}
      />

    </div>
  );
}
