import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { ManagedMusicTrack, MusicTrackCategory } from '../types';
import { subscribePublishedMusicTracks, fetchPublishedMusicTracks } from '../services/musicService';
import { INITIAL_ADMIN_PROVIDED_TRACKS } from '../data/defaultAdminMusic';
import { audioSynth } from '../utils/audioSynth';
import { resolvePlayableAudioUrl } from '../utils/audioCache';

export function extractYouTubeId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function isStreamableAudio(track: ManagedMusicTrack): boolean {
  if (track.sourceType === 'project_file' || track.sourceType === 'upload') {
    return true;
  }
  const url = (track.audioUrl || '').toLowerCase().trim();
  if (!url) return false;

  if (url.startsWith('/music/')) return true;
  if (url.includes('.mp3') || url.includes('.wav') || url.includes('.m4a') || url.includes('.ogg')) return true;
  if (url.includes('docs.google.com/uc?export=open')) return true;
  if (url.includes('firebasestorage.googleapis.com') || url.includes('storage.googleapis.com')) return true;

  // Web pages that cannot be played directly inside standard HTML5 <audio>
  if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('suno.com') || url.includes('spotify.com') || url.includes('zingmp3.vn')) {
    return false;
  }

  if (track.sourceType === 'direct_url' && url.startsWith('http')) {
    return true;
  }

  return false;
}

export function getExternalSourceUrl(track: ManagedMusicTrack): string {
  if (track.webSourceUrl && track.webSourceUrl.startsWith('http')) {
    return track.webSourceUrl;
  }
  if (track.audioUrl && track.audioUrl.startsWith('http')) {
    return track.audioUrl;
  }
  return '';
}

export function getCategoryLabel(category: MusicTrackCategory): string {
  switch (category) {
    case 'lofi':
      return 'Lo-fi không lời';
    case 'pop':
      return 'Pop có lời';
    case 'other':
    default:
      return 'Nhạc chuyên sâu';
  }
}

interface MusicContextType {
  publishedTracks: ManagedMusicTrack[];
  isLoadingTracks: boolean;
  isRealtimeSyncing: boolean;
  tracksError: string | null;
  refreshPublishedTracks: () => Promise<void>;
  
  // Audio playback state
  activeTrack: ManagedMusicTrack | null;
  isPlaying: boolean;
  isLiveTone: boolean;
  silenceNotice: boolean;
  activeYouTubeId: string | null;
  playbackError: string | null;
  clearPlaybackError: () => void;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLooping: boolean;
  playTrack: (track: ManagedMusicTrack) => void;
  pauseTrack: () => void;
  togglePlayTrack: (track: ManagedMusicTrack) => void;
  togglePlay: () => void;
  stopTrack: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (seconds: number) => void;
  seekTo: (seconds: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleLoop: () => void;
  triggerImmediateSilence: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [publishedTracks, setPublishedTracks] = useState<ManagedMusicTrack[]>(INITIAL_ADMIN_PROVIDED_TRACKS);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(true);
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);
  const [tracksError, setTracksError] = useState<string | null>(null);

  // Playback state
  const [activeTrack, setActiveTrack] = useState<ManagedMusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLiveTone, setIsLiveTone] = useState<boolean>(false);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string | null>(null);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [silenceNotice, setSilenceNotice] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize hidden audio element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = volume;
    audio.loop = isLooping;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      if (!audio.loop) {
        // Auto play next in published list
        setPublishedTracks((currentTracks) => {
          if (currentTracks.length > 0 && activeTrack) {
            const idx = currentTracks.findIndex((t) => t.id === activeTrack.id);
            if (idx >= 0 && idx < currentTracks.length - 1) {
              const next = currentTracks[idx + 1];
              playTrack(next);
            } else {
              setIsPlaying(false);
            }
          } else {
            setIsPlaying(false);
          }
          return currentTracks;
        });
      }
    };

    const onError = (e: any) => {
      console.warn('Audio playback error on track:', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, [activeTrack]);

  // Subscribe to published tracks in Firestore
  useEffect(() => {
    setIsLoadingTracks(true);
    setTracksError(null);

    const unsubscribe = subscribePublishedMusicTracks(
      (firestoreTracks) => {
        setIsLoadingTracks(false);
        setIsRealtimeSyncing(true);
        if (firestoreTracks && firestoreTracks.length > 0) {
          setPublishedTracks(firestoreTracks);
        } else {
          // If Firestore is empty, use initial admin provided tracks
          setPublishedTracks(INITIAL_ADMIN_PROVIDED_TRACKS);
        }
      },
      (err) => {
        console.warn('Could not listen to published tracks:', err);
        setIsLoadingTracks(false);
        setIsRealtimeSyncing(false);
        // Retain initial admin provided tracks
        setPublishedTracks((prev) => (prev.length > 0 ? prev : INITIAL_ADMIN_PROVIDED_TRACKS));
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const refreshPublishedTracks = useCallback(async () => {
    setIsLoadingTracks(true);
    try {
      const list = await fetchPublishedMusicTracks();
      if (list && list.length > 0) {
        setPublishedTracks(list);
      } else {
        setPublishedTracks(INITIAL_ADMIN_PROVIDED_TRACKS);
      }
    } catch (e: any) {
      setTracksError(e.message || 'Không thể làm mới danh sách bài hát');
    } finally {
      setIsLoadingTracks(false);
    }
  }, []);

  const playTrack = useCallback((track: ManagedMusicTrack) => {
    const audio = audioRef.current;
    if (!audio) return;

    setSilenceNotice(false);
    audioSynth.stopAll();

    // If same track is paused, resume it
    if (activeTrack?.id === track.id) {
      if (isLiveTone) {
        setIsPlaying(true);
        return;
      }
      audio.play().then(() => setIsPlaying(true)).catch((e) => console.warn(e));
      return;
    }

    // New track
    setActiveTrack(track);
    setCurrentTime(0);

    const streamable = isStreamableAudio(track);
    if (streamable && track.audioUrl) {
      setIsLiveTone(false);
      audio.src = track.audioUrl;
      audio.volume = isMuted ? 0 : volume;
      audio.loop = isLooping;
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('Playback error for audioUrl:', track.audioUrl, err);
        // Fallback to synthetic tone
        setIsLiveTone(true);
        const synthKey = track.category === 'lofi' ? 'lofi-rain' : track.category === 'pop' ? 'pop-energy' : 'freq-alpha';
        audioSynth.playSunoTrack(synthKey);
        setIsPlaying(true);
      });
    } else {
      // If external web link without streamable direct audio, offer synthesized mood tone
      setIsLiveTone(true);
      const synthKey = track.category === 'lofi' ? 'lofi-rain' : track.category === 'pop' ? 'pop-energy' : 'freq-alpha';
      audioSynth.playSunoTrack(synthKey);
      setIsPlaying(true);
    }
  }, [activeTrack, volume, isMuted, isLooping, isLiveTone]);

  const pauseTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    audioSynth.stopAll();
    setIsPlaying(false);
  }, []);

  const togglePlayTrack = useCallback((track: ManagedMusicTrack) => {
    if (activeTrack?.id === track.id && isPlaying) {
      pauseTrack();
    } else {
      playTrack(track);
    }
  }, [activeTrack, isPlaying, playTrack, pauseTrack]);

  const togglePlay = useCallback(() => {
    if (activeTrack) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(activeTrack);
      }
    } else if (publishedTracks.length > 0) {
      playTrack(publishedTracks[0]);
    }
  }, [activeTrack, isPlaying, pauseTrack, playTrack, publishedTracks]);

  const stopTrack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioSynth.stopAll();
    setIsPlaying(false);
    setActiveTrack(null);
    setCurrentTime(0);
  }, []);

  const playNext = useCallback(() => {
    if (publishedTracks.length === 0) return;
    const currentIdx = activeTrack ? publishedTracks.findIndex((t) => t.id === activeTrack.id) : -1;
    const nextIdx = (currentIdx + 1) % publishedTracks.length;
    playTrack(publishedTracks[nextIdx]);
  }, [publishedTracks, activeTrack, playTrack]);

  const playPrev = useCallback(() => {
    if (publishedTracks.length === 0) return;
    const currentIdx = activeTrack ? publishedTracks.findIndex((t) => t.id === activeTrack.id) : -1;
    const prevIdx = currentIdx <= 0 ? publishedTracks.length - 1 : currentIdx - 1;
    playTrack(publishedTracks[prevIdx]);
  }, [publishedTracks, activeTrack, playTrack]);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current && !isLiveTone) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, [isLiveTone]);

  const seekTo = seek;

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : clamped;
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.volume = next ? 0 : volume;
      }
      return next;
    });
  }, [volume]);

  const toggleLoop = useCallback(() => {
    setIsLooping((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.loop = next;
      }
      return next;
    });
  }, []);

  const triggerImmediateSilence = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    audioSynth.stopAll();
    setIsPlaying(false);
    setCurrentTime(0);
    setSilenceNotice(true);
    setTimeout(() => setSilenceNotice(false), 4000);
  }, []);

  return (
    <MusicContext.Provider
      value={{
        publishedTracks,
        isLoadingTracks,
        isRealtimeSyncing,
        tracksError,
        refreshPublishedTracks,
        activeTrack,
        isPlaying,
        isLiveTone,
        silenceNotice,
        currentTime,
        duration,
        volume,
        isMuted,
        isLooping,
        playTrack,
        pauseTrack,
        togglePlayTrack,
        togglePlay,
        stopTrack,
        playNext,
        playPrev,
        seek,
        seekTo,
        setVolume,
        toggleMute,
        toggleLoop,
        triggerImmediateSilence
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = (): MusicContextType => {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
};
