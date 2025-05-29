import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, MoveUp, MoveDown, Upload } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  image_url: string;
  button_text?: string;
  button_link?: string;
  active: boolean;
  order_index: number;
}

const BannerManagement = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('order_index');
    
    if (error) {
      setError('Error fetching banners');
      return;
    }

    setBanners(data || []);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `banners/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('banner-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('banner-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw new Error('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = currentBanner.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (currentBanner.id) {
        const { error } = await supabase
          .from('banners')
          .update({ ...currentBanner, image_url: imageUrl })
          .eq('id', currentBanner.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('banners')
          .insert([{ 
            ...currentBanner, 
            image_url: imageUrl,
            order_index: banners.length 
          }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentBanner({});
      setImageFile(null);
      setPreviewUrl('');
      fetchBanners();
    } catch (err) {
      setError('Error saving banner');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const banner = banners.find(b => b.id === id);
      if (banner?.image_url) {
        const imagePath = banner.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('banner-images')
            .remove([`banners/${imagePath}`]);
        }
      }

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchBanners();
    } catch (err) {
      setError('Error deleting banner');
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = banners.findIndex(b => b.id === id);
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= banners.length) return;

    try {
      const updates = [
        { id: banners[currentIndex].id, order_index: newIndex },
        { id: banners[newIndex].id, order_index: currentIndex }
      ];

      for (const update of updates) {
        const { error } = await supabase
          .from('banners')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
        
        if (error) throw error;
      }

      fetchBanners();
    } catch (err) {
      setError('Error reordering banners');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Banner Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentBanner({});
            setPreviewUrl('');
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {currentBanner.id ? 'Edit Banner' : 'Add New Banner'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Subtitle (Optional)</label>
                <input
                  type="text"
                  value={currentBanner.subtitle || ''}
                  onChange={e => setCurrentBanner({ ...currentBanner, subtitle: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Banner Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!currentBanner.id}
                    />
                  </label>
                  {(previewUrl || currentBanner.image_url) && (
                    <div className="relative h-20 w-32">
                      <img
                        src={previewUrl || currentBanner.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover rounded"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Button Text (Optional)</label>
                  <input
                    type="text"
                    value={currentBanner.button_text || ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, button_text: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Button Link (Optional)</label>
                  <input
                    type="text"
                    value={currentBanner.button_link || ''}
                    onChange={e => setCurrentBanner({ ...currentBanner, button_link: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={currentBanner.active ?? true}
                    onChange={e => setCurrentBanner({ ...currentBanner, active: e.target.checked })}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2">Active</span>
                </label>
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

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtitle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner, index) => (
              <tr key={banner.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={banner.image_url} alt={banner.subtitle || "Banner image"} className="h-16 w-24 object-cover rounded" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{banner.subtitle || "No subtitle"}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    banner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMove(banner.id, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <MoveUp className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleMove(banner.id, 'down')}
                      disabled={index === banners.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                      <MoveDown className="h-5 w-5" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setCurrentBanner(banner);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner.id)}
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
  );
};

export default BannerManagement;