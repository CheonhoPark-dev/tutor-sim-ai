'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
  user: null,
  loading: false,
  signUp: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
  signIn: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
  signInWithGoogle: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
  logout: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
  resetPassword: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
  signOut: async () => {
    throw new Error('AuthContext가 초기화되지 않았습니다.');
  },
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
};

const PUBLIC_PATHS = ['/signin', '/signup', '/login', '/register'];
const PROTECTED_PATHS = ['/dashboard'];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // 토큰을 쿠키에 저장하는 함수
  const setAuthCookie = async (user: User | null) => {
    if (user) {
      const token = await user.getIdToken();
      Cookies.set('auth', token, { expires: 7 }); // 7일 동안 유효
    } else {
      Cookies.remove('auth');
    }
  };

  // 페이지 리다이렉션 처리
  const handleRedirection = async (user: User | null) => {
    const currentPath = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const fromPath = searchParams.get('from');
    
    console.log('📍 [리다이렉션] 현재 상태:', {
      currentPath,
      fromPath,
      isAuthenticated: !!user
    });

    if (user) {
      // 토큰을 쿠키에 저장
      await setAuthCookie(user);
      
      //인증된 사용자가 로그인/회원가입 페이지 접근 시 대시보드 또는 원래 가려던 페이지로 이동
      if (PUBLIC_PATHS.includes(currentPath)) {
        const targetPath = fromPath || '/dashboard';
        console.log('✅ [리다이렉션] 인증된 사용자 ->', targetPath);
        await router.push(targetPath);
        return true;
      }
    } else {
      // 쿠키에서 토큰 제거
      Cookies.remove('auth');
      
      // 미인증 사용자가 보호된 페이지 접근 시 로그인 페이지로 이동
      if (PROTECTED_PATHS.includes(currentPath)) {
        const loginPath = `/login?from=${encodeURIComponent(currentPath)}`;
        console.log('❌ [리다이렉션] 미인증 사용자 ->', loginPath);
        await router.push(loginPath);
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    console.log('🔄 [AuthProvider] 초기화');
    let isSubscribed = true;

    const handleAuth = async (authUser: User | null) => {
      console.log('👤 [인증 상태 변경]', {
        isAuthenticated: !!authUser,
        email: authUser?.email,
        currentPath: window.location.pathname,
        loading
      });

      if (!isSubscribed) return;

      setUser(authUser);
      
      try {
        // 토큰 관리 및 리다이렉션 처리
        await setAuthCookie(authUser);
        await handleRedirection(authUser);
      } finally {
        // 리다이렉션 완료 후 로딩 상태 해제
        if (isSubscribed) {
          setLoading(false);
        }
      }
    };

    // Firebase 인증 상태 변경 구독
    const unsubscribe = onAuthStateChanged(auth, handleAuth);

    return () => {
      isSubscribed = false;
      unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('🔑 [로그인] 시도:', email);
      await signInWithEmailAndPassword(auth, email, password);
      
      // 로그인 후 원래 가려던 페이지로 이동
      const searchParams = new URLSearchParams(window.location.search);
      const fromPath = searchParams.get('from');
      const targetPath = fromPath || '/dashboard';
      console.log('✅ [로그인 성공] 리다이렉션 ->', targetPath);
      await router.push(targetPath);
    } catch (error) {
      console.error('❌ [로그인] 오류:', error);
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found' || authError.code === 'auth/invalid-credential') {
        throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
      } else if (authError.code === 'auth/wrong-password') {
        throw new Error('비밀번호가 올바르지 않습니다.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      } else if (authError.code === 'auth/too-many-requests') {
        throw new Error('너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.');
      }
      console.log('🔍 [로그인] 상세 오류:', {
        code: authError.code,
        message: authError.message
      });
      throw new Error('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('📝 [회원가입] 시도:', email);
      await createUserWithEmailAndPassword(auth, email, password);
      
      // 회원가입 후 원래 가려던 페이지로 이동
      const searchParams = new URLSearchParams(window.location.search);
      const fromPath = searchParams.get('from');
      const targetPath = fromPath || '/dashboard';
      console.log('✅ [회원가입 성공] 리다이렉션 ->', targetPath);
      await router.push(targetPath);
    } catch (error) {
      console.error('❌ [회원가입] 오류:', error);
      const authError = error as AuthError;
      if (authError.code === 'auth/email-already-in-use') {
        throw new Error('이미 사용 중인 이메일입니다.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      } else if (authError.code === 'auth/operation-not-allowed') {
        throw new Error('이메일/비밀번호 인증이 비활성화되어 있습니다.');
      } else if (authError.code === 'auth/weak-password') {
        throw new Error('비밀번호가 너무 약합니다.');
      }
      throw new Error('회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 [로그아웃] 시도');
      await firebaseSignOut(auth);
      Cookies.remove('auth');  // 명시적 쿠키 제거
      setUser(null);  // 사용자 상태 초기화
      router.push('/login');
    } catch (error) {
      console.error('❌ [로그아웃] 오류:', error);
      throw new Error('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      console.log('🔑 [비밀번호 재설정] 시도:', email);
      await sendPasswordResetEmail(auth, email);
      console.log('✅ [비밀번호 재설정] 이메일 전송 성공');
    } catch (error) {
      console.error('❌ [비밀번호 재설정] 오류:', error);
      const authError = error as AuthError;
      if (authError.code === 'auth/user-not-found') {
        throw new Error('해당 이메일로 가입된 계정을 찾을 수 없습니다.');
      } else if (authError.code === 'auth/invalid-email') {
        throw new Error('유효하지 않은 이메일 형식입니다.');
      } else if (authError.code === 'auth/too-many-requests') {
        throw new Error('너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.');
      }
      throw new Error('비밀번호 재설정 이메일 전송 중 오류가 발생했습니다.');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🔑 [Google 로그인] 시도');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // 로그인 후 원래 가려던 페이지로 이동
      const searchParams = new URLSearchParams(window.location.search);
      const fromPath = searchParams.get('from');
      const targetPath = fromPath || '/dashboard';
      console.log('✅ [Google 로그인 성공] 리다이렉션 ->', targetPath);
      await router.push(targetPath);
    } catch (error) {
      console.error('❌ [Google 로그인] 오류:', error);
      const authError = error as AuthError;
      if (authError.code === 'auth/popup-closed-by-user') {
        throw new Error('로그인이 취소되었습니다.');
      } else if (authError.code === 'auth/popup-blocked') {
        throw new Error('팝업이 차단되었습니다. 팝업 차단을 해제해주세요.');
      }
      throw new Error('Google 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn,
      signInWithGoogle, 
      logout, 
      resetPassword,
      signOut
    }}>
      {loading ? (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="text-xl font-semibold mb-2">로딩 중...</div>
            <div className="text-sm text-gray-500">잠시만 기다려주세요</div>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}; 