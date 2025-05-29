import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Image, BookOpen, Users, FileText, Download, Camera, GraduationCap, Heart, Info, BarChart, Video, LogInIcon as LogoIcon, UserCheck, UserPlus } from 'lucide-react';
import BannerManagement from './BannerManagement';
import GalleryManagement from './GalleryManagement';
import TeacherManagement from './TeacherManagement';
import CampusLifeManagement from './CampusLifeManagement';
import DownloadsManagement from './DownloadsManagement';
import DonationManagement from './DonationManagement';
import AboutManagement from './AboutManagement';
import StatisticsManagement from './StatisticsManagement';
import VideoManagement from './VideoManagement';
import LogoManagement from './LogoManagement';
import AlumniManagement from './AlumniManagement';
import RegistrationsManagement from './RegistrationsManagement';
import StudentRegistrationsManagement from './StudentRegistrationsManagement';
import CourseManagement from './CourseManagement';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    navigate('/admin/login');
    return null;
  }

  const menuItems = [
    { path: '', icon: LayoutDashboard, label: 'Dashboard' },
    { path: 'banners', icon: Image, label: 'Banners' },
    { path: 'about', icon: Info, label: 'About' },
    { path: 'statistics', icon: BarChart, label: 'Statistics' },
    { path: 'gallery', icon: Camera, label: 'Gallery' },
    { path: 'teachers', icon: Users, label: 'Teachers' },
    { path: 'campus-life', icon: GraduationCap, label: 'Campus Life' },
    { path: 'videos', icon: Video, label: 'Videos' },
    { path: 'courses', icon: BookOpen, label: 'Courses' },
    { path: 'downloads', icon: Download, label: 'Downloads' },
    { path: 'alumni', icon: UserCheck, label: 'Alumni' },
    { path: 'registrations', icon: UserPlus, label: 'Registrations' },
    { path: 'student-registrations', icon: UserPlus, label: 'Student Registrations' },
    { path: 'donations', icon: Heart, label: 'Donations' },
    { path: 'logo', icon: LogoIcon, label: 'Logo' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
        </div>
        <nav className="mt-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === `/admin/${item.path}`;
            return (
              <Link
                key={item.path}
                to={`/admin/${item.path}`}
                className={`flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 ${
                  isActive ? 'bg-primary/10 text-primary border-r-4 border-primary' : ''
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route index element={<div className="p-6"><h1>Welcome to Admin Dashboard</h1></div>} />
          <Route path="banners" element={<BannerManagement />} />
          <Route path="about" element={<AboutManagement />} />
          <Route path="statistics" element={<StatisticsManagement />} />
          <Route path="gallery" element={<GalleryManagement />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="campus-life" element={<CampusLifeManagement />} />
          <Route path="videos" element={<VideoManagement />} />
          <Route path="courses" element={<CourseManagement />} />
          <Route path="downloads" element={<DownloadsManagement />} />
          <Route path="alumni" element={<AlumniManagement />} />
          <Route path="registrations" element={<RegistrationsManagement />} />
          <Route path="student-registrations" element={<StudentRegistrationsManagement />} />
          <Route path="donations" element={<DonationManagement />} />
          <Route path="logo" element={<LogoManagement />} />
        </Routes>
      </div>
    </div>
  );
};

export default Dashboard;