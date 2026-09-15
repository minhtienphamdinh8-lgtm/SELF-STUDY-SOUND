import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChatMessage, ManagedMusicTrack, MusicTrackCategory } from '../types';
import { useMusic } from '../context/MusicContext';
import { SharedTrackCard } from '../components/SharedTrackCard';
import { recommend, TASKS, STATES } from '../utils/domain';
import { 
  ArrowLeft, 
  Send, 
  Bot, 
  Sparkles, 
  RotateCcw, 
  Disc3, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface MoodBotViewProps {
  onBackToHome: () => void;
  onPlaySound: (name: string) => void;
}

export const MoodBotView: React.FC<MoodBotViewProps> = ({
  onBackToHome,
  onPlaySound
}) => {
  const { publishedTracks, isRealtimeSyncing } = useMusic();

  // Filter for tracks gallery
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'all' | MusicTrackCategory>('all');
  const [activeSourceFilter, setActiveSourceFilter] = useState<'all' | 'project_file' | 'web_source'>('all');

  // 3B Quick Interactive Formula
  const [selectedTask, setSelectedTask] = useState<string>('reading');
  const [selectedState, setSelectedState] = useState<string>('calm');
  const [lyricsDistract, setLyricsDistract] = useState<boolean>(false);

  // Chatbot State
  const initialGreeting = 
    'Dạ, em chào bạn ạ! 🌸 Em là Mood Bot – trợ lý tư vấn âm nhạc học đường của Self Study Sound. Tất cả bài hát em gợi ý đều được lấy trực tiếp từ Thư viện âm nhạc dùng chung do quản trị viên nhà trường phê duyệt và công bố.\n\nBạn đang muốn tìm nhạc Lofi chill không lời (432Hz/528Hz/Alpha) để tập trung giải đề, hay một bản nhạc Pop cảm xúc có lời để nạp năng lượng và thư giãn ạ? Hãy chia sẻ tâm trạng hoặc môn học của bạn nhé!';

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Initialize first greeting with initial published tracks when available
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'msg-init',
          sender: 'bot',
          text: initialGreeting,
          timestamp: 'Vừa xong',
          managedTracks: publishedTracks.slice(0, 3)
        }
      ]);
    }
  }, [publishedTracks, messages.length]);

  // Scroll to bottom of chat when new message arrives
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Quick Chat Prompts
  const quickSuggestions = [
    { label: '🌸 Dạ em đang căng thẳng, cần nhạc Lofi dịu êm', query: 'Dạ em đang căng thẳng áp lực thi cử, cần nhạc Lofi không lời nhẹ nhàng ạ' },
    { label: '☀️ Dạ em buồn ngủ quá, muốn nghe Pop bốc tiếp năng lượng', query: 'Dạ em đang rất buồn ngủ, muốn nghe nhạc Pop bốc sôi động tiếp thêm năng lượng ạ' },
    { label: '📚 Dạ em sắp giải đề Toán khó, cần nhạc tập trung cao độ', query: 'Dạ em chuẩn bị giải bài tập Toán và Lý khó, cần nhạc tập trung cao độ chuẩn tần số ạ' },
    { label: '💖 Dạ gợi ý cho em bài chữa lành tâm trạng sau giờ học', query: 'Dạ gợi ý cho em bài nhạc chữa lành cảm xúc sau một ngày học tập mệt mỏi ạ' },
    { label: '✨ Dạ cho em xin link YouTube & Zing MP3 trực tiếp', query: 'Dạ cho em xin các bài hát có nguồn YouTube hoặc Zing MP3 trong thư viện ạ' },
    { label: '🥰 Cảm ơn Mood Bot nhiều nhé!', query: 'Dạ em cảm ơn Mood Bot nhiều nhé, list nhạc rất phù hợp và tâm trạng em đã ổn hơn rồi ạ!' }
  ];

  // Filter matched tracks STRICTLY from the admin-published library
  const findTracksForQuery = (query: string): { reply: string; tracks: ManagedMusicTrack[] } => {
    const lower = query.toLowerCase();

    if (lower.includes('cảm ơn') || lower.includes('ổn rồi') || lower.includes('thích quá') || lower.includes('tuyệt vời')) {
      return {
        reply: 'Dạ em rất vui và hạnh phúc khi đã giúp bạn tìm được bản nhạc ưng ý trong thư viện dùng chung ạ! 🌸 Chúc bạn có một phiên học thật thư thái, tập trung và đạt kết quả thật tốt nhé. Dạ bạn có cần em hỗ trợ thêm điều gì nữa không ạ?',
        tracks: []
      };
    }

    if (lower.includes('căng thẳng') || lower.includes('áp lực') || lower.includes('stress') || lower.includes('lo âu') || lower.includes('sợ')) {
      const matched = publishedTracks.filter(t => 
        t.category === 'lofi' || 
        (t.notes || '').toLowerCase().includes('căng thẳng') || 
        (t.notes || '').toLowerCase().includes('stress') || 
        (t.notes || '').toLowerCase().includes('432') ||
        (t.notes || '').toLowerCase().includes('mưa')
      );

      if (matched.length > 0) {
        return {
          reply: 'Dạ, khi bạn đang cảm thấy căng thẳng và áp lực thi cử, khoa học nhận thức khuyên bạn nên chọn nhạc Lofi Chill không lời (nhịp 60–75 BPM) hoặc tần số 432 Hz để kích hoạt hệ thần kinh phó giao cảm và ổn định nhịp tim. Em xin đề xuất các bản nhạc được quản trị viên công bố phù hợp dưới đây ạ:',
          tracks: matched
        };
      } else {
        return {
          reply: 'Dạ, hiện tại trong thư viện nhạc được quản trị công bố chưa có bài hát nào thuộc thể loại Lofi giảm căng thẳng phù hợp với yêu cầu này của bạn ạ. Quản trị viên sẽ sớm bổ sung thêm vào thư viện dùng chung của trường!',
          tracks: []
        };
      }
    }

    if (lower.includes('buồn ngủ') || lower.includes('mệt') || lower.includes('uể oải') || lower.includes('năng lượng') || lower.includes('bốc')) {
      const matched = publishedTracks.filter(t => 
        t.category === 'pop' || 
        (t.bpm && t.bpm >= 100) || 
        (t.notes || '').toLowerCase().includes('năng lượng') ||
        (t.notes || '').toLowerCase().includes('buồn ngủ')
      );

      if (matched.length > 0) {
        return {
          reply: 'Dạ, nếu bạn đang cảm thấy buồn ngủ hoặc uể oải, hãy đứng dậy uống một ngụm nước mát nhé! Những bản nhạc Pop có lời với tiết tấu 100–124 BPM sẽ kích thích tiết Dopamine, tăng lưu thông máu lên não bộ giúp xua tan cơn buồn ngủ. Em xin gửi bạn các bản nhạc tràn đầy năng lượng từ thư viện nhà trường:',
          tracks: matched
        };
      } else {
        return {
          reply: 'Dạ, hiện tại trong thư viện nhạc được quản trị công bố chưa có bài hát nào thuộc thể loại Pop năng lượng cao phù hợp với yêu cầu này của bạn ạ. Quản trị viên sẽ sớm bổ sung thêm vào thư viện dùng chung!',
          tracks: []
        };
      }
    }

    if (lower.includes('chữa lành') || lower.includes('buồn') || lower.includes('thất vọng') || lower.includes('tâm trạng') || lower.includes('mệt mỏi')) {
      const matched = publishedTracks.filter(t => 
        (t.notes || '').toLowerCase().includes('chữa lành') || 
        (t.notes || '').toLowerCase().includes('xoa dịu') || 
        (t.notes || '').toLowerCase().includes('nắng') ||
        (t.title || '').toLowerCase().includes('chữa lành') ||
        t.category === 'pop' || 
        t.category === 'lofi'
      );

      if (matched.length > 0) {
        return {
          reply: 'Dạ, ai trong chúng ta cũng có những ngày thi cử chưa như ý hoặc cảm thấy mệt mỏi trong lòng. Bạn hãy cho phép bản thân nghỉ ngơi 10–15 phút nhé. Em xin gửi tặng bạn các bài hát êm dịu, chữa lành cảm xúc từ thư viện nhà trường ạ:',
          tracks: matched
        };
      } else {
        return {
          reply: 'Dạ, hiện tại trong thư viện nhạc được quản trị công bố chưa có bài hát nào phù hợp với yêu cầu xoa dịu/chữa lành này của bạn ạ. Quản trị viên sẽ sớm cập nhật thêm vào thư viện!',
          tracks: []
        };
      }
    }

    if (lower.includes('toán') || lower.includes('giải đề') || lower.includes('khó') || lower.includes('logic') || lower.includes('lý') || lower.includes('hóa') || lower.includes('alpha') || lower.includes('gamma')) {
      const matched = publishedTracks.filter(t => 
        (t.notes || '').toLowerCase().includes('alpha') || 
        (t.notes || '').toLowerCase().includes('gamma') || 
        (t.notes || '').toLowerCase().includes('logic') || 
        (t.notes || '').toLowerCase().includes('toán') || 
        (t.notes || '').toLowerCase().includes('flow') ||
        t.category === 'other' || 
        (t.category === 'lofi' && (!t.bpm || t.bpm <= 75))
      );

      if (matched.length > 0) {
        return {
          reply: 'Dạ, với các môn học đòi hỏi tư duy logic cao độ như giải Toán, Lý, Hóa, bạn nên nghe nhạc không lời chuẩn tần số hoặc Lofi tiết tấu đều đặn để tránh quá tải bộ nhớ làm việc (Working Memory). Em đã chọn các bản nhạc phù hợp từ thư viện nhà trường dưới đây:',
          tracks: matched
        };
      } else {
        return {
          reply: 'Dạ, hiện tại trong thư viện nhạc được quản trị công bố chưa có bản nhạc tần số/không lời nào phù hợp với yêu cầu giải đề này của bạn ạ. Quản trị viên sẽ sớm cập nhật thêm vào thư viện dùng chung!',
          tracks: []
        };
      }
    }

    if (lower.includes('youtube') || lower.includes('zing') || lower.includes('link') || lower.includes('nguồn')) {
      const matched = publishedTracks.filter(t => t.sourceType === 'web_source' || !!t.webSourceUrl);

      if (matched.length > 0) {
        return {
          reply: 'Dạ, dưới đây là các bài hát có liên kết nguồn trực tiếp (YouTube, Zing MP3, Suno...) được quản trị viên thẩm định và công bố trong thư viện dùng chung của trường ạ. Bạn có thể nhấn nút "Mở nguồn" để thưởng thức nhé:',
          tracks: matched
        };
      } else {
        return {
          reply: 'Dạ, hiện tại chưa có bài hát có liên kết nguồn ngoài nào trong thư viện được quản trị công bố ạ.',
          tracks: []
        };
      }
    }

    // Keyword lookup against title, artist, category, notes
    const words = lower.split(/\s+/).filter(w => w.length > 2);
    const found = publishedTracks.filter(t => {
      const text = `${t.title} ${t.artist} ${t.category} ${t.notes || ''}`.toLowerCase();
      return words.some(w => text.includes(w));
    });

    if (found.length > 0) {
      return {
        reply: `Dạ, dựa trên tìm kiếm của bạn, em đã lọc được ${found.length} bản nhạc phù hợp từ thư viện nhạc dùng chung được quản trị công bố dưới đây ạ:`,
        tracks: found
      };
    }

    // No matching track found
    return {
      reply: 'Dạ, hiện tại trong thư viện nhạc được quản trị công bố chưa có bài hát nào phù hợp với yêu cầu này của bạn ạ. Quản trị viên sẽ sớm bổ sung và công bố thêm các bản nhạc mới. Bạn có thể xem toàn bộ kho nhạc đang sẵn có trong danh mục bên dưới nhé ạ! 🌸',
      tracks: []
    };
  };

  // Send message logic
  const handleSendMessage = (textToSend?: string) => {
    const rawText = textToSend || inputVal;
    if (!rawText.trim()) return;

    const userText = rawText.trim();
    if (!textToSend) setInputVal('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Vừa xong'
    };

    const { reply, tracks } = findTracksForQuery(userText);

    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'bot',
      text: reply,
      timestamp: 'Vừa xong',
      managedTracks: tracks
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
  };

  // Filtered tracks for the showcase gallery
  const displayedTracks = useMemo(() => {
    return publishedTracks.filter((t) => {
      if (activeCategoryFilter !== 'all' && t.category !== activeCategoryFilter) {
        return false;
      }
      if (activeSourceFilter !== 'all' && t.sourceType !== activeSourceFilter) {
        return false;
      }
      return true;
    });
  }, [publishedTracks, activeCategoryFilter, activeSourceFilter]);

  // Current 3B Recommendation calculation
  const currentRec = recommend({
    task: selectedTask,
    state: selectedState,
    lyricsDistract
  });

  // Filter publishedTracks based on 3B formula recommendation
  const rec3BTracks = useMemo(() => {
    const choices = currentRec.choices;
    if (choices.includes('silence')) return [];

    return publishedTracks.filter(t => {
      if (choices.includes('lofi') && t.category === 'lofi') return true;
      if (choices.includes('pop') && t.category === 'pop') return true;
      if (choices.includes('lofi') && t.category === 'other' && (!t.bpm || t.bpm <= 75)) return true;
      return false;
    });
  }, [publishedTracks, currentRec.choices]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-purple-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-600 text-white shadow-2xs">
                Chức năng 02
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Gợi ý nhạc cảm xúc & Mood Bot
              </h1>
            </div>
            <p className="text-sm text-slate-800 mt-1 font-medium">
              Thư viện dùng chung do quản trị viên phê chuẩn · Nghe nhạc trực tiếp không cần đăng nhập
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Thư viện: {publishedTracks.length} bài hát</span>
          </div>
          {isRealtimeSyncing && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Đồng bộ thực
            </span>
          )}
        </div>
      </div>

      {/* ================= 1. TRÒ CHUYỆN TRỰC QUAN CÙNG MOOD BOT ================= */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-50 via-indigo-50 to-pink-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-950">
                  Mood Bot – Tư vấn âm nhạc học đường
                </h2>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" title="Trực tuyến"></span>
              </div>
              <p className="text-xs text-slate-600">
                Gợi ý bài từ thư viện nhạc dùng chung được quản trị công bố · Không thêm nhạc ngoài
              </p>
            </div>
          </div>

          <button
            onClick={() => setMessages([{
              id: `msg-${Date.now()}`,
              sender: 'bot',
              text: initialGreeting,
              timestamp: 'Vừa xong',
              managedTracks: publishedTracks.slice(0, 3)
            }])}
            className="p-2 rounded-xl bg-white/80 hover:bg-white text-slate-600 border border-slate-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
            title="Bắt đầu lại cuộc trò chuyện"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm mới</span>
          </button>
        </div>

        {/* Chat History Log */}
        <div className="p-4 sm:p-6 bg-slate-50/60 max-h-[620px] overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    <Bot className="w-4.5 h-4.5" />
                  </div>
                )}

                <div
                  className={`max-w-[94%] sm:max-w-[85%] rounded-3xl p-4 sm:p-5 space-y-3.5 ${
                    isBot
                      ? 'bg-white text-slate-800 border border-slate-200/90 shadow-2xs rounded-tl-xs'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xs rounded-tr-xs'
                  }`}
                >
                  <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                    {msg.text}
                  </p>

                  {/* Render Suggested Managed Tracks from Admin Library */}
                  {isBot && msg.managedTracks && msg.managedTracks.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span className="flex items-center gap-1.5 text-purple-700">
                          <Sparkles className="w-3.5 h-3.5" />
                          Đề xuất từ thư viện công bố ({msg.managedTracks.length} bài hát):
                        </span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          Chuẩn nhãn và thể loại quản trị viên duyệt
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5">
                        {msg.managedTracks.map((track) => (
                          <SharedTrackCard
                            key={track.id}
                            track={track}
                            compact
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-[10px] flex justify-end font-mono ${isBot ? 'text-slate-500' : 'text-purple-200'}`}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 bg-slate-50 border-t border-slate-200/80 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {quickSuggestions.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.query)}
                className="px-3 py-1.5 rounded-xl bg-white border border-purple-200/80 hover:border-purple-500 hover:bg-purple-50/60 text-xs font-medium text-slate-700 hover:text-purple-700 transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Nhập tâm trạng, môn học hoặc thể loại bạn tìm kiếm..."
            className="flex-1 px-4 py-3 bg-slate-50 text-slate-900 placeholder-slate-500 rounded-2xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:bg-white focus:border-purple-500 shadow-2xs"
          />
          <button
            onClick={() => handleSendMessage()}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0"
          >
            <span>Gửi</span>
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ================= 2. BỘ CÔNG CỤ 3B TỰ ĐỘNG LỰA CHỌN ÂM NHẠC ================= */}
      <div className="bg-gradient-to-br from-purple-50/70 via-indigo-50/50 to-pink-50/60 rounded-3xl p-5 sm:p-7 border border-purple-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-600 text-white">
                Công thức 3B
              </span>
              <span className="text-xs font-bold text-purple-900">
                Bài gì? – Bạn thế nào? – Bật gì?
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight mt-1">
              Bộ công cụ cá nhân hóa âm thanh học tập
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-600">
            Dựa trên lý thuyết Yerkes-Dodson & Tải nhận thức Sweller
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* 1. Bài gì */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2.5">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 text-2xs font-black flex items-center justify-center">1</span>
              <span>BÀI GÌ? (Nhiệm vụ học tập)</span>
            </label>
            <select
              value={selectedTask}
              onChange={(e) => setSelectedTask(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500"
            >
              {Object.entries(TASKS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-600 leading-snug">
              Nhiệm vụ quyết định dung lượng bộ nhớ làm việc cần giải phóng.
            </p>
          </div>

          {/* 2. Bạn thế nào */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2.5">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 text-2xs font-black flex items-center justify-center">2</span>
              <span>BẠN THẾ NÀO? (Trạng thái tâm sinh lý)</span>
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-none focus:border-purple-500"
            >
              {Object.entries(STATES).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-600 leading-snug">
              Định vị mức độ hưng phấn thần kinh theo đường cong chữ U ngược.
            </p>
          </div>

          {/* 3. Lời ca */}
          <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs space-y-2.5 flex flex-col justify-between">
            <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-800 text-2xs font-black flex items-center justify-center">3</span>
              <span>ĐẶC ĐIỂM CÁ NHÂN</span>
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={lyricsDistract}
                onChange={(e) => setLyricsDistract(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <span>Tôi thường bị phân tâm khi nghe nhạc có lời</span>
            </label>
            <p className="text-[11px] text-slate-600 leading-snug">
              Cơ chế can thiệp lời ca vào vùng ngôn ngữ não bộ.
            </p>
          </div>

        </div>

        {/* 3B Result Box */}
        <div className="bg-white rounded-2xl p-5 border border-purple-300 shadow-2xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-100 px-3 py-1 rounded-md">
              BẬT GÌ? – Khuyến nghị khoa học:
            </span>
            <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2.5 py-1 rounded">
              Lựa chọn: {currentRec.choices.map((c) => c === 'silence' ? 'Im lặng (0 dB)' : c === 'lofi' ? 'Lo-fi không lời (60-75 BPM)' : 'Pop có lời (100-120 BPM)').join(' HOẶC ')}
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-slate-900">
            {currentRec.choices.map((c) => c === 'silence' ? 'Không gian Im lặng sâu' : c === 'lofi' ? 'Lo-fi chill không lời chuẩn tần số' : 'Nhạc Pop tiếp thêm năng lượng').join(' / ')}
          </h3>

          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
            {currentRec.reason}
          </p>

          {/* Render Matching Tracks from Admin Library for this 3B Recommendation */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
              <span>Bài hát phù hợp từ Thư viện quản trị công bố:</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {currentRec.choices.includes('silence') ? 'Yêu cầu không gian im lặng' : `${rec3BTracks.length} bài hát`}
              </span>
            </div>

            {currentRec.choices.includes('silence') ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Nhiệm vụ này đạt hiệu quả cao nhất trong không gian im lặng hoàn toàn. Bạn không cần bật nhạc để bảo toàn bộ nhớ làm việc.</span>
              </div>
            ) : rec3BTracks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rec3BTracks.slice(0, 4).map((track) => (
                  <SharedTrackCard
                    key={track.id}
                    track={track}
                    compact
                  />
                ))}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Hiện chưa có bài hát trong thư viện nhạc được quản trị công bố thỏa mãn tiêu chí 3B này. Quản trị viên sẽ sớm bổ sung thêm vào hệ thống!</span>
              </div>
            )}
          </div>

          <div className="pt-2 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <span>Cơ sở lý thuyết: {currentRec.basis}</span>
            <span>Nguồn: {currentRec.source}</span>
          </div>
        </div>
      </div>

      {/* ================= 3. TOÀN BỘ THƯ VIỆN NHẠC DÙNG CHUNG ================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 flex items-center gap-2">
              <Disc3 className="w-6 h-6 text-purple-600" />
              <span>Toàn bộ thư viện âm nhạc dùng chung ({displayedTracks.length} bài hát)</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Nguồn dữ liệu thống nhất do quản trị công bố · Đồng bộ tức thì khi có thay đổi
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1">
              {[
                { id: 'all', label: 'Tất cả' },
                { id: 'lofi', label: '🎧 Lo-fi' },
                { id: 'pop', label: '⚡ Pop' },
                { id: 'other', label: '🔬 Chuyên sâu' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategoryFilter(c.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeCategoryFilter === c.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveSourceFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeSourceFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Tất cả nguồn
              </button>
              <button
                onClick={() => setActiveSourceFilter('project_file')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeSourceFilter === 'project_file' ? 'bg-purple-600 text-white shadow-2xs' : 'text-purple-800'
                }`}
              >
                Tệp âm thanh
              </button>
              <button
                onClick={() => setActiveSourceFilter('web_source')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeSourceFilter === 'web_source' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-indigo-800'
                }`}
              >
                Liên kết nguồn
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        {displayedTracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedTracks.map((track) => (
              <SharedTrackCard
                key={track.id}
                track={track}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            Không tìm thấy bài hát nào phù hợp với bộ lọc hiện tại trong thư viện công bố.
          </div>
        )}
      </div>

    </div>
  );
};
