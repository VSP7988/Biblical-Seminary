import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users } from 'lucide-react';

interface CampusEvent {
  id: string;
  title: string;
  content: string;
  image_url: string;
  created_at: string;
}

const CampusLifeEvents = () => {
  const [events, setEvents] = useState<CampusEvent[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('campus_life')
      .select('*')
      .order('created_at', { ascending: false });
    
    setEvents(data || []);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Campus Life Events</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <div
              key={event.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative h-64">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-white/80 text-sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 line-clamp-3">
                  {event.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CampusLifeEvents;