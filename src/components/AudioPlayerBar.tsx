import React, { useState, useEffect } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Square, 
  Sparkles, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  SlidersHorizontal,
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface AudioPlayerBarProps {
  currentlyPlaying: string | null;
  onStop: () => void;
  onPlaySound?: (name: string) => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  currentlyPlaying,
  onStop,
  onPlaySound
}) => {
  const [volume, setVolume] = useState<number>(70);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  
  // 25-minute study focus timer
  const [timerSeconds, setTimerSeconds] = useState<number>(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerFinishedNotice, setTimerFinishedNotice] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerFinishedNotice(true);
            audioSynth.playFocusChime();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (val === 0) {
      setIsMuted(true);
      audioSynth.setVolume(0);
    } else {
      setIsMuted(false);
      audioSynth.setVolume(val / 100);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioSynth.setVolume(volume / 100);
    } else {
      setIsMuted(true);
      audioSynth.setVolume(0);
    }
  };

  const handleQuickAmbient = (id: string, name: string, type: 'rain' | 'lofi' | 'ocean' | 'piano') => {
    if (type === 'piano') {
      audioSynth.playNote('piano', 440);
      onPlaySound?.('Đàn Piano Thư thái');
    } else {
      audioSynth.stopAll();
      audioSynth.toggleAmbient(id, type);
      onPlaySound?.(name);
    }
  };

  // If nothing is playing and timer is not running, we show a sleek floating focus button, or nothing
  if (!currentlyPlaying && !isTimerRunning && !isExpanded) {
    return null;
  }

  return (
    <aside 
      aria-label="Thanh điều khiển âm thanh và đồng hồ tập trung"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-2xl bg-slate-950/95 text-white backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-700/80 p-3 sm:p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
    >
      {/* Mini notification when timer finishes */}
      {timerFinishedNotice && (
        <div className="mb-2 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs px-3 py-1.5 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-bold">Tuyệt vời! Bạn đã hoàn thành trọn vẹn 25 phút tập trung sâu.</span>
          </div>
          <button 
            onClick={() => setTimerFinishedNotice(false)} 
            className="text-emerald-300 hover:text-white font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        
        {/* Main Row */}
        <div className="flex items-center justify-between gap-3">
          
          {/* Left: Animated Sound Status */}
          <div className="flex items-center gap-3 overflow-hidden min-w-0">
            {/* Visualizer bars */}
            <div className="flex items-end gap-1 h-6 shrink-0 px-1 py-0.5 bg-slate-900 rounded-lg border border-slate-800">
              <span className="w-1 bg-emerald-400 rounded-full h-3 animate-pulse" />
              <span className="w-1 bg-cyan-400 rounded-full h-5 animate-bounce" />
              <span className="w-1 bg-pink-400 rounded-full h-2 animate-pulse" />
              <span className="w-1 bg-indigo-400 rounded-full h-4 animate-bounce" />
              <span className="w-1 bg-amber-400 rounded-full h-3 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1 pr-1">
              <div className="text-[11px] text-sky-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-sky-400 shrink-0" />
                <span>Không gian âm học:</span>
              </div>
              <div className="text-xs sm:text-sm font-extrabold text-white break-words line-clamp-1 sm:line-clamp-2">
                <span>{currentlyPlaying || 'Đang sẵn sàng phát âm thanh'}</span>
              </div>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Timer Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded-xl text-xs font-mono font-bold text-amber-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>{formatTimer(timerSeconds)}</span>
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="ml-1 p-1 hover:bg-slate-800 rounded text-amber-300 transition-colors"
                title={isTimerRunning ? 'Tạm dừng' : 'Bắt đầu bấm giờ'}
              >
                {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </button>
            </div>

            {/* Toggle Expand Studio Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Mở bảng điều khiển phòng thu"
              id="audio-expand-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>

            {/* Stop Sound Button */}
            <button
              onClick={() => {
                audioSynth.stopAll();
                onStop();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              id="audio-stop-btn"
            >
              <Square className="w-3 h-3 fill-white" />
              <span className="hidden sm:inline">Dừng phát</span>
            </button>
          </div>
        </div>

        {/* Expanded Deck Controls */}
        {isExpanded && (
          <div className="pt-2.5 mt-1 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
            
            {/* Volume Control */}
            <div className="flex items-center gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800">
              <button 
                onClick={toggleMute}
                className="text-slate-400 hover:text-white transition-colors"
                title={isMuted ? 'Bật âm lượng' : 'Tắt tiếng'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                )}
              </button>
              <div className="flex-1 flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase w-12">Âm lượng</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-700 rounded-lg cursor-pointer"
                  aria-label="Điều chỉnh âm lượng"
                />
                <span className="text-xs font-mono font-bold text-cyan-300 w-8 text-right">
                  {isMuted ? 0 : volume}%
                </span>
              </div>
            </div>

            {/* Quick Switch Ambient Presets */}
            <div className="flex items-center gap-1.5 justify-between sm:justify-end bg-slate-900/80 p-2 rounded-2xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase pl-1.5">Môi trường:</span>
              <div className="flex items-center gap-1 text-[11px] font-bold">
                <button
                  onClick={() => handleQuickAmbient('rain-ambient', 'Tiếng mưa rơi nhẹ (Pink Noise)', 'rain')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-cyan-900 rounded-lg text-slate-200 hover:text-cyan-300 transition-colors"
                >
                  🌧️ Mưa
                </button>
                <button
                  onClick={() => handleQuickAmbient('ocean-ambient', 'Sóng biển tĩnh lặng', 'ocean')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-blue-900 rounded-lg text-slate-200 hover:text-blue-300 transition-colors"
                >
                  🌊 Biển
                </button>
                <button
                  onClick={() => handleQuickAmbient('lofi-ambient', 'Lo-fi ấm áp 75 BPM', 'lofi')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-purple-900 rounded-lg text-slate-200 hover:text-purple-300 transition-colors"
                >
                  ☕ Lo-Fi
                </button>
                <button
                  onClick={() => handleQuickAmbient('piano-ambient', 'Đàn Piano Thư thái', 'piano')}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 active:bg-emerald-900 rounded-lg text-slate-200 hover:text-emerald-300 transition-colors"
                >
                  🎹 Piano
                </button>
              </div>
            </div>

            {/* Mobile Study Timer Row */}
            <div className="sm:hidden col-span-1 flex items-center justify-between bg-slate-900/80 p-2 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-amber-300 font-mono font-bold">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>25m Pomodoro: {formatTimer(timerSeconds)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold hover:bg-amber-500/30 transition-colors"
                >
                  {isTimerRunning ? 'Tạm dừng' : 'Bắt đầu'}
                </button>
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setTimerSeconds(25 * 60);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                  title="Đặt lại 25 phút"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </aside>
  );
};
