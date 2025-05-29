import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Play, X, AlertCircle } from 'lucide-react';
import ReactPlayer from 'react-player/youtube';

interface Video {
  id: string;
  title: string;
  subtitle: string;
  video_url: string;
  thumbnail_url: string;
  description: string;
  created_at: string;
}

const VideoManagement = () => {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<Partial<Video>>({});
  const [error, setError] = useState('');
  const [previewVideo, setPreviewVideo] = useState<Video | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      setError('Error fetching videos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!currentVideo.title || !currentVideo.video_url) {
        throw new Error('Title and video URL are required');
      }

      // Validate YouTube URL
      if (!ReactPlayer.canPlay(currentVideo.video_url)) {
        throw new Error('Please enter a valid YouTube URL');
      }

      // Extract thumbnail from YouTube if not provided
      let thumbnailUrl = currentVideo.thumbnail_url;
      if (!thumbnailUrl) {
        // Try to extract video ID from YouTube URL
        const videoId = extractYouTubeVideoId(currentVideo.video_url);
        if (videoId) {
          thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        } else {
          throw new Error('Could not extract thumbnail from YouTube URL');
        }
      }

      if (currentVideo.id) {
        // Update existing video
        const { error } = await supabase
          .from('videos')
          .update({
            title: currentVideo.title,
            subtitle: currentVideo.subtitle || '',
            video_url: currentVideo.video_url,
            thumbnail_url: thumbnailUrl,
            description: currentVideo.description || ''
          })
          .eq('id', currentVideo.id);
        
        if (error) throw error;
      } else {
        // Create new video
        const { error } = await supabase
          .from('videos')
          .insert([{
            title: currentVideo.title,
            subtitle: currentVideo.subtitle || '',
            video_url: currentVideo.video_url,
            thumbnail_url: thumbnailUrl,
            description: currentVideo.description || ''
          }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentVideo({});
      fetchVideos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving video');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return;
    
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchVideos();
    } catch (err) {
      setError('Error deleting video');
    }
  };

  const extractYouTubeVideoId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const openPreview = (video: Video) => {
    setPreviewVideo(video);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewVideo(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Featured Video Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentVideo({});
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Video</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {videos.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No videos found. Add your first featured video!</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Current Featured Video</h3>
              <p className="text-gray-600 mb-4">
                Only the most recently added video will be displayed as the featured video on the homepage.
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                {videos.map((video, index) => (
                  <div
                    key={video.id}
                    className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border ${index === 0 ? 'border-primary' : 'border-gray-200'}`}
                  >
                    {index === 0 && (
                      <div className="bg-primary text-white text-center py-1 text-sm font-medium">
                        Currently Featured
                      </div>
                    )}
                    <div className="flex flex-col md:flex-row">
                      <div className="relative h-48 md:w-1/3 cursor-pointer" onClick={() => openPreview(video)}>
                        <img
                          src={video.thumbnail_url}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <Play className="h-12 w-12 text-white" />
                        </div>
                      </div>
                      <div className="p-6 md:w-2/3">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {video.title}
                        </h3>
                        {video.subtitle && (
                          <p className="text-primary font-medium mb-2">
                            {video.subtitle}
                          </p>
                        )}
                        {video.description && (
                          <p className="text-gray-600 text-sm mb-4">
                            {video.description}
                          </p>
                        )}
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setCurrentVideo(video);
                              setIsEditing(true);
                            }}
                            className="text-primary hover:text-primary-dark"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(video.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {currentVideo.id ? 'Edit Video' : 'Add New Video'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentVideo.title || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Enter video title"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtitle</label>
                <input
                  type="text"
                  value={currentVideo.subtitle || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, subtitle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Enter video subtitle (optional)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
                <input
                  type="url"
                  value={currentVideo.video_url || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, video_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="e.g., https://www.youtube.com/watch?v=..."
                  required
                />
                <p className="mt-1 text-sm text-gray-500">
                  Enter a valid YouTube URL. The thumbnail will be automatically extracted.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Custom Thumbnail URL (Optional)</label>
                <input
                  type="url"
                  value={currentVideo.thumbnail_url || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, thumbnail_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Enter custom thumbnail URL (optional)"
                />
                <p className="mt-1 text-sm text-gray-500">
                  If left empty, the YouTube thumbnail will be used.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={currentVideo.description || ''}
                  onChange={e => setCurrentVideo({ ...currentVideo, description: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  rows={3}
                  placeholder="Enter video description (optional)"
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {isPreviewOpen && previewVideo && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          
          <div className="w-full max-w-4xl">
            <div className="aspect-video mb-4">
              <ReactPlayer
                url={previewVideo.video_url}
                width="100%"
                height="100%"
                controls
                playing
              />
            </div>
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {previewVideo.title}
              </h3>
              {previewVideo.subtitle && (
                <p className="text-primary font-medium mb-2">
                  {previewVideo.subtitle}
                </p>
              )}
              {previewVideo.description && (
                <p className="text-gray-600">
                  {previewVideo.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoManagement;