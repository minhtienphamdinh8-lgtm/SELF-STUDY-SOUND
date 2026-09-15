/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavTab, MailboxMessage, JournalDay } from './types';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { HomeView } from './views/HomeView';
import { MusicInfoView } from './views/MusicInfoView';
import { MoodBotView } from './views/MoodBotView';
import { GameView } from './views/GameView';
import { JournalView } from './views/JournalView';
import { MailboxView } from './views/MailboxView';
import { AdminView } from './views/AdminView';
import { CuteBackgroundDecor } from './components/CuteBackgroundDecor';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MusicProvider } from './context/MusicContext';
import { 
  fetchUserJournals, 
  saveJournalDayToCloud, 
  deleteJournalDayFromCloud, 
  build21DaysArray 
} from './services/journalService';
import { 
  fetchUserMailboxMessages, 
  fetchAllMailboxMessagesForAdmin, 
  sendMailboxMessageToCloud, 
  replyMailboxMessageOnCloud,
  deleteMailboxMessageOnCloud 
} from './services/mailboxService';

function AppContent() {
  const { currentUser, isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [journalDays, setJournalDays] = useState<JournalDay[]>(build21DaysArray([]));
  const [currentlyPlayingSound, setCurrentlyPlayingSound] = useState<string | null>(null);
  const [sentMailNotice, setSentMailNotice] = useState<boolean>(false);
  const [isLoadingCloudJournal, setIsLoadingCloudJournal] = useState(false);
  const [isLoadingCloudMailbox, setIsLoadingCloudMailbox] = useState(false);

  // Load user data on auth state change
  const loadUserData = useCallback(async () => {
    if (!currentUser) {
      setJournalDays(build21DaysArray([]));
      setMessages([]);
      return;
    }

    // 1. Fetch user journals
    setIsLoadingCloudJournal(true);
    try {
      const savedJournals = await fetchUserJournals(currentUser.uid);
      setJournalDays(build21DaysArray(savedJournals));
    } catch (err) {
      console.error('Failed to load journals from Cloud Firestore:', err);
    } finally {
      setIsLoadingCloudJournal(false);
    }

    // 2. Fetch mailbox messages
    setIsLoadingCloudMailbox(true);
    try {
      if (isAdmin) {
        const allMsgs = await fetchAllMailboxMessagesForAdmin();
        setMessages(allMsgs);
      } else {
        const userMsgs = await fetchUserMailboxMessages(currentUser.uid);
        setMessages(userMsgs);
      }
    } catch (err) {
      console.error('Failed to load mailbox from Cloud Firestore:', err);
    } finally {
      setIsLoadingCloudMailbox(false);
    }
  }, [currentUser, isAdmin]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Unread or pending mail count
  const unreadMailCount = messages.filter((m) => m.status === 'pending').length;

  const handlePlaySound = (name: string) => {
    setCurrentlyPlayingSound(name);
  };

  const handleStopSound = () => {
    setCurrentlyPlayingSound(null);
  };

  const handleSubmitMail = async (
    title: string, 
    content: string, 
    senderName?: string, 
    senderGrade?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Vui lòng đăng nhập tài khoản trước khi gửi thư.' };
    }

    const res = await sendMailboxMessageToCloud(
      currentUser.uid,
      currentUser.email || '',
      title,
      content,
      senderName,
      senderGrade
    );

    if (res.success) {
      // Re-fetch mailbox list to show newly created mail
      if (isAdmin) {
        const allMsgs = await fetchAllMailboxMessagesForAdmin();
        setMessages(allMsgs);
      } else {
        const userMsgs = await fetchUserMailboxMessages(currentUser.uid);
        setMessages(userMsgs);
      }
      setSentMailNotice(true);
      setTimeout(() => setSentMailNotice(false), 4000);
    }

    return res;
  };

  const handleReplyMessage = async (
    id: string, 
    replyContent: string, 
    repliedBy: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Chỉ cán bộ thuộc Nhóm nghiên cứu mới có quyền trả lời thư.' };
    }

    const res = await replyMailboxMessageOnCloud(id, replyContent, repliedBy);
    if (res.success) {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === id) {
            return {
              ...msg,
              status: 'answered',
              replyContent,
              repliedBy,
              repliedAt: 'Vừa xong'
            };
          }
          return msg;
        })
      );
    }
    return res;
  };

  const handleDeleteMessage = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isAdmin) {
      return { success: false, error: 'Không có quyền xóa thư.' };
    }
    const res = await deleteMailboxMessageOnCloud(id);
    if (res.success) {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    }
    return res;
  };

  const handleUpdateJournalDay = async (
    dayNum: number, 
    data: Partial<JournalDay>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Vui lòng đăng nhập tài khoản để lưu nhật ký lên Cloud Firestore.' };
    }

    const res = await saveJournalDayToCloud(currentUser.uid, dayNum, data);
    if (res.success) {
      setJournalDays((prev) =>
        prev.map((d) => {
          if (d.day === dayNum) {
            return {
              ...d,
              ...data,
              status: 'completed'
            };
          }
          return d;
        })
      );
    }
    return res;
  };

  const handleDeleteJournalDay = async (dayNum: number): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Vui lòng đăng nhập tài khoản.' };
    }

    const res = await deleteJournalDayFromCloud(currentUser.uid, dayNum);
    if (res.success) {
      setJournalDays((prev) =>
        prev.map((d) => {
          if (d.day === dayNum) {
            return {
              ...d,
              status: 'upcoming',
              environment: undefined,
              rating: undefined,
              taskType: undefined,
              notes: undefined,
              audioFeedback: undefined,
              completedAt: undefined
            };
          }
          return d;
        })
      );
    }
    return res;
  };

  return (
    <div className="min-h-screen flex flex-col bg-linear-to-b from-[#EBF3FD] via-[#F2F7FD] to-[#E5F0FC] text-slate-900 font-sans selection:bg-blue-600 selection:text-white relative isolate overflow-x-hidden">
      {/* Background Decor strictly behind all content (-z-50) */}
      <CuteBackgroundDecor />

      {/* Top Main Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        unreadMailCount={unreadMailCount}
      />

      {/* Main Container - High Definition Stacking Layer (z-10) */}
      <main className={`relative z-10 flex-1 max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1536px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 pt-4 sm:pt-6 transition-all duration-300 ${currentlyPlayingSound ? 'pb-36 sm:pb-40' : 'pb-20'}`}>
        {currentTab === 'home' && (
          <HomeView
            onSelectTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPlaySound={handlePlaySound}
            onSubmitMail={handleSubmitMail}
            sentMailNotice={sentMailNotice}
            journalDays={journalDays}
          />
        )}

        {currentTab === 'music-info' && (
          <MusicInfoView
            onBackToHome={() => setCurrentTab('home')}
            onPlaySound={handlePlaySound}
          />
        )}

        {currentTab === 'mood-bot' && (
          <MoodBotView
            onBackToHome={() => setCurrentTab('home')}
            onPlaySound={handlePlaySound}
          />
        )}

        {currentTab === 'game' && (
          <GameView
            onBackToHome={() => setCurrentTab('home')}
            onPlaySound={handlePlaySound}
          />
        )}

        {currentTab === 'journal' && (
          <JournalView
            onBackToHome={() => setCurrentTab('home')}
            journalDays={journalDays}
            onUpdateDay={handleUpdateJournalDay}
            onDeleteDay={handleDeleteJournalDay}
            isLoadingCloud={isLoadingCloudJournal}
          />
        )}

        {currentTab === 'mailbox' && (
          <MailboxView
            onBackToHome={() => setCurrentTab('home')}
            messages={messages}
            onSubmitMail={handleSubmitMail}
            onSelectTab={(tab) => setCurrentTab(tab)}
            isLoadingCloud={isLoadingCloudMailbox}
          />
        )}

        {currentTab === 'admin' && (
          <AdminView
            onBackToHome={() => setCurrentTab('home')}
            messages={messages}
            onReplyMessage={handleReplyMessage}
            onDeleteMessage={handleDeleteMessage}
          />
        )}
      </main>

      {/* Persistent Audio Indicator Bar when ambient sound is playing */}
      <AudioPlayerBar
        currentlyPlaying={currentlyPlayingSound}
        onStop={handleStopSound}
        onPlaySound={handlePlaySound}
      />

      {/* Footer */}
      <Footer
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MusicProvider>
        <AppContent />
      </MusicProvider>
    </AuthProvider>
  );
}
