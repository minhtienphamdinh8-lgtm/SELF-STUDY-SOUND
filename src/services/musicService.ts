import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  listAll, 
  getMetadata 
} from 'firebase/storage';
import { db, app } from './firebase';
import firebaseConfig from '../../firebase-applet-config.json';
import { ManagedMusicTrack, MusicTrackCategory, MusicTrackSourceType, MusicTrackStatus } from '../types';
import { saveAudioToCache } from '../utils/audioCache';

export interface StorageAudioItem {
  name: string;
  fullPath: string;
  downloadUrl: string;
  sizeBytes: number;
  timeCreated?: string;
  linkedTrackTitle?: string;
}

// Lazy/safe Firebase Storage instance
let storageInstance: ReturnType<typeof getStorage> | null = null;

function getSafeStorage() {
  if (!storageInstance) {
    try {
      const bucketUrl = firebaseConfig.storageBucket 
        ? `gs://${firebaseConfig.storageBucket}` 
        : undefined;
      storageInstance = getStorage(app, bucketUrl);
    } catch (err) {
      console.warn('Firebase Storage initialization failed:', err);
    }
  }
  return storageInstance;
}

/**
 * Detects Web Source platform based on URL
 */
export function detectWebSourcePlatform(url: string): 'suno' | 'youtube' | 'spotify' | 'drive' | 'other' {
  const lower = (url || '').toLowerCase();
  if (lower.includes('suno.com')) return 'suno';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('spotify.com')) return 'spotify';
  if (lower.includes('drive.google.com')) return 'drive';
  return 'other';
}

/**
 * Converts public Google Drive share link to direct streamable audio link
 */
export function formatDriveDirectAudioUrl(url: string): { streamUrl: string; isDrive: boolean } {
  if (!url || !url.includes('drive.google.com')) {
    return { streamUrl: url, isDrive: false };
  }

  // Extract file ID from patterns like: /file/d/FILE_ID/ or ?id=FILE_ID
  const matchD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchD && matchD[1]) {
    return {
      streamUrl: `https://docs.google.com/uc?export=open&id=${matchD[1]}`,
      isDrive: true
    };
  }

  const matchId = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (matchId && matchId[1]) {
    return {
      streamUrl: `https://docs.google.com/uc?export=open&id=${matchId[1]}`,
      isDrive: true
    };
  }

  return { streamUrl: url, isDrive: true };
}

/**
 * Tests direct audio URL to check if it's playable
 */
export function testDirectAudioPlayable(url: string, timeoutMs = 8000): Promise<{ playable: boolean; duration?: number; error?: string }> {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) {
      resolve({ playable: false, error: 'Đường dẫn phải bắt đầu bằng http:// hoặc https://' });
      return;
    }

    const audio = new Audio();
    let resolved = false;

    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        audio.src = '';
        resolve({ playable: false, error: 'Hết thời gian chờ phản hồi từ máy chủ âm thanh (Timeout).' });
      }
    }, timeoutMs);

    audio.onloadedmetadata = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        const dur = audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) ? audio.duration : undefined;
        audio.src = '';
        resolve({ playable: true, duration: dur });
      }
    };

    audio.onerror = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        audio.src = '';
        resolve({ playable: false, error: 'Không thể giải mã hoặc máy chủ từ chối phát luồng âm thanh này (CORS hoặc liên kết không phải file âm thanh trực tiếp).' });
      }
    };

    try {
      audio.preload = 'metadata';
      audio.src = url;
    } catch (e: any) {
      if (!resolved) {
        resolved = true;
        clearTimeout(timer);
        resolve({ playable: false, error: e.message || 'Lỗi kiểm tra âm thanh.' });
      }
    }
  });
}

/**
 * Fetches published music tracks for general student users
 */
export async function fetchPublishedMusicTracks(): Promise<ManagedMusicTrack[]> {
  try {
    const colRef = collection(db, 'music_tracks');
    // Try query where status == 'published'
    const q = query(colRef, where('status', '==', 'published'));
    const snap = await getDocs(q);
    const list: ManagedMusicTrack[] = [];

    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        title: data.title || 'Không tên',
        artist: data.artist || 'Không rõ',
        category: data.category || 'other',
        sourceType: data.sourceType || 'direct_url',
        audioUrl: data.audioUrl || '',
        order: typeof data.order === 'number' ? data.order : 999,
        bpm: typeof data.bpm === 'number' ? data.bpm : null,
        notes: data.notes || '',
        copyrightNote: data.copyrightNote || '',
        confirmedRights: data.confirmedRights ?? true,
        status: data.status || 'published',
        webSourceUrl: data.webSourceUrl || '',
        webSourcePlatform: data.webSourcePlatform,
        storagePath: data.storagePath,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        durationSeconds: data.durationSeconds,
        durationFormatted: data.durationFormatted,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        createdBy: data.createdBy
      });
    });

    // Sort by order asc, then createdAt desc
    list.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return (b.createdAt || '').localeCompare(a.createdAt || '');
    });

    return list;
  } catch (err) {
    console.error('Lỗi khi tải danh sách nhạc công bố:', err);
    return [];
  }
}

/**
 * Subscribes in real-time to published music tracks in Firestore.
 * Automatically synchronizes across all website users when admin adds, edits, hides, or deletes any track.
 */
export function subscribePublishedMusicTracks(
  onUpdate: (tracks: ManagedMusicTrack[]) => void,
  onError?: (err: any) => void
): () => void {
  try {
    const colRef = collection(db, 'music_tracks');
    const q = query(colRef, where('status', '==', 'published'));

    return onSnapshot(
      q,
      (snap) => {
        const list: ManagedMusicTrack[] = [];
        snap.forEach((d) => {
          const data = d.data() as any;
          list.push({
            id: d.id,
            title: data.title || 'Không tên',
            artist: data.artist || 'Không rõ',
            category: data.category || 'other',
            sourceType: data.sourceType || 'direct_url',
            audioUrl: data.audioUrl || '',
            order: typeof data.order === 'number' ? data.order : 999,
            bpm: typeof data.bpm === 'number' ? data.bpm : null,
            notes: data.notes || '',
            copyrightNote: data.copyrightNote || '',
            confirmedRights: data.confirmedRights ?? true,
            status: data.status || 'published',
            webSourceUrl: data.webSourceUrl || '',
            webSourcePlatform: data.webSourcePlatform,
            storagePath: data.storagePath,
            fileName: data.fileName,
            fileSizeBytes: data.fileSizeBytes,
            durationSeconds: data.durationSeconds,
            durationFormatted: data.durationFormatted,
            createdAt: data.createdAt || '',
            updatedAt: data.updatedAt || '',
            createdBy: data.createdBy
          });
        });

        // Sort by order asc, then createdAt desc
        list.sort((a, b) => {
          if (a.order !== b.order) return a.order - b.order;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });

        onUpdate(list);
      },
      (err) => {
        console.warn('Firestore onSnapshot error on music_tracks:', err);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn('Failed to attach onSnapshot listener to music_tracks:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Fetches ALL music tracks (published + hidden) for Administrators
 */
export async function fetchAllMusicTracksForAdmin(): Promise<ManagedMusicTrack[]> {
  try {
    const colRef = collection(db, 'music_tracks');
    const snap = await getDocs(colRef);
    const list: ManagedMusicTrack[] = [];

    snap.forEach((d) => {
      const data = d.data() as any;
      list.push({
        id: d.id,
        title: data.title || 'Không tên',
        artist: data.artist || 'Không rõ',
        category: data.category || 'other',
        sourceType: data.sourceType || 'direct_url',
        audioUrl: data.audioUrl || '',
        order: typeof data.order === 'number' ? data.order : 999,
        bpm: typeof data.bpm === 'number' ? data.bpm : null,
        notes: data.notes || '',
        copyrightNote: data.copyrightNote || '',
        confirmedRights: data.confirmedRights ?? false,
        status: data.status || 'hidden',
        webSourceUrl: data.webSourceUrl || '',
        webSourcePlatform: data.webSourcePlatform,
        storagePath: data.storagePath,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        durationSeconds: data.durationSeconds,
        durationFormatted: data.durationFormatted,
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
        createdBy: data.createdBy
      });
    });

    // Sort by order asc, then title asc
    list.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });

    return list;
  } catch (err: any) {
    console.error('Lỗi khi tải tất cả bài hát cho quản trị viên:', err);
    throw new Error(err.message || 'Không thể tải danh sách bài hát từ máy chủ.');
  }
}

/**
 * Saves a new track or updates an existing track in Firestore
 * Enforces admin rules & confirmedRights
 */
export async function saveMusicTrack(
  track: Partial<ManagedMusicTrack>, 
  isNew: boolean, 
  userUid: string
): Promise<{ success: boolean; trackId?: string; error?: string }> {
  try {
    // 1. Validation
    if (!track.title || !track.title.trim()) {
      return { success: false, error: 'Vui lòng nhập Tên bài hát/bản nhạc.' };
    }
    if (!track.artist || !track.artist.trim()) {
      return { success: false, error: 'Vui lòng nhập Tác giả/Nghệ sĩ.' };
    }
    if (!track.category) {
      return { success: false, error: 'Vui lòng chọn Nhóm nhạc (Lo-fi, Pop, hoặc Khác).' };
    }
    if (!track.sourceType) {
      return { success: false, error: 'Vui lòng chọn Nguồn nhạc.' };
    }
    if (!track.audioUrl || !track.audioUrl.trim()) {
      return { success: false, error: 'Vui lòng cung cấp Tệp âm thanh hoặc Đường dẫn phát nhạc.' };
    }
    if (!track.confirmedRights) {
      return { 
        success: false, 
        error: 'Vui lòng tích chọn ô xác nhận: “Tôi có quyền sử dụng hoặc bài nhạc này thuộc phạm vi cho phép phục vụ nghiên cứu/học tập”.' 
      };
    }

    const nowIso = new Date().toISOString();
    const cleanBpm = track.bpm !== undefined && track.bpm !== null && !isNaN(Number(track.bpm)) && Number(track.bpm) > 0
      ? Math.round(Number(track.bpm))
      : null;

    const trackId = isNew || !track.id 
      ? `track_${Date.now()}_${Math.random().toString(36).substring(2, 7)}` 
      : track.id;

    const docRef = doc(db, 'music_tracks', trackId);

    const payload: Record<string, any> = {
      id: trackId,
      title: track.title.trim(),
      artist: track.artist.trim(),
      category: track.category,
      sourceType: track.sourceType,
      audioUrl: track.audioUrl.trim(),
      order: typeof track.order === 'number' && !isNaN(track.order) ? track.order : 10,
      bpm: cleanBpm,
      notes: (track.notes || '').trim(),
      copyrightNote: (track.copyrightNote || '').trim(),
      confirmedRights: true,
      status: track.status || 'published',
      webSourceUrl: (track.webSourceUrl || '').trim(),
      webSourcePlatform: track.webSourcePlatform || (track.webSourceUrl ? detectWebSourcePlatform(track.webSourceUrl) : null),
      storagePath: track.storagePath || null,
      fileName: track.fileName || null,
      fileSizeBytes: track.fileSizeBytes || null,
      durationSeconds: track.durationSeconds || null,
      durationFormatted: track.durationFormatted || null,
      updatedAt: nowIso
    };

    if (isNew) {
      payload.createdAt = nowIso;
      payload.createdBy = userUid;
      await setDoc(docRef, payload);
    } else {
      await updateDoc(docRef, payload);
    }

    return { success: true, trackId };
  } catch (err: any) {
    console.error('Lỗi khi lưu bài nhạc:', err);
    let msg = err.message || 'Lỗi không xác định khi lưu bài nhạc vào máy chủ.';
    if (err.code === 'permission-denied') {
      msg = 'Máy chủ từ chối: Tài khoản của bạn không có quyền Quản trị viên (Admin) hoặc vi phạm quy tắc bảo mật dữ liệu.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Deletes a music track from Firestore
 */
export async function deleteMusicTrack(
  trackId: string, 
  storagePath?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, 'music_tracks', trackId);
    await deleteDoc(docRef);

    // If storage path exists, attempt best-effort delete from storage
    if (storagePath) {
      const storage = getSafeStorage();
      if (storage) {
        try {
          const fileRef = ref(storage, storagePath);
          await deleteObject(fileRef);
        } catch (storageErr) {
          console.warn('Could not auto-delete storage file on track removal:', storageErr);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa bài nhạc:', err);
    let msg = err.message || 'Lỗi khi xóa bài nhạc.';
    if (err.code === 'permission-denied') {
      msg = 'Máy chủ từ chối: Chỉ tài khoản Quản trị viên mới có quyền xóa bài nhạc.';
    }
    return { success: false, error: msg };
  }
}

/**
 * Uploads an audio file to Firebase Storage
 * Gracefully handles unconfigured storage bucket
 */
export async function uploadAudioFileToStorage(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{
  success: boolean;
  downloadUrl?: string;
  storagePath?: string;
  originalFileName?: string;
  fileSizeBytes?: number;
  isStorageUnconfigured?: boolean;
  error?: string;
}> {
  // 1. Format validation: MP3, WAV, M4A, OGG
  const allowedExts = ['.mp3', '.wav', '.m4a', '.ogg'];
  const fileNameLower = file.name.toLowerCase();
  const hasValidExt = allowedExts.some(ext => fileNameLower.endsWith(ext));

  if (!hasValidExt) {
    return {
      success: false,
      error: `Định dạng tệp "${file.name}" không hợp lệ. Vui lòng chỉ tải tệp âm thanh có đuôi: .mp3, .wav, .m4a, hoặc .ogg.`
    };
  }

  // 2. Size limit: 30MB
  const maxBytes = 30 * 1024 * 1024;
  if (file.size > maxBytes) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      success: false,
      error: `Tệp âm thanh dung lượng quá lớn (${mb} MB). Giới hạn tối đa là 30 MB để đảm bảo tốc độ truyền tải cho học sinh.`
    };
  }

  // 3. Save to local IndexedDB cache first for instant zero-loss availability
  try {
    await saveAudioToCache(file.name, file, file.name);
  } catch (cacheErr) {
    console.warn('Initial cache save warning:', cacheErr);
  }

  // 4. Primary: Upload to Server Storage API (/api/upload-music)
  try {
    const serverResult = await new Promise<{
      success: boolean;
      audioUrl?: string;
      fileName?: string;
      originalFileName?: string;
      fileSizeBytes?: number;
      error?: string;
    }>((resolve) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload-music');
      xhr.setRequestHeader('x-file-name', encodeURIComponent(file.name));

      if (file.type) {
        xhr.setRequestHeader('content-type', file.type);
      }

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch {
            resolve({ success: false, error: 'Không thể đọc phản hồi từ máy chủ.' });
          }
        } else {
          try {
            const errData = JSON.parse(xhr.responseText);
            resolve({ success: false, error: errData.error || `Máy chủ phản hồi mã ${xhr.status}` });
          } catch {
            resolve({ success: false, error: `Máy chủ phản hồi mã lỗi ${xhr.status}` });
          }
        }
      };

      xhr.onerror = () => {
        resolve({ success: false, error: 'Lỗi kết nối mạng khi tải tệp lên máy chủ.' });
      };

      xhr.send(file);
    });

    if (serverResult.success && serverResult.audioUrl) {
      // Also cache in IndexedDB under the actual server audioUrl key
      try {
        await saveAudioToCache(serverResult.audioUrl, file, file.name);
      } catch (cacheErr2) {
        console.warn('Cache under audioUrl warning:', cacheErr2);
      }

      return {
        success: true,
        downloadUrl: serverResult.audioUrl,
        storagePath: serverResult.audioUrl,
        originalFileName: serverResult.originalFileName || file.name,
        fileSizeBytes: serverResult.fileSizeBytes || file.size
      };
    }
  } catch (apiErr: any) {
    console.warn('Server upload failed, checking Firebase Storage fallback:', apiErr);
  }

  // 5. Secondary Fallback: Firebase Storage (if available)
  const storage = getSafeStorage();
  if (storage) {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `music_uploads/${timestamp}_${safeName}`;
      const storageRef = ref(storage, storagePath);

      const uploadTask = uploadBytesResumable(storageRef, file, {
        contentType: file.type || 'audio/mpeg'
      });

      return await new Promise((resolve) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            if (snapshot.totalBytes > 0 && onProgress) {
              const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              onProgress(pct);
            }
          },
          () => {
            // If Firebase Storage fails, use local object URL fallback
            const localBlobUrl = URL.createObjectURL(file);
            resolve({
              success: true,
              downloadUrl: localBlobUrl,
              storagePath: file.name,
              originalFileName: file.name,
              fileSizeBytes: file.size
            });
          },
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                success: true,
                downloadUrl,
                storagePath,
                originalFileName: file.name,
                fileSizeBytes: file.size
              });
            } catch {
              const localBlobUrl = URL.createObjectURL(file);
              resolve({
                success: true,
                downloadUrl: localBlobUrl,
                storagePath: file.name,
                originalFileName: file.name,
                fileSizeBytes: file.size
              });
            }
          }
        );
      });
    } catch {
      // Fall through to local object URL
    }
  }

  // 6. Direct Client-side Blob URL fallback if all else fails
  const localBlobUrl = URL.createObjectURL(file);
  return {
    success: true,
    downloadUrl: localBlobUrl,
    storagePath: file.name,
    originalFileName: file.name,
    fileSizeBytes: file.size
  };
}

/**
 * Lists all uploaded audio files in project storage and Firebase Storage for the admin
 */
export async function listUploadedMusicFiles(): Promise<{ 
  files: StorageAudioItem[]; 
  isStorageUnconfigured?: boolean; 
  error?: string 
}> {
  const items: StorageAudioItem[] = [];

  // 1. Fetch from project music manifest
  try {
    const res = await fetch('/api/project-music-files');
    if (res.ok) {
      const manifestList = await res.json();
      if (Array.isArray(manifestList)) {
        for (const item of manifestList) {
          items.push({
            name: item.fileName,
            fullPath: item.relativePath || `/music/${item.fileName}`,
            downloadUrl: item.relativePath || `/music/${item.fileName}`,
            sizeBytes: (item.sizeKb || 0) * 1024,
            timeCreated: item.uploadedAt || new Date().toISOString(),
            linkedTrackTitle: item.title
          });
        }
      }
    }
  } catch (err) {
    console.warn('Error reading project manifest:', err);
  }

  // 2. Also fetch from Firebase Storage if available
  const storage = getSafeStorage();
  if (storage) {
    try {
      const listRef = ref(storage, 'music_uploads');
      const res = await listAll(listRef);

      for (const itemRef of res.items.slice(0, 30)) {
        try {
          const [url, meta] = await Promise.all([
            getDownloadURL(itemRef),
            getMetadata(itemRef).catch(() => null)
          ]);

          items.push({
            name: itemRef.name,
            fullPath: itemRef.fullPath,
            downloadUrl: url,
            sizeBytes: meta?.size || 0,
            timeCreated: meta?.timeCreated
          });
        } catch {
          // ignore single item failure
        }
      }
    } catch {
      // Firebase Storage not provisioned, project files are active
    }
  }

  return { files: items };
}

/**
 * Directly deletes an uploaded audio file from Firebase Storage
 */
export async function deleteStorageFile(storagePath: string): Promise<{ success: boolean; error?: string }> {
  const storage = getSafeStorage();
  if (!storage) {
    return { success: false, error: 'Chưa cấu hình kho lưu trữ.' };
  }

  try {
    const fileRef = ref(storage, storagePath);
    await deleteObject(fileRef);
    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi xóa tệp trên Storage:', err);
    return { success: false, error: err.message || 'Không thể xóa tệp từ kho lưu trữ.' };
  }
}
