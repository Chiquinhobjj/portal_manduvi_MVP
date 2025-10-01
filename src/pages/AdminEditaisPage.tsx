import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, CreditCard as Edit, Trash2, Eye, Calendar, Building } from 'lucide-react';
import { logger } from '../lib/logger';

interface Edital {
  id: string;
  slug: string;
  title: string;
  organization_name: string;
  type: string;
  status: string;
  closing_date: string;
  views_count: number;
  applications_count: number;
  created_at: string;
}

export function AdminEditaisPage() {
  const { isAdmin } = useAuth();
  const [editais, setEditais] = useState<Edital[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'closed'>('all');

  useEffect(() => {
    if (isAdmin) {
      fetchEditais();
    }
  }, [isAdmin]);

  async function fetchEditais() {
    try {
      let query = supabase
        .from('editais')
        .select('id, slug, title, organization_name, type, status, closing_date, views_count, applications_count, created_at')
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setEditais(data || []);
    } catch (error) {
      logger.error('Error fetching editais:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este edital?')) return;

    try {
      const { error } = await supabase
        .from('editais')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchEditais();
    } catch (error) {
      logger.error('Error deleting edital:', error);
      alert('Erro ao excluir edital');
    }
  }

  const filteredEditais = filter === 'all' ? editais : editais.filter(e => e.status === filter);

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ui-text dark:text-dark-text mb-2">Acesso Negado</h1>
          <p className="text-ui-muted dark:text-dark-muted">Você não tem permissão para acessar esta página</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="bg-gradient-to-b from-brand/10 to-transparent py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
                Gerenciar Editais
              </h1>
              <p className="text-lg text-ui-muted dark:text-dark-muted">
                Administre editais, licitações e chamadas públicas
              </p>
            </div>
            <Link
              to="/admin/editais/novo"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Novo Edital
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6 flex gap-2">
          {(['all', 'draft', 'published', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === status
                  ? 'bg-brand text-white'
                  : 'bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text hover:bg-ui-border dark:hover:bg-dark-border'
              }`}
            >
              {status === 'all' ? 'Todos' : status === 'draft' ? 'Rascunhos' : status === 'published' ? 'Publicados' : 'Encerrados'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
            <p className="mt-4 text-ui-muted dark:text-dark-muted">Carregando editais...</p>
          </div>
        ) : filteredEditais.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-ui-muted dark:text-dark-muted">Nenhum edital encontrado</p>
          </div>
        ) : (
          <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-ui-bg dark:bg-dark-bg border-b border-ui-border dark:border-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Organização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Encerramento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Visualizações
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-ui-muted dark:text-dark-muted uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border dark:divide-dark-border">
                {filteredEditais.map((edital) => (
                  <tr key={edital.id} className="hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-ui-text dark:text-dark-text">{edital.title}</div>
                      <div className="text-xs text-ui-muted dark:text-dark-muted">{edital.type}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-ui-muted dark:text-dark-muted" />
                        <span className="text-sm text-ui-text dark:text-dark-text">{edital.organization_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        edital.status === 'published' ? 'bg-green-500/10 text-green-600 dark:text-green-400' :
                        edital.status === 'draft' ? 'bg-gray-500/10 text-gray-600 dark:text-gray-400' :
                        'bg-red-500/10 text-red-600 dark:text-red-400'
                      }`}>
                        {edital.status === 'published' ? 'Publicado' : edital.status === 'draft' ? 'Rascunho' : 'Encerrado'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-ui-muted dark:text-dark-muted" />
                        <span className="text-sm text-ui-text dark:text-dark-text">
                          {new Date(edital.closing_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-ui-muted dark:text-dark-muted" />
                        <span className="text-sm text-ui-text dark:text-dark-text">{edital.views_count}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/editais/${edital.slug}`}
                          className="p-2 text-brand hover:bg-brand/10 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          to={`/admin/editais/${edital.id}/editar`}
                          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(edital.id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
