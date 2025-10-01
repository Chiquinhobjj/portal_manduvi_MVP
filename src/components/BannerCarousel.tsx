import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Banner {
  id: string;
  title: string;
  image_url: string;
  link_url: string | null;
  description: string | null;
  display_order: number;
}

interface BannerCarouselProps {
  className?: string;
  autoRotate?: boolean;
  rotationInterval?: number;
  showNavigation?: boolean;
  showIndicators?: boolean;
}

export function BannerCarousel({
  className,
  autoRotate = true,
  rotationInterval = 5000,
  showNavigation = true,
  showIndicators = true,
}: BannerCarouselProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
    fetchCarouselSettings();
  }, []);

  useEffect(() => {
    if (autoRotate && !isHovered && banners.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, rotationInterval);

      return () => clearInterval(timer);
    }
  }, [autoRotate, isHovered, banners.length, rotationInterval]);

  async function fetchBanners() {
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      const activeBanners = (data || []).filter((banner) => {
        const now = new Date();
        const startValid = !banner.start_date || new Date(banner.start_date) <= now;
        const endValid = !banner.end_date || new Date(banner.end_date) >= now;
        return startValid && endValid;
      });

      setBanners(activeBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCarouselSettings() {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('setting_key, setting_value')
        .in('setting_key', [
          'carousel_auto_rotate',
          'carousel_rotation_interval',
          'carousel_show_navigation',
          'carousel_show_indicators',
        ]);

      if (data) {
        data.forEach((setting) => {
          if (setting.setting_key === 'carousel_auto_rotate') {
            autoRotate = setting.setting_value;
          } else if (setting.setting_key === 'carousel_rotation_interval') {
            rotationInterval = setting.setting_value;
          } else if (setting.setting_key === 'carousel_show_navigation') {
            showNavigation = setting.setting_value;
          } else if (setting.setting_key === 'carousel_show_indicators') {
            showIndicators = setting.setting_value;
          }
        });
      }
    } catch (error) {
      console.error('Error fetching carousel settings:', error);
    }
  }

  async function trackBannerEvent(bannerId: string, eventType: 'impression' | 'click') {
    try {
      const sessionId = getOrCreateSessionId();

      const { data: { user } } = await supabase.auth.getUser();

      await supabase.from('banner_analytics').insert({
        banner_id: bannerId,
        event_type: eventType,
        user_id: user?.id || null,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error tracking banner event:', error);
    }
  }

  function getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('banner_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('banner_session_id', sessionId);
    }
    return sessionId;
  }

  useEffect(() => {
    if (banners.length > 0 && banners[currentIndex]) {
      trackBannerEvent(banners[currentIndex].id, 'impression');
    }
  }, [currentIndex, banners]);

  function handleBannerClick(banner: Banner) {
    trackBannerEvent(banner.id, 'click');
    if (banner.link_url) {
      window.location.href = banner.link_url;
    }
  }

  function goToPrevious() {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  }

  function goToNext() {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  }

  function goToSlide(index: number) {
    setCurrentIndex(index);
  }

  if (loading) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent"></div>
      </div>
    );
  }

  if (banners.length === 0) {
    return null;
  }

  return (
    <div
      className={cn('relative mx-auto', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="overflow-hidden rounded-lgx">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {banners.map((banner) => (
            <div key={banner.id} className="min-w-full flex justify-center items-center py-4">
              {banner.link_url ? (
                <button
                  onClick={() => handleBannerClick(banner)}
                  className="group transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 rounded-lg"
                  aria-label={banner.title}
                >
                  <img
                    src={banner.image_url}
                    alt={banner.description || banner.title}
                    className="w-[100px] h-[100px] object-cover rounded-lg shadow-md"
                  />
                </button>
              ) : (
                <div className="transition-transform hover:scale-105">
                  <img
                    src={banner.image_url}
                    alt={banner.description || banner.title}
                    className="w-[100px] h-[100px] object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showNavigation && banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 rounded-full bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border p-2 shadow-md transition-all hover:bg-brand hover:text-white hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label="Banner anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 rounded-full bg-ui-panel dark:bg-dark-panel border border-ui-border dark:border-dark-border p-2 shadow-md transition-all hover:bg-brand hover:text-white hover:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            aria-label="Próximo banner"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {showIndicators && banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-brand',
                index === currentIndex
                  ? 'w-8 bg-brand'
                  : 'w-2 bg-ui-border dark:bg-dark-border hover:bg-brand/50'
              )}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
