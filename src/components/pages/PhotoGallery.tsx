import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PhotoGallery from '@/components/PhotoGallery';
import SEO from '@/components/SEO';

const PhotoGalleryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <SEO 
        title="Photo Gallery - SeniorSimple"
        description="Browse our collection of photos and images for retirement planning and financial guidance."
        keywords="photos, images, retirement planning, financial guidance, SeniorSimple"
      />
      
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Photo Gallery
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Browse our collection of photos and images for retirement planning and financial guidance
          </p>
        </div>
      </section>

      {/* Photo Gallery Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <PhotoGallery 
            bucketName="seniorsimple-photo-bucket"
            maxPhotos={100}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PhotoGalleryPage;
