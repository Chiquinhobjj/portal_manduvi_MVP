import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  TrendingUp,
  Eye,
  MousePointerClick,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { logger } from '../lib/logger';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  description: string | null;
  display_order: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  click_count: number;
  impression_count: number;
  created_at: string;
}

export function AdminBannersPage() {
  const { profile } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    description: '',
    is_active: true,
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  async function fetchBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      logger.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingBanner) {
        const { error } = await supabase
          .from('banners')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBanner.id);

        if (error) throw error;
      } else {
        const maxOrder = banners.length > 0 ? Math.max(...banners.map((b) => b.display_order)) : 0;

        const { error } = await supabase.from('banners').insert({
          ...formData,
          display_order: maxOrder + 1,
          created_by: profile?.id,
        });

        if (error) throw error;
      }

      await logActivity(
        editingBanner ? 'update' : 'create',
        'banner',
        editingBanner?.id || null
      );

      setShowModal(false);
      setEditingBanner(null);
      resetForm();
      fetchBanners();
    } catch (error) {
      logger.error('Error saving banner:', error);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(banner: Banner) {
    try {
      const { error } = await supabase
        .from('banners')
        .update({ is_active: !banner.is_active })
        .eq('id', banner.id);

      if (error) throw error;

      await logActivity('update', 'banner', banner.id);
      fetchBanners();
    } catch (error) {
      logger.error('Error toggling banner:', error);
    }
  }

  async function handleDelete(banner: Banner) {
    if (!confirm(`Tem certeza que deseja excluir o banner "${banner.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('banners').delete().eq('id', banner.id);

      if (error) throw error;

      await logActivity('delete', 'banner', banner.id);
      fetchBanners();
    } catch (error) {
      logger.error('Error deleting banner:', error);
      alert('Erro ao excluir banner');
    }
  }

  async function logActivity(action: string, entityType: string, entityId: string | null) {
    try {
      await supabase.from('admin_activity_log').insert({
        user_id: profile?.id,
        action,
        entity_type: entityType,
        entity_id: entityId,
      });
    } catch (error) {
      logger.error('Error logging activity:', error);
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingBanner(null);
    setShowModal(true);
  }

  function openEditModal(banner: Banner) {
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      description: banner.description || '',
      is_active: banner.is_active,
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
    });
    setEditingBanner(banner);
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      image_url: '',
      link_url: '',
      description: '',
      is_active: true,
      start_date: '',
      end_date: '',
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
      </div>
    );
  }

  const totalImpressions = banners.reduce((sum, b) => sum + b.impression_count, 0);
  const totalClicks = banners.reduce((sum, b) => sum + b.click_count, 0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : '0';

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text">
              Gerenciar Banners
            </h1>
            <p className="text-ui-muted dark:text-dark-muted mt-1">
              Configure os banners do carrossel exibidos na página inicial
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Plus className="h-5 w-5" />
            Novo Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-3">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
                  {totalImpressions}
                </p>
                <p className="text-sm text-ui-muted dark:text-dark-muted">Impressões</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-500/10 p-3">
                <MousePointerClick className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
                  {totalClicks}
                </p>
                <p className="text-sm text-ui-muted dark:text-dark-muted">Cliques</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-500/10 p-3">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ui-text dark:text-dark-text">
                  {avgCTR}%
                </p>
                <p className="text-sm text-ui-muted dark:text-dark-muted">CTR Médio</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className={cn(
              'rounded-lg border bg-ui-panel dark:bg-dark-panel overflow-hidden transition-all',
              banner.is_active
                ? 'border-ui-border dark:border-dark-border'
                : 'border-ui-border/50 dark:border-dark-border/50 opacity-60'
            )}
          >
            <div className="aspect-square bg-ui-bg dark:bg-dark-bg flex items-center justify-center p-4">
              <img
                src={banner.image_url}
                alt={banner.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-ui-text dark:text-dark-text">
                  {banner.title}
                </h3>
                <button
                  onClick={() => handleToggleActive(banner)}
                  className="text-ui-muted dark:text-dark-muted hover:text-brand transition-colors"
                >
                  {banner.is_active ? (
                    <ToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-6 w-6" />
                  )}
                </button>
              </div>

              {banner.description && (
                <p className="text-sm text-ui-muted dark:text-dark-muted mb-3">
                  {banner.description}
                </p>
              )}

              {banner.link_url && (
                <a
                  href={banner.link_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-brand hover:text-brand-warm mb-3"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver link
                </a>
              )}

              <div className="flex items-center gap-4 text-xs text-ui-muted dark:text-dark-muted mb-3">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {banner.impression_count}
                </span>
                <span className="flex items-center gap-1">
                  <MousePointerClick className="h-3 w-3" />
                  {banner.click_count}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(banner)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-ui-border dark:border-dark-border px-3 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(banner)}
                  className="flex items-center justify-center rounded-lg border border-red-500/50 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12">
          <p className="text-ui-muted dark:text-dark-muted mb-4">
            Nenhum banner cadastrado ainda
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Plus className="h-5 w-5" />
            Criar Primeiro Banner
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-ui-border dark:border-dark-border p-6">
              <h2 className="text-xl font-bold text-ui-text dark:text-dark-text">
                {editingBanner ? 'Editar Banner' : 'Novo Banner'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  URL da Imagem * (100x100px recomendado)
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  required
                />
                {formData.image_url && (
                  <div className="mt-2 p-2 bg-ui-bg dark:bg-dark-bg rounded-lg">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="w-[100px] h-[100px] object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  URL de Destino (opcional)
                </label>
                <input
                  type="url"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    Data de Início (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    Data de Término (opcional)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-ui-border dark:border-dark-border"
                />
                <label htmlFor="is_active" className="text-sm text-ui-text dark:text-dark-text">
                  Banner ativo
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBanner(null);
                    resetForm();
                  }}
                  disabled={saving}
                  className="flex-1 rounded-lg border border-ui-border dark:border-dark-border px-4 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-warm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      Salvando...
                    </div>
                  ) : (
                    editingBanner ? 'Salvar' : 'Criar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
