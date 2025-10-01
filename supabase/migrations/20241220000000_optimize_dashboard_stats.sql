-- Função RPC otimizada para estatísticas do dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
  current_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
BEGIN
  SELECT json_build_object(
    'totalEditais', (SELECT COUNT(*) FROM editais),
    'activeEditais', (SELECT COUNT(*) FROM editais WHERE status = 'published'),
    'totalIniciativas', (SELECT COUNT(*) FROM initiatives),
    'activeIniciativas', (SELECT COUNT(*) FROM initiatives WHERE status = 'published'),
    'totalUsers', (SELECT COUNT(*) FROM users),
    'activeUsers', (SELECT COUNT(*) FROM users WHERE status = 'active'),
    'totalBanners', (SELECT COUNT(*) FROM banners),
    'activeBanners', (SELECT COUNT(*) FROM banners WHERE is_active = true),
    'totalApplications', (SELECT COUNT(*) FROM editais_applications),
    'newUsersThisMonth', (SELECT COUNT(*) FROM users WHERE created_at >= current_month_start),
    'pendingApplications', (SELECT COUNT(*) FROM editais_applications WHERE status = 'submitted')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover a função existente e recriar com parâmetro corrigido
DROP FUNCTION IF EXISTS get_user_stats(UUID);

-- Função RPC para estatísticas do usuário (CORRIGIDA)
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'totalApplications', (SELECT COUNT(*) FROM editais_applications WHERE user_id = p_user_id),
    'pendingApplications', (SELECT COUNT(*) FROM editais_applications WHERE user_id = p_user_id AND status = 'submitted')
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Índices para otimizar as consultas
CREATE INDEX IF NOT EXISTS idx_editais_status ON editais(status);
CREATE INDEX IF NOT EXISTS idx_initiatives_status ON initiatives(status);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
CREATE INDEX IF NOT EXISTS idx_banners_is_active ON banners(is_active);
CREATE INDEX IF NOT EXISTS idx_editais_applications_status ON editais_applications(status);
CREATE INDEX IF NOT EXISTS idx_editais_applications_user_id ON editais_applications(user_id);