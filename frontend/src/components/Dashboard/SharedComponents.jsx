
import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const UpcomingReservations = ({ bookings, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-green-500"
  >
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
      <i className="fa-solid fa-car-battery text-green-500 mr-2"></i>
      Your Upcoming Charges ({loading ? '...' : bookings?.length || 0})
    </h3>
    <div className="min-h-[6rem] max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-100">
      {loading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-gray-100 rounded"></div>
          <div className="h-8 bg-gray-100 rounded w-5/6"></div>
        </div>
      ) : bookings?.length > 0 ? (
        <ul className="space-y-2">
          {bookings.map((booking, index) => (
            <motion.li
              key={index}
              whileHover={{ scale: 1.02 }}
              className="flex justify-between items-center text-sm p-2 bg-green-50 rounded-lg hover:bg-green-100 transition"
            >
              <span className="font-semibold text-gray-700">{booking.stationId || 'Unknown Station'}</span>
              <span className="text-xs text-gray-500">
                {new Date(booking.reservationDateTime).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}
              </span>
            </motion.li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-6 border border-dashed rounded-lg">
          No reservations booked for the near future.
        </p>
      )}
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
    >
      Book New Slot
    </motion.button>
  </motion.div>
);

export const BookingTrendChart = ({ trend, loading }) => {
  const totalBookings = Object.values(trend || {}).reduce((sum, count) => sum + count, 0);

  const chartData = Object.entries(trend || {})
    .map(([dateKey, count]) => ({
      date: new Date(dateKey).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      bookings: count,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-blue-500 col-span-full lg:col-span-2"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <i className="fa-solid fa-chart-line text-blue-500 mr-2"></i>
        Booking Trend (Last 7 Days)
      </h3>
      <div className="h-64">
        {loading ? (
          <div className="animate-pulse h-full w-full bg-gray-100 rounded-lg"></div>
        ) : totalBookings > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" stroke="#1F97F4" tickLine={false} axisLine={false} />
              <YAxis stroke="#1F97F4" tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ fontWeight: 'bold', color: '#333' }}
                formatter={(value) => [`${value} bookings`, 'Bookings']}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                stroke="#1F97F4"
                strokeWidth={2}
                dot={{ fill: '#1F97F4', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">No booking data available for the last 7 days.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const UserApprovalWidget = ({ count, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white p-6 rounded-xl shadow-lg border-t-4 border-orange-500"
  >
    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
      <i className="fa-solid fa-person-circle-question text-orange-500 mr-2"></i>
      Users Pending Approval
    </h3>
    <div className="text-3xl font-bold text-orange-600 mb-4">
      {loading ? (
        <div className="animate-pulse h-8 w-1/3 bg-orange-200 rounded"></div>
      ) : (
        count
      )}
    </div>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600 transition"
    >
      Review Applications
    </motion.button>
  </motion.div>
);