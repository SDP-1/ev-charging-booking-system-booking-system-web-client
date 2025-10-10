
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBookings } from '../api/BookingApi';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ClockIcon, CheckCircleIcon, XCircleIcon, MagnifyingGlassIcon, CalendarIcon, EyeIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import StatusPill from '../components/common/StatusPill';
import BookingDetailsModal from '../components/modals/BookingDetailsModal';
import ConfirmCancelModal from '../components/modals/ConfirmCancelModal';

const AllBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterUserId, setFilterUserId] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllBookings(filterUserId || null);
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === 'Backoffice') {
      fetchBookings();
    }
  }, [filterUserId, user]);

  const filteredBookings = useMemo(() => {
    let filtered = bookings;
    if (filterStatus !== 'all') {
      filtered = filtered.filter(b => getStatus(b) === filterStatus);
    }
    if (filterDateFrom || filterDateTo) {
      const fromDate = filterDateFrom ? new Date(filterDateFrom).toISOString() : null;
      const toDateObj = filterDateTo ? new Date(filterDateTo) : null;
      if (toDateObj) {
        toDateObj.setHours(23, 59, 59, 999);
      }
      const toDate = toDateObj ? toDateObj.toISOString() : null;
      filtered = filtered.filter(b => {
        const bookingDate = new Date(b.reservationDateTime).toISOString();
        if (fromDate && bookingDate < fromDate) return false;
        if (toDate && bookingDate > toDate) return false;
        return true;
      });
    }
    return filtered;
  }, [bookings, filterStatus, filterDateFrom, filterDateTo]);

  const getStatus = (booking) => {
    if (booking.canceled) return 'Canceled';
    if (booking.completed) return 'Completed';
    if (booking.confirmed) return 'Confirmed';
    if (booking.approved) return 'Approved';
    return 'Pending';
  };

  const stats = useMemo(() => {
    const allBookings = bookings || [];
    return {
      total: allBookings.length,
      pending: allBookings.filter(b => getStatus(b) === 'Pending').length,
      approved: allBookings.filter(b => getStatus(b) === 'Approved').length,
      confirmed: allBookings.filter(b => getStatus(b) === 'Confirmed').length,
      completed: allBookings.filter(b => getStatus(b) === 'Completed').length,
      canceled: allBookings.filter(b => getStatus(b) === 'Canceled').length,
    };
  }, [bookings]);

  const filteredCount = filteredBookings.length;

  const clearFilters = () => {
    setFilterUserId('');
    setFilterStatus('all');
    setFilterDateFrom('');
    setFilterDateTo('');
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllBookings(filterUserId || null);
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleStatusUpdate = async (bookingId, action) => {
    try {
      const token = localStorage.getItem('token');
      const BASE = import.meta.env.VITE_API_BASE_URL;
      let endpoint = '';
      switch (action) {
        case 'approve':
          endpoint = `${BASE}/booking/approve/${bookingId}`;
          break;
        case 'confirm':
          endpoint = `${BASE}/booking/confirm/${bookingId}`;
          break;
        case 'complete':
          endpoint = `${BASE}/booking/complete/${bookingId}`;
          break;
        case 'reopen':
          endpoint = `${BASE}/booking/reopen/${bookingId}`;
          break;
        default:
          return;
      }
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
      const data = await getAllBookings(filterUserId || null);
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to update booking status.');
    }
  };

  const handleCancel = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const BASE = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${BASE}/booking/cancel/${bookingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed to cancel booking (${res.status})`);
      const data = await getAllBookings(filterUserId || null);
      setBookings(data);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    }
    setShowCancelModal(false);
  };

  const ActionButton = ({ action, label, icon: Icon, onClick, disabled = false, className = '', title = '' }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title || label}
      aria-label={title || label}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-gray-50 flex items-center justify-center p-6"
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
      >
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-md">
          <XCircleIcon className="h-5 w-5 inline mr-2" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (user.role !== 'Backoffice') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"
      >
        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 border-l-4 border-red-500 rounded-lg shadow-md">
          <XCircleIcon className="h-5 w-5 inline mr-2" />
          Access Denied: Only Backoffice can view all bookings.
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
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚡️</span>
          <h1 className="text-3xl font-bold text-green-600">All Bookings</h1>
        </div>
        <div className="text-sm text-gray-600">Showing {filteredCount} of {stats.total} bookings</div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="bg-white rounded-xl p-6 shadow-md border border-green-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="bg-white rounded-xl p-6 shadow-md border border-orange-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="bg-white rounded-xl p-6 shadow-md border border-blue-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="bg-white rounded-xl p-6 shadow-md border border-green-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100 text-green-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Confirmed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.confirmed}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.03, y: -4 }}
          className="bg-white rounded-xl p-6 shadow-md border border-blue-200"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100 text-blue-600">
              <CheckCircleIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">{stats.completed}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Controls and Filters */}
      <div className="mb-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by User ID..."
                value={filterUserId}
                onChange={(e) => setFilterUserId(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                disabled={loading}
                aria-label="Search bookings by user ID"
              />
            </div>
            <div className="flex items-center space-x-3 flex-1 md:flex-none">
              <label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                Status:
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 md:w-40 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                disabled={loading}
                aria-label="Filter bookings by status"
              >
                <option value="all">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
            </div>
            <div className="flex items-center gap-3 flex-1 md:flex-none">
              <label className="text-sm font-medium text-gray-700">Date Range:</label>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => setFilterDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  disabled={loading}
                  aria-label="Filter bookings by start date"
                />
                <span className="text-gray-600">to</span>
                <input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => setFilterDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                  disabled={loading}
                  aria-label="Filter bookings by end date"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearFilters}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition disabled:opacity-50"
                disabled={loading || (!filterUserId && filterStatus === 'all' && !filterDateFrom && !filterDateTo)}
                aria-label="Clear all filters"
              >
                Clear
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition ${
                  loading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                }`}
                disabled={loading}
                aria-label="Refresh bookings data"
              >
                <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="pb-10">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EV Owner ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 py-12 text-center text-gray-600 bg-gray-50">
                    <div className="bg-white rounded-xl p-6 shadow-md mx-auto max-w-md">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-800">No bookings found</p>
                      <p className="text-gray-600">Adjust filters or refresh to view EV charging bookings.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => {
                  const currentStatus = getStatus(booking);
                  const reservationTime = new Date(booking.reservationDateTime);
                  const now = new Date();
                  const timeDiffMs = reservationTime - now;
                  const isFutureReservation = timeDiffMs > 0;
                  const hoursUntilReservation = timeDiffMs / (1000 * 60 * 60);
                  const canCancel = ['Pending', 'Approved'].includes(currentStatus) && hoursUntilReservation >= 3;

                  const actions = [];
                  switch (currentStatus) {
                    case 'Pending':
                      actions.push({
                        action: 'approve',
                        label: 'Approve',
                        icon: CheckCircleIcon,
                        color: 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200',
                      });
                      break;
                    case 'Approved':
                      actions.push({
                        action: 'confirm',
                        label: 'Confirm',
                        icon: CheckCircleIcon,
                        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200',
                      });
                      break;
                    case 'Confirmed':
                      actions.push({
                        action: 'complete',
                        label: 'Complete',
                        icon: CheckCircleIcon,
                        color: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200',
                      });
                      break;
                    case 'Canceled':
                      if (isFutureReservation) {
                        actions.push({
                          action: 'reopen',
                          label: 'Reopen',
                          icon: ArrowPathIcon,
                          color: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200',
                        });
                      }
                      break;
                    default:
                      break;
                  }

                  return (
                    <motion.tr
                      key={String(booking.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-800 truncate max-w-0" title={booking.id}>
                        {String(booking.id).substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 truncate max-w-0" title={booking.userId}>
                        {String(booking.userId).substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{booking.stationId}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-gray-600 truncate max-w-0" title={booking.slotId}>
                        {String(booking.slotId).substring(0, 8)}...
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {new Date(booking.reservationDateTime).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <StatusPill status={currentStatus} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1">
                          <ActionButton
                            action="view"
                            label="View"
                            icon={EyeIcon}
                            onClick={() => handleView(booking)}
                            className="bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                          />
                          {actions.length > 0 && (
                            <ActionButton
                              key={actions[0].action}
                              action={actions[0].action}
                              label={actions[0].label}
                              icon={actions[0].icon}
                              onClick={() => handleStatusUpdate(booking.id, actions[0].action)}
                              className={actions[0].color}
                            />
                          )}
                          {['Pending', 'Approved'].includes(currentStatus) && (
                            <ActionButton
                              action="cancel"
                              label="Cancel"
                              icon={TrashIcon}
                              onClick={() => {
                                setSelectedBookingId(booking.id);
                                setShowCancelModal(true);
                              }}
                              disabled={!canCancel}
                              title={canCancel ? 'Cancel Booking' : 'Cannot cancel less than 3 hours before reservation'}
                              className={canCancel ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}
                            />
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <BookingDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        booking={selectedBooking}
      />
      <ConfirmCancelModal
        isOpen={showCancelModal}
        onConfirm={handleCancel}
        onClose={() => setShowCancelModal(false)}
        bookingId={selectedBookingId}
      />
    </motion.div>
  );
};

export default AllBookings;