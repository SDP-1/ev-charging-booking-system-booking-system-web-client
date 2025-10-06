// src/components/common/StatusPill.jsx
import React from 'react';

const StatusPill = ({ status }) => {
  const statusConfig = {
    'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
    'Approved': { bg: 'bg-blue-100', text: 'text-blue-800' },
    'Confirmed': { bg: 'bg-green-100', text: 'text-green-800' },
    'Completed': { bg: 'bg-indigo-100', text: 'text-indigo-800' },
    'Canceled': { bg: 'bg-red-100', text: 'text-red-800' },
  };
  const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800' };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.bg} ${config.text} ring-1 ring-inset ring-gray-200`}>
      {status}
    </span>
  );
};

export default StatusPill;