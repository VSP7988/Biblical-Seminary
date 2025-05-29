import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X, Download, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DownloadItem {
  id: string;
  description: string;
  file_url: string;
  image_url: string;
  category: string;
  created_at: string;
}

const DownloadsManagement = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<Partial<DownloadItem>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDownloads();
  }, []);

  const fetchDownloads = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('downloads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        setError('Error fetching downloads');
        return;
      }

      setDownloads(data || []);
    } catch (err) {
      console.error('Error fetching downloads:', err);
      setError('Failed to load downloads');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file);
    }
  };

  const uploadFiles = async () => {
    try {
      setUploading(true);
      let imageUrl = currentItem.image_url;
      let fileUrl = currentItem.file_url;

      if (imageFile) {
        const imageExt = imageFile.name.split('.').pop();
        const imageName = `${uuidv4()}.${imageExt}`;
        const imagePath = `thumbnails/${imageName}`;

        const { error: imageError } = await supabase.storage
          .from('downloads')
          .upload(imagePath, imageFile);

        if (imageError) throw imageError;

        const { data: { publicUrl: imagePublicUrl } } = supabase.storage
          .from('downloads')
          .getPublicUrl(imagePath);

        imageUrl = imagePublicUrl;
      }

      if (pdfFile) {
        const pdfExt = pdfFile.name.split('.').pop();
        const pdfName = `${uuidv4()}.${pdfExt}`;
        const pdfPath = `files/${pdfName}`;

        const { error: pdfError } = await supabase.storage
          .from('downloads')
          .upload(pdfPath, pdfFile);

        if (pdfError) throw pdfError;

        const { data: { publicUrl: pdfPublicUrl } } = supabase.storage
          .from('downloads')
          .getPublicUrl(pdfPath);

        fileUrl = pdfPublicUrl;
      }

      return { imageUrl, fileUrl };
    } catch (error) {
      console.error('Error uploading files:', error);
      throw new Error('Error uploading files');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!imageFile && !currentItem.image_url) {
        throw new Error('Please select a thumbnail image');
      }

      if (!pdfFile && !currentItem.file_url) {
        throw new Error('Please select a PDF file');
      }

      const { imageUrl, fileUrl } = await uploadFiles();

      // Use the PDF filename as the title if creating a new item
      const fileName = pdfFile ? pdfFile.name.split('.')[0] : '';
      const title = fileName || (currentItem.id ? 'Document' : '');

      const downloadData = {
        title: title,
        description: '',
        category: '',
        image_url: imageUrl,
        file_url: fileUrl
      };

      if (currentItem.id) {
        const { error } = await supabase
          .from('downloads')
          .update(downloadData)
          .eq('id', currentItem.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('downloads')
          .insert([downloadData]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentItem({});
      setImageFile(null);
      setPdfFile(null);
      setPreviewUrl('');
      fetchDownloads();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving download item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this download?')) return;
    
    try {
      const item = downloads.find(d => d.id === id);
      if (item) {
        // Delete files from storage
        const imagePath = item.image_url.split('/').pop();
        const filePath = item.file_url.split('/').pop();

        if (imagePath) {
          await supabase.storage
            .from('downloads')
            .remove([`thumbnails/${imagePath}`]);
        }

        if (filePath) {
          await supabase.storage
            .from('downloads')
            .remove([`files/${filePath}`]);
        }
      }

      const { error } = await supabase
        .from('downloads')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchDownloads();
    } catch (err) {
      setError('Error deleting download item');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Downloads Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentItem({});
            setPreviewUrl('');
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Download</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Downloads Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {downloads.length === 0 ? (
            <div className="col-span-full bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No downloads found. Add your first download!</p>
            </div>
          ) : (
            downloads.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={item.image_url}
                    alt="Download thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {item.title || 'Document'}
                  </h3>
                  <div className="flex justify-between items-center">
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary hover:text-primary-dark"
                    >
                      <Download className="h-5 w-5" />
                      <span>Download</span>
                    </a>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentItem(item);
                          setIsEditing(true);
                          setPreviewUrl(item.image_url);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {currentItem.id ? 'Edit Download' : 'Add New Download'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Upload Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">1. Thumbnail Image</h4>
                <div className="flex flex-col items-center space-y-4">
                  {(previewUrl || currentItem.image_url) && (
                    <div className="relative h-40 w-full">
                      <img
                        src={previewUrl || currentItem.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                  )}
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <Upload className="h-5 w-5 mr-2" />
                    {previewUrl || currentItem.image_url ? 'Change Image' : 'Choose Image'}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                </div>
              </div>

              {/* PDF Upload Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">2. PDF File</h4>
                <div className="flex flex-col items-center space-y-4">
                  {(pdfFile || currentItem.file_url) && (
                    <div className="bg-gray-100 p-3 rounded w-full text-center">
                      <p className="text-sm text-gray-700 truncate">
                        {pdfFile ? pdfFile.name : 'Current PDF file'}
                      </p>
                    </div>
                  )}
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer w-full">
                    <Upload className="h-5 w-5 mr-2" />
                    {pdfFile || currentItem.file_url ? 'Change PDF' : 'Choose PDF'}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={handlePdfChange}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewUrl('');
                    setImageFile(null);
                    setPdfFile(null);
                    setCurrentItem({});
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

export default DownloadsManagement;