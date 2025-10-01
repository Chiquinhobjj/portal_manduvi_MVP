import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type UserRole = 'admin' | 'empresa' | 'terceiro_setor' | 'orgao_publico' | 'colaborador' | 'usuario';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  status: string;
  email_verified: boolean;
  phone_verified: boolean;
  profile_completed: boolean;
  last_login_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, role: UserRole) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', data.user.id);

        await supabase.from('user_sessions').insert({
          user_id: data.user.id,
          ip_address: null,
          user_agent: navigator.userAgent,
        });
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function signUp(email: string, password: string, role: UserRole) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) return { error };

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email!,
          role,
          status: 'pending',
        });

        if (profileError) return { error: profileError };

        await supabase.from('notification_preferences').insert({
          user_id: data.user.id,
        });
      }

      return { error: null };
    } catch (error) {
      return { error };
    }
  }

  async function signOut() {
    if (user) {
      await supabase
        .from('user_sessions')
        .update({ logout_at: new Date().toISOString(), is_active: false })
        .eq('user_id', user.id)
        .eq('is_active', true);
    }

    await supabase.auth.signOut();
    setProfile(null);
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  function hasPermission(resource: string, action: string): boolean {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    return false;
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        hasPermission,
        isAdmin,
      }}
    >
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
