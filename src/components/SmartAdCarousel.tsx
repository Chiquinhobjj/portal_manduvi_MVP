import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAdImages } from '../hooks/useAdImages';
import { useMediaLibraryImages } from '../hooks/useMediaLibraryImages';

interface SmartAdCarouselProps {
  folderPath?: string;
  location: string;
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  height?: number;
  defaultLinkUrl?: string;
  maxImages?: number;
  // Novas props para o botão CTA
  showCTAButton?: boolean;
  ctaText?: string;
  ctaUrl?: string;
  ctaPosition?: 'bottom-left' | 'bottom-right' | 'bottom-center' | 'center';
  // Nova prop para controlar overlay
  showOverlay?: boolean;
  hideWhenEmpty?: boolean; // novo
}

export function SmartAdCarousel({
  folderPath,
  location,
  className,
  autoRotate = true,
  rotationInterval = 8000,
  showNavigation = true,
  showIndicators = true,
  height = 110,
  defaultLinkUrl = 'https://exemplo.com',
  maxImages = 5,
  showCTAButton = false,
  ctaText = 'Saiba Mais',
  ctaUrl,
  ctaPosition = 'bottom-center',
  showOverlay = false,
  source = 'static',
  mediaFolder,
  hideWhenEmpty = false,
}: SmartAdCarouselProps & { source?: 'static' | 'media'; mediaFolder?: string }) {
  const mediaImages = useMediaLibraryImages(
    mediaFolder ?? '',
    location,
    maxImages,
    { height, resize: 'cover', quality: 85 },
    { enabled: source === 'media' && Boolean(mediaFolder) }
  );

  const staticImages = useAdImages(folderPath ?? '', location, maxImages, {
    enabled: source === 'static' && Boolean(folderPath),
  });

  const images = source === 'media' && mediaFolder ? mediaImages.images : staticImages.images;
  const loading = source === 'media' && mediaFolder ? mediaImages.loading : staticImages.loading;
  const error = source === 'media' && mediaFolder ? mediaImages.error : staticImages.error;
  const activeLink = (index: number) => {
    if (source === 'media' && mediaFolder) {
      return mediaImages.images[index]?.linkUrl ?? null;
    }
    if (source === 'static' && folderPath) {
      return staticImages.images[index]?.linkUrl ?? null;
    }
    return null;
  };
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (autoRotate && !isHovered && images.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, rotationInterval);

      return () => clearInterval(timer);
    }
  }, [autoRotate, isHovered, images.length, rotationInterval]);

  function goToPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function handleAdClick(index: number) {
    const link = activeLink(index) ?? defaultLinkUrl;
    if (link) {
      window.open(link, '_blank');
    }
  }

  function handleCTAClick(e: React.MouseEvent) {
    e.stopPropagation(); // Evita que o clique na imagem seja acionado
    const url = activeLink(currentIndex) || ctaUrl || defaultLinkUrl;
    if (url) {
      window.open(url, '_blank');
    }
  }

  // Função para obter as classes de posicionamento do CTA
  function getCTAPositionClasses() {
    switch (ctaPosition) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-4 left-1/2 -translate-x-1/2';
    }
  }

  if (loading) {
    return (
      <div
        className={cn('relative w-full bg-ui-light dark:bg-dark-light rounded-lg', className)}
        style={{ height: `${height}px` }}
      >
        <div className="flex items-center justify-center h-full">
          <div className="text-center p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted mb-1">
              Carregando...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || images.length === 0) {
    if (hideWhenEmpty) return null;
    return (
      <div
        className={cn('relative w-full bg-ui-light dark:bg-dark-light rounded-lg', className)}
        style={{ height: `${height}px` }}
      >
        <div className="text-center p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted mb-1">
            Publicidade
          </div>
          <div className="text-xs text-ui-muted/60 dark:text-dark-muted/60">
            {error || 'Nenhuma imagem disponível'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative w-full', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height: `${height}px` }}
    >
      <div className="overflow-hidden rounded-lg h-full">
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={image.id} className="min-w-full h-full flex justify-center items-center relative">
              {/* Imagem clicável - agora usando div ao invés de button */}
              <div
                onClick={() => handleAdClick(index)}
                className="group w-full h-full transition-transform hover:scale-[1.02] cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded-lg overflow-hidden relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleAdClick(index);
                  }
                }}
                aria-label={image.altText}
              >
                <img
                  src={image.imageUrl}
                  alt={image.altText}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay com números - apenas se showOverlay for true */}
                {showOverlay && (
                  <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono">
                    {images.length > 1 ? `${currentIndex + 1}/${images.length}` : '1/1'}
                  </div>
                )}
              </div>

              {/* Botão CTA configurável - agora fora do elemento clicável principal */}
              {showCTAButton && (
                <div className={cn('absolute z-20 pointer-events-none', getCTAPositionClasses())}>
                  <button
                    onClick={handleCTAClick}
                    className="bg-brand hover:bg-brand-dark text-white px-6 py-2 rounded-full font-semibold text-sm shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-brand pointer-events-auto"
                  >
                    {ctaText}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons - ajustados para não conflitar com CTA */}
      {showNavigation && images.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
            aria-label="Anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
            aria-label="Próximo"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Indicators - ajustados para não conflitar com CTA */}
      {showIndicators && images.length > 1 && (
        <div className={cn(
          'absolute left-1/2 -translate-x-1/2 flex gap-1 z-10',
          showCTAButton && ctaPosition === 'bottom-center' ? 'bottom-16' : 'bottom-2'
        )}>
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-1.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
