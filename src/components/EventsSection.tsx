import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Event {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: 'academic' | 'spiritual' | 'cultural' | 'social';
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    
    setEvents(data || []);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Upcoming Events</h2>
        
        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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
                <div className="absolute top-4 right-4">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${
                    {
                      academic: 'bg-blue-100 text-blue-800',
                      spiritual: 'bg-purple-100 text-purple-800',
                      cultural: 'bg-green-100 text-green-800',
                      social: 'bg-orange-100 text-orange-800'
                    }[event.category]
                  }`}>
                    {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h3>
                <p className="text-gray-600">
                  {event.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;