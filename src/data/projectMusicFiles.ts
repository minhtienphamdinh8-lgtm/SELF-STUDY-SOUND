export interface ProjectMusicFile {
  fileName: string;
  relativePath: string;
  title: string;
  artist: string;
  category: 'lofi' | 'pop' | 'other';
  bpm: number | null;
  sizeKb: number;
  notes: string;
}

export const KNOWN_PROJECT_MUSIC_FILES: ProjectMusicFile[] = [
  {
    fileName: 'lofi_rain_432hz.wav',
    relativePath: '/music/lofi_rain_432hz.wav',
    title: 'Giai điệu Mưa Rơi 432Hz (Tệp dự án)',
    artist: 'Self Study Sound Audio Lab',
    category: 'lofi',
    bpm: 72,
    sizeKb: 258,
    notes: 'Tệp âm thanh WAV 432Hz đóng gói sẵn trong thư mục public/music'
  },
  {
    fileName: 'alpha_10hz_study.wav',
    relativePath: '/music/alpha_10hz_study.wav',
    title: 'Sóng Alpha 10Hz Tập Trung Logic (Tệp dự án)',
    artist: 'Brainwave Science THPT Trịnh Hoài Đức',
    category: 'other',
    bpm: null,
    sizeKb: 258,
    notes: 'Tần số Alpha kích hoạt trạng thái tập trung sâu khi ôn tập'
  },
  {
    fileName: 'piano_calm_evening.wav',
    relativePath: '/music/piano_calm_evening.wav',
    title: 'Dương Cầm Thư Thái Cuối Ngày (Tệp dự án)',
    artist: 'Acoustic Study Project',
    category: 'lofi',
    bpm: 68,
    sizeKb: 258,
    notes: 'Giai điệu dương cầm mộc mạc thư giãn tâm trí'
  },
  {
    fileName: 'pink_noise_focus.wav',
    relativePath: '/music/pink_noise_focus.wav',
    title: 'Tiếng Ồn Hồng Khử Tạp Âm (Tệp dự án)',
    artist: 'Acoustic Sound Masking Lab',
    category: 'other',
    bpm: 60,
    sizeKb: 258,
    notes: 'Pink noise che lấp tiếng ồn phòng học hiệu quả'
  }
];

export async function fetchProjectMusicManifest(): Promise<ProjectMusicFile[]> {
  try {
    const res = await fetch('/music/manifest.json');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Could not load /music/manifest.json, using fallback:', err);
  }
  return KNOWN_PROJECT_MUSIC_FILES;
}
