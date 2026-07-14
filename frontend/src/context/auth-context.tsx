import { createContext, useContext, useState, type ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role?: 'STUDENT' | 'ADMIN';
  emailVerified?: boolean;
  avatarUrl?: string | null;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  signIn: (user: User, token?: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'mudraa.user';
const TOKEN_KEY = 'mudraa.token';

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const signIn = (u: User, accessToken?: string) => {
    setUser(u);
    if (accessToken) {
      setToken(accessToken);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }
    } catch {
      /* ignore */
    }
  };

  const signOut = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
