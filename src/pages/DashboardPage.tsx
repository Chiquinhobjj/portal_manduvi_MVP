import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  UserCheck,
  AlertCircle,
  Calendar,
  BarChart3,
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalEditais: number;
  totalApplications: number;
  activeUsers: number;
  newUsersThisMonth: number;
  pendingApplications: number;
}

export function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEditais: 0,
    totalApplications: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchAdminStats();
    } else {
      fetchUserStats();
    }
  }, [isAdmin]);

  async function fetchAdminStats() {
    try {
      const [usersResult, editaisResult, applicationsResult] = await Promise.all([
        supabase.from('users').select('id, status, created_at'),
        supabase.from('editais').select('id, status'),
        supabase.from('editais_applications').select('id, status'),
      ]);

      const users = usersResult.data || [];
      const editais = editaisResult.data || [];
      const applications = applicationsResult.data || [];

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalUsers: users.length,
        totalEditais: editais.length,
        totalApplications: applications.length,
        activeUsers: users.filter((u) => u.status === 'active').length,
        newUsersThisMonth: users.filter(
          (u) => new Date(u.created_at) >= firstDayOfMonth
        ).length,
        pendingApplications: applications.filter((a) => a.status === 'submitted')
          .length,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserStats() {
    try {
      const { data: applications } = await supabase
        .from('editais_applications')
        .select('id, status')
        .eq('user_id', profile?.id);

      const { data: favorites } = await supabase
        .from('editais_favorites')
        .select('id')
        .eq('user_id', profile?.id);

      setStats({
        totalUsers: 0,
        totalEditais: 0,
        totalApplications: applications?.length || 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        pendingApplications:
          applications?.filter((a) => a.status === 'submitted').length || 0,
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
          <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="bg-gradient-to-b from-brand/10 to-transparent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h1 className="mb-2 text-4xl font-brand font-bold text-ui-text dark:text-dark-text">
            Dashboard
          </h1>
          <p className="text-lg text-ui-muted dark:text-dark-muted">
            {isAdmin
              ? 'Visão geral do sistema e análises'
              : 'Acompanhe suas atividades e estatísticas'}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {isAdmin ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <StatCard
                icon={Users}
                label="Total de Usuários"
                value={stats.totalUsers}
                trend={`+${stats.newUsersThisMonth} este mês`}
                color="blue"
              />
              <StatCard
                icon={FileText}
                label="Total de Editais"
                value={stats.totalEditais}
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                label="Candidaturas"
                value={stats.totalApplications}
                trend={`${stats.pendingApplications} pendentes`}
                color="purple"
              />
              <StatCard
                icon={UserCheck}
                label="Usuários Ativos"
                value={stats.activeUsers}
                color="teal"
              />
              <StatCard
                icon={AlertCircle}
                label="Pendentes"
                value={stats.pendingApplications}
                color="orange"
              />
              <StatCard
                icon={Activity}
                label="Novos este Mês"
                value={stats.newUsersThisMonth}
                color="indigo"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-brand/10 p-2">
                    <BarChart3 className="h-5 w-5 text-brand" />
                  </div>
                  <h2 className="text-xl font-medium text-ui-text dark:text-dark-text">
                    Acesso Rápido
                  </h2>
                </div>
                <div className="space-y-3">
                  <QuickLink href="/admin/users" label="Gerenciar Usuários" />
                  <QuickLink href="/admin/editais" label="Gerenciar Editais" />
                  <QuickLink href="/admin/applications" label="Revisar Candidaturas" />
                  <QuickLink href="/admin/custom-fields" label="Campos Personalizados" />
                  <QuickLink href="/admin/analytics" label="Analytics Avançados" />
                  <QuickLink href="/admin/settings" label="Configurações" />
                </div>
              </div>

              <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-brand/10 p-2">
                    <Calendar className="h-5 w-5 text-brand" />
                  </div>
                  <h2 className="text-xl font-medium text-ui-text dark:text-dark-text">
                    Atividade Recente
                  </h2>
                </div>
                <div className="space-y-4">
                  <ActivityItem
                    title="Novo usuário registrado"
                    time="Há 2 horas"
                    type="user"
                  />
                  <ActivityItem
                    title="Edital publicado"
                    time="Há 5 horas"
                    type="edital"
                  />
                  <ActivityItem
                    title="Candidatura submetida"
                    time="Há 1 dia"
                    type="application"
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <StatCard
                icon={FileText}
                label="Minhas Candidaturas"
                value={stats.totalApplications}
                color="blue"
              />
              <StatCard
                icon={AlertCircle}
                label="Aguardando Resposta"
                value={stats.pendingApplications}
                color="orange"
              />
              <StatCard
                icon={TrendingUp}
                label="Taxa de Sucesso"
                value="--"
                color="green"
              />
            </div>

            <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
              <h2 className="text-xl font-medium text-ui-text dark:text-dark-text mb-6">
                Ações Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickLink href="/editais" label="Explorar Editais" />
                <QuickLink href="/profile" label="Meu Perfil" />
                <QuickLink href="/my-applications" label="Minhas Candidaturas" />
                <QuickLink href="/favorites" label="Favoritos" />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: any;
  label: string;
  value: number | string;
  trend?: string;
  color: string;
}

function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    green: 'bg-green-500/10 text-green-600 dark:text-green-400',
    purple: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    teal: 'bg-teal-500/10 text-teal-600 dark:text-teal-400',
    orange: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    indigo: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`rounded-lg p-3 ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-1">
        {value}
      </h3>
      <p className="text-sm text-ui-muted dark:text-dark-muted">{label}</p>
      {trend && (
        <p className="text-xs text-ui-muted dark:text-dark-muted mt-2">{trend}</p>
      )}
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-3 text-sm font-medium text-ui-text dark:text-dark-text transition-all hover:border-brand hover:shadow-md"
    >
      {label}
    </a>
  );
}

function ActivityItem({
  title,
  time,
  type,
}: {
  title: string;
  time: string;
  type: string;
}) {
  const typeColors: Record<string, string> = {
    user: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    edital: 'bg-green-500/10 text-green-600 dark:text-green-400',
    application: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="flex items-center gap-3 pb-4 border-b border-ui-border dark:border-dark-border last:border-0 last:pb-0">
      <div className={`rounded-full p-2 ${typeColors[type]}`}>
        <Activity className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-ui-text dark:text-dark-text">{title}</p>
        <p className="text-xs text-ui-muted dark:text-dark-muted">{time}</p>
      </div>
    </div>
  );
}
