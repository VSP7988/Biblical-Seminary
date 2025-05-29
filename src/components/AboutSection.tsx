import React, { useEffect, useState } from 'react';
import { GraduationCap, Users, BookOpen, Globe, Building, Award, Calendar, Clock } from 'lucide-react';
import { supabase, handleSupabaseError } from '../lib/supabase';

interface Statistic {
  id: string;
  title: string;
  value: number;
  icon_name?: string;
}

const AboutSection = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('created_at');
      
      if (error) {
        setError(handleSupabaseError(error));
        return;
      }
      
      setStatistics(data || []);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics');
    }
  };

  const getIconComponent = (iconName: string | undefined) => {
    switch (iconName) {
      case 'GraduationCap': return GraduationCap;
      case 'Users': return Users;
      case 'BookOpen': return BookOpen;
      case 'Globe': return Globe;
      case 'Building': return Building;
      case 'Award': return Award;
      case 'Calendar': return Calendar;
      case 'Clock': return Clock;
      default: return GraduationCap;
    }
  };

  const defaultStats = [
    {
      icon: GraduationCap,
      title: 'Graduates',
      value: '1000+',
      color: 'from-primary/10 to-primary/20',
      iconColor: 'text-primary',
      borderColor: 'border-primary/20'
    },
    {
      icon: Users,
      title: 'Current Students',
      value: '500+',
      color: 'from-orange-100/50 to-orange-200/50',
      iconColor: 'text-orange-600',
      borderColor: 'border-orange-200'
    },
    {
      icon: BookOpen,
      title: 'Courses',
      value: '50+',
      color: 'from-amber-100/50 to-amber-200/50',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200'
    },
    {
      icon: Globe,
      title: 'Countries',
      value: '25+',
      color: 'from-red-100/50 to-red-200/50',
      iconColor: 'text-red-600',
      borderColor: 'border-red-200'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            A Brief Intro
          </h2>
          <div className="max-w-5xl mx-auto">
            <p className="text-lg text-gray-600 leading-relaxed">
              Maranatha Veda Patasala, founded in 1984 by Rev. G. Moses Choudary, is the oldest Bible School in Vijayawada, India. The school aims to train native youth for theological education and prepare them for God s mission in India. The school began with 12 students in a small asphaltic-roofed room and moved to Vijayawada due to poor location and bad drinking water. The school now offers a three-year undergraduate program in both English and Telugu languages and a Graduate distance learning program in English. In 1995, God provided a facility for girls to attend the seminary, and today, the school enrolls about 40 women. The school is proud to play a part in preparing students for God s work in India.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {(statistics.length > 0 ? statistics : defaultStats).map((stat, index) => {
            const defaultStyle = defaultStats[index % defaultStats.length];
            const StatIcon = statistics.length > 0 && stat.icon_name 
              ? getIconComponent(stat.icon_name) 
              : defaultStyle.icon;
            
            return (
              <div
                key={statistics.length > 0 ? stat.id : stat.title}
                className={`relative overflow-hidden rounded-2xl border ${defaultStyle.borderColor} bg-gradient-to-br ${defaultStyle.color} p-8 transform hover:-translate-y-1 transition-all duration-300 group`}
              >
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative flex flex-col items-center text-center">
                  <div className={`mb-4 ${defaultStyle.iconColor}`}>
                    <StatIcon className="h-12 w-12" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">
                    {statistics.length > 0 ? `${stat.value}+` : stat.value}
                  </div>
                  <div className="text-gray-700 font-medium">
                    {statistics.length > 0 ? stat.title : stat.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="mt-8 text-center text-red-600">
            <p>{error}</p>
            <button 
              onClick={fetchStatistics}
              className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default AboutSection;