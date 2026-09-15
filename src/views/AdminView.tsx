import React, { useState, useEffect } from 'react';
import { MailboxMessage, SoundEnvironment, QuizQuestion } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/AuthModal';
import { 
  fetchAllTicketsForAdmin, 
  replyTicketAdmin, 
  deleteTicketAdmin, 
  TicketRecord 
} from '../services/mailboxService';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { makeCSV, triggerDownload, dateVN } from '../utils/domain';
import { 
  ShieldCheck, 
  ArrowLeft, 
  Mail, 
  Music, 
  Gamepad2, 
  BookOpen, 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  Send, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  Lock, 
  Database, 
  UserCheck, 
  UserPlus, 
  Loader2, 
  LogIn, 
  Download, 
  ExternalLink,
  Users,
  Sparkles,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import { INITIAL_PROJECT_OWNER_EMAIL } from '../services/firebase';
import { AdminMusicManager } from '../components/AdminMusicManager';

interface AdminViewProps {
  onBackToHome: () => void;
  messages: MailboxMessage[];
  onReplyMessage: (id: string, replyContent: string, repliedBy: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteMessage?: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export const AdminView: React.FC<AdminViewProps> = ({
  onBackToHome,
  messages,
  onReplyMessage,
  onDeleteMessage
}) => {
  const { currentUser, userProfile, isAdmin, grantResearcherRole } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<'tickets' | 'music' | 'participants' | 'events' | 'roles'>('tickets');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Tickets management state
  const [tickets, setTickets] = useState<TicketRecord[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replierName, setReplierName] = useState(userProfile?.displayName || 'Nhóm nghiên cứu THPT Trịnh Hoài Đức');
  const [isReplying, setIsReplying] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState<string | null>(null);

  // Participants management state
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoadingParticipants, setIsLoadingParticipants] = useState(false);

  // Voluntary Events state
  const [researchEvents, setResearchEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Role grant form state
  const [targetUid, setTargetUid] = useState('');
  const [isGranting, setIsGranting] = useState(false);
  const [grantNotice, setGrantNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Load tickets
  const loadTickets = async () => {
    setIsLoadingTickets(true);
    try {
      const list = await fetchAllTicketsForAdmin();
      setTickets(list);
      if (list.length > 0 && !selectedTicketId) {
        setSelectedTicketId(list[0].id);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách thư:', err);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  // Load participants
  const loadParticipants = async () => {
    setIsLoadingParticipants(true);
    try {
      const snap = await getDocs(collection(db, 'participants'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setParticipants(list);
    } catch (err) {
      console.error('Lỗi tải người tham gia:', err);
    } finally {
      setIsLoadingParticipants(false);
    }
  };

  // Load research events
  const loadEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const snap = await getDocs(collection(db, 'research_events'));
      const list: any[] = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      setResearchEvents(list);
    } catch (err) {
      console.error('Lỗi tải sự kiện nghiên cứu:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadTickets();
      loadParticipants();
      loadEvents();
    }
  }, [isAdmin]);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicketId || !replyText.trim()) return;

    setIsReplying(true);
    setReplySuccessMsg(null);
    try {
      await replyTicketAdmin(selectedTicketId, replyText, replierName);
      setReplySuccessMsg('Đã lưu câu trả lời thành công! Học sinh tra cứu bằng Mã phiếu + Khóa bí mật sẽ thấy phản hồi.');
      setReplyText('');
      await loadTickets();
      setTimeout(() => setReplySuccessMsg(null), 4000);
    } catch (err: any) {
      alert('Lỗi phản hồi: ' + err.message);
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thư này khỏi hệ thống?')) return;
    try {
      await deleteTicketAdmin(ticketId);
      await loadTickets();
      if (selectedTicketId === ticketId) setSelectedTicketId(null);
    } catch (err: any) {
      alert('Lỗi xóa thư: ' + err.message);
    }
  };

  // Approve participant
  const handleApproveParticipant = async (pId: string) => {
    try {
      await updateDoc(doc(db, 'participants', pId), {
        status: 'active',
        startDate: dateVN()
      });
      alert('Đã kích hoạt hồ sơ học sinh tham gia nghiên cứu 21 ngày!');
      await loadParticipants();
    } catch (err: any) {
      alert('Lỗi kích hoạt: ' + err.message);
    }
  };

  // Export Tickets CSV
  const handleExportTicketsCSV = () => {
    const rows = tickets.map(t => ({
      id: t.id,
      biet_danh: t.nickname,
      chu_de: t.topic,
      noi_dung: t.message,
      suno_url: t.sunoUrl || '',
      trang_thai: t.status,
      phan_hoi: t.reply || '',
      nguoi_phan_hoi: t.repliedBy || '',
      ngay_gui: t.createdAtStr || ''
    }));
    const cols = ['id', 'biet_danh', 'chu_de', 'noi_dung', 'suno_url', 'trang_thai', 'phan_hoi', 'nguoi_phan_hoi', 'ngay_gui'];
    triggerDownload('Self_Study_Sound_Danh_Sach_Thu.csv', makeCSV(rows, cols));
  };

  // Export Participants CSV
  const handleExportParticipantsCSV = () => {
    const rows = participants.map(p => ({
      ma_code: p.code || '',
      biet_danh: p.nickname || '',
      email: p.email || '',
      trang_thai: p.status || '',
      dot: p.cohort || '',
      ngay_bat_dau: p.startDate || '',
      phien_ban_dong_thuan: p.consentVersion || ''
    }));
    const cols = ['ma_code', 'biet_danh', 'email', 'trang_thai', 'dot', 'ngay_bat_dau', 'phien_ban_dong_thuan'];
    triggerDownload('Self_Study_Sound_Danh_Sach_Nguoi_Tham_Gia.csv', makeCSV(rows, cols));
  };

  // Export Events CSV
  const handleExportEventsCSV = () => {
    const rows = researchEvents.map(ev => ({
      id: ev.id,
      loai_su_kien: ev.type || '',
      trang_thai_bang_chung: ev.evidenceStatus || 'client-reported-unverified',
      du_lieu: JSON.stringify(ev.data || {}),
      thoi_gian_bao_cao: ev.clientReportedAt || ''
    }));
    const cols = ['id', 'loai_su_kien', 'trang_thai_bang_chung', 'du_lieu', 'thoi_gian_bao_cao'];
    triggerDownload('Self_Study_Sound_Su_Kien_Tu_Nguyen.csv', makeCSV(rows, cols));
  };

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUid.trim()) return;

    setIsGranting(true);
    setGrantNotice(null);
    const res = await grantResearcherRole(targetUid.trim());
    setIsGranting(false);

    if (res.success) {
      setGrantNotice({
        type: 'success',
        message: `Đã cấp quyền Nghiên cứu viên thành công cho người dùng UID: ${targetUid}`
      });
      setTargetUid('');
    } else {
      setGrantNotice({
        type: 'error',
        message: res.message || 'Cấp quyền thất bại.'
      });
    }
  };

  // Access Denied Screen
  if (!currentUser || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6 animate-in fade-in">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            Khu vực Quản trị Nghiên cứu viên
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Trang này chỉ dành cho Nhóm nghiên cứu đề tài Trường THPT Trịnh Hoài Đức có quyền <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-xs text-rose-700">role: 'researcher'</code>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 text-left space-y-1.5 max-w-lg mx-auto">
          <span className="font-bold text-slate-800 block">Tài khoản nghiên cứu viên phụ trách:</span>
          <div>Email sở hữu ban đầu: <code className="font-mono text-indigo-700 font-bold">{INITIAL_PROJECT_OWNER_EMAIL}</code></div>
          {currentUser && (
            <div>Tài khoản hiện tại của bạn: <code className="font-mono text-slate-700">{currentUser.email}</code> (Chưa có quyền quản trị)</div>
          )}
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Quay lại trang chủ
          </button>
          {!currentUser && (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập tài khoản nghiên cứu</span>
            </button>
          )}
        </div>

        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Bảng điều khiển Nghiên cứu</span>
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                Quản trị Self Study Sound
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Quản lý Hộp thư bảo mật · Duyệt hồ sơ 21 ngày · Dữ liệu sự kiện & Xuất báo cáo CSV
            </p>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveAdminTab('tickets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'tickets'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hộp thư ({tickets.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('music')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeAdminTab === 'music'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Music className="w-3.5 h-3.5 text-indigo-600" />
            <span>Quản lý nhạc</span>
          </button>
          <button
            onClick={() => setActiveAdminTab('participants')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'participants'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Người tham gia ({participants.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('events')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'events'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sự kiện ({researchEvents.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('roles')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeAdminTab === 'roles'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Phân quyền
          </button>
        </div>
      </div>

      {/* ================= TAB 1: TICKETS MANAGEMENT ================= */}
      {activeAdminTab === 'tickets' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Danh sách thư bảo mật ({tickets.length})
            </span>
            <button
              onClick={handleExportTicketsCSV}
              disabled={!tickets.length}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5 text-indigo-600" />
              <span>Xuất CSV Thư</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List Column */}
            <div className="lg:col-span-1 bg-white rounded-3xl p-4 border border-slate-200 shadow-sm space-y-2 max-h-[600px] overflow-y-auto">
              {isLoadingTickets && (
                <div className="p-8 text-center text-xs text-slate-500">Đang tải thư...</div>
              )}
              {!isLoadingTickets && tickets.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">Chưa có thư nào được gửi.</div>
              )}
              {tickets.map(t => {
                const isSelected = selectedTicketId === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-slate-900 truncate">
                        {t.nickname || 'Ẩn danh'}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold ${
                        t.status === 'replied' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {t.status === 'replied' ? 'Đã trả lời' : 'Chờ duyệt'}
                      </span>
                    </div>
                    <div className="text-2xs text-slate-500 truncate mb-1">
                      Chủ đề: {t.topic}
                    </div>
                    <div className="text-xs text-slate-600 line-clamp-2">
                      {t.message}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detail & Reply Column */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              {selectedTicket ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-100 px-2.5 py-0.5 rounded text-slate-700">
                          {selectedTicket.id}
                        </span>
                        <span className="text-2xs text-slate-500">{selectedTicket.createdAtStr}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mt-1">
                        Thư từ: {selectedTicket.nickname} ({selectedTicket.topic})
                      </h3>
                    </div>

                    <button
                      onClick={() => handleDeleteTicket(selectedTicket.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer self-start"
                    >
                      <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                      Xóa thư
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                    {selectedTicket.message}
                  </div>

                  {selectedTicket.sunoUrl && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center justify-between">
                      <span className="font-mono truncate">{selectedTicket.sunoUrl}</span>
                      <a
                        href={selectedTicket.sunoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-bold text-2xs flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>Mở bài hát</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}

                  {/* Previous Reply */}
                  {selectedTicket.reply && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1 text-xs">
                      <div className="flex justify-between font-bold text-emerald-900">
                        <span>Đã phản hồi bởi: {selectedTicket.repliedBy}</span>
                        <span className="font-mono text-2xs">{selectedTicket.repliedAt}</span>
                      </div>
                      <p className="text-slate-800 whitespace-pre-line">{selectedTicket.reply}</p>
                    </div>
                  )}

                  {/* Reply Form */}
                  <form onSubmit={handleSendTicketReply} className="space-y-4 pt-2 border-t border-slate-100">
                    {replySuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                        {replySuccessMsg}
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Tên người phản hồi
                      </label>
                      <input
                        type="text"
                        value={replierName}
                        onChange={e => setReplierName(e.target.value)}
                        className="w-full px-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Nội dung phản hồi học sinh
                      </label>
                      <textarea
                        rows={4}
                        required
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Nhập phản hồi chi tiết từ nhóm nghiên cứu..."
                        className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-indigo-500 leading-relaxed"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isReplying}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isReplying ? 'Đang gửi...' : 'Lưu & Phản hồi thư'}</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="py-16 text-center text-xs text-slate-400">
                  Chọn một bức thư từ danh sách bên trái để xem chi tiết và phản hồi.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: MUSIC MANAGEMENT ================= */}
      {activeAdminTab === 'music' && (
        <AdminMusicManager
          currentUserId={currentUser.uid}
          currentUserEmail={currentUser.email || undefined}
        />
      )}

      {/* ================= TAB 2: PARTICIPANTS MANAGEMENT ================= */}
      {activeAdminTab === 'participants' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Danh sách Người tham gia Nhật ký 21 ngày ({participants.length})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Quản lý trạng thái duyệt đợt, mã học sinh và ngày bắt đầu theo múi giờ Việt Nam
              </p>
            </div>

            <button
              onClick={handleExportParticipantsCSV}
              disabled={!participants.length}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Xuất CSV Người tham gia</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                  <th className="p-3 font-bold">Mã học sinh</th>
                  <th className="p-3 font-bold">Biệt danh / Email</th>
                  <th className="p-3 font-bold">Đợt tham gia</th>
                  <th className="p-3 font-bold">Ngày bắt đầu (VN)</th>
                  <th className="p-3 font-bold">Trạng thái</th>
                  <th className="p-3 font-bold text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="p-3 font-bold text-indigo-700">{p.code || '—'}</td>
                    <td className="p-3 font-sans">
                      <div className="font-bold text-slate-900">{p.nickname || 'Ẩn danh'}</div>
                      <div className="text-2xs text-slate-500 font-mono">{p.email}</div>
                    </td>
                    <td className="p-3 text-slate-700 font-sans">{p.cohort || 'Đợt 1'}</td>
                    <td className="p-3 text-slate-700">{p.startDate || '—'}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-2xs font-bold font-sans ${
                        p.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : p.status === 'withdrawn' 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.status === 'active' ? 'Đã duyệt' : p.status === 'withdrawn' ? 'Đã rút' : 'Chờ duyệt'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.status === 'pending' && (
                        <button
                          onClick={() => handleApproveParticipant(p.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-2xs font-bold font-sans transition-colors cursor-pointer"
                        >
                          Duyệt kích hoạt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: VOLUNTARY RESEARCH EVENTS ================= */}
      {activeAdminTab === 'events' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900">
                Sự kiện nghiên cứu tự nguyện ({researchEvents.length})
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Các lượt chia sẻ tự nguyện từ Quiz cẩm nang, Trò chơi tập trung 1 phút và Phản hồi 3B
              </p>
            </div>

            <button
              onClick={handleExportEventsCSV}
              disabled={!researchEvents.length}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-40"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Xuất CSV Sự kiện</span>
            </button>
          </div>

          <div className="space-y-3">
            {researchEvents.map(ev => (
              <div key={ev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide">
                      {ev.type}
                    </span>
                    <span className="px-2 py-0.5 rounded text-2xs font-mono font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      client-reported-unverified
                    </span>
                  </div>
                  <span className="text-2xs text-slate-500 font-mono">
                    {ev.clientReportedAt}
                  </span>
                </div>
                <div className="font-mono text-2xs bg-white p-2 rounded-xl border border-slate-200 text-slate-700 overflow-x-auto">
                  {JSON.stringify(ev.data)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= TAB 4: ROLES MANAGEMENT ================= */}
      {activeAdminTab === 'roles' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 max-w-2xl">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Cấp quyền Nghiên cứu viên</h2>
              <p className="text-xs text-slate-600">
                Ủy quyền tài khoản thành viên nhóm nghiên cứu đề tài Trường THPT Trịnh Hoài Đức
              </p>
            </div>
          </div>

          {grantNotice && (
            <div className={`p-3.5 rounded-xl text-xs font-medium ${
              grantNotice.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {grantNotice.message}
            </div>
          )}

          <form onSubmit={handleGrantRole} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                UID tài khoản Firebase Authentication
              </label>
              <input
                type="text"
                required
                value={targetUid}
                onChange={e => setTargetUid(e.target.value)}
                placeholder="Nhập UID của thành viên nhóm nghiên cứu..."
                className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
              Chỉ cấp quyền cho các cộng sự trong nhóm nghiên cứu đề tài. Thành viên được cấp quyền sẽ có thể đọc thư bảo mật, trả lời học sinh và xuất báo cáo dữ liệu nghiên cứu.
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isGranting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGranting ? 'Đang cấp quyền...' : 'Cấp quyền Nghiên cứu viên'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
