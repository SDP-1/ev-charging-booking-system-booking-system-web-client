// src/pages/AllBookings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBookings } from '../api/BookingApi'; // Import the new API function
import { useAuth } from '../context/AuthContext';
import { 
  HiDocumentText, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiSearch, 
  HiCalendar 
} from 'react-icons/hi';

// Simple component to display status visually
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

// Confirm Cancel Modal (simple reusable)
const ConfirmCancelModal = ({ isOpen, onConfirm, onClose, bookingId }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <HiXCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3 className="text-base font-semibold leading-6 text-gray-900">Cancel Booking</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Are you sure you want to cancel this booking? This action cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              onClick={() => onConfirm(bookingId)}
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
            >
              Cancel Booking
            </button>
            <button
              type="button"
              onClick={onClose}
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AllBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterUserId, setFilterUserId] = useState(''); // User ID filter
    const [filterStatus, setFilterStatus] = useState('all'); // Status filter
    const [filterDateFrom, setFilterDateFrom] = useState(''); // Date from
    const [filterDateTo, setFilterDateTo] = useState(''); // Date to

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);

    // Fetch data whenever filters change
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                // Pass the filterUserId to the API function (client-side for status/date)
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

    // Client-side filtering for status and date (since API doesn't support yet)
    const filteredBookings = useMemo(() => {
        let filtered = bookings;
        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(b => getStatus(b) === filterStatus);
        }
        // Date range filter
        if (filterDateFrom || filterDateTo) {
            const fromDate = filterDateFrom ? new Date(filterDateFrom).toISOString() : null;
            const toDate = filterDateTo ? new Date(filterDateTo).setHours(23, 59, 59, 999) : null; // End of day
            filtered = filtered.filter(b => {
                const bookingDate = new Date(b.reservationDateTime).toISOString();
                if (fromDate && bookingDate < fromDate) return false;
                if (toDate && bookingDate > new Date(toDate).toISOString()) return false;
                return true;
            });
        }
        return filtered;
    }, [bookings, filterStatus, filterDateFrom, filterDateTo]);

    // Helper to get status string
    const getStatus = (booking) => {
        if (booking.canceled) return 'Canceled';
        if (booking.completed) return 'Completed';
        if (booking.confirmed) return 'Confirmed';
        if (booking.approved) return 'Approved';
        return 'Pending';
    };

    // Compute stats
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

    // Clear all filters
    const clearFilters = () => {
        setFilterUserId('');
        setFilterStatus('all');
        setFilterDateFrom('');
        setFilterDateTo('');
    };

    // Refresh data
    const refreshData = () => {
        setFilterUserId(''); // Reset to fetch all
        // Trigger refetch via useEffect
    };

    // Cancel a booking
    const handleCancel = async (bookingId) => {
        try {
            const token = localStorage.getItem("token");
            const BASE = import.meta.env.VITE_API_BASE_URL;
            const res = await fetch(`${BASE}/booking/cancel/${bookingId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(`Failed to cancel booking (${res.status})`);
            // Refresh bookings
            const data = await getAllBookings(filterUserId || null);
            setBookings(data);
        } catch (err) {
            setError(err.message || "Failed to cancel booking.");
        }
        setShowCancelModal(false);
    };

    // Update a booking (placeholder - open modal or implement)
    const handleUpdate = async (bookingId, updates) => {
        // Implementation similar to cancel - use modal for UX
        console.log('Update booking:', bookingId, updates);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 md:p-8 lg:p-10">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading bookings...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
                <div className="w-full px-4">
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex items-center">
                        <HiXCircle className="h-5 w-5 mr-2" />
                        {error}
                    </div>
                </div>
            </div>
        );
    }

    if (user.role !== 'Backoffice') {
        return (
            <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen">
                <div className="w-full px-4">
                    <div className="mb-6 p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-2xl shadow-sm flex items-center">
                        <HiXCircle className="h-5 w-5 mr-2" />
                        Access Denied: Only Backoffice can view all bookings.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 min-h-screen"> {/* Matched UserManagementPage padding */}
            {/* Header */}
            <div className="w-full px-4 flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">All Bookings</h1>
                <div className="text-sm text-gray-500">
                    Showing {filteredCount} of {stats.total} bookings
                </div>
            </div>

            {/* Stats Section */}
            <div className="w-full px-4 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"> {/* 5 stats, responsive */}
                    {/* Total Bookings */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                                <HiDocumentText className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-yellow-100 text-yellow-600">
                                <HiClock className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                            </div>
                        </div>
                    </div>

                    {/* Approved */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                                <HiCheckCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Approved</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirmed */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-green-100 text-green-600">
                                <HiCheckCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.confirmed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                                <HiCheckCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Completed</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
                            </div>
                        </div>
                    </div>

                    {/* Canceled - Extra row on small screens */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 transform hover:-translate-y-1 hidden lg:block">
                        <div className="flex items-center">
                            <div className="p-3 rounded-xl bg-red-100 text-red-600">
                                <HiXCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Canceled</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.canceled}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls and Filters */}
            <div className="w-full px-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
                        {/* User ID Search */}
                        <div className="relative flex-1 min-w-0">
                            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by User ID..."
                                value={filterUserId}
                                onChange={(e) => setFilterUserId(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                disabled={loading}
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center space-x-3 min-w-0 flex-1 lg:flex-none">
                            <label htmlFor="status-filter" className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                                Filter by Status:
                            </label>
                            <select
                                id="status-filter"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="flex-1 lg:w-auto px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
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

                        {/* Date Range */}
                        <div className="flex items-center gap-3 min-w-0 flex-1 lg:flex-none">
                            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">Date Range:</label>
                            <div className="flex gap-2">
                                <input
                                    type="date"
                                    value={filterDateFrom}
                                    onChange={(e) => setFilterDateFrom(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                    disabled={loading}
                                />
                                <span className="text-gray-500 self-center">to</span>
                                <input
                                    type="date"
                                    value={filterDateTo}
                                    onChange={(e) => setFilterDateTo(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        {/* Clear Filters & Refresh */}
                        <div className="flex items-center gap-3 ml-auto lg:ml-0">
                            <button
                                onClick={clearFilters}
                                className="px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition duration-200 disabled:opacity-50"
                                disabled={loading || (!filterUserId && filterStatus === 'all' && !filterDateFrom && !filterDateTo)}
                            >
                                Clear
                            </button>
                            <button
                                onClick={refreshData}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition duration-200 ${
                                    loading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-sm hover:shadow-md'
                                }`}
                                disabled={loading}
                                aria-label="Refresh bookings data"
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
            </div>

            {/* Bookings Table */}
            <div className="w-full px-4 pb-10"> {/* Full-width with bottom padding */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"> {/* Matched card style */}
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">EV Owner ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slot ID</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reservation Time</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredBookings.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500 bg-gray-50"> {/* Empty state in table */}
                                        <HiDocumentText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <p className="text-lg font-medium text-gray-900">No bookings found</p>
                                        <p className="text-gray-500">Try adjusting your filters or refresh the data.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredBookings.map((booking) => (
                                    <tr key={String(booking.id)} className="hover:bg-gray-50 transition-colors"> {/* Hover effect */}
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 truncate max-w-0" title={booking.id}>
                                            {String(booking.id).substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate max-w-0" title={booking.userId}>
                                            {String(booking.userId).substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {booking.stationId}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500 truncate max-w-0" title={booking.slotId}>
                                            {String(booking.slotId).substring(0, 8)}...
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(booking.reservationDateTime).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <StatusPill status={getStatus(booking)} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                            <button
                                                className="text-indigo-600 hover:text-indigo-900 px-3 py-1 rounded-md transition-colors"
                                                onClick={() => {
                                                    // Example: open modal to update or navigate to details
                                                    alert(`View details for booking: ${booking.id}`);
                                                }}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="text-blue-600 hover:text-blue-900 px-3 py-1 rounded-md transition-colors"
                                                onClick={() => {
                                                    // Example update - open modal
                                                    const newSlotId = prompt("Enter new Slot ID (optional):");
                                                    if (newSlotId) {
                                                        handleUpdate(booking.id, { slotId: newSlotId });
                                                    }
                                                }}
                                            >
                                                Update
                                            </button>
                                            <button
                                                className="text-red-600 hover:text-red-900 px-3 py-1 rounded-md transition-colors"
                                                onClick={() => {
                                                    setSelectedBookingId(booking.id);
                                                    setShowCancelModal(true);
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cancel Modal */}
            <ConfirmCancelModal
                isOpen={showCancelModal}
                onConfirm={handleCancel}
                onClose={() => setShowCancelModal(false)}
                bookingId={selectedBookingId}
            />
        </div>
    );
};

export default AllBookings;