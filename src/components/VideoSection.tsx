import React, { useEffect, useState } from 'react';
import { supabase, handleSupabaseError } from '../lib/supabase';
import ReactPlayer from 'react-player/youtube';
import { Play } from 'lucide-react';

interface Video {
  id: string;
  title: string;
  subtitle?: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
}

const VideoSection = () => {
  const [featuredVideo, setFeaturedVideo] = useState<Video | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedVideo();
  }, []);

  const fetchFeaturedVideo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First try to get the most recent video
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      // If we have data and at least one video, use it
      if (data && data.length > 0) {
        setFeaturedVideo(data[0]);
      } else {
        // No videos found, use default
        setFeaturedVideo(defaultVideo);
      }
    } catch (err) {
      console.error('Error fetching featured video:', err);
      const errorMessage = handleSupabaseError(err);
      setError(errorMessage);
      // Use default video on error
      setFeaturedVideo(defaultVideo);
    } finally {
      setLoading(false);
    }
  };

  const defaultVideo = {
    id: '1',
    title: 'Introduction to Biblical Studies',
    subtitle: 'Learn the fundamentals',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail_url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba',
    description: 'Learn the fundamentals of Biblical studies with our expert faculty.'
  };

  const handlePlayClick = () => {
    setIsPlaying(true);
  };

  if (loading) {
    return (
      <section className="w-full bg-gradient-to-br from-orange-500 to-orange-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Video
            </h2>
            <div className="w-full max-w-4xl bg-white/20 rounded-2xl h-96 animate-pulse mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error && !featuredVideo) {
    return (
      <section className="w-full bg-gradient-to-br from-orange-500 to-orange-600 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Featured Video
            </h2>
            <p className="text-lg text-orange-100 mb-8">
              {error}
            </p>
            <button 
              onClick={fetchFeaturedVideo}
              className="px-6 py-3 bg-white text-primary rounded-lg hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredVideo) return null;

  return (
    <section className="w-full bg-gradient-to-br from-orange-500 to-orange-600 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Featured Video
          </h2>
          <p className="text-lg text-orange-100">
            Watch our latest video to learn more about our seminary, programs, and community life.
          </p>
        </div>

        <div className="flex flex-col items-center">
          {/* Main Video Player */}
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden mb-8">
            <div style={{ height: '500px' }} className="relative">
              {isPlaying ? (
                <ReactPlayer
                  url={featuredVideo.video_url}
                  width="100%"
                  height="100%"
                  controls
                  playing
                />
              ) : (
                <div className="relative w-full h-full cursor-pointer" onClick={handlePlayClick}>
                  <img 
                    src={featuredVideo.thumbnail_url} 
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full bg-primary/90 flex items-center justify-center transform transition-transform hover:scale-110">
                      <Play className="h-10 w-10 text-white ml-1" />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-orange-50">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                {featuredVideo.title}
              </h3>
              {featuredVideo.subtitle && (
                <p className="text-primary font-medium mb-2">
                  {featuredVideo.subtitle}
                </p>
              )}
              <p className="text-gray-600">
                {featuredVideo.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VideoSection;