import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DASHBOARD_ROUTES } from '../data/dashboardNav';
import { HiHome, HiUsers, HiCog, HiChartBar, HiLightningBolt, HiLogout, HiOfficeBuilding } from 'react-icons/hi';
import LogoutConfirmModal from './common/LogoutConfirmModal';

// Icon mapping for routes (using react-icons/hi)
const routeIcons = {
  dashboard: <HiHome className="w-5 h-5 text-indigo-400" />,
  users: <HiUsers className="w-5 h-5 text-indigo-400" />,
  settings: <HiCog className="w-5 h-5 text-indigo-400" />,
  reports: <HiChartBar className="w-5 h-5 text-indigo-400" />,
  stations: <HiOfficeBuilding className="w-5 h-5 text-indigo-400" />,
};

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const filteredRoutes = DASHBOARD_ROUTES.filter(route => 
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
    <div className="flex flex-col w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white h-screen fixed shadow-xl z-10">
      <div className="p-6 text-2xl font-extrabold text-indigo-400 border-b border-gray-700/50 flex items-center space-x-3">
        <HiLightningBolt className="w-8 h-8 text-indigo-400" />
        <span>EV Charge Admin</span>
      </div>
      <nav className="flex-grow p-4 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
        {filteredRoutes.map((route) => (
          <NavLink
            key={route.path}
            to={route.path}
            end
            className={({ isActive }) => 
              `flex items-center p-3 rounded-xl transition-all duration-300 text-sm font-medium 
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-md scale-105' 
                : 'text-gray-300 hover:bg-gray-700/80 hover:text-white hover:shadow-sm hover:scale-105'}`
            }
          >
            {routeIcons[route.name.toLowerCase()] || (
              <HiChartBar className="w-5 h-5 text-indigo-400" />
            )}
            <span className="ml-3">{route.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700/50 flex-shrink-0 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
              {user.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-200 truncate max-w-[120px]" title={user.username}>
                {user.username || "User"}
              </p>
              <p className="text-xs text-indigo-300 capitalize">
                Role: {user.role || "N/A"}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogoutClick}
            className="text-gray-400 hover:text-red-400 transition-all duration-200 p-3 rounded-full hover:bg-gray-700/50 flex items-center justify-center"
            title="Logout"
            aria-label="Logout"
          >
            <HiLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
      {showLogoutConfirm && (
        <LogoutConfirmModal 
          onConfirm={handleConfirmLogout} 
          onCancel={handleCancelLogout} 
        />
      )}
    </div>
  );
};

export default Sidebar;