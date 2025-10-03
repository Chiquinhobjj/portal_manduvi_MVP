import { useState, useEffect, useCallback } from 'react';
import { logger } from '../lib/logger';

interface AdImage {
  id: string;
  imageUrl: string;
  fileName: string;
  altText: string;
  title: string;
  linkUrl: string | null;
}

export function useAdImages(
  folderPath: string,
  location: string,
  maxImages: number = 5,
  options: { enabled?: boolean } = {}
) {
  const [images, setImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { enabled = true } = options;

  const loadImagesFromFolder = useCallback(async () => {
    try {
      if (!enabled) {
        setImages([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const imageFiles = await getImagesFromFolder(folderPath, maxImages);
      
      const adImages: AdImage[] = imageFiles.map((fileName, index) => ({
        id: `${location}-${index + 1}`,
        imageUrl: `${folderPath}/${fileName}`,
        fileName,
        altText: `Material Publicitário ${index + 1}`,
        title: `Propaganda ${index + 1}`,
        linkUrl: null,
      }));

      setImages(adImages);
    } catch (err) {
      logger.error('Erro ao carregar imagens:', err);
    } finally {
      setLoading(false);
    }
  }, [enabled, folderPath, location, maxImages]);

  useEffect(() => {
    loadImagesFromFolder();
  }, [loadImagesFromFolder]);

  return { images, loading, error, reload: loadImagesFromFolder };
}

// Função otimizada para carregar apenas as imagens que existem (máximo 5)
async function getImagesFromFolder(folderPath: string, maxImages: number = 5): Promise<string[]> {
  const imageFiles: string[] = [];
  
  // Lista simplificada de possíveis nomes
  const possibleImages = [
    '1.png', '2.png', '3.png', '4.png', '5.png',
    '0.png', '6.png', '7.png', '8.png', '9.png',
    'freepik-projeto-sem-titulo-20251001161418FBLo.png'
  ];

  // Testa apenas até o limite máximo
  for (const fileName of possibleImages) {
    if (imageFiles.length >= maxImages) break;
    
    try {
      const response = await fetch(`${folderPath}/${fileName}`, { method: 'HEAD' });
      if (response.ok) {
        imageFiles.push(fileName);
      }
    } catch {
      // Imagem não existe, continua
    }
  }

  return imageFiles.length > 0 ? imageFiles : ['1.png'];
}
