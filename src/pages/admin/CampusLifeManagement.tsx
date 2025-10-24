import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X, Image as ImageIcon, Database, Camera } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface CampusEvent {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

interface GalleryImage {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
}

type Tab = 'data' | 'gallery';

const CampusLifeManagement = () => {
  const [activeTab, setActiveTab] = useState<Tab>('data');
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<CampusEvent>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchEvents();
    fetchGalleryImages();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('campus_life')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Error fetching events');
      return;
    }

    setEvents(data || []);
  };

  const fetchGalleryImages = async () => {
    const { data, error } = await supabase
      .from('campus_life_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Error fetching gallery images');
      return;
    }

    setGalleryImages(data || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGalleryImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `campus-life/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('campus-life-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('campus-life-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw new Error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const uploadGalleryImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `campus-life-gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('campus-life-images')
          .upload(filePath, file, {
            onUploadProgress: (progress) => {
              setUploadProgress(prev => ({
                ...prev,
                [fileName]: Math.round((progress.loaded / progress.total) * 100)
              }));
            }
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('campus-life-images')
          .getPublicUrl(filePath);

        return {
          image_url: publicUrl,
          caption: ''
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      const { error: insertError } = await supabase
        .from('campus_life_gallery')
        .insert(uploadedImages);

      if (insertError) throw insertError;

      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress({});
      fetchGalleryImages();
    } catch (err) {
      setError('Error uploading gallery images');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = currentEvent.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (currentEvent.id) {
        const { error } = await supabase
          .from('campus_life')
          .update({ ...currentEvent, image_url: imageUrl })
          .eq('id', currentEvent.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('campus_life')
          .insert([{ ...currentEvent, image_url: imageUrl }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentEvent({});
      setImageFile(null);
      setPreviewUrl('');
      fetchEvents();
    } catch (err) {
      setError('Error saving event');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const event = events.find(e => e.id === id);
      if (event?.image_url) {
        const imagePath = event.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('campus-life-images')
            .remove([`campus-life/${imagePath}`]);
        }
      }

      const { error } = await supabase
        .from('campus_life')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchEvents();
    } catch (err) {
      setError('Error deleting event');
    }
  };

  const handleDeleteGalleryImage = async (image: GalleryImage) => {
    try {
      const imagePath = image.image_url.split('/').pop();
      if (imagePath) {
        await supabase.storage
          .from('campus-life-images')
          .remove([`campus-life-gallery/${imagePath}`]);
      }

      const { error } = await supabase
        .from('campus_life_gallery')
        .delete()
        .eq('id', image.id);
      
      if (error) throw error;

      fetchGalleryImages();
    } catch (err) {
      setError('Error deleting gallery image');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Campus Life Management</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'data'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Database className="h-4 w-4" />
            <span>Data Management</span>
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center space-x-2 px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'gallery'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Camera className="h-4 w-4" />
            <span>Gallery Management</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Data Management Tab */}
      {activeTab === 'data' && (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentEvent({});
                setPreviewUrl('');
              }}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Event</span>
            </button>
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Image
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {events.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="h-16 w-24 object-cover rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 line-clamp-2">{event.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(event.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setCurrentEvent(event);
                            setIsEditing(true);
                          }}
                          className="text-primary hover:text-primary-dark"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Gallery Management Tab */}
      {activeTab === 'gallery' && (
        <div>
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
              <ImageIcon className="h-12 w-12 text-gray-400 mb-4" />
              <label className="cursor-pointer bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors">
                Select Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleGalleryImagesChange}
                />
              </label>
              <p className="mt-2 text-sm text-gray-500">
                Select multiple images to upload
              </p>
            </div>

            {/* Preview Section */}
            {previewUrls.length > 0 && (
              <div className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {previewUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => {
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                          setPreviewUrls(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      {uploadProgress[selectedFiles[index]?.name] && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                          {uploadProgress[selectedFiles[index].name]}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={uploadGalleryImages}
                  disabled={uploading || selectedFiles.length === 0}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Selected Images'}
                </button>
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {galleryImages.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.image_url}
                    alt="Gallery image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteGalleryImage(image)}
                      className="text-white hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-6 w-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Form Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {currentEvent.id ? 'Edit Event' : 'Add New Event'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentEvent.title || ''}
                  onChange={e => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  value={currentEvent.content || ''}
                  onChange={e => setCurrentEvent({ ...currentEvent, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  rows={5}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Event Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!currentEvent.id}
                    />
                  </label>
                  {(previewUrl || currentEvent.image_url) && (
                    <div className="relative h-20 w-32">
                      <img
                        src={previewUrl || currentEvent.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampusLifeManagement;