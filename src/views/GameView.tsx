import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SEED_QUIZ, SeedQuizQuestion } from '../data/seedContent';
import { audioSynth } from '../utils/audioSynth';
import { shuffled, triggerDownload } from '../utils/domain';
import { logVoluntaryEvent } from '../services/eventService';
import { 
  ArrowLeft, 
  Gamepad2, 
  Music, 
  Volume2, 
  Square, 
  Play, 
  Circle, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Trophy, 
  Sparkles,
  Download,
  Upload,
  Clock,
  Timer,
  AlertTriangle,
  Send,
  HelpCircle,
  Headphones,
  Check,
  ExternalLink,
  Flame,
  Award,
  Zap,
  Info,
  VolumeX,
  Repeat,
  Heart
} from 'lucide-react';

interface GameViewProps {
  onBackToHome: () => void;
  onPlaySound: (name: string) => void;
}

const KEYBOARD_NOTES = [
  { key: 'A', name: 'Đô', midi: 60, sub: 'C4', color: 'border-blue-400 bg-blue-50/80 hover:bg-blue-100 text-blue-900' },
  { key: 'S', name: 'Rê', midi: 62, sub: 'D4', color: 'border-sky-400 bg-sky-50/80 hover:bg-sky-100 text-sky-900' },
  { key: 'D', name: 'Mi', midi: 64, sub: 'E4', color: 'border-emerald-400 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900' },
  { key: 'F', name: 'Fa', midi: 65, sub: 'F4', color: 'border-amber-400 bg-amber-50/80 hover:bg-amber-100 text-amber-900' },
  { key: 'J', name: 'Sol', midi: 67, sub: 'G4', color: 'border-orange-400 bg-orange-50/80 hover:bg-orange-100 text-orange-900' },
  { key: 'K', name: 'La', midi: 69, sub: 'A4', color: 'border-purple-400 bg-purple-50/80 hover:bg-purple-100 text-purple-900' },
  { key: 'L', name: 'Si', midi: 71, sub: 'B4', color: 'border-pink-400 bg-pink-50/80 hover:bg-pink-100 text-pink-900' }
];

interface SongChallenge {
  id: string;
  title: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Thử thách';
  description: string;
  notes: { name: string; midi: number; lyric?: string }[];
}

const SONG_CHALLENGES: SongChallenge[] = [
  {
    id: 'butterfly',
    title: 'Kìa con bướm vàng',
    difficulty: 'Dễ',
    description: 'Giai điệu vui tươi, đơn giản gồm các nốt Đô, Rê, Mi, Fa, Sol.',
    notes: [
      { name: 'Đô', midi: 60, lyric: 'Kìa' },
      { name: 'Rê', midi: 62, lyric: 'con' },
      { name: 'Mi', midi: 64, lyric: 'bướm' },
      { name: 'Đô', midi: 60, lyric: 'vàng' },
      { name: 'Đô', midi: 60, lyric: 'Kìa' },
      { name: 'Rê', midi: 62, lyric: 'con' },
      { name: 'Mi', midi: 64, lyric: 'bướm' },
      { name: 'Đô', midi: 60, lyric: 'vàng' },
      { name: 'Mi', midi: 64, lyric: 'Xòe' },
      { name: 'Fa', midi: 65, lyric: 'đôi' },
      { name: 'Sol', midi: 67, lyric: 'cánh' },
      { name: 'Mi', midi: 64, lyric: 'Xòe' },
      { name: 'Fa', midi: 65, lyric: 'đôi' },
      { name: 'Sol', midi: 67, lyric: 'cánh' },
      { name: 'La', midi: 69, lyric: 'Bướm' },
      { name: 'Sol', midi: 67, lyric: 'bay' }
    ]
  },
  {
    id: 'twinkle',
    title: 'Twinkle Twinkle Little Star',
    difficulty: 'Trung bình',
    description: 'Bản nhạc cổ điển quen thuộc với bước nhảy quãng 5 trong trẻo.',
    notes: [
      { name: 'Đô', midi: 60, lyric: 'Twin-' },
      { name: 'Đô', midi: 60, lyric: 'kle' },
      { name: 'Sol', midi: 67, lyric: 'twin-' },
      { name: 'Sol', midi: 67, lyric: 'kle' },
      { name: 'La', midi: 69, lyric: 'lit-' },
      { name: 'La', midi: 69, lyric: 'tle' },
      { name: 'Sol', midi: 67, lyric: 'star' },
      { name: 'Fa', midi: 65, lyric: 'How' },
      { name: 'Fa', midi: 65, lyric: 'I' },
      { name: 'Mi', midi: 64, lyric: 'won-' },
      { name: 'Mi', midi: 64, lyric: 'der' },
      { name: 'Rê', midi: 62, lyric: 'what' },
      { name: 'Rê', midi: 62, lyric: 'you' },
      { name: 'Đô', midi: 60, lyric: 'are' }
    ]
  },
  {
    id: 'lofi-chill',
    title: 'Giai điệu Lo-fi Thư giãn (Study Flow)',
    difficulty: 'Thử thách',
    description: 'Chuỗi giai điệu ngũ cung êm dịu giúp não bộ chuyển sang sóng Alpha.',
    notes: [
      { name: 'Mi', midi: 64, lyric: 'Tĩnh' },
      { name: 'Sol', midi: 67, lyric: 'lặng' },
      { name: 'La', midi: 69, lyric: 'êm' },
      { name: 'Si', midi: 71, lyric: 'đềm' },
      { name: 'Sol', midi: 67, lyric: 'học' },
      { name: 'Mi', midi: 64, lyric: 'tập' },
      { name: 'Rê', midi: 62, lyric: 'say' },
      { name: 'Đô', midi: 60, lyric: 'mê' },
      { name: 'Mi', midi: 64, lyric: 'Tâm' },
      { name: 'Sol', midi: 67, lyric: 'trí' },
      { name: 'La', midi: 69, lyric: 'sáng' },
      { name: 'Sol', midi: 67, lyric: 'ngời' },
      { name: 'Fa', midi: 65, lyric: 'tương' },
      { name: 'Mi', midi: 64, lyric: 'lai' },
      { name: 'Rê', midi: 62, lyric: 'rạng' },
      { name: 'Đô', midi: 60, lyric: 'rỡ' }
    ]
  }
];

interface FocusLevel {
  level: number;
  name: string;
  gridSize: number;
  totalNumbers: number;
  timeLimitSeconds: number;
  badge: string;
  desc: string;
}

const FOCUS_LEVELS: FocusLevel[] = [
  { level: 1, name: 'Khởi động', gridSize: 3, totalNumbers: 9, timeLimitSeconds: 25, badge: 'Level 1: Dễ 🌱', desc: 'Ma trận 3×3 (1 đến 9) - Đánh thức thị giác nhanh' },
  { level: 2, name: 'Rèn luyện', gridSize: 4, totalNumbers: 16, timeLimitSeconds: 45, badge: 'Level 2: Vừa ⚡', desc: 'Ma trận 4×4 (1 đến 16) - Mở rộng vùng quan sát ngoại vi' },
  { level: 3, name: 'Tiêu chuẩn', gridSize: 5, totalNumbers: 25, timeLimitSeconds: 60, badge: 'Level 3: Chuẩn cẩm nang 🎯', desc: 'Ma trận 5×5 (1 đến 25) - Thước đo chú ý có hướng đích' },
  { level: 4, name: 'Siêu tập trung', gridSize: 6, totalNumbers: 36, timeLimitSeconds: 90, badge: 'Level 4: Thử thách 🔥', desc: 'Ma trận 6×6 (1 đến 36) - Thử thách sức bền nhận thức cao độ' }
];

interface RecordedNoteEvent {
  t: number;
  note: number;
  duration?: number;
}

export const GameView: React.FC<GameViewProps> = ({
  onBackToHome,
  onPlaySound
}) => {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'quiz' | 'focusGrid' | 'minigame'>('keyboard');

  // ================= TAB 1: KEYBOARD & SONG CHALLENGE =================
  const [pianoMode, setPianoMode] = useState<'free' | 'challenge' | 'earTraining'>('free');
  const [volume, setVolume] = useState<number>(0.7);
  const [activeKeyMidi, setActiveKeyMidi] = useState<number | null>(null);

  // Free play & recording
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordStart, setRecordStart] = useState<number>(0);
  const [recordedEvents, setRecordedEvents] = useState<RecordedNoteEvent[]>([]);
  const [recordedLengthMs, setRecordedLengthMs] = useState<number>(0);
  const [isPlayingMelody, setIsPlayingMelody] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [melodySharedStatus, setMelodySharedStatus] = useState<string | null>(null);
  const melodyTimeoutRefs = useRef<number[]>([]);

  // Song Challenge
  const [selectedSong, setSelectedSong] = useState<SongChallenge>(SONG_CHALLENGES[0]);
  const [songNoteIndex, setSongNoteIndex] = useState<number>(0);
  const [songScore, setSongScore] = useState<number>(0);
  const [songStreak, setSongStreak] = useState<number>(0);
  const [songCompleted, setSongCompleted] = useState<boolean>(false);
  const [songFeedback, setSongFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Ear Training
  const [targetEarMidi, setTargetEarMidi] = useState<number | null>(null);
  const [earStreak, setEarStreak] = useState<number>(0);
  const [earFeedback, setEarFeedback] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // ================= TAB 2: 12-QUESTION QUIZ STATE =================
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizShared, setQuizShared] = useState<boolean>(false);

  // ================= TAB 3: FOCUS GRID (SCHULTE) STATE =================
  const [selectedFocusLevel, setSelectedFocusLevel] = useState<FocusLevel>(FOCUS_LEVELS[2]); // Default 5x5
  const [gridNumbers, setGridNumbers] = useState<number[]>([]);
  const [nextExpected, setNextExpected] = useState<number>(1);
  const [gridTimeLeft, setGridTimeLeft] = useState<number>(60);
  const [gridRunning, setGridRunning] = useState<boolean>(false);
  const [gridCompleted, setGridCompleted] = useState<boolean>(false);
  const [interrupted, setInterrupted] = useState<boolean>(false);
  const [gridErrors, setGridErrors] = useState<number>(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [gridStreak, setGridStreak] = useState<number>(0);
  const [gridFeedback, setGridFeedback] = useState<{ text: string; type: 'correct' | 'wrong' | 'combo' } | null>(null);
  const [lastWrongNum, setLastWrongNum] = useState<number | null>(null);
  const [gridShared, setGridShared] = useState<boolean>(false);
  const [showGridGuide, setShowGridGuide] = useState<boolean>(false);
  const lastClickTimeRef = useRef<number>(0);
  const gridTimerRef = useRef<number | null>(null);

  // ----------------- KEYBOARD EFFECTS & METHODS -----------------
  const playNote = useCallback((noteMidi: number, noteName: string) => {
    setActiveKeyMidi(noteMidi);
    audioSynth.playKeyboardNote(noteMidi, 0.35, volume * 0.4);
    onPlaySound(`Nốt ${noteName}`);

    // Handling in Song Challenge Mode
    if (pianoMode === 'challenge' && !songCompleted) {
      const expectedNote = selectedSong.notes[songNoteIndex];
      if (noteMidi === expectedNote.midi) {
        // Correct note
        const newStreak = songStreak + 1;
        setSongStreak(newStreak);
        setSongScore(prev => prev + 10 + Math.min(5, newStreak) * 2);
        audioSynth.playCorrectChime(newStreak);

        if (newStreak >= 3) {
          audioSynth.playComboChime(newStreak);
        }

        setSongFeedback({
          text: newStreak >= 3 ? `Combo x${newStreak}! Chính xác ✨` : `Tuyệt vời! +10 điểm ✨`,
          isCorrect: true
        });

        if (songNoteIndex + 1 >= selectedSong.notes.length) {
          // Completed song!
          setSongCompleted(true);
          audioSynth.playCelebrationFanfare();
          setTimeout(() => {
            audioSynth.playApplause(2.5);
          }, 400);
        } else {
          setSongNoteIndex(prev => prev + 1);
        }
      } else {
        // Wrong note
        setSongStreak(0);
        audioSynth.playWrongBuzzer();
        setSongFeedback({
          text: `Chưa đúng! Nốt cần đánh là "${expectedNote.name}". Bình tĩnh nhé 🌱`,
          isCorrect: false
        });
      }
    }

    // Handling in Ear Training Mode
    if (pianoMode === 'earTraining' && targetEarMidi !== null) {
      if (noteMidi === targetEarMidi) {
        const newStreak = earStreak + 1;
        setEarStreak(newStreak);
        audioSynth.playCorrectChime(newStreak);
        setEarFeedback({
          text: `Chính xác! Đó là nốt ${noteName} 🌟 (Chuỗi đúng: ${newStreak})`,
          isCorrect: true
        });
        if (newStreak % 5 === 0) {
          audioSynth.playCelebrationFanfare();
          setTimeout(() => audioSynth.playApplause(2.0), 300);
        }
        // Generate next target after 1.2s
        setTimeout(() => {
          generateEarTarget();
        }, 1200);
      } else {
        setEarStreak(0);
        audioSynth.playWrongBuzzer();
        const expectedObj = KEYBOARD_NOTES.find(n => n.midi === targetEarMidi);
        setEarFeedback({
          text: `Chưa đúng rồi! Nốt vừa phát là ${expectedObj?.name || ''}. Hãy nghe lại nhé 🌱`,
          isCorrect: false
        });
      }
    }

    // Handling in Free Recording Mode
    if (pianoMode === 'free' && isRecording) {
      const now = Date.now();
      const offset = now - recordStart;
      if (offset <= 30000) {
        setRecordedEvents(prev => [...prev, { t: offset, note: noteMidi, duration: 350 }]);
        setRecordedLengthMs(offset);
      } else {
        setIsRecording(false);
      }
    }

    setTimeout(() => {
      setActiveKeyMidi(prev => (prev === noteMidi ? null : prev));
    }, 200);
  }, [pianoMode, songCompleted, selectedSong, songNoteIndex, songStreak, targetEarMidi, earStreak, isRecording, recordStart, volume, onPlaySound]);

  // Ear training target generator
  const generateEarTarget = () => {
    const randomNote = KEYBOARD_NOTES[Math.floor(Math.random() * KEYBOARD_NOTES.length)];
    setTargetEarMidi(randomNote.midi);
    audioSynth.playKeyboardNote(randomNote.midi, 0.5, volume * 0.45);
    onPlaySound(`Nghe nốt bí ẩn...`);
  };

  const replayEarTarget = () => {
    if (targetEarMidi) {
      audioSynth.playKeyboardNote(targetEarMidi, 0.5, volume * 0.45);
      onPlaySound(`Nghe lại nốt bí ẩn...`);
    } else {
      generateEarTarget();
    }
  };

  const restartSongChallenge = (song: SongChallenge) => {
    setSelectedSong(song);
    setSongNoteIndex(0);
    setSongScore(0);
    setSongStreak(0);
    setSongCompleted(false);
    setSongFeedback(null);
  };

  // Physical keyboard listener
  useEffect(() => {
    if (activeTab !== 'keyboard') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const keyUpper = e.key.toUpperCase();
      const matched = KEYBOARD_NOTES.find(n => n.key === keyUpper);
      if (matched) {
        playNote(matched.midi, matched.name);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, playNote]);

  const handleStartRecord = () => {
    setIsRecording(true);
    setRecordStart(Date.now());
    setRecordedEvents([]);
    setRecordedLengthMs(0);
    setMelodySharedStatus(null);
  };

  const handleStopRecord = () => {
    setIsRecording(false);
    setRecordedLengthMs(Math.min(30000, Date.now() - recordStart));
  };

  const handleSaveMelody = () => {
    if (!recordedEvents.length) return;
    const data = {
      events: recordedEvents,
      lengthMs: recordedLengthMs || 5000,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('sss:melody:v1', JSON.stringify(data));
    setMelodySharedStatus('Đã lưu giai điệu vào thiết bị của bạn!');
    setTimeout(() => setMelodySharedStatus(null), 3000);
  };

  const handleLoadMelody = () => {
    const raw = localStorage.getItem('sss:melody:v1');
    if (!raw) {
      alert('Chưa có giai điệu nào được lưu trên thiết bị.');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setRecordedEvents(parsed.events || []);
      setRecordedLengthMs(parsed.lengthMs || 5000);
      setMelodySharedStatus('Đã tải giai điệu từ bộ nhớ thiết bị!');
      setTimeout(() => setMelodySharedStatus(null), 3000);
    } catch {
      alert('Dữ liệu giai điệu không hợp lệ.');
    }
  };

  const stopMelodyPlayback = useCallback(() => {
    melodyTimeoutRefs.current.forEach(t => clearTimeout(t));
    melodyTimeoutRefs.current = [];
    setIsPlayingMelody(false);
  }, []);

  const playRecordedMelody = useCallback((loop = false) => {
    stopMelodyPlayback();
    if (!recordedEvents.length) return;

    setIsPlayingMelody(true);
    const totalMs = Math.max(recordedLengthMs, recordedEvents[recordedEvents.length - 1].t + 600);

    recordedEvents.forEach(ev => {
      const tid = window.setTimeout(() => {
        audioSynth.playKeyboardNote(ev.note, 0.35, volume * 0.4);
      }, ev.t);
      melodyTimeoutRefs.current.push(tid);
    });

    const endTid = window.setTimeout(() => {
      if (loop && isLooping) {
        playRecordedMelody(true);
      } else {
        setIsPlayingMelody(false);
      }
    }, totalMs);
    melodyTimeoutRefs.current.push(endTid);
  }, [recordedEvents, recordedLengthMs, volume, isLooping, stopMelodyPlayback]);

  const handleExportWav = async () => {
    if (!recordedEvents.length) {
      alert('Vui lòng ghi âm giai điệu trước khi xuất tệp WAV.');
      return;
    }
    try {
      const wav = await audioSynth.exportMelodyToWav(recordedEvents, recordedLengthMs, volume * 0.4);
      triggerDownload('self-study-sound-giai-dieu.wav', wav, 'audio/wav');
    } catch (err: any) {
      alert('Lỗi xuất tệp WAV: ' + err.message);
    }
  };

  // ----------------- TAB 2: QUIZ METHODS -----------------
  const currentQ = SEED_QUIZ[currentQIdx];

  const handleSelectQuizAnswer = (idx: number) => {
    if (isAnswered) return;
    setSelectedAnswer(idx);
    setIsAnswered(true);

    if (idx === currentQ.answer) {
      setQuizScore(prev => prev + 1);
      audioSynth.playCorrectChime(quizScore + 1);
    } else {
      audioSynth.playWrongBuzzer();
    }
  };

  const handleNextQuiz = () => {
    if (currentQIdx < SEED_QUIZ.length - 1) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      audioSynth.playCelebrationFanfare();
      setTimeout(() => audioSynth.playApplause(2.5), 400);
    }
  };

  const handleRestartQuiz = () => {
    setCurrentQIdx(0);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setQuizScore(0);
    setQuizFinished(false);
    setQuizShared(false);
  };

  const handleShareQuizResult = async () => {
    setQuizShared(true);
    await logVoluntaryEvent({
      type: 'quiz_share',
      data: {
        score: quizScore,
        total: SEED_QUIZ.length,
        percent: Math.round((quizScore / SEED_QUIZ.length) * 100)
      },
      clientReportedAt: new Date().toISOString()
    });
  };

  // ----------------- TAB 3: FOCUS GRID (SCHULTE) METHODS -----------------
  const startFocusGrid = (level = selectedFocusLevel) => {
    const nums = shuffled(Array.from({ length: level.totalNumbers }, (_, i) => i + 1));
    setGridNumbers(nums);
    setNextExpected(1);
    setGridTimeLeft(level.timeLimitSeconds);
    setGridErrors(0);
    setReactionTimes([]);
    setGridStreak(0);
    setGridFeedback({ text: 'Bắt đầu! Hãy tìm số 1 đầu tiên 🌟', type: 'correct' });
    setLastWrongNum(null);
    setGridRunning(true);
    setGridCompleted(false);
    setInterrupted(false);
    setGridShared(false);
    lastClickTimeRef.current = Date.now();
  };

  // Listen for tab switching / interruption
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && gridRunning) {
        setInterrupted(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [gridRunning]);

  // Timer countdown
  useEffect(() => {
    if (!gridRunning) return;

    gridTimerRef.current = window.setInterval(() => {
      setGridTimeLeft(prev => {
        if (prev <= 1) {
          if (gridTimerRef.current) clearInterval(gridTimerRef.current);
          setGridRunning(false);
          setGridCompleted(true);
          audioSynth.playCelebrationFanfare();
          setTimeout(() => audioSynth.playApplause(2.0), 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (gridTimerRef.current) clearInterval(gridTimerRef.current);
    };
  }, [gridRunning]);

  const handleGridClick = (num: number) => {
    if (!gridRunning) return;

    const now = Date.now();
    const reactTime = now - lastClickTimeRef.current;
    lastClickTimeRef.current = now;

    if (num === nextExpected) {
      const newStreak = gridStreak + 1;
      setGridStreak(newStreak);
      setLastWrongNum(null);

      // Play chime based on streak
      audioSynth.playCorrectChime(newStreak);

      if (newStreak >= 4) {
        audioSynth.playComboChime(newStreak);
      }

      setReactionTimes(prev => [...prev, reactTime]);

      if (nextExpected === selectedFocusLevel.totalNumbers) {
        // Complete the grid!
        if (gridTimerRef.current) clearInterval(gridTimerRef.current);
        setGridRunning(false);
        setGridCompleted(true);
        setGridFeedback({ text: 'XUẤT SẮC! BẠN ĐÃ HOÀN THÀNH TOÀN BỘ BẢNG! 🎉', type: 'combo' });
        audioSynth.playCelebrationFanfare();
        setTimeout(() => {
          audioSynth.playApplause(3.0);
        }, 350);
      } else {
        const next = nextExpected + 1;
        setNextExpected(next);
        setGridFeedback({
          text: newStreak >= 4 
            ? `Combo x${newStreak}! Tìm số ${next} ⚡` 
            : `Chính xác! Tiếp theo tìm số ${next} ✨`,
          type: newStreak >= 4 ? 'combo' : 'correct'
        });
      }
    } else {
      // Picked wrong number
      setGridStreak(0);
      setGridErrors(prev => prev + 1);
      setLastWrongNum(num);
      audioSynth.playWrongBuzzer();
      setGridFeedback({
        text: `⚠️ Chưa đúng! Bạn cần tìm số ${nextExpected}. Bình tĩnh quan sát nhé 🌱`,
        type: 'wrong'
      });
    }
  };

  const handleShareGridResult = async () => {
    setGridShared(true);
    const meanReact = reactionTimes.length ? reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length : 0;
    await logVoluntaryEvent({
      type: 'focus_game_share',
      data: {
        level: selectedFocusLevel.level,
        levelName: selectedFocusLevel.name,
        correctFound: nextExpected - 1,
        totalNumbers: selectedFocusLevel.totalNumbers,
        errors: gridErrors,
        durationSeconds: selectedFocusLevel.timeLimitSeconds - gridTimeLeft,
        interrupted,
        meanReactionMs: Math.round(meanReact)
      },
      clientReportedAt: new Date().toISOString()
    });
  };

  const meanReactionTime = reactionTimes.length
    ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
    : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Header & Navigation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-sky-100 shadow-sm relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-sky-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-24 bottom-0 w-32 h-32 bg-pink-100/50 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-2xl bg-sky-50 hover:bg-sky-100 text-blue-700 transition-colors border border-sky-200 shadow-2xs"
            title="Trở về Trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-xs font-black shadow-2xs flex items-center gap-1">
                <span>🎮</span> Chức năng 03
              </span>
              <span className="text-xs font-bold text-slate-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                Self Study Sound
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-1 flex items-center gap-2">
              <span>Trò chơi & Sáng tạo âm thanh</span>
              <span className="text-base">✨🎹</span>
            </h1>
            <p className="text-sm text-slate-800 font-medium mt-0.5">
              Tập đánh đàn theo bản nhạc, rèn luyện sự tập trung đa cấp độ và thử thách kiến thức cẩm nang.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200 relative z-10 shrink-0">
          <button
            onClick={() => setActiveTab('keyboard')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'keyboard'
                ? 'bg-white text-blue-700 shadow-xs border border-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Music className="w-4 h-4 text-blue-600" />
            <span>Bàn phím âm thanh</span>
          </button>

          <button
            onClick={() => setActiveTab('focusGrid')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'focusGrid'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Rèn luyện tập trung</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-white text-purple-700 shadow-xs border border-purple-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-purple-600" />
            <span>Quiz cẩm nang (12 câu)</span>
          </button>

          <button
            onClick={() => setActiveTab('minigame')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'minigame'
                ? 'bg-white text-pink-700 shadow-xs border border-pink-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-pink-600" />
            <span>Sáng tạo Suno</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BÀN PHÍM ÂM THANH & THỬ THÁCH BẢN NHẠC */}
      {/* ========================================================================= */}
      {activeTab === 'keyboard' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Sub-mode selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-sky-100 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">Chế độ chơi:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPianoMode('free')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pianoMode === 'free'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎶 Tự do sáng tạo & Xuất WAV
                </button>
                <button
                  onClick={() => {
                    setPianoMode('challenge');
                    restartSongChallenge(selectedSong);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pianoMode === 'challenge'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🌟 Thử thách đánh theo bản nhạc
                </button>
                <button
                  onClick={() => {
                    setPianoMode('earTraining');
                    setEarStreak(0);
                    setEarFeedback(null);
                    generateEarTarget();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    pianoMode === 'earTraining'
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  🎧 Luyện tai cảm âm
                </button>
              </div>
            </div>

            {/* Volume control */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Volume2 className="w-4 h-4 text-blue-600" />
              <span>Âm lượng: {Math.round(volume * 100)}%</span>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  audioSynth.setVolume(val);
                }}
                className="w-20 accent-blue-600 cursor-pointer"
              />
            </div>
          </div>

          {/* SUB-MODE 2: SONG CHALLENGE DASHBOARD */}
          {pianoMode === 'challenge' && (
            <div className="p-5 rounded-3xl bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold uppercase">
                      Bản nhạc: {selectedSong.title}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                      Độ khó: {selectedSong.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium mt-1">
                    {selectedSong.description}
                  </p>
                </div>

                {/* Song Switcher */}
                <div className="flex items-center gap-1.5">
                  {SONG_CHALLENGES.map(song => (
                    <button
                      key={song.id}
                      onClick={() => restartSongChallenge(song)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        selectedSong.id === song.id
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                      }`}
                    >
                      {song.title.split(' ')[0]}...
                    </button>
                  ))}
                  <button
                    onClick={() => restartSongChallenge(selectedSong)}
                    className="p-1.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-100 text-emerald-700 transition-colors"
                    title="Chơi lại bài này"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress & Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-600">Tiến độ nốt</div>
                  <div className="text-lg font-extrabold text-emerald-700">
                    {songNoteIndex} / {selectedSong.notes.length}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-600">Điểm số</div>
                  <div className="text-lg font-extrabold text-blue-700">{songScore}</div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-600">Chuỗi Combo</div>
                  <div className="text-lg font-extrabold text-orange-600 flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    <span>x{songStreak}</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-emerald-200 shadow-2xs">
                  <div className="text-[11px] font-bold text-slate-600">Nốt cần đánh kế tiếp</div>
                  <div className="text-lg font-extrabold text-purple-700">
                    {!songCompleted ? selectedSong.notes[songNoteIndex]?.name : 'Hoàn thành!'}
                  </div>
                </div>
              </div>

              {/* Visual Melody Note Track */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Dòng khuông nốt hướng dẫn:</span>
                  <span className="text-[11px] text-slate-500">Bấm phím đàn tương ứng bên dưới</span>
                </div>
                <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-white/90 rounded-2xl border border-emerald-200">
                  {selectedSong.notes.map((n, idx) => {
                    const isDone = idx < songNoteIndex;
                    const isCurrent = idx === songNoteIndex && !songCompleted;
                    return (
                      <div
                        key={idx}
                        className={`shrink-0 px-3 py-2 rounded-xl text-center font-bold text-xs transition-all ${
                          isCurrent
                            ? 'bg-emerald-600 text-white scale-110 shadow-md ring-2 ring-emerald-400 ring-offset-2 animate-bounce'
                            : isDone
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        <div className="text-[10px] opacity-75">{n.lyric || `#${idx + 1}`}</div>
                        <div className="text-sm font-extrabold">{n.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedback toast */}
              {songFeedback && (
                <div className={`p-2.5 rounded-2xl text-xs font-bold text-center border animate-in fade-in ${
                  songFeedback.isCorrect
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}>
                  {songFeedback.text}
                </div>
              )}

              {/* Celebration Banner when Completed */}
              {songCompleted && (
                <div className="p-4 rounded-2xl bg-linear-to-r from-amber-400 via-orange-400 to-pink-500 text-white text-center space-y-2 shadow-md animate-in zoom-in-95">
                  <div className="text-2xl">🎉 👏 🌟</div>
                  <h4 className="text-lg font-extrabold">Chúc mừng! Bạn đã hoàn thành bản nhạc xuất sắc!</h4>
                  <p className="text-xs font-medium opacity-90">
                    Tổng điểm: {songScore} • Âm thanh vỗ tay và giai điệu ăn mừng đã vang lên khích lệ bạn!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      onClick={() => restartSongChallenge(selectedSong)}
                      className="px-4 py-2 bg-white text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
                    >
                      Chơi lại bài này 🔄
                    </button>
                    <button
                      onClick={() => {
                        const nextIdx = (SONG_CHALLENGES.findIndex(s => s.id === selectedSong.id) + 1) % SONG_CHALLENGES.length;
                        restartSongChallenge(SONG_CHALLENGES[nextIdx]);
                      }}
                      className="px-4 py-2 bg-amber-950/40 text-white rounded-xl text-xs font-bold hover:bg-amber-950/60 transition-colors"
                    >
                      Bài tiếp theo ➡️
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SUB-MODE 3: EAR TRAINING (LUYỆN TAI CẢM ÂM) */}
          {pianoMode === 'earTraining' && (
            <div className="p-5 rounded-3xl bg-linear-to-r from-purple-50 via-indigo-50 to-pink-50 border-2 border-purple-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[11px] font-extrabold uppercase">
                    Rèn luyện tai cảm âm (Ear Training)
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900 mt-1">
                    Lắng nghe cao độ và đoán xem đó là nốt nào!
                  </h3>
                  <p className="text-xs text-slate-700 font-medium mt-0.5">
                    Rèn luyện khả năng phân biệt tần số âm thanh, hỗ trợ ghi nhớ bài học và cảm thụ âm nhạc.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={replayEarTarget}
                    className="px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Nghe lại âm thanh</span>
                  </button>
                  <button
                    onClick={generateEarTarget}
                    className="px-3 py-2 rounded-2xl bg-white border border-purple-200 text-purple-700 text-xs font-bold hover:bg-purple-50 transition-colors"
                  >
                    Đổi nốt khác
                  </button>
                </div>
              </div>

              {/* Ear Stats */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white rounded-2xl border border-purple-200 shadow-2xs flex-1 text-center">
                  <div className="text-[11px] font-bold text-slate-600">Chuỗi đoán đúng liên tiếp</div>
                  <div className="text-xl font-extrabold text-purple-700 flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <span>{earStreak}</span>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-2xl border border-purple-200 shadow-2xs flex-2">
                  <div className="text-[11px] font-bold text-slate-600">Hướng dẫn</div>
                  <p className="text-xs text-slate-700 mt-0.5">
                    Hệ thống vừa phát 1 nốt. Hãy bấm phím đàn bên dưới (Đô - Rê - Mi - Fa - Sol - La - Si) để chọn đáp án bạn nghe thấy!
                  </p>
                </div>
              </div>

              {/* Feedback */}
              {earFeedback && (
                <div className={`p-3 rounded-2xl text-xs font-bold text-center border animate-in fade-in ${
                  earFeedback.isCorrect
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}>
                  {earFeedback.text}
                </div>
              )}
            </div>
          )}

          {/* MAIN 7-NOTE PIANO KEYBOARD COMPONENT */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-md space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Bàn phím 7 nốt Đô – Rê – Mi – Fa – Sol – La – Si</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                    Phím vật lý: A S D F J K L
                  </span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Bấm phím trên màn hình hoặc gõ bàn phím máy tính để phát âm thanh chuẩn Web Audio API.
                </p>
              </div>

              {/* Free mode record controls */}
              {pianoMode === 'free' && (
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      onClick={handleStartRecord}
                      className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Circle className="w-3.5 h-3.5 fill-current animate-pulse" />
                      <span>Ghi âm giai điệu</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStopRecord}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Dừng ghi ({Math.round((Date.now() - recordStart) / 1000)}s)</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Piano Keys Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3.5 pt-2">
              {KEYBOARD_NOTES.map((n) => {
                const isActive = activeKeyMidi === n.midi;
                const isChallengeExpected = pianoMode === 'challenge' && !songCompleted && selectedSong.notes[songNoteIndex]?.midi === n.midi;

                return (
                  <button
                    key={n.midi}
                    onClick={() => playNote(n.midi, n.name)}
                    className={`relative flex flex-col items-center justify-between h-44 sm:h-52 p-3 rounded-2xl border-2 transition-all duration-150 select-none cursor-pointer transform active:scale-95 ${
                      n.color
                    } ${
                      isActive
                        ? 'scale-95 shadow-inner ring-4 ring-blue-400/50 bg-blue-200'
                        : isChallengeExpected
                        ? 'ring-4 ring-emerald-400 ring-offset-2 animate-pulse shadow-md font-black bg-emerald-100'
                        : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top note subtitle (C4, D4...) */}
                    <span className="text-[10px] sm:text-xs font-bold text-slate-500">
                      {n.sub}
                    </span>

                    {/* Middle: Expected note marker if in Challenge mode */}
                    {isChallengeExpected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase animate-bounce">
                        Bấm nốt này!
                      </span>
                    )}

                    {/* Main Note Vietnamese Name */}
                    <div className="text-center">
                      <span className="text-lg sm:text-2xl font-black block">
                        {n.name}
                      </span>
                      {/* Keyboard shortcut key button badge */}
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-lg bg-white/90 border border-slate-300 text-slate-700 text-[11px] sm:text-xs font-bold shadow-2xs">
                        {n.key}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Free Mode Playback & WAV Export Toolbar */}
            {pianoMode === 'free' && recordedEvents.length > 0 && (
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
                <div className="text-xs text-slate-800 font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Đã ghi <strong>{recordedEvents.length} nốt</strong> ({Math.round(recordedLengthMs / 1000)}s).
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isPlayingMelody ? (
                    <button
                      onClick={() => playRecordedMelody(false)}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Phát lại</span>
                    </button>
                  ) : (
                    <button
                      onClick={stopMelodyPlayback}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Dừng phát</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsLooping(!isLooping)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors border ${
                      isLooping
                        ? 'bg-blue-100 text-blue-800 border-blue-300 font-extrabold'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Lặp lại {isLooping ? '(Bật)' : '(Tắt)'}</span>
                  </button>

                  <button
                    onClick={handleSaveMelody}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Lưu máy</span>
                  </button>

                  <button
                    onClick={handleLoadMelody}
                    className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải lại</span>
                  </button>

                  <button
                    onClick={handleExportWav}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất tệp WAV</span>
                  </button>
                </div>
              </div>
            )}

            {melodySharedStatus && (
              <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center">
                {melodySharedStatus}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RÈN LUYỆN SỰ TẬP TRUNG (SCHULTE FOCUS GRID) */}
      {/* ========================================================================= */}
      {activeTab === 'focusGrid' && (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Level Selector & Header Card */}
          <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase border border-emerald-200">
                    Bảng Schulte Đa Cấp Độ
                  </span>
                  <button
                    onClick={() => setShowGridGuide(!showGridGuide)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 underline"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{showGridGuide ? 'Ẩn hướng dẫn' : 'Xem quy tắc khoa học & hướng dẫn'}</span>
                  </button>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                  Rèn luyện chú ý có hướng đích (Schulte Attention Grid)
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-medium mt-0.5">
                  Chọn cấp độ phù hợp, tìm nhanh các số theo thứ tự tăng dần từ 1 đến {selectedFocusLevel.totalNumbers}.
                </p>
              </div>

              {/* Start / Restart CTA */}
              <div>
                {!gridRunning ? (
                  <button
                    onClick={() => startFocusGrid(selectedFocusLevel)}
                    className="px-6 py-3.5 rounded-2xl bg-linear-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base flex items-center gap-2 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Bắt đầu luyện tập ({selectedFocusLevel.name})</span>
                  </button>
                ) : (
                  <button
                    onClick={() => startFocusGrid(selectedFocusLevel)}
                    className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors border border-slate-300"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Chơi lại màn này</span>
                  </button>
                )}
              </div>
            </div>

            {/* 4 Levels Buttons */}
            <div className="space-y-1.5 pt-2">
              <span className="text-xs font-bold text-slate-800">Chọn cấp độ thử thách:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FOCUS_LEVELS.map(lvl => {
                  const isSelected = selectedFocusLevel.level === lvl.level;
                  return (
                    <button
                      key={lvl.level}
                      onClick={() => {
                        setSelectedFocusLevel(lvl);
                        if (!gridRunning) {
                          setGridNumbers([]);
                          setGridCompleted(false);
                        }
                      }}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/90 shadow-sm ring-2 ring-emerald-200'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-900">{lvl.badge}</span>
                        <span className="text-[11px] font-bold text-emerald-700">{lvl.timeLimitSeconds}s</span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 leading-tight">{lvl.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scientific Guide Accordion */}
            {showGridGuide && (
              <div className="p-4 rounded-2xl bg-sky-50/90 border border-sky-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
                <div className="font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span>Cơ sở khoa học tâm lý học nhận thức:</span>
                </div>
                <p className="leading-relaxed">
                  Bảng Schulte (Schulte Table) được phát triển bởi nhà tâm lý học người Đức Walter Schulte, được ứng dụng rộng rãi trong huấn luyện phi công, tuyển thủ cờ vua và học sinh chuẩn bị cho các kỳ thi căng thẳng.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-medium">
                  <div className="p-2 bg-white rounded-xl border border-sky-200">
                    <strong>1. Mắt nhìn tâm bảng:</strong> Giữ ánh mắt vào ô trung tâm, không lắc đầu liên tục theo từng số.
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-sky-200">
                    <strong>2. Dùng thị giác ngoại vi:</strong> Mở rộng tầm nhìn bao quát toàn bộ ô vuông để phát hiện số tiếp theo.
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-sky-200">
                    <strong>3. Nhịp thở tĩnh lặng:</strong> Hít sâu và thở đều, không đọc nhẩm thành tiếng để đạt trạng thái dòng chảy (Flow state).
                  </div>
                </div>
              </div>
            )}

            {/* Status & Feedback Bar */}
            {gridRunning && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div className="text-[11px] font-bold text-slate-600">Thời gian còn lại</div>
                  <div className={`text-xl font-black ${gridTimeLeft <= 10 ? 'text-rose-600 animate-pulse' : 'text-slate-900'}`}>
                    {gridTimeLeft}s
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <div className="text-[11px] font-bold text-emerald-800">Số cần tìm tiếp theo</div>
                  <div className="text-2xl font-black text-emerald-700 animate-bounce">
                    {nextExpected}
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-center">
                  <div className="text-[11px] font-bold text-blue-800">Chuỗi Combo</div>
                  <div className="text-xl font-black text-blue-700 flex items-center justify-center gap-1">
                    <Flame className="w-5 h-5 text-orange-500" />
                    <span>x{gridStreak}</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <div className="text-[11px] font-bold text-rose-800">Số lần bấm sai</div>
                  <div className="text-xl font-black text-rose-700">
                    {gridErrors}
                  </div>
                </div>
              </div>
            )}

            {/* Toast announcement banner during game */}
            {gridFeedback && gridRunning && (
              <div className={`p-3 rounded-2xl text-xs font-bold text-center border animate-in fade-in transition-all ${
                gridFeedback.type === 'combo'
                  ? 'bg-amber-100 text-amber-900 border-amber-300 ring-2 ring-amber-400'
                  : gridFeedback.type === 'correct'
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : 'bg-rose-100 text-rose-900 border-rose-300 animate-shake'
              }`}>
                {gridFeedback.text}
              </div>
            )}

            {/* Interruption warning */}
            {interrupted && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  ⚠️ Phát hiện chuyển tab trình duyệt! Sự tập trung của bạn đã bị gián đoạn. Hãy duy trì ánh nhìn trên bảng nhé!
                </span>
              </div>
            )}
          </div>

          {/* Schulte Grid Matrix */}
          {gridNumbers.length > 0 && (
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-md flex flex-col items-center">
              <div 
                className={`grid gap-2 sm:gap-3 w-full max-w-xl mx-auto`}
                style={{
                  gridTemplateColumns: `repeat(${selectedFocusLevel.gridSize}, minmax(0, 1fr))`
                }}
              >
                {gridNumbers.map((num) => {
                  const isCompleted = num < nextExpected;
                  const isWrong = lastWrongNum === num;

                  return (
                    <button
                      key={num}
                      disabled={!gridRunning || isCompleted}
                      onClick={() => handleGridClick(num)}
                      className={`aspect-square flex items-center justify-center font-extrabold rounded-2xl border-2 transition-all transform active:scale-90 select-none ${
                        isCompleted
                          ? 'bg-emerald-500 border-emerald-600 text-white shadow-xs opacity-80 cursor-default scale-95'
                          : isWrong
                          ? 'bg-rose-100 border-rose-500 text-rose-800 animate-shake ring-2 ring-rose-400'
                          : 'bg-slate-50 border-slate-300 text-slate-900 hover:bg-emerald-50 hover:border-emerald-400 hover:scale-105 shadow-xs cursor-pointer'
                      } ${
                        selectedFocusLevel.gridSize === 3 ? 'text-2xl sm:text-3xl' :
                        selectedFocusLevel.gridSize === 4 ? 'text-xl sm:text-2xl' :
                        selectedFocusLevel.gridSize === 5 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completion Scoreboard */}
          {gridCompleted && (
            <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-50 via-teal-50 to-sky-50 border-2 border-emerald-300 shadow-lg text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <Trophy className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {nextExpected > selectedFocusLevel.totalNumbers ? 'Xuất sắc! Chinh phục trọn vẹn!' : 'Hết giờ! Hoàn thành tốt lượt rèn luyện!'}
                </h3>
                <p className="text-xs text-slate-700 font-medium mt-1">
                  Đã vang lên âm thanh vỗ tay và giai điệu chúc mừng vinh danh nỗ lực tập trung của bạn 👏!
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-slate-600">Số đã tìm được</div>
                  <div className="text-xl font-extrabold text-emerald-700">
                    {nextExpected - 1} / {selectedFocusLevel.totalNumbers}
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-slate-600">Thời gian hoàn thành</div>
                  <div className="text-xl font-extrabold text-blue-700">
                    {selectedFocusLevel.timeLimitSeconds - gridTimeLeft} giây
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-slate-600">Tốc độ phản xạ TB</div>
                  <div className="text-xl font-extrabold text-purple-700">
                    {meanReactionTime} ms / số
                  </div>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-emerald-200">
                  <div className="text-[11px] font-bold text-slate-600">Đánh giá chú ý</div>
                  <div className="text-sm font-black text-emerald-800">
                    {gridErrors === 0 && meanReactionTime < 1500 ? 'Siêu tập trung ⚡' : 'Tập trung tốt 👍'}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => startFocusGrid(selectedFocusLevel)}
                  className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Luyện tập lại cấp độ này</span>
                </button>

                {selectedFocusLevel.level < 4 && (
                  <button
                    onClick={() => {
                      const nextLvl = FOCUS_LEVELS.find(l => l.level === selectedFocusLevel.level + 1);
                      if (nextLvl) {
                        setSelectedFocusLevel(nextLvl);
                        startFocusGrid(nextLvl);
                      }
                    }}
                    className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>Lên Level {selectedFocusLevel.level + 1} tiếp theo 🚀</span>
                  </button>
                )}

                <button
                  disabled={gridShared}
                  onClick={handleShareGridResult}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    gridShared
                      ? 'bg-slate-200 text-slate-500 cursor-default'
                      : 'bg-white border-2 border-emerald-400 text-emerald-800 hover:bg-emerald-50'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{gridShared ? 'Đã lưu thành tích' : 'Lưu kết quả rèn luyện'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: QUIZ CẨM NANG 12 CÂU */}
      {/* ========================================================================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-in fade-in">
          {!quizFinished ? (
            <div className="p-6 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6 max-w-3xl mx-auto">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold uppercase border border-purple-200">
                  Câu hỏi {currentQIdx + 1} / {SEED_QUIZ.length}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  Điểm hiện tại: {quizScore} / {SEED_QUIZ.length}
                </span>
              </div>

              {/* Question text */}
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-snug">
                  {currentQ.question}
                </h3>
              </div>

              {/* Answers Grid */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  const isPicked = selectedAnswer === idx;
                  const isCorrect = idx === currentQ.answer;

                  let btnStyle = 'bg-slate-50 border-slate-200 hover:bg-purple-50 hover:border-purple-300 text-slate-800';
                  if (isAnswered) {
                    if (isCorrect) {
                      btnStyle = 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold ring-2 ring-emerald-300';
                    } else if (isPicked) {
                      btnStyle = 'bg-rose-50 border-rose-400 text-rose-900 font-bold ring-2 ring-rose-300';
                    } else {
                      btnStyle = 'bg-slate-50/60 border-slate-200 text-slate-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectQuizAnswer(idx)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left text-xs sm:text-sm transition-all flex items-start gap-3 cursor-pointer ${btnStyle}`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-extrabold flex items-center justify-center shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="flex-1 pt-0.5">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {/* Scientific Explanation when answered */}
              {isAnswered && (
                <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-slate-800 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Giải thích cơ sở khoa học & Cẩm nang S2:</span>
                  </div>
                  <p className="leading-relaxed">{currentQ.explanation}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-sky-200">
                    <span className="text-[11px] font-semibold text-slate-600">
                      Tài liệu tham khảo: {currentQ.source}
                    </span>
                    <button
                      onClick={handleNextQuiz}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition-colors"
                    >
                      {currentQIdx < SEED_QUIZ.length - 1 ? 'Câu tiếp theo ➡️' : 'Xem kết quả tổng kết 🏆'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-md text-center space-y-6 max-w-xl mx-auto animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mx-auto shadow-sm">
                <Trophy className="w-10 h-10 text-purple-600" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold text-slate-900">
                  Hoàn thành xuất sắc 12 câu Quiz cẩm nang!
                </h3>
                <p className="text-xs text-slate-600">
                  Bạn đã nắm vững nền tảng khoa học về cách sử dụng âm nhạc hỗ trợ học tập.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-around">
                <div>
                  <div className="text-xs font-bold text-slate-600">Điểm số</div>
                  <div className="text-2xl font-black text-purple-700">
                    {quizScore} / {SEED_QUIZ.length}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-600">Tỉ lệ chính xác</div>
                  <div className="text-2xl font-black text-emerald-700">
                    {Math.round((quizScore / SEED_QUIZ.length) * 100)}%
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors"
                >
                  Làm lại bài Quiz 🔄
                </button>

                <button
                  disabled={quizShared}
                  onClick={handleShareQuizResult}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                    quizShared
                      ? 'bg-slate-200 text-slate-500 cursor-default'
                      : 'bg-purple-600 text-white hover:bg-purple-700 shadow-sm'
                  }`}
                >
                  <Send className="w-4 h-4" />
                  <span>{quizShared ? 'Đã lưu điểm số' : 'Lưu kết quả kiểm tra'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SÁNG TẠO SUNO */}
      {/* ========================================================================= */}
      {activeTab === 'minigame' && (
        <div className="p-8 rounded-3xl bg-white border border-sky-100 shadow-sm space-y-6 max-w-3xl mx-auto animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-[10px] font-extrabold uppercase">
                Hoạt động sáng tạo
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-0.5">
                Sáng tạo bài hát học tập cùng Suno AI
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            Tự tay tạo ra bài hát ôn thi độc bản bằng công nghệ AI sinh âm nhạc Suno (với lời bài hát tóm tắt kiến thức Lịch sử, Địa lý, Công thức Toán hoặc giai điệu Lo-fi cổ vũ tinh thần).
          </p>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              3 Bước tham gia chia sẻ bài hát:
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-extrabold text-blue-700">Bước 1: Lấy Prompt</div>
                <p className="text-slate-600">Vào tab Chatbox (MoodBot), chọn cảm xúc và môn học để nhận gợi ý câu lệnh Suno tối ưu.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-extrabold text-purple-700">Bước 2: Tạo trên Suno</div>
                <p className="text-slate-600">Dán câu lệnh vào suno.com để tạo bài hát có giai điệu và lời bài học.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="font-extrabold text-emerald-700">Bước 3: Gửi Link vào Hộp thư</div>
                <p className="text-slate-600">Vào Hộp thư bảo mật, gửi link bài hát hoặc đóng góp giai điệu để kết nối cùng cộng đồng.</p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 text-xs text-pink-900 space-y-1 font-medium">
            <div className="font-bold flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-pink-600" />
              <span>Lưu ý bảo vệ bản quyền & tính tự nguyện:</span>
            </div>
            <p>
              Học sinh chỉ chia sẻ đường link công khai do Suno tạo, không tải lên tệp âm thanh có chứa nội dung vi phạm thuần phong mỹ tục hoặc bản quyền thương mại.
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
