export type Gender = 'Laki-laki' | 'Perempuan';

export type UserRoleType = 'ADMIN' | 'PENGASUHAN' | 'AKADEMIK' | 'PETUGAS_KLINIK' | 'GURU' | 'ORANG_TUA' | 'LAINNYA';

export interface PenggunaApp {
  id: string;
  username: string; // lowercase unique identifier
  password: string;
  namaLengkap: string;
  role: UserRoleType;
  status: 'Aktif' | 'Nonaktif';
  allowedMenus: string[]; // List of menu IDs user can access
  jabatan?: string;
  noHp?: string;
  createdAt: string;
  lastLogin?: string;
  assignedKamarIds?: string[]; // Daftar ID Kamar binaan / kelolaan Wali Kamar
}


export type StatusSantri = 'Aktif' | 'Pindah' | 'Alumni';

export interface Santri {
  id: string;
  nis: string; // Nomor Induk Siswa Nasional (NISN)
  nama: string;
  gender: Gender;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  namaWali: string;
  noHpWali: string;
  tanggalMasuk: string;
  status: StatusSantri;
  idKamar: string; // Hubungan ke Kamar
  kelas: string;
  tanggalPindah?: string; // Tanggal pindah jika status == 'Pindah'
  fotoUrl?: string; // URL / Base64 foto profil santri
  pinWali?: string; // PIN Rahasia Wali Santri untuk verifikasi Portal Orang Tua
}

export type PeranStaf = 'Pengasuh' | 'Guru' | 'Pengasuh & Guru';

export interface JadwalMengajar {
  id: string;
  hari: 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu' | 'Ahad';
  jamMulai: string; // e.g. "07:30"
  jamSelesai: string; // e.g. "09:00"
  mataPelajaran: string;
  kelas: string;
}

export interface PengasuhGuru {
  id: string;
  nip: string; // Nomor Induk Pendidik
  nama: string;
  gender: Gender;
  peran: PeranStaf;
  spesialisasi: string; // e.g. "Kitab Kuning", "Tahfidz", "Bahasa Arab"
  noHp: string;
  alamat: string;
  jadwal: JadwalMengajar[];
}

export interface InventarisKamar {
  id: string;
  namaBarang: string; // e.g. "Kasur", "Lemari", "Kipas Angin"
  jumlah: number;
  kondisi: 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
}

export interface AbsensiSantriKamar {
  idSantri: string;
  namaSantri: string;
  statusKamar: 'Hadir' | 'Izin' | 'Sakit' | 'Tanpa Keterangan';
}

export interface Kamar {
  id: string;
  namaKamar: string; // e.g. "Arafah 01", "Mina 03"
  gedung: 'Asrama Putra (Pa)' | 'Asrama Putri (Pi)';
  kapasitas: number;
  inventaris: InventarisKamar[];
  // Absensi kamar untuk hari ini
  absensiHariIni: AbsensiSantriKamar[];
  waliKamar?: string; // Nama wali kamar / musyrif / musyrifah dari data guru
}

export interface LogAktivitas {
  id: string;
  timestamp: string; // ISO String
  kategori: 'Santri' | 'Akademik' | 'Kamar' | 'Keuangan' | 'Sistem' | 'Klinik';
  tipe: 'info' | 'success' | 'warning' | 'danger';
  pesan: string;
  actor: string;
}

// Data Keuangan untuk laporan bulanan
export interface CatatanKeuangan {
  id: string;
  tanggal: string; // YYYY-MM-DD
  tipe: 'Pemasukan' | 'Pengeluaran';
  kategori: string; // Syahriah, Donasi, Operasional, Gaji Guru, dll
  nominal: number;
  keterangan: string;
}

export interface LaporanSummary {
  pemasukanTotal: number;
  pengeluaranTotal: number;
  absensiRataRata: number; // Persentase kehadiran santri
  santriMasuk: number;
  santriPindah: number;
}

export type KategoriPelanggaran = 'Ringan' | 'Sedang' | 'Berat';

export interface PelanggaranSantri {
  id: string;
  idSantri: string;
  namaSantri: string;
  kelasSantri: string;
  tanggal: string; // YYYY-MM-DD
  kategori: KategoriPelanggaran;
  jenisPelanggaran: string; // Contoh: Membawa HP, Terlambat Berjamaah, Kabur
  hukuman: string; // Takzir / Tindakan disiplin yang diberikan
  catatan?: string;
  petugas: string; // Nama ustadz / pengasuh yang mencatat
}

export type KategoriPrestasi = 'Akademik' | 'Non-Akademik' | 'Keagamaan' | 'Pengabdian' | 'Lainnya';

export interface Prestasi {
  id: string;
  penerimaTipe: 'Santri' | 'Guru';
  penerimaId: string; // ID of Santri or Guru
  penerimaNama: string; // Cache the name of Santri or Guru
  judul: string; // e.g. "Juara 1 MQK"
  kategori: KategoriPrestasi;
  tanggal: string; // YYYY-MM-DD
  penyelenggara: string; // e.g. "Kemenag RI"
  deskripsi: string;
  fotoUrl?: string; // Base64 or object URL of uploaded photo
}

// MUTABA'AH SANTRI TYPES
export type KategoriMutabaah = 
  | 'SPIRITUAL DISCIPLINE' 
  | 'DZIKIR' 
  | 'AL-QUR\'AN' 
  | 'ILMU' 
  | 'HEALTHY LIFE' 
  | 'CHARACTER';

export interface TargetMasterItem {
  id: string;
  kategori: KategoriMutabaah;
  program: string;
  target: number;
  satuan: string; // e.g. "Rakaat", "Halaman", "Menit", "Kata", "Kali", "Check"
  nilaiAmal: string; // e.g. "27 Derajat", "Rumah di Surga"
  dalil: string; // e.g. "HR. Bukhari Muslim"
  referensi: string; // e.g. "Bukhari 645"
  tipeInput: 'stepper' | 'switch';
}

export interface MutabaahItemResult {
  programId: string;
  programName: string;
  kategori: KategoriMutabaah;
  target: number;
  satuan: string;
  capaian: number;
  skor: number;
  persentase: number; // (capaian / target) * 100
  nilaiAmal: string;
  dalil: string;
  referensi: string;
}

export interface RecordMutabaahSantri {
  id: string; // e.g. `mutabaah_${idSantri}_${tanggal}`
  idSantri: string;
  namaSantri: string;
  nisSantri: string;
  idKamar: string;
  namaKamar: string;
  musyrifNama: string;
  tanggal: string; // YYYY-MM-DD
  items: MutabaahItemResult[];
  totalSkor: number;
  rataRataPersentase: number;
  catatanMusyrif?: string;
  rekomendasi?: string;
  updatedAt: string;
}

// ---------------------------------------------------------------------------
// KLINIK KESEHATAN DARUL ARIFIN (UKS PONDOK PESANTREN) TYPES
// ---------------------------------------------------------------------------

export type TriageLevel = 'Hijau (Ringan)' | 'Kuning (Sedang)' | 'Merah (Darurat)';

export type StatusIstirahatKlinik = 
  | 'Kembali ke Kamar/KBM' 
  | 'Rawat Inap UKS' 
  | 'Rujuk Rumah Sakit' 
  | 'Izin Pulang Berobat';

export interface ResepObatItem {
  idObat: string;
  namaObat: string;
  jumlah: number;
  satuan: string;
  aturanPakai: string; // e.g. "3x1 sesudah makan"
}

export interface KunjunganBerobat {
  id: string;
  idSantri: string;
  namaSantri: string;
  nisSantri: string;
  kelas: string;
  kamar: string;
  gender: Gender;
  tanggal: string; // YYYY-MM-DD
  jam: string; // HH:mm
  keluhanUtama: string;
  triage: TriageLevel;
  suhu?: number; // Celsius
  tekananDarah?: string; // e.g. "120/80"
  sistol?: number;
  diastol?: number;
  diagnosis: string;
  kategoriDiagnosis: 'ISPA & Flu' | 'Gangguan Pencernaan / Maag' | 'Penyakit Kulit / Scabies' | 'Demam & Pusing' | 'Cedera / Fisik' | 'Mata & Telinga' | 'Lain-lain';
  tindakanTerapi: string;
  resepObat: ResepObatItem[];
  statusIstirahat: StatusIstirahatKlinik;
  lamaIstirahatHari?: number;
  petugas: string; // Nama Dokter / Perawat / Musyrif Kesehatan
  catatanPerkembangan?: string;
  isSelesaiRawatInap?: boolean;
}

export interface RekamMedisSantri {
  idSantri: string;
  golonganDarah: 'A' | 'B' | 'AB' | 'O' | 'Belum Tahu';
  riwayatAlergi: string[]; // e.g. ["Seafood", "Amoxicillin"]
  riwayatPenyakitKronis: string[]; // e.g. ["Asma", "Gastritis Kronis"]
  catatanKhusus?: string;
  kontakDaruratOrtu?: string;
  updatedAt: string;
}

export type PeranPetugasKlinik = 'Dokter Pondok' | 'Perawat / Bidan' | 'Musyrif Kesehatan' | 'Tim PMR Santri';

export type ShiftKlinik = 'Pagi (07.00 - 14.00)' | 'Sore (14.00 - 21.00)' | 'Malam/Mider (21.00 - 07.00)';

export interface AbsensiPetugasKlinik {
  id: string;
  tanggal: string; // YYYY-MM-DD
  namaPetugas: string;
  peran: PeranPetugasKlinik;
  shift: ShiftKlinik;
  jamMasuk: string; // HH:mm
  jamKeluar?: string; // HH:mm
  status: 'Hadir Jaga' | 'Izin' | 'Sakit' | 'Piket Emergency';
  keterangan?: string;
}

export type KategoriObat = 
  | 'Obat Bebas & P3K' 
  | 'Obat Resep / Keras' 
  | 'Vitamin & Suplemen' 
  | 'Salep & Obat Luar' 
  | 'Alat Kesehatan & Balut';

export interface StokObatLogistik {
  id: string;
  kodeObat: string;
  namaObat: string;
  kategori: KategoriObat;
  stokSekarang: number;
  stokMin: number;
  satuan: 'Tablet' | 'Botol' | 'Strip' | 'Box' | 'Pcs' | 'Tube/Salep' | 'Roll/Perban' | 'Ampul';
  tanggalKadaluarsa: string; // YYYY-MM-DD
  lokasiRak: string; // e.g. "Rak A-02"
  hargaBeliUnit?: number;
  catatan?: string;
}

export interface LogMutasiObat {
  id: string;
  tanggal: string;
  idObat: string;
  namaObat: string;
  tipe: 'Masuk (Pengadaan)' | 'Keluar (Pengobatan)' | 'Koreksi Stok / Kadaluarsa';
  jumlah: number;
  keterangan: string;
  petugas: string;
}

// LITBANG & SDM TYPES
export type UnitKerjaSDM = 
  | 'Pengasuhan Santri & Asrama'
  | 'Madrasah Diniyah & Tahfizh'
  | 'Sekolah Formal (SMP/SMA/MA)'
  | 'Administrasi, Keuangan & Humas'
  | 'Sarana Prasarana & Keamanan'
  | 'Litbang, Kurikulum & SDM';

export type StatusKepegawaian = 'Tetap' | 'Kontrak' | 'Pengabdian' | 'Honorer / Guru Tamu';

export interface KaryawanSDM {
  id: string;
  nipKaryawan: string;
  nama: string;
  gender: Gender;
  jabatan: string;
  unitKerja: UnitKerjaSDM;
  statusKepegawaian: StatusKepegawaian;
  noHp: string;
  email?: string;
  pendidikanTerakhir: string;
  tanggalBergabung: string;
  fotoUrl?: string;
  catatanApresiasi?: string;
}

export interface ItemPenilaianKPI {
  id: string;
  kpiName: string;
  bobotPercent: number; // e.g. 20 (20%)
  target: string; // e.g. "95% Kehadiran", "4 Jurnal/Tahun"
  pencapaianActual: string; // e.g. "98%", "5 Jurnal"
  skorActual: number; // 0 - 100
  catatan?: string;
}

export type KategoriKinerjaSDM = 
  | 'Sangat Baik (A)'
  | 'Baik (B)'
  | 'Cukup (C)'
  | 'Perlu Pembinaan (D)';

export interface PenilaianKinerjaSDM {
  id: string;
  idKaryawan: string;
  nipKaryawan: string;
  namaKaryawan: string;
  jabatan: string;
  unitKerja: UnitKerjaSDM;
  periode: string; // e.g. "Semester Ganjil 2025/2026", "Tahun 2025"
  tanggalPenilaian: string; // YYYY-MM-DD
  penilaiNama: string; // e.g. "Ustadz Dr. H. Ahmad, M.A. (Kepala Litbang)"
  
  // KPI Items
  itemsKPI: ItemPenilaianKPI[];
  skorTotalKPI: number; // Weighted average of KPI (0-100)
  
  // Aspek Penilaian Kinerja Lainnya (Core Values & Competencies)
  skorKedisiplinanPresensi: number; // 0 - 100
  skorAkhlakAdabPesantren: number; // 0 - 100
  skorKompetensiPengasuhanPedagogik: number; // 0 - 100
  skorInovasiRisetLitbang: number; // 0 - 100
  skorPelayananSantriOrtu: number; // 0 - 100

  // Calculation & Results
  totalSkorFinal: number; // Final weighted total (0-100)
  kategoriKinerja: KategoriKinerjaSDM;
  rekomendasiLitbang: string; // Catatan evaluasi, promosi, bonus, atau pembinaan
  statusApproval: 'Draft' | 'Terverifikasi Litbang' | 'Disetujui Mudir';
  catatanMudir?: string;
}

export interface ProgramInovasiLitbang {
  id: string;
  judulProgram: string;
  unitTujuan: UnitKerjaSDM;
  penanggungJawab: string;
  targetOutput: string;
  progressPercent: number; // 0-100
  status: 'Perencanaan' | 'Sedang Berjalan' | 'Selesai Evaluasi' | 'Diterapkan Permanen';
  tanggalMulai: string;
  tanggalSelesai: string;
  anggaranEst?: number;
  keterangan: string;
}

// ---------------------------------------------------------------------------
// TAHFIDZ GAMIFIKASI TYPES
// ---------------------------------------------------------------------------
export type TipeSetoranTahfidz = 
  | 'Hafalan Baru (Ziyadah)' 
  | 'Muroja\'ah Hafalan' 
  | 'Tilawah / Membaca Qur\'an';

export type TingkatKelancaran = 
  | 'Mumtaz (A+)' 
  | 'Jayyid Jiddan (A)' 
  | 'Jayyid (B)' 
  | 'Maqbul (C)';

export interface RecordSetoranTahfidz {
  id: string;
  idSantri: string;
  namaSantri: string;
  kelasSantri: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string; // e.g. "06:30"
  tipeSetoran: TipeSetoranTahfidz;
  surahMulai: string; // e.g. "Al-Baqarah"
  ayatMulai?: number;
  surahSelesai: string;
  ayatSelesai?: number;
  juzNumber?: number; // 1-30
  halamanJumlah: number; // Jumlah halaman
  kelancaran: TingkatKelancaran;
  xpObtained: number; // XP yang didapatkan
  musyrifNama: string; // Ustadz penguji
  catatanMusyrif?: string;
  isStreakBonusApplied?: boolean;
}

export type LevelRankTahfidz = 
  | 'Thalibul \'Ilmi'
  | 'Hafiz Pemula'
  | 'Mutqin Muda'
  | 'Hamilul Qur\'an'
  | 'Al-Hafiz Al-Kamil';

export interface BadgeTahfidz {
  id: string;
  title: string;
  description: string;
  iconName: string;
  colorBg: string;
  colorText: string;
  unlockedAt?: string;
}

export interface ProfilGamifikasiSantri {
  idSantri: string;
  namaSantri: string;
  kelasSantri: string;
  totalXP: number;
  level: number;
  rankTitle: LevelRankTahfidz;
  totalHalamanHafalan: number;
  totalJuzHafal: number;
  totalJuzTilawah: number;
  streakDays: number;
  lastSetoranDate?: string;
  badges: BadgeTahfidz[];
}

export type TingkatHalaqah = "Mubtadi'in" | 'Wustho' | 'Tahfidz';

export interface MajelisHalaqah {
  id: string;
  namaMajelis: string;
  tingkat: TingkatHalaqah;
  gender: Gender;
  musyrif: string;
  lokasi: string;
  jadwal: string;
  targetSelesai: string;
  keterangan?: string;
  santriIds: string[];
}





