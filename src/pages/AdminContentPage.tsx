import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, Pencil, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContentSection {
  id: string;
  page_slug: string;
  section_key: string;
  content: any;
  display_order: number;
  is_published: boolean;
  updated_at: string;
}

const pages = [
  { slug: 'homepage', label: 'Página Inicial' },
  { slug: 'about', label: 'Sobre' },
  { slug: 'instituto', label: 'Instituto' },
  { slug: 'services', label: 'Serviços' },
  { slug: 'news', label: 'Notícias' },
  { slug: 'data', label: 'Dados' },
];

export function AdminContentPage() {
  const { profile } = useAuth();
  const [selectedPage, setSelectedPage] = useState('homepage');
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    subtitle: '',
    body: '',
    cta_text: '',
    cta_link: '',
    is_published: true,
  });

  useEffect(() => {
    fetchSections();
  }, [selectedPage]);

  async function fetchSections() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('page_slug', selectedPage)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const content = {
      title: formData.title,
      subtitle: formData.subtitle,
      body: formData.body,
      cta_text: formData.cta_text,
      cta_link: formData.cta_link,
    };

    try {
      if (editingSection) {
        const { error } = await supabase
          .from('content_sections')
          .update({
            content,
            is_published: formData.is_published,
            updated_at: new Date().toISOString(),
            updated_by: profile?.id,
          })
          .eq('id', editingSection.id);

        if (error) throw error;
      } else {
        const maxOrder = sections.length > 0 ? Math.max(...sections.map((s) => s.display_order)) : 0;

        const { error } = await supabase.from('content_sections').insert({
          page_slug: selectedPage,
          section_key: formData.section_key,
          content,
          display_order: maxOrder + 1,
          is_published: formData.is_published,
          updated_by: profile?.id,
        });

        if (error) throw error;
      }

      await logActivity(
        editingSection ? 'update' : 'create',
        'content_section',
        editingSection?.id || null
      );

      setShowModal(false);
      setEditingSection(null);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Erro ao salvar seção');
    }
  }

  async function handleTogglePublished(section: ContentSection) {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update({
          is_published: !section.is_published,
          updated_by: profile?.id,
        })
        .eq('id', section.id);

      if (error) throw error;

      await logActivity('update', 'content_section', section.id);
      fetchSections();
    } catch (error) {
      console.error('Error toggling section:', error);
    }
  }

  async function handleDelete(section: ContentSection) {
    if (!confirm(`Tem certeza que deseja excluir a seção "${section.content.title}"?`)) {
      return;
    }

    try {
      const { error } = await supabase.from('content_sections').delete().eq('id', section.id);

      if (error) throw error;

      await logActivity('delete', 'content_section', section.id);
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Erro ao excluir seção');
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
      console.error('Error logging activity:', error);
    }
  }

  function openCreateModal() {
    resetForm();
    setEditingSection(null);
    setShowModal(true);
  }

  function openEditModal(section: ContentSection) {
    setFormData({
      section_key: section.section_key,
      title: section.content.title || '',
      subtitle: section.content.subtitle || '',
      body: section.content.body || '',
      cta_text: section.content.cta_text || '',
      cta_link: section.content.cta_link || '',
      is_published: section.is_published,
    });
    setEditingSection(section);
    setShowModal(true);
  }

  function resetForm() {
    setFormData({
      section_key: '',
      title: '',
      subtitle: '',
      body: '',
      cta_text: '',
      cta_link: '',
      is_published: true,
    });
  }

  return (
    <div className="max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text">
              Gerenciar Conteúdo
            </h1>
            <p className="text-ui-muted dark:text-dark-muted mt-1">
              Edite textos e seções das páginas do site
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
          >
            <Plus className="h-5 w-5" />
            Nova Seção
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {pages.map((page) => (
            <button
              key={page.slug}
              onClick={() => setSelectedPage(page.slug)}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap',
                selectedPage === page.slug
                  ? 'bg-brand text-white'
                  : 'bg-ui-panel dark:bg-dark-panel text-ui-text dark:text-dark-text border border-ui-border dark:border-dark-border hover:border-brand'
              )}
            >
              {page.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className={cn(
                'rounded-lg border bg-ui-panel dark:bg-dark-panel p-6 transition-all',
                section.is_published
                  ? 'border-ui-border dark:border-dark-border'
                  : 'border-ui-border/50 dark:border-dark-border/50 opacity-60'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-ui-text dark:text-dark-text">
                      {section.content.title}
                    </h3>
                    {!section.is_published && (
                      <span className="rounded bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ui-muted dark:text-dark-muted">
                    {section.section_key}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTogglePublished(section)}
                    className="rounded-lg border border-ui-border dark:border-dark-border p-2 text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                    title={section.is_published ? 'Despublicar' : 'Publicar'}
                  >
                    {section.is_published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(section)}
                    className="rounded-lg border border-ui-border dark:border-dark-border p-2 text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(section)}
                    className="rounded-lg border border-red-500/50 p-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {section.content.subtitle && (
                <p className="text-sm text-ui-muted dark:text-dark-muted mb-3">
                  {section.content.subtitle}
                </p>
              )}

              {section.content.body && (
                <div className="text-sm text-ui-text dark:text-dark-text mb-3 line-clamp-3">
                  {section.content.body}
                </div>
              )}

              {section.content.cta_text && (
                <div className="flex items-center gap-2 text-sm text-brand">
                  <span>{section.content.cta_text}</span>
                  {section.content.cta_link && (
                    <span className="text-ui-muted dark:text-dark-muted">
                      → {section.content.cta_link}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

          {sections.length === 0 && (
            <div className="text-center py-12 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel">
              <p className="text-ui-muted dark:text-dark-muted mb-4">
                Nenhuma seção cadastrada para esta página
              </p>
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-warm"
              >
                <Plus className="h-5 w-5" />
                Criar Primeira Seção
              </button>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border max-h-[90vh] overflow-y-auto">
            <div className="border-b border-ui-border dark:border-dark-border p-6">
              <h2 className="text-xl font-bold text-ui-text dark:text-dark-text">
                {editingSection ? 'Editar Seção' : 'Nova Seção'}
              </h2>
              <p className="text-sm text-ui-muted dark:text-dark-muted mt-1">
                Página: {pages.find((p) => p.slug === selectedPage)?.label}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {!editingSection && (
                <div>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    Identificador da Seção *
                  </label>
                  <input
                    type="text"
                    value={formData.section_key}
                    onChange={(e) =>
                      setFormData({ ...formData, section_key: e.target.value })
                    }
                    placeholder="ex: hero-section, features, testimonials"
                    className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                    required
                  />
                </div>
              )}

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
                  Subtítulo
                </label>
                <input
                  type="text"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  Corpo do Texto
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    Texto do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.cta_text}
                    onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="ex: Saiba mais"
                    className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    Link do Botão
                  </label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder="/pagina ou https://..."
                    className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) =>
                    setFormData({ ...formData, is_published: e.target.checked })
                  }
                  className="rounded border-ui-border dark:border-dark-border"
                />
                <label
                  htmlFor="is_published"
                  className="text-sm text-ui-text dark:text-dark-text"
                >
                  Publicar seção imediatamente
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingSection(null);
                    resetForm();
                  }}
                  className="flex-1 rounded-lg border border-ui-border dark:border-dark-border px-4 py-2 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-warm transition-colors"
                >
                  <Save className="h-4 w-4" />
                  {editingSection ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
