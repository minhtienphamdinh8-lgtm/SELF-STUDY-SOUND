import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface VoluntaryEventPayload {
  type: 'recommendation_feedback' | 'quiz_share' | 'focus_game_share' | 'melody_share';
  data: Record<string, any>;
  clientReportedAt: string;
}

export async function logVoluntaryEvent(payload: VoluntaryEventPayload): Promise<boolean> {
  try {
    await addDoc(collection(db, 'events'), {
      ...payload,
      createdAt: serverTimestamp(),
      evidenceStatus: 'client-reported-unverified'
    });
    return true;
  } catch (err) {
    console.warn('Không thể gửi sự kiện tự nguyện về máy chủ:', err);
    return false;
  }
}
