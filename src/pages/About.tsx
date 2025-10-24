import React, { useEffect, useState } from 'react';
import { Target, Heart, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AboutSection {
  id: string;
  section_type: 'history' | 'vision' | 'mission';
  title: string;
  content: string;
}

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
}

const About = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchSections();
    fetchGallery();
  }, []);

  const fetchSections = async () => {
    const { data } = await supabase
      .from('about_sections')
      .select('*')
      .order('created_at');
    
    setSections(data || []);
  };

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('about_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    setGallery(data || []);
  };

  const getSection = (type: AboutSection['section_type']) => 
    sections.find(section => section.section_type === type);

  const historySection = getSection('history');
  const visionSection = getSection('vision');
  const missionSection = getSection('mission');

  const handleImageClick = (image: GalleryImage) => {
    const index = gallery.findIndex(img => img.id === image.id);
    setCurrentIndex(index);
    setSelectedImage(image);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    let newIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0) {
      newIndex = gallery.length - 1;
    } else if (newIndex >= gallery.length) {
      newIndex = 0;
    }

    setCurrentIndex(newIndex);
    setSelectedImage(gallery[newIndex]);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSelectedImage(null);
    } else if (e.key === 'ArrowLeft') {
      navigateImage('prev');
    } else if (e.key === 'ArrowRight') {
      navigateImage('next');
    }
  };

  useEffect(() => {
    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [selectedImage, currentIndex]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">About Us</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Empowering future leaders with biblical wisdom and practical ministry skills
            </p>
          </div>
        </div>
      </div>

      {/* History Section */}
      {historySection && (
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-8">{historySection.title}</h2>
              <div 
                className="prose prose-lg mx-auto"
                dangerouslySetInnerHTML={{ __html: historySection.content }}
              />
            </div>
          </div>
        </section>
      )}

      {/* Vision & Mission Section */}
      {(visionSection || missionSection) && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Vision */}
              {visionSection && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Target className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold ml-4">{visionSection.title}</h2>
                  </div>
                  <div 
                    className="prose text-gray-600"
                    dangerouslySetInnerHTML={{ __html: visionSection.content }}
                  />
                </div>
              )}

              {/* Mission */}
              {missionSection && (
                <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl p-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-xl">
                      <Heart className="h-8 w-8 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold ml-4">{missionSection.title}</h2>
                  </div>
                  <div 
                    className="prose text-gray-600"
                    dangerouslySetInnerHTML={{ __html: missionSection.content }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery Section */}
      {gallery.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Campus Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-square overflow-hidden rounded-lg">
                    <img
                      src={image.image_url}
                      alt={image.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-8 w-8" />
          </button>

          {/* Previous Button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transform transition-all hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('prev');
            }}
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          {/* Next Button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg transform transition-all hover:scale-110"
            onClick={(e) => {
              e.stopPropagation();
              navigateImage('next');
            }}
          >
            <ChevronRight className="h-8 w-8" />
          </button>

          <div 
            className="relative max-w-7xl w-full"
            onClick={e => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default About;