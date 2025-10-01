import { Link } from 'react-router-dom';
import { Search, Menu, X, Globe, Moon, Sun, ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Initiative {
  slug: string;
  name: string;
  featured: boolean;
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [iniciativasDropdownOpen, setIniciativasDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [initiatives, setInitiatives] = useState<Initiative[]>([]);
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, isAdmin } = useAuth();

  useEffect(() => {
    fetchInitiatives();
  }, []);

  async function fetchInitiatives() {
    const { data } = await supabase
      .from('initiatives')
      .select('slug, name, featured')
      .eq('status', 'active')
      .order('order_index');

    if (data) {
      setInitiatives(data);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-ui-border dark:border-dark-border bg-ui-bg/95 dark:bg-dark-bg/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3">
              <img
                src={theme === 'light' ? '/logo_manduvi_escura.svg' : '/logo_manduvi_branca.svg'}
                alt="Manduvi"
                className="h-6"
              />
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              <NavLink to="/noticias">notícias</NavLink>
              <NavLink to="/servicos">serviços</NavLink>
              <NavLink to="/dados">dados</NavLink>
              <NavLink to="/temas">temas</NavLink>
              <NavLink to="/editais">editais</NavLink>
              <div className="relative">
                <button
                  onMouseEnter={() => setIniciativasDropdownOpen(true)}
                  onMouseLeave={() => setIniciativasDropdownOpen(false)}
                  className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
                >
                  iniciativas
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${iniciativasDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {iniciativasDropdownOpen && (
                  <div
                    onMouseEnter={() => setIniciativasDropdownOpen(true)}
                    onMouseLeave={() => setIniciativasDropdownOpen(false)}
                    className="absolute top-full left-0 mt-1 w-64 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel shadow-lg overflow-hidden max-h-[80vh] overflow-y-auto"
                  >
                    <Link
                      to="/iniciativas"
                      className="block px-4 py-2.5 text-sm font-medium text-ui-text dark:text-dark-text transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg border-b border-ui-border dark:border-dark-border"
                    >
                      Todas iniciativas
                    </Link>
                    {initiatives.map((initiative) => (
                      <Link
                        key={initiative.slug}
                        to={`/iniciativas/${initiative.slug}`}
                        className="block px-4 py-2.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
                      >
                        {initiative.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="hidden sm:flex items-center gap-2 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel px-3 py-1.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:border-brand hover:text-ui-text dark:hover:text-dark-text"
              aria-label="Buscar"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:inline">Buscar</span>
              <kbd className="hidden md:inline rounded bg-ui-bg dark:bg-dark-bg px-1.5 py-0.5 text-xs">⌘K</kbd>
            </button>

            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-lg p-2 text-ui-muted dark:text-dark-muted transition-all hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
              aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            <button
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:text-ui-text dark:hover:text-dark-text"
              aria-label="Idioma"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">PT</span>
            </button>

            {user && profile ? (
              <div className="relative hidden lg:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 200)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ui-text dark:text-dark-text transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand/10 text-brand">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden xl:inline">{profile.email.split('@')[0]}</span>
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel shadow-lg overflow-hidden">
                    <div className="px-4 py-3 border-b border-ui-border dark:border-dark-border">
                      <p className="text-sm font-medium text-ui-text dark:text-dark-text truncate">
                        {profile.email}
                      </p>
                      <p className="text-xs text-ui-muted dark:text-dark-muted capitalize">
                        {profile.role.replace('_', ' ')}
                      </p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
                    >
                      Dashboard
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/users"
                        className="block px-4 py-2.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
                      >
                        Gerenciar Usuários
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      className="block px-4 py-2.5 text-sm text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
                    >
                      Perfil
                    </Link>
                    <button
                      onClick={signOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sair</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="hidden lg:flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-dark"
              >
                <User className="h-4 w-4" />
                <span>Entrar</span>
              </Link>
            )}

            <button
              className="lg:hidden rounded-lg p-2 text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
          <nav className="mx-auto max-w-7xl px-4 py-4 space-y-1">
            <MobileNavLink to="/noticias" onClick={() => setMobileMenuOpen(false)}>
              notícias
            </MobileNavLink>
            <MobileNavLink to="/servicos" onClick={() => setMobileMenuOpen(false)}>
              serviços
            </MobileNavLink>
            <MobileNavLink to="/dados" onClick={() => setMobileMenuOpen(false)}>
              dados
            </MobileNavLink>
            <MobileNavLink to="/temas" onClick={() => setMobileMenuOpen(false)}>
              temas
            </MobileNavLink>
            <MobileNavLink to="/editais" onClick={() => setMobileMenuOpen(false)}>
              editais
            </MobileNavLink>
            <div>
              <button
                onClick={() => setIniciativasDropdownOpen(!iniciativasDropdownOpen)}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-base font-medium text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
              >
                iniciativas
                <ChevronDown className={`h-4 w-4 transition-transform ${iniciativasDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {iniciativasDropdownOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <MobileNavLink to="/iniciativas" onClick={() => setMobileMenuOpen(false)}>
                    Todas iniciativas
                  </MobileNavLink>
                  {initiatives.map((initiative) => (
                    <MobileNavLink
                      key={initiative.slug}
                      to={`/iniciativas/${initiative.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {initiative.name}
                    </MobileNavLink>
                  ))}
                </div>
              )}
            </div>
            {user && profile ? (
              <>
                <div className="pt-4 mt-4 border-t border-ui-border dark:border-dark-border">
                  <MobileNavLink to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </MobileNavLink>
                  {isAdmin && (
                    <MobileNavLink to="/admin/users" onClick={() => setMobileMenuOpen(false)}>
                      Gerenciar Usuários
                    </MobileNavLink>
                  )}
                  <MobileNavLink to="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Perfil
                  </MobileNavLink>
                  <button
                    onClick={() => {
                      signOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-red-600 dark:text-red-400 transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sair</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="pt-4 mt-4 border-t border-ui-border dark:border-dark-border">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-brand px-4 py-3 text-base font-medium text-white transition-all hover:bg-brand-dark justify-center"
                >
                  <User className="h-4 w-4" />
                  <span>Entrar</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="rounded-lg px-3 py-2 text-sm font-medium text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  to,
  onClick,
  children,
}: {
  to: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-base font-medium text-ui-muted dark:text-dark-muted transition-colors hover:bg-ui-bg dark:hover:bg-dark-bg hover:text-ui-text dark:hover:text-dark-text"
    >
      {children}
    </Link>
  );
}
