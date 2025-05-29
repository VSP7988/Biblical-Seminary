import React from 'react';
import { Book, Users, Calendar, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

const links = [
  {
    title: 'Academic Programs',
    description: 'Explore our diverse range of theological courses and programs',
    icon: Book,
    link: '/courses'
  },
  {
    title: 'Student Life',
    description: 'Experience vibrant community life and spiritual growth',
    icon: Users,
    link: '/campus-life'
  },
  {
    title: 'Events',
    description: 'Stay updated with seminary events and activities',
    icon: Calendar,
    link: '/events'
  },
  {
    title: 'Resources',
    description: 'Access study materials and spiritual resources',
    icon: Download,
    link: '/downloads'
  }
];

const UsefulLinksSection = () => {
  return (
    <section className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {links.map((link) => (
            <Link
              key={link.title}
              to={link.link}
              className="group relative overflow-hidden bg-gray-800 rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 p-3 rounded-full bg-gray-700/50 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <link.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-primary transition-colors">
                    {link.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                    {link.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default UsefulLinksSection;