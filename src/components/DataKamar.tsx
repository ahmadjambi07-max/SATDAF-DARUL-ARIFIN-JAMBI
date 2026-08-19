import React, { useState } from 'react';
import { Kamar, Santri, InventarisKamar, AbsensiSantriKamar, PengasuhGuru } from '../types';
import { 
  Home, 
  Plus, 
  Users, 
  ClipboardList, 
  Boxes, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  AlertCircle,
  TrendingUp,
  Sliders,
  Bed,
  CheckCircle2,
  HelpCircle,
  Save,
  Calendar,
  FileDown,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DataKamarProps {
  kamar: Kamar[];
  santri: Santri[];
  guru: PengasuhGuru[];
  onAddKamar: (newKamar: Omit<Kamar, 'id' | 'absensiHariIni'>) => void;
  onUpdateKamar: (updatedKamar: Kamar) => void;
  onDeleteKamar: (id: string) => void;
  onUpdateKamarAttendance?: (idKamar: string, absensi: AbsensiSantriKamar[]) => void;
}

export default function DataKamar({
  kamar,
  santri,
  guru,
  onAddKamar,
  onUpdateKamar,
  onDeleteKamar,
  onUpdateKamarAttendance
}: DataKamarProps) {
  // Navigation tabs inside Room Section
  const [activeTab, setActiveTab] = useState<'peta' | 'inventaris'>('peta');
  
  // Selected Room for details, attendance, or inventory management
  const [selectedRoomId, setSelectedRoomId] = useState<string>(kamar.length > 0 ? kamar[0].id : '');

  // Modal states
  const [isRoomFormOpen, setIsRoomFormOpen] = useState(false);
  const [editingKamar, setEditingKamar] = useState<Kamar | null>(null);

  // Room Form inputs
  const [roomNama, setRoomNama] = useState('');
  const [roomGedung, setRoomGedung] = useState<'Asrama Putra (Pa)' | 'Asrama Putri (Pi)'>('Asrama Putra (Pa)');
  const [roomKapasitas, setRoomKapasitas] = useState(8);
  const [roomWaliKamar, setRoomWaliKamar] = useState('');

  // Inventory Sub-Form inputs
  const [itemNama, setItemNama] = useState('');
  const [itemJumlah, setItemJumlah] = useState(1);
  const [itemKondisi, setItemKondisi] = useState<'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Baik');

  // Filter and Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'semua' | 'putra' | 'putri'>('semua');
  const [capacityFilter, setCapacityFilter] = useState<'semua' | 'tersedia' | 'penuh'>('semua');

  // Filtered rooms based on search query, gender selection, and capacity status
  const filteredKamar = React.useMemo(() => {
    return kamar.filter(k => {
      // 1. Gender Filter
      if (genderFilter === 'putra' && !k.gedung.includes('Putra')) {
        return false;
      }
      if (genderFilter === 'putri' && !k.gedung.includes('Putri')) {
        return false;
      }

      // 2. Capacity Status Filter
      const occupants = santri.filter(s => s.idKamar === k.id && s.status === 'Aktif');
      if (capacityFilter === 'tersedia' && occupants.length >= k.kapasitas) {
        return false;
      }
      if (capacityFilter === 'penuh' && occupants.length < k.kapasitas) {
        return false;
      }

      // 3. Search Query Filter (nama kamar, gedung, wali kamar, nama/NIS santri penghuni)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNamaKamar = k.namaKamar.toLowerCase().includes(query);
        const matchGedung = k.gedung.toLowerCase().includes(query);
        const matchWali = k.waliKamar ? k.waliKamar.toLowerCase().includes(query) : false;
        
        // Search matching santri inside this room
        const matchSantri = occupants.some(s => 
          s.nama.toLowerCase().includes(query) || 
          s.nis.toLowerCase().includes(query)
        );

        return matchNamaKamar || matchGedung || matchWali || matchSantri;
      }

      return true;
    });
  }, [kamar, santri, genderFilter, capacityFilter, searchQuery]);

  // Get selected room model
  const activeRoom = kamar.find(k => k.id === selectedRoomId) || filteredKamar[0];

  // Auto-select first room in filtered list if active room is filtered out
  React.useEffect(() => {
    if (filteredKamar.length > 0) {
      const isStillVisible = filteredKamar.some(k => k.id === selectedRoomId);
      if (!isStillVisible) {
        setSelectedRoomId(filteredKamar[0].id);
      }
    } else {
      setSelectedRoomId('');
    }
  }, [genderFilter, filteredKamar, selectedRoomId]);

  // Open Add Room Dialog
  const openAddRoomDialog = () => {
    setEditingKamar(null);
    setRoomNama('');
    setRoomGedung('Asrama Putra (Pa)');
    setRoomKapasitas(8);
    setRoomWaliKamar('');
    setIsRoomFormOpen(true);
  };

  // Open Edit Room Dialog
  const openEditRoomDialog = (k: Kamar) => {
    setEditingKamar(k);
    setRoomNama(k.namaKamar);
    setRoomGedung(k.gedung);
    setRoomKapasitas(k.kapasitas);
    setRoomWaliKamar(k.waliKamar || '');
    setIsRoomFormOpen(true);
  };

  // Submit Room
  const handleRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNama.trim()) {
      alert('Nama kamar asrama wajib diisi');
      return;
    }

    if (editingKamar) {
      onUpdateKamar({
        ...editingKamar,
        namaKamar: roomNama,
        gedung: roomGedung,
        kapasitas: Number(roomKapasitas),
        waliKamar: roomWaliKamar || undefined
      });
    } else {
      onAddKamar({
        namaKamar: roomNama,
        gedung: roomGedung,
        kapasitas: Number(roomKapasitas),
        inventaris: [],
        waliKamar: roomWaliKamar || undefined
      });
    }

    setIsRoomFormOpen(false);
  };

  // Add Item to active room inventory
  const handleAddInventory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemNama.trim()) return;

    const newItem: InventarisKamar = {
      id: `i-temp-${Date.now()}`,
      namaBarang: itemNama,
      jumlah: Number(itemJumlah),
      kondisi: itemKondisi
    };

    const updatedInventaris = [...activeRoom.inventaris, newItem];
    onUpdateKamar({
      ...activeRoom,
      inventaris: updatedInventaris
    });

    setItemNama('');
    setItemJumlah(1);
    setItemKondisi('Baik');
  };

  // Remove Item from room inventory
  const handleRemoveInventory = (itemId: string) => {
    const updatedInventaris = activeRoom.inventaris.filter(i => i.id !== itemId);
    onUpdateKamar({
      ...activeRoom,
      inventaris: updatedInventaris
    });
  };

  // Update Item condition in inventory
  const handleUpdateItemCondition = (itemId: string, cond: 'Baik' | 'Rusak Ringan' | 'Rusak Berat') => {
    const updatedInventaris = activeRoom.inventaris.map(item => {
      if (item.id === itemId) {
        return { ...item, kondisi: cond };
      }
      return item;
    });
    onUpdateKamar({
      ...activeRoom,
      inventaris: updatedInventaris
    });
  };

  return (
    <div className="space-y-6" id="kamar-container">
      {/* Top Banner and Summary Card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-nature-border shadow-xs" id="kamar-header-card">
        <div>
          <h1 className="text-xl font-serif font-bold text-nature-forest flex items-center gap-2">
            <Home className="w-6 h-6 text-nature-sage" /> Pengelolaan Kamar Asrama
          </h1>
          <p className="text-xs text-slate-500">
            Mapping bed hunian santri real-time dan checklist inventaris fasilitas asrama
          </p>
        </div>

        <button 
          onClick={openAddRoomDialog}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
          id="add-kamar-btn"
        >
          <Plus className="w-4 h-4 text-nature-gold" /> Tambah Kamar Baru
        </button>
      </div>

      {/* Internal Navigation Tabs */}
      <div className="flex border-b border-nature-border bg-white px-4 rounded-2xl border shadow-2xs gap-6" id="kamar-tabs">
        <button 
          onClick={() => setActiveTab('peta')}
          className={`py-4 text-xs font-bold tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'peta' ? 'border-nature-forest text-nature-forest font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="kamar-tab-peta"
        >
          <Bed className="w-4 h-4 text-nature-sage" /> 1. Pemetaan Kapasitas Bed
        </button>
        <button 
          onClick={() => setActiveTab('inventaris')}
          className={`py-4 text-xs font-bold tracking-wide uppercase border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'inventaris' ? 'border-nature-forest text-nature-forest font-extrabold' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
          id="kamar-tab-inventaris"
        >
          <Boxes className="w-4 h-4 text-nature-sage" /> 2. Inventaris & Fasilitas
        </button>
      </div>

      {/* Filter Pencarian & Filter Status Kamar (Asrama) */}
      <div className="bg-white p-5 rounded-2xl border border-nature-border shadow-xs space-y-4" id="kamar-filter-bar">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama kamar, wali kamar, gedung, atau nama santri..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-nature-forest/30 focus:border-nature-forest focus:bg-white transition-all"
              id="kamar-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-200/60 cursor-pointer"
                title="Bersihkan pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Gender Filter Buttons */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200" id="gender-filter-buttons">
              <button
                onClick={() => setGenderFilter('semua')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  genderFilter === 'semua'
                    ? 'bg-nature-forest text-white shadow-3xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Semua ({kamar.length})
              </button>
              <button
                onClick={() => setGenderFilter('putra')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  genderFilter === 'putra'
                    ? 'bg-blue-600 text-white shadow-3xs'
                    : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Putra ({kamar.filter(k => k.gedung.includes('Putra')).length})
              </button>
              <button
                onClick={() => setGenderFilter('putri')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  genderFilter === 'putri'
                    ? 'bg-pink-600 text-white shadow-3xs'
                    : 'text-pink-600 hover:text-pink-850 hover:bg-pink-50/50'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                Putri ({kamar.filter(k => k.gedung.includes('Putri')).length})
              </button>
            </div>

            {/* Capacity Filter Select */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Sliders className="w-3.5 h-3.5 text-nature-sage" />
              <select
                value={capacityFilter}
                onChange={(e) => setCapacityFilter(e.target.value as 'semua' | 'tersedia' | 'penuh')}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                id="capacity-filter-select"
              >
                <option value="semua">Semua Status Bed</option>
                <option value="tersedia">Kamar Ada Bed Kosong</option>
                <option value="penuh">Kamar Penuh / Max</option>
              </select>
            </div>

            {/* Reset Filter Button */}
            {(searchQuery || genderFilter !== 'semua' || capacityFilter !== 'semua') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setGenderFilter('semua');
                  setCapacityFilter('semua');
                }}
                className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-xl hover:bg-amber-100 transition-all flex items-center gap-1 cursor-pointer"
                title="Reset seluruh filter"
              >
                <X className="w-3.5 h-3.5" /> Reset Filter
              </button>
            )}
          </div>
        </div>

        {/* Search Results Summary Tag */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Menampilkan <strong className="text-nature-forest font-black">{filteredKamar.length}</strong> dari total <strong className="text-slate-700">{kamar.length}</strong> kamar asrama
          </span>
          {searchQuery && (
            <span className="text-slate-400 italic">
              Hasil pencarian untuk: &ldquo;<span className="text-nature-forest font-semibold">{searchQuery}</span>&rdquo;
            </span>
          )}
        </div>
      </div>

      {/* RENDER ACTIVE TAB */}

      {/* TAB 1: PEMETAAN & BED OCCUPANCY GRIDS */}
      {activeTab === 'peta' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="tab-peta-view">
          
          {/* Left: Rooms list overview */}
          <div className="xl:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-nature-forest font-serif uppercase tracking-wider">Daftar Kamar & Rasio Kepadatan</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredKamar.length === 0 ? (
                <div className="sm:col-span-2 p-8 text-center bg-white border border-dashed border-nature-border rounded-2xl text-slate-400 italic text-xs">
                  Tidak ada kamar asrama yang sesuai dengan filter ini.
                </div>
              ) : (
                filteredKamar.map((k) => {
                const occupants = santri.filter(s => s.idKamar === k.id && s.status === 'Aktif');
                const ratio = Math.round((occupants.length / k.kapasitas) * 100);

                return (
                  <div 
                    key={k.id} 
                    onClick={() => setSelectedRoomId(k.id)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRoomId === k.id 
                        ? 'bg-nature-beige/45 border-nature-forest shadow-md ring-1 ring-nature-forest/20' 
                        : 'bg-white border-nature-border hover:border-nature-sage hover:shadow-xs'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{k.gedung}</span>
                        <h3 className="font-bold font-serif text-nature-forest text-base">{k.namaKamar}</h3>
                        {k.waliKamar && (
                          <div className="text-[9px] font-bold text-nature-sage uppercase tracking-wider">
                            Wali: {k.waliKamar}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditRoomDialog(k);
                          }}
                          className="p-1 hover:bg-nature-beige rounded text-slate-500 hover:text-nature-forest cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Hapus kamar ${k.namaKamar}? Santri di dalamnya akan kehilangan pemetaan kamar.`)) {
                              onDeleteKamar(k.id);
                              // set selected to another
                              const remain = kamar.filter(item => item.id !== k.id);
                              if (remain.length > 0) setSelectedRoomId(remain[0].id);
                            }
                          }}
                          className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Occupancy Indicator Bar */}
                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-600">
                        <span className="font-semibold flex items-center gap-1 text-nature-charcoal">
                          <Users className="w-3.5 h-3.5 text-nature-sage" /> Terisi: {occupants.length} / {k.kapasitas} Santri
                        </span>
                        <span className="font-bold text-nature-forest">{ratio}%</span>
                      </div>
                      <div className="w-full bg-nature-beige h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            ratio >= 100 ? 'bg-red-500' : ratio > 75 ? 'bg-nature-gold' : 'bg-nature-forest'
                          }`}
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Beds visual layout representation */}
                    <div className="grid grid-cols-8 gap-1.5 mt-4">
                      {Array.from({ length: k.kapasitas }).map((_, i) => {
                        const isOccupied = i < occupants.length;
                        return (
                          <div 
                            key={i} 
                            className={`h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                              isOccupied 
                                ? k.gedung.includes('Putra') ? 'bg-nature-beige text-nature-forest border border-nature-sage' : 'bg-pink-100 text-pink-800 border border-pink-200'
                                : 'bg-nature-beige/20 text-slate-400 border border-nature-border border-dashed'
                            }`}
                            title={isOccupied ? occupants[i].nama : 'Kasur Kosong'}
                          >
                            {i + 1}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          </div>

          {/* Right: Selected Room Details and occupants index */}
          {activeRoom && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold text-nature-forest font-serif uppercase tracking-wider">
                Detail Hunian: {activeRoom.namaKamar}
              </h2>

              <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-5">
                <div className="space-y-1 pb-3 border-b border-nature-border">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-nature-forest bg-nature-beige px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {activeRoom.gedung}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">Maks. {activeRoom.kapasitas} Bed</span>
                  </div>
                  <h3 className="text-lg font-bold font-serif text-nature-forest">{activeRoom.namaKamar}</h3>
                  <div className="text-[11px] font-medium flex items-center gap-1.5 mt-1 px-2.5 py-1 rounded-lg w-fit bg-nature-beige/50 border border-nature-border">
                    <span className={`w-1.5 h-1.5 rounded-full ${activeRoom.waliKamar ? 'bg-nature-sage' : 'bg-slate-300'}`}></span>
                    <span className="text-slate-500">
                      Wali Kamar: <strong className={activeRoom.waliKamar ? 'text-nature-forest font-bold' : 'text-slate-400 italic font-normal'}>
                        {activeRoom.waliKamar || 'Belum ditentukan'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Occupants list */}
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Daftar Anggota Kamar</span>
                  
                  {santri.filter(s => s.idKamar === activeRoom.id && s.status === 'Aktif').length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-4 text-center bg-nature-beige/20 rounded-xl border border-dashed border-nature-border">
                      Belum ada santri terpetakan ke kamar ini. Silakan atur penempatan kamar di menu "Data Santri".
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {santri.filter(s => s.idKamar === activeRoom.id && s.status === 'Aktif').map((s, index) => (
                        <div key={s.id} className="flex justify-between items-center p-3 rounded-xl bg-nature-beige/20 border border-nature-border hover:bg-nature-beige/30 transition-all text-xs">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-nature-beige text-nature-forest font-bold flex items-center justify-center text-[10px] border border-nature-sage/40">
                              {index + 1}
                            </span>
                            <div>
                              <div className="font-bold text-nature-charcoal">{s.nama}</div>
                              <div className="text-[10px] text-slate-400 font-semibold">NISN: {s.nis} &bull; {s.kelas}</div>
                            </div>
                          </div>
                          
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-white border border-nature-border ${
                            s.gender === 'Laki-laki' ? 'text-nature-forest' : 'text-pink-700'
                          }`}>
                            {s.gender === 'Laki-laki' ? 'Pa' : 'Pi'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Room inventory summary */}
                <div className="pt-3 border-t border-nature-border space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">Inventaris Kamar ({activeRoom.inventaris.length})</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeRoom.inventaris.slice(0, 3).map((inv) => (
                      <span key={inv.id} className="text-[10px] bg-nature-beige/60 text-nature-forest px-2 py-0.5 rounded font-bold border border-nature-border">
                        {inv.namaBarang} ({inv.jumlah}x)
                      </span>
                    ))}
                    {activeRoom.inventaris.length > 3 && (
                      <span className="text-[10px] bg-nature-beige text-slate-400 px-2 py-0.5 rounded font-bold border border-dashed border-nature-border">
                        +{activeRoom.inventaris.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INVENTARIS KAMAR */}
      {activeTab === 'inventaris' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="tab-inventaris-view">
          {/* Room Selection */}
          <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-nature-border pb-1">
              1. Pilih Kamar Asrama
            </h2>

            <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
              {filteredKamar.length === 0 ? (
                <p className="text-xs text-slate-400 italic text-center py-4 bg-nature-beige/10 border border-dashed border-nature-border rounded-xl">
                  Tidak ada kamar asrama yang sesuai dengan filter ini.
                </p>
              ) : (
                filteredKamar.map(k => (
                  <button 
                    key={k.id}
                    onClick={() => setSelectedRoomId(k.id)}
                    className={`w-full text-left p-3.5 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                      selectedRoomId === k.id 
                        ? 'bg-nature-beige text-nature-forest border-nature-forest font-bold' 
                        : 'bg-nature-beige/20 border-nature-border hover:bg-nature-beige/45'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold">{k.namaKamar}</div>
                      <span className="text-[10px] font-semibold text-slate-400">{k.gedung}</span>
                    </div>
                    <span className="text-[10px] bg-white text-nature-forest font-bold px-2 py-0.5 rounded-md border border-nature-border">
                      {k.inventaris.length} Barang
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Inventory Manager */}
          {activeRoom && (
            <div className="xl:col-span-2 space-y-6">
              
              {/* Add New Inventory Item */}
              <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-serif text-nature-forest">Tambah Fasilitas Inventaris Baru: {activeRoom.namaKamar}</h3>
                
                <form onSubmit={handleAddInventory} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nama Barang</label>
                    <input 
                      type="text" 
                      value={itemNama}
                      onChange={(e) => setItemNama(e.target.value)}
                      placeholder="e.g. Kasur Busa, Lemari"
                      className="w-full p-2 border border-nature-border rounded-lg text-xs font-bold bg-nature-beige/10 focus:outline-none focus:ring-1 focus:ring-nature-sage"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Jumlah Unit</label>
                    <input 
                      type="number" 
                      value={itemJumlah}
                      onChange={(e) => setItemJumlah(Number(e.target.value))}
                      min={1}
                      className="w-full p-2 border border-nature-border rounded-lg text-xs bg-nature-beige/10 focus:outline-none focus:ring-1 focus:ring-nature-sage"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Kondisi</label>
                    <select 
                      value={itemKondisi}
                      onChange={(e) => setItemKondisi(e.target.value as any)}
                      className="w-full p-2 border border-nature-border rounded-lg text-xs bg-white cursor-pointer focus:outline-none"
                    >
                      <option value="Baik">Baik</option>
                      <option value="Rusak Ringan">Rusak Ringan</option>
                      <option value="Rusak Berat">Rusak Berat</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full p-2.5 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-nature-gold" /> Daftarkan Alat
                  </button>
                </form>
              </div>

              {/* Inventories checklist table */}
              <div className="bg-white p-6 rounded-2xl border border-nature-border shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-serif text-nature-forest">Daftar Inventaris Kamar</h3>

                {activeRoom.inventaris.length === 0 ? (
                  <p className="text-xs text-slate-400 italic text-center py-6">Belum ada sarana inventaris terdaftar untuk kamar asrama ini.</p>
                ) : (
                  <div className="border border-nature-border rounded-xl overflow-hidden divide-y divide-nature-border">
                    {activeRoom.inventaris.map((item) => (
                      <div key={item.id} className="p-4 flex justify-between items-center text-xs bg-nature-beige/10">
                        <div className="space-y-1">
                          <span className="font-bold text-nature-forest text-sm">{item.namaBarang}</span>
                          <div className="text-[10px] text-slate-500 font-bold">Jumlah: {item.jumlah} Unit</div>
                        </div>

                        <div className="flex items-center gap-3">
                          {/* Condition badge updater selector */}
                          <select 
                            value={item.kondisi}
                            onChange={(e) => handleUpdateItemCondition(item.id, e.target.value as any)}
                            className={`p-1.5 rounded-md text-[10px] font-bold border cursor-pointer focus:outline-none ${
                              item.kondisi === 'Baik' 
                                ? 'bg-nature-beige text-nature-forest border-nature-sage' 
                                : item.kondisi === 'Rusak Ringan' 
                                ? 'bg-amber-50 text-amber-800 border-amber-200' 
                                : 'bg-red-50 text-red-800 border-red-200'
                            }`}
                          >
                            <option value="Baik">Kondisi: Baik</option>
                            <option value="Rusak Ringan">Kondisi: Rusak Ringan</option>
                            <option value="Rusak Berat">Kondisi: Rusak Berat</option>
                          </select>

                          <button 
                            type="button"
                            onClick={() => handleRemoveInventory(item.id)}
                            className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                            title="Hapus barang"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      )}

      {/* Room CRUD Modal form */}
      <AnimatePresence>
        {isRoomFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="room-modal-backdrop">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-nature-border max-w-md w-full"
              id="room-modal-content"
            >
              <div className="p-6 border-b border-nature-border flex justify-between items-center bg-nature-beige/40 rounded-t-2xl">
                <div>
                  <h3 className="text-base font-bold font-serif text-nature-forest">
                    {editingKamar ? `Ubah Kamar: ${editingKamar.namaKamar}` : 'Tambah Kamar Asrama Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">Konfigurasikan kapasitas maksimal tampung asrama</p>
                </div>
                <button 
                  onClick={() => setIsRoomFormOpen(false)}
                  className="p-1 hover:bg-nature-border rounded-full text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleRoomSubmit} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Kamar <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={roomNama}
                    onChange={(e) => setRoomNama(e.target.value)}
                    placeholder="Contoh: Makkah 01, Mina 03"
                    className="w-full p-2.5 border border-nature-border rounded-xl focus:outline-none focus:ring-1 focus:ring-nature-sage font-bold text-sm bg-nature-beige/10"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Gedung / Kategori Asrama</label>
                  <select 
                    value={roomGedung}
                    onChange={(e) => setRoomGedung(e.target.value as any)}
                    className="w-full p-2.5 border border-nature-border rounded-xl bg-white focus:outline-none"
                  >
                    <option value="Asrama Putra (Pa)">Asrama Putra (Pa)</option>
                    <option value="Asrama Putri (Pi)">Asrama Putri (Pi)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Wali Kamar / Musyrif / Musyrifah</label>
                  <select 
                    value={roomWaliKamar}
                    onChange={(e) => setRoomWaliKamar(e.target.value)}
                    className="w-full p-2.5 border border-nature-border rounded-xl bg-white focus:outline-none"
                  >
                    <option value="">-- Pilih Wali Kamar / Musyrif / Musyrifah --</option>
                    {guru.map((g) => (
                      <option key={g.id} value={g.nama}>
                        {g.nama} ({g.peran})
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 block pt-1">Dipilih berdasarkan data bapak/ibu guru yang terdaftar.</span>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kapasitas Kasur (Maksimal Santri)</label>
                  <input 
                    type="number" 
                    value={roomKapasitas}
                    onChange={(e) => setRoomKapasitas(Number(e.target.value))}
                    min={1}
                    max={32}
                    className="w-full p-2.5 border border-nature-border rounded-xl focus:outline-none bg-nature-beige/10"
                    required
                  />
                  <span className="text-[10px] text-slate-400 block pt-1">Kapasitas kamar asrama maksimal 32 santri.</span>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-nature-border">
                  <button 
                    type="button" 
                    onClick={() => setIsRoomFormOpen(false)}
                    className="px-4 py-2 border border-nature-border hover:bg-nature-beige text-slate-700 font-bold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    {editingKamar ? 'Simpan Perubahan' : 'Buat Kamar'}
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
