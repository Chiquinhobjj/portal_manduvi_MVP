import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import type { User, Session } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  role: 'admin' | 'empresa' | 'terceiro_setor' | 'orgao_publico' | 'colaborador' | 'usuario';
  status: 'pending' | 'active' | 'suspended' | 'deleted';
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
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error?: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: any }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    // Timeout amigável aumentado para 30s e sem erro duro
    timeoutId = setTimeout(() => {
      if (mounted && loading) {
        console.warn('Autenticação demorando... mantendo app utilizável');
        setLoading(false);
        // Não definir erro aqui para evitar bloqueio do app
      }
    }, 30000);

    // Função para inicializar a autenticação
    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');
        
        // Obter sessão atual com pequenas tentativas
        let currentSession: Session | null = null;
        let sessionError: any = null;
        for (let attempt = 1; attempt <= 3; attempt++) {
          const { data: { session }, error } = await supabase.auth.getSession();
          if (!error) {
            currentSession = session;
            sessionError = null;
            break;
          }
          sessionError = error;
          await new Promise((r) => setTimeout(r, 1000 * attempt));
        }

        if (sessionError) {
          console.error('Erro ao obter sessão:', sessionError);
          if (mounted) {
            // Não bloquear o app: limpar loading e permitir navegação pública
            setLoading(false);
            setError('Erro ao verificar autenticação');
          }
          return;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }

        // Se há usuário logado, buscar perfil
        if (currentSession?.user && mounted) {
          await fetchUserProfile(currentSession.user.id);
        } else if (mounted) {
          setLoading(false);
        }

      } catch (error) {
        console.error('Erro na inicialização:', error);
        if (mounted) {
          setError('Erro ao inicializar autenticação');
          setLoading(false);
        }
      }
    };

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user || null);
        setError(null);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    initializeAuth();

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      setError(null);
      console.log('Buscando perfil para usuário:', userId);
      
      const { data, error: supabaseError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (supabaseError) {
        console.error('Erro do Supabase ao buscar perfil:', supabaseError);
        
        // Se a tabela não existe ou há problema de RLS, criar perfil básico
        if (supabaseError.code === 'PGRST116' || 
            supabaseError.message.includes('relation "users" does not exist') ||
            supabaseError.code === '42P01') {
          
          console.log('Tabela users não existe, criando perfil básico');
          const basicProfile: UserProfile = {
            id: userId,
            email: user?.email || '',
            role: 'usuario',
            status: 'active',
            email_verified: user?.email_confirmed_at !== null,
            phone_verified: false,
            profile_completed: true,
            last_login_at: new Date().toISOString(),
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setProfile(basicProfile);
          return;
        }
        
        // Outros erros - criar perfil básico para não travar
        console.log('Erro ao buscar perfil, criando perfil básico:', supabaseError.message);
        const basicProfile: UserProfile = {
          id: userId,
          email: user?.email || '',
          role: 'usuario',
          status: 'active',
          email_verified: user?.email_confirmed_at !== null,
          phone_verified: false,
          profile_completed: true,
          last_login_at: new Date().toISOString(),
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(basicProfile);
        return;
      }

      if (data) {
        console.log('Perfil carregado:', data);
        setProfile(data);
      } else {
        console.log('Nenhum perfil encontrado, criando perfil básico');
        // Criar perfil básico diretamente sem tentar sincronizar
        const basicProfile: UserProfile = {
          id: userId,
          email: user?.email || '',
          role: 'usuario',
          status: 'active',
          email_verified: user?.email_confirmed_at !== null,
          phone_verified: false,
          profile_completed: true,
          last_login_at: new Date().toISOString(),
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(basicProfile);
      }
    } catch (error) {
      console.error('Erro ao buscar perfil do usuário:', error);
      logger.error('Erro ao buscar perfil do usuário:', error);
      
      // Em caso de erro, criar perfil básico para não travar
      const basicProfile: UserProfile = {
        id: userId,
        email: user?.email || '',
        role: 'usuario',
        status: 'active',
        email_verified: user?.email_confirmed_at !== null,
        phone_verified: false,
        profile_completed: true,
        last_login_at: new Date().toISOString(),
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(basicProfile);
    } finally {
      // SEMPRE definir loading como false
      console.log('Finalizando carregamento do perfil');
      setLoading(false);
    }
  };

  const syncUserWithDatabase = async (authUser: User) => {
    try {
      console.log('Sincronizando usuário com banco de dados:', authUser.email);
      
      // Verificar se o usuário já existe na tabela users
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Erro ao verificar usuário existente:', fetchError);
        return;
      }

      if (!existingUser) {
        console.log('Criando novo usuário no banco de dados');
        // Criar usuário na tabela users se não existir
        const { error } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            role: 'usuario',
            status: 'active',
            email_verified: authUser.email_confirmed_at !== null,
            profile_completed: true,
            last_login_at: new Date().toISOString(),
            metadata: {
              created_at: authUser.created_at,
              last_sign_in: authUser.last_sign_in_at,
              ...authUser.user_metadata
            }
          });

        if (error) {
          console.error('Erro ao criar usuário:', error);
          logger.error('Erro ao criar usuário na tabela users:', error);
        } else {
          console.log('Usuário criado com sucesso');
        }
      } else {
        console.log('Atualizando usuário existente');
        // Atualizar última vez que fez login
        const { error } = await supabase
          .from('users')
          .update({
            last_login_at: new Date().toISOString(),
            metadata: {
              ...existingUser.metadata,
              last_sign_in: authUser.last_sign_in_at,
              ...authUser.user_metadata
            }
          })
          .eq('id', authUser.id);

        if (error) {
          console.error('Erro ao atualizar usuário:', error);
          logger.error('Erro ao atualizar usuário:', error);
        }
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      logger.error('Erro ao sincronizar usuário:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        await syncUserWithDatabase(data.user);
      }

      return { error: null };
    } catch (error: any) {
      logger.error('Erro no login:', error);
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) throw error;

      return { error: null };
    } catch (error: any) {
      logger.error('Erro no registro:', error);
      setError(error.message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error: any) {
      logger.error('Erro no logout:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      logger.error('Erro ao resetar senha:', error);
      return { error };
    }
  };

  const refreshProfile = async () => {
    if (user) {
      setLoading(true);
      await fetchUserProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    isAdmin,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
