import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs, 
  writeBatch,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { 
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
  RecordSetoranTahfidz
} from './types';
import { DEFAULT_TARGET_MASTERS } from './data/mockMutabaah';
import { DEFAULT_TAHFIDZ_SETORAN } from './data/mockTahfidzGamifikasi';

const firebaseConfig = {
  apiKey: "AIzaSyDw3l5DZ1uWWI0GvOgJ6ORXIxUeq7YBQ3w",
  authDomain: "dulcet-day-2s7sz.firebaseapp.com",
  projectId: "dulcet-day-2s7sz",
  storageBucket: "dulcet-day-2s7sz.firebasestorage.app",
  messagingSenderId: "620463839495",
  appId: "1:620463839495:web:3d4d0fd5d675bf4273cda2"
};

const app = initializeApp(firebaseConfig);
const databaseId = "ai-studio-satdafsistemadmi-0afc1d6c-be3f-4056-a560-9b01eb2d1255";
export const db = getFirestore(app, databaseId);

// Helper to strip undefined values so Firestore does not throw invalid data errors
function cleanData<T>(item: T): T {
  return JSON.parse(JSON.stringify(item));
}

// Global Quota & Offline Status Tracker
type QuotaListener = (exceeded: boolean) => void;
const quotaListeners = new Set<QuotaListener>();
export let isQuotaExceededState = false;

export function onQuotaExceededChange(listener: QuotaListener) {
  quotaListeners.add(listener);
  listener(isQuotaExceededState);
  return () => quotaListeners.delete(listener);
}

export function markQuotaExceeded() {
  if (!isQuotaExceededState) {
    isQuotaExceededState = true;
    quotaListeners.forEach(fn => {
      try { fn(true); } catch (e) { console.error(e); }
    });
  }
}

export function checkIsQuotaError(err: unknown): boolean {
  if (!err) return false;
  const msg = err instanceof Error ? err.message : String(err);
  return (
    msg.includes('Quota limit exceeded') || 
    msg.includes('resource-exhausted') || 
    msg.includes('Quota exceeded') ||
    msg.includes('Free daily read units per project')
  );
}

// One-time Database Bootstrapper using system document indicator
export async function bootstrapDatabaseIfEmpty(
  defaultSantri: Santri[],
  defaultGuru: PengasuhGuru[],
  defaultKamar: Kamar[],
  defaultLogs: LogAktivitas[],
  defaultKeuangan: CatatanKeuangan[],
  defaultPelanggaran: PelanggaranSantri[],
  defaultPrestasi?: Prestasi[]
) {
  if (isQuotaExceededState) return;
  try {
    const statusRef = doc(db, 'system', 'bootstrap');
    const statusSnap = await getDoc(statusRef);
    
    if (!statusSnap.exists()) {
      console.log("Initializing database with default pesantren data...");
      
      // We will perform a series of batch writes to write the default data.
      // 1. Santri
      if (defaultSantri && defaultSantri.length > 0) {
        const santriBatch = writeBatch(db);
        defaultSantri.forEach(item => {
          santriBatch.set(doc(db, 'santri', item.id), cleanData(item));
        });
        await santriBatch.commit();
      }
      
      // 2. Guru
      if (defaultGuru && defaultGuru.length > 0) {
        const guruBatch = writeBatch(db);
        defaultGuru.forEach(item => {
          guruBatch.set(doc(db, 'guru', item.id), cleanData(item));
        });
        await guruBatch.commit();
      }
      
      // 3. Kamar
      if (defaultKamar && defaultKamar.length > 0) {
        const kamarBatch = writeBatch(db);
        defaultKamar.forEach(item => {
          kamarBatch.set(doc(db, 'kamar', item.id), cleanData(item));
        });
        await kamarBatch.commit();
      }
      
      // 4. Logs
      if (defaultLogs && defaultLogs.length > 0) {
        const logsBatch = writeBatch(db);
        defaultLogs.forEach(item => {
          logsBatch.set(doc(db, 'logs', item.id), cleanData(item));
        });
        await logsBatch.commit();
      }
      
      // 5. Keuangan
      if (defaultKeuangan && defaultKeuangan.length > 0) {
        const keuanganBatch = writeBatch(db);
        defaultKeuangan.forEach(item => {
          keuanganBatch.set(doc(db, 'keuangan', item.id), cleanData(item));
        });
        await keuanganBatch.commit();
      }
      
      // 6. Pelanggaran
      if (defaultPelanggaran && defaultPelanggaran.length > 0) {
        const pelanggaranBatch = writeBatch(db);
        defaultPelanggaran.forEach(item => {
          pelanggaranBatch.set(doc(db, 'pelanggaran', item.id), cleanData(item));
        });
        await pelanggaranBatch.commit();
      }

      // 7. Prestasi
      if (defaultPrestasi && defaultPrestasi.length > 0) {
        const prestasiBatch = writeBatch(db);
        defaultPrestasi.forEach(item => {
          prestasiBatch.set(doc(db, 'prestasi', item.id), cleanData(item));
        });
        await prestasiBatch.commit();
      }
      
      // Mark system as bootstrapped
      await setDoc(statusRef, { initialized: true });
      console.log("Database initialization successful!");
    } else {
      console.log("Database already initialized, skipping bootstrap.");
    }
  } catch (err) {
    if (checkIsQuotaError(err)) {
      markQuotaExceeded();
    }
    console.warn("Database bootstrap skipped / quota limit:", err);
  }
}

// 1. Subscribe without automatic empty check & bootstrap
export function subscribeSantri(
  onUpdate: (list: Santri[]) => void
) {
  const colRef = collection(db, 'santri');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: Santri[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Santri);
        });
        // Sort alphabetically by name
        items.sort((a, b) => a.nama.localeCompare(b.nama));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeSantri:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'santri' listener notice:", error?.message || error);
    }
  );
}

export function subscribeGuru(
  onUpdate: (list: PengasuhGuru[]) => void
) {
  const colRef = collection(db, 'guru');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: PengasuhGuru[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as PengasuhGuru);
        });
        items.sort((a, b) => a.nama.localeCompare(b.nama));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeGuru:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'guru' listener notice:", error?.message || error);
    }
  );
}

export function subscribeKamar(
  onUpdate: (list: Kamar[]) => void
) {
  const colRef = collection(db, 'kamar');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: Kamar[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Kamar);
        });
        items.sort((a, b) => a.namaKamar.localeCompare(b.namaKamar));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeKamar:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'kamar' listener notice:", error?.message || error);
    }
  );
}

export function subscribeLogs(
  onUpdate: (list: LogAktivitas[]) => void
) {
  const colRef = collection(db, 'logs');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: LogAktivitas[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as LogAktivitas);
        });
        // Sort newest first
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeLogs:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'logs' listener notice:", error?.message || error);
    }
  );
}

export function subscribeKeuangan(
  onUpdate: (list: CatatanKeuangan[]) => void
) {
  const colRef = collection(db, 'keuangan');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: CatatanKeuangan[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as CatatanKeuangan);
        });
        // Sort by date newest first
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeKeuangan:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'keuangan' listener notice:", error?.message || error);
    }
  );
}

export function subscribePelanggaran(
  onUpdate: (list: PelanggaranSantri[]) => void
) {
  const colRef = collection(db, 'pelanggaran');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: PelanggaranSantri[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as PelanggaranSantri);
        });
        // Sort by date newest first
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribePelanggaran:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'pelanggaran' listener notice:", error?.message || error);
    }
  );
}

export function subscribePrestasi(
  onUpdate: (list: Prestasi[]) => void
) {
  const colRef = collection(db, 'prestasi');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: Prestasi[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as Prestasi);
        });
        // Sort by date newest first
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribePrestasi:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'prestasi' listener notice:", error?.message || error);
    }
  );
}

export function subscribeMutabaahTargets(
  onUpdate: (list: TargetMasterItem[]) => void
) {
  const colRef = collection(db, 'mutabaah_targets');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: TargetMasterItem[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as TargetMasterItem);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeMutabaahTargets:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'mutabaah_targets' listener notice:", error?.message || error);
    }
  );
}

export function subscribeMutabaahRecords(
  onUpdate: (list: RecordMutabaahSantri[]) => void
) {
  const colRef = collection(db, 'mutabaah_records');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: RecordMutabaahSantri[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as RecordMutabaahSantri);
        });
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeMutabaahRecords:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) {
        markQuotaExceeded();
      }
      console.warn("Firestore onSnapshot 'mutabaah_records' listener notice:", error?.message || error);
    }
  );
}

// 2. Mutations
export async function saveSantriDoc(item: Santri) {
  try {
    await setDoc(doc(db, 'santri', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Santri doc:", err);
    throw err;
  }
}

export async function deleteSantriDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'santri', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Santri doc:", err);
    throw err;
  }
}

export async function saveGuruDoc(item: PengasuhGuru) {
  try {
    await setDoc(doc(db, 'guru', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Guru doc:", err);
    throw err;
  }
}

export async function deleteGuruDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'guru', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Guru doc:", err);
    throw err;
  }
}

export async function savePrestasiDoc(item: Prestasi) {
  try {
    await setDoc(doc(db, 'prestasi', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Prestasi doc:", err);
    throw err;
  }
}

export async function deletePrestasiDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'prestasi', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Prestasi doc:", err);
    throw err;
  }
}

export async function saveKamarDoc(item: Kamar) {
  try {
    await setDoc(doc(db, 'kamar', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Kamar doc:", err);
    throw err;
  }
}

export async function deleteKamarDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'kamar', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Kamar doc:", err);
    throw err;
  }
}

export async function saveLogsDoc(item: LogAktivitas) {
  try {
    await setDoc(doc(db, 'logs', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Log doc:", err);
    throw err;
  }
}

export async function saveKeuanganDoc(item: CatatanKeuangan) {
  try {
    await setDoc(doc(db, 'keuangan', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Keuangan doc:", err);
    throw err;
  }
}

export async function deleteKeuanganDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'keuangan', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Keuangan doc:", err);
    throw err;
  }
}

export async function savePelanggaranDoc(item: PelanggaranSantri) {
  try {
    await setDoc(doc(db, 'pelanggaran', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Pelanggaran doc:", err);
    throw err;
  }
}

export async function deletePelanggaranDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'pelanggaran', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Pelanggaran doc:", err);
    throw err;
  }
}

export async function saveMutabaahTargetDoc(item: TargetMasterItem) {
  try {
    await setDoc(doc(db, 'mutabaah_targets', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Mutabaah Target doc:", err);
    throw err;
  }
}

export async function deleteMutabaahTargetDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'mutabaah_targets', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Mutabaah Target doc:", err);
    throw err;
  }
}

export async function resetMutabaahTargetsInDb() {
  if (isQuotaExceededState) return;
  try {
    const colRef = collection(db, 'mutabaah_targets');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    DEFAULT_TARGET_MASTERS.forEach((item) => {
      batch.set(doc(db, 'mutabaah_targets', item.id), cleanData(item));
    });
    await batch.commit();
    console.log("Successfully reset mutabaah_targets in Firestore to default 33 items.");
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error resetting mutabaah_targets:", err);
    throw err;
  }
}

export async function ensureMutabaahTargets33Once() {
  if (isQuotaExceededState) return;
  try {
    const colRef = collection(db, 'mutabaah_targets');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty || snapshot.size < 33) {
      console.log(`mutabaah_targets has ${snapshot.size} items (< 33). Seeding 33 default target items...`);
      await resetMutabaahTargetsInDb();
    }
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.warn("Notice: ensureMutabaahTargets33Once skipped / quota limit:", err);
  }
}

export async function saveMutabaahRecordDoc(item: RecordMutabaahSantri) {
  try {
    await setDoc(doc(db, 'mutabaah_records', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Mutabaah Record doc:", err);
    throw err;
  }
}

export async function batchSaveMutabaahRecords(records: RecordMutabaahSantri[]) {
  try {
    const batch = writeBatch(db);
    records.forEach(r => {
      batch.set(doc(db, 'mutabaah_records', r.id), cleanData(r));
    });
    await batch.commit();
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error in batchSaveMutabaahRecords:", err);
    throw err;
  }
}

export async function deleteMutabaahRecordDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'mutabaah_records', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Mutabaah Record doc:", err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// KLINIK KESEHATAN FIRESTORE SUBSCRIPTIONS & MUTATIONS
// ---------------------------------------------------------------------------

export function subscribeKunjunganBerobat(
  onUpdate: (list: KunjunganBerobat[]) => void
) {
  const colRef = collection(db, 'klinik_kunjungan');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: KunjunganBerobat[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as KunjunganBerobat);
        });
        items.sort((a, b) => `${b.tanggal} ${b.jam}`.localeCompare(`${a.tanggal} ${a.jam}`));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeKunjunganBerobat:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'klinik_kunjungan' listener notice:", error?.message || error);
    }
  );
}

export function subscribeStokObat(
  onUpdate: (list: StokObatLogistik[]) => void
) {
  const colRef = collection(db, 'klinik_stok_obat');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: StokObatLogistik[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as StokObatLogistik);
        });
        items.sort((a, b) => a.namaObat.localeCompare(b.namaObat));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeStokObat:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'klinik_stok_obat' listener notice:", error?.message || error);
    }
  );
}

export function subscribeRekamMedis(
  onUpdate: (list: RekamMedisSantri[]) => void
) {
  const colRef = collection(db, 'klinik_rekam_medis');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: RekamMedisSantri[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as RekamMedisSantri);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeRekamMedis:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'klinik_rekam_medis' listener notice:", error?.message || error);
    }
  );
}

export function subscribeAbsensiPetugasKlinik(
  onUpdate: (list: AbsensiPetugasKlinik[]) => void
) {
  const colRef = collection(db, 'klinik_absensi_petugas');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: AbsensiPetugasKlinik[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as AbsensiPetugasKlinik);
        });
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeAbsensiPetugasKlinik:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'klinik_absensi_petugas' listener notice:", error?.message || error);
    }
  );
}

// Mutations Klinik
export async function saveKunjunganBerobatDoc(item: KunjunganBerobat) {
  try {
    await setDoc(doc(db, 'klinik_kunjungan', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Kunjungan Berobat doc:", err);
    throw err;
  }
}

export async function deleteKunjunganBerobatDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'klinik_kunjungan', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Kunjungan Berobat doc:", err);
    throw err;
  }
}

export async function saveStokObatDoc(item: StokObatLogistik) {
  try {
    await setDoc(doc(db, 'klinik_stok_obat', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Stok Obat doc:", err);
    throw err;
  }
}

export async function deleteStokObatDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'klinik_stok_obat', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Stok Obat doc:", err);
    throw err;
  }
}

export async function saveRekamMedisDoc(item: RekamMedisSantri) {
  try {
    await setDoc(doc(db, 'klinik_rekam_medis', item.idSantri), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Rekam Medis doc:", err);
    throw err;
  }
}

export async function saveAbsensiPetugasKlinikDoc(item: AbsensiPetugasKlinik) {
  try {
    await setDoc(doc(db, 'klinik_absensi_petugas', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Absensi Petugas Klinik doc:", err);
    throw err;
  }
}

export async function deleteAbsensiPetugasKlinikDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'klinik_absensi_petugas', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Absensi Petugas Klinik doc:", err);
    throw err;
  }
}

// Pengguna App Management
export function subscribePenggunaApp(
  onUpdate: (list: PenggunaApp[]) => void
) {
  const colRef = collection(db, 'pengguna_app');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: PenggunaApp[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as PenggunaApp);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribePenggunaApp:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'pengguna_app' listener notice:", error?.message || error);
    }
  );
}

export async function savePenggunaAppDoc(item: PenggunaApp) {
  try {
    await setDoc(doc(db, 'pengguna_app', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving PenggunaApp doc:", err);
    throw err;
  }
}

export async function deletePenggunaAppDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'pengguna_app', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting PenggunaApp doc:", err);
    throw err;
  }
}

// LITBANG & SDM MANAGEMENT
export function subscribeKaryawanSDM(
  onUpdate: (list: KaryawanSDM[]) => void
) {
  const colRef = collection(db, 'karyawan_sdm');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: KaryawanSDM[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as KaryawanSDM);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeKaryawanSDM:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'karyawan_sdm' listener notice:", error?.message || error);
    }
  );
}

export async function saveKaryawanSDMDoc(item: KaryawanSDM) {
  try {
    await setDoc(doc(db, 'karyawan_sdm', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving KaryawanSDM doc:", err);
    throw err;
  }
}

export async function deleteKaryawanSDMDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'karyawan_sdm', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting KaryawanSDM doc:", err);
    throw err;
  }
}

export function subscribePenilaianSDM(
  onUpdate: (list: PenilaianKinerjaSDM[]) => void
) {
  const colRef = collection(db, 'penilaian_sdm');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: PenilaianKinerjaSDM[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as PenilaianKinerjaSDM);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribePenilaianSDM:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'penilaian_sdm' listener notice:", error?.message || error);
    }
  );
}

export async function savePenilaianSDMDoc(item: PenilaianKinerjaSDM) {
  try {
    await setDoc(doc(db, 'penilaian_sdm', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving PenilaianKinerjaSDM doc:", err);
    throw err;
  }
}

export async function deletePenilaianSDMDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'penilaian_sdm', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting PenilaianKinerjaSDM doc:", err);
    throw err;
  }
}

export function subscribeProgramLitbang(
  onUpdate: (list: ProgramInovasiLitbang[]) => void
) {
  const colRef = collection(db, 'program_litbang');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: ProgramInovasiLitbang[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as ProgramInovasiLitbang);
        });
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeProgramLitbang:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'program_litbang' listener notice:", error?.message || error);
    }
  );
}

export async function saveProgramLitbangDoc(item: ProgramInovasiLitbang) {
  try {
    await setDoc(doc(db, 'program_litbang', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving ProgramInovasiLitbang doc:", err);
    throw err;
  }
}

export async function deleteProgramLitbangDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'program_litbang', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting ProgramInovasiLitbang doc:", err);
    throw err;
  }
}



export async function clearLogsInDb() {
  try {
    const colRef = collection(db, 'logs');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error clearing logs:", err);
    throw err;
  }
}

export async function clearAllMutabaahRecordsInDb() {
  try {
    const colRef = collection(db, 'mutabaah_records');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();
    console.log("Successfully cleared all Mutabaah Yaumiyah records from Firestore.");
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error clearing mutabaah_records:", err);
    throw err;
  }
}

export async function resetAllMutabaahRecordsOnce() {
  if (isQuotaExceededState) return;
  try {
    const statusRef = doc(db, 'system', 'mutabaah_reset_2026');
    const statusSnap = await getDoc(statusRef);
    if (!statusSnap.exists()) {
      await clearAllMutabaahRecordsInDb();
      await setDoc(statusRef, { reset: true, timestamp: new Date().toISOString() });
      console.log("One-time mutabaah records reset completed.");
    }
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.warn("Notice: resetAllMutabaahRecordsOnce skipped / quota limit:", err);
  }
}

// ---------------------------------------------------------------------------
// TAHFIDZ GAMIFIKASI FUNCTIONS
// ---------------------------------------------------------------------------
export function subscribeTahfidzSetoran(
  onUpdate: (list: RecordSetoranTahfidz[]) => void
) {
  const colRef = collection(db, 'tahfidz_setoran');
  return onSnapshot(
    colRef,
    (snapshot) => {
      try {
        const items: RecordSetoranTahfidz[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as RecordSetoranTahfidz);
        });
        items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
        onUpdate(items);
      } catch (err) {
        console.error("Error inside subscribeTahfidzSetoran:", err);
      }
    },
    (error) => {
      if (checkIsQuotaError(error)) markQuotaExceeded();
      console.warn("Firestore onSnapshot 'tahfidz_setoran' listener notice:", error?.message || error);
    }
  );
}

export async function saveTahfidzSetoranDoc(item: RecordSetoranTahfidz) {
  try {
    await setDoc(doc(db, 'tahfidz_setoran', item.id), cleanData(item));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error saving Tahfidz Setoran doc:", err);
    throw err;
  }
}

export async function deleteTahfidzSetoranDoc(id: string) {
  try {
    await deleteDoc(doc(db, 'tahfidz_setoran', id));
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error deleting Tahfidz Setoran doc:", err);
    throw err;
  }
}

export async function clearAllTahfidzSetoranInDb() {
  try {
    const colRef = collection(db, 'tahfidz_setoran');
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);
    snapshot.forEach((d) => {
      batch.delete(d.ref);
    });
    await batch.commit();

    const statusRef = doc(db, 'system', 'tahfidz_reset_status');
    await setDoc(statusRef, { cleared: true, timestamp: new Date().toISOString() });
    localStorage.setItem('tahfidz_cleared', 'true');
    console.log("Successfully cleared all Tahfidz Setoran & XP records from Firestore.");
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.error("Error clearing tahfidz_setoran:", err);
    throw err;
  }
}

export async function clearAllTahfidzSetoranOnce() {
  if (isQuotaExceededState) return;
  try {
    const statusRef = doc(db, 'system', 'tahfidz_reset_status');
    const statusSnap = await getDoc(statusRef);
    if (!statusSnap.exists() || !statusSnap.data()?.cleared) {
      await clearAllTahfidzSetoranInDb();
      console.log("One-time tahfidz setoran clear completed.");
    }
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.warn("Notice: clearAllTahfidzSetoranOnce skipped / quota limit:", err);
  }
}

export async function seedTahfidzSetoranIfEmpty() {
  if (isQuotaExceededState) return;
  try {
    const statusRef = doc(db, 'system', 'tahfidz_reset_status');
    const statusSnap = await getDoc(statusRef);
    if (statusSnap.exists() && statusSnap.data()?.cleared) {
      return; // Explicitly cleared by user, do not seed mock setoran
    }
    if (localStorage.getItem('tahfidz_cleared') === 'true') {
      return;
    }

    const colRef = collection(db, 'tahfidz_setoran');
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log("tahfidz_setoran collection is empty. Seeding default setoran data...");
      const batch = writeBatch(db);
      DEFAULT_TAHFIDZ_SETORAN.forEach((item) => {
        batch.set(doc(db, 'tahfidz_setoran', item.id), cleanData(item));
      });
      await batch.commit();
    }
  } catch (err) {
    if (checkIsQuotaError(err)) markQuotaExceeded();
    console.warn("Notice: seedTahfidzSetoranIfEmpty skipped / quota limit:", err);
  }
}

