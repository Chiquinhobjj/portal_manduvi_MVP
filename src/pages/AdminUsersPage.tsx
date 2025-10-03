import { type JSX, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Building2,
  CircleUser as UserCircle,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../lib/logger';
import type { ManduviRole, ManduviUserStatus, UserProfile } from '../lib/types';
import { fetchAdminUsers, updateAdminUserStatus } from '../admin/services/users';

const roleBadges: Record<ManduviRole, { icon: JSX.Element; label: string }> = {
  admin: { icon: <Shield className="h-4 w-4" />, label: 'Administrador' },
  empresa: { icon: <Building2 className="h-4 w-4" />, label: 'Empresa' },
  terceiro_setor: { icon: <Users className="h-4 w-4" />, label: 'Terceiro Setor' },
  orgao_publico: { icon: <Shield className="h-4 w-4" />, label: 'Órgão Público' },
  colaborador: { icon: <Briefcase className="h-4 w-4" />, label: 'Colaborador' },
  usuario: { icon: <UserCircle className="h-4 w-4" />, label: 'Usuário' },
};

const statusDescriptors: Record<
  ManduviUserStatus,
  { label: string; tone: 'success' | 'warning' | 'danger'; icon: JSX.Element }
> = {
  active: {
    label: 'Ativo',
    tone: 'success',
    icon: <CheckCircle className="h-4 w-4" />,
  },
  pending: {
    label: 'Pendente',
    tone: 'warning',
    icon: <Clock className="h-4 w-4" />,
  },
  suspended: {
    label: 'Suspenso',
    tone: 'danger',
    icon: <XCircle className="h-4 w-4" />,
  },
  deleted: {
    label: 'Removido',
    tone: 'danger',
    icon: <XCircle className="h-4 w-4" />,
  },
};

function getStatusClasses(tone: 'success' | 'warning' | 'danger') {
  switch (tone) {
    case 'success':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300';
    case 'warning':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
    case 'danger':
    default:
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300';
  }
}

export function AdminUsersPage() {
  const { isAdmin, profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | ManduviRole>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | ManduviUserStatus>('all');
  const [updatingUser, setUpdatingUser] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    fetchUsers();
  }, [isAdmin, navigate]);

  async function fetchUsers() {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (error) {
      logger.error('Error fetching users:', error);
      alert(error instanceof Error ? error.message : 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUserStatus(userId: string, newStatus: ManduviUserStatus) {
    try {
      setUpdatingUser(userId);
      await updateAdminUserStatus({ userId, status: newStatus, actorId: profile?.id });
      setUsers((prev) =>
        prev.map((user) => (user.id === userId ? { ...user, status: newStatus } : user))
      );
    } catch (error) {
      logger.error('Error updating user status:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar status do usuário.');
    } finally {
      setUpdatingUser(null);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, filterRole, filterStatus]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent" />
          <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="bg-gradient-to-b from-brand/10 to-transparent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-brand/10 p-3">
              <Users className="h-8 w-8 text-brand" />
            </div>
            <div>
              <h1 className="text-4xl font-brand font-bold text-ui-text dark:text-dark-text">
                Gerenciar Usuários
              </h1>
              <p className="text-lg text-ui-muted dark:text-dark-muted">
                {filteredUsers.length} usuário(s) encontrado(s)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <input
              type="text"
              placeholder="Buscar por email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <select
              value={filterRole}
              onChange={(event) => setFilterRole(event.target.value as typeof filterRole)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none"
            >
              <option value="all">Todos os perfis</option>
              {Object.entries(roleBadges).map(([role, config]) => (
                <option key={role} value={role}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <select
              value={filterStatus}
              onChange={(event) => setFilterStatus(event.target.value as typeof filterStatus)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none"
            >
              <option value="all">Todos os status</option>
              {Object.entries(statusDescriptors).map(([status, descriptor]) => (
                <option key={status} value={status}>
                  {descriptor.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ui-bg dark:bg-dark-bg border-b border-ui-border dark:border-dark-border">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Perfil
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border dark:divide-dark-border">
                {filteredUsers.map((user) => {
                  const roleBadge = roleBadges[user.role];
                  const statusDescriptor = statusDescriptors[user.status];

                  return (
                    <tr key={user.id} className="hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-ui-text dark:text-dark-text">{user.email}</p>
                            <p className="text-xs text-ui-muted dark:text-dark-muted">
                              criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                          {roleBadge?.icon}
                          {roleBadge?.label ?? 'Indefinido'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                            statusDescriptor?.tone ?? 'warning'
                          )}`}
                        >
                          {statusDescriptor?.icon}
                          {statusDescriptor?.label ?? 'Desconhecido'}
                          {updatingUser === user.id && <Loader2 className="h-4 w-4 animate-spin" />}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'active')}
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 px-3 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors disabled:opacity-40"
                            disabled={user.status === 'active' || updatingUser === user.id}
                          >
                            <CheckCircle className="h-4 w-4" />
                            {user.status === 'pending' ? 'Aprovar' : 'Ativar'}
                          </button>
                          <button
                            onClick={() => handleUpdateUserStatus(user.id, 'suspended')}
                            className="inline-flex items-center gap-1 rounded-lg border border-amber-500/40 px-3 py-1 text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors disabled:opacity-40"
                            disabled={user.status === 'suspended' || updatingUser === user.id}
                          >
                            <XCircle className="h-4 w-4" />
                            Suspender
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-ui-muted dark:text-dark-muted"
                    >
                      Nenhum usuário encontrado com os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
