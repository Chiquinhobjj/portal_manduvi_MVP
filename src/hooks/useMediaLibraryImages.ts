import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AdImage {
  id: string;
  imageUrl: string;
  fileName: string;
  altText: string;
  title: string;
}

export function useMediaLibraryImages(folder: string, location: string, maxImages: number = 5) {
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImagesFromMediaLibrary();
  }, [folder, maxImages]);

  async function loadImagesFromMediaLibrary() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('media_library')
        .select('id, file_name, file_url, alt_text, folder, uploaded_at')
        .eq('folder', folder)
        .order('uploaded_at', { ascending: false })
        .limit(maxImages);

      if (error) throw error;

      const adImages: AdImage[] = (data || []).map((file, index) => ({
        id: `${location}-${index + 1}`,
        imageUrl: file.file_url,
        fileName: file.file_name,
        altText: file.alt_text || file.file_name,
        title: file.file_name,
      }));

      setImages(adImages);
    } catch (err) {
      logger.error('Erro ao carregar imagens da media_library:', err);
      setError('Falha ao carregar imagens');
    } finally {
      setLoading(false);
    }
  }

  return { images, loading, error, reload: loadImagesFromMediaLibrary };
}