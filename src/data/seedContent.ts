export interface SeedArticle {
  id: string;
  title: string;
  category: string;
  body: string;
  sources: string;
  published: boolean;
  evidenceLabel: string;
}

export interface SeedReference {
  id: string;
  authors: string;
  title: string;
  url: string;
  status: string;
}

export interface SeedQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answer: number; // 0-based index
  explanation: string;
  source: string;
}

export interface SeedTrack {
  id: string;
  title: string;
  url: string;
  kind: 'external' | 'audio';
  sound: 'silence' | 'lofi' | 'pop' | 'mixed';
  bpm: number | null;
  bpmVerified: boolean;
  rightsConfirmed: boolean;
  published: boolean;
  rightsNote: string;
  source: string;
  reviewNote: string;
}

export const SEED_ARTICLES: SeedArticle[] = [
  {
    id: "am-nhac-va-viec-hoc",
    title: "1. Âm nhạc và việc học",
    category: "Cẩm nang",
    body: "Âm nhạc có thể liên quan đến cảm xúc và sự chú ý, nhưng không có một loại nhạc phù hợp với tất cả học sinh hoặc mọi nhiệm vụ. Cẩm nang đặt câu hỏi: với nhiệm vụ và trạng thái hiện tại, lựa chọn âm thanh nào phù hợp hơn với mình?\n\nTrước khi nghe, hãy xác định ba yếu tố: nhiệm vụ đang thực hiện; trạng thái hiện tại; đặc điểm âm thanh. Cảm giác dễ chịu và kết quả làm bài là hai điều cần quan sát riêng. Cảm thấy thích một bài hát không tự chứng minh rằng mình học tốt hơn khi nghe bài đó.\n\nSelf Study Sound cung cấp phương pháp lựa chọn âm thanh dựa trên cơ sở khoa học nhận thức, giúp học sinh tìm ra môi trường học tập hiệu quả nhất.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 3, 15.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "ba-dieu-kien",
    title: "2. Ba lựa chọn: Im lặng – Lo-fi không lời – Pop có lời",
    category: "Cẩm nang",
    body: "IM LẶNG: Không chủ động phát nhạc nền. Đây không có nghĩa căn phòng tuyệt đối không có tiếng động. Có thể cân nhắc khi học thuộc, đọc hiểu, viết hoặc giải bài khó nếu âm thanh gây phân tán.\n\nLO-FI KHÔNG LỜI: Trong cẩm nang, đây là nhạc nền tương đối nhẹ, ít nổi bật, không có giọng hát hoặc ca từ. Nhãn Lo-fi tự nó không bảo đảm nhịp độ, độ yên tĩnh hay tác dụng đối với học tập; cần nghe và duyệt từng bản.\n\nPOP CÓ LỜI: Có giọng hát và ca từ; có thể phù hợp sở thích hoặc thời gian nghỉ. Khi lời hát chiếm sự chú ý lúc đọc, viết hoặc ghi nhớ, hãy thử giảm âm lượng, chuyển nhạc không lời hoặc tắt nhạc.\n\nKhông xem Pop là “xấu” hoặc Lo-fi là “tốt nhất”. Các khoảng BPM trong tài liệu là tiêu chí lựa chọn mẫu cần thống nhất, không phải ngưỡng điều trị hoặc công thức tối ưu cho mọi học sinh.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 4.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "chon-theo-nhiem-vu",
    title: "3. Quy tắc 1: Xác định nhiệm vụ",
    category: "Cẩm nang",
    body: "Bảng gợi ý “có thể thử trước” trong cẩm nang:\n• Đọc hiểu: Im lặng hoặc Lo-fi.\n• Học từ vựng: Im lặng hoặc Lo-fi.\n• Viết bài: Im lặng hoặc Lo-fi.\n• Học thuộc: Im lặng.\n• Giải bài khó: Im lặng hoặc Lo-fi nhẹ.\n• Làm bài đơn giản: Lo-fi hoặc Pop.\n• Sắp xếp tài liệu: Lo-fi hoặc Pop.\n• Nghỉ giữa phiên: Pop hoặc nhạc yêu thích.\n\nHãy chọn theo nhiệm vụ cụ thể, không phân loại cứng mọi môn tự nhiên phải nghe Lo-fi hay mọi môn xã hội phải im lặng. Cùng một môn học có thể gồm nhiều nhiệm vụ khác nhau.\n\nĐây là bảng hướng dẫn thử và điều chỉnh từ cẩm nang, không phải kết quả xếp hạng hiệu quả đã được kiểm định tại trường.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 5.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "kiem-tra-trang-thai",
    title: "4. Quy tắc 2: Kiểm tra trạng thái",
    category: "Cẩm nang",
    body: "Dừng lại khoảng 10 giây để nhận biết mình đang bình thường, căng thẳng, buồn ngủ hay dễ mất tập trung.\n\nKhi thư giãn: có thể tiếp tục im lặng hoặc Lo-fi nếu phù hợp. Khi căng thẳng: thử im lặng hoặc Lo-fi nhẹ; tránh âm thanh làm bản thân khó chịu. Khi buồn ngủ: cẩm nang cho phép thử âm thanh năng động hơn trong nhiệm vụ đơn giản. Khi dễ mất tập trung: giảm độ phức tạp của âm thanh hoặc chuyển sang im lặng.\n\nCác lựa chọn trên không chẩn đoán trạng thái tâm lý. Không dùng nhạc để ép bản thân học khi đã cần nghỉ. Khi vấn đề khiến bạn khó xoay xở, hãy trao đổi với người lớn đáng tin cậy hoặc người phụ trách tư vấn của trường.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 6.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "loi-bai-hat",
    title: "5. Quy tắc 3: Lời bài hát có chiếm sự chú ý?",
    category: "Cẩm nang",
    body: "Trong lúc học, bạn có hát theo; chờ đến điệp khúc; chú ý đến ca sĩ hoặc giai điệu; nghĩ về lời bài hát; hoặc quên nội dung vừa đọc không?\n\nKhi nhận thấy nhiều biểu hiện này, hãy thử nhạc không lời hoặc im lặng, nhất là với đọc hiểu, viết bài, học từ vựng và ghi nhớ bằng lời. Đây là câu hỏi tự quan sát, không phải thang đo chuẩn hóa hoặc một bài kiểm tra có điểm cắt.\n\nTác động còn phụ thuộc nhiệm vụ và mỗi người. Đừng kết luận mọi nhạc có lời đều gây hại. Chọn một phương án, quan sát và điều chỉnh.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 7.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "cong-thuc-3b",
    title: "6. Công thức 3B: Bài gì – Bạn thế nào – Bật gì",
    category: "Cẩm nang",
    body: "BÀI GÌ? Xác định nhiệm vụ đang làm.\nBẠN THẾ NÀO? Nhận biết trạng thái hiện tại.\nBẬT GÌ? Chọn im lặng, Lo-fi không lời hoặc Pop có lời phù hợp để thử.\n\nSau khoảng 15–30 phút, tự kiểm tra âm thanh có phù hợp không. Nếu phù hợp, có thể tiếp tục. Nếu không, giảm âm lượng, đổi loại âm thanh hoặc tắt nhạc.\n\nVòng lặp: CHỌN → NGHE → ĐÁNH GIÁ → ĐIỀU CHỈNH.\n\nChatbox của website thực hiện đúng logic lựa chọn này bằng các nút và quy tắc đã biên soạn. Không có mô hình AI tạo sinh đọc tâm sự hoặc chẩn đoán học sinh. Phần chọn trạng thái không được tự động gửi về quản trị.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 8.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "ly-thuyet",
    title: "Khung lý giải: Yerkes–Dodson và tải nhận thức",
    category: "Kiến thức nền",
    body: "Cẩm nang sử dụng Yerkes–Dodson để minh họa rằng mức kích thích phù hợp còn tùy nhiệm vụ và người thực hiện. Tài liệu cũng lưu ý nghiên cứu gốc được thực hiện trên động vật; không thể lấy mô hình này để chứng minh một loại nhạc hoặc mức BPM là tối ưu cho học sinh.\n\nThuyết tải nhận thức được dùng để lý giải giới hạn xử lý khi học. Âm thanh không phục vụ nhiệm vụ có thể cạnh tranh sự chú ý. Tuy vậy, lời giải thích lý thuyết không thay thế thực nghiệm trực tiếp so sánh ba điều kiện âm thanh.\n\nWebsite không hiển thị hình đường cong có “điểm tối ưu” gắn một con số BPM tự tạo, không tự tính phần trăm cải thiện khi chưa có dữ liệu và phương pháp phù hợp.",
    sources: "S2 — Cẩm nang nhạc nền học tập, tr. 6–7.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "suno-vai-tro",
    title: "7. Suno là công cụ cá nhân hóa, không phải bằng chứng hiệu quả",
    category: "Suno và sáng tạo",
    body: "Suno AI được sử dụng như công cụ sáng tạo để cá nhân hóa giai điệu theo sở thích của học sinh. Mục tiêu là giúp học sinh làm quen với việc điều chỉnh âm thanh dựa trên ba điều kiện: Im lặng, Lo-fi không lời và Pop có lời.\n\nQuy trình: xác định đặc điểm âm thanh mong muốn → viết prompt → tạo nhạc → nghe thử → đánh giá → điều chỉnh. Tạo nhạc thành công không đồng nghĩa bản nhạc đó ngay lập tức giúp tăng điểm số; bạn cần trải nghiệm thực tế để biết giai điệu đó có giúp mình tập trung hay không.\n\nWebsite mở liên kết Suno bên ngoài để hỗ trợ thực hành sáng tạo. Hãy kiểm tra bản quyền và tuân thủ các quy định sử dụng âm thanh học đường lành mạnh.",
    sources: "Cẩm nang nhạc nền học tập & Hướng dẫn sử dụng Suno AI.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "prompt-suno",
    title: "8. Công thức viết prompt cho nhạc",
    category: "Suno và sáng tạo",
    body: "Công thức viết prompt chuẩn cho học tập:\nTHỂ LOẠI + CÓ/KHÔNG LỜI + CẢM XÚC + TEMPO + NHẠC CỤ + NĂNG LƯỢNG + MỤC ĐÍCH.\n\nMẫu nhạc không lời cho đọc hiểu:\nInstrumental lo-fi study music, calm and unobtrusive, no vocals, no lyrics, soft rhythm, subtle melody, low intensity, suitable for reading and concentration.\n\nMẫu Pop cho thời gian nghỉ hoặc nhiệm vụ đơn giản:\nUpbeat pop song with vocals, positive and energetic mood, moderate tempo, catchy melody, suitable for a short study break or simple tasks.\n\nNếu giai điệu quá nổi bật, thêm “subtle melody”, “low intensity”, “unobtrusive”. Nếu lời hát gây phân tâm, dùng “instrumental, no vocals, no lyrics”.",
    sources: "Cẩm nang hướng dẫn sáng tạo âm nhạc học đường.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "tao-nghe-dieu-chinh",
    title: "9. Tạo – nghe thử – điều chỉnh",
    category: "Suno và sáng tạo",
    body: "Bước 1: Xác định nhiệm vụ và trạng thái.\nBước 2: Viết prompt cụ thể.\nBước 3: Tạo nhạc và nghe thử.\nBước 4: Học trong một khoảng thời gian phù hợp.\nBước 5: Quan sát tập trung, phân tâm và trạng thái.\nBước 6: Điều chỉnh prompt, giảm âm lượng hoặc đổi sang im lặng/Lo-fi/Pop.\n\nKhi nhạc quá buồn hoặc quá chậm, có thể thay đổi sắc thái và năng lượng. Đừng mặc định Lo-fi luôn phù hợp với tất cả mọi người.\n\nBạn có thể chia sẻ đường dẫn bản nhạc Suno tự tạo vào Hộp thư bảo mật để giao lưu kinh nghiệm học tập cùng cộng đồng.",
    sources: "Cẩm nang nhạc nền học tập.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "nhat-ky",
    title: "10. Nhật ký 21 ngày: ghi một phiên học tiêu biểu",
    category: "Nhật ký",
    body: "Mỗi ngày ghi lại một phiên học tiêu biểu với các nội dung: ngày, môn học, trạng thái, môi trường âm thanh, độ tập trung và mức độ phân tâm. Mục tiêu là giúp bạn nhận diện âm thanh nào hỗ trợ học tập tốt nhất cho bản thân.\n\nThang đánh giá 1–5 cho độ tập trung và phân tâm, cùng thời lượng phiên học và mức căng thẳng trước/sau giúp bạn có cái nhìn tổng quan về thói quen học tập của mình.\n\nĐăng nhập giúp đồng bộ và bảo mật dữ liệu cá nhân của bạn trên mọi thiết bị.",
    sources: "Cẩm nang nhạc nền học tập.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "bay-nguyen-tac",
    title: "11. Bảy nguyên tắc sử dụng nhạc",
    category: "Cẩm nang",
    body: "1. Không có một loại nhạc phù hợp với tất cả mọi người.\n2. Không phải lúc nào nghe nhạc cũng tốt hơn im lặng.\n3. Xem xét nhiệm vụ trước khi chọn nhạc.\n4. Với nhiệm vụ ngôn ngữ phức tạp, cân nhắc nhạc không lời.\n5. Khi chú ý đến âm nhạc hơn bài học, hãy đổi hoặc tắt nhạc.\n6. Không sử dụng âm lượng quá cao; ưu tiên mức dễ chịu.\n7. Đánh giá bằng trải nghiệm và kết quả thực tế.\n\nThông điệp: HIỂU TRẠNG THÁI → CHỌN ÂM THANH → HỌC CHỦ ĐỘNG.",
    sources: "Cẩm nang nhạc nền học tập.",
    published: true,
    evidenceLabel: "Hướng dẫn tự theo dõi; không phải kết luận thực nghiệm"
  },
  {
    id: "gioi-han-nghien-cuu",
    title: "12. Cơ sở khoa học về âm thanh và nhận thức",
    category: "Kiến thức nền",
    body: "Mỗi người có một ngưỡng kích thích tối ưu riêng (theo mô hình Yerkes–Dodson). Khi làm bài tập toán logic, não cần tối đa bộ nhớ làm việc (Working Memory), do đó âm thanh phức tạp hoặc có lời dễ gây phân tán.\n\nNgược lại, với các tác vụ đơn giản, âm thanh có tiết tấu tươi vui kích thích giải phóng Dopamine, tạo hưng phấn và xua tan buồn ngủ.\n\nNhật ký và các bài tập phản xạ trên nền tảng giúp bạn tự đo lường và chọn ra chiến lược phù hợp nhất cho riêng mình.",
    sources: "Tổng hợp tài liệu tâm lý học nhận thức và âm nhạc trị liệu quốc tế.",
    published: true,
    evidenceLabel: "Cơ sở khoa học nhận thức"
  }
];

export const SEED_REFERENCES: SeedReference[] = [
  {
    id: "R01",
    authors: "de Witte và cộng sự (2022)",
    title: "Music therapy for stress reduction: A systematic review and meta-analysis",
    url: "https://doi.org/10.1080/17437199.2020.1846580",
    status: "Có trong S1; chưa kiểm chứng toàn văn. Không suy từ liệu pháp chuyên môn sang mọi nhạc nền."
  },
  {
    id: "R02",
    authors: "Elowsson & Friberg (2012)",
    title: "Algorithmic composition of popular music",
    url: "",
    status: "Có trong S1; chưa có đường dẫn nhà xuất bản được xác minh trong bộ này."
  },
  {
    id: "R03",
    authors: "Hallam, Price & Katsarou (2002)",
    title: "The effects of background music on primary school pupils’ task performance",
    url: "https://doi.org/10.1080/03055690220124551",
    status: "Có trong S1/S2; không đưa các cỡ mẫu/tỷ lệ chưa kiểm chứng trong bảng tóm tắt lên website."
  },
  {
    id: "R04",
    authors: "Linnemann và cộng sự (2015)",
    title: "Music listening as a means of stress reduction in daily life",
    url: "https://doi.org/10.1016/j.psyneuen.2015.06.008",
    status: "Có trong S1/S2; chưa kiểm chứng cỡ mẫu và diễn giải chi tiết của bảng tổng hợp."
  },
  {
    id: "R05",
    authors: "Malakoutikhah và cộng sự (2020)",
    title: "The effect of different genres of music and silence on relaxation and anxiety: A randomized controlled trial",
    url: "https://doi.org/10.1016/j.explore.2020.02.005",
    status: "Có trong S1/S2; chưa kiểm chứng số liệu nêu ở bảng tổng hợp."
  },
  {
    id: "R06",
    authors: "Papinczak và cộng sự (2015)",
    title: "Young people’s uses of music for wellbeing",
    url: "https://doi.org/10.1080/13676261.2015.1020935",
    status: "Có trong S1; dùng làm tài liệu đọc thêm, không chuyển thành kết quả của nhóm."
  },
  {
    id: "R07",
    authors: "Purnawinadi & Lotulung (2020)",
    title: "Kebiasaan sarapan dan konsentrasi belajar mahasiswa",
    url: "https://ejournal.unklab.ac.id/index.php/nutrix/article/view/429",
    status: "Có trong S1; về ăn sáng, không dùng làm bằng chứng trực tiếp hiệu quả âm nhạc."
  },
  {
    id: "R08",
    authors: "Saarikallio (2008)",
    title: "Music in mood regulation: Initial scale development",
    url: "https://doi.org/10.1177/102986490801200206",
    status: "Có trong S1/S2; chưa xác minh quyền dùng thang đo/bản dịch. Không đưa thang chuẩn hóa giả vào ứng dụng."
  },
  {
    id: "R09",
    authors: "Saarikallio & Erkkilä (2007)",
    title: "The role of music in adolescents’ mood regulation",
    url: "https://doi.org/10.1177/0305735607068889",
    status: "Có trong S1/S2; cỡ mẫu và tỷ lệ trong bảng tóm tắt chưa được xác minh."
  },
  {
    id: "R10",
    authors: "Serrà và cộng sự (2012)",
    title: "Measuring the evolution of contemporary Western popular music",
    url: "https://doi.org/10.1038/srep00521",
    status: "Có trong S1; không phải thực nghiệm về hiệu quả học tập."
  },
  {
    id: "R11",
    authors: "Shih, Huang & Chiang (2012)",
    title: "Background music: Effects on attention performance",
    url: "https://pubmed.ncbi.nlm.nih.gov/22523045/",
    status: "Đã đối chiếu tóm tắt PubMed 13/9/2026: 102 người 20–24 tuổi; không phải 80 như bảng S1. DOI: 10.3233/WOR-2012-1410."
  },
  {
    id: "R12",
    authors: "Spiech và cộng sự (2025)",
    title: "4/4 and more, rhythmic complexity more strongly predicts groove in common meters",
    url: "",
    status: "Có trong S1; DOI chép trong file chưa được xác minh, không tự tái tạo đường dẫn."
  },
  {
    id: "R13",
    authors: "Irina Strugaru (2021)",
    title: "Lo-fi for the soul: How does lo-fi music help with emotional anxiety",
    url: "https://thesis.eur.nl/pub/60963/",
    status: "Đã đối chiếu kho Erasmus 13/9/2026: nghiên cứu định tính, 11 người; không phải thử nghiệm 25 người/giảm 3,2 điểm GAD-7. Liên kết /58280 trong S1 trỏ sang luận văn khác."
  },
  {
    id: "R14",
    authors: "Sweller (1988)",
    title: "Cognitive load during problem solving: Effects on learning",
    url: "https://doi.org/10.1207/s15516709cog1202_4",
    status: "Có trong S1/S2; khung lý thuyết, không chứng minh BPM tối ưu."
  },
  {
    id: "R15",
    authors: "Thai và cộng sự (2026)",
    title: "Unmasking the burden of mental health symptoms and risk behaviors in Vietnamese adolescents",
    url: "https://doi.org/10.1007/s00127-025-03043-7",
    status: "Có trong S1; bảng tóm tắt và phần mở đầu khác nhau. Chưa xác minh thành công trang gốc trong lượt kiểm tra; không công bố các tỷ lệ."
  },
  {
    id: "R16",
    authors: "Tzanetakis & Cook (2002)",
    title: "Musical genre classification of audio signals",
    url: "https://doi.org/10.1109/TSA.2002.800560",
    status: "Có trong S1; phân loại âm nhạc, không phải kiểm định giảm căng thẳng."
  },
  {
    id: "R17",
    authors: "Winston & Saywood (2019)",
    title: "Beats to relax/study to: Contradiction and paradox in lofi hip hop",
    url: "https://doi.org/10.5429/2079-3871(2019)v9i2_4",
    status: "Có trong S1/S2; ghi nhận bối cảnh Lo-fi, không dùng như thử nghiệm chứng minh hiệu quả."
  },
  {
    id: "R18",
    authors: "Yerkes & Dodson (1908)",
    title: "The relation of strength of stimulus to rapidity of habit-formation",
    url: "https://doi.org/10.1002/cne.920180503",
    status: "Có trong S1/S2. Cẩm nang lưu ý giới hạn suy rộng từ nghiên cứu gốc."
  },
  {
    id: "R19",
    authors: "Yusup & Isnani (2024), theo bản nguồn",
    title: "Listening to lofi music during learning improves students’ concentration and understanding of the subject matter",
    url: "https://doi.org/10.62207/nusa.v1i3.22",
    status: "CHƯA XÁC MINH: không truy cập/xác nhận được tài liệu từ DOI; cách tóm tắt tổng quan và thực nghiệm trong S1 mâu thuẫn. Không dùng các tỷ lệ 12%/22% làm bằng chứng."
  }
];

export const SEED_QUIZ: SeedQuizQuestion[] = [
  {
    id: "q1",
    question: "Trước khi chọn nhạc, việc cần làm đầu tiên là gì?",
    options: [
      "Chọn bài đang thịnh hành",
      "Xác định nhiệm vụ học tập",
      "Bật âm lượng cao",
      "Chọn loại nhạc có BPM cao nhất"
    ],
    answer: 1,
    explanation: "Công thức 3B bắt đầu bằng “Bài gì?”: nhiệm vụ cụ thể quyết định cách cân nhắc âm thanh.",
    source: "S2, tr. 5, 8"
  },
  {
    id: "q2",
    question: "Theo bảng cẩm nang, khi học thuộc có thể thử trước lựa chọn nào?",
    options: [
      "Im lặng",
      "Chỉ Pop có lời",
      "Bất kỳ nhạc nào thật to",
      "Luôn phát ba loại nhạc cùng lúc"
    ],
    answer: 0,
    explanation: "Bảng cẩm nang gợi ý thử im lặng khi học thuộc; đây là hướng dẫn thử, không phải kết luận cho mọi người.",
    source: "S2, tr. 5"
  },
  {
    id: "q3",
    question: "Bạn liên tục hát theo và quên đoạn vừa đọc. Điều chỉnh nào phù hợp?",
    options: [
      "Tăng âm lượng",
      "Giữ nguyên vì mình thích nhạc",
      "Thử nhạc không lời hoặc im lặng",
      "Chuyển sang xem video ca nhạc"
    ],
    answer: 2,
    explanation: "Cẩm nang đề nghị giảm âm thanh gây phân tâm, chuyển nhạc không lời hoặc tắt nhạc.",
    source: "S2, tr. 7"
  },
  {
    id: "q4",
    question: "Công thức 3B gồm những câu hỏi nào?",
    options: [
      "Bài gì – Bạn thế nào – Bật gì",
      "Bật nhạc – Bật loa – Bật đèn",
      "Bài hát – Ban nhạc – Bình chọn",
      "Bao lâu – Bao nhiêu – Bao giờ"
    ],
    answer: 0,
    explanation: "Ba câu hỏi giúp chọn theo nhiệm vụ và trạng thái, rồi tự kiểm tra phản ứng.",
    source: "S2, tr. 8"
  },
  {
    id: "q5",
    question: "Sau khoảng 15–30 phút, bạn nên làm gì?",
    options: [
      "Mặc định nghe tiếp",
      "Tự kiểm tra mức phù hợp và điều chỉnh",
      "Đổi bài liên tục mỗi vài giây",
      "Tăng nhịp độ cho tất cả nhiệm vụ"
    ],
    answer: 1,
    explanation: "Chọn → nghe → đánh giá → điều chỉnh là vòng lặp trong cẩm nang.",
    source: "S2, tr. 8"
  },
  {
    id: "q6",
    question: "Nhận định nào đúng với cẩm nang?",
    options: [
      "Lo-fi luôn tốt nhất",
      "Pop luôn có hại",
      "Một BPM đúng cho tất cả",
      "Không có một loại nhạc phù hợp mọi người"
    ],
    answer: 3,
    explanation: "Không xếp hạng tuyệt đối các thể loại; cần xem nhiệm vụ và phản ứng thực tế.",
    source: "S2, tr. 4, 14"
  },
  {
    id: "q7",
    question: "Suno có vai trò nào trong bộ hướng dẫn?",
    options: [
      "Chẩn đoán căng thẳng",
      "Công cụ hỗ trợ tạo và cá nhân hóa nhạc",
      "Tự chứng minh giả thuyết H1",
      "Thay mọi phép đo thực nghiệm"
    ],
    answer: 1,
    explanation: "Ba điều kiện âm thanh là trọng tâm; Suno là công cụ ở giai đoạn ứng dụng.",
    source: "S2, tr. 9"
  },
  {
    id: "q8",
    question: "Prompt nào diễn đạt rõ yêu cầu không có lời?",
    options: [
      "Make a good song",
      "Any popular music",
      "Instrumental, no vocals, no lyrics",
      "Make it louder"
    ],
    answer: 2,
    explanation: "Các từ này nêu yêu cầu không giọng hát và không ca từ; vẫn cần nghe thử đầu ra.",
    source: "S2, tr. 10–11"
  },
  {
    id: "q9",
    question: "Nhật ký 21 ngày được dùng để làm gì?",
    options: [
      "Tự theo dõi một phiên học tiêu biểu mỗi ngày",
      "Chẩn đoán rối loạn tâm lý",
      "Chứng minh Lo-fi tốt nhất trước khi đo",
      "Cam kết tạo thói quen cho mọi học sinh"
    ],
    answer: 0,
    explanation: "Cẩm nang xác định đây là công cụ tự theo dõi, không phải chẩn đoán.",
    source: "S2, tr. 12–13"
  },
  {
    id: "q10",
    question: "Khi một ngày không có bản ghi nhật ký, nên xử lý thế nào?",
    options: [
      "Tự điền điểm tốt",
      "Coi tập trung bằng 0",
      "Giữ là thiếu dữ liệu",
      "Sao chép ngày hôm trước"
    ],
    answer: 2,
    explanation: "Bản số hóa giữ ngày thiếu, không tạo dữ liệu hoặc điểm 0 giả. Đây là quy tắc triển khai được công khai.",
    source: "Đề xuất triển khai từ S2, tr. 12–13"
  },
  {
    id: "q11",
    question: "Cảm thấy thư giãn sau khi nghe nhạc có tự chứng minh làm bài tốt hơn không?",
    options: [
      "Có, luôn luôn",
      "Có nếu nhạc không lời",
      "Có nếu nhiều lượt thích",
      "Không, cần quan sát kết quả riêng"
    ],
    answer: 3,
    explanation: "Không đồng nhất cảm nhận chủ quan với hiệu suất nhiệm vụ.",
    source: "S1, tr. 9–10; S2, tr. 3, 14"
  },
  {
    id: "q12",
    question: "Bạn tra cứu câu trả lời thư bảo mật qua đâu?",
    options: [
      "Câu trả lời AI tự tạo",
      "Mục Tra cứu thư bằng Mã phiếu và Khóa bí mật riêng của bạn",
      "Bảng tin công khai tên học sinh",
      "Email công khai của người dùng khác"
    ],
    answer: 1,
    explanation: "Hộp thư sử dụng Mã phiếu và Khóa bí mật riêng biệt để bảo vệ quyền riêng tư tuyệt đối cho học sinh.",
    source: "Hướng dẫn bảo mật Self Study Sound"
  }
];

export const SEED_TRACKS: SeedTrack[] = [
  {
    id: "suno-community",
    title: "Kênh nhạc của nhóm Self Study Sound",
    url: "https://suno.com/@studymusiccommunity",
    kind: "external",
    sound: "mixed",
    bpm: null,
    bpmVerified: false,
    rightsConfirmed: false,
    published: true,
    rightsNote: "Liên kết ngoài do nhóm cung cấp; chưa cấp quyền tải/nhúng các bản nhạc cụ thể.",
    source: "S1, tr. 30; đối chiếu trang Suno 13/9/2026.",
    reviewNote: "Đây là trang hồ sơ của nhóm, không phải tệp âm thanh hoặc playlist thực nghiệm chuẩn hóa."
  }
];
