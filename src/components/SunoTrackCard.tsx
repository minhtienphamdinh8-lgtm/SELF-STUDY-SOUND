import React, { useState } from 'react';
import { SunoTrack } from '../data/sunoTracks';
import { audioSynth } from '../utils/audioSynth';
import { Play, Pause, Copy, Check, ExternalLink, Sparkles, Disc3, Music2, Heart } from 'lucide-react';

interface SunoTrackCardProps {
  track: SunoTrack;
  isPlaying: boolean;
  onTogglePlay: (track: SunoTrack) => void;
  compact?: boolean;
}

export const SunoTrackCard: React.FC<SunoTrackCardProps> = ({
  track,
  isPlaying,
  onTogglePlay,
  compact = false
}) => {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);

  const handleCopyPrompt = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(track.sunoPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const isLofi = track.category === 'lofi' || track.category === 'piano';

  return (
    <div
      className={`group relative overflow-hidden rounded-3xl border transition-all duration-300 ${
        isPlaying
          ? 'bg-white border-purple-500 shadow-lg ring-2 ring-purple-300'
          : 'bg-white hover:bg-slate-50/90 border-slate-200/90 shadow-2xs hover:shadow-md'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        
        {/* Cover Art with Vinyl effect */}
        <div className="relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          <div className={`absolute inset-0 bg-gradient-to-br ${track.coverGradient} transition-transform group-hover:scale-105 duration-300`} />
          
          {/* Animated Vinyl Disc */}
          <div className={`relative z-10 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center backdrop-blur-xs bg-black/20 ${
            isPlaying ? 'animate-spin' : ''
          }`} style={{ animationDuration: '6s' }}>
            <Disc3 className="w-8 h-8 text-white/90" />
            <div className="absolute w-3 h-3 rounded-full bg-white/80" />
          </div>

          {/* Equalizer overlay when playing */}
          {isPlaying && (
            <div className="absolute bottom-1.5 inset-x-0 flex items-end justify-center gap-0.5 z-20">
              <span className="w-1 bg-white rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-2" style={{ animationDelay: '300ms' }} />
              <span className="w-1 bg-white rounded-full animate-bounce h-4" style={{ animationDelay: '75ms' }} />
            </div>
          )}

          {/* Category Tag icon */}
          <div className="absolute top-1.5 left-1.5 z-20">
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/40 text-white backdrop-blur-xs">
              {isLofi ? 'Lofi' : 'Pop'}
            </span>
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 min-w-0 space-y-1.5 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded-full text-2xs font-extrabold ${
              isLofi ? 'bg-indigo-100 text-indigo-800' : 'bg-pink-100 text-pink-800'
            }`}>
              {track.categoryLabel}
            </span>
            <span className="text-2xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              ⚡ {track.bpm} BPM
            </span>
            <span className="text-2xs font-medium text-slate-500 font-mono">
              ⏱ {track.duration}
            </span>
            <button
              onClick={() => setLiked(!liked)}
              className="ml-auto text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
              title="Yêu thích bản nhạc"
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-950 tracking-tight flex items-center gap-1.5">
              <span>{track.title}</span>
              {isPlaying && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 animate-pulse">
                  Đang phát
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-600 line-clamp-1">
              {track.emotionTarget}
            </p>
          </div>

          {/* Snippet / Lyrics Highlight */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
            <div className="flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{track.snippet}</span>
            </div>
          </div>

          {/* Mood Tags */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {track.moodTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0 justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <button
            onClick={() => onTogglePlay(track)}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs min-h-[44px] ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-700 text-white ring-2 ring-rose-300'
                : 'bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Tạm dừng</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Nghe nhạc</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              onClick={handleCopyPrompt}
              className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Sao chép câu lệnh tạo nhạc trên Suno AI"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã chép</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Prompt AI</span>
                </>
              )}
            </button>

            <a
              href={track.sunoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition-colors"
              title="Mở kênh Suno"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
