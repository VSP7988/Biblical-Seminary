import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface DonationInfo {
  id: string;
  title: string;
  qr_code_url: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  ifsc_code: string;
  branch: string;
}

const Give = () => {
  const [donationInfo, setDonationInfo] = useState<DonationInfo[]>([]);

  useEffect(() => {
    fetchDonationInfo();
  }, []);

  const fetchDonationInfo = async () => {
    const { data } = await supabase
      .from('donation_info')
      .select('*')
      .order('created_at', { ascending: false });
    
    setDonationInfo(data || []);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Support Our Mission</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Your contribution helps us train the next generation of Christian leaders
            </p>
          </div>
        </div>
      </div>

      {/* Donation Information Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          {donationInfo.map((info) => (
            <div key={info.id} className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* QR Code Section */}
                <div className="p-8 flex flex-col items-center justify-center bg-gray-50">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{info.title}</h3>
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <img
                      src={info.qr_code_url}
                      alt="Donation QR Code"
                      className="w-64 h-64 object-contain"
                    />
                  </div>
                  <p className="mt-4 text-gray-600 text-center">
                    Scan the QR code to make a donation
                  </p>
                </div>

                {/* Bank Details Section */}
                <div className="p-8 bg-white">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Bank Details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                      <p className="mt-1 text-lg font-semibold">{info.bank_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Account Holder</label>
                      <p className="mt-1 text-lg font-semibold">{info.account_holder}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Account Number</label>
                      <p className="mt-1 text-lg font-semibold">{info.account_number}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                      <p className="mt-1 text-lg font-semibold">{info.ifsc_code}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">Branch</label>
                      <p className="mt-1 text-lg font-semibold">{info.branch}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Give;