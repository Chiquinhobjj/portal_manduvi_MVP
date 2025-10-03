-- Permitir leitura pública da biblioteca de mídia para páginas anônimas
-- Mantém políticas de admin inalteradas; esta é uma política adicional de SELECT

-- Nota: a tabela media_library já tem RLS habilitado na migração anterior
-- Esta política é aditiva e não conflita com a política existente para authenticated

CREATE POLICY "Public can view media library"
  ON media_library FOR SELECT
  TO authenticated, anon
  USING (true);