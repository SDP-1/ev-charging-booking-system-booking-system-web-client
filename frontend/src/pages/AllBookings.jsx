// src/pages/AllBookings.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getAllBookings } from '../api/BookingApi'; // Import the new API function
import { useAuth } from '../context/AuthContext';
import { 
  HiDocumentText, 
  HiClock, 
  HiCheckCircle, 
  HiXCircle, 
  HiSearch, 
  HiCalendar,
  HiEye,
  HiTrash,
  HiPlay // Using HiPlay as alternative for reopen/refresh action
} from 'react-icons/hi';

// Import separated components
import StatusPill from '../components/common/StatusPill';
import BookingDetailsModal from '../components/modals/BookingDetailsModal';
import ConfirmCancelModal from '../components/modals/ConfirmCancelModal';

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
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);

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
    const refreshData = async () => {
        // Fetch with current filterUserId
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

    // View booking details
    const handleView = (booking) => {
        setSelectedBooking(booking);
        setShowDetailsModal(true);
    };

    // Update status
    const handleStatusUpdate = async (bookingId, action) => {
        try {
            const token = localStorage.getItem("token");
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
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
            // Refresh bookings
            const data = await getAllBookings(filterUserId || null);
            setBookings(data);
        } catch (err) {
            setError(err.message || "Failed to update booking status.");
        }
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

    // Action button component for status updates
    const ActionButton = ({ action, label, icon: Icon, onClick, disabled = false, className = '', title = '' }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0 ${className}`}
            title={title || label}
        >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );

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
                                filteredBookings.map((booking) => {
                                    const currentStatus = getStatus(booking);
                                    const reservationTime = new Date(booking.reservationDateTime);
                                    const now = new Date();
                                    const timeDiffMs = reservationTime - now;
                                    const isFutureReservation = timeDiffMs > 0;
                                    const hoursUntilReservation = timeDiffMs / (1000 * 60 * 60);
                                    const canCancel = ['Pending', 'Approved'].includes(currentStatus) && hoursUntilReservation >= 3;

                                    // Define possible actions based on status (progressive flow)
                                    const actions = [];
                                    switch (currentStatus) {
                                        case 'Pending':
                                            actions.push({
                                                action: 'approve',
                                                label: 'Approve',
                                                icon: HiCheckCircle,
                                                color: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                            });
                                            break;
                                        case 'Approved':
                                            actions.push({
                                                action: 'confirm',
                                                label: 'Confirm',
                                                icon: HiCheckCircle,
                                                color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                                            });
                                            break;
                                        case 'Confirmed':
                                            actions.push({
                                                action: 'complete',
                                                label: 'Complete',
                                                icon: HiCheckCircle,
                                                color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                                            });
                                            break;
                                        case 'Canceled':
                                            if (isFutureReservation) {
                                                actions.push({
                                                    action: 'reopen',
                                                    label: 'Reopen',
                                                    icon: HiPlay,
                                                    color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border border-yellow-200'
                                                });
                                            }
                                            break;
                                        default:
                                            // No actions for Completed
                                            break;
                                    }

                                    return (
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
                                                <StatusPill status={currentStatus} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* View Button */}
                                                    <ActionButton
                                                        action="view"
                                                        label="View Details"
                                                        icon={HiEye}
                                                        onClick={() => handleView(booking)}
                                                        className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                                                    />
                                                    
                                                    {/* Status Update Button (if applicable) */}
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

                                                    {/* Cancel Button (if applicable) */}
                                                    {['Pending', 'Approved'].includes(currentStatus) && (
                                                        <ActionButton
                                                            action="cancel"
                                                            label="Cancel"
                                                            icon={HiTrash}
                                                            onClick={() => {
                                                                setSelectedBookingId(booking.id);
                                                                setShowCancelModal(true);
                                                            }}
                                                            disabled={!canCancel}
                                                            title={canCancel ? 'Cancel Booking' : 'Cannot cancel less than 3 hours before reservation'}
                                                            className={canCancel ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' : 'bg-gray-100 text-gray-500 cursor-not-allowed'}
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <BookingDetailsModal
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                booking={selectedBooking}
            />

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