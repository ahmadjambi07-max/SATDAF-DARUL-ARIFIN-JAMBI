// Utility to store and retrieve user-uploaded custom MP3 audio for Adzan Subuh
// Uses IndexedDB for high-capacity binary storage with localStorage fallback

const DB_NAME = 'satdaf_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'custom_audio';
const SUBUH_KEY = 'custom_subuh_adhan';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error("IndexedDB not supported"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface CustomAudioMeta {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  dataUrl?: string; // fallback
}

export async function saveCustomSubuhAudio(file: File): Promise<CustomAudioMeta> {
  const meta: CustomAudioMeta = {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type || 'audio/mp3',
    uploadedAt: new Date().toISOString()
  };

  try {
    const db = await openDB();
    const arrayBuffer = await file.arrayBuffer();
    
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({ buffer: arrayBuffer, meta }, SUBUH_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    localStorage.setItem('satdaf_custom_subuh_meta', JSON.stringify(meta));
    return meta;
  } catch (err) {
    console.warn("IndexedDB save failed, falling back to base64 localStorage:", err);
    // Fallback to FileReader base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        meta.dataUrl = dataUrl;
        try {
          localStorage.setItem('satdaf_custom_subuh_dataurl', dataUrl);
          localStorage.setItem('satdaf_custom_subuh_meta', JSON.stringify(meta));
          resolve(meta);
        } catch (e) {
          reject(new Error("Ukuran berkas audio terlalu besar untuk penyimpanan lokal. Disarankan < 10MB."));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}

export async function getCustomSubuhAudioUrl(): Promise<string | null> {
  try {
    const db = await openDB();
    const record = await new Promise<{ buffer: ArrayBuffer; meta: CustomAudioMeta } | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SUBUH_KEY);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });

    if (record && record.buffer) {
      const blob = new Blob([record.buffer], { type: record.meta?.fileType || 'audio/mp3' });
      return URL.createObjectURL(blob);
    }
  } catch (err) {
    console.warn("IndexedDB read error, checking localStorage fallback:", err);
  }

  const fallbackDataUrl = localStorage.getItem('satdaf_custom_subuh_dataurl');
  return fallbackDataUrl || null;
}

export function getCustomSubuhMeta(): CustomAudioMeta | null {
  const raw = localStorage.getItem('satdaf_custom_subuh_meta');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function deleteCustomSubuhAudio(): Promise<void> {
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(SUBUH_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
  localStorage.removeItem('satdaf_custom_subuh_dataurl');
  localStorage.removeItem('satdaf_custom_subuh_meta');
}
