import React, { useState } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import UserTable from '../components/UserManagement/UserTable';
import UserEditModal from '../components/UserManagement/UserEditModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { HiUsers } from 'react-icons/hi';

const UserManagementPage = () => {
  const { token, user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    confirmText: 'Confirm',
  });
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  const {
    users,
    loading,
    error,
    filterRole,
    setFilterRole,
    refetch,
    editUser,
    toggleUserActiveStatus,
  } = useUserManagement(token);

  // Show error in modal
  React.useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

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
      setConfirmModal({
        isOpen: true,
        title: 'Success',
        message: 'User updated successfully!',
        onConfirm: null,
        confirmText: 'OK',
      });
    } else {
      setErrorModal({ isOpen: true, message: 'Failed to update user. Please try again.' });
    }
  };

  const handleToggleActive = (userId, currentStatus) => {
    setConfirmModal({
      isOpen: true,
      title: currentStatus ? 'Deactivate User' : 'Activate User',
      message: `Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this user?`,
      onConfirm: async () => {
        const updatedUser = await toggleUserActiveStatus(userId, currentStatus);
        if (updatedUser) {
          if (selectedUser?.id === userId) {
            setSelectedUser(updatedUser);
          }
          setConfirmModal({
            isOpen: true,
            title: 'Success',
            message: `User ${currentStatus ? 'deactivated' : 'activated'} successfully!`,
            onConfirm: null,
            confirmText: 'OK',
          });
        } else {
          setErrorModal({ isOpen: true, message: `Failed to ${currentStatus ? 'deactivate' : 'activate'} user. Please try again.` });
        }
      },
      confirmText: currentStatus ? 'Deactivate' : 'Activate',
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ ...confirmModal, isOpen: false });
  };

  const closeErrorModal = () => {
    setErrorModal({ isOpen: false, message: '' });
  };

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center space-x-3 border-b border-gray-200 pb-3">
        <HiUsers className="w-8 h-8 text-indigo-600" />
        <span>User Management</span>
      </h1>

      {/* Controls and Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 md:p-6 rounded-xl shadow-md">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0 w-full sm:w-auto">
          <label htmlFor="role-filter" className="text-sm font-semibold text-gray-700">
            Filter by Role:
          </label>
          <select
            id="role-filter"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
            disabled={loading}
            aria-label="Filter users by role"
          >
            <option value="all">All Users</option>
            <option value="Backoffice">Backoffice</option>
            <option value="StationOperator">Station Operator</option>
            <option value="EVOwner">EV Owner</option>
          </select>
        </div>
        <button
          onClick={refetch}
          className={`flex items-center px-5 py-2.5 text-sm font-medium rounded-lg transition duration-200 ${
            loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105'
          }`}
          disabled={loading}
          aria-label="Refresh user data"
        >
          <svg
            className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 11v-5h-5m0-6l-7 7m7-7H4" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

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

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        confirmText={confirmModal.confirmText}
      />

      {/* Error Modal */}
      <ConfirmModal
        isOpen={errorModal.isOpen}
        title="Operation Error"
        message={errorModal.message}
        onCancel={closeErrorModal}
        isError={true}
      />
    </div>
  );
};

export default UserManagementPage;