import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (active) {
          if (session) {
            setSession(session);
            setUser(session.user);
          } else {
            const isDummy = import.meta.env.VITE_SUPABASE_ANON_KEY === 'dummy_anon_key' || !import.meta.env.VITE_SUPABASE_URL;
            if (isDummy) {
              const localSession = localStorage.getItem('klimora_mock_session');
              if (localSession) {
                const parsed = JSON.parse(localSession);
                setSession(parsed);
                setUser(parsed.user);
              }
            }
          }
        }
      } catch (err) {
        console.error("Supabase getSession error:", err);
        try {
          const localSession = localStorage.getItem('klimora_mock_session');
          if (localSession && active) {
            const parsed = JSON.parse(localSession);
            setSession(parsed);
            setUser(parsed.user);
          }
        } catch {}
      } finally {
        if (active) setIsLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsLoading(false);
      } else {
        const localSession = localStorage.getItem('klimora_mock_session');
        if (!localSession) {
          setSession(null);
          setUser(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    localStorage.removeItem('klimora_mock_session');
    try {
      await supabase.auth.signOut();
    } catch {}
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
