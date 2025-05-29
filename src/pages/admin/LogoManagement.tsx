import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Upload, Save, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Logo {
  id: string;
  logo_url: string;
  alt_text: string;
  created_at: string;
}

const LogoManagement = () => {
  const [logo, setLogo] = useState<Logo | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchLogo();
  }, []);

  const fetchLogo = async () => {
    try {
      const { data, error } = await supabase
        .from('site_logo')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      if (data) {
        setLogo(data);
        setAltText(data.alt_text || '');
      }
    } catch (err) {
      console.error('Error fetching logo:', err);
      setError('Error fetching logo');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match('image.*')) {
        setError('Please select an image file');
        return;
      }
      
      setLogoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const uploadLogo = async () => {
    if (!logoFile) {
      setError('Please select a logo image');
      return;
    }

    try {
      setUploading(true);
      setError('');
      setSuccess('');
      
      // Upload the logo file to storage
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `logo-${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logo-images')
        .upload(filePath, logoFile);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('logo-images')
        .getPublicUrl(filePath);

      // Delete old logo from storage if exists
      if (logo?.logo_url) {
        const oldLogoPath = logo.logo_url.split('/').pop();
        if (oldLogoPath) {
          await supabase.storage
            .from('logo-images')
            .remove([oldLogoPath]);
        }
      }

      // Update or insert logo record in database
      if (logo?.id) {
        const { error: updateError } = await supabase
          .from('site_logo')
          .update({
            logo_url: publicUrl,
            alt_text: altText
          })
          .eq('id', logo.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('site_logo')
          .insert([{
            logo_url: publicUrl,
            alt_text: altText
          }]);
        
        if (insertError) throw insertError;
      }

      setSuccess('Logo updated successfully');
      fetchLogo();
      setLogoFile(null);
      setPreviewUrl('');
    } catch (err) {
      console.error('Error uploading logo:', err);
      setError('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Logo Management</h2>
        <p className="text-gray-600 mt-1">
          Update the site logo that appears in the header
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Current Logo */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Current Logo</h3>
            {logo ? (
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 h-48">
                <img 
                  src={logo.logo_url} 
                  alt={logo.alt_text || 'Site Logo'} 
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 h-48 text-gray-400">
                No logo set
              </div>
            )}
            <p className="mt-2 text-sm text-gray-500">
              The logo will appear at a height of 24px in the header
            </p>
          </div>

          {/* Upload New Logo */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Upload New Logo</h3>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-center bg-gray-50 h-48">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Logo Preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Select an image to preview</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Logo Image
                </label>
                <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                  <Upload className="h-5 w-5 mr-2" />
                  Choose File
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleLogoChange}
                  />
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Recommended: PNG or SVG with transparent background
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="Maranatha Biblical Seminary Logo"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Describe the logo for accessibility
                </p>
              </div>

              <div>
                <button
                  onClick={uploadLogo}
                  disabled={!logoFile || uploading}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-5 w-5" />
                  <span>{uploading ? 'Uploading...' : 'Save Logo'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoManagement;