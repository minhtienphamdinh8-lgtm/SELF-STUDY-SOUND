import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, INITIAL_PROJECT_OWNER_EMAIL } from '../services/firebase';
import { getVietnamFormattedDateTime } from '../utils/dateUtils';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'user' | 'researcher_admin';
  grade: string;
  createdAt: string;
}

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithEmail: (email: string, pass: string) => Promise<boolean>;
  signUpWithEmail: (email: string, pass: string, displayName: string, grade: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  grantResearcherRole: (targetUid: string) => Promise<{ success: boolean; message: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapAuthError(errCode: string): string {
  switch (errCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.';
    case 'auth/email-already-in-use':
      return 'Địa chỉ email này đã được đăng ký. Vui lòng chuyển sang tab Đăng nhập.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.';
    case 'auth/invalid-email':
      return 'Định dạng email không hợp lệ. Vui lòng nhập đúng địa chỉ email.';
    case 'auth/popup-closed-by-user':
      return 'Bạn đã đóng cửa sổ đăng nhập trước khi hoàn tất.';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng internet. Vui lòng kiểm tra lại đường truyền.';
    case 'auth/too-many-requests':
      return 'Có quá nhiều lần thử đăng nhập không thành công. Vui lòng đợi một lát rồi thử lại.';
    default:
      return 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại sau.';
  }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Sync user profile document from Firestore
  const fetchUserProfile = async (user: User): Promise<UserProfile> => {
    const userRef = doc(db, 'users', user.uid);
    try {
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        // Check if project owner
        if (user.email === INITIAL_PROJECT_OWNER_EMAIL && data.role !== 'researcher_admin') {
          await updateDoc(userRef, { role: 'researcher_admin' });
          data.role = 'researcher_admin';
        }
        setUserProfile(data);
        return data;
      } else {
        // First-time user profile creation
        const isOwner = user.email === INITIAL_PROJECT_OWNER_EMAIL;
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Học sinh',
          role: isOwner ? 'researcher_admin' : 'user', // Default role is strictly 'user'
          grade: 'Lớp 11',
          createdAt: getVietnamFormattedDateTime()
        };
        await setDoc(userRef, newProfile);
        setUserProfile(newProfile);
        return newProfile;
      }
    } catch (err: any) {
      // Fallback in case offline or security rules pending
      const fallback: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Người dùng',
        role: user.email === INITIAL_PROJECT_OWNER_EMAIL ? 'researcher_admin' : 'user',
        grade: 'Lớp 11',
        createdAt: getVietnamFormattedDateTime()
      };
      setUserProfile(fallback);
      return fallback;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        await fetchUserProfile(user);
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (currentUser) {
      await fetchUserProfile(currentUser);
    }
  };

  const signInWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      await fetchUserProfile(cred.user);
      return true;
    } catch (err: any) {
      setAuthError(mapAuthError(err.code || ''));
      return false;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    pass: string, 
    displayName: string, 
    grade: string
  ): Promise<boolean> => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      if (displayName.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      const isOwner = cred.user.email === INITIAL_PROJECT_OWNER_EMAIL;
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: displayName.trim() || cred.user.email?.split('@')[0] || 'Học sinh',
        role: isOwner ? 'researcher_admin' : 'user', // Default role is strictly 'user'
        grade: grade || 'Lớp 11',
        createdAt: getVietnamFormattedDateTime()
      };
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      setUserProfile(newProfile);
      return true;
    } catch (err: any) {
      setAuthError(mapAuthError(err.code || ''));
      return false;
    }
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const cred = await signInWithPopup(auth, provider);
      await fetchUserProfile(cred.user);
      return true;
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        return false;
      }
      setAuthError(mapAuthError(err.code || ''));
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
      setAuthError(null);
    } catch {
      // ignore
    }
  };

  // Function for project owner/admin to grant researcher role to another user
  const grantResearcherRole = async (targetUid: string): Promise<{ success: boolean; message: string }> => {
    if (!isAdmin) {
      return { success: false, message: 'Chỉ Quản trị viên nhóm nghiên cứu mới có quyền cấp quyền.' };
    }
    try {
      const targetRef = doc(db, 'users', targetUid);
      await updateDoc(targetRef, { role: 'researcher_admin' });
      return { success: true, message: 'Đã nâng cấp quyền Quản trị viên Nhóm nghiên cứu thành công.' };
    } catch (err: any) {
      return { success: false, message: 'Lỗi cấp quyền: ' + (err.message || 'Quyền bị từ chối.') };
    }
  };

  const isAdmin = userProfile?.role === 'researcher_admin' || currentUser?.email === INITIAL_PROJECT_OWNER_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        loading,
        authError,
        clearAuthError,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        logout,
        refreshProfile,
        grantResearcherRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
