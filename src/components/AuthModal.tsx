import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  GraduationCap, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  AlertCircle, 
  CheckCircle2, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'login'
}) => {
  const { 
    signInWithEmail, 
    signUpWithEmail, 
    signInWithGoogle, 
    authError, 
    clearAuthError 
  } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [grade, setGrade] = useState('Lớp 11');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTabChange = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    clearAuthError();
    setLocalSuccess(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAuthError();
    setLocalSuccess(null);

    try {
      if (mode === 'login') {
        const ok = await signInWithEmail(email, password);
        if (ok) {
          setLocalSuccess('Đăng nhập thành công!');
          setTimeout(() => {
            onClose();
          }, 800);
        }
      } else {
        const ok = await signUpWithEmail(email, password, displayName, grade);
        if (ok) {
          setLocalSuccess('Tạo tài khoản thành công! Bạn có thể bắt đầu sử dụng.');
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    clearAuthError();
    try {
      const ok = await signInWithGoogle();
      if (ok) {
        setLocalSuccess('Đăng nhập thành công!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
            🎵
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Self Study Sound • FIREBASE CLOUD
          </span>
        </div>

        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {mode === 'login' ? 'Đăng nhập tài khoản' : 'Đăng ký tài khoản mới'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium leading-relaxed">
          {mode === 'login' 
            ? 'Đăng nhập để đồng bộ Nhật ký 21 ngày và gửi thư đến Nhóm nghiên cứu.'
            : 'Tạo tài khoản học sinh để bắt đầu theo dõi thói quen học tập và nhận hỗ trợ.'}
        </p>

        {/* Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-300 mt-5 text-xs sm:text-sm font-bold">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              mode === 'login'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('signup')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] ${
              mode === 'signup'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Đăng ký mới</span>
          </button>
        </div>

        {/* Status Alerts */}
        {authError && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-rose-800 font-semibold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{authError}</div>
          </div>
        )}

        {localSuccess && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm text-emerald-800 font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{localSuccess}</span>
          </div>
        )}

        {/* Google Sign-in Button */}
        <div className="mt-5">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2.5 cursor-pointer shadow-2xs min-h-[44px]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs text-slate-500">
            <span className="bg-white px-2">Hoặc với Email & Mật khẩu</span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ tên hoặc Biệt danh <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Long, Thùy Chi"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Khối lớp học tập
                </label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  >
                    <option value="Lớp 10">Lớp 10</option>
                    <option value="Lớp 11">Lớp 11</option>
                    <option value="Lớp 12">Lớp 12</option>
                    <option value="Khác">Khác / Sinh viên</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Địa chỉ Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tenban@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm rounded-xl border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Đăng ký tài khoản</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Role Principle Footnote */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-2 text-[11px] text-slate-500 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            Bảo mật Firebase: Tài khoản mới mặc định là tài khoản học sinh thông thường. Quyền Quản trị viên Nhóm nghiên cứu chỉ do Chủ dự án cấp duyệt qua hệ thống phân quyền cơ sở dữ liệu Firestore.
          </span>
        </div>
      </div>
    </div>
  );
};
