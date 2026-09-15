import React, { useState, useEffect } from 'react';
import { JournalDay } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { 
  getParticipantProfile, 
  enrollParticipant, 
  fetchParticipantDiary, 
  saveParticipantDiaryDay, 
  withdrawParticipantConsent, 
  deleteParticipantAccountAndData,
  ParticipantProfile,
  ParticipantDiaryEntry
} from '../services/journalService';
import { 
  dateVN, 
  dayNumber, 
  addDays, 
  summarizeDiary, 
  makeCSV, 
  triggerDownload, 
  TASKS, 
  STATES, 
  SOUNDS 
} from '../utils/domain';
import { audioSynth } from '../utils/audioSynth';
import { 
  ArrowLeft, 
  CalendarCheck2, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  Save, 
  Trash2,
  AlertCircle, 
  Loader2, 
  Lock, 
  LogIn, 
  Check,
  Download,
  ShieldCheck,
  Sliders,
  UserCheck,
  RotateCcw,
  BarChart2,
  Info
} from 'lucide-react';

interface JournalViewProps {
  onBackToHome: () => void;
  journalDays: JournalDay[];
  onUpdateDay: (day: number, data: Partial<JournalDay>) => Promise<{ success: boolean; error?: string }>;
  onDeleteDay: (day: number) => Promise<{ success: boolean; error?: string }>;
  isLoadingCloud: boolean;
}

export const JournalView: React.FC<JournalViewProps> = ({
  onBackToHome,
  journalDays,
  onUpdateDay,
  onDeleteDay,
  isLoadingCloud
}) => {
  const { currentUser, userProfile, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [participant, setParticipant] = useState<ParticipantProfile | null>(null);
  const [diaryEntries, setDiaryEntries] = useState<Record<number, ParticipantDiaryEntry>>({});
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  // Enrollment Form
  const [nicknameInput, setNicknameInput] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [isEnrolling, setIsEnrolling] = useState<boolean>(false);

  // Selected Day & Form
  const [selectedDayNum, setSelectedDayNum] = useState<number>(1);
  const [task, setTask] = useState<string>('reading');
  const [stateVal, setStateVal] = useState<string>('calm');
  const [sound, setSound] = useState<string>('lofi');
  const [focus, setFocus] = useState<number>(4);
  const [distraction, setDistraction] = useState<number>(2);
  const [minutes, setMinutes] = useState<number>(45);
  const [stressBefore, setStressBefore] = useState<number | ''>('');
  const [stressAfter, setStressAfter] = useState<number | ''>('');
  const [note, setNote] = useState<string>('');
  const [researchShareConsent, setResearchShareConsent] = useState<boolean>(true);

  // Status
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [saveErrorMsg, setSaveErrorMsg] = useState<string | null>(null);

  const todayVN = dateVN();

  // Load participant profile when user logs in
  useEffect(() => {
    if (!currentUser) {
      setParticipant(null);
      setDiaryEntries({});
      return;
    }

    let isMounted = true;
    const loadProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const p = await getParticipantProfile(currentUser.uid);
        if (isMounted) {
          setParticipant(p);
          if (p) {
            const diary = await fetchParticipantDiary(currentUser.uid);
            if (isMounted) setDiaryEntries(diary);
          }
        }
      } catch (err) {
        console.warn('Lỗi tải hồ sơ tham gia:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    };

    loadProfile();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Handle Day Selection
  useEffect(() => {
    const existing = diaryEntries[selectedDayNum];
    if (existing) {
      setTask(existing.task || 'reading');
      setStateVal(existing.state || 'calm');
      setSound(existing.sound || 'lofi');
      setFocus(existing.focus ?? 4);
      setDistraction(existing.distraction ?? 2);
      setMinutes(existing.minutes ?? 45);
      setStressBefore(existing.stressBefore !== null && existing.stressBefore !== undefined ? existing.stressBefore : '');
      setStressAfter(existing.stressAfter !== null && existing.stressAfter !== undefined ? existing.stressAfter : '');
      setNote(existing.note || '');
      setResearchShareConsent(existing.researchShareConsent !== false);
    } else {
      setTask('reading');
      setStateVal('calm');
      setSound('lofi');
      setFocus(4);
      setDistraction(2);
      setMinutes(45);
      setStressBefore('');
      setStressAfter('');
      setNote('');
      setResearchShareConsent(true);
    }
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);
  }, [selectedDayNum, diaryEntries]);

  // Submit Enrollment
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!consentChecked) {
      alert('Vui lòng đồng thuận tự nguyện tham gia nghiên cứu.');
      return;
    }

    setIsEnrolling(true);
    try {
      const p = await enrollParticipant({
        uid: currentUser.uid,
        email: currentUser.email || '',
        nickname: nicknameInput || userProfile?.displayName || ''
      });
      setParticipant(p);
    } catch (err: any) {
      alert('Lỗi đăng ký tham gia: ' + err.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  // Save Day Record
  const handleSaveDay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }

    setIsSaving(true);
    setSaveSuccessMsg(null);
    setSaveErrorMsg(null);

    const startDate = participant?.startDate || todayVN;
    const targetDate = addDays(startDate, selectedDayNum - 1);
    const isLate = todayVN > targetDate;

    const entry: ParticipantDiaryEntry = {
      day: selectedDayNum,
      date: targetDate,
      task,
      state: stateVal,
      sound,
      focus: Number(focus),
      distraction: Number(distraction),
      minutes: Number(minutes),
      stressBefore: stressBefore === '' ? null : Number(stressBefore),
      stressAfter: stressAfter === '' ? null : Number(stressAfter),
      note: note.trim(),
      researchShareConsent,
      isLateEntry: isLate
    };

    const res = await saveParticipantDiaryDay(currentUser.uid, entry);
    setIsSaving(false);

    if (res.success) {
      audioSynth.playNote('firework', 880);
      setDiaryEntries(prev => ({ ...prev, [selectedDayNum]: entry }));
      setSaveSuccessMsg(`Đã lưu thành công nhật ký Ngày ${selectedDayNum}!`);
      setTimeout(() => setSaveSuccessMsg(null), 3500);
    } else {
      setSaveErrorMsg(res.error || 'Lỗi khi lưu vào máy chủ.');
    }
  };

  // Withdraw Consent
  const handleWithdraw = async () => {
    if (!currentUser) return;
    const confirm = window.confirm('Bạn có chắc muốn dừng tham gia nghiên cứu? Dữ liệu của bạn sẽ không còn được xuất vào báo cáo nghiên cứu tổng hợp.');
    if (!confirm) return;

    await withdrawParticipantConsent(currentUser.uid);
    setParticipant(prev => prev ? { ...prev, status: 'withdrawn' } : null);
    alert('Đã rút đồng thuận tham gia nghiên cứu.');
  };

  // Delete Account and Data
  const handleDeleteAccountAndData = async () => {
    if (!currentUser) return;
    const confirm = window.confirm('CẢNH BÁO: Thao tác này sẽ xóa vĩnh viễn toàn bộ nhật ký 21 ngày và tài khoản của bạn khỏi hệ thống. Bạn có chắc chắn không?');
    if (!confirm) return;

    await deleteParticipantAccountAndData(currentUser.uid);
    await logout();
    alert('Đã xóa toàn bộ dữ liệu và tài khoản của bạn thành công.');
  };

  // Export CSV
  const handleExportCSV = () => {
    const entriesList = Object.values(diaryEntries) as ParticipantDiaryEntry[];
    const rows = entriesList.map(entry => ({
      ma_hoc_sinh: participant?.code || 'ANON',
      ngay_thu: entry.day,
      ngay_ghi: entry.date,
      nhiem_vu: TASKS[entry.task] || entry.task,
      trang_thai: STATES[entry.state] || entry.state,
      am_thanh: SOUNDS[entry.sound] || entry.sound,
      tap_trung_1_5: entry.focus,
      phan_tam_1_5: entry.distraction,
      thoi_luong_phut: entry.minutes,
      cang_thang_truoc: entry.stressBefore ?? '',
      cang_thang_sau: entry.stressAfter ?? '',
      ghi_muon: entry.isLateEntry ? 'Co' : 'Khong',
      ghi_chu: entry.note || ''
    }));

    const columns = [
      'ma_hoc_sinh',
      'ngay_thu',
      'ngay_ghi',
      'nhiem_vu',
      'trang_thai',
      'am_thanh',
      'tap_trung_1_5',
      'phan_tam_1_5',
      'thoi_luong_phut',
      'cang_thang_truoc',
      'cang_thang_sau',
      'ghi_muon',
      'ghi_chu'
    ];

    const csvContent = makeCSV(rows, columns);
    triggerDownload(`Self_Study_Sound_Nhat_Ky_${participant?.code || 'Cua_Toi'}.csv`, csvContent, 'text/csv;charset=utf-8');
  };

  // Descriptive Statistics calculation
  const summaryList = summarizeDiary(Object.values(diaryEntries));
  const completedCount = Object.keys(diaryEntries).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-2xs">
                Chức năng 04
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Nhật ký 21 ngày
              </h1>
            </div>
            <p className="text-sm text-slate-800 mt-1 font-medium">
              Ghi nhận một phiên học tiêu biểu mỗi ngày theo múi giờ Việt Nam · Tự theo dõi & thống kê mô tả
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button
              onClick={handleExportCSV}
              disabled={completedCount === 0}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Xuất nhật ký (CSV)</span>
            </button>
          )}
          <span className="text-xs font-black px-3 py-2 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 shadow-2xs">
            Đã ghi: {completedCount}/21 Ngày
          </span>
        </div>
      </div>

      {/* Guest / Not logged in banner */}
      {!currentUser && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 block font-bold">Đăng nhập để lưu tiến độ 21 ngày của bạn</strong>
              <p className="text-xs text-amber-800 mt-0.5">
                Đăng nhập tài khoản Google để bảo mật dữ liệu và đồng bộ lịch sử phiên học của bạn.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shrink-0"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>
        </div>
      )}

      {/* Enrollment Card (If logged in but not enrolled) */}
      {currentUser && !participant && !isLoadingProfile && (
        <form onSubmit={handleEnroll} className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Bắt đầu hành trình 21 ngày rèn luyện</h2>
              <p className="text-xs text-slate-600">
                Tạo mã định danh cá nhân để theo dõi thói quen học tập cùng âm nhạc
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
            <strong className="text-slate-900 block font-bold">Mục tiêu rèn luyện:</strong>
            <p>
              Nhật ký 21 ngày là công cụ giúp bạn tự quan sát phản ứng của cơ thể đối với 3 điều kiện âm thanh (Im lặng – Lo-fi không lời – Pop có lời) trong một phiên học mỗi ngày, từ đó tìm ra công thức âm thanh mang lại hiệu suất tốt nhất cho riêng bạn.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Biệt danh / Tên hiển thị (Tùy chọn)
            </label>
            <input
              type="text"
              value={nicknameInput}
              onChange={(e) => setNicknameInput(e.target.value)}
              placeholder="VD: Minh Anh, Học sinh 11A..."
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-emerald-950 leading-relaxed font-medium">
              <input
                type="checkbox"
                required
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
              />
              <span>
                Tôi đồng ý ghi nhật ký một phiên học tiêu biểu mỗi ngày để theo dõi và xây dựng thói quen học tập cùng âm nhạc. Tôi có toàn quyền dừng tham gia hoặc xóa dữ liệu bất kỳ lúc nào.
              </span>
            </label>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isEnrolling}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isEnrolling ? 'Đang kích hoạt...' : 'Bắt đầu hành trình 21 ngày'}
            </button>
          </div>
        </form>
      )}

      {/* Participant Info Banner */}
      {currentUser && participant && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-black text-sm">
              {participant.code}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                  {participant.nickname || 'Thành viên 21 ngày'}
                </h3>
                <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                  participant.status === 'active' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : participant.status === 'withdrawn'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-amber-100 text-amber-800'
                }`}>
                  {participant.status === 'active' ? 'Đang hoạt động' : participant.status === 'withdrawn' ? 'Đã tạm dừng' : 'Đang chuẩn bị'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                Đợt: {participant.cohort} · Ngày bắt đầu: {participant.startDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {participant.status === 'active' && (
              <button
                onClick={handleWithdraw}
                className="px-3 py-1.5 rounded-lg text-2xs font-bold text-slate-600 hover:text-rose-700 bg-slate-50 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
              >
                Dừng tham gia
              </button>
            )}
            <button
              onClick={handleDeleteAccountAndData}
              className="px-3 py-1.5 rounded-lg text-2xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
            >
              Xóa tài khoản & dữ liệu
            </button>
          </div>
        </div>
      )}

      {/* 21 Days Selector Buttons */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          Chọn ngày ghi nhận (1 đến 21):
        </span>
        <div className="grid grid-cols-7 sm:grid-cols-11 md:grid-cols-21 gap-1.5">
          {Array.from({ length: 21 }, (_, i) => i + 1).map((d) => {
            const isSaved = !!diaryEntries[d];
            const isSelected = selectedDayNum === d;

            return (
              <button
                key={d}
                onClick={() => setSelectedDayNum(d)}
                className={`h-11 rounded-xl font-bold text-xs sm:text-sm flex flex-col items-center justify-center transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-300'
                    : isSaved
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <span>N.{d}</span>
                <span className="text-2xs font-mono opacity-80">
                  {isSaved ? '✓' : '—'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Logging Form */}
      <form onSubmit={handleSaveDay} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="w-5 h-5 text-emerald-600" />
              <span>Ghi nhật ký: Ngày {selectedDayNum} / 21</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Ghi lại một phiên học tiêu biểu nhất trong ngày của bạn
            </p>
          </div>

          <div className="text-xs font-mono text-slate-500">
            Ngày chỉ định: {participant?.startDate ? addDays(participant.startDate, selectedDayNum - 1) : todayVN}
          </div>
        </div>

        {saveSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}

        {saveErrorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{saveErrorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Nhiệm vụ học tập (8 tasks) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Nhiệm vụ học tập
            </label>
            <select
              value={task}
              onChange={(e) => setTask(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {Object.entries(TASKS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Trạng thái trước phiên (4 states) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Trạng thái trước phiên
            </label>
            <select
              value={stateVal}
              onChange={(e) => setStateVal(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {Object.entries(STATES).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Âm thanh đã dùng (3 sounds) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Âm thanh thực tế đã dùng
            </label>
            <select
              value={sound}
              onChange={(e) => setSound(e.target.value)}
              className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-medium"
            >
              {Object.entries(SOUNDS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>

          {/* Mức tập trung (1-5) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
              <span>Mức tập trung (1-5)</span>
              <span className="font-mono text-emerald-700">{focus}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={focus}
              onChange={(e) => setFocus(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
          </div>

          {/* Mức phân tâm (1-5) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
              <span>Mức phân tâm (1-5)</span>
              <span className="font-mono text-rose-700">{distraction}/5</span>
            </label>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={distraction}
              onChange={(e) => setDistraction(Number(e.target.value))}
              className="w-full accent-rose-600"
            />
          </div>

          {/* Thời lượng học (phút) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Thời lượng (Phút, 1–240)
            </label>
            <input
              type="number"
              min="1"
              max="240"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Căng thẳng trước (0-10, tùy chọn) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Căng thẳng trước phiên (0–10, tùy chọn)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={stressBefore}
              onChange={(e) => setStressBefore(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Để trống nếu không đo"
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          {/* Căng thẳng sau (0-10, tùy chọn) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              Căng thẳng sau phiên (0–10, tùy chọn)
            </label>
            <input
              type="number"
              min="0"
              max="10"
              value={stressAfter}
              onChange={(e) => setStressAfter(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="Để trống nếu không đo"
              className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Note (max 500 chars) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex justify-between">
            <span>Ghi chú cá nhân (Tối đa 500 ký tự)</span>
            <span className="text-2xs font-mono text-slate-400">{note.length}/500</span>
          </label>
          <textarea
            rows={3}
            maxLength={500}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Cảm nhận về độ ồn, bài hát có lời làm gián đoạn hay không..."
            className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        {/* Research Share Consent Checkbox */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
          <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700">
            <input
              type="checkbox"
              checked={researchShareConsent}
              onChange={(e) => setResearchShareConsent(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <span>Đồng ý đồng bộ và lưu trữ bảo mật phiên học này vào hồ sơ cá nhân của tôi</span>
          </label>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Đang lưu vào máy chủ...' : `Lưu nhật ký Ngày ${selectedDayNum}`}</span>
          </button>
        </div>
      </form>

      {/* Descriptive Statistics Table */}
      {completedCount > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-indigo-600" />
              <span>Bảng tổng hợp thống kê mô tả từ nhật ký của bạn</span>
            </h3>
            <span className="text-2xs text-slate-500">Mô tả dữ liệu đã ghi</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3 font-bold">Điều kiện âm thanh</th>
                  <th className="p-3 font-bold text-center">Số phiên (N)</th>
                  <th className="p-3 font-bold text-center">Tập trung TB (1–5)</th>
                  <th className="p-3 font-bold text-center">Phân tâm TB (1–5)</th>
                  <th className="p-3 font-bold text-center">Biến thiên căng thẳng TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {summaryList.map((row) => (
                  <tr key={row.sound} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-slate-900 font-sans">{row.label}</td>
                    <td className="p-3 text-center">{row.n}</td>
                    <td className="p-3 text-center text-emerald-700 font-bold">
                      {row.focus !== null ? row.focus.toFixed(2) : '—'}
                    </td>
                    <td className="p-3 text-center text-rose-700 font-bold">
                      {row.distraction !== null ? row.distraction.toFixed(2) : '—'}
                    </td>
                    <td className="p-3 text-center text-slate-700">
                      {row.stressChange !== null ? (row.stressChange > 0 ? `+${row.stressChange.toFixed(2)}` : row.stressChange.toFixed(2)) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 text-2xs text-slate-500 border border-slate-200">
            Số liệu phản ánh trung bình các phiên bạn tự nhập; không thay thế phân tích suy luận thống kê hoặc kết luận nhân quả trong phòng thí nghiệm.
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="login"
      />

    </div>
  );
};
