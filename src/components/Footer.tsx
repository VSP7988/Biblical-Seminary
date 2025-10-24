import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Lock
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Logo {
  id: string;
  logo_url: string;
  alt_text: string;
}

const Footer = () => {
  const [logo, setLogo] = useState<Logo | null>(null);

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
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            {logo ? (
              <div className="mb-4">
                <img 
                  src={logo.logo_url} 
                  alt={logo.alt_text || 'Site Logo'} 
                  className="h-[200px] w-[200px] object-contain"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">Maranatha Biblical Seminary</span>
              </div>
            )}
            
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-gray-400 hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-gray-400 hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/campus-life" className="text-gray-400 hover:text-primary transition-colors">
                  Campus Life
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/downloads" className="text-gray-400 hover:text-primary transition-colors">
                  Downloads
                </Link>
              </li>
              <li>
                <Link to="/give" className="text-gray-400 hover:text-primary transition-colors">
                  Give
                </Link>
              </li>
              <li>
                <Link to="/alumni" className="text-gray-400 hover:text-primary transition-colors">
                  Alumni
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-400">+91 94413 08156</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-400">+91 80082 86866</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-400">mbiblicalseminary@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-gray-400"># 9-103, Vikas Engineering College Road, Nunna, Vijayawada - 520010.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex justify-between items-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Dream Studio. All rights reserved.</p>
          <div className="flex items-center space-x-8">
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <Link 
              to="/admin/login" 
              className="flex items-center space-x-2 text-gray-400 hover:text-primary transition-colors"
            >
              <Lock className="h-4 w-4" />
              <span>Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;