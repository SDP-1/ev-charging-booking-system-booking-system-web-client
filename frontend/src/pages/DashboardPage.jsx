import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData'; 
import DashboardContainer from '../components/Dashboard/DashboardContainer';
import { HiRefresh } from 'react-icons/hi';

const DashboardPage = () => {
  const { user, token } = useAuth();
  
  if (!user) {
    return (
      <div className="p-10 text-center text-red-600 font-semibold">
        Unauthorized Access. Please log in.
      </div>
    );
  }
  
  const userId = user?.id || '';
  const { data: dashboardData, cards, loading, error, refetch } = useDashboardData(user.role, userId, token);

  const roleName = {
    'Backoffice': 'System Administrator',
    'EVOwner': 'EV Owner',
    'StationOperator': 'Station Operator'
  }[user.role] || 'User';

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      {/* Header with Welcome and Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
            Welcome back, {user.username}!
          </h2>
          <p className="text-lg text-gray-500 mt-1">{roleName} Dashboard Overview</p>
        </div>
        <button 
          onClick={refetch}
          disabled={loading}
          className={`flex items-center px-5 py-2.5 text-sm font-medium rounded-full transition duration-200 ${
            loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-700 shadow hover:shadow-lg hover:bg-gray-100 hover:scale-105'
          }`}
          aria-label="Refresh dashboard data"
        >
          <HiRefresh className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* General API Error Alert */}
      {error && (
        <div className="p-4 mb-6 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 rounded-lg shadow-md">
          <p className="font-semibold flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data Load Warning
          </p>
          <p className="text-sm">Could not fetch all dashboard metrics ({error.message}). Displaying partial data/skeletons.</p>
        </div>
      )}
      
      {/* Pass everything to the container which handles role-specific layout */}
      <DashboardContainer 
        role={user.role} 
        dashboardData={dashboardData} 
        cards={cards} 
        loading={loading}
      />
    </div>
  );
};

export default DashboardPage;