import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DASHBOARD_ROUTES } from '../data/dashboardNav';
import { 
  HiHome, 
  HiUserGroup, 
  HiCog, 
  HiChartBar, 
  HiLocationMarker, 
  HiLogout, 
  HiLightningBolt,
  HiCalendar 
} from 'react-icons/hi';
import { BoltIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import LogoutConfirmModal from './common/LogoutConfirmModal';

// Icon mapping for routes
const routeIcons = {
  dashboard: <HiHome className="w-5 h-5 text-green-400" />,
  usermanagement: <HiUserGroup className="w-5 h-5 text-green-400" />,
  settings: <HiCog className="w-5 h-5 text-green-400" />,
  reports: <HiChartBar className="w-5 h-5 text-green-400" />,
  stationmanagement: <BoltIcon className="w-5 h-5 text-green-400" />,
  bookings: <HiCalendar className="w-5 h-5 text-green-400" />,
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(null);

  const filteredRoutes = DASHBOARD_ROUTES.filter((route) =>
    user && route.roles.includes(user.role)
  );

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/login');
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ x: -256 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex flex-col w-64 bg-gray-900 text-white h-screen fixed shadow-xl z-10"
    >
      {/* Header */}
      <div className="p-6 flex items-center space-x-3 bg-gradient-to-r from-green-800 to-green-600">
        <HiLightningBolt className="w-8 h-8 text-green-400" />
        <span className="text-xl font-bold text-white">EV Charge Admin</span>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-gray-800">
        {filteredRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end
            onMouseEnter={() => setIsHovered(route.path)}
            onMouseLeave={() => setIsHovered(null)}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-lg transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-green-700 text-white shadow-md'
                  : 'text-gray-200 hover:bg-green-800 hover:text-white'
              }`
            }
          >
            {routeIcons[route.name.toLowerCase().replace(/\s+/g, '')] || (
              <HiChartBar className="w-5 h-5 text-green-400" />
            )}
            <motion.span
              className="ml-3"
              animate={{ scale: isHovered === route.path ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {route.name}
            </motion.span>
          </NavLink>
        ))}
      </nav>

      {/* User Info and Logout */}
      <div className="p-4 border-t border-green-700/50 flex-shrink-0 bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div
              className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </motion.div>
            <div>
              <p
                className="text-sm font-semibold text-gray-100 truncate max-w-[120px]"
                title={user.username}
              >
                {user.username || 'User'}
              </p>
              <p className="text-xs text-green-400 capitalize">
                Role: {user.role || 'N/A'}
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleLogoutClick}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            className="text-gray-300 hover:text-red-400 transition-all duration-200 p-2 rounded-full hover:bg-gray-700"
            title="Logout"
            aria-label="Logout"
          >
            <HiLogout className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <LogoutConfirmModal
            onConfirm={handleConfirmLogout}
            onCancel={handleCancelLogout}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Sidebar;