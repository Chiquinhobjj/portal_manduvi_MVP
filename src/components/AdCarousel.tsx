import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdItem {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  altText?: string;
  title?: string;
}

interface AdCarouselProps {
  ads: AdItem[];
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
  height?: number; // altura fixa em pixels
}

export function AdCarousel({
  ads,
  className,
  autoRotate = true,
  rotationInterval = 5000,
  showNavigation = true,
  showIndicators = true,
  height = 110,
}: AdCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (autoRotate && !isHovered && ads.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, rotationInterval);

      return () => clearInterval(timer);
    }
  }, [autoRotate, isHovered, ads.length, rotationInterval]);

  function goToPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? ads.length - 1 : prev - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev + 1) % ads.length);
  }

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  function handleAdClick(ad: AdItem) {
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  }

  if (ads.length === 0) {
    return (
      <div 
        className={cn('w-full bg-ui-panel/50 dark:bg-dark-panel/50 border border-ui-border dark:border-dark-border rounded-lg flex items-center justify-center', className)}
        style={{ height: `${height}px` }}
      >
        <div className="text-center p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-ui-muted dark:text-dark-muted">
            publicidade
          </div>
          <div className="text-xs text-ui-muted/60 dark:text-dark-muted/60">
            {`responsivo × ${height}px`}
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
          {ads.map((ad) => (
            <div key={ad.id} className="min-w-full h-full flex justify-center items-center">
              {ad.linkUrl ? (
                <button
                  onClick={() => handleAdClick(ad)}
                  className="group w-full h-full transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded-lg overflow-hidden"
                  aria-label={ad.altText || ad.title || 'Propaganda'}
                >
                  <img
                    src={ad.imageUrl}
                    alt={ad.altText || ad.title || 'Propaganda'}
                    className="w-full h-full object-cover"
                  />
                </button>
              ) : (
                <div className="w-full h-full overflow-hidden rounded-lg">
                  <img
                    src={ad.imageUrl}
                    alt={ad.altText || ad.title || 'Propaganda'}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNavigation && ads.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
            aria-label="Propaganda anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 hover:bg-black/70 text-white p-2 shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-white z-10"
            aria-label="Próxima propaganda"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {showIndicators && ads.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-1.5 rounded-full transition-all focus:outline-none focus:ring-1 focus:ring-white',
                index === currentIndex
                  ? 'w-6 bg-white'
                  : 'w-1.5 bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Ir para propaganda ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}