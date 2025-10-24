import React from 'react';
import { GraduationCap, Laptop, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const educationOptions = [
    {
      id: 'residential',
      title: 'Residential',
      icon: GraduationCap,
      description: 'Experience traditional on-campus learning with direct interaction with faculty and peers.',
      color: 'from-blue-500/10 to-blue-600/10',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      id: 'hybrid',
      title: 'Center for Hybrid Education',
      icon: Laptop,
      description: 'Blend online learning with periodic on-campus sessions for a flexible education experience.',
      color: 'from-purple-500/10 to-purple-600/10',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      id: 'online',
      title: 'Center for Online Education',
      icon: Globe,
      description: 'Coming soon! Fully online programs designed for maximum flexibility and global accessibility.',
      color: 'from-emerald-500/10 to-emerald-600/10',
      iconColor: 'text-emerald-600',
      borderColor: 'border-emerald-200',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=2000&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Our Programs</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Choose the learning path that best fits your calling and circumstances
            </p>
          </div>
        </div>
      </div>

      {/* Education Options Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {educationOptions.map((option) => (
              <div
                key={option.title}
                className={`relative overflow-hidden rounded-2xl border ${option.borderColor} bg-gradient-to-br ${option.color} p-8 hover:shadow-lg transition-all duration-300`}
              >
                {option.comingSoon && (
                  <div className="absolute top-6 right-6">
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      Coming Soon
                    </span>
                  </div>
                )}
                
                <div className="relative">
                  <div className={`inline-flex p-3 rounded-xl ${option.color} ${option.iconColor} mb-6`}>
                    <option.icon className="h-8 w-8" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {option.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {option.description}
                  </p>

                  {option.comingSoon ? (
                    <button
                      className="w-full py-3 px-6 rounded-xl bg-gray-400 text-white cursor-not-allowed"
                      disabled
                    >
                      Notify Me
                    </button>
                  ) : (
                    <Link
                      to={`/courses/${option.id}`}
                      className="block w-full py-3 px-6 rounded-xl bg-primary hover:bg-primary-dark text-white text-center transition-colors duration-300"
                    >
                      View Details
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;