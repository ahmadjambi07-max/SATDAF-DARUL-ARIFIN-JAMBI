import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ShieldAlert, 
  FileSpreadsheet, 
  Download, 
  X, 
  AlertTriangle, 
  Calendar, 
  User, 
  Check, 
  BookOpen,
  Filter,
  FileText,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import { PelanggaranSantri, Santri, PengasuhGuru, KategoriPelanggaran } from '../types';

interface DataPelanggaranProps {
  pelanggaran: PelanggaranSantri[];
  santri: Santri[];
  guru: PengasuhGuru[];
  onAddPelanggaran: (newPelanggaran: Omit<PelanggaranSantri, 'id'>) => void;
  onUpdatePelanggaran: (updated: PelanggaranSantri) => void;
  onDeletePelanggaran: (id: string) => void;
}

export default function DataPelanggaran({
  pelanggaran,
  santri,
  guru,
  onAddPelanggaran,
  onUpdatePelanggaran,
  onDeletePelanggaran
}: DataPelanggaranProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('All');
  const [filterKelas, setFilterKelas] = useState<string>('All');

  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<PelanggaranSantri | null>(null);

  // Form Inputs
  const [formIdSantri, setFormIdSantri] = useState('');
  const [formTanggal, setFormTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [formKategori, setFormKategori] = useState<KategoriPelanggaran>('Ringan');
  const [formJenis, setFormJenis] = useState('');
  const [formHukuman, setFormHukuman] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formPetugas, setFormPetugas] = useState('');

  // Auto-fill presets when user changes category
  const commonInfractions: Record<KategoriPelanggaran, string[]> = {
    Ringan: [
      'Terlambat mengikuti shalat jamaah subuh/fardhu',
      'Kamar tidur berantakan / tidak piket kamar',
      'Terlambat masuk kelas pengajian / madrasah',
      'Tidak memakai atribut lengkap (peci/kerudung/pakaian sopan)',
      'Membuang sampah sembarangan di lingkungan pondok'
    ],
    Sedang: [
      'Keluar komplek asrama tanpa membawa surat izin resmi',
      'Tidak mengikuti kegiatan pengajian rutin tanpa alasan syar\'i',
      'Membawa barang elektronik non-pendidikan (game console, dll)',
      'Tidur di kelas / masjid saat kegiatan KBM berlangsung',
      'Mengganggu ketenangan asrama saat jam istirahat'
    ],
    Berat: [
      'Membawa, menyimpan, atau menggunakan handphone (HP) tanpa izin',
      'Meninggalkan kompleks pesantren (kabur) tanpa izin pengasuh',
      'Melakukan perkelahian atau kekerasan fisik antar santri',
      'Merokok atau membawa rokok di lingkungan pesantren',
      'Merusak fasilitas pondok dengan sengaja'
    ]
  };

  const commonPunishments: Record<KategoriPelanggaran, string[]> = {
    Ringan: [
      'Membaca Al-Quran sebanyak 1 juz di serambi masjid',
      'Menghafal 10 kosa kata bahasa Arab baru',
      'Merapikan dan membersihkan area kamar serta lemari',
      'Membaca istighfar sebanyak 100 kali secara lisan',
      'Menulis kaligrafi / menyalin bait nadhom kitab'
    ],
    Sedang: [
      'Melakukan piket kebersihan halaman masjid / aula selama 3 hari',
      'Membantu menyajikan makanan di dapur umum asrama',
      'Menulis kalimat istighfar sebanyak 300 kali di buku catatan',
      'Penyitaan barang yang melanggar selama 1 bulan',
      'Setor hafalan juz amma dengan lancar di depan musyrif'
    ],
    Berat: [
      'Penyitaan handphone (HP) selama 1 semester & pemanggilan wali santri',
      'Skorsing / dipulangkan sementara selama 1-2 minggu',
      'Melakukan kerja sosial membersihkan seluruh area toilet asrama',
      'Surat Peringatan Resmi (SP) tertulis tembusan wali santri & yayasan',
      'Dicukur gundul (bagi santri putra) dan ta\'zir berdiri di halaman pondok'
    ]
  };

  const activeSantriList = santri.filter(s => s.status === 'Aktif');

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormIdSantri(activeSantriList[0]?.id || '');
    setFormTanggal(new Date().toISOString().split('T')[0]);
    setFormKategori('Ringan');
    setFormJenis(commonInfractions['Ringan'][0]);
    setFormHukuman(commonPunishments['Ringan'][0]);
    setFormCatatan('');
    setFormPetugas(guru[0]?.nama || 'Keamanan Pondok');
    setIsFormOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (record: PelanggaranSantri) => {
    setEditingRecord(record);
    setFormIdSantri(record.idSantri);
    setFormTanggal(record.tanggal);
    setFormKategori(record.kategori);
    setFormJenis(record.jenisPelanggaran);
    setFormHukuman(record.hukuman);
    setFormCatatan(record.catatan || '');
    setFormPetugas(record.petugas);
    setIsFormOpen(true);
  };

  // Handle Form Category change to update default presets
  const handleCategoryChange = (kat: KategoriPelanggaran) => {
    setFormKategori(kat);
    setFormJenis(commonInfractions[kat][0] || '');
    setFormHukuman(commonPunishments[kat][0] || '');
  };

  // Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedSantri = santri.find(s => s.id === formIdSantri);
    if (!selectedSantri) {
      alert('Silakan pilih santri terlebih dahulu.');
      return;
    }

    const payload = {
      idSantri: formIdSantri,
      namaSantri: selectedSantri.nama,
      kelasSantri: selectedSantri.kelas,
      tanggal: formTanggal,
      kategori: formKategori,
      jenisPelanggaran: formJenis,
      hukuman: formHukuman,
      catatan: formCatatan,
      petugas: formPetugas
    };

    if (editingRecord) {
      onUpdatePelanggaran({
        ...payload,
        id: editingRecord.id
      });
      alert('Data pelanggaran santri berhasil diperbarui!');
    } else {
      onAddPelanggaran(payload);
      alert('Pelanggaran santri baru berhasil dicatat!');
    }
    setIsFormOpen(false);
  };

  // Filter logic
  const filteredRecords = pelanggaran.filter(rec => {
    const sObj = santri.find(s => s.id === rec.idSantri);
    const searchMatch = 
      rec.namaSantri.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sObj?.nis || '').includes(searchTerm);

    const katMatch = filterKategori === 'All' || rec.kategori === filterKategori;
    const kelasMatch = filterKelas === 'All' || rec.kelasSantri === filterKelas;

    return searchMatch && katMatch && kelasMatch;
  });

  // Unique classes for filter
  const uniqueClasses = Array.from(new Set(santri.map(s => s.kelas))).filter(Boolean);

  // Total counts
  const countRingan = pelanggaran.filter(p => p.kategori === 'Ringan').length;
  const countSedang = pelanggaran.filter(p => p.kategori === 'Sedang').length;
  const countBerat = pelanggaran.filter(p => p.kategori === 'Berat').length;

  // Export to Excel
  const exportToExcel = () => {
    const headers = [
      {
        'No': '',
        'Tanggal': '',
        'NISN': '',
        'Nama Santri': '',
        'Kelas': '',
        'Kategori': '',
        'Jenis Pelanggaran': '',
        'Ta\'zir / Hukuman': '',
        'Catatan': '',
        'Petugas Pencatat': ''
      }
    ];

    const dataRows = filteredRecords.map((item, index) => {
      const sObj = santri.find(s => s.id === item.idSantri);
      return {
        'No': index + 1,
        'Tanggal': item.tanggal,
        'NISN': sObj?.nis || '-',
        'Nama Santri': item.namaSantri,
        'Kelas': item.kelasSantri,
        'Kategori': item.kategori,
        'Jenis Pelanggaran': item.jenisPelanggaran,
        'Ta\'zir / Hukuman': item.hukuman,
        'Catatan': item.catatan || '-',
        'Petugas Pencatat': item.petugas
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Pelanggaran');
    XLSX.writeFile(workbook, `Laporan_Pelanggaran_Darul_Arifin_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="space-y-6" id="pelanggaran-viewport">
      {/* Upper header action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="pelanggaran-header">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-100 text-red-800 rounded-xl">
              <ShieldAlert className="w-5 h-5 text-red-700 animate-pulse" />
            </div>
            <h1 className="font-serif text-xl md:text-2xl font-bold text-nature-forest tracking-tight">
              Data Pelanggaran Santri
            </h1>
          </div>
          <p className="text-xs text-slate-500">Pencatatan pelanggaran disiplin santri, klasifikasi kategori hukuman, dan pemberian ta'zir/sanksi edukatif</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={exportToExcel}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all active:scale-95 cursor-pointer"
            id="export-pelanggaran-excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" /> Ekspor Excel
          </button>
          <button 
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            id="add-pelanggaran-btn"
          >
            <Plus className="w-4 h-4 text-nature-gold" /> Catat Pelanggaran
          </button>
        </div>
      </div>

      {/* Category totals bento cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="pelanggaran-stats">
        {/* Ringan Card */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-2xs flex items-center justify-between group hover:border-amber-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-amber-800 tracking-wider uppercase block">Kategori Ringan</span>
            <span className="text-3xl font-serif font-black text-amber-700 block">{countRingan}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Pelanggaran disiplin ringan</span>
          </div>
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600 group-hover:scale-105 transition-all">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Sedang Card */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-2xs flex items-center justify-between group hover:border-orange-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-orange-800 tracking-wider uppercase block">Kategori Sedang</span>
            <span className="text-3xl font-serif font-black text-orange-700 block">{countSedang}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Pelanggaran disiplin sedang</span>
          </div>
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:scale-105 transition-all">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Berat Card */}
        <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-2xs flex items-center justify-between group hover:border-red-300 transition-all">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold text-red-800 tracking-wider uppercase block">Kategori Berat</span>
            <span className="text-3xl font-serif font-black text-red-700 block">{countBerat}</span>
            <span className="text-[9px] text-slate-400 block font-medium">Tindakan disiplin fatal</span>
          </div>
          <div className="p-3 bg-red-50 rounded-xl text-red-600 group-hover:scale-105 transition-all">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-xs flex flex-col sm:flex-row gap-3" id="pelanggaran-filters">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cari nama santri atau NISN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
          />
        </div>

        <div className="flex gap-2">
          {/* Filter Kategori */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Tingkat</option>
              <option value="Ringan">Ringan</option>
              <option value="Sedang">Sedang</option>
              <option value="Berat">Berat</option>
            </select>
          </div>

          {/* Filter Kelas */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="All">Semua Kelas</option>
              {uniqueClasses.map(kls => (
                <option key={kls} value={kls}>{kls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Records List / Table */}
      <div className="bg-white border border-nature-border rounded-2xl shadow-xs overflow-hidden" id="pelanggaran-list-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                <th className="py-3 px-4">Tanggal & Waktu</th>
                <th className="py-3 px-4">Santri & Kelas</th>
                <th className="py-3 px-4">Tingkat</th>
                <th className="py-3 px-4">Detail Pelanggaran</th>
                <th className="py-3 px-4">Sanksi Edukatif (Ta'zir)</th>
                <th className="py-3 px-4">Petugas</th>
                <th className="py-3 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-emerald-500 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Alhamdulillah, Tidak Ada Pelanggaran Ditemukan</p>
                        <p className="text-[10px] text-slate-400">Seluruh santri mematuhi tata tertib dengan baik.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const sObj = santri.find(s => s.id === item.idSantri);
                  
                  // Category badge style
                  let badgeClass = "bg-amber-50 text-amber-800 border-amber-200";
                  if (item.kategori === 'Sedang') {
                    badgeClass = "bg-orange-50 text-orange-800 border-orange-200";
                  } else if (item.kategori === 'Berat') {
                    badgeClass = "bg-red-50 text-red-800 border-red-200";
                  }

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-[10px] text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {item.tanggal}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-900 flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            {item.namaSantri}
                          </p>
                          <p className="text-[9px] font-semibold text-emerald-800 font-mono">
                            {sObj?.nis || '-'} • <span className="text-slate-500">{item.kelasSantri}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wide border uppercase ${badgeClass}`}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-medium text-slate-800 line-clamp-2" title={item.jenisPelanggaran}>
                          {item.jenisPelanggaran}
                        </p>
                        {item.catatan && (
                          <p className="text-[10px] text-slate-400 italic line-clamp-1 mt-0.5" title={item.catatan}>
                            Keterangan: {item.catatan}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-start gap-1 font-bold text-rose-800 bg-rose-50/50 border border-rose-100 p-1.5 rounded-lg text-[11px]">
                          <FileText className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2" title={item.hukuman}>{item.hukuman}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-500">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.petugas}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Catatan"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus catatan pelanggaran santri "${item.namaSantri}"?`)) {
                                onDeletePelanggaran(item.id);
                              }
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Catatan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-bold">
          <span>Sistem Pencatatan Pelanggaran Terpadu</span>
          <span>Total {filteredRecords.length} Catatan Aktif</span>
        </div>
      </div>

      {/* Add / Edit Form Modal Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white w-full max-w-lg rounded-2xl border border-nature-border shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 bg-gradient-to-r from-red-800 to-rose-950 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-nature-gold animate-pulse" />
                  <div>
                    <h3 className="font-serif font-extrabold text-sm tracking-wide">
                      {editingRecord ? 'Edit Catatan Pelanggaran' : 'Catat Pelanggaran Santri Baru'}
                    </h3>
                    <p className="text-[10px] text-slate-300">Harap verifikasi kebenaran laporan sebelum disimpan.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-white/15 rounded-lg text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* 1. Select Student */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Pilih Santri Pelanggar *</label>
                  <select
                    value={formIdSantri}
                    onChange={(e) => setFormIdSantri(e.target.value)}
                    required
                    disabled={!!editingRecord}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
                  >
                    {activeSantriList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.nama} ({s.kelas}) - NISN {s.nis}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Date and Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Tanggal Kejadian *</label>
                    <input 
                      type="date"
                      value={formTanggal}
                      onChange={(e) => setFormTanggal(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all font-mono"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Tingkat Pelanggaran *</label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['Ringan', 'Sedang', 'Berat'] as KategoriPelanggaran[]).map(kat => {
                        let activeColor = "bg-amber-600 text-white";
                        if (kat === 'Sedang') activeColor = "bg-orange-600 text-white";
                        if (kat === 'Berat') activeColor = "bg-red-600 text-white";

                        const isSelected = formKategori === kat;
                        return (
                          <button
                            type="button"
                            key={kat}
                            onClick={() => handleCategoryChange(kat)}
                            className={`py-1.5 rounded-lg text-[10px] font-extrabold text-center transition-all cursor-pointer border ${
                              isSelected 
                                ? activeColor + ' border-transparent' 
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                            }`}
                          >
                            {kat}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 3. Infraction Detail with presets */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Jenis Pelanggaran *</label>
                    <span className="text-[9px] text-red-700 font-extrabold uppercase">Saran Preset</span>
                  </div>
                  
                  {/* Presets badges */}
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {commonInfractions[formKategori].map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setFormJenis(preset);
                          // Suggest corresponding punishment if index exists
                          const correspondingHukuman = commonPunishments[formKategori][idx];
                          if (correspondingHukuman) setFormHukuman(correspondingHukuman);
                        }}
                        className="text-[9px] font-bold px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 line-clamp-1 text-left max-w-full cursor-pointer transition-colors"
                        title={preset}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Masukkan rincian pelanggaran..."
                    value={formJenis}
                    onChange={(e) => setFormJenis(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
                  />
                </div>

                {/* 4. Sanksi / Hukuman with presets */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Tindakan Sanksi / Ta'zir *</label>
                    <span className="text-[9px] text-rose-700 font-extrabold uppercase">Saran Ta'zir</span>
                  </div>

                  {/* Presets sanksi badges */}
                  <div className="flex flex-wrap gap-1.5 pb-2">
                    {commonPunishments[formKategori].map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setFormHukuman(preset)}
                        className="text-[9px] font-bold px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-md text-rose-800 line-clamp-1 text-left max-w-full cursor-pointer transition-colors"
                        title={preset}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Masukkan bentuk tindakan disiplin..."
                    value={formHukuman}
                    onChange={(e) => setFormHukuman(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
                  />
                </div>

                {/* 5. Catatan Tambahan */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Keterangan / Catatan Tambahan (Opsional)</label>
                  <input 
                    type="text"
                    placeholder="Masukkan keterangan tambahan jika ada..."
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
                  />
                </div>

                {/* 6. Petugas Pencatat */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">Pencatat / Penanggung Jawab *</label>
                  <select
                    value={formPetugas}
                    onChange={(e) => setFormPetugas(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-nature-forest/20 focus:border-nature-forest transition-all"
                  >
                    <option value="Keamanan Pondok">Keamanan Pondok</option>
                    {guru.map(g => (
                      <option key={g.id} value={g.nama}>
                        {g.nama} ({g.peran})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Check className="w-4 h-4 text-nature-gold" /> {editingRecord ? 'Perbarui Data' : 'Simpan Pelanggaran'}
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
