import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Filter, CheckCircle, XCircle, Clock, Shield, Building2, CircleUser as UserCircle, Briefcase } from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  email_verified: boolean;
  profile_completed: boolean;
  created_at: string;
  last_login_at: string | null;
}

export function AdminUsersPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  async function fetchUsers() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  async function updateUserStatus(userId: string, newStatus: string) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`;
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update user');

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Erro ao atualizar status do usuário');
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-ui-muted dark:text-dark-muted">
            Carregando usuários...
          </p>
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
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text placeholder-ui-muted dark:placeholder-dark-muted focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none"
            >
              <option value="all">Todos os perfis</option>
              <option value="admin">Administrador</option>
              <option value="empresa">Empresa</option>
              <option value="terceiro_setor">Terceiro Setor</option>
              <option value="orgao_publico">Órgão Público</option>
              <option value="colaborador">Colaborador</option>
              <option value="usuario">Usuário</option>
            </select>
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ui-muted dark:text-dark-muted" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none"
            >
              <option value="all">Todos os status</option>
              <option value="pending">Pendente</option>
              <option value="active">Ativo</option>
              <option value="suspended">Suspenso</option>
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
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          {getRoleIcon(user.role)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-ui-text dark:text-dark-text">
                            {user.email}
                          </div>
                          <div className="text-xs text-ui-muted dark:text-dark-muted">
                            ID: {user.id.substring(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ui-muted dark:text-dark-muted">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {user.status === 'pending' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Aprovar
                          </button>
                        )}
                        {user.status === 'active' && (
                          <button
                            onClick={() =>
                              updateUserStatus(user.id, 'suspended')
                            }
                            className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-500/20 transition-all"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Suspender
                          </button>
                        )}
                        {user.status === 'suspended' && (
                          <button
                            onClick={() => updateUserStatus(user.id, 'active')}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-400 hover:bg-green-500/20 transition-all"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-ui-muted dark:text-dark-muted mx-auto mb-4" />
              <p className="text-ui-muted dark:text-dark-muted">
                Nenhum usuário encontrado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getRoleIcon(role: string) {
  const iconClass = 'h-6 w-6 text-brand';
  switch (role) {
    case 'admin':
      return <Shield className={iconClass} />;
    case 'empresa':
      return <Building2 className={iconClass} />;
    case 'terceiro_setor':
      return <Users className={iconClass} />;
    case 'orgao_publico':
      return <Shield className={iconClass} />;
    case 'colaborador':
      return <Briefcase className={iconClass} />;
    default:
      return <UserCircle className={iconClass} />;
  }
}

function getRoleLabel(role: string) {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    empresa: 'Empresa',
    terceiro_setor: 'Terceiro Setor',
    orgao_publico: 'Órgão Público',
    colaborador: 'Colaborador',
    usuario: 'Usuário',
  };
  return labels[role] || role;
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'active':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Ativo
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
          <Clock className="h-3.5 w-3.5" />
          Pendente
        </span>
      );
    case 'suspended':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5" />
          Suspenso
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-500/10 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:text-gray-400">
          {status}
        </span>
      );
  }
}
