import React, { useState } from 'react';
import { SOUND_ENVIRONMENTS } from '../data/initialData';
import { SEED_ARTICLES, SEED_REFERENCES, SeedArticle, SeedReference } from '../data/seedContent';
import { ScientificMusicPlayerDeck } from '../components/ScientificMusicPlayerDeck';
import { SoundEnvironment } from '../types';
import { 
  VolumeX, 
  Headphones, 
  Flame, 
  BookOpen, 
  Lightbulb, 
  ArrowLeft, 
  ExternalLink,
  Search,
  FileText,
  FileCheck,
  BookmarkCheck,
  Clock,
  Sparkles,
  Info,
  Layers,
  Radio,
  Music,
  Youtube,
  Disc3,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { audioSynth } from '../utils/audioSynth';

interface MusicInfoViewProps {
  onBackToHome: () => void;
  onPlaySound: (name: string) => void;
}

export const MusicInfoView: React.FC<MusicInfoViewProps> = ({ 
  onBackToHome,
  onPlaySound 
}) => {
  const [selectedEnv, setSelectedEnv] = useState<SoundEnvironment>(SOUND_ENVIRONMENTS[1]);
  const [selectedArticle, setSelectedArticle] = useState<SeedArticle | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showReferences, setShowReferences] = useState<boolean>(false);
  const [targetSubject, setTargetSubject] = useState<string>('toan');

  const subjectRecommendations: Record<string, { envName: string; bpm: string; reason: string }> = {
    toan: {
      envName: 'Im lặng hoàn toàn hoặc Lo-fi không lời / Sóng Alpha 10 Hz',
      bpm: '0 – 70 BPM',
      reason: 'Toán học yêu cầu bộ nhớ làm việc (Working Memory) và chuỗi suy luận logic cao. Bất kỳ âm thanh có lời hoặc tiết tấu bất thường đều làm tăng tải nhận thức phụ.'
    },
    van: {
      envName: 'Im lặng sâu hoặc Lo-fi không lời 432 Hz êm dịu',
      bpm: '0 – 72 BPM',
      reason: 'Đọc hiểu tác phẩm văn học và viết bài nghị luận kích hoạt trực tiếp trung tâm ngôn ngữ (Broca & Wernicke). Tuyệt đối tránh nhạc có lời để não không bị phân tán nguồn lực xử lý câu từ.'
    },
    anh: {
      envName: 'Im lặng khi học từ vựng/nghe; Lo-fi nhẹ khi làm bài tập đọc',
      bpm: '70 – 80 BPM',
      reason: 'Khi luyện nghe (Listening) hoặc học thuộc từ vựng, môi trường cần sự trong trẻo tuyệt đối. Với bài tập đọc hiểu nhanh, Lo-fi không lời giúp bạn giữ sự ổn định.'
    },
    lyhoa: {
      envName: 'Lo-fi không lời 528 Hz hoặc Tiếng mưa rơi (Pink Noise)',
      bpm: '70 – 80 BPM',
      reason: 'Luyện đề trắc nghiệm khối Tự nhiên đòi hỏi tốc độ bấm máy tính và phản xạ câu hỏi nhanh. Nhịp điệu 70-80 BPM hỗ trợ duy trì trạng thái dòng chảy không gián đoạn.'
    },
    chep: {
      envName: 'Nhạc Pop nhẹ hoặc Acoustic vui tươi (100 - 120 BPM)',
      bpm: '100 – 120 BPM',
      reason: 'Chép bài hoặc vẽ sơ đồ tư duy là công việc ít đòi hỏi tư duy trừu tượng sâu. Nhạc có tiết tấu tươi vui giúp giải phóng Dopamine, xua tan cảm giác mệt mỏi.'
    }
  };

  const filteredArticles = SEED_ARTICLES.filter(art => 
    art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
    art.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white shadow-2xs">
                Chuyên gia âm nhạc
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Thông tin & Thư viện âm nhạc khoa học
              </h1>
            </div>
            <p className="text-sm text-slate-800 mt-1 font-medium">
              Kiến thức âm học nhận thức chuẩn hóa · Tuyển tập Lo-fi chill không lời & Pop có lời tích hợp Suno AI, YouTube và Zing MP3
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://suno.com/@studymusiccommunity"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Kênh Suno AI</span>
          </a>
          <button
            onClick={() => setShowReferences(!showReferences)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer shadow-2xs"
          >
            <BookmarkCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>19 Nguồn tham khảo ({showReferences ? 'Đóng' : 'Xem'})</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. THƯ VIỆN NHẠC KHOA HỌC & TRÌNH PHÁT ĐA NGUỒN TỰ CHỦ CHO HỌC SINH */}
      {/* ========================================================================= */}
      <ScientificMusicPlayerDeck onPlaySoundTitle={onPlaySound} />

      {/* ========================================================================= */}
      {/* 2. CHUYÊN ĐỀ ÂM HỌC NHẬN THỨC (SCIENTIFIC SOUND FREQUENCIES LAB) */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Phòng thí nghiệm âm học nhận thức
              </span>
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Web Audio Synthesizer
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Bảng Tần Số Khoa Học & Sóng Não (432Hz, 528Hz, Alpha, Gamma, Pink Noise)
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl font-normal">
              Thực nghiệm tương tác: Bấm trực tiếp vào các nút để nghe âm sắc thuần khiết được bộ tổng hợp Web Audio phát sinh theo thời gian thực.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 432 Hz */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 hover:border-cyan-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2 py-0.5 rounded-lg">
                  Tần số Tự nhiên
                </span>
                <span className="text-xs font-mono text-cyan-400 font-bold">432 Hz Tone</span>
              </div>
              <h4 className="text-base font-extrabold text-white">432 Hz – Thư Thái & Xoa Dịu</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Đồng điệu với nhịp sinh học tự nhiên, giảm kích ứng vỏ não, xoa dịu lo âu trước giờ thi, tối ưu cho môn Văn, Sử, Địa.
              </p>
            </div>
            <button
              onClick={() => {
                audioSynth.playFrequencyTone(432, 4);
                onPlaySound('Tần số 432 Hz – Thư thái tự nhiên');
              }}
              className="mt-4 w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🔊 Phát âm thanh 432 Hz</span>
            </button>
          </div>

          {/* Card 528 Hz */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 hover:border-amber-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 bg-amber-950/80 border border-amber-800 px-2 py-0.5 rounded-lg">
                  Solfeggio Miracle
                </span>
                <span className="text-xs font-mono text-amber-400 font-bold">528 Hz Tone</span>
              </div>
              <h4 className="text-base font-extrabold text-white">528 Hz – Chữa Lành & Giảm Cortisol</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Hạ mức hormone stress Cortisol trong máu, tái tạo năng lượng tinh thần, giúp kiên nhẫn khi gặp bài toán hình học hoặc vật lý khó.
              </p>
            </div>
            <button
              onClick={() => {
                audioSynth.playFrequencyTone(528, 4);
                onPlaySound('Tần số 528 Hz – Chữa lành & Tái tạo');
              }}
              className="mt-4 w-full py-2 px-3 bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🔊 Phát âm thanh 528 Hz</span>
            </button>
          </div>

          {/* Card Alpha 10 Hz */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-800 px-2 py-0.5 rounded-lg">
                  Sóng não Alpha
                </span>
                <span className="text-xs font-mono text-indigo-400 font-bold">10 Hz Binaural</span>
              </div>
              <h4 className="text-base font-extrabold text-white">Alpha (8-12 Hz) – Flow State</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Đưa não bộ vào trạng thái "dòng chảy" (Flow State), kích thích khả năng tiếp thu và ghi nhớ mà không cảm thấy áp lực thời gian.
              </p>
            </div>
            <button
              onClick={() => {
                audioSynth.playSunoTrack('freq-alpha');
                onPlaySound('Sóng não Alpha 10 Hz – Trạng thái Dòng chảy');
              }}
              className="mt-4 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🧠 Phát Sóng Alpha 10 Hz</span>
            </button>
          </div>

          {/* Card Pink Noise */}
          <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-lg">
                  Phổ âm thanh 1/f
                </span>
                <span className="text-xs font-mono text-emerald-400 font-bold">Pink Noise</span>
              </div>
              <h4 className="text-base font-extrabold text-white">Pink Noise – Tiếng Mưa Khử Ồn</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Tạo một bức tường âm thanh che chắn tiếng ồn bất chợt (còi xe, tiếng nói chuyện) khi học bài tại quán cà phê hay phòng trọ.
              </p>
            </div>
            <button
              onClick={() => {
                audioSynth.stopAll();
                audioSynth.toggleAmbient('info-rain', 'rain');
                onPlaySound('Tiếng mưa Pink Noise khử tạp âm');
              }}
              className="mt-4 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>🌧️ Bật tiếng mưa khử ồn</span>
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BẢNG NGUYÊN TẮC KHOA HỌC CHUYÊN SÂU DÀNH CHO HỌC SINH */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Card 1: Cơ chế can thiệp lời bài hát */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm uppercase tracking-wide">
            <Activity className="w-5 h-5" />
            <span>Khoa học thần kinh: Cơ chế can thiệp lời ca</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Tại sao nhạc có lời gây hại cho việc giải đề và đọc hiểu?
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            Trung tâm ngôn ngữ của con người gồm <strong>vùng Broca</strong> (phát sinh câu chữ) và <strong>vùng Wernicke</strong> (tiếp nhận và giải nghĩa từ ngữ). Khi bạn đọc một bài thơ, học từ vựng hay giải bài toán đố, hai vùng não này đang hoạt động với công suất tối đa.
          </p>
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-medium">
            ⚠️ <strong>Kết luận khoa học:</strong> Nghe nhạc có lời quen thuộc khiến não bộ vô thức xử lý ca từ và ý nghĩa bài hát, cạnh tranh trực tiếp tài nguyên của bộ nhớ làm việc (Working Memory), làm giảm đến 30% tốc độ ghi nhớ sâu!
          </div>
        </div>

        {/* Card 2: Nhịp tim & Nhịp BPM tối ưu */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-blue-600 font-extrabold text-sm uppercase tracking-wide">
            <Sliders className="w-5 h-5" />
            <span>Âm học sinh học: Dải BPM và Nhịp tim</span>
          </div>
          <h3 className="text-lg font-black text-slate-900">
            Mối tương quan giữa Tempo (BPM) và nhịp tim học sinh
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
            Nhịp tim lúc nghỉ ngơi trung bình của học sinh THPT dao động từ <strong>65 – 75 nhịp/phút</strong>. Khi nghe nhạc có nhịp độ (Tempo) đồng bộ trong khoảng này, hiện tượng cộng hưởng sinh học (Entrainment) xảy ra giúp ổn định huyết áp và nhịp thở.
          </p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
            💡 <strong>Khuyến nghị chuyên gia:</strong> Dùng dải <strong>60 – 75 BPM</strong> cho các phiên học kéo dài trên 45 phút; và dải <strong>100 – 128 BPM</strong> cho 5-10 phút giải lao giữa giờ để tăng cường lưu thông máu!
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 4. 3 LỰA CHỌN ÂM THANH CỐT LÕI (CẨM NANG HỌC TẬP) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
          <h2 className="text-lg sm:text-xl font-black text-slate-950 flex items-center gap-2 tracking-tight">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>3 Lựa chọn âm thanh cốt lõi trong cẩm nang</span>
          </h2>
          <span className="text-xs text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg font-bold border border-slate-200">
            S2, tr. 4
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SOUND_ENVIRONMENTS.map((env) => {
            const isSelected = selectedEnv.id === env.id;
            return (
              <div
                key={env.id}
                onClick={() => setSelectedEnv(env)}
                className={`rounded-2xl p-5 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-600 bg-blue-50/70 shadow-md ring-2 ring-blue-500/20' 
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${
                      env.id === 'silence' 
                        ? 'bg-slate-100 text-slate-700' 
                        : env.id === 'lofi-ambient' 
                          ? 'bg-indigo-100 text-indigo-700' 
                          : 'bg-rose-100 text-rose-700'
                    }`}>
                      {env.id === 'silence' && <VolumeX className="w-5 h-5" />}
                      {env.id === 'lofi-ambient' && <Headphones className="w-5 h-5" />}
                      {env.id === 'pop-upbeat' && <Flame className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-mono font-bold bg-white/90 border border-slate-200 text-slate-800 px-2 py-0.5 rounded">
                      {env.bpmRange}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900">{env.name}</h3>
                    <p className="text-xs font-semibold text-blue-800 mt-0.5">{env.tag}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {env.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs font-bold text-blue-700">
                  <span>{isSelected ? 'Đang chọn xem chi tiết' : 'Xem chi tiết'}</span>
                  <span>{isSelected ? '●' : '→'}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Environment Deep-Dive */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
              Chi tiết cơ chế: {selectedEnv.name} ({selectedEnv.bpmRange})
            </h3>
          </div>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {selectedEnv.fullDetail}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Lợi ích ghi nhận trong cẩm nang:
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedEnv.benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Nhiệm vụ học tập phù hợp để thử:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedEnv.suitableSubjects.map((sub, i) => (
                  <span key={i} className="bg-white border border-slate-200 text-slate-800 text-xs px-2.5 py-1 rounded-lg font-medium">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. GỢI Ý NHANH THEO TỪNG MÔN HỌC */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/60 rounded-3xl p-5 sm:p-6 border border-blue-200/80 space-y-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-blue-600" />
            <span>Gợi ý âm thanh nhanh theo từng môn học</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 mt-1">
            Chọn môn học bạn chuẩn bị ôn tập để nhận gợi ý môi trường âm học phù hợp nhất:
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'toan', label: 'Toán học & Logic' },
            { key: 'van', label: 'Ngữ văn & Đọc hiểu' },
            { key: 'anh', label: 'Tiếng Anh & Ngôn ngữ' },
            { key: 'lyhoa', label: 'Vật lý, Hóa học, Sinh học' },
            { key: 'chep', label: 'Ghi chép & Sắp xếp bài' }
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setTargetSubject(item.key)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                targetSubject === item.key
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-300 hover:border-blue-400'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-300 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
              Đề xuất thử nghiệm:
            </span>
            <span className="text-xs font-bold bg-blue-100 text-blue-900 px-2.5 py-1 rounded">
              {subjectRecommendations[targetSubject].bpm}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            {subjectRecommendations[targetSubject].envName}
          </h3>

          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {subjectRecommendations[targetSubject].reason}
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. 13 BÀI VIẾT KHOA HỌC SỐ HÓA */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              <span>13 Bài viết khoa học về âm thanh học tập</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Hướng dẫn khoa học về cách chọn lọc và cá nhân hóa nhạc nền giúp tập trung, giảm căng thẳng
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm bài viết, công thức 3B..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-indigo-400 shadow-2xs hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span className="font-bold text-indigo-800 bg-indigo-50 px-2.5 py-0.5 rounded">
                    {art.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {art.id}
                  </span>
                </div>

                <h3 className="font-extrabold text-base text-slate-900 line-clamp-2">
                  {art.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {art.body}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-indigo-600 font-bold">Đọc toàn văn bài viết →</span>
                <span className="text-slate-500 text-2xs truncate max-w-[140px]">{art.sources}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. 19 NGUỒN THAM KHẢO QUỐC TẾ */}
      {/* ========================================================================= */}
      {showReferences && (
        <div className="bg-slate-50 border border-slate-300 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BookmarkCheck className="w-5 h-5 text-indigo-600" />
                <span>19 Tài liệu tham khảo khoa học quốc tế</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Danh mục nghiên cứu quốc tế uy tín về tâm lý học âm nhạc, tải nhận thức và thần kinh học.
              </p>
            </div>
            <button
              onClick={() => setShowReferences(false)}
              className="text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 bg-white border border-slate-200 rounded-lg cursor-pointer"
            >
              Đóng danh mục
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {SEED_REFERENCES.map((ref) => (
              <div key={ref.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    {ref.id}
                  </span>
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Mở DOI / Nguồn</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-2xs text-slate-500 italic">Chưa có liên kết số hóa</span>
                  )}
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">{ref.authors}</h4>
                <p className="text-xs text-slate-700 italic">{ref.title}</p>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-2xs text-slate-600">
                  <strong className="text-slate-800">Trạng thái kiểm chứng: </strong>
                  {ref.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-300 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide bg-indigo-50 px-2.5 py-1 rounded-lg">
                {selectedArticle.category} • Số hóa cẩm nang
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-slate-600 hover:text-slate-900 p-2 rounded-full hover:bg-slate-100 text-lg font-bold cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Đóng bài viết"
              >
                ✕
              </button>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
              {selectedArticle.title}
            </h2>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Nhãn giới hạn bằng chứng: </strong>
                {selectedArticle.evidenceLabel}
              </div>
            </div>

            <div className="space-y-3.5 text-sm sm:text-base text-slate-800 leading-relaxed border-t border-slate-100 pt-3.5 whitespace-pre-line font-normal">
              {selectedArticle.body}
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <strong>Nguồn gốc tài liệu: </strong>
              <span>{selectedArticle.sources}</span>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedArticle(null)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer min-h-[44px]"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
