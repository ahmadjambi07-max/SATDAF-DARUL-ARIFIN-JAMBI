/**
 * SatDaf Persistent Local Storage & Cloud Synchronizer
 * Prevents data loss caused by partial Firestore snapshots, offline editing, or page refreshes.
 */

export function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    const parsed = JSON.parse(raw);
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) {
      return defaultValue;
    }
    return parsed as T;
  } catch (e) {
    console.warn(`[SatDaf Storage] Error reading localStorage key "${key}":`, e);
    return defaultValue;
  }
}

export function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[SatDaf Storage] Error writing localStorage key "${key}":`, e);
  }
}

export function getDeletedIds(collectionKey: string): Set<string> {
  try {
    const raw = localStorage.getItem(`satdaf_deleted_${collectionKey}`);
    if (!raw) return new Set<string>();
    const arr = JSON.parse(raw);
    return new Set<string>(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set<string>();
  }
}

export function markIdAsDeleted(collectionKey: string, id: string): void {
  try {
    const set = getDeletedIds(collectionKey);
    set.add(id);
    localStorage.setItem(`satdaf_deleted_${collectionKey}`, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.error(e);
  }
}

export function unmarkIdAsDeleted(collectionKey: string, id: string): void {
  try {
    const set = getDeletedIds(collectionKey);
    if (set.delete(id)) {
      localStorage.setItem(`satdaf_deleted_${collectionKey}`, JSON.stringify(Array.from(set)));
    }
  } catch (e) {
    console.error(e);
  }
}

export function clearDeletedIdsFor(collectionKey: string): void {
  try {
    localStorage.removeItem(`satdaf_deleted_${collectionKey}`);
  } catch (e) {
    console.error(e);
  }
}

/**
 * Merges an incoming Firestore collection with the current local dataset.
 * - Items present in Firestore update or add to local.
 * - Items present in local but missing from Firestore snapshot ARE PRESERVED (preventing partial wipeout).
 * - Items explicitly deleted by user are filtered out.
 */
export function mergeCollections<T>(
  currentList: T[],
  incomingFirestoreList: T[],
  collectionKey?: string,
  sortFn?: (a: T, b: T) => number,
  getId?: (item: T) => string
): T[] {
  const deletedSet = collectionKey ? getDeletedIds(collectionKey) : new Set<string>();

  const extractId = getId || ((item: any) => item?.id || item?.idSantri || '');

  // Map by id
  const map = new Map<string, T>();

  // 1. Seed with current items (if not marked deleted)
  for (const item of currentList) {
    const id = extractId(item);
    if (id && !deletedSet.has(id)) {
      map.set(id, item);
    }
  }

  // 2. Overlay incoming items from Firestore (if not marked deleted)
  for (const incoming of incomingFirestoreList) {
    const id = extractId(incoming);
    if (id && !deletedSet.has(id)) {
      map.set(id, incoming);
    }
  }

  let result = Array.from(map.values());

  if (sortFn) {
    result = result.sort(sortFn);
  }

  return result;
}
