import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Trash2, Edit, Plus, Save, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface Statistic {
  id: string;
  title: string;
  value: number;
  icon_name?: string;
  created_at: string;
}

const StatisticsManagement = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStatistic, setCurrentStatistic] = useState<Partial<Statistic>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setStatistics(data || []);
    } catch (err) {
      setError('Error fetching statistics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (!currentStatistic.title || !currentStatistic.value) {
        throw new Error('Title and value are required');
      }

      if (currentStatistic.id) {
        // Update existing statistic
        const { error } = await supabase
          .from('statistics')
          .update({
            title: currentStatistic.title,
            value: currentStatistic.value,
            icon_name: currentStatistic.icon_name
          })
          .eq('id', currentStatistic.id);
        
        if (error) throw error;
      } else {
        // Create new statistic
        const { error } = await supabase
          .from('statistics')
          .insert([{
            title: currentStatistic.title,
            value: currentStatistic.value,
            icon_name: currentStatistic.icon_name
          }]);
        
        if (error) throw error;
      }

      setIsEditing(false);
      setCurrentStatistic({});
      fetchStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving statistic');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('statistics')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      fetchStatistics();
    } catch (err) {
      setError('Error deleting statistic');
    }
  };

  const iconOptions = [
    { value: 'GraduationCap', label: 'Graduation Cap' },
    { value: 'Users', label: 'Users' },
    { value: 'BookOpen', label: 'Book Open' },
    { value: 'Globe', label: 'Globe' },
    { value: 'Building', label: 'Building' },
    { value: 'Award', label: 'Award' },
    { value: 'Calendar', label: 'Calendar' },
    { value: 'Clock', label: 'Clock' }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Statistics Management</h2>
        <button
          onClick={() => {
            setIsEditing(true);
            setCurrentStatistic({});
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Statistic</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && <p className="text-gray-500">Loading statistics...</p>}

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.length === 0 && !loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No statistics found. Add your first statistic!
                </td>
              </tr>
            ) : (
              statistics.map((statistic) => (
                <tr key={statistic.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{statistic.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{statistic.value}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{statistic.icon_name || 'None'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setCurrentStatistic(statistic);
                          setIsEditing(true);
                        }}
                        className="text-primary hover:text-primary-dark"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(statistic.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                {currentStatistic.id ? 'Edit Statistic' : 'Add New Statistic'}
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  value={currentStatistic.title || ''}
                  onChange={e => setCurrentStatistic({ ...currentStatistic, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="e.g., Graduates"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Value</label>
                <input
                  type="number"
                  value={currentStatistic.value || ''}
                  onChange={e => setCurrentStatistic({ ...currentStatistic, value: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                  placeholder="e.g., 1000"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Icon</label>
                <select
                  value={currentStatistic.icon_name || ''}
                  onChange={e => setCurrentStatistic({ ...currentStatistic, icon_name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                >
                  <option value="">Select an icon</option>
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatisticsManagement;