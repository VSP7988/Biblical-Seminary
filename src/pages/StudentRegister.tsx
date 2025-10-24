import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Check, AlertCircle, Upload, ArrowLeft, ArrowRight, X } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  program_type: 'residential' | 'hybrid' | 'online';
}

interface DonationInfo {
  id: string;
  title: string;
  qr_code_url: string;
  bank_name: string;
  account_number: string;
  account_holder: string;
  ifsc_code: string;
  branch: string;
}

const StudentRegister = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    date_of_birth: '',
    gender: '',
    education_level: '',
    previous_institution: '',
    program_interest: '',
    course_id: '',
    start_date: '',
    comments: '',
    payment_screenshot: null as File | null,
    payment_screenshot_url: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [donationInfo, setDonationInfo] = useState<DonationInfo | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchCourses();
    fetchDonationInfo();
  }, []);

  useEffect(() => {
    if (formData.program_interest) {
      const programType = formData.program_interest === 'Residential' ? 'residential' : 
                         formData.program_interest === 'Center for Hybrid Education' ? 'hybrid' : 
                         formData.program_interest === 'Center for Online Education' ? 'online' : '';
      
      if (programType) {
        const filtered = courses.filter(course => course.program_type === programType);
        setFilteredCourses(filtered);
        setFormData(prev => ({ ...prev, course_id: '' }));
      } else {
        setFilteredCourses([]);
      }
    } else {
      setFilteredCourses([]);
    }
  }, [formData.program_interest, courses]);

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

  const fetchDonationInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('donation_info')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (error) throw error;
      setDonationInfo(data);
    } catch (err) {
      console.error('Error fetching donation info:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, payment_screenshot: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, payment_screenshot_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPaymentScreenshot = async () => {
    if (!formData.payment_screenshot) return null;

    try {
      const fileExt = formData.payment_screenshot.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `payment-screenshots/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(filePath, formData.payment_screenshot, {
          onUploadProgress: (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            setUploadProgress(Math.round(percent));
          }
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading screenshot:', error);
      throw new Error('Failed to upload payment screenshot');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      if (!formData.name || !formData.email || !formData.program_interest) {
        throw new Error('Please fill in all required fields');
      }

      // Validate course selection if program type is selected
      if ((formData.program_interest === 'Residential' || formData.program_interest === 'Center for Hybrid Education') && 
          filteredCourses.length > 0 && !formData.course_id) {
        throw new Error('Please select a course');
      }

      // Upload payment screenshot
      const screenshotUrl = await uploadPaymentScreenshot();

      // Insert registration data
      const { error: insertError } = await supabase
        .from('student_registrations')
        .insert([{
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          date_of_birth: formData.date_of_birth || null,
          gender: formData.gender,
          education_level: formData.education_level,
          previous_institution: formData.previous_institution,
          program_interest: formData.program_interest,
          course_id: formData.course_id || null,
          start_date: formData.start_date,
          comments: formData.comments,
          payment_screenshot_url: screenshotUrl
        }]);

      if (insertError) throw insertError;

      setSuccess(true);
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

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const educationLevels = [
    'High School',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'Doctorate',
    'Other'
  ];

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-lg text-gray-600 mb-8">
              Thank you for applying to Maranatha Biblical Seminary. Your application has been submitted successfully.
            </p>
            <p className="text-gray-500 mb-4">
              Our admissions team will review your application and contact you shortly.
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
          <h1 className="text-4xl font-bold text-center mb-8">Student Application</h1>
          
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${currentStep >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 1 ? 'border-primary bg-primary text-white' : 'border-gray-400'
                }`}>
                  1
                </div>
                <span className="ml-2">Personal Info</span>
              </div>
              <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-300'}`} />
              <div className={`flex items-center ${currentStep >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  currentStep >= 2 ? 'border-primary bg-primary text-white' : 'border-gray-400'
                }`}>
                  2
                </div>
                <span className="ml-2">Payment</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
            {currentStep === 1 && (
              <>
                {/* Personal Information */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        Email <span className="text-red-500">*</span>
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
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="phone">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="date_of_birth">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="date_of_birth"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="gender">
                        Gender
                      </label>
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="address">
                        Street Address
                      </label>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="city">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="state">
                        State/Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Educational Background */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Educational Background</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="education_level">
                        Highest Level of Education
                      </label>
                      <select
                        id="education_level"
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Education Level</option>
                        {educationLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="previous_institution">
                        Previous Institution
                      </label>
                      <input
                        type="text"
                        id="previous_institution"
                        name="previous_institution"
                        value={formData.previous_institution}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Program Selection */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Program Selection</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="program_interest">
                        Program Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="program_interest"
                        name="program_interest"
                        value={formData.program_interest}
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
                    <div>
                      <label className="block text-gray-700 font-medium mb-2" htmlFor="start_date">
                        Preferred Start Date
                      </label>
                      <select
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      >
                        <option value="">Select Start Date</option>
                        <option value="Fall 2024">Fall 2024</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Fall 2025">Fall 2025</option>
                      </select>
                    </div>
                  </div>

                  {/* Course Selection */}
                  {filteredCourses.length > 0 && (
                    <div className="mt-6">
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
                </div>

                {/* Additional Comments */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 pb-2 border-b border-gray-200">Additional Information</h2>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="comments">
                      Comments or Questions
                    </label>
                    <textarea
                      id="comments"
                      name="comments"
                      value={formData.comments}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                      placeholder="Share any additional information or questions you have"
                    ></textarea>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-6">Payment Information</h2>
                
                {donationInfo ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* QR Code Section */}
                    <div className="bg-gray-50 p-6 rounded-lg text-center">
                      <h3 className="text-lg font-semibold mb-4">Scan QR Code to Pay</h3>
                      <div className="bg-white p-4 rounded-lg inline-block mb-4">
                        <img
                          src={donationInfo.qr_code_url}
                          alt="Payment QR Code"
                          className="w-48 h-48 object-contain"
                        />
                      </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Bank Name</label>
                          <p className="text-gray-900">{donationInfo.bank_name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Account Holder</label>
                          <p className="text-gray-900">{donationInfo.account_holder}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Account Number</label>
                          <p className="text-gray-900">{donationInfo.account_number}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">IFSC Code</label>
                          <p className="text-gray-900">{donationInfo.ifsc_code}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-600">Branch</label>
                          <p className="text-gray-900">{donationInfo.branch}</p>
                        </div>
                      </div>
                    </div>

                    {/* Payment Screenshot Upload */}
                    <div className="md:col-span-2">
                      <h3 className="text-lg font-semibold mb-4">Upload Payment Screenshot</h3>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <div className="flex flex-col items-center">
                          {formData.payment_screenshot_url ? (
                            <div className="relative mb-4">
                              <img
                                src={formData.payment_screenshot_url}
                                alt="Payment screenshot preview"
                                className="max-h-48 rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({
                                    ...prev,
                                    payment_screenshot: null,
                                    payment_screenshot_url: ''
                                  }));
                                }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <Upload className="h-12 w-12 text-gray-400 mb-4" />
                              <p className="text-gray-600 text-center mb-4">
                                Upload a screenshot of your payment confirmation
                              </p>
                            </>
                          )}
                          <label className="cursor-pointer bg-primary text-white px-6 py-2 rounded-full hover:bg-primary-dark transition-colors">
                            {formData.payment_screenshot ? 'Change Screenshot' : 'Select Screenshot'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileChange}
                              required
                            />
                          </label>
                        </div>
                      </div>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-gray-600 text-center mt-2">
                            Uploading: {uploadProgress}%
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Loading payment information...</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Previous
                </button>
              )}
              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors ml-auto"
                >
                  Next
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !formData.payment_screenshot}
                  className="flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 ml-auto"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentRegister;