import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Save, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { logger } from '../lib/logger';

interface Setting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: string;
  description: string | null;
  is_public: boolean;
}

export function AdminSettingsPage() {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<Setting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .order('setting_key', { ascending: true });

      if (error) throw error;

      const settingsData = data || [];
      setSettings(settingsData);

      const formValues: Record<string, any> = {};
      settingsData.forEach((setting) => {
        formValues[setting.setting_key] = setting.setting_value;
      });
      setFormData(formValues);
    } catch (error) {
      logger.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      for (const [key, value] of Object.entries(formData)) {
        const setting = settings.find((s) => s.setting_key === key);
        if (!setting) continue;

        await supabase
          .from('site_settings')
          .update({
            setting_value: value,
            updated_at: new Date().toISOString(),
            updated_by: profile?.id,
          })
          .eq('setting_key', key);
      }

      await logActivity('update', 'site_settings', null);
      alert('Configurações salvas com sucesso!');
      fetchSettings();
    } catch (error) {
      logger.error('Error saving settings:', error);
    } finally {
      setSaving(false);
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

  function handleChange(key: string, value: any) {
    setFormData({ ...formData, [key]: value });
  }

  function renderField(setting: Setting) {
    const value = formData[setting.setting_key];

    switch (setting.setting_type) {
      case 'boolean':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={setting.setting_key}
              checked={value === true || value === 'true'}
              onChange={(e) => handleChange(setting.setting_key, e.target.checked)}
              className="rounded border-ui-border dark:border-dark-border"
            />
            <label
              htmlFor={setting.setting_key}
              className="text-sm text-ui-text dark:text-dark-text"
            >
              Ativado
            </label>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => handleChange(setting.setting_key, parseInt(e.target.value))}
            className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        );

      case 'string':
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(setting.setting_key, e.target.value)}
            className="w-full rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-4 py-2 text-ui-text dark:text-dark-text focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
          />
        );
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
      </div>
    );
  }

  const settingGroups = {
    site: settings.filter((s) => s.setting_key.startsWith('site_')),
    carousel: settings.filter((s) => s.setting_key.startsWith('carousel_')),
    other: settings.filter(
      (s) => !s.setting_key.startsWith('site_') && !s.setting_key.startsWith('carousel_')
    ),
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-brand font-bold text-ui-text dark:text-dark-text mb-2">
          Configurações do Site
        </h1>
        <p className="text-ui-muted dark:text-dark-muted">
          Configure parâmetros globais do site
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel overflow-hidden">
          <div className="border-b border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-6 py-4">
            <h2 className="text-lg font-semibold text-ui-text dark:text-dark-text flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Informações do Site
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {settingGroups.site.map((setting) => (
              <div key={setting.id}>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  {setting.description || setting.setting_key}
                </label>
                {renderField(setting)}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel overflow-hidden">
          <div className="border-b border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-6 py-4">
            <h2 className="text-lg font-semibold text-ui-text dark:text-dark-text flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Configurações do Carrossel
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {settingGroups.carousel.map((setting) => (
              <div key={setting.id}>
                <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                  {setting.description || setting.setting_key}
                </label>
                {renderField(setting)}
                {setting.setting_key === 'carousel_rotation_interval' && (
                  <p className="text-xs text-ui-muted dark:text-dark-muted mt-1">
                    Valor em milissegundos (1000 = 1 segundo)
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {settingGroups.other.length > 0 && (
          <div className="rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel overflow-hidden">
            <div className="border-b border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg px-6 py-4">
              <h2 className="text-lg font-semibold text-ui-text dark:text-dark-text">
                Outras Configurações
              </h2>
            </div>
            <div className="p-6 space-y-4">
              {settingGroups.other.map((setting) => (
                <div key={setting.id}>
                  <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                    {setting.description || setting.setting_key}
                  </label>
                  {renderField(setting)}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={fetchSettings}
            disabled={saving}
            className="rounded-lg border border-ui-border dark:border-dark-border px-6 py-3 text-sm font-medium text-ui-text dark:text-dark-text hover:bg-ui-bg dark:hover:bg-dark-bg transition-colors disabled:opacity-50"
          >
            Descartar Alterações
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-medium text-white hover:bg-brand-warm transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                Salvar Configurações
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 rounded-lg border border-ui-border dark:border-dark-border bg-ui-panel dark:bg-dark-panel p-6">
        <h3 className="text-lg font-semibold text-ui-text dark:text-dark-text mb-4">
          Informações Adicionais
        </h3>
        <div className="space-y-2 text-sm text-ui-muted dark:text-dark-muted">
          <p>
            • As configurações marcadas como públicas são visíveis para todos os usuários
          </p>
          <p>
            • As configurações do carrossel afetam o comportamento do carrossel de banners na página inicial
          </p>
          <p>
            • Todas as alterações são registradas no log de atividades do administrador
          </p>
        </div>
      </div>
    </div>
  );
}
