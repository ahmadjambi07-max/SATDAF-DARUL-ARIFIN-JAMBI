import { TargetMasterItem, RecordMutabaahSantri } from '../types';

export const DEFAULT_TARGET_MASTERS: TargetMasterItem[] = [
  // A. SPIRITUAL DISCIPLINE
  {
    id: 'm-1',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Subuh Jamaah',
    target: 2,
    satuan: 'Rakaat',
    nilaiAmal: '27 Derajat',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 645',
    tipeInput: 'stepper'
  },
  {
    id: 'm-2',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Dzuhur Jamaah',
    target: 4,
    satuan: 'Rakaat',
    nilaiAmal: '27 Derajat',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 645',
    tipeInput: 'stepper'
  },
  {
    id: 'm-3',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Ashar Jamaah',
    target: 4,
    satuan: 'Rakaat',
    nilaiAmal: '27 Derajat',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 645',
    tipeInput: 'stepper'
  },
  {
    id: 'm-4',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Maghrib Jamaah',
    target: 3,
    satuan: 'Rakaat',
    nilaiAmal: '27 Derajat',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 645',
    tipeInput: 'stepper'
  },
  {
    id: 'm-5',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Isya Jamaah',
    target: 4,
    satuan: 'Rakaat',
    nilaiAmal: '27 Derajat',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 645',
    tipeInput: 'stepper'
  },
  {
    id: 'm-6',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Rawatib',
    target: 12,
    satuan: 'Rakaat',
    nilaiAmal: 'Rumah di Surga',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 728',
    tipeInput: 'stepper'
  },
  {
    id: 'm-7',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Tahajud',
    target: 8,
    satuan: 'Rakaat',
    nilaiAmal: 'Maqaman Mahmudan (Derajat Terpuji)',
    dalil: 'QS. Al-Isra: 79',
    referensi: 'Al-Isra 79',
    tipeInput: 'stepper'
  },
  {
    id: 'm-8',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Taubat',
    target: 2,
    satuan: 'Rakaat',
    nilaiAmal: 'Diampuni Dosa-dosa',
    dalil: 'HR. Tirmidzi',
    referensi: 'Tirmidzi 406',
    tipeInput: 'stepper'
  },
  {
    id: 'm-9',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Hajat',
    target: 2,
    satuan: 'Rakaat',
    nilaiAmal: 'Dikabulkan Hajat & Doa',
    dalil: 'HR. Tirmidzi',
    referensi: 'Tirmidzi 479',
    tipeInput: 'stepper'
  },
  {
    id: 'm-10',
    kategori: 'SPIRITUAL DISCIPLINE',
    program: 'Witir',
    target: 3,
    satuan: 'Rakaat',
    nilaiAmal: 'Dicintai Allah SWT',
    dalil: 'HR. Abu Dawud',
    referensi: 'Abu Dawud 1416',
    tipeInput: 'stepper'
  },

  // B. DZIKIR
  {
    id: 'm-11',
    kategori: 'DZIKIR',
    program: 'Dzikir Ba\'da Shalat',
    target: 5,
    satuan: 'Waktu',
    nilaiAmal: 'Diampuni Dosa Sebanyak Buih Laut',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 597',
    tipeInput: 'stepper'
  },
  {
    id: 'm-12',
    kategori: 'DZIKIR',
    program: 'Doa Orang Tua',
    target: 5,
    satuan: 'Waktu',
    nilaiAmal: 'Diangkat Derajat Orang Tua di Surga',
    dalil: 'HR. Ahmad',
    referensi: 'Ahmad 10618',
    tipeInput: 'stepper'
  },
  {
    id: 'm-13',
    kategori: 'DZIKIR',
    program: 'Istighosah',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Pertolongan & Keberkahan Hidup',
    dalil: 'QS. Al-Anfal: 9',
    referensi: 'Al-Anfal 9',
    tipeInput: 'switch'
  },
  {
    id: 'm-14',
    kategori: 'DZIKIR',
    program: 'Shalawat Diba\'',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Syafa\'at Rasulullah ﷺ',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 408',
    tipeInput: 'switch'
  },

  // C. AL-QUR'AN
  {
    id: 'm-15',
    kategori: 'AL-QUR\'AN',
    program: 'Tilawah',
    target: 2,
    satuan: 'Halaman',
    nilaiAmal: '10 Kebaikan Tiap Huruf',
    dalil: 'HR. Tirmidzi',
    referensi: 'Tirmidzi 2910',
    tipeInput: 'stepper'
  },
  {
    id: 'm-16',
    kategori: 'AL-QUR\'AN',
    program: 'Setoran Hafalan',
    target: 0.5,
    satuan: 'Halaman',
    nilaiAmal: 'Mahkota Kehormatan untuk Orang Tua',
    dalil: 'HR. Abu Dawud',
    referensi: 'Abu Dawud 1453',
    tipeInput: 'stepper'
  },
  {
    id: 'm-17',
    kategori: 'AL-QUR\'AN',
    program: 'Murajaah',
    target: 2,
    satuan: 'Halaman',
    nilaiAmal: 'Menjaga Hafalan Al-Qur\'an',
    dalil: 'HR. Bukhari',
    referensi: 'Bukhari 5031',
    tipeInput: 'stepper'
  },
  {
    id: 'm-18',
    kategori: 'AL-QUR\'AN',
    program: 'Surah Yasin',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Diampuni Dosa & Hajat Terkabul',
    dalil: 'HR. At-Thabrani',
    referensi: 'Al-Mu\'jam Al-Ausat',
    tipeInput: 'switch'
  },
  {
    id: 'm-19',
    kategori: 'AL-QUR\'AN',
    program: 'Surah Al Kahfi',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Disinari Cahaya Antara Dua Jumat',
    dalil: 'HR. Al-Hakim',
    referensi: 'Mustadrak 2/368',
    tipeInput: 'switch'
  },

  // D. ILMU
  {
    id: 'm-20',
    kategori: 'ILMU',
    program: 'Kosakata Arab',
    target: 3,
    satuan: 'Kata',
    nilaiAmal: 'Memahami Bahasa Al-Qur\'an & Sunnah',
    dalil: 'Umar bin Khattab RA',
    referensi: 'Iqtidho Sirotil Mustaqim',
    tipeInput: 'stepper'
  },
  {
    id: 'm-21',
    kategori: 'ILMU',
    program: 'Kosakata Inggris',
    target: 3,
    satuan: 'Kata',
    nilaiAmal: 'Sarana Dakwah Internasional',
    dalil: 'HR. Tirmidzi',
    referensi: 'Kisah Zaid bin Thabit',
    tipeInput: 'stepper'
  },
  {
    id: 'm-22',
    kategori: 'ILMU',
    program: 'Belajar Ilmu Baru',
    target: 1,
    satuan: 'Jam',
    nilaiAmal: 'Dimudahkan Jalan Menuju Surga',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 2699',
    tipeInput: 'stepper'
  },
  {
    id: 'm-23',
    kategori: 'ILMU',
    program: 'Public Speaking',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Menyampaikan Kebajikan Walau 1 Ayat',
    dalil: 'HR. Bukhari',
    referensi: 'Bukhari 3461',
    tipeInput: 'switch'
  },

  // E. HEALTHY LIFE
  {
    id: 'm-24',
    kategori: 'HEALTHY LIFE',
    program: 'Puasa Sunnah',
    target: 1,
    satuan: 'Hari',
    nilaiAmal: 'Pintu Ar-Rayyan di Surga',
    dalil: 'HR. Bukhari Muslim',
    referensi: 'Bukhari 1896',
    tipeInput: 'switch'
  },
  {
    id: 'm-25',
    kategori: 'HEALTHY LIFE',
    program: 'Olahraga',
    target: 30,
    satuan: 'Menit',
    nilaiAmal: 'Mukmin Kuat Lebih Dicintai Allah',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 2664',
    tipeInput: 'stepper'
  },
  {
    id: 'm-26',
    kategori: 'HEALTHY LIFE',
    program: 'Makan Tepat Waktu',
    target: 3,
    satuan: 'Kali',
    nilaiAmal: 'Kesehatan Badan & Rasa Syukur',
    dalil: 'HR. Tirmidzi',
    referensi: 'Tirmidzi 2380',
    tipeInput: 'stepper'
  },
  {
    id: 'm-27',
    kategori: 'HEALTHY LIFE',
    program: 'Mandi',
    target: 2,
    satuan: 'Kali',
    nilaiAmal: 'Kebersihan Sebagian Dari Iman',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 223',
    tipeInput: 'stepper'
  },
  {
    id: 'm-28',
    kategori: 'HEALTHY LIFE',
    program: 'Tidur Siang',
    target: 30,
    satuan: 'Menit',
    nilaiAmal: 'Qailulah Sunnah Rasulullah ﷺ',
    dalil: 'HR. At-Thabrani',
    referensi: 'Al-Ausat 28/2',
    tipeInput: 'stepper'
  },
  {
    id: 'm-29',
    kategori: 'HEALTHY LIFE',
    program: 'Tidur Malam',
    target: 8,
    satuan: 'Jam',
    nilaiAmal: 'Menjaga Kebugaran Ibadah',
    dalil: 'HR. Bukhari',
    referensi: 'Bukhari 1968',
    tipeInput: 'stepper'
  },

  // F. CHARACTER
  {
    id: 'm-30',
    kategori: 'CHARACTER',
    program: 'Pembersihan Kamar',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Menjaga Kerapihan & Kenyamanan Bersama',
    dalil: 'HR. Tirmidzi',
    referensi: 'Tirmidzi 2799',
    tipeInput: 'switch'
  },
  {
    id: 'm-31',
    kategori: 'CHARACTER',
    program: 'Piket',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Tanggung Jawab & Disiplin Asrama',
    dalil: 'HR. Bukhari',
    referensi: 'Bukhari 671',
    tipeInput: 'switch'
  },
  {
    id: 'm-32',
    kategori: 'CHARACTER',
    program: 'Merapikan Lemari',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Ketertiban & Indahnya Kebersihan',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 91',
    tipeInput: 'switch'
  },
  {
    id: 'm-33',
    kategori: 'CHARACTER',
    program: 'Membantu Teman',
    target: 1,
    satuan: 'Kali',
    nilaiAmal: 'Allah Menolong Hamba Selama Ia Menolong Saudaranya',
    dalil: 'HR. Muslim',
    referensi: 'Muslim 2699',
    tipeInput: 'switch'
  }
];

// Helper calculation function
export function calculateMutabaahItemResult(targetItem: TargetMasterItem, capaian: number) {
  const target = targetItem.target || 1;
  const skor = capaian;
  const persentase = Math.round((capaian / target) * 100);
  return {
    programId: targetItem.id,
    programName: targetItem.program,
    kategori: targetItem.kategori,
    target: targetItem.target,
    satuan: targetItem.satuan,
    capaian,
    skor,
    persentase,
    nilaiAmal: targetItem.nilaiAmal,
    dalil: targetItem.dalil,
    referensi: targetItem.referensi
  };
}

// Generate realistic mock record for a student
export function generateMockRecordForSantri(
  idSantri: string,
  namaSantri: string,
  nisSantri: string,
  idKamar: string,
  namaKamar: string,
  musyrifNama: string,
  tanggal: string,
  multiplier = 1.0,
  masters: TargetMasterItem[] = DEFAULT_TARGET_MASTERS
): RecordMutabaahSantri {
  const items = masters.map(tm => {
    let cap = 0;
    if (tm.tipeInput === 'switch') {
      cap = Math.random() < 0.8 * multiplier ? 1 : 0;
    } else {
      if (tm.program === 'Tilawah') cap = Math.min(10, Math.round(tm.target * (1 + (Math.random() * 1.5 * multiplier))));
      else if (tm.program === 'Murajaah') cap = Math.min(15, Math.round(tm.target * (1 + (Math.random() * 2 * multiplier))));
      else if (tm.program === 'Setoran Hafalan') cap = Math.min(3, Math.round(tm.target * (1 + (Math.random() * 2 * multiplier)) * 2) / 2);
      else if (tm.program === 'Olahraga') cap = Math.min(120, Math.round(tm.target * (0.8 + (Math.random() * 1.2 * multiplier))));
      else cap = Math.min(tm.target * 2, Math.round(tm.target * (0.8 + (Math.random() * 0.4 * multiplier))));
    }
    return calculateMutabaahItemResult(tm, cap);
  });

  const totalSkor = items.reduce((acc, curr) => acc + curr.skor, 0);
  const avgPct = Math.round(items.reduce((acc, curr) => acc + curr.persentase, 0) / items.length);

  return {
    id: `mutabaah_${idSantri}_${tanggal}`,
    idSantri,
    namaSantri,
    nisSantri,
    idKamar,
    namaKamar,
    musyrifNama,
    tanggal,
    items,
    totalSkor,
    rataRataPersentase: avgPct,
    catatanMusyrif: avgPct >= 100 
      ? 'Ananda sangat rajin dan disiplin menuntaskan seluruh target ibadah serta khidmah di asrama.' 
      : 'Perlu ditingkatkan motivasi shalat tahajud dan kedisiplinan piket kamar.',
    rekomendasi: avgPct >= 100
      ? 'Pertahankan istiqomah dan berikan bimbingan peer-tutor kepada teman se-kamar.'
      : 'Diberikan pendampingan istimewa oleh musyrif kamar pada jam tahajud.',
    updatedAt: new Date().toISOString()
  };
}

// Initial mock records - set to empty so system starts fresh with 0 inputs
export const DEFAULT_MUTABAAH_RECORDS: RecordMutabaahSantri[] = [];
