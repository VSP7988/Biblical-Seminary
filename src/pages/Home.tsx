import React from 'react';
import HeroSection from '../components/HeroSection';
import UsefulLinksSection from '../components/UsefulLinksSection';
import AboutSection from '../components/AboutSection';
import TeachersSection from '../components/TeachersSection';
import VideoSection from '../components/VideoSection';
import GallerySection from '../components/GallerySection';

const Home = () => {
  return (
    <div>
      <HeroSection />
      <UsefulLinksSection />
      <AboutSection />
      <TeachersSection />
      <VideoSection />
      <GallerySection />
    </div>
  );
};

export default Home;