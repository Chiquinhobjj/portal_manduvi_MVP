import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { VantaBackground } from '../components/VantaBackground';
import { Shield, AlertCircle, CheckCircle } from 'lucide-react';

export function SetupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [setupComplete, setSetupComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  async function checkIfSetupNeeded() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, role')
        .eq('role', 'admin')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSetupComplete(true);
      }
    } catch (error) {
      console.error('Error checking setup:', error);
    } finally {
      setCheckingSetup(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }

    setLoading(true);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('Falha ao criar usuário');
      }

      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email: authData.user.email!,
        role: 'admin',
        status: 'active',
        email_verified: true,
        profile_completed: true,
      });

      if (userError) throw userError;

      const { error: profileError } = await supabase.from('admin_profiles').insert({
        user_id: authData.user.id,
        full_name: fullName,
        department: department || null,
        access_level: 'super',
      });

      if (profileError) throw profileError;

      const { error: notifPrefError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: authData.user.id,
        });

      if (notifPrefError) throw notifPrefError;

      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Setup error:', error);
      setError(
        error.message || 'Erro ao criar conta de administrador. Tente novamente.'
      );
      setLoading(false);
    }
  }

  if (checkingSetup) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <VantaBackground />
        <div className="text-center relative z-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-ui-muted dark:text-dark-muted">
            Verificando configuração...
          </p>
        </div>
      </div>
    );
  }

  if (setupComplete) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <VantaBackground />
        <div className="w-full max-w-md text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-4">
            Sistema Já Configurado
          </h1>
          <p className="text-ui-muted dark:text-dark-muted mb-6">
            O administrador do sistema já foi criado. Você pode fazer login normalmente.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-dark"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
        <VantaBackground />
        <div className="w-full max-w-md text-center relative z-10">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-3">
              <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-4">
            Administrador Criado!
          </h1>
          <p className="text-ui-muted dark:text-dark-muted mb-6">
            Sua conta de administrador foi criada com sucesso. Você será redirecionado
            para a página de login.
          </p>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <VantaBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-brand/10 p-3">
              <Shield className="h-12 w-12 text-brand" />
            </div>
          </div>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
            Configuração Inicial
          </h1>
          <p className="text-ui-muted dark:text-dark-muted">
            Crie a primeira conta de administrador do sistema
          </p>
        </div>

        <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8 shadow-sm">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Nome Completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="João da Silva"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="admin@manduvi.org"
              />
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Departamento (opcional)
              </label>
              <input
                id="department"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="TI, Administração, etc."
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Senha *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Confirmar Senha *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="Repita sua senha"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Criando administrador...</span>
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  <span>Criar Administrador</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
