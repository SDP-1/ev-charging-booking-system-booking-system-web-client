import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, LockClosedIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import { useLogin } from '../hooks/useLogin';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { handleSubmit, formData, handleChange, loading, error } = useLogin();
  const { user } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleFormSubmission = async (e) => {
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      navigate('/dashboard');
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
          <h2 className="text-3xl font-bold text-green-600">Welcome Back</h2>
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
              Username
            </label>
            <div className="relative mt-1">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={formData.username || ''}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                placeholder="Enter your username"
              />
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
                autoComplete="current-password"
                value={formData.password || ''}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all duration-200"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500 transition-colors"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot password?
            </Link>
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
            {loading ? 'Signing In...' : 'Sign In'}
            {!loading && <ArrowRightIcon className="h-4 w-4" />}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;