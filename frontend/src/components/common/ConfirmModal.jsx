import React from 'react';
import { HiExclamationCircle } from 'react-icons/hi';

const ConfirmModal = ({ isOpen, onConfirm, onCancel, title, message, confirmText = 'Confirm', cancelText = 'Cancel', isError = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000] transition-opacity duration-300">
      <div 
        className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100"
        role="dialog"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-description"
      >
        <div className="flex items-center space-x-2 mb-4">
          {isError && <HiExclamationCircle className="w-6 h-6 text-red-600" />}
          <h3 id="confirm-modal-title" className={`text-lg font-bold ${isError ? 'text-red-600' : 'text-gray-800'}`}>
            {title}
          </h3>
        </div>
        <p id="confirm-modal-description" className="text-sm text-gray-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 hover:scale-105 transition-all duration-200"
            aria-label={cancelText}
          >
            {cancelText}
          </button>
          {!isError && (
            <button
              onClick={onConfirm || onCancel} // Fallback to onCancel if onConfirm is null
              className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 hover:scale-105 transition-all duration-200"
              aria-label={confirmText}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;