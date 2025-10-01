import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../contexts/AuthContext';
import { VantaBackground } from '../components/VantaBackground';
import { UserPlus, AlertCircle, CheckCircle, Building2, Users, Briefcase, User, Shield } from 'lucide-react';

const roleOptions: { value: UserRole; label: string; description: string; icon: any }[] = [
  {
    value: 'usuario',
    label: 'Usuário',
    description: 'Pessoa física interessada em acompanhar editais e iniciativas',
    icon: User,
  },
  {
    value: 'empresa',
    label: 'Empresa',
    description: 'Empresas privadas interessadas em parcerias e editais',
    icon: Building2,
  },
  {
    value: 'terceiro_setor',
    label: 'Terceiro Setor',
    description: 'ONGs, OSCIPs e organizações da sociedade civil',
    icon: Users,
  },
  {
    value: 'orgao_publico',
    label: 'Órgão Público',
    description: 'Instituições governamentais e autarquias',
    icon: Shield,
  },
  {
    value: 'colaborador',
    label: 'Colaborador',
    description: 'Profissionais e consultores independentes',
    icon: Briefcase,
  },
];

export function RegisterPage() {
  const [step, setStep] = useState<'role' | 'form'>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  function handleRoleSelect(role: UserRole) {
    setSelectedRole(role);
    setStep('form');
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

    if (!acceptTerms) {
      setError('Você deve aceitar os termos e condições.');
      return;
    }

    if (!selectedRole) {
      setError('Selecione um tipo de perfil.');
      return;
    }

    setLoading(true);

    const { error } = await signUp(email, password, selectedRole);

    if (error) {
      setError(error.message || 'Erro ao criar conta. Por favor, tente novamente.');
      setLoading(false);
    } else {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }
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
            Conta Criada!
          </h1>
          <p className="text-ui-muted dark:text-dark-muted mb-6">
            Sua conta foi criada com sucesso. Você será redirecionado para a página de login.
          </p>
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (step === 'role') {
    return (
      <div className="min-h-screen relative px-4 py-12">
        <VantaBackground />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-12">
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
              Criar Conta
            </h1>
            <p className="text-ui-muted dark:text-dark-muted">
              Selecione o tipo de perfil que melhor descreve você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {roleOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => handleRoleSelect(option.value)}
                  className="flex items-start gap-4 p-6 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-left transition-all hover:border-brand hover:shadow-md"
                >
                  <div className="rounded-lg bg-brand/10 p-3 flex-shrink-0">
                    <Icon className="h-6 w-6 text-brand" />
                  </div>
                  <div>
                    <h3 className="font-medium text-ui-text dark:text-dark-text mb-1">
                      {option.label}
                    </h3>
                    <p className="text-sm text-ui-muted dark:text-dark-muted">
                      {option.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-ui-muted dark:text-dark-muted">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
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
          <button
            onClick={() => setStep('role')}
            className="mb-4 text-sm text-brand hover:text-brand-dark transition-colors"
          >
            ← Voltar para seleção de perfil
          </button>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
            Criar Conta
          </h1>
          <p className="text-ui-muted dark:text-dark-muted">
            Perfil: {roleOptions.find((r) => r.value === selectedRole)?.label}
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
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2"
              >
                Confirmar Senha
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

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-ui-border dark:border-dark-border text-brand focus:ring-brand"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-ui-muted dark:text-dark-muted">
                Eu aceito os{' '}
                <a href="/termos" className="text-brand hover:text-brand-dark">
                  termos e condições
                </a>{' '}
                e a{' '}
                <a href="/privacidade" className="text-brand hover:text-brand-dark">
                  política de privacidade
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white transition-all hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                  <span>Criando conta...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  <span>Criar Conta</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-ui-muted dark:text-dark-muted">
              Já tem uma conta?{' '}
              <Link
                to="/login"
                className="font-medium text-brand hover:text-brand-dark transition-colors"
              >
                Entrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
