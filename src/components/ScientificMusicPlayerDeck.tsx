import React, { useState, useMemo } from 'react';
import { ManagedMusicTrack, MusicTrackCategory } from '../types';
import { useMusic } from '../context/MusicContext';
import { isStreamableAudio } from '../components/SharedTrackCard';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Search, 
  ExternalLink, 
  Music, 
  Sparkles, 
  Globe, 
  FolderCheck,
  Radio
} from 'lucide-react';

interface ScientificMusicPlayerDeckProps {
  onPlaySoundTitle?: (title: string) => void;
}

export const ScientificMusicPlayerDeck: React.FC<ScientificMusicPlayerDeckProps> = ({
  onPlaySoundTitle
}) => {
  const {
    publishedTracks,
    isRealtimeSyncing,
    activeTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isLooping,
    isLiveTone,
    silenceNotice,
    togglePlayTrack,
    togglePlay,
    playNext,
    playPrev,
    seekTo,
    setVolume,
    toggleMute,
    toggleLoop,
    triggerImmediateSilence
  } = useMusic();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | MusicTrackCategory>('all');

  // Filtered tracks
  const filteredTracks = useMemo(() => {
    return publishedTracks.filter((t) => {
      // Category filter
      if (selectedCategory !== 'all' && t.category !== selectedCategory) {
        return false;
      }
      // Search filter (Tên bài or Tác giả or Ghi chú)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchArtist = t.artist.toLowerCase().includes(q);
        const matchNotes = (t.notes || '').toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchNotes) return false;
      }
      return true;
    });
  }, [publishedTracks, selectedCategory, searchQuery]);

  // Format mm:ss
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    seekTo(newTime);
  };

  const handleTrackClick = (track: ManagedMusicTrack) => {
    togglePlayTrack(track);
    if (!isPlaying || activeTrack?.id !== track.id) {
      onPlaySoundTitle?.(track.title);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================================= */}
      {/* 1. INTERACTIVE PLAYER DECK (HERO CONTROLS) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-5 sm:p-7 border border-indigo-800/80 shadow-xl relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 space-y-5">
          
          {/* Deck Top: Track info & Silence Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            
            {/* Active Track Meta */}
            <div className="flex items-center gap-3.5 min-w-0">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
                isPlaying ? 'bg-indigo-600 shadow-lg scale-105 ring-2 ring-cyan-400' : 'bg-slate-800'
              }`}>
                <Music className={`w-6 h-6 ${isPlaying ? 'text-white animate-pulse' : 'text-slate-400'}`} />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-2xs font-bold uppercase tracking-wider text-cyan-300">
                    {isPlaying ? 'Đang phát âm thanh học tập:' : 'Trình phát âm thanh dùng chung'}
                  </span>
                  
                  {activeTrack && (
                    <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                      activeTrack.category === 'lofi' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                      activeTrack.category === 'pop' ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' :
                      'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                    }`}>
                      {activeTrack.category === 'lofi' ? 'Lo-fi không lời' : activeTrack.category === 'pop' ? 'Pop có lời' : 'Chuyên sâu'}
                    </span>
                  )}

                  {activeTrack && activeTrack.bpm !== null && activeTrack.bpm !== undefined && activeTrack.bpm > 0 && (
                    <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/30">
                      {activeTrack.bpm} BPM
                    </span>
                  )}

                  {isRealtimeSyncing && (
                    <span className="px-2 py-0.5 rounded text-2xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      Đồng bộ Firestore
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-black text-white truncate mt-0.5">
                  {activeTrack ? activeTrack.title : 'Chọn một bài hát từ thư viện dùng chung bên dưới'}
                </h3>
                
                <p className="text-xs text-slate-300 truncate">
                  {activeTrack ? activeTrack.artist : 'Dữ liệu được quản trị công bố · Xem và nghe không cần đăng nhập'}
                </p>
              </div>
            </div>

            {/* Quick Actions: Open Web Source & Im lặng hoàn toàn */}
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {activeTrack?.webSourceUrl && (
                <a
                  href={activeTrack.webSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  title="Mở liên kết nguồn gốc bài nhạc (YouTube / Zing MP3 / Suno)"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Mở nguồn</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Nút "Im lặng hoàn toàn" (Dừng nhạc ngay lập tức) */}
              <button
                onClick={triggerImmediateSilence}
                className="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 hover:text-white border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-xs"
                title="Dừng nhạc ngay lập tức để chuyển sang trạng thái tập trung sâu"
              >
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>Im lặng hoàn toàn</span>
              </button>
            </div>
          </div>

          {/* Silence Feedback Toast */}
          {silenceNotice && (
            <div className="p-3 bg-rose-950/80 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-center gap-2 animate-in fade-in duration-200">
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Đã kích hoạt chế độ <strong>Im lặng hoàn toàn (0 dB)</strong>. Mọi nguồn âm thanh đã dừng để bạn tập trung tư duy sâu.</span>
            </div>
          )}

          {/* Deck Middle: Time Seek Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-2xs font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{duration > 0 ? formatTime(duration) : isLiveTone ? 'Live Audio' : '0:00'}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={isLiveTone || !activeTrack}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-40"
            />
          </div>

          {/* Deck Controls: Prev, Play/Pause, Next, Loop, Volume Slider */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* Playback Transport Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={playPrev}
                disabled={publishedTracks.length === 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Bài trước"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onClick={() => activeTrack ? togglePlay() : (filteredTracks[0] && handleTrackClick(filteredTracks[0]))}
                className="p-3.5 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black transition-all active:scale-95 shadow-md shadow-cyan-500/20 cursor-pointer"
                title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
              >
                {isPlaying ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={playNext}
                disabled={publishedTracks.length === 0}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Bài kế tiếp"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Loop Toggle */}
              <button
                onClick={toggleLoop}
                className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  isLooping 
                    ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40' 
                    : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-slate-200'
                }`}
                title={isLooping ? 'Đang lặp lại bài hát' : 'Tắt lặp lại'}
              >
                <Repeat className="w-4 h-4" />
                <span className="text-2xs">{isLooping ? 'Lặp bài' : 'Lặp'}</span>
              </button>
            </div>

            {/* Volume Control Deck */}
            <div className="flex items-center gap-3 w-full sm:w-60">
              <button
                onClick={toggleMute}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
                title={isMuted ? 'Bật âm' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                title={`Âm lượng: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
              <span className="text-2xs font-mono text-slate-400 w-8 text-right">
                {Math.round((isMuted ? 0 : volume) * 100)}%
              </span>
            </div>

          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SEARCH, CATEGORY FILTERS & TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Tất cả' },
              { id: 'lofi', label: '🎧 Lo-fi không lời' },
              { id: 'pop', label: '⚡ Pop có lời' },
              { id: 'other', label: '🧠 Chuyên sâu (Tần số & Tự nhiên)' }
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm tên bài, tác giả, ghi chú..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-indigo-500"
            />
          </div>

        </div>

        {/* Tracks Count & Notice */}
        <div className="flex items-center justify-between text-2xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Đang hiển thị <strong>{filteredTracks.length}</strong> bài hát từ thư viện dùng chung
          </span>
          <span className="text-slate-400">Đồng bộ tự động khi quản trị viên cập nhật</span>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. TRACKS LIST GRID */}
      {/* ========================================================================= */}
      {filteredTracks.length === 0 ? (
        <div className="py-16 text-center text-xs text-slate-500 bg-white rounded-3xl border border-slate-200 space-y-2">
          <Music className="w-8 h-8 text-slate-300 mx-auto" />
          <div>Không tìm thấy bài hát nào phù hợp với bộ lọc trong thư viện dùng chung.</div>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
            className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 text-2xs cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTracks.map((t) => {
            const isCurrentActive = activeTrack?.id === t.id;
            const isCurrentPlaying = isCurrentActive && isPlaying;
            const canStream = isStreamableAudio(t);

            return (
              <div
                key={t.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isCurrentActive
                    ? 'bg-indigo-50/70 border-indigo-300 shadow-sm ring-2 ring-indigo-200/60'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header: Category badge, BPM badge, and Source icon */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-2xs font-bold ${
                        t.category === 'lofi' ? 'bg-blue-100 text-blue-800' :
                        t.category === 'pop' ? 'bg-amber-100 text-amber-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {t.category === 'lofi' ? 'Lo-fi không lời' : t.category === 'pop' ? 'Pop có lời' : 'Chuyên sâu'}
                      </span>

                      {t.bpm !== null && t.bpm !== undefined && t.bpm > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-2xs font-mono font-bold bg-slate-100 text-slate-700">
                          {t.bpm} BPM
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-md text-2xs font-mono text-slate-500 bg-slate-50">
                        {t.sourceType === 'project_file' ? 'Tệp dự án' :
                         t.sourceType === 'upload' ? 'Tệp âm thanh' :
                         t.webSourcePlatform ? t.webSourcePlatform.toUpperCase() : 'LIÊN KẾT'}
                      </span>
                    </div>

                    {t.webSourceUrl && (
                      <a
                        href={t.webSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                        title="Mở liên kết nguồn bài hát"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* Title and Artist */}
                  <h4 className="text-sm sm:text-base font-black text-slate-900 line-clamp-1">
                    {t.title}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {t.artist}
                  </p>

                  {/* Notes / Description */}
                  {t.notes && (
                    <p className="text-2xs text-slate-500 mt-2 line-clamp-2 leading-relaxed bg-slate-50 p-2 rounded-xl">
                      {t.notes}
                    </p>
                  )}
                </div>

                {/* Card Bottom: Play button or Open Source Button */}
                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 mt-1">
                  <div className="text-2xs text-slate-400 truncate max-w-[180px]" title={t.copyrightNote}>
                    {t.copyrightNote || 'Nghiên cứu học tập THPT Trịnh Hoài Đức'}
                  </div>

                  <div className="flex items-center gap-2">
                    {canStream ? (
                      <button
                        onClick={() => handleTrackClick(t)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
                          isCurrentPlaying
                            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                        }`}
                      >
                        {isCurrentPlaying ? (
                          <>
                            <Pause className="w-3.5 h-3.5 fill-white" />
                            <span>Tạm dừng</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Phát nhạc</span>
                          </>
                        )}
                      </button>
                    ) : t.webSourceUrl ? (
                      <a
                        href={t.webSourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                        <span>Mở nguồn</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => handleTrackClick(t)}
                        className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Phát thử</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
