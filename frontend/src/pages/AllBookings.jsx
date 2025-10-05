import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { getAllBookings } from '../api/BookingApi'; // Import the new API function
import { useAuth } from '../context/AuthContext';

// Simple component to display status visually
const StatusPill = ({ status, isTrue }) => {
    const color = isTrue
        ? (status === 'Canceled' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800')
        : 'bg-gray-200 text-gray-800';
    return (
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
            {isTrue ? status : 'Pending'}
        </span>
    );
};

const AllBookings = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterUserId, setFilterUserId] = useState(''); // State for filtering

    // Fetch data whenever the component mounts or the filter changes
    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            setError(null);
            try {
                // Pass the filterUserId to the API function
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


    const handleFilterChange = (e) => {
        setFilterUserId(e.target.value);
    };

    if (loading) return <p className="p-8 text-lg">Loading bookings...</p>;
    if (error) return <p className="p-8 text-lg text-red-600">Error: {error}</p>;
    if (user.role !== 'Backoffice') return <p className="p-8 text-lg text-red-600">Access Denied: Only Backoffice can view all bookings.</p>;

    // Cancel a booking
    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            const token = localStorage.getItem("token");
            const res = await fetch(`${BASE}/booking/cancel/${bookingId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!res.ok) throw new Error(`Failed to cancel booking (${res.status})`);
            alert("Booking canceled successfully.");
            // Refresh bookings
            const data = await getAllBookings(filterUserId || null);
            setBookings(data);
        } catch (err) {
            alert(err.message || "Failed to cancel booking.");
        }
    };

    // Update a booking (example: changing slot or station)
    const handleUpdate = async (bookingId, updates) => {
        // updates = { slotId: "...", stationId: "..." }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`${BASE}/booking/update/${bookingId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updates),
            });
            if (!res.ok) throw new Error(`Failed to update booking (${res.status})`);
            alert("Booking updated successfully.");
            // Refresh bookings
            const data = await getAllBookings(filterUserId || null);
            setBookings(data);
        } catch (err) {
            alert(err.message || "Failed to update booking.");
        }
    };


    return (
        <>
            <h2 className="text-3xl font-semibold mb-6">All Bookings Management</h2>

            {/* Filter and Controls */}
            <div className="bg-white p-4 rounded-lg shadow-lg mb-6 flex items-center space-x-4">
                <label htmlFor="userIdFilter" className="text-gray-600 font-medium">Filter by User ID:</label>
                <input
                    id="userIdFilter"
                    type="text"
                    placeholder="Enter User ID (e.g., MongoDB ID)"
                    value={filterUserId}
                    onChange={handleFilterChange}
                    className="p-2 border border-gray-300 rounded-md w-96 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                    onClick={() => setFilterUserId('')}
                    className="px-4 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                    Clear Filter
                </button>
            </div>


            {/* Bookings Table */}
            <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Booking ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                EV Owner ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Station
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Slot ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Reservation Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                    No bookings found.
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={String(booking.id)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 truncate" title={booking.id}>
                                        {String(booking.id).substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={booking.userId}>
                                        {String(booking.userId).substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {booking.stationId}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 truncate" title={booking.slotId}>
                                        {String(booking.slotId).substring(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(booking.reservationDateTime).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {booking.canceled ? (
                                            <StatusPill status="Canceled" isTrue={true} />
                                        ) : booking.completed ? (
                                            <StatusPill status="Completed" isTrue={true} />
                                        ) : booking.confirmed ? (
                                            <StatusPill status="Confirmed" isTrue={true} />
                                        ) : booking.approved ? (
                                            <StatusPill status="Approved" isTrue={true} />
                                        ) : (
                                            <StatusPill status="Pending Approval" isTrue={false} />
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {/* Backoffice actions placeholder */}
                                        <button
                                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            onClick={() => {
                                                // Example: open modal to update stationId or slotId
                                                const newSlotId = prompt("Enter new Slot ID:");
                                                if (newSlotId) handleUpdate(booking.id, { slotId: newSlotId });
                                            }}
                                        >
                                            Update
                                        </button>
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3">View</button>
                                        <button
                                            className="text-red-600 hover:text-red-900"
                                            onClick={() => handleCancel(booking.id)}
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
        </>
    );
};

export default AllBookings;