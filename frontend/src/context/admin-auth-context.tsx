import { createContext, useContext, useState, type ReactNode } from 'react';

export interface Admin {
  id?: string;
  email: string;
  role?: 'ADMIN';
}

interface AdminAuthContextValue {
  admin: Admin | null;
  token: string | null;
  signIn: (admin: Admin, token?: string) => void;
  signOut: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'mudraa.admin';
const TOKEN_KEY = 'mudraa.admin.token';

function loadAdmin(): Admin | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Admin) : null;
  } catch {
    return null;
  }
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(loadAdmin);
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });

  const signIn = (a: Admin, accessToken?: string) => {
    setAdmin(a);
    if (accessToken) {
      setToken(accessToken);
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(a));
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
      }
    } catch {
      /* ignore */
    }
  };

  const signOut = () => {
    setAdmin(null);
    setToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
