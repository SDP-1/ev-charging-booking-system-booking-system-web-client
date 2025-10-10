
import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, bgColor, loading }) => {
  if (loading) {
    return (
      <div className="p-6 rounded-xl shadow-lg bg-gray-200 animate-pulse">
        <div className="h-6 w-1/3 bg-gray-300 rounded mb-3"></div>
        <div className="h-8 w-1/2 bg-gray-300 rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.2 }}
      className={`p-6 rounded-xl shadow-lg bg-gradient-to-br ${bgColor} text-white`}
    >
      <div className="flex items-center justify-between">
        <i className={`${icon} text-3xl opacity-80`}></i>
        <div className="text-right">
          <p className="text-3xl font-bold">{value}</p>
          <p className="text-xs uppercase font-medium mt-1 tracking-wide">{title}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;