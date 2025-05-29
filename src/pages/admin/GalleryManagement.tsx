import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface GalleryItem {
  id: string;
  title: string;
  image_url: string;
  description: string;
  category: string;
}

const GalleryManagement = () => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Error fetching gallery items');
      return;
    }

    setGallery(data || []);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removePreview = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('gallery-images')
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
          .from('gallery-images')
          .getPublicUrl(filePath);

        return {
          title: file.name.split('.')[0],
          image_url: publicUrl,
          description: '',
          category: ''
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      const { error: insertError } = await supabase
        .from('gallery')
        .insert(uploadedImages);

      if (insertError) throw insertError;

      // Clear selections and refresh gallery
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadProgress({});
      fetchGallery();
    } catch (err) {
      setError('Error uploading images');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const item = gallery.find(i => i.id === id);
      if (item?.image_url) {
        const imagePath = item.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('gallery-images')
            .remove([`gallery/${imagePath}`]);
        }
      }

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchGallery();
    } catch (err) {
      setError('Error deleting gallery item');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8">
          <Upload className="h-12 w-12 text-gray-400 mb-4" />
          <label className="cursor-pointer bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors">
            Select Images
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFilesChange}
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
                    onClick={() => removePreview(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {uploadProgress[selectedFiles[index].name] && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
                      {uploadProgress[selectedFiles[index].name]}%
                    </div>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={uploadImages}
              disabled={isUploading}
              className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload Selected Images'}
            </button>
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {gallery.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-4 flex justify-end">
              <button
                onClick={() => handleDelete(item.id)}
                className="text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryManagement;