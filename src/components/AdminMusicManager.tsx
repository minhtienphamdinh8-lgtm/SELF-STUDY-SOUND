import React, { useState, useEffect, useRef } from 'react';
import { 
  ManagedMusicTrack, 
  MusicTrackCategory, 
  MusicTrackSourceType, 
  MusicTrackStatus 
} from '../types';
import { 
  fetchAllMusicTracksForAdmin, 
  saveMusicTrack, 
  deleteMusicTrack, 
  uploadAudioFileToStorage, 
  listUploadedMusicFiles, 
  deleteStorageFile, 
  StorageAudioItem,
  detectWebSourcePlatform,
  formatDriveDirectAudioUrl,
  testDirectAudioPlayable
} from '../services/musicService';
import { fetchProjectMusicManifest, ProjectMusicFile } from '../data/projectMusicFiles';
import { 
  Music, 
  Plus, 
  UploadCloud, 
  Link as LinkIcon, 
  Globe, 
  FolderCheck, 
  Play, 
  Pause, 
  Check, 
  Trash2, 
  Edit3, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Volume2, 
  RefreshCw, 
  ExternalLink, 
  HardDrive, 
  Radio, 
  Sliders, 
  HelpCircle,
  FileAudio,
  ShieldAlert,
  Loader2,
  XCircle,
  Clock
} from 'lucide-react';

interface AdminMusicManagerProps {
  currentUserId: string;
  currentUserEmail?: string;
  onTrackChanged?: () => void;
}

export const AdminMusicManager: React.FC<AdminMusicManagerProps> = ({
  currentUserId,
  currentUserEmail,
  onTrackChanged
}) => {
  // Sub-tab state
  const [subTab, setSubTab] = useState<'tracks' | 'storage'>('tracks');

  // Track list state
  const [tracks, setTracks] = useState<ManagedMusicTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);
  const [trackListError, setTrackListError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<'all' | MusicTrackCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | MusicTrackStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Storage files state
  const [storageFiles, setStorageFiles] = useState<StorageAudioItem[]>([]);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);
  const [storageUnconfigured, setStorageUnconfigured] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Project packaged files
  const [projectFiles, setProjectFiles] = useState<ProjectMusicFile[]>([]);

  // Form State (All 11 required fields preserved across operations)
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);

  // Field 1: Title
  const [formTitle, setFormTitle] = useState('');
  // Field 2: Artist
  const [formArtist, setFormArtist] = useState('');
  // Field 3: Category
  const [formCategory, setFormCategory] = useState<MusicTrackCategory>('lofi');
  // Field 4: Source Type
  const [formSourceType, setFormSourceType] = useState<MusicTrackSourceType>('project_file');
  // Field 5: Audio URL / Source
  const [formAudioUrl, setFormAudioUrl] = useState('/music/lofi_rain_432hz.wav');
  // Field 6: Order
  const [formOrder, setFormOrder] = useState<number>(1);
  // Field 7: BPM
  const [formBpm, setFormBpm] = useState<string>('72');
  // Field 8: Notes
  const [formNotes, setFormNotes] = useState('');
  // Field 9: Copyright Note
  const [formCopyrightNote, setFormCopyrightNote] = useState('Phục vụ mục đích học tập và nghiên cứu THPT Trịnh Hoài Đức');
  // Field 10: Rights Confirmation
  const [formConfirmedRights, setFormConfirmedRights] = useState(true);
  // Field 11: Status (set on submit or toggle)
  const [formStatus, setFormStatus] = useState<MusicTrackStatus>('published');

  // Additional form helpers
  const [formWebSourceUrl, setFormWebSourceUrl] = useState('');
  const [formStoragePath, setFormStoragePath] = useState<string | null>(null);
  const [formFileName, setFormFileName] = useState<string | null>(null);
  const [formFileSize, setFormFileSize] = useState<number | null>(null);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadStorageUnconfigured, setUploadStorageUnconfigured] = useState(false);

  // URL test state
  const [isTestingUrl, setIsTestingUrl] = useState(false);
  const [urlTestResult, setUrlTestResult] = useState<{ playable: boolean; message: string } | null>(null);

  // Form submission status & error notices
  const [isSaving, setIsSaving] = useState(false);
  const [formNotice, setFormNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Audio Preview Player inside Admin
  const [previewTrackUrl, setPreviewTrackUrl] = useState<string | null>(null);
  const [previewTrackTitle, setPreviewTrackTitle] = useState<string | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const [previewDuration, setPreviewDuration] = useState(0);
  const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
  const [previewVolume, setPreviewVolume] = useState(0.8);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load tracks
  const loadTracks = async () => {
    setIsLoadingTracks(true);
    setTrackListError(null);
    try {
      const list = await fetchAllMusicTracksForAdmin();
      setTracks(list);
    } catch (err: any) {
      setTrackListError(err.message || 'Không thể tải danh sách bài hát từ máy chủ.');
    } finally {
      setIsLoadingTracks(false);
    }
  };

  // Load storage files
  const loadStorage = async () => {
    setIsLoadingStorage(true);
    setStorageError(null);
    try {
      const res = await listUploadedMusicFiles();
      setStorageFiles(res.files);
      setStorageUnconfigured(!!res.isStorageUnconfigured);
      if (res.error) setStorageError(res.error);
    } catch (err: any) {
      setStorageError(err.message || 'Lỗi kiểm tra kho lưu trữ.');
    } finally {
      setIsLoadingStorage(false);
    }
  };

  // Load project manifest
  const loadProjectManifest = async () => {
    const list = await fetchProjectMusicManifest();
    setProjectFiles(list);
  };

  useEffect(() => {
    loadTracks();
    loadProjectManifest();
  }, []);

  useEffect(() => {
    if (subTab === 'storage') {
      loadStorage();
    }
  }, [subTab]);

  // Audio player sync
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setPreviewCurrentTime(audio.currentTime);
    const onLoadedMeta = () => setPreviewDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPreviewPlaying(false);
      setPreviewCurrentTime(0);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMeta);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMeta);
      audio.removeEventListener('ended', onEnded);
    };
  }, [previewTrackUrl]);

  const handlePlayPreview = (url: string, title: string) => {
    if (!url) {
      alert('Không có đường dẫn âm thanh để nghe thử.');
      return;
    }

    if (previewTrackUrl === url && isPreviewPlaying) {
      audioRef.current?.pause();
      setIsPreviewPlaying(false);
      return;
    }

    setPreviewTrackUrl(url);
    setPreviewTrackTitle(title);
    setIsPreviewPlaying(true);

    if (audioRef.current) {
      audioRef.current.src = url;
      audioRef.current.volume = previewVolume;
      audioRef.current.play().catch(e => {
        console.warn('Lỗi phát thử âm thanh:', e);
        setIsPreviewPlaying(false);
        alert('Không thể phát trực tiếp âm thanh từ liên kết này (Có thể do chính sách bảo mật CORS hoặc trang đích là webview). Bạn có thể bấm nút "Mở liên kết nguồn" để nghe trực tiếp.');
      });
    }
  };

  const handleStopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPreviewPlaying(false);
  };

  // Reset form to clean "Thêm bài mới"
  const handleResetForm = () => {
    setIsEditingExisting(false);
    setEditingTrackId(null);
    setFormTitle('');
    setFormArtist('');
    setFormCategory('lofi');
    setFormSourceType('project_file');
    setFormAudioUrl('/music/lofi_rain_432hz.wav');
    setFormOrder(tracks.length + 1);
    setFormBpm('72');
    setFormNotes('');
    setFormCopyrightNote('Phục vụ mục đích học tập và nghiên cứu THPT Trịnh Hoài Đức');
    setFormConfirmedRights(true);
    setFormStatus('published');
    setFormWebSourceUrl('');
    setFormStoragePath(null);
    setFormFileName(null);
    setFormFileSize(null);
    setFormNotice(null);
    setUrlTestResult(null);
    setUploadError(null);
  };

  // Select track to edit
  const handleSelectTrackToEdit = (track: ManagedMusicTrack) => {
    setIsEditingExisting(true);
    setEditingTrackId(track.id);
    setFormTitle(track.title);
    setFormArtist(track.artist);
    setFormCategory(track.category);
    setFormSourceType(track.sourceType);
    setFormAudioUrl(track.audioUrl);
    setFormOrder(track.order);
    setFormBpm(track.bpm !== null && track.bpm !== undefined ? String(track.bpm) : '');
    setFormNotes(track.notes || '');
    setFormCopyrightNote(track.copyrightNote || '');
    setFormConfirmedRights(track.confirmedRights);
    setFormStatus(track.status);
    setFormWebSourceUrl(track.webSourceUrl || '');
    setFormStoragePath(track.storagePath || null);
    setFormFileName(track.fileName || null);
    setFormFileSize(track.fileSizeBytes || null);
    setFormNotice(null);
    setUrlTestResult(null);
    setUploadError(null);

    // Scroll form into view
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadStorageUnconfigured(false);

    try {
      const res = await uploadAudioFileToStorage(file, (pct) => setUploadProgress(pct));

      if (res.success && res.downloadUrl) {
        setFormAudioUrl(res.downloadUrl);
        setFormStoragePath(res.storagePath || null);
        setFormFileName(res.originalFileName || file.name);
        setFormFileSize(res.fileSizeBytes || file.size);
        if (!formTitle) setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
        setFormNotice({
          type: 'success',
          message: `Đã tải lên tệp âm thanh "${file.name}" thành công!`
        });
      } else {
        setUploadError(res.error || 'Tải lên thất bại.');
        setUploadStorageUnconfigured(!!res.isStorageUnconfigured);
      }
    } catch (err: any) {
      setUploadError(err.message || 'Lỗi trong quá trình tải tệp.');
    } finally {
      setIsUploading(false);
      // Reset input value so re-selecting same file triggers onChange
      e.target.value = '';
    }
  };

  // Handle direct audio URL test
  const handleTestAudioUrl = async () => {
    if (!formAudioUrl || !formAudioUrl.trim()) {
      setUrlTestResult({ playable: false, message: 'Vui lòng nhập đường dẫn âm thanh trước khi kiểm tra.' });
      return;
    }

    setIsTestingUrl(true);
    setUrlTestResult(null);

    const res = await testDirectAudioPlayable(formAudioUrl.trim());
    setIsTestingUrl(false);

    if (res.playable) {
      setUrlTestResult({
        playable: true,
        message: `Liên kết âm thanh hợp lệ và có thể phát trực tiếp! ${res.duration ? `(Thời lượng: ~${Math.round(res.duration)} giây)` : ''}`
      });
      // Start preview
      handlePlayPreview(formAudioUrl.trim(), formTitle || 'Kiểm tra âm thanh');
    } else {
      setUrlTestResult({
        playable: false,
        message: res.error || 'Không thể phát luồng âm thanh từ liên kết này.'
      });
    }
  };

  // Handle web source change & auto conversion
  const handleWebSourceChange = (url: string) => {
    setFormWebSourceUrl(url);
    const driveFormat = formatDriveDirectAudioUrl(url);
    if (driveFormat.isDrive) {
      setFormAudioUrl(driveFormat.streamUrl);
    } else {
      // For YouTube, Suno, Spotify, audioUrl can store the source link or fallback
      setFormAudioUrl(url);
    }
  };

  // Select project file from preset
  const handleSelectProjectFile = (projFile: ProjectMusicFile) => {
    setFormAudioUrl(projFile.relativePath);
    setFormFileName(projFile.fileName);
    setFormFileSize(projFile.sizeKb * 1024);
    if (!formTitle || formTitle === 'Không tên') setFormTitle(projFile.title);
    if (!formArtist || formArtist === 'Không rõ') setFormArtist(projFile.artist);
    setFormCategory(projFile.category);
    if (projFile.bpm !== null) setFormBpm(String(projFile.bpm));
    if (projFile.notes && !formNotes) setFormNotes(projFile.notes);
  };

  // Save Track (either Published or Hidden)
  const handleSave = async (targetStatus: MusicTrackStatus) => {
    setFormNotice(null);

    // Strict validation
    if (!formTitle.trim()) {
      setFormNotice({ type: 'error', message: 'Vui lòng nhập Tên bài hát/bản nhạc.' });
      return;
    }
    if (!formArtist.trim()) {
      setFormNotice({ type: 'error', message: 'Vui lòng nhập Tác giả/Nghệ sĩ.' });
      return;
    }
    if (!formAudioUrl.trim()) {
      setFormNotice({ type: 'error', message: 'Vui lòng cung cấp Tệp âm thanh hoặc đường dẫn phát nhạc.' });
      return;
    }
    if (!formConfirmedRights) {
      setFormNotice({
        type: 'error',
        message: 'Vui lòng xác nhận bản quyền sử dụng trước khi lưu bài hát.'
      });
      return;
    }

    setIsSaving(true);

    const trackPayload: Partial<ManagedMusicTrack> = {
      id: isEditingExisting && editingTrackId ? editingTrackId : undefined,
      title: formTitle,
      artist: formArtist,
      category: formCategory,
      sourceType: formSourceType,
      audioUrl: formAudioUrl,
      order: Number(formOrder) || 10,
      bpm: formBpm.trim() ? Number(formBpm) : null,
      notes: formNotes,
      copyrightNote: formCopyrightNote,
      confirmedRights: true,
      status: targetStatus,
      webSourceUrl: formWebSourceUrl,
      webSourcePlatform: formWebSourceUrl ? detectWebSourcePlatform(formWebSourceUrl) : undefined,
      storagePath: formStoragePath || undefined,
      fileName: formFileName || undefined,
      fileSizeBytes: formFileSize || undefined
    };

    const res = await saveMusicTrack(trackPayload, !isEditingExisting, currentUserId);
    setIsSaving(false);

    if (res.success) {
      setFormNotice({
        type: 'success',
        message: targetStatus === 'published'
          ? `Đã lưu và CÔNG BỐ bài hát "${formTitle}" thành công! Học sinh đã có thể nhìn thấy và nghe trên Thư viện nhạc.`
          : `Đã lưu bài hát "${formTitle}" ở trạng thái ẨN. Chỉ quản trị viên mới thấy bản ghi này.`
      });

      // Reload tracks list from server
      await loadTracks();
      onTrackChanged?.();

      if (!isEditingExisting) {
        // Reset form for next entry
        handleResetForm();
      } else {
        setFormStatus(targetStatus);
      }
    } else {
      // Keep all entered inputs in the form, show actionable error
      setFormNotice({
        type: 'error',
        message: res.error || 'Lỗi lưu dữ liệu. Các thông tin bạn vừa nhập đã được giữ nguyên trên biểu mẫu.'
      });
    }
  };

  // Delete track
  const handleDeleteTrack = async (track: ManagedMusicTrack) => {
    const ok = window.confirm(`Bạn có chắc muốn gỡ bài hát "${track.title}" khỏi danh sách?`);
    if (!ok) return;

    try {
      const res = await deleteMusicTrack(track.id, track.storagePath);
      if (res.success) {
        alert(`Đã gỡ bài hát "${track.title}" thành công.`);
        await loadTracks();
        onTrackChanged?.();
        if (editingTrackId === track.id) {
          handleResetForm();
        }
      } else {
        alert('Lỗi gỡ bài: ' + (res.error || ''));
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Toggle quick status (Published <-> Hidden)
  const handleToggleStatusQuick = async (track: ManagedMusicTrack) => {
    const newStatus: MusicTrackStatus = track.status === 'published' ? 'hidden' : 'published';
    try {
      const res = await saveMusicTrack(
        { ...track, status: newStatus, confirmedRights: true },
        false,
        currentUserId
      );
      if (res.success) {
        await loadTracks();
        onTrackChanged?.();
      } else {
        alert('Lỗi cập nhật trạng thái: ' + (res.error || ''));
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Delete orphan storage file
  const handleDeleteStorageFile = async (item: StorageAudioItem) => {
    const ok = window.confirm(`Bạn có chắc muốn xóa tệp "${item.name}" khỏi kho lưu trữ? Thao tác này không thể hoàn tác.`);
    if (!ok) return;

    try {
      const res = await deleteStorageFile(item.fullPath);
      if (res.success) {
        alert(`Đã xóa tệp "${item.name}" khỏi kho lưu trữ.`);
        await loadStorage();
      } else {
        alert('Lỗi xóa tệp: ' + (res.error || ''));
      }
    } catch (e: any) {
      alert('Lỗi: ' + e.message);
    }
  };

  // Filtered tracks
  const filteredTracks = tracks.filter((t) => {
    if (filterCategory !== 'all' && t.category !== filterCategory) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchArtist = t.artist.toLowerCase().includes(q);
      const matchNotes = (t.notes || '').toLowerCase().includes(q);
      if (!matchTitle && !matchArtist && !matchNotes) return false;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Hidden Audio Element for Preview */}
      <audio ref={audioRef} className="hidden" />

      {/* Top Banner & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-linear-to-r from-indigo-900 via-blue-900 to-slate-900 text-white rounded-3xl shadow-sm border border-indigo-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-cyan-300">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Quản lý thư viện nhạc & Nguồn âm thanh
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-mono font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">
                Server-Guarded
              </span>
            </div>
            <p className="text-xs text-indigo-200 mt-0.5">
              Thêm, sửa, nghe thử và công bố các bài nhạc chuẩn khoa học cho học sinh THPT
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-black/30 rounded-2xl border border-white/10 shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setSubTab('tracks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              subTab === 'tracks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            Danh sách & Biên tập ({tracks.length})
          </button>
          <button
            onClick={() => setSubTab('storage')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              subTab === 'storage'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-200 hover:text-white'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Kho tệp tải lên</span>
          </button>
        </div>
      </div>

      {/* Mini Persistent Audio Preview Deck (when playing inside admin) */}
      {previewTrackUrl && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <button
              onClick={() => isPreviewPlaying ? audioRef.current?.pause() : audioRef.current?.play()}
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-transform active:scale-95 shrink-0"
              title={isPreviewPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            >
              {isPreviewPlaying ? <Pause className="w-4 h-4 fill-slate-950" /> : <Play className="w-4 h-4 fill-slate-950" />}
            </button>
            <div className="min-w-0 flex-1">
              <span className="text-2xs text-cyan-400 font-bold uppercase tracking-wider block">Đang nghe thử trong Quản trị:</span>
              <div className="text-xs font-bold text-white truncate">{previewTrackTitle || previewTrackUrl}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-2xs font-mono text-slate-400">
              {Math.floor(previewCurrentTime)}s / {previewDuration ? `${Math.floor(previewDuration)}s` : '∞'}
            </span>
            <button
              onClick={handleStopPreview}
              className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-xs font-bold transition-colors"
            >
              Đóng nghe thử
            </button>
          </div>
        </div>
      )}

      {/* ======================= TAB: STORAGE FILES MANAGER ======================= */}
      {subTab === 'storage' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Kho lưu trữ tệp âm thanh (Firebase Storage)
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Xem và xóa riêng các tệp tải lên không còn dùng để tiết kiệm dung lượng lưu trữ
              </p>
            </div>

            <button
              onClick={loadStorage}
              disabled={isLoadingStorage}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>

          {storageUnconfigured && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>Chưa cấu hình kho lưu trữ (Firebase Storage)</span>
              </div>
              <p>
                Firebase Storage chưa được kích hoạt hoặc chưa cấp quyền ghi/đọc cho bucket dự án.
              </p>
              <p className="text-2xs text-amber-700">
                Gợi ý: Quản trị viên hoàn toàn có thể sử dụng <strong>Cách 2 (Đường dẫn HTTPS trực tiếp)</strong>, <strong>Cách 3 (Web Source: Suno/YouTube/Spotify/Drive)</strong>, hoặc <strong>Cách 4 (Tệp có sẵn trong thư mục public/music)</strong> mà không phát sinh bất kỳ chi phí nào!
              </p>
            </div>
          )}

          {isLoadingStorage && (
            <div className="py-12 text-center text-xs text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
              <span>Đang kiểm tra các tệp trong kho lưu trữ...</span>
            </div>
          )}

          {!isLoadingStorage && !storageUnconfigured && storageFiles.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <HardDrive className="w-8 h-8 text-slate-300 mx-auto" />
              <div>Chưa có tệp âm thanh nào được tải lên kho lưu trữ đám mây.</div>
            </div>
          )}

          {!isLoadingStorage && storageFiles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                    <th className="p-3">Tên tệp</th>
                    <th className="p-3">Dung lượng</th>
                    <th className="p-3">Ngày tải lên</th>
                    <th className="p-3">Liên kết bài nhạc</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storageFiles.map((f) => {
                    const isUsedByTrack = tracks.some(t => t.storagePath === f.fullPath || t.audioUrl === f.downloadUrl);
                    const mb = (f.sizeBytes / (1024 * 1024)).toFixed(2);
                    return (
                      <tr key={f.fullPath} className="hover:bg-slate-50/50">
                        <td className="p-3 font-mono font-bold text-slate-800 max-w-xs truncate" title={f.name}>
                          {f.name}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{mb} MB</td>
                        <td className="p-3 font-mono text-slate-500">{f.timeCreated ? new Date(f.timeCreated).toLocaleDateString('vi-VN') : '—'}</td>
                        <td className="p-3">
                          {isUsedByTrack ? (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-100 text-emerald-800">
                              Đang dùng trong thư viện
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-100 text-amber-800">
                              Tệp chưa liên kết (Có thể xóa)
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <button
                            onClick={() => handlePlayPreview(f.downloadUrl, f.name)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-2xs transition-colors"
                          >
                            Nghe thử
                          </button>
                          <button
                            onClick={() => handleDeleteStorageFile(f)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-2xs transition-colors"
                          >
                            Xóa tệp
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB: TRACKS & EDITOR ======================= */}
      {subTab === 'tracks' && (
        <div className="space-y-8">
          
          {/* Section 1: Track Editor Form (With All 11 Required Fields) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6" id="music-editor-form">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                    isEditingExisting ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {isEditingExisting ? 'Đang chỉnh sửa bài hát' : 'Tạo mới bài hát'}
                  </span>
                  <h3 className="text-xl font-black text-slate-900">
                    {isEditingExisting ? `Chỉnh sửa: ${formTitle || 'Bài hát'}` : 'Thêm bài mới vào thư viện nhạc'}
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Điền đủ 11 thông tin theo quy chuẩn quản lý âm nhạc khoa học của đề tài
                </p>
              </div>

              {isEditingExisting && (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer self-start"
                >
                  <Plus className="w-3.5 h-3.5 inline mr-1" />
                  Hủy chỉnh sửa, chuyển sang Thêm mới
                </button>
              )}
            </div>

            {/* Form Error / Success Notice */}
            {formNotice && (
              <div className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
                formNotice.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-900 border border-rose-200'
              }`}>
                {formNotice.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="font-bold">{formNotice.message}</div>
                  {formNotice.type === 'error' && (
                    <div className="text-2xs text-rose-700">
                      Mẹo: Kiểm tra lại quyền quản trị, đường dẫn phát nhạc và đảm bảo đã tích chọn ô xác nhận bản quyền. Dữ liệu biểu mẫu vừa nhập vẫn được giữ nguyên.
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Field 1: Title */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  1. Tên bài hát / bản nhạc <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="Ví dụ: Hoàng Hôn Ban Công Thư Viện (432 Hz)"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Field 2: Artist */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  2. Tác giả / Nghệ sĩ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formArtist}
                  onChange={e => setFormArtist(e.target.value)}
                  placeholder="Ví dụ: Self Study Sound × Suno AI"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Field 3: Nhóm nhạc */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  3. Nhóm nhạc <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCategory('lofi')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formCategory === 'lofi'
                        ? 'bg-blue-50 border-blue-400 text-blue-800 ring-2 ring-blue-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Lo-fi không lời
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCategory('pop')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formCategory === 'pop'
                        ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Pop có lời
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCategory('other')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      formCategory === 'other'
                        ? 'bg-purple-50 border-purple-400 text-purple-800 ring-2 ring-purple-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    Khác (Sóng não/Pink noise)
                  </button>
                </div>
              </div>

              {/* Field 4: Nguồn nhạc */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  4. Nguồn nhạc <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSourceType('upload')}
                    className={`py-2 px-2 text-center rounded-xl text-2xs font-bold border transition-all cursor-pointer ${
                      formSourceType === 'upload'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <UploadCloud className="w-3.5 h-3.5 mx-auto mb-1" />
                    Tải tệp lên
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSourceType('direct_url')}
                    className={`py-2 px-2 text-center rounded-xl text-2xs font-bold border transition-all cursor-pointer ${
                      formSourceType === 'direct_url'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 mx-auto mb-1" />
                    Đường dẫn trực tiếp
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSourceType('web_source')}
                    className={`py-2 px-2 text-center rounded-xl text-2xs font-bold border transition-all cursor-pointer ${
                      formSourceType === 'web_source'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 mx-auto mb-1" />
                    Web Source
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSourceType('project_file')}
                    className={`py-2 px-2 text-center rounded-xl text-2xs font-bold border transition-all cursor-pointer ${
                      formSourceType === 'project_file'
                        ? 'bg-indigo-50 border-indigo-400 text-indigo-800 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <FolderCheck className="w-3.5 h-3.5 mx-auto mb-1" />
                    Tệp trong dự án
                  </button>
                </div>
              </div>

              {/* Field 5: Tệp âm thanh hoặc đường dẫn phát nhạc (Dynamic based on source) */}
              <div className="md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide">
                  5. Tệp âm thanh hoặc đường dẫn phát nhạc ({formSourceType}) <span className="text-rose-500">*</span>
                </label>

                {/* Sub-view: 1. Upload file */}
                {formSourceType === 'upload' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-2xs">
                        <UploadCloud className="w-4 h-4" />
                        <span>{isUploading ? 'Đang tải lên...' : 'Chọn tệp âm thanh từ máy'}</span>
                        <input
                          type="file"
                          accept=".mp3,.wav,.m4a,.ogg,audio/*"
                          disabled={isUploading}
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-2xs text-slate-500">
                        Chấp nhận: .mp3, .wav, .m4a, .ogg (Tối đa 30 MB)
                      </span>
                    </div>

                    {isUploading && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-2xs font-bold text-indigo-700">
                          <span>Đang tải lên kho lưu trữ...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>{uploadStorageUnconfigured ? 'Chưa cấu hình kho lưu trữ' : 'Lỗi tải lên'}</span>
                        </div>
                        <p className="text-2xs leading-relaxed">{uploadError}</p>
                      </div>
                    )}

                    {formAudioUrl && formAudioUrl.startsWith('http') && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="min-w-0">
                          <span className="text-2xs text-slate-500 block">Đường dẫn tệp đã tải:</span>
                          <span className="font-mono font-bold text-slate-800 truncate block max-w-md">
                            {formFileName || formAudioUrl}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handlePlayPreview(formAudioUrl, formTitle || 'Nghe thử')}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-2xs font-bold flex items-center gap-1 shrink-0 ml-2"
                        >
                          <Play className="w-3 h-3" />
                          <span>Nghe thử</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: 2. Direct HTTPS URL */}
                {formSourceType === 'direct_url' && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="url"
                        value={formAudioUrl}
                        onChange={e => setFormAudioUrl(e.target.value)}
                        placeholder="https://example.com/audio/relaxing_lofi.mp3"
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleTestAudioUrl}
                        disabled={isTestingUrl}
                        className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isTestingUrl ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>Kiểm tra liên kết</span>
                      </button>
                    </div>

                    {urlTestResult && (
                      <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                        urlTestResult.playable
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {urlTestResult.playable ? <Check className="w-4 h-4 shrink-0 text-emerald-600" /> : <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />}
                        <span>{urlTestResult.message}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: 3. Web Source */}
                {formSourceType === 'web_source' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-600 uppercase">
                        Nhập liên kết nguồn (Suno, YouTube, Spotify, hoặc Google Drive)
                      </label>
                      <input
                        type="url"
                        value={formWebSourceUrl}
                        onChange={e => handleWebSourceChange(e.target.value)}
                        placeholder="https://suno.com/song/... hoặc https://youtube.com/watch?v=... hoặc https://drive.google.com/..."
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {formWebSourceUrl && (
                      <div className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-indigo-100 text-indigo-800 uppercase">
                            {detectWebSourcePlatform(formWebSourceUrl)}
                          </span>
                          <span className="text-2xs text-slate-500">Đã phát hiện nền tảng</span>
                        </div>
                        <a
                          href={formWebSourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-2xs font-bold flex items-center gap-1"
                        >
                          <span>Mở nguồn gốc</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Sub-view: 4. Project Packaged Files (public/music) */}
                {formSourceType === 'project_file' && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-2xs font-bold text-slate-600 uppercase">
                        Chọn tệp âm thanh có sẵn trong thư mục public/music của dự án:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {projectFiles.map(pf => {
                          const isSelected = formAudioUrl === pf.relativePath;
                          return (
                            <button
                              type="button"
                              key={pf.fileName}
                              onClick={() => handleSelectProjectFile(pf)}
                              className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-50 border-indigo-400 text-indigo-900 ring-2 ring-indigo-200'
                                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              }`}
                            >
                              <div className="font-bold truncate">{pf.title}</div>
                              <div className="flex items-center justify-between text-2xs text-slate-500 font-mono mt-0.5">
                                <span>{pf.fileName}</span>
                                <span>{pf.bpm ? `${pf.bpm} BPM` : 'Ambient'}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-1 pt-1">
                      <label className="text-2xs font-bold text-slate-500 uppercase">
                        Đường dẫn tương đối:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={formAudioUrl}
                          onChange={e => setFormAudioUrl(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl font-mono text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handlePlayPreview(formAudioUrl, formTitle || 'Nghe thử tệp dự án')}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          <span>Nghe thử</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Field 6: Thứ tự ưu tiên hiển thị */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  6. Thứ tự ưu tiên hiển thị
                </label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={formOrder}
                  onChange={e => setFormOrder(Number(e.target.value))}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
                <span className="text-2xs text-slate-500">Số nhỏ hơn sẽ xếp trước (Ví dụ: 1, 2, 3...)</span>
              </div>

              {/* Field 7: Nhịp tim / BPM */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  7. Nhịp tim / BPM (Không tự đoán nếu chưa biết)
                </label>
                <input
                  type="number"
                  min="40"
                  max="200"
                  value={formBpm}
                  onChange={e => setFormBpm(e.target.value)}
                  placeholder="Để trống nếu chưa đo đạc chính xác"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
                <span className="text-2xs text-slate-500">Nhập số thực tế. Nếu chưa biết rõ nhịp BPM, hãy để trống.</span>
              </div>

              {/* Field 8: Ghi chú / mô tả ngắn */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  8. Ghi chú / mô tả ngắn về tác dụng hỗ trợ học tập (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Ví dụ: Giúp hạ hormone Cortisol, phù hợp đọc hiểu Ngữ văn và giải toán tư duy..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                />
              </div>

              {/* Field 9: Quyền sử dụng / bản quyền */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  9. Quyền sử dụng / bản quyền <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formCopyrightNote}
                  onChange={e => setFormCopyrightNote(e.target.value)}
                  placeholder="Ví dụ: Tự sáng tác qua Suno AI / Bản quyền mở Creative Commons / Thuộc sở hữu đề tài"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                />
              </div>

              {/* Field 10: Ô xác nhận quyền sử dụng */}
              <div className="md:col-span-2 p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={formConfirmedRights}
                    onChange={e => setFormConfirmedRights(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="text-xs text-indigo-950 font-medium leading-relaxed">
                    <span className="font-bold block">10. Xác nhận tính hợp lệ bản quyền:</span>
                    “Tôi có quyền sử dụng hoặc bài nhạc này thuộc phạm vi cho phép phục vụ nghiên cứu/học tập theo đề tài trường THPT Trịnh Hoài Đức.”
                  </div>
                </label>
              </div>

            </div>

            {/* Field 11: Trạng thái & Các nút Lưu thao tác */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                11. Trạng thái lựa chọn: <span className="font-bold text-slate-700">Công bố</span> (hiển thị cho học sinh) hoặc <span className="font-bold text-slate-700">Ẩn</span> (chỉ quản trị viên thấy).
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('hidden')}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <EyeOff className="w-4 h-4 text-slate-500" />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu ở trạng thái Ẩn'}</span>
                </button>

                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => handleSave('published')}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu & Công bố ngay'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Manage Existing Tracks List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Danh sách bài nhạc đã lưu trong hệ thống ({tracks.length})
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Chọn một bài để chỉnh sửa, nghe thử, bật/tắt hiển thị hoặc gỡ khỏi danh sách
                </p>
              </div>

              <button
                onClick={loadTracks}
                disabled={isLoadingTracks}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTracks ? 'animate-spin' : ''}`} />
                <span>Làm mới</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm bài hát theo tên hoặc tác giả..."
                className="flex-1 px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />

              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">Tất cả nhóm</option>
                <option value="lofi">Lo-fi không lời</option>
                <option value="pop">Pop có lời</option>
                <option value="other">Khác</option>
              </select>

              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã công bố</option>
                <option value="hidden">Đang ẩn</option>
              </select>
            </div>

            {/* Table of Tracks */}
            {isLoadingTracks && (
              <div className="py-12 text-center text-xs text-slate-500">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                <span>Đang tải danh sách bài hát...</span>
              </div>
            )}

            {!isLoadingTracks && filteredTracks.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                <Music className="w-8 h-8 text-slate-300 mx-auto" />
                <div>Chưa có bài hát nào phù hợp với bộ lọc.</div>
              </div>
            )}

            {!isLoadingTracks && filteredTracks.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-700 font-bold">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">Bài hát & Nghệ sĩ</th>
                      <th className="p-3">Nhóm</th>
                      <th className="p-3">Nguồn</th>
                      <th className="p-3">BPM</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTracks.map((t) => {
                      const isCurrentlyEditing = editingTrackId === t.id;
                      return (
                        <tr key={t.id} className={`hover:bg-slate-50/50 ${isCurrentlyEditing ? 'bg-amber-50/40' : ''}`}>
                          <td className="p-3 text-center font-mono font-bold text-slate-500">
                            {t.order}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900 line-clamp-1">{t.title}</div>
                            <div className="text-2xs text-slate-500">{t.artist}</div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                              t.category === 'lofi' ? 'bg-blue-100 text-blue-800' :
                              t.category === 'pop' ? 'bg-amber-100 text-amber-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {t.category === 'lofi' ? 'Lo-fi' : t.category === 'pop' ? 'Pop' : 'Khác'}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-2xs text-slate-600 uppercase">
                              {t.sourceType}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-slate-700">
                            {t.bpm ? `${t.bpm} BPM` : '—'}
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => handleToggleStatusQuick(t)}
                              title="Bấm để đổi nhanh trạng thái Công bố / Ẩn"
                              className={`px-2 py-0.5 rounded text-2xs font-bold transition-transform active:scale-95 cursor-pointer ${
                                t.status === 'published'
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                              }`}
                            >
                              {t.status === 'published' ? 'Công bố' : 'Ẩn'}
                            </button>
                          </td>
                          <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => handlePlayPreview(t.audioUrl, t.title)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-2xs transition-colors cursor-pointer"
                              title="Nghe thử bài hát"
                            >
                              <Play className="w-3 h-3 inline mr-0.5" />
                              Nghe
                            </button>
                            <button
                              onClick={() => handleSelectTrackToEdit(t)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-2xs transition-colors cursor-pointer"
                              title="Chọn bài để chỉnh sửa"
                            >
                              <Edit3 className="w-3 h-3 inline mr-0.5" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteTrack(t)}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-2xs transition-colors cursor-pointer"
                              title="Gỡ bài khỏi danh sách"
                            >
                              <Trash2 className="w-3 h-3 inline mr-0.5" />
                              Gỡ
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
