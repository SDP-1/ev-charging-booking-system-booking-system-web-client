import React from 'react';

const LogoutConfirmModal = ({ onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-[1000] transition-opacity duration-300">
    <div 
      className="bg-white p-8 rounded-xl shadow-2xl w-96 max-w-[90%] transform transition-all duration-300 scale-100"
      role="dialog"
      aria-labelledby="logout-modal-title"
      aria-describedby="logout-modal-description"
    >
      <h3 id="logout-modal-title" className="text-xl font-bold text-gray-900 mb-4">Confirm Logout</h3>
      <p id="logout-modal-description" className="text-sm text-gray-600 mb-6 leading-relaxed">
        Are you sure you want to log out of your account?
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
          aria-label="Cancel logout"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-5 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 hover:scale-105 transition-all duration-200"
          aria-label="Confirm logout"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
);

export default LogoutConfirmModal;