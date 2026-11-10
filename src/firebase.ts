/**
 * Lapisan penyimpanan SATDAF.
 *
 * Data sekarang disimpan di PostgreSQL milik sendiri (bukan Firebase/Firestore),
 * lewat API internal `/api/collections/...` di server Express. Semua fungsi yang
 * diekspor dipertahankan dengan nama dan tanda tangan yang sama seperti sebelumnya,
 * jadi komponen aplikasi tidak perlu berubah.
 */
import type {
  Santri,
  PengasuhGuru,
  Kamar,
  LogAktivitas,
  CatatanKeuangan,
  PelanggaranSantri,
  Prestasi,
  TargetMasterItem,
  RecordMutabaahSantri,
  KunjunganBerobat,
  StokObatLogistik,
  RekamMedisSantri,
  AbsensiPetugasKlinik,
  PenggunaApp,
  KaryawanSDM,
  PenilaianKinerjaSDM,
  ProgramInovasiLitbang,
  RecordSetoranTahfidz,
} from './types';
import { DEFAULT_TARGET_MASTERS } from './data/mockMutabaah';
import { DEFAULT_TAHFIDZ_SETORAN } from './data/mockTahfidzGamifikasi';

const API = '/api';

function cleanData<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(detail || `Permintaan ${path} gagal (${response.status})`);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const listDocs = <T>(collection: string) => request<T[]>(`/collections/${collection}`);

const saveDoc = (collection: string, item: Record<string, any>) =>
  request(`/collections/${collection}/${encodeURIComponent(String(item.id))}`, {
    method: 'PUT',
    body: JSON.stringify(cleanData(item)),
  });

const deleteDocById = (collection: string, id: string) =>
  request(`/collections/${collection}/${encodeURIComponent(id)}`, { method: 'DELETE' });

const clearCollection = (collection: string) =>
  request(`/collections/${collection}`, { method: 'DELETE' });

const saveMany = (collection: string, items: { id: string }[]) =>
  request(`/collections/${collection}/batch`, {
    method: 'POST',
    body: JSON.stringify({ items: items.map(cleanData) }),
  });

async function getSystemDoc(id: string): Promise<Record<string, unknown> | undefined> {
  const docs = await listDocs<Record<string, unknown>>('system');
  return docs.find((doc) => doc && doc.id === id);
}

/**
 * Berlangganan realtime satu koleksi. Menggantikan Firestore onSnapshot:
 * server mengirim ulang seluruh daftar setiap ada perubahan.
 */
function subscribe<T>(
  collection: string,
  onUpdate: (list: T[]) => void,
  compare?: (a: T, b: T) => number
) {
  const apply = (raw: T[]) => {
    const items = Array.isArray(raw) ? [...raw] : [];
    if (compare) items.sort(compare);
    onUpdate(items);
  };

  const source = new EventSource(`${API}/collections/${collection}/events`);
  source.onmessage = (event) => {
    try {
      apply(JSON.parse(event.data) as T[]);
    } catch (err) {
      console.error(`Error inside subscribe ${collection}:`, err);
    }
  };
  source.onerror = () => {
    console.warn(`Koneksi realtime '${collection}' terputus, menyambung ulang otomatis...`);
  };

  return () => source.close();
}

// ---------------------------------------------------------------------------
// STATUS KUOTA (tidak berlaku lagi untuk PostgreSQL, dipertahankan agar kompatibel)
// ---------------------------------------------------------------------------
type QuotaListener = (exceeded: boolean) => void;
export let isQuotaExceededState = false;

export function onQuotaExceededChange(listener: QuotaListener) {
  listener(isQuotaExceededState);
  return () => {};
}

export function markQuotaExceeded() {
  // PostgreSQL milik sendiri: tidak ada kuota harian.
}

export function checkIsQuotaError(_err?: unknown) {
  return false;
}

// ---------------------------------------------------------------------------
// BOOTSTRAP DATA AWAL
// ---------------------------------------------------------------------------
export async function bootstrapDatabaseIfEmpty(
  defaultSantri: Santri[],
  defaultGuru: PengasuhGuru[],
  defaultKamar: Kamar[],
  defaultLogs: LogAktivitas[],
  defaultKeuangan: CatatanKeuangan[],
  defaultPelanggaran: PelanggaranSantri[],
  defaultPrestasi?: Prestasi[]
) {
  try {
    const status = await getSystemDoc('bootstrap');
    if (status) {
      console.log('Database sudah terinisialisasi, bootstrap dilewati.');
      return;
    }

    console.log('Mengisi database dengan data pesantren awal...');
    if (defaultSantri?.length) await saveMany('santri', defaultSantri);
    if (defaultGuru?.length) await saveMany('guru', defaultGuru);
    if (defaultKamar?.length) await saveMany('kamar', defaultKamar);
    if (defaultLogs?.length) await saveMany('logs', defaultLogs);
    if (defaultKeuangan?.length) await saveMany('keuangan', defaultKeuangan);
    if (defaultPelanggaran?.length) await saveMany('pelanggaran', defaultPelanggaran);
    if (defaultPrestasi?.length) await saveMany('prestasi', defaultPrestasi);

    await saveDoc('system', { id: 'bootstrap', initialized: true });
    console.log('Bootstrap database berhasil.');
  } catch (err) {
    console.warn('Bootstrap database dilewati:', err);
  }
}

// ---------------------------------------------------------------------------
// DATA INDUK: SANTRI, GURU, KAMAR
// ---------------------------------------------------------------------------
export function subscribeSantri(onUpdate: (list: Santri[]) => void) {
  return subscribe<Santri>('santri', onUpdate, (a, b) => a.nama.localeCompare(b.nama));
}

export function subscribeGuru(onUpdate: (list: PengasuhGuru[]) => void) {
  return subscribe<PengasuhGuru>('guru', onUpdate, (a, b) => a.nama.localeCompare(b.nama));
}

export function subscribeKamar(onUpdate: (list: Kamar[]) => void) {
  return subscribe<Kamar>('kamar', onUpdate, (a, b) => a.namaKamar.localeCompare(b.namaKamar));
}

export function subscribeLogs(onUpdate: (list: LogAktivitas[]) => void) {
  return subscribe<LogAktivitas>(
    'logs',
    onUpdate,
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function subscribeKeuangan(onUpdate: (list: CatatanKeuangan[]) => void) {
  return subscribe<CatatanKeuangan>('keuangan', onUpdate, (a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );
}

export function subscribePelanggaran(onUpdate: (list: PelanggaranSantri[]) => void) {
  return subscribe<PelanggaranSantri>('pelanggaran', onUpdate, (a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );
}

export function subscribePrestasi(onUpdate: (list: Prestasi[]) => void) {
  return subscribe<Prestasi>('prestasi', onUpdate, (a, b) => b.tanggal.localeCompare(a.tanggal));
}

export function subscribeMutabaahTargets(onUpdate: (list: TargetMasterItem[]) => void) {
  return subscribe<TargetMasterItem>('mutabaah_targets', onUpdate);
}

export function subscribeMutabaahRecords(onUpdate: (list: RecordMutabaahSantri[]) => void) {
  return subscribe<RecordMutabaahSantri>('mutabaah_records', onUpdate, (a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );
}

export async function saveSantriDoc(item: Santri) {
  try {
    await saveDoc('santri', item);
  } catch (err) {
    console.error('Error saving Santri doc:', err);
    throw err;
  }
}

export async function deleteSantriDoc(id: string) {
  try {
    await deleteDocById('santri', id);
  } catch (err) {
    console.error('Error deleting Santri doc:', err);
    throw err;
  }
}

export async function saveGuruDoc(item: PengasuhGuru) {
  try {
    await saveDoc('guru', item);
  } catch (err) {
    console.error('Error saving Guru doc:', err);
    throw err;
  }
}

export async function deleteGuruDoc(id: string) {
  try {
    await deleteDocById('guru', id);
  } catch (err) {
    console.error('Error deleting Guru doc:', err);
    throw err;
  }
}

export async function savePrestasiDoc(item: Prestasi) {
  try {
    await saveDoc('prestasi', item);
  } catch (err) {
    console.error('Error saving Prestasi doc:', err);
    throw err;
  }
}

export async function deletePrestasiDoc(id: string) {
  try {
    await deleteDocById('prestasi', id);
  } catch (err) {
    console.error('Error deleting Prestasi doc:', err);
    throw err;
  }
}

export async function saveKamarDoc(item: Kamar) {
  try {
    await saveDoc('kamar', item);
  } catch (err) {
    console.error('Error saving Kamar doc:', err);
    throw err;
  }
}

export async function deleteKamarDoc(id: string) {
  try {
    await deleteDocById('kamar', id);
  } catch (err) {
    console.error('Error deleting Kamar doc:', err);
    throw err;
  }
}

export async function saveLogsDoc(item: LogAktivitas) {
  try {
    await saveDoc('logs', item);
  } catch (err) {
    console.error('Error saving Log doc:', err);
    throw err;
  }
}

export async function saveKeuanganDoc(item: CatatanKeuangan) {
  try {
    await saveDoc('keuangan', item);
  } catch (err) {
    console.error('Error saving Keuangan doc:', err);
    throw err;
  }
}

export async function deleteKeuanganDoc(id: string) {
  try {
    await deleteDocById('keuangan', id);
  } catch (err) {
    console.error('Error deleting Keuangan doc:', err);
    throw err;
  }
}

export async function savePelanggaranDoc(item: PelanggaranSantri) {
  try {
    await saveDoc('pelanggaran', item);
  } catch (err) {
    console.error('Error saving Pelanggaran doc:', err);
    throw err;
  }
}

export async function deletePelanggaranDoc(id: string) {
  try {
    await deleteDocById('pelanggaran', id);
  } catch (err) {
    console.error('Error deleting Pelanggaran doc:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// MUTABAAH YAUMIYAH
// ---------------------------------------------------------------------------
export async function saveMutabaahTargetDoc(item: TargetMasterItem) {
  try {
    await saveDoc('mutabaah_targets', item);
  } catch (err) {
    console.error('Error saving Mutabaah Target doc:', err);
    throw err;
  }
}

export async function deleteMutabaahTargetDoc(id: string) {
  try {
    await deleteDocById('mutabaah_targets', id);
  } catch (err) {
    console.error('Error deleting Mutabaah Target doc:', err);
    throw err;
  }
}

export async function resetMutabaahTargetsInDb() {
  try {
    await clearCollection('mutabaah_targets');
    await saveMany('mutabaah_targets', DEFAULT_TARGET_MASTERS);
    console.log('mutabaah_targets berhasil direset ke 33 item default.');
  } catch (err) {
    console.error('Error resetting mutabaah_targets:', err);
    throw err;
  }
}

export async function ensureMutabaahTargets33Once() {
  try {
    const items = await listDocs('mutabaah_targets');
    if (items.length < 33) {
      console.log(`mutabaah_targets berisi ${items.length} item (< 33). Mengisi 33 target default...`);
      await resetMutabaahTargetsInDb();
    }
  } catch (err) {
    console.warn('ensureMutabaahTargets33Once dilewati:', err);
  }
}

export async function saveMutabaahRecordDoc(item: RecordMutabaahSantri) {
  try {
    await saveDoc('mutabaah_records', item);
  } catch (err) {
    console.error('Error saving Mutabaah Record doc:', err);
    throw err;
  }
}

export async function batchSaveMutabaahRecords(records: RecordMutabaahSantri[]) {
  try {
    await saveMany('mutabaah_records', records);
  } catch (err) {
    console.error('Error in batchSaveMutabaahRecords:', err);
    throw err;
  }
}

export async function deleteMutabaahRecordDoc(id: string) {
  try {
    await deleteDocById('mutabaah_records', id);
  } catch (err) {
    console.error('Error deleting Mutabaah Record doc:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// KLINIK KESEHATAN
// ---------------------------------------------------------------------------
export function subscribeKunjunganBerobat(onUpdate: (list: KunjunganBerobat[]) => void) {
  return subscribe<KunjunganBerobat>('klinik_kunjungan', onUpdate, (a, b) =>
    `${b.tanggal} ${b.jam}`.localeCompare(`${a.tanggal} ${a.jam}`)
  );
}

export function subscribeStokObat(onUpdate: (list: StokObatLogistik[]) => void) {
  return subscribe<StokObatLogistik>('klinik_stok_obat', onUpdate, (a, b) =>
    a.namaObat.localeCompare(b.namaObat)
  );
}

export function subscribeRekamMedis(onUpdate: (list: RekamMedisSantri[]) => void) {
  return subscribe<RekamMedisSantri>('klinik_rekam_medis', onUpdate);
}

export function subscribeAbsensiPetugasKlinik(onUpdate: (list: AbsensiPetugasKlinik[]) => void) {
  return subscribe<AbsensiPetugasKlinik>('klinik_absensi_petugas', onUpdate, (a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );
}

export async function saveKunjunganBerobatDoc(item: KunjunganBerobat) {
  try {
    await saveDoc('klinik_kunjungan', item);
  } catch (err) {
    console.error('Error saving Kunjungan Berobat doc:', err);
    throw err;
  }
}

export async function deleteKunjunganBerobatDoc(id: string) {
  try {
    await deleteDocById('klinik_kunjungan', id);
  } catch (err) {
    console.error('Error deleting Kunjungan Berobat doc:', err);
    throw err;
  }
}

export async function saveStokObatDoc(item: StokObatLogistik) {
  try {
    await saveDoc('klinik_stok_obat', item);
  } catch (err) {
    console.error('Error saving Stok Obat doc:', err);
    throw err;
  }
}

export async function deleteStokObatDoc(id: string) {
  try {
    await deleteDocById('klinik_stok_obat', id);
  } catch (err) {
    console.error('Error deleting Stok Obat doc:', err);
    throw err;
  }
}

export async function saveRekamMedisDoc(item: RekamMedisSantri) {
  try {
    // Rekam medis memakai idSantri sebagai kunci dokumen.
    await saveDoc('klinik_rekam_medis', { ...item, id: item.idSantri });
  } catch (err) {
    console.error('Error saving Rekam Medis doc:', err);
    throw err;
  }
}

export async function saveAbsensiPetugasKlinikDoc(item: AbsensiPetugasKlinik) {
  try {
    await saveDoc('klinik_absensi_petugas', item);
  } catch (err) {
    console.error('Error saving Absensi Petugas Klinik doc:', err);
    throw err;
  }
}

export async function deleteAbsensiPetugasKlinikDoc(id: string) {
  try {
    await deleteDocById('klinik_absensi_petugas', id);
  } catch (err) {
    console.error('Error deleting Absensi Petugas Klinik doc:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// PENGGUNA APLIKASI
// ---------------------------------------------------------------------------
export function subscribePenggunaApp(onUpdate: (list: PenggunaApp[]) => void) {
  return subscribe<PenggunaApp>('pengguna_app', onUpdate);
}

export async function savePenggunaAppDoc(item: PenggunaApp) {
  try {
    await saveDoc('pengguna_app', item);
  } catch (err) {
    console.error('Error saving Pengguna App doc:', err);
    throw err;
  }
}

export async function deletePenggunaAppDoc(id: string) {
  try {
    await deleteDocById('pengguna_app', id);
  } catch (err) {
    console.error('Error deleting Pengguna App doc:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// SDM & LITBANG
// ---------------------------------------------------------------------------
export function subscribeKaryawanSDM(onUpdate: (list: KaryawanSDM[]) => void) {
  return subscribe<KaryawanSDM>('karyawan_sdm', onUpdate);
}

export async function saveKaryawanSDMDoc(item: KaryawanSDM) {
  try {
    await saveDoc('karyawan_sdm', item);
  } catch (err) {
    console.error('Error saving Karyawan SDM doc:', err);
    throw err;
  }
}

export async function deleteKaryawanSDMDoc(id: string) {
  try {
    await deleteDocById('karyawan_sdm', id);
  } catch (err) {
    console.error('Error deleting Karyawan SDM doc:', err);
    throw err;
  }
}

export function subscribePenilaianSDM(onUpdate: (list: PenilaianKinerjaSDM[]) => void) {
  return subscribe<PenilaianKinerjaSDM>('penilaian_sdm', onUpdate);
}

export async function savePenilaianSDMDoc(item: PenilaianKinerjaSDM) {
  try {
    await saveDoc('penilaian_sdm', item);
  } catch (err) {
    console.error('Error saving Penilaian SDM doc:', err);
    throw err;
  }
}

export async function deletePenilaianSDMDoc(id: string) {
  try {
    await deleteDocById('penilaian_sdm', id);
  } catch (err) {
    console.error('Error deleting Penilaian SDM doc:', err);
    throw err;
  }
}

export function subscribeProgramLitbang(onUpdate: (list: ProgramInovasiLitbang[]) => void) {
  return subscribe<ProgramInovasiLitbang>('program_litbang', onUpdate);
}

export async function saveProgramLitbangDoc(item: ProgramInovasiLitbang) {
  try {
    await saveDoc('program_litbang', item);
  } catch (err) {
    console.error('Error saving Program Litbang doc:', err);
    throw err;
  }
}

export async function deleteProgramLitbangDoc(id: string) {
  try {
    await deleteDocById('program_litbang', id);
  } catch (err) {
    console.error('Error deleting Program Litbang doc:', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// PEMELIHARAAN DATA
// ---------------------------------------------------------------------------
export async function clearLogsInDb() {
  try {
    await clearCollection('logs');
  } catch (err) {
    console.error('Error clearing logs:', err);
    throw err;
  }
}

export async function clearAllMutabaahRecordsInDb() {
  try {
    await clearCollection('mutabaah_records');
    console.log('Seluruh catatan Mutabaah Yaumiyah berhasil dikosongkan.');
  } catch (err) {
    console.error('Error clearing mutabaah_records:', err);
    throw err;
  }
}

export async function resetAllMutabaahRecordsOnce() {
  try {
    const status = await getSystemDoc('mutabaah_reset_2026');
    if (!status) {
      await clearAllMutabaahRecordsInDb();
      await saveDoc('system', {
        id: 'mutabaah_reset_2026',
        reset: true,
        timestamp: new Date().toISOString(),
      });
      console.log('Reset catatan mutabaah sekali jalan selesai.');
    }
  } catch (err) {
    console.warn('resetAllMutabaahRecordsOnce dilewati:', err);
  }
}

// ---------------------------------------------------------------------------
// TAHFIDZ GAMIFIKASI
// ---------------------------------------------------------------------------
export function subscribeTahfidzSetoran(onUpdate: (list: RecordSetoranTahfidz[]) => void) {
  return subscribe<RecordSetoranTahfidz>('tahfidz_setoran', onUpdate, (a, b) =>
    b.tanggal.localeCompare(a.tanggal)
  );
}

export async function saveTahfidzSetoranDoc(item: RecordSetoranTahfidz) {
  try {
    await saveDoc('tahfidz_setoran', item);
  } catch (err) {
    console.error('Error saving Tahfidz Setoran doc:', err);
    throw err;
  }
}

export async function deleteTahfidzSetoranDoc(id: string) {
  try {
    await deleteDocById('tahfidz_setoran', id);
  } catch (err) {
    console.error('Error deleting Tahfidz Setoran doc:', err);
    throw err;
  }
}

export async function clearAllTahfidzSetoranInDb() {
  try {
    await clearCollection('tahfidz_setoran');
    await saveDoc('system', {
      id: 'tahfidz_reset_status',
      cleared: true,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('tahfidz_cleared', 'true');
    console.log('Seluruh Setoran Tahfidz & XP berhasil dikosongkan.');
  } catch (err) {
    console.error('Error clearing tahfidz_setoran:', err);
    throw err;
  }
}

export async function clearAllTahfidzSetoranOnce() {
  try {
    const status = await getSystemDoc('tahfidz_reset_status');
    if (!status || !status.cleared) {
      await clearAllTahfidzSetoranInDb();
      console.log('Pengosongan setoran tahfidz sekali jalan selesai.');
    }
  } catch (err) {
    console.warn('clearAllTahfidzSetoranOnce dilewati:', err);
  }
}

export async function seedTahfidzSetoranIfEmpty() {
  try {
    const status = await getSystemDoc('tahfidz_reset_status');
    if (status && status.cleared) return;
    if (localStorage.getItem('tahfidz_cleared') === 'true') return;

    const items = await listDocs('tahfidz_setoran');
    if (items.length === 0) {
      console.log('tahfidz_setoran kosong. Mengisi data setoran default...');
      await saveMany('tahfidz_setoran', DEFAULT_TAHFIDZ_SETORAN);
    }
  } catch (err) {
    console.warn('seedTahfidzSetoranIfEmpty dilewati:', err);
  }
}
