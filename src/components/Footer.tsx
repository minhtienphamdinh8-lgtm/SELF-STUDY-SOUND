import React from 'react';
import { NavTab } from '../types';
import { Heart, Sparkles } from 'lucide-react';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pt-12 pb-8 text-slate-600">
      <div className="max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] mx-auto px-3 sm:px-6 lg:px-8 xl:px-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 h-7">
              <span className="w-1 h-3 bg-indigo-500 rounded-full" />
              <span className="w-1 h-6 bg-blue-500 rounded-full" />
              <span className="w-1 h-4 bg-sky-400 rounded-full" />
              <span className="w-1 h-7 bg-pink-500 rounded-full" />
              <span className="w-1 h-3 bg-indigo-400 rounded-full" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Self Study Sound</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Âm nhạc đồng hành, tri thức vươn xa
              </p>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-slate-700 font-medium">
            <button onClick={() => onSelectTab('home')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Về chúng tôi
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onSelectTab('music-info')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Hướng dẫn sử dụng
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onSelectTab('mailbox')} className="hover:text-blue-600 transition-colors cursor-pointer">
              Hộp thư học sinh
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onSelectTab('admin')} className="hover:text-indigo-700 transition-colors font-bold text-indigo-700 cursor-pointer">
              Nhóm nghiên cứu
            </button>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">Bảo mật & Quyền riêng tư</span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-600">FAQ</span>
          </div>

          {/* Slogan & Socials */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-indigo-700 tracking-wide bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200">
              Same Students Brighter Futures ♡
            </span>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span className="hover:text-blue-600 cursor-pointer font-bold">f</span>
              <span className="hover:text-red-500 cursor-pointer font-bold">▶</span>
              <span className="hover:text-slate-900 cursor-pointer font-bold">d</span>
              <span className="hover:text-pink-600 cursor-pointer font-bold">📷</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright and academic disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
          <p className="font-medium">© 2024 Self Study Sound. Kiến tạo thế hệ học tập hạnh phúc hơn.</p>
          <div className="flex items-center gap-1.5 text-xs bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md border border-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>Đã kết nối Firebase Authentication & Cloud Firestore an toàn.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
