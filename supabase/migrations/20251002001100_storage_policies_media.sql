-- Políticas de Storage para o bucket 'media'
-- Permitem upload (INSERT), leitura necessária para upsert (SELECT) e atualização (UPDATE)

CREATE POLICY IF NOT EXISTS "Allow authenticated uploads to media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK ( bucket_id = 'media' );

CREATE POLICY IF NOT EXISTS "Allow authenticated select on media"
  ON storage.objects FOR SELECT TO authenticated
  USING ( bucket_id = 'media' );

CREATE POLICY IF NOT EXISTS "Allow authenticated update on media"
  ON storage.objects FOR UPDATE TO authenticated
  USING ( bucket_id = 'media' )
  WITH CHECK ( bucket_id = 'media' );