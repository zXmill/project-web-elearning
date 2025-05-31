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
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  if (!summary) {
    return <p className="text-center text-gray-500">Tidak ada data ringkasan untuk ditampilkan.</p>;
  }

  return (
    <div>
      <h1 className="text-3xl font-semibold text-gray-800 mb-8">Admin Dashboard</h1>
      
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

      {/* Placeholder for future charts or tables */}
      <div className="mt-12 bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
        <p className="text-gray-600">
          (Placeholder for recent user registrations, course enrollments, etc.)
        </p>
        {/* Example: <RecentUsersTable /> */}
      </div>
    </div>
  );
};

export default AdminDashboard;
