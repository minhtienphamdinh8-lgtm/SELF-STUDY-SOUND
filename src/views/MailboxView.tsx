import React, { useState } from 'react';
import { RESEARCH_TEAM } from '../data/initialData';
import { createTicket, lookupTicket, deleteTicketWithKey, TicketRecord } from '../services/mailboxService';
import { triggerDownload } from '../utils/domain';
import { 
  ArrowLeft, 
  Mail, 
  Send, 
  Key, 
  Search, 
  Download, 
  Copy, 
  Check, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Info,
  Users
} from 'lucide-react';

interface MailboxViewProps {
  onBackToHome: () => void;
  onSelectTab: (tab: any) => void;
}

export const MailboxView: React.FC<MailboxViewProps> = ({
  onBackToHome,
  onSelectTab
}) => {
  const [activeTab, setActiveTab] = useState<'send' | 'lookup' | 'team'>('send');

  // Form State
  const [nickname, setNickname] = useState('');
  const [topic, setTopic] = useState<'question' | 'feedback' | 'share' | 'submission'>('question');
  const [sunoUrl, setSunoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{ ticketId: string; secretKey: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Lookup State
  const [lookupTicketId, setLookupTicketId] = useState('');
  const [lookupSecretKey, setLookupSecretKey] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [lookedUpTicket, setLookedUpTicket] = useState<TicketRecord | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleSendTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!consent) {
      setErrorMessage('Vui lòng tích xác nhận đồng ý gửi thư cho nhóm nghiên cứu.');
      return;
    }

    if (message.trim().length < 5) {
      setErrorMessage('Nội dung thư cần tối thiểu 5 ký tự.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTicket({
        nickname,
        topic,
        sunoUrl,
        message,
        consent
      });

      setSuccessReceipt({
        ticketId: res.ticketId,
        secretKey: res.secretKey
      });

      // Reset form
      setMessage('');
      setSunoUrl('');
      setConsent(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi gửi thư. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReceipt = () => {
    if (!successReceipt) return;

    const text = `PHIẾU TRA CỨU HỘP THƯ BẢO MẬT - SELF STUDY SOUND
=====================================================
Mã phiếu (Ticket ID): ${successReceipt.ticketId}
Khóa tra cứu bí mật: ${successReceipt.secretKey}
Thời gian tạo: ${new Date().toLocaleString('vi-VN')}
Đơn vị tiếp nhận: Ban quản trị Self Study Sound

LƯU Ý QUAN TRỌNG:
- Bạn KHÔNG CẦN tài khoản. Chỉ cần giữ Mã phiếu và Khóa bí mật này để tra cứu câu trả lời tại mục "Tra cứu thư".
- Hệ thống chỉ lưu mã băm SHA-256 của khóa này để bảo vệ quyền riêng tư tuyệt đối cho bạn.
=====================================================`;

    triggerDownload(`Self_Study_Sound_Phieu_${successReceipt.ticketId.slice(0, 8)}.txt`, text);
  };

  const handleCopyCredentials = () => {
    if (!successReceipt) return;
    const text = `Mã phiếu: ${successReceipt.ticketId}\nKhóa bí mật: ${successReceipt.secretKey}`;
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2500);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError(null);
    setLookedUpTicket(null);
    setDeleteSuccess(false);

    if (!lookupTicketId.trim() || !lookupSecretKey.trim()) {
      setLookupError('Vui lòng nhập cả Mã phiếu và Khóa tra cứu bí mật.');
      return;
    }

    setIsLookingUp(true);
    try {
      const ticket = await lookupTicket(lookupTicketId, lookupSecretKey);
      if (!ticket) {
        setLookupError('Không tìm thấy thư với mã phiếu đã nhập. Vui lòng kiểm tra lại.');
      } else {
        setLookedUpTicket(ticket);
      }
    } catch (err: any) {
      setLookupError(err.message || 'Lỗi khi tra cứu thư.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleDeleteMyTicket = async () => {
    if (!lookedUpTicket) return;
    const confirm = window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn bức thư này khỏi hệ thống không? Hành động này không thể hoàn tác.');
    if (!confirm) return;

    try {
      await deleteTicketWithKey(lookupTicketId, lookupSecretKey);
      setDeleteSuccess(true);
      setLookedUpTicket(null);
      setLookupTicketId('');
      setLookupSecretKey('');
    } catch (err: any) {
      alert('Không thể xóa thư: ' + err.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToHome}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            title="Quay lại trang chủ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-600 text-white shadow-2xs">
                Chức năng 05
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                Hộp thư Self Study Sound
              </h1>
            </div>
            <p className="text-sm text-slate-800 mt-1 font-medium">
              Gửi câu hỏi ẩn danh không cần tài khoản · Bảo mật mã hóa bằng Khóa 256-bit
            </p>
          </div>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-2xs shrink-0">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'send'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Gửi thư mới
          </button>
          <button
            onClick={() => setActiveTab('lookup')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lookup'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Tra cứu thư
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'team'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-slate-700 hover:text-slate-950'
            }`}
          >
            Về Self Study Sound
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GỬI THƯ MỚI ================= */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Success Receipt Card */}
          {successReceipt ? (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-500 shadow-lg space-y-6 animate-in zoom-in-95">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Gửi thư thành công!</h2>
                  <p className="text-xs text-slate-600">
                    Máy chủ đã ghi nhận thư vào hàng đợi của Ban quản trị Self Study Sound
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 font-mono text-xs">
                <div>
                  <span className="text-slate-500 block text-2xs uppercase">Mã phiếu tra cứu (Ticket ID):</span>
                  <strong className="text-slate-900 text-sm select-all">{successReceipt.ticketId}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-2xs uppercase">Khóa tra cứu bí mật (256-bit Secret Key):</span>
                  <div className="text-emerald-700 text-xs font-bold break-all bg-white p-3 rounded-xl border border-slate-200 select-all">
                    {successReceipt.secretKey}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Bảo mật mật mã học: </strong>
                  <span>
                    Máy chủ chỉ lưu mã băm SHA-256 của khóa này. Nhóm nghiên cứu hoặc quản trị viên không thể đọc trộm hay cấp lại nếu bạn làm mất. Vui lòng tải phiếu hoặc sao chép ngay bây giờ.
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={handleDownloadReceipt}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Tải phiếu tra cứu (.txt)</span>
                </button>

                <button
                  onClick={handleCopyCredentials}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {copiedKey ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Sao chép Mã & Khóa</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSuccessReceipt(null)}
                  className="px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer ml-auto"
                >
                  Gửi thêm bức thư khác
                </button>
              </div>
            </div>
          ) : (
            /* Send Ticket Form */
            <form onSubmit={handleSendTicket} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900">Gửi thư cho Nhóm nghiên cứu</h2>
                  <p className="text-xs text-slate-600">
                    Không yêu cầu tài khoản, không thu thập email hay số điện thoại của bạn
                  </p>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nickname */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Tên gọi / Biệt danh (Không bắt buộc)
                  </label>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="VD: Bạn học lớp 11, Mai Anh..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Topic */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Chủ đề thư
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value as any)}
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="question">Hỏi đáp về cẩm nang & cách chọn nhạc</option>
                    <option value="feedback">Góp ý cải tiến website Self Study Sound</option>
                    <option value="share">Chia sẻ trải nghiệm học tập thực tế</option>
                    <option value="submission">Nộp bài dự thi Minigame tạo nhạc tuần</option>
                  </select>
                </div>
              </div>

              {/* Suno URL (optional) */}
              {topic === 'submission' && (
                <div className="space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đường link bài hát Suno tham dự:</span>
                  </label>
                  <input
                    type="url"
                    value={sunoUrl}
                    onChange={(e) => setSunoUrl(e.target.value)}
                    placeholder="https://suno.com/song/..."
                    className="w-full px-4 py-2.5 text-xs sm:text-sm bg-indigo-50/50 border border-indigo-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              )}

              {/* Message */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  <span>Nội dung thư (5 – 3000 ký tự) *</span>
                  <span className="text-slate-500 font-mono text-2xs">{message.length}/3000</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Chia sẻ câu hỏi hoặc cảm nhận của bạn với nhóm nghiên cứu..."
                  className="w-full px-4 py-3 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:border-rose-500 leading-relaxed"
                />
              </div>

              {/* Consent checkbox */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 rounded text-rose-600 focus:ring-rose-500 w-4 h-4 shrink-0"
                  />
                  <span>
                    Tôi tự nguyện gửi thông tin này cho Nhóm nghiên cứu đề tài THPT Trịnh Hoài Đức và hiểu rằng Hộp thư không phải là dịch vụ chẩn đoán tâm lý hay cấp cứu khẩn cấp.
                  </span>
                </label>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50 min-h-[44px]"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang mã hóa & gửi...' : 'Gửi thư & Nhận khóa tra cứu'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ================= TAB 2: TRA CỨU THƯ BẰNG KHÓA 256-BIT ================= */}
      {activeTab === 'lookup' && (
        <div className="space-y-6">
          <form onSubmit={handleLookup} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Tra cứu thư đã gửi</h2>
                <p className="text-xs text-slate-600">
                  Nhập Mã phiếu và Khóa tra cứu 64 ký tự đã được cấp khi bạn gửi thư
                </p>
              </div>
            </div>

            {lookupError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{lookupError}</span>
              </div>
            )}

            {deleteSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bức thư của bạn đã được xóa hoàn toàn khỏi cơ sở dữ liệu.</span>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Mã phiếu (Ticket ID)
                </label>
                <input
                  type="text"
                  required
                  value={lookupTicketId}
                  onChange={(e) => setLookupTicketId(e.target.value)}
                  placeholder="VD: 550e8400-e29b-41d4-a716-446655440000"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Khóa tra cứu bí mật (64 ký tự hex)
                </label>
                <input
                  type="text"
                  required
                  value={lookupSecretKey}
                  onChange={(e) => setLookupSecretKey(e.target.value)}
                  placeholder="Dán chuỗi 64 ký tự bí mật tại đây..."
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={isLookingUp}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{isLookingUp ? 'Đang đối chiếu mã băm...' : 'Tra cứu thư'}</span>
              </button>
            </div>
          </form>

          {/* Looked Up Ticket Result */}
          {lookedUpTicket && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      lookedUpTicket.status === 'replied'
                        ? 'bg-emerald-100 text-emerald-800'
                        : lookedUpTicket.status === 'closed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {lookedUpTicket.status === 'replied' ? '✓ Đã có phản hồi' : lookedUpTicket.status === 'closed' ? 'Đã đóng' : '⏳ Đang chờ nhóm nghiên cứu đọc'}
                    </span>
                    <span className="text-2xs text-slate-500 font-mono">
                      Gửi lúc: {lookedUpTicket.createdAtStr || 'Gần đây'}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Thư của: {lookedUpTicket.nickname || 'Ẩn danh'}
                  </h3>
                </div>

                <button
                  onClick={handleDeleteMyTicket}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center gap-1.5 transition-colors cursor-pointer self-start"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa thư của tôi khỏi hệ thống</span>
                </button>
              </div>

              {/* Message Body */}
              <div className="space-y-1.5">
                <span className="text-2xs uppercase tracking-wider font-bold text-slate-500">Nội dung thư của bạn:</span>
                <p className="text-sm text-slate-800 bg-slate-50 p-4 rounded-2xl border border-slate-200 whitespace-pre-line leading-relaxed font-normal">
                  {lookedUpTicket.message}
                </p>
              </div>

              {lookedUpTicket.sunoUrl && (
                <div className="text-xs text-indigo-700 flex items-center gap-1.5">
                  <span>Liên kết bài hát Suno đính kèm:</span>
                  <a href={lookedUpTicket.sunoUrl} target="_blank" rel="noopener noreferrer" className="font-mono underline">
                    {lookedUpTicket.sunoUrl}
                  </a>
                </div>
              )}

              {/* Research Team Reply */}
              {lookedUpTicket.reply ? (
                <div className="p-5 rounded-2xl bg-indigo-50/70 border border-indigo-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Phản hồi từ {lookedUpTicket.repliedBy || 'Nhóm nghiên cứu THPT Trịnh Hoài Đức'}:</span>
                    </span>
                    <span className="text-2xs text-indigo-700 font-mono">{lookedUpTicket.repliedAt}</span>
                  </div>

                  <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed font-normal">
                    {lookedUpTicket.reply}
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Thư của bạn đang nằm trong hàng đợi phản hồi của nhóm nghiên cứu. Vui lòng lưu lại Khóa bí mật và quay lại kiểm tra sau.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 3: VỀ SELF STUDY SOUND ================= */}
      {activeTab === 'team' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="p-2.5 rounded-2xl bg-rose-50 text-rose-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">Về nền tảng Self Study Sound</h2>
              <p className="text-xs text-slate-600">
                Đồng hành cùng học sinh cá nhân hóa âm thanh học tập hiệu quả và lành mạnh
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <p>
              <strong>Self Study Sound</strong> là nền tảng số hóa âm thanh học đường, giúp học sinh tìm ra môi trường âm thanh tối ưu nhất cho từng nhiệm vụ học tập (Toán, Văn, Anh, giải đề thi) nhằm giảm căng thẳng, tăng khả năng tập trung và bảo vệ sức khỏe thính lực.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-2xs uppercase text-slate-500 font-bold">Tác giả phát triển:</span>
                <div className="font-extrabold text-slate-900">Phạm Đình Minh Tiến</div>
                <div className="text-xs text-slate-600">Sáng kiến hỗ trợ học tập thông minh cho học sinh</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-2xs uppercase text-slate-500 font-bold">Kênh liên hệ & Góp ý:</span>
                <div className="font-extrabold text-slate-900 font-mono text-xs">phamdinhminhtien304@gmail.com</div>
                <div className="text-xs text-slate-600">Tiếp nhận ý kiến đóng góp và bản nhạc Suno từ học sinh</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-950 space-y-2">
              <strong className="block font-bold">Thông điệp gửi bạn:</strong>
              <p>
                "Âm nhạc là một công cụ cá nhân hóa, không phải liều thuốc thần kỳ duy nhất. Hãy luôn lắng nghe cảm giác của cơ thể, biết khi nào cần nghỉ ngơi và chọn âm thanh phù hợp nhất với chính mình!"
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
