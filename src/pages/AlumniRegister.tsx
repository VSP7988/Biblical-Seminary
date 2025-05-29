import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  program_type: 'residential' | 'hybrid' | 'online';
}

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    state: '',
    city: '',
    address: '',
    comments: '',
    looking_for: '',
    course_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    // Filter courses based on selected program type
    if (formData.looking_for) {
      const programType = formData.looking_for === 'Residential' ? 'residential' : 
                         formData.looking_for === 'Center for Hybrid Education' ? 'hybrid' : 
                         formData.looking_for === 'Center for Online Education' ? 'online' : '';
      
      if (programType) {
        const filtered = courses.filter(course => course.program_type === programType);
        setFilteredCourses(filtered);
        // Reset course selection when program type changes
        setFormData(prev => ({ ...prev, course_id: '' }));
      } else {
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [formData.looking_for, courses]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, program_type')
        .order('title');
      
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setCourses([]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.looking_for) {
        throw new Error('Please fill in all required fields');
      }

      // Validate course selection if program type is selected
      if ((formData.looking_for === 'Residential' || formData.looking_for === 'Center for Hybrid Education') && 
          filteredCourses.length > 0 && !formData.course_id) {
        throw new Error('Please select a course');
      }

      // Insert registration data
      const { error: insertError } = await supabase
        .from('registrations')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.mobile,
          state: formData.state,
          city: formData.city,
          address: formData.address,
          comments: formData.comments,
          program_interest: formData.looking_for,
          course_id: formData.course_id || null
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        mobile: '',
        state: '',
        city: '',
        address: '',
        comments: '',
        looking_for: '',
        course_id: ''
      });

      // Redirect after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your registration');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for registering with Maranatha Biblical Seminary. Your application has been submitted successfully.
            </p>
            <p className="text-gray-500 mb-4">
              Our admissions team will contact you shortly with more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">Application for Admission</h1>
          <p className="text-lg text-gray-600 text-center mb-12">
            Thank you for your interest in Maranatha Biblical Seminary. Please complete the form below to begin your application process.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">
                  Email ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="mobile">
                  Mobile No <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="state">
                  State <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="city">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="looking_for">
                  Program Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="looking_for"
                  name="looking_for"
                  value={formData.looking_for}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                  required
                >
                  <option value="">Select Program Type</option>
                  <option value="Residential">Residential</option>
                  <option value="Center for Hybrid Education">Center for Hybrid Education</option>
                  <option value="Center for Online Education">Center for Online Education (Coming Soon)</option>
                </select>
              </div>
            </div>

            {/* Course Selection - Only shown when program type is selected */}
            {filteredCourses.length > 0 && (
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                  {filteredCourses.map(course => (
                    <div key={course.id} className="flex items-start space-x-2">
                      <input
                        type="radio"
                        id={`course-${course.id}`}
                        name="course_id"
                        value={course.id}
                        checked={formData.course_id === course.id}
                        onChange={handleChange}
                        className="mt-1"
                        required={filteredCourses.length > 0}
                      />
                      <label htmlFor={`course-${course.id}`} className="text-gray-700 cursor-pointer">
                        {course.title}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" htmlFor="comments">
                Comments
              </label>
              <textarea
                id="comments"
                name="comments"
                value={formData.comments}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                placeholder="Any additional information you'd like to share with us"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;