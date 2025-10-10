

import React from 'react';
import { motion } from 'framer-motion';
import StatCard from '../StatCard';
import EVOwnerDashboard from './EVOwnerDashboard';
import BackofficeDashboard from './BackofficeDashboard';
import StationOperatorDashboard from './StationOperatorDashboard';

const SkeletonCard = () => (
  <div className="p-6 rounded-xl shadow-lg bg-gray-200 animate-pulse h-32">
    <div className="h-4 bg-gray-300 rounded w-1/2 mb-4"></div>
    <div className="h-8 bg-gray-300 rounded w-3/4"></div>
  </div>
);

const DashboardContainer = ({ role, dashboardData, cards, loading }) => {
  const roleDashboardMap = {
    EVOwner: EVOwnerDashboard,
    Backoffice: BackofficeDashboard,
    StationOperator: StationOperatorDashboard,
  };

  const RoleSpecificDashboard = roleDashboardMap[role];

  if (!RoleSpecificDashboard) {
    return (
      <div className="p-10 text-center text-red-600 font-medium">
        Invalid user role assigned.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading
          ? Array(4)
              .fill(null)
              .map((_, index) => <SkeletonCard key={index} />)
          : cards.map((item, index) => (
              <StatCard
                key={index}
                title={item.title}
                value={item.value}
                icon={item.icon}
                bgColor={item.bgColor || 'from-green-600 to-green-400'}
                loading={false}
              />
            ))}
      </div>

      {/* Role-Specific Dashboard */}
      <RoleSpecificDashboard data={dashboardData} loading={loading} />
    </motion.div>
  );
};

export default DashboardContainer;