

import React from 'react';
import { motion } from 'framer-motion';
import { UpcomingReservations } from './SharedComponents';

const EVOwnerDashboard = ({ data, loading }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
  >
    <UpcomingReservations bookings={data?.upcomingBookings} loading={loading} />
    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500">
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fa-solid fa-map-location-dot text-blue-500 mr-2"></i>
        Nearest Charging Stations
      </h3>
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500">
        {loading ? (
          <div className="animate-pulse h-full w-full bg-gray-200 rounded-lg"></div>
        ) : (
          "[Interactive Map Placeholder]"
        )}
      </div>
    </div>
  </motion.div>
);

export default EVOwnerDashboard;