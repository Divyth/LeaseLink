import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from '../types';
import { login as loginRequest, me as meRequest, register as registerRequest } from '../api/client';

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: { name: string; email: string; password: string; role: 'TENANT' | 'OWNER'; university: string; phone?: string }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const tokenKey = 'flatbuddy-token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem(tokenKey));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const result = await meRequest(token);
        setUser(result.user);
      } catch {
        localStorage.removeItem(tokenKey);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };
    void bootstrap();
  }, [token]);

  const persist = (nextToken: string, nextUser: User) => {
    localStorage.setItem(tokenKey, nextToken);
    setToken(nextToken);
    setUser(nextUser);
  };

  const login = async (email: string, password: string) => {
    const result = await loginRequest(email, password);
    persist(result.token, result.user);
  };

  const register = async (payload: { name: string; email: string; password: string; role: 'TENANT' | 'OWNER'; university: string; phone?: string }) => {
    const result = await registerRequest(payload);
    persist(result.token, result.user);
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

