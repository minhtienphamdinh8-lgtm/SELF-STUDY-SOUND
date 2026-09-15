import React from 'react';
import { 
  Play, 
  Pause, 
  ExternalLink, 
  Music, 
  Activity, 
  Sparkles, 
  Volume2,
  FileAudio,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { ManagedMusicTrack } from '../types';
import { useMusic, isStreamableAudio, getExternalSourceUrl, getCategoryLabel } from '../context/MusicContext';

export { isStreamableAudio, getExternalSourceUrl, getCategoryLabel };

interface SharedTrackCardProps {
  track: ManagedMusicTrack;
  compact?: boolean;
  onPlayOverride?: (track: ManagedMusicTrack) => void;
}

export const SharedTrackCard: React.FC<SharedTrackCardProps> = ({ 
  track, 
  compact = false,
  onPlayOverride 
}) => {
  const { activeTrack, isPlaying, togglePlayTrack } = useMusic();
  const isThisPlaying = isPlaying && activeTrack?.id === track.id;
  const isThisActive = activeTrack?.id === track.id;

  const streamable = isStreamableAudio(track);
  const externalUrl = getExternalSourceUrl(track);

  const handlePlayClick = () => {
    if (onPlayOverride) {
      onPlayOverride(track);
    } else {
      togglePlayTrack(track);
    }
  };

  // Badge colors based on category
  const categoryBadge = () => {
    switch (track.category) {
      case 'lofi':
        return {
          label: 'Lo-fi không lời',
          bg: 'bg-indigo-50 text-indigo-700 border-indigo-200'
        };
      case 'pop':
        return {
          label: 'Pop có lời',
          bg: 'bg-rose-50 text-rose-700 border-rose-200'
        };
      case 'other':
      default:
        return {
          label: 'Nhạc chuyên sâu',
          bg: 'bg-amber-50 text-amber-700 border-amber-200'
        };
    }
  };

  const badge = categoryBadge();

  if (compact) {
    return (
      <div 
        className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 ${
          isThisActive 
            ? 'bg-blue-50/80 border-blue-300 shadow-xs' 
            : 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-2xs'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-9 h-9 shrink-0 rounded-xl flex items-center justify-center transition-colors ${
            isThisPlaying 
              ? 'bg-blue-600 text-white animate-pulse' 
              : 'bg-slate-100 text-slate-600'
          }`}>
            {isThisPlaying ? <Volume2 className="w-4 h-4" /> : <Music className="w-4 h-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-3xs font-bold rounded-md border uppercase tracking-wider ${badge.bg}`}>
                {badge.label}
              </span>
              {track.bpm && (
                <span className="text-3xs font-mono text-slate-500">
                  {track.bpm} BPM
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5" title={track.title}>
              {track.title}
            </h4>
            <p className="text-xs text-slate-500 truncate">
              {track.artist}
            </p>
          </div>
        </div>

        {/* Action Button: "Phát nhạc" or "Mở nguồn" */}
        <div className="shrink-0 flex items-center gap-1.5">
          {streamable ? (
            <button
              type="button"
              onClick={handlePlayClick}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition-all ${
                isThisPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs hover:shadow-sm'
              }`}
            >
              {isThisPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Phát nhạc</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 inline-flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
              <span>Mở nguồn</span>
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`rounded-2xl border transition-all duration-300 p-4 sm:p-5 flex flex-col justify-between ${
        isThisActive 
          ? 'bg-linear-to-b from-blue-50/90 to-indigo-50/70 border-blue-400 shadow-md ring-2 ring-blue-400/20' 
          : 'bg-white border-slate-200/90 hover:border-blue-200 hover:shadow-xs'
      }`}
    >
      {/* Card Header: Category & Source Info */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className={`px-2.5 py-1 text-2xs font-extrabold rounded-lg border uppercase tracking-wider ${badge.bg}`}>
            {badge.label}
          </span>
          <div className="flex items-center gap-2 text-2xs text-slate-500">
            {track.bpm && (
              <span className="flex items-center gap-1 font-mono font-bold bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                <Activity className="w-3 h-3 text-slate-400" />
                {track.bpm} BPM
              </span>
            )}
            {track.sourceType === 'project_file' && (
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold border border-emerald-100">
                <FileAudio className="w-3 h-3" />
                Tệp dự án
              </span>
            )}
          </div>
        </div>

        {/* Title & Artist */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug tracking-tight mb-1">
          {track.title}
        </h3>
        <p className="text-xs sm:text-sm font-medium text-slate-600 mb-3 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block"></span>
          {track.artist}
        </p>

        {/* Admin Notes & Tags */}
        {track.notes && (
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-4 text-xs text-slate-600 leading-relaxed">
            <p className="line-clamp-3">
              {track.notes}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons: "Phát nhạc" or "Mở nguồn" */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-1.5 text-2xs text-slate-500">
          {streamable ? (
            <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
              <Radio className="w-3.5 h-3.5" />
              Âm thanh trực tiếp
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-slate-500">
              <ExternalLink className="w-3.5 h-3.5" />
              Liên kết ngoài
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Action Button */}
          {streamable ? (
            <button
              type="button"
              onClick={handlePlayClick}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black inline-flex items-center gap-2 transition-all ${
                isThisPlaying
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/30'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
              }`}
            >
              {isThisPlaying ? (
                <>
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Tạm dừng</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Phát nhạc</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-black bg-slate-900 hover:bg-slate-800 text-white inline-flex items-center gap-2 shadow-xs transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Mở nguồn</span>
            </a>
          )}

          {/* Secondary "Mở nguồn" if it is streamable AND has an external link too */}
          {streamable && externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở liên kết nguồn ngoài"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
