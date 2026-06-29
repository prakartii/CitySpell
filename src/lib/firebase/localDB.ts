// IndexedDB wrapper for offline caching and image storage fallback.
// Safe to import anywhere — returns null/[] when window is unavailable (SSR).

const DB_NAME = 'cityspell_offline';
const DB_VERSION = 1;

export const LOCAL_STORES = {
  ISSUES: 'issues',
  USERS: 'users',
  WARDS: 'wards',
  DEPARTMENTS: 'departments',
  PREDICTIONS: 'predictions',
  NOTIFICATIONS: 'notifications',
  ASSIGNMENTS: 'assignments',
  BLOBS: 'blobs',
} as const;

export type LocalStoreName = (typeof LOCAL_STORES)[keyof typeof LOCAL_STORES];

let _db: IDBDatabase | null = null;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      const stores: { name: LocalStoreName; keyPath: string }[] = [
        { name: LOCAL_STORES.ISSUES, keyPath: 'id' },
        { name: LOCAL_STORES.USERS, keyPath: 'uid' },
        { name: LOCAL_STORES.WARDS, keyPath: 'id' },
        { name: LOCAL_STORES.DEPARTMENTS, keyPath: 'id' },
        { name: LOCAL_STORES.PREDICTIONS, keyPath: 'id' },
        { name: LOCAL_STORES.NOTIFICATIONS, keyPath: 'id' },
        { name: LOCAL_STORES.ASSIGNMENTS, keyPath: 'id' },
        { name: LOCAL_STORES.BLOBS, keyPath: 'id' },
      ];
      for (const { name, keyPath } of stores) {
        if (!db.objectStoreNames.contains(name)) {
          const s = db.createObjectStore(name, { keyPath });
          if (name === LOCAL_STORES.NOTIFICATIONS) s.createIndex('by_user', 'userId');
          if (name === LOCAL_STORES.ISSUES) s.createIndex('by_reporter', 'reportedBy');
        }
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getDB(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;
  if (!_db) {
    try { _db = await openDB(); } catch { return null; }
  }
  return _db;
}

export async function localGet<T>(store: LocalStoreName, key: string): Promise<T | null> {
  const db = await getDB();
  if (!db) return null;
  return new Promise((resolve) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve((req.result as T) ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function localGetAll<T>(store: LocalStoreName): Promise<T[]> {
  const db = await getDB();
  if (!db) return [];
  return new Promise((resolve) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => resolve([]);
  });
}

export async function localPut(store: LocalStoreName, record: Record<string, unknown>): Promise<void> {
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function localDelete(store: LocalStoreName, key: string): Promise<void> {
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
}

// Converts a File to a data URL and persists it in the blobs store.
// Returns the data URL which can be used in <img src> immediately and survives page reloads.
export async function localStoreBlob(id: string, file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const db = await getDB();
        if (db) {
          await localPut(LOCAL_STORES.BLOBS, {
            id,
            dataUrl,
            type: file.type,
            size: file.size,
            name: file.name,
            savedAt: Date.now(),
          });
        }
      } catch {
        // storage failure is non-fatal — caller still gets the data URL
      }
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
}

export async function localGetBlob(id: string): Promise<string | null> {
  const record = await localGet<{ dataUrl: string }>(LOCAL_STORES.BLOBS, id);
  return record?.dataUrl ?? null;
}
