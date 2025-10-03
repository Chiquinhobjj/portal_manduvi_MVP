-- Adiciona campos para melhorar gestão de mídia
ALTER TABLE IF EXISTS media_library
  ADD COLUMN IF NOT EXISTS file_path text;

ALTER TABLE IF EXISTS media_library
  ADD COLUMN IF NOT EXISTS link_url text;

-- Índice opcional para consultas por pasta e upload
CREATE INDEX IF NOT EXISTS idx_media_library_folder_uploaded_at ON media_library(folder, uploaded_at DESC);