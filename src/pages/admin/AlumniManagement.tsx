import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface AlumniProfile {
  id: string;
  name: string;
  graduation_year: number;
  degree: string;
  current_position: string;
  organization: string;
  location: string;
  image_url: string;
  bio: string;
  testimonial?: string;
  created_at: string;
}

const AlumniManagement = () => {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentAlumni, setCurrentAlumni] = useState<Partial<AlumniProfile>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    const { data, error } = await supabase
      .from('alumni_profiles')
      .select('*')
      .order('graduation_year', { ascending: false });
    
    if (error) {
      setError('Error fetching alumni profiles');
      return;
    }

    setAlumni(data || []);
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
      const filePath = `alumni/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('alumni-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('alumni-images')
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
      let imageUrl = currentAlumni.image_url;

      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (currentAlumni.id) {
        const { error } = await supabase
          .from('alumni_profiles')
          .update({ ...currentAlumni, image_url: imageUrl })
          .eq('id', currentAlumni.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alumni_profiles')
          .insert([{ ...currentAlumni, image_url: imageUrl }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentAlumni({});
      setImageFile(null);
      setPreviewUrl('');
      fetchAlumni();
    } catch (err) {
      setError('Error saving alumni profile');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const profile = alumni.find(a => a.id === id);
      if (profile?.image_url) {
        const imagePath = profile.image_url.split('/').pop();
        if (imagePath) {
          await supabase.storage
            .from('alumni-images')
            .remove([`alumni/${imagePath}`]);
        }
      }

      const { error } = await supabase
        .from('alumni_profiles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchAlumni();
    } catch (err) {
      setError('Error deleting alumni profile');
    }
  };

  // Common degree options
  const degreeOptions = [
    'Bachelor of Theology',
    'Master of Divinity',
    'Master of Theology',
    'Doctor of Ministry',
    'Doctor of Philosophy',
    'Graduate Certificate'
  ];

  // Generate year options (from current year back to 1980)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Alumni Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentAlumni({});
            setPreviewUrl('');
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Alumni</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Alumni Profiles Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Profile
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Position
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {alumni.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No alumni profiles found. Add your first profile!
                </td>
              </tr>
            ) : (
              alumni.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-12 w-12 flex-shrink-0">
                        <img
                          src={profile.image_url || 'https://via.placeholder.com/150'}
                          alt={profile.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{profile.name}</div>
                        <div className="text-sm text-gray-500">Class of {profile.graduation_year}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{profile.degree}</div>
                    <div className="text-sm text-gray-500">{profile.location}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{profile.current_position}</div>
                    <div className="text-sm text-gray-500">{profile.organization}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setCurrentAlumni(profile);
                          setIsEditing(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(profile.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {currentAlumni.id ? 'Edit Alumni Profile' : 'Add New Alumni Profile'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      value={currentAlumni.name || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, name: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
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
                        />
                      </label>
                      {(previewUrl || currentAlumni.image_url) && (
                        <div className="relative h-16 w-16">
                          <img
                            src={previewUrl || currentAlumni.image_url}
                            alt="Preview"
                            className="h-full w-full object-cover rounded-full"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Education</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Graduation Year</label>
                    <select
                      value={currentAlumni.graduation_year || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, graduation_year: parseInt(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Degree</label>
                    <select
                      value={currentAlumni.degree || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, degree: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      required
                    >
                      <option value="">Select Degree</option>
                      {degreeOptions.map(degree => (
                        <option key={degree} value={degree}>{degree}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Current Position */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Current Position</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position/Title</label>
                    <input
                      type="text"
                      value={currentAlumni.current_position || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, current_position: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Organization</label>
                    <input
                      type="text"
                      value={currentAlumni.organization || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, organization: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      value={currentAlumni.location || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, location: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Testimonial */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4">Bio & Testimonial</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bio</label>
                    <textarea
                      value={currentAlumni.bio || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, bio: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      rows={3}
                      placeholder="Brief professional biography"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Testimonial (Optional)</label>
                    <textarea
                      value={currentAlumni.testimonial || ''}
                      onChange={e => setCurrentAlumni({ ...currentAlumni, testimonial: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      rows={3}
                      placeholder="Share your experience at Maranatha"
                    />
                  </div>
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

export default AlumniManagement;