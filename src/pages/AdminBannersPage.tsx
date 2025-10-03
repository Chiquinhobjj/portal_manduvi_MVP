import { useEffect, useMemo, useState } from 'react';
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
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { logger } from '../lib/logger';
import type { Banner } from '../lib/types';
import {
  deleteBanner,
  fetchBanners,
  saveBanner,
  toggleBannerActive,
} from '../admin/services/banners';

const emptyFormState = {
  title: '',
  image_url: '',
  link_url: '',
  description: '',
  is_active: true,
  start_date: '',
  end_date: '',
};

export function AdminBannersPage() {
  const { profile } = useAuth();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState(emptyFormState);

  const activeBanners = useMemo(() => banners.filter((banner) => banner.is_active), [banners]);

  useEffect(() => {
    loadBanners();
  }, []);

  async function loadBanners() {
    try {
      setLoading(true);
      const data = await fetchBanners();
      setBanners(data);
    } catch (error) {
      logger.error('Error fetching banners:', error);
      alert(error instanceof Error ? error.message : 'Erro ao carregar banners.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingBanner(null);
    setShowModal(true);
  }

  function openEditModal(banner: Banner) {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url ?? '',
      description: banner.description ?? '',
      is_active: banner.is_active,
      start_date: banner.start_date?.slice(0, 16) ?? '',
      end_date: banner.end_date?.slice(0, 16) ?? '',
    });
    setShowModal(true);
  }

  function resetForm() {
    setFormData(emptyFormState);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formData.title.trim() || !formData.image_url.trim()) {
      alert('Título e imagem são obrigatórios.');
      return;
    }

    try {
      setSaving(true);
      await saveBanner({ banner: editingBanner, form: formData, authorId: profile?.id });
      await loadBanners();
      setShowModal(false);
      setEditingBanner(null);
      resetForm();
    } catch (error) {
      logger.error('Error saving banner:', error);
      alert(error instanceof Error ? error.message : 'Erro ao salvar banner.');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(banner: Banner) {
    try {
      await toggleBannerActive(banner.id, !banner.is_active);
      await loadBanners();
    } catch (error) {
      logger.error('Error toggling banner:', error);
      alert(error instanceof Error ? error.message : 'Erro ao atualizar banner.');
    }
  }

  async function handleDelete(banner: Banner) {
    if (!confirm(`Tem certeza que deseja excluir o banner "${banner.title}"?`)) {
      return;
    }

    try {
      await deleteBanner(banner.id);
      await loadBanners();
    } catch (error) {
      logger.error('Error deleting banner:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir banner.');
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text">
            Carrossel de Banners
          </h1>
          <p className="text-ui-muted dark:text-dark-muted">
            Gerencie a vitrine principal do portal (ordem, visibilidade, links e métricas).
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
        >
          <Plus className="h-5 w-5" />
          Novo banner
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4">
          <p className="text-sm text-ui-muted dark:text-dark-muted">Banners ativos</p>
          <p className="text-3xl font-semibold text-ui-text dark:text-dark-text">{activeBanners.length}</p>
        </div>
        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4">
          <p className="text-sm text-ui-muted dark:text-dark-muted">Total cadastrados</p>
          <p className="text-3xl font-semibold text-ui-text dark:text-dark-text">{banners.length}</p>
        </div>
        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-4 flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-brand" />
          <div>
            <p className="text-sm text-ui-muted dark:text-dark-muted">Performance</p>
            <p className="text-xs text-ui-muted dark:text-dark-muted">
              As métricas de impressão/clique são atualizadas automaticamente via `banner_analytics`.
            </p>
          </div>
        </div>
      </div>

      {banners.length === 0 ? (
        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-12 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-ui-muted dark:text-dark-muted" />
          <p className="text-ui-muted dark:text-dark-muted mb-6">
            Nenhum banner cadastrado ainda. Crie um novo para destacar campanhas importantes.
          </p>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Plus className="h-5 w-5" />
            Criar banner
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="h-24 w-40 overflow-hidden rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg">
                    <img
                      src={banner.image_url}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-ui-text dark:text-dark-text">
                      {banner.title}
                    </h2>
                    {banner.description && (
                      <p className="text-sm text-ui-muted dark:text-dark-muted mt-1">
                        {banner.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-ui-muted dark:text-dark-muted">
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-brand">
                        <Eye className="h-3 w-3" />
                        {banner.impression_count} visualizações
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-1 text-brand">
                        <MousePointerClick className="h-3 w-3" />
                        {banner.click_count} cliques
                      </span>
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-ui-bg dark:bg-dark-bg px-2 py-1 hover:text-brand transition-colors"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Ver destino
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(banner)}
                    className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      banner.is_active
                        ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                        : 'border-ui-border text-ui-muted dark:text-dark-muted hover:bg-ui-bg dark:hover:bg-dark-bg'
                    }`}
                  >
                    {banner.is_active ? (
                      <>
                        <ToggleRight className="h-4 w-4" /> Ativo
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4" /> Inativo
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(banner)}
                    className="flex items-center gap-2 rounded-lg border border-ui-border dark:border-dark-border px-3 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(banner)}
                    className="flex items-center gap-2 rounded-lg border border-rose-500/40 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border shadow-xl">
            <div className="border-b border-ui-border dark:border-dark-border px-6 py-4">
              <h2 className="text-lg font-semibold text-ui-text dark:text-dark-text">
                {editingBanner ? 'Editar banner' : 'Novo banner'}
              </h2>
              <p className="text-sm text-ui-muted dark:text-dark-muted mt-1">
                Campos essenciais para o destaque na home.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                  Título
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(event) => setFormData({ ...formData, title: event.target.value })}
                    required
                    className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                  URL da imagem
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(event) => setFormData({ ...formData, image_url: event.target.value })}
                    placeholder="https://..."
                    required
                    className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                  Link de destino (opcional)
                  <input
                    type="url"
                    value={formData.link_url}
                    onChange={(event) => setFormData({ ...formData, link_url: event.target.value })}
                    placeholder="https://..."
                    className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                  Descrição
                  <textarea
                    value={formData.description}
                    onChange={(event) => setFormData({ ...formData, description: event.target.value })}
                    rows={3}
                    className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                    Início (opcional)
                    <input
                      type="datetime-local"
                      value={formData.start_date}
                      onChange={(event) => setFormData({ ...formData, start_date: event.target.value })}
                      className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                    Fim (opcional)
                    <input
                      type="datetime-local"
                      value={formData.end_date}
                      onChange={(event) => setFormData({ ...formData, end_date: event.target.value })}
                      className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    />
                  </label>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-ui-text dark:text-dark-text">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(event) => setFormData({ ...formData, is_active: event.target.checked })}
                    className="h-4 w-4 rounded border border-ui-border dark:border-dark-border"
                  />
                  Ativar imediatamente
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingBanner(null);
                    resetForm();
                  }}
                  className="rounded-lg border border-ui-border dark:border-dark-border px-4 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : editingBanner ? 'Atualizar banner' : 'Criar banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
