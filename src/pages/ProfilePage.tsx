import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building2, Calendar, Save, Loader2, Shield } from 'lucide-react';
import { logger } from '../lib/logger';

interface ProfileData {
  full_name?: string;
  cpf?: string;
  phone?: string;
  birth_date?: string;
  address_city?: string;
  address_state?: string;
  bio?: string;
  company_name?: string;
  organization_name?: string;
  department?: string;
}

export function ProfilePage() {
  const { user, profile, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
      return;
    }

    if (user && profile) {
      loadProfileData();
    }
  }, [user, profile, authLoading, navigate]);

  async function loadProfileData() {
    if (!profile) return;

    try {
      const tableName = getProfileTableName(profile.role);
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('user_id', profile.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfileData(data);
      }
    } catch (error) {
      logger.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }

  function getProfileTableName(role: string): string {
    const roleToTable: Record<string, string> = {
      admin: 'admin_profiles',
      empresa: 'empresa_profiles',
      terceiro_setor: 'terceiro_setor_profiles',
      orgao_publico: 'orgao_publico_profiles',
      colaborador: 'colaborador_profiles',
      usuario: 'usuario_profiles',
    };
    return roleToTable[role] || 'usuario_profiles';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    setMessage(null);

    try {
      const tableName = getProfileTableName(profile.role);
      const { error } = await supabase
        .from(tableName)
        .upsert({
          user_id: profile.id,
          ...profileData,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      await supabase
        .from('users')
        .update({ profile_completed: true, updated_at: new Date().toISOString() })
        .eq('id', profile.id);

      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (error: any) {
      logger.error('Error saving profile:', error);
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar perfil' });
    } finally {
      setSaving(false);
    }
  }

  function handleChange(field: keyof ProfileData, value: string) {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  }

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ui-bg dark:bg-dark-bg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand mx-auto mb-4" />
          <p className="text-ui-muted dark:text-dark-muted">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ui-bg dark:bg-dark-bg">
      <div className="bg-gradient-to-b from-brand/10 to-transparent py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-brand/10 p-3">
              <User className="h-8 w-8 text-brand" />
            </div>
            <div>
              <h1 className="text-4xl font-brand font-bold text-ui-text dark:text-dark-text">
                Meu Perfil
              </h1>
              <p className="text-lg text-ui-muted dark:text-dark-muted">
                Gerencie suas informações pessoais
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-ui-border dark:border-dark-border">
            <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center">
              {isAdmin ? (
                <Shield className="h-8 w-8 text-brand" />
              ) : (
                <User className="h-8 w-8 text-brand" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-ui-text dark:text-dark-text">
                {profileData.full_name || profileData.company_name || profileData.organization_name || 'Usuário'}
              </h2>
              <div className="flex items-center gap-2 text-ui-muted dark:text-dark-muted">
                <Mail className="h-4 w-4" />
                <span>{profile?.email}</span>
              </div>
              <div className="mt-1">
                <span className="inline-flex items-center rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                  {getRoleLabel(profile?.role || '')}
                </span>
              </div>
            </div>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-lg p-4 ${
                message.type === 'success'
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                  : 'bg-red-500/10 text-red-600 dark:text-red-400'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {renderFormFields()}

            <div className="pt-6 border-t border-ui-border dark:border-dark-border">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand hover:bg-brand-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  function renderFormFields() {
    const role = profile?.role || '';

    const commonFields = (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <User className="h-4 w-4 inline mr-2" />
              Nome Completo
            </label>
            <input
              type="text"
              value={profileData.full_name || ''}
              onChange={(e) => handleChange('full_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <Phone className="h-4 w-4 inline mr-2" />
              Telefone
            </label>
            <input
              type="tel"
              value={profileData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        {role === 'usuario' || role === 'colaborador' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                CPF
              </label>
              <input
                type="text"
                value={profileData.cpf || ''}
                onChange={(e) => handleChange('cpf', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
                <Calendar className="h-4 w-4 inline mr-2" />
                Data de Nascimento
              </label>
              <input
                type="date"
                value={profileData.birth_date || ''}
                onChange={(e) => handleChange('birth_date', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <MapPin className="h-4 w-4 inline mr-2" />
              Cidade
            </label>
            <input
              type="text"
              value={profileData.address_city || ''}
              onChange={(e) => handleChange('address_city', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              Estado
            </label>
            <input
              type="text"
              value={profileData.address_state || ''}
              onChange={(e) => handleChange('address_state', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>
      </>
    );

    if (role === 'admin') {
      return (
        <>
          {commonFields}
          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Departamento
            </label>
            <input
              type="text"
              value={profileData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </>
      );
    }

    if (role === 'empresa') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nome da Empresa
            </label>
            <input
              type="text"
              value={profileData.company_name || ''}
              onChange={(e) => handleChange('company_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {commonFields}
        </>
      );
    }

    if (role === 'terceiro_setor' || role === 'orgao_publico') {
      return (
        <>
          <div>
            <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
              <Building2 className="h-4 w-4 inline mr-2" />
              Nome da Organização
            </label>
            <input
              type="text"
              value={profileData.organization_name || ''}
              onChange={(e) => handleChange('organization_name', e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          {commonFields}
        </>
      );
    }

    return (
      <>
        {commonFields}
        <div>
          <label className="block text-sm font-medium text-ui-text dark:text-dark-text mb-2">
            Biografia
          </label>
          <textarea
            value={profileData.bio || ''}
            onChange={(e) => handleChange('bio', e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg border border-ui-border dark:border-dark-border bg-ui-bg dark:bg-dark-bg text-ui-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </>
    );
  }
}

function getRoleLabel(role: string): string {
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
