import React from 'react';
import CampusLifeEvents from '../components/CampusLifeEvents';
import CampusLifeGallery from '../components/CampusLifeGallery';

const CampusLife = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Campus Life</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Experience the vibrant community and enriching activities that make our seminary unique
            </p>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <CampusLifeEvents />

      {/* Gallery Section */}
      <CampusLifeGallery />
    </div>
  );
};

export default CampusLife;