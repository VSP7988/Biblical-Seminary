import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Upload, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface DonationInfo {
  id: string;
  title: string;
  qr_code_url: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  ifsc_code: string;
  branch: string;
  created_at: string;
}

const DonationManagement = () => {
  const [donations, setDonations] = useState<DonationInfo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentDonation, setCurrentDonation] = useState<Partial<DonationInfo>>({});
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [qrCodeFile, setQrCodeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    const { data, error } = await supabase
      .from('donation_info')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      setError('Error fetching donation information');
      return;
    }

    setDonations(data || []);
  };

  const handleQrCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setQrCodeFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadQrCode = async () => {
    if (!qrCodeFile) return currentDonation.qr_code_url;

    try {
      setUploading(true);
      const fileExt = qrCodeFile.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `qr-codes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('donation-images')
        .upload(filePath, qrCodeFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('donation-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      throw new Error('Error uploading QR code');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!qrCodeFile && !currentDonation.qr_code_url) {
        throw new Error('Please select a QR code image');
      }

      const qrCodeUrl = await uploadQrCode();

      const donationData = {
        title: currentDonation.title,
        qr_code_url: qrCodeUrl,
        bank_name: currentDonation.bank_name,
        account_number: currentDonation.account_number,
        account_holder: currentDonation.account_holder,
        ifsc_code: currentDonation.ifsc_code,
        branch: currentDonation.branch
      };

      if (currentDonation.id) {
        const { error } = await supabase
          .from('donation_info')
          .update(donationData)
          .eq('id', currentDonation.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('donation_info')
          .insert([donationData]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentDonation({});
      setQrCodeFile(null);
      setPreviewUrl('');
      fetchDonations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving donation information');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const donation = donations.find(d => d.id === id);
      if (donation?.qr_code_url) {
        const qrCodePath = donation.qr_code_url.split('/').pop();
        if (qrCodePath) {
          await supabase.storage
            .from('donation-images')
            .remove([`qr-codes/${qrCodePath}`]);
        }
      }

      const { error } = await supabase
        .from('donation_info')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchDonations();
    } catch (err) {
      setError('Error deleting donation information');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Donation Information Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentDonation({});
            setPreviewUrl('');
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Donation Info</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Donations Grid */}
      <div className="grid grid-cols-1 gap-6">
        {donations.map((donation) => (
          <div
            key={donation.id}
            className="bg-white rounded-xl overflow-hidden shadow-lg"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 flex flex-col items-center justify-center bg-gray-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{donation.title}</h3>
                <img
                  src={donation.qr_code_url}
                  alt="QR Code"
                  className="w-48 h-48 object-contain bg-white p-4 rounded-lg shadow-md"
                />
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                    <p className="mt-1 text-gray-900">{donation.bank_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Holder</label>
                    <p className="mt-1 text-gray-900">{donation.account_holder}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Account Number</label>
                    <p className="mt-1 text-gray-900">{donation.account_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                    <p className="mt-1 text-gray-900">{donation.ifsc_code}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600">Branch</label>
                    <p className="mt-1 text-gray-900">{donation.branch}</p>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <button
                      onClick={() => {
                        setCurrentDonation(donation);
                        setIsEditing(true);
                      }}
                      className="text-primary hover:text-primary-dark"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(donation.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h3 className="text-xl font-bold mb-4">
              {currentDonation.id ? 'Edit Donation Info' : 'Add New Donation Info'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* QR Code Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">QR Code</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={currentDonation.title || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, title: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Enter title"
                      required
                    />
                    <div className="flex flex-col items-center space-y-4">
                      <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                        <Upload className="h-5 w-5 mr-2" />
                        Choose QR Code
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleQrCodeChange}
                        />
                      </label>
                      {(previewUrl || currentDonation.qr_code_url) && (
                        <div className="relative">
                          <img
                            src={previewUrl || currentDonation.qr_code_url}
                            alt="QR Code Preview"
                            className="w-32 h-32 object-contain bg-white p-2 rounded shadow"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bank Details Section */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-semibold mb-4">Bank Details</h4>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={currentDonation.bank_name || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, bank_name: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Bank Name"
                      required
                    />
                    <input
                      type="text"
                      value={currentDonation.account_holder || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, account_holder: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Account Holder Name"
                      required
                    />
                    <input
                      type="text"
                      value={currentDonation.account_number || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, account_number: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Account Number"
                      required
                    />
                    <input
                      type="text"
                      value={currentDonation.ifsc_code || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, ifsc_code: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="IFSC Code"
                      required
                    />
                    <input
                      type="text"
                      value={currentDonation.branch || ''}
                      onChange={e => setCurrentDonation({ ...currentDonation, branch: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                      placeholder="Branch"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
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

export default DonationManagement;