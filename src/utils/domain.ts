/**
 * Domain rules and logic for Self Study Sound
 * Adheres strictly to the S2 Handbook & research specifications.
 */

export const BRAND = 'Self Study Sound';

export const SOUNDS: Record<string, string> = {
  silence: 'Im lặng',
  lofi: 'Lo-fi không lời',
  pop: 'Pop có lời'
};

export const TASKS: Record<string, string> = {
  reading: 'Đọc hiểu',
  vocabulary: 'Học từ vựng',
  writing: 'Viết bài',
  memory: 'Học thuộc',
  difficult: 'Giải bài khó',
  simple: 'Làm bài đơn giản',
  organize: 'Sắp xếp tài liệu',
  break: 'Nghỉ giữa phiên'
};

export const STATES: Record<string, string> = {
  calm: 'Thư giãn / bình thường',
  stressed: 'Căng thẳng',
  sleepy: 'Buồn ngủ',
  distracted: 'Dễ mất tập trung'
};

export const TASK_CHOICES: Record<string, string[]> = {
  reading: ['silence', 'lofi'],
  vocabulary: ['silence', 'lofi'],
  writing: ['silence', 'lofi'],
  memory: ['silence'],
  difficult: ['silence', 'lofi'],
  simple: ['lofi', 'pop'],
  organize: ['lofi', 'pop'],
  break: ['pop', 'lofi', 'silence']
};

export interface RecommendationResult {
  choices: string[];
  reason: string;
  review: string;
  source: string;
  basis: string;
  ruleVersion: string;
}

export function recommend({
  task,
  state,
  lyricsDistract = false
}: {
  task: string;
  state: string;
  lyricsDistract?: boolean;
}): RecommendationResult {
  if (!TASKS[task] || !STATES[state]) {
    throw new Error('Vui lòng chọn đầy đủ nhiệm vụ học tập và trạng thái hiện tại.');
  }

  let choices = [...(TASK_CHOICES[task] || ['silence', 'lofi'])];
  let reason = 'Đây là lựa chọn có thể thử trong cẩm nang, không phải kết luận loại nhạc nào tốt nhất cho tất cả mọi người.';

  if (state === 'distracted' || lyricsDistract) {
    choices = ['silence', 'lofi'];
    reason = 'Bạn nhận thấy âm thanh hoặc lời bài hát gây phân tâm. Có thể thử giảm âm lượng, chuyển sang nhạc không lời hoặc tắt nhạc.';
  } else if (state === 'stressed' && task !== 'break') {
    choices = ['silence', 'lofi'];
    reason = 'Có thể thử im lặng hoặc Lo-fi nhẹ nếu bạn thấy dễ chịu. Đây không phải tư vấn hay điều trị tâm lý.';
  } else if (state === 'sleepy' && ['simple', 'organize'].includes(task)) {
    choices = ['lofi', 'pop'];
    reason = 'Cẩm nang cho phép thử âm thanh năng động hơn với việc đơn giản; hãy nghỉ khi cần, không dùng nhạc để ép bản thân tiếp tục.';
  }

  if (task === 'memory') {
    choices = ['silence'];
    reason = 'Học thuộc lòng đòi hỏi tối đa bộ nhớ làm việc ngôn ngữ. Cẩm nang khuyến nghị ưu tiên môi trường im lặng.';
  }

  return {
    choices,
    reason,
    review: 'Sau khoảng 15–30 phút, tự kiểm tra: có phân tâm hơn không? Giảm âm lượng, đổi hoặc tắt nhạc khi không phù hợp.',
    source: 'S2, tr. 5–8',
    basis: 'Quy tắc kịch bản cẩm nang; không phải AI tạo sinh',
    ruleVersion: '3b-v1'
  };
}

/**
 * Format Date to YYYY-MM-DD in Vietnam Timezone (Asia/Ho_Chi_Minh)
 */
export function dateVN(at: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(at);
  const x = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return `${x.year}-${x.month}-${x.day}`;
}

export function validDate(s: string): boolean {
  return (
    typeof s === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) &&
    new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s
  );
}

export function dayNumber(start: string, date: string): number {
  if (!validDate(start) || !validDate(date)) return NaN;
  return Math.floor((Date.parse(date + 'T00:00:00Z') - Date.parse(start + 'T00:00:00Z')) / 86400000) + 1;
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date + 'T00:00:00Z') + days * 86400000).toISOString().slice(0, 10);
}

export function numericMean(values: (number | null | undefined)[]): number | null {
  const xs = values.filter((x): x is number => typeof x === 'number' && Number.isFinite(x));
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
}

export interface DiarySummaryItem {
  sound: string;
  label: string;
  n: number;
  focus: number | null;
  distraction: number | null;
  stressChange: number | null;
}

export function summarizeDiary(rows: any[]): DiarySummaryItem[] {
  return Object.entries(SOUNDS).map(([sound, label]) => {
    const items = rows.filter(r => r.sound === sound);
    return {
      sound,
      label,
      n: items.length,
      focus: numericMean(items.map(r => r.focus ?? r.focusScore)),
      distraction: numericMean(items.map(r => r.distraction ?? r.stressLevel)),
      stressChange: numericMean(
        items
          .filter(r => r.stressBefore !== null && r.stressBefore !== undefined && r.stressAfter !== null && r.stressAfter !== undefined)
          .map(r => r.stressAfter - r.stressBefore)
      )
    };
  });
}

/**
 * Sanitize cell value to prevent CSV / Excel formula injection
 */
export function csvCell(value: any): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[\s\u0000-\u001f]*[=+\-@]/u.test(s) || /^[\t\r\n]/.test(s)) {
    s = "'" + s;
  }
  return '"' + s.replaceAll('"', '""') + '"';
}

/**
 * Generate UTF-8 CSV with BOM for universal Excel compatibility
 */
export function makeCSV(rows: any[], columns: string[]): string {
  return (
    '\ufeff' +
    [
      columns.map(csvCell).join(','),
      ...rows.map(r => columns.map(k => csvCell(r[k])).join(','))
    ].join('\r\n')
  );
}

export function shuffled<T>(values: T[], random: () => number = Math.random): T[] {
  const a = [...values];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function triggerDownload(filename: string, content: string | ArrayBuffer, mimeType: string = 'text/plain;charset=utf-8') {
  const blob = content instanceof ArrayBuffer ? new Blob([content], { type: mimeType }) : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
