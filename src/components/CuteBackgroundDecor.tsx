import React from 'react';

/**
 * CuteBackgroundDecor:
 * Đảm bảo 100% nằm ở tầng sâu nhất (-z-50) đằng sau toàn bộ nội dung,
 * không đè hay che khuất bất kỳ chữ hoặc tính năng nào trên trang web.
 * Họa tiết đường nét thanh nhã, dễ thương, định vị ở viền ngoài (gutters)
 * để làm nổi bật sự cuốn hút của nền xanh pastel mà vẫn giữ độ sắc nét tuyệt đối.
 */
export const CuteBackgroundDecor: React.FC = () => {
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none -z-50 select-none"
      aria-hidden="true"
    >
      {/* 1. Mạng lưới ánh sáng nền Pastel Gradient dịu mắt ở các góc ngoài */}
      <div className="absolute -top-32 -left-32 w-[34rem] h-[34rem] bg-sky-200/35 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[25%] -right-32 w-[36rem] h-[36rem] bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[65%] -left-32 w-[32rem] h-[32rem] bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 right-[-5%] w-[38rem] h-[38rem] bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* 2. Lưới họa tiết chấm bi li ti & sóng âm thanh mềm mại chạy chìm ngầm */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="study-dot-grid-sharp" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" className="fill-blue-500/40" />
          </pattern>
          <linearGradient id="bgSoundWave" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#6366f1" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#a855f7" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        {/* Lưới chấm bi sắc nét trang nhã */}
        <rect width="100%" height="100%" fill="url(#study-dot-grid-sharp)" />

        {/* Đường uốn lượn dòng sông âm nhạc mềm mại */}
        <path
          d="M -50 200 Q 300 90, 700 230 T 1500 170 T 2400 260"
          fill="none"
          stroke="url(#bgSoundWave)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
        <path
          d="M -50 850 Q 450 740, 950 880 T 1800 810 T 2500 890"
          fill="none"
          stroke="url(#bgSoundWave)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />
      </svg>

      {/* 3. Họa tiết biểu tượng cute chìm nhẹ ở hai bên viền ngoài (Chỉ hiện khi màn hình đủ rộng để không chạm vào nội dung) */}
      
      {/* Viền trái - Phía trên: Tai nghe chụp tai nét mảnh nhẹ nhàng */}
      <div className="hidden lg:block absolute top-28 left-4 xl:left-8 opacity-20 text-blue-600 pointer-events-none">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
          <path d="M12 5v-3" strokeWidth="1.2" />
          <circle cx="12" cy="2" r="1" fill="currentColor" />
        </svg>
      </div>

      {/* Viền phải - Phía trên: Khóa Sol thanh mảnh & nốt nhạc */}
      <div className="hidden lg:block absolute top-32 right-4 xl:right-8 opacity-20 text-indigo-600 pointer-events-none text-center">
        <span className="text-4xl font-serif leading-none block">𝄞</span>
        <span className="text-xs font-semibold tracking-widest text-indigo-400 mt-1 block">♪ ♫</span>
      </div>

      {/* Viền trái - Vùng giữa: Sóng âm thanh tỏa tròn mini */}
      <div className="hidden xl:block absolute top-[45%] left-4 xl:left-8 opacity-15 text-sky-600 pointer-events-none">
        <svg width="56" height="56" viewBox="0 0 100 100" fill="none" stroke="currentColor">
          <circle cx="50" cy="50" r="16" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="30" strokeWidth="1.2" />
          <circle cx="50" cy="50" r="44" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="50" cy="50" r="4" fill="currentColor" />
        </svg>
      </div>

      {/* Viền phải - Vùng giữa: Cột sóng equalizer mini sắc nét */}
      <div className="hidden xl:block absolute top-[48%] right-4 xl:right-8 opacity-20 text-blue-600 pointer-events-none flex items-end gap-1 h-10">
        <div className="w-1 h-4 bg-current rounded-full" />
        <div className="w-1 h-8 bg-current rounded-full" />
        <div className="w-1 h-6 bg-current rounded-full" />
        <div className="w-1 h-10 bg-current rounded-full" />
        <div className="w-1 h-5 bg-current rounded-full" />
        <div className="w-1 h-7 bg-current rounded-full" />
        <div className="w-1 h-3 bg-current rounded-full" />
      </div>

      {/* Viền trái - Phía dưới: Tách trà / cà phê học bài & mầm cây */}
      <div className="hidden lg:block absolute bottom-28 left-4 xl:left-8 opacity-20 text-teal-600 pointer-events-none flex flex-col items-center gap-2">
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" />
          <line x1="10" y1="2" x2="10" y2="4" />
          <line x1="14" y1="2" x2="14" y2="4" />
        </svg>
        <span className="text-xs font-bold text-teal-700/60">🌱</span>
      </div>

      {/* Viền phải - Phía dưới: Ngôi sao lấp lánh & nốt nhạc kép */}
      <div className="hidden lg:block absolute bottom-28 right-4 xl:right-8 opacity-20 text-purple-600 pointer-events-none flex flex-col items-center gap-1">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span className="text-sm font-semibold text-purple-400">♬</span>
      </div>
    </div>
  );
};
