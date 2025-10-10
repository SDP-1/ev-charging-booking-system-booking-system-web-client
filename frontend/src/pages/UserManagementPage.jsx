import React, { useState, useEffect, useMemo } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import { motion } from 'framer-motion';
import UserTable from '../components/UserManagement/UserTable';
import UserEditModal from '../components/UserManagement/UserEditModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { UsersIcon, MagnifyingGlassIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

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
  const [totalCount, setTotalCount] = useState(0);

  const {
    users,
    filteredUsers,
    loading,
    error,
    filterRole,
    setFilterRole,
    searchQuery,
    setSearchQuery,
    refetch,
    editUser,
    toggleUserActiveStatus,
  } = useUserManagement(token);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const { TotalUsers } = await res.json();
          setTotalCount(TotalUsers);
        }
      } catch (e) {
        console.error('Failed to fetch user count:', e);
      }
    };
    fetchCount();
  }, [token, refetch]);

  useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  const stats = useMemo(() => {
    const allUsers = users || [];
    return {
      total: totalCount || allUsers.length,
      active: allUsers.filter(u => u.active === true).length,
      inactive: allUsers.filter(u => u.active === false).length,
      backoffice: allUsers.filter(u => u.role === 'Backoffice').length,
      stationOperators: allUsers.filter(u => u.role === 'StationOperator').length,
      evOwners: allUsers.filter(u => u.role === 'EVOwner').length,
    };
  }, [users, totalCount]);

  const filteredCount = filteredUsers.length;

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
      refetch();
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
          refetch();
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

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('all');
  };

  if (loading && users.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UsersIcon className="w-8 h-8 text-green-600" />
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        </div>
        <div className="text-sm text-gray-600">Showing {filteredCount} of {stats.total} users</div>
      </div>

      {/* Stats Section */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <UsersIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-green-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100 text-green-600">
                <CheckCircleIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.active}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-red-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100 text-red-600">
                <XCircleIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-2xl font-bold text-gray-800">{stats.inactive}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ scale: 1.03, y: -4 }}
            className="bg-white rounded-xl p-6 shadow-md border border-blue-200"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
                <Cog6ToothIcon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Backoffice</p>
                <p className="text-2xl font-bold text-gray-800">{stats.backoffice}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Controls and Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              disabled={loading}
              aria-label="Search users by name, email, or role"
            />
          </div>
          <div className="flex items-center space-x-3 flex-1 lg:flex-none">
            <label htmlFor="role-filter" className="text-sm font-medium text-gray-700">
              Filter by Role:
            </label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 lg:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              disabled={loading}
              aria-label="Filter users by role"
            >
              <option value="all">All Roles</option>
              <option value="Backoffice">Backoffice</option>
              <option value="StationOperator">Station Operator</option>
              <option value="EVOwner">EV Owner</option>
            </select>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={clearFilters}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
              disabled={loading || (!searchQuery && filterRole === 'all')}
              aria-label="Clear search and role filters"
            >
              Clear
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={refetch}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
              }`}
              disabled={loading}
              aria-label="Refresh user data"
            >
              <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Refreshing...' : 'Refresh'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* User Table */}
      <UserTable
        users={filteredUsers}
        loading={loading}
        onEdit={handleEditClick}
        onToggleActive={handleToggleActive}
      />

      {/* Modals */}
      <UserEditModal
        user={selectedUser}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
      />
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={closeConfirmModal}
        confirmText={confirmModal.confirmText}
      />
      <ConfirmModal
        isOpen={errorModal.isOpen}
        title="Operation Error"
        message={errorModal.message}
        onCancel={closeErrorModal}
        isError={true}
      />
    </motion.div>
  );
};

export default UserManagementPage;