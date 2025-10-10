
import React from 'react';
import { motion } from 'framer-motion';
import { BookingTrendChart, UserApprovalWidget } from './SharedComponents';

const BackofficeDashboard = ({ data, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
  >
    <BookingTrendChart trend={data?.bookingTrend} loading={loading} />
    <UserApprovalWidget count={data?.pendingUserApprovals} loading={loading} />
    <div className="lg:col-span-full bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Recent System Activity Log</h3>
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <p className="text-gray-500">[High-Priority Log/Audit Trail Table]</p>
      )}
    </div>
  </motion.div>
);

export default BackofficeDashboard;