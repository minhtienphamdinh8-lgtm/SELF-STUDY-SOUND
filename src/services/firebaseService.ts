/**
 * Firebase Service Abstraction Layer
 * 
 * Sẵn sàng cho việc kết nối Firebase Authentication và Cloud Firestore ở bước tiếp theo.
 * Hiện tại hoạt động với Local State / Memory Store, không giả vờ đã đồng bộ server,
 * và hiển thị rõ trạng thái kết nối cho người dùng.
 */

import { MailboxMessage, JournalDay, QuizQuestion, MusicArticle } from '../types';

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  authProvider: 'firebase-auth' | 'local-preview';
  dbProvider: 'cloud-firestore' | 'local-state';
  statusMessage: string;
}

// Trạng thái cấu trúc Firebase được chuẩn bị sẵn sàng
export const firebaseStatus: FirebaseConfigStatus = {
  isConfigured: false, // Chưa kích hoạt kết nối thực tế ở bước này theo yêu cầu
  authProvider: 'local-preview',
  dbProvider: 'local-state',
  statusMessage: 'Cấu trúc Firebase Auth & Firestore đã sẵn sàng để kích hoạt ở bước tiếp theo.'
};

/**
 * Interface cho kho dữ liệu Hộp thư lắng nghe (Firestore collection: `mailbox_messages`)
 */
export interface MailboxRepository {
  getMessages: () => Promise<MailboxMessage[]>;
  sendMessage: (title: string, content: string, senderName: string, senderGrade: string) => Promise<{ success: boolean; id: string; message: string }>;
  replyMessage: (id: string, replyContent: string, repliedBy: string) => Promise<{ success: boolean; message: string }>;
}

/**
 * Interface cho Nhật ký 21 ngày (Firestore collection: `study_journals`)
 */
export interface JournalRepository {
  getJournalDays: () => Promise<JournalDay[]>;
  updateDayLog: (day: number, logData: Partial<JournalDay>) => Promise<{ success: boolean }>;
}

/**
 * Interface cho Quản trị viên (Admin Content Management)
 */
export interface AdminRepository {
  updateArticle: (article: MusicArticle) => Promise<boolean>;
  addQuizQuestion: (question: Omit<QuizQuestion, 'id'>) => Promise<QuizQuestion>;
  deleteQuizQuestion: (id: string) => Promise<boolean>;
}
