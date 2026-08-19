import React, { useState } from 'react';
import { 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  KeyRound, 
  Lock, 
  Eye, 
  EyeOff, 
  Users, 
  ShieldAlert, 
  CheckSquare, 
  Square, 
  Zap, 
  Sparkles, 
  Phone, 
  Briefcase,
  Layers,
  LayoutDashboard,
  Stethoscope,
  HeartHandshake,
  GraduationCap,
  Home,
  Trophy,
  Radio,
  Tv,
  FilePieChart,
  Sliders,
  AlertTriangle,
  BrainCircuit,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PenggunaApp, UserRoleType, Kamar } from '../types';
import { ALL_MENU_ITEMS, ALL_MENU_IDS } from '../data/mockPengguna';
import BatikBackground from './BatikBackground';

interface RolePenggunaProps {
  penggunaList: PenggunaApp[];
  onSavePengguna: (user: PenggunaApp) => void;
  onDeletePengguna: (id: string) => void;
  currentUsername: string;
  kamarList?: Kamar[];
}

export default function RolePengguna({
  penggunaList,
  onSavePengguna,
  onDeletePengguna,
  currentUsername,
  kamarList = []
}: RolePenggunaProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<PenggunaApp | null>(null);

  // Form States
  const [formData, setFormData] = useState<{
    id: string;
    username: string;
    password: string;
    namaLengkap: string;
    role: UserRoleType;
    status: 'Aktif' | 'Nonaktif';
    allowedMenus: string[];
    jabatan: string;
    noHp: string;
    assignedKamarIds?: string[];
  }>({
    id: '',
    username: '',
    password: '',
    namaLengkap: '',
    role: 'PENGASUHAN',
    status: 'Aktif',
    allowedMenus: ['dashboard', 'santri', 'kamar', 'pelanggaran'],
    jabatan: '',
    noHp: '',
    assignedKamarIds: []
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Stats
  const totalUser = penggunaList.length;
  const activeUser = penggunaList.filter(u => u.status === 'Aktif').length;
  const inactiveUser = penggunaList.filter(u => u.status === 'Nonaktif').length;
  const adminUser = penggunaList.filter(u => u.role === 'ADMIN').length;

  // Filtered List
  const filteredUsers = penggunaList.filter(u => {
    const matchSearch = 
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.jabatan && u.jabatan.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  // Open Modal for Create
  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      id: `usr-${Date.now()}`,
      username: '',
      password: '',
      namaLengkap: '',
      role: 'PENGASUHAN',
      status: 'Aktif',
      allowedMenus: ['dashboard', 'klinik', 'santri', 'kamar', 'pelanggaran'],
      jabatan: '',
      noHp: '',
      assignedKamarIds: []
    });
    setFormError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEdit = (user: PenggunaApp) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      username: user.username,
      password: user.password,
      namaLengkap: user.namaLengkap,
      role: user.role,
      status: user.status,
      allowedMenus: user.allowedMenus ? [...user.allowedMenus] : [],
      jabatan: user.jabatan || '',
      noHp: user.noHp || '',
      assignedKamarIds: user.assignedKamarIds ? [...user.assignedKamarIds] : []
    });
    setFormError(null);
    setShowPassword(false);
    setIsModalOpen(true);
  };

  // Presets
  const applyPreset = (presetType: 'ALL' | 'PENGASUHAN' | 'AKADEMIK' | 'GURU' | 'KLINIK' | 'ORANG_TUA' | 'CLEAR') => {
    if (presetType === 'ALL') {
      setFormData(prev => ({ ...prev, allowedMenus: [...ALL_MENU_IDS] }));
    } else if (presetType === 'PENGASUHAN') {
      setFormData(prev => ({
        ...prev,
        role: 'PENGASUHAN',
        allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'guru', 'kamar', 'pelanggaran', 'portal-orangtua', 'klinik', 'laporan']
      }));
    } else if (presetType === 'AKADEMIK') {
      setFormData(prev => ({
        ...prev,
        role: 'AKADEMIK',
        allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'guru', 'litbang-sdm', 'kamar', 'pelanggaran', 'prestasi', 'laporan', 'portal-orangtua', 'klinik']
      }));
    } else if (presetType === 'GURU') {
      setFormData(prev => ({
        ...prev,
        role: 'GURU',
        allowedMenus: ['dashboard', 'tahfidz-gamifikasi', 'mutabaah', 'santri', 'kamar']
      }));
    } else if (presetType === 'KLINIK') {
      setFormData(prev => ({
        ...prev,
        role: 'PETUGAS_KLINIK',
        allowedMenus: ['dashboard', 'klinik', 'santri', 'kamar']
      }));
    } else if (presetType === 'ORANG_TUA') {
      setFormData(prev => ({
        ...prev,
        role: 'ORANG_TUA',
        allowedMenus: ['dashboard', 'portal-orangtua', 'mutabaah', 'santri', 'klinik', 'prestasi', 'pelanggaran']
      }));
    } else {
      setFormData(prev => ({ ...prev, allowedMenus: [] }));
    }
  };

  // Toggle single menu item
  const toggleMenuPermission = (menuId: string) => {
    setFormData(prev => {
      const exists = prev.allowedMenus.includes(menuId);
      if (exists) {
        return {
          ...prev,
          allowedMenus: prev.allowedMenus.filter(id => id !== menuId)
        };
      } else {
        return {
          ...prev,
          allowedMenus: [...prev.allowedMenus, menuId]
        };
      }
    });
  };

  // Quick Toggle Status directly in Table
  const handleToggleStatus = (user: PenggunaApp) => {
    if (user.username === 'admin' && user.status === 'Aktif') {
      showToast('⚠️ Username "admin" utama tidak boleh dinonaktifkan.');
      return;
    }
    const newStatus = user.status === 'Aktif' ? 'Nonaktif' : 'Aktif';
    const updated: PenggunaApp = {
      ...user,
      status: newStatus
    };
    onSavePengguna(updated);
    showToast(`Status pengguna @${user.username} diubah menjadi ${newStatus}.`);
  };

  // Save Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanUsername = formData.username.trim().toLowerCase();

    if (!cleanUsername) {
      setFormError('Username wajib diisi.');
      return;
    }

    if (!formData.namaLengkap.trim()) {
      setFormError('Nama lengkap wajib diisi.');
      return;
    }

    if (!formData.password) {
      setFormError('Kata sandi tidak boleh kosong.');
      return;
    }

    if (formData.allowedMenus.length === 0) {
      setFormError('Pilih minimal 1 menu hak akses agar pengguna dapat membuka aplikasi.');
      return;
    }

    // Check duplicate username if create or if username changed
    const isDuplicate = penggunaList.some(u => 
      u.id !== formData.id && u.username.toLowerCase() === cleanUsername
    );

    if (isDuplicate) {
      setFormError(`Username "@${cleanUsername}" sudah digunakan oleh akun lain. Gunakan username berbeda.`);
      return;
    }

    const newUser: PenggunaApp = {
      id: formData.id,
      username: cleanUsername,
      password: formData.password,
      namaLengkap: formData.namaLengkap.trim(),
      role: formData.role,
      status: formData.status,
      allowedMenus: formData.allowedMenus,
      jabatan: formData.jabatan.trim() || undefined,
      noHp: formData.noHp.trim() || undefined,
      assignedKamarIds: formData.assignedKamarIds || [],
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString().split('T')[0],
      lastLogin: editingUser ? editingUser.lastLogin : '-'
    };

    onSavePengguna(newUser);
    setIsModalOpen(false);
    showToast(`Akun pengguna @${newUser.username} berhasil ${editingUser ? 'diperbarui' : 'ditambahkan'}.`);
  };

  // Handle Delete
  const handleDelete = (id: string, username: string) => {
    if (username === 'admin') {
      showToast('⛔ Username "admin" utama sistem tidak dapat dihapus.');
      setDeleteConfirmId(null);
      return;
    }
    onDeletePengguna(id);
    setDeleteConfirmId(null);
    showToast(`Akun @${username} berhasil dihapus dari sistem.`);
  };

  // Icon mapping for menu tags
  const getMenuIcon = (id: string) => {
    switch (id) {
      case 'dashboard': return LayoutDashboard;
      case 'tahfidz-gamifikasi': return Flame;
      case 'role-pengguna': return ShieldCheck;
      case 'klinik': return Stethoscope;
      case 'portal-orangtua': return HeartHandshake;
      case 'mutabaah': return Zap;
      case 'santri': return Users;
      case 'guru': return GraduationCap;
      case 'litbang-sdm': return BrainCircuit;
      case 'kamar': return Home;
      case 'pelanggaran': return ShieldAlert;
      case 'prestasi': return Trophy;
      case 'monitoring': return Radio;
      case 'monitoring-pimpinan': return Tv;
      case 'laporan': return FilePieChart;
      default: return Layers;
    }
  };

  return (
    <div className="space-y-6 pb-12" id="role-pengguna-container">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-nature-forest text-white px-4 py-3 rounded-xl shadow-xl border border-nature-gold/40 flex items-center gap-2.5 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-nature-gold shrink-0" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="relative bg-gradient-to-r from-nature-forest via-nature-forest-medium to-nature-dark-green rounded-3xl p-6 sm:p-8 text-white shadow-lg overflow-hidden border border-nature-gold/30">
        <BatikBackground opacity={0.12} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nature-gold/20 text-nature-gold border border-nature-gold/30 text-[11px] font-black uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Otorisasi & Keamanan Pengguna</span>
            </div>
            <h1 className="font-serif italic text-2xl sm:text-3xl font-black text-amber-50 tracking-wide">
              Manajemen Role & Hak Akses Pengguna
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              Atur kredensial akun login dan tentukan hak akses menu secara spesifik. <span className="font-semibold text-nature-gold">Pengguna yang tidak terdaftar di menu ini tidak dapat masuk ke sistem.</span>
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="self-start md:self-auto px-5 py-3 bg-nature-gold hover:bg-amber-400 text-nature-forest font-black text-xs rounded-2xl shadow-md hover:shadow-xl transition-all flex items-center gap-2.5 cursor-pointer shrink-0 border border-amber-300"
            id="btn-tambah-pengguna"
          >
            <UserPlus className="w-4 h-4" />
            <span>Buat Akun Pengguna Baru</span>
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Akun</p>
            <h3 className="text-xl font-black text-slate-800">{totalUser}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Akun Aktif</p>
            <h3 className="text-xl font-black text-emerald-700">{activeUser}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0 border border-rose-100">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nonaktif / Terkunci</p>
            <h3 className="text-xl font-black text-rose-600">{inactiveUser}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Administrator</p>
            <h3 className="text-xl font-black text-amber-700">{adminUser}</h3>
          </div>
        </div>
      </div>

      {/* Security Warning Notice */}
      <div className="p-4 bg-amber-50/80 border border-amber-200/90 rounded-2xl text-amber-900 text-xs flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-950">Aturan Keamanan Sistem SATDAF Darul Arifin:</p>
          <p className="text-[11px] leading-relaxed text-amber-800">
            Hanya username yang terdaftar dengan status <span className="font-extrabold text-emerald-800">"Aktif"</span> di menu ini yang diizinkan untuk login. Jika pengguna mencoba login dengan username yang belum terdaftar di sini, maka login secara otomatis ditolak.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari username, nama, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
            <Sliders className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-white font-medium"
          >
            <option value="ALL">Semua Peran</option>
            <option value="ADMIN">Admin</option>
            <option value="PENGASUHAN">Pengasuhan</option>
            <option value="AKADEMIK">Akademik</option>
            <option value="PETUGAS_KLINIK">Petugas Klinik</option>
            <option value="GURU">Guru</option>
            <option value="ORANG_TUA">Orang Tua / Wali Santri</option>
            <option value="LAINNYA">Lainnya</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-white font-medium"
          >
            <option value="ALL">Semua Status</option>
            <option value="Aktif">Status Aktif</option>
            <option value="Nonaktif">Status Nonaktif</option>
          </select>
        </div>
      </div>

      {/* User Accounts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-serif font-black text-slate-800 text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-nature-forest" />
            Daftar Akun Pengguna Terdaftar ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-100 font-extrabold text-[11px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="p-4">Kredensial Login</th>
                <th className="p-4">Nama Lengkap & Jabatan</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Akses Menu Terbuka</th>
                <th className="p-4 text-center">Status Akun</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 space-y-2">
                    <UserX className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="font-medium">Tidak ada akun pengguna yang cocok dengan kriteria pencarian.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const allowedCount = u.allowedMenus ? u.allowedMenus.length : 0;
                  const isSelf = u.username.toLowerCase() === currentUsername.toLowerCase();

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Kredensial */}
                      <td className="p-4 font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-nature-forest/10 text-nature-forest flex items-center justify-center font-serif font-black text-xs shrink-0">
                            @{u.username.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-nature-forest font-bold block">@{u.username}</span>
                            <span className="text-[10px] text-slate-400 font-mono font-normal">Sandi: ••••••••</span>
                          </div>
                        </div>
                      </td>

                      {/* Nama Lengkap & Jabatan */}
                      <td className="p-4">
                        <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                          {u.namaLengkap}
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-extrabold uppercase">
                              Anda
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          {u.jabatan && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{u.jabatan}</span>}
                          {u.noHp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{u.noHp}</span>}
                        </div>
                        {u.assignedKamarIds && u.assignedKamarIds.length > 0 && (
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                              <Home className="w-3 h-3 text-emerald-600" />
                              Wali Kamar ({u.assignedKamarIds.length}):{' '}
                              {u.assignedKamarIds.map(kId => kamarList.find(k => k.id === kId)?.namaKamar || kId).join(', ')}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Peran */}
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${
                          u.role === 'ADMIN' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          u.role === 'PENGASUHAN' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          u.role === 'AKADEMIK' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          u.role === 'PETUGAS_KLINIK' ? 'bg-teal-100 text-teal-800 border border-teal-200' :
                          u.role === 'ORANG_TUA' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          u.role === 'GURU' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                          'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          <ShieldCheck className="w-3 h-3" />
                          {u.role === 'ORANG_TUA' ? 'ORANG TUA' : u.role}
                        </span>
                      </td>

                      {/* Akses Menu */}
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-nature-forest" />
                            {allowedCount} Menu Diizinkan
                            {allowedCount === ALL_MENU_IDS.length && (
                              <span className="text-[9px] text-amber-600 font-black uppercase bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">Full Access</span>
                            )}
                          </span>

                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {u.allowedMenus && u.allowedMenus.slice(0, 4).map(mId => {
                              const menuObj = ALL_MENU_ITEMS.find(m => m.id === mId);
                              return (
                                <span key={mId} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[9.5px] rounded-md font-medium">
                                  {menuObj ? menuObj.label : mId}
                                </span>
                              );
                            })}
                            {allowedCount > 4 && (
                              <span className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9.5px] rounded-md font-bold">
                                +{allowedCount - 4} lainnya
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-all inline-flex items-center gap-1 cursor-pointer ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          }`}
                          title="Klik untuk mengubah status aktif/nonaktif"
                        >
                          {u.status === 'Aktif' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Aktif</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="p-1.5 text-slate-600 hover:text-nature-forest hover:bg-nature-forest/10 rounded-lg transition-colors cursor-pointer"
                            title="Edit Akun & Hak Akses Menu"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {deleteConfirmId === u.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                              <button
                                onClick={() => handleDelete(u.id, u.username)}
                                className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded hover:bg-rose-700 cursor-pointer"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-1.5 py-0.5 text-slate-500 font-bold text-[10px] hover:bg-slate-200 rounded cursor-pointer"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirmId(u.id)}
                              disabled={u.username === 'admin'}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Hapus Akun Pengguna"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
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

      {/* CREATE / EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl my-8 overflow-hidden relative"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-nature-forest to-nature-forest-medium text-white p-6 relative">
                <BatikBackground opacity={0.15} />
                <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-nature-gold block">
                      {editingUser ? 'Edit Kredensial & Akses' : 'Pendaftaran Akun Pengguna Baru'}
                    </span>
                    <h2 className="font-serif font-black text-xl text-amber-50">
                      {editingUser ? `Pengaturan Akun @${editingUser.username}` : 'Tambah Pengguna Sistem'}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {formError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5 font-medium">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Account Details Section */}
                <div className="space-y-4">
                  <h3 className="font-serif font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-nature-forest">
                    <ShieldCheck className="w-4 h-4" />
                    1. Kredensial & Informasi Akun Login
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Username */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Username <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: ustadz_ahmad"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        disabled={editingUser?.username === 'admin'}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50 disabled:bg-slate-100 font-mono font-bold"
                      />
                      <span className="text-[10px] text-slate-400 block">Digunakan untuk login ke sistem</span>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Kata Sandi (Password) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Masukkan kata sandi"
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Nama Lengkap */}
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Nama Lengkap / Penanggung Jawab <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Ust. Ahmad Fauzi, S.Pd.I"
                        value={formData.namaLengkap}
                        onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50 font-bold"
                      />
                    </div>

                    {/* Role */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Kategori Peran (Role)
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRoleType })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-white font-semibold"
                      >
                        <option value="ADMIN">ADMIN (Administrator)</option>
                        <option value="PENGASUHAN">PENGASUHAN (Pengasuh Asrama)</option>
                        <option value="AKADEMIK">AKADEMIK (Tim Kurikulum)</option>
                        <option value="PETUGAS_KLINIK">PETUGAS_KLINIK (Medis UKS)</option>
                        <option value="GURU">GURU (Pendidik / Pengajar)</option>
                        <option value="ORANG_TUA">ORANG_TUA (Orang Tua / Wali Santri)</option>
                        <option value="LAINNYA">LAINNYA</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Status Keaktifan Akun
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                        disabled={editingUser?.username === 'admin'}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-white font-semibold"
                      >
                        <option value="Aktif">Aktif (Dapat Login)</option>
                        <option value="Nonaktif">Nonaktif (Akses Diblokir)</option>
                      </select>
                    </div>

                    {/* Jabatan Optional */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        Jabatan / Unit Kerja (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kepala Asrama Al-Ghazali"
                        value={formData.jabatan}
                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50"
                      />
                    </div>

                    {/* No HP Optional */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-extrabold text-slate-600 block">
                        No. WhatsApp / HP (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 08123456789"
                        value={formData.noHp}
                        onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                        className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-nature-forest bg-slate-50/50"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Menu Access Permission Section */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-serif font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-nature-forest">
                        <Layers className="w-4 h-4" />
                        2. Hak Akses Menu Aplikasi ({formData.allowedMenus.length} / {ALL_MENU_ITEMS.length} Menu Terpilih)
                      </h3>
                      <p className="text-[11px] text-slate-400">Pilih menu apa saja yang boleh dibuka oleh akun ini saat masuk aplikasi.</p>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => applyPreset('ALL')}
                        className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Pilih Semua (Full)
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('PENGASUHAN')}
                        className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Preset Pengasuhan
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('AKADEMIK')}
                        className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Preset Akademik
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('GURU')}
                        className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Preset Musyrif/Guru
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('KLINIK')}
                        className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Preset Klinik
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('ORANG_TUA')}
                        className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Preset Orang Tua
                      </button>
                      <button
                        type="button"
                        onClick={() => applyPreset('CLEAR')}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        Kosongkan
                      </button>
                    </div>
                  </div>

                  {/* Menu Grid Checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 max-h-64 overflow-y-auto">
                    {ALL_MENU_ITEMS.map((menu) => {
                      const isChecked = formData.allowedMenus.includes(menu.id);
                      const MenuIcon = getMenuIcon(menu.id);
                      const isMutabaah = menu.id === 'mutabaah';

                      return (
                        <div
                          key={menu.id}
                          onClick={() => toggleMenuPermission(menu.id)}
                          className={`p-2.5 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer select-none ${
                            isChecked
                              ? isMutabaah
                                ? 'bg-amber-50/70 border-nature-gold/60 shadow-xs ring-1 ring-nature-gold/30'
                                : 'bg-white border-nature-forest/40 shadow-xs ring-1 ring-nature-forest/20'
                              : 'bg-white/60 border-slate-200 hover:bg-white text-slate-400'
                          }`}
                        >
                          <div className={`mt-0.5 shrink-0 ${
                            isChecked 
                              ? isMutabaah ? 'text-amber-600' : 'text-nature-forest' 
                              : 'text-slate-300'
                          }`}>
                            {isChecked ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5 flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <MenuIcon className={`w-3.5 h-3.5 shrink-0 ${
                                isChecked 
                                  ? isMutabaah ? 'text-amber-600' : 'text-nature-forest' 
                                  : 'text-slate-400'
                              }`} />
                              <span className={`font-bold text-xs truncate ${isChecked ? 'text-slate-800' : 'text-slate-500'}`}>
                                {menu.label}
                              </span>
                              {isMutabaah && (
                                <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded text-[8.5px] font-black uppercase tracking-wider">
                                  Amalan
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 leading-snug line-clamp-1">{menu.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* Section 3: Room Assignment for Wali Kamar */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-serif font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 text-nature-forest">
                      <Home className="w-4 h-4 text-emerald-600" />
                      3. Penugasan Kamar Binaan / Wali Kamar ({formData.assignedKamarIds?.length || 0} Kamar Ditautkan)
                    </h3>
                    <p className="text-[11px] text-slate-400">Tautkan akun ini ke kamar tertentu agar otomatis mengunci akses mutabaah & absensi santri khusus kamar binaannya.</p>
                  </div>

                  {kamarList.length === 0 ? (
                    <div className="p-3 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                      Belum ada data kamar terdaftar di Master Data Kamar.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/80">
                      {kamarList.map((kmr) => {
                        const isAssigned = (formData.assignedKamarIds || []).includes(kmr.id);

                        return (
                          <div
                            key={kmr.id}
                            onClick={() => {
                              const current = formData.assignedKamarIds || [];
                              const next = current.includes(kmr.id)
                                ? current.filter(id => id !== kmr.id)
                                : [...current, kmr.id];
                              setFormData({ ...formData, assignedKamarIds: next });
                            }}
                            className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer select-none ${
                              isAssigned
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                                : 'bg-white border-slate-200 hover:border-emerald-300 text-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <p className={`font-black text-xs truncate ${isAssigned ? 'text-amber-300' : 'text-slate-800'}`}>
                                {kmr.namaKamar}
                              </p>
                              <p className={`text-[10px] truncate ${isAssigned ? 'text-emerald-100' : 'text-slate-400'}`}>
                                {kmr.gedung}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {isAssigned ? (
                                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-300" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-nature-gold" />
                    <span>{editingUser ? 'Simpan Perubahan' : 'Daftarkan Akun'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
