import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
}

const HeroSection = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .eq('active', true)
        .order('order_index');
      
      if (error) {
        console.error('Error fetching banners:', error);
        setError(handleSupabaseError(error));
        // Use default banner if there's an error
        setBanners([{
          id: 'default',
          title: 'Welcome to Maranatha Biblical Seminary',
          subtitle: 'Empowering future leaders with biblical wisdom and practical ministry skills',
          image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
          button_text: 'Explore Programs',
          button_link: '/courses'
        }]);
        return;
      }

      if (data && data.length > 0) {
        setBanners(data);
      } else {
        // Use default banner if no banners found
        setBanners([{
          id: 'default',
          title: 'Welcome to Maranatha Biblical Seminary',
          subtitle: 'Empowering future leaders with biblical wisdom and practical ministry skills',
          image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
          button_text: 'Explore Programs',
          button_link: '/courses'
        }]);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError(err instanceof Error ? err.message : 'Failed to load banners');
      // Use default banner if there's an error
      setBanners([{
        id: 'default',
        title: 'Welcome to Maranatha Biblical Seminary',
        subtitle: 'Empowering future leaders with biblical wisdom and practical ministry skills',
        image_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
        button_text: 'Explore Programs',
        button_link: '/courses'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  useEffect(() => {
    if (banners.length > 1) {
      const timer = setInterval(nextSlide, 5000);
      return () => clearInterval(timer);
    }
  }, [banners.length]);

  if (loading) {
    return (
      <div className="relative h-[600px] bg-gray-200 animate-pulse flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error && banners.length === 0) {
    return (
      <div className="relative h-[600px] bg-gray-100 flex items-center justify-center">
        <div className="text-center text-gray-600 max-w-md px-4">
          <p className="mb-4">{error}</p>
          <button 
            onClick={fetchBanners}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `url(${banner.image_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-4">
              {banner.title && (
                <h1 className="text-5xl font-bold mb-4 animate-fade-in">
                  {banner.title}
                </h1>
              )}
              {banner.subtitle && (
                <p className="text-xl max-w-2xl mx-auto mb-6 animate-fade-in delay-200">
                  {banner.subtitle}
                </p>
              )}
              {banner.button_text && banner.button_link && (
                <a 
                  href={banner.button_link}
                  className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors animate-fade-in delay-400"
                >
                  {banner.button_text}
                </a>
              )}
            </div>
          </div>
        </div>
      ))}

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-primary' : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default HeroSection;