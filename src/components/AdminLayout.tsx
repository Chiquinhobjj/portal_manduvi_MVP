import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Image,
  FileText,
  Settings,
  Users,
  File as FileEdit,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import { cn } from '../lib/utils';

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

interface NavItem {
  label: string;
  path: string;
  icon: IconComponent;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Banners', path: '/admin/banners', icon: Image },
  { label: 'Conteúdo', path: '/admin/content', icon: FileText },
  { label: 'Mídia', path: '/admin/media', icon: FileEdit },
  { label: 'Editais', path: '/admin/editais', icon: FileEdit },
  { label: 'Usuários', path: '/admin/users', icon: Users },
  { label: 'Configurações', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  function toggleSidebar() {
    setSidebarOpen((prev) => !prev);
  }

  const adminDisplayName = profile?.name
    || (typeof profile?.metadata?.display_name === 'string'
      ? profile?.metadata?.display_name
      : undefined)
    || profile?.email
    || 'Administrador';

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="flex">
        <aside
          className={cn(
            'fixed left-0 top-0 z-40 h-screen transition-transform duration-300 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full',
            'w-64 bg-ui-panel dark:bg-dark-panel border-r border-ui-border dark:border-dark-border'
          )}
        >
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-ui-border dark:border-dark-border p-6">
              <Link to="/" className="flex items-center gap-2">
                <img
                  src="/logo_manduvi_escura.svg"
                  alt="Manduvi"
                  className="h-8 dark:hidden"
                />
                <img
                  src="/logo_manduvi_branca.svg"
                  alt="Manduvi"
                  className="hidden h-8 dark:block"
                />
              </Link>
              <button
                onClick={toggleSidebar}
                className="lg:hidden rounded-lg p-2 hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-brand text-white'
                          : 'text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg'
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                      {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            </nav>

            <div className="border-t border-ui-border dark:border-dark-border p-4">
              <div className="mb-3 rounded-lg bg-ui-bg dark:bg-dark-bg p-3">
                <p className="text-sm font-medium text-ui-text dark:text-dark-text">
                  {adminDisplayName}
                </p>
                <p className="text-xs text-ui-muted dark:text-dark-muted">
                  {profile?.email}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </aside>

        <div
          className={cn(
            'flex-1 transition-all duration-300 ease-in-out',
            sidebarOpen ? 'lg:ml-64' : 'ml-0'
          )}
        >
          <header className="sticky top-0 z-30 border-b border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
            <div className="flex items-center justify-between px-6 py-4">
              <button
                onClick={toggleSidebar}
                className="rounded-lg p-2 hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>

              <div className="flex items-center gap-4">
                <Link
                  to="/"
                  className="text-sm font-medium text-ui-text dark:text-dark-text hover:text-brand transition-colors"
                >
                  Ver Site
                </Link>
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
