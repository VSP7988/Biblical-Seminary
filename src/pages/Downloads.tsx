import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Download, AlertCircle } from 'lucide-react';

interface DownloadItem {
  id: string;
  title?: string;
  description: string;
  file_url: string;
  image_url: string;
  category: string;
}

const Downloads = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDownloads(data || defaultDownloads);
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError(handleSupabaseError(err));
      setDownloads(defaultDownloads);
    } finally {
      setLoading(false);
    }
  };

  const defaultDownloads = [
    {
      id: '1',
      title: 'Academic Calendar 2025',
      description: 'Complete academic schedule for the year 2025',
      file_url: 'https://www.africau.edu/images/default/sample.pdf',
      image_url: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Academic'
    },
    {
      id: '2',
      title: 'Student Handbook',
      description: 'Guidelines and policies for students',
      file_url: 'https://www.africau.edu/images/default/sample.pdf',
      image_url: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Guidelines'
    },
    {
      id: '3',
      title: 'Course Catalog',
      description: 'Detailed information about our programs',
      file_url: 'https://www.africau.edu/images/default/sample.pdf',
      image_url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Academic'
    },
    {
      id: '4',
      title: 'Library Resources',
      description: 'Guide to library services and resources',
      file_url: 'https://www.africau.edu/images/default/sample.pdf',
      image_url: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
      category: 'Resources'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <div className="text-center">
            <button 
              onClick={fetchDownloads}
              className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Downloads</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Access important documents and resources
            </p>
          </div>
        </div>
      </div>

      {/* Downloads Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {downloads.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={item.image_url}
                    alt="Document thumbnail"
                    className="w-full h-full object-cover"
                  />
                  {item.category && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-white/90 text-gray-800 text-sm font-medium rounded-full">
                        {item.category}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  {item.description && (
                    <p className="text-gray-600 text-sm mb-4">
                      {item.description}
                    </p>
                  )}
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-300"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Downloads;