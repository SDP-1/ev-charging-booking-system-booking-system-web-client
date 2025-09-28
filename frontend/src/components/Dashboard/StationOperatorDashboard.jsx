import React from 'react';
// You might import UpcomingReservations from './SharedComponents' here if you need it

const StationOperatorDashboard = ({ data, loading }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xl border-t-4 border-green-500 min-h-[300px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Station Overview</h3>
            <p>{loading ? "Loading details..." : "Operational status and diagnostics."}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-yellow-500 min-h-[300px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700">Slots Booked Today</h3>
            <p className="text-4xl font-extrabold text-yellow-600">
                {loading ? '...' : (data?.bookedSlotsToday || 0)} / {(data?.totalSlots || 0)}
            </p>
        </div>
    </div>
);

export default StationOperatorDashboard;