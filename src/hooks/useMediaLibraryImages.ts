import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

interface AdImage {
  id: string;
  imageUrl: string;
  fileName: string;
  altText: string;
  title: string;
  linkUrl: string | null;
}

export function useMediaLibraryImages(
  folder: string,
  location: string,
  maxImages: number = 5,
  transform?: { width?: number; height?: number; resize?: 'cover' | 'contain' | 'fill'; quality?: number },
  options: { enabled?: boolean } = {}
) {
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true } = options;

  const normalizedTransform = useMemo(() => {
    if (!transform) return undefined;
    return {
      width: transform.width,
      height: transform.height,
      resize: transform.resize,
      quality: transform.quality,
    };
  }, [transform]);

  const loadImagesFromMediaLibrary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!enabled) {
        setImages([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('media_library')
        .select('id, file_name, file_url, file_path, alt_text, folder, uploaded_at, link_url')
        .eq('folder', folder)
        .order('uploaded_at', { ascending: false })
        .limit(maxImages);

      if (error) throw error;

      const buildUrlWithTransform = (url: string) => {
        if (!normalizedTransform) return url;
        const params = new URLSearchParams();
        if (normalizedTransform.width)
          params.set('width', String(normalizedTransform.width));
        if (normalizedTransform.height)
          params.set('height', String(normalizedTransform.height));
        if (normalizedTransform.resize)
          params.set('resize', normalizedTransform.resize);
        if (normalizedTransform.quality)
          params.set('quality', String(normalizedTransform.quality));
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
          linkUrl: file.link_url ?? null,
        };
      });

      setImages(adImages);
    } catch (err) {
      logger.error('Erro ao carregar imagens da media_library:', err);
      setError('Falha ao carregar imagens');
    } finally {
      setLoading(false);
    }
  }, [enabled, folder, location, maxImages, normalizedTransform]);

  useEffect(() => {
    loadImagesFromMediaLibrary();
  }, [loadImagesFromMediaLibrary]);

  return { images, loading, error, reload: loadImagesFromMediaLibrary };
}
