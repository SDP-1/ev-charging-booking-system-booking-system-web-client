import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, LockClosedIcon, IdentificationIcon, UserGroupIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useRegister } from '../hooks/useRegister';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const handleSuccess = (responseData) => {
    alert(`Registration successful! User: ${responseData.Username}, Role: ${responseData.Role}`);
    navigate('/login');
  };

  const { formData, handleChange, handleSubmit, loading, error } = useRegister(handleSuccess);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative"
      style={{
        backgroundImage: `url('https://gmdirecthire.co.uk/_next/image?url=https%3A%2F%2Fgm-blogs.s3.eu-west-1.amazonaws.com%2FEV_charging_points_near_me_aa2dfdf69f.webp&w=2048&q=100')`,
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative bg-white bg-opacity-95 rounded-3xl shadow-2xl p-8 w-full max-w-lg mx-4"
      >
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-green-600">Create an Account</h2>
          <p className="text-sm text-gray-600 mt-2">
            Access your personalized dashboard to book charging slots, monitor stations, or manage backoffice tasks.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 p-3 text-sm text-red-700 bg-red-100 border border-red-200 rounded-lg"
            role="alert"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleFormSubmission} noValidate className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username (Email)
            </label>
            <div className="relative mt-1">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="username"
                name="username"
                type="email"
                autoComplete="email"
                value={formData.username || ''}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                placeholder="Enter your email"
              />
            </div>
          </div>

          {formData.role === 'EVOwner' && (
            <div>
              <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                National Identity Card (NIC)
              </label>
              <div className="relative mt-1">
                <IdentificationIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="nic"
                  name="nic"
                  type="text"
                  value={formData.nic || ''}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                  placeholder="Enter your NIC"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <div className="relative mt-1">
              <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                id="role"
                name="role"
                value={formData.role || 'EVOwner'}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
              >
                <option value="EVOwner">EV Owner</option>
                <option value="StationOperator">Station Operator</option>
                <option value="Backoffice">Back Officer</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative mt-1">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password || ''}
                onChange={handleChange}
                required
                minLength="6"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <div className="relative mt-1">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword || ''}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <motion.button
            type="submit"
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:bg-green-400"
            disabled={loading}
          >
            {loading ? 'Registering...' : 'Sign Up'}
            {!loading && <ArrowRightIcon className="h-4 w-4" />}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;