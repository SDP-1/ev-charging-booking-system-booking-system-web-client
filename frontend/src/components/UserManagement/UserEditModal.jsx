
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiX } from 'react-icons/hi';

const UserEditModal = ({ user, isOpen, onClose, onSave, isSaving }) => {
  const [nic, setNic] = useState(user?.nic || '');
  const [message, setMessage] = useState(user?.message || '');

  useEffect(() => {
    if (user) {
      setNic(user.nic || '');
      setMessage(user.message || '');
    }
  }, [user, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user.id, {
      NIC: nic,
      Message: message,
    });
  };

  if (!isOpen || !user) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-xl shadow-md w-full max-w-md border-t-4 border-green-500">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-bold text-green-600">Edit User: {user.username}</h3>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-2 rounded-full hover:bg-gray-100"
            aria-label="Close modal"
          >
            <HiX className="w-6 h-6" />
          </motion.button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Role</label>
            <p className="text-lg font-medium text-green-600 capitalize">{user.role}</p>
          </div>
          <div className="space-y-2">
            <label htmlFor="nic" className="text-sm font-semibold text-gray-700">
              NIC (National ID Card)
            </label>
            <input
              id="nic"
              type="text"
              value={nic}
              onChange={(e) => setNic(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Enter NIC"
              aria-required="true"
              aria-label="National ID Card"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-semibold text-gray-700">
              Message to User
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="4"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition duration-200"
              placeholder="Enter message"
              aria-label="Message to user"
            />
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-all duration-200"
              disabled={isSaving}
              aria-label="Cancel edit"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all duration-200 disabled:bg-green-400 disabled:cursor-not-allowed"
              disabled={isSaving}
              aria-label="Save changes"
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default UserEditModal;