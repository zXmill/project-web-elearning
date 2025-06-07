import React, { useEffect, useState } from 'react';
import api from '../services/api'; // Assuming api.js is set up for authenticated requests
import { UsersIcon, BookOpenIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, bgColor = 'bg-blue-500' }) => (
  <div className={`p-6 rounded-lg shadow-lg text-white ${bgColor}`}>
    <div className="flex items-center">
      <div className="p-3 rounded-full bg-black bg-opacity-20 mr-4">
        {React.createElement(icon, { className: "h-8 w-8" })}
      </div>
      <div>
        <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-semibold">{value}</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/admin/dashboard-summary');
        if (response.data && response.data.status === 'success') {
          setSummary(response.data.data.summary);
        } else {
          setError('Gagal mengambil data ringkasan.');
        }
      } catch (err) {
        console.error("Error fetching dashboard summary:", err);
        setError(err.response?.data?.message || 'Terjadi kesalahan server. Coba lagi nanti.');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);
        setActivitiesError('');
        const response = await api.get('/admin/activities');
        if (response.data && response.data.status === 'success') {
          setActivities(response.data.data.activities);
        } else {
          setActivitiesError('Failed to load recent activities.');
        }
      } catch (err) {
        console.error("Error fetching recent activities:", err);
        setActivitiesError(err.response?.data?.message || 'Server error fetching activities.');
      } finally {
        setActivitiesLoading(false);
      }
    };
    fetchActivities();
  }, []);

  // Combined loading state for initial page load
  if (loading || (!summary && activitiesLoading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  // Display summary error if it exists
  if (error && !summary) { // Only show summary error if summary failed to load
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
        <strong className="font-bold">Error loading summary!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }
  
  // If summary is still null after loading and no error, show generic message (should ideally not happen if API is robust)
  if (!summary && !loading && !error) {
    return <p className="text-center text-gray-500">Tidak ada data ringkasan untuk ditampilkan.</p>;
  }


  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Admin Dashboard</h1>
      
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard 
            title="Total Users" 
            value={summary.totalUsers !== undefined ? summary.totalUsers : 'N/A'} 
            icon={UsersIcon}
            bgColor="bg-sky-500"
          />
          <StatCard 
            title="Total Courses" 
            value={summary.totalCourses !== undefined ? summary.totalCourses : 'N/A'}
            icon={BookOpenIcon}
            bgColor="bg-emerald-500"
          />
          <StatCard 
            title="Active Enrollments" 
            value={summary.activeEnrollments !== undefined ? summary.activeEnrollments : 'N/A'}
            icon={AcademicCapIcon}
            bgColor="bg-amber-500"
          />
        </div>
      )}
      {error && summary && ( // Show summary error even if summary data is partially available (e.g. from cache)
         <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Summary Error!</strong>
            <span className="block sm:inline"> {error}</span>
        </div>
      )}


      {/* Recent Activity Section */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
        {activitiesLoading && (
          <div className="flex justify-center items-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
          </div>
        )}
        {activitiesError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {activitiesError}</span>
          </div>
        )}
        {!activitiesLoading && !activitiesError && activities.length === 0 && (
          <p className="text-gray-600">No recent activity to display.</p>
        )}
        {!activitiesLoading && !activitiesError && activities.length > 0 && (
          <ul className="space-y-3 max-h-96 overflow-y-auto"> {/* Added max-h and overflow for scrollability */}
            {activities.map(activity => (
              <li key={activity.id} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-md shadow-sm border border-gray-200">
                <p className="text-sm text-gray-800">{activity.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
