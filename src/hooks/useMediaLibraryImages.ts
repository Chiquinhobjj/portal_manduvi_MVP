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

export function useMediaLibraryImages(
  folder: string,
  location: string,
  maxImages: number = 5,
  transform?: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; quality?: number }
) {
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadImagesFromMediaLibrary();
  }, [folder, maxImages, transform]);

  async function loadImagesFromMediaLibrary() {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('media_library')
        .select('id, file_name, file_url, file_path, alt_text, folder, uploaded_at, link_url')
        .eq('folder', folder)
        .order('uploaded_at', { ascending: false })
        .limit(maxImages);

      if (error) throw error;

      const buildUrlWithTransform = (url: string) => {
        if (!transform) return url;
        const params = new URLSearchParams();
        if (transform.width) params.set('width', String(transform.width));
        if (transform.height) params.set('height', String(transform.height));
        if (transform.resize) params.set('resize', transform.resize);
        if (transform.quality) params.set('quality', String(transform.quality));
        const sep = url.includes('?') ? '&' : '?';
        return `${url}${sep}${params.toString()}`;
      };

      const adImages: AdImage[] = (data || []).map((file, index) => {
        let publicUrl = file.file_url;
        if (!publicUrl && file.file_path) {
          const { data: pub } = supabase.storage.from('media').getPublicUrl(file.file_path);
          publicUrl = pub.publicUrl;
        }
        return {
          id: `${location}-${index + 1}`,
          imageUrl: buildUrlWithTransform(publicUrl),
          fileName: file.file_name,
          altText: file.alt_text || file.file_name,
          title: file.file_name,
        };
      });

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