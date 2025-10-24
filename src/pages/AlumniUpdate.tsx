import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Check, Upload } from 'lucide-react';
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
}

const AlumniUpdate = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<AlumniProfile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<AlumniProfile | null>(null);
  const [formData, setFormData] = useState<Partial<AlumniProfile>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm) return;

    setSearching(true);
    setError('');
    setSearchResults([]);

    try {
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .ilike('name', `%${searchTerm}%`)
        .order('name');

      if (error) throw error;

      setSearchResults(data || []);
      if (data?.length === 0) {
        setError('No alumni profiles found matching your search');
      }
    } catch (err) {
      console.error('Error searching alumni:', err);
      setError('Error searching for alumni profiles');
    } finally {
      setSearching(false);
    }
  };

  const selectProfile = (profile: AlumniProfile) => {
    setSelectedProfile(profile);
    setFormData({
      name: profile.name,
      graduation_year: profile.graduation_year,
      degree: profile.degree,
      current_position: profile.current_position,
      organization: profile.organization,
      location: profile.location,
      bio: profile.bio,
      testimonial: profile.testimonial
    });
    setPreviewUrl(profile.image_url || '');
    setSearchResults([]);
    setSearchTerm('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      console.error('Error uploading image:', error);
      throw new Error('Error uploading profile image. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;

    setLoading(true);
    setError('');

    try {
      let imageUrl = selectedProfile.image_url;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const { error: updateError } = await supabase
        .from('alumni_profiles')
        .update({
          ...formData,
          image_url: imageUrl,
          graduation_year: typeof formData.graduation_year === 'string' 
            ? parseInt(formData.graduation_year) 
            : formData.graduation_year
        })
        .eq('id', selectedProfile.id);

      if (updateError) throw updateError;

      setSuccess(true);
      
      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/alumni');
      }, 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  // Generate year options (from current year back to 1980)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1979 }, (_, i) => currentYear - i);

  // Common degree options
  const degreeOptions = [
    'Bachelor of Theology',
    'Master of Divinity',
    'Master of Theology',
    'Master of Arts in Biblical Studies',
    'Master of Arts in Christian Education',
    'Doctor of Ministry',
    'Doctor of Philosophy in Theology',
    'Graduate Certificate'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile Updated!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Your alumni profile has been updated successfully.
            </p>
            <p className="text-gray-500 mb-4">
              You will be redirected to the alumni page shortly...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Update Alumni Profile</h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Keep your information up-to-date to stay connected with the seminary community.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          {!selectedProfile ? (
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold mb-6">Find Your Profile</h2>
              <form onSubmit={handleSearch} className="mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-grow relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name"
                      className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={searching || !searchTerm}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                  >
                    {searching ? 'Searching...' : 'Search'}
                  </button>
                </div>
              </form>

              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">Search Results</h3>
                  <div className="space-y-4">
                    {searchResults.map(profile => (
                      <div 
                        key={profile.id}
                        className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => selectProfile(profile)}
                      >
                        <div className="h-12 w-12 flex-shrink-0 mr-4">
                          <img
                            src={profile.image_url || 'https://via.placeholder.com/150'}
                            alt={profile.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{profile.name}</h4>
                          <p className="text-sm text-gray-500">
                            {profile.degree}, Class of {profile.graduation_year}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Personal Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      Profile Photo
                    </label>
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload className="h-5 w-5 mr-2" />
                        Update Photo
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                      {previewUrl && (
                        <div className="relative h-16 w-16">
                          <img
                            src={previewUrl}
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
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Education</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="graduation_year">
                      Graduation Year <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="graduation_year"
                      name="graduation_year"
                      value={formData.graduation_year || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      required
                    >
                      <option value="">Select Year</option>
                      {yearOptions.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="degree">
                      Degree <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="degree"
                      name="degree"
                      value={formData.degree || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
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
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Current Position</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="current_position">
                      Position/Title
                    </label>
                    <input
                      type="text"
                      id="current_position"
                      name="current_position"
                      value={formData.current_position || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                   <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="organization">
                      Organization/Church
                    </label>
                    <input
                      type="text"
                      id="organization"
                      name="organization"
                      value={formData.organization || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="location">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Bio & Testimonial */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Bio & Testimonial</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="bio">
                      Professional Biography
                    </label>
                    <textarea
                      id="bio"
                      name="bio"
                      value={formData.bio || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Share a brief professional biography"
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="testimonial">
                      Testimonial
                    </label>
                    <textarea
                      id="testimonial"
                      name="testimonial"
                      value={formData.testimonial || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Share your experience at Maranatha Biblical Seminary"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Search
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlumniUpdate;