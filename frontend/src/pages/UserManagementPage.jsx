import React, { useState } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import UserTable from '../components/UserManagement/UserTable';
import UserEditModal from '../components/UserManagement/UserEditModal';
import { useAuth } from '../context/AuthContext';

const UserManagementPage = () => {
    const { token, user } = useAuth();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const {
        users,
        loading,
        error,
        filterRole,
        setFilterRole,
        refetch,
        editUser,
        toggleUserActiveStatus,
        setUsers
    } = useUserManagement(token);

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleSave = async (userId, updateData) => {
        setIsSaving(true);
        const success = await editUser(userId, updateData);
        setIsSaving(false);
        if (success) {
            setIsModalOpen(false);
            setSelectedUser(null);
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        const action = currentStatus ? 'deactivate' : 'activate';
        if (window.confirm(`Are you sure you want to ${action} this user?`)) {
            const updatedUser = await toggleUserActiveStatus(userId, currentStatus);

            if (updatedUser && selectedUser?.id === userId) {
                setSelectedUser(updatedUser); // refresh modal
            }
        }
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">
                <i className="fa-solid fa-users-gear text-indigo-600 mr-3"></i>User Management
            </h1>

            {/* Controls and Filters */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
                <div className="flex items-center space-x-3">
                    <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">Filter by Role:</label>
                    <select
                        id="role-filter"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={loading}
                    >
                        <option value="all">All Users</option>
                        <option value="Backoffice">Backoffice</option>
                        <option value="StationOperator">Station Operator</option>
                        <option value="EVOwner">EV Owner</option>
                    </select>
                </div>

                <button
                    onClick={refetch}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition ${loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    disabled={loading}
                >
                    <i className={`fa-solid fa-sync mr-2 ${loading ? 'animate-spin' : ''}`}></i>
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="p-4 mb-6 text-center bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                    <p className="font-semibold">Operation Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* User Table */}
            <UserTable
                users={users}
                loading={loading}
                onEdit={handleEditClick}
                onToggleActive={handleToggleActive}
            />

            {/* Edit Modal */}
            <UserEditModal
                user={selectedUser}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                isSaving={isSaving}
            />
        </div>
    );
};

export default UserManagementPage;