/**
 * Audio Cache using browser IndexedDB
 * Stores real user-uploaded audio files (Blobs) locally
 * Ensures instant, persistent audio playback without network delay or loss
 */

const DB_NAME = 'self_study_sound_db';
const STORE_NAME = 'audio_files_store';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function getDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  return dbPromise;
}

export interface CachedAudioEntry {
  key: string;
  blob: Blob;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  savedAt: number;
}

/**
 * Save an audio file/blob into local IndexedDB
 */
export async function saveAudioToCache(key: string, blob: Blob, fileName: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);

      const entry: CachedAudioEntry = {
        key,
        blob,
        fileName,
        mimeType: blob.type || 'audio/mpeg',
        fileSizeBytes: blob.size,
        savedAt: Date.now()
      };

      const req = store.put(entry);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (err) {
    console.warn('Failed to save audio to IndexedDB cache:', err);
    return false;
  }
}

/**
 * Retrieve cached audio Blob by key (e.g. audioUrl or trackId)
 */
export async function getAudioFromCache(key: string): Promise<Blob | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => {
        const result = req.result as CachedAudioEntry | undefined;
        resolve(result ? result.blob : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    return null;
  }
}

/**
 * Creates an object URL for a cached audio file if available
 */
const objectUrlRegistry = new Map<string, string>();

export async function resolvePlayableAudioUrl(audioUrl: string, trackId?: string): Promise<string> {
  if (!audioUrl) return '';

  // 1. Check if we already have an active ObjectURL for this URL or track
  if (objectUrlRegistry.has(audioUrl)) {
    return objectUrlRegistry.get(audioUrl)!;
  }
  if (trackId && objectUrlRegistry.has(trackId)) {
    return objectUrlRegistry.get(trackId)!;
  }

  // 2. Check IndexedDB by audioUrl
  let blob = await getAudioFromCache(audioUrl);

  // 3. If not found by audioUrl, check by trackId
  if (!blob && trackId) {
    blob = await getAudioFromCache(trackId);
  }

  // 4. If found in IndexedDB, create a reliable local blob URL
  if (blob) {
    const objUrl = URL.createObjectURL(blob);
    objectUrlRegistry.set(audioUrl, objUrl);
    if (trackId) objectUrlRegistry.set(trackId, objUrl);
    return objUrl;
  }

  // 5. Otherwise return the original audio URL
  return audioUrl;
}
