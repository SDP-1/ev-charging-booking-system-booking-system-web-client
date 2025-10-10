
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { motion } from 'framer-motion';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import DashboardContainer from '../components/Dashboard/DashboardContainer';

const DashboardPage = () => {
  const { user, token } = useAuth();

  if (!user) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-10 text-center text-red-600 font-medium text-lg"
      >
        Unauthorized Access. Please log in.
      </motion.div>
    );
  }

  const userId = user?.id || '';
  const { data: dashboardData, cards, loading, error, refetch } = useDashboardData(user.role, userId, token);

  const roleName = {
    Backoffice: 'System Administrator',
    EVOwner: 'EV Owner',
    StationOperator: 'Station Operator',
  }[user.role] || 'User';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
    >
      {/* Header with Welcome and Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-3xl md:text-4xl font-bold text-black-600 tracking-tight flex items-center gap-2">
            <span className="text-2xl">⚡️</span> Welcome, {user.username}!
          </h2>
          <p className="text-sm text-gray-600 mt-2">{roleName} Dashboard Overview</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={refetch}
          disabled={loading}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
            loading
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 shadow-md'
          }`}
          aria-label="Refresh dashboard data"
        >
          <ArrowPathIcon className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </motion.button>
      </div>

      {/* General API Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md"
          role="alert"
        >
          <p className="font-medium flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Data Load Error
          </p>
          <p className="text-sm mt-1">
            Could not fetch all dashboard metrics ({error.message}). Displaying partial data.
          </p>
        </motion.div>
      )}

      {/* Dashboard Container */}
      <DashboardContainer
        role={user.role}
        dashboardData={dashboardData}
        cards={cards}
        loading={loading}
      />
    </motion.div>
  );
};

export default DashboardPage;