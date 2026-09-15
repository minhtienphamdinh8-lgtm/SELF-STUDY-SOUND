/**
 * Date & Time Utilities configured for Asia/Ho_Chi_Minh timezone
 */

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

/**
 * Returns current date formatted as DD/MM/YYYY in Vietnam timezone
 */
export function getVietnamFormattedDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
}

/**
 * Returns current date and time formatted in Vietnam timezone (e.g. "15:30 13/09/2026")
 */
export function getVietnamFormattedDateTime(date: Date = new Date()): string {
  const timeStr = new Intl.DateTimeFormat('vi-VN', {
    timeZone: VIETNAM_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date);

  const dateStr = getVietnamFormattedDate(date);
  return `${timeStr} ngày ${dateStr}`;
}

/**
 * Returns ISO-like date string (YYYY-MM-DD) based on Vietnam timezone
 */
export function getVietnamISODate(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value || '2026';
  const month = parts.find((p) => p.type === 'month')?.value || '01';
  const day = parts.find((p) => p.type === 'day')?.value || '01';

  return `${year}-${month}-${day}`;
}
