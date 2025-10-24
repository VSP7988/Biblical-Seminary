import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import CampusLife from './pages/CampusLife';
import Blog from './pages/Blog';
import Alumni from './pages/Alumni';
import Register from './pages/AlumniRegister';
import AlumniUpdate from './pages/AlumniUpdate';
import Downloads from './pages/Downloads';
import Give from './pages/Give';
import AdminDashboard from './pages/admin/Dashboard';
import AdminLogin from './pages/admin/Login';
import StudentRegister from './pages/StudentRegister';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-white">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about/*" element={<About />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/courses/:programId" element={<CourseDetails />} />
              <Route path="/campus-life" element={<CampusLife />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/alumni" element={<Alumni />} />
              <Route path="/alumni/register" element={<Register />} />
              <Route path="/alumni/update" element={<AlumniUpdate />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/give" element={<Give />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="/apply" element={<StudentRegister />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App