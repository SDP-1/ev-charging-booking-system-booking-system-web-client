import React from 'react';
// 🎯 CORRECTED IMPORT: Use SharedComponents for named exports
import { UpcomingReservations } from './SharedComponents';

const EVOwnerDashboard = ({ data, loading }) => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingReservations 
            bookings={data?.upcomingBookings} 
            loading={loading}
        />
        
        {/* Map Component */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-xl border-t-4 border-sky-500 min-h-[300px]">
            <h3 className="text-xl font-bold mb-4 text-gray-700 flex items-center">
                <i className="fa-solid fa-map-location-dot text-sky-500 mr-3"></i>
                Nearest Charging Stations
            </h3>
            <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg border border-dashed">
                 {loading ? "Loading Map..." : "[Interactive Map Placeholder]"}
            </div>
        </div>
    </div>
);

export default EVOwnerDashboard;