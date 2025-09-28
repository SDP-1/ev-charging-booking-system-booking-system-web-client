import React from 'react';

const UserTable = ({ users, loading, onEdit, onToggleActive }) => {

    const renderStatus = (active) => (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
            {active ? 'Active' : 'Pending/Inactive'}
        </span>
    );

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Loading user data...</div>;
    }

    if (!users || users.length === 0) {
        return <div className="p-6 text-center text-gray-500">No users found matching the filter criteria.</div>;
    }

    return (
        <div className="overflow-x-auto shadow-lg rounded-xl">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIC</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-indigo-50 transition duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{renderStatus(user.active)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.nic || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{user.message}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                <button
                                    onClick={() => onEdit(user)}
                                    className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded-md border border-indigo-200 hover:bg-indigo-100 transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => onToggleActive(user.id, user.active)}
                                    className={`px-3 py-1 rounded-md border transition ${
                                        user.active 
                                            ? 'text-red-600 border-red-200 hover:bg-red-100' 
                                            : 'text-green-600 border-green-200 hover:bg-green-100'
                                    }`}
                                >
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