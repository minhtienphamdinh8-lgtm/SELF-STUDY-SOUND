import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  where
} from 'firebase/firestore';
import { db } from './firebase';
import { JournalDay } from '../types';
import { dateVN, dayNumber, addDays } from '../utils/domain';

export interface ParticipantProfile {
  uid: string;
  code: string;
  email: string;
  nickname?: string;
  status: 'pending' | 'active' | 'withdrawn' | 'blocked';
  cohort: string;
  startDate: string; // YYYY-MM-DD in Vietnam time
  consentVersion: string;
  createdAt?: any;
}

export interface ParticipantDiaryEntry {
  day: number;
  date: string; // YYYY-MM-DD
  task: string;
  state: string;
  sound: string;
  focus: number;
  distraction: number;
  minutes: number;
  stressBefore?: number | null;
  stressAfter?: number | null;
  note?: string;
  researchShareConsent: boolean;
  isLateEntry: boolean;
  updatedAt?: any;
}

/**
 * Get participant profile from `participants/{uid}`
 */
export async function getParticipantProfile(uid: string): Promise<ParticipantProfile | null> {
  if (!uid) return null;
  try {
    const snap = await getDoc(doc(db, 'participants', uid));
    if (!snap.exists()) return null;
    return snap.data() as ParticipantProfile;
  } catch (err: any) {
    console.error('Lỗi khi tải hồ sơ người tham gia:', err.code || err.message);
    return null;
  }
}

/**
 * Register participant for 21-day diary study (initial status: pending)
 */
export async function enrollParticipant({
  uid,
  email,
  nickname
}: {
  uid: string;
  email: string;
  nickname?: string;
}): Promise<ParticipantProfile> {
  const code = 'SSS-' + Math.floor(1000 + Math.random() * 9000);
  const todayVN = dateVN();

  const profile: ParticipantProfile = {
    uid,
    code,
    email,
    nickname: (nickname && nickname.trim()) || 'Học sinh tham gia',
    status: 'pending',
    cohort: 'Đợt 1 - 2026',
    startDate: todayVN,
    consentVersion: 'sss-pilot-consent-1'
  };

  await setDoc(doc(db, 'participants', uid), {
    ...profile,
    createdAt: serverTimestamp()
  });

  return profile;
}

/**
 * Fetch all diary records for an active participant from `participants/{uid}/diary`
 */
export async function fetchParticipantDiary(uid: string): Promise<Record<number, ParticipantDiaryEntry>> {
  if (!uid) return {};
  try {
    const snap = await getDocs(collection(db, 'participants', uid, 'diary'));
    const result: Record<number, ParticipantDiaryEntry> = {};

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const dNum = Number(data.day);
      if (!isNaN(dNum) && dNum >= 1 && dNum <= 21) {
        result[dNum] = {
          day: dNum,
          date: data.date || docSnap.id,
          task: data.task || 'reading',
          state: data.state || 'calm',
          sound: data.sound || 'lofi',
          focus: Number(data.focus ?? 4),
          distraction: Number(data.distraction ?? 2),
          minutes: Number(data.minutes ?? 45),
          stressBefore: data.stressBefore !== undefined && data.stressBefore !== null ? Number(data.stressBefore) : null,
          stressAfter: data.stressAfter !== undefined && data.stressAfter !== null ? Number(data.stressAfter) : null,
          note: data.note || '',
          researchShareConsent: data.researchShareConsent !== false,
          isLateEntry: !!data.isLateEntry
        };
      }
    });

    return result;
  } catch (err: any) {
    console.error('Lỗi khi tải dữ liệu nhật ký của người tham gia:', err);
    return {};
  }
}

/**
 * Save a single diary record for a participant
 */
export async function saveParticipantDiaryDay(
  uid: string,
  entry: ParticipantDiaryEntry
): Promise<{ success: boolean; error?: string }> {
  if (!uid) {
    return { success: false, error: 'Chưa đăng nhập' };
  }

  try {
    const docRef = doc(db, 'participants', uid, 'diary', String(entry.day));
    await setDoc(docRef, {
      ...entry,
      updatedAt: serverTimestamp()
    });

    // Also mirror to users/{uid}/journals/{day} for user backward-compat
    try {
      await setDoc(doc(db, 'users', uid, 'journals', String(entry.day)), {
        day: entry.day,
        dateStr: `Ngày ${entry.day}/21 (${entry.date})`,
        status: 'completed',
        studyDurationMinutes: entry.minutes,
        subject: entry.task,
        soundEnv: entry.sound,
        focusScore: entry.focus,
        stressLevel: entry.distraction,
        note: entry.note || '',
        updatedAt: serverTimestamp()
      });
    } catch {
      // ignore mirror error
    }

    return { success: true };
  } catch (err: any) {
    console.error('Lỗi khi lưu nhật ký:', err);
    return { success: false, error: err.message || 'Lỗi lưu máy chủ' };
  }
}

/**
 * Withdraw consent: sets participant status to 'withdrawn'
 */
export async function withdrawParticipantConsent(uid: string): Promise<boolean> {
  if (!uid) return false;
  await updateDoc(doc(db, 'participants', uid), {
    status: 'withdrawn',
    withdrawnAt: serverTimestamp()
  });
  return true;
}

/**
 * Delete all account & diary data from Firestore
 */
export async function deleteParticipantAccountAndData(uid: string): Promise<boolean> {
  if (!uid) return false;

  // 1. Delete all diary records
  try {
    const snap = await getDocs(collection(db, 'participants', uid, 'diary'));
    for (const d of snap.docs) {
      await deleteDoc(d.ref);
    }
  } catch {}

  // 2. Delete all journals
  try {
    const snapJ = await getDocs(collection(db, 'users', uid, 'journals'));
    for (const d of snapJ.docs) {
      await deleteDoc(d.ref);
    }
  } catch {}

  // 3. Delete participant profile
  try {
    await deleteDoc(doc(db, 'participants', uid));
  } catch {}

  // 4. Delete user doc
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch {}

  return true;
}

/**
 * Backward compatibility helper for general journal day fetch
 */
export async function fetchUserJournals(userId: string): Promise<Record<number, JournalDay>> {
  if (!userId) return {};
  try {
    const journalsRef = collection(db, 'users', userId, 'journals');
    const snapshot = await getDocs(journalsRef);
    const result: Record<number, JournalDay> = {};

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const dayNum = Number(data.day || docSnap.id);
      if (!isNaN(dayNum) && dayNum >= 1 && dayNum <= 21) {
        result[dayNum] = {
          day: dayNum,
          dateStr: data.dateStr || 'Gần đây',
          status: 'completed',
          studyDurationMinutes: Number(data.studyDurationMinutes || 45),
          subject: data.subject || 'Đọc hiểu',
          soundEnv: data.soundEnv || 'Lo-fi không lời',
          focusScore: Number(data.focusScore || 4),
          stressLevel: Number(data.stressLevel || 2),
          note: data.note || ''
        };
      }
    });

    return result;
  } catch {
    return {};
  }
}

/**
 * Build 21-day array merging defaults with user saved records
 */
export function build21DaysArray(savedRecord: Record<number, JournalDay> | JournalDay[]): JournalDay[] {
  const map: Record<number, JournalDay> = Array.isArray(savedRecord)
    ? savedRecord.reduce((acc, curr) => ({ ...acc, [curr.day]: curr }), {})
    : savedRecord || {};

  return Array.from({ length: 21 }, (_, i) => {
    const dayNum = i + 1;
    if (map[dayNum]) {
      return map[dayNum];
    }
    return {
      day: dayNum,
      dateStr: `Ngày ${dayNum}/21`,
      status: 'upcoming',
      studyDurationMinutes: 45,
      subject: 'Chưa có dữ liệu',
      soundEnv: 'Chưa chọn',
      focusScore: 0,
      stressLevel: 0,
      note: ''
    };
  });
}

/**
 * Save single journal day to Cloud
 */
export async function saveJournalDayToCloud(
  userId: string,
  dayNum: number,
  data: Partial<JournalDay>
): Promise<{ success: boolean; data: JournalDay; error?: string }> {
  if (!userId) {
    return { success: false, data: {} as JournalDay, error: 'Chưa đăng nhập' };
  }

  const payload: JournalDay = {
    day: dayNum,
    dateStr: data.dateStr || `Ngày ${dayNum}/21`,
    status: 'completed',
    studyDurationMinutes: Number(data.studyDurationMinutes || 45),
    subject: data.subject || 'Đọc hiểu',
    soundEnv: data.soundEnv || 'Lo-fi không lời',
    focusScore: Number(data.focusScore || 4),
    stressLevel: Number(data.stressLevel || 2),
    note: data.note || ''
  };

  try {
    await setDoc(doc(db, 'users', userId, 'journals', String(dayNum)), {
      ...payload,
      serverTimestamp: serverTimestamp()
    });
    return { success: true, data: payload };
  } catch (err: any) {
    return { success: false, data: payload, error: err.message };
  }
}

/**
 * Delete journal day from Cloud
 */
export async function deleteJournalDayFromCloud(
  userId: string,
  dayNum: number
): Promise<{ success: boolean; error?: string }> {
  if (!userId) return { success: false, error: 'Chưa đăng nhập' };
  try {
    await deleteDoc(doc(db, 'users', userId, 'journals', String(dayNum)));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

