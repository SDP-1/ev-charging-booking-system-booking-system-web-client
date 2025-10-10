
import React from 'react';
import { motion } from 'framer-motion';

const StationOperatorDashboard = ({ data, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
  >
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Station Overview</h3>
      {loading ? (
        <div className="animate-pulse h-8 w-3/4 bg-gray-200 rounded"></div>
      ) : (
        <p className="text-gray-600">Operational status and diagnostics.</p>
      )}
    </div>
    <div className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Slots Booked Today</h3>
      {loading ? (
        <div className="animate-pulse h-10 w-1/2 bg-gray-200 rounded"></div>
      ) : (
        <p className="text-3xl font-bold text-orange-600">
          {data?.bookedSlotsToday || 0} / {data?.totalSlots || 0}
        </p>
      )}
    </div>
  </motion.div>
);

export default StationOperatorDashboard;