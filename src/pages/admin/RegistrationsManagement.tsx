import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Download, Search, Filter, X, AlertCircle, Trash2, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';

interface Registration {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  program_interest: string;
  course_id: string | null;
  course_title?: string;
  comments: string;
  created_at: string;
  contacted: boolean;
}

interface Course {
  id: string;
  title: string;
}

const RegistrationsManagement = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registration[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProgram, setFilterProgram] = useState<string>('');
  const [filterCourse, setFilterCourse] = useState<string>('');
  const [filterContacted, setFilterContacted] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [searchTerm, filterProgram, filterCourse, filterContacted, registrations]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch courses first
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('id, title')
        .order('title');
      
      if (coursesError) throw coursesError;
      setCourses(coursesData || []);
      
      // Then fetch registrations
      const { data: registrationsData, error: registrationsError } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (registrationsError) throw registrationsError;
      
      // Enhance registrations with course titles
      const enhancedRegistrations = registrationsData?.map(reg => {
        const course = coursesData?.find(c => c.id === reg.course_id);
        return {
          ...reg,
          course_title: course?.title || 'Not specified',
          contacted: reg.contacted || false
        };
      }) || [];
      
      setRegistrations(enhancedRegistrations);
      setFilteredRegistrations(enhancedRegistrations);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filterRegistrations = () => {
    let filtered = [...registrations];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(reg => 
        reg.name?.toLowerCase().includes(term) || 
        reg.email?.toLowerCase().includes(term) || 
        reg.phone?.toLowerCase().includes(term) ||
        reg.city?.toLowerCase().includes(term) ||
        reg.state?.toLowerCase().includes(term)
      );
    }
    
    // Apply program filter
    if (filterProgram) {
      filtered = filtered.filter(reg => reg.program_interest === filterProgram);
    }
    
    // Apply course filter
    if (filterCourse) {
      filtered = filtered.filter(reg => reg.course_id === filterCourse);
    }
    
    // Apply contacted filter
    if (filterContacted) {
      const isContacted = filterContacted === 'contacted';
      filtered = filtered.filter(reg => reg.contacted === isContacted);
    }
    
    setFilteredRegistrations(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterProgram('');
    setFilterCourse('');
    setFilterContacted('');
  };

  const exportToCSV = () => {
    // Get all unique keys from registrations
    const allKeys = new Set<string>();
    filteredRegistrations.forEach(reg => {
      Object.keys(reg).forEach(key => allKeys.add(key));
    });
    
    // Create header row
    const keys = Array.from(allKeys);
    let csvContent = keys.join(',') + '\n';
    
    // Add data rows
    filteredRegistrations.forEach(reg => {
      const row = keys.map(key => {
        const value = reg[key as keyof Registration];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvContent += row.join(',') + '\n';
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleContactStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ contacted: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const updatedRegistrations = registrations.map(reg => 
        reg.id === id ? { ...reg, contacted: !currentStatus } : reg
      );
      
      setRegistrations(updatedRegistrations);
      setActionMenuOpen(null);
    } catch (err) {
      console.error('Error updating contact status:', err);
      setError('Failed to update contact status. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    
    try {
      const { error } = await supabase
        .from('registrations')
        .delete()
        .eq('id', deleteId);
      
      if (error) throw error;
      
      // Update local state
      const updatedRegistrations = registrations.filter(reg => reg.id !== deleteId);
      setRegistrations(updatedRegistrations);
      
      setIsDeleting(false);
      setDeleteId(null);
    } catch (err) {
      console.error('Error deleting registration:', err);
      setError('Failed to delete registration. Please try again.');
    }
  };

  const cancelDelete = () => {
    setIsDeleting(false);
    setDeleteId(null);
  };

  // Get unique program types for filter
  const programTypes = [...new Set(registrations.map(reg => reg.program_interest))].filter(Boolean);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Registrations Management</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
          disabled={filteredRegistrations.length === 0}
        >
          <Download className="h-5 w-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, phone, or location"
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-primary"
            >
              <Filter className="h-5 w-5" />
              <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
            
            {(searchTerm || filterProgram || filterCourse || filterContacted) && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800"
              >
                <X className="h-5 w-5" />
                <span>Clear Filters</span>
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Program Interest</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
              >
                <option value="">All Programs</option>
                {programTypes.map(program => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Status</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring-primary focus:border-primary"
                value={filterContacted}
                onChange={(e) => setFilterContacted(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="contacted">Contacted</option>
                <option value="not-contacted">Not Contacted</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {filteredRegistrations.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-600 text-lg mb-4">No registrations found matching your criteria.</p>
              {(searchTerm || filterProgram || filterCourse || filterContacted) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Program
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRegistrations.map((registration) => (
                      <tr key={registration.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{registration.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{registration.email}</div>
                          <div className="text-sm text-gray-500">{registration.phone}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {[registration.city, registration.state].filter(Boolean).join(', ')}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">{registration.address}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {registration.program_interest}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.course_id ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {registration.course_title}
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {registration.contacted ? (
                            <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Contacted
                            </span>
                          ) : (
                            <span className="px-2 inline-flex items-center text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Not Contacted
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(registration.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button 
                              onClick={() => setActionMenuOpen(actionMenuOpen === registration.id ? null : registration.id)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            
                            {actionMenuOpen === registration.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => toggleContactStatus(registration.id, registration.contacted)}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {registration.contacted ? 'Mark as Not Contacted' : 'Mark as Contacted'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(registration.id)}
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this registration? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrationsManagement;