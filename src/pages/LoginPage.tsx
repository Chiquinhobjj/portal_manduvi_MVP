import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VantaBackground } from '../components/VantaBackground';
import { LogIn, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('Email ou senha inválidos. Por favor, tente novamente.');
      setLoading(false);
    } else {
      navigate(from, { replace: true });
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12">
      <VantaBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link to="/" className="inline-block mb-6">
            <img
              src="/logo_manduvi_escura.svg"
              alt="Manduvi"
              className="h-8 dark:hidden"
            />
            <img
              src="/logo_manduvi_branca.svg"
              alt="Manduvi"
              className="h-8 hidden dark:inline-block"
            />
          </Link>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
            Entrar
          </h1>
          <p className="text-ui-muted dark:text-dark-muted">
            Acesse sua conta Manduvi
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
                htmlFor="email"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-ui-border dark:border-dark-border text-brand focus:ring-brand"
                />
                <span className="ml-2 text-sm text-ui-muted dark:text-dark-muted">
                  Lembrar de mim
                </span>
              </label>

              <Link
                to="/forgot-password"
                className="text-sm font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Esqueceu a senha?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  <span>Entrar</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ui-muted dark:text-dark-muted">
              Não tem uma conta?{' '}
              <Link
                to="/register"
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
