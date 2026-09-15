import React, { useState } from 'react';
import { NavTab } from '../types';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { 
  Headphones, 
  Search, 
  Bell, 
  Menu, 
  X, 
  ShieldCheck, 
  Sparkles, 
  Music, 
  Bot, 
  Gamepad2, 
  CalendarCheck2, 
  Mail,
  Home,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  unreadMailCount: number;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentTab, 
  onSelectTab,
  unreadMailCount 
}) => {
  const { currentUser, userProfile, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotificationToast, setShowNotificationToast] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Trang chủ', icon: <Home className="w-4 h-4" /> },
    { id: 'music-info', label: 'Thông tin về âm nhạc', icon: <Music className="w-4 h-4" /> },
    { id: 'mood-bot', label: 'Chatbox đề xuất nhạc', icon: <Bot className="w-4 h-4" /> },
    { id: 'game', label: 'Trò chơi', icon: <Gamepad2 className="w-4 h-4" /> },
    { id: 'journal', label: 'Nhật ký 21 ngày', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'mailbox', label: 'Hộp thư lắng nghe', icon: <Mail className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-slate-200/90 shadow-xs relative">
      {/* Top micro announcement bar */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-sky-600 text-white text-xs py-1.5 px-3 sm:px-4 text-center font-bold flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 tracking-wide leading-relaxed">
        <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-300 shrink-0" />
        <span>Dự án nghiên cứu âm nhạc và tối ưu hóa việc học dành cho học sinh THPT</span>
        <button 
          onClick={() => onSelectTab('admin')} 
          className="underline hover:text-blue-100 text-[11px] font-bold transition-colors cursor-pointer shrink-0"
        >
          [Khu vực Nhóm nghiên cứu]
        </button>
      </div>

      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex items-center justify-between h-18 gap-3">
          
          {/* Brand Logo & Tagline */}
          <button 
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2 sm:gap-3 text-left group focus:outline-none shrink-0 cursor-pointer"
            id="brand-logo-btn"
          >
            <div className="flex items-center gap-0.5 h-8 px-1">
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full group-hover:scale-y-125 transition-transform" />
              <span className="w-1.5 h-7 bg-blue-600 rounded-full group-hover:scale-y-110 transition-transform" />
              <span className="w-1.5 h-5 bg-sky-500 rounded-full group-hover:scale-y-125 transition-transform" />
              <span className="w-1.5 h-8 bg-pink-500 rounded-full group-hover:scale-y-105 transition-transform" />
              <span className="w-1.5 h-4 bg-indigo-500 rounded-full group-hover:scale-y-125 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-base sm:text-xl text-slate-950 tracking-tight whitespace-nowrap">
                  Self Study Sound
                </span>
                <span className="text-[10px] uppercase font-black text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-300">
                  THPT
                </span>
              </div>
              <p className="text-xs text-slate-700 font-semibold hidden sm:block">
                Âm nhạc đồng hành, tri thức vươn xa
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-2.5 xl:px-3.5 py-1.5 xl:py-2 rounded-full text-xs xl:text-sm whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-bold'
                      : 'text-slate-800 hover:text-blue-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  {item.label}
                  {item.id === 'mailbox' && unreadMailCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-pink-500 inline-block ring-2 ring-white"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Search, Notifications & User Avatar */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* Search Input Box */}
            <div className="relative hidden xl:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    onSelectTab('music-info');
                  }
                }}
                placeholder="Tìm kiếm bài hát, chủ đề,..."
                className="w-44 lg:w-52 xl:w-56 pl-9 pr-3 py-1.5 text-xs bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 placeholder-slate-500 rounded-full border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                id="header-search-input"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2 pointer-events-none" />
            </div>

            {/* Notification Bell */}
            <button
              onClick={() => setShowNotificationToast(!showNotificationToast)}
              className="relative p-2 rounded-full text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              title="Thông báo mới"
              id="notification-bell-btn"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-pink-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Student Profile / Login Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 border-l border-slate-200 cursor-pointer text-left focus:outline-none"
                  id="user-profile-menu-btn"
                >
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm ring-2 ring-blue-400/40 shadow-xs">
                      {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
                  </div>
                  <div className="hidden xl:block text-left leading-tight">
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      {userProfile?.displayName || 'Học sinh'}
                      {isAdmin && (
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded font-extrabold border border-indigo-200">
                          Quản trị
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {isAdmin ? 'Nhóm nghiên cứu' : userProfile?.grade || 'Lớp 11'}
                    </div>
                  </div>
                </button>

                {/* User Dropdown */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-64 bg-white rounded-2xl shadow-xl border border-slate-300 p-3 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-2 border-b border-slate-100 mb-2">
                      <div className="font-bold text-xs text-slate-900 truncate">
                        {userProfile?.displayName || 'Người dùng'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                        <ShieldCheck className="w-3 h-3 text-blue-600" />
                        <span>{isAdmin ? 'Quản trị viên Nhóm nghiên cứu' : 'Tài khoản Học sinh THPT'}</span>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          onSelectTab('admin');
                          setUserDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs font-bold text-indigo-700 hover:bg-indigo-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>Khu vực Quản trị nghiên cứu</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer transition-colors mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Đăng xuất tài khoản</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <button
                  onClick={() => openAuth('login')}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs min-h-[40px]"
                  id="header-login-btn"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
              id="mobile-menu-toggle"
              aria-label="Mở menu điều hướng"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast Dropdown */}
      {showNotificationToast && (
        <div className="absolute right-4 top-16 w-80 bg-white rounded-2xl shadow-xl border border-slate-300 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
            <span className="font-bold text-xs text-slate-900">Thông báo học tập</span>
            <span className="text-xs text-blue-600 font-semibold cursor-pointer">Đánh dấu đã đọc</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-200">
              <div className="font-bold text-blue-900">Nhật ký ngày thứ 15 đang chờ bạn!</div>
              <p className="text-slate-700 text-xs mt-0.5">Hãy ghi lại mức độ tập trung và bài học hôm nay để duy trì chuỗi 21 ngày.</p>
            </div>
            <div className="p-2.5 bg-pink-50 rounded-xl border border-pink-200">
              <div className="font-bold text-pink-900">Thư mới từ nhóm nghiên cứu</div>
              <p className="text-slate-700 text-xs mt-0.5">ThS. Lê Hoàng Yến đã gửi lời giải đáp cho thắc mắc nghe nhạc khi học toán.</p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-300 px-4 pt-2 pb-6 space-y-2 shadow-xl">
          <div className="py-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm bài hát, chủ đề..."
              className="w-full px-3 py-2.5 text-sm bg-slate-100 text-slate-800 placeholder-slate-500 rounded-xl border border-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold min-h-[44px] cursor-pointer ${
                  currentTab === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.id === 'mailbox' && unreadMailCount > 0 && (
                  <span className="text-xs bg-pink-500 text-white font-bold px-2 py-0.5 rounded-full">
                    {unreadMailCount} mới
                  </span>
                )}
              </button>
            ))}

            <button
              onClick={() => {
                onSelectTab('admin');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-indigo-800 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 mt-3 min-h-[44px] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Khu vực Nhóm nghiên cứu (Quản trị)
            </button>

            {/* Mobile Auth Button */}
            <div className="pt-2 border-t border-slate-200 mt-2">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-900">{userProfile?.displayName || 'Học sinh'}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <div className="text-[11px] font-semibold text-blue-700 mt-0.5">
                      {isAdmin ? 'Quản trị viên Nhóm nghiên cứu' : userProfile?.grade || 'Lớp 11'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200 cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      openAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 cursor-pointer min-h-[44px]"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Đăng nhập</span>
                  </button>
                  <button
                    onClick={() => {
                      openAuth('signup');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 cursor-pointer min-h-[44px]"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Đăng ký</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </header>
  );
};
