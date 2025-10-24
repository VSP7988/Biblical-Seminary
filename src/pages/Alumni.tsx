import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MapPin, Briefcase, Calendar, GraduationCap, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

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

const Alumni = () => {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<number | ''>('');
  const [filterDegree, setFilterDegree] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for alumni profiles
  const mockAlumni: AlumniProfile[] = [
    {
      id: '1',
      name: 'Dr. Samuel Johnson',
      graduation_year: 2010,
      degree: 'Doctor of Ministry',
      current_position: 'Senior Pastor',
      organization: 'Grace Community Church',
      location: 'Atlanta, GA',
      image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Dr. Johnson has been serving as a senior pastor for over 10 years, focusing on community outreach and discipleship.',
      testimonial: 'My time at Maranatha shaped my theological understanding and prepared me for the challenges of pastoral ministry.'
    },
    {
      id: '2',
      name: 'Rev. Sarah Williams',
      graduation_year: 2015,
      degree: 'Master of Divinity',
      current_position: 'Missionary',
      organization: 'Global Missions International',
      location: 'Nairobi, Kenya',
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Rev. Williams has been serving in East Africa since graduation, focusing on theological education and church planting.',
      testimonial: 'The cross-cultural training I received at Maranatha was invaluable for my work on the mission field.'
    },
    {
      id: '3',
      name: 'Prof. Michael Chen',
      graduation_year: 2008,
      degree: 'Master of Theology',
      current_position: 'Associate Professor',
      organization: 'Pacific Theological Seminary',
      location: 'San Francisco, CA',
      image_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Prof. Chen specializes in Biblical Hebrew and Old Testament studies, with several published works in the field.',
      testimonial: 'The rigorous academic environment at Maranatha prepared me well for a career in theological education.'
    },
    {
      id: '4',
      name: 'Rev. David Okonkwo',
      graduation_year: 2018,
      degree: 'Bachelor of Theology',
      current_position: 'Youth Pastor',
      organization: 'Living Word Church',
      location: 'Lagos, Nigeria',
      image_url: 'https://images.unsplash.com/photo-1463453091185-61582044d556?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Rev. Okonkwo leads a vibrant youth ministry and has developed innovative programs for discipling young people.',
      testimonial: 'The practical ministry experience I gained at Maranatha gave me the tools I needed to effectively reach young people.'
    },
    {
      id: '5',
      name: 'Dr. Rachel Thompson',
      graduation_year: 2012,
      degree: 'Doctor of Ministry',
      current_position: 'Counseling Director',
      organization: 'Restoration Counseling Center',
      location: 'Denver, CO',
      image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Dr. Thompson integrates theological insights with clinical counseling practices to provide holistic care.',
      testimonial: 'My education at Maranatha taught me to address both spiritual and psychological needs in counseling.'
    },
    {
      id: '6',
      name: 'Rev. James Wilson',
      graduation_year: 2016,
      degree: 'Master of Divinity',
      current_position: 'Church Planter',
      organization: 'New Life Fellowship',
      location: 'Portland, OR',
      image_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: 'Rev. Wilson has successfully planted three churches in urban areas, focusing on community engagement and social justice.',
      testimonial: 'Maranatha equipped me with both the theological foundation and practical skills needed for church planting.'
    }
  ];

  useEffect(() => {
    fetchAlumni();
  }, []);

  const fetchAlumni = async () => {
    try {
      const { data, error } = await supabase
        .from('alumni_profiles')
        .select('*')
        .order('graduation_year', { ascending: false });
      
      if (error) {
        console.error('Error fetching alumni:', error);
        // Use mock data if there's an error or no data
        setAlumni(mockAlumni);
        return;
      }
      
      if (data && data.length > 0) {
        setAlumni(data);
      } else {
        // Use mock data if no data is returned
        setAlumni(mockAlumni);
      }
    } catch (err) {
      console.error('Error fetching alumni:', err);
      setAlumni(mockAlumni);
    }
  };

  // Get unique graduation years and degrees for filters
  const graduationYears = [...new Set(alumni.map(a => a.graduation_year))].sort((a, b) => b - a);
  const degrees = [...new Set(alumni.map(a => a.degree))].sort();

  // Filter alumni based on search term and filters
  const filteredAlumni = alumni.filter(alumnus => {
    const matchesSearch = alumnus.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         alumnus.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alumnus.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesYear = filterYear === '' || alumnus.graduation_year === filterYear;
    const matchesDegree = filterDegree === '' || alumnus.degree === filterDegree;
    
    return matchesSearch && matchesYear && matchesDegree;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Alumni Network</h1>
            <p className="text-xl max-w-2xl mx-auto mb-6">
              Connecting graduates who are making an impact around the world
            </p>
            
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <section className="py-10 bg-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search alumni by name, organization, or location"
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary md:ml-4"
            >
              <Filter className="h-5 w-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
                  value={filterYear}
                  onChange={(e) => setFilterYear(e.target.value === '' ? '' : parseInt(e.target.value))}
                >
                  <option value="">All Years</option>
                  {graduationYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
                  value={filterDegree}
                  onChange={(e) => setFilterDegree(e.target.value)}
                >
                  <option value="">All Degrees</option>
                  {degrees.map(degree => (
                    <option key={degree} value={degree}>{degree}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Alumni Profiles Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Distinguished Alumni</h2>
          
          {filteredAlumni.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">No alumni found matching your search criteria.</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterYear('');
                  setFilterDegree('');
                }}
                className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlumni.map((alumnus) => (
                <div 
                  key={alumnus.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64">
                    <img
                      src={alumnus.image_url}
                      alt={alumnus.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-xl font-bold text-white">{alumnus.name}</h3>
                      <div className="flex items-center text-white/80 text-sm">
                        <GraduationCap className="h-4 w-4 mr-1" />
                        <span>Class of {alumnus.graduation_year}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4 space-y-2">
                      <div className="flex items-start">
                        <Briefcase className="h-5 w-5 text-primary mr-2 mt-0.5" />
                        <div>
                          <p className="font-medium">{alumnus.current_position}</p>
                          <p className="text-gray-600 text-sm">{alumnus.organization}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">{alumnus.location}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-primary mr-2" />
                        <span className="text-gray-600">{alumnus.degree}</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{alumnus.bio}</p>
                    
                    {alumnus.testimonial && (
                      <div className="border-l-4 border-primary pl-4 italic text-gray-600">
                        "{alumnus.testimonial}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Alumni Network Section */}
      <section className="py-16 bg-gradient-to-r from-primary/90 to-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Join Our Alumni Network</h2>
          <p className="text-lg max-w-3xl mx-auto mb-8">
            Are you a graduate of Maranatha Biblical Seminary? Connect with fellow alumni, 
            share your story, and stay updated on seminary news and events.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="#" className="bg-white text-primary hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors">
              Register as Alumni
            </Link>
            
          </div>
        </div>
      </section>
    </div>
  );
};

export default Alumni;