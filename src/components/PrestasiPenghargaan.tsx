import React, { useState, useRef } from 'react';
import { 
  Santri, 
  PengasuhGuru, 
  Prestasi, 
  KategoriPrestasi 
} from '../types';
import { 
  Trophy, 
  Award, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit2, 
  Upload, 
  X, 
  Calendar, 
  User, 
  Sparkles, 
  GraduationCap, 
  Users, 
  FileImage, 
  AlertCircle, 
  Bookmark,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PrestasiPenghargaanProps {
  prestasi: Prestasi[];
  santri: Santri[];
  guru: PengasuhGuru[];
  onAddPrestasi: (newPrestasi: Omit<Prestasi, 'id'>) => void;
  onUpdatePrestasi: (updated: Prestasi) => void;
  onDeletePrestasi: (id: string) => void;
}

export default function PrestasiPenghargaan({
  prestasi,
  santri,
  guru,
  onAddPrestasi,
  onUpdatePrestasi,
  onDeletePrestasi
}: PrestasiPenghargaanProps) {
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKategori, setFilterKategori] = useState<string>('Semua');
  const [filterPenerima, setFilterPenerima] = useState<string>('Semua');

  // Form Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrestasi, setEditingPrestasi] = useState<Prestasi | null>(null);

  // Detail Modal states
  const [selectedPrestasi, setSelectedPrestasi] = useState<Prestasi | null>(null);

  // Form states
  const [penerimaTipe, setPenerimaTipe] = useState<'Santri' | 'Guru'>('Santri');
  const [penerimaId, setPenerimaId] = useState('');
  const [judul, setJudul] = useState('');
  const [kategori, setKategori] = useState<KategoriPrestasi>('Akademik');
  const [tanggal, setTanggal] = useState('');
  const [penyelenggara, setPenyelenggara] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: KategoriPrestasi[] = ['Akademik', 'Non-Akademik', 'Keagamaan', 'Pengabdian', 'Lainnya'];

  // Handle opening form for adding
  const handleOpenAdd = () => {
    setEditingPrestasi(null);
    setPenerimaTipe('Santri');
    setPenerimaId(santri[0]?.id || '');
    setJudul('');
    setKategori('Akademik');
    setTanggal(new Date().toISOString().split('T')[0]);
    setPenyelenggara('');
    setDeskripsi('');
    setFotoUrl('');
    setIsFormOpen(true);
  };

  // Handle opening form for editing
  const handleOpenEdit = (item: Prestasi, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPrestasi(item);
    setPenerimaTipe(item.penerimaTipe);
    setPenerimaId(item.penerimaId);
    setJudul(item.judul);
    setKategori(item.kategori);
    setTanggal(item.tanggal);
    setPenyelenggara(item.penyelenggara);
    setDeskripsi(item.deskripsi);
    setFotoUrl(item.fotoUrl || '');
    setIsFormOpen(true);
  };

  // Process file upload to Base64
  const processFile = (file: File) => {
    if (file.size > 800 * 1024) { // Limit to 800KB for Firestore documents safety
      alert('Ukuran berkas melebihi batas 800 KB! Silakan pilih foto dengan ukuran lebih kecil.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Find the recipient name based on selected ID
    let finalNama = '';
    if (penerimaTipe === 'Santri') {
      const found = santri.find(s => s.id === penerimaId);
      finalNama = found ? found.nama : 'Santri';
    } else {
      const found = guru.find(g => g.id === penerimaId);
      finalNama = found ? found.nama : 'Guru/Staf';
    }

    if (!penerimaId) {
      alert('Silakan pilih penerima penghargaan!');
      return;
    }

    const payload = {
      penerimaTipe,
      penerimaId,
      penerimaNama: finalNama,
      judul,
      kategori,
      tanggal,
      penyelenggara,
      deskripsi,
      fotoUrl: fotoUrl || undefined
    };

    if (editingPrestasi) {
      onUpdatePrestasi({
        ...payload,
        id: editingPrestasi.id
      });
    } else {
      onAddPrestasi(payload);
    }

    setIsFormOpen(false);
  };

  // Delete handler
  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Apakah Anda yakin ingin menghapus arsip prestasi/penghargaan ini?')) {
      onDeletePrestasi(id);
    }
  };

  // Filtered List
  const filteredList = prestasi.filter(item => {
    const matchSearch = 
      item.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penerimaNama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.penyelenggara.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase());

    const matchKategori = filterKategori === 'Semua' || item.kategori === filterKategori;
    const matchPenerima = 
      filterPenerima === 'Semua' || 
      (filterPenerima === 'Santri Only' && item.penerimaTipe === 'Santri') ||
      (filterPenerima === 'Guru Only' && item.penerimaTipe === 'Guru');

    return matchSearch && matchKategori && matchPenerima;
  });

  return (
    <div className="space-y-6" id="prestasi-view-container">
      {/* Header and Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="prestasi-header-section">
        <div>
          <h1 className="text-xl font-serif font-black text-nature-forest flex items-center gap-2 tracking-tight">
            <Trophy className="w-6 h-6 text-nature-gold" />
            Prestasi & Penghargaan
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Arsip digital dokumentasi prestasi santri, asatidzah, dan staf pondok pesantren.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="bg-nature-forest hover:bg-nature-forest-medium text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
          id="btn-add-prestasi"
        >
          <Plus className="w-4 h-4 text-nature-gold" />
          Tambah Penghargaan
        </button>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="prestasi-quick-stats">
        <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Penghargaan</p>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-0.5">{prestasi.length}</h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Prestasi Santri</p>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-0.5">
              {prestasi.filter(p => p.penerimaTipe === 'Santri').length}
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-3xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Penghargaan Guru</p>
            <h3 className="text-xl font-black text-slate-800 font-mono mt-0.5">
              {prestasi.filter(p => p.penerimaTipe === 'Guru').length}
            </h3>
          </div>
        </div>
      </div>

      {/* Search and Filters panel */}
      <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-nature-border shadow-3xs flex flex-col md:flex-row gap-4" id="prestasi-filters-panel">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari prestasi, penerima, atau penyelenggara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white pl-10 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium"
            id="search-prestasi-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Filter Penerima */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterPenerima}
              onChange={(e) => setFilterPenerima(e.target.value)}
              className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer"
              id="filter-penerima-select"
            >
              <option value="Semua">Semua Penerima</option>
              <option value="Santri Only">Khusus Santri</option>
              <option value="Guru Only">Khusus Guru/Staf</option>
            </select>
          </div>

          {/* Filter Kategori */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
            <Filter className="w-3 h-3 text-slate-400" />
            <select
              value={filterKategori}
              onChange={(e) => setFilterKategori(e.target.value)}
              className="bg-transparent text-xs text-slate-600 font-bold focus:outline-none cursor-pointer"
              id="filter-kategori-select"
            >
              <option value="Semua">Semua Kategori</option>
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid List of Prestasi */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="prestasi-cards-grid">
          {filteredList.map((item) => (
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={item.id}
              onClick={() => setSelectedPrestasi(item)}
              className="bg-white rounded-2xl border border-nature-border hover:border-nature-gold/40 shadow-3xs hover:shadow-md transition-all overflow-hidden flex flex-col cursor-pointer group relative"
              id={`prestasi-card-${item.id}`}
            >
              {/* Badge Kategori */}
              <div className="absolute top-3 left-3 z-10">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider shadow-3xs ${
                  item.kategori === 'Akademik' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                  item.kategori === 'Non-Akademik' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                  item.kategori === 'Keagamaan' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                  item.kategori === 'Pengabdian' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                  'bg-slate-50 text-slate-700 border-slate-100'
                }`}>
                  {item.kategori}
                </span>
              </div>

              {/* Photo / Poster documentation */}
              <div className="h-44 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-nature-border">
                {item.fotoUrl ? (
                  <img 
                    src={item.fotoUrl} 
                    alt={item.judul}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-350 p-4 space-y-2 text-center">
                    <FileImage className="w-12 h-12 stroke-[1.2] text-slate-300" />
                    <span className="text-[10px] font-medium tracking-wide">Belum Ada Foto Dokumentasi</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                
                {/* Overlay details */}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-nature-gold tracking-wide">
                    <Calendar className="w-3 h-3 shrink-0" /> {item.tanggal}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif font-black text-slate-800 text-sm leading-tight tracking-tight group-hover:text-nature-forest transition-colors">
                    {item.judul}
                  </h3>
                  
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-50">
                    <div className={`p-1.5 rounded-lg shrink-0 ${item.penerimaTipe === 'Santri' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {item.penerimaTipe === 'Santri' ? <Users className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block font-bold uppercase leading-none">{item.penerimaTipe}</span>
                      <span className="text-xs text-slate-700 font-extrabold leading-tight block mt-0.5">{item.penerimaNama}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 pt-1">
                    {item.deskripsi}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-medium italic">
                    Oleh: {item.penyelenggara}
                  </span>

                  <div className="flex gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(item, e)}
                      className="p-1.5 hover:bg-slate-50 text-slate-500 hover:text-nature-forest rounded-lg transition-all cursor-pointer border border-transparent hover:border-slate-100"
                      title="Edit data"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      className="p-1.5 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-100"
                      title="Hapus data"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-nature-border p-12 text-center space-y-3 shadow-3xs" id="prestasi-empty-state">
          <Award className="w-12 h-12 text-slate-300 mx-auto stroke-[1.2]" />
          <h3 className="font-serif font-black text-slate-700 text-sm">Tidak ada data prestasi</h3>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto leading-normal">
            Gunakan tombol "Tambah Penghargaan" di atas untuk mencatat prestasi pertama santri atau ustadz/ustadzah.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedPrestasi && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50" id="prestasi-detail-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col"
              id="prestasi-detail-content"
            >
              {/* Header */}
              <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full border tracking-wider ${
                    selectedPrestasi.kategori === 'Akademik' ? 'bg-sky-50 text-sky-700 border-sky-100' :
                    selectedPrestasi.kategori === 'Non-Akademik' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    selectedPrestasi.kategori === 'Keagamaan' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    selectedPrestasi.kategori === 'Pengabdian' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    'bg-slate-50 text-slate-700 border-slate-100'
                  }`}>
                    Kategori {selectedPrestasi.kategori}
                  </span>
                  <h3 className="font-serif font-black text-slate-800 text-base leading-snug mt-2">
                    {selectedPrestasi.judul}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedPrestasi(null)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content body */}
              <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
                {/* Photo / Archive */}
                {selectedPrestasi.fotoUrl ? (
                  <div className="rounded-2xl overflow-hidden border border-slate-150 shadow-3xs max-h-64 bg-slate-50 flex justify-center">
                    <img 
                      src={selectedPrestasi.fotoUrl} 
                      alt={selectedPrestasi.judul}
                      className="w-full object-contain max-h-64"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-200 p-8 flex flex-col items-center justify-center text-slate-400 bg-slate-50 text-center space-y-2">
                    <FileImage className="w-10 h-10 stroke-[1.2]" />
                    <span className="text-[11px] font-semibold">Arsip foto dokumentasi belum diunggah</span>
                  </div>
                )}

                {/* Recipient Details */}
                <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-nature-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedPrestasi.penerimaTipe === 'Santri' ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {selectedPrestasi.penerimaTipe === 'Santri' ? <Users className="w-5 h-5" /> : <GraduationCap className="w-5 h-5" />}
                    </div>
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block">{selectedPrestasi.penerimaTipe} Penerima</span>
                      <span className="text-xs font-extrabold text-slate-800 block mt-0.5">{selectedPrestasi.penerimaNama}</span>
                    </div>
                  </div>
                </div>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Tanggal Perolehan</span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Calendar className="w-4 h-4 text-slate-400" /> {selectedPrestasi.tanggal}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Penyelenggara / Instansi</span>
                    <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                      <Bookmark className="w-4 h-4 text-slate-400" /> {selectedPrestasi.penyelenggara}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-bold uppercase text-slate-400 block tracking-wider">Deskripsi Lengkap</span>
                  <p className="text-xs text-slate-600 leading-relaxed font-normal bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap">
                    {selectedPrestasi.deskripsi}
                  </p>
                </div>
              </div>

              {/* Footer action */}
              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
                <button
                  onClick={() => setSelectedPrestasi(null)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="prestasi-form-backdrop">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-lg w-full my-8 overflow-hidden flex flex-col"
              id="prestasi-form-content"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-[#FAF9F6]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-nature-forest/10 text-nature-forest flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-nature-gold" />
                  </div>
                  <h3 className="font-serif font-black text-slate-800 text-sm">
                    {editingPrestasi ? 'Edit Arsip Penghargaan' : 'Tambah Arsip Penghargaan Baru'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Input fields */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 flex-1 overflow-y-auto">
                {/* 1. Tipe Penerima Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Penerima Penghargaan</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setPenerimaTipe('Santri');
                        setPenerimaId(santri[0]?.id || '');
                      }}
                      className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        penerimaTipe === 'Santri' 
                          ? 'bg-white text-nature-forest shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Users className="w-3.5 h-3.5" /> Santri
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPenerimaTipe('Guru');
                        setPenerimaId(guru[0]?.id || '');
                      }}
                      className={`py-2 text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        penerimaTipe === 'Guru' 
                          ? 'bg-white text-nature-forest shadow-xs' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" /> Guru & Staf
                    </button>
                  </div>
                </div>

                {/* 2. Recipient list Dropdown select */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Pilih Nama {penerimaTipe === 'Santri' ? 'Santri' : 'Asatidzah / Staf'}
                  </label>
                  <select
                    value={penerimaId}
                    onChange={(e) => setPenerimaId(e.target.value)}
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium bg-white"
                    id="form-penerima-select"
                    required
                  >
                    <option value="" disabled>-- Pilih {penerimaTipe === 'Santri' ? 'Santri' : 'Guru'} --</option>
                    {penerimaTipe === 'Santri' ? (
                      santri.map(s => (
                        <option key={s.id} value={s.id}>{s.nama} (NISN: {s.nis}) - Kelas {s.kelas}</option>
                      ))
                    ) : (
                      guru.map(g => (
                        <option key={g.id} value={g.id}>{g.nama} ({g.nip}) - {g.peran}</option>
                      ))
                    )}
                  </select>
                </div>

                {/* 3. Judul / MQK */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Judul Penghargaan / Nama Prestasi</label>
                  <input
                    type="text"
                    required
                    value={judul}
                    onChange={(e) => setJudul(e.target.value)}
                    placeholder="Contoh: Juara 1 MQK Tingkat Kabupaten, Guru Teladan Tahfidz 2026"
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium"
                    id="form-judul-input"
                  />
                </div>

                {/* 4. Kategori & Tanggal */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Kategori</label>
                    <select
                      value={kategori}
                      onChange={(e) => setKategori(e.target.value as KategoriPrestasi)}
                      className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium bg-white"
                      id="form-kategori-select"
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Tanggal Perolehan</label>
                    <input
                      type="date"
                      required
                      value={tanggal}
                      onChange={(e) => setTanggal(e.target.value)}
                      className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium"
                      id="form-tanggal-input"
                    />
                  </div>
                </div>

                {/* 5. Penyelenggara */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Instansi Penyelenggara</label>
                  <input
                    type="text"
                    required
                    value={penyelenggara}
                    onChange={(e) => setPenyelenggara(e.target.value)}
                    placeholder="Contoh: Kementerian Agama Kantor Wilayah, Yayasan Darul Arifin"
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium"
                    id="form-penyelenggara-input"
                  />
                </div>

                {/* 6. Deskripsi */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Deskripsi Detail</label>
                  <textarea
                    required
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    placeholder="Jelaskan mengenai detail penghargaan, kompetisi, atau kriteria bimbingan..."
                    rows={3}
                    className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-forest focus:border-nature-forest text-slate-700 font-medium resize-none"
                    id="form-deskripsi-textarea"
                  />
                </div>

                {/* 7. Image Upload Box (Drag and Drop + Click) */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center justify-between">
                    <span>Foto Dokumentasi / Arsip</span>
                    {fotoUrl && (
                      <button
                        type="button"
                        onClick={() => setFotoUrl('')}
                        className="text-rose-600 hover:text-rose-700 font-extrabold hover:underline transition-all cursor-pointer text-[9px] uppercase tracking-wider flex items-center gap-0.5"
                      >
                        <X className="w-3 h-3" /> Hapus Foto
                      </button>
                    )}
                  </label>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {fotoUrl ? (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden relative group max-h-48 bg-slate-50 flex items-center justify-center">
                      <img 
                        src={fotoUrl} 
                        alt="Pratinjau Unggahan"
                        className="w-full object-contain max-h-48 p-2"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/95 text-slate-800 px-3.5 py-1.5 text-[10px] font-bold rounded-lg shadow-sm hover:bg-white transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Upload className="w-3 h-3 text-slate-500" /> Ubah Foto
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-1.5 ${
                        isDragging 
                          ? 'border-nature-forest bg-nature-forest/5' 
                          : 'border-slate-200 hover:border-nature-forest/55 hover:bg-slate-50/50'
                      }`}
                      id="photo-upload-dragzone"
                    >
                      <Upload className={`w-8 h-8 ${isDragging ? 'text-nature-forest animate-bounce' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-xs font-bold text-slate-600 block">Tarik & Lepas Foto di Sini</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Atau klik untuk menelusuri berkas komputer</span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100 mt-2 font-semibold">
                        <Info className="w-3 h-3" /> Maksimal ukuran foto 800 KB
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold rounded-xl text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {editingPrestasi ? 'Simpan Perubahan' : 'Simpan Arsip'}
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
