
import React from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex-1 flex flex-col overflow-hidden ml-64"
      >
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-white shadow-md border-b border-gray-200">
          <h1 className="text-xl font-bold text-green-600 flex items-center gap-2">
            <span className="text-2xl">⚡️</span> EV Charging System
          </h1>
          <div className="flex items-center gap-4">
            <button className="text-sm text-gray-600 hover:text-green-600 transition">
              Notifications
            </button>
            <button className="text-sm text-gray-600 hover:text-green-600 transition">
              Settings
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default DashboardLayout;