import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Teacher {
  id: string;
  name: string;
  position: string;
  image_url: string;
  bio: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
}

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<Partial<Teacher>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from('teachers')
      .select('*')
      .order('name');
    
    if (error) {
      setError('Error fetching teachers');
      return;
    }

    setTeachers(data || []);
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
      const filePath = `teachers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('teacher-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('teacher-images')
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
      let imageUrl = currentTeacher.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (currentTeacher.id) {
        const { error } = await supabase
          .from('teachers')
          .update({ ...currentTeacher, image_url: imageUrl })
          .eq('id', currentTeacher.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('teachers')
          .insert([{ ...currentTeacher, image_url: imageUrl }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentTeacher({});
      setImageFile(null);
      setPreviewUrl('');
      fetchTeachers();
    } catch (err) {
      setError('Error saving teacher');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const teacher = teachers.find(t => t.id === id);
      if (teacher?.image_url) {
        const imagePath = teacher.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('teacher-images')
            .remove([`teachers/${imagePath}`]);
        }
      }

      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchTeachers();
    } catch (err) {
      setError('Error deleting teacher');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentTeacher({});
            setPreviewUrl('');
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Teacher</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {currentTeacher.id ? 'Edit Teacher' : 'Add New Teacher'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={currentTeacher.name || ''}
                  onChange={e => setCurrentTeacher({ ...currentTeacher, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={currentTeacher.position || ''}
                  onChange={e => setCurrentTeacher({ ...currentTeacher, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={currentTeacher.bio || ''}
                  onChange={e => setCurrentTeacher({ ...currentTeacher, bio: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <div className="mt-1 flex items-center space-x-4">
                  <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                    <Upload className="h-5 w-5 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      required={!currentTeacher.id}
                    />
                  </label>
                  {(previewUrl || currentTeacher.image_url) && (
                    <div className="relative h-20 w-20">
                      <img
                        src={previewUrl || currentTeacher.image_url}
                        alt="Preview"
                        className="h-full w-full object-cover rounded-full"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facebook URL</label>
                  <input
                    type="url"
                    value={currentTeacher.facebook_url || ''}
                    onChange={e => setCurrentTeacher({ ...currentTeacher, facebook_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                  <input
                    type="url"
                    value={currentTeacher.twitter_url || ''}
                    onChange={e => setCurrentTeacher({ ...currentTeacher, twitter_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Instagram URL</label>
                  <input
                    type="url"
                    value={currentTeacher.instagram_url || ''}
                    onChange={e => setCurrentTeacher({ ...currentTeacher, instagram_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                  <input
                    type="url"
                    value={currentTeacher.linkedin_url || ''}
                    onChange={e => setCurrentTeacher({ ...currentTeacher, linkedin_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  />
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map((teacher) => (
          <div key={teacher.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="aspect-w-1 aspect-h-1 relative">
              <img
                src={teacher.image_url}
                alt={teacher.name}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{teacher.name}</h3>
              <p className="text-primary font-medium mb-2">{teacher.position}</p>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{teacher.bio}</p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setCurrentTeacher(teacher);
                    setIsEditing(true);
                  }}
                  className="text-primary hover:text-primary-dark"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(teacher.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherManagement;