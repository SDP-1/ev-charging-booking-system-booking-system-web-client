import React from 'react';
import { HiPencil, HiUserAdd, HiUserRemove } from 'react-icons/hi';

const UserTable = ({ users, loading, onEdit, onToggleActive }) => {
  const renderStatus = (active) => (
    <span
      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
        active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {active ? 'Active' : 'Pending/Inactive'}
    </span>
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 flex items-center justify-center">
        <svg className="animate-spin h-5 w-5 mr-2 text-indigo-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading user data...
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No users found matching the filter criteria.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto shadow-lg rounded-xl bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Username</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIC</th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Message</th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map((user) => (
            <tr
              key={user.id}
              className="hover:bg-indigo-50 transition duration-200"
              role="row"
              aria-label={`User ${user.username}`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{user.role}</td>
              <td className="px-6 py-4 whitespace-nowrap">{renderStatus(user.active)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.nic || 'N/A'}</td>
              <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate" title={user.message}>
                {user.message || 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                <button
                  onClick={() => onEdit(user)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-100 hover:text-indigo-800 transition duration-200"
                  aria-label={`Edit user ${user.username}`}
                >
                  <HiPencil className="w-4 h-4 mr-1.5" />
                  Edit
                </button>
                <button
                  onClick={() => onToggleActive(user.id, user.active)}
                  className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-lg border transition duration-200 ${
                    user.active
                      ? 'text-red-600 border-red-200 hover:bg-red-100 hover:text-red-800'
                      : 'text-green-600 border-green-200 hover:bg-green-100 hover:text-green-800'
                  }`}
                  aria-label={`${user.active ? 'Deactivate' : 'Activate'} user ${user.username}`}
                >
                  {user.active ? (
                    <HiUserRemove className="w-4 h-4 mr-1.5" />
                  ) : (
                    <HiUserAdd className="w-4 h-4 mr-1.5" />
                  )}
                  {user.active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;