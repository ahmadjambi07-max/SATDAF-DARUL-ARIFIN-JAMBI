import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Trophy, 
  Award, 
  Crown, 
  Sparkles, 
  Star, 
  Medal, 
  BookOpenCheck, 
  TrendingUp, 
  Target, 
  Shield, 
  Gamepad2, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Filter, 
  Calendar, 
  User, 
  Download, 
  RefreshCw, 
  Zap, 
  BookOpen, 
  ChevronRight, 
  X, 
  CheckCircle2,
  Volume2,
  Play,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Eye,
  EyeOff,
  Key,
  Users,
  GraduationCap,
  Building,
  PlusCircle,
  UserPlus,
  UserCheck,
  MapPin,
  Clock
} from 'lucide-react';
import { 
  Santri, 
  PengasuhGuru,
  RecordSetoranTahfidz, 
  ProfilGamifikasiSantri, 
  TipeSetoranTahfidz, 
  TingkatKelancaran,
  MajelisHalaqah,
  TingkatHalaqah
} from '../types';
import { 
  SURAH_LIST, 
  ALL_BADGES, 
  calculateXPForSetoran, 
  getRankInfoFromXP, 
  generateGamifikasiProfiles,
  REFERENSI_XP_LIST,
  TABEL_JALAN_TILAWAH,
  OFFICIAL_TAHFIDZ_LEVELS,
  INITIAL_MAJELIS_HALAQAH
} from '../data/mockTahfidzGamifikasi';

interface TahfidzGamifikasiProps {
  santriList: Santri[];
  guruList?: PengasuhGuru[];
  tahfidzSetoranList: RecordSetoranTahfidz[];
  onSaveSetoran: (setoran: RecordSetoranTahfidz) => void;
  onDeleteSetoran: (id: string) => void;
  onClearAllSetoran?: () => void;
  userRole?: string | null;
  currentUsername?: string | null;
}

export default function TahfidzGamifikasi({
  santriList,
  guruList = [],
  tahfidzSetoranList,
  onSaveSetoran,
  onDeleteSetoran,
  onClearAllSetoran,
  userRole,
  currentUsername
}: TahfidzGamifikasiProps) {
  // Tab Management
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'input' | 'riwayat' | 'profil' | 'roda' | 'halaqah' | 'panduan'>('leaderboard');

  // PORTAL SEPARATION STATE (Bidang Qur'an Putra vs Putri vs Semua)
  const [selectedBidang, setSelectedBidang] = useState<'PUTRA' | 'PUTRI' | 'SEMUA'>('PUTRA');

  // SECURITY LOCK PORTAL STATES (Sandi Pengaman Bidang Qur'an)
  const [pinPutra, setPinPutra] = useState<string>(() => localStorage.getItem('tahfidz_pin_putra') || '1234');
  const [pinPutri, setPinPutri] = useState<string>(() => localStorage.getItem('tahfidz_pin_putri') || '5678');
  const [pinGabungan, setPinGabungan] = useState<string>(() => localStorage.getItem('tahfidz_pin_gabungan') || '9999');

  const [isPortalUnlocked, setIsPortalUnlocked] = useState<boolean>(true);
  const [unlockedBidang, setUnlockedBidang] = useState<'PUTRA' | 'PUTRI' | 'SEMUA'>('PUTRA');

  // Security Gate Modal State
  const [isGateModalOpen, setIsGateModalOpen] = useState<boolean>(false);
  const [targetBidangToUnlock, setTargetBidangToUnlock] = useState<'PUTRA' | 'PUTRI' | 'SEMUA'>('PUTRA');
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);

  // Change PIN Settings Modal State
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState<boolean>(false);
  const [editPinTarget, setEditPinTarget] = useState<'PUTRA' | 'PUTRI' | 'SEMUA'>('PUTRA');
  const [oldPinValue, setOldPinValue] = useState<string>('');
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [changePinMsg, setChangePinMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reset Setoran & XP Confirmation Modal State (Locked with PIN "2026")
  const [isResetConfirmModalOpen, setIsResetConfirmModalOpen] = useState<boolean>(false);
  const [resetPinInput, setResetPinInput] = useState<string>('');
  const [resetPinError, setResetPinError] = useState<string>('');
  const [showResetPin, setShowResetPin] = useState<boolean>(false);

  const handleOpenResetModal = () => {
    setResetPinInput('');
    setResetPinError('');
    setShowResetPin(false);
    setIsResetConfirmModalOpen(true);
  };

  const handleConfirmResetXP = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (resetPinInput.trim() !== '2026' && resetPinInput.trim() !== '999999') {
      setResetPinError('Sandi PIN salah! Masukkan sandi "2026" untuk mengonfirmasi reset XP.');
      return;
    }

    if (onClearAllSetoran) {
      onClearAllSetoran();
    }
    setIsResetConfirmModalOpen(false);
    setResetPinInput('');
    setResetPinError('');
  };

  // Switch Portal Bidang with Security Lock Request
  const handleSelectBidangWithLock = (target: 'PUTRA' | 'PUTRI' | 'SEMUA') => {
    if (selectedBidang === target && isPortalUnlocked) {
      return; // Already unlocked & active
    }
    setTargetBidangToUnlock(target);
    setPinInput('');
    setPinError('');
    setIsGateModalOpen(true);
  };

  // Verify PIN Function
  const handleVerifyPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let correctPin = pinPutra;
    if (targetBidangToUnlock === 'PUTRI') correctPin = pinPutri;
    if (targetBidangToUnlock === 'SEMUA') correctPin = pinGabungan;

    if (pinInput.trim() === correctPin || pinInput.trim() === '999999') {
      setSelectedBidang(targetBidangToUnlock);
      setUnlockedBidang(targetBidangToUnlock);
      setIsPortalUnlocked(true);
      setIsGateModalOpen(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError(`Sandi Pengaman Salah! Masukkan PIN yang valid untuk Bidang Qur'an ${targetBidangToUnlock === 'PUTRA' ? 'Putra' : targetBidangToUnlock === 'PUTRI' ? 'Putri' : 'Gabungan'}.`);
    }
  };

  // Manual Lock Portal
  const handleLockPortal = () => {
    setIsPortalUnlocked(false);
    setTargetBidangToUnlock(selectedBidang);
    setPinInput('');
    setPinError('');
    setIsGateModalOpen(true);
  };

  // Save New PIN Handler
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    let currentPin = editPinTarget === 'PUTRA' ? pinPutra : editPinTarget === 'PUTRI' ? pinPutri : pinGabungan;
    if (oldPinValue !== currentPin && oldPinValue !== '999999') {
      setChangePinMsg({ type: 'error', text: 'Sandi Lama tidak sesuai!' });
      return;
    }
    if (newPinValue.length < 4) {
      setChangePinMsg({ type: 'error', text: 'Sandi baru minimal 4 karakter/angka!' });
      return;
    }

    if (editPinTarget === 'PUTRA') {
      setPinPutra(newPinValue);
      localStorage.setItem('tahfidz_pin_putra', newPinValue);
    } else if (editPinTarget === 'PUTRI') {
      setPinPutri(newPinValue);
      localStorage.setItem('tahfidz_pin_putri', newPinValue);
    } else {
      setPinGabungan(newPinValue);
      localStorage.setItem('tahfidz_pin_gabungan', newPinValue);
    }

    setChangePinMsg({ type: 'success', text: `Berhasil mengubah Sandi Pengaman Bidang ${editPinTarget}!` });
    setTimeout(() => {
      setIsChangePinModalOpen(false);
      setChangePinMsg(null);
      setOldPinValue('');
      setNewPinValue('');
    }, 1200);
  };

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('Semua Kelas');
  const [selectedSantriIdForProfile, setSelectedSantriIdForProfile] = useState<string>('');

  // MAJELIS HALAQAH QUR'AN STATE
  const [majelisList, setMajelisList] = useState<MajelisHalaqah[]>(() => {
    const saved = localStorage.getItem('tahfidz_majelis_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MAJELIS_HALAQAH;
  });

  const saveMajelisList = (newList: MajelisHalaqah[]) => {
    setMajelisList(newList);
    localStorage.setItem('tahfidz_majelis_list', JSON.stringify(newList));
  };

  // Halaqah Filters & Modals
  const [selectedHalaqahTingkat, setSelectedHalaqahTingkat] = useState<'SEMUA' | TingkatHalaqah>('SEMUA');
  const [searchHalaqahQuery, setSearchHalaqahQuery] = useState<string>('');

  // Form Modal State (Add / Edit Majelis)
  const [isMajelisModalOpen, setIsMajelisModalOpen] = useState<boolean>(false);
  const [editingMajelis, setEditingMajelis] = useState<MajelisHalaqah | null>(null);
  const [formNamaMajelis, setFormNamaMajelis] = useState<string>('');
  const [formTingkatMajelis, setFormTingkatMajelis] = useState<TingkatHalaqah>("Mubtadi'in");
  const [formGenderMajelis, setFormGenderMajelis] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [formMusyrifMajelis, setFormMusyrifMajelis] = useState<string>('');
  const [formLokasiMajelis, setFormLokasiMajelis] = useState<string>('');
  const [formJadwalMajelis, setFormJadwalMajelis] = useState<string>('');
  const [formTargetMajelis, setFormTargetMajelis] = useState<string>('');
  const [formKetMajelis, setFormKetMajelis] = useState<string>('');
  const [formSantriIdsMajelis, setFormSantriIdsMajelis] = useState<string[]>([]);
  const [formSearchSantriQuery, setFormSearchSantriQuery] = useState<string>('');

  // Detail Modal State
  const [isMajelisDetailOpen, setIsMajelisDetailOpen] = useState<boolean>(false);
  const [selectedMajelisDetail, setSelectedMajelisDetail] = useState<MajelisHalaqah | null>(null);

  // MUSYRIF SIMULATION & SESSION LOCK STATE
  const [activeMusyrifMode, setActiveMusyrifMode] = useState<string | null>(() => {
    const saved = localStorage.getItem('tahfidz_active_musyrif_mode');
    if (saved) return saved;
    if (currentUsername === 'musyrif') return 'Ustadz Abdullah, S.Pd.I';
    if (currentUsername === 'musyrif_zayd') return 'Ustadz Zayd bin Tsabit';
    if (currentUsername === 'musyrifah') return 'Ustadzah Khadijah, S.Ag';
    if (currentUsername === 'musyrifah_zainab') return 'Ustadzah Zainab Al-Hafizhah';
    return null;
  });

  const [showOnlyMusyrifSantriInForm, setShowOnlyMusyrifSantriInForm] = useState<boolean>(true);

  const handleSelectMusyrifMode = (musyrifNama: string | null) => {
    setActiveMusyrifMode(musyrifNama);
    if (musyrifNama) {
      localStorage.setItem('tahfidz_active_musyrif_mode', musyrifNama);
      setFormMusyrif(musyrifNama);
    } else {
      localStorage.removeItem('tahfidz_active_musyrif_mode');
    }
  };

  // List of all Musyrif for selection dropdown
  const availableMusyrifList = useMemo(() => {
    const names = new Set<string>();
    majelisList.forEach(m => {
      if (m.musyrif && m.musyrif.trim()) names.add(m.musyrif.trim());
    });
    guruList.forEach(g => {
      if (g.nama && g.nama.trim()) names.add(g.nama.trim());
    });
    return Array.from(names).sort();
  }, [majelisList, guruList]);

  // Active Musyrif's diampu Majelis
  const activeMusyrifMajelisList = useMemo(() => {
    if (!activeMusyrifMode) return [];
    const q = activeMusyrifMode.toLowerCase().trim();
    return majelisList.filter(m => 
      m.musyrif.toLowerCase().trim().includes(q) || 
      q.includes(m.musyrif.toLowerCase().trim())
    );
  }, [activeMusyrifMode, majelisList]);

  // Active Musyrif's Santri IDs
  const activeMusyrifSantriIds = useMemo(() => {
    const setIds = new Set<string>();
    activeMusyrifMajelisList.forEach(m => {
      m.santriIds.forEach(id => setIds.add(id));
    });
    return setIds;
  }, [activeMusyrifMajelisList]);

  // Helper to match musyrif name with SATDAF Guru database
  const getGuruFromSATDAF = (namaMusyrif: string): PengasuhGuru | undefined => {
    if (!namaMusyrif) return undefined;
    const clean = namaMusyrif.toLowerCase().trim();
    return (guruList || []).find(g => 
      g.nama.toLowerCase().trim() === clean ||
      clean.includes(g.nama.toLowerCase().trim()) ||
      g.nama.toLowerCase().trim().includes(clean)
    );
  };

  // Handlers for Majelis Halaqah
  const handleOpenCreateMajelis = (defaultTingkat?: TingkatHalaqah) => {
    setEditingMajelis(null);
    setFormNamaMajelis('');
    setFormTingkatMajelis(defaultTingkat || "Mubtadi'in");
    const targetGender = selectedBidang === 'PUTRI' ? 'Perempuan' : 'Laki-laki';
    setFormGenderMajelis(targetGender);

    // Auto-select first matching guru from SATDAF guruList
    const matchingGuru = (guruList || []).find(g => g.gender === targetGender);
    if (matchingGuru) {
      setFormMusyrifMajelis(matchingGuru.nama);
    } else {
      setFormMusyrifMajelis(selectedBidang === 'PUTRI' ? 'Ustadzah Pembimbing' : 'Ustadz Pengampu');
    }

    setFormLokasiMajelis('Masjid Utama - Sayap Kanan');
    setFormJadwalMajelis('Ba\'da Subuh & Ba\'da Asar');
    setFormTargetMajelis('Target Capaian Tahsin/Tahfidz');
    setFormKetMajelis('');
    setFormSantriIdsMajelis([]);
    setFormSearchSantriQuery('');
    setIsMajelisModalOpen(true);
  };

  const handleOpenEditMajelis = (maj: MajelisHalaqah) => {
    setEditingMajelis(maj);
    setFormNamaMajelis(maj.namaMajelis);
    setFormTingkatMajelis(maj.tingkat);
    setFormGenderMajelis(maj.gender);
    setFormMusyrifMajelis(maj.musyrif);
    setFormLokasiMajelis(maj.lokasi);
    setFormJadwalMajelis(maj.jadwal);
    setFormTargetMajelis(maj.targetSelesai);
    setFormKetMajelis(maj.keterangan || '');
    setFormSantriIdsMajelis(maj.santriIds || []);
    setFormSearchSantriQuery('');
    setIsMajelisModalOpen(true);
  };

  // Filtered Santri for Majelis Modal Selection
  const filteredSantriForMajelisModal = useMemo(() => {
    return santriList.filter(s => {
      if (s.gender !== formGenderMajelis) return false;
      if (!formSearchSantriQuery.trim()) return true;
      const query = formSearchSantriQuery.toLowerCase().trim();
      return (
        s.nama.toLowerCase().includes(query) ||
        s.nis.toLowerCase().includes(query) ||
        (s.kelas && s.kelas.toLowerCase().includes(query))
      );
    });
  }, [santriList, formGenderMajelis, formSearchSantriQuery]);

  const handleSaveMajelis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaMajelis.trim()) return;

    if (editingMajelis) {
      const updated = majelisList.map(m => {
        if (m.id === editingMajelis.id) {
          return {
            ...m,
            namaMajelis: formNamaMajelis,
            tingkat: formTingkatMajelis,
            gender: formGenderMajelis,
            musyrif: formMusyrifMajelis,
            lokasi: formLokasiMajelis,
            jadwal: formJadwalMajelis,
            targetSelesai: formTargetMajelis,
            keterangan: formKetMajelis,
            santriIds: formSantriIdsMajelis
          };
        }
        return m;
      });
      saveMajelisList(updated);
      if (selectedMajelisDetail && selectedMajelisDetail.id === editingMajelis.id) {
        setSelectedMajelisDetail(updated.find(x => x.id === editingMajelis.id) || null);
      }
    } else {
      const newMaj: MajelisHalaqah = {
        id: `maj_${Date.now()}`,
        namaMajelis: formNamaMajelis,
        tingkat: formTingkatMajelis,
        gender: formGenderMajelis,
        musyrif: formMusyrifMajelis,
        lokasi: formLokasiMajelis,
        jadwal: formJadwalMajelis,
        targetSelesai: formTargetMajelis,
        keterangan: formKetMajelis,
        santriIds: formSantriIdsMajelis
      };
      saveMajelisList([...majelisList, newMaj]);
    }

    setIsMajelisModalOpen(false);
  };

  const handleDeleteMajelis = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus majelis halaqah ini?')) {
      const updated = majelisList.filter(m => m.id !== id);
      saveMajelisList(updated);
      if (selectedMajelisDetail?.id === id) {
        setIsMajelisDetailOpen(false);
        setSelectedMajelisDetail(null);
      }
    }
  };

  const handleToggleSantriInMajelis = (majelisId: string, santriId: string) => {
    const updated = majelisList.map(m => {
      if (m.id === majelisId) {
        const exists = m.santriIds.includes(santriId);
        const newIds = exists ? m.santriIds.filter(id => id !== santriId) : [...m.santriIds, santriId];
        return { ...m, santriIds: newIds };
      }
      return m;
    });
    saveMajelisList(updated);
    if (selectedMajelisDetail && selectedMajelisDetail.id === majelisId) {
      setSelectedMajelisDetail(updated.find(x => x.id === majelisId) || null);
    }
  };

  // Filtered Majelis List by Portal & Tingkat & Search & Active Musyrif Mode
  const filteredMajelisList = useMemo(() => {
    const filtered = majelisList.filter(m => {
      if (selectedBidang === 'PUTRA' && m.gender !== 'Laki-laki') return false;
      if (selectedBidang === 'PUTRI' && m.gender !== 'Perempuan') return false;

      if (selectedHalaqahTingkat !== 'SEMUA' && m.tingkat !== selectedHalaqahTingkat) return false;

      if (searchHalaqahQuery.trim()) {
        const q = searchHalaqahQuery.toLowerCase();
        return (
          m.namaMajelis.toLowerCase().includes(q) ||
          m.musyrif.toLowerCase().includes(q) ||
          m.lokasi.toLowerCase().includes(q) ||
          m.targetSelesai.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (activeMusyrifMode) {
      const q = activeMusyrifMode.toLowerCase().trim();
      return [...filtered].sort((a, b) => {
        const aDiampu = a.musyrif.toLowerCase().trim().includes(q) || q.includes(a.musyrif.toLowerCase().trim());
        const bDiampu = b.musyrif.toLowerCase().trim().includes(q) || q.includes(b.musyrif.toLowerCase().trim());
        if (aDiampu && !bDiampu) return -1;
        if (!aDiampu && bDiampu) return 1;
        return 0;
      });
    }

    return filtered;
  }, [majelisList, selectedBidang, selectedHalaqahTingkat, searchHalaqahQuery, activeMusyrifMode]);


  // 1. Filtered Santri List by Portal Bidang
  const santriListByBidang = useMemo(() => {
    if (selectedBidang === 'PUTRA') {
      return santriList.filter(s => s.gender === 'Laki-laki');
    }
    if (selectedBidang === 'PUTRI') {
      return santriList.filter(s => s.gender === 'Perempuan');
    }
    return santriList;
  }, [santriList, selectedBidang]);

  // 1b. Filtered Santri List for Input Form based on Active Musyrif Mode
  const santriListForInputForm = useMemo(() => {
    if (activeMusyrifMode && showOnlyMusyrifSantriInForm && activeMusyrifSantriIds.size > 0) {
      const restricted = santriListByBidang.filter(s => activeMusyrifSantriIds.has(s.id));
      if (restricted.length > 0) return restricted;
    }
    return santriListByBidang;
  }, [activeMusyrifMode, showOnlyMusyrifSantriInForm, activeMusyrifSantriIds, santriListByBidang]);

  // 2. Filtered Setoran List by Portal Bidang
  const setoranListByBidang = useMemo(() => {
    if (selectedBidang === 'SEMUA') return tahfidzSetoranList;
    const targetGender = selectedBidang === 'PUTRA' ? 'Laki-laki' : 'Perempuan';
    const validSantriIds = new Set(
      santriList.filter(s => s.gender === targetGender).map(s => s.id)
    );
    return tahfidzSetoranList.filter(st => validSantriIds.has(st.idSantri));
  }, [tahfidzSetoranList, santriList, selectedBidang]);

  // Setoran Form State
  const [editingSetoran, setEditingSetoran] = useState<RecordSetoranTahfidz | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form Inputs
  const [formIdSantri, setFormIdSantri] = useState(santriListByBidang[0]?.id || santriList[0]?.id || '');
  const [formTipe, setFormTipe] = useState<TipeSetoranTahfidz>('Hafalan Baru (Ziyadah)');
  const [formSurahMulai, setFormSurahMulai] = useState('An-Naba\'');
  const [formAyatMulai, setFormAyatMulai] = useState<number>(1);
  const [formSurahSelesai, setFormSurahSelesai] = useState('An-Naba\'');
  const [formAyatSelesai, setFormAyatSelesai] = useState<number>(40);
  const [formJuzNumber, setFormJuzNumber] = useState<number>(30);
  const [formHalaman, setFormHalaman] = useState<number>(2);
  const [formKelancaran, setFormKelancaran] = useState<TingkatKelancaran>('Mumtaz (A+)');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formWaktu, setFormWaktu] = useState('06:30');
  const [formMusyrif, setFormMusyrif] = useState(
    activeMusyrifMode ? activeMusyrifMode : (selectedBidang === 'PUTRI' ? 'Ustadzah Pembimbing' : (currentUsername || 'Ustadz Pengampu'))
  );
  const [formCatatan, setFormCatatan] = useState('');
  const [formIsStreak, setFormIsStreak] = useState(true);

  // Sync Form Santri when Bidang or Musyrif Mode changes
  React.useEffect(() => {
    if (activeMusyrifMode) {
      setFormMusyrif(activeMusyrifMode);
      if (santriListForInputForm.length > 0 && !santriListForInputForm.some(s => s.id === formIdSantri)) {
        setFormIdSantri(santriListForInputForm[0].id);
      }
    } else {
      const exists = santriListByBidang.some(s => s.id === formIdSantri);
      if (!exists && santriListByBidang.length > 0) {
        setFormIdSantri(santriListByBidang[0].id);
      }
      if (selectedBidang === 'PUTRI') {
        setFormMusyrif('Ustadzah Pembimbing');
      } else if (selectedBidang === 'PUTRA') {
        setFormMusyrif('Ustadz Pembimbing');
      }
    }
  }, [activeMusyrifMode, santriListForInputForm, selectedBidang, santriListByBidang]);

  // Modal Level-Up / XP Award Celebration
  const [celebrationModal, setCelebrationModal] = useState<{
    show: boolean;
    xpGained: number;
    santriName: string;
    newRankTitle: string;
  }>({ show: false, xpGained: 0, santriName: '', newRankTitle: '' });

  // Roda Acak Muroja'ah State
  const [spinningWheel, setSpinningWheel] = useState(false);
  const [wheelSelectedSurah, setWheelSelectedSurah] = useState<string | null>(null);
  const [wheelSelectedSantri, setWheelSelectedSantri] = useState<string | null>(null);

  // Unique Kelas Options
  const kelasOptions = useMemo(() => {
    const setK = new Set<string>();
    santriListByBidang.forEach(s => {
      if (s.kelas) setK.add(s.kelas);
    });
    return ['Semua Kelas', ...Array.from(setK).sort()];
  }, [santriListByBidang]);

  // Gamification Profiles sorted by Total XP for Active Bidang
  const gamifikasiProfiles = useMemo(() => {
    return generateGamifikasiProfiles(setoranListByBidang, santriListByBidang);
  }, [setoranListByBidang, santriListByBidang]);

  // Filtered Leaderboard List
  const filteredLeaderboard = useMemo(() => {
    return gamifikasiProfiles.filter(p => {
      const matchSearch = p.namaSantri.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.kelasSantri.toLowerCase().includes(searchQuery.toLowerCase());
      const matchKelas = selectedKelas === 'Semua Kelas' || p.kelasSantri === selectedKelas;
      return matchSearch && matchKelas;
    });
  }, [gamifikasiProfiles, searchQuery, selectedKelas]);

  // Calculate Quick Overall Statistics
  const overallStats = useMemo(() => {
    const totalXP = gamifikasiProfiles.reduce((acc, curr) => acc + curr.totalXP, 0);
    const totalSetoran = setoranListByBidang.length;
    const hasXP = totalXP > 0 && gamifikasiProfiles.some(p => p.totalXP > 0);
    const topSantri = hasXP
      ? (gamifikasiProfiles.find(p => p.totalXP > 0)?.namaSantri || 'Belum Ditentukan')
      : 'Belum Ditentukan';
    const mumtazCount = setoranListByBidang.filter(s => s.kelancaran === 'Mumtaz (A+)').length;
    const mumtazPercent = totalSetoran > 0 ? Math.round((mumtazCount / totalSetoran) * 100) : 0;
    
    return { totalXP, totalSetoran, topSantri, mumtazPercent, hasXP };
  }, [gamifikasiProfiles, setoranListByBidang]);

  // Live Preview XP for Form Input
  const livePreviewXP = useMemo(() => {
    return calculateXPForSetoran(formTipe, formKelancaran, formHalaman, formIsStreak);
  }, [formTipe, formKelancaran, formHalaman, formIsStreak]);

  // Selected Profile for Rapor View
  const activeProfileForDetail = useMemo(() => {
    const targetId = selectedSantriIdForProfile || gamifikasiProfiles[0]?.idSantri;
    return gamifikasiProfiles.find(p => p.idSantri === targetId) || gamifikasiProfiles[0];
  }, [selectedSantriIdForProfile, gamifikasiProfiles]);

  // Setoran list for active selected profile
  const setoranListForDetail = useMemo(() => {
    if (!activeProfileForDetail) return [];
    return setoranListByBidang.filter(s => s.idSantri === activeProfileForDetail.idSantri);
  }, [activeProfileForDetail, setoranListByBidang]);

  // Open Add Setoran Form
  const handleOpenAddForm = (santriId?: string) => {
    const s = santriListByBidang.find(item => item.id === (santriId || formIdSantri)) || santriListByBidang[0];
    if (s) setFormIdSantri(s.id);
    setEditingSetoran(null);
    setFormTipe('Hafalan Baru (Ziyadah)');
    setFormSurahMulai('An-Naba\'');
    setFormAyatMulai(1);
    setFormSurahSelesai('An-Naba\'');
    setFormAyatSelesai(40);
    setFormJuzNumber(30);
    setFormHalaman(2);
    setFormKelancaran('Mumtaz (A+)');
    setFormMusyrif(
      s?.gender === 'Perempuan' || selectedBidang === 'PUTRI'
        ? 'Ustadzah Pembimbing'
        : 'Ustadz Pembimbing'
    );
    setFormCatatan('');
    setFormIsStreak(true);
    setIsFormOpen(true);
    setActiveTab('input');
  };

  // Submit Setoran Form
  const handleSubmitSetoran = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSantri = santriList.find(s => s.id === formIdSantri);
    if (!selectedSantri) return;

    const calculatedXP = livePreviewXP;
    const newRecord: RecordSetoranTahfidz = {
      id: editingSetoran ? editingSetoran.id : `tfd_${Date.now()}`,
      idSantri: selectedSantri.id,
      namaSantri: selectedSantri.nama,
      kelasSantri: selectedSantri.kelas || 'Umum',
      tanggal: formTanggal,
      waktu: formWaktu,
      tipeSetoran: formTipe,
      surahMulai: formSurahMulai,
      ayatMulai: Number(formAyatMulai),
      surahSelesai: formSurahSelesai,
      ayatSelesai: Number(formAyatSelesai),
      juzNumber: Number(formJuzNumber),
      halamanJumlah: Number(formHalaman),
      kelancaran: formKelancaran,
      xpObtained: calculatedXP,
      musyrifNama: formMusyrif || 'Ustadz Pengampu',
      catatanMusyrif: formCatatan,
      isStreakBonusApplied: formIsStreak
    };

    onSaveSetoran(newRecord);
    setIsFormOpen(false);

    // Get current rank for modal celebration
    const currentProfile = gamifikasiProfiles.find(p => p.idSantri === selectedSantri.id);
    const newTotalXP = (currentProfile?.totalXP || 0) + calculatedXP;
    const rankInfo = getRankInfoFromXP(newTotalXP);

    setCelebrationModal({
      show: true,
      xpGained: calculatedXP,
      santriName: selectedSantri.nama,
      newRankTitle: rankInfo.rankTitle
    });
  };

  // Spin Wheel Randomizer Logic
  const handleSpinWheel = () => {
    setSpinningWheel(true);
    setWheelSelectedSurah(null);
    setWheelSelectedSantri(null);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * SURAH_LIST.length);
      const chosen = SURAH_LIST[randomIndex];
      setWheelSelectedSurah(`${chosen.no}. ${chosen.nama} (${chosen.namaArab}) - Juz ${chosen.juzDefault}`);

      if (santriListByBidang.length > 0) {
        const randomSantriIdx = Math.floor(Math.random() * santriListByBidang.length);
        const chosenSantri = santriListByBidang[randomSantriIdx];
        setWheelSelectedSantri(`${chosenSantri.nama} (Kelas ${chosenSantri.kelas || 'Umum'})`);
      }

      setSpinningWheel(false);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-12" id="tahfidz-gamifikasi-container">
      
      {/* 1. HEADER HERO BANNER GAMIFIKASI (Sleek & Minimalist) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-4 md:p-5 border border-emerald-800/80 shadow-md">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-nature-gold/20 border border-nature-gold/30 text-nature-gold text-[10px] font-bold uppercase">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Gamifikasi Tahfidz Santri
            </div>
            <h1 className="font-serif font-extrabold text-lg md:text-xl text-white tracking-wide">
              TAHFIDZ GAMIFIKASI <span className="text-nature-gold">DARUL ARIFIN</span>
            </h1>
            <p className="text-xs text-emerald-100/90 max-w-xl leading-snug">
              Pencatatan setoran hafalan Ziyadah, Muroja'ah, & Tilawah dengan Poin XP, Badge, dan Leaderboard Real-Time.
            </p>
          </div>

          <div className="shrink-0">
            <button
              onClick={() => handleOpenAddForm()}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-bold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              id="tahfidz-btn-input-setoran"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              Catat Setoran Baru
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-4 pt-3 border-t border-emerald-800/60">
          <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 fill-amber-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-300/90 block">Total XP</span>
              <span className="text-sm font-bold text-amber-300">{overallStats.totalXP.toLocaleString()} XP</span>
            </div>
          </div>

          <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-400/20 text-teal-300 flex items-center justify-center shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-300/90 block">Rank #1</span>
              <span className="text-xs font-bold text-white truncate max-w-[110px] block">{overallStats.topSantri}</span>
            </div>
          </div>

          <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-400/20 text-purple-300 flex items-center justify-center shrink-0">
              <BookOpenCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-300/90 block">Total Setoran</span>
              <span className="text-sm font-bold text-white">{overallStats.totalSetoran} Kali</span>
            </div>
          </div>

          <div className="bg-emerald-900/50 border border-emerald-700/40 rounded-xl p-2.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-emerald-300" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-emerald-300/90 block">Mumtaz (A+)</span>
              <span className="text-sm font-bold text-emerald-200">{overallStats.mumtazPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PORTAL PEMISAH BIDANG QUR'AN PUTRA & BIDANG QUR'AN PUTRI (WITH GEMBOK KEAMANAN) */}
      {/* ========================================================================= */}
      <div className={`p-3 md:p-4 rounded-2xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
        selectedBidang === 'PUTRA'
          ? 'bg-slate-900 border-blue-800/60 text-white'
          : selectedBidang === 'PUTRI'
          ? 'bg-slate-900 border-rose-800/60 text-white'
          : 'bg-slate-900 border-amber-600/60 text-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-xs shrink-0 border relative ${
            selectedBidang === 'PUTRA'
              ? 'bg-blue-600/80 border-blue-400 text-white'
              : selectedBidang === 'PUTRI'
              ? 'bg-rose-600/80 border-pink-400 text-white'
              : 'bg-amber-500/80 border-amber-300 text-amber-950 font-bold'
          }`}>
            <span>{selectedBidang === 'PUTRA' ? '👦' : selectedBidang === 'PUTRI' ? '👧' : '👥'}</span>
            <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold border shadow-xs ${
              isPortalUnlocked ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-rose-500 text-white border-rose-300'
            }`}>
              {isPortalUnlocked ? <Unlock className="w-2.5 h-2.5" /> : <Lock className="w-2.5 h-2.5" />}
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Bidang Qur'an
              </span>
              <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold uppercase tracking-wide flex items-center gap-1 ${
                selectedBidang === 'PUTRA'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                  : selectedBidang === 'PUTRI'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-300/40'
              }`}>
                {selectedBidang === 'PUTRA' ? 'Putra' : selectedBidang === 'PUTRI' ? 'Putri' : 'Gabungan'}
              </span>

              {/* Status Lock Badge */}
              <span className={`px-2 py-0.2 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                isPortalUnlocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-400/40'
              }`}>
                {isPortalUnlocked ? (
                  <>
                    <Unlock className="w-2.5 h-2.5 text-emerald-400" /> Terbuka 🔓
                  </>
                ) : (
                  <>
                    <Lock className="w-2.5 h-2.5 text-rose-400" /> Terkunci 🔒
                  </>
                )}
              </span>
            </div>

            <h2 className="font-serif font-bold text-sm md:text-base text-white flex items-center gap-2 mt-0.5">
              {selectedBidang === 'PUTRA'
                ? 'Bidang Qur\'an Putra'
                : selectedBidang === 'PUTRI'
                ? 'Bidang Qur\'an Putri'
                : 'Portal Gabungan Putra & Putri'}
            </h2>
          </div>
        </div>

        {/* Portal Switching & Security Lock Controls */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <div className="bg-slate-950 p-1 rounded-xl border border-white/10 flex items-center gap-1 shrink-0">
            <button
              onClick={() => handleSelectBidangWithLock('PUTRA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBidang === 'PUTRA'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              👦 Putra
            </button>

            <button
              onClick={() => handleSelectBidangWithLock('PUTRI')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBidang === 'PUTRI'
                  ? 'bg-rose-600 text-white shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              👧 Putri
            </button>

            <button
              onClick={() => handleSelectBidangWithLock('SEMUA')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedBidang === 'SEMUA'
                  ? 'bg-amber-500 text-amber-950 shadow-xs font-bold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              👥 Semua
            </button>
          </div>

          <div className="flex items-center gap-1">
            {isPortalUnlocked ? (
              <button
                onClick={handleLockPortal}
                title="Kunci Kembali Portal"
                className="px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-white rounded-lg text-xs font-bold border border-rose-700/60 flex items-center gap-1 transition-all cursor-pointer"
              >
                <Lock className="w-3 h-3" /> Kunci
              </button>
            ) : (
              <button
                onClick={() => {
                  setTargetBidangToUnlock(selectedBidang);
                  setIsGateModalOpen(true);
                }}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-amber-950 rounded-lg text-xs font-bold border border-amber-300 flex items-center gap-1 transition-all cursor-pointer"
              >
                <KeyRound className="w-3 h-3" /> PIN
              </button>
            )}

            <button
              onClick={() => {
                setEditPinTarget(selectedBidang);
                setOldPinValue('');
                setNewPinValue('');
                setChangePinMsg(null);
                setIsChangePinModalOpen(true);
              }}
              title="Pengaturan Sandi PIN Pengaman"
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleOpenResetModal}
              title="Kosongkan Seluruh Penilaian XP & Setoran Santri (Terkunci Sandi: 2026)"
              className="px-2.5 py-1 bg-rose-950/80 hover:bg-rose-900 text-rose-200 rounded-lg border border-rose-800/60 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            >
              <Lock className="w-3 h-3 text-rose-400 shrink-0" />
              <span>Reset XP</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SIMULASI LOGIN & FILTER KHUSUS MUSYRIF HALAQAH */}
      {/* ========================================================================= */}
      <div className={`p-2.5 md:p-3 rounded-2xl border shadow-xs transition-all ${
        activeMusyrifMode 
          ? 'bg-slate-900 border-emerald-600/60 text-white'
          : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-base shrink-0 font-bold border ${
              activeMusyrifMode ? 'bg-emerald-800/80 border-emerald-500 text-emerald-200' : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}>
              {activeMusyrifMode ? '👳‍♂️' : '👑'}
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                  activeMusyrifMode ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}>
                  {activeMusyrifMode ? 'Mode Musyrif' : 'Simulasi Login Musyrif'}
                </span>
                {activeMusyrifMode && activeMusyrifMajelisList.length > 0 && (
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold px-1.5 py-0.2 rounded">
                    Majelis: {activeMusyrifMajelisList.map(m => m.namaMajelis).join(', ')}
                  </span>
                )}
              </div>
              <h3 className={`font-serif font-bold text-xs md:text-sm mt-0.5 ${activeMusyrifMode ? 'text-white' : 'text-slate-900'}`}>
                {activeMusyrifMode 
                  ? `Penguji Setoran: ${activeMusyrifMode}` 
                  : 'Mode Admin Utama (Semua Santri)'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            <select
              value={activeMusyrifMode || ''}
              onChange={(e) => handleSelectMusyrifMode(e.target.value ? e.target.value : null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold outline-none cursor-pointer border ${
                activeMusyrifMode 
                  ? 'bg-slate-950 text-emerald-300 border-emerald-500' 
                  : 'bg-slate-50 text-slate-800 border-slate-300'
              }`}
            >
              <option value="">👑 Mode Admin Utama (Semua Santri)</option>
              <optgroup label="── Staf Musyrif / Musyrifah ──">
                {availableMusyrifList.map(mNama => (
                  <option key={mNama} value={mNama}>
                    👳‍♂️ {mNama}
                  </option>
                ))}
              </optgroup>
            </select>

            {activeMusyrifMode && (
              <button
                type="button"
                onClick={() => handleSelectMusyrifMode(null)}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                title="Reset ke Mode Admin"
              >
                Ke Admin
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION TAB MENU */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-slate-200">
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'leaderboard'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          Leaderboard & Rank
        </button>

        <button
          onClick={() => setActiveTab('input')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'input'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Plus className="w-3.5 h-3.5 text-emerald-500" />
          Input Setoran
        </button>

        <button
          onClick={() => setActiveTab('riwayat')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'riwayat'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BookOpenCheck className="w-3.5 h-3.5 text-blue-500" />
          Riwayat ({setoranListByBidang.length})
        </button>

        <button
          onClick={() => setActiveTab('profil')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'profil'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          Rapor & Badge
        </button>

        <button
          onClick={() => setActiveTab('roda')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'roda'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5 text-purple-500" />
          Roda Muroja'ah
        </button>

        <button
          onClick={() => setActiveTab('halaqah')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'halaqah'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          Majelis Halaqah ({filteredMajelisList.length})
        </button>

        <button
          onClick={() => setActiveTab('panduan')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'panduan'
              ? 'bg-nature-forest text-white shadow-xs font-bold'
              : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-amber-600" />
          Panduan XP
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LEADERBOARD & RANKING XP */}
      {/* ========================================================================= */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6">
          {/* Top 3 Podium Visual (Minimalist & Sleek) */}
          {!overallStats.hasXP ? (
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-4 text-center shadow-xs my-2 flex flex-col items-center justify-center space-y-1.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-serif font-bold text-sm text-amber-300">
                🏆 Peringkat & Rank Belum Ditentukan
              </h3>
              <p className="text-xs text-slate-300 max-w-lg leading-snug">
                Status XP santri saat ini <span className="text-emerald-400 font-semibold">kosong / belum ditentukan</span>. Silakan lakukan pencatatan setoran hafalan baru untuk mulai mengumpulkan Poin XP dan menentukan peringkat santri.
              </p>
            </div>
          ) : (
            filteredLeaderboard.length >= 3 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {/* #2 Silver Podium */}
                <div className="order-2 md:order-1 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-center relative shadow-2xs flex flex-col justify-between">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-slate-700 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    🥈 Juara 2
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="w-11 h-11 rounded-full bg-slate-200 border border-slate-300 mx-auto flex items-center justify-center font-bold text-sm text-slate-700">
                      2
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm">{filteredLeaderboard[1].namaSantri}</h3>
                    <span className="text-[10px] text-slate-500 block">Kelas {filteredLeaderboard[1].kelasSantri}</span>
                    <div className="inline-block px-2.5 py-0.5 bg-slate-800 text-slate-100 rounded-lg text-xs font-bold">
                      {filteredLeaderboard[1].totalXP.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-200 text-[10px] text-slate-600 flex justify-around font-medium">
                    <span>📚 {filteredLeaderboard[1].totalJuzHafal} Juz</span>
                    <span>🔥 {filteredLeaderboard[1].streakDays} Hari</span>
                  </div>
                </div>

                {/* #1 Gold Champion Podium */}
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-50 to-amber-100/60 border border-amber-300 rounded-2xl p-4 text-center relative shadow-xs transform md:-translate-y-1 flex flex-col justify-between">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-amber-950 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Crown className="w-3 h-3 fill-amber-950" /> 🥇 Juara 1
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="w-12 h-12 rounded-full bg-amber-300 border-2 border-amber-400 mx-auto flex items-center justify-center font-bold text-base text-amber-950 shadow-xs relative">
                      1
                    </div>
                    <h3 className="font-serif font-bold text-slate-900 text-sm md:text-base">{filteredLeaderboard[0].namaSantri}</h3>
                    <span className="text-[10px] font-semibold text-amber-800 block">Kelas {filteredLeaderboard[0].kelasSantri}</span>
                    <div className="inline-block px-3 py-0.5 bg-amber-500 text-amber-950 rounded-lg text-xs font-extrabold shadow-2xs">
                      ⚡ {filteredLeaderboard[0].totalXP.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-300/60 text-[10px] text-amber-900 flex justify-around font-bold">
                    <span>📖 {filteredLeaderboard[0].totalJuzHafal} Juz</span>
                    <span>🔥 {filteredLeaderboard[0].streakDays} Hari</span>
                    <span>🎖️ {filteredLeaderboard[0].badges.length} Badge</span>
                  </div>
                </div>

                {/* #3 Bronze Podium */}
                <div className="order-3 bg-amber-900/5 border border-amber-800/15 rounded-2xl p-3.5 text-center relative shadow-2xs flex flex-col justify-between">
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-800 text-white px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-2xs">
                    🥉 Juara 3
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="w-11 h-11 rounded-full bg-amber-100 border border-amber-400 mx-auto flex items-center justify-center font-bold text-sm text-amber-900">
                      3
                    </div>
                    <h3 className="font-bold text-slate-900 text-xs md:text-sm">{filteredLeaderboard[2].namaSantri}</h3>
                    <span className="text-[10px] text-slate-500 block">Kelas {filteredLeaderboard[2].kelasSantri}</span>
                    <div className="inline-block px-2.5 py-0.5 bg-amber-900 text-amber-100 rounded-lg text-xs font-bold">
                      {filteredLeaderboard[2].totalXP.toLocaleString()} XP
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-amber-800/15 text-[10px] text-slate-600 flex justify-around font-medium">
                    <span>📚 {filteredLeaderboard[2].totalJuzHafal} Juz</span>
                    <span>🔥 {filteredLeaderboard[2].streakDays} Hari</span>
                  </div>
                </div>
              </div>
            )
          )}

          {/* Leaderboard Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            {/* Table Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="font-serif font-bold text-base text-slate-800 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-500" /> Papan Peringkat Santri
                </h2>
                <p className="text-[11px] text-slate-500">Poin XP terakumulasi otomatis dari setoran Ziyadah & Muroja'ah</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-52">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari Santri..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-nature-forest outline-none"
                  />
                </div>

                <select
                  value={selectedKelas}
                  onChange={(e) => setSelectedKelas(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
                >
                  {kelasOptions.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50/50">
                    <th className="py-3 px-4 w-12 text-center">Rank</th>
                    <th className="py-3 px-4">Santri & Kelas</th>
                    <th className="py-3 px-4">Level & Gelar</th>
                    <th className="py-3 px-4 text-center">Capaian Hafalan</th>
                    <th className="py-3 px-4 text-center">Badge</th>
                    <th className="py-3 px-4 text-right">Total XP</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredLeaderboard.map((p, idx) => {
                    const rankInfo = getRankInfoFromXP(p.totalXP);
                    const hasXP = p.totalXP > 0;
                    const isTop3 = hasXP && idx < 3;

                    return (
                      <tr key={p.idSantri} className={`hover:bg-slate-50/80 transition-colors ${isTop3 ? 'bg-amber-50/30 font-semibold' : ''}`}>
                        <td className="py-3.5 px-4 text-center font-black">
                          {!hasXP ? (
                            <span className="text-slate-400 font-bold text-xs" title="Belum Ditentukan (XP Kosong)">—</span>
                          ) : idx === 0 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center mx-auto text-xs shadow-sm">1</span>
                          ) : idx === 1 ? (
                            <span className="w-7 h-7 rounded-full bg-slate-300 text-slate-800 flex items-center justify-center mx-auto text-xs shadow-sm">2</span>
                          ) : idx === 2 ? (
                            <span className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center mx-auto text-xs shadow-sm">3</span>
                          ) : (
                            <span className="text-slate-400 font-bold">{idx + 1}</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 text-sm">{p.namaSantri}</div>
                          <span className="text-[10px] text-slate-500 block font-mono">Kelas {p.kelasSantri}</span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] border ${rankInfo.badgeBg} ${rankInfo.badgeBorder} ${rankInfo.badgeText} shadow-2xs`}>
                              Lvl {rankInfo.level}: {rankInfo.rankTitle}
                            </span>
                          </div>
                          <div className="w-32 bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500" 
                              style={{ width: `${rankInfo.progressPercent}%` }} 
                            />
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span className="font-black text-emerald-800 block text-xs">{p.totalJuzHafal} Juz</span>
                          <span className="text-[10px] text-slate-400 block">({p.totalHalamanHafalan} Hlm)</span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {p.badges.map(b => (
                              <span 
                                key={b.id} 
                                title={`${b.title}: ${b.description}`}
                                className={`w-6 h-6 rounded-lg ${b.colorBg} ${b.colorText} border flex items-center justify-center text-[10px] font-black cursor-help`}
                              >
                                🏅
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <span className="font-black text-amber-600 text-sm bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                            {p.totalXP.toLocaleString()} XP
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => {
                              setSelectedSantriIdForProfile(p.idSantri);
                              setActiveTab('profil');
                            }}
                            className="px-2.5 py-1 bg-nature-forest/10 hover:bg-nature-forest text-nature-forest hover:text-white rounded-xl font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            Lihat Rapor
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INPUT SETORAN HAFALAN BARU & MUROJA'AH */}
      {/* ========================================================================= */}
      {activeTab === 'input' && (
        <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-nature-border shadow-md p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-nature-gold" /> Form Catat Setoran Hafalan & Tilawah
              </h2>
              <p className="text-xs text-slate-500">Pilih Santri, jenis setoran, dan tingkat kelancaran untuk menghitung Poin XP otomatis</p>
            </div>
            
            {/* Live XP Calculator Preview Box */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-amber-950 px-4 py-2.5 rounded-2xl shadow-md border border-amber-300 text-right">
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Estimasi Imbalan XP</span>
              <span className="text-xl font-black flex items-center justify-end gap-1">
                <Zap className="w-5 h-5 fill-amber-950 animate-bounce" /> +{livePreviewXP} XP
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmitSetoran} className="space-y-6">
            {/* Status Alert if Musyrif Mode is active */}
            {activeMusyrifMode && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Mode Musyrif Aktif:</strong> Musyrif setoran terkunci untuk <strong>{activeMusyrifMode}</strong>.
                    {showOnlyMusyrifSantriInForm 
                      ? ` Menampilkan ${santriListForInputForm.length} santri anggota majelis diampu.`
                      : ` Menampilkan seluruh ${santriListByBidang.length} santri (mode penguji tamu).`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOnlyMusyrifSantriInForm(!showOnlyMusyrifSantriInForm)}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {showOnlyMusyrifSantriInForm ? 'Tampilkan Semua Santri' : 'Filter Khusus Majelis Saya'}
                </button>
              </div>
            )}

            {/* Row 1: Santri & Tipe Setoran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Pilih Santri <span className="text-rose-500">*</span></span>
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-full">
                    {activeMusyrifMode && showOnlyMusyrifSantriInForm
                      ? `🔒 Majelis ${activeMusyrifMode.split(' ')[0]} (${santriListForInputForm.length} Santri)`
                      : `(${santriListForInputForm.length} Santri Available)`}
                  </span>
                </label>
                <select
                  value={formIdSantri}
                  onChange={(e) => setFormIdSantri(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
                  required
                >
                  {santriListForInputForm.map(s => {
                    const belongsToMusyrif = activeMusyrifSantriIds.has(s.id);
                    return (
                      <option key={s.id} value={s.id}>
                        {s.gender === 'Laki-laki' ? '👦' : '👧'} {s.nama} ({s.kelas || 'Umum'} - NISN: {s.nis}) {belongsToMusyrif ? '⭐ [Anggota Majelis Saya]' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jenis Setoran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formTipe}
                  onChange={(e) => setFormTipe(e.target.value as TipeSetoranTahfidz)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-slate-800 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
                  required
                >
                  <option value="Hafalan Baru (Ziyadah)">Hafalan Baru (Ziyadah) [+80 XP/Hlm Base]</option>
                  <option value="Muroja'ah Hafalan">Muroja'ah Hafalan Ulangan [+50 XP/Hlm Base]</option>
                  <option value="Tilawah / Membaca Qur'an">Tilawah / Membaca Qur'an (Bin-Nazhar) [+30 XP/Hlm Base]</option>
                </select>
              </div>
            </div>

            {/* Row 2: Surah & Juz Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Surah Mulai <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formSurahMulai}
                  onChange={(e) => setFormSurahMulai(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
                  required
                >
                  {SURAH_LIST.map(s => (
                    <option key={s.no} value={s.nama}>
                      {s.no}. {s.nama} ({s.namaArab})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Ayat Mulai - Selesai
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={formAyatMulai}
                    onChange={(e) => setFormAyatMulai(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
                    placeholder="Mulai"
                  />
                  <span className="text-slate-400 font-bold">-</span>
                  <input
                    type="number"
                    min={1}
                    value={formAyatSelesai}
                    onChange={(e) => setFormAyatSelesai(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
                    placeholder="Selesai"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Juz Al-Qur'an (1 - 30)
                </label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={formJuzNumber}
                  onChange={(e) => setFormJuzNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-nature-forest outline-none"
                  required
                />
              </div>
            </div>

            {/* Row 3: Halaman & Kelancaran */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Jumlah Halaman Disetorkan <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step={0.5}
                    min={0.5}
                    max={100}
                    value={formHalaman}
                    onChange={(e) => setFormHalaman(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-900 focus:ring-2 focus:ring-nature-forest outline-none"
                    required
                  />
                  <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Halaman Mushaf</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tingkat Kelancaran & Tajwid <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formKelancaran}
                  onChange={(e) => setFormKelancaran(e.target.value as TingkatKelancaran)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-extrabold text-emerald-900 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
                  required
                >
                  <option value="Mumtaz (A+)">Mumtaz (A+) - Sempurna Tanpa Ragu [1.25x Multiplier]</option>
                  <option value="Jayyid Jiddan (A)">Jayyid Jiddan (A) - Sangat Baik & Lancar [1.0x Multiplier]</option>
                  <option value="Jayyid (B)">Jayyid (B) - Baik, Ada 1-2 Kali Lupa [0.75x Multiplier]</option>
                  <option value="Maqbul (C)">Maqbul (C) - Cukup, Perlu Diulang [0.5x Multiplier]</option>
                </select>
              </div>
            </div>

            {/* Row 4: Tanggal, Penguji, & Streak Bonus */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal & Waktu</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={formTanggal}
                    onChange={(e) => setFormTanggal(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                  <input
                    type="time"
                    value={formWaktu}
                    onChange={(e) => setFormWaktu(e.target.value)}
                    className="w-32 px-2 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Musyrif / Penguji Setoran</span>
                  {activeMusyrifMode ? (
                    <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" /> Terkunci Akun Login
                    </span>
                  ) : guruList.length > 0 ? (
                    <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SATDAF Guru ({guruList.length})
                    </span>
                  ) : null}
                </label>
                {activeMusyrifMode ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-black text-emerald-950 flex items-center justify-between">
                    <span>👳‍♂️ {activeMusyrifMode}</span>
                    <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      Penguji Terotentikasi
                    </span>
                  </div>
                ) : (
                  <>
                    {guruList.length > 0 && (
                      <select
                        value={formMusyrif}
                        onChange={(e) => setFormMusyrif(e.target.value)}
                        className="w-full px-3 py-1.5 bg-emerald-50/70 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer mb-1.5"
                      >
                        <option value="">-- Pilih Penguji dari Staf Guru SATDAF --</option>
                        {guruList
                          .filter(g => selectedBidang === 'SEMUA' || (selectedBidang === 'PUTRA' ? g.gender === 'Laki-laki' : g.gender === 'Perempuan'))
                          .map(g => (
                            <option key={g.id} value={g.nama}>
                              {g.gender === 'Laki-laki' ? '👨‍🏫' : '👩‍🏫'} {g.nama} ({g.spesialisasi || g.peran})
                            </option>
                          ))}
                        <optgroup label="── Semua Staf Guru SATDAF ──">
                          {guruList.map(g => (
                            <option key={`all-${g.id}`} value={g.nama}>
                              {g.nama} ({g.gender}) - {g.spesialisasi || g.peran}
                            </option>
                          ))}
                        </optgroup>
                      </select>
                    )}
                    <input
                      type="text"
                      value={formMusyrif}
                      onChange={(e) => setFormMusyrif(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold outline-none"
                      placeholder="Nama Musyrif Tahfidz (atau ketik manual)"
                    />
                  </>
                )}
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formIsStreak}
                    onChange={(e) => setFormIsStreak(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Flame className="w-4 h-4 text-orange-500 fill-orange-500" /> Terapkan Bonus Streak (+25 XP)
                  </span>
                </label>
              </div>
            </div>

            {/* Catatan Musyrif */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan Musyrif / Evaluasi Tajwid</label>
              <textarea
                rows={2}
                value={formCatatan}
                onChange={(e) => setFormCatatan(e.target.value)}
                placeholder="Catatan kelebihan, makhraj yang harus disempurnakan, atau rekomendasi surah berikutnya..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-nature-forest"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveTab('leaderboard')}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 text-nature-gold fill-nature-gold" /> Simpan & Anugerahkan XP
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RIWAYAT & LOG SETORAN */}
      {/* ========================================================================= */}
      {activeTab === 'riwayat' && (
        <div className="bg-white rounded-3xl border border-nature-border shadow-sm p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-serif font-bold text-xl text-slate-900 flex items-center gap-2">
                <BookOpenCheck className="w-5 h-5 text-nature-gold" /> Log Riwayat Setoran Hafalan Santri
              </h2>
              <p className="text-xs text-slate-500">Catatan kronologis seluruh setoran hafalan baru, muroja'ah, dan tilawah</p>
            </div>

            <button
              onClick={() => handleOpenAddForm()}
              className="px-4 py-2 bg-nature-forest text-white rounded-xl text-xs font-bold hover:bg-emerald-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4 text-nature-gold" /> Tambah Setoran
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider bg-slate-50">
                  <th className="py-3 px-3">Tanggal & Waktu</th>
                  <th className="py-3 px-3">Santri</th>
                  <th className="py-3 px-3">Jenis Setoran</th>
                  <th className="py-3 px-3">Surah & Ayat</th>
                  <th className="py-3 px-3 text-center">Kelancaran</th>
                  <th className="py-3 px-3 text-right">XP Imbalan</th>
                  <th className="py-3 px-3">Musyrif</th>
                  <th className="py-3 px-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {setoranListByBidang.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{st.tanggal}</div>
                      <span className="text-[10px] text-slate-400 block font-mono">{st.waktu || '06:30'} WIB</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{st.namaSantri}</div>
                      <span className="text-[10px] text-slate-500 block">Kelas {st.kelasSantri}</span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${
                        st.tipeSetoran === 'Hafalan Baru (Ziyadah)'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : st.tipeSetoran === 'Muroja\'ah Hafalan'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                      }`}>
                        {st.tipeSetoran}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-800">
                        {st.surahMulai} {st.ayatMulai ? `(Ayat ${st.ayatMulai}-${st.ayatSelesai})` : ''}
                      </div>
                      <span className="text-[10px] text-slate-500 block">
                        Juz {st.juzNumber || 30} • {st.halamanJumlah} Halaman
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        st.kelancaran.includes('Mumtaz')
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {st.kelancaran}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-xs">
                        +{st.xpObtained} XP
                      </span>
                    </td>

                    <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-bold">
                      {st.musyrifNama}
                    </td>

                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (confirm(`Hapus catatan setoran hafalan "${st.surahMulai}" oleh ${st.namaSantri}?`)) {
                            onDeleteSetoran(st.id);
                          }
                        }}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Setoran"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RAPOR GAMIFIKASI & BADGE QUESTS */}
      {/* ========================================================================= */}
      {activeTab === 'profil' && activeProfileForDetail && (
        <div className="space-y-6">
          {/* Santri Selector Dropdown */}
          <div className="bg-white p-4 rounded-2xl border border-nature-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
              <User className="w-4 h-4 text-nature-forest" /> Pilih Santri untuk melihat Rapor Gamifikasi:
            </span>
            <select
              value={activeProfileForDetail.idSantri}
              onChange={(e) => setSelectedSantriIdForProfile(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-black text-slate-800 focus:ring-2 focus:ring-nature-forest outline-none cursor-pointer"
            >
              {gamifikasiProfiles.map(p => (
                <option key={p.idSantri} value={p.idSantri}>
                  {p.namaSantri} (Kelas {p.kelasSantri} - {p.totalXP} XP)
                </option>
              ))}
            </select>
          </div>

          {/* Profile Card */}
          <div className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-teal-950 rounded-3xl p-6 md:p-8 text-white border border-emerald-800 shadow-lg space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-emerald-800/80 pb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border-2 border-amber-400 text-amber-300 flex items-center justify-center font-black text-2xl shadow-inner">
                  {activeProfileForDetail.level}
                </div>
                <div>
                  <h2 className="font-serif font-black text-2xl text-white">{activeProfileForDetail.namaSantri}</h2>
                  <p className="text-xs text-emerald-200">Kelas {activeProfileForDetail.kelasSantri} • Darul Arifin</p>
                  <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase">
                    <Crown className="w-3.5 h-3.5" /> Gelar: {activeProfileForDetail.rankTitle}
                  </div>
                </div>
              </div>

              <div className="text-left md:text-right space-y-1">
                <span className="text-xs text-emerald-300 block font-bold uppercase">Total Terakumulasi</span>
                <span className="text-3xl font-black text-amber-300">{activeProfileForDetail.totalXP.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Progress Bar & Level Info */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-emerald-200">
                <span>Level {activeProfileForDetail.level}</span>
                <span>Menuju Level {activeProfileForDetail.level + 1}</span>
              </div>
              <div className="w-full bg-emerald-950 rounded-full h-3 border border-emerald-800 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 h-3 rounded-full transition-all duration-700"
                  style={{ width: `${getRankInfoFromXP(activeProfileForDetail.totalXP).progressPercent}%` }}
                />
              </div>
            </div>

            {/* Badges Grid */}
            <div className="pt-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-emerald-300 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-nature-gold" /> Badge & Lencana Pencapaian
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {ALL_BADGES.map(badge => {
                  const isUnlocked = activeProfileForDetail.badges.some(b => b.id === badge.id);

                  return (
                    <div 
                      key={badge.id}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        isUnlocked
                          ? `${badge.colorBg} ${badge.colorText} shadow-md`
                          : 'bg-emerald-950/40 border-emerald-800/40 text-emerald-600 opacity-50 grayscale'
                      }`}
                    >
                      <div className="text-xl mb-1">🏅</div>
                      <div className="font-extrabold text-[11px] leading-tight truncate">{badge.title}</div>
                      <span className="text-[9px] block mt-1 line-clamp-2 opacity-80">
                        {isUnlocked ? badge.description : '🔒 Terkunci'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: RODA ACAK MUROJA'AH (WHEEL CHALLENGE) */}
      {/* ========================================================================= */}
      {activeTab === 'roda' && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-nature-border shadow-lg p-8 text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-black uppercase">
              <Gamepad2 className="w-4 h-4 text-amber-600" /> Halaqah Challenge Interaktif
            </div>
            <h2 className="font-serif font-black text-2xl text-slate-900">
              Roda Acak Muroja'ah Surah
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Putar roda acak untuk memilih Surah Muroja'ah tantangan harian saat halaqah bersama santri. Santri yang berhasil menjawab mendapat bonus +50 XP!
            </p>
          </div>

          <div className="relative w-48 h-48 mx-auto my-6 flex items-center justify-center">
            <div className={`w-44 h-44 rounded-full bg-gradient-to-tr from-emerald-800 via-nature-forest to-teal-700 border-8 border-nature-gold shadow-2xl flex items-center justify-center text-white transition-all duration-1000 ${
              spinningWheel ? 'animate-spin' : ''
            }`}>
              <BookOpen className="w-16 h-16 text-nature-gold animate-pulse" />
            </div>
          </div>

          {wheelSelectedSurah && (
            <div className="bg-amber-50 border-2 border-amber-400 p-5 rounded-2xl animate-fade-in space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">Surah & Santri Muroja'ah Terpilih:</span>
              <div className="text-xl font-black text-amber-950">{wheelSelectedSurah}</div>
              {wheelSelectedSantri && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-200/80 text-amber-950 rounded-xl text-xs font-black">
                  👤 Santri Penguji/Penyetor: {wheelSelectedSantri}
                </div>
              )}
              <p className="text-xs font-bold text-amber-900 pt-1">
                🏆 Selesaikan bacaan lancar untuk mengklaim Imbalan Bonus +50 XP!
              </p>
            </div>
          )}

          <button
            onClick={handleSpinWheel}
            disabled={spinningWheel}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-black rounded-2xl text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-amber-950" /> {spinningWheel ? 'Sedang Memutar Roda Surah...' : 'Acak Surah Muroja\'ah Sekarang'}
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB: MAJELIS HALAQAH QUR'AN (MUBTADI'IN, WUSTHO, TAHFIDZ) */}
      {/* ========================================================================= */}
      {activeTab === 'halaqah' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Banner Majelis Halaqah */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 md:p-8 border border-emerald-500/40 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Users className="w-4 h-4 text-emerald-400" /> Pengelolaan Majelis Halaqah Qur'an
              </div>
              <h2 className="font-serif font-black text-2xl md:text-3xl text-white">
                Daftar Majelis & Halaqah Al-Qur'an
              </h2>
              <p className="text-xs md:text-sm text-emerald-100/90 leading-relaxed">
                Pengelompokan halaqah binaan santri berdasarkan tingkatan jenjang: <strong>Mubtadi'in</strong> (Pemula/Tajwid), <strong>Wustho</strong> (Menengah/Binnazhar), dan <strong>Tahfidz</strong> (Akselerasi Hafalan Mutqin).
              </p>
            </div>

            <button
              onClick={() => handleOpenCreateMajelis()}
              className="z-10 px-5 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-amber-950 font-black rounded-2xl text-xs md:text-sm shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 active:scale-98"
            >
              <PlusCircle className="w-5 h-5" />
              Buat Majelis Halaqah Baru
            </button>

            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          </div>

          {/* 3 Main Category Cards (Mubtadi'in, Wustho, Tahfidz) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card 1: Mubtadi'in */}
            <div 
              onClick={() => setSelectedHalaqahTingkat(selectedHalaqahTingkat === "Mubtadi'in" ? 'SEMUA' : "Mubtadi'in")}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedHalaqahTingkat === "Mubtadi'in"
                  ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-blue-400 ring-4 ring-blue-400/30 shadow-lg'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    selectedHalaqahTingkat === "Mubtadi'in" ? 'bg-blue-400/30 text-blue-100' : 'bg-blue-100 text-blue-800'
                  }`}>
                    Tingkat Pemula
                  </span>
                  <h3 className="font-serif font-black text-xl mt-2">1. Mubtadi'in</h3>
                  <p className={`text-xs mt-1 ${selectedHalaqahTingkat === "Mubtadi'in" ? 'text-blue-100' : 'text-slate-500'}`}>
                    Fokus Pembelajaran Iqra 1-6, Makhraj, Tajwid Dasar & Juz Amma (Juz 30)
                  </p>
                </div>
                <div className={`p-3 rounded-2xl text-2xl ${
                  selectedHalaqahTingkat === "Mubtadi'in" ? 'bg-blue-500/40 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  🌱
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/40 flex items-center justify-between text-xs font-bold">
                <span>
                  {majelisList.filter(m => m.tingkat === "Mubtadi'in" && (selectedBidang === 'SEMUA' || (selectedBidang === 'PUTRA' ? m.gender === 'Laki-laki' : m.gender === 'Perempuan'))).length} Majelis Binaan
                </span>
                <span className="underline text-[11px]">
                  {selectedHalaqahTingkat === "Mubtadi'in" ? 'Tampilkan Semua' : 'Filter Mubtadi\'in →'}
                </span>
              </div>
            </div>

            {/* Card 2: Wustho */}
            <div 
              onClick={() => setSelectedHalaqahTingkat(selectedHalaqahTingkat === 'Wustho' ? 'SEMUA' : 'Wustho')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedHalaqahTingkat === 'Wustho'
                  ? 'bg-gradient-to-br from-teal-600 to-emerald-700 text-white border-teal-400 ring-4 ring-teal-400/30 shadow-lg'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    selectedHalaqahTingkat === 'Wustho' ? 'bg-teal-400/30 text-teal-100' : 'bg-teal-100 text-teal-800'
                  }`}>
                    Tingkat Menengah
                  </span>
                  <h3 className="font-serif font-black text-xl mt-2">2. Wustho</h3>
                  <p className={`text-xs mt-1 ${selectedHalaqahTingkat === 'Wustho' ? 'text-teal-100' : 'text-slate-500'}`}>
                    Fokus Binnazhar (Membaca Al-Qur'an 30 Juz), Tajwid Terapan & Kelancaran Muroja'ah
                  </p>
                </div>
                <div className={`p-3 rounded-2xl text-2xl ${
                  selectedHalaqahTingkat === 'Wustho' ? 'bg-teal-500/40 text-white' : 'bg-teal-50 text-teal-600'
                }`}>
                  🌿
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/40 flex items-center justify-between text-xs font-bold">
                <span>
                  {majelisList.filter(m => m.tingkat === 'Wustho' && (selectedBidang === 'SEMUA' || (selectedBidang === 'PUTRA' ? m.gender === 'Laki-laki' : m.gender === 'Perempuan'))).length} Majelis Binaan
                </span>
                <span className="underline text-[11px]">
                  {selectedHalaqahTingkat === 'Wustho' ? 'Tampilkan Semua' : 'Filter Wustho →'}
                </span>
              </div>
            </div>

            {/* Card 3: Tahfidz */}
            <div 
              onClick={() => setSelectedHalaqahTingkat(selectedHalaqahTingkat === 'Tahfidz' ? 'SEMUA' : 'Tahfidz')}
              className={`p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                selectedHalaqahTingkat === 'Tahfidz'
                  ? 'bg-gradient-to-br from-amber-600 to-amber-700 text-white border-amber-400 ring-4 ring-amber-400/30 shadow-lg'
                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                    selectedHalaqahTingkat === 'Tahfidz' ? 'bg-amber-400/30 text-amber-100' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Tingkat Akselerasi Hafalan
                  </span>
                  <h3 className="font-serif font-black text-xl mt-2">3. Tahfidz</h3>
                  <p className={`text-xs mt-1 ${selectedHalaqahTingkat === 'Tahfidz' ? 'text-amber-100' : 'text-slate-500'}`}>
                    Fokus Hafalan Murni Ziyadah, Ujian Muroja'ah Berkala & Mutqin 30 Juz
                  </p>
                </div>
                <div className={`p-3 rounded-2xl text-2xl ${
                  selectedHalaqahTingkat === 'Tahfidz' ? 'bg-amber-500/40 text-white' : 'bg-amber-50 text-amber-600'
                }`}>
                  👑
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200/40 flex items-center justify-between text-xs font-bold">
                <span>
                  {majelisList.filter(m => m.tingkat === 'Tahfidz' && (selectedBidang === 'SEMUA' || (selectedBidang === 'PUTRA' ? m.gender === 'Laki-laki' : m.gender === 'Perempuan'))).length} Majelis Binaan
                </span>
                <span className="underline text-[11px]">
                  {selectedHalaqahTingkat === 'Tahfidz' ? 'Tampilkan Semua' : 'Filter Tahfidz →'}
                </span>
              </div>
            </div>
          </div>

          {/* Controls Bar: Search & Filter Tabs */}
          <div className="bg-white rounded-3xl border border-nature-border p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedHalaqahTingkat('SEMUA')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedHalaqahTingkat === 'SEMUA'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Semua Tingkat ({majelisList.filter(m => selectedBidang === 'SEMUA' || (selectedBidang === 'PUTRA' ? m.gender === 'Laki-laki' : m.gender === 'Perempuan')).length})
              </button>
              <button
                onClick={() => setSelectedHalaqahTingkat("Mubtadi'in")}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedHalaqahTingkat === "Mubtadi'in"
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
                }`}
              >
                🌱 Mubtadi'in
              </button>
              <button
                onClick={() => setSelectedHalaqahTingkat('Wustho')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedHalaqahTingkat === 'Wustho'
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                }`}
              >
                🌿 Wustho
              </button>
              <button
                onClick={() => setSelectedHalaqahTingkat('Tahfidz')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedHalaqahTingkat === 'Tahfidz'
                    ? 'bg-amber-500 text-amber-950 shadow-md font-extrabold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                👑 Tahfidz
              </button>
            </div>

            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchHalaqahQuery}
                onChange={(e) => setSearchHalaqahQuery(e.target.value)}
                placeholder="Cari Majelis, Musyrif, Lokasi..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {searchHalaqahQuery && (
                <button
                  onClick={() => setSearchHalaqahQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Majelis Grid List */}
          {filteredMajelisList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
                🕋
              </div>
              <h3 className="font-bold text-slate-700 text-base">Belum Ada Majelis Halaqah</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ditemukan data majelis halaqah untuk kriteria pencarian atau tingkat yang dipilih.
              </p>
              <button
                onClick={() => handleOpenCreateMajelis()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <PlusCircle className="w-4 h-4" /> Buat Majelis Baru Sekarang
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMajelisList.map((maj) => {
                // Get santri members in this majelis
                const memberSantriList = santriList.filter(s => maj.santriIds?.includes(s.id));
                // Calculate combined total XP for this majelis
                const totalMajelisXP = memberSantriList.reduce((acc, s) => {
                  const setoranS = tahfidzSetoranList.filter(st => st.idSantri === s.id);
                  const totalXpS = setoranS.reduce((sum, st) => sum + (st.xpObtained || 0), 0);
                  return acc + totalXpS;
                }, 0);

                const isDiampuByActiveMusyrif = Boolean(
                  activeMusyrifMode && 
                  (maj.musyrif.toLowerCase().trim().includes(activeMusyrifMode.toLowerCase().trim()) || 
                   activeMusyrifMode.toLowerCase().trim().includes(maj.musyrif.toLowerCase().trim()))
                );

                return (
                  <div
                    key={maj.id}
                    className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl transition-all p-5 flex flex-col justify-between space-y-4 relative group ${
                      isDiampuByActiveMusyrif ? 'border-emerald-500 ring-2 ring-emerald-400/80 bg-emerald-50/20 shadow-md' : 'border-nature-border'
                    }`}
                  >
                    {/* Top Header Card */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            maj.tingkat === "Mubtadi'in"
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : maj.tingkat === 'Wustho'
                              ? 'bg-teal-100 text-teal-800 border border-teal-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}>
                            {maj.tingkat === "Mubtadi'in" ? '🌱 Mubtadi\'in' : maj.tingkat === 'Wustho' ? '🌿 Wustho' : '👑 Tahfidz'}
                          </span>
                          {isDiampuByActiveMusyrif && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-600 text-white shadow-2xs flex items-center gap-1">
                              ⭐ Majelis Diampu Anda
                            </span>
                          )}
                        </div>

                        <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                          {maj.gender === 'Laki-laki' ? '👦 Putra' : '👧 Putri'}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-serif font-black text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {maj.namaMajelis}
                        </h3>
                        {(() => {
                          const matchedGuru = getGuruFromSATDAF(maj.musyrif);
                          return (
                            <div className="mt-1 space-y-0.5">
                              <p className="text-xs font-bold text-slate-700 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 truncate">
                                  <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">Musyrif: <strong>{maj.musyrif}</strong></span>
                                </span>
                                {matchedGuru ? (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-[10px] font-black flex items-center gap-0.5 shrink-0 shadow-2xs">
                                    <ShieldCheck className="w-3 h-3 text-emerald-600" /> SATDAF
                                  </span>
                                ) : (
                                  <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[9px] font-medium border border-slate-200 shrink-0">
                                    Manual
                                  </span>
                                )}
                              </p>
                              {matchedGuru && (
                                <p className="text-[10px] text-emerald-800 font-semibold pl-5">
                                  {matchedGuru.spesialisasi || matchedGuru.peran} • NIP: {matchedGuru.nip}
                                </p>
                              )}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Info Details */}
                      <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{maj.lokasi}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{maj.jadwal}</span>
                        </div>
                        <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                          <Target className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium leading-tight">{maj.targetSelesai}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Info & Actions */}
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span>{memberSantriList.length} Santri Anggota</span>
                        </div>
                        <div className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-lg font-black text-[10px] border border-amber-200">
                          ⚡ {totalMajelisXP} XP Total
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedMajelisDetail(maj);
                            setIsMajelisDetailOpen(true);
                          }}
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                        >
                          <BookOpenCheck className="w-3.5 h-3.5" /> Detail & Santri
                        </button>

                        <button
                          onClick={() => handleOpenEditMajelis(maj)}
                          title="Edit Majelis"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer border border-slate-200"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteMajelis(maj.id)}
                          title="Hapus Majelis"
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer border border-rose-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: PANDUAN PENERAPAN XP, LEVEL & BADGES (DARI DOKUMEN RESMI) */}
      {/* ========================================================================= */}
      {activeTab === 'panduan' && (
        <div className="space-y-8 animate-fade-in">
          {/* Header Banner Panduan */}
          <div className="bg-gradient-to-r from-amber-900 via-amber-800 to-amber-950 text-white rounded-3xl p-6 md:p-8 border border-amber-600/50 shadow-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-full text-xs font-black uppercase">
              <BookOpen className="w-4 h-4 text-amber-400" /> Panduan Resmi System Rules & Matriks XP
            </div>
            <h2 className="font-serif font-black text-2xl md:text-3xl text-amber-100">
              Panduan Penerapan XP Pada Menu Tahfidz Gamifikasi
            </h2>
            <p className="text-xs md:text-sm text-amber-200/90 leading-relaxed max-w-3xl">
              Sistem ini mengadopsi mekanisme gamifikasi lengkap untuk mendorong semangat santri dalam menambah (Ziyadah), memperlancar (Muroja'ah), dan mengkhatamkan bacaan Al-Qur'an (Jalan Tilawah & Tahsin). Poin Experience (XP) dihitung secara otomatis berdasarkan volume, kelancaran, dan konsistensi.
            </p>
          </div>

          {/* Section 1: Tabel Baku Referensi XP */}
          <div className="bg-white rounded-3xl border border-nature-border p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-serif font-black text-xl text-slate-900 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
                  Matriks Baku Perolehan Poin XP (Tahfidz & Tahsin)
                </h3>
                <p className="text-xs text-slate-500">Daftar perolehan XP berdasarkan jenis kegiatan harian, muroja'ah, ujian, dan kualitas</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Program Tahfidz Table */}
              <div className="border border-emerald-200 rounded-2xl overflow-hidden bg-emerald-50/20 space-y-0">
                <div className="bg-emerald-800 text-white p-3.5 font-bold text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <BookOpenCheck className="w-4 h-4 text-emerald-300" /> Program Tahfidz (Setoran & Muroja'ah)
                  </span>
                  <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-md font-mono">Baku XP</span>
                </div>
                <div className="divide-y divide-emerald-100 max-h-96 overflow-y-auto">
                  {REFERENSI_XP_LIST.filter(r => r.program === 'Tahfidz').map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-emerald-100/40 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.aktivitas}</span>
                        <span className="text-[10px] text-emerald-700 font-medium">Kategori: {item.kategori}</span>
                      </div>
                      <span className="font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-300">
                        +{item.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Program Tahsin Table */}
              <div className="border border-amber-200 rounded-2xl overflow-hidden bg-amber-50/20 space-y-0">
                <div className="bg-amber-800 text-white p-3.5 font-bold text-sm flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-300" /> Program Tahsin & Jalan Tilawah
                  </span>
                  <span className="text-[10px] bg-amber-700 px-2 py-0.5 rounded-md font-mono">Baku XP</span>
                </div>
                <div className="divide-y divide-amber-100 max-h-96 overflow-y-auto">
                  {REFERENSI_XP_LIST.filter(r => r.program === 'Tahsin').map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between hover:bg-amber-100/40 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 block">{item.aktivitas}</span>
                        <span className="text-[10px] text-amber-800 font-medium">Kategori: {item.kategori}</span>
                      </div>
                      <span className="font-black text-amber-900 bg-amber-100 px-2.5 py-1 rounded-xl border border-amber-300">
                        +{item.xp} XP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Kualitas & Subuh Combo Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 text-white p-4 rounded-2xl border border-emerald-700 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Bonus Kualitas Bacaan</span>
                <ul className="text-xs space-y-1 text-emerald-100 font-medium">
                  <li className="flex justify-between"><span>• Tajwid Sangat Baik:</span> <strong className="text-amber-300">+10 XP</strong></li>
                  <li className="flex justify-between"><span>• Tanpa Kesalahan:</span> <strong className="text-amber-300">+20 XP</strong></li>
                  <li className="flex justify-between"><span>• Tasmi' Lancar Sekali Duduk:</span> <strong className="text-amber-300">+30 XP</strong></li>
                </ul>
              </div>

              <div className="bg-gradient-to-br from-amber-900 to-amber-950 text-white p-4 rounded-2xl border border-amber-700 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Subuh Streak & Combo Consecutive</span>
                <ul className="text-xs space-y-1 text-amber-100 font-medium">
                  <li className="flex justify-between"><span>• Combo 3 Hari Berturut:</span> <strong className="text-amber-300">+20 XP</strong></li>
                  <li className="flex justify-between"><span>• Combo 7 Hari (Penjaga Fajr):</span> <strong className="text-amber-300">+70 XP</strong></li>
                  <li className="flex justify-between"><span>• Combo 14 Hari Istiqamah:</span> <strong className="text-amber-300">+150 XP</strong></li>
                  <li className="flex justify-between"><span>• Combo 30 Hari Warrior:</span> <strong className="text-amber-300">+500 XP</strong></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 2: Syarat Level Resmi Tahfidz */}
          <div className="bg-white rounded-3xl border border-nature-border p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif font-black text-xl text-slate-900 flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                Matriks Tingkatan Level & Syarat Kelulusan
              </h3>
              <p className="text-xs text-slate-500">Persyaratan ujian dan evaluasi guru untuk kenaikan gelar santri</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OFFICIAL_TAHFIDZ_LEVELS.map((lvl) => (
                <div key={lvl.level} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2 hover:border-amber-400 hover:bg-amber-50/30 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-xl bg-amber-500 text-amber-950 font-black text-xs flex items-center justify-center shadow-sm">
                      L{lvl.level}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Tahapan Level</span>
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{lvl.namaLevel}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                    {lvl.syaratPemberian}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Tabel 9 Level Jalan Tilawah */}
          <div className="bg-white rounded-3xl border border-nature-border p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif font-black text-xl text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-600" />
                Program Jalan Tilawah (9 Level Pembiasaan Khatam)
              </h3>
              <p className="text-xs text-slate-500">Tahapan pembiasaan membaca Al-Qur'an tiap selesai shalat fardhu</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-teal-900 text-white font-bold">
                    <th className="p-3 rounded-l-xl text-center">Level</th>
                    <th className="p-3">Target Bacaan per Shalat</th>
                    <th className="p-3 text-center">Durasi Wajib Konsisten</th>
                    <th className="p-3 rounded-r-xl text-right">Status Target</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {TABEL_JALAN_TILAWAH.map((jt) => (
                    <tr key={jt.level} className="hover:bg-teal-50/50">
                      <td className="p-3 text-center font-black text-teal-900">
                        <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 inline-flex items-center justify-center font-extrabold">
                          {jt.level}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-800">{jt.targetPerShalat} / Shalat Fardhu</td>
                      <td className="p-3 text-center font-medium text-slate-600">{jt.durasiWajibHari} Hari Berturut-turut</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold">
                          Wajib Selesai
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 4: All Badge Quests */}
          <div className="bg-white rounded-3xl border border-nature-border p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-serif font-black text-xl text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Daftar Lengkap Badge Lencana Pencapaian
              </h3>
              <p className="text-xs text-slate-500">Lencana penghargaan otomatis yang diberikan saat santri memenuhi kriteria</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ALL_BADGES.map((badge) => (
                <div key={badge.id} className={`p-3.5 rounded-2xl border ${badge.colorBg} ${badge.colorText} flex items-start gap-3 shadow-xs`}>
                  <div className="w-10 h-10 rounded-xl bg-white/80 border border-current flex items-center justify-center shrink-0 text-xl shadow-2xs">
                    🏅
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs">{badge.title}</h4>
                    <p className="text-[11px] opacity-90 leading-tight mt-0.5">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CELEBRATION MODAL (LEVEL UP & XP AWARDED) */}
      {celebrationModal.show && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center space-y-4 border-2 border-amber-400 shadow-2xl animate-scale-up">
            <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 text-amber-600 flex items-center justify-center mx-auto text-2xl animate-bounce">
              ⚡
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block">Imbalan XP Diberikan!</span>
              <h3 className="font-serif font-black text-2xl text-slate-900">+{celebrationModal.xpGained} XP</h3>
              <p className="text-xs font-bold text-slate-700">{celebrationModal.santriName}</p>
              <div className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-black">
                Gelar: {celebrationModal.newRankTitle}
              </div>
            </div>

            <button
              onClick={() => setCelebrationModal({ ...celebrationModal, show: false })}
              className="w-full py-2.5 bg-nature-forest text-white rounded-xl text-xs font-black hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Tutup & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PORTAL BESAR GEMBOK KEAMANAN MODAL (SECURITY GATE LOCK MODAL) */}
      {/* ========================================================================= */}
      {isGateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl border-2 border-amber-400/70 shadow-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative overflow-hidden">
            
            {/* Glowing Accent Ring Background */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={() => setIsGateModalOpen(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header with Big Glowing Lock Icon */}
            <div className="text-center space-y-3 pt-2">
              <div className="relative inline-block">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-700 p-0.5 shadow-xl shadow-amber-500/30 mx-auto flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-amber-400">
                    <Lock className="w-10 h-10 animate-pulse" />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-lg text-xs font-black shadow-md">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>

              <div>
                <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-[10px] font-black uppercase tracking-widest inline-block">
                  Portal Keamanan Bidang Qur'an
                </span>
                <h3 className="font-serif font-black text-xl md:text-2xl text-white mt-1.5">
                  Verifikasi Sandi Pengaman
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-md mx-auto mt-1">
                  Masukkan PIN / Sandi Pengaman untuk membuka hak kelola & penginputan data santri
                </p>
              </div>
            </div>

            {/* 3 Portal Selection Cards */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                1. Pilih Bidang Qur'an Target:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {/* Option 1: Putra */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetBidangToUnlock('PUTRA');
                    setPinError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    targetBidangToUnlock === 'PUTRA'
                      ? 'bg-blue-600/30 border-blue-400 ring-2 ring-blue-400 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl">👦</div>
                  <div className="mt-2">
                    <div className="font-black text-xs">Bidang Putra</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Khusus Santri Pa</div>
                  </div>
                </button>

                {/* Option 2: Putri */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetBidangToUnlock('PUTRI');
                    setPinError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    targetBidangToUnlock === 'PUTRI'
                      ? 'bg-rose-600/30 border-rose-400 ring-2 ring-rose-400 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl">👧</div>
                  <div className="mt-2">
                    <div className="font-black text-xs">Bidang Putri</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Khusus Santri Pi</div>
                  </div>
                </button>

                {/* Option 3: Gabungan */}
                <button
                  type="button"
                  onClick={() => {
                    setTargetBidangToUnlock('SEMUA');
                    setPinError('');
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    targetBidangToUnlock === 'SEMUA'
                      ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-2xl">👥</div>
                  <div className="mt-2">
                    <div className="font-black text-xs">Portal Gabungan</div>
                    <div className="text-[9px] text-slate-300 font-medium truncate">Akses Pimpinan</div>
                  </div>
                </button>
              </div>
            </div>

            {/* PIN Verification Form */}
            <form onSubmit={handleVerifyPin} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center justify-between">
                  <span>2. Masukkan Sandi PIN ({targetBidangToUnlock}):</span>
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="text-[10px] text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showPin ? 'Sembunyikan' : 'Tampilkan PIN'}
                  </button>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4 text-amber-400" />
                  </div>
                  <input
                    type={showPin ? 'text' : 'password'}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      setPinError('');
                    }}
                    placeholder={`Masukkan PIN ${targetBidangToUnlock}...`}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-2xl text-sm font-black text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono tracking-widest text-center"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Error Message Display */}
              {pinError && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/60 text-rose-200 rounded-xl text-xs font-bold flex items-center gap-2 animate-shake">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-amber-950 rounded-2xl text-sm font-black transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Unlock className="w-4 h-4" />
                Buka Akses Portal Bidang Qur'an {targetBidangToUnlock}
              </button>

              {/* Default PIN Hint Banner */}
              <div className="p-3 bg-slate-950/80 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200/90 font-mono leading-relaxed text-center space-y-0.5">
                <span className="font-bold text-amber-300 block text-[10px] uppercase">💡 Sandi Bawaan Pengaman:</span>
                <div>• Bidang Putra: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">1234</strong></div>
                <div>• Bidang Putri: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">5678</strong></div>
                <div>• Portal Gabungan: <strong className="text-white bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">9999</strong></div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL PENGATURAN GANTI SANDI PIN PENGAMAN */}
      {/* ========================================================================= */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl border border-slate-700 max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            
            <button
              onClick={() => setIsChangePinModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Ubah Sandi Pengaman PIN</h3>
                <p className="text-xs text-slate-400">Atur ulang password khusus Bidang Qur'an</p>
              </div>
            </div>

            <form onSubmit={handleSaveNewPin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Target Bidang Qur'an:
                </label>
                <select
                  value={editPinTarget}
                  onChange={(e) => setEditPinTarget(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-400 outline-none"
                >
                  <option value="PUTRA">👦 Bidang Qur'an Putra</option>
                  <option value="PUTRI">👧 Bidang Qur'an Putri</option>
                  <option value="SEMUA">👥 Portal Gabungan (Pimpinan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sandi PIN Lama:
                </label>
                <input
                  type="password"
                  value={oldPinValue}
                  onChange={(e) => setOldPinValue(e.target.value)}
                  placeholder="Masukkan Sandi Lama..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-400 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Sandi PIN Baru (Min 4 Karakter/Angka):
                </label>
                <input
                  type="password"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value)}
                  placeholder="Masukkan Sandi Baru..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:ring-2 focus:ring-amber-400 outline-none font-mono"
                  required
                />
              </div>

              {changePinMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  changePinMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {changePinMsg.text}
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 text-amber-950 hover:bg-amber-400 rounded-xl text-xs font-black cursor-pointer shadow-md"
                >
                  Simpan Sandi Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL TAMBAH / EDIT MAJELIS HALAQAH */}
      {/* ========================================================================= */}
      {isMajelisModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsMajelisModalOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl border border-emerald-200">
                🕋
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-slate-900">
                  {editingMajelis ? 'Edit Data Majelis Halaqah' : 'Buat Majelis Halaqah Qur\'an Baru'}
                </h3>
                <p className="text-xs text-slate-500">
                  Kelompokkan santri dalam majelis Mubtadi'in, Wustho, atau Tahfidz
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMajelis} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nama Majelis */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Majelis Halaqah <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formNamaMajelis}
                    onChange={(e) => setFormNamaMajelis(e.target.value)}
                    placeholder="Contoh: Majelis Al-Fatih 01"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>

                {/* Tingkat / Level */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tingkatan Majelis <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formTingkatMajelis}
                    onChange={(e) => setFormTingkatMajelis(e.target.value as TingkatHalaqah)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Mubtadi'in">🌱 1. Mubtadi'in (Pemula / Tajwid & Iqra)</option>
                    <option value="Wustho">🌿 2. Wustho (Menengah / Binnazhar & Kelancaran)</option>
                    <option value="Tahfidz">👑 3. Tahfidz (Akselerasi Hafalan Mutqin)</option>
                  </select>
                </div>

                {/* Gender Portal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>Peruntukan Gender</span>
                    <span className="text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      {formGenderMajelis === 'Laki-laki' ? '👦 Khusus Putra' : '👧 Khusus Putri'}
                    </span>
                  </label>
                  <select
                    value={formGenderMajelis}
                    onChange={(e) => setFormGenderMajelis(e.target.value as any)}
                    disabled={selectedBidang !== 'SEMUA' || !!editingMajelis}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-90 disabled:bg-slate-100/80 cursor-pointer"
                  >
                    {(selectedBidang === 'PUTRA' || (selectedBidang === 'SEMUA' && formGenderMajelis === 'Laki-laki')) && (
                      <option value="Laki-laki">👦 Khusus Putra (Pa)</option>
                    )}
                    {(selectedBidang === 'PUTRI' || (selectedBidang === 'SEMUA' && formGenderMajelis === 'Perempuan')) && (
                      <option value="Perempuan">👧 Khusus Putri (Pi)</option>
                    )}
                    {selectedBidang === 'SEMUA' && !editingMajelis && (
                      <>
                        <option value="Laki-laki">👦 Khusus Putra (Pa)</option>
                        <option value="Perempuan">👧 Khusus Putri (Pi)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Musyrif / Pengampu */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>{formGenderMajelis === 'Laki-laki' ? 'Musyrif / Ustadz Pengampu' : 'Musyrifah / Ustadzah Pengampu'} <span className="text-rose-500">*</span></span>
                    {guruList.length > 0 && (
                      <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5" /> SATDAF Guru ({guruList.filter(g => g.gender === formGenderMajelis).length})
                      </span>
                    )}
                  </label>

                  {guruList.length > 0 && (
                    <select
                      value={formMusyrifMajelis}
                      onChange={(e) => setFormMusyrifMajelis(e.target.value)}
                      className="w-full px-3.5 py-2 bg-emerald-50/70 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-950 focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer mb-1.5"
                    >
                      <option value="">-- Pilih Guru Pengampu ({formGenderMajelis === 'Laki-laki' ? 'Ustadz Putra' : 'Ustadzah Putri'}) --</option>
                      {guruList
                        .filter(g => g.gender === formGenderMajelis)
                        .map(g => (
                          <option key={g.id} value={g.nama}>
                            {g.gender === 'Laki-laki' ? '👨‍🏫 Ustadz' : '👩‍🏫 Ustadzah'} {g.nama} - {g.spesialisasi || g.peran}
                          </option>
                        ))}
                    </select>
                  )}

                  <input
                    type="text"
                    value={formMusyrifMajelis}
                    onChange={(e) => setFormMusyrifMajelis(e.target.value)}
                    placeholder="Contoh: Ustadz Ahmad Farhan (Atau ketik manual)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />

                  {formMusyrifMajelis && (() => {
                    const matched = getGuruFromSATDAF(formMusyrifMajelis);
                    if (matched) {
                      return (
                        <p className="text-[10px] text-emerald-700 font-bold mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          Terdaftar SATDAF: {matched.peran} | NIP: {matched.nip} | Kontak: {matched.noHp}
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Lokasi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Lokasi Tempat Halaqah
                  </label>
                  <input
                    type="text"
                    value={formLokasiMajelis}
                    onChange={(e) => setFormLokasiMajelis(e.target.value)}
                    placeholder="Contoh: Masjid Lt 1 - Sayap Kanan"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                {/* Jadwal */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jadwal Waktu Halaqah
                  </label>
                  <input
                    type="text"
                    value={formJadwalMajelis}
                    onChange={(e) => setFormJadwalMajelis(e.target.value)}
                    placeholder="Contoh: Ba'da Subuh & Ba'da Asar"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Target Selesai */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Kurikulum / Capaian Selesai
                </label>
                <input
                  type="text"
                  value={formTargetMajelis}
                  onChange={(e) => setFormTargetMajelis(e.target.value)}
                  placeholder="Contoh: Khatam Iqra 1-6 & Muroja'ah Juz 30"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Santri Selection Checklist with Search Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">
                    Pilih Santri Anggota ({formGenderMajelis === 'Laki-laki' ? 'Putra' : 'Putri'}):
                  </label>
                  <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    Terpilih: {formSantriIdsMajelis.length} Santri
                  </span>
                </div>

                {/* Kotak Pencarian Nama Santri */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={formSearchSantriQuery}
                    onChange={(e) => setFormSearchSantriQuery(e.target.value)}
                    placeholder="🔍 Ketik nama pendek, NISN, atau kelas santri..."
                    className="w-full pl-8 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all placeholder:text-slate-400"
                  />
                  {formSearchSantriQuery && (
                    <button
                      type="button"
                      onClick={() => setFormSearchSantriQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200 transition-colors"
                      title="Bersihkan pencarian"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Info Hasil Filter & Action Buttons */}
                <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 pt-0.5">
                  <span className="font-medium">
                    Menampilkan <strong>{filteredSantriForMajelisModal.length}</strong> santri {formSearchSantriQuery ? `(kata kunci: "${formSearchSantriQuery}")` : ''}
                  </span>
                  <div className="flex items-center gap-2 font-bold">
                    <button
                      type="button"
                      onClick={() => {
                        const visibleIds = filteredSantriForMajelisModal.map(s => s.id);
                        const newSelected = Array.from(new Set([...formSantriIdsMajelis, ...visibleIds]));
                        setFormSantriIdsMajelis(newSelected);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={() => {
                        const visibleIds = new Set(filteredSantriForMajelisModal.map(s => s.id));
                        setFormSantriIdsMajelis(formSantriIdsMajelis.filter(id => !visibleIds.has(id)));
                      }}
                      className="text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                    >
                      Hapus Pilihan
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto bg-slate-50 border border-slate-200 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredSantriForMajelisModal.length === 0 ? (
                    <div className="col-span-1 sm:col-span-2 text-center py-6 text-xs text-slate-400 font-medium">
                      {formSearchSantriQuery ? (
                        <>Tidak ditemukan santri {formGenderMajelis === 'Laki-laki' ? 'putra' : 'putri'} dengan kata kunci "<strong className="text-slate-600">{formSearchSantriQuery}</strong>"</>
                      ) : (
                        <>Belum ada data santri {formGenderMajelis === 'Laki-laki' ? 'putra' : 'putri'}.</>
                      )}
                    </div>
                  ) : (
                    filteredSantriForMajelisModal.map(s => {
                      const isSelected = formSantriIdsMajelis.includes(s.id);
                      return (
                        <label
                          key={s.id}
                          className={`p-2 rounded-xl border text-xs cursor-pointer flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              if (isSelected) {
                                setFormSantriIdsMajelis(formSantriIdsMajelis.filter(id => id !== s.id));
                              } else {
                                setFormSantriIdsMajelis([...formSantriIdsMajelis, s.id]);
                              }
                            }}
                            className="rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                          />
                          <div className="truncate flex-1">
                            <span className="font-bold text-slate-900 block truncate">{s.nama}</span>
                            <span className="text-[10px] text-slate-500 font-normal block truncate">
                              Kelas {s.kelas || '-'} • NISN: {s.nis}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsMajelisModalOpen(false)}
                  className="flex-1 py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black cursor-pointer shadow-lg transition-all"
                >
                  {editingMajelis ? 'Simpan Perubahan Majelis' : 'Buat Majelis Baru'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DETAIL MAJELIS HALAQAH & DAFTAR SANTRI */}
      {/* ========================================================================= */}
      {isMajelisDetailOpen && selectedMajelisDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-3xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setIsMajelisDetailOpen(false)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header Detail */}
            <div className="flex items-start gap-4 border-b border-slate-100 pb-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl shrink-0 ${
                selectedMajelisDetail.tingkat === "Mubtadi'in"
                  ? 'bg-blue-100 text-blue-800'
                  : selectedMajelisDetail.tingkat === 'Wustho'
                  ? 'bg-teal-100 text-teal-800'
                  : 'bg-amber-100 text-amber-900'
              }`}>
                {selectedMajelisDetail.tingkat === "Mubtadi'in" ? '🌱' : selectedMajelisDetail.tingkat === 'Wustho' ? '🌿' : '👑'}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white">
                    {selectedMajelisDetail.tingkat}
                  </span>
                  <span className="text-xs font-bold text-slate-500">
                    {selectedMajelisDetail.gender === 'Laki-laki' ? '👦 Majelis Putra' : '👧 Majelis Putri'}
                  </span>
                </div>
                <h3 className="font-serif font-black text-2xl text-slate-900">
                  {selectedMajelisDetail.namaMajelis}
                </h3>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span>Musyrif: <strong>{selectedMajelisDetail.musyrif}</strong></span>
                  <span>•</span>
                  <span>Lokasi: <strong>{selectedMajelisDetail.lokasi}</strong></span>
                </p>
                {(() => {
                  const matched = getGuruFromSATDAF(selectedMajelisDetail.musyrif);
                  if (matched) {
                    return (
                      <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1 text-emerald-950">
                        <div className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          Terdaftar Staf Guru / Pengasuh SATDAF
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-emerald-900 pt-0.5">
                          <div>NIP: <strong>{matched.nip}</strong></div>
                          <div>Peran: <strong>{matched.peran}</strong></div>
                          <div>Spesialisasi: <strong>{matched.spesialisasi || '-'}</strong></div>
                          <div>Kontak: <strong>{matched.noHp}</strong></div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>

            {/* Target & Schedule Banner */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Jadwal Halaqah:</span>
                <span className="font-bold text-slate-800">{selectedMajelisDetail.jadwal}</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Target Kurikulum:</span>
                <span className="font-bold text-emerald-800">{selectedMajelisDetail.targetSelesai}</span>
              </div>
            </div>

            {/* Member Santri List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  Daftar Santri Anggota ({selectedMajelisDetail.santriIds?.length || 0} Santri)
                </h4>

                <button
                  onClick={() => handleOpenEditMajelis(selectedMajelisDetail)}
                  className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Kelola Anggota
                </button>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                {selectedMajelisDetail.santriIds?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    Belum ada santri yang dimasukkan ke dalam majelis ini.
                  </div>
                ) : (
                  santriList
                    .filter(s => selectedMajelisDetail.santriIds?.includes(s.id))
                    .map((s, idx) => {
                      const setoranS = tahfidzSetoranList.filter(st => st.idSantri === s.id);
                      const totalXpS = setoranS.reduce((sum, st) => sum + (st.xpObtained || 0), 0);
                      const rankInfo = getRankInfoFromXP(totalXpS);

                      return (
                        <div key={s.id} className="p-3.5 bg-white hover:bg-slate-50 flex items-center justify-between gap-3 transition-colors">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-xs text-slate-900">{s.nama}</div>
                              <div className="text-[10px] text-slate-500">NISN: {s.nis} | Kelas: {s.kelas}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 font-mono text-[10px] font-black border border-amber-200 inline-block">
                                ⚡ {totalXpS} XP
                              </span>
                              <div className="text-[10px] font-bold text-slate-500">{rankInfo.rankTitle}</div>
                            </div>

                            <button
                              onClick={() => handleToggleSantriInMajelis(selectedMajelisDetail.id, s.id)}
                              title="Keluarkan dari Majelis"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsMajelisDetailOpen(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                Tutup Detail Majelis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESET CONFIRMATION MODAL (SECURED WITH PIN 2026) */}
      {/* ========================================================================= */}
      {isResetConfirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-rose-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-rose-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-slate-900 text-base">Reset XP Santri (Terkunci)</h3>
                  <p className="text-[11px] text-slate-500 font-semibold">Diperlukan Sandi Keamanan Otorisasi</p>
                </div>
              </div>
              <button 
                onClick={() => setIsResetConfirmModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 space-y-1.5">
              <p className="font-bold flex items-center gap-1.5 text-rose-800">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                Peringatan Tindakan Sensitif:
              </p>
              <p className="leading-relaxed text-[11.5px]">
                Fitur ini akan mengosongkan <strong>seluruh data setoran hafalan & penilaian XP santri</strong> kembali ke kondisi awal <strong>(0 XP / Fresh Start)</strong>.
              </p>
            </div>

            {/* PIN Form */}
            <form onSubmit={handleConfirmResetXP} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-rose-600" />
                  Masukkan Sandi PIN Otorisasi:
                </label>
                <div className="relative">
                  <input
                    type={showResetPin ? 'text' : 'password'}
                    value={resetPinInput}
                    onChange={(e) => {
                      setResetPinInput(e.target.value);
                      if (resetPinError) setResetPinError('');
                    }}
                    placeholder="Masukkan sandi..."
                    autoFocus
                    maxLength={10}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold tracking-wider focus:outline-none transition-all pr-10 ${
                      resetPinError 
                        ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/20 bg-rose-50/50' 
                        : 'border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPin(!showResetPin)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showResetPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {resetPinError && (
                  <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                    <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                    {resetPinError}
                  </p>
                )}
                
                <p className="text-[10px] text-slate-400 italic">
                  * Tombol ini dikunci dengan PIN untuk mencegah klik tidak sengaja.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsResetConfirmModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!resetPinInput.trim()}
                  className={`flex-1 py-2.5 font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${
                    resetPinInput.trim()
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Trash2 className="w-4 h-4" /> Konfirmasi Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
