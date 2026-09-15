import React from 'react';
import { ShieldCheck, X, FileText, AlertTriangle, Lock, Mail, Users } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Self Study Sound</span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">Quyền riêng tư & Giới hạn sử dụng</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            title="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6 text-sm text-slate-700 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-900 block font-bold mb-1">Ranh giới khoa học & Không phải công cụ khẩn cấp</strong>
              <p className="text-xs text-amber-800">
                Self Study Sound là công cụ hỗ trợ đề tài nghiên cứu giáo dục tại THPT Trịnh Hoài Đức. Ứng dụng không đưa ra chẩn đoán y khoa, không điều trị tâm lý và Hộp thư không phải là kênh hỗ trợ khẩn cấp. Khi cần trợ giúp khẩn, học sinh hãy liên hệ trực tiếp với thầy cô, gia đình hoặc chuyên viên tư vấn học đường.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              1. Đơn vị phụ trách & Phiên bản chính sách
            </h3>
            <p>
              • <strong>Đơn vị triển khai:</strong> Nhóm nghiên cứu đề tài Âm nhạc học đường – Trường THPT Trịnh Hoài Đức.<br />
              • <strong>Phiên bản thông báo dữ liệu:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800">sss-privacy-1</code><br />
              • <strong>Phiên bản đồng thuận thử nghiệm:</strong> <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-800">sss-pilot-consent-1</code><br />
              • <strong>Thời hạn lưu trữ dữ liệu quy định:</strong> Tối đa 90 ngày kể từ thời điểm ghi nhận, sau đó được thanh lọc định kỳ theo quy trình.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              2. Phần sử dụng tự do (Không cần tài khoản)
            </h3>
            <p>
              Trang chủ, Tra cứu kiến thức cẩm nang, Chatbox gợi ý nhạc 3B, Bàn phím âm thanh và Trò chơi luyện tập hoàn toàn <strong>không yêu cầu tài khoản hay đăng nhập</strong>. Các lựa chọn trạng thái và thao tác gõ phím được xử lý nội bộ trong phiên trình duyệt của thiết bị. Chỉ khi học sinh chủ động bấm "Gửi kết quả tự nguyện", số liệu ẩn danh mới được chuyển đến máy chủ nghiên cứu với nhãn <span className="font-mono text-xs bg-slate-100 px-1 rounded">client-reported-unverified</span>.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              3. Nhật ký nghiên cứu 21 ngày
            </h3>
            <p>
              Nhật ký 21 ngày yêu cầu đăng nhập Google để định danh hồ sơ và bảo mật bản ghi, đồng thời phải được người phụ trách duyệt (trạng thái <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">active</span>) kèm kiểm tra thủ tục đồng thuận. Dữ liệu ghi gồm: nhiệm vụ, trạng thái, âm thanh thực tế, mức tập trung (1-5), mức phân tâm (1-5), thời lượng. Người tham gia có quyền:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-xs">
              <li>Xuất toàn bộ nhật ký của mình ra tệp CSV bất kỳ lúc nào.</li>
              <li>Chủ động bấm <strong>"Dừng tham gia nhật ký"</strong> (rút đồng thuận, chặn đọc và xuất nghiên cứu).</li>
              <li>Yêu cầu <strong>"Xóa tài khoản và dữ liệu"</strong> vĩnh viễn khỏi máy chủ Cloud Firestore.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              4. Hộp thư lắng nghe bảo mật bằng Khóa 256-bit
            </h3>
            <p>
              Học sinh gửi thư <strong>không cần tài khoản</strong> và không bắt buộc cung cấp họ tên, email hay số điện thoại. Hệ thống cấp một Mã thư và Khóa tra cứu 256-bit ngẫu nhiên mạnh. Máy chủ chỉ lưu mã băm SHA-256 của khóa. Chỉ người nắm giữ cả Mã thư và Khóa bí mật mới có thể xem thư, đọc câu trả lời do thành viên nhóm nghiên cứu trực tiếp viết, hoặc tự xóa thư khỏi cơ sở dữ liệu.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors cursor-pointer"
          >
            Đã hiểu và đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};
