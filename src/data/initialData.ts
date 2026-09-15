import { 
  SoundEnvironment, 
  MusicArticle, 
  PlaylistRecommendation, 
  SoundPad, 
  QuizQuestion, 
  JournalDay, 
  MailboxMessage,
  ResearchTeamMember 
} from '../types';

export const SOUND_ENVIRONMENTS: SoundEnvironment[] = [
  {
    id: 'silence',
    name: 'Im lặng hoàn toàn',
    bpmRange: '0 BPM',
    tag: 'Tập trung sâu',
    description: 'Phù hợp khi cần tư duy logic cao, giải toán khó, học thuộc lòng hoặc đọc hiểu văn bản phức tạp.',
    fullDetail: 'Khi não bộ cần huy động tối đa dung lượng bộ nhớ làm việc (Working Memory), mọi tác nhân âm thanh có thể tạo ra tải nhận thức phụ. Không gian im lặng giúp vỏ não tiền trán (Prefrontal Cortex) duy trì sự chú ý bền vững.',
    benefits: [
      'Giảm thiểu tối đa xao nhãng giác quan',
      'Tối ưu hóa khả năng giải các bài toán phức tạp',
      'Ghi nhớ từ vựng và khái niệm trừu tượng nhanh hơn'
    ],
    suitableSubjects: ['Toán học (Đại số & Hình học)', 'Vật lý nâng cao', 'Ngữ văn (Phân tích tác phẩm)', 'Hóa học'],
    sampleTracksCount: 0
  },
  {
    id: 'lofi-ambient',
    name: 'Lo-fi không lời',
    bpmRange: '70 – 85 BPM',
    tag: 'Giảm căng thẳng, tăng tập trung',
    description: 'Tần số nhịp đập đồng bộ với nhịp tim lúc nghỉ ngơi, tạo sóng não Alpha (8-12 Hz) giúp tinh thần thư thái và bền bỉ.',
    fullDetail: 'Nhịp điệu đều đặn từ 70-85 BPM hoạt động như một màng lọc âm thanh (Sound Masking), che lấp những tiếng ồn bất chợt xung quanh. Do không chứa lời hát, não bộ không bị phân tán để xử lý ngôn ngữ.',
    benefits: [
      'Kích hoạt trạng thái dòng chảy (Flow State)',
      'Hạ hormone Cortisol giúp giảm lo âu trước kỳ thi',
      'Duy trì sự tỉnh táo mà không gây kích động quá mức'
    ],
    suitableSubjects: ['Làm bài tập trắc nghiệm', 'Vẽ sơ đồ tư duy (Mindmap)', 'Luyện đề thi tổng hợp', 'Đọc tài liệu tổng quan'],
    sampleTracksCount: 50
  },
  {
    id: 'pop-upbeat',
    name: 'Pop / Nhạc có lời',
    bpmRange: '110 – 130 BPM',
    tag: 'Tăng năng lượng, truyền cảm hứng',
    description: 'Kích thích giải phóng Dopamine, giúp phấn chấn khi làm các công việc đơn giản, chép bài hoặc dọn góc học tập.',
    fullDetail: 'Các giai điệu tiết tấu nhanh thúc đẩy hệ thần kinh giao cảm, đẩy lùi cảm giác buồn ngủ và mệt mỏi. Tuy nhiên, lời bài hát có thể cạnh tranh tài nguyên ngữ nghĩa nếu học các môn cần đọc hiểu sâu.',
    benefits: [
      'Xua tan cơn buồn ngủ và uể oải buổi chiều',
      'Tăng tốc độ thao tác tay (chép bài, sắp xếp tài liệu)',
      'Tạo cảm xúc phấn chấn, yêu đời và tích cực'
    ],
    suitableSubjects: ['Chép bài tập & vở sạch chữ đẹp', 'Chuẩn bị đồ dùng học tập', 'Thực hành Tin học cơ bản', 'Giải lao giữa các tiết'],
    sampleTracksCount: 35
  }
];

export const MUSIC_ARTICLES: MusicArticle[] = [
  {
    id: 'art-1',
    title: 'Âm nhạc nào phù hợp với môn học của bạn?',
    category: 'Khoa học nhận thức',
    readTime: '4 phút đọc',
    excerpt: 'Không phải bản nhạc nào cũng phù hợp với mọi môn. Hiểu rõ nguyên tắc phân bổ âm thanh sẽ giúp bạn nâng cao hiệu suất học tập rõ rệt.',
    content: [
      'Nhiều học sinh có thói quen vừa nghe bài hát yêu thích vừa giải toán hoặc viết văn. Tuy nhiên, theo các nghiên cứu về tâm lý học nhận thức, não bộ của chúng ta có vùng Wernicke và Broca phụ trách giải mã ngôn ngữ.',
      'Khi bạn nghe bài hát có lời tiếng Việt hoặc tiếng Anh quen thuộc, não sẽ tự động tách lời hát ra để phân tích, chiếm dụng tới 30-40% tài nguyên bộ nhớ làm việc. Do đó, đối với các môn cần tính toán logic hoặc đọc hiểu sâu (như Toán, Lý, Văn), nhạc không lời hoặc không gian im lặng là lựa chọn số 1.',
      'Ngược lại, khi bạn cần ghi chép nhanh, vẽ đồ họa, hoặc làm việc lặp lại, những bản nhạc Lo-fi hoặc Baroque nhịp điệu 60-80 BPM lại giúp duy trì sự chú ý bền bỉ và xua tan áp lực.'
    ],
    keyAdvice: [
      'Môn tính toán & học thuộc: Chọn Im lặng hoặc Lo-fi / Classical không lời.',
      'Môn sáng tạo & ghi chép: Chọn Ambient, tiếng mưa, tiếng sóng hoặc Chillhop 75-80 BPM.',
      'Khi buồn ngủ / khởi động: Nghe 1-2 bài Upbeat 110-120 BPM trong 5 phút để kích hoạt năng lượng rồi chuyển về nhạc nền nhẹ.'
    ],
    author: 'Nhóm Nghiên cứu Giáo dục & Âm nhạc',
    date: '12/09/2026'
  },
  {
    id: 'art-2',
    title: 'Mẹo nghe nhạc khi học hiệu quả không gây nghiện tai nghe',
    category: 'Thói quen học tập',
    readTime: '3 phút đọc',
    excerpt: 'Nghe nhạc đúng cách: Âm lượng an toàn 60/60, chọn tai nghe phù hợp và phân chia quãng nghỉ để bảo vệ thính lực tuổi học trò.',
    content: [
      'Nguyên tắc 60/60 từ Tổ chức Y tế Thế giới (WHO): Chỉ nên nghe ở mức âm lượng không quá 60% công suất tối đa của thiết bị, và không nghe liên tục quá 60 phút mà không tháo tai nghe để tai được nghỉ.',
      'Sử dụng phương pháp Pomodoro kết hợp âm nhạc: Nghe nhạc học tập trong 25 phút tập trung, sau đó tắt nhạc trong 5 phút giải lao và vận động nhẹ để não hồi phục.',
      'Ưu tiên loa ngoài ở mức nhỏ nếu bạn học tại phòng riêng yên tĩnh, hạn chế đeo tai nghe nhét trong (in-ear) quá chặt trong nhiều giờ liên tục.'
    ],
    keyAdvice: [
      'Áp dụng quy tắc 60/60: Âm lượng dưới 60%, tối đa 60 phút mỗi phiên.',
      'Đặt danh sách phát sẵn (Playlist chuẩn bị trước), không chuyển bài liên tục gây xao nhãng.',
      'Nếu sau 15 phút nghe nhạc vẫn không vào bài, hãy tắt nhạc và thử học trong yên lặng.'
    ],
    author: 'ThS. Nguyễn Văn Bình & Nhóm Self Study Sound',
    date: '10/09/2026'
  },
  {
    id: 'art-3',
    title: 'Nguyên tắc chọn âm thanh theo nhiệm vụ học tập THPT',
    category: 'Phương pháp học tập',
    readTime: '5 phút đọc',
    excerpt: 'Hướng dẫn cụ thể cho học sinh lớp 10, 11, 12 xây dựng chiến lược âm thanh theo từng giai đoạn ôn tập và thi cử.',
    content: [
      'Giai đoạn chuẩn bị (Khởi động): Não thường có xu hướng trì hoãn. Một bản nhạc năng động nhẹ nhàng trong 3 phút giúp đẩy dopamine và tạo đà bắt đầu.',
      'Giai đoạn học sâu (Deep Learning - 40 đến 60 phút): Chuyển sang Lo-fi đều nhịp hoặc tiếng ồn trắng (White Noise), tiếng mưa để cô lập tạp âm xung quanh.',
      'Giai đoạn tổng kết: Nhìn lại các câu hỏi đã làm và ghi chép nhật ký học tập trong trạng thái thư giãn với tiếng đàn Piano êm dịu.'
    ],
    keyAdvice: [
      'Giai đoạn khởi động: 3-5 phút nhạc hứng khởi để lấy động lực.',
      'Giai đoạn trọng tâm: Nhạc nền đều đặn, không có tiết tấu đột ngột.',
      'Giai đoạn thư giãn sau học: Tiếng thiên nhiên (rừng cây, sóng biển).'
    ],
    author: 'Ban Cố vấn Tâm lý Học đường',
    date: '08/09/2026'
  }
];

export const PLAYLIST_PREVIEWS: PlaylistRecommendation[] = [
  {
    id: 'pl-lofi',
    title: 'Lo-fi Focus Study',
    bpmInfo: '70 – 85 BPM',
    trackCount: 50,
    tags: ['Tập trung', 'Không lời', 'Êm dịu'],
    description: 'Tuyển tập giai điệu Lo-fi êm dịu, không chứa lời hát, chuẩn nhịp tim thư thái 75 BPM.'
  },
  {
    id: 'pl-piano',
    title: 'Piano for Deep Study',
    bpmInfo: 'Nhẹ nhàng • 60 – 75 BPM',
    trackCount: 40,
    tags: ['Piano', 'Cổ điển nhẹ', 'Thư thái'],
    description: 'Những bản nhạc dương cầm ấm áp, du dương giúp cân bằng cảm xúc và tăng khả năng tiếp thu.'
  },
  {
    id: 'pl-deepwork',
    title: 'Deep Work & Alpha Waves',
    bpmInfo: 'Sóng Alpha • 80 BPM',
    trackCount: 30,
    tags: ['Sóng não', 'Chống ồn', 'Tập trung cao độ'],
    description: 'Âm thanh nền phối trộn tiếng mưa rào nhẹ và sóng não Alpha, hỗ trợ ôn luyện đề thi áp lực cao.'
  },
  {
    id: 'pl-nature',
    title: 'Forest & Rain Calm',
    bpmInfo: 'Thiên nhiên hữu cơ',
    trackCount: 25,
    tags: ['Tiếng mưa', 'Rừng cây', 'Giảm stress'],
    description: 'Âm thanh thiên nhiên tự nhiên giúp hạ nhịp tim, xua tan căng thẳng sau giờ kiểm tra.'
  }
];

export const SOUND_PADS: SoundPad[] = [
  { id: 'piano', name: 'Piano', soundType: 'piano', color: 'bg-rose-500', iconName: 'Piano', description: 'Nốt phím dương cầm êm ái' },
  { id: 'rain', name: 'Mưa rơi', soundType: 'rain', color: 'bg-indigo-500', iconName: 'CloudRain', description: 'Tiếng mưa rơi rào nhẹ' },
  { id: 'chill', name: 'Chill', soundType: 'chill', color: 'bg-teal-500', iconName: 'Sparkles', description: 'Giai điệu thư giãn nhẹ bẫng' },
  { id: 'forest', name: 'Rừng cây', soundType: 'forest', color: 'bg-emerald-600', iconName: 'Trees', description: 'Tiếng gió rừng & chim hót' },
  { id: 'cafe', name: 'Café', soundType: 'cafe', color: 'bg-amber-600', iconName: 'Coffee', description: 'Không gian quán học bài' },
  { id: 'ocean', name: 'Sóng biển', soundType: 'ocean', color: 'bg-cyan-600', iconName: 'Waves', description: 'Sóng biển êm đềm' },
  { id: 'firework', name: 'Chuông gió', soundType: 'firework', color: 'bg-pink-500', iconName: 'Bell', description: 'Tiếng chuông thanh thản' },
  { id: 'lofi', name: 'Lofi Beat', soundType: 'lofi', color: 'bg-violet-600', iconName: 'Music', description: 'Hợp âm Lofi ấm áp' },
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    question: 'Theo khoa học nhận thức, vì sao nên hạn chế nghe nhạc có lời quen thuộc khi học môn Toán hoặc giải bài tập logic?',
    options: [
      'Vì nhạc có lời quá buồn làm mất tinh thần',
      'Vì não bộ tự động chia sẻ tài nguyên vùng ngôn ngữ để giải mã lời bài hát, làm giảm bộ nhớ làm việc',
      'Vì nhạc có lời luôn có âm lượng lớn hơn nhạc không lời',
      'Vì âm nhạc không có tác động gì đến vỏ não'
    ],
    correctIndex: 1,
    explanation: 'Chính xác! Lời bài hát kích hoạt vùng Wernicke và Broca ở vỏ não, cạnh tranh với khả năng xử lý bài toán, khiến não nhanh mệt và dễ tính toán sai.'
  },
  {
    id: 'q-2',
    question: 'Dải nhịp độ (BPM - Beats Per Minute) nào được xem là tối ưu nhất cho trạng thái thư giãn và tập trung bền bỉ (Alpha state)?',
    options: [
      '30 – 45 BPM (Quá chậm gây buồn ngủ sâu)',
      '70 – 85 BPM (Đồng bộ với nhịp tim trạng thái nghỉ)',
      '140 – 160 BPM (Nhịp nhạc sàn kích động mạnh)',
      '200 BPM trở lên'
    ],
    correctIndex: 1,
    explanation: 'Tuyệt vời! Nhịp 70-85 BPM tương ứng nhịp tim thư thái của con người, giúp ổn định sóng não Alpha (8-12 Hz) hỗ trợ ghi nhớ tối đa.'
  },
  {
    id: 'q-3',
    question: 'Quy tắc "60/60" của Tổ chức Y tế Thế giới (WHO) khi sử dụng tai nghe học tập có ý nghĩa gì?',
    options: [
      'Nghe 60 bài hát trong 60 ngày',
      'Âm lượng tối đa 60% và không nghe liên tục quá 60 phút mỗi lần',
      'Giá tai nghe tối thiểu 60 USD và nghe ở tuổi 60',
      'Mỗi ngày nghe đúng 60 phút bất kể âm lượng'
    ],
    correctIndex: 1,
    explanation: 'Rất chính xác! Quy tắc 60/60 giúp bảo vệ các tế bào lông ốc tai khỏi thoái hóa sớm và suy giảm thính lực tuổi học đường.'
  },
  {
    id: 'q-4',
    question: 'Trong tình huống nào thì âm thanh "Im lặng hoàn toàn" là lựa chọn tốt nhất?',
    options: [
      'Khi đang dọn bàn học hoặc sắp xếp sách vở',
      'Khi cần tư duy trừu tượng cao độ, học thuộc lòng hoặc giải đề thi thử bấm giờ',
      'Khi cảm thấy quá buồn ngủ muốn có năng lượng',
      'Khi đang tập thể dục buổi sáng'
    ],
    correctIndex: 1,
    explanation: 'Đúng rồi! Khi làm bài thi thử áp lực thời gian hoặc tư duy chuyên sâu, im lặng loại bỏ mọi xung động giác quan phụ, giúp bộ não tập trung toàn lực.'
  }
];

export const INITIAL_JOURNAL_DAYS: JournalDay[] = Array.from({ length: 21 }, (_, i) => {
  const day = i + 1;
  if (day <= 14) {
    return {
      day,
      dateStr: `Ngày ${day}/21`,
      status: 'completed',
      studyDurationMinutes: 45 + (day % 4) * 15,
      subject: day % 3 === 0 ? 'Toán Giải tích' : day % 3 === 1 ? 'Tiếng Anh' : 'Vật lý & Hóa',
      soundEnv: day % 2 === 0 ? 'Lo-fi không lời 75 BPM' : 'Im lặng hoàn toàn',
      focusScore: 4 + (day % 2),
      stressLevel: Math.max(1, 4 - Math.floor(day / 4)),
      note: day === 14 ? 'Đạt cột mốc 14 ngày! Cảm thấy vào bàn học tự giác hơn, không còn lướt điện thoại vô thức.' : 'Học tập đúng tiến độ, nghe Lo-fi giúp giảm lo lắng rõ rệt.'
    };
  } else if (day === 15) {
    return {
      day,
      dateStr: `Ngày 15/21 (Hôm nay)`,
      status: 'current',
      studyDurationMinutes: 50,
      subject: 'Ôn tập kiểm tra 1 tiết',
      soundEnv: 'Lo-fi Focus 75 BPM',
      focusScore: 4,
      stressLevel: 2,
      note: 'Chuẩn bị cho phiên học hôm nay cùng playlist Lo-fi đề xuất!'
    };
  } else {
    return {
      day,
      dateStr: `Ngày ${day}/21`,
      status: 'upcoming',
      studyDurationMinutes: 0,
      subject: 'Chưa có dữ liệu',
      soundEnv: 'Chưa chọn',
      focusScore: 0,
      stressLevel: 0,
      note: 'Dự kiến hoàn thành trong các ngày tiếp theo'
    };
  }
});

export const INITIAL_MAILBOX_MESSAGES: MailboxMessage[] = [
  {
    id: 'mail-1',
    title: 'Em hay bị phân tâm khi nghe nhạc có lời, nhóm có thể giải thích thêm không ạ?',
    content: 'Chào ban quản trị. Em học lớp 11, mỗi lần học bài em hay bật nhạc K-pop hoặc V-pop em thích, nhưng nghe một hồi em lại hát theo và quên mất bài tập. Có phải em không hợp nghe nhạc khi học không ạ?',
    senderName: 'Minh Anh',
    senderGrade: 'Lớp 11 - THPT',
    createdAt: '11/09/2026',
    status: 'answered',
    replyContent: 'Chào Minh Anh! Câu hỏi của em rất thú vị và cũng là tình trạng của rất nhiều bạn. Khi em nghe bài hát có lời (nhất là bài hát em yêu thích), não bộ sẽ tiết ra Dopamine tạo hưng phấn, nhưng đồng thời vùng xử lý ngôn ngữ sẽ tự động bắt lấy lời ca để hát theo. Đây là phản xạ tự nhiên của não bộ, không phải do em không hợp nghe nhạc. Lời khuyên: Hãy thử đổi sang thể loại Lo-fi hoặc Piano không lời (khoảng 70-85 BPM) trong 25 phút học tập. Sau khi hoàn thành mục tiêu, em có thể tự thưởng cho mình 1-2 bài hát K-pop yêu thích để giải lao nhé!',
    repliedAt: '12/09/2026',
    repliedBy: 'Ban cố vấn Self Study Sound',
    isIllustration: true
  },
  {
    id: 'mail-2',
    title: 'Gợi ý thêm âm thanh tiếng mưa rơi kết hợp với guitar mộc',
    content: 'Em thấy tính năng Soundboard rất hay, em rất thích nghe tiếng mưa rơi nhẹ kết hợp với tiếng đàn. Ban quản trị có thể bổ sung thêm nhiều biến thể âm thanh tiếng mưa ở góc học tập được không ạ?',
    senderName: 'Quốc Bảo',
    senderGrade: 'Lớp 12',
    createdAt: '12/09/2026',
    status: 'answered',
    replyContent: 'Cảm ơn Quốc Bảo đã đóng góp ý kiến! Tiếng mưa rơi là một dạng tiếng ồn hồng (Pink Noise) có tác dụng xoa dịu rất tốt. Hệ thống đã cập nhật thêm nút Mưa rơi cùng đàn Piano vào soundboard thử nghiệm. Chúc em ôn thi lớp 12 thật tốt!',
    repliedAt: '13/09/2026',
    repliedBy: 'Ban quản trị Self Study Sound',
    isIllustration: true
  },
  {
    id: 'mail-3',
    title: 'Làm sao để biết khi nào em nên chọn im lặng thay vì nghe nhạc?',
    content: 'Em chuẩn bị thi học sinh giỏi môn Toán. Em băn khoăn những lúc giải bài khó thì có nên bật nhạc thật nhỏ không hay nên tắt hẳn?',
    senderName: 'Khánh Linh',
    senderGrade: 'Lớp 10',
    createdAt: '13/09/2026',
    status: 'pending',
    isIllustration: false
  }
];

export const RESEARCH_TEAM: ResearchTeamMember[] = [
  {
    name: 'Phạm Đình Minh Tiến',
    role: 'Phát triển Nền tảng & Điều phối nội dung',
    institution: 'Dự án Âm thanh Học đường Self Study Sound',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Sáng kiến xây dựng không gian âm thanh lành mạnh, số hóa âm thanh học tập cho học sinh phổ thông.'
  },
  {
    name: 'Cô Lê Hoàng Yến',
    role: 'Phụ trách Hộp thư lắng nghe & Cố vấn tâm lý',
    institution: 'Ban Cố vấn Học đường',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Đồng hành, giải đáp thắc mắc và hỗ trợ học sinh thiết lập môi trường âm thanh lành mạnh, không gây lệ thuộc.'
  },
  {
    name: 'Trần Đình Khôi',
    role: 'Phát triển Kỹ thuật & Trải nghiệm Âm thanh',
    institution: 'Ban Kỹ thuật Self Study Sound',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Thiết kế các mô đun tổng hợp âm thanh web, thuật toán gợi ý môi trường âm thanh và hệ thống nhật ký học tập.'
  }
];
