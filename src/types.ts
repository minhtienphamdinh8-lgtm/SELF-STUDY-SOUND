export type NavTab = 
  | 'home' 
  | 'music-info' 
  | 'mood-bot' 
  | 'game' 
  | 'journal' 
  | 'mailbox' 
  | 'admin';

export interface SoundEnvironment {
  id: string;
  name: string;
  bpmRange: string;
  tag: string;
  description: string;
  fullDetail: string;
  benefits: string[];
  suitableSubjects: string[];
  sampleTracksCount: number;
}

export type MusicTrackCategory = 'lofi' | 'pop' | 'other';
export type MusicTrackSourceType = 'upload' | 'direct_url' | 'web_source' | 'project_file';
export type MusicTrackStatus = 'published' | 'hidden';

export interface ManagedMusicTrack {
  id: string;
  title: string;                 // 1. Tên bài hát/bản nhạc
  artist: string;                // 2. Tác giả/Nghệ sĩ
  category: MusicTrackCategory;  // 3. Nhóm nhạc (Lo-fi không lời, Pop có lời, Khác)
  sourceType: MusicTrackSourceType; // 4. Nguồn nhạc (Tải tệp, Đường dẫn trực tiếp, Web Source, Tệp dự án)
  audioUrl: string;              // 5. Tệp âm thanh hoặc đường dẫn phát nhạc
  order: number;                 // 6. Thứ tự ưu tiên hiển thị
  bpm?: number | null;           // 7. Nhịp tim/BPM (nhập thực tế, không tự đoán)
  notes?: string;                // 8. Ghi chú/mô tả ngắn về tác dụng hỗ trợ học tập
  copyrightNote: string;         // 9. Quyền sử dụng/bản quyền
  confirmedRights: boolean;      // 10. Xác nhận quyền sử dụng hoặc phạm vi nghiên cứu
  status: MusicTrackStatus;      // 11. Trạng thái Công bố / Ẩn
  
  // Thông tin hỗ trợ kỹ thuật
  webSourceUrl?: string;
  webSourcePlatform?: 'suno' | 'youtube' | 'spotify' | 'drive' | 'other';
  storagePath?: string;
  fileName?: string;
  fileSizeBytes?: number;
  durationSeconds?: number;
  durationFormatted?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  bpm: string;
  category: 'lofi' | 'piano' | 'nature' | 'deepwork' | 'pop';
  categoryLabel: string;
  trackCount: number;
  duration: string;
  description: string;
  audioFreq?: number; // For web audio synth
  soundType?: string;
}

export interface MusicArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  excerpt: string;
  content: string[];
  keyAdvice: string[];
  author: string;
  date: string;
}

export interface PlaylistRecommendation {
  id: string;
  title: string;
  bpmInfo: string;
  trackCount: number;
  tags: string[];
  description: string;
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  moodTag?: string;
  playlists?: PlaylistRecommendation[];
  sunoTracks?: any[];
  scientificTracks?: any[];
  managedTracks?: ManagedMusicTrack[];
}

export interface SoundPad {
  id: string;
  name: string;
  soundType: 'piano' | 'rain' | 'chill' | 'forest' | 'cafe' | 'ocean' | 'firework' | 'lofi';
  color: string;
  iconName: string;
  description: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface JournalDay {
  day: number;
  dateStr?: string;
  status: 'completed' | 'current' | 'upcoming';
  studyDurationMinutes: number;
  subject: string;
  soundEnv: string;
  focusScore: number; // 1 to 5
  stressLevel: number; // 1 to 5
  note: string;
}

export interface MailboxMessage {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderGrade: string; // e.g. "Lớp 11", "Lớp 12"
  email?: string;
  createdAt: string;
  status: 'pending' | 'answered';
  replyContent?: string;
  repliedAt?: string;
  repliedBy?: string;
  isIllustration?: boolean;
}

export interface ResearchTeamMember {
  name: string;
  role: string;
  institution: string;
  avatar: string;
  bio: string;
}
