import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X, Image as ImageIcon } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

interface AboutSection {
  id: string;
  section_type: 'history' | 'vision' | 'mission';
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

const AboutManagement = () => {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSection, setCurrentSection] = useState<Partial<AboutSection>>({});
  const [activeTab, setActiveTab] = useState<'content' | 'gallery'>('content');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    fetchSections();
    fetchGallery();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('about_sections')
      .select('*')
      .order('created_at');
    
    if (error) {
      setError('Error fetching sections');
      return;
    }

    setSections(data || []);
  };

  const fetchGallery = async () => {
    const { data, error } = await supabase
      .from('about_gallery')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Error fetching gallery');
      return;
    }

    setGallery(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (currentSection.id) {
        const { error } = await supabase
          .from('about_sections')
          .update({
            title: currentSection.title,
            content: currentSection.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentSection.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('about_sections')
          .insert([{
            section_type: currentSection.section_type,
            title: currentSection.title,
            content: currentSection.content
          }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentSection({});
      fetchSections();
    } catch (err) {
      setError('Error saving section');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('about_sections')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchSections();
    } catch (err) {
      setError('Error deleting section');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const uploadImages = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('about-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('about-images')
          .getPublicUrl(filePath);

        return {
          title: file.name.split('.')[0],
          image_url: publicUrl,
          description: ''
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);

      const { error: insertError } = await supabase
        .from('about_gallery')
        .insert(uploadedImages);

      if (insertError) throw insertError;

      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchGallery();
    } catch (err) {
      setError('Error uploading images');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (image: GalleryImage) => {
    try {
      const imagePath = image.image_url.split('/').pop();
      if (imagePath) {
        await supabase.storage
          .from('about-images')
          .remove([`gallery/${imagePath}`]);
      }

      const { error } = await supabase
        .from('about_gallery')
        .delete()
        .eq('id', image.id);
      
      if (error) throw error;
      fetchGallery();
    } catch (err) {
      setError('Error deleting image');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">About Page Management</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('content')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'content'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Content Management
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-4 py-2 border-b-2 font-medium text-sm ${
              activeTab === 'gallery'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Gallery Management
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Content Management Tab */}
      {activeTab === 'content' && (
        <div>
          <div className="flex justify-end mb-6">
            <button
              onClick={() => {
                setIsEditing(true);
                setCurrentSection({});
              }}
              className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Add Section</span>
            </button>
          </div>

          {/* Sections List */}
          <div className="space-y-6">
            {sections.map((section) => (
              <div
                key={section.id}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium mb-2">
                      {section.section_type.charAt(0).toUpperCase() + section.section_type.slice(1)}
                    </span>
                    <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setCurrentSection(section);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(section.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: section.content }} />
              </div>
            ))}
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
                  onChange={handleImageSelect}
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
                    </div>
                  ))}
                </div>
                <button
                  onClick={uploadImages}
                  disabled={uploading}
                  className="mt-4 bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Upload Selected Images'}
                </button>
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {gallery.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={image.image_url}
                    alt={image.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handleDeleteImage(image)}
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

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
            <h3 className="text-xl font-bold mb-4">
              {currentSection.id ? 'Edit Section' : 'Add New Section'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Section Type</label>
                  <select
                    value={currentSection.section_type || ''}
                    onChange={e => setCurrentSection({ ...currentSection, section_type: e.target.value as AboutSection['section_type'] })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                    disabled={!!currentSection.id}
                  >
                    <option value="">Select type</option>
                    <option value="history">History</option>
                    <option value="vision">Vision</option>
                    <option value="mission">Mission</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={currentSection.title || ''}
                    onChange={e => setCurrentSection({ ...currentSection, title: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <ReactQuill
                  value={currentSection.content || ''}
                  onChange={content => setCurrentSection({ ...currentSection, content })}
                  className="h-64 mb-12"
                />
              </div>

              <div className="flex justify-end space-x-2">
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
    </div>
  );
};

export default AboutManagement;