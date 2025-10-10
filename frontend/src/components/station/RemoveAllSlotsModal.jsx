
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';

const RemoveAllSlotsModal = ({ date, onConfirm, onClose, isLoading = false }) => {
  const [error, setError] = useState('');

  const handleRemove = async () => {
    try {
      setError('');
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e.message || 'Failed to remove slots. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-md transition-all sm:my-8 sm:w-full sm:max-w-md border-t-4 border-green-500">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Remove All Slots</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to delete all slots for <strong>{date}</strong>? This action cannot be undone.
                  </p>
                </div>
                {error && (
                  <div className="mt-2 p-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              disabled={isLoading}
              onClick={handleRemove}
              className="inline-flex w-full justify-center rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Remove all slots"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Removing...
                </>
              ) : (
                <>
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Remove All
                </>
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              aria-label="Cancel removal"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Cancel
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RemoveAllSlotsModal;