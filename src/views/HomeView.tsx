import React, { useState } from 'react';
import { NavTab, SoundPad, MailboxMessage, JournalDay } from '../types';
import { 
  SOUND_ENVIRONMENTS, 
  MUSIC_ARTICLES, 
  PLAYLIST_PREVIEWS, 
  SOUND_PADS,
  INITIAL_JOURNAL_DAYS 
} from '../data/initialData';
import { audioSynth } from '../utils/audioSynth';
import { useMusic } from '../context/MusicContext';
import { SharedTrackCard } from '../components/SharedTrackCard';
import { 
  Sparkles, 
  ArrowRight, 
  Headphones, 
  SunMedium, 
  GraduationCap, 
  Heart, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Send, 
  CheckCircle2, 
  Calendar, 
  Check, 
  Lock, 
  UserCheck, 
  MessageSquareHeart, 
  ChevronRight,
  BookOpen,
  Lightbulb,
  BarChart3,
  Sliders,
  Square,
  Circle,
  HelpCircle,
  Clock,
  Flame
} from 'lucide-react';

interface HomeViewProps {
  onSelectTab: (tab: NavTab) => void;
  onPlaySound: (name: string) => void;
  onSubmitMail: (title: string, content: string) => Promise<{ success: boolean; error?: string }> | void;
  sentMailNotice: boolean;
  journalDays?: JournalDay[];
}

export const HomeView: React.FC<HomeViewProps> = ({
  onSelectTab,
  onPlaySound,
  onSubmitMail,
  sentMailNotice,
  journalDays = INITIAL_JOURNAL_DAYS
}) => {
  // Card 2: Interactive Mood Bot State in Home
  const { publishedTracks } = useMusic();
  const [selectedMood, setSelectedMood] = useState<string>('Cần tập trung');
  const [chatInput, setChatInput] = useState('');

  const moodTracks = React.useMemo(() => {
    if (selectedMood === 'Căng thẳng') {
      return publishedTracks.filter(t => 
        t.category === 'lofi' || 
        (t.notes || '').toLowerCase().includes('căng thẳng') || 
        (t.notes || '').toLowerCase().includes('stress') || 
        (t.notes || '').toLowerCase().includes('432') ||
        (t.notes || '').toLowerCase().includes('mưa')
      );
    }
    if (selectedMood === 'Buồn bã') {
      return publishedTracks.filter(t => 
        (t.notes || '').toLowerCase().includes('chữa lành') || 
        (t.notes || '').toLowerCase().includes('xoa dịu') || 
        (t.notes || '').toLowerCase().includes('nắng') || 
        t.category === 'pop' || 
        t.category === 'lofi'
      );
    }
    if (selectedMood === 'Cần tập trung') {
      return publishedTracks.filter(t => 
        (t.notes || '').toLowerCase().includes('alpha') || 
        (t.notes || '').toLowerCase().includes('logic') || 
        (t.notes || '').toLowerCase().includes('toán') || 
        (t.notes || '').toLowerCase().includes('flow') ||
        t.category === 'other' || 
        (t.category === 'lofi' && (!t.bpm || t.bpm <= 75))
      );
    }
    // Thư giãn
    return publishedTracks.filter(t => 
      t.category === 'lofi' || 
      (t.notes || '').toLowerCase().includes('thư thái') || 
      (t.notes || '').toLowerCase().includes('piano')
    );
  }, [publishedTracks, selectedMood]);

  // Card 3: Interactive Soundboard in Home
  const [activePad, setActivePad] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Card 5: Interactive Mailbox State in Home
  const [mailTitle, setMailTitle] = useState('');
  const [mailContent, setMailContent] = useState('');
  const [mailError, setMailError] = useState('');

  const handlePadClick = (pad: SoundPad) => {
    setActivePad(pad.id);
    onPlaySound(pad.name);

    if (pad.soundType === 'piano' || pad.soundType === 'chill' || pad.soundType === 'firework') {
      audioSynth.playNote(pad.soundType, pad.id === 'piano' ? 440 : pad.id === 'chill' ? 523.25 : 659.25);
    } else {
      audioSynth.toggleAmbient(pad.id, pad.soundType);
    }
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mailTitle.trim() || !mailContent.trim()) {
      setMailError('Vui lòng điền đầy đủ tiêu đề và nội dung thư!');
      return;
    }
    setMailError('');
    onSubmitMail(mailTitle, mailContent);
    setMailTitle('');
    setMailContent('');
  };

  return (
    <div className="space-y-10">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Bám sát ảnh tham chiếu) */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#EBF4FF] via-[#E8F1FC] to-[#FCEEF5] p-6 sm:p-8 lg:p-10 border border-sky-100 shadow-sm">
        
        {/* Background ambient accents */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-200/35 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 bottom-0 w-64 h-64 rounded-full bg-pink-200/40 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          
          {/* Left Column: Heading, Value Props & CTAs */}
          <div className="lg:col-span-5 space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/90 backdrop-blur-xs rounded-full border border-blue-200 text-blue-900 text-xs sm:text-sm font-semibold shadow-2xs">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Phương pháp học tập dựa trên cơ sở khoa học nhận thức</span>
            </div>

            <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2]">
              Học tập thông minh <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-700 via-indigo-600 to-sky-600">
                cùng âm nhạc
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed max-w-lg">
              Tối ưu hóa sự tập trung, giảm căng thẳng và đồng hành cùng bạn trên hành trình chinh phục ước mơ!
            </p>

            {/* 4 Value Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-emerald-200 shadow-2xs text-xs font-bold text-emerald-900">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Tập trung hơn</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-purple-200 shadow-2xs text-xs font-bold text-purple-900">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span>Bớt căng thẳng</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-amber-200 shadow-2xs text-xs font-bold text-amber-900">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Học hiệu quả hơn</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-pink-200 shadow-2xs text-xs font-bold text-pink-900">
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                <span>Vui hơn mỗi ngày</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onSelectTab('music-info')}
                className="px-6 py-3.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-2xl shadow-md shadow-blue-500/20 flex items-center gap-2 text-sm sm:text-base transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                id="hero-cta-explore"
              >
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onSelectTab('game')}
                className="px-5 py-3.5 bg-white hover:bg-slate-50 text-blue-800 font-bold rounded-2xl border-2 border-blue-200 shadow-2xs flex items-center gap-2 text-sm sm:text-base transition-all"
                id="hero-cta-quiz"
              >
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>Làm bài test tập trung</span>
              </button>
            </div>

            {/* Instant Web Audio Synthesizer Tester Dock */}
            <div className="pt-2">
              <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-blue-200/90 shadow-2xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-blue-600" />
                    <span>Trải nghiệm âm thanh tức thì:</span>
                  </span>
                  <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    Thử nghe ngay 🎵
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      audioSynth.stopAll();
                      audioSynth.toggleAmbient('hero-rain', 'rain');
                      onPlaySound('Tiếng mưa rơi nhẹ (Pink Noise)');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 text-slate-700 hover:text-sky-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🌧️</span> <span>Mưa nhẹ</span>
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.stopAll();
                      audioSynth.toggleAmbient('hero-lofi', 'lofi');
                      onPlaySound('Lo-fi ấm áp 75 BPM');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-slate-700 hover:text-purple-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>☕</span> <span>Lo-fi 75 BPM</span>
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.stopAll();
                      audioSynth.toggleAmbient('hero-ocean', 'ocean');
                      onPlaySound('Sóng biển tĩnh lặng');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-slate-700 hover:text-cyan-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🌊</span> <span>Sóng biển</span>
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.playNote('piano', 440);
                      onPlaySound('Đàn Piano Thư thái');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🎹</span> <span>Phím Piano</span>
                  </button>
                  <button
                    onClick={() => {
                      audioSynth.playFrequencyTone(432, 4);
                      onPlaySound('Tần số 432Hz Bình yên');
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>🧠</span> <span>Tần số 432Hz</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sub Quote */}
            <p className="italic text-xs sm:text-sm text-blue-900 pt-1 font-semibold">
              “Âm nhạc phù hợp – Hành trình học tập nhẹ nhàng hơn!”
            </p>
          </div>

          {/* Center Column: Visual Graphic with High School Student & Doodles */}
          <div className="lg:col-span-4 flex justify-center relative">
            <div className="relative w-full max-w-sm">
              
              {/* Floating cute quote badges */}
              <div className="absolute -top-3 left-2 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-indigo-100 text-[11px] font-semibold text-indigo-700 rotate-[-4deg] z-20">
                Học hay • Học giỏi • Tương lai tươi sáng ♡
              </div>
              <div className="absolute top-10 -right-2 bg-white/95 px-3 py-1.5 rounded-2xl shadow-sm border border-pink-100 text-[11px] font-semibold text-pink-600 rotate-[4deg] z-20">
                Same Students Brighter Futures ♡
              </div>

              {/* Main Student Image */}
              <div className="relative rounded-3xl overflow-hidden shadow-lg border-4 border-white aspect-4/3 bg-linear-to-br from-blue-100 to-indigo-50">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=700&auto=format&fit=crop&q=80"
                  alt="Học sinh THPT học tập cùng tai nghe và âm nhạc"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
                />
                
                {/* Cloud mascot overlay sticker */}
                <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-2xs border border-white flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
                  <span className="text-sm">☁️</span>
                  <span>Good Music • Better Students ♡</span>
                </div>
              </div>

              {/* Bottom Book stack label */}
              <div className="mt-2 bg-white/90 backdrop-blur-xs rounded-xl py-1.5 px-3 text-center border border-slate-100 shadow-2xs text-[11px] font-medium text-slate-600 flex items-center justify-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Focus • Progress • A Brighter Me</span>
              </div>
            </div>
          </div>

          {/* Right Column: Values & Motivation Card */}
          <div className="lg:col-span-3">
            <div className="bg-white/95 backdrop-blur-md rounded-2xl p-5 border border-white/90 shadow-sm space-y-4">
              
              <div className="text-center pb-2 border-b border-slate-200">
                <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">
                  “Mỗi bản nhạc là một người bạn đồng hành.” ♡
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Âm nhạc khoa học</h4>
                    <p className="text-xs text-slate-700 font-medium">Chuẩn BPM & sóng não Alpha</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <SunMedium className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Thói quen tích cực</h4>
                    <p className="text-xs text-slate-700 font-medium">Lộ trình rèn luyện 21 ngày</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Học tập hạnh phúc</h4>
                    <p className="text-xs text-slate-700 font-medium">Giảm áp lực bài vở</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-pink-50 border border-pink-200">
                  <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center shrink-0">
                    <Heart className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">Cộng đồng đồng hành</h4>
                    <p className="text-xs text-slate-700 font-medium">Nhóm nghiên cứu lắng nghe</p>
                  </div>
                </div>
              </div>

              <div className="pt-1 text-center">
                <span className="inline-block text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-full">
                  Better Music • Brighter You ♡
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. FIVE MAIN FUNCTIONAL CARDS ROW (01 to 05) */}
      {/* ========================================================================= */}
      <section className="space-y-5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              5 Chức năng trọng tâm của Self Study Sound
            </h2>
            <span className="text-xs font-extrabold bg-blue-600 text-white px-3 py-1 rounded-full shadow-2xs">
              Thực tế
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-800 font-semibold">
            Nhấn vào tiêu đề hoặc thẻ để mở trang chi tiết tương ứng
          </p>
        </div>

        {/* Balanced Grid for Computer & Laptop Screens: Row 1 has 3 discovery modules, Row 2 has 2 habit & interaction modules */}
        <div className="space-y-6">
          {/* Row 1: 3 Core Discovery & Interactive Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* ------------------------------------------------------------- */}
          {/* CARD 01: Thông tin về âm nhạc */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border-2 border-sky-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 hover:shadow-xl hover:border-blue-500 transition-all flex flex-col justify-between group relative z-10">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    01
                  </span>
                  <h3 
                    onClick={() => onSelectTab('music-info')}
                    className="font-black text-base sm:text-lg text-slate-950 group-hover:text-blue-600 cursor-pointer transition-colors tracking-tight"
                  >
                    Thông tin về âm nhạc
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('music-info')}
                  className="text-slate-600 group-hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở toàn bộ trang Thông tin"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description - legible and clear */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Khám phá kiến thức âm nhạc khoa học ứng dụng cho học tập!
              </p>

              {/* 3 Môi trường âm thanh phổ biến */}
              <div className="space-y-2 pt-1">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>3 môi trường âm thanh phổ biến:</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 sm:p-2 rounded-xl bg-slate-50 border border-slate-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2">
                    <div className="flex items-center gap-2 sm:block text-left sm:text-center">
                      <VolumeX className="w-4 h-4 text-slate-700 sm:mx-auto mb-0 sm:mb-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-slate-900">Im lặng</div>
                        <div className="text-[11px] text-slate-700 font-medium leading-tight mt-0.5">Tập trung sâu</div>
                      </div>
                    </div>
                    <span className="sm:hidden text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">0 dB</span>
                  </div>

                  <div className="p-2.5 sm:p-2 rounded-xl bg-blue-50 border border-blue-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2">
                    <div className="flex items-center gap-2 sm:block text-left sm:text-center">
                      <Headphones className="w-4 h-4 text-blue-600 sm:mx-auto mb-0 sm:mb-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-blue-950">Lo-fi 70-85 BPM</div>
                        <div className="text-[11px] text-blue-800 font-medium leading-tight mt-0.5">Giảm căng thẳng</div>
                      </div>
                    </div>
                    <span className="sm:hidden text-[11px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">Thư thái</span>
                  </div>

                  <div className="p-2.5 sm:p-2 rounded-xl bg-pink-50 border border-pink-200 flex sm:flex-col items-center justify-between sm:justify-center gap-2">
                    <div className="flex items-center gap-2 sm:block text-left sm:text-center">
                      <Flame className="w-4 h-4 text-pink-600 sm:mx-auto mb-0 sm:mb-1 shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-pink-950">Pop 110-130 BPM</div>
                        <div className="text-[11px] text-pink-800 font-medium leading-tight mt-0.5">Tăng năng lượng</div>
                      </div>
                    </div>
                    <span className="sm:hidden text-[11px] font-bold text-pink-700 bg-white px-2 py-0.5 rounded border border-pink-200">Bốc</span>
                  </div>
                </div>
              </div>

              {/* Featured Articles List */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">Kiến thức nổi bật:</span>
                  <button 
                    onClick={() => onSelectTab('music-info')}
                    className="text-blue-700 hover:text-blue-900 hover:underline text-xs font-semibold cursor-pointer"
                  >
                    Xem thêm →
                  </button>
                </div>
                <div className="space-y-1.5 text-xs text-slate-800 font-medium">
                  <div 
                    onClick={() => onSelectTab('music-info')}
                    className="p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="break-words">Âm nhạc nào phù hợp với môn học?</span>
                  </div>
                  <div 
                    onClick={() => onSelectTab('music-info')}
                    className="p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="break-words">Mẹo nghe nhạc khi học hiệu quả</span>
                  </div>
                  <div 
                    onClick={() => onSelectTab('music-info')}
                    className="p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <Sliders className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="break-words">Nguyên tắc chọn âm thanh theo nhiệm vụ</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom mini promo banner */}
            <div 
              onClick={() => onSelectTab('music-info')}
              className="mt-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3 text-center cursor-pointer shadow-xs hover:opacity-95 transition-opacity"
            >
              <div className="text-[11px] uppercase font-bold tracking-wider text-blue-100">
                Góc học sinh THPT
              </div>
              <div className="text-xs sm:text-sm font-bold mt-0.5">
                KIẾN THỨC NHỎ THAY ĐỔI LỚN! 💡
              </div>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 02: Chatbox đề xuất nhạc */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full bg-white rounded-2xl p-5 border-2 border-purple-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 hover:shadow-xl hover:border-purple-500 transition-all flex flex-col justify-between group relative z-10">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-purple-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    02
                  </span>
                  <h3 
                    onClick={() => onSelectTab('mood-bot')}
                    className="font-black text-base sm:text-lg text-slate-950 group-hover:text-purple-600 cursor-pointer transition-colors tracking-tight"
                  >
                    Chatbox đề xuất nhạc
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('mood-bot')}
                  className="text-slate-600 group-hover:text-purple-600 p-1.5 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở Mood Bot"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Chia sẻ tâm trạng, nhận gợi ý nhạc phù hợp cùng Mood Bot!
              </p>

              {/* Mood Bot Interactive Widget */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-3">
                {/* Bot Message */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div className="bg-white p-2.5 rounded-xl rounded-tl-xs shadow-2xs text-xs text-slate-800 font-medium leading-relaxed border border-slate-200">
                    Xin chào! Bạn đang cảm thấy thế nào? Hãy chia sẻ để mình gợi ý nhạc phù hợp nhé! 🎵
                  </div>
                </div>

                {/* 4 Mood Pills */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  {[
                    { label: 'Căng thẳng', emoji: '😫', color: 'hover:bg-rose-50 hover:text-rose-800 hover:border-rose-300' },
                    { label: 'Buồn bã', emoji: '😢', color: 'hover:bg-indigo-50 hover:text-indigo-800 hover:border-indigo-300' },
                    { label: 'Cần tập trung', emoji: '🎯', color: 'hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300' },
                    { label: 'Thư giãn', emoji: '🌿', color: 'hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300' },
                  ].map((m) => (
                    <button
                      key={m.label}
                      onClick={() => setSelectedMood(m.label)}
                      className={`px-2.5 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        selectedMood === m.label
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : `bg-white text-slate-800 border-slate-200 ${m.color}`
                      }`}
                    >
                      <span>{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>

                {/* Bot recommendation playlist cards */}
                <div className="space-y-2 pt-1">
                  <div className="text-xs font-bold text-purple-950 bg-purple-100 px-2.5 py-1 rounded-md">
                    Gợi ý cho &quot;{selectedMood}&quot;:
                  </div>

                  {moodTracks.length > 0 ? (
                    moodTracks.slice(0, 2).map((track) => (
                      <SharedTrackCard
                        key={track.id}
                        track={track}
                        compact
                      />
                    ))
                  ) : (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-500 text-center">
                      Chưa có bài hát phù hợp trong thư viện nhạc được quản trị công bố cho tâm trạng này.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Input message box */}
            <div className="mt-4 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && chatInput.trim()) {
                    onSelectTab('mood-bot');
                  }
                }}
                placeholder="Nhập tin nhắn của bạn..."
                className="flex-1 px-3 py-2 bg-slate-100 text-slate-800 placeholder-slate-500 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:bg-white focus:border-purple-400"
              />
              <button
                onClick={() => onSelectTab('mood-bot')}
                className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors shrink-0"
                title="Gửi tin nhắn tới Mood Bot"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 03: Trò chơi & Sáng tạo âm thanh */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full bg-white rounded-2xl p-5 border-2 border-pink-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 hover:shadow-xl hover:border-pink-500 transition-all flex flex-col justify-between group relative z-10">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-pink-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    03
                  </span>
                  <h3 
                    onClick={() => onSelectTab('game')}
                    className="font-black text-base sm:text-lg text-slate-950 group-hover:text-pink-600 cursor-pointer transition-colors tracking-tight"
                  >
                    Trò chơi & Sáng tạo
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('game')}
                  className="text-slate-600 group-hover:text-pink-600 p-1.5 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở Trò chơi"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Đánh đàn theo bài hát, rèn luyện sự tập trung đa cấp độ có âm thanh vỗ tay khích lệ, và thử thách kiến thức cẩm nang!
              </p>

              {/* Enhanced Game Interactive Overview Widget */}
              <div className="bg-linear-to-br from-pink-50/70 via-purple-50/50 to-sky-50/70 rounded-xl p-3 space-y-2.5 border border-pink-200">
                <div className="flex items-center justify-between text-xs pb-1 border-b border-pink-200/80">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                    <span>4 Chế độ rèn luyện & giải trí:</span>
                  </div>
                  <span className="text-[10px] bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded-full">
                    Mới nâng cấp ✨
                  </span>
                </div>

                {/* 4 Feature Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => onSelectTab('game')}
                    className="p-2.5 bg-white rounded-xl border border-pink-200 hover:border-pink-400 hover:shadow-2xs text-left transition-all group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover/item:text-pink-600">
                      <span>🎹</span>
                      <span className="break-words font-extrabold">Bàn phím đánh đàn</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">Tập theo nốt nhạc & xuất tệp WAV</div>
                  </button>

                  <button
                    onClick={() => onSelectTab('game')}
                    className="p-2.5 bg-white rounded-xl border border-emerald-200 hover:border-emerald-400 hover:shadow-2xs text-left transition-all group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover/item:text-emerald-700">
                      <span>⚡</span>
                      <span className="break-words font-extrabold">Luyện tập trung</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">Bảng Schulte 4 Levels + Vỗ tay</div>
                  </button>

                  <button
                    onClick={() => onSelectTab('game')}
                    className="p-2.5 bg-white rounded-xl border border-purple-200 hover:border-purple-400 hover:shadow-2xs text-left transition-all group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover/item:text-purple-700">
                      <span>🏆</span>
                      <span className="break-words font-extrabold">Quiz 12 câu</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">Kiểm tra cẩm nang & giải thích APA</div>
                  </button>

                  <button
                    onClick={() => onSelectTab('game')}
                    className="p-2.5 bg-white rounded-xl border border-blue-200 hover:border-blue-400 hover:shadow-2xs text-left transition-all group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 group-hover/item:text-blue-700">
                      <span>🎧</span>
                      <span className="break-words font-extrabold">Luyện cảm âm</span>
                    </div>
                    <div className="text-[11px] text-slate-600 mt-0.5 leading-snug">Đoán nốt nhạc rèn phản xạ thính giác</div>
                  </button>
                </div>

                {/* Mini Piano Keypad Strip Preview */}
                <div className="pt-1.5 border-t border-pink-200/80">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1.5">
                    <span>Thử bấm phím đàn trực tiếp:</span>
                    <span className="text-slate-500 font-normal">A, S, D, F, J, K, L</span>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {[
                      { name: 'Đô', midi: 60, color: 'bg-blue-100 hover:bg-blue-200 text-blue-900' },
                      { name: 'Rê', midi: 62, color: 'bg-sky-100 hover:bg-sky-200 text-sky-900' },
                      { name: 'Mi', midi: 64, color: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900' },
                      { name: 'Fa', midi: 65, color: 'bg-amber-100 hover:bg-amber-200 text-amber-900' },
                      { name: 'Sol', midi: 67, color: 'bg-orange-100 hover:bg-orange-200 text-orange-900' },
                      { name: 'La', midi: 69, color: 'bg-purple-100 hover:bg-purple-200 text-purple-900' },
                      { name: 'Si', midi: 71, color: 'bg-pink-100 hover:bg-pink-200 text-pink-900' },
                    ].map((key) => (
                      <button
                        key={key.midi}
                        onClick={() => {
                          audioSynth.playKeyboardNote(key.midi, 0.3, 0.3);
                          onPlaySound(`Nốt ${key.name}`);
                        }}
                        className={`h-10 sm:h-9 rounded-lg font-extrabold text-xs flex flex-col items-center justify-center border border-slate-300 shadow-2xs transition-transform active:scale-90 cursor-pointer ${key.color}`}
                      >
                        <span>{key.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Chơi ngay CTA Button */}
            <div className="mt-4">
              <button
                onClick={() => onSelectTab('game')}
                className="w-full py-2.5 bg-linear-to-r from-pink-500 via-purple-600 to-indigo-600 hover:from-pink-600 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                id="btn-play-game-card"
              >
                <span>🎮 Vào khu vực Trò chơi & Thử thách ngay</span>
              </button>
              <p className="text-xs text-slate-600 italic text-center mt-1.5 font-medium">
                “Âm nhạc nuôi dưỡng cảm xúc, rèn luyện sự tập trung!”
              </p>
            </div>
          </div>
        </div>

        {/* Row 2: 2 Habit & Communication Longitudinal Modules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* ------------------------------------------------------------- */}
          {/* CARD 04: Nhật ký 21 ngày */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border-2 border-emerald-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 hover:shadow-xl hover:border-emerald-500 transition-all flex flex-col justify-between group relative z-10">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    04
                  </span>
                  <h3 
                    onClick={() => onSelectTab('journal')}
                    className="font-black text-base sm:text-lg text-slate-950 group-hover:text-emerald-600 cursor-pointer transition-colors tracking-tight"
                  >
                    Nhật ký 21 ngày
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('journal')}
                  className="text-slate-600 group-hover:text-emerald-600 p-1.5 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở Nhật ký"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Theo dõi hành trình, tạo thói quen và trở thành phiên bản tốt hơn mỗi ngày!
              </p>

              {/* Progress & Stat Widget */}
              <div className="bg-emerald-50/70 rounded-xl p-3.5 border border-emerald-200 space-y-3">
                
                <div className="flex items-center justify-between">
                  {/* Circle X/21 */}
                  {(() => {
                    const completedCount = journalDays.filter(d => d.status === 'completed').length;
                    return (
                      <div className="relative w-14 h-14 rounded-full border-4 border-emerald-500 flex flex-col items-center justify-center bg-white shadow-2xs shrink-0">
                        <span className="text-sm font-black text-emerald-950">{completedCount}/21</span>
                        <span className="text-[9px] text-emerald-800 font-bold uppercase">ngày</span>
                      </div>
                    );
                  })()}

                  <div className="text-right pl-2">
                    <div className="text-xs font-semibold text-emerald-950 italic leading-snug">
                      “Kiên trì hôm nay sẽ tạo nên tương lai tuyệt vời hơn!” ♡
                    </div>
                    <div className="text-xs font-bold text-emerald-900 mt-1">
                      Bạn đang làm rất tốt! 🎉
                    </div>
                  </div>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-white p-1.5 rounded-lg border border-emerald-200">
                    <div className="text-[10px] text-slate-700 font-medium">Tập trung</div>
                    <div className="text-xs sm:text-sm font-black text-emerald-800">+42%</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-pink-200">
                    <div className="text-[10px] text-slate-700 font-medium">Căng thẳng</div>
                    <div className="text-xs sm:text-sm font-black text-pink-700">-28%</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-lg border border-blue-200">
                    <div className="text-[10px] text-slate-700 font-medium">Đã ghi</div>
                    <div className="text-xs sm:text-sm font-black text-blue-800">
                      {journalDays.filter(d => d.status === 'completed').length} buổi
                    </div>
                  </div>
                </div>

                {/* 21 Days Mini Calendar Grid */}
                <div className="pt-1.5 border-t border-emerald-200">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1.5">
                    <span>Lịch trình 21 ngày:</span>
                    <button 
                      onClick={() => onSelectTab('journal')}
                      className="text-emerald-800 hover:text-emerald-950 hover:underline text-xs font-semibold"
                    >
                      Xem chi tiết →
                    </button>
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {journalDays.map((d) => (
                      <button
                        key={d.day}
                        onClick={() => onSelectTab('journal')}
                        className={`h-7 sm:h-6 rounded-md text-xs font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
                          d.status === 'completed'
                            ? 'bg-emerald-500 text-white shadow-2xs'
                            : d.status === 'current'
                            ? 'bg-blue-600 text-white ring-2 ring-blue-400 animate-pulse'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                        title={`Ngày ${d.day}: ${d.status === 'completed' ? 'Đã hoàn thành' : d.status === 'current' ? 'Hôm nay' : 'Sắp tới'}`}
                      >
                        {d.status === 'completed' ? '✓' : d.day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Motivation sticker */}
            <div 
              onClick={() => onSelectTab('journal')}
              className="mt-4 bg-white border border-emerald-200 p-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-50 transition-colors"
            >
              <span className="text-base">🌱</span>
              <span className="text-xs font-bold text-emerald-950">
                Những thay đổi nhỏ làm nên kết quả lớn!
              </span>
            </div>
          </div>

          {/* ------------------------------------------------------------- */}
          {/* CARD 05: Hộp thư lắng nghe */}
          {/* ------------------------------------------------------------- */}
          <div className="w-full bg-white rounded-2xl p-5 sm:p-6 border-2 border-amber-300 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06)] ring-1 ring-slate-900/5 hover:shadow-xl hover:border-amber-500 transition-all flex flex-col justify-between group relative z-10">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    05
                  </span>
                  <h3 
                    onClick={() => onSelectTab('mailbox')}
                    className="font-black text-base sm:text-lg text-slate-950 group-hover:text-amber-600 cursor-pointer transition-colors tracking-tight"
                  >
                    Hộp thư lắng nghe
                  </h3>
                </div>
                <button
                  onClick={() => onSelectTab('mailbox')}
                  className="text-slate-600 group-hover:text-amber-600 p-1.5 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                  title="Mở Hộp thư"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed font-medium">
                Chia sẻ thắc mắc, phản hồi, tâm tư về âm nhạc và việc học. Nhóm nghiên cứu sẽ trực tiếp trả lời thắc mắc của bạn.
              </p>

              {/* Envelope banner graphic */}
              <div className="bg-linear-to-r from-pink-50 to-amber-50 border border-pink-200 rounded-xl p-3 flex items-center gap-2.5">
                <div className="text-2xl">💌</div>
                <div className="text-xs text-pink-950 font-bold leading-tight">
                  Bạn có thắc mắc? Chúng mình luôn ở đây để lắng nghe! ♡
                </div>
              </div>

              {/* Mail Form */}
              <form onSubmit={handleSendMail} className="space-y-2.5 text-left">
                {sentMailNotice && (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-semibold rounded-lg">
                    ✓ Đã ghi nhận thư! Thư đã được chuyển vào hàng đợi nhóm nghiên cứu (lưu bộ nhớ thử nghiệm).
                  </div>
                )}

                {mailError && (
                  <div className="text-xs text-rose-700 font-semibold">
                    {mailError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tiêu đề <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={mailTitle}
                    onChange={(e) => setMailTitle(e.target.value)}
                    placeholder="Ví dụ: Thắc mắc về nhạc học, gợi ý giao diện..."
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 placeholder-slate-500 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:bg-white focus:border-amber-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-800">
                      Nội dung <span className="text-red-600">*</span>
                    </label>
                    <span className="text-xs text-slate-500 font-medium">{mailContent.length}/500</span>
                  </div>
                  <textarea
                    rows={2}
                    value={mailContent}
                    onChange={(e) => setMailContent(e.target.value.slice(0, 500))}
                    placeholder="Hãy chia sẻ với chúng mình... Bạn có thể hỏi bất cứ điều gì về âm nhạc, học tập, hoặc góp ý cho dự án!"
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 placeholder-slate-500 text-xs sm:text-sm rounded-lg border border-slate-300 focus:outline-none focus:bg-white focus:border-amber-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-all"
                  id="btn-submit-mail-card"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Gửi thư</span>
                </button>
              </form>
            </div>

            {/* 3 Trust Badges */}
            <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-2 text-left sm:text-center text-xs text-slate-700 font-medium">
              <div className="p-2 rounded-xl bg-slate-50 flex sm:flex-col items-center gap-2 sm:gap-1 border border-slate-100">
                <UserCheck className="w-4 h-4 text-pink-600 sm:mx-auto shrink-0" />
                <span className="leading-snug block text-xs font-semibold text-slate-800 break-words">Nhóm nghiên cứu trả lời trực tiếp</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 flex sm:flex-col items-center gap-2 sm:gap-1 border border-slate-100">
                <Lock className="w-4 h-4 text-blue-600 sm:mx-auto shrink-0" />
                <span className="leading-snug block text-xs font-semibold text-slate-800 break-words">Bảo mật thông tin của bạn</span>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 flex sm:flex-col items-center gap-2 sm:gap-1 border border-slate-100">
                <Heart className="w-4 h-4 text-rose-500 sm:mx-auto shrink-0" />
                <span className="leading-snug block text-xs font-semibold text-slate-800 break-words">Mọi ý kiến đều được trân trọng</span>
              </div>
            </div>
          </div>

        </div>
        </div>
      </section>

      {/* Notice regarding prototype / demo state per user instructions */}
      <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-blue-900">
        <div className="flex items-center gap-2 text-left">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0" />
          <div>
            <span className="font-bold">Ghi chú minh bạch về kỹ thuật: </span>
            <span className="text-blue-800">
              Ứng dụng đang hiển thị các số liệu minh họa và lưu dữ liệu tạm thời trên trình duyệt (Local State). Không giả vờ đã gửi thư hoặc đã kết nối dịch vụ Cloud. Đã sẵn sàng chuẩn bị tích hợp Firebase Auth & Cloud Firestore ở giai đoạn tiếp theo.
            </span>
          </div>
        </div>
        <button
          onClick={() => onSelectTab('admin')}
          className="shrink-0 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-2xs transition-colors"
        >
          Xem khu vực Quản trị →
        </button>
      </div>

    </div>
  );
};
