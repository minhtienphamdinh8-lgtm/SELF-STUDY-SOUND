export interface SunoTrack {
  id: string;
  title: string;
  category: 'lofi' | 'pop' | 'nature' | 'piano';
  categoryLabel: string;
  bpm: number;
  duration: string;
  coverGradient: string;
  artist: string;
  moodTags: string[];
  emotionTarget: string;
  description: string;
  snippet: string; // Lyrics excerpt for Pop, or soundscape notes for Lofi
  sunoPrompt: string;
  sunoUrl: string;
  audioKey: 'lofi-rain' | 'lofi-coffee' | 'lofi-space' | 'pop-sunshine' | 'pop-energy' | 'pop-heal' | 'piano-calm';
}

export const SUNO_CURATED_TRACKS: SunoTrack[] = [
  // 1. LOFI CHILL KHÔNG LỜI ĐẶC SẮC
  {
    id: 'suno-lofi-1',
    title: 'Mưa Rơi Bên Cửa Sổ',
    category: 'lofi',
    categoryLabel: 'Lofi Chill Không Lời',
    bpm: 72,
    duration: '2:45',
    coverGradient: 'from-blue-500 via-indigo-600 to-purple-700',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#LofiChill', '#MưaNhẹ', '#GiảmStress', '#72BPM'],
    emotionTarget: 'Xoa dịu lo âu, hạ nhịp tim, tạo không gian học bài ấm cúng',
    description: 'Bản Lofi không lời với tiếng mưa rào nhẹ nhàng, hợp âm piano điện Rhodes ấm áp, chuẩn nhịp sinh học thư thái giúp giải tỏa áp lực học tập.',
    snippet: 'Giai điệu: Tiếng mưa nhẹ êm + Hợp âm Rhodes Jazz dịu ngọt + Tiếng đĩa than lách tách mộc mạc.',
    sunoPrompt: 'Chillout lofi instrumental, cozy rain sounds, warm rhodes piano chords, dusty vinyl crackle, slow tempo 72 bpm, gentle bassline, deep study focus, no vocals, serene, peaceful.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'lofi-rain'
  },
  {
    id: 'suno-lofi-2',
    title: 'Góc Cà Phê Hoàng Hôn',
    category: 'lofi',
    categoryLabel: 'Lofi Chillhop Không Lời',
    bpm: 76,
    duration: '3:10',
    coverGradient: 'from-amber-500 via-orange-600 to-rose-600',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#Chillhop', '#TậpTrungSâu', '#ThưThái', '#76BPM'],
    emotionTarget: 'Giữ sự chú ý bền bỉ, chống mỏi mệt khi ngồi vào bàn học buổi chiều',
    description: 'Pha trộn giữa guitar mộc acoustic và tiếng trống boom-bap chậm rãi, mang không khí quán cà phê thư giãn giúp bạn tập trung đọc sách và làm bài tập.',
    snippet: 'Giai điệu: Hợp âm guitar nylon êm bẫng + Nhịp trống Lo-fi nhấp nhô nhẹ nhàng.',
    sunoPrompt: 'Acoustic lofi chillhop, warm acoustic guitar picking, cozy coffee shop vibe, soft drum groove 76 bpm, unobtrusive study beat, relaxing melody, no lyrics, instrumental mastery.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'lofi-coffee'
  },
  {
    id: 'suno-lofi-3',
    title: 'Tĩnh Lặng Giữa Vũ Trụ',
    category: 'lofi',
    categoryLabel: 'Ambient Lofi Không Lời',
    bpm: 68,
    duration: '3:25',
    coverGradient: 'from-indigo-700 via-purple-800 to-slate-900',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#AmbientLofi', '#SóngAlpha', '#GiảiToán', '#68BPM'],
    emotionTarget: 'Hỗ trợ tư duy logic cao độ, giải đề khó, khử sạch tiếng ồn xung quanh',
    description: 'Âm thanh pad không gian kết hợp sóng não Alpha 10Hz, loại bỏ hoàn toàn các yếu tố gây xao nhãng để bạn hoàn toàn đắm chìm vào bài học.',
    snippet: 'Giai điệu: Dải sóng synthesizer không gian sâu lắng + Hợp âm mượt mà như trôi trong vũ trụ.',
    sunoPrompt: 'Deep space ambient lofi, warm synthesizer pads, alpha wave binaural frequency 10hz, gentle sub bass, minimal rhythm 68 bpm, zero distraction, science study mode, instrumental.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'lofi-space'
  },
  {
    id: 'suno-lofi-4',
    title: 'Dương Cầm Chiều Yên Ả',
    category: 'piano',
    categoryLabel: 'Solo Piano Thư Giãn',
    bpm: 70,
    duration: '2:50',
    coverGradient: 'from-emerald-500 via-teal-600 to-cyan-700',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#PianoChill', '#CânBằngCảmXúc', '#HọcThêmVui', '#70BPM'],
    emotionTarget: 'Hồi phục tinh thần sau ngày dài học tập mệt mỏi',
    description: 'Từng phím dương cầm trong trẻo, ngân vang dịu nhẹ giúp xoa dịu những căng thẳng và nạp lại sự minh mẫn cho não bộ.',
    snippet: 'Giai điệu: Nốt phím piano cổ điển hiện đại, du dương và sâu lắng.',
    sunoPrompt: 'Intimate solo piano, neo-classical study music, emotional yet calming progression, soft felt piano tone, 70 bpm, meditative atmosphere, inspiring, clean acoustic recording.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'piano-calm'
  },

  // 2. POP CÓ LỜI CẢM XÚC & NẠP NĂNG LƯỢNG ĐẶC SẮC
  {
    id: 'suno-pop-1',
    title: 'Bước Tiếp Dưới Ánh Nắng',
    category: 'pop',
    categoryLabel: 'Pop Chữa Lành Có Lời',
    bpm: 104,
    duration: '3:15',
    coverGradient: 'from-pink-500 via-rose-500 to-amber-500',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#PopChữaLành', '#CóLờiÝNghĩa', '#VượtÁpLực', '#104BPM'],
    emotionTarget: 'Nạp lại niềm tin khi làm bài chưa tốt, tiếp thêm động lực kiên trì',
    description: 'Ca từ ấm áp, giai điệu Pop ballad acoustic truyền cảm hứng. Thích hợp nghe lúc giải lao 10-15 phút để lấy lại tinh thần và cảm xúc tích cực.',
    snippet: 'Lời bài hát: “Dẫu hôm nay bài thi có khó, bước chân này chẳng thể dừng lại... Ngày mai nắng lên, nụ cười rạng rỡ trên môi ta...”',
    sunoPrompt: 'Inspiring acoustic pop with emotive female vocals, uplifting lyrics in Vietnamese about hope and student perseverance, warm acoustic guitar, steady beat 104 bpm, healing chorus.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'pop-heal'
  },
  {
    id: 'suno-pop-2',
    title: 'Rực Rỡ Ngày Mới',
    category: 'pop',
    categoryLabel: 'Upbeat Pop Năng Lượng',
    bpm: 116,
    duration: '2:55',
    coverGradient: 'from-yellow-400 via-orange-500 to-red-500',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#UpbeatPop', '#ChốngBuồnNgủ', '#NăngLượngTrẻ', '#116BPM'],
    emotionTarget: 'Đánh tan cảm giác uể oải, buồn ngủ khi bắt đầu phiên học mới',
    description: 'Giai điệu tươi sáng, nhịp điệu rộn rã kích hoạt dopamine và năng lượng tích cực trước khi bắt tay vào dọn dẹp góc học tập và sắp xếp tài liệu.',
    snippet: 'Lời bài hát: “Bật tung cánh cửa, đón ban mai tươi vui! Từng trang sách mở ra chân trời mới rạng ngời...”',
    sunoPrompt: 'Upbeat bright pop song, energetic youth vibe, catchy synthesizer hook, rhythmic clap and bass, 116 bpm, inspiring vocal harmonies, positive mood booster, study break anthem.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'pop-energy'
  },
  {
    id: 'suno-pop-3',
    title: 'Gác Lại Những Âu Lo',
    category: 'pop',
    categoryLabel: 'Chill Pop Ballad Có Lời',
    bpm: 96,
    duration: '3:20',
    coverGradient: 'from-teal-400 via-emerald-500 to-blue-600',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#ChillPop', '#ThưGiãnCuốiNgày', '#NhẹLòng', '#96BPM'],
    emotionTarget: 'Thư giãn sau những giờ làm bài tập căng thẳng, thả lỏng tâm trí',
    description: 'Giai điệu nhẹ nhàng, ca từ êm ái nhắc nhở bạn hãy trân trọng sự cố gắng của bản thân mỗi ngày.',
    snippet: 'Lời bài hát: “Tắt đi ánh đèn bàn học khuya, thả lỏng đôi vai mỏi mệt... Bạn đã làm rất tốt ngày hôm nay rồi...”',
    sunoPrompt: 'Gentle chill pop ballad, warm male vocals, soft piano and acoustic rhythm, 96 bpm, peaceful comforting lyrics, evening wind ambiance, stress relief, emotional warmth.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'pop-sunshine'
  },
  {
    id: 'suno-pop-4',
    title: 'Chạm Tới Ước Mơ',
    category: 'pop',
    categoryLabel: 'Dynamic Pop Động Lực',
    bpm: 110,
    duration: '3:05',
    coverGradient: 'from-purple-500 via-indigo-600 to-blue-600',
    artist: 'Self Study Sound × Suno AI',
    moodTags: ['#ĐộngLựcHọc', '#PopTruyềnCảmHứng', '#TựTin', '#110BPM'],
    emotionTarget: 'Khơi dậy quyết tâm trước kỳ thi quan trọng, tăng sự tự tin',
    description: 'Tiếng trống dồn dập vừa phải, điệp khúc bùng nổ đầy cảm xúc mang lại luồng sinh khí mới cho những bạn đang cần sự bứt phá.',
    snippet: 'Lời bài hát: “Đường dài phía trước dẫu còn nhiều thử thách, vững bước tiến lên chạm lấy ước mơ của chính mình!”',
    sunoPrompt: 'Dynamic uplifting pop, inspiring melody, passionate vocals, energetic drums and electric guitar touches, 110 bpm, motivational theme for students, triumphant chorus.',
    sunoUrl: 'https://suno.com/@studymusiccommunity',
    audioKey: 'pop-energy'
  }
];
