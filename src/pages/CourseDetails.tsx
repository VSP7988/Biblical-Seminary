import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, GraduationCap, Laptop, Globe, Clock, Calendar, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Course {
  id: string;
  title: string;
  duration: string;
  schedule: string;
  intake: string;
  description: string;
  program_type: 'residential' | 'hybrid' | 'online';
}

interface ProgramInfo {
  title: string;
  description: string;
  image: string;
  icon: React.ElementType;
  color: string;
}

const programData: Record<string, ProgramInfo> = {
  residential: {
    title: 'Residential Program',
    description: 'Our traditional on-campus learning experience offers direct interaction with faculty and peers, creating a rich and immersive educational environment.',
    image: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    icon: GraduationCap,
    color: 'text-blue-600'
  },
  hybrid: {
    title: 'Hybrid Education Program',
    description: 'Our hybrid program combines the flexibility of online learning with strategic on-campus sessions, perfect for those balancing ministry and education.',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    icon: Laptop,
    color: 'text-purple-600'
  },
  online: {
    title: 'Online Education Program',
    description: 'Coming soon! Our fully online programs will offer maximum flexibility while maintaining the highest standards of theological education.',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    icon: Globe,
    color: 'text-emerald-600'
  }
};

const CourseDetails = () => {
  const { programId } = useParams<{ programId: string }>();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!programId || !['residential', 'hybrid', 'online'].includes(programId)) {
      navigate('/courses');
      return;
    }
    
    fetchCourses();
  }, [programId]);

  const fetchCourses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('program_type', programId)
        .order('title');
      
      if (error) throw error;
      
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses. Please try again later.');
      // Use default courses as fallback
      setCourses(getDefaultCourses());
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultCourses = (): Course[] => {
    if (programId === 'residential') {
      return [
        {
          id: 'r1',
          title: 'Bachelor of Theology',
          duration: '4 years',
          schedule: 'Full-time',
          intake: '40 students',
          description: 'A comprehensive program covering biblical studies, theology, and practical ministry skills.',
          program_type: 'residential'
        },
        {
          id: 'r2',
          title: 'Master of Divinity',
          duration: '3 years',
          schedule: 'Full-time',
          intake: '30 students',
          description: 'Advanced theological training for pastoral ministry and leadership roles.',
          program_type: 'residential'
        },
        {
          id: 'r3',
          title: 'Master of Theology',
          duration: '2 years',
          schedule: 'Full-time',
          intake: '20 students',
          description: 'Specialized research-oriented program for advanced theological scholarship.',
          program_type: 'residential'
        }
      ];
    } else if (programId === 'hybrid') {
      return [
        {
          id: 'h1',
          title: 'Bachelor of Theology (Hybrid)',
          duration: '5 years',
          schedule: 'Part-time',
          intake: '50 students',
          description: 'Flexible program combining online learning with periodic campus visits.',
          program_type: 'hybrid'
        },
        {
          id: 'h2',
          title: 'Graduate Certificate in Ministry',
          duration: '1 year',
          schedule: 'Part-time',
          intake: '25 students',
          description: 'Focused program for specific ministry skill development.',
          program_type: 'hybrid'
        },
        {
          id: 'h3',
          title: 'Master of Arts in Ministry',
          duration: '3 years',
          schedule: 'Part-time',
          intake: '35 students',
          description: 'Advanced program for ministry leaders seeking deeper theological understanding.',
          program_type: 'hybrid'
        }
      ];
    } else {
      return [
        {
          id: 'o1',
          title: 'Online Certificate in Biblical Studies',
          duration: '1 year',
          schedule: 'Flexible',
          intake: '100 students',
          description: 'Foundation program for biblical knowledge and interpretation.',
          program_type: 'online'
        },
        {
          id: 'o2',
          title: 'Online Bachelor of Ministry',
          duration: '4 years',
          schedule: 'Flexible',
          intake: '75 students',
          description: 'Comprehensive online program for ministry preparation.',
          program_type: 'online'
        },
        {
          id: 'o3',
          title: 'Online Master of Biblical Studies',
          duration: '2 years',
          schedule: 'Flexible',
          intake: '60 students',
          description: 'Advanced online program for biblical scholarship and research.',
          program_type: 'online'
        }
      ];
    }
  };

  const handleApplyNow = (courseId: string) => {
    navigate('/apply', { 
      state: { 
        programType: programId,
        courseId: courseId 
      }
    });
  };

  if (!programId || !programData[programId]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Program not found</h1>
          <Link to="/courses" className="text-primary hover:text-primary-dark">
            Return to Courses
          </Link>
        </div>
      </div>
    );
  }

  const program = programData[programId];
  const Icon = program.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="relative h-[400px] bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${program.image}')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className={`inline-flex p-4 rounded-full ${program.color} bg-white/10 mb-6`}>
              <Icon className="h-12 w-12" />
            </div>
            <h1 className="text-5xl font-bold mb-4">{program.title}</h1>
            <p className="text-xl max-w-2xl mx-auto">
              {program.description}
            </p>
          </div>
        </div>
      </div>

      {/* Available Courses */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Link
            to="/courses"
            className="inline-flex items-center text-gray-600 hover:text-primary mb-8"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Programs
          </Link>

          <h2 className="text-3xl font-bold mb-8">Available Courses</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {course.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">{course.description}</p>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-5 w-5 mr-3" />
                      <span>{course.duration}</span>
                    </div>
                    {course.schedule && (
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-5 w-5 mr-3" />
                        <span>{course.schedule}</span>
                      </div>
                    )}
                    {course.intake && (
                      <div className="flex items-center text-gray-600">
                        <Users className="h-5 w-5 mr-3" />
                        <span>Intake: {course.intake}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button 
                      onClick={() => handleApplyNow(course.id)}
                      className="w-full py-2 px-4 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors duration-300"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default CourseDetails;