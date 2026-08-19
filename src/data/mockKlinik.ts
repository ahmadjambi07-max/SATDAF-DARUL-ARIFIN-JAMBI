import { 
  StokObatLogistik, 
  KunjunganBerobat, 
  RekamMedisSantri, 
  AbsensiPetugasKlinik 
} from '../types';

export const DEFAULT_STOK_OBAT: StokObatLogistik[] = [
  {
    id: 'obt-01',
    kodeObat: 'PCT-500',
    namaObat: 'Paracetamol 500mg',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 240,
    stokMin: 50,
    satuan: 'Tablet',
    tanggalKadaluarsa: '2027-11-20',
    lokasiRak: 'Rak A-01 (Analgesik)',
    catatan: 'Obat penurun panas & pereda nyeri primer'
  },
  {
    id: 'obt-02',
    kodeObat: 'AMX-500',
    namaObat: 'Amoxicillin 500mg',
    kategori: 'Obat Resep / Keras',
    stokSekarang: 18,
    stokMin: 40,
    satuan: 'Strip',
    tanggalKadaluarsa: '2026-12-15',
    lokasiRak: 'Rak B-02 (Antibiotik)',
    catatan: 'Antibiotik spektrum luas (stok mendekati batas minimum)'
  },
  {
    id: 'obt-03',
    kodeObat: 'CTM-4',
    namaObat: 'CTM (Chlorpheniramine Maleate) 4mg',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 150,
    stokMin: 30,
    satuan: 'Tablet',
    tanggalKadaluarsa: '2028-01-10',
    lokasiRak: 'Rak A-03 (Antihistamin)',
    catatan: 'Untuk alergi, gatal, dan bersin'
  },
  {
    id: 'obt-04',
    kodeObat: 'ANT-TB',
    namaObat: 'Antasida Doen Tablet Kunyah',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 85,
    stokMin: 30,
    satuan: 'Tablet',
    tanggalKadaluarsa: '2027-08-14',
    lokasiRak: 'Rak A-02 (Pencernaan)',
    catatan: 'Pereda asam lambung & maag'
  },
  {
    id: 'obt-05',
    kodeObat: 'PER-MED',
    namaObat: 'Permethrin Cream 5% (Gatal Scabies)',
    kategori: 'Salep & Obat Luar',
    stokSekarang: 8,
    stokMin: 15,
    satuan: 'Tube/Salep',
    tanggalKadaluarsa: '2026-09-30',
    lokasiRak: 'Rak C-01 (Topikal)',
    catatan: 'Salep khusus scabies/gatal kulit santri (stok kritis)'
  },
  {
    id: 'obt-06',
    kodeObat: 'VIT-C',
    namaObat: 'Vitamin C 500mg Sweet',
    kategori: 'Vitamin & Suplemen',
    stokSekarang: 320,
    stokMin: 100,
    satuan: 'Tablet',
    tanggalKadaluarsa: '2028-05-01',
    lokasiRak: 'Rak D-01 (Suplemen)',
    catatan: 'Imunitas santri harian'
  },
  {
    id: 'obt-07',
    kodeObat: 'OBH-SYR',
    namaObat: 'OBH Sirup Batuk Dahak 100ml',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 12,
    stokMin: 20,
    satuan: 'Botol',
    tanggalKadaluarsa: '2026-10-18',
    lokasiRak: 'Rak A-04 (Respiratori)',
    catatan: 'Obat batuk dahak'
  },
  {
    id: 'obt-08',
    kodeObat: 'KAS-STERIL',
    namaObat: 'Kasa Steril Husada 16x16cm',
    kategori: 'Alat Kesehatan & Balut',
    stokSekarang: 45,
    stokMin: 20,
    satuan: 'Box',
    tanggalKadaluarsa: '2029-01-01',
    lokasiRak: 'Rak P3K - 01',
    catatan: 'Perawatan luka basah & cedera'
  },
  {
    id: 'obt-09',
    kodeObat: 'BET-RIV',
    namaObat: 'Rivanol Antiseptik 300ml',
    kategori: 'Alat Kesehatan & Balut',
    stokSekarang: 6,
    stokMin: 10,
    satuan: 'Botol',
    tanggalKadaluarsa: '2026-08-20',
    lokasiRak: 'Rak P3K - 02',
    catatan: 'Cairan pembersih luka'
  },
  {
    id: 'obt-10',
    kodeObat: 'ORALIT-S',
    namaObat: 'Oralit Sachet Husada',
    kategori: 'Obat Bebas & P3K',
    stokSekarang: 110,
    stokMin: 40,
    satuan: 'Pcs',
    tanggalKadaluarsa: '2027-12-30',
    lokasiRak: 'Rak A-02 (Pencernaan)',
    catatan: 'Pencegah dehidrasi diare'
  }
];

export const DEFAULT_REKAM_MEDIS: RekamMedisSantri[] = [
  {
    idSantri: 's-1',
    golonganDarah: 'A',
    riwayatAlergi: ['Seafood / Udang', 'Karet Latex'],
    riwayatPenyakitKronis: ['Asma Bronkial'],
    catatanKhusus: 'Gunakan inhaler saat sesak di kamar. Hindari debu karpet masjid.',
    kontakDaruratOrtu: '0812-3456-7890 (Ibu Aminah)',
    updatedAt: '2026-07-25'
  },
  {
    idSantri: 's-2',
    golonganDarah: 'O',
    riwayatAlergi: ['Amoxicillin (Urtikaria)'],
    riwayatPenyakitKronis: ['Gastritis (Maag Akut)'],
    catatanKhusus: 'Tidak boleh telat makan sore, siapkan roti cadangan di kamar.',
    kontakDaruratOrtu: '0813-9876-5432 (Bpk. Rahmad)',
    updatedAt: '2026-07-28'
  },
  {
    idSantri: 's-3',
    golonganDarah: 'B',
    riwayatAlergi: [],
    riwayatPenyakitKronis: [],
    catatanKhusus: 'Kondisi fisik umumnya sangat prima.',
    kontakDaruratOrtu: '0811-2233-4455 (Bpk. Syarif)',
    updatedAt: '2026-07-20'
  }
];

export const DEFAULT_KUNJUNGAN_BEROBAT: KunjunganBerobat[] = [
  {
    id: 'kjg-20260730-01',
    idSantri: 's-1',
    namaSantri: 'Ahmad Fauzi',
    nisSantri: '2024001',
    kelas: 'X IPA 1',
    kamar: 'Arafah 01',
    gender: 'Laki-laki',
    tanggal: '2026-07-30',
    jam: '08:30',
    keluhanUtama: 'Demam tinggi sejak semalam, pusing, dan batuk kering',
    triage: 'Kuning (Sedang)',
    suhu: 38.6,
    tekananDarah: '110/70',
    sistol: 110,
    diastol: 70,
    diagnosis: 'Febris Akut & ISPA Ringan',
    kategoriDiagnosis: 'ISPA & Flu',
    tindakanTerapi: 'Pemeriksaan fisik, kompres hangat, dan istirahat total di bed UKS',
    resepObat: [
      { idObat: 'obt-01', namaObat: 'Paracetamol 500mg', jumlah: 6, satuan: 'Tablet', aturanPakai: '3x1 sesudah makan' },
      { idObat: 'obt-07', namaObat: 'OBH Sirup Batuk Dahak 100ml', jumlah: 1, satuan: 'Botol', aturanPakai: '3x1 sendok makan' },
      { idObat: 'obt-06', namaObat: 'Vitamin C 500mg Sweet', jumlah: 3, satuan: 'Tablet', aturanPakai: '1x1 sesudah makan' }
    ],
    statusIstirahat: 'Rawat Inap UKS',
    lamaIstirahatHari: 1,
    petugas: 'dr. H. Hendra Wijaya',
    catatanPerkembangan: 'Obs Suhu jam 12.00, infus dextrose jika belum mau makan.',
    isSelesaiRawatInap: false
  },
  {
    id: 'kjg-20260730-02',
    idSantri: 's-2',
    namaSantri: 'Muhammad Rizky',
    nisSantri: '2024002',
    kelas: 'X IPS 2',
    kamar: 'Mina 02',
    gender: 'Laki-laki',
    tanggal: '2026-07-30',
    jam: '09:15',
    keluhanUtama: 'Nyeri ulu hati hebat, mual setelah puasa sunnah',
    triage: 'Hijau (Ringan)',
    suhu: 36.8,
    tekananDarah: '120/80',
    sistol: 120,
    diastol: 80,
    diagnosis: 'Gastritis Akut / Dispepsia',
    kategoriDiagnosis: 'Gangguan Pencernaan / Maag',
    tindakanTerapi: 'Pemberian Antasida, minum air hangat dan istirahat 2 jam',
    resepObat: [
      { idObat: 'obt-04', namaObat: 'Antasida Doen Tablet Kunyah', jumlah: 6, satuan: 'Tablet', aturanPakai: '3x1 dikunyah sebelum makan' }
    ],
    statusIstirahat: 'Kembali ke Kamar/KBM',
    lamaIstirahatHari: 0,
    petugas: 'Ns. Siti Rahmah, S.Kep',
    catatanPerkembangan: 'Keadaan membaik setelah 1 jam istirahat di UKS, sudah boleh kembali ke kelas.',
    isSelesaiRawatInap: true
  },
  {
    id: 'kjg-20260729-01',
    idSantri: 's-3',
    namaSantri: 'Fatimah Az-Zahra',
    nisSantri: '2024003',
    kelas: 'XI IPA 1',
    kamar: 'Aisyah 01',
    gender: 'Perempuan',
    tanggal: '2026-07-29',
    jam: '16:00',
    keluhanUtama: 'Gatal-gatal pada sela jari tangan dan lipatan paha sejak 3 hari',
    triage: 'Hijau (Ringan)',
    suhu: 36.5,
    tekananDarah: '110/75',
    sistol: 110,
    diastol: 75,
    diagnosis: 'Scabies / Gatal Kulit Pesantren',
    kategoriDiagnosis: 'Penyakit Kulit / Scabies',
    tindakanTerapi: 'Edukasi kebersihan kasur/handuk & aplikasi salep Permethrin malam hari',
    resepObat: [
      { idObat: 'obt-05', namaObat: 'Permethrin Cream 5%', jumlah: 1, satuan: 'Tube/Salep', aturanPakai: 'Oles seluruh tubuh sebelum tidur' },
      { idObat: 'obt-03', namaObat: 'CTM 4mg', jumlah: 5, satuan: 'Tablet', aturanPakai: '1x1 malam hari jika gatal' }
    ],
    statusIstirahat: 'Kembali ke Kamar/KBM',
    lamaIstirahatHari: 0,
    petugas: 'Ns. Siti Rahmah, S.Kep',
    catatanPerkembangan: 'Handuk & sprei disarankan dijemur terik matahari.',
    isSelesaiRawatInap: true
  },
  {
    id: 'kjg-20260728-01',
    idSantri: 's-4',
    namaSantri: 'Umar Abdullah',
    nisSantri: '2024004',
    kelas: 'XI IPS 1',
    kamar: 'Mina 03',
    gender: 'Laki-laki',
    tanggal: '2026-07-28',
    jam: '10:00',
    keluhanUtama: 'Tersandung saat olahraga futsal, pergelangan kaki kanan bengkak',
    triage: 'Kuning (Sedang)',
    suhu: 36.7,
    tekananDarah: '125/80',
    sistol: 125,
    diastol: 80,
    diagnosis: 'Sprain Ankle Dextra (Keseleo Pergelangan Kaki)',
    kategoriDiagnosis: 'Cedera / Fisik',
    tindakanTerapi: 'Prosedur RICE (Rest, Ice, Compression, Elevation), Balut tekan elastis',
    resepObat: [
      { idObat: 'obt-01', namaObat: 'Paracetamol 500mg', jumlah: 6, satuan: 'Tablet', aturanPakai: '3x1 sesudah makan' }
    ],
    statusIstirahat: 'Kembali ke Kamar/KBM',
    lamaIstirahatHari: 2,
    petugas: 'dr. H. Hendra Wijaya',
    catatanPerkembangan: 'Disarankan istirahat dari kegiatan olah raga & piket berat selama 3 hari.',
    isSelesaiRawatInap: true
  }
];

export const DEFAULT_ABSENSI_PETUGAS_KLINIK: AbsensiPetugasKlinik[] = [
  {
    id: 'abs-01',
    tanggal: '2026-07-30',
    namaPetugas: 'dr. H. Hendra Wijaya',
    peran: 'Dokter Pondok',
    shift: 'Pagi (07.00 - 14.00)',
    jamMasuk: '07:30',
    status: 'Hadir Jaga',
    keterangan: 'Jaga poli kesehatan & visite santri rawat inap'
  },
  {
    id: 'abs-02',
    tanggal: '2026-07-30',
    namaPetugas: 'Ns. Siti Rahmah, S.Kep',
    peran: 'Perawat / Bidan',
    shift: 'Pagi (07.00 - 14.00)',
    jamMasuk: '07:00',
    status: 'Hadir Jaga',
    keterangan: 'Triage & dispensing obat santri'
  },
  {
    id: 'abs-03',
    tanggal: '2026-07-30',
    namaPetugas: 'Ust. Rahmat Hidayat (Musyrif UKS)',
    peran: 'Musyrif Kesehatan',
    shift: 'Sore (14.00 - 21.00)',
    jamMasuk: '13:50',
    status: 'Hadir Jaga',
    keterangan: 'Piket piket kesehatan asrama'
  },
  {
    id: 'abs-04',
    tanggal: '2026-07-30',
    namaPetugas: 'Santri Ahmad Al-Ghazali (PMR)',
    peran: 'Tim PMR Santri',
    shift: 'Malam/Mider (21.00 - 07.00)',
    jamMasuk: '20:55',
    status: 'Hadir Jaga',
    keterangan: 'Piket mider kesehatan kamar malam'
  }
];
