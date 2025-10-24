import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Facebook, Twitter, Instagram, Linkedin, ChevronLeft, ChevronRight } from 'lucide-react';

interface Teacher {
  id: string;
  name: string;
  position: string;
  image_url: string;
  bio: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
}

const TeachersSection = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .order('name');
    
    setTeachers(data || []);
  };

  const defaultTeachers = [
    {
      name: 'Dr. Sarah Johnson',
      position: 'Dean of Theology',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Expert in Biblical Studies with over 15 years of teaching experience.',
      facebook_url: 'https://facebook.com',
      twitter_url: 'https://twitter.com',
      instagram_url: 'https://instagram.com',
      linkedin_url: 'https://linkedin.com'
    },
    {
      name: 'Dr. Michael Chen',
      position: 'Professor of Biblical Languages',
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Specializes in Hebrew and Greek, passionate about making ancient texts accessible.',
      facebook_url: 'https://facebook.com',
      twitter_url: 'https://twitter.com',
      linkedin_url: 'https://linkedin.com'
    },
    {
      name: 'Dr. Rachel Thompson',
      position: 'Professor of Pastoral Ministry',
      image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Combines academic excellence with practical ministry experience.',
      twitter_url: 'https://twitter.com',
      instagram_url: 'https://instagram.com',
      linkedin_url: 'https://linkedin.com'
    },
    {
      name: 'Dr. James Wilson',
      position: 'Professor of Church History',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Renowned historian specializing in early church development.',
      facebook_url: 'https://facebook.com',
      instagram_url: 'https://instagram.com',
      linkedin_url: 'https://linkedin.com'
    }
  ];

  const SocialIcon = ({ url, icon: Icon, label }: { url?: string; icon: React.ElementType; label: string }) => {
    if (!url) return null;
    
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-primary transition-colors"
        aria-label={`${label} profile`}
      >
        <Icon className="h-5 w-5" />
      </a>
    );
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const cardWidth = 320; // Width of each card including gap
      const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  return (
    <section 
      className="py-20 bg-cover bg-center bg-fixed relative"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')`
      }}
    >
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Meet Our Distinguished Faculty
          </h2>
          <p className="text-lg text-gray-300">
            Our faculty members are dedicated scholars and experienced practitioners
            who are committed to nurturing the next generation of Christian leaders.
          </p>
        </div>

        <div className="relative px-4">
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transform transition-all hover:scale-110"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-gray-800 p-3 rounded-full shadow-lg transform transition-all hover:scale-110"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {(teachers.length > 0 ? teachers : defaultTeachers).map((teacher) => (
              <div
                key={teacher.name}
                className="flex-none w-[280px] bg-white rounded-lg overflow-hidden shadow-xl transform hover:-translate-y-2 transition-all duration-300 snap-start"
              >
                <div className="relative group">
                  <img
                    src={teacher.image_url}
                    alt={teacher.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {teacher.name}
                  </h3>
                  <p className="text-primary font-medium mb-3">
                    {teacher.position}
                  </p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {teacher.bio}
                  </p>
                  <div className="flex items-center space-x-4">
                    <SocialIcon url={teacher.facebook_url} icon={Facebook} label="Facebook" />
                    <SocialIcon url={teacher.twitter_url} icon={Twitter} label="Twitter" />
                    <SocialIcon url={teacher.instagram_url} icon={Instagram} label="Instagram" />
                    <SocialIcon url={teacher.linkedin_url} icon={Linkedin} label="LinkedIn" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <a
            href="/about/faculty"
            className="inline-flex items-center bg-white text-primary px-8 py-3 rounded-full hover:bg-primary hover:text-white transition-colors duration-300 shadow-lg"
          >
            View All Faculty Members
            <ChevronRight className="ml-2 h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default TeachersSection;