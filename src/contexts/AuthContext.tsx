import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AuthError, Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import type { AdminAuthContext, UserProfile } from '../lib/types';

const AuthContext = createContext<AdminAuthContext | undefined>(undefined);

function buildFallbackProfile(user: User | null): UserProfile {
  const generatedId =
    user?.id ??
    (typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `fallback-${Date.now()}`);

  return {
    id: generatedId,
    email: user?.email ?? '',
    role: 'usuario',
    status: 'active',
    email_verified: Boolean(user?.email_confirmed_at),
    phone_verified: false,
    profile_completed: true,
    last_login_at: new Date().toISOString(),
    metadata: (user?.user_metadata as Record<string, unknown> | undefined) ?? {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    name: typeof user?.user_metadata?.name === 'string' ? user?.user_metadata?.name : undefined,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = profile?.role === 'admin';

  const fetchUserProfile = useCallback(
    async (userId: string) => {
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
            setProfile(buildFallbackProfile(user ?? null));
            return;
          }
          
          // Outros erros - criar perfil básico para não travar
          console.log('Erro ao buscar perfil, criando perfil básico:', supabaseError.message);
          setProfile(buildFallbackProfile(user ?? null));
          return;
        }

        if (data) {
          console.log('Perfil carregado:', data);
          setProfile({
            ...data,
            metadata: (data.metadata as Record<string, unknown> | undefined) ?? {},
          });
        } else {
          console.log('Nenhum perfil encontrado, criando perfil básico');
          // Criar perfil básico diretamente sem tentar sincronizar
          setProfile(buildFallbackProfile(user ?? null));
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        logger.error('Erro ao buscar perfil do usuário:', error);
        
        // Em caso de erro, criar perfil básico para não travar
        setProfile(buildFallbackProfile(user ?? null));
      } finally {
        // SEMPRE definir loading como false
        console.log('Finalizando carregamento do perfil');
        setLoading(false);
      }
    },
    [user]
  );

  useEffect(() => {
    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (!mounted) return;
      setLoading((prev) => {
        if (!prev) {
          return prev;
        }
        console.warn('Autenticação demorando... mantendo app utilizável');
        return false;
      });
    }, 30000);

    const initializeAuth = async () => {
      try {
        console.log('Inicializando autenticação...');

        let currentSession: Session | null = null;
        let sessionError: AuthError | null = null;
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
            setLoading(false);
            setError('Erro ao verificar autenticação');
          }
          return;
        }

        if (mounted) {
          setSession(currentSession);
          setUser(currentSession?.user || null);
        }

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
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const syncUserWithDatabase = useCallback(async (authUser: User) => {
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
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
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
      } catch (error) {
        logger.error('Erro no login:', error);
        const message = error instanceof Error ? error.message : 'Erro ao efetuar login';
        setError(message);
        return { error: error as AuthError };
      } finally {
        setLoading(false);
      }
    },
    [syncUserWithDatabase]
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      metadata?: Record<string, unknown>
    ) => {
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
      } catch (error) {
        logger.error('Erro no registro:', error);
        const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
        setError(message);
        return { error: error as AuthError };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setProfile(null);
    } catch (error) {
      logger.error('Erro no logout:', error);
      const message = error instanceof Error ? error.message : 'Erro ao sair';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { error: null };
    } catch (error) {
      logger.error('Erro ao resetar senha:', error);
      return { error: error as AuthError };
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      setLoading(true);
      await fetchUserProfile(user.id);
    }
  }, [fetchUserProfile, user]);

  const value = useMemo<AdminAuthContext>(
    () => ({
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
    }),
    [
      error,
      isAdmin,
      loading,
      profile,
      session,
      signIn,
      signOut,
      signUp,
      resetPassword,
      refreshProfile,
      user,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
