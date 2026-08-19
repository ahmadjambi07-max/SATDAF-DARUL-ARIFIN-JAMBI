import React, { useState } from 'react';
import { PengasuhGuru, JadwalMengajar, Gender, PeranStaf, KaryawanSDM } from '../types';
import { 
  Search, 
  GraduationCap, 
  Plus, 
  Calendar, 
  Phone, 
  MapPin, 
  Trash2, 
  Edit, 
  X, 
  AlertCircle,
  Clock,
  BookOpen,
  UserCheck2,
  CalendarRange,
  Upload,
  FileSpreadsheet,
  Check,
  Download,
  BrainCircuit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface DataPengasuhGuruProps {
  guru: PengasuhGuru[];
  karyawanList?: KaryawanSDM[];
  onAddGuru: (newGuru: Omit<PengasuhGuru, 'id'>) => void;
  onUpdateGuru: (updatedGuru: PengasuhGuru) => void;
  onDeleteGuru: (id: string) => void;
  onSyncSDM?: () => void;
}

export default function DataPengasuhGuru({ 
  guru, 
  karyawanList = [],
  onAddGuru, 
  onUpdateGuru, 
  onDeleteGuru,
  onSyncSDM 
}: DataPengasuhGuruProps) {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('Semua');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGuru, setEditingGuru] = useState<PengasuhGuru | null>(null);

  // Form inputs
  const [formNip, setFormNip] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formGender, setFormGender] = useState<Gender>('Laki-laki');
  const [formPeran, setFormPeran] = useState<PeranStaf>('Guru');
  const [formSpesialisasi, setFormSpesialisasi] = useState('');
  const [formNoHp, setFormNoHp] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formJadwal, setFormJadwal] = useState<JadwalMengajar[]>([]);

  // Schedule sub-form inputs
  const [schedHari, setSchedHari] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad'>('Senin');
  const [schedMulai, setSchedMulai] = useState('07:30');
  const [schedSelesai, setSchedSelesai] = useState('09:00');
  const [schedMapel, setSchedMapel] = useState('');
  const [schedKelas, setSchedKelas] = useState('');

  // Validations
  const [validationError, setValidationError] = useState('');

  // Excel Import states for Pendidik/Guru
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Omit<PengasuhGuru, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<{ row: number; msg: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const downloadTemplate = () => {
    const templateData = [
      {
        'NIP (Nomor Induk Pegawai)': '198503122011031002',
        'Nama Lengkap': 'Ustadz Ahmad Syahroni',
        'Jenis Kelamin (Laki-laki / Perempuan)': 'Laki-laki',
        'Peran (Guru / Pengasuh / Pengasuh & Guru)': 'Guru',
        'Spesialisasi Kitab / Keahlian': 'Kitab Fathul Qorib & Nahwu Shorof',
        'No. HP / Kontak': '081274567812',
        'Alamat Lengkap': 'Pondok Meja, Jambi'
      },
      {
        'NIP (Nomor Induk Pegawai)': '199207202018042004',
        'Nama Lengkap': 'Ustadzah Fatimah Azzahra',
        'Jenis Kelamin (Laki-laki / Perempuan)': 'Perempuan',
        'Peran (Guru / Pengasuh / Pengasuh & Guru)': 'Pengasuh & Guru',
        'Spesialisasi Kitab / Keahlian': 'Fiqih Nisa & Tahfidz Quran',
        'No. HP / Kontak': '081374567823',
        'Alamat Lengkap': 'Pasar Jambi, Jambi'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Guru');
    XLSX.writeFile(wb, 'Template_Guru_Pengasuh.xlsx');
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseExcelFile(file);
  };

  const parseExcelFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawRows = XLSX.utils.sheet_to_json<any>(ws);

        const parsed: Omit<PengasuhGuru, 'id'>[] = [];
        const errors: { row: number; msg: string }[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 1;
          const nip = String(row['NIP (Nomor Induk Pegawai)'] || '').trim();
          const nama = String(row['Nama Lengkap'] || '').trim();
          const jkRaw = String(row['Jenis Kelamin (Laki-laki / Perempuan)'] || '').trim();
          const peranRaw = String(row['Peran (Guru / Pengasuh / Pengasuh & Guru)'] || '').trim();
          const spesialisasi = String(row['Spesialisasi Kitab / Keahlian'] || '').trim();
          const noHp = String(row['No. HP / Kontak'] || '').trim();
          const alamat = String(row['Alamat Lengkap'] || '').trim();

          if (!nip) {
            errors.push({ row: rowNum, msg: 'NIP wajib diisi' });
            return;
          }
          if (!nama) {
            errors.push({ row: rowNum, msg: 'Nama Lengkap wajib diisi' });
            return;
          }

          const gender: Gender = (jkRaw.toLowerCase() === 'perempuan' || jkRaw.toLowerCase() === 'pi' || jkRaw.toLowerCase() === 'p') 
            ? 'Perempuan' 
            : 'Laki-laki';

          let peran: PeranStaf = 'Guru';
          if (peranRaw.toLowerCase().includes('pengasuh') && peranRaw.toLowerCase().includes('guru')) {
            peran = 'Pengasuh & Guru';
          } else if (peranRaw.toLowerCase().includes('pengasuh')) {
            peran = 'Pengasuh';
          }

          parsed.push({
            nip,
            nama,
            gender,
            peran,
            spesialisasi: spesialisasi || 'Kitab Kuning',
            noHp: noHp || '081200000000',
            alamat: alamat || 'Jambi',
            jadwal: []
          });
        });

        setImportPreview(parsed);
        setImportErrors(errors);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file benar (.xlsx / .xls)');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleCommitImport = () => {
    if (importPreview.length === 0) return;
    importPreview.forEach(g => {
      onAddGuru(g);
    });
    setImportPreview([]);
    setImportErrors([]);
    setIsImportOpen(false);
    alert(`Berhasil mengimpor ${importPreview.length} data asatidz/guru baru secara kolektif!`);
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
      parseExcelFile(file);
    }
  };

  const openAddForm = () => {
    const randomNip = `199${Math.floor(Math.random() * 9)}0${Math.floor(Math.random() * 9)}24${Math.floor(Math.random() * 90) + 10}`;
    setEditingGuru(null);
    setFormNip(randomNip);
    setFormNama('');
    setFormGender('Laki-laki');
    setFormPeran('Guru');
    setFormSpesialisasi('');
    setFormNoHp('');
    setFormAlamat('');
    setFormJadwal([]);
    setValidationError('');
    setIsFormOpen(true);
  };

  const openEditForm = (g: PengasuhGuru) => {
    setEditingGuru(g);
    setFormNip(g.nip);
    setFormNama(g.nama);
    setFormGender(g.gender);
    setFormPeran(g.peran);
    setFormSpesialisasi(g.spesialisasi);
    setFormNoHp(g.noHp);
    setFormAlamat(g.alamat);
    setFormJadwal(g.jadwal);
    setValidationError('');
    setIsFormOpen(true);
  };

  // Add individual class schedule inside form
  const handleAddScheduleItem = () => {
    if (!schedMapel.trim()) {
      alert('Nama mata pelajaran/kitab wajib diisi');
      return;
    }
    if (!schedKelas.trim()) {
      alert('Kelas/asrama target wajib diisi');
      return;
    }

    const newItem: JadwalMengajar = {
      id: `j-temp-${Date.now()}`,
      hari: schedHari,
      jamMulai: schedMulai,
      jamSelesai: schedSelesai,
      mataPelajaran: schedMapel,
      kelas: schedKelas
    };

    setFormJadwal([...formJadwal, newItem]);
    // reset inputs
    setSchedMapel('');
    setSchedKelas('');
  };

  // Remove individual class schedule inside form
  const handleRemoveScheduleItem = (id: string) => {
    setFormJadwal(formJadwal.filter(j => j.id !== id));
  };

  // Handle entire profile submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNama.trim()) {
      setValidationError('Nama lengkap pendidik wajib diisi');
      return;
    }
    if (!formNoHp.trim()) {
      setValidationError('Nomor HP/WA wajib diisi');
      return;
    }
    if (!formSpesialisasi.trim()) {
      setValidationError('Keahlian/spesialisasi mengajar wajib diisi');
      return;
    }

    const payload = {
      nip: formNip,
      nama: formNama,
      gender: formGender,
      peran: formPeran,
      spesialisasi: formSpesialisasi,
      noHp: formNoHp,
      alamat: formAlamat,
      jadwal: formJadwal
    };

    if (editingGuru) {
      onUpdateGuru({
        ...editingGuru,
        ...payload,
        id: editingGuru.id
      });
    } else {
      onAddGuru(payload);
    }

    setIsFormOpen(false);
  };

  // Filtered lists
  const filteredGuru = guru.filter(g => {
    const matchSearch = 
      g.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.spesialisasi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nip.includes(searchTerm);

    const matchRole = roleFilter === 'Semua' || g.peran.includes(roleFilter);

    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6" id="guru-container">
      {/* Header card */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-nature-border shadow-xs" id="guru-header-card">
        <div>
          <h1 className="text-xl font-serif font-bold text-nature-forest flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-nature-sage" /> Profil Pengasuh & Guru
          </h1>
          <p className="text-xs text-slate-500">Kelola guru mata pelajaran, ustadz kepengasuhan, serta jadwal kajian rutin pondok</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {onSyncSDM && (
            <button 
              onClick={onSyncSDM}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
              id="sync-sdm-guru-btn"
              title="Sinkronkan seluruh data pengasuh & guru dengan modul Litbang SDM"
            >
              <BrainCircuit className="w-4 h-4 text-nature-gold animate-pulse" /> Sinkron SDM Pesantren
            </button>
          )}
          <button 
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all active:scale-95 cursor-pointer"
            id="import-guru-excel-btn"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" /> Import Kolektif (Excel)
          </button>
          <button 
            onClick={openAddForm}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            id="add-guru-btn"
          >
            <Plus className="w-4 h-4 text-nature-gold" /> Tambah Profil Pendidik
          </button>
        </div>
      </div>

      {/* Excel Bulk Import Section */}
      <AnimatePresence>
        {isImportOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-white border border-nature-border rounded-2xl shadow-xs"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-700 animate-pulse" />
                  <div>
                    <h2 className="font-serif font-bold text-sm text-nature-forest">Import Profil Pengasuh & Guru via Template Excel</h2>
                    <p className="text-[10px] text-slate-500">Unduh template Excel resmi pendidik, lengkapi data asatidz, lalu unggah kembali ke sistem.</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsImportOpen(false);
                    setImportPreview([]);
                    setImportErrors([]);
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Steps and Template Download */}
                <div className="md:col-span-4 space-y-4 bg-nature-beige/40 p-4 rounded-xl border border-nature-border/60">
                  <h3 className="font-bold text-xs text-nature-forest uppercase tracking-wider">Langkah-langkah Import:</h3>
                  <ol className="text-xs text-slate-600 space-y-2.5 list-decimal pl-4 leading-relaxed font-medium">
                    <li>
                      <button 
                        onClick={downloadTemplate}
                        className="inline-flex items-center gap-1 text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer text-left"
                      >
                        Unduh Template Excel di sini
                      </button>
                    </li>
                    <li>Buka file template dan isi data ustadz/guru baru sesuai kolom yang disediakan (NIP, Nama Lengkap, Peran, dll).</li>
                    <li>Pastikan format NIP dan Jenis Kelamin terisi dengan benar sesuai contoh.</li>
                    <li>Unggah kembali file Excel yang telah disimpan di panel sebelah kanan.</li>
                    <li>Sistem akan mendata dan memasukkan asatidz ke sistem secara otomatis.</li>
                  </ol>
                </div>

                {/* File Drop Zone / Preview */}
                <div className="md:col-span-8 space-y-4">
                  {importPreview.length === 0 ? (
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900' 
                          : 'border-slate-200 hover:border-emerald-400 hover:bg-slate-50/50'
                      }`}
                      onClick={() => document.getElementById('excel-file-input-guru')?.click()}
                    >
                      <Upload className="w-10 h-10 text-slate-400 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Tarik & Lepas File Excel Anda di Sini</p>
                        <p className="text-[10px] text-slate-400 mt-1">Atau klik untuk memilih file dari komputer Anda (.xlsx / .xls)</p>
                      </div>
                      <input 
                        type="file" 
                        id="excel-file-input-guru"
                        accept=".xlsx, .xls"
                        onChange={handleExcelImport}
                        className="hidden"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Check className="w-4 h-4 text-emerald-600 bg-emerald-100 rounded-full p-0.5" />
                          Terbaca {importPreview.length} baris data asatidz/guru baru siap diproses
                        </div>
                        <button 
                          onClick={() => {
                            setImportPreview([]);
                            setImportErrors([]);
                          }}
                          className="text-[10px] font-bold text-red-600 hover:underline flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Bersihkan / Ulangi
                        </button>
                      </div>

                      {importErrors.length > 0 && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-700 space-y-1">
                          <div className="font-bold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Ada kesalahan pengisian data pada beberapa baris:
                          </div>
                          <ul className="list-disc pl-4 text-[10px] space-y-0.5 font-mono">
                            {importErrors.map((err, i) => (
                              <li key={i}>Baris {err.row}: {err.msg}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Preview Table */}
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                        <table className="w-full text-[10px] text-left">
                          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 sticky top-0">
                            <tr>
                              <th className="p-2">NIP</th>
                              <th className="p-2">Nama Lengkap</th>
                              <th className="p-2">L/P</th>
                              <th className="p-2">Peran</th>
                              <th className="p-2">Spesialisasi</th>
                              <th className="p-2">No. HP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {importPreview.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-mono font-bold text-emerald-800">{item.nip}</td>
                                <td className="p-2">{item.nama}</td>
                                <td className="p-2">{item.gender}</td>
                                <td className="p-2">{item.peran}</td>
                                <td className="p-2">{item.spesialisasi}</td>
                                <td className="p-2 font-mono">{item.noHp}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => {
                            setImportPreview([]);
                            setImportErrors([]);
                          }}
                          className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-50 cursor-pointer"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={handleCommitImport}
                          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-4 h-4 text-nature-gold" /> Simpan {importPreview.length} Pendidik Kolektif
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters bar */}
      <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-xs flex flex-col sm:flex-row gap-3" id="guru-filters">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Cari berdasarkan NIP, nama ustadz, atau spesialisasi kitab..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-nature-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-sage focus:border-nature-sage bg-nature-beige/20 text-nature-charcoal"
            id="guru-search-input"
          />
        </div>

        <div className="flex items-center gap-1 bg-nature-beige/40 border border-nature-border px-3 py-1.5 rounded-xl text-xs shrink-0">
          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Peran:</span>
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent font-bold text-nature-forest border-none focus:outline-none cursor-pointer text-xs"
            id="guru-filter-role"
          >
            <option value="Semua">Semua Peran</option>
            <option value="Guru">Guru Mengajar</option>
            <option value="Pengasuh">Pengasuh Asrama</option>
          </select>
        </div>
      </div>

      {/* Grid of Educator Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="guru-cards-grid">
        {filteredGuru.length === 0 ? (
          <div className="md:col-span-2 bg-white p-12 text-center rounded-2xl border border-nature-border text-slate-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-slate-300" />
            <span>Tidak ada data tenaga pendidik ditemukan.</span>
          </div>
        ) : (
                  filteredGuru.map((g) => {
            const isSDMSynced = karyawanList.some(
              k => (k.nipKaryawan && k.nipKaryawan === g.nip) || k.nama.trim().toLowerCase() === g.nama.trim().toLowerCase()
            );

            return (
              <div key={g.id} className="bg-white rounded-2xl border border-nature-border shadow-xs p-6 space-y-5 flex flex-col justify-between" id={`guru-card-${g.id}`}>
                {/* Profile Top Row */}
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex gap-3">
                      {/* Visual Avatar */}
                      <div className="w-12 h-12 rounded-xl bg-nature-beige text-nature-forest border border-nature-border flex items-center justify-center font-serif font-bold text-lg shrink-0">
                        {g.nama.split(' ').slice(0, 2).map(w => w.replace(/[^A-Za-z]/g, '').substring(0, 1)).join('')}
                      </div>
                      <div>
                        <h3 className="font-bold font-serif text-nature-forest text-sm leading-snug">{g.nama}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="font-mono text-[9px] text-slate-400 font-semibold">NIP: {g.nip}</span>
                          {isSDMSynced ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md text-[9px] font-bold">
                              <Check className="w-2.5 h-2.5" /> Terkoneksi Litbang SDM
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[9px] font-bold">
                              Belum Terdaftar SDM
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  <div className="flex gap-1.5 shrink-0">
                    <button 
                      onClick={() => openEditForm(g)}
                      className="p-1.5 hover:bg-nature-beige rounded-lg text-slate-500 hover:text-nature-forest transition-colors cursor-pointer"
                      id={`edit-guru-icon-${g.id}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={() => {
                        if(confirm(`Hapus seluruh profil ${g.nama} dan jadwal mengajar terkait?`)) {
                          onDeleteGuru(g.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                      id={`delete-guru-icon-${g.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Badges Info */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] bg-nature-beige text-nature-forest border border-nature-sage/40 px-2 py-0.5 rounded-md font-bold">
                    {g.peran}
                  </span>
                  <span className="text-[10px] bg-[#FAF9F6] text-[#8A9A5B] border border-nature-border px-2 py-0.5 rounded-md font-bold">
                    Spesialis: {g.spesialisasi}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${
                    g.gender === 'Laki-laki' ? 'bg-[#DEDCD3] text-[#2D4034] border-nature-border' : 'bg-pink-100 text-pink-800 border-pink-200'
                  }`}>
                    {g.gender === 'Laki-laki' ? 'Ustadz' : 'Ustadzah'}
                  </span>
                </div>

                {/* Alamat & Kontak */}
                <div className="text-xs text-slate-600 space-y-1.5 bg-nature-beige/20 p-3 rounded-xl border border-nature-border">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-nature-sage shrink-0" />
                    <span className="font-mono text-[11px] font-semibold">{g.noHp}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-nature-sage shrink-0 mt-0.5" />
                    <span className="leading-snug">{g.alamat}</span>
                  </div>
                </div>
              </div>

              {/* Schedule listing */}
              <div className="space-y-2.5 pt-3 border-t border-nature-border">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <CalendarRange className="w-3.5 h-3.5 text-nature-sage" /> Jadwal Bimbingan / Kelas ({g.jadwal.length})
                </span>

                {g.jadwal.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic">Belum ada jadwal mengajar terdaftar.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {g.jadwal.map((j) => (
                      <div key={j.id} className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-nature-border shadow-3xs">
                        <div className="space-y-0.5">
                          <div className="font-bold text-nature-charcoal">{j.mataPelajaran}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{j.kelas}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-nature-forest bg-nature-beige px-1.5 py-0.5 rounded text-[10px] inline-block">
                            {j.hari}
                          </div>
                          <div className="text-[9px] text-slate-400 font-mono mt-0.5 flex items-center gap-0.5 justify-end">
                            <Clock className="w-2.5 h-2.5 text-nature-sage" /> {j.jamMulai} - {j.jamSelesai}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Register/Edit Teacher Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="guru-modal-backdrop">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              id="guru-modal-content"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingGuru ? `Ubah Profil: ${editingGuru.nama}` : 'Registrasi Pendidik & Pengasuh Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Isi profil pengurus dan tentukan jadwal kajian harian santri
                  </p>
                </div>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Section 1: Profil Pendidik */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    1. Informasi Profil
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Nomor Induk Pendidik (NIP)</label>
                      <input 
                        type="text" 
                        value={formNip}
                        onChange={(e) => setFormNip(e.target.value)}
                        placeholder="Contoh: 1990082402"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Nama Lengkap & Gelar <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        placeholder="Contoh: Ustadz Ahmad Syakir, M.Ag"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Spesialisasi Kitab / Mata Pelajaran <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formSpesialisasi}
                        onChange={(e) => setFormSpesialisasi(e.target.value)}
                        placeholder="Contoh: Kitab Jurumiyah, Bahasa Arab, Fiqih"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 font-semibold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">No. Kontak WhatsApp <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNoHp}
                        onChange={(e) => setFormNoHp(e.target.value)}
                        placeholder="Contoh: 0812XXXXXXXX"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 font-mono text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Jenis Kelamin</label>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          formGender === 'Laki-laki' 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-800 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={formGender === 'Laki-laki'}
                            onChange={() => setFormGender('Laki-laki')}
                            className="hidden" 
                          />
                          Ustadz (Laki-laki)
                        </label>
                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                          formGender === 'Perempuan' 
                            ? 'border-pink-600 bg-pink-50/40 text-pink-800 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={formGender === 'Perempuan'}
                            onChange={() => setFormGender('Perempuan')}
                            className="hidden" 
                          />
                          Ustadzah (Perempuan)
                        </label>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Peran Jabatan Pondok <span className="text-red-500">*</span></label>
                      <select 
                        value={formPeran}
                        onChange={(e) => setFormPeran(e.target.value as PeranStaf)}
                        className="w-full p-2.5 border border-slate-200 bg-white rounded-xl focus:outline-none"
                      >
                        <option value="Guru">Guru Mengajar</option>
                        <option value="Pengasuh">Pengasuh Asrama</option>
                        <option value="Pengasuh & Guru">Guru & Pengasuh</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Alamat Rumah / Tinggal</label>
                    <textarea 
                      value={formAlamat}
                      onChange={(e) => setFormAlamat(e.target.value)}
                      placeholder="Masukkan alamat tinggal saat ini..."
                      rows={2}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                {/* Section 2: Jadwal Mengajar */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    2. Jadwal Bimbingan / Mengajar Routine
                  </h4>

                  {/* Schedule item adder panel */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600">Hari</label>
                        <select 
                          value={schedHari} 
                          onChange={(e) => setSchedHari(e.target.value as any)}
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        >
                          <option value="Senin">Senin</option>
                          <option value="Selasa">Selasa</option>
                          <option value="Rabu">Rabu</option>
                          <option value="Kamis">Kamis</option>
                          <option value="Jumat">Jumat</option>
                          <option value="Sabtu">Sabtu</option>
                          <option value="Ahad">Ahad</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600">Jam Mulai</label>
                        <input 
                          type="text" 
                          value={schedMulai} 
                          onChange={(e) => setSchedMulai(e.target.value)}
                          placeholder="e.g. 07:30"
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white text-center font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600">Jam Selesai</label>
                        <input 
                          type="text" 
                          value={schedSelesai} 
                          onChange={(e) => setSchedSelesai(e.target.value)}
                          placeholder="e.g. 09:00"
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white text-center font-mono"
                        />
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="font-semibold text-slate-600">Mata Pelajaran/Kitab</label>
                        <input 
                          type="text" 
                          value={schedMapel} 
                          onChange={(e) => setSchedMapel(e.target.value)}
                          placeholder="e.g. Nahwu Sharaf"
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white font-bold"
                        />
                      </div>

                      <div className="space-y-1 col-span-1">
                        <label className="font-semibold text-slate-600">Kelas / Target</label>
                        <input 
                          type="text" 
                          value={schedKelas} 
                          onChange={(e) => setSchedKelas(e.target.value)}
                          placeholder="e.g. Kelas 10-A"
                          className="w-full p-2 border border-slate-200 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button 
                        type="button"
                        onClick={handleAddScheduleItem}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 text-white font-semibold rounded-lg text-[11px] hover:bg-emerald-800 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Tambahkan Jadwal
                      </button>
                    </div>
                  </div>

                  {/* Selected schedules display */}
                  <div className="space-y-2">
                    <span className="font-semibold text-slate-700">Daftar Jadwal yang Ditambahkan:</span>
                    {formJadwal.length === 0 ? (
                      <p className="text-slate-400 italic">Belum ada jadwal yang diinput untuk pendidik ini.</p>
                    ) : (
                      <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-100">
                        {formJadwal.map((item, index) => (
                          <div key={item.id} className="p-3 bg-slate-50/50 flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-800 font-extrabold flex items-center justify-center text-[10px]">
                                {index + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-800">{item.mataPelajaran}</span>
                                <span className="text-slate-500 font-medium ml-2">({item.kelas})</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <span className="font-semibold text-pesantren-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                  {item.hari}
                                </span>
                                <span className="text-[10px] text-slate-400 font-mono ml-2">
                                  {item.jamMulai} - {item.jamSelesai}
                                </span>
                              </div>

                              <button 
                                type="button" 
                                onClick={() => handleRemoveScheduleItem(item.id)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
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

                {/* Modal Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 bg-slate-50/60 p-6 -mx-6 -mb-6 rounded-b-2xl">
                  <button 
                    type="button" 
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-pesantren-emerald-700 hover:bg-pesantren-emerald-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {editingGuru ? 'Simpan Perubahan' : 'Registrasi Pendidik'}
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
