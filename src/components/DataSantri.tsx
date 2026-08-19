import React, { useState } from 'react';
import { Santri, Kamar, StatusSantri, Gender } from '../types';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Edit, 
  Trash2, 
  X, 
  Plus, 
  Download,
  AlertCircle,
  FileCheck2,
  Check,
  UserX,
  MapPin,
  Phone,
  UserCheck,
  Upload,
  FileSpreadsheet,
  Lock,
  KeyRound,
  Camera,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';

interface DataSantriProps {
  santri: Santri[];
  kamar: Kamar[];
  onAddSantri: (newSantri: Omit<Santri, 'id'>) => void;
  onUpdateSantri: (updatedSantri: Santri) => void;
  onDeleteSantri: (id: string) => void;
  triggerQuickAddOpen?: boolean;
  setTriggerQuickAddOpen?: (open: boolean) => void;
}

export default function DataSantri({ 
  santri, 
  kamar, 
  onAddSantri, 
  onUpdateSantri, 
  onDeleteSantri,
  triggerQuickAddOpen,
  setTriggerQuickAddOpen
}: DataSantriProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [genderFilter, setGenderFilter] = useState<string>('Semua');
  const [kamarFilter, setKamarFilter] = useState<string>('Semua');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);

  // PIN Verification states for status change to Pindah
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [pendingStatusChange, setPendingStatusChange] = useState<StatusSantri | null>(null);

  // Form inputs
  const [formNis, setFormNis] = useState('');
  const [formNama, setFormNama] = useState('');
  const [formGender, setFormGender] = useState<Gender>('Laki-laki');
  const [formTempatLahir, setFormTempatLahir] = useState('');
  const [formTanggalLahir, setFormTanggalLahir] = useState('');
  const [formAlamat, setFormAlamat] = useState('');
  const [formNamaWali, setFormNamaWali] = useState('');
  const [formNoHpWali, setFormNoHpWali] = useState('');
  const [formTanggalMasuk, setFormTanggalMasuk] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<StatusSantri>('Aktif');
  const [formIdKamar, setFormIdKamar] = useState('');
  const [formKelas, setFormKelas] = useState('');
  const [formTanggalPindah, setFormTanggalPindah] = useState('');
  const [formFotoUrl, setFormFotoUrl] = useState<string>('');

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert('Ukuran foto maksimal 3MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        setFormFotoUrl(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Error validations
  const [validationError, setValidationError] = useState('');

  // Excel Import states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<Omit<Santri, 'id'>[]>([]);
  const [importErrors, setImportErrors] = useState<{ row: number; msg: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const downloadTemplate = () => {
    const templateData = [
      {
        'NISN (Nomor Induk Siswa Nasional)': '0081234567',
        'Nama Lengkap': 'Faris Al-Banjari',
        'Jenis Kelamin (Laki-laki / Perempuan)': 'Laki-laki',
        'Kelas': '10-A (Ula)',
        'Tanggal Lahir (Format YYYY-MM-DD)': '2010-06-15',
        'Nama Wali / Orang Tua': 'Hendra Wijaya',
        'Kontak Orang Tua / HP': '081234567800',
        'Alamat Lengkap': 'Kota Baru, Jambi'
      },
      {
        'NISN (Nomor Induk Siswa Nasional)': '0092345678',
        'Nama Lengkap': 'Zaskia Nurhaliza',
        'Jenis Kelamin (Laki-laki / Perempuan)': 'Perempuan',
        'Kelas': '11-B (Wustha)',
        'Tanggal Lahir (Format YYYY-MM-DD)': '2009-08-22',
        'Nama Wali / Orang Tua': 'Ahmad Rusdi',
        'Kontak Orang Tua / HP': '081345678900',
        'Alamat Lengkap': 'Telanaipura, Jambi'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template Santri');
    XLSX.writeFile(wb, 'Template_Santri_Darul_Arifin.xlsx');
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

        const parsed: Omit<Santri, 'id'>[] = [];
        const errors: { row: number; msg: string }[] = [];

        rawRows.forEach((row, index) => {
          const rowNum = index + 1;
          const nis = String(row['NISN (Nomor Induk Siswa Nasional)'] || row['NISN'] || row['NIS (Nomor Induk)'] || row['NIS'] || '').trim();
          const nama = String(row['Nama Lengkap'] || '').trim();
          const jkRaw = String(row['Jenis Kelamin (Laki-laki / Perempuan)'] || '').trim();
          const kelas = String(row['Kelas'] || '').trim() || '10-A (Ula)';
          const tglLahir = String(row['Tanggal Lahir (Format YYYY-MM-DD)'] || '').trim();
          const namaWali = String(row['Nama Wali / Orang Tua'] || '').trim();
          const noHp = String(row['Kontak Orang Tua / HP'] || '').trim();
          const alamat = String(row['Alamat Lengkap'] || '').trim();

          if (!nis) {
            errors.push({ row: rowNum, msg: 'NISN wajib diisi' });
            return;
          }
          if (!nama) {
            errors.push({ row: rowNum, msg: 'Nama Lengkap wajib diisi' });
            return;
          }

          const gender: Gender = (jkRaw.toLowerCase() === 'perempuan' || jkRaw.toLowerCase() === 'pi' || jkRaw.toLowerCase() === 'p') 
            ? 'Perempuan' 
            : 'Laki-laki';

          parsed.push({
            nis,
            nama,
            gender,
            kelas,
            tempatLahir: 'Jambi',
            tanggalLahir: tglLahir || '2010-01-01',
            alamat: alamat || 'Jambi',
            namaWali: namaWali || 'Orang Tua Santri',
            noHpWali: noHp || '081200000000',
            tanggalMasuk: new Date().toISOString().split('T')[0],
            status: 'Aktif',
            idKamar: kamar.length > 0 ? kamar[0].id : ''
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
    importPreview.forEach(s => {
      onAddSantri(s);
    });
    setImportPreview([]);
    setImportErrors([]);
    setIsImportOpen(false);
    alert(`Berhasil mengimpor ${importPreview.length} data santri secara kolektif!`);
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

  // Open form to register student
  const openAddForm = () => {
    // Generate simple NISN based on current year and sequence
    const currentYear = new Date().getFullYear();
    const count = santri.length + 1;
    const generatedNis = `00${String(currentYear).slice(-2)}${String(count).padStart(4, '0')}`;

    setEditingSantri(null);
    setFormNis(generatedNis);
    setFormNama('');
    setFormGender('Laki-laki');
    setFormTempatLahir('');
    setFormTanggalLahir('2010-01-01');
    setFormAlamat('');
    setFormNamaWali('');
    setFormNoHpWali('');
    setFormTanggalMasuk(new Date().toISOString().split('T')[0]);
    setFormStatus('Aktif');
    setFormIdKamar(kamar.length > 0 ? kamar[0].id : '');
    setFormKelas('10-A (Ula)');
    setFormTanggalPindah('');
    setFormFotoUrl('');
    setValidationError('');
    setIsFormOpen(true);
  };

  // Open form to edit student
  const openEditForm = (s: Santri) => {
    setEditingSantri(s);
    setFormNis(s.nis);
    setFormNama(s.nama);
    setFormGender(s.gender);
    setFormTempatLahir(s.tempatLahir);
    setFormTanggalLahir(s.tanggalLahir);
    setFormAlamat(s.alamat);
    setFormNamaWali(s.namaWali);
    setFormNoHpWali(s.noHpWali);
    setFormTanggalMasuk(s.tanggalMasuk);
    setFormStatus(s.status);
    setFormIdKamar(s.idKamar);
    setFormKelas(s.kelas);
    setFormTanggalPindah(s.tanggalPindah || new Date().toISOString().split('T')[0]);
    setFormFotoUrl(s.fotoUrl || '');
    setValidationError('');
    setIsFormOpen(true);
  };

  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === '2026') {
      setFormStatus('Pindah');
      setIsPinModalOpen(false);
      setPinInput('');
      setPinError('');
    } else {
      setPinError('PIN Keamanan salah! Silakan coba lagi.');
    }
  };

  const handleCancelPin = () => {
    setIsPinModalOpen(false);
    setPinInput('');
    setPinError('');
    setPendingStatusChange(null);
    setFormStatus('Aktif');
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNama.trim()) {
      setValidationError('Nama lengkap santri wajib diisi');
      return;
    }
    if (!formNis.trim()) {
      setValidationError('Nomor Induk Siswa Nasional (NISN) wajib diisi');
      return;
    }
    if (!formNoHpWali.trim()) {
      setValidationError('Nomor HP Wali wajib diisi');
      return;
    }

    const payload = {
      nis: formNis,
      nama: formNama,
      gender: formGender,
      tempatLahir: formTempatLahir,
      tanggalLahir: formTanggalLahir,
      alamat: formAlamat,
      namaWali: formNamaWali,
      noHpWali: formNoHpWali,
      tanggalMasuk: formTanggalMasuk,
      status: formStatus,
      idKamar: formIdKamar,
      kelas: formKelas,
      tanggalPindah: formStatus === 'Pindah' ? formTanggalPindah : undefined,
      fotoUrl: formFotoUrl || undefined,
    };

    if (editingSantri) {
      onUpdateSantri({
        ...editingSantri,
        ...payload,
        id: editingSantri.id,
      });
    } else {
      onAddSantri(payload);
    }

    setIsFormOpen(false);
    if (setTriggerQuickAddOpen) {
      setTriggerQuickAddOpen(false);
    }
  };

  // Listen to Quick Add trigger from Dashboard
  React.useEffect(() => {
    if (triggerQuickAddOpen) {
      openAddForm();
    }
  }, [triggerQuickAddOpen]);

  // Filtered lists
  const filteredSantri = santri.filter(s => {
    const matchSearch = 
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nis.includes(searchTerm) ||
      s.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kelas.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'Semua' || s.status === statusFilter;
    const matchGender = genderFilter === 'Semua' || s.gender === genderFilter;
    const matchKamar = kamarFilter === 'Semua' || s.idKamar === kamarFilter;

    return matchSearch && matchStatus && matchGender && matchKamar;
  });

  // Export santri data to JSON
  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(santri, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "data_induk_santri_pesantren.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6" id="santri-container">
      {/* Header and Statistics summary */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-nature-border shadow-xs" id="santri-header-card">
        <div>
          <h1 className="text-xl font-serif text-nature-forest font-bold flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-nature-sage" /> Data Induk Santri
          </h1>
          <p className="text-xs text-slate-500">Kelola informasi santri, status keaktifan, dan biodata wali</p>
        </div>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setIsImportOpen(!isImportOpen)}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-200 transition-all active:scale-95 cursor-pointer"
            id="import-santri-excel-btn"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-700" /> Import Kolektif (Excel)
          </button>
          <button 
            onClick={exportData}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-nature-beige hover:bg-nature-border text-nature-forest font-bold text-xs rounded-xl border border-nature-border transition-all active:scale-95 cursor-pointer"
            id="export-santri-btn"
          >
            <Download className="w-3.5 h-3.5 text-nature-sage" /> Ekspor Data
          </button>
          <button 
            onClick={openAddForm}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-nature-forest hover:bg-nature-forest-medium text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
            id="add-santri-btn"
          >
            <UserPlus className="w-3.5 h-3.5 text-nature-gold" /> Registrasi Santri Baru
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
                    <h2 className="font-serif font-bold text-sm text-nature-forest">Import Data Santri via Template Excel</h2>
                    <p className="text-[10px] text-slate-500">Unduh template Excel resmi kami, lengkapi data santri, lalu unggah kembali ke sistem.</p>
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
                    <li>Buka file template dan isi data santri baru sesuai kolom yang tersedia (NISN, Nama Lengkap, Jenis Kelamin, dll).</li>
                    <li>Pastikan format kolom NISN dan Jenis Kelamin terisi dengan benar sesuai contoh.</li>
                    <li>Unggah kembali file Excel yang telah disimpan di panel sebelah kanan.</li>
                    <li>Sistem akan melakukan verifikasi baris secara otomatis sebelum disimpan ke database.</li>
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
                      onClick={() => document.getElementById('excel-file-input')?.click()}
                    >
                      <Upload className="w-10 h-10 text-slate-400 animate-bounce" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Tarik & Lepas File Excel Anda di Sini</p>
                        <p className="text-[10px] text-slate-400 mt-1">Atau klik untuk memilih file dari komputer Anda (.xlsx / .xls)</p>
                      </div>
                      <input 
                        type="file" 
                        id="excel-file-input"
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
                          Terbaca {importPreview.length} baris data santri baru siap diproses
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
                              <th className="p-2">NISN</th>
                              <th className="p-2">Nama Lengkap</th>
                              <th className="p-2">L/P</th>
                              <th className="p-2">Kelas</th>
                              <th className="p-2">Nama Wali</th>
                              <th className="p-2">Kontak HP</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {importPreview.map((item, idx) => (
                              <tr key={idx} className="hover:bg-slate-50">
                                <td className="p-2 font-mono font-bold text-emerald-800">{item.nis}</td>
                                <td className="p-2">{item.nama}</td>
                                <td className="p-2">{item.gender}</td>
                                <td className="p-2">{item.kelas}</td>
                                <td className="p-2">{item.namaWali}</td>
                                <td className="p-2 font-mono">{item.noHpWali}</td>
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
                          <FileCheck2 className="w-4 h-4 text-nature-gold" /> Simpan {importPreview.length} Santri Kolektif
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

      {/* Mini Overview Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="santri-mini-stats">
        <div className="bg-white p-4 rounded-xl border border-nature-border shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Terdaftar</span>
          <div className="text-3xl font-serif font-bold text-nature-forest">{santri.length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-nature-border shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-nature-sage uppercase tracking-widest font-bold">Aktif Menetap</span>
          <div className="text-3xl font-serif font-bold text-nature-sage">{santri.filter(s => s.status === 'Aktif').length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-nature-border shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Status Pindah</span>
          <div className="text-3xl font-serif font-bold text-amber-700">{santri.filter(s => s.status === 'Pindah').length}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-nature-border shadow-2xs text-center space-y-1">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Asrama Terisi</span>
          <div className="text-3xl font-serif font-bold text-nature-forest">
            {new Set(santri.filter(s => s.status === 'Aktif' && s.idKamar).map(s => s.idKamar)).size} Kamar
          </div>
        </div>
      </div>

      {/* Search and Filters controls */}
      <div className="bg-white p-4 rounded-2xl border border-nature-border shadow-xs flex flex-col md:flex-row gap-3" id="santri-filters">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Cari berdasarkan NISN, nama, kota asal, atau kelas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-nature-border rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-nature-sage focus:border-nature-sage bg-nature-beige/20 text-nature-charcoal"
            id="santri-search-input"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="flex items-center gap-1 bg-nature-beige/40 border border-nature-border px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Status:</span>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-nature-forest border-none focus:outline-none focus:ring-0 scale-95 cursor-pointer"
              id="santri-filter-status"
            >
              <option value="Semua">Semua</option>
              <option value="Aktif">Aktif</option>
              <option value="Pindah">Pindah</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-1 bg-nature-beige/40 border border-nature-border px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Asrama:</span>
            <select 
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent font-bold text-nature-forest border-none focus:outline-none focus:ring-0 scale-95 cursor-pointer"
              id="santri-filter-gender"
            >
              <option value="Semua">Semua Pa/Pi</option>
              <option value="Laki-laki">Putra (Pa)</option>
              <option value="Perempuan">Putri (Pi)</option>
            </select>
          </div>

          {/* Room Filter */}
          <div className="flex items-center gap-1 bg-nature-beige/40 border border-nature-border px-3 py-1.5 rounded-xl text-xs">
            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-widest">Kamar:</span>
            <select 
              value={kamarFilter}
              onChange={(e) => setKamarFilter(e.target.value)}
              className="bg-transparent font-bold text-nature-forest border-none focus:outline-none focus:ring-0 scale-95 cursor-pointer"
              id="santri-filter-kamar"
            >
              <option value="Semua">Semua Kamar</option>
              {kamar.map(k => (
                <option key={k.id} value={k.id}>{k.namaKamar}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Datatable */}
      <div className="bg-white rounded-2xl border border-nature-border shadow-xs overflow-hidden" id="santri-table-wrapper">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="santri-table">
            <thead>
              <tr className="border-b border-nature-border bg-nature-beige/40 text-slate-500 font-bold text-xs uppercase tracking-wider">
                <th className="p-4">NISN & Nama Santri</th>
                <th className="p-4">Gender</th>
                <th className="p-4">Kelas & Kamar</th>
                <th className="p-4">Wali Santri</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-nature-border text-xs">
              {filteredSantri.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span>Tidak ada data santri ditemukan. Coba ubah pencarian atau filter Anda.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSantri.map(s => {
                  const room = kamar.find(k => k.id === s.idKamar);
                  return (
                    <tr key={s.id} className="hover:bg-nature-beige/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-nature-forest/10 border border-nature-forest/20 flex items-center justify-center font-bold text-nature-forest overflow-hidden shrink-0 shadow-2xs">
                            {s.fotoUrl ? (
                              <img src={s.fotoUrl} alt={s.nama} className="w-full h-full object-cover" />
                            ) : (
                              <span>{s.nama.charAt(0)}</span>
                            )}
                          </div>
                          <div className="space-y-0.5">
                            <div className="font-bold text-nature-forest text-sm">{s.nama}</div>
                            <div className="font-mono text-[10px] text-slate-400 font-semibold">NISN: {s.nis}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          s.gender === 'Laki-laki' ? 'bg-[#DEDCD3] text-[#2D4034]' : 'bg-pink-100 text-pink-800'
                        }`}>
                          {s.gender === 'Laki-laki' ? 'Putra (Pa)' : 'Putri (Pi)'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-700">{s.kelas}</span>
                          <span className="block text-[10px] text-slate-500 font-medium">
                            Kamar: {room ? room.namaKamar : <span className="text-red-400 font-normal">Belum Ditempatkan</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1 text-slate-600">
                          <div className="font-semibold flex items-center gap-1">
                            <span>{s.namaWali}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-300 shrink-0" /> {s.noHpWali}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                            s.status === 'Aktif' 
                              ? 'bg-nature-beige border-nature-sage text-nature-forest' 
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${s.status === 'Aktif' ? 'bg-nature-sage' : 'bg-amber-500'}`}></span>
                            {s.status}
                          </span>
                          {s.status === 'Pindah' && s.tanggalPindah && (
                            <div className="text-[9px] font-extrabold text-red-700 whitespace-nowrap bg-red-50 border border-red-100/60 px-1.5 py-0.5 rounded-md w-fit">
                              Tgl Pindah: {new Date(s.tanggalPindah).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button 
                            onClick={() => openEditForm(s)}
                            className="p-1.5 hover:bg-nature-beige rounded-lg text-slate-600 hover:text-nature-forest transition-colors cursor-pointer"
                            title="Edit Santri"
                            id={`edit-santri-${s.id}`}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              if(confirm(`Apakah Anda yakin ingin menghapus data santri ${s.nama}?`)) {
                                onDeleteSantri(s.id);
                              }
                            }}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Hapus Santri"
                            id={`delete-santri-${s.id}`}
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
        
        {/* Pagination/Summary bar */}
        <div className="bg-nature-beige/40 border-t border-nature-border p-4 flex justify-between items-center text-xs text-slate-500" id="santri-pagination-bar">
          <span>Menampilkan <strong className="text-slate-800">{filteredSantri.length}</strong> dari <strong className="text-slate-800">{santri.length}</strong> total santri terdaftar</span>
        </div>
      </div>

      {/* Input / Editing Modal Form */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto" id="santri-modal-backdrop">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              id="santri-modal-content"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl sticky top-0 z-20 shadow-2xs">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingSantri ? `Edit Biodata: ${editingSantri.nama}` : 'Form Registrasi Santri Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sistem Input Data Induk Santri terintegrasi dengan pemetaan asrama
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    if (setTriggerQuickAddOpen) {
                      setTriggerQuickAddOpen(false);
                    }
                  }}
                  className="p-1 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
                
                {/* Validation error banner */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{validationError}</span>
                  </div>
                )}

                {/* Section 1: Data Identitas Santri */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    1. Identitas Santri
                  </h4>

                  {/* Foto Resmi Santri */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-extrabold text-slate-800 flex items-center gap-1.5 text-xs">
                        <Camera className="w-4 h-4 text-nature-forest" />
                        Foto Resmi Santri
                      </label>
                      {formFotoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormFotoUrl('')}
                          className="text-[11px] font-extrabold text-rose-600 hover:underline cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {/* Avatar Preview */}
                      <div className="w-20 h-20 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                        {formFotoUrl ? (
                          <img src={formFotoUrl} alt="Preview Foto" className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-center text-slate-400 p-1">
                            <User className="w-8 h-8 mx-auto stroke-1" />
                            <span className="text-[9px] font-bold block">Tanpa Foto</span>
                          </div>
                        )}
                      </div>

                      {/* Controls */}
                      <div className="space-y-2 flex-1 w-full">
                        <div className="flex items-center gap-2">
                          <label className="px-3.5 py-2 bg-nature-forest text-white rounded-xl font-extrabold text-xs hover:bg-nature-forest-medium cursor-pointer transition-colors inline-flex items-center gap-2 shadow-xs">
                            <Upload className="w-3.5 h-3.5 text-nature-gold" />
                            <span>{formFotoUrl ? 'Ganti Foto Santri' : 'Unggah Foto Santri'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handlePhotoChange}
                              className="hidden" 
                            />
                          </label>
                        </div>
                        <p className="text-[10px] text-slate-500 font-medium">
                          Format: JPG, PNG, atau WEBP (Maks 3MB). Foto akan muncul di data santri & portal orang tua.
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Atau URL:</span>
                          <input 
                            type="text" 
                            placeholder="https://... (URL Foto)"
                            value={formFotoUrl}
                            onChange={(e) => setFormFotoUrl(e.target.value)}
                            className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[11px] focus:outline-none focus:border-nature-forest font-mono text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Nomor Induk Siswa Nasional (NISN) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNis}
                        onChange={(e) => setFormNis(e.target.value)}
                        placeholder="Contoh: 0081234567"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 focus:border-pesantren-emerald-600 font-mono text-sm"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Nama Lengkap Santri <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNama}
                        onChange={(e) => setFormNama(e.target.value)}
                        placeholder="Contoh: Muhammad Yusuf"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 focus:border-pesantren-emerald-600 font-bold"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Jenis Kelamin / Asrama <span className="text-red-500">*</span></label>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          formGender === 'Laki-laki' 
                            ? 'border-emerald-600 bg-emerald-50/40 text-emerald-800 font-bold' 
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}>
                          <input 
                            type="radio" 
                            name="gender" 
                            checked={formGender === 'Laki-laki'}
                            onChange={() => setFormGender('Laki-laki')}
                            className="hidden" 
                          />
                          Putra (Pa)
                        </label>
                        <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
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
                          Putri (Pi)
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Tempat Lahir</label>
                        <input 
                          type="text" 
                          value={formTempatLahir}
                          onChange={(e) => setFormTempatLahir(e.target.value)}
                          placeholder="Contoh: Jambi"
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Tanggal Lahir</label>
                        <input 
                          type="date" 
                          value={formTanggalLahir}
                          onChange={(e) => setFormTanggalLahir(e.target.value)}
                          className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700">Alamat Lengkap Asal Santri</label>
                    <textarea 
                      value={formAlamat}
                      onChange={(e) => setFormAlamat(e.target.value)}
                      placeholder="Tuliskan alamat lengkap..."
                      rows={2}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 focus:border-pesantren-emerald-600"
                    />
                  </div>
                </div>

                {/* Section 2: Data Penempatan & Status */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    2. Data Akademik & Asrama
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Penempatan Kelas</label>
                      <input 
                        type="text" 
                        value={formKelas}
                        onChange={(e) => setFormKelas(e.target.value)}
                        placeholder="Contoh: 10-A (Ula)"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 focus:border-pesantren-emerald-600 font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Kamar Asrama</label>
                      <select 
                        value={formIdKamar}
                        onChange={(e) => setFormIdKamar(e.target.value)}
                        className="w-full p-2.5 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600"
                      >
                        <option value="">-- Pilih Kamar --</option>
                        {kamar
                          .filter(k => {
                            // Filter kamar matching gender asrama
                            const isPutraKamar = k.gedung.includes('Putra');
                            return formGender === 'Laki-laki' ? isPutraKamar : !isPutraKamar;
                          })
                          .map(k => (
                            <option key={k.id} value={k.id}>{k.namaKamar} ({k.gedung.includes('Putra') ? 'Pa' : 'Pi'})</option>
                          ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-700">Status Keaktifan Santri <span className="text-red-500">*</span></label>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            formStatus === 'Aktif' 
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800 font-bold' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <input 
                              type="radio" 
                              name="status" 
                              checked={formStatus === 'Aktif'}
                              onChange={() => setFormStatus('Aktif')}
                              className="hidden" 
                            />
                            Aktif Menetap
                          </label>
                          <label className={`border p-2.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                            formStatus === 'Pindah' 
                              ? 'border-amber-600 bg-amber-50 text-amber-800 font-bold' 
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}>
                            <input 
                              type="radio" 
                              name="status" 
                              checked={formStatus === 'Pindah'}
                              onChange={() => {
                                if (editingSantri && editingSantri.status === 'Aktif') {
                                  setPendingStatusChange('Pindah');
                                  setIsPinModalOpen(true);
                                  setPinInput('');
                                  setPinError('');
                                } else {
                                  setFormStatus('Pindah');
                                }
                              }}
                              className="hidden" 
                            />
                            Sudah Pindah
                          </label>
                        </div>
                      </div>

                      {formStatus === 'Pindah' && (
                        <motion.div 
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="space-y-1"
                        >
                          <label className="font-semibold text-slate-700">Tanggal Resmi Pindah / Mutasi <span className="text-red-500">*</span></label>
                          <input 
                            type="date" 
                            value={formTanggalPindah}
                            onChange={(e) => setFormTanggalPindah(e.target.value)}
                            className="w-full p-2.5 border border-amber-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 bg-amber-50/10 font-bold text-xs"
                            required={formStatus === 'Pindah'}
                          />
                          <span className="text-[10px] text-amber-700 block font-medium leading-normal">Silakan pilih tanggal anak tersebut pindah dari pondok pesantren.</span>
                        </motion.div>
                      )}
                    </div>

                    <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex flex-col justify-between text-[11px] text-slate-500">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          Status <strong>Pindah</strong> akan menonaktifkan santri dari absensi harian kamar dan mengosongkan kapasitas tempat tidurnya, namun biodata induk tetap disimpan di arsip historical.
                        </span>
                      </div>
                      {formStatus === 'Pindah' && formTanggalPindah && (
                        <div className="mt-2 p-2 bg-amber-50 border border-amber-100 rounded-lg text-amber-800 text-[10px] font-semibold leading-normal">
                          Santri tercatat keluar mutasi pada tanggal: {new Date(formTanggalPindah).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Section 3: Data Wali */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
                    3. Data Orang Tua / Wali
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">Nama Lengkap Orang Tua / Wali <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNamaWali}
                        onChange={(e) => setFormNamaWali(e.target.value)}
                        placeholder="Contoh: Ayah / Ibu Kandung"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700">No. Handphone (Aktif WhatsApp) <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={formNoHpWali}
                        onChange={(e) => setFormNoHpWali(e.target.value)}
                        placeholder="Contoh: 0812XXXXXXXX"
                        className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-pesantren-emerald-600 font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 bg-slate-50/95 backdrop-blur-xs p-4 sm:p-6 -mx-6 -mb-6 rounded-b-2xl sticky bottom-0 z-20 shadow-xs">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsFormOpen(false);
                      if (setTriggerQuickAddOpen) {
                        setTriggerQuickAddOpen(false);
                      }
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-pesantren-emerald-700 hover:bg-pesantren-emerald-800 text-white font-bold rounded-xl shadow-xs"
                  >
                    {editingSantri ? 'Simpan Perubahan' : 'Registrasi Santri'}
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PIN Verification Modal */}
      <AnimatePresence>
        {isPinModalOpen && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-60" id="pin-verification-backdrop">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl border border-slate-150 max-w-sm w-full p-6 text-center space-y-4"
              id="pin-verification-content"
            >
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto border border-amber-100 shadow-3xs">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-800">Verifikasi PIN Keamanan</h3>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Status santri <span className="font-bold text-slate-700">{editingSantri?.nama}</span> akan diubah menjadi <span className="font-extrabold text-amber-700">Pindah</span>. Masukkan PIN Otorisasi untuk melanjutkan tindakan ini.
                </p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-3">
                <div className="relative">
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError('');
                    }}
                    placeholder="Masukkan PIN"
                    className="w-full tracking-widest text-center py-2.5 px-3 border border-slate-200 rounded-xl font-bold font-mono text-base focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 text-slate-800"
                    id="pin-security-input"
                    autoFocus
                    required
                  />
                </div>

                {pinError && (
                  <p className="text-[10px] text-red-600 font-bold flex items-center justify-center gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0" /> {pinError}
                  </p>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCancelPin}
                    className="flex-1 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4 text-amber-200" /> Verifikasi
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
