import React, { useState, useEffect, useMemo } from 'react';
import { useUserManagement } from '../hooks/useUserManagement';
import UserTable from '../components/UserManagement/UserTable';
import UserEditModal from '../components/UserManagement/UserEditModal';
import ConfirmModal from '../components/common/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { 
  HiUsers, 
  HiSearch, 
  HiOutlineUserGroup, 
  HiOutlineCheckCircle,  // Available icon for active
  HiOutlineXCircle,      // Available icon for inactive
  HiOutlineCog 
} from 'react-icons/hi';

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
  const [totalCount, setTotalCount] = useState(0); // From API

  const {
    users, // Raw users for stats
    filteredUsers, // Filtered for table
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

  // Fetch total count on mount and after refetch
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
  }, [token]);

  // Show error in modal
  React.useEffect(() => {
    if (error) {
      setErrorModal({ isOpen: true, message: error });
    }
  }, [error]);

  // Compute stats from raw users (global stats) - FIXED: Use 'active' property
  const stats = useMemo(() => {
    const allUsers = users || [];
    return {
      total: totalCount || allUsers.length,
      active: allUsers.filter(u => u.active === true).length,  // FIXED: Changed from u.isActive to u.active
      inactive: allUsers.filter(u => u.active === false).length,  // FIXED: Changed from u.isActive to u.active
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
      refetch(); // Refresh after save
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
          refetch(); // Refresh after toggle
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

  // Clear filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('all');
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <HiUsers className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        </div>
        <div className="text-sm text-gray-500">
          Showing {filteredCount} of {stats.total} users
        </div>
      </div>

      {/* Stats Section */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                <HiUsers className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {/* Active Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-green-100 text-green-600">
                <HiOutlineCheckCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>

          {/* Inactive Users */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-red-100 text-red-600">
                <HiOutlineXCircle className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
              </div>
            </div>
          </div>

          {/* Backoffice Users (Example role stat; add more if needed) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <HiOutlineCog className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Backoffice</p>
                <p className="text-3xl font-bold text-gray-900">{stats.backoffice}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              disabled={loading}
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-3 min-w-0 flex-1 lg:flex-none">
            <label htmlFor="role-filter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Filter by Role:
            </label>
            <select
              id="role-filter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="flex-1 lg:w-auto px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
              disabled={loading}
              aria-label="Filter users by role"
            >
              <option value="all">All Roles</option>
              <option value="Backoffice">Backoffice</option>
              <option value="StationOperator">Station Operator</option>
              <option value="EVOwner">EV Owner</option>
            </select>
          </div>

          {/* Clear Filters & Refresh */}
          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition duration-200 disabled:opacity-50"
              disabled={loading || (!searchQuery && filterRole === 'all')}
            >
              Clear
            </button>
            <button
              onClick={refetch}
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition duration-200 ${
                loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-sm hover:shadow-md'
              }`}
              disabled={loading}
              aria-label="Refresh user data"
            >
              <svg
                className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5m11 11v-5h-5m0-6l-7 7m7-7H4" />
              </svg>
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
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