import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
} from 'lucide-react';

export function DashboardPage() {
  const { profile, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalEditais: 0,
    activeEditais: 0,
    totalIniciativas: 0,
    activeIniciativas: 0,
    totalUsers: 0,
    activeUsers: 0,
    totalBanners: 0,
    activeBanners: 0,
    totalApplications: 0,
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

  // ✅ OTIMIZAÇÃO: Usar RPC function em vez de múltiplas consultas
  async function fetchAdminStats() {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      
      if (error) throw error;
      
      setStats({
        totalEditais: data.totalEditais || 0,
        activeEditais: data.activeEditais || 0,
        totalIniciativas: data.totalIniciativas || 0,
        activeIniciativas: data.activeIniciativas || 0,
        totalUsers: data.totalUsers || 0,
        activeUsers: data.activeUsers || 0,
        totalBanners: data.totalBanners || 0,
        activeBanners: data.activeBanners || 0,
        totalApplications: data.totalApplications || 0,
        newUsersThisMonth: data.newUsersThisMonth || 0,
        pendingApplications: data.pendingApplications || 0,
      });
    } catch (error) {
      logger.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ OTIMIZAÇÃO: Usar RPC function para estatísticas do usuário
  async function fetchUserStats() {
    if (!profile) return;

    try {
      const { data, error } = await supabase.rpc('get_user_stats', { 
        p_user_id: profile.id 
      });
      
      if (error) throw error;

      setStats({
        totalEditais: 0,
        activeEditais: 0,
        totalIniciativas: 0,
        activeIniciativas: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalBanners: 0,
        activeBanners: 0,
        totalApplications: data.totalApplications || 0,
        newUsersThisMonth: 0,
        pendingApplications: data.pendingApplications || 0,
      });
    } catch (error) {
      logger.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  }

  // ✅ OTIMIZAÇÃO: Memoizar componentes pesados
  const statCards = useMemo(() => {
    if (isAdmin) {
      return [
        {
          icon: FileText,
          label: 'Total de Editais',
          value: stats.totalEditais,
          trend: `${stats.activeEditais} ativos`,
          color: 'text-blue-600',
        },
        {
          icon: TrendingUp,
          label: 'Iniciativas',
          value: stats.totalIniciativas,
          trend: `${stats.activeIniciativas} ativas`,
          color: 'text-green-600',
        },
        {
          icon: Users,
          label: 'Usuários',
          value: stats.totalUsers,
          trend: `${stats.activeUsers} ativos`,
          color: 'text-purple-600',
        },
        {
          icon: Activity,
          label: 'Aplicações',
          value: stats.totalApplications,
          trend: `${stats.pendingApplications} pendentes`,
          color: 'text-orange-600',
        },
      ];
    } else {
      return [
        {
          icon: FileText,
          label: 'Minhas Aplicações',
          value: stats.totalApplications,
          trend: `${stats.pendingApplications} pendentes`,
          color: 'text-blue-600',
        },
      ];
    }
  }, [stats, isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {isAdmin ? 'Visão geral do sistema' : 'Suas atividades'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        {isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ações Rápidas
              </h2>
              <div className="space-y-3">
                <QuickLink href="/admin/users" label="Gerenciar Usuários" />
                <QuickLink href="/admin/editais" label="Gerenciar Editais" />
                <QuickLink href="/admin/banners" label="Gerenciar Banners" />
                <QuickLink href="/admin/content" label="Gerenciar Conteúdo" />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Atividade Recente
              </h2>
              <div className="space-y-3">
                <ActivityItem
                  title="Novos usuários este mês"
                  time={`${stats.newUsersThisMonth} usuários`}
                />
                <ActivityItem
                  title="Aplicações pendentes"
                  time={`${stats.pendingApplications} aplicações`}
                />
                <ActivityItem
                  title="Editais ativos"
                  time={`${stats.activeEditais} editais`}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ CORREÇÃO: Componente memoizado com React importado
interface StatCardProps {
  icon: any;
  label: string;
  value: number | string;
  trend?: string;
  color: string;
}

const StatCard = React.memo(function StatCard({ icon: Icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 ${color}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {label}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className="text-sm text-gray-500 dark:text-gray-400">{trend}</p>
          )}
        </div>
      </div>
    </div>
  );
});

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400"
    >
      <span>{label}</span>
    </a>
  );
}

function ActivityItem({
  title,
  time,
}: {
  title: string;
  time: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600 dark:text-gray-400">{title}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">
        {time}
      </span>
    </div>
  );
}
