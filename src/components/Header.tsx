import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, GraduationCap } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Logo {
  id: string;
  logo_url: string;
  alt_text: string;
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [logo, setLogo] = useState<Logo | null>(null);
  const location = useLocation();

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Courses', path: '/courses' },
    { name: 'Campus Life', path: '/campus-life' },
    { name: 'Downloads', path: '/downloads' },
    { name: 'Alumni', path: '/alumni' },
    { name: 'Apply Now', path: '/apply', highlight: true },
    { name: 'Give', path: '/give', highlight: false }
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data } = await supabase
        .from('site_logo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (data) {
        setLogo(data);
      }
    } catch (error) {
      console.error('Error fetching logo:', error);
    }
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-primary/10 backdrop-blur-sm' : 'bg-white'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group"
          >
            <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10 group-hover:from-primary/30 group-hover:to-primary/20 transition-all duration-300">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <span className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">
              Maranatha Biblical Seminary
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1 bg-gray-800 rounded-full px-2 py-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-2 rounded-full transition-all duration-300 ${
                  location.pathname === item.path 
                    ? 'text-primary font-medium bg-white' 
                    : item.highlight
                      ? 'bg-primary text-white hover:bg-primary-dark'
                      : 'text-white hover:text-primary hover:bg-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 hover:text-primary transition-colors p-2 rounded-md hover:bg-primary/5"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-gray-800 border-t border-gray-700 animate-in slide-in-from-top duration-300">
            <div className="px-4 py-3 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-4 py-3 rounded-lg ${
                    location.pathname === item.path 
                      ? 'text-primary font-medium bg-white' 
                      : item.highlight
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'text-white hover:text-primary hover:bg-white'
                  } transition-colors duration-300`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;