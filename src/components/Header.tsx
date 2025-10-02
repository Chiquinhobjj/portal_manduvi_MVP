import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Moon, Sun, ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface MenuItem {
  slug: string;
  title: string;
  order_index: number;
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Menu estático
  const staticMenuItems: MenuItem[] = [
    { slug: 'editais', title: 'Editais', order_index: 1 },
    { slug: 'iniciativas', title: 'Iniciativas', order_index: 2 },
    { slug: 'instituto', title: 'Instituto', order_index: 3 },
    { slug: 'noticias', title: 'Notícias', order_index: 4 },
    { slug: 'servicos', title: 'Serviços', order_index: 5 },
    { slug: 'dados', title: 'Dados', order_index: 6 },
  ];

  useEffect(() => {
    setMenuItems(staticMenuItems);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ui-border dark:border-dark-border bg-ui-bg/95 dark:bg-dark-bg/95 backdrop-blur supports-[backdrop-filter]:bg-ui-bg/60 dark:supports-[backdrop-filter]:bg-dark-bg/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <img 
                src={theme === 'light' ? '/logo_manduvi_escura.svg' : '/logo_manduvi_branca.svg'} 
                alt="Manduvi" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Menu Desktop */}
          <nav className="hidden lg:flex lg:items-center lg:space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.slug}
                to={`/${item.slug}`}
                className="text-sm font-medium text-ui-text dark:text-dark-text transition-colors hover:text-brand dark:hover:text-brand"
              >
                {item.title}
              </Link>
            ))}
          </nav>

          {/* Controles do lado direito */}
          <div className="flex items-center space-x-4">
            {/* Toggle de tema */}
            <button
              onClick={toggleTheme}
              className="rounded-lg p-2 text-ui-muted dark:text-dark-muted transition-all hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
              aria-label="Alternar tema"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Menu do usuário ou botão de login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="hidden lg:flex items-center gap-2 rounded-lg bg-ui-panel dark:bg-dark-panel px-3 py-2 text-sm font-medium text-ui-text dark:text-dark-text transition-all hover:bg-ui-bg dark:hover:bg-dark-bg"
                >
                  <User className="h-4 w-4" />
                  <span className="max-w-32 truncate">{user.email}</span>
                  <ChevronDown className="h-4 w-4" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border shadow-lg z-50">
                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User className="h-4 w-4" />
                        Perfil
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Globe className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg"
                      >
                        <LogOut className="h-4 w-4" />
                        Sair
                      </button>
                    </div>
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

            {/* Menu Mobile */}
            <button
              onClick={toggleMenu}
              className="lg:hidden flex items-center justify-center rounded-lg p-2 text-ui-muted dark:text-dark-muted transition-all hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-ui-text dark:hover:text-dark-text"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Expandido */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.slug}
                  to={`/${item.slug}`}
                  className="block rounded-md px-3 py-2 text-base font-medium text-ui-text dark:text-dark-text hover:bg-ui-panel dark:hover:bg-dark-panel hover:text-brand dark:hover:text-brand"
                  onClick={closeMenu}
                >
                  {item.title}
                </Link>
              ))}
              
              {!user && (
                <Link
                  to="/login"
                  className="block rounded-md px-3 py-2 text-base font-medium text-brand hover:bg-ui-panel dark:hover:bg-dark-panel"
                  onClick={closeMenu}
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
