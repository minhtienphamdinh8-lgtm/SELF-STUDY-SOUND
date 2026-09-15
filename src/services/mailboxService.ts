import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { generateTicketId, generateSecretKey, hashTicketKey } from '../utils/cryptoUtils';

export interface TicketRecord {
  id: string;
  keyHash: string;
  nickname: string;
  topic: 'question' | 'feedback' | 'share' | 'submission';
  sunoUrl?: string;
  message: string;
  status: 'waiting' | 'replied' | 'closed';
  reply?: string;
  repliedAt?: string;
  repliedBy?: string;
  createdAt?: any;
  createdAtStr?: string;
}

export interface CreateTicketParams {
  nickname?: string;
  topic: 'question' | 'feedback' | 'share' | 'submission';
  sunoUrl?: string;
  message: string;
  consent: boolean;
}

export interface CreateTicketResult {
  success: boolean;
  ticketId: string;
  secretKey: string;
  error?: string;
}

/**
 * Create an anonymous ticket with a 256-bit lookup secret key
 */
export async function createTicket(params: CreateTicketParams): Promise<CreateTicketResult> {
  const { nickname, topic, sunoUrl, message, consent } = params;

  if (!consent) {
    throw new Error('Bạn cần tích đồng ý gửi thư cho nhóm nghiên cứu.');
  }

  const trimmedMsg = message.trim();
  if (trimmedMsg.length < 5 || trimmedMsg.length > 3000) {
    throw new Error('Nội dung thư phải từ 5 đến 3000 ký tự.');
  }

  const ticketId = generateTicketId();
  const secretKey = generateSecretKey();
  const keyHash = await hashTicketKey(ticketId, secretKey);

  const nowStr = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  const docData = {
    id: ticketId,
    keyHash,
    nickname: (nickname && nickname.trim()) || 'Học sinh ẩn danh',
    topic,
    sunoUrl: (sunoUrl && sunoUrl.trim()) || null,
    message: trimmedMsg,
    status: 'waiting',
    reply: null,
    repliedAt: null,
    repliedBy: null,
    createdAt: serverTimestamp(),
    createdAtStr: nowStr
  };

  await setDoc(doc(db, 'tickets', ticketId), docData);

  return {
    success: true,
    ticketId,
    secretKey
  };
}

/**
 * Tra cứu thư bằng Mã phiếu (ticketId) và Khóa bí mật 256-bit (secretKey)
 */
export async function lookupTicket(ticketId: string, secretKey: string): Promise<TicketRecord | null> {
  const cleanId = ticketId.trim();
  const cleanKey = secretKey.trim();

  if (!cleanId || !cleanKey) {
    throw new Error('Vui lòng nhập cả Mã phiếu và Khóa tra cứu bí mật.');
  }

  const ticketRef = doc(db, 'tickets', cleanId);
  const snap = await getDoc(ticketRef);

  if (!snap.exists()) {
    return null;
  }

  const data = snap.data() as TicketRecord;
  const computedHash = await hashTicketKey(cleanId, cleanKey);

  if (computedHash !== data.keyHash) {
    throw new Error('Khóa tra cứu không chính xác. Vui lòng kiểm tra lại 64 ký tự khóa bí mật.');
  }

  return {
    ...data,
    id: snap.id
  };
}

/**
 * Cho phép người gửi xóa thư của mình sau khi đã xác thực khóa
 */
export async function deleteTicketWithKey(ticketId: string, secretKey: string): Promise<boolean> {
  const verified = await lookupTicket(ticketId, secretKey);
  if (!verified) {
    throw new Error('Không tìm thấy thư để xóa.');
  }

  await deleteDoc(doc(db, 'tickets', ticketId.trim()));
  return true;
}

/**
 * Dành cho quản trị viên nghiên cứu: Lấy danh sách toàn bộ thư
 */
export async function fetchAllTicketsForAdmin(): Promise<TicketRecord[]> {
  const snap = await getDocs(collection(db, 'tickets'));
  const list: TicketRecord[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    list.push({
      id: docSnap.id,
      keyHash: data.keyHash || '',
      nickname: data.nickname || 'Ẩn danh',
      topic: data.topic || 'question',
      sunoUrl: data.sunoUrl || undefined,
      message: data.message || '',
      status: data.status || 'waiting',
      reply: data.reply || undefined,
      repliedAt: data.repliedAt || undefined,
      repliedBy: data.repliedBy || undefined,
      createdAtStr: data.createdAtStr || 'Gần đây'
    });
  });

  return list.reverse();
}

/**
 * Dành cho quản trị viên: Phản hồi thư học sinh
 */
export async function replyTicketAdmin(ticketId: string, replyText: string, repliedBy = 'Nhóm nghiên cứu'): Promise<boolean> {
  const nowStr = new Intl.DateTimeFormat('vi-VN', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date());

  await updateDoc(doc(db, 'tickets', ticketId), {
    status: 'replied',
    reply: replyText.trim(),
    repliedAt: nowStr,
    repliedBy
  });

  return true;
}

/**
 * Quản trị viên xóa thư
 */
export async function deleteTicketAdmin(ticketId: string): Promise<boolean> {
  await deleteDoc(doc(db, 'tickets', ticketId));
  return true;
}

/**
 * Backward compatibility helpers for user-authenticated mailbox
 */
export async function fetchUserMailboxMessages(userId: string): Promise<any[]> {
  return [];
}

export async function fetchAllMailboxMessagesForAdmin(): Promise<any[]> {
  return fetchAllTicketsForAdmin();
}

export async function sendMailboxMessageToCloud(
  userId: string,
  userEmail: string,
  title: string,
  content: string,
  senderName?: string,
  senderGrade?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await createTicket({
      nickname: senderName,
      topic: 'feedback',
      message: `${title}\n\n${content}`,
      consent: true
    });
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function replyMailboxMessageOnCloud(
  id: string,
  replyContent: string,
  repliedBy: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await replyTicketAdmin(id, replyContent, repliedBy);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function deleteMailboxMessageOnCloud(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteTicketAdmin(id);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

